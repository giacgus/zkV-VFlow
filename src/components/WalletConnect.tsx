import React, { useState, useEffect } from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { web3FromAddress, web3Enable } from '@polkadot/extension-dapp';
import { WalletService } from '../services/wallet';
import './VFlowTeleport.css';
import zkVerifyLogo from '../assets/zkverify_logo.png';
import { ReactComponent as VFlowLogo } from '../assets/vflow_logo.svg';
import { ReactComponent as LoadingIcon } from '../assets/loading_icon.svg';
import { ReactComponent as SuccessIcon } from '../assets/success_icon.svg';
import { ReactComponent as ErrorIcon } from '../assets/error_icon.svg';
import chevronIcon from '../assets/chevron.png';
import { ethers } from 'ethers';
import { ApiPromise } from '@polkadot/api';
import { VFlowWalletService } from '../services/vflow-wallet';
import { ss58ToHex } from '../utils/address';
import { NetworkService } from '../services/network';
import WalletPanel from './WalletPanel';
import TransactionModal, { ModalStatus } from './TransactionModal';
import TeleportForm from './TeleportForm';
import { getEthersProvider } from '../services/provider';

const VFLOW_CONFIG = {
  relayWsEndpoint: 'wss://volta-rpc.zkverify.io', // zkVerify Volta testnet RPC
  parachainId: 1, // Correct Parachain ID from the successful transaction
};

interface WalletState {
  zkVerify: {
    accounts: InjectedAccountWithMeta[];
    account: InjectedAccountWithMeta | null;
    balance: string;
    isConnected: boolean;
    error: string;
  };
  vflow: {
    address: string;
    balance: string;
    isConnected: boolean;
    error: string;
  };
}

const initialWalletState: WalletState = {
  zkVerify: { accounts: [], account: null, balance: '0', isConnected: false, error: '' },
  vflow: { address: '', balance: '0', isConnected: false, error: '' },
};

const WalletConnect: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<React.ReactNode>('');
  const [modalTxHash, setModalTxHash] = useState<string>('');
  const [modalStatus, setModalStatus] = useState<ModalStatus>('idle');
  const [amount, setAmount] = useState<string>('');
  const [teleportDirection, setTeleportDirection] = useState<'zkv-to-vflow' | 'vflow-to-zkv'>('zkv-to-vflow');
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isZkVerifyHelpOpen, setIsZkVerifyHelpOpen] = useState<boolean>(false);
  const [walletState, setWalletState] = useState<WalletState>(initialWalletState);

  useEffect(() => {
    web3Enable('zkV-VFlow Teleporter');
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (walletState.vflow.isConnected && accounts.length > 0) {
          setWalletState(prev => ({ ...prev, vflow: { ...prev.vflow, address: accounts[0] }}));
        } else if (accounts.length === 0) {
          handleDisconnect('vflow');
        }
      });
    }
  }, [walletState.vflow.isConnected]);

  useEffect(() => {
    if (walletState.zkVerify.account) {
      WalletService.getAccountBalance(walletState.zkVerify.account.address).then(balance => {
        setWalletState(prev => ({
          ...prev,
          zkVerify: { ...prev.zkVerify, balance }
        }));
      });
    }
    if (walletState.vflow.isConnected && walletState.vflow.address) {
      VFlowWalletService.getAccountBalance(walletState.vflow.address).then((balance: string) => {
        setWalletState(prev => ({
          ...prev,
          vflow: { ...prev.vflow, balance }
        }));
      });
    }
  }, [walletState.zkVerify.account, walletState.vflow.isConnected, walletState.vflow.address]);


  const connectToZkVerify = async () => {
    setIsLoading(true);
    try {
      await WalletService.checkWalletInstalled();
      const accounts = await WalletService.getAccounts();
      if (accounts.length > 0) {
        setWalletState(prev => ({
          ...prev,
          zkVerify: {
            ...prev.zkVerify,
            accounts: accounts,
            account: accounts[0],
            isConnected: true,
            error: ''
          }
        }));
      }
    } catch (error: any) {
      setWalletState(prev => ({ ...prev, zkVerify: { ...prev.zkVerify, error: error.message } }));
    } finally {
      setIsLoading(false);
    }
  };

  const connectToVFlow = async () => {
    try {
      // First, get the wallet to open and get the user's permission.
      const provider = getEthersProvider();
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];

      if (!address) {
        throw new Error("Could not connect to wallet.");
      }
      
      // Now that we have a connection, check if the network is correct.
      await NetworkService.checkAndSwitchNetwork();

      // Set state after everything is successful.
      setWalletState(prev => ({
        ...prev,
        vflow: { address: address, isConnected: true, error: '', balance: '0' },
      }));

    } catch (error: any) {
      setWalletState(prev => ({ ...prev, vflow: { ...prev.vflow, error: error.message } }));
    }
  };

  const handleDisconnect = (walletType: 'zkVerify' | 'vflow') => {
    if (walletType === 'zkVerify') {
      WalletService.disconnect();
      setWalletState(prev => ({
        ...prev,
        zkVerify: {
          accounts: [],
          account: null,
          balance: '0',
          isConnected: false,
          error: '',
        },
      }));
    } else {
      setWalletState(prev => ({
        ...prev,
        vflow: { address: '', isConnected: false, error: '', balance: '0' },
      }));
    }
    setModalMessage('');
    setModalTxHash('');
    setModalStatus('idle');
  };

  const handleZkVerifyAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAddress = event.target.value;
    const selectedAccount = walletState.zkVerify.accounts.find(acc => acc.address === selectedAddress);
    if (selectedAccount) {
      setWalletState(prev => ({
        ...prev,
        zkVerify: { ...prev.zkVerify, account: selectedAccount }
      }));
    }
  };

  const handleTeleport = async (event: React.FormEvent) => {
    event.preventDefault();

    const { account: zkVerifyAccount } = walletState.zkVerify;
    const { address: vflowAddress } = walletState.vflow;

    if ((teleportDirection === 'zkv-to-vflow' && !zkVerifyAccount) || (teleportDirection === 'vflow-to-zkv' && !vflowAddress)) {
      setModalMessage('Please connect both wallets and enter an amount.');
      setModalStatus('error');
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setModalMessage('Preparing transaction...');
    setModalStatus('loading');
    setIsModalOpen(true);
    setModalTxHash('');

    if (teleportDirection === 'zkv-to-vflow') {
      let api: ApiPromise | null = null;
      try {
        setModalMessage('Connecting to zkVerify network...');
        api = await WalletService.connectApi(VFLOW_CONFIG.relayWsEndpoint);
        const connectedApi = api;

        const amountInPlanck = ethers.parseUnits(amount, 18);

        const destination = {
          V5: {
            parents: 0,
            interior: { X1: [{ Parachain: VFLOW_CONFIG.parachainId }] },
          }
        };
        const beneficiary = {
          V5: {
            parents: 0,
            interior: { X1: [{ AccountKey20: { key: vflowAddress } }] },
          }
        };
        const assets = {
          V5: [
            {
              id: { Concrete: { parents: 0, interior: 'Here' } },
              fun: { Fungible: amountInPlanck.toString() },
            },
          ],
        };

        const tx = api.tx.xcmPallet.teleportAssets(destination, beneficiary, assets, 0);
        
        setModalMessage('Waiting for wallet signature...');
        const injector = await web3FromAddress(zkVerifyAccount!.address);
        
        await new Promise<void>((resolve, reject) => {
          tx.signAndSend(zkVerifyAccount!.address, { signer: injector.signer }, ({ status, events, dispatchError }) => {
            setModalTxHash(tx.hash.toHex());

            if (status.isInBlock) {
              setModalMessage(<>Transaction in block. <br/> Waiting for finalization...</>);
            } else if (status.isFinalized) {
              if (dispatchError) {
                if (dispatchError.isModule) {
                  const decoded = connectedApi.registry.findMetaError(dispatchError.asModule);
                  const { docs, name, section } = decoded;
                  reject(new Error(`Transaction Failed: ${section}.${name} - ${docs.join(' ')}`));
                } else {
                  reject(new Error(`Transaction Failed: ${dispatchError.toString()}`));
                }
                return;
              }

              const successEvent = events.find(({ event }) => connectedApi.events.system.ExtrinsicSuccess.is(event));
              if (successEvent) {
                setModalStatus('success');
                setModalMessage(<>Success! Tokens have been teleported. <br /> Transaction hash:</>);
                resolve();
              } else {
                reject(new Error('Transaction finalized but no success event was found.'));
              }

            } else if (status.isInvalid) {
                reject(new Error(`Transaction failed with status: ${status.type}`));
            } else {
              setModalMessage(`Transaction status: ${status.type}`);
            }
          }).catch((error: any) => {
            console.error("Sign and send error:", error);
            reject(error);
          });
        });

        setTimeout(() => {
          WalletService.getAccountBalance(zkVerifyAccount!.address).then(balance => {
            setWalletState(prev => ({ ...prev, zkVerify: { ...prev.zkVerify, balance } }));
          });
        }, 5000);

      } catch (error: any) {
        console.error('Error teleporting:', error);
        setModalMessage(`Error: ${error.message || 'An unknown error occurred.'}`);
        setModalStatus('error');
      } finally {
        setIsLoading(false);
        if (api) {
          api.disconnect();
        }
      }
    } else { // vflow-to-zkv
      try {
        await NetworkService.checkAndSwitchNetwork();
        
        const provider = getEthersProvider();
        const signer = await provider.getSigner(vflowAddress);
        
        const destinationHex = ss58ToHex(zkVerifyAccount!.address);

        setModalMessage('Sending transaction to VFlow...');
        const tx = await VFlowWalletService.teleportToRelayChain(signer, destinationHex, amount);
        
        setModalTxHash(tx.hash);
        setModalMessage(<>Transaction sent. <br/> Waiting for confirmation...</>);

        await tx.wait();

        setModalStatus('success');
        setModalMessage(<>Success! Tokens have been teleported. <br /> Transaction hash:</>);
        
        setTimeout(() => {
          VFlowWalletService.getAccountBalance(vflowAddress).then((balance: string) => {
            setWalletState(prev => ({ ...prev, vflow: { ...prev.vflow, balance } }));
          });
        }, 3000);

      } catch (error: any) {
        console.error('Error teleporting from VFlow:', error);
        setModalMessage(`Error: ${error.message || 'An unknown error occurred.'}`);
        setModalStatus('error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleDirection = () => {
    setTeleportDirection(prev => prev === 'zkv-to-vflow' ? 'vflow-to-zkv' : 'zkv-to-vflow');
    // Reset states when direction changes
    setAmount('');
  };

  const getButton = () => {
    if (!walletState.zkVerify.isConnected || !walletState.vflow.isConnected) {
      return <button type="button" disabled>Connect Wallets to Teleport</button>;
    }
    return <button type="submit" disabled={isLoading || !amount}>{isLoading ? 'Teleporting...' : 'Teleport'}</button>;
  };

  const fromPanel = teleportDirection === 'zkv-to-vflow' ? (
    <WalletPanel
      type="zkVerify"
      isConnected={walletState.zkVerify.isConnected}
      accounts={walletState.zkVerify.accounts}
      selectedAccount={walletState.zkVerify.account}
      error={walletState.zkVerify.error}
      onConnect={connectToZkVerify}
      onDisconnect={() => handleDisconnect('zkVerify')}
      onAccountChange={handleZkVerifyAccountChange}
      isLoading={isLoading}
      onHelp={() => setIsZkVerifyHelpOpen(true)}
    />
  ) : (
    <WalletPanel
      type="VFlow"
      isConnected={walletState.vflow.isConnected}
      address={walletState.vflow.address}
      error={walletState.vflow.error}
      onConnect={connectToVFlow}
      onDisconnect={() => handleDisconnect('vflow')}
      isLoading={isLoading}
      onHelp={() => {}} // No help for VFlow
    />
  );

  const toPanel = teleportDirection === 'zkv-to-vflow' ? (
    <WalletPanel
      type="VFlow"
      isConnected={walletState.vflow.isConnected}
      address={walletState.vflow.address}
      error={walletState.vflow.error}
      onConnect={connectToVFlow}
      onDisconnect={() => handleDisconnect('vflow')}
      isLoading={isLoading}
      onHelp={() => {}} // No help for VFlow
    />
  ) : (
    <WalletPanel
      type="zkVerify"
      isConnected={walletState.zkVerify.isConnected}
      accounts={walletState.zkVerify.accounts}
      selectedAccount={walletState.zkVerify.account}
      error={walletState.zkVerify.error}
      onConnect={connectToZkVerify}
      onDisconnect={() => handleDisconnect('zkVerify')}
      onAccountChange={handleZkVerifyAccountChange}
      isLoading={isLoading}
      onHelp={() => setIsZkVerifyHelpOpen(true)}
    />
  );


  return (
    <div className="teleport-container">
      <h1>zkVerify ↔ VFlow Teleport</h1>
      <div className="panels">
        {fromPanel}
        <div className="arrow-container" onClick={handleToggleDirection}>
            <img src={chevronIcon} alt="arrow" className="arrow-icon" />
            <span className="tooltip-text">Click to switch direction</span>
        </div>
        {toPanel}
      </div>

      {(walletState.zkVerify.isConnected && walletState.vflow.isConnected) && (
        <TeleportForm
          teleportDirection={teleportDirection}
          zkVerifyBalance={walletState.zkVerify.balance}
          vflowBalance={walletState.vflow.balance}
          amount={amount}
          onAmountChange={setAmount}
          onSubmit={handleTeleport}
          isLoading={isLoading}
          getButton={getButton}
        />
      )}
      
      <TransactionModal
        isOpen={isModalOpen}
        status={modalStatus}
        message={modalMessage}
        txHash={modalTxHash}
        onClose={() => setIsModalOpen(false)}
      />

      {isZkVerifyHelpOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-button" onClick={() => setIsZkVerifyHelpOpen(false)}>&times;</span>
            <h2>What is a zkVerify account?</h2>
            <p>A zkVerify account is a Substrate-based account. You can create one using extensions like Talisman or the Polkadot.js extension.</p>
            <p>Make sure you have one of these extensions installed and have created an account.</p>
          </div>
        </div>
      )}

      <div className="tutorial-link" onClick={() => setIsTutorialOpen(true)}>How to Teleport?</div>

      {isTutorialOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-button" onClick={() => setIsTutorialOpen(false)}>&times;</span>
            <h2>Teleport Tutorial</h2>
            <ol>
              <li>Connect your zkVerify compatible wallet (e.g., Talisman).</li>
              <li>Connect your EVM compatible wallet (e.g., MetaMask).</li>
              <li>Select the zkVerify account you want to send funds from.</li>
              <li>Enter the amount of tVFY you wish to teleport, or press "Max".</li>
              <li>Click "Teleport" and sign the transaction in your wallet.</li>
              <li>Wait for the confirmation message.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 