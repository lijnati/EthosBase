import { ethers } from 'ethers'

// Base Mainnet L2 Resolver address
const BASE_L2_RESOLVER = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD'

// Simple cache to avoid repeated lookups
const basenameCache = new Map()

/**
 * Resolve an address to its Basename (if any)
 * @param {string} address - Ethereum address
 * @param {object} provider - Ethers provider
 * @returns {Promise<string|null>} - Basename or null if not found
 */
export async function resolveBasename(address, provider) {
  if (!address || !provider) return null
  
  // Check cache first
  const cacheKey = address.toLowerCase()
  if (basenameCache.has(cacheKey)) {
    return basenameCache.get(cacheKey)
  }

  try {
    // Try to resolve using ENS-style reverse lookup
    const reverseName = await provider.lookupAddress(address)
    
    if (reverseName && reverseName.endsWith('.base.eth')) {
      basenameCache.set(cacheKey, reverseName)
      return reverseName
    }
    
    // Cache null result to avoid repeated failed lookups
    basenameCache.set(cacheKey, null)
    return null
  } catch (error) {
    console.log('Basename resolution failed:', error.message)
    basenameCache.set(cacheKey, null)
    return null
  }
}

/**
 * Format an address with Basename if available
 * @param {string} address - Ethereum address
 * @param {string|null} basename - Resolved basename
 * @returns {string} - Formatted display name
 */
export function formatAddressWithBasename(address, basename) {
  if (basename) {
    return basename
  }
  
  if (!address) return ''
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Get a short version of basename for display
 * @param {string} basename - Full basename
 * @returns {string} - Shortened basename
 */
export function shortenBasename(basename) {
  if (!basename) return ''
  
  if (basename.length <= 20) return basename
  
  const parts = basename.split('.')
  if (parts.length >= 2) {
    const name = parts[0]
    const domain = parts.slice(1).join('.')
    
    if (name.length > 12) {
      return `${name.slice(0, 8)}...${name.slice(-4)}.${domain}`
    }
  }
  
  return basename
}