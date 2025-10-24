import { useAccount, useChainId } from 'wagmi'
import { useBasename } from '../hooks/useBasename'
import { BasenameCard } from './BasenameManager'

export function ReputationSummary({ reputation, access }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { basename } = useBasename(address, chainId)
  
  const getScoreColor = (score) => {
    if (score >= 800) return '#E5E4E2' // Platinum
    if (score >= 600) return '#FFD700' // Gold
    if (score >= 400) return '#C0C0C0' // Silver
    if (score >= 200) return '#CD7F32' // Bronze
    return '#6B7280' // Unrated
  }

  const getTierGradient = (tier) => {
    const gradients = {
      'Platinum': 'linear-gradient(135deg, #E5E4E2 0%, #C0C0C0 100%)',
      'Gold': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      'Silver': 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
      'Bronze': 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
      'Unrated': 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
    }
    return gradients[tier] || gradients['Unrated']
  }

  const getNextTierInfo = (currentScore) => {
    if (currentScore >= 800) return { tier: 'Max Level', points: 0 }
    if (currentScore >= 600) return { tier: 'Platinum', points: 800 - currentScore }
    if (currentScore >= 400) return { tier: 'Gold', points: 600 - currentScore }
    if (currentScore >= 200) return { tier: 'Silver', points: 400 - currentScore }
    return { tier: 'Bronze', points: 200 - currentScore }
  }

  const currentScore = reputation?.total || 0
  const nextTier = getNextTierInfo(currentScore)
  const scoreColor = getScoreColor(currentScore)
  const tierGradient = getTierGradient(reputation?.tier)

  return (
    <div className="reputation-summary-modern">
      <div className="summary-grid-modern">
        {/* Main Score Card */}
        <div className="summary-card-modern main-score-card">
          <div className="card-glow"></div>
          <div className="summary-header-modern">
            <div className="header-content">
              <div className="user-info">
                <div className="user-avatar">
                  <div className="avatar-ring" style={{ background: tierGradient }}></div>
                  <div className="avatar-inner">
                    {address ? address.slice(0, 2).toUpperCase() : 'UN'}
                  </div>
                </div>
                <div className="user-details">
                  <h3 className="user-title">Your Reputation</h3>
                  {basename && (
                    <div className="user-basename">
                      <BasenameCard address={address} showActions={false} />
                    </div>
                  )}
                </div>
              </div>
              <div className="tier-badge-modern" style={{ background: tierGradient }}>
                <span className="tier-icon">
                  {reputation?.tier === 'Platinum' && '💎'}
                  {reputation?.tier === 'Gold' && '🥇'}
                  {reputation?.tier === 'Silver' && '🥈'}
                  {reputation?.tier === 'Bronze' && '🥉'}
                  {!reputation?.tier && '⭐'}
                </span>
                {reputation?.tier || 'Unrated'}
              </div>
            </div>
          </div>
          
          <div className="score-display-modern">
            <div className="score-main">
              <div className="score-number-modern" style={{ color: scoreColor }}>
                {currentScore.toLocaleString()}
              </div>
              <div className="score-max-modern">/ 1,000</div>
            </div>
            <div className="score-percentage">
              {Math.round((currentScore / 1000) * 100)}% Complete
            </div>
          </div>
          
          <div className="score-progress-modern">
            <div className="progress-track-modern">
              <div 
                className="progress-fill-modern"
                style={{ 
                  width: `${(currentScore / 1000) * 100}%`,
                  background: `linear-gradient(90deg, ${scoreColor}40, ${scoreColor})`
                }}
              >
                <div className="progress-shine"></div>
              </div>
            </div>
            <div className="progress-milestones">
              <div className="milestone" data-score="200">Bronze</div>
              <div className="milestone" data-score="400">Silver</div>
              <div className="milestone" data-score="600">Gold</div>
              <div className="milestone" data-score="800">Platinum</div>
            </div>
          </div>

          {nextTier.points > 0 && (
            <div className="next-tier-info-modern">
              <div className="next-tier-icon">🎯</div>
              <span className="next-tier-text">
                <strong>{nextTier.points}</strong> points to reach <strong>{nextTier.tier}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Benefits Card */}
        <div className="summary-card-modern benefits-card">
          <div className="card-header-modern">
            <div className="header-icon">💰</div>
            <h4>Lending Benefits</h4>
          </div>
          <div className="benefit-list-modern">
            <div className="benefit-item-modern">
              <div className="benefit-icon">💵</div>
              <div className="benefit-content">
                <span className="benefit-label">Max Loan Amount</span>
                <span className="benefit-value">{Number(access?.maxLoan || 0).toLocaleString()} USDC</span>
              </div>
            </div>
            <div className="benefit-item-modern">
              <div className="benefit-icon">🔒</div>
              <div className="benefit-content">
                <span className="benefit-label">Collateral Ratio</span>
                <span className="benefit-value">{access?.collateral || 150}%</span>
              </div>
            </div>
            <div className="benefit-item-modern">
              <div className="benefit-icon">📉</div>
              <div className="benefit-content">
                <span className="benefit-label">Interest Discount</span>
                <span className="benefit-value">{access?.discount || 0}%</span>
              </div>
            </div>
            {access?.exclusive && (
              <div className="benefit-item-modern exclusive">
                <div className="benefit-icon">⭐</div>
                <div className="benefit-content">
                  <span className="benefit-label">Exclusive Access</span>
                  <span className="benefit-value">Premium Pools</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Score Breakdown Card */}
        <div className="summary-card-modern breakdown-card">
          <div className="card-header-modern">
            <div className="header-icon">📊</div>
            <h4>Score Breakdown</h4>
          </div>
          <div className="score-breakdown-modern">
            <div className="breakdown-item-modern">
              <div className="breakdown-header">
                <div className="breakdown-icon" style={{ backgroundColor: '#0052FF' }}>🏦</div>
                <div className="breakdown-info">
                  <span className="breakdown-label">Loan History</span>
                  <span className="breakdown-value">{reputation?.loan || 0}</span>
                </div>
              </div>
              <div className="breakdown-bar-modern">
                <div 
                  className="breakdown-fill-modern"
                  style={{ 
                    width: `${Math.min(100, ((reputation?.loan || 0) / 300) * 100)}%`,
                    backgroundColor: '#0052FF'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="breakdown-item-modern">
              <div className="breakdown-header">
                <div className="breakdown-icon" style={{ backgroundColor: '#059669' }}>🔒</div>
                <div className="breakdown-info">
                  <span className="breakdown-label">Staking Activity</span>
                  <span className="breakdown-value">{reputation?.staking || 0}</span>
                </div>
              </div>
              <div className="breakdown-bar-modern">
                <div 
                  className="breakdown-fill-modern"
                  style={{ 
                    width: `${Math.min(100, ((reputation?.staking || 0) / 300) * 100)}%`,
                    backgroundColor: '#059669'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="breakdown-item-modern">
              <div className="breakdown-header">
                <div className="breakdown-icon" style={{ backgroundColor: '#D97706' }}>👥</div>
                <div className="breakdown-info">
                  <span className="breakdown-label">Community</span>
                  <span className="breakdown-value">{reputation?.community || 0}</span>
                </div>
              </div>
              <div className="breakdown-bar-modern">
                <div 
                  className="breakdown-fill-modern"
                  style={{ 
                    width: `${Math.min(100, ((reputation?.community || 0) / 300) * 100)}%`,
                    backgroundColor: '#D97706'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}