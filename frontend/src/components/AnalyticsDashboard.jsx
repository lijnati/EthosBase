import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts'
import { format, subDays, parseISO } from 'date-fns'

const COLORS = {
  primary: '#0052FF',
  secondary: '#0041CC',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  gray: '#6B7280'
}

const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  unrated: '#6B7280'
}

export function AnalyticsDashboard({ reputation, userActions = [], account }) {
  const [timeRange, setTimeRange] = useState('30d')
  const [chartData, setChartData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [progressData, setProgressData] = useState([])

  useEffect(() => {
    if (reputation && userActions.length > 0) {
      generateChartData()
      generateCategoryData()
      generateProgressData()
    } else {
      generateMockData()
    }
  }, [reputation, userActions, timeRange])

  const generateMockData = () => {
    // Generate mock historical data for demonstration
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const mockData = []
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const baseScore = reputation?.total || 120
      const variation = Math.sin(i * 0.1) * 20 + Math.random() * 10
      
      mockData.push({
        date: format(date, 'MMM dd'),
        fullDate: date,
        totalScore: Math.max(0, Math.min(1000, baseScore + variation)),
        loanScore: Math.max(0, (reputation?.loan || 300) + variation * 0.4),
        stakingScore: Math.max(0, (reputation?.staking || 0) + variation * 0.25),
        communityScore: Math.max(0, (reputation?.community || 0) + variation * 0.2),
        tier: getTierFromScore(baseScore + variation)
      })
    }
    
    setChartData(mockData)
  }

  const generateCategoryData = () => {
    const data = [
      {
        name: 'Loan Repayment',
        value: reputation?.loan || 300,
        percentage: 40,
        color: COLORS.primary
      },
      {
        name: 'Staking',
        value: reputation?.staking || 0,
        percentage: 25,
        color: COLORS.success
      },
      {
        name: 'Community',
        value: reputation?.community || 0,
        percentage: 20,
        color: COLORS.warning
      },
      {
        name: 'Flash Loans',
        value: reputation?.flashLoan || 0,
        percentage: 15,
        color: COLORS.secondary
      }
    ]
    
    setCategoryData(data)
  }

  const generateProgressData = () => {
    const currentScore = reputation?.total || 120
    const tiers = [
      { name: 'Bronze', min: 200, max: 399, color: TIER_COLORS.bronze },
      { name: 'Silver', min: 400, max: 599, color: TIER_COLORS.silver },
      { name: 'Gold', min: 600, max: 799, color: TIER_COLORS.gold },
      { name: 'Platinum', min: 800, max: 1000, color: TIER_COLORS.platinum }
    ]

    const data = tiers.map(tier => {
      const progress = currentScore >= tier.min 
        ? 100 
        : currentScore < tier.min 
        ? (currentScore / tier.min) * 100 
        : 0

      return {
        name: tier.name,
        progress: Math.min(100, progress),
        current: currentScore >= tier.min,
        color: tier.color,
        minScore: tier.min
      }
    })

    setProgressData(data)
  }

  const getTierFromScore = (score) => {
    if (score >= 800) return 'Platinum'
    if (score >= 600) return 'Gold'
    if (score >= 400) return 'Silver'
    if (score >= 200) return 'Bronze'
    return 'Unrated'
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {Math.round(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">Score: {data.value}</p>
          <p className="tooltip-value">Weight: {data.percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="analytics-dashboard">
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

      <div className="analytics-grid">
        {/* Reputation Trend Chart */}
        <div className="chart-card chart-card-large">
          <h3>Reputation Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalScore"
                stroke={COLORS.primary}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorScore)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="chart-card">
          <h3>Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {categoryData.map((entry, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="legend-text">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Progress */}
        <div className="chart-card">
          <h3>Tier Progress</h3>
          <div className="tier-progress-list">
            {progressData.map((tier, index) => (
              <div key={index} className="tier-progress-item">
                <div className="tier-info">
                  <span className="tier-name" style={{ color: tier.color }}>
                    {tier.name}
                  </span>
                  <span className="tier-score">{tier.minScore}+ pts</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${tier.progress}%`,
                      backgroundColor: tier.color,
                      opacity: tier.current ? 1 : 0.3
                    }}
                  ></div>
                </div>
                <span className="progress-percentage">
                  {tier.current ? '✓' : `${Math.round(tier.progress)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Comparison */}
        <div className="chart-card">
          <h3>Category Scores</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#6B7280" 
                fontSize={12}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
                  Math.min(800 - (reputation?.total || 0), 800) : 
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

        {/* Reputation Velocity */}
        <div className="chart-card chart-card-large">
          <h3>Score Velocity (Change Over Time)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="loanScore"
                stroke={COLORS.primary}
                strokeWidth={2}
                name="Loan Score"
              />
              <Line
                type="monotone"
                dataKey="stakingScore"
                stroke={COLORS.success}
                strokeWidth={2}
                name="Staking Score"
              />
              <Line
                type="monotone"
                dataKey="communityScore"
                stroke={COLORS.warning}
                strokeWidth={2}
                name="Community Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}