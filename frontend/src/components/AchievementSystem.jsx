import { useState, useEffect } from 'react'
import './components.css'

const ACHIEVEMENT_ICONS = {
  'First Steps': '🚀',
  'Bronze Achiever': '🥉',
  'Silver Star': '🥈',
  'Golden Legend': '🥇',
  'Platinum Elite': '💎',
  'First Borrower': '💰',
  'Reliable Borrower': '⭐',
  'Perfect Record': '🏆',
  'Community Member': '🤝',
  'Governance Participant': '🗳️'
}

const ACHIEVEMENT_COLORS = {
  'Milestone': '#0052FF',
  'Loan': '#059669',
  'Community': '#7C3AED',
  'Staking': '#D97706',
  'Special': '#DC2626'
}

export function AchievementSystem({ account, reputation }) {
  const [achievements, setAchievements] = useState([])
  const [userAchievements, setUserAchievements] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('earned')
  const [leaderboardFilter, setLeaderboardFilter] = useState('all')
  const [newAchievements, setNewAchievements] = useState([])
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (account) {
      loadAchievements()
      loadLeaderboard()
    }
  }, [account, reputation])

  useEffect(() => {
    // Check for new achievements when reputation changes
    if (achievements.length > 0 && reputation) {
      checkForNewAchievements()
    }
  }, [reputation, achievements])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      
      // Enhanced achievements with more variety and better progression
      const mockAchievements = [
        {
          id: 1,
          name: 'First Steps',
          description: 'Reach your first 100 reputation points',
          category: 'Milestone',
          requiredScore: 100,
          rewardPoints: 25,
          unlocked: (reputation?.total || 0) >= 100,
          progress: Math.min(100, ((reputation?.total || 0) / 100) * 100),
          rarity: 'Common'
        },
        {
          id: 2,
          name: 'Bronze Achiever',
          description: 'Reach Bronze tier (200+ points)',
          category: 'Milestone',
          requiredScore: 200,
          rewardPoints: 50,
          unlocked: (reputation?.total || 0) >= 200,
          progress: Math.min(100, ((reputation?.total || 0) / 200) * 100),
          rarity: 'Common'
        },
        {
          id: 3,
          name: 'Silver Star',
          description: 'Reach Silver tier (400+ points)',
          category: 'Milestone',
          requiredScore: 400,
          rewardPoints: 100,
          unlocked: (reputation?.total || 0) >= 400,
          progress: Math.min(100, ((reputation?.total || 0) / 400) * 100),
          rarity: 'Uncommon'
        },
        {
          id: 4,
          name: 'Golden Legend',
          description: 'Reach Gold tier (600+ points)',
          category: 'Milestone',
          requiredScore: 600,
          rewardPoints: 200,
          unlocked: (reputation?.total || 0) >= 600,
          progress: Math.min(100, ((reputation?.total || 0) / 600) * 100),
          rarity: 'Rare'
        },
        {
          id: 5,
          name: 'Platinum Elite',
          description: 'Reach Platinum tier (800+ points)',
          category: 'Milestone',
          requiredScore: 800,
          rewardPoints: 500,
          unlocked: (reputation?.total || 0) >= 800,
          progress: Math.min(100, ((reputation?.total || 0) / 800) * 100),
          rarity: 'Epic'
        },
        {
          id: 6,
          name: 'First Borrower',
          description: 'Take your first loan',
          category: 'Loan',
          requiredScore: 0,
          rewardPoints: 30,
          unlocked: (reputation?.loan || 0) > 0,
          progress: (reputation?.loan || 0) > 0 ? 100 : 0,
          rarity: 'Common'
        },
        {
          id: 7,
          name: 'Reliable Borrower',
          description: 'Build strong loan repayment history (250+ loan points)',
          category: 'Loan',
          requiredScore: 0,
          rewardPoints: 100,
          unlocked: (reputation?.loan || 0) >= 250,
          progress: Math.min(100, ((reputation?.loan || 0) / 250) * 100),
          rarity: 'Uncommon'
        },
        {
          id: 8,
          name: 'Perfect Record',
          description: 'Achieve maximum loan reputation (400+ points)',
          category: 'Loan',
          requiredScore: 0,
          rewardPoints: 250,
          unlocked: (reputation?.loan || 0) >= 400,
          progress: Math.min(100, ((reputation?.loan || 0) / 400) * 100),
          rarity: 'Epic'
        },
        {
          id: 9,
          name: 'Community Member',
          description: 'Make your first community contribution',
          category: 'Community',
          requiredScore: 0,
          rewardPoints: 40,
          unlocked: (reputation?.community || 0) > 0,
          progress: (reputation?.community || 0) > 0 ? 100 : 0,
          rarity: 'Common'
        },
        {
          id: 10,
          name: 'Community Leader',
          description: 'Reach 150+ community reputation points',
          category: 'Community',
          requiredScore: 0,
          rewardPoints: 120,
          unlocked: (reputation?.community || 0) >= 150,
          progress: Math.min(100, ((reputation?.community || 0) / 150) * 100),
          rarity: 'Rare'
        },
        {
          id: 11,
          name: 'Staking Pioneer',
          description: 'Start your first staking position',
          category: 'Staking',
          requiredScore: 0,
          rewardPoints: 35,
          unlocked: (reputation?.staking || 0) > 0,
          progress: (reputation?.staking || 0) > 0 ? 100 : 0,
          rarity: 'Common'
        },
        {
          id: 12,
          name: 'Staking Master',
          description: 'Build substantial staking reputation (200+ points)',
          category: 'Staking',
          requiredScore: 0,
          rewardPoints: 150,
          unlocked: (reputation?.staking || 0) >= 200,
          progress: Math.min(100, ((reputation?.staking || 0) / 200) * 100),
          rarity: 'Rare'
        },
        {
          id: 13,
          name: 'Flash Loan Expert',
          description: 'Successfully execute flash loan operations',
          category: 'Special',
          requiredScore: 0,
          rewardPoints: 75,
          unlocked: (reputation?.flashLoan || 0) > 0,
          progress: (reputation?.flashLoan || 0) > 0 ? 100 : 0,
          rarity: 'Uncommon'
        },
        {
          id: 14,
          name: 'DeFi Veteran',
          description: 'Maintain high reputation for 30+ days',
          category: 'Special',
          requiredScore: 0,
          rewardPoints: 300,
          unlocked: false, // This would require time-based tracking
          progress: 0,
          rarity: 'Legendary'
        },
        {
          id: 15,
          name: 'Base Builder',
          description: 'Be among the first 1000 users on Base',
          category: 'Special',
          requiredScore: 0,
          rewardPoints: 500,
          unlocked: Math.random() > 0.7, // Random for demo
          progress: 100,
          rarity: 'Legendary'
        }
      ]

      setAchievements(mockAchievements)
      setUserAchievements(mockAchievements.filter(a => a.unlocked))
      
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLeaderboard = async () => {
    try {
      // Mock leaderboard data
      const mockLeaderboard = [
        {
          address: '0x1234...5678',
          score: 950,
          tier: 'Platinum',
          achievements: ['🏆', '💎', '⭐', '🥇'],
          rank: 1
        },
        {
          address: '0x2345...6789',
          score: 820,
          tier: 'Platinum',
          achievements: ['🏆', '💎', '⭐'],
          rank: 2
        },
        {
          address: '0x3456...7890',
          score: 750,
          tier: 'Gold',
          achievements: ['🏆', '🥇', '⭐'],
          rank: 3
        },
        {
          address: account || '0x4567...8901',
          score: reputation?.total || 0,
          tier: getTierName(reputation?.total || 0),
          achievements: userAchievements.slice(0, 4).map(a => ACHIEVEMENT_ICONS[a.name] || '🏅'),
          rank: 4,
          isCurrentUser: true
        },
        {
          address: '0x5678...9012',
          score: 580,
          tier: 'Gold',
          achievements: ['🏆', '🥇'],
          rank: 5
        }
      ]

      setLeaderboard(mockLeaderboard)
      const currentUser = mockLeaderboard.find(u => u.isCurrentUser)
      setUserRank(currentUser?.rank || null)
      
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    }
  }

  const checkForNewAchievements = () => {
    const previouslyUnlocked = userAchievements.map(a => a.id)
    const currentlyUnlocked = achievements.filter(a => a.unlocked).map(a => a.id)
    const newlyUnlocked = currentlyUnlocked.filter(id => !previouslyUnlocked.includes(id))
    
    if (newlyUnlocked.length > 0) {
      const newAchievementsList = achievements.filter(a => newlyUnlocked.includes(a.id))
      setNewAchievements(newAchievementsList)
      setShowNotification(true)
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false)
        setNewAchievements([])
      }, 5000)
    }
  }

  const getTierName = (score) => {
    if (score >= 800) return 'Platinum'
    if (score >= 600) return 'Gold'
    if (score >= 400) return 'Silver'
    if (score >= 200) return 'Bronze'
    return 'Unranked'
  }

  const earnedAchievements = achievements.filter(a => a.unlocked)
  const availableAchievements = achievements.filter(a => !a.unlocked)

  const getAchievementsByCategory = (achievementList) => {
    const categories = {}
    achievementList.forEach(achievement => {
      if (!categories[achievement.category]) {
        categories[achievement.category] = []
      }
      categories[achievement.category].push(achievement)
    })
    return categories
  }

  const getFilteredLeaderboard = () => {
    if (leaderboardFilter === 'all') return leaderboard
    if (leaderboardFilter === 'tier') {
      const userTier = getTierName(reputation?.total || 0)
      return leaderboard.filter(user => user.tier === userTier)
    }
    return leaderboard.slice(0, 10) // top 10
  }

  const getRarityColor = (rarity) => {
    const colors = {
      'Common': '#6B7280',
      'Uncommon': '#10B981',
      'Rare': '#3B82F6',
      'Epic': '#8B5CF6',
      'Legendary': '#F59E0B'
    }
    return colors[rarity] || '#6B7280'
  }

  const displayAchievements = activeTab === 'earned' ? earnedAchievements : 
                             activeTab === 'available' ? availableAchievements : []
  const categorizedAchievements = getAchievementsByCategory(displayAchievements)

  if (loading) {
    return (
      <div className="achievement-system">
        <h2>🏆 Achievements</h2>
        <div className="achievement-loading">Loading achievements...</div>
      </div>
    )
  }

  return (
    <div className="achievement-system">
      {/* Achievement Notification */}
      {showNotification && newAchievements.length > 0 && (
        <div className="achievement-notification">
          <div className="notification-content">
            <div className="notification-icon">🎉</div>
            <div className="notification-text">
              <h4>New Achievement{newAchievements.length > 1 ? 's' : ''} Unlocked!</h4>
              {newAchievements.map(achievement => (
                <div key={achievement.id} className="notification-achievement">
                  <span className="notification-achievement-icon">
                    {ACHIEVEMENT_ICONS[achievement.name] || '🏅'}
                  </span>
                  <span className="notification-achievement-name">{achievement.name}</span>
                  <span className="notification-achievement-points">+{achievement.rewardPoints} pts</span>
                </div>
              ))}
            </div>
            <button 
              className="notification-close"
              onClick={() => setShowNotification(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="achievement-header">
        <h2>🏆 Achievements & Leaderboard</h2>
        <div className="achievement-stats">
          <div className="stat-badge">
            <span className="stat-number">{earnedAchievements.length}</span>
            <span className="stat-label">Earned</span>
          </div>
          <div className="stat-badge">
            <span className="stat-number">{availableAchievements.length}</span>
            <span className="stat-label">Available</span>
          </div>
          <div className="stat-badge">
            <span className="stat-number">
              {earnedAchievements.reduce((sum, a) => sum + a.rewardPoints, 0)}
            </span>
            <span className="stat-label">Bonus Points</span>
          </div>
          {userRank && (
            <div className="stat-badge">
              <span className="stat-number">#{userRank}</span>
              <span className="stat-label">Rank</span>
            </div>
          )}
        </div>
      </div>

      <div className="achievement-tabs">
        <button 
          className={`tab-btn ${activeTab === 'earned' ? 'active' : ''}`}
          onClick={() => setActiveTab('earned')}
        >
          Earned ({earnedAchievements.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available ({availableAchievements.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      <div className="achievement-content">
        {activeTab === 'leaderboard' ? (
          <div className="leaderboard-section">
            <div className="leaderboard-header">
              <h3>🏅 Top Performers</h3>
              <div className="leaderboard-filters">
                <button 
                  className={`filter-btn ${leaderboardFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setLeaderboardFilter('all')}
                >
                  All Users
                </button>
                <button 
                  className={`filter-btn ${leaderboardFilter === 'top10' ? 'active' : ''}`}
                  onClick={() => setLeaderboardFilter('top10')}
                >
                  Top 10
                </button>
                <button 
                  className={`filter-btn ${leaderboardFilter === 'tier' ? 'active' : ''}`}
                  onClick={() => setLeaderboardFilter('tier')}
                >
                  My Tier
                </button>
              </div>
            </div>
            
            <div className="leaderboard-list">
              {getFilteredLeaderboard().map((user, index) => (
                <div 
                  key={user.address} 
                  className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className={`leaderboard-rank rank-${user.rank <= 3 ? user.rank : 'other'}`}>
                    {user.rank}
                  </div>
                  
                  <div className="leaderboard-user">
                    <div className="leaderboard-address">
                      {user.isCurrentUser ? 'You' : user.address}
                    </div>
                    <div className="leaderboard-tier">{user.tier} Tier</div>
                  </div>
                  
                  <div className="leaderboard-achievements">
                    {user.achievements.map((icon, i) => (
                      <span key={i}>{icon}</span>
                    ))}
                  </div>
                  
                  <div className="leaderboard-score">
                    {user.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          Object.entries(categorizedAchievements).map(([category, categoryAchievements]) => (
            <div key={category} className="achievement-category">
              <h3 className="category-title">
                <span 
                  className="category-dot" 
                  style={{ backgroundColor: ACHIEVEMENT_COLORS[category] || '#6B7280' }}
                ></span>
                {category} Achievements
              </h3>
              
              <div className="achievement-grid">
                {categoryAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="achievement-icon">
                      {ACHIEVEMENT_ICONS[achievement.name] || '🏅'}
                    </div>
                    
                    <div className="achievement-content">
                      <div className="achievement-header-card">
                        <h4 className="achievement-name">{achievement.name}</h4>
                        <span 
                          className="achievement-rarity"
                          style={{ color: getRarityColor(achievement.rarity) }}
                        >
                          {achievement.rarity}
                        </span>
                      </div>
                      <p className="achievement-description">{achievement.description}</p>
                      
                      {!achievement.unlocked && (
                        <div className="achievement-progress">
                          <div className="progress-bar-small">
                            <div 
                              className="progress-fill-small"
                              style={{ 
                                width: `${achievement.progress}%`,
                                backgroundColor: ACHIEVEMENT_COLORS[achievement.category] || '#6B7280'
                              }}
                            ></div>
                          </div>
                          <span className="progress-text">
                            {Math.round(achievement.progress)}% complete
                          </span>
                        </div>
                      )}
                      
                      <div className="achievement-reward">
                        <span className="reward-points">+{achievement.rewardPoints} points</span>
                        {achievement.unlocked && (
                          <span className="unlocked-badge">✓ Unlocked</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {earnedAchievements.length === 0 && activeTab === 'earned' && (
        <div className="no-achievements">
          <div className="no-achievements-icon">🏆</div>
          <h3>No Achievements Yet</h3>
          <p>Start building your reputation to unlock your first achievement!</p>
          <button 
            onClick={() => setActiveTab('available')}
            className="btn-primary"
          >
            View Available Achievements
          </button>
        </div>
      )}
    </div>
  )
}