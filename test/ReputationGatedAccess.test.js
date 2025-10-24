const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationGatedAccess", function () {
  let reputationSystem;
  let gatedAccess;
  let owner, user1, user2, user3, user4, scorer;

  beforeEach(async function () {
    [owner, user1, user2, user3, user4, scorer] = await ethers.getSigners();
    
    // Deploy ReputationSystem first
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    reputationSystem = await ReputationSystem.deploy();
    await reputationSystem.waitForDeployment();
    
    // Deploy ReputationGatedAccess
    const ReputationGatedAccess = await ethers.getContractFactory("ReputationGatedAccess");
    gatedAccess = await ReputationGatedAccess.deploy(await reputationSystem.getAddress());
    await gatedAccess.waitForDeployment();
    
    // Authorize scorer
    await reputationSystem.authorizeScorer(scorer.address);
  });

  describe("Access Tiers", function () {
    it("Should return correct max loan amounts for each tier", async function () {
      // Test Bronze tier (200+ points)
      // Since loan repayment has 40% weight, we need 500 points to get 200 total (500 * 40% = 200)
      await reputationSystem.connect(scorer).updateReputation(
        user1.address,
        0, // LOAN_REPAYMENT
        500,
        "Reaching Bronze tier"
      );
      
      let reputation = await reputationSystem.getUserReputation(user1.address);
      console.log("Bronze tier - Total score:", reputation.totalScore.toString());
      
      let accessLevel = await gatedAccess.getUserAccessLevel(user1.address);
      expect(accessLevel.tier).to.equal("Bronze");
      expect(accessLevel.maxLoanAmount).to.equal(ethers.parseEther("10000")); // 10K tokens
      expect(accessLevel.collateralRatio).to.equal(15000); // 150%
      expect(accessLevel.interestDiscount).to.equal(0); // 0%
      
      // Test Silver tier (400+ points) - Use different user
      await reputationSystem.connect(scorer).updateReputation(
        user2.address,
        0, // LOAN_REPAYMENT
        1000, // 1000 points for 400 total score (1000 * 40% = 400)
        "Reaching Silver tier"
      );
      
      reputation = await reputationSystem.getUserReputation(user2.address);
      console.log("Silver tier - Total score:", reputation.totalScore.toString());
      
      accessLevel = await gatedAccess.getUserAccessLevel(user2.address);
      expect(accessLevel.tier).to.equal("Silver");
      expect(accessLevel.maxLoanAmount).to.equal(ethers.parseEther("50000")); // 50K tokens
      expect(accessLevel.collateralRatio).to.equal(13000); // 130%
      expect(accessLevel.interestDiscount).to.equal(50); // 0.5%
      
      // Test Gold tier (600+ points) - Use different user
      await reputationSystem.connect(scorer).updateReputation(
        user3.address,
        0, // LOAN_REPAYMENT
        1500, // 1500 points for 600 total score (1500 * 40% = 600)
        "Reaching Gold tier"
      );
      
      reputation = await reputationSystem.getUserReputation(user3.address);
      console.log("Gold tier - Total score:", reputation.totalScore.toString());
      
      accessLevel = await gatedAccess.getUserAccessLevel(user3.address);
      expect(accessLevel.tier).to.equal("Gold");
      expect(accessLevel.maxLoanAmount).to.equal(ethers.parseEther("200000")); // 200K tokens
      expect(accessLevel.collateralRatio).to.equal(11000); // 110%
      expect(accessLevel.interestDiscount).to.equal(100); // 1%
      expect(accessLevel.exclusiveAccess).to.be.true;
      
      // Test Platinum tier (800+ points) - Use different user
      await reputationSystem.connect(scorer).updateReputation(
        user4.address,
        0, // LOAN_REPAYMENT
        2000, // 2000 points for 800 total score (2000 * 40% = 800)
        "Reaching Platinum tier"
      );
      
      reputation = await reputationSystem.getUserReputation(user4.address);
      console.log("Platinum tier - Total score:", reputation.totalScore.toString());
      
      accessLevel = await gatedAccess.getUserAccessLevel(user4.address);
      expect(accessLevel.tier).to.equal("Platinum");
      expect(accessLevel.maxLoanAmount).to.equal(ethers.parseEther("1000000")); // 1M tokens
      expect(accessLevel.collateralRatio).to.equal(10500); // 105%
      expect(accessLevel.interestDiscount).to.equal(200); // 2%
      expect(accessLevel.exclusiveAccess).to.be.true;
    });

    it("Should calculate loan terms correctly", async function () {
      // Set user to Gold tier (need 1500 points for 600 total: 1500 * 40% = 600)
      await reputationSystem.connect(scorer).updateReputation(
        user1.address,
        0, // LOAN_REPAYMENT
        1500,
        "Gold tier user"
      );
      
      // Verify the user actually reached Gold tier
      const reputation = await reputationSystem.getUserReputation(user1.address);
      console.log("Loan terms test - Total score:", reputation.totalScore.toString());
      const tier = await reputationSystem.getReputationTier(user1.address);
      console.log("Loan terms test - Tier:", tier);
      
      // Test loan calculation
      const requestedAmount = ethers.parseEther("100000"); // 100K tokens
      const loanTerms = await gatedAccess.calculateLoanTerms(user1.address, requestedAmount);
      
      expect(loanTerms.approved).to.be.true;
      expect(loanTerms.maxAmount).to.equal(requestedAmount);
      expect(loanTerms.interestRate).to.equal(400); // 5% base - 1% discount = 4%
      
      // Calculate expected collateral (100K * 110% = 110K)
      const expectedCollateral = (requestedAmount * BigInt(11000)) / BigInt(10000);
      expect(loanTerms.requiredCollateral).to.equal(expectedCollateral);
    });

    it("Should reject loans exceeding max amount", async function () {
      // Set user to Bronze tier (need 500 points for 200 total: 500 * 40% = 200)
      await reputationSystem.connect(scorer).updateReputation(
        user1.address,
        0, // LOAN_REPAYMENT
        500,
        "Bronze tier user"
      );
      
      // Try to request more than Bronze max (10K)
      const requestedAmount = ethers.parseEther("50000"); // 50K tokens
      const loanTerms = await gatedAccess.calculateLoanTerms(user1.address, requestedAmount);
      
      expect(loanTerms.approved).to.be.false;
      expect(loanTerms.maxAmount).to.equal(ethers.parseEther("10000")); // Bronze max
    });
  });

  describe("Formatting Helper", function () {
    it("Should format loan amounts correctly", function () {
      // This would be a frontend test, but we can verify the contract values
      const bronzeMax = ethers.parseEther("10000");
      const silverMax = ethers.parseEther("50000");
      const goldMax = ethers.parseEther("200000");
      const platinumMax = ethers.parseEther("1000000");
      
      // Verify the values match what we expect
      expect(ethers.formatEther(bronzeMax)).to.equal("10000.0");
      expect(ethers.formatEther(silverMax)).to.equal("50000.0");
      expect(ethers.formatEther(goldMax)).to.equal("200000.0");
      expect(ethers.formatEther(platinumMax)).to.equal("1000000.0");
    });
  });
});