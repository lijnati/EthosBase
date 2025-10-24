import { useState, useEffect } from 'react'
import { resolveBasename } from '../utils/basename'

/**
 * Hook to resolve and manage Basename for an address
 * @param {string} address - Ethereum address to resolve
 * @param {object} provider - Ethers provider
 * @returns {object} - { basename, loading, error }
 */
export function useBasename(address, provider) {
  const [basename, setBasename] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!address || !provider) {
      setBasename(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    
    const resolve = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await resolveBasename(address, provider)
        
        if (!cancelled) {
          setBasename(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setBasename(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    resolve()

    return () => {
      cancelled = true
    }
  }, [address, provider])

  return { basename, loading, error }
}

/**
 * Hook to resolve multiple addresses to Basenames
 * @param {string[]} addresses - Array of addresses to resolve
 * @param {object} provider - Ethers provider
 * @returns {object} - { basenames: Map, loading, error }
 */
export function useBasenames(addresses, provider) {
  const [basenames, setBasenames] = useState(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!addresses?.length || !provider) {
      setBasenames(new Map())
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    
    const resolveAll = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const results = await Promise.allSettled(
          addresses.map(async (address) => {
            const basename = await resolveBasename(address, provider)
            return { address, basename }
          })
        )

        if (!cancelled) {
          const basenameMap = new Map()
          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              basenameMap.set(result.value.address, result.value.basename)
            }
          })
          setBasenames(basenameMap)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setBasenames(new Map())
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    resolveAll()

    return () => {
      cancelled = true
    }
  }, [addresses, provider])

  return { basenames, loading, error }
}