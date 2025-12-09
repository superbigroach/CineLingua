'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';

const GENERATION_COST = 2.40;
const STAKE_AMOUNT = 1.60;
const TOTAL_TO_COMPETE = GENERATION_COST + STAKE_AMOUNT;

// Base Sepolia testnet config
const BASE_SEPOLIA_CONFIG = {
  chainId: '0x14a34', // 84532 in hex
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

// USDC on Base Sepolia
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// Faucet links
const FAUCETS = [
  {
    id: 'circle',
    name: 'Circle USDC Faucet',
    url: 'https://faucet.circle.com/',
    description: 'Get 10 USDC daily on Base Sepolia',
    icon: '🔵',
    highlight: true,
  },
  {
    id: 'alchemy',
    name: 'Alchemy ETH Faucet',
    url: 'https://www.alchemy.com/faucets/base-sepolia',
    description: 'Get testnet ETH for gas fees',
    icon: '⛽',
    highlight: false,
  },
  {
    id: 'superbridge',
    name: 'Superbridge',
    url: 'https://superbridge.app/base-sepolia',
    description: 'Bridge from Sepolia to Base Sepolia',
    icon: '🌉',
    highlight: false,
  },
];

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [networkCorrect, setNetworkCorrect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_accounts',
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          await checkNetwork();
          await fetchBalances(accounts[0]);
        }
      } catch (err) {
        console.error('Failed to check connection:', err);
      }
    }
  }

  async function connectWallet() {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        await switchToBaseSepolia();
        await fetchBalances(accounts[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }

  async function switchToBaseSepolia() {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CONFIG.chainId }],
      });
      setNetworkCorrect(true);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_SEPOLIA_CONFIG],
          });
          setNetworkCorrect(true);
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      }
    }
  }

  async function checkNetwork() {
    try {
      const chainId = await (window as any).ethereum.request({
        method: 'eth_chainId',
      });
      setNetworkCorrect(chainId === BASE_SEPOLIA_CONFIG.chainId);
    } catch (err) {
      console.error('Failed to check network:', err);
    }
  }

  async function fetchBalances(address: string) {
    try {
      const ethBalanceHex = await (window as any).ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const ethBalanceWei = BigInt(ethBalanceHex);
      const ethBalanceEth = Number(ethBalanceWei) / 1e18;
      setEthBalance(ethBalanceEth.toFixed(4));

      const usdcBalanceData = await (window as any).ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: USDC_ADDRESS,
            data: `0x70a08231000000000000000000000000${address.slice(2)}`,
          },
          'latest',
        ],
      });
      const usdcBalanceRaw = BigInt(usdcBalanceData);
      const usdcBalanceFormatted = Number(usdcBalanceRaw) / 1e6;
      setUsdcBalance(usdcBalanceFormatted.toFixed(2));
    } catch (err) {
      console.error('Failed to fetch balances:', err);
    }
  }

  function copyAddress() {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const canAffordContest = parseFloat(usdcBalance) >= TOTAL_TO_COMPETE;
  const canAffordGeneration = parseFloat(usdcBalance) >= GENERATION_COST;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a12] via-[#0f0f1a] to-[#0a0a12] text-white">
      <NavBar />

      <div className="pt-14 max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Contest Wallet</h1>
          <p className="text-white/50">Connect to enter CinéScene Challenges on Base</p>
        </div>

        {/* Wallet Card */}
        <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden mb-8">
          {!walletAddress ? (
            /* Not Connected */
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-white/50 mb-8 max-w-sm mx-auto">
                Use MetaMask or any Web3 wallet to connect to Base Sepolia testnet
              </p>
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  'Connect Wallet'
                )}
              </button>
              {error && (
                <p className="mt-4 text-rose-400 text-sm">{error}</p>
              )}
            </div>
          ) : (
            /* Connected */
            <div>
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${networkCorrect ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-sm text-white/60">
                    {networkCorrect ? 'Base Sepolia' : 'Wrong Network'}
                  </span>
                </div>
                {!networkCorrect && (
                  <button
                    onClick={switchToBaseSepolia}
                    className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors"
                  >
                    Switch Network
                  </button>
                )}
              </div>

              {/* Address */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/40 text-xs mb-1">Connected Address</p>
                    <p className="font-mono text-lg truncate">{shortenAddress(walletAddress)}</p>
                  </div>
                  <button
                    onClick={copyAddress}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Balances */}
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-white/40 text-xs mb-1">ETH Balance</p>
                  <p className="text-2xl font-bold text-blue-400">{ethBalance}</p>
                  <p className="text-white/30 text-xs mt-1">For gas fees</p>
                </div>
                <div className={`p-4 rounded-xl border ${canAffordGeneration ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                  <p className="text-white/40 text-xs mb-1">USDC Balance</p>
                  <p className={`text-2xl font-bold ${canAffordGeneration ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${usdcBalance}
                  </p>
                  <p className="text-white/30 text-xs mt-1">
                    {canAffordContest ? 'Ready to compete!' : canAffordGeneration ? 'Can generate video' : 'Need more USDC'}
                  </p>
                </div>
              </div>

              {/* Refresh */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => fetchBalances(walletAddress)}
                  className="w-full py-3 bg-white/5 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Balances
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">💰</span>
            Contest Costs
          </h2>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/60">Video Generation (3x 8-sec clips @ $0.10/s)</span>
              <span className="font-medium">${GENERATION_COST.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/60">Contest Stake (goes to prize pool)</span>
              <span className="font-medium">${STAKE_AMOUNT.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-bold">Total to Compete</span>
              <span className="text-xl font-bold text-purple-400">${TOTAL_TO_COMPETE.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-white/40 text-xs">
            Platform takes 20% of prize pool from winnings. Top 3 split 80%.
          </p>
        </div>

        {/* Faucets */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">🚰</span>
            Get Testnet Tokens
          </h2>

          <div className="space-y-3">
            {FAUCETS.map((faucet) => (
              <a
                key={faucet.id}
                href={faucet.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${
                  faucet.highlight
                    ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  faucet.highlight ? 'bg-blue-500/20' : 'bg-white/10'
                }`}>
                  {faucet.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-cyan-400 transition-colors">
                    {faucet.name}
                    {faucet.highlight && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        Recommended
                      </span>
                    )}
                  </h3>
                  <p className="text-white/50 text-sm truncate">{faucet.description}</p>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="text-xl">📖</span>
            How It Works
          </h2>

          <div className="space-y-5">
            {[
              { step: 1, title: 'Get Testnet USDC', desc: 'Use Circle faucet to get free USDC on Base Sepolia' },
              { step: 2, title: 'Learn & Create', desc: 'Watch trailers, pass quizzes, unlock vocabulary words' },
              { step: 3, title: 'Write Your Scene', desc: 'Use unlocked words to create 3x 8-second cinematic clips' },
              { step: 4, title: 'Enter Contest', desc: `Pay $${TOTAL_TO_COMPETE.toFixed(2)} USDC to generate video & enter prize pool` },
              { step: 5, title: 'Win Prizes', desc: 'Top 3 split 80% of pool. AI judges score your scene!' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium text-white">{item.title}</h4>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Info */}
        <div className="p-5 bg-white/5 rounded-xl border border-white/10">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Contract Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Network</span>
              <span>Base Sepolia (Testnet)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">USDC Token</span>
              <a
                href={`https://sepolia.basescan.org/token/${USDC_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline font-mono text-xs"
              >
                {shortenAddress(USDC_ADDRESS)}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Contest Contract</span>
              <span className="text-white/30 italic text-xs">Deploy with Hardhat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-white/30 text-xs">
            CinéScene Challenge • Powered by Google Veo 3.1 & Gemini AI
          </p>
        </div>
      </footer>
    </main>
  );
}
