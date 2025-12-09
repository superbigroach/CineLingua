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

// Pricing constants (in USDC with 6 decimals)
export const GENERATION_COST = 2_400_000; // $2.40
export const STAKE_TO_POOL = 1_900_000;   // $1.90
export const PLATFORM_FEE = 500_000;      // $0.50
export const TOTAL_ENTRY_COST = 4_800_000; // $4.80

// Contract ABIs (minimal for frontend interaction)
export const CONTEST_ABI = [
  // Read functions
  'function getContest(uint256 contestId) view returns (tuple(uint256 id, string theme, string language, uint256 minStake, uint256 prizePool, uint256 winnersPool, uint256 platformFees, uint256 startTime, uint256 endTime, uint256 judgingStartTime, bool finalized, bool feesWithdrawn, uint256 entryCount))',
  'function getEntry(uint256 contestId, uint256 entryId) view returns (tuple(address user, uint256 contestId, string movieTitle, string promptHash, string videoHash, uint256 stakeAmount, uint256 score, uint256 timestamp, bool claimed))',
  'function getUserEntry(address user, uint256 contestId) view returns (tuple(address user, uint256 contestId, string movieTitle, string promptHash, string videoHash, uint256 stakeAmount, uint256 score, uint256 timestamp, bool claimed))',
  'function getWinners(uint256 contestId) view returns (uint256[])',
  'function isContestActive(uint256 contestId) view returns (bool)',
  'function contestCount() view returns (uint256)',
  'function getContestStatus(uint256 contestId) view returns (string)',
  'function getEstimatedPrize(uint256 contestId, uint256 entryId) view returns (uint256)',

  // Write functions
  'function submitEntry(uint256 contestId, string movieTitle, string promptHash, uint256 stakeAmount) returns (uint256)',
  'function updateVideoHash(uint256 contestId, string videoHash)',
  'function claimPrize(uint256 contestId)',

  // Events
  'event EntrySubmitted(uint256 indexed contestId, uint256 indexed entryId, address indexed user, uint256 stakeAmount)',
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
  winnersPool: bigint;
  platformFees: bigint;
  startTime: number;
  endTime: number;
  judgingStartTime: number;
  finalized: boolean;
  feesWithdrawn: boolean;
  entryCount: number;
}

export interface EntryData {
  user: string;
  contestId: number;
  movieTitle: string;
  promptHash: string;
  videoHash: string;
  stakeAmount: bigint;
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

// Submit contest entry
export async function submitContestEntry(
  contestId: number,
  movieTitle: string,
  promptHash: string,
  stakeAmount: bigint = BigInt(TOTAL_ENTRY_COST)
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
      winnersPool: data.winnersPool,
      platformFees: data.platformFees,
      startTime: Number(data.startTime),
      endTime: Number(data.endTime),
      judgingStartTime: Number(data.judgingStartTime),
      finalized: data.finalized,
      feesWithdrawn: data.feesWithdrawn,
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
