import { ethers } from 'ethers';
import { vflowNetwork, NetworkConfig } from '../config/networks';

export class NetworkService {
  private static getEthereum(): any {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    throw new Error('MetaMask is not installed. Please install it to use this feature.');
  }

  static async checkAndSwitchNetwork(): Promise<void> {
    const ethereum = this.getEthereum();
    const provider = new ethers.BrowserProvider(ethereum);

    const network = await provider.getNetwork();
    
    if (network.chainId.toString() !== BigInt(vflowNetwork.chainId).toString()) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: vflowNetwork.chainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: vflowNetwork.chainId,
                  chainName: vflowNetwork.chainName,
                  rpcUrls: vflowNetwork.rpcUrls,
                  nativeCurrency: vflowNetwork.nativeCurrency,
                  blockExplorerUrls: vflowNetwork.blockExplorerUrls,
                },
              ],
            });
          } catch (addError) {
            console.error('Failed to add the VFlow network to MetaMask', addError);
            throw new Error('Failed to add the VFlow network to MetaMask.');
          }
        } else {
          console.error('Failed to switch network', switchError);
          throw new Error('Failed to switch to the VFlow network. Please switch manually in MetaMask.');
        }
      }
    }
  }
} 