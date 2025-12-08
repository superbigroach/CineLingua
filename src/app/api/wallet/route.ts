import { NextRequest, NextResponse } from 'next/server';
import {
  createUserWallet,
  getWalletBalance,
  transferUSDC,
  getTransactionStatus,
  submitContestPayment,
  BASE_SEPOLIA_CONFIG,
  FAUCETS,
} from '@/lib/circle';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create-wallet': {
        const { userId } = params;
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }
        const wallet = await createUserWallet(userId);
        if (!wallet) {
          return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
        }
        return NextResponse.json({
          success: true,
          wallet,
          faucets: FAUCETS,
          network: BASE_SEPOLIA_CONFIG,
        });
      }

      case 'get-balance': {
        const { walletId } = params;
        if (!walletId) {
          return NextResponse.json({ error: 'walletId required' }, { status: 400 });
        }
        const balances = await getWalletBalance(walletId);
        return NextResponse.json({ success: true, balances });
      }

      case 'transfer': {
        const { fromWalletId, toAddress, amount } = params;
        if (!fromWalletId || !toAddress || !amount) {
          return NextResponse.json(
            { error: 'fromWalletId, toAddress, and amount required' },
            { status: 400 }
          );
        }
        const tx = await transferUSDC({ fromWalletId, toAddress, amount });
        if (!tx) {
          return NextResponse.json({ error: 'Transfer failed' }, { status: 500 });
        }
        return NextResponse.json({ success: true, transaction: tx });
      }

      case 'tx-status': {
        const { txId } = params;
        if (!txId) {
          return NextResponse.json({ error: 'txId required' }, { status: 400 });
        }
        const status = await getTransactionStatus(txId);
        return NextResponse.json({ success: true, transaction: status });
      }

      case 'contest-payment': {
        const { userWalletId, contestContractAddress, generationCost, stakeAmount } = params;
        if (!userWalletId || !contestContractAddress) {
          return NextResponse.json(
            { error: 'userWalletId and contestContractAddress required' },
            { status: 400 }
          );
        }
        const result = await submitContestPayment({
          userWalletId,
          contestContractAddress,
          generationCost: generationCost || 0.80,
          stakeAmount: stakeAmount || 1.60,
        });
        return NextResponse.json(result);
      }

      case 'get-faucets': {
        return NextResponse.json({
          success: true,
          faucets: FAUCETS,
          network: BASE_SEPOLIA_CONFIG,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Wallet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return network info and faucet links
  return NextResponse.json({
    network: BASE_SEPOLIA_CONFIG,
    faucets: FAUCETS,
    pricing: {
      generationCost: 0.80,
      stakeAmount: 1.60,
      totalToCompete: 2.40,
      platformFee: '20% of winnings',
    },
  });
}
