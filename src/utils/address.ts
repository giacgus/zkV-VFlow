import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

export const ss58ToHex = (ss58Address: string): string => {
  try {
    const decoded = decodeAddress(ss58Address);
    return u8aToHex(decoded);
  } catch (error) {
    console.error("Error decoding SS58 address:", error);
    throw new Error("Invalid SS58 address format.");
  }
}; 