import { ethers } from 'ethers';

let provider: ethers.BrowserProvider | null = null;

export const getEthersProvider = (): ethers.BrowserProvider => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask is not installed. Please install it to use this feature.');
  }

  if (!provider) {
    provider = new ethers.BrowserProvider((window as any).ethereum);
  }
  
  return provider;
}; 