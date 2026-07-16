import { useState, useCallback, useEffect } from 'react';
import { WalletState } from '../types';

interface FreighterModule {
  isConnected: () => Promise<{ isConnected: boolean }>;
  getAddress: () => Promise<{ address: string }>;
  getNetwork: () => Promise<{ network: string; networkPassphrase: string }>;
  signTransaction: (xdr: string, opts?: { networkPassphrase?: string; address?: string }) => Promise<{ signedTxXdr: string }>;
  setAllowed: () => Promise<{ isAllowed: boolean }>;
}

declare global {
  interface Window {
    freighter?: FreighterModule;
  }
}

const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    publicKey: null,
    network: null,
  });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      if (typeof window.freighter === 'undefined') {
        setWallet({ connected: false, publicKey: null, network: null });
        return;
      }
      const { isConnected } = await window.freighter.isConnected();
      if (isConnected) {
        const { address } = await window.freighter.getAddress();
        const { network } = await window.freighter.getNetwork();
        setWallet({ connected: true, publicKey: address, network });
      } else {
        setWallet({ connected: false, publicKey: null, network: null });
      }
    } catch {
      setWallet({ connected: false, publicKey: null, network: null });
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      if (typeof window.freighter === 'undefined') {
        throw new Error('Freighter wallet not detected. Please install the Freighter browser extension.');
      }

      const { isAllowed } = await window.freighter.setAllowed();
      if (!isAllowed) {
        throw new Error('Connection to Freighter was denied.');
      }

      const { address } = await window.freighter.getAddress();
      const { network } = await window.freighter.getNetwork();
      setWallet({ connected: true, publicKey: address, network });
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Freighter wallet.');
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ connected: false, publicKey: null, network: null });
    setError(null);
  }, []);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    if (typeof window.freighter === 'undefined') {
      throw new Error('Freighter wallet not detected.');
    }
    const { signedTxXdr } = await window.freighter.signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
      address: wallet.publicKey || undefined,
    });
    return signedTxXdr;
  }, [wallet.publicKey]);

  return {
    wallet,
    connecting,
    error,
    connect,
    disconnect,
    signTransaction,
    checkConnection,
  };
}
