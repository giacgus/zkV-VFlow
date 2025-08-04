export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

export const vflowNetwork: NetworkConfig = {
  chainId: '0x581', // 1409 in decimal
  chainName: 'VFlow Testnet',
  nativeCurrency: {
    name: 'tVFY',
    symbol: 'tVFY',
    decimals: 18,
  },
  rpcUrls: ['https://vflow-rpc.zkverify.io'],
  blockExplorerUrls: ['https://vflow-testnet.subscan.io/'],
};

export const zkVerifyNetwork = {
    chainName: 'zkVerify Testnet',
    rpcUrls: ['wss://volta-rpc.zkverify.io'],
    blockExplorerUrls: ['https://zkverify-testnet.subscan.io/'],
};
