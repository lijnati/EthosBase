import { useState } from 'react'

export function SimpleAnalyticsDashboard({ reputation, account }) {
  const [timeRange, setTimeRange] = useState('30d')

  // Generate mock historical data for demonstration
  const generateMockData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const mockData = []
    const baseScore = reputation?.total || 120
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const variation = Math.sin(i * 0.1) * 20 + Math.random() * 10
      
      mockData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.max(0, Math.min(1000, baseScore + variation))
      })
    }
    
    return mockData
  }

  const chartData = generateMockData()
  const maxScore = Math.max(...chartData.map(d => d.score))
  const minScore = Math.min(...chartData.map(d => d.score))

  const categoryData = [
    {
      name: 'Loan Repayment',
      value: reputation?.loan || 300,
      percentage: 40,
      color: '#0052FF'
    },
    {
      name: 'Staking',
      value: reputation?.staking || 0,
      percentage: 25,
      color: '#059669'
    },
    {
      name: 'Community',
      value: reputation?.community || 0,
      percentage: 20,
      color: '#D97706'
    },
    {
      name: 'Flash Loans',
      value: reputation?.flashLoan || 0,
      percentage: 15,
      color: '#0041CC'
    }
  ]

  const getTierProgress = () => {
    const currentScore = reputation?.total || 120
    const tiers = [
      { name: 'Bronze', min: 200, color: '#CD7F32' },
      { name: 'Silver', min: 400, color: '#C0C0C0' },
      { name: 'Gold', min: 600, color: '#FFD700' },
      { name: 'Platinum', min: 800, color: '#E5E4E2' }
    ]

    return tiers.map(tier => ({
      ...tier,
      progress: currentScore >= tier.min ? 100 : Math.min(100, (currentScore / tier.min) * 100),
      achieved: currentScore >= tier.min
    }))
  }

  const tierProgress = getTierProgress()

  return (
    <div className="simple-analytics-dashboard">
      <div className="dashboard-header">
        <h2>📊 Reputation Analytics</h2>
        <div className="time-range-selector">
          <button 
            className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => setTimeRange('7d')}
          >
            7D
          </button>
          <button 
            className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            30D
          </button>
          <button 
            className={`time-btn ${timeRange === '90d' ? 'active' : ''}`}
            onClick={() => setTimeRange('90d')}
          >
            90D
          </button>
        </div>
      </div>

      <div className="simple-analytics-grid">
        {/* Simple Line Chart */}
        <div className="chart-card chart-card-large">
          <h3>Reputation Trend</h3>
          <div className="simple-line-chart">
            <div className="chart-container">
              <svg viewBox="0 0 400 200" className="line-chart-svg">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0052FF" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#0052FF" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="40"
                    y1={40 + i * 30}
                    x2="380"
                    y2={40 + i * 30}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Chart line */}
                <polyline
                  fill="none"
                  stroke="#0052FF"
                  strokeWidth="3"
                  points={chartData.map((point, index) => {
                    const x = 40 + (index * (340 / (chartData.length - 1)))
                    const y = 160 - ((point.score - minScore) / (maxScore - minScore)) * 120
                    return `${x},${y}`
                  }).join(' ')}
                />
                
                {/* Area fill */}
                <polygon
                  fill="url(#lineGradient)"
                  points={`40,160 ${chartData.map((point, index) => {
                    const x = 40 + (index * (340 / (chartData.length - 1)))
                    const y = 160 - ((point.score - minScore) / (maxScore - minScore)) * 120
                    return `${x},${y}`
                  }).join(' ')} 380,160`}
                />
                
                {/* Data points */}
                {chartData.map((point, index) => {
                  const x = 40 + (index * (340 / (chartData.length - 1)))
                  const y = 160 - ((point.score - minScore) / (maxScore - minScore)) * 120
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#0052FF"
                      className="chart-point"
                    />
                  )
                })}
              </svg>
              
              <div className="chart-labels">
                <div className="y-labels">
                  <span>{Math.round(maxScore)}</span>
                  <span>{Math.round((maxScore + minScore) / 2)}</span>
                  <span>{Math.round(minScore)}</span>
                </div>
                <div className="x-labels">
                  <span>{chartData[0]?.date}</span>
                  <span>{chartData[Math.floor(chartData.length / 2)]?.date}</span>
                  <span>{chartData[chartData.length - 1]?.date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="chart-card">
          <h3>Score Breakdown</h3>
          <div className="category-breakdown">
            {categoryData.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-header">
                  <div className="category-info">
                    <div 
                      className="category-color" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <span className="category-value">{category.value}</span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill"
                    style={{ 
                      width: `${(category.value / 1000) * 100}%`,
                      backgroundColor: category.color
                    }}
                  ></div>
                </div>
                <div className="category-weight">{category.percentage}% weight</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Progress */}
        <div className="chart-card">
          <h3>Tier Progress</h3>
          <div className="tier-progress-list">
            {tierProgress.map((tier, index) => (
              <div key={index} className="tier-progress-item">
                <div className="tier-info">
                  <span className="tier-name" style={{ color: tier.color }}>
                    {tier.name}
                  </span>
                  <span className="tier-score">{tier.min}+ pts</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${tier.progress}%`,
                      backgroundColor: tier.color,
                      opacity: tier.achieved ? 1 : 0.3
                    }}
                  ></div>
                </div>
                <span className="progress-percentage">
                  {tier.achieved ? '✓' : `${Math.round(tier.progress)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="chart-card">
          <h3>Key Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">{reputation?.total || 120}</div>
              <div className="metric-label">Current Score</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{reputation?.tier || 'Unrated'}</div>
              <div className="metric-label">Current Tier</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {reputation?.total >= 200 ? 
                  Math.max(0, Math.min(800 - (reputation?.total || 0), 800)) : 
                  200 - (reputation?.total || 0)
                }
              </div>
              <div className="metric-label">Points to Next Tier</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">
                {Math.round(((reputation?.total || 0) / 1000) * 100)}%
              </div>
              <div className="metric-label">Max Score Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}