import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const REPUTATION_ABI = [
  'function getUserActions(address user) view returns (tuple(uint8 actionType, int256 scoreChange, uint256 timestamp, string description)[])',
  'event ReputationUpdated(address indexed user, uint8 actionType, int256 scoreChange, uint256 newTotalScore)'
]

export function useReputationHistory(account, contractAddress) {
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (account && contractAddress) {
      fetchReputationHistory()
    }
  }, [account, contractAddress])

  const fetchReputationHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock data for demonstration since contract might not have getUserActions
      const mockActions = [
        {
          id: 1,
          actionType: 'Loan Repayment',
          scoreChange: 50,
          timestamp: Date.now() - 86400000 * 2, // 2 days ago
          description: 'Successfully repaid loan of 1000 USDC on time',
          date: new Date(Date.now() - 86400000 * 2)
        },
        {
          id: 2,
          actionType: 'Community Contribution',
          scoreChange: 25,
          timestamp: Date.now() - 86400000 * 5, // 5 days ago
          description: 'Participated in governance proposal voting',
          date: new Date(Date.now() - 86400000 * 5)
        },
        {
          id: 3,
          actionType: 'Staking Reward',
          scoreChange: 30,
          timestamp: Date.now() - 86400000 * 7, // 7 days ago
          description: 'Earned staking rewards for 30-day commitment',
          date: new Date(Date.now() - 86400000 * 7)
        },
        {
          id: 4,
          actionType: 'Loan Repayment',
          scoreChange: 40,
          timestamp: Date.now() - 86400000 * 14, // 14 days ago
          description: 'Repaid flash loan within same block',
          date: new Date(Date.now() - 86400000 * 14)
        },
        {
          id: 5,
          actionType: 'Community Contribution',
          scoreChange: 15,
          timestamp: Date.now() - 86400000 * 21, // 21 days ago
          description: 'Provided helpful feedback on protocol improvement',
          date: new Date(Date.now() - 86400000 * 21)
        }
      ]

      // Sort by timestamp (newest first)
      mockActions.sort((a, b) => b.timestamp - a.timestamp)

      setActions(mockActions)

    } catch (err) {
      console.error('Error fetching reputation history:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getActionTypeName = (actionType) => {
    const types = {
      0: 'Loan Repayment',
      1: 'Loan Default',
      2: 'Staking Reward',
      3: 'Early Unstaking',
      4: 'Flash Loan Abuse',
      5: 'Community Contribution',
      6: 'Governance Participation'
    }
    return types[actionType] || 'Unknown'
  }

  return { actions, loading, error, refetch: fetchReputationHistory }
}