import React from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import vflowTempLogo from '../assets/VFlow_icon_round.png';
import zkVerifyLogo from '../assets/zkverify_logo.png';

interface WalletPanelProps {
  type: 'zkVerify' | 'VFlow';
  isConnected: boolean;
  accounts?: InjectedAccountWithMeta[];
  selectedAccount?: InjectedAccountWithMeta | null;
  address?: string;
  balance?: string;
  tokenSymbol?: string;
  error: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onAccountChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  isLoading: boolean;
  onHelp: () => void;
}

const WalletPanel: React.FC<WalletPanelProps> = ({
  type,
  isConnected,
  accounts,
  selectedAccount,
  address,
  balance,
  tokenSymbol,
  error,
  onConnect,
  onDisconnect,
  onAccountChange,
  isLoading,
  onHelp,
}) => {
  const logo = type === 'zkVerify' ? zkVerifyLogo : vflowTempLogo;
  const name = type === 'zkVerify' ? 'zkVerify' : 'VFlow';

  const formatBalance = (raw?: string) => {
    if (!raw) return '0.0000';
    try {
      const value = BigInt(raw);
      const decimals = 18;
      const integerPart = value / BigInt(10 ** decimals);
      const fractionalPart = value % BigInt(10 ** decimals);
      const fractionalString = fractionalPart.toString().padStart(decimals, '0').substring(0, 4);
      return `${integerPart}.${fractionalString}`;
    } catch {
      return '0.0000';
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <img src={logo} alt={`${name} Logo`} className="logo" />
        <h2>{name}</h2>
        {type === 'zkVerify' && <div className="help-icon" onClick={onHelp}>?</div>}
      </div>
      {isConnected ? (
        <div>
          {type === 'zkVerify' && accounts && onAccountChange && selectedAccount && (
            <select onChange={onAccountChange} value={selectedAccount.address}>
              {accounts.map(acc => (
                <option key={acc.address} value={acc.address}>
                  {acc.meta.name} ({acc.address.slice(0, 6)}...{acc.address.slice(-4)})
                </option>
              ))}
            </select>
          )}
          {type === 'zkVerify' && (
            <div className="balance-display">Balance: {formatBalance(balance)} {tokenSymbol || 'tVFY'}</div>
          )}
          {type === 'VFlow' && address && (
            <div className="address-display">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}
          <div className="disconnect-container">
            <button onClick={onDisconnect} className="disconnect-button">Disconnect</button>
            <span className="disconnect-tooltip">
              To fully disconnect, you must do so from your wallet extension.
            </span>
          </div>
        </div>
      ) : (
        <button className="substrate-connect" onClick={onConnect} disabled={isLoading}>Connect Wallet</button>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default WalletPanel;
