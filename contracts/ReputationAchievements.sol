// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ReputationSystem.sol";

contract ReputationAchievements is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    ReputationSystem public reputationSystem;
    
    struct Achievement {
        uint256 id;
        string name;
        string description;
        string category;
        uint256 requiredScore;
        uint256 requiredActions;
        AchievementType achievementType;
        bool isActive;
        string metadataURI;
        uint256 rewardPoints;
    }
    
    enum AchievementType {
        SCORE_MILESTONE,
        LOAN_MILESTONE,
        STAKING_MILESTONE,
        COMMUNITY_MILESTONE,
        STREAK_MILESTONE,
        SPECIAL_EVENT
    }
    
    struct UserAchievement {
        uint256 achievementId;
        uint256 unlockedAt;
        uint256 tokenId;
        bool claimed;
    }
    
    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public userAchievements;
    mapping(address => mapping(uint256 => bool)) public hasAchievement;
    mapping(uint256 => address) public achievementOwner;
    
    uint256 public nextAchievementId = 1;
    uint256 public nextTokenId = 1;
    
    event AchievementCreated(uint256 indexed achievementId, string name, AchievementType achievementType);
    event AchievementUnlocked(address indexed user, uint256 indexed achievementId, uint256 tokenId);
    event AchievementClaimed(address indexed user, uint256 indexed achievementId, uint256 tokenId);
    
    constructor(address _reputationSystem) 
        ERC721("EthosBase Achievements", "ETHOS") 
        Ownable(msg.sender) 
    {
        reputationSystem = ReputationSystem(_reputationSystem);
        _initializeDefaultAchievements();
    }
    
    function _initializeDefaultAchievements() internal {
        // Score Milestones
        createAchievement(
            "First Steps",
            "Reach your first 100 reputation points",
            "Milestone",
            100,
            0,
            AchievementType.SCORE_MILESTONE,
            "ipfs://QmFirstSteps",
            25
        );
        
        createAchievement(
            "Bronze Achiever",
            "Reach Bronze tier (200+ points)",
            "Milestone",
            200,
            0,
            AchievementType.SCORE_MILESTONE,
            "ipfs://QmBronzeAchiever",
            50
        );
        
        createAchievement(
            "Silver Star",
            "Reach Silver tier (400+ points)",
            "Milestone",
            400,
            0,
            AchievementType.SCORE_MILESTONE,
            "ipfs://QmSilverStar",
            100
        );
        
        createAchievement(
            "Golden Legend",
            "Reach Gold tier (600+ points)",
            "Milestone",
            600,
            0,
            AchievementType.SCORE_MILESTONE,
            "ipfs://QmGoldenLegend",
            200
        );
        
        createAchievement(
            "Platinum Elite",
            "Reach Platinum tier (800+ points)",
            "Milestone",
            800,
            0,
            AchievementType.SCORE_MILESTONE,
            "ipfs://QmPlatinumElite",
            500
        );
        
        // Loan Milestones
        createAchievement(
            "First Borrower",
            "Take your first loan",
            "Loan",
            0,
            1,
            AchievementType.LOAN_MILESTONE,
            "ipfs://QmFirstBorrower",
            30
        );
        
        createAchievement(
            "Reliable Borrower",
            "Repay 5 loans on time",
            "Loan",
            0,
            5,
            AchievementType.LOAN_MILESTONE,
            "ipfs://QmReliableBorrower",
            100
        );
        
        createAchievement(
            "Perfect Record",
            "Repay 10 loans on time",
            "Loan",
            0,
            10,
            AchievementType.LOAN_MILESTONE,
            "ipfs://QmPerfectRecord",
            250
        );
        
        // Community Milestones
        createAchievement(
            "Community Member",
            "Make your first community contribution",
            "Community",
            0,
            1,
            AchievementType.COMMUNITY_MILESTONE,
            "ipfs://QmCommunityMember",
            40
        );
        
        createAchievement(
            "Governance Participant",
            "Participate in 3 governance votes",
            "Community",
            0,
            3,
            AchievementType.COMMUNITY_MILESTONE,
            "ipfs://QmGovernanceParticipant",
            80
        );
    }
    
    function createAchievement(
        string memory name,
        string memory description,
        string memory category,
        uint256 requiredScore,
        uint256 requiredActions,
        AchievementType achievementType,
        string memory metadataURI,
        uint256 rewardPoints
    ) public onlyOwner {
        achievements[nextAchievementId] = Achievement({
            id: nextAchievementId,
            name: name,
            description: description,
            category: category,
            requiredScore: requiredScore,
            requiredActions: requiredActions,
            achievementType: achievementType,
            isActive: true,
            metadataURI: metadataURI,
            rewardPoints: rewardPoints
        });
        
        emit AchievementCreated(nextAchievementId, name, achievementType);
        nextAchievementId++;
    }
    
    function checkAndUnlockAchievements(address user) external nonReentrant {
        (uint256 totalScore, uint256 loanScore, uint256 stakingScore, uint256 communityScore, , bool isActive) = 
            reputationSystem.getUserReputation(user);
        
        if (!isActive) return;
        
        // Check all achievements
        for (uint256 i = 1; i < nextAchievementId; i++) {
            Achievement storage achievement = achievements[i];
            
            if (!achievement.isActive || hasAchievement[user][i]) {
                continue;
            }
            
            bool shouldUnlock = false;
            
            if (achievement.achievementType == AchievementType.SCORE_MILESTONE) {
                shouldUnlock = totalScore >= achievement.requiredScore;
            } else if (achievement.achievementType == AchievementType.LOAN_MILESTONE) {
                // This would need integration with loan tracking
                // For now, we'll use a simplified check
                shouldUnlock = loanScore >= achievement.requiredActions * 50;
            } else if (achievement.achievementType == AchievementType.COMMUNITY_MILESTONE) {
                shouldUnlock = communityScore >= achievement.requiredActions * 40;
            }
            
            if (shouldUnlock) {
                _unlockAchievement(user, i);
            }
        }
    }
    
    function _unlockAchievement(address user, uint256 achievementId) internal {
        hasAchievement[user][achievementId] = true;
        userAchievements[user].push(achievementId);
        
        // Mint NFT
        uint256 tokenId = nextTokenId;
        _safeMint(user, tokenId);
        _setTokenURI(tokenId, achievements[achievementId].metadataURI);
        
        achievementOwner[tokenId] = user;
        nextTokenId++;
        
        emit AchievementUnlocked(user, achievementId, tokenId);
        
        // Award bonus reputation points
        if (achievements[achievementId].rewardPoints > 0) {
            // This would integrate with the reputation system to award bonus points
            // For now, we emit an event that can be picked up by the reputation system
        }
    }
    
    function getUserAchievements(address user) external view returns (uint256[] memory) {
        return userAchievements[user];
    }
    
    function getAchievementDetails(uint256 achievementId) external view returns (
        string memory name,
        string memory description,
        string memory category,
        uint256 requiredScore,
        uint256 requiredActions,
        AchievementType achievementType,
        uint256 rewardPoints
    ) {
        Achievement storage achievement = achievements[achievementId];
        return (
            achievement.name,
            achievement.description,
            achievement.category,
            achievement.requiredScore,
            achievement.requiredActions,
            achievement.achievementType,
            achievement.rewardPoints
        );
    }
    
    function getUserAchievementCount(address user) external view returns (uint256) {
        return userAchievements[user].length;
    }
    
    function getAllAchievements() external view returns (uint256[] memory) {
        uint256[] memory allAchievements = new uint256[](nextAchievementId - 1);
        for (uint256 i = 1; i < nextAchievementId; i++) {
            allAchievements[i - 1] = i;
        }
        return allAchievements;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}