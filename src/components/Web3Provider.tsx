'use client'

import React, { ReactNode } from 'react'
import { config } from '@/lib/wagmi-config'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Don't re-fetch on window focus or component mount — prevents slowdowns on navigation
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: false,
            staleTime: 30_000, // cache for 30s
        },
    },
})

export function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
