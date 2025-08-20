import React, { useState, useEffect } from 'react';
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
          <div className="modal-icon loading-spinner"></div>
          <p>Transaction successful. Preparing link...</p>
        </>
      );
    }

    return (
      <>
        {status === 'loading' && <div className="modal-icon loading-spinner"></div>}
        {status === 'success' && isFinalSuccess && <div className="modal-icon success-icon"></div>}
        {status === 'error' && <div className="modal-icon error-icon"></div>}
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
