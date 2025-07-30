import React from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import vflowTempLogo from '../assets/vflow_temp.png';
import zkVerifyLogo from '../assets/zkverify_logo.png';

interface WalletPanelProps {
  type: 'zkVerify' | 'VFlow';
  isConnected: boolean;
  accounts?: InjectedAccountWithMeta[];
  selectedAccount?: InjectedAccountWithMeta | null;
  address?: string;
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
  error,
  onConnect,
  onDisconnect,
  onAccountChange,
  isLoading,
  onHelp,
}) => {
  const logo = type === 'zkVerify' ? zkVerifyLogo : vflowTempLogo;
  const name = type === 'zkVerify' ? 'zkVerify' : 'VFlow';

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
          {type === 'VFlow' && address && (
            <div className="address-display">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}
          <button onClick={onDisconnect} className="disconnect-button">Disconnect</button>
        </div>
      ) : (
        <button onClick={onConnect} disabled={isLoading}>Connect Wallet</button>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default WalletPanel; 