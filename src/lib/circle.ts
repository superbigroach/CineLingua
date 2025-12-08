// Circle Web3 Services Integration
// https://developers.circle.com/w3s/docs
//
// Using Programmable Wallets for USDC payments on Base Sepolia testnet
// Faucet: https://faucet.circle.com/

// Configuration
const CIRCLE_API_BASE = 'https://api.circle.com/v1/w3s';
const TESTNET_API_KEY = process.env.CIRCLE_TESTNET_API_KEY || '';
const TESTNET_CLIENT_KEY = process.env.CIRCLE_TESTNET_CLIENT_KEY || '';

// Base Sepolia testnet
export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  chainIdHex: '0x14a34',
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};

// Types
export interface CircleWallet {
  id: string;
  address: string;
  blockchain: string;
  state: 'LIVE' | 'PENDING' | 'FROZEN';
  createDate: string;
  updateDate: string;
}

export interface CircleTransaction {
  id: string;
  state: 'INITIATED' | 'PENDING' | 'CONFIRMED' | 'COMPLETE' | 'FAILED';
  txHash?: string;
  amount: string;
  token: string;
  from: string;
  to: string;
}

export interface WalletBalance {
  token: string;
  amount: string;
  updateDate: string;
}

// Helper to parse API key
function getApiCredentials() {
  const [apiKeyId, apiKeySecret] = TESTNET_API_KEY.split(':');
  const [clientKeyId, clientKeySecret] = TESTNET_CLIENT_KEY.split(':');

  return {
    apiKeyId,
    apiKeySecret,
    clientKeyId,
    clientKeySecret,
    authHeader: `Bearer ${TESTNET_API_KEY}`,
  };
}

// Create a new programmable wallet for a user
export async function createUserWallet(userId: string): Promise<CircleWallet | null> {
  const { authHeader } = getApiCredentials();

  try {
    const response = await fetch(`${CIRCLE_API_BASE}/wallets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        idempotencyKey: `wallet-${userId}-${Date.now()}`,
        blockchains: ['BASE-SEPOLIA'],
        count: 1,
        walletSetId: process.env.CIRCLE_WALLET_SET_ID, // Optional: group wallets
      }),
    });

    const data = await response.json();

    if (data.data?.wallets?.[0]) {
      return data.data.wallets[0];
    }

    console.error('Failed to create wallet:', data);
    return null;
  } catch (error) {
    console.error('Circle API error:', error);
    return null;
  }
}

// Get wallet balance
export async function getWalletBalance(walletId: string): Promise<WalletBalance[]> {
  const { authHeader } = getApiCredentials();

  try {
    const response = await fetch(`${CIRCLE_API_BASE}/wallets/${walletId}/balances`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    const data = await response.json();
    return data.data?.tokenBalances || [];
  } catch (error) {
    console.error('Failed to get balance:', error);
    return [];
  }
}

// Transfer USDC (for contest entry)
export async function transferUSDC(params: {
  fromWalletId: string;
  toAddress: string;
  amount: string; // In USDC units (e.g., "1.60" for $1.60)
}): Promise<CircleTransaction | null> {
  const { authHeader } = getApiCredentials();

  try {
    // Convert to smallest unit (6 decimals for USDC)
    const amountInSmallestUnit = Math.round(parseFloat(params.amount) * 1e6).toString();

    const response = await fetch(`${CIRCLE_API_BASE}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        idempotencyKey: `tx-${params.fromWalletId}-${Date.now()}`,
        walletId: params.fromWalletId,
        tokenId: BASE_SEPOLIA_CONFIG.usdc, // USDC on Base Sepolia
        destinationAddress: params.toAddress,
        amounts: [amountInSmallestUnit],
        feeLevel: 'MEDIUM',
      }),
    });

    const data = await response.json();

    if (data.data?.transaction) {
      return data.data.transaction;
    }

    console.error('Transfer failed:', data);
    return null;
  } catch (error) {
    console.error('Transfer error:', error);
    return null;
  }
}

// Check transaction status
export async function getTransactionStatus(txId: string): Promise<CircleTransaction | null> {
  const { authHeader } = getApiCredentials();

  try {
    const response = await fetch(`${CIRCLE_API_BASE}/transactions/${txId}`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    const data = await response.json();
    return data.data?.transaction || null;
  } catch (error) {
    console.error('Failed to get transaction:', error);
    return null;
  }
}

// Contest payment flow
export async function submitContestPayment(params: {
  userWalletId: string;
  contestContractAddress: string;
  generationCost: number; // $0.80
  stakeAmount: number;    // $1.60
}): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  const totalAmount = params.generationCost + params.stakeAmount;

  // Step 1: Transfer to contest contract
  const tx = await transferUSDC({
    fromWalletId: params.userWalletId,
    toAddress: params.contestContractAddress,
    amount: totalAmount.toFixed(2),
  });

  if (!tx) {
    return { success: false, error: 'Transfer failed' };
  }

  // Step 2: Wait for confirmation (poll status)
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds timeout

  while (attempts < maxAttempts) {
    const status = await getTransactionStatus(tx.id);

    if (status?.state === 'COMPLETE' || status?.state === 'CONFIRMED') {
      return {
        success: true,
        txHash: status.txHash,
      };
    }

    if (status?.state === 'FAILED') {
      return { success: false, error: 'Transaction failed on-chain' };
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  return { success: false, error: 'Transaction timeout' };
}

// Format USDC amount for display
export function formatUSDC(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${num.toFixed(2)} USDC`;
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Get faucet URLs
export const FAUCETS = {
  circleUSDC: 'https://faucet.circle.com/',
  baseSepolia: 'https://www.alchemy.com/faucets/base-sepolia',
  superbridge: 'https://superbridge.app/base-sepolia',
};
