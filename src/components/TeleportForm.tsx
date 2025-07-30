import React from 'react';
import { ethers } from 'ethers';

interface TeleportFormProps {
  teleportDirection: 'zkv-to-vflow' | 'vflow-to-zkv';
  zkVerifyBalance: string;
  vflowBalance: string;
  amount: string;
  onAmountChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  isLoading: boolean;
  getButton: () => React.ReactNode;
}

const TeleportForm: React.FC<TeleportFormProps> = ({
  teleportDirection,
  zkVerifyBalance,
  vflowBalance,
  amount,
  onAmountChange,
  onSubmit,
  isLoading,
  getButton,
}) => {

  const formatBalance = (balance: string) => {
    try {
      const balanceBigInt = BigInt(balance);
      const decimals = 18;
      const integerPart = balanceBigInt / BigInt(10 ** decimals);
      const fractionalPart = balanceBigInt % BigInt(10 ** decimals);
      const fractionalString = fractionalPart.toString().padStart(decimals, '0').substring(0, 4);
      return `${integerPart}.${fractionalString}`;
    } catch (e) {
      console.error("Could not format balance", e);
      return "0.0000";
    }
  };

  const handleSetMaxAmount = () => {
    const balance = teleportDirection === 'zkv-to-vflow' ? zkVerifyBalance : vflowBalance;
    const balanceBN = ethers.parseUnits(ethers.formatUnits(balance, 18), 18);
    const feeBuffer = ethers.parseUnits('0.01', 18);

    if (balanceBN > feeBuffer) {
      const maxAmount = balanceBN - feeBuffer;
      onAmountChange(ethers.formatUnits(maxAmount, 18));
    } else {
      onAmountChange('0');
    }
  };
  
  return (
    <form onSubmit={onSubmit} className="teleport-form">
      <div className="balance-display-container">
        <span>Balance: {formatBalance(
          teleportDirection === 'zkv-to-vflow'
            ? zkVerifyBalance
            : vflowBalance
        )} tVFY</span>
      </div>
      <div className="amount-input-container">
        <input
          type="number"
          step="any"
          value={amount}
          onChange={e => onAmountChange(e.target.value)}
          placeholder="0.0"
          disabled={isLoading}
        />
        <button type="button" className="max-button" onClick={handleSetMaxAmount}>Max</button>
        <div className="token-label">tVFY</div>
      </div>
      <div className="button-container">{getButton()}</div>
    </form>
  );
};

export default TeleportForm; 