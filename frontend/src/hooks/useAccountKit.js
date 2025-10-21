import { useState, useEffect } from 'react'
import { getAccountType, formatAccountInfo } from '../utils/accountKit'
import { useBasename } from './useBasename'

export function useAccountKit(address, provider, chainId) {
  const [accountInfo, setAccountInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const { basename } = useBasename(address, chainId)

  useEffect(() => {
    if (!address || !provider) return

    const fetchAccountInfo = async () => {
      setLoading(true)
      
      try {
        const accountType = await getAccountType(address, provider)
        const info = formatAccountInfo(address, basename, accountType)
        setAccountInfo(info)
      } catch (error) {
        console.error('Error fetching account info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccountInfo()
  }, [address, provider, basename])

  return { accountInfo, loading }
}