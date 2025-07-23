import { ethers } from 'ethers';

const VFLOW_RPC_URL = 'https://vflow-rpc.zkverify.io';
const XCM_PRECOMPILE_ADDRESS = '0x000000000000000000000000000000000000080C';

const teleportABI = [
  {
    "name": "teleportToRelayChain",
    "type": "function",
    "inputs": [
      { "name": "destinationAccount", "type": "bytes32" },
      { "name": "amount", "type": "uint256" },
    ],
    "outputs": [],
    "stateMutability": "nonpayable",
  },
];

export class VFlowWalletService {
  private static provider: ethers.JsonRpcProvider | null = null;

  private static getProvider(): ethers.JsonRpcProvider {
    if (!this.provider) {
      this.provider = new ethers.JsonRpcProvider(VFLOW_RPC_URL);
    }
    return this.provider;
  }

  static async getAccountBalance(address: string): Promise<string> {
    const provider = this.getProvider();
    const balance = await provider.getBalance(address);
    return balance.toString();
  }

  static async teleportToRelayChain(
    signer: ethers.Signer,
    destinationAccount: string,
    amount: string
  ): Promise<ethers.TransactionResponse> {
    const contract = new ethers.Contract(XCM_PRECOMPILE_ADDRESS, teleportABI, signer);
    
    const amountInWei = ethers.parseUnits(amount, 18);

    // Validate destinationAccount is a 32-byte hex string
    if (!ethers.isHexString(destinationAccount) || destinationAccount.length !== 66) {
        throw new Error('Invalid destination account format. Must be a 32-byte hex string (e.g., 0x...).');
    }

    const tx = await contract.teleportToRelayChain(destinationAccount, amountInWei, {
      gasLimit: 200000
    });
    return tx;
  }
} 