import React from 'react';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface WalletConnectorProps {
  onConnect?: (publicKey: string) => void;
  onDisconnect?: () => void;
}

export default function WalletConnector({ onConnect, onDisconnect }: WalletConnectorProps) {
  const { wallet, connecting, error, connect, disconnect } = useWallet();

  const handleConnect = async () => {
    await connect();
    if (wallet.publicKey && onConnect) {
      onConnect(wallet.publicKey);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    if (onDisconnect) onDisconnect();
  };

  const formatKey = (key: string) =>
    `${key.slice(0, 4)}...${key.slice(-4)}`;

  if (wallet.connected && wallet.publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/30 border border-emerald-800/40 rounded text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <span className="text-emerald-400">{formatKey(wallet.publicKey)}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[10px]">
            {wallet.network === 'TESTNET' ? 'Testnet' : wallet.network || 'Unknown'}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded transition"
          title="Disconnect wallet"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 rounded text-[11px] font-mono uppercase tracking-wider transition disabled:opacity-50"
      >
        <Wallet className="w-3.5 h-3.5" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <div className="absolute top-full mt-2 right-0 w-72 p-3 bg-red-950/90 border border-red-800/50 rounded text-[11px] text-red-300 font-mono z-50 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
