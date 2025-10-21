// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ReputationSystem is Ownable, ReentrancyGuard {
    struct UserReputation {
        uint256 totalScore;
        uint256 loanRepaymentScore;
        uint256 stakingScore;
        uint256 communityScore;
        uint256 flashLoanScore;
        uint256 lastUpdated;
        bool isActive;
    }

    struct ReputationAction {
        ActionType actionType;
        int256 scoreChange;
        uint256 timestamp;
        string description;
    }

    enum ActionType {
        LOAN_REPAYMENT,
        LOAN_DEFAULT,
        STAKING_REWARD,
        EARLY_UNSTAKING,
        FLASH_LOAN_ABUSE,
        COMMUNITY_CONTRIBUTION,
        GOVERNANCE_PARTICIPATION
    }

    mapping(address => UserReputation) public userReputations;
    mapping(address => ReputationAction[]) public userActions;
    mapping(address => bool) public authorizedScorers;
    
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant DECAY_PERIOD = 30 days;
    uint256 public constant DECAY_RATE = 5; // 5% decay per period

    event ReputationUpdated(
        address indexed user,
        ActionType actionType,
        int256 scoreChange,
        uint256 newTotalScore
    );
    
    event ScorerAuthorized(address indexed scorer);
    event ScorerRevoked(address indexed scorer);

    constructor() Ownable(msg.sender) {}

    modifier onlyAuthorizedScorer() {
        require(authorizedScorers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    function authorizeScorer(address scorer) external onlyOwner {
        authorizedScorers[scorer] = true;
        emit ScorerAuthorized(scorer);
    }

    function revokeScorer(address scorer) external onlyOwner {
        authorizedScorers[scorer] = false;
        emit ScorerRevoked(scorer);
    }    
function updateReputation(
        address user,
        ActionType actionType,
        int256 scoreChange,
        string calldata description
    ) external onlyAuthorizedScorer nonReentrant {
        UserReputation storage reputation = userReputations[user];
        
        // Apply time decay if needed
        _applyTimeDecay(user);
        
        // Update specific category score
        _updateCategoryScore(user, actionType, scoreChange);
        
        // Calculate new total score
        uint256 newTotal = _calculateTotalScore(user);
        reputation.totalScore = newTotal;
        reputation.lastUpdated = block.timestamp;
        reputation.isActive = true;
        
        // Record the action
        userActions[user].push(ReputationAction({
            actionType: actionType,
            scoreChange: scoreChange,
            timestamp: block.timestamp,
            description: description
        }));
        
        emit ReputationUpdated(user, actionType, scoreChange, newTotal);
    }

    function _updateCategoryScore(
        address user,
        ActionType actionType,
        int256 scoreChange
    ) internal {
        UserReputation storage reputation = userReputations[user];
        
        if (actionType == ActionType.LOAN_REPAYMENT || actionType == ActionType.LOAN_DEFAULT) {
            reputation.loanRepaymentScore = _applyScoreChange(
                reputation.loanRepaymentScore, 
                scoreChange
            );
        } else if (actionType == ActionType.STAKING_REWARD || actionType == ActionType.EARLY_UNSTAKING) {
            reputation.stakingScore = _applyScoreChange(
                reputation.stakingScore, 
                scoreChange
            );
        } else if (actionType == ActionType.FLASH_LOAN_ABUSE) {
            reputation.flashLoanScore = _applyScoreChange(
                reputation.flashLoanScore, 
                scoreChange
            );
        } else if (actionType == ActionType.COMMUNITY_CONTRIBUTION || actionType == ActionType.GOVERNANCE_PARTICIPATION) {
            reputation.communityScore = _applyScoreChange(
                reputation.communityScore, 
                scoreChange
            );
        }
    }

    function _applyScoreChange(uint256 currentScore, int256 change) internal pure returns (uint256) {
        if (change >= 0) {
            uint256 newScore = currentScore + uint256(change);
            return newScore > MAX_SCORE ? MAX_SCORE : newScore;
        } else {
            uint256 decrease = uint256(-change);
            return currentScore > decrease ? currentScore - decrease : MIN_SCORE;
        }
    }

    function _calculateTotalScore(address user) internal view returns (uint256) {
        UserReputation storage reputation = userReputations[user];
        
        // Weighted average of different categories
        uint256 weightedScore = (
            reputation.loanRepaymentScore * 40 +  // 40% weight
            reputation.stakingScore * 25 +        // 25% weight
            reputation.communityScore * 20 +      // 20% weight
            reputation.flashLoanScore * 15        // 15% weight
        ) / 100;
        
        return weightedScore > MAX_SCORE ? MAX_SCORE : weightedScore;
    }

    function _applyTimeDecay(address user) internal {
        UserReputation storage reputation = userReputations[user];
        
        if (reputation.lastUpdated == 0) return;
        
        uint256 timePassed = block.timestamp - reputation.lastUpdated;
        uint256 decayPeriods = timePassed / DECAY_PERIOD;
        
        if (decayPeriods > 0) {
            uint256 decayAmount = (reputation.totalScore * DECAY_RATE * decayPeriods) / 100;
            reputation.totalScore = reputation.totalScore > decayAmount ? 
                reputation.totalScore - decayAmount : MIN_SCORE;
        }
    }

    function getUserReputation(address user) external view returns (
        uint256 totalScore,
        uint256 loanScore,
        uint256 stakingScore,
        uint256 communityScore,
        uint256 flashLoanScore,
        bool isActive
    ) {
        UserReputation storage reputation = userReputations[user];
        return (
            reputation.totalScore,
            reputation.loanRepaymentScore,
            reputation.stakingScore,
            reputation.communityScore,
            reputation.flashLoanScore,
            reputation.isActive
        );
    }

    function getUserActions(address user) external view returns (ReputationAction[] memory) {
        return userActions[user];
    }

    function getReputationTier(address user) external view returns (string memory) {
        uint256 score = userReputations[user].totalScore;
        
        if (score >= 800) return "Platinum";
        if (score >= 600) return "Gold";
        if (score >= 400) return "Silver";
        if (score >= 200) return "Bronze";
        return "Unrated";
    }
}