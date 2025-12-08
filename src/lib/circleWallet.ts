// Circle Modular Wallets Web SDK Integration
// https://developers.circle.com/wallets/modular/web-sdk
// https://developers.circle.com/wallets/modular/console-setup

// Environment variables needed:
// NEXT_PUBLIC_CIRCLE_CLIENT_KEY - Client key from Circle Console
// NEXT_PUBLIC_CIRCLE_CLIENT_URL - https://modular-sdk.circle.com/v1/rpc/w3s/buidl (testnet)

import { createPublicClient, http, parseUnits, formatUnits, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';

// Circle SDK Types (from @circle-fin/modular-wallets-core)
export interface WebAuthnCredential {
  credentialId: string;
  publicKey: string;
  rpId: string;
}

export interface CircleWalletState {
  isConnected: boolean;
  address: Address | null;
  credential: WebAuthnCredential | null;
  balance: string;
  error: string | null;
}

// Configuration
const CIRCLE_CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || '';
const CIRCLE_CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL || 'https://modular-sdk.circle.com/v1/rpc/w3s/buidl';

// Base Sepolia USDC Contract
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address;
export const USDC_DECIMALS = 6;

// Base Sepolia Chain Config
export const BASE_SEPOLIA_CHAIN = {
  id: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
};

// Create public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_CHAIN.rpcUrl),
});

// USDC ABI for balance and transfer
const USDC_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

// Storage keys
const STORAGE_KEY_CREDENTIAL = 'circle_wallet_credential';
const STORAGE_KEY_ADDRESS = 'circle_wallet_address';

// Helper: Check if Circle SDK is properly configured
export function isCircleConfigured(): boolean {
  return Boolean(CIRCLE_CLIENT_KEY && CIRCLE_CLIENT_URL);
}

// Helper: Get stored credential
export function getStoredCredential(): WebAuthnCredential | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY_CREDENTIAL);
  return stored ? JSON.parse(stored) : null;
}

// Helper: Get stored address
export function getStoredAddress(): Address | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY_ADDRESS);
  return stored as Address | null;
}

// Helper: Store credential and address
function storeWalletData(credential: WebAuthnCredential, address: Address): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CREDENTIAL, JSON.stringify(credential));
  localStorage.setItem(STORAGE_KEY_ADDRESS, address);
}

// Helper: Clear stored wallet data
export function clearWalletData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_CREDENTIAL);
  localStorage.removeItem(STORAGE_KEY_ADDRESS);
}

// Get USDC balance for an address
export async function getUSDCBalance(address: Address): Promise<string> {
  try {
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [address],
    });

    return formatUnits(balance, USDC_DECIMALS);
  } catch (error) {
    console.error('Failed to get USDC balance:', error);
    return '0';
  }
}

// Format USDC for display
export function formatUSDC(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${num.toFixed(2)}`;
}

// Parse USDC amount to smallest unit (6 decimals)
export function parseUSDC(amount: string | number): bigint {
  const amountStr = typeof amount === 'number' ? amount.toFixed(6) : amount;
  return parseUnits(amountStr, USDC_DECIMALS);
}

// Faucet links for testnet
export const FAUCETS = {
  circleUSDC: 'https://faucet.circle.com/',
  baseSepolia: 'https://www.alchemy.com/faucets/base-sepolia',
  superbridge: 'https://superbridge.app/base-sepolia',
};

// ===========================================
// Circle Modular Wallet SDK Integration
// ===========================================
// NOTE: This requires installing @circle-fin/modular-wallets-core
// npm install @circle-fin/modular-wallets-core viem

/*
To use Circle's Modular Wallet SDK with passkeys, you need to:

1. Install the SDK:
   npm install @circle-fin/modular-wallets-core viem

2. Configure in Circle Console (https://console.circle.com/):
   - Go to API & Client Keys
   - Create a new Client Key
   - Set Allowed Domain to your app domain (localhost for dev)
   - Configure Passkey Domain Name to match

3. Add env variables:
   NEXT_PUBLIC_CIRCLE_CLIENT_KEY=your_client_key
   NEXT_PUBLIC_CIRCLE_CLIENT_URL=https://modular-sdk.circle.com/v1/rpc/w3s/buidl

4. Initialize the SDK (example code below):

import {
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
  toWebAuthnAccount,
  toCircleSmartAccount,
  WebAuthnMode,
} from '@circle-fin/modular-wallets-core';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

// Create transports
const modularTransport = toModularTransport(CIRCLE_CLIENT_URL, CIRCLE_CLIENT_KEY);
const passkeyTransport = toPasskeyTransport(CIRCLE_CLIENT_URL, CIRCLE_CLIENT_KEY);

// Register a new passkey wallet
async function registerWallet(username: string) {
  // Create WebAuthn credential via passkey
  const credential = await toWebAuthnCredential({
    mode: WebAuthnMode.Register,
    transport: passkeyTransport,
    username: username,
  });

  // Create WebAuthn account from credential
  const webAuthnAccount = toWebAuthnAccount({
    credential,
  });

  // Create public client
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  // Create Circle smart account
  const account = await toCircleSmartAccount({
    client,
    owner: webAuthnAccount,
    name: `cinelingua-${username}`,
  });

  return {
    credential,
    address: account.address,
    account,
  };
}

// Login with existing passkey
async function loginWallet(credentialId: string) {
  const credential = await toWebAuthnCredential({
    mode: WebAuthnMode.Login,
    transport: passkeyTransport,
    credentialId: credentialId,
  });

  const webAuthnAccount = toWebAuthnAccount({
    credential,
  });

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const account = await toCircleSmartAccount({
    client,
    owner: webAuthnAccount,
  });

  return {
    credential,
    address: account.address,
    account,
  };
}
*/

// ===========================================
// Simplified API for the app (without full SDK)
// ===========================================

// These functions provide a simplified interface
// For production, integrate the full Circle SDK above

export interface WalletConnection {
  address: Address;
  balance: string;
}

// Check if user has a stored wallet
export function hasStoredWallet(): boolean {
  return Boolean(getStoredCredential() && getStoredAddress());
}

// Get current wallet state
export async function getWalletState(): Promise<CircleWalletState> {
  const credential = getStoredCredential();
  const address = getStoredAddress();

  if (!credential || !address) {
    return {
      isConnected: false,
      address: null,
      credential: null,
      balance: '0',
      error: null,
    };
  }

  const balance = await getUSDCBalance(address);

  return {
    isConnected: true,
    address,
    credential,
    balance,
    error: null,
  };
}

// Mock functions for demo (replace with real SDK calls)
export async function connectWallet(): Promise<CircleWalletState> {
  // In production, this would use toWebAuthnCredential with WebAuthnMode.Login or Register
  // For demo, we'll simulate a wallet connection

  if (!isCircleConfigured()) {
    return {
      isConnected: false,
      address: null,
      credential: null,
      balance: '0',
      error: 'Circle SDK not configured. Add NEXT_PUBLIC_CIRCLE_CLIENT_KEY to .env.local',
    };
  }

  // Check for existing credential
  const existingCredential = getStoredCredential();
  const existingAddress = getStoredAddress();

  if (existingCredential && existingAddress) {
    const balance = await getUSDCBalance(existingAddress);
    return {
      isConnected: true,
      address: existingAddress,
      credential: existingCredential,
      balance,
      error: null,
    };
  }

  // For demo: Generate a mock address (in production, this comes from Circle SDK)
  const mockCredential: WebAuthnCredential = {
    credentialId: `demo_${Date.now()}`,
    publicKey: '0x...',
    rpId: window.location.hostname,
  };

  // In production, address comes from toCircleSmartAccount
  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab12' as Address;

  storeWalletData(mockCredential, mockAddress);

  const balance = await getUSDCBalance(mockAddress);

  return {
    isConnected: true,
    address: mockAddress,
    credential: mockCredential,
    balance,
    error: null,
  };
}

export async function disconnectWallet(): Promise<void> {
  clearWalletData();
}
