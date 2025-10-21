import { createPublicClient, http, normalize } from 'viem'
import { base, baseSepolia } from 'viem/chains'

// Basenames contract addresses
const BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_MAINNET = '0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5'
const BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_SEPOLIA = '0x49aE3cC2e3AA768B1e99B24EEA346bd13afDBD19'

const L2_RESOLVER_ADDRESS_MAINNET = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD'
const L2_RESOLVER_ADDRESS_SEPOLIA = '0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA'

// Create clients for both networks
export const publicClientMainnet = createPublicClient({
  chain: base,
  transport: http()
})

export const publicClientSepolia = createPublicClient({
  chain: baseSepolia,
  transport: http()
})

// Get the appropriate client and addresses based on chain
export function getBasenamesConfig(chainId) {
  const isMainnet = chainId === 8453
  
  return {
    client: isMainnet ? publicClientMainnet : publicClientSepolia,
    registrarAddress: isMainnet 
      ? BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_MAINNET 
      : BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_SEPOLIA,
    resolverAddress: isMainnet 
      ? L2_RESOLVER_ADDRESS_MAINNET 
      : L2_RESOLVER_ADDRESS_SEPOLIA,
    chain: isMainnet ? base : baseSepolia
  }
}

// Resolve basename to address
export async function resolveBasename(basename, chainId = 84532) {
  try {
    const { client, resolverAddress } = getBasenamesConfig(chainId)
    
    const normalizedName = normalize(basename)
    const address = await client.readContract({
      address: resolverAddress,
      abi: [
        {
          inputs: [{ name: 'name', type: 'bytes32' }],
          name: 'addr',
          outputs: [{ name: '', type: 'address' }],
          stateMutability: 'view',
          type: 'function'
        }
      ],
      functionName: 'addr',
      args: [normalizedName]
    })
    
    return address
  } catch (error) {
    console.error('Error resolving basename:', error)
    return null
  }
}

// Reverse resolve address to basename
export async function reverseResolveAddress(address, chainId = 84532) {
  try {
    const { client, resolverAddress } = getBasenamesConfig(chainId)
    
    const basename = await client.readContract({
      address: resolverAddress,
      abi: [
        {
          inputs: [{ name: 'addr', type: 'address' }],
          name: 'name',
          outputs: [{ name: '', type: 'string' }],
          stateMutability: 'view',
          type: 'function'
        }
      ],
      functionName: 'name',
      args: [address]
    })
    
    return basename || null
  } catch (error) {
    console.error('Error reverse resolving address:', error)
    return null
  }
}

// Check if basename is available
export async function isBasenameAvailable(basename, chainId = 84532) {
  try {
    const { client, registrarAddress } = getBasenamesConfig(chainId)
    
    const available = await client.readContract({
      address: registrarAddress,
      abi: [
        {
          inputs: [{ name: 'name', type: 'string' }],
          name: 'available',
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'view',
          type: 'function'
        }
      ],
      functionName: 'available',
      args: [basename]
    })
    
    return available
  } catch (error) {
    console.error('Error checking basename availability:', error)
    return false
  }
}

// Format address with basename if available
export function formatAddressWithBasename(address, basename) {
  if (basename) {
    return `${basename} (${address.slice(0, 6)}...${address.slice(-4)})`
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}