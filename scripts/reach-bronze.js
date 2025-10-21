const { ethers } = require("hardhat");

async function main() {
    console.log("🥉 Getting you to Bronze tier...");

    try {
        const [deployer] = await ethers.getSigners();
        const userAddress = "0xdB3E14879897939cCFD0B22Da16f178463aE6020";
        const REPUTATION_ADDRESS = "0x4fD8693aEAF67F96D8077961847344FF485e659b";

        const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
        const reputationSystem = ReputationSystem.attach(REPUTATION_ADDRESS);

        // Check current status
        const currentRep = await reputationSystem.getUserReputation(userAddress);
        console.log("Current total score:", currentRep[0].toString());
        console.log("Current loan score:", currentRep[1].toString());

        // Need 200+ total score for Bronze
        // Current: 120 (from 300 loan score × 40%)
        // Need: 80+ more total score
        // To get 80 more total score from loan category: need 200 more loan score (200 × 40% = 80)

        console.log("\nAdding more loan reputation to reach Bronze tier...");

        const tx = await reputationSystem.updateReputation(
            userAddress,
            0, // LOAN_REPAYMENT
            200, // This should give us 80 more total score (200 × 40% = 80)
            "Additional loan repayment for Bronze tier"
        );

        await tx.wait();
        console.log("✅ Added more loan reputation");

        // Check new status
        const newRep = await reputationSystem.getUserReputation(userAddress);
        const tier = await reputationSystem.getReputationTier(userAddress);

        console.log("\n🎯 New Reputation Status:");
        console.log("=========================");
        console.log("Total Score:", newRep[0].toString());
        console.log("Loan Score:", newRep[1].toString());
        console.log("Tier:", tier);

        if (tier === "Bronze") {
            console.log("\n🎉 Success! You've reached Bronze tier!");
            console.log("Refresh your browser to see:");
            console.log("- Max Loan: 10,000 USDC");
            console.log("- Collateral Ratio: 150%");
            console.log("- Bronze tier badge");
        } else {
            console.log("\n⚠️  Still not Bronze. Let's add more points...");

            // Add community score for extra points
            const tx2 = await reputationSystem.updateReputation(
                userAddress,
                5, // COMMUNITY_CONTRIBUTION
                100,
                "Community participation bonus"
            );
            await tx2.wait();

            const finalRep = await reputationSystem.getUserReputation(userAddress);
            const finalTier = await reputationSystem.getReputationTier(userAddress);

            console.log("Final Total Score:", finalRep[0].toString());
            console.log("Final Tier:", finalTier);
        }

    } catch (error) {
        console.error("❌ Error:", error.message);

        if (error.message.includes("Not authorized")) {
            console.log("\n🔧 Run this first: npm run check-authorization");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });