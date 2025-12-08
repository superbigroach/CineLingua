// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CineSceneContest
 * @notice Weekly AI video scene contest with USDC stakes on Base network
 * @dev Users stake USDC to enter, AI judges score, top 3 split the prize pool
 *
 * Flow:
 * 1. Admin creates a weekly contest with theme
 * 2. Users submit entries by staking USDC (100% goes to prize pool)
 * 3. At contest end, admin submits AI judge scores
 * 4. Platform takes 20% from the TOTAL prize pool as service fee
 * 5. Remaining 80% is distributed to winners (50% / 30% / 20% split)
 * 6. Ties are handled by splitting the combined prize equally
 *
 * Example with $100 prize pool:
 *   - Platform fee: $20 (20%)
 *   - Winners pool: $80 (80%)
 *   - 1st place: $40 (50% of $80)
 *   - 2nd place: $24 (30% of $80)
 *   - 3rd place: $16 (20% of $80)
 */
contract CineSceneContest is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // USDC on Base mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
    // USDC on Base Sepolia testnet: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
    IERC20 public immutable usdc;

    // Platform economics
    uint256 public constant PLATFORM_FEE_BPS = 2000; // 20% of prize pool taken from winnings
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Pricing based on Google Veo 3.1 Fast ($0.10/second, video only)
    // 8-second video = $0.80 generation cost
    // Minimum stake = 2x generation cost = $1.60 (1_600_000 in USDC 6 decimals)
    uint256 public constant DEFAULT_MIN_STAKE = 1_600_000; // $1.60 USDC (6 decimals)

    // Judging delay - 30 minutes after contest ends before judging can begin
    // This gives time for all participants to watch the live judging show
    uint256 public constant JUDGING_DELAY = 30 minutes;

    // Prize distribution (basis points) - applied to 80% of pool after platform fee
    uint256 public constant FIRST_PLACE_BPS = 5000;  // 50% of winners pool
    uint256 public constant SECOND_PLACE_BPS = 3000; // 30% of winners pool
    uint256 public constant THIRD_PLACE_BPS = 2000;  // 20% of winners pool

    struct Contest {
        uint256 id;
        string theme;           // e.g., "French Film Noir", "Romantic Paris"
        string language;        // e.g., "French", "Spanish"
        uint256 minStake;       // Minimum USDC to enter (6 decimals)
        uint256 prizePool;      // Total prize pool (all stakes go here)
        uint256 winnersPool;    // Prize pool after 20% platform fee (set at finalization)
        uint256 platformFees;   // 20% of prize pool (set at finalization)
        uint256 startTime;
        uint256 endTime;
        uint256 judgingStartTime; // When judging show begins (endTime + 30 min)
        bool finalized;
        bool feesWithdrawn;
        uint256 entryCount;
    }

    struct Entry {
        address user;
        uint256 contestId;
        string movieTitle;
        string promptHash;      // IPFS hash of the full prompt
        string videoHash;       // IPFS hash of generated video
        uint256 stakeAmount;
        uint256 score;          // Combined AI judge score (0-30, scaled by 100 for decimals)
        uint256 timestamp;
        bool claimed;
    }

    // Contest ID => Contest
    mapping(uint256 => Contest) public contests;
    uint256 public contestCount;

    // Contest ID => Entry ID => Entry
    mapping(uint256 => mapping(uint256 => Entry)) public entries;
    // Contest ID => entry count
    mapping(uint256 => uint256) public contestEntryCount;
    // User => Contest ID => Entry ID (for lookup)
    mapping(address => mapping(uint256 => uint256)) public userEntries;
    // Contest ID => sorted winner entry IDs (set during finalization)
    mapping(uint256 => uint256[]) public contestWinners;

    // Events
    event ContestCreated(uint256 indexed contestId, string theme, string language, uint256 minStake, uint256 endTime);
    event EntrySubmitted(uint256 indexed contestId, uint256 indexed entryId, address indexed user, uint256 stakeAmount);
    event ScoresSubmitted(uint256 indexed contestId, uint256 entryId, uint256 score);
    event JudgingShowStarted(uint256 indexed contestId, uint256 timestamp);
    event ContestFinalized(uint256 indexed contestId, uint256[] winnerEntryIds);
    event PrizeClaimed(uint256 indexed contestId, uint256 indexed entryId, address indexed user, uint256 amount);
    event PlatformFeesWithdrawn(uint256 indexed contestId, uint256 amount);

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Create a new weekly contest
     * @param theme The visual/creative theme for this week
     * @param language Target language (French, Spanish, etc.)
     * @param minStake Minimum USDC stake to enter (6 decimals, e.g., 2800000 = $2.80)
     * @param duration Contest duration in seconds (e.g., 7 days = 604800)
     */
    function createContest(
        string calldata theme,
        string calldata language,
        uint256 minStake,
        uint256 duration
    ) external onlyOwner returns (uint256 contestId) {
        contestId = ++contestCount;

        uint256 contestEndTime = block.timestamp + duration;

        contests[contestId] = Contest({
            id: contestId,
            theme: theme,
            language: language,
            minStake: minStake,
            prizePool: 0,
            winnersPool: 0,
            platformFees: 0,
            startTime: block.timestamp,
            endTime: contestEndTime,
            judgingStartTime: contestEndTime + JUDGING_DELAY, // 30 min after end
            finalized: false,
            feesWithdrawn: false,
            entryCount: 0
        });

        emit ContestCreated(contestId, theme, language, minStake, block.timestamp + duration);
    }

    /**
     * @notice Submit AI judge scores for entries (batch)
     * @dev Scores are 0-3000 (representing 0.00 to 30.00)
     */
    function submitScores(
        uint256 contestId,
        uint256[] calldata entryIds,
        uint256[] calldata scores
    ) external onlyOwner {
        require(entryIds.length == scores.length, "Length mismatch");
        Contest storage contest = contests[contestId];
        require(block.timestamp >= contest.endTime, "Contest not ended");
        require(!contest.finalized, "Already finalized");

        for (uint256 i = 0; i < entryIds.length; i++) {
            require(scores[i] <= 3000, "Score max 30.00");
            entries[contestId][entryIds[i]].score = scores[i];
            emit ScoresSubmitted(contestId, entryIds[i], scores[i]);
        }
    }

    /**
     * @notice Finalize contest and determine winners
     * @dev Takes 20% platform fee from prize pool, distributes 80% to winners
     *      Handles ties by splitting combined prizes equally
     *      Can only be called 30 minutes after contest ends (after judging show)
     */
    function finalizeContest(uint256 contestId) external onlyOwner {
        Contest storage contest = contests[contestId];
        require(block.timestamp >= contest.judgingStartTime, "Judging not started yet");
        require(!contest.finalized, "Already finalized");
        require(contest.entryCount > 0, "No entries");

        // Calculate platform fee (20% of total prize pool)
        uint256 platformFee = (contest.prizePool * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 winnersPool = contest.prizePool - platformFee;

        contest.platformFees = platformFee;
        contest.winnersPool = winnersPool;

        // Sort entries by score (simple bubble sort for small arrays)
        uint256[] memory sortedIds = _getSortedEntryIds(contestId, contest.entryCount);

        // Handle ties and assign prizes
        uint256[] memory winnerIds = _assignWinnersWithTies(contestId, sortedIds);
        contestWinners[contestId] = winnerIds;

        contest.finalized = true;
        emit ContestFinalized(contestId, winnerIds);
    }

    /**
     * @notice Withdraw platform fees (20% of prize pool)
     * @dev Can only be called after contest is finalized
     */
    function withdrawPlatformFees(uint256 contestId) external onlyOwner {
        Contest storage contest = contests[contestId];
        require(contest.finalized, "Not finalized");
        require(!contest.feesWithdrawn, "Fees already withdrawn");
        uint256 fees = contest.platformFees;
        require(fees > 0, "No fees");

        contest.feesWithdrawn = true;
        usdc.safeTransfer(owner(), fees);

        emit PlatformFeesWithdrawn(contestId, fees);
    }

    // ============================================
    // USER FUNCTIONS
    // ============================================

    /**
     * @notice Submit an entry to a contest
     * @param contestId The contest to enter
     * @param movieTitle Movie the scene is based on
     * @param promptHash IPFS hash of the scene prompt
     * @param stakeAmount Amount of USDC to stake (must be >= minStake)
     */
    function submitEntry(
        uint256 contestId,
        string calldata movieTitle,
        string calldata promptHash,
        uint256 stakeAmount
    ) external nonReentrant returns (uint256 entryId) {
        Contest storage contest = contests[contestId];
        require(block.timestamp < contest.endTime, "Contest ended");
        require(stakeAmount >= contest.minStake, "Below min stake");
        require(userEntries[msg.sender][contestId] == 0, "Already entered");

        // Transfer USDC from user
        usdc.safeTransferFrom(msg.sender, address(this), stakeAmount);

        // 100% goes to prize pool - platform fee taken from winnings at finalization
        contest.prizePool += stakeAmount;
        contest.entryCount++;

        entryId = contest.entryCount;

        entries[contestId][entryId] = Entry({
            user: msg.sender,
            contestId: contestId,
            movieTitle: movieTitle,
            promptHash: promptHash,
            videoHash: "",
            stakeAmount: stakeAmount,
            score: 0,
            timestamp: block.timestamp,
            claimed: false
        });

        userEntries[msg.sender][contestId] = entryId;

        emit EntrySubmitted(contestId, entryId, msg.sender, stakeAmount);
    }

    /**
     * @notice Update entry with generated video hash
     */
    function updateVideoHash(
        uint256 contestId,
        string calldata videoHash
    ) external {
        uint256 entryId = userEntries[msg.sender][contestId];
        require(entryId > 0, "No entry found");
        entries[contestId][entryId].videoHash = videoHash;
    }

    /**
     * @notice Claim prize winnings
     */
    function claimPrize(uint256 contestId) external nonReentrant {
        Contest storage contest = contests[contestId];
        require(contest.finalized, "Not finalized");

        uint256 entryId = userEntries[msg.sender][contestId];
        require(entryId > 0, "No entry");

        Entry storage entry = entries[contestId][entryId];
        require(!entry.claimed, "Already claimed");

        uint256 prize = _calculatePrize(contestId, entryId);
        require(prize > 0, "No prize");

        entry.claimed = true;
        usdc.safeTransfer(msg.sender, prize);

        emit PrizeClaimed(contestId, entryId, msg.sender, prize);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    function getContest(uint256 contestId) external view returns (Contest memory) {
        return contests[contestId];
    }

    function getEntry(uint256 contestId, uint256 entryId) external view returns (Entry memory) {
        return entries[contestId][entryId];
    }

    function getUserEntry(address user, uint256 contestId) external view returns (Entry memory) {
        uint256 entryId = userEntries[user][contestId];
        require(entryId > 0, "No entry");
        return entries[contestId][entryId];
    }

    function getWinners(uint256 contestId) external view returns (uint256[] memory) {
        return contestWinners[contestId];
    }

    function getEstimatedPrize(uint256 contestId, uint256 entryId) external view returns (uint256) {
        if (!contests[contestId].finalized) return 0;
        return _calculatePrize(contestId, entryId);
    }

    function isContestActive(uint256 contestId) external view returns (bool) {
        Contest storage contest = contests[contestId];
        return block.timestamp >= contest.startTime &&
               block.timestamp < contest.endTime &&
               !contest.finalized;
    }

    /**
     * @notice Check if the judging show can start (30 min after contest ends)
     */
    function canStartJudging(uint256 contestId) external view returns (bool) {
        Contest storage contest = contests[contestId];
        return block.timestamp >= contest.judgingStartTime && !contest.finalized;
    }

    /**
     * @notice Get time until judging show starts
     * @return seconds until judging (0 if already started or contest not ended)
     */
    function timeUntilJudging(uint256 contestId) external view returns (uint256) {
        Contest storage contest = contests[contestId];
        if (block.timestamp >= contest.judgingStartTime) return 0;
        if (block.timestamp < contest.endTime) return contest.judgingStartTime - block.timestamp;
        return contest.judgingStartTime - block.timestamp;
    }

    /**
     * @notice Get contest status as string
     */
    function getContestStatus(uint256 contestId) external view returns (string memory) {
        Contest storage contest = contests[contestId];

        if (contest.finalized) return "completed";
        if (block.timestamp < contest.startTime) return "upcoming";
        if (block.timestamp < contest.endTime) return "active";
        if (block.timestamp < contest.judgingStartTime) return "awaiting_judging";
        return "judging";
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    function _getSortedEntryIds(
        uint256 contestId,
        uint256 count
    ) internal view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](count);
        for (uint256 i = 1; i <= count; i++) {
            ids[i - 1] = i;
        }

        // Bubble sort by score descending
        for (uint256 i = 0; i < count - 1; i++) {
            for (uint256 j = 0; j < count - i - 1; j++) {
                if (entries[contestId][ids[j]].score < entries[contestId][ids[j + 1]].score) {
                    (ids[j], ids[j + 1]) = (ids[j + 1], ids[j]);
                }
            }
        }

        return ids;
    }

    /**
     * @notice Assign winners handling ties
     * @dev If there's a tie for 1st, those entries split 1st+2nd prize
     *      If there's a tie for 2nd, those entries split 2nd+3rd prize
     *      etc.
     */
    function _assignWinnersWithTies(
        uint256 contestId,
        uint256[] memory sortedIds
    ) internal view returns (uint256[] memory) {
        if (sortedIds.length == 0) return new uint256[](0);

        // For simplicity, return top 3 (or fewer if less entries)
        uint256 winnerCount = sortedIds.length < 3 ? sortedIds.length : 3;
        uint256[] memory winners = new uint256[](winnerCount);

        for (uint256 i = 0; i < winnerCount; i++) {
            winners[i] = sortedIds[i];
        }

        return winners;
    }

    /**
     * @notice Calculate prize for an entry, handling ties
     * @dev Uses winnersPool (80% of total) not prizePool (100%)
     */
    function _calculatePrize(
        uint256 contestId,
        uint256 entryId
    ) internal view returns (uint256) {
        Contest storage contest = contests[contestId];
        uint256[] storage winners = contestWinners[contestId];

        if (winners.length == 0) return 0;

        Entry storage entry = entries[contestId][entryId];
        uint256 entryScore = entry.score;

        // Find position and count ties
        uint256 position = type(uint256).max;
        uint256 tieCount = 0;
        uint256 combinedPrizeBps = 0;

        for (uint256 i = 0; i < winners.length; i++) {
            uint256 winnerScore = entries[contestId][winners[i]].score;

            if (winnerScore == entryScore) {
                if (position == type(uint256).max) {
                    position = i;
                }
                tieCount++;

                // Add the prize for this position
                if (i == 0) combinedPrizeBps += FIRST_PLACE_BPS;
                else if (i == 1) combinedPrizeBps += SECOND_PLACE_BPS;
                else if (i == 2) combinedPrizeBps += THIRD_PLACE_BPS;
            }
        }

        // Not a winner
        if (position == type(uint256).max) return 0;

        // Check if this entry is actually in winners
        bool isWinner = false;
        for (uint256 i = 0; i < winners.length; i++) {
            if (winners[i] == entryId) {
                isWinner = true;
                break;
            }
        }
        if (!isWinner) return 0;

        // Split combined prize equally among tied entries
        // Use winnersPool (80%) not prizePool (100%) - platform already took 20%
        uint256 totalPrize = (contest.winnersPool * combinedPrizeBps) / BPS_DENOMINATOR;
        return totalPrize / tieCount;
    }
}
