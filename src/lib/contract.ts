import { ethers, BrowserProvider, Contract } from 'ethers';

// Contract addresses - will be set after deployment
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTEST_CONTRACT || '';
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC

// Base Sepolia Chain Config
export const BASE_SEPOLIA_CHAIN = {
  chainId: '0x14a34', // 84532
  chainName: 'Base Sepolia',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

// ===========================================
// PRICING TIERS (Dec 2025 - Veo 3.1)
// ===========================================
// Platform Fee: $0.40
// User pays: (Platform Fee + Generation Cost) × 2
// Half goes to platform, half to prize pool

// Tier A - Veo 3.1 Fast (Good quality, budget-friendly)
// Generation: $0.15/sec × 24 sec = $3.60
// Entry: ($0.40 + $3.60) × 2 = $8.00
export const TIER_A_NAME = 'Fast';
export const TIER_A_MODEL = 'veo-3.1-fast';
export const TIER_A_COST_PER_SEC = 0.15;
export const TIER_A_GEN_COST = 3_600_000;  // $3.60 (USDC 6 decimals)
export const TIER_A_ENTRY = 8_000_000;     // $8.00 total entry

// Tier B - Veo 3.1 Standard (Excellent quality)
// Generation: $0.40/sec × 24 sec = $9.60
// Entry: ($0.40 + $9.60) × 2 = $20.00
export const TIER_B_NAME = 'Standard';
export const TIER_B_MODEL = 'veo-3.1-standard';
export const TIER_B_COST_PER_SEC = 0.40;
export const TIER_B_GEN_COST = 9_600_000;  // $9.60
export const TIER_B_ENTRY = 20_000_000;    // $20.00 total entry

// Tier C - Veo 3.1 Premium (Best quality - single 24-sec generation)
// Generation: $0.40/sec × 24 sec = $9.60 (single seamless clip)
// Entry: ($0.40 + $9.60) × 2 = $20.00
export const TIER_C_NAME = 'Premium';
export const TIER_C_MODEL = 'veo-3.1-standard'; // Same model, single generation
export const TIER_C_COST_PER_SEC = 0.40;
export const TIER_C_GEN_COST = 9_600_000;  // $9.60
export const TIER_C_ENTRY = 20_000_000;    // $20.00 total entry

// Platform fee (constant across all tiers)
export const PLATFORM_FEE = 400_000; // $0.40

// Video duration
export const VIDEO_DURATION = 24; // 24 seconds total

// Prize distribution (5 winners)
export const PRIZE_SPLIT = {
  first: 0.50,   // 50%
  second: 0.20,  // 20%
  third: 0.10,   // 10%
  fourth: 0.10,  // 10%
  fifth: 0.10,   // 10%
};

// Tier configuration for UI
export const TIERS = [
  {
    id: 0,
    name: TIER_A_NAME,
    model: TIER_A_MODEL,
    costPerSec: TIER_A_COST_PER_SEC,
    genCost: TIER_A_GEN_COST,
    entry: TIER_A_ENTRY,
    poolContribution: TIER_A_ENTRY / 2,
    description: 'Good quality, budget-friendly',
    clips: '3× 8-sec clips',
    quality: 'Good',
  },
  {
    id: 1,
    name: TIER_B_NAME,
    model: TIER_B_MODEL,
    costPerSec: TIER_B_COST_PER_SEC,
    genCost: TIER_B_GEN_COST,
    entry: TIER_B_ENTRY,
    poolContribution: TIER_B_ENTRY / 2,
    description: 'Excellent quality, better consistency',
    clips: '3× 8-sec clips',
    quality: 'Excellent',
  },
  {
    id: 2,
    name: TIER_C_NAME,
    model: TIER_C_MODEL,
    costPerSec: TIER_C_COST_PER_SEC,
    genCost: TIER_C_GEN_COST,
    entry: TIER_C_ENTRY,
    poolContribution: TIER_C_ENTRY / 2,
    description: 'Best quality, seamless single generation',
    clips: '1× 24-sec clip',
    quality: 'Best',
  },
];

// Legacy constants for backwards compatibility
export const MIN_STAKE = TIER_A_ENTRY;
export const TOTAL_ENTRY_COST = TIER_A_ENTRY;

// Contract ABIs (minimal for frontend interaction)
export const CONTEST_ABI = [
  // Read functions
  'function getContest(uint256 contestId) view returns (tuple(uint256 id, string theme, string language, uint256 minStake, uint256 prizePool, uint256 platformRevenue, uint256 startTime, uint256 endTime, uint256 judgingStartTime, bool finalized, bool revenueWithdrawn, uint256 entryCount))',
  'function getEntry(uint256 contestId, uint256 entryId) view returns (tuple(address user, uint256 contestId, string movieTitle, string promptHash, string videoHash, uint256 stakeAmount, uint256 poolContribution, uint8 tier, uint256 score, uint256 timestamp, bool claimed))',
  'function getUserEntry(address user, uint256 contestId) view returns (tuple(address user, uint256 contestId, string movieTitle, string promptHash, string videoHash, uint256 stakeAmount, uint256 poolContribution, uint8 tier, uint256 score, uint256 timestamp, bool claimed))',
  'function getWinners(uint256 contestId) view returns (uint256[])',
  'function isContestActive(uint256 contestId) view returns (bool)',
  'function contestCount() view returns (uint256)',
  'function getContestStatus(uint256 contestId) view returns (string)',
  'function getEstimatedPrize(uint256 contestId, uint256 entryId) view returns (uint256)',
  'function getTierPricing() view returns (uint256 tierAEntry, uint256 tierBEntry, uint256 tierCEntry, uint256 platformFee)',

  // Write functions
  'function submitEntry(uint256 contestId, string movieTitle, string promptHash, uint256 stakeAmount) returns (uint256)',
  'function submitEntryWithTier(uint256 contestId, string movieTitle, string promptHash, uint8 tier) returns (uint256)',
  'function updateVideoHash(uint256 contestId, string videoHash)',
  'function claimPrize(uint256 contestId)',

  // Events
  'event EntrySubmitted(uint256 indexed contestId, uint256 indexed entryId, address indexed user, uint256 stakeAmount, uint8 tier, uint256 poolContribution)',
  'event PrizeClaimed(uint256 indexed contestId, uint256 indexed entryId, address indexed user, uint256 amount)',
];

export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// Types
export interface ContestData {
  id: number;
  theme: string;
  language: string;
  minStake: bigint;
  prizePool: bigint;
  platformRevenue: bigint;
  startTime: number;
  endTime: number;
  judgingStartTime: number;
  finalized: boolean;
  revenueWithdrawn: boolean;
  entryCount: number;
}

export interface EntryData {
  user: string;
  contestId: number;
  movieTitle: string;
  promptHash: string;
  videoHash: string;
  stakeAmount: bigint;
  poolContribution: bigint;
  tier: number;
  score: number;
  timestamp: number;
  claimed: boolean;
}

// Helper to get provider
export async function getProvider(): Promise<BrowserProvider | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }
  return new BrowserProvider(window.ethereum);
}

// Helper to get signer
export async function getSigner() {
  const provider = await getProvider();
  if (!provider) return null;
  return provider.getSigner();
}

// Switch to Base Sepolia
export async function switchToBaseSepolia(): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_SEPOLIA_CHAIN.chainId }],
    });
    return true;
  } catch (switchError: any) {
    // Chain not added, try to add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [BASE_SEPOLIA_CHAIN],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add Base Sepolia:', addError);
        return false;
      }
    }
    console.error('Failed to switch to Base Sepolia:', switchError);
    return false;
  }
}

// Connect wallet
export async function connectWallet(): Promise<string | null> {
  if (!window.ethereum) {
    alert('Please install MetaMask or another Web3 wallet');
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Switch to Base Sepolia
    await switchToBaseSepolia();

    return accounts[0];
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return null;
  }
}

// Get USDC balance
export async function getUSDCBalance(address: string): Promise<string> {
  const provider = await getProvider();
  if (!provider) return '0';

  const usdc = new Contract(USDC_ADDRESS, ERC20_ABI, provider);
  const balance = await usdc.balanceOf(address);
  return ethers.formatUnits(balance, 6);
}

// Get ETH balance (for gas)
export async function getETHBalance(address: string): Promise<string> {
  const provider = await getProvider();
  if (!provider) return '0';

  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

// Check USDC allowance
export async function checkAllowance(owner: string): Promise<bigint> {
  const provider = await getProvider();
  if (!provider || !CONTRACT_ADDRESS) return BigInt(0);

  const usdc = new Contract(USDC_ADDRESS, ERC20_ABI, provider);
  return usdc.allowance(owner, CONTRACT_ADDRESS);
}

// Approve USDC spending
export async function approveUSDC(amount: bigint): Promise<boolean> {
  const signer = await getSigner();
  if (!signer || !CONTRACT_ADDRESS) return false;

  try {
    const usdc = new Contract(USDC_ADDRESS, ERC20_ABI, signer);
    const tx = await usdc.approve(CONTRACT_ADDRESS, amount);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Approval failed:', error);
    return false;
  }
}

// Submit contest entry with tier selection
export async function submitContestEntryWithTier(
  contestId: number,
  movieTitle: string,
  promptHash: string,
  tier: number // 0=Fast, 1=Standard, 2=Premium
): Promise<{ success: boolean; entryId?: number; error?: string }> {
  const signer = await getSigner();
  if (!signer || !CONTRACT_ADDRESS) {
    return { success: false, error: 'Wallet not connected' };
  }

  const tierConfig = TIERS[tier];
  if (!tierConfig) {
    return { success: false, error: 'Invalid tier' };
  }

  const entryAmount = BigInt(tierConfig.entry);

  try {
    // Check allowance first
    const address = await signer.getAddress();
    const allowance = await checkAllowance(address);

    if (allowance < entryAmount) {
      // Approve spending
      const approved = await approveUSDC(entryAmount);
      if (!approved) {
        return { success: false, error: 'USDC approval failed' };
      }
    }

    // Submit entry with tier
    const contest = new Contract(CONTRACT_ADDRESS, CONTEST_ABI, signer);
    const tx = await contest.submitEntryWithTier(contestId, movieTitle, promptHash, tier);
    const receipt = await tx.wait();

    // Get entry ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contest.interface.parseLog(log);
        return parsed?.name === 'EntrySubmitted';
      } catch {
        return false;
      }
    });

    const entryId = event ? Number(contest.interface.parseLog(event)?.args[1]) : 0;

    return { success: true, entryId };
  } catch (error: any) {
    console.error('Entry submission failed:', error);
    return { success: false, error: error.message || 'Transaction failed' };
  }
}

// Legacy submit entry (uses Tier A by default)
export async function submitContestEntry(
  contestId: number,
  movieTitle: string,
  promptHash: string,
  stakeAmount: bigint = BigInt(TIER_A_ENTRY)
): Promise<{ success: boolean; entryId?: number; error?: string }> {
  const signer = await getSigner();
  if (!signer || !CONTRACT_ADDRESS) {
    return { success: false, error: 'Wallet not connected' };
  }

  try {
    // Check allowance first
    const address = await signer.getAddress();
    const allowance = await checkAllowance(address);

    if (allowance < stakeAmount) {
      // Approve spending
      const approved = await approveUSDC(stakeAmount);
      if (!approved) {
        return { success: false, error: 'USDC approval failed' };
      }
    }

    // Submit entry
    const contest = new Contract(CONTRACT_ADDRESS, CONTEST_ABI, signer);
    const tx = await contest.submitEntry(contestId, movieTitle, promptHash, stakeAmount);
    const receipt = await tx.wait();

    // Get entry ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contest.interface.parseLog(log);
        return parsed?.name === 'EntrySubmitted';
      } catch {
        return false;
      }
    });

    const entryId = event ? Number(contest.interface.parseLog(event)?.args[1]) : 0;

    return { success: true, entryId };
  } catch (error: any) {
    console.error('Entry submission failed:', error);
    return { success: false, error: error.message || 'Transaction failed' };
  }
}

// Get contest data
export async function getContestData(contestId: number): Promise<ContestData | null> {
  const provider = await getProvider();
  if (!provider || !CONTRACT_ADDRESS) return null;

  try {
    const contest = new Contract(CONTRACT_ADDRESS, CONTEST_ABI, provider);
    const data = await contest.getContest(contestId);

    return {
      id: Number(data.id),
      theme: data.theme,
      language: data.language,
      minStake: data.minStake,
      prizePool: data.prizePool,
      platformRevenue: data.platformRevenue,
      startTime: Number(data.startTime),
      endTime: Number(data.endTime),
      judgingStartTime: Number(data.judgingStartTime),
      finalized: data.finalized,
      revenueWithdrawn: data.revenueWithdrawn,
      entryCount: Number(data.entryCount),
    };
  } catch (error) {
    console.error('Failed to get contest:', error);
    return null;
  }
}

// Get user's entry for a contest
export async function getUserContestEntry(
  userAddress: string,
  contestId: number
): Promise<EntryData | null> {
  const provider = await getProvider();
  if (!provider || !CONTRACT_ADDRESS) return null;

  try {
    const contest = new Contract(CONTRACT_ADDRESS, CONTEST_ABI, provider);
    const data = await contest.getUserEntry(userAddress, contestId);

    return {
      user: data.user,
      contestId: Number(data.contestId),
      movieTitle: data.movieTitle,
      promptHash: data.promptHash,
      videoHash: data.videoHash,
      stakeAmount: data.stakeAmount,
      poolContribution: data.poolContribution,
      tier: Number(data.tier),
      score: Number(data.score),
      timestamp: Number(data.timestamp),
      claimed: data.claimed,
    };
  } catch (error) {
    // User has no entry
    return null;
  }
}

// Claim prize
export async function claimPrize(contestId: number): Promise<{ success: boolean; amount?: string; error?: string }> {
  const signer = await getSigner();
  if (!signer || !CONTRACT_ADDRESS) {
    return { success: false, error: 'Wallet not connected' };
  }

  try {
    const contest = new Contract(CONTRACT_ADDRESS, CONTEST_ABI, signer);
    const tx = await contest.claimPrize(contestId);
    const receipt = await tx.wait();

    // Get amount from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contest.interface.parseLog(log);
        return parsed?.name === 'PrizeClaimed';
      } catch {
        return false;
      }
    });

    const amount = event
      ? ethers.formatUnits(contest.interface.parseLog(event)?.args[3], 6)
      : '0';

    return { success: true, amount };
  } catch (error: any) {
    console.error('Claim failed:', error);
    return { success: false, error: error.message || 'Transaction failed' };
  }
}

// Get active contest count
export async function getActiveContestCount(): Promise<number> {
  const provider = await getProvider();
  if (!provider || !CONTRACT_ADDRESS) return 0;

  try {
    const contest = new Contract(CONTRACT_ADDRESS, CONTEST_ABI, provider);
    return Number(await contest.contestCount());
  } catch {
    return 0;
  }
}

// Format USDC amount for display
export function formatUSDC(amount: bigint): string {
  return ethers.formatUnits(amount, 6);
}

// Parse USDC amount from string
export function parseUSDC(amount: string): bigint {
  return ethers.parseUnits(amount, 6);
}

// Get tier by ID
export function getTierById(tierId: number) {
  return TIERS[tierId] || TIERS[0];
}

// Format entry cost for display
export function formatEntryCost(tierId: number): string {
  const tier = getTierById(tierId);
  return `$${(tier.entry / 1_000_000).toFixed(2)}`;
}

// Format pool contribution for display
export function formatPoolContribution(tierId: number): string {
  const tier = getTierById(tierId);
  return `$${(tier.poolContribution / 1_000_000).toFixed(2)}`;
}
