const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking reputation system authorization...");

    try {
        const [deployer] = await ethers.getSigners();
        const REPUTATION_ADDRESS = "0x4fD8693aEAF67F96D8077961847344FF485e659b";
        const LENDING_POOL_ADDRESS = "0xD1abe9A4288A7880AD75b6b353c4EA65B220adC7";

        const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
        const reputationSystem = ReputationSystem.attach(REPUTATION_ADDRESS);

        console.log("Deployer address:", deployer.address);
        console.log("Lending pool address:", LENDING_POOL_ADDRESS);

        // Check owner
        const owner = await reputationSystem.owner();
        console.log("Contract owner:", owner);
        console.log("Is deployer the owner?", owner.toLowerCase() === deployer.address.toLowerCase());

        // Check if deployer is authorized scorer
        const isDeployerAuthorized = await reputationSystem.authorizedScorers(deployer.address);
        console.log("Is deployer authorized scorer?", isDeployerAuthorized);

        // Check if lending pool is authorized
        const isLendingPoolAuthorized = await reputationSystem.authorizedScorers(LENDING_POOL_ADDRESS);
        console.log("Is lending pool authorized scorer?", isLendingPoolAuthorized);

        if (!isDeployerAuthorized && owner.toLowerCase() === deployer.address.toLowerCase()) {
            console.log("\n🔧 Solution: Authorize the deployer as a scorer");
            console.log("Running authorization...");

            const tx = await reputationSystem.authorizeScorer(deployer.address);
            await tx.wait();
            console.log("✅ Deployer is now authorized!");

            console.log("\nNow you can run: npm run boost-reputation");
        } else if (isDeployerAuthorized) {
            console.log("\n✅ Deployer is already authorized. The boost script should work.");
        } else {
            console.log("\n❌ Deployer is not the owner and not authorized.");
            console.log("Only the contract owner or authorized scorers can update reputation.");
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