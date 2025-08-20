import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, zora } from 'wagmi/chains';
import { defineChain } from 'viem';

export const vflowChain = defineChain({
    id: 1409,
    name: 'VFlow Testnet',
    nativeCurrency: { name: 'tVFY', symbol: 'tVFY', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://vflow-volta-rpc.zkverify.io'] },
        public: { http: ['https://vflow-volta-rpc.zkverify.io'] },
    },
    blockExplorers: {
        default: { name: 'Subscan', url: 'https://vflow-testnet.subscan.io' },
    },
    testnet: true,
});

export const config = getDefaultConfig({
    appName: 'zkV-VFlow',
    projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
    chains: [vflowChain, mainnet, polygon, optimism, arbitrum, base, zora],
    ssr: true,
});
