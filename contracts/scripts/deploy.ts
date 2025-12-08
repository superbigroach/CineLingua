import { ethers } from "hardhat";

// Base Sepolia USDC address
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying CineSceneContest with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const CineSceneContest = await ethers.getContractFactory("CineSceneContest");
  const contest = await CineSceneContest.deploy(USDC_ADDRESS);

  await contest.waitForDeployment();

  const contractAddress = await contest.getAddress();

  console.log("\n✅ CineSceneContest deployed to:", contractAddress);
  console.log("\n📋 Contract Details:");
  console.log("  - Network: Base Sepolia");
  console.log("  - USDC Token:", USDC_ADDRESS);
  console.log("  - Platform Fee: 20% (of winnings)");
  console.log("  - Min Stake: $1.60 USDC");
  console.log("  - Judging Delay: 30 minutes");

  console.log("\n📝 Next Steps:");
  console.log(`  1. Verify contract: npx hardhat verify --network base-sepolia ${contractAddress} ${USDC_ADDRESS}`);
  console.log("  2. Add contract address to .env.local:");
  console.log(`     NEXT_PUBLIC_CONTEST_CONTRACT=${contractAddress}`);
  console.log("  3. Get testnet USDC from https://faucet.circle.com/");

  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n🎬 Deployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
