import { useReputationHistory } from '../hooks/useReputationHistory'

const ACTION_ICONS = {
  'Loan Repayment': '💰',
  'Loan Default': '❌',
  'Staking Reward': '🎯',
  'Early Unstaking': '⚠️',
  'Flash Loan Abuse': '🚫',
  'Community Contribution': '🤝',
  'Governance Participation': '🗳️'
}

const ACTION_COLORS = {
  'Loan Repayment': '#059669',
  'Loan Default': '#DC2626',
  'Staking Reward': '#0052FF',
  'Early Unstaking': '#D97706',
  'Flash Loan Abuse': '#DC2626',
  'Community Contribution': '#7C3AED',
  'Governance Participation': '#0052FF'
}

export function ReputationHistory({ account, contractAddress }) {
  const { actions, loading, error } = useReputationHistory(account, contractAddress)

  if (loading) {
    return (
      <div className="reputation-history">
        <h3>📜 Recent Activity</h3>
        <div className="history-loading">Loading activity...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="reputation-history">
        <h3>📜 Recent Activity</h3>
        <div className="history-error">Failed to load activity</div>
      </div>
    )
  }

  return (
    <div className="reputation-history">
      <h3>📜 Recent Activity</h3>
      
      {actions.length === 0 ? (
        <div className="no-activity">
          <p>No reputation activity yet</p>
          <p className="no-activity-subtitle">
            Start by requesting a loan or participating in governance
          </p>
        </div>
      ) : (
        <div className="activity-list">
          {actions.slice(0, 10).map((action) => (
            <div key={action.id} className="activity-item">
              <div className="activity-icon">
                {ACTION_ICONS[action.actionType] || '📊'}
              </div>
              
              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-type">{action.actionType}</span>
                  <span 
                    className={`activity-score ${action.scoreChange >= 0 ? 'positive' : 'negative'}`}
                    style={{ 
                      color: action.scoreChange >= 0 ? '#059669' : '#DC2626' 
                    }}
                  >
                    {action.scoreChange >= 0 ? '+' : ''}{action.scoreChange}
                  </span>
                </div>
                
                <div className="activity-description">
                  {action.description}
                </div>
                
                <div className="activity-date">
                  {action.date ? action.date.toLocaleDateString() + ' • ' + action.date.toLocaleTimeString() : 'Unknown date'}
                </div>
              </div>
            </div>
          ))}
          
          {actions.length > 10 && (
            <div className="show-more">
              <button className="show-more-btn">
                View All Activity ({actions.length} total)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}