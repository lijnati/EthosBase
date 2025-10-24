import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const ACHIEVEMENT_CONTRACT_ADDRESS = '0x6EA9a3A105168854D1c343150165B0831165e8b9'
const LEADERBOARD_CONTRACT_ADDRESS = '0x1Fa4eFF10AEd3e1b54701e472E3492fD148610aD'

const ACHIEVEMENTS_ABI = [
  'function getUserAchievements(address user) view returns (uint256[])',
  'function getAchievementDetails(uint256 achievementId) view returns (string, string, string, uint256, uint256, uint8, uint256)',
  'function getAllAchievements() view returns (uint256[])',
  'function hasAchievement(address user, uint256 achievementId) view returns (bool)',
  'function checkAndUnlockAchievements(address user)',
  'function mintAchievement(address to, uint256 achievementId)',
  'function getAchievementMetadata(uint256 achievementId) view returns (string)'
]

const LEADERBOARD_ABI = [
  'function getTopUsers(uint256 limit) view returns (address[], uint256[])',
  'function getUserRank(address user) view returns (uint256)',
  'function getTotalUsers() view returns (uint256)',
  'function updateUserScore(address user, uint256 newScore)'
]

// Mock achievements for demonstration
const MOCK_ACHIEVEMENTS = [
  {
    id: 1,
    name: 'First Steps',
    description: 'Complete your first loan repayment',
    category: 'Lending',
    icon: '🎯',
    rarity: 'Common',
    requiredScore: 50,
    rewardPoints: 25,
    unlocked: true,
    progress: 100
  },
  {
    id: 2,
    name: 'Reliable Borrower',
    description: 'Maintain perfect repayment history for 5 loans',
    category: 'Lending',
    icon: '🏆',
    rarity: 'Rare',
    requiredScore: 200,
    rewardPoints: 100,
    unlocked: true,
    progress: 100
  },
  {
    id: 3,
    name: 'Staking Pioneer',
    description: 'Stake tokens for 30 consecutive days',
    category: 'Staking',
    icon: '⚡',
    rarity: 'Epic',
    requiredScore: 300,
    rewardPoints: 150,
    unlocked: false,
    progress: 65
  },
  {
    id: 4,
    name: 'Community Leader',
    description: 'Refer 10 new users to the platform',
    category: 'Community',
    icon: '👑',
    rarity: 'Legendary',
    requiredScore: 500,
    rewardPoints: 250,
    unlocked: false,
    progress: 30
  },
  {
    id: 5,
    name: 'DeFi Master',
    description: 'Reach Platinum tier reputation',
    category: 'Milestone',
    icon: '💎',
    rarity: 'Mythic',
    requiredScore: 800,
    rewardPoints: 500,
    unlocked: false,
    progress: 15
  }
]

const MOCK_LEADERBOARD = [
  { address: '0x1234...5678', score: 950, rank: 1, tier: 'Platinum', change: '+5' },
  { address: '0x2345...6789', score: 875, rank: 2, tier: 'Platinum', change: '-1' },
  { address: '0x3456...7890', score: 820, rank: 3, tier: 'Platinum', change: '+2' },
  { address: '0x4567...8901', score: 750, rank: 4, tier: 'Gold', change: '0' },
  { address: '0x5678...9012', score: 680, rank: 5, tier: 'Gold', change: '+3' },
  { address: '0x6789...0123', score: 620, rank: 6, tier: 'Gold', change: '-2' },
  { address: '0x7890...1234', score: 580, rank: 7, tier: 'Silver', change: '+1' },
  { address: '0x8901...2345', score: 520, rank: 8, tier: 'Silver', change: '+4' },
  { address: '0x9012...3456', score: 480, rank: 9, tier: 'Silver', change: '-1' },
  { address: '0x0123...4567', score: 420, rank: 10, tier: 'Silver', change: '0' }
]

export function AchievementSystem({ account, reputation }) {
  const [activeTab, setActiveTab] = useState('achievements')
  const [achievements, setAchievements] = useState(MOCK_ACHIEVEMENTS)
  const [leaderboard, setLeaderboard] = useState(MOCK_LEADERBOARD)
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (account && reputation) {
      // Simulate finding user rank
      const currentScore = reputation.total || 0
      const rank = MOCK_LEADERBOARD.findIndex(user => currentScore >= user.score) + 1
      setUserRank(rank || MOCK_LEADERBOARD.length + 1)
    }
  }, [account, reputation])

  const getRarityColor = (rarity) => {
    const colors = {
      'Common': '#6B7280',
      'Rare': '#3B82F6',
      'Epic': '#8B5CF6',
      'Legendary': '#F59E0B',
      'Mythic': '#EF4444'
    }
    return colors[rarity] || colors['Common']
  }

  const getRarityGradient = (rarity) => {
    const gradients = {
      'Common': 'linear-gradient(135deg, #6B7280, #4B5563)',
      'Rare': 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      'Epic': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
      'Legendary': 'linear-gradient(135deg, #F59E0B, #D97706)',
      'Mythic': 'linear-gradient(135deg, #EF4444, #DC2626)'
    }
    return gradients[rarity] || gradients['Common']
  }

  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'achievements') return true
    if (activeTab === 'unlocked') return achievement.unlocked
    if (activeTab === 'locked') return !achievement.unlocked
    return true
  })

  return (
    <div className="achievement-system-modern">
      <div className="achievement-header">
        <div className="header-content">
          <h2 className="section-title">🏆 Achievements & Leaderboard</h2>
          <div className="user-rank-display">
            {userRank && (
              <div className="rank-badge">
                <span className="rank-icon">📊</span>
                <span className="rank-text">Rank #{userRank}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <span className="tab-icon">🎯</span>
            All Achievements
          </button>
          <button 
            className={`tab-btn ${activeTab === 'unlocked' ? 'active' : ''}`}
            onClick={() => setActiveTab('unlocked')}
          >
            <span className="tab-icon">✅</span>
            Unlocked ({achievements.filter(a => a.unlocked).length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'locked' ? 'active' : ''}`}
            onClick={() => setActiveTab('locked')}
          >
            <span className="tab-icon">🔒</span>
            Locked ({achievements.filter(a => !a.unlocked).length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <span className="tab-icon">🏅</span>
            Leaderboard
          </button>
        </div>
      </div>

      <div className="achievement-content">
        {activeTab !== 'leaderboard' ? (
          <div className="achievements-grid">
            {filteredAchievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-glow" style={{ background: getRarityGradient(achievement.rarity) }}></div>
                
                <div className="achievement-header">
                  <div className="achievement-icon" style={{ background: getRarityGradient(achievement.rarity) }}>
                    {achievement.icon}
                  </div>
                  <div className="rarity-badge" style={{ background: getRarityGradient(achievement.rarity) }}>
                    {achievement.rarity}
                  </div>
                </div>

                <div className="achievement-info">
                  <h3 className="achievement-name">{achievement.name}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                  <div className="achievement-category">
                    <span className="category-tag">{achievement.category}</span>
                  </div>
                </div>

                <div className="achievement-progress">
                  {achievement.unlocked ? (
                    <div className="completion-badge">
                      <span className="completion-icon">✨</span>
                      <span className="completion-text">Completed!</span>
                      <span className="reward-points">+{achievement.rewardPoints} pts</span>
                    </div>
                  ) : (
                    <div className="progress-section">
                      <div className="progress-header">
                        <span className="progress-text">Progress</span>
                        <span className="progress-percentage">{achievement.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${achievement.progress}%`,
                            background: getRarityGradient(achievement.rarity)
                          }}
                        ></div>
                      </div>
                      <div className="reward-preview">
                        <span className="reward-text">Reward: {achievement.rewardPoints} points</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="leaderboard-section">
            <div className="leaderboard-header">
              <h3>🏅 Top Reputation Holders</h3>
              <div className="leaderboard-stats">
                <div className="stat-item">
                  <span className="stat-value">{leaderboard.length}</span>
                  <span className="stat-label">Top Users</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{userRank ? `#${userRank}` : 'N/A'}</span>
                  <span className="stat-label">Your Rank</span>
                </div>
              </div>
            </div>

            <div className="leaderboard-list">
              {leaderboard.map((user, index) => (
                <div 
                  key={user.address} 
                  className={`leaderboard-item ${user.address === account ? 'current-user' : ''} ${index < 3 ? 'top-three' : ''}`}
                >
                  <div className="rank-section">
                    <div className="rank-number">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${user.rank}`}
                    </div>
                    <div className="rank-change">
                      {user.change.startsWith('+') && <span className="change-up">↗ {user.change}</span>}
                      {user.change.startsWith('-') && <span className="change-down">↘ {user.change}</span>}
                      {user.change === '0' && <span className="change-same">→ 0</span>}
                    </div>
                  </div>

                  <div className="user-section">
                    <div className="user-avatar">
                      <div className="avatar-bg"></div>
                      <span className="avatar-text">{user.address.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="user-info">
                      <div className="user-address">
                        {user.address === account ? 'You' : `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                      </div>
                      <div className="user-tier">{user.tier} Tier</div>
                    </div>
                  </div>

                  <div className="score-section">
                    <div className="score-value">{user.score.toLocaleString()}</div>
                    <div className="score-label">Reputation</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function AchievementManager({ account, provider, reputation }) {
  const [achievementContract, setAchievementContract] = useState(null)
  const [leaderboardContract, setLeaderboardContract] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (provider && account) {
      initializeContracts()
    }
  }, [provider, account])

  const initializeContracts = async () => {
    try {
      const signer = provider.getSigner()
      
      if (ACHIEVEMENT_CONTRACT_ADDRESS !== '0x...') {
        const achievementContract = new ethers.Contract(
          ACHIEVEMENT_CONTRACT_ADDRESS,
          ACHIEVEMENTS_ABI,
          signer
        )
        setAchievementContract(achievementContract)
      }

      if (LEADERBOARD_CONTRACT_ADDRESS !== '0x...') {
        const leaderboardContract = new ethers.Contract(
          LEADERBOARD_CONTRACT_ADDRESS,
          LEADERBOARD_ABI,
          signer
        )
        setLeaderboardContract(leaderboardContract)
      }
    } catch (error) {
      console.error('Error initializing contracts:', error)
      setError('Failed to initialize achievement contracts')
    }
  }

  const checkAndUnlockAchievements = async () => {
    if (!achievementContract || !account) return

    try {
      setLoading(true)
      setError(null)

      const tx = await achievementContract.checkAndUnlockAchievements(account)
      await tx.wait()

      return true
    } catch (error) {
      console.error('Error checking achievements:', error)
      setError('Failed to check for new achievements')
      return false
    } finally {
      setLoading(false)
    }
  }

  const getUserAchievements = async () => {
    if (!achievementContract || !account) return []

    try {
      const achievementIds = await achievementContract.getUserAchievements(account)
      const achievements = []

      for (const id of achievementIds) {
        const details = await achievementContract.getAchievementDetails(id)
        achievements.push({
          id: id.toNumber(),
          name: details[0],
          description: details[1],
          category: details[2],
          requiredScore: details[3].toNumber(),
          rewardPoints: details[4].toNumber(),
          rarity: details[5],
          timestamp: details[6].toNumber()
        })
      }

      return achievements
    } catch (error) {
      console.error('Error fetching user achievements:', error)
      return []
    }
  }

  const getLeaderboard = async (limit = 10) => {
    if (!leaderboardContract) return []

    try {
      const [addresses, scores] = await leaderboardContract.getTopUsers(limit)
      
      return addresses.map((address, index) => ({
        address,
        score: scores[index].toNumber(),
        rank: index + 1
      }))
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
  }

  const getUserRank = async () => {
    if (!leaderboardContract || !account) return null

    try {
      const rank = await leaderboardContract.getUserRank(account)
      return rank.toNumber()
    } catch (error) {
      console.error('Error fetching user rank:', error)
      return null
    }
  }

  const updateUserScore = async (newScore) => {
    if (!leaderboardContract || !account) return false

    try {
      setLoading(true)
      setError(null)

      const tx = await leaderboardContract.updateUserScore(account, newScore)
      await tx.wait()

      return true
    } catch (error) {
      console.error('Error updating user score:', error)
      setError('Failed to update leaderboard score')
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (reputation && achievementContract) {
      checkAndUnlockAchievements()
    }
  }, [reputation, achievementContract])

  return {
    checkAndUnlockAchievements,
    getUserAchievements,
    getLeaderboard,
    getUserRank,
    updateUserScore,
    loading,
    error,
    contractsReady: !!achievementContract && !!leaderboardContract
  }
}

export function useAchievements(account, provider, reputation) {
  return AchievementManager({ account, provider, reputation })
}