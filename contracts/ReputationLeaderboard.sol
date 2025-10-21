// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ReputationSystem.sol";

contract ReputationLeaderboard is Ownable {
    ReputationSystem public reputationSystem;

    struct LeaderboardEntry {
        address user;
        uint256 score;
        uint256 rank;
        string tier;
    }

    struct SeasonStats {
        uint256 seasonId;
        uint256 startTime;
        uint256 endTime;
        address[] topUsers;
        mapping(address => uint256) seasonScores;
        bool isActive;
    }

    mapping(uint256 => SeasonStats) public seasons;
    mapping(address => bool) public isRegistered;
    address[] public registeredUsers;

    uint256 public currentSeason = 1;
    uint256 public constant SEASON_DURATION = 30 days;
    uint256 public leaderboardSize = 100;

    event UserRegistered(address indexed user);
    event SeasonStarted(uint256 indexed seasonId, uint256 startTime);
    event SeasonEnded(uint256 indexed seasonId, address[] topUsers);
    event LeaderboardUpdated(uint256 indexed seasonId);

    constructor(address _reputationSystem) Ownable(msg.sender) {
        reputationSystem = ReputationSystem(_reputationSystem);
        _startNewSeason();
    }

    function registerForLeaderboard() external {
        require(!isRegistered[msg.sender], "Already registered");

        isRegistered[msg.sender] = true;
        registeredUsers.push(msg.sender);

        emit UserRegistered(msg.sender);
    }

    function _startNewSeason() internal {
        SeasonStats storage season = seasons[currentSeason];
        season.seasonId = currentSeason;
        season.startTime = block.timestamp;
        season.endTime = block.timestamp + SEASON_DURATION;
        season.isActive = true;

        emit SeasonStarted(currentSeason, block.timestamp);
    }

    function updateLeaderboard() external {
        require(seasons[currentSeason].isActive, "No active season");

        // Check if season should end
        if (block.timestamp >= seasons[currentSeason].endTime) {
            _endCurrentSeason();
            currentSeason++;
            _startNewSeason();
        }

        emit LeaderboardUpdated(currentSeason);
    }

    function _endCurrentSeason() internal {
        SeasonStats storage season = seasons[currentSeason];
        season.isActive = false;

        // Calculate top users for the season
        address[] memory topUsers = _calculateTopUsers();
        season.topUsers = topUsers;

        emit SeasonEnded(currentSeason, topUsers);
    }

    function _calculateTopUsers() internal view returns (address[] memory) {
        uint256 userCount = registeredUsers.length;
        if (userCount == 0) {
            return new address[](0);
        }

        // Create array of users with scores
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](userCount);

        for (uint256 i = 0; i < userCount; i++) {
            address user = registeredUsers[i];
            uint256 totalScore;
            bool isActive;
            (totalScore, , , , , isActive) = reputationSystem.getUserReputation(
                user
            );

            if (isActive) {
                entries[i] = LeaderboardEntry({
                    user: user,
                    score: totalScore,
                    rank: 0,
                    tier: reputationSystem.getReputationTier(user)
                });
            }
        }

        // Sort entries by score (bubble sort for simplicity)
        for (uint256 i = 0; i < userCount - 1; i++) {
            for (uint256 j = 0; j < userCount - i - 1; j++) {
                if (entries[j].score < entries[j + 1].score) {
                    LeaderboardEntry memory temp = entries[j];
                    entries[j] = entries[j + 1];
                    entries[j + 1] = temp;
                }
            }
        }

        // Return top users
        uint256 topCount = userCount < leaderboardSize
            ? userCount
            : leaderboardSize;
        address[] memory topUsers = new address[](topCount);

        for (uint256 i = 0; i < topCount; i++) {
            topUsers[i] = entries[i].user;
        }

        return topUsers;
    }

    function getLeaderboard(
        uint256 limit
    )
        external
        view
        returns (
            address[] memory users,
            uint256[] memory scores,
            string[] memory tiers
        )
    {
        uint256 userCount = registeredUsers.length;
        if (userCount == 0) {
            return (new address[](0), new uint256[](0), new string[](0));
        }

        uint256 resultCount = userCount < limit ? userCount : limit;

        // Create temporary array for sorting
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](userCount);
        uint256 validEntries = 0;

        for (uint256 i = 0; i < userCount; i++) {
            address user = registeredUsers[i];
            uint256 totalScore;
            bool isActive;
            (totalScore, , , , , isActive) = reputationSystem.getUserReputation(
                user
            );

            if (isActive && totalScore > 0) {
                entries[validEntries] = LeaderboardEntry({
                    user: user,
                    score: totalScore,
                    rank: 0,
                    tier: reputationSystem.getReputationTier(user)
                });
                validEntries++;
            }
        }

        // Sort by score (descending)
        for (uint256 i = 0; i < validEntries - 1; i++) {
            for (uint256 j = 0; j < validEntries - i - 1; j++) {
                if (entries[j].score < entries[j + 1].score) {
                    LeaderboardEntry memory temp = entries[j];
                    entries[j] = entries[j + 1];
                    entries[j + 1] = temp;
                }
            }
        }

        // Prepare return arrays
        uint256 returnCount = validEntries < resultCount
            ? validEntries
            : resultCount;
        users = new address[](returnCount);
        scores = new uint256[](returnCount);
        tiers = new string[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            users[i] = entries[i].user;
            scores[i] = entries[i].score;
            tiers[i] = entries[i].tier;
        }

        return (users, scores, tiers);
    }

    function getUserRank(
        address user
    ) external view returns (uint256 rank, uint256 totalUsers) {
        uint256 userCount = registeredUsers.length;
        uint256 userScore;
        bool userFound = false;
        bool isActive;

        (userScore, , , , , isActive) = reputationSystem.getUserReputation(
            user
        );

        if (!isActive || !isRegistered[user]) {
            return (0, userCount);
        }

        uint256 betterUsers = 0;
        uint256 validUsers = 0;

        for (uint256 i = 0; i < userCount; i++) {
            address otherUser = registeredUsers[i];
            uint256 otherScore;
            bool otherActive;
            (otherScore, , , , , otherActive) = reputationSystem
                .getUserReputation(otherUser);

            if (otherActive) {
                validUsers++;
                if (otherScore > userScore) {
                    betterUsers++;
                }
                if (otherUser == user) {
                    userFound = true;
                }
            }
        }

        if (!userFound) {
            return (0, validUsers);
        }

        return (betterUsers + 1, validUsers);
    }

    function getSeasonInfo(
        uint256 seasonId
    )
        external
        view
        returns (
            uint256 startTime,
            uint256 endTime,
            bool isActive,
            address[] memory topUsers
        )
    {
        SeasonStats storage season = seasons[seasonId];
        return (
            season.startTime,
            season.endTime,
            season.isActive,
            season.topUsers
        );
    }

    function getCurrentSeasonTimeLeft() external view returns (uint256) {
        SeasonStats storage season = seasons[currentSeason];
        if (block.timestamp >= season.endTime) {
            return 0;
        }
        return season.endTime - block.timestamp;
    }
}
