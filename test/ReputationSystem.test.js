const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationSystem", function () {
  let reputationSystem;
  let owner, user1, user2, scorer;

  beforeEach(async function () {
    [owner, user1, user2, scorer] = await ethers.getSigners();
    
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    reputationSystem = await ReputationSystem.deploy();
    await reputationSystem.waitForDeployment();
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize scorers", async function () {
      await reputationSystem.authorizeScorer(scorer.address);
      expect(await reputationSystem.authorizedScorers(scorer.address)).to.be.true;
    });

    it("Should emit ScorerAuthorized event", async function () {
      await expect(reputationSystem.authorizeScorer(scorer.address))
        .to.emit(reputationSystem, "ScorerAuthorized")
        .withArgs(scorer.address);
    });
  });

  describe("Reputation Updates", function () {
    beforeEach(async function () {
      await reputationSystem.authorizeScorer(scorer.address);
    });

    it("Should update reputation for loan repayment", async function () {
      await reputationSystem.connect(scorer).updateReputation(
        user1.address,
        0, // LOAN_REPAYMENT
        50,
        "On-time repayment"
      );

      const reputation = await reputationSystem.getUserReputation(user1.address);
      expect(reputation.loanScore).to.equal(50);
      expect(reputation.isActive).to.be.true;
    });

    it("Should calculate weighted total score correctly", async function () {
      // Add scores to different categories
      await reputationSystem.connect(scorer).updateReputation(
        user1.address,
        0, // LOAN_REPAYMENT
        100,
        "Loan repayment"
      );
      
      await reputationSystem.connect(scorer).updateReputation(
        user1.address,
        2, // STAKING_REWARD
        80,
        "Staking reward"
      );

      const reputation = await reputationSystem.getUserReputation(user1.address);
      // Expected: (100 * 40 + 80 * 25) / 100 = 60
      expect(reputation.totalScore).to.equal(60);
    });

    it("Should return correct reputation tier", async function () {
      await reputationSystem.connect(scorer).updateReputation(
        user1.address,
        0, // LOAN_REPAYMENT
        500,
        "High score"
      );

      const tier = await reputationSystem.getReputationTier(user1.address);
      expect(tier).to.equal("Silver");
    });

    it("Should prevent unauthorized updates", async function () {
      await expect(
        reputationSystem.connect(user1).updateReputation(
          user2.address,
          0,
          50,
          "Unauthorized"
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Score Limits", function () {
    beforeEach(async function () {
      await reputationSystem.authorizeScorer(scorer.address);
    });

    it("Should cap scores at maximum", async function () {
      await reputationSystem.connect(scorer).updateReputation(
        user1.address,
        0, // LOAN_REPAYMENT
        1500, // Above max
        "High score"
      );

      const reputation = await reputationSystem.getUserReputation(user1.address);
      expect(reputation.loanScore).to.equal(1000); // Capped at MAX_SCORE
    });

    it("Should floor scores at minimum", async function () {
      await reputationSystem.connect(scorer).updateReputation(
        user1.address,
        0, // LOAN_REPAYMENT
        -100, // Below min
        "Negative score"
      );

      const reputation = await reputationSystem.getUserReputation(user1.address);
      expect(reputation.loanScore).to.equal(0); // Floored at MIN_SCORE
    });
  });
});