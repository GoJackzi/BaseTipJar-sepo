'use client'

import { OnchainKitProvider } from '@coinbase/onchainkit'
import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { walletConnect, injected } from 'wagmi/connectors'

const queryClient = new QueryClient()

const chainEnv = process.env.NEXT_PUBLIC_CHAIN_ENV
const defaultChain = chainEnv === 'mainnet' ? base : baseSepolia

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? [
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      })
    ] : []),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org')
  }
})

export function AppOnchainKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
            <OnchainKitProvider 
              config={wagmiConfig} 
              chain={defaultChain}
              apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
              walletConnectProjectId={process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || undefined}
            >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
