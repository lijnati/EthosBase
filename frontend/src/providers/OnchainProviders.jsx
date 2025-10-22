import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { wagmiConfig } from '../config/wagmi'
import { onchainKitConfig } from '../config/onchainkit'

// Create a client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
})

export function OnchainProviders({ children }) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <OnchainKitProvider
                    apiKey={onchainKitConfig.apiKey}
                    chain={onchainKitConfig.chain}
                    schemaId={onchainKitConfig.schemaId}
                >
                    {children}
                </OnchainKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}