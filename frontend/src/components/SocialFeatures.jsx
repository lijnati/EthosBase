import { useState, useEffect } from 'react'
import './components.css'

const ENDORSEMENT_CATEGORIES = [
  { value: 'loan', label: 'Loan Reliability', icon: '💰', color: '#059669' },
  { value: 'community', label: 'Community Contribution', icon: '🤝', color: '#7C3AED' },
  { value: 'staking', label: 'Staking Commitment', icon: '🌱', color: '#D97706' },
  { value: 'general', label: 'General Trustworthiness', icon: '⭐', color: '#0052FF' }
]

const VOUCH_PURPOSES = [
  { value: 'loan', label: 'Loan Application', icon: '💰' },
  { value: 'access', label: 'Platform Access', icon: '🔑' },
  { value: 'general', label: 'General Support', icon: '🤝' }
]

export function SocialFeatures({ account, reputation }) {
  const [socialProfile, setSocialProfile] = useState(null)
  const [endorsements, setEndorsements] = useState([])
  const [vouches, setVouches] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showEndorseModal, setShowEndorseModal] = useState(false)
  const [showVouchModal, setShowVouchModal] = useState(false)
  const [endorseForm, setEndorseForm] = useState({
    address: '',
    category: 'general',
    message: ''
  })
  const [vouchForm, setVouchForm] = useState({
    address: '',
    amount: '',
    purpose: 'general',
    message: ''
  })
  const [searchResults, setSearchResults] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (account) {
      loadSocialData()
    }
  }, [account])

  const loadSocialData = async () => {
    try {
      setLoading(true)
      
      // Mock social data since contract might not be deployed yet
      const mockSocialProfile = {
        endorsementsReceived: Math.floor(Math.random() * 20) + 5,
        endorsementsGiven: Math.floor(Math.random() * 15) + 3,
        vouchesReceived: Math.floor(Math.random() * 10) + 2,
        vouchesGiven: Math.floor(Math.random() * 8) + 1,
        socialScore: Math.floor(Math.random() * 500) + 100,
        trustScore: Math.floor(Math.random() * 300) + 50,
        isVerified: Math.random() > 0.7
      }

      const mockEndorsements = [
        {
          id: 1,
          endorser: '0x1234...5678',
          category: 'loan',
          message: 'Reliable borrower, always repays on time',
          weight: 75,
          timestamp: Date.now() - 86400000 * 2,
          endorserReputation: 650
        },
        {
          id: 2,
          endorser: '0x2345...6789',
          category: 'community',
          message: 'Active community member, helpful to newcomers',
          weight: 50,
          timestamp: Date.now() - 86400000 * 5,
          endorserReputation: 420
        },
        {
          id: 3,
          endorser: '0x3456...7890',
          category: 'general',
          message: 'Trustworthy and professional in all interactions',
          weight: 100,
          timestamp: Date.now() - 86400000 * 10,
          endorserReputation: 850
        }
      ]

      const mockVouches = [
        {
          id: 1,
          voucher: '0x4567...8901',
          amount: 5000,
          purpose: 'loan',
          message: 'Vouching for loan application based on past reliability',
          timestamp: Date.now() - 86400000 * 1,
          expiresAt: Date.now() + 86400000 * 29,
          fulfilled: true
        },
        {
          id: 2,
          voucher: '0x5678...9012',
          amount: 2500,
          purpose: 'access',
          message: 'Supporting platform access for trusted user',
          timestamp: Date.now() - 86400000 * 7,
          expiresAt: Date.now() + 86400000 * 23,
          fulfilled: false
        }
      ]

      const mockRecentActivity = [
        {
          type: 'endorsement_received',
          from: '0x1234...5678',
          category: 'loan',
          timestamp: Date.now() - 86400000 * 1
        },
        {
          type: 'vouch_fulfilled',
          from: '0x4567...8901',
          amount: 5000,
          timestamp: Date.now() - 86400000 * 2
        },
        {
          type: 'endorsement_given',
          to: '0x6789...0123',
          category: 'community',
          timestamp: Date.now() - 86400000 * 3
        }
      ]

      setSocialProfile(mockSocialProfile)
      setEndorsements(mockEndorsements)
      setVouches(mockVouches)
      setRecentActivity(mockRecentActivity)
      
    } catch (error) {
      console.error('Error loading social data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEndorse = async () => {
    try {
      setLoading(true)
      // Mock endorsement for now
      console.log('Endorsing user:', endorseForm)
      
      // Add to endorsements list
      const newEndorsement = {
        id: endorsements.length + 1,
        endorser: account,
        endorsed: endorseForm.address,
        category: endorseForm.category,
        message: endorseForm.message,
        weight: 50, // Based on current user's reputation
        timestamp: Date.now()
      }
      
      setEndorsements([newEndorsement, ...endorsements])
      setShowEndorseModal(false)
      setEndorseForm({ address: '', category: 'general', message: '' })
      
      // Update social profile
      setSocialProfile(prev => ({
        ...prev,
        endorsementsGiven: prev.endorsementsGiven + 1,
        socialScore: prev.socialScore + 5
      }))
      
    } catch (error) {
      console.error('Error giving endorsement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestVouch = async () => {
    try {
      setLoading(true)
      // Mock vouch request for now
      console.log('Requesting vouch:', vouchForm)
      
      const newVouch = {
        id: vouches.length + 1,
        voucher: vouchForm.address,
        vouchee: account,
        amount: parseInt(vouchForm.amount),
        purpose: vouchForm.purpose,
        message: vouchForm.message,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        fulfilled: false
      }
      
      setVouches([newVouch, ...vouches])
      setShowVouchModal(false)
      setVouchForm({ address: '', amount: '', purpose: 'general', message: '' })
      
    } catch (error) {
      console.error('Error requesting vouch:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query) => {
    if (query.length < 3) {
      setSearchResults([])
      return
    }

    // Mock search results
    const mockResults = [
      { address: '0x1234...5678', reputation: 650, tier: 'Gold', verified: true },
      { address: '0x2345...6789', reputation: 420, tier: 'Silver', verified: false },
      { address: '0x3456...7890', reputation: 850, tier: 'Platinum', verified: true }
    ].filter(user => user.address.includes(query.toLowerCase()))

    setSearchResults(mockResults)
  }

  const getCategoryInfo = (category) => {
    return ENDORSEMENT_CATEGORIES.find(cat => cat.value === category) || ENDORSEMENT_CATEGORIES[3]
  }

  const getPurposeInfo = (purpose) => {
    return VOUCH_PURPOSES.find(p => p.value === purpose) || VOUCH_PURPOSES[2]
  }

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  if (loading && !socialProfile) {
    return (
      <div className="social-features">
        <h2>🤝 Social Features</h2>
        <div className="social-loading">Loading social data...</div>
      </div>
    )
  }

  return (
    <div className="social-features">
      <div className="social-header">
        <h2>🤝 Social Features</h2>
        <div className="social-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowEndorseModal(true)}
          >
            Give Endorsement
          </button>
          <button 
            className="btn-secondary"
            onClick={() => setShowVouchModal(true)}
          >
            Request Vouch
          </button>
        </div>
      </div>

      <div className="social-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Social Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'endorsements' ? 'active' : ''}`}
          onClick={() => setActiveTab('endorsements')}
        >
          Endorsements ({endorsements.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vouches' ? 'active' : ''}`}
          onClick={() => setActiveTab('vouches')}
        >
          Vouches ({vouches.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Recent Activity
        </button>
      </div>

      <div className="social-content">
        {activeTab === 'profile' && (
          <div className="social-profile">
            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <div className="stat-number">{socialProfile?.socialScore || 0}</div>
                  <div className="stat-label">Social Score</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🛡️</div>
                <div className="stat-info">
                  <div className="stat-number">{socialProfile?.trustScore || 0}</div>
                  <div className="stat-label">Trust Score</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-number">{socialProfile?.endorsementsReceived || 0}</div>
                  <div className="stat-label">Endorsements</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🤝</div>
                <div className="stat-info">
                  <div className="stat-number">{socialProfile?.vouchesReceived || 0}</div>
                  <div className="stat-label">Vouches</div>
                </div>
              </div>
            </div>

            <div className="profile-badges">
              <h3>Profile Badges</h3>
              <div className="badges-grid">
                {socialProfile?.isVerified && (
                  <div className="badge verified-badge">
                    <span className="badge-icon">✓</span>
                    <span className="badge-label">Verified</span>
                  </div>
                )}
                {socialProfile?.endorsementsReceived >= 10 && (
                  <div className="badge endorsement-badge">
                    <span className="badge-icon">⭐</span>
                    <span className="badge-label">Well Endorsed</span>
                  </div>
                )}
                {socialProfile?.vouchesReceived >= 5 && (
                  <div className="badge vouch-badge">
                    <span className="badge-icon">🛡️</span>
                    <span className="badge-label">Trusted</span>
                  </div>
                )}
                {socialProfile?.socialScore >= 300 && (
                  <div className="badge social-badge">
                    <span className="badge-icon">🌟</span>
                    <span className="badge-label">Social Leader</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'endorsements' && (
          <div className="endorsements-section">
            <div className="endorsements-list">
              {endorsements.map((endorsement) => {
                const categoryInfo = getCategoryInfo(endorsement.category)
                return (
                  <div key={endorsement.id} className="endorsement-card">
                    <div className="endorsement-header">
                      <div className="endorsement-category">
                        <span 
                          className="category-icon"
                          style={{ color: categoryInfo.color }}
                        >
                          {categoryInfo.icon}
                        </span>
                        <span className="category-label">{categoryInfo.label}</span>
                      </div>
                      <div className="endorsement-weight">
                        Weight: {endorsement.weight}
                      </div>
                    </div>
                    
                    <div className="endorsement-content">
                      <p className="endorsement-message">"{endorsement.message}"</p>
                      <div className="endorsement-meta">
                        <span className="endorser-info">
                          From: {endorsement.endorser}
                        </span>
                        <span className="endorsement-time">
                          {formatTimeAgo(endorsement.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'vouches' && (
          <div className="vouches-section">
            <div className="vouches-list">
              {vouches.map((vouch) => {
                const purposeInfo = getPurposeInfo(vouch.purpose)
                const isExpired = Date.now() > vouch.expiresAt
                return (
                  <div key={vouch.id} className={`vouch-card ${vouch.fulfilled ? 'fulfilled' : isExpired ? 'expired' : 'active'}`}>
                    <div className="vouch-header">
                      <div className="vouch-purpose">
                        <span className="purpose-icon">{purposeInfo.icon}</span>
                        <span className="purpose-label">{purposeInfo.label}</span>
                      </div>
                      <div className="vouch-amount">
                        ${vouch.amount.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="vouch-content">
                      <p className="vouch-message">"{vouch.message}"</p>
                      <div className="vouch-meta">
                        <span className="voucher-info">
                          From: {vouch.voucher}
                        </span>
                        <span className="vouch-status">
                          {vouch.fulfilled ? '✅ Fulfilled' : 
                           isExpired ? '⏰ Expired' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-section">
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'endorsement_received' && '📨'}
                    {activity.type === 'endorsement_given' && '📤'}
                    {activity.type === 'vouch_fulfilled' && '✅'}
                    {activity.type === 'vouch_requested' && '🤝'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-description">
                      {activity.type === 'endorsement_received' && 
                        `Received endorsement from ${activity.from}`}
                      {activity.type === 'endorsement_given' && 
                        `Gave endorsement to ${activity.to}`}
                      {activity.type === 'vouch_fulfilled' && 
                        `Vouch fulfilled by ${activity.from} for $${activity.amount.toLocaleString()}`}
                    </div>
                    <div className="activity-time">
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Endorsement Modal */}
      {showEndorseModal && (
        <div className="modal-overlay" onClick={() => setShowEndorseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Give Endorsement</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEndorseModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>User Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={endorseForm.address}
                  onChange={(e) => {
                    setEndorseForm({...endorseForm, address: e.target.value})
                    searchUsers(e.target.value)
                  }}
                  className="input"
                />
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((user, index) => (
                      <div 
                        key={index}
                        className="search-result"
                        onClick={() => {
                          setEndorseForm({...endorseForm, address: user.address})
                          setSearchResults([])
                        }}
                      >
                        <span className="result-address">{user.address}</span>
                        <span className="result-tier">{user.tier}</span>
                        {user.verified && <span className="result-verified">✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  value={endorseForm.category}
                  onChange={(e) => setEndorseForm({...endorseForm, category: e.target.value})}
                  className="select"
                >
                  {ENDORSEMENT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea
                  placeholder="Why are you endorsing this user?"
                  value={endorseForm.message}
                  onChange={(e) => setEndorseForm({...endorseForm, message: e.target.value})}
                  className="textarea"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowEndorseModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleEndorse}
                disabled={!endorseForm.address || !endorseForm.message}
              >
                Give Endorsement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vouch Modal */}
      {showVouchModal && (
        <div className="modal-overlay" onClick={() => setShowVouchModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Vouch</h3>
              <button 
                className="modal-close"
                onClick={() => setShowVouchModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Voucher Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={vouchForm.address}
                  onChange={(e) => setVouchForm({...vouchForm, address: e.target.value})}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label>Amount (USDC)</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={vouchForm.amount}
                  onChange={(e) => setVouchForm({...vouchForm, amount: e.target.value})}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label>Purpose</label>
                <select
                  value={vouchForm.purpose}
                  onChange={(e) => setVouchForm({...vouchForm, purpose: e.target.value})}
                  className="select"
                >
                  {VOUCH_PURPOSES.map(purpose => (
                    <option key={purpose.value} value={purpose.value}>
                      {purpose.icon} {purpose.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea
                  placeholder="Why do you need this vouch?"
                  value={vouchForm.message}
                  onChange={(e) => setVouchForm({...vouchForm, message: e.target.value})}
                  className="textarea"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowVouchModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleRequestVouch}
                disabled={!vouchForm.address || !vouchForm.amount || !vouchForm.message}
              >
                Request Vouch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}