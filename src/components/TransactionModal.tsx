import React from 'react';
import { ReactComponent as LoadingIcon } from '../assets/loading_icon.svg';
import { ReactComponent as SuccessIcon } from '../assets/success_icon.svg';
import { ReactComponent as ErrorIcon } from '../assets/error_icon.svg';

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
  if (!isOpen) return null;

  const getExplorerLink = () => {
    if (!txHash) return undefined;
    // zkV -> VFlow is an extrinsic
    // VFlow -> zkV is a tx
    const baseUrl = direction === 'vflow-to-zkv'
      ? 'https://1780.prev.subscan.io/tx/' 
      : 'https://1780.prev.subscan.io/extrinsic/';
    return `${baseUrl}${txHash}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {status === 'loading' && <LoadingIcon className="modal-icon loading-spinner" />}
        {status === 'success' && <SuccessIcon className="modal-icon" />}
        {status === 'error' && <ErrorIcon className="modal-icon" />}
        <p>{message}</p>
        {txHash && (
          <p className="tx-hash">
            <a href={getExplorerLink()} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </a>
          </p>
        )}
        {(status === 'success' || status === 'error') && (
          <button onClick={onClose}>Close</button>
        )}
      </div>
    </div>
  );
};

export default TransactionModal; 