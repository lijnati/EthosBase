import { useState, useEffect } from 'react'
import { reverseResolveAddress, resolveBasename } from '../utils/basenames'

export function useBasename(address, chainId) {
  const [basename, setBasename] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!address || !chainId) return

    const fetchBasename = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const resolvedBasename = await reverseResolveAddress(address, chainId)
        setBasename(resolvedBasename)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching basename:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBasename()
  }, [address, chainId])

  return { basename, loading, error }
}

export function useBasenameResolver() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const resolveAddress = async (basename, chainId) => {
    setLoading(true)
    setError(null)
    
    try {
      const address = await resolveBasename(basename, chainId)
      return address
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { resolveAddress, loading, error }
}