import React, { useState, useEffect } from 'react';
import { ReactComponent as LoadingIcon } from '../assets/loading_icon.svg';
import { ReactComponent as SuccessIcon } from '../assets/success_icon.svg';
import { ReactComponent as ErrorIcon } from '../assets/error_icon.svg';
import { vflowNetwork, zkVerifyNetwork } from '../config/networks';

export type ModalStatus = 'idle' | 'loading' | 'success' | 'error';

interface TransactionModalProps {
  isOpen: boolean;
  status: ModalStatus;
  message: React.ReactNode;
  txHash: string;
  onClose: () => void;
  direction: 'zkv-to-vflow' | 'vflow-to-zkv';
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  status,
  message,
  txHash,
  onClose,
  direction,
}) => {
  const [isFinalSuccess, setIsFinalSuccess] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setIsFinalSuccess(true);
      }, 1000); 

      return () => clearTimeout(timer);
    } else {
      setIsFinalSuccess(false);
    }
  }, [status]);

  if (!isOpen) return null;

  const getExplorerLink = () => {
    if (!txHash) return undefined;
    
    let baseUrl = '';
    if (direction === 'vflow-to-zkv') {
      baseUrl = `${vflowNetwork.blockExplorerUrls?.[0] || ''}tx/`;
    } else {
      baseUrl = `${zkVerifyNetwork.blockExplorerUrls?.[0] || ''}extrinsic/`;
    }

    return `${baseUrl}${txHash}`;
  };
  
  const renderContent = () => {
    if (status === 'success' && !isFinalSuccess) {
      return (
        <>
          <LoadingIcon className="modal-icon loading-spinner" />
          <p>Transaction successful. Preparing link...</p>
        </>
      );
    }

    return (
      <>
        {status === 'loading' && <LoadingIcon className="modal-icon loading-spinner" />}
        {status === 'success' && isFinalSuccess && <SuccessIcon className="modal-icon" />}
        {status === 'error' && <ErrorIcon className="modal-icon" />}
        <p>{message}</p>
        {isFinalSuccess && txHash && (
          <p className="tx-hash">
            <a href={getExplorerLink()} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </a>
          </p>
        )}
        {(isFinalSuccess || status === 'error') && (
          <button onClick={onClose}>Close</button>
        )}
      </>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default TransactionModal;
