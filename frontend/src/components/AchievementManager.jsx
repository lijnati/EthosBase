import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const ACHIEVEMENT_CONTRACT_ADDRESS = '0x6EA9a3A105168854D1c343150165B0831165e8b9' //
const LEADERBOARD_CONTRACT_ADDRESS = ' 0x1Fa4eFF10AEd3e1b54701e472E3492fD148610aD' // 
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
      
      // Initialize contracts when addresses are available
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

  // Auto-update achievements when reputation changes
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

// Hook for easy integration
export function useAchievements(account, provider, reputation) {
  return AchievementManager({ account, provider, reputation })
}