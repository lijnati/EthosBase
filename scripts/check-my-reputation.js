const { ethers } = require("hardhat");

async function main() {
  console.log("🎯 Checking your current reputation status...");

  try {
    const userAddress = "0xdB3E14879897939cCFD0B22Da16f178463aE6020";
    const REPUTATION_ADDRESS = "0x4fD8693aEAF67F96D8077961847344FF485e659b";
    const ACCESS_ADDRESS = "0x32f848F3677738d73faC20a0bD5A465e0da6e731";

    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const reputationSystem = ReputationSystem.attach(REPUTATION_ADDRESS);

    const ReputationGatedAccess = await ethers.getContractFactory("ReputationGatedAccess");
    const accessControl = ReputationGatedAccess.attach(ACCESS_ADDRESS);

    // Get reputation
    const reputation = await reputationSystem.getUserReputation(userAddress);
    const tier = await reputationSystem.getReputationTier(userAddress);

    console.log("\n🏆 Your Reputation Status:");
    console.log("===========================");
    console.log("Total Score:", reputation[0].toString());
    console.log("Loan Score:", reputation[1].toString());
    console.log("Staking Score:", reputation[2].toString());
    console.log("Community Score:", reputation[3].toString());
    console.log("Flash Loan Score:", reputation[4].toString());
    console.log("Tier:", tier);

    // Get access benefits
    const accessLevel = await accessControl.getUserAccessLevel(userAddress);
    
    console.log("\n💎 Your Access Benefits:");
    console.log("========================");
    console.log("Max Loan Amount:", ethers.formatUnits(accessLevel[1], 6), "USDC");
    console.log("Collateral Ratio:", (Number(accessLevel[2]) / 100).toFixed(1) + "%");
    console.log("Interest Discount:", (Number(accessLevel[3]) / 100).toFixed(2) + "%");
    console.log("Exclusive Access:", accessLevel[4] ? "Yes" : "No");

    console.log("\n🚀 Ready to Test:");
    console.log("=================");
    if (Number(reputation[0]) > 0) {
      console.log("✅ You have reputation points!");
      console.log("✅ Refresh your browser to see the updates");
      console.log("✅ Try requesting a loan up to", ethers.formatUnits(accessLevel[1], 6), "USDC");
    } else {
      console.log("❌ No reputation points yet");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });