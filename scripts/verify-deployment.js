const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying deployed contracts on Base Sepolia...\n");

    // Contract addresses
    const addresses = {
        reputationSystem: "0x4fD8693aEAF67F96D8077961847344FF485e659b",
        accessControl: "0x32f848F3677738d73faC20a0bD5A465e0da6e731",
        lendingPool: "0xD1abe9A4288A7880AD75b6b353c4EA65B220adC7",
        usdcToken: "0x71C7b5ba984A5f1011c1196a56a8130A8DB40e5E",
        wethToken: "0x30C13770b937F38F77371Bef884Af08a721880636"
    };

    const [signer] = await ethers.getSigners();

    try {
        // Test ReputationSystem
        console.log("1. Testing ReputationSystem...");
        const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
        const reputationSystem = ReputationSystem.attach(addresses.reputationSystem);

        const owner = await reputationSystem.owner();
        console.log("   Owner:", owner);
        console.log("   ✅ ReputationSystem working");

        // Test ReputationGatedAccess
        console.log("\n2. Testing ReputationGatedAccess...");
        const ReputationGatedAccess = await ethers.getContractFactory("ReputationGatedAccess");
        const accessControl = ReputationGatedAccess.attach(addresses.accessControl);

        const bronzeTier = await accessControl.accessTiers("Bronze");
        console.log("   Bronze tier max loan:", ethers.formatUnits(bronzeTier.maxLoanAmount, 18));
        console.log("   ✅ ReputationGatedAccess working");

        // Test tokens
        console.log("\n3. Testing Mock Tokens...");
        const MockERC20 = await ethers.getContractFactory("MockERC20");

        const usdcToken = MockERC20.attach(addresses.usdcToken);
        const usdcName = await usdcToken.name();
        const usdcDecimals = await usdcToken.decimals();
        console.log("   USDC:", usdcName, "Decimals:", usdcDecimals.toString());

        const wethToken = MockERC20.attach(addresses.wethToken);
        const wethName = await wethToken.name();
        const wethDecimals = await wethToken.decimals();
        console.log("   WETH:", wethName, "Decimals:", wethDecimals.toString());
        console.log("   ✅ Tokens working");

        // Test LendingPool
        console.log("\n4. Testing ReputationLendingPool...");
        const ReputationLendingPool = await ethers.getContractFactory("ReputationLendingPool");
        const lendingPool = ReputationLendingPool.attach(addresses.lendingPool);

        const poolOwner = await lendingPool.owner();
        const totalDeposits = await lendingPool.totalDeposits();
        console.log("   Pool owner:", poolOwner);
        console.log("   Total deposits:", ethers.formatUnits(totalDeposits, 6), "USDC");
        console.log("   ✅ ReputationLendingPool working");

        // Test reputation functionality
        console.log("\n5. Testing reputation functionality...");
        const userRep = await reputationSystem.getUserReputation(signer.address);
        const userTier = await reputationSystem.getReputationTier(signer.address);
        console.log("   Your reputation score:", userRep[0].toString());
        console.log("   Your tier:", userTier);

        const accessLevel = await accessControl.getUserAccessLevel(signer.address);
        console.log("   Max loan amount:", ethers.formatUnits(accessLevel[1], 6), "USDC");
        console.log("   Collateral ratio:", (accessLevel[2] / 100).toFixed(1) + "%");
        console.log("   ✅ Reputation system working");

        console.log("\n🎉 All contracts verified and working!");

        console.log("\n📋 Contract Explorer Links:");
        console.log("============================");
        console.log("ReputationSystem:", `https://sepolia.basescan.org/address/${addresses.reputationSystem}`);
        console.log("ReputationGatedAccess:", `https://sepolia.basescan.org/address/${addresses.accessControl}`);
        console.log("ReputationLendingPool:", `https://sepolia.basescan.org/address/${addresses.lendingPool}`);
        console.log("USDC Token:", `https://sepolia.basescan.org/address/${addresses.usdcToken}`);
        console.log("WETH Token:", `https://sepolia.basescan.org/address/${addresses.wethToken}`);

        console.log("\n🚀 Next Steps:");
        console.log("===============");
        console.log("1. Run: npm run mint-tokens (to get test tokens)");
        console.log("2. Open frontend/index.html in browser");
        console.log("3. Connect MetaMask to Base Sepolia");
        console.log("4. Test the reputation system!");

    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });