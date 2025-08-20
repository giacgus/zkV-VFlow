# RainbowKit Integration for zkV-VFlow

This project now uses RainbowKit for EVM wallet management, providing support for multiple wallets including Rainbow Wallet, MetaMask, WalletConnect, and more.

## What's New

- **RainbowKit Integration**: Modern wallet connection UI with support for 50+ wallets
- **Vite Build System**: Faster development and build times
- **TypeScript 5.x**: Latest TypeScript features and improvements
- **Wagmi Hooks**: React hooks for Ethereum interactions

## Supported Wallets

RainbowKit automatically detects and supports:
- Rainbow Wallet (mobile & desktop)
- MetaMask
- WalletConnect
- Coinbase Wallet
- Trust Wallet
- And 50+ more wallets

## Setup Requirements

1. **WalletConnect Project ID**: You need to get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. **Update Configuration**: Replace `YOUR_PROJECT_ID` in `src/providers/wagmi.ts`

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture

- **Polkadot Wallets**: Still handled by `@polkadot/extension-dapp` for zkVerify chain
- **EVM Wallets**: Now handled by RainbowKit + Wagmi for VFlow chain
- **Dual Chain Support**: Maintains the same teleport functionality between chains

## Configuration

The main configuration is in `src/providers/wagmi.ts`:

```typescript
export const config = getDefaultConfig({
  appName: 'zkV-VFlow',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [mainnet, polygon, optimism, arbitrum, base, zora],
  ssr: true,
});
```

## Benefits

1. **Better UX**: Modern wallet connection interface
2. **Mobile Support**: Works with mobile wallets like Rainbow
3. **Wallet Detection**: Automatically detects installed wallets
4. **Network Switching**: Built-in network switching support
5. **Error Handling**: Better error messages and user feedback

## Migration Notes

- VFlow wallet connection now uses RainbowKit instead of direct `window.ethereum`
- Balance display is handled by Wagmi hooks
- Network switching is managed by RainbowKit
- The same teleport functionality is preserved
