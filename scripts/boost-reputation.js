const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Boosting your reputation for testing...");

  try {
    const [deployer] = await ethers.getSigners();
    const userAddress = "0xdB3E14879897939cCFD0B22Da16f178463aE6020"; // Your address

    const REPUTATION_ADDRESS = "0x4fD8693aEAF67F96D8077961847344FF485e659b";

    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const reputationSystem = ReputationSystem.attach(REPUTATION_ADDRESS);

    // Check current reputation first
    console.log("Checking current reputation...");
    const currentRep = await reputationSystem.getUserReputation(userAddress);
    console.log("Current scores:", {
      total: currentRep[0].toString(),
      loan: currentRep[1].toString(),
      staking: currentRep[2].toString(),
      community: currentRep[3].toString()
    });

    console.log("\nAdding reputation points one by one...");

    try {
      // Add loan repayment score (smaller amount first)
      console.log("Adding loan repayment score...");
      const tx1 = await reputationSystem.updateReputation(
        userAddress,
        0, // LOAN_REPAYMENT
        100, // Smaller amount
        "Initial loan repayment boost"
      );
      await tx1.wait();
      console.log("✅ Added loan repayment score");

      // Wait a bit between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add staking score
      console.log("Adding staking score...");
      const tx2 = await reputationSystem.updateReputation(
        userAddress,
        2, // STAKING_REWARD
        80, // Smaller amount
        "Staking participation bonus"
      );
      await tx2.wait();
      console.log("✅ Added staking score");

      // Wait a bit between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add community score
      console.log("Adding community score...");
      const tx3 = await reputationSystem.updateReputation(
        userAddress,
        5, // COMMUNITY_CONTRIBUTION
        60, // Smaller amount
        "Community participation bonus"
      );
      await tx3.wait();
      console.log("✅ Added community score");

    } catch (txError) {
      console.error("Transaction failed:", txError.message);
      
      if (txError.message.includes("Not authorized")) {
        console.log("\n🔧 Authorization issue detected.");
        console.log("The deployer account needs to be authorized to update reputation.");
        console.log("This might be because only the lending pool is authorized.");
        return;
      }
      throw txError;
    }

    // Check final reputation
    const reputation = await reputationSystem.getUserReputation(userAddress);
    const tier = await reputationSystem.getReputationTier(userAddress);

    console.log("\n🎯 Your New Reputation:");
    console.log("========================");
    console.log("Total Score:", reputation[0].toString());
    console.log("Loan Score:", reputation[1].toString());
    console.log("Staking Score:", reputation[2].toString());
    console.log("Community Score:", reputation[3].toString());
    console.log("Tier:", tier);

    console.log("\n🎉 Reputation boost complete!");
    console.log("Refresh your browser to see the changes!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("Not authorized")) {
      console.log("\n💡 Solution: The reputation system only allows authorized contracts to update scores.");
      console.log("In a real scenario, you'd earn reputation by using the lending pool.");
      console.log("\nTry this instead:");
      console.log("1. Request a small loan through the frontend");
      console.log("2. Repay it to earn reputation points");
      console.log("3. Or we can modify the contract to allow manual updates");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });