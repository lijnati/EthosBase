const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DeFi Reputation System to Base Chain...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

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

  // For demo purposes, we'll use mock ERC20 tokens
  // In production, you'd use real tokens like USDC, WETH, etc.
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

  // Authorize the lending pool to update reputation scores
  console.log("\n5. Setting up permissions...");
  await reputationSystem.authorizeScorer(await lendingPool.getAddress());
  console.log("Lending pool authorized as reputation scorer");

  // Mint some tokens for testing
  console.log("\n6. Minting test tokens...");
  await lendingToken.mint(deployer.address, ethers.parseUnits("1000000", 6)); // 1M USDC
  await collateralToken.mint(deployer.address, ethers.parseEther("1000")); // 1000 WETH
  console.log("Test tokens minted to deployer");

  console.log("\n✅ Deployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("==================");
  console.log("ReputationSystem:", await reputationSystem.getAddress());
  console.log("ReputationGatedAccess:", await accessControl.getAddress());
  console.log("ReputationLendingPool:", await lendingPool.getAddress());
  console.log("USDC Token:", await lendingToken.getAddress());
  console.log("WETH Token:", await collateralToken.getAddress());

  console.log("\nNext Steps:");
  console.log("==========");
  console.log("1. Verify contracts on BaseScan");
  console.log("2. Set up frontend integration");
  console.log("3. Configure additional reputation scorers");
  console.log("4. Add more DeFi protocols to the ecosystem");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });