// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ReputationSystem.sol";

/**
 * @title ReputationSocial
 * @dev Social features for the reputation system including endorsements and vouching
 */
contract ReputationSocial {
    ReputationSystem public reputationSystem;
    
    struct Endorsement {
        address endorser;
        address endorsed;
        string category; // "loan", "community", "staking", "general"
        string message;
        uint256 weight; // Based on endorser's reputation
        uint256 timestamp;
        bool active;
    }
    
    struct VouchRequest {
        address voucher;
        address vouchee;
        uint256 amount; // Amount being vouched for
        string purpose; // "loan", "access", "general"
        string message;
        uint256 timestamp;
        uint256 expiresAt;
        bool active;
        bool fulfilled;
    }
    
    struct UserSocialProfile {
        uint256 endorsementsReceived;
        uint256 endorsementsGiven;
        uint256 vouchesReceived;
        uint256 vouchesGiven;
        uint256 socialScore;
        uint256 trustScore;
        bool isVerified;
    }
    
    // Mappings
    mapping(uint256 => Endorsement) public endorsements;
    mapping(uint256 => VouchRequest) public vouchRequests;
    mapping(address => UserSocialProfile) public socialProfiles;
    mapping(address => mapping(address => bool)) public hasEndorsed;
    mapping(address => mapping(address => uint256)) public vouchAmounts;
    mapping(address => uint256[]) public userEndorsements;
    mapping(address => uint256[]) public userVouches;
    
    // Counters
    uint256 public endorsementCounter;
    uint256 public vouchCounter;
    
    // Constants
    uint256 public constant MIN_REPUTATION_TO_ENDORSE = 100;
    uint256 public constant MIN_REPUTATION_TO_VOUCH = 200;
    uint256 public constant MAX_VOUCH_AMOUNT = 10000 * 10**6; // 10,000 USDC
    uint256 public constant VOUCH_DURATION = 30 days;
    uint256 public constant ENDORSEMENT_COOLDOWN = 7 days;
    
    // Events
    event EndorsementGiven(
        uint256 indexed endorsementId,
        address indexed endorser,
        address indexed endorsed,
        string category,
        uint256 weight
    );
    
    event VouchRequested(
        uint256 indexed vouchId,
        address indexed voucher,
        address indexed vouchee,
        uint256 amount,
        string purpose
    );
    
    event VouchFulfilled(
        uint256 indexed vouchId,
        address indexed voucher,
        address indexed vouchee
    );
    
    event SocialScoreUpdated(
        address indexed user,
        uint256 newSocialScore,
        uint256 newTrustScore
    );
    
    constructor(address _reputationSystem) {
        reputationSystem = ReputationSystem(_reputationSystem);
    }
    
    /**
     * @dev Give an endorsement to another user
     */
    function giveEndorsement(
        address _endorsed,
        string memory _category,
        string memory _message
    ) external {
        require(_endorsed != msg.sender, "Cannot endorse yourself");
        require(!hasEndorsed[msg.sender][_endorsed], "Already endorsed this user");
        
        (uint256 endorserReputation,,,,,) = reputationSystem.getUserReputation(msg.sender);
        require(endorserReputation >= MIN_REPUTATION_TO_ENDORSE, "Insufficient reputation to endorse");
        
        // Calculate endorsement weight based on endorser's reputation
        uint256 weight = calculateEndorsementWeight(endorserReputation);
        
        endorsementCounter++;
        endorsements[endorsementCounter] = Endorsement({
            endorser: msg.sender,
            endorsed: _endorsed,
            category: _category,
            message: _message,
            weight: weight,
            timestamp: block.timestamp,
            active: true
        });
        
        hasEndorsed[msg.sender][_endorsed] = true;
        userEndorsements[_endorsed].push(endorsementCounter);
        
        // Update social profiles
        socialProfiles[msg.sender].endorsementsGiven++;
        socialProfiles[_endorsed].endorsementsReceived++;
        
        // Update social scores
        updateSocialScore(_endorsed);
        updateSocialScore(msg.sender);
        
        emit EndorsementGiven(endorsementCounter, msg.sender, _endorsed, _category, weight);
    }
    
    /**
     * @dev Request a vouch from another user
     */
    function requestVouch(
        address _voucher,
        uint256 _amount,
        string memory _purpose,
        string memory _message
    ) external {
        require(_voucher != msg.sender, "Cannot vouch for yourself");
        require(_amount <= MAX_VOUCH_AMOUNT, "Vouch amount too high");
        
        (uint256 voucherReputation,,,,,) = reputationSystem.getUserReputation(_voucher);
        require(voucherReputation >= MIN_REPUTATION_TO_VOUCH, "Voucher has insufficient reputation");
        
        vouchCounter++;
        vouchRequests[vouchCounter] = VouchRequest({
            voucher: _voucher,
            vouchee: msg.sender,
            amount: _amount,
            purpose: _purpose,
            message: _message,
            timestamp: block.timestamp,
            expiresAt: block.timestamp + VOUCH_DURATION,
            active: true,
            fulfilled: false
        });
        
        userVouches[msg.sender].push(vouchCounter);
        
        emit VouchRequested(vouchCounter, _voucher, msg.sender, _amount, _purpose);
    }
    
    /**
     * @dev Accept and fulfill a vouch request
     */
    function fulfillVouch(uint256 _vouchId) external {
        VouchRequest storage vouch = vouchRequests[_vouchId];
        require(vouch.voucher == msg.sender, "Not the voucher");
        require(vouch.active, "Vouch not active");
        require(block.timestamp <= vouch.expiresAt, "Vouch expired");
        require(!vouch.fulfilled, "Vouch already fulfilled");
        
        vouch.fulfilled = true;
        vouchAmounts[msg.sender][vouch.vouchee] += vouch.amount;
        
        // Update social profiles
        socialProfiles[msg.sender].vouchesGiven++;
        socialProfiles[vouch.vouchee].vouchesReceived++;
        
        // Update social scores
        updateSocialScore(vouch.vouchee);
        updateSocialScore(msg.sender);
        
        emit VouchFulfilled(_vouchId, msg.sender, vouch.vouchee);
    }
    
    /**
     * @dev Calculate endorsement weight based on endorser's reputation
     */
    function calculateEndorsementWeight(uint256 _reputation) public pure returns (uint256) {
        if (_reputation >= 800) return 100; // Platinum
        if (_reputation >= 600) return 75;  // Gold
        if (_reputation >= 400) return 50;  // Silver
        if (_reputation >= 200) return 25;  // Bronze
        return 10; // Below Bronze
    }
    
    /**
     * @dev Update user's social score based on endorsements and vouches
     */
    function updateSocialScore(address _user) internal {
        UserSocialProfile storage profile = socialProfiles[_user];
        
        // Calculate social score based on endorsements and vouches
        uint256 endorsementScore = profile.endorsementsReceived * 10;
        uint256 vouchScore = profile.vouchesReceived * 15;
        uint256 givingBonus = (profile.endorsementsGiven + profile.vouchesGiven) * 5;
        
        profile.socialScore = endorsementScore + vouchScore + givingBonus;
        
        // Calculate trust score (weighted by endorsement quality)
        uint256 trustScore = 0;
        uint256[] memory userEndorsementIds = userEndorsements[_user];
        
        for (uint256 i = 0; i < userEndorsementIds.length; i++) {
            Endorsement memory endorsement = endorsements[userEndorsementIds[i]];
            if (endorsement.active) {
                trustScore += endorsement.weight;
            }
        }
        
        profile.trustScore = trustScore;
        
        emit SocialScoreUpdated(_user, profile.socialScore, profile.trustScore);
    }
    
    /**
     * @dev Get user's social profile
     */
    function getUserSocialProfile(address _user) external view returns (
        uint256 endorsementsReceived,
        uint256 endorsementsGiven,
        uint256 vouchesReceived,
        uint256 vouchesGiven,
        uint256 socialScore,
        uint256 trustScore,
        bool isVerified
    ) {
        UserSocialProfile memory profile = socialProfiles[_user];
        return (
            profile.endorsementsReceived,
            profile.endorsementsGiven,
            profile.vouchesReceived,
            profile.vouchesGiven,
            profile.socialScore,
            profile.trustScore,
            profile.isVerified
        );
    }
    
    /**
     * @dev Get user's endorsements
     */
    function getUserEndorsements(address _user) external view returns (uint256[] memory) {
        return userEndorsements[_user];
    }
    
    /**
     * @dev Get user's vouches
     */
    function getUserVouches(address _user) external view returns (uint256[] memory) {
        return userVouches[_user];
    }
    
    /**
     * @dev Get endorsement details
     */
    function getEndorsement(uint256 _endorsementId) external view returns (
        address endorser,
        address endorsed,
        string memory category,
        string memory message,
        uint256 weight,
        uint256 timestamp,
        bool active
    ) {
        Endorsement memory endorsement = endorsements[_endorsementId];
        return (
            endorsement.endorser,
            endorsement.endorsed,
            endorsement.category,
            endorsement.message,
            endorsement.weight,
            endorsement.timestamp,
            endorsement.active
        );
    }
    
    /**
     * @dev Get vouch request details
     */
    function getVouchRequest(uint256 _vouchId) external view returns (
        address voucher,
        address vouchee,
        uint256 amount,
        string memory purpose,
        string memory message,
        uint256 timestamp,
        uint256 expiresAt,
        bool active,
        bool fulfilled
    ) {
        VouchRequest memory vouch = vouchRequests[_vouchId];
        return (
            vouch.voucher,
            vouch.vouchee,
            vouch.amount,
            vouch.purpose,
            vouch.message,
            vouch.timestamp,
            vouch.expiresAt,
            vouch.active,
            vouch.fulfilled
        );
    }
    
    /**
     * @dev Get total vouch amount between two users
     */
    function getVouchAmount(address _voucher, address _vouchee) external view returns (uint256) {
        return vouchAmounts[_voucher][_vouchee];
    }
    
    /**
     * @dev Check if user has endorsed another user
     */
    function hasUserEndorsed(address _endorser, address _endorsed) external view returns (bool) {
        return hasEndorsed[_endorser][_endorsed];
    }
    
    /**
     * @dev Get social influence score (combination of reputation and social scores)
     */
    function getSocialInfluence(address _user) external view returns (uint256) {
        (uint256 reputation,,,,,) = reputationSystem.getUserReputation(_user);
        UserSocialProfile memory profile = socialProfiles[_user];
        
        // Combine reputation (70%) and social score (30%)
        return (reputation * 70 + profile.socialScore * 30) / 100;
    }
    
    /**
     * @dev Admin function to verify users (for special badges)
     */
    function verifyUser(address _user) external {
        // This would typically be restricted to admin/governance
        socialProfiles[_user].isVerified = true;
    }
}