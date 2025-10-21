// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ReputationSystem.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationGatedAccess is Ownable {
    ReputationSystem public reputationSystem;
    
    struct AccessTier {
        uint256 minScore;
        uint256 maxLoanAmount;
        uint256 collateralRatio; // Basis points (10000 = 100%)
        uint256 interestRateDiscount; // Basis points
        bool exclusivePoolAccess;
    }
    
    mapping(string => AccessTier) public accessTiers;
    mapping(address => bool) public whitelistedPools;
    
    event AccessTierUpdated(string tierName, uint256 minScore, uint256 maxLoanAmount);
    event PoolWhitelisted(address indexed pool);
    
    constructor(address _reputationSystem) Ownable(msg.sender) {
        reputationSystem = ReputationSystem(_reputationSystem);
        
        // Initialize default tiers
        _initializeDefaultTiers();
    }
    
    function _initializeDefaultTiers() internal {
        // Bronze tier
        accessTiers["Bronze"] = AccessTier({
            minScore: 200,
            maxLoanAmount: 10000 * 1e18, // 10,000 tokens
            collateralRatio: 15000, // 150%
            interestRateDiscount: 0,
            exclusivePoolAccess: false
        });
        
        // Silver tier
        accessTiers["Silver"] = AccessTier({
            minScore: 400,
            maxLoanAmount: 50000 * 1e18, // 50,000 tokens
            collateralRatio: 13000, // 130%
            interestRateDiscount: 50, // 0.5%
            exclusivePoolAccess: false
        });
        
        // Gold tier
        accessTiers["Gold"] = AccessTier({
            minScore: 600,
            maxLoanAmount: 200000 * 1e18, // 200,000 tokens
            collateralRatio: 11000, // 110%
            interestRateDiscount: 100, // 1%
            exclusivePoolAccess: true
        });
        
        // Platinum tier
        accessTiers["Platinum"] = AccessTier({
            minScore: 800,
            maxLoanAmount: 1000000 * 1e18, // 1,000,000 tokens
            collateralRatio: 10500, // 105%
            interestRateDiscount: 200, // 2%
            exclusivePoolAccess: true
        });
    }
    
    function getUserAccessLevel(address user) external view returns (
        string memory tier,
        uint256 maxLoanAmount,
        uint256 collateralRatio,
        uint256 interestDiscount,
        bool exclusiveAccess
    ) {
        string memory userTier = reputationSystem.getReputationTier(user);
        AccessTier memory access = accessTiers[userTier];
        
        return (
            userTier,
            access.maxLoanAmount,
            access.collateralRatio,
            access.interestRateDiscount,
            access.exclusivePoolAccess
        );
    }
    
    function canAccessPool(address user, address pool) external view returns (bool) {
        if (!whitelistedPools[pool]) {
            return true; // Public pools
        }
        
        string memory userTier = reputationSystem.getReputationTier(user);
        return accessTiers[userTier].exclusivePoolAccess;
    }
    
    function calculateLoanTerms(address user, uint256 requestedAmount) 
        external 
        view 
        returns (
            bool approved,
            uint256 maxAmount,
            uint256 requiredCollateral,
            uint256 interestRate
        ) 
    {
        string memory userTier = reputationSystem.getReputationTier(user);
        AccessTier memory access = accessTiers[userTier];
        
        if (requestedAmount > access.maxLoanAmount) {
            return (false, access.maxLoanAmount, 0, 0);
        }
        
        uint256 baseRate = 500; // 5% base rate
        uint256 discountedRate = baseRate > access.interestRateDiscount ? 
            baseRate - access.interestRateDiscount : 0;
        
        uint256 collateralNeeded = (requestedAmount * access.collateralRatio) / 10000;
        
        return (true, requestedAmount, collateralNeeded, discountedRate);
    }
    
    function updateAccessTier(
        string calldata tierName,
        uint256 minScore,
        uint256 maxLoanAmount,
        uint256 collateralRatio,
        uint256 interestDiscount,
        bool exclusiveAccess
    ) external onlyOwner {
        accessTiers[tierName] = AccessTier({
            minScore: minScore,
            maxLoanAmount: maxLoanAmount,
            collateralRatio: collateralRatio,
            interestRateDiscount: interestDiscount,
            exclusivePoolAccess: exclusiveAccess
        });
        
        emit AccessTierUpdated(tierName, minScore, maxLoanAmount);
    }
    
    function whitelistPool(address pool) external onlyOwner {
        whitelistedPools[pool] = true;
        emit PoolWhitelisted(pool);
    }
}