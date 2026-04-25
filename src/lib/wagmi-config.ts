import { http, createConfig } from 'wagmi'
import { polygonAmoy } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
    chains: [polygonAmoy],
    connectors: [
        injected(),
    ],
    transports: {
        [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_URL || 'https://rpc-amoy.polygon.technology', {
            batch: true,
            retryCount: 0, // don't retry failed calls
        }),
    },
    ssr: true,
})
