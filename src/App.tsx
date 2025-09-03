import React from 'react';
import './App.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { Providers } from './providers/WagmiProvider';
import WalletConnect from './components/WalletConnect';
import '@rainbow-me/rainbowkit/styles.css';

function App() {
  return (
    <Providers>
      <RainbowKitProvider>
        <div className="App">
          <main>
            <WalletConnect />
          </main>
        </div>
      </RainbowKitProvider>
    </Providers>
  );
}

export default App;
