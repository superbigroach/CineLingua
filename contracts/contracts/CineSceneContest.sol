// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CineSceneContest
 * @notice Weekly AI video scene contest with USDC stakes on Base network
 * @dev Users stake USDC to enter, AI judges score, top 5 split the prize pool
 *
 * NEW PRICING MODEL (Dec 2025):
 * - User pays: Platform Fee ($0.40) + Generation Cost + Stake (equal to fee + cost)
 * - Half goes to platform (covers generation + fee), half goes to prize pool
 * - 3 Tiers available: Fast ($8), Standard ($20), Premium ($20 single-gen)
 *
 * Prize Distribution (5 winners):
 * - 1st place: 50%
 * - 2nd place: 20%
 * - 3rd place: 10%
 * - 4th place: 10%
 * - 5th place: 10%
 *
 * Example with $100 prize pool:
 *   - 1st place: $50
 *   - 2nd place: $20
 *   - 3rd place: $10
 *   - 4th place: $10
 *   - 5th place: $10
 */
contract CineSceneContest is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // USDC on Base mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
    // USDC on Base Sepolia testnet: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
    IERC20 public immutable usdc;

    // Platform fee: $0.40 (400000 in USDC 6 decimals)
    uint256 public constant PLATFORM_FEE = 400_000; // $0.40

    // Pricing Tiers (24 seconds of video):
    // Tier A - Veo 3.1 Fast: $0.15/sec × 24 = $3.60 generation
    // Tier B - Veo 3.1 Standard: $0.40/sec × 24 = $9.60 generation
    // Tier C - Veo 3.1 Single (premium): Same as Standard but single 24-sec generation

    // Entry costs = (Platform Fee + Generation Cost) × 2
    // Half to platform (fee + generation), half to prize pool
    uint256 public constant TIER_A_ENTRY = 8_000_000;   // $8.00 (Fast tier)
    uint256 public constant TIER_B_ENTRY = 20_000_000;  // $20.00 (Standard tier)
    uint256 public constant TIER_C_ENTRY = 20_000_000;  // $20.00 (Premium single-gen)

    // Default minimum stake for backwards compatibility
    uint256 public constant DEFAULT_MIN_STAKE = 8_000_000; // $8.00 (Tier A)

    // Judging delay - 30 minutes after contest ends before judging can begin
    uint256 public constant JUDGING_DELAY = 30 minutes;

    // Prize distribution (basis points) - 5 winners
    uint256 public constant FIRST_PLACE_BPS = 5000;   // 50%
    uint256 public constant SECOND_PLACE_BPS = 2000;  // 20%
    uint256 public constant THIRD_PLACE_BPS = 1000;   // 10%
    uint256 public constant FOURTH_PLACE_BPS = 1000;  // 10%
    uint256 public constant FIFTH_PLACE_BPS = 1000;   // 10%
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Number of winners
    uint256 public constant WINNER_COUNT = 5;

    struct Contest {
        uint256 id;
        string theme;           // e.g., "French Film Noir", "Romantic Paris"
        string language;        // e.g., "French", "Spanish"
        uint256 minStake;       // Minimum USDC to enter (6 decimals)
        uint256 prizePool;      // Prize pool (stakes from entries)
        uint256 platformRevenue;// Platform revenue (fees + generation costs)
        uint256 startTime;
        uint256 endTime;
        uint256 judgingStartTime; // When judging show begins (endTime + 30 min)
        bool finalized;
        bool revenueWithdrawn;
        uint256 entryCount;
    }

    struct Entry {
        address user;
        uint256 contestId;
        string movieTitle;
        string promptHash;      // IPFS hash of the full prompt
        string videoHash;       // IPFS hash of generated video
        uint256 stakeAmount;    // Full entry amount paid
        uint256 poolContribution; // Amount that went to prize pool
        uint8 tier;             // 0=Fast, 1=Standard, 2=Premium
        uint256 score;          // Combined AI judge score (0-30, scaled by 100)
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
    event EntrySubmitted(uint256 indexed contestId, uint256 indexed entryId, address indexed user, uint256 stakeAmount, uint8 tier, uint256 poolContribution);
    event ScoresSubmitted(uint256 indexed contestId, uint256 entryId, uint256 score);
    event JudgingShowStarted(uint256 indexed contestId, uint256 timestamp);
    event ContestFinalized(uint256 indexed contestId, uint256[] winnerEntryIds);
    event PrizeClaimed(uint256 indexed contestId, uint256 indexed entryId, address indexed user, uint256 amount);
    event PlatformRevenueWithdrawn(uint256 indexed contestId, uint256 amount);

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
     * @param minStake Minimum USDC stake to enter (6 decimals)
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
            platformRevenue: 0,
            startTime: block.timestamp,
            endTime: contestEndTime,
            judgingStartTime: contestEndTime + JUDGING_DELAY,
            finalized: false,
            revenueWithdrawn: false,
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
     * @dev Top 5 winners split the prize pool (50/20/10/10/10)
     */
    function finalizeContest(uint256 contestId) external onlyOwner {
        Contest storage contest = contests[contestId];
        require(block.timestamp >= contest.judgingStartTime, "Judging not started yet");
        require(!contest.finalized, "Already finalized");
        require(contest.entryCount > 0, "No entries");

        // Sort entries by score (simple bubble sort for small arrays)
        uint256[] memory sortedIds = _getSortedEntryIds(contestId, contest.entryCount);

        // Get top 5 winners (or fewer if less entries)
        uint256[] memory winnerIds = _assignWinnersWithTies(contestId, sortedIds);
        contestWinners[contestId] = winnerIds;

        contest.finalized = true;
        emit ContestFinalized(contestId, winnerIds);
    }

    /**
     * @notice Withdraw platform revenue (fees + generation costs)
     */
    function withdrawPlatformRevenue(uint256 contestId) external onlyOwner {
        Contest storage contest = contests[contestId];
        require(contest.finalized, "Not finalized");
        require(!contest.revenueWithdrawn, "Already withdrawn");
        uint256 revenue = contest.platformRevenue;
        require(revenue > 0, "No revenue");

        contest.revenueWithdrawn = true;
        usdc.safeTransfer(owner(), revenue);

        emit PlatformRevenueWithdrawn(contestId, revenue);
    }

    // ============================================
    // USER FUNCTIONS
    // ============================================

    /**
     * @notice Submit an entry to a contest with tier selection
     * @param contestId The contest to enter
     * @param movieTitle Movie the scene is based on
     * @param promptHash IPFS hash of the scene prompt
     * @param tier 0=Fast($8), 1=Standard($20), 2=Premium($20)
     */
    function submitEntryWithTier(
        uint256 contestId,
        string calldata movieTitle,
        string calldata promptHash,
        uint8 tier
    ) external nonReentrant returns (uint256 entryId) {
        require(tier <= 2, "Invalid tier");

        uint256 entryAmount;
        if (tier == 0) {
            entryAmount = TIER_A_ENTRY;  // $8.00
        } else {
            entryAmount = TIER_B_ENTRY;  // $20.00 (both Standard and Premium)
        }

        Contest storage contest = contests[contestId];
        require(block.timestamp < contest.endTime, "Contest ended");
        require(entryAmount >= contest.minStake, "Below min stake");
        require(userEntries[msg.sender][contestId] == 0, "Already entered");

        // Transfer USDC from user
        usdc.safeTransferFrom(msg.sender, address(this), entryAmount);

        // Split: half to prize pool, half to platform
        uint256 poolContribution = entryAmount / 2;
        uint256 platformShare = entryAmount - poolContribution;

        contest.prizePool += poolContribution;
        contest.platformRevenue += platformShare;
        contest.entryCount++;

        entryId = contest.entryCount;

        entries[contestId][entryId] = Entry({
            user: msg.sender,
            contestId: contestId,
            movieTitle: movieTitle,
            promptHash: promptHash,
            videoHash: "",
            stakeAmount: entryAmount,
            poolContribution: poolContribution,
            tier: tier,
            score: 0,
            timestamp: block.timestamp,
            claimed: false
        });

        userEntries[msg.sender][contestId] = entryId;

        emit EntrySubmitted(contestId, entryId, msg.sender, entryAmount, tier, poolContribution);
    }

    /**
     * @notice Legacy submit entry (defaults to Tier A - Fast)
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

        // Split: half to prize pool, half to platform
        uint256 poolContribution = stakeAmount / 2;
        uint256 platformShare = stakeAmount - poolContribution;

        contest.prizePool += poolContribution;
        contest.platformRevenue += platformShare;
        contest.entryCount++;

        entryId = contest.entryCount;

        entries[contestId][entryId] = Entry({
            user: msg.sender,
            contestId: contestId,
            movieTitle: movieTitle,
            promptHash: promptHash,
            videoHash: "",
            stakeAmount: stakeAmount,
            poolContribution: poolContribution,
            tier: 0, // Default to Fast tier
            score: 0,
            timestamp: block.timestamp,
            claimed: false
        });

        userEntries[msg.sender][contestId] = entryId;

        emit EntrySubmitted(contestId, entryId, msg.sender, stakeAmount, 0, poolContribution);
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

    function canStartJudging(uint256 contestId) external view returns (bool) {
        Contest storage contest = contests[contestId];
        return block.timestamp >= contest.judgingStartTime && !contest.finalized;
    }

    function timeUntilJudging(uint256 contestId) external view returns (uint256) {
        Contest storage contest = contests[contestId];
        if (block.timestamp >= contest.judgingStartTime) return 0;
        if (block.timestamp < contest.endTime) return contest.judgingStartTime - block.timestamp;
        return contest.judgingStartTime - block.timestamp;
    }

    function getContestStatus(uint256 contestId) external view returns (string memory) {
        Contest storage contest = contests[contestId];

        if (contest.finalized) return "completed";
        if (block.timestamp < contest.startTime) return "upcoming";
        if (block.timestamp < contest.endTime) return "active";
        if (block.timestamp < contest.judgingStartTime) return "awaiting_judging";
        return "judging";
    }

    /**
     * @notice Get tier pricing info
     */
    function getTierPricing() external pure returns (
        uint256 tierAEntry,
        uint256 tierBEntry,
        uint256 tierCEntry,
        uint256 platformFee
    ) {
        return (TIER_A_ENTRY, TIER_B_ENTRY, TIER_C_ENTRY, PLATFORM_FEE);
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
     * @notice Assign winners handling ties - now supports 5 winners
     */
    function _assignWinnersWithTies(
        uint256 contestId,
        uint256[] memory sortedIds
    ) internal view returns (uint256[] memory) {
        if (sortedIds.length == 0) return new uint256[](0);

        // Return top 5 (or fewer if less entries)
        uint256 winnerCount = sortedIds.length < WINNER_COUNT ? sortedIds.length : WINNER_COUNT;
        uint256[] memory winners = new uint256[](winnerCount);

        for (uint256 i = 0; i < winnerCount; i++) {
            winners[i] = sortedIds[i];
        }

        return winners;
    }

    /**
     * @notice Calculate prize for an entry - 5 winner distribution
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
                else if (i == 3) combinedPrizeBps += FOURTH_PLACE_BPS;
                else if (i == 4) combinedPrizeBps += FIFTH_PLACE_BPS;
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
        uint256 totalPrize = (contest.prizePool * combinedPrizeBps) / BPS_DENOMINATOR;
        return totalPrize / tieCount;
    }
}
