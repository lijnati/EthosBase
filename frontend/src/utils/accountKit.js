import { createConfig } from '@account-kit/react'
import { base, baseSepolia } from '@account-kit/react/chains'
import { createLightAccount } from '@account-kit/smart-contracts'

// Account Kit configuration
export const accountKitConfig = createConfig({
  // Replace with your actual API key from Alchemy
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY || 'demo',
  chain: baseSepolia, // Use baseSepolia for testing
  ssr: false, // Set to true if using server-side rendering
})

// Smart account configuration
export const smartAccountConfig = {
  type: 'LightAccount',
  accountParams: {},
  gasManagerConfig: {
    policyId: process.env.REACT_APP_GAS_MANAGER_POLICY_ID || '',
  },
}

// Create a light account (smart contract wallet)
export async function createSmartAccount(signer) {
  try {
    const account = await createLightAccount({
      signer,
      chain: baseSepolia,
      // Optional: specify salt for deterministic address
      // salt: '0x...'
    })
    
    return account
  } catch (error) {
    console.error('Error creating smart account:', error)
    throw error
  }
}

// Check if address is a smart contract account
export async function isSmartAccount(address, provider) {
  try {
    const code = await provider.getCode(address)
    return code !== '0x'
  } catch (error) {
    console.error('Error checking if smart account:', error)
    return false
  }
}

// Get account type (EOA or Smart Contract)
export async function getAccountType(address, provider) {
  const isContract = await isSmartAccount(address, provider)
  return isContract ? 'Smart Account' : 'EOA'
}

// Format account info with type
export function formatAccountInfo(address, basename, accountType) {
  const displayName = basename || `${address.slice(0, 6)}...${address.slice(-4)}`
  return {
    displayName,
    address,
    basename,
    accountType,
    isSmartAccount: accountType === 'Smart Account'
  }
}