const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DeFi Reputation System locally...");

  // Get deployer account (Hardhat provides funded accounts locally)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  try {
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Deploy ReputationSystem
    console.log("\n1. Deploying ReputationSystem...");
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const reputationSystem = await ReputationSystem.deploy();
    await reputationSystem.waitForDeployment();
    console.log("ReputationSystem deployed to:", await reputationSystem.getAddress());

    // Deploy ReputationGatedAccess
    console.log("\n2. Deploying ReputationGatedAccess...");
    const ReputationGatedAccess = await ethers.getContractFactory("ReputationGatedAccess");
    const accessControl = await ReputationGatedAccess.deploy(await reputationSystem.getAddress());
    await accessControl.waitForDeployment();
    console.log("ReputationGatedAccess deployed to:", await accessControl.getAddress());

    // Deploy Mock Tokens
    console.log("\n3. Deploying Mock Tokens...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");

    const lendingToken = await MockERC20.deploy("USD Coin", "USDC", 6);
    await lendingToken.waitForDeployment();
    console.log("Lending Token (USDC) deployed to:", await lendingToken.getAddress());

    const collateralToken = await MockERC20.deploy("Wrapped Ether", "WETH", 18);
    await collateralToken.waitForDeployment();
    console.log("Collateral Token (WETH) deployed to:", await collateralToken.getAddress());

    // Deploy ReputationLendingPool
    console.log("\n4. Deploying ReputationLendingPool...");
    const ReputationLendingPool = await ethers.getContractFactory("ReputationLendingPool");
    const lendingPool = await ReputationLendingPool.deploy(
      await reputationSystem.getAddress(),
      await accessControl.getAddress(),
      await lendingToken.getAddress(),
      await collateralToken.getAddress()
    );
    await lendingPool.waitForDeployment();
    console.log("ReputationLendingPool deployed to:", await lendingPool.getAddress());

    // Setup permissions
    console.log("\n5. Setting up permissions...");
    await reputationSystem.authorizeScorer(await lendingPool.getAddress());
    console.log("Lending pool authorized as reputation scorer");

    // Mint test tokens
    console.log("\n6. Minting test tokens...");
    await lendingToken.mint(deployer.address, ethers.parseUnits("1000000", 6)); // 1M USDC
    await collateralToken.mint(deployer.address, ethers.parseEther("1000")); // 1000 WETH
    console.log("Test tokens minted to deployer");

    // Test the system
    console.log("\n7. Testing the system...");

    // Check initial reputation
    const initialRep = await reputationSystem.getUserReputation(deployer.address);
    console.log("Initial reputation:", initialRep[0].toString());

    // Update reputation (simulate a good loan repayment)
    await reputationSystem.updateReputation(
      deployer.address,
      0, // LOAN_REPAYMENT
      100,
      "Test loan repayment"
    );

    const updatedRep = await reputationSystem.getUserReputation(deployer.address);
    console.log("Updated reputation:", updatedRep[0].toString());

    const tier = await reputationSystem.getReputationTier(deployer.address);
    console.log("Reputation tier:", tier);

    console.log("\n✅ Local deployment and testing completed successfully!");
    console.log("\nContract Addresses (Local):");
    console.log("==========================");
    console.log("ReputationSystem:", await reputationSystem.getAddress());
    console.log("ReputationGatedAccess:", await accessControl.getAddress());
    console.log("ReputationLendingPool:", await lendingPool.getAddress());
    console.log("USDC Token:", await lendingToken.getAddress());
    console.log("WETH Token:", await collateralToken.getAddress());

    // Save addresses for frontend
    const addresses = {
      reputationSystem: await reputationSystem.getAddress(),
      accessControl: await accessControl.getAddress(),
      lendingPool: await lendingPool.getAddress(),
      usdcToken: await lendingToken.getAddress(),
      wethToken: await collateralToken.getAddress()
    };

    console.log("\n📋 Copy these addresses to your frontend:");
    console.log(JSON.stringify(addresses, null, 2));

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });