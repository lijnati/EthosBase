export function ReputationSummary({ reputation, access }) {
  const getScoreColor = (score) => {
    if (score >= 800) return '#E5E4E2' // Platinum
    if (score >= 600) return '#FFD700' // Gold
    if (score >= 400) return '#C0C0C0' // Silver
    if (score >= 200) return '#CD7F32' // Bronze
    return '#6B7280' // Unrated
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

  return (
    <div className="reputation-summary">
      <div className="summary-grid">
        <div className="summary-card summary-main">
          <div className="summary-header">
            <h3>Your Reputation</h3>
            <div className="tier-badge-large" style={{ backgroundColor: scoreColor }}>
              {reputation?.tier || 'Unrated'}
            </div>
          </div>
          
          <div className="score-display">
            <div className="score-number" style={{ color: scoreColor }}>
              {currentScore}
            </div>
            <div className="score-max">/ 1000</div>
          </div>
          
          <div className="score-progress">
            <div className="progress-track">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(currentScore / 1000) * 100}%`,
                  backgroundColor: scoreColor
                }}
              ></div>
            </div>
            <div className="progress-labels">
              <span>0</span>
              <span>1000</span>
            </div>
          </div>

          {nextTier.points > 0 && (
            <div className="next-tier-info">
              <span className="next-tier-text">
                {nextTier.points} points to {nextTier.tier}
              </span>
            </div>
          )}
        </div>

        <div className="summary-card">
          <h4>Loan Benefits</h4>
          <div className="benefit-list">
            <div className="benefit-item">
              <span className="benefit-label">Max Loan</span>
              <span className="benefit-value">{access?.maxLoan || 0} USDC</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-label">Collateral</span>
              <span className="benefit-value">{access?.collateral || 0}%</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-label">Discount</span>
              <span className="benefit-value">{access?.discount || 0}%</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h4>Score Breakdown</h4>
          <div className="score-breakdown">
            <div className="breakdown-item">
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill"
                  style={{ 
                    width: `${Math.min(100, ((reputation?.loan || 0) / 1000) * 100)}%`,
                    backgroundColor: '#0052FF'
                  }}
                ></div>
              </div>
              <div className="breakdown-info">
                <span className="breakdown-label">Loans</span>
                <span className="breakdown-value">{reputation?.loan || 0}</span>
              </div>
            </div>
            
            <div className="breakdown-item">
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill"
                  style={{ 
                    width: `${Math.min(100, ((reputation?.staking || 0) / 1000) * 100)}%`,
                    backgroundColor: '#059669'
                  }}
                ></div>
              </div>
              <div className="breakdown-info">
                <span className="breakdown-label">Staking</span>
                <span className="breakdown-value">{reputation?.staking || 0}</span>
              </div>
            </div>
            
            <div className="breakdown-item">
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill"
                  style={{ 
                    width: `${Math.min(100, ((reputation?.community || 0) / 1000) * 100)}%`,
                    backgroundColor: '#D97706'
                  }}
                ></div>
              </div>
              <div className="breakdown-info">
                <span className="breakdown-label">Community</span>
                <span className="breakdown-value">{reputation?.community || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}