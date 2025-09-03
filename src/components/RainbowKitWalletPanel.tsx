import React from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { ethers } from 'ethers';
import { vflowChain } from '../providers/wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import vflowTempLogo from '../assets/VFlow_icon_round.png';
import './VFlowTeleport.css';

interface RainbowKitWalletPanelProps {
    type: 'VFlow';
    onHelp?: () => void;
}

const RainbowKitWalletPanel: React.FC<RainbowKitWalletPanelProps> = ({
    type,
    onHelp,
}) => {
    const { address, isConnected } = useAccount();
    const { data: balanceData } = useBalance({
        address,
        chainId: vflowChain.id,
        unit: 'wei',
    });
    const { disconnect } = useDisconnect();

    const handleDisconnect = () => {
        disconnect();
    };

    const balance = balanceData && balanceData.value
        ? Number(ethers.formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)
        : '0.0000';

    return (
        <div className="panel">
            <div className="panel-header">
                <img src={vflowTempLogo} alt={`${type} Logo`} className="logo" />
                <h2>{type}</h2>
            </div>
            {isConnected && address ? (
                <div>
                    <div className="address-display">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                    <div className="balance-display">
                        Balance: {balance} tVFY
                    </div>
                    <div className="disconnect-container">
                        <button onClick={handleDisconnect} className="disconnect-button">Disconnect</button>
                        <span className="disconnect-tooltip">
                            To fully disconnect, you must do so from your wallet extension.
                        </span>
                    </div>
                </div>
            ) : (
                <ConnectButton />
            )}
        </div>
    );
};

export default RainbowKitWalletPanel;
