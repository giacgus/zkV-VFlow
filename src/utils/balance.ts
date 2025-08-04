import { ethers } from 'ethers';

export const formatBalance = (balance: string, decimals: number = 18): string => {
  if (!balance || isNaN(Number(balance))) {
    return '0.00';
  }
  const formatted = ethers.formatUnits(balance, decimals);
  // show 4 decimal places
  const parts = formatted.split('.');
  if (parts.length > 1) {
    return `${parts[0]}.${parts[1].slice(0, 4)}`;
  }
  return parts[0];
};
