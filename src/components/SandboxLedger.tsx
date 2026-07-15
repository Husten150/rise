import React, { useState, useEffect, useRef } from 'react';
import { LedgerBlock, SimulatedTransaction } from '../types';
import { Play, Plus, RefreshCw, Layers, ShieldCheck, Database, Sliders, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SandboxLedger() {
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [transactions, setTransactions] = useState<SimulatedTransaction[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  
  // Stats
  const [totalOperations, setTotalOperations] = useState(1480);
  const [avgTps, setAvgTps] = useState(2.4);
  const [currentFeePool, setCurrentFeePool] = useState('142.508');

  // Interactive transaction creator
  const [txType, setTxType] = useState<'friendbot' | 'payment' | 'contract'>('payment');
  const [sourceAcc, setSourceAcc] = useState('GBC7W..._SENDER');
  const [destAcc, setDestAcc] = useState('GBK3Y..._RECIPIENT');
  const [txAmount, setTxAmount] = useState('100');
  const [txContractId, setTxContractId] = useState('CAS3X7...SWAP_P');
  const [txMethod, setTxMethod] = useState('swap');
  const [txStatusMsg, setTxStatusMsg] = useState<{ status: 'success' | 'error' | 'loading' | 'idle'; msg: string }>({ status: 'idle', msg: '' });

  // Stream Ref
  const streamIntervalRef = useRef<number | null>(null);

  // Generate initial mock data on mount
  useEffect(() => {
    const initialBlocks: LedgerBlock[] = [];
    let startSeq = 45821040;
    for (let i = 0; i < 4; i++) {
      initialBlocks.push({
        sequence: startSeq - i,
        hash: Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18),
        timestamp: new Date(Date.now() - i * 5000).toLocaleTimeString(),
        transactionCount: Math.floor(Math.random() * 5) + 1,
        totalFees: (Math.random() * 0.005 + 0.0001).toFixed(5),
        operationsCount: Math.floor(Math.random() * 8) + 1
      });
    }
    setBlocks(initialBlocks);

    const initialTxs: SimulatedTransaction[] = [
      {
        id: 'tx_1',
        hash: '9a8f273bde2c1f0d3e4a5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f',
        sourceAccount: 'GBC7W2O3..._SENDER',
        ledgerSequence: startSeq - 1,
        status: 'SUCCESS',
        fee: '0.00013',
        eventsCount: 1,
        timestamp: new Date(Date.now() - 3000).toLocaleTimeString()
      },
      {
        id: 'tx_2',
        hash: 'cb478fa9c0d12e3f4b5a6f7e8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
        sourceAccount: 'GBK8X9YY..._AMM_P',
        ledgerSequence: startSeq - 2,
        contractId: 'CAS3X7KY..._TOKEN_A',
        functionName: 'transfer',
        status: 'SUCCESS',
        fee: '0.00021',
        eventsCount: 3,
        timestamp: new Date(Date.now() - 8000).toLocaleTimeString()
      },
      {
        id: 'tx_3',
        hash: 'fe839d02c1b4a537f89d0e213b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
        sourceAccount: 'GD7Y2O3C..._USER',
        ledgerSequence: startSeq - 3,
        contractId: 'CBK8X9YY..._ESCROW',
        functionName: 'create_escrow',
        status: 'SUCCESS',
        fee: '0.00035',
        eventsCount: 2,
        timestamp: new Date(Date.now() - 14000).toLocaleTimeString()
      }
    ];
    setTransactions(initialTxs);
  }, []);

  // background block generation stream (Simulated ledger times)
  useEffect(() => {
    if (isStreaming) {
      streamIntervalRef.current = setInterval(() => {
        setBlocks(prev => {
          const newSeq = prev[0] ? prev[0].sequence + 1 : 45821041;
          const newBlock: LedgerBlock = {
            sequence: newSeq,
            hash: Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18),
            timestamp: new Date().toLocaleTimeString(),
            transactionCount: Math.floor(Math.random() * 4),
            totalFees: (Math.random() * 0.003 + 0.0001).toFixed(5),
            operationsCount: Math.floor(Math.random() * 5)
          };
          
          setTotalOperations(o => o + newBlock.operationsCount);
          setAvgTps(t => Math.round((2.0 + Math.random() * 1.5) * 10) / 10);
          setCurrentFeePool(p => (parseFloat(p) + parseFloat(newBlock.totalFees)).toFixed(3));
          
          // prune blocks at 8
          return [newBlock, ...prev.slice(0, 7)];
        });
      }, 5500);
    } else {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    }

    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [isStreaming]);

  // Handle custom transaction submissions
  const handleSimulateTx = (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatusMsg({ status: 'loading', msg: 'Broadcasting transaction envelope to local Stellar Validator node...' });

    setTimeout(() => {
      setTxStatusMsg({ status: 'loading', msg: 'Consensus verified. Ledger recording active...' });
    }, 800);

    setTimeout(() => {
      // Basic check for failure triggers
      if (txType === 'payment' && (sourceAcc.trim() === '' || destAcc.trim() === '')) {
        setTxStatusMsg({ status: 'error', msg: 'Transaction failed: Invalid source/destination account address parameters.' });
        return;
      }
      if (txType === 'payment' && parseFloat(txAmount) <= 0) {
        setTxStatusMsg({ status: 'error', msg: 'Transaction failed: Transfer amounts must be greater than zero.' });
        return;
      }

      const activeLedger = blocks[0]?.sequence || 45821040;
      const txHash = 'tx_hash_' + Math.random().toString(16).substring(2, 34);
      
      const newTx: SimulatedTransaction = {
        id: 'tx_sub_' + Date.now(),
        hash: txHash,
        sourceAccount: sourceAcc,
        ledgerSequence: activeLedger,
        status: 'SUCCESS',
        fee: txType === 'friendbot' ? '0.00000' : txType === 'contract' ? '0.00042' : '0.00011',
        eventsCount: txType === 'contract' ? 2 : txType === 'friendbot' ? 1 : 0,
        timestamp: new Date().toLocaleTimeString(),
        contractId: txType === 'contract' ? txContractId : undefined,
        functionName: txType === 'contract' ? txMethod : undefined
      };

      setTransactions(prev => [newTx, ...prev]);
      setTotalOperations(o => o + (txType === 'contract' ? 3 : 1));
      setTxStatusMsg({ status: 'success', msg: `Transaction finalized successfully in Ledger #${activeLedger}!` });

      // append a mock block update instantly to show react updates
      setBlocks(prev => {
        if (prev.length === 0) return prev;
        const head = { ...prev[0] };
        head.transactionCount += 1;
        head.operationsCount += txType === 'contract' ? 3 : 1;
        head.totalFees = (parseFloat(head.totalFees) + parseFloat(newTx.fee)).toFixed(5);
        return [head, ...prev.slice(1)];
      });
      
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Dynamic network metrics panel */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded p-4 shadow-sm">
          <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase font-bold">LATEST LEDGER HEIGHT</div>
          <div className="text-xl font-bold text-sky-400 font-mono mt-1">
            #{blocks[0]?.sequence || '45,821,040'}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Streaming Ledgers</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-4 shadow-sm">
          <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase font-bold">TOTAL SIMULATED OPERATIONS</div>
          <div className="text-xl font-bold text-slate-100 font-mono mt-1">
            {totalOperations.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Average block payload processing
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-4 shadow-sm">
          <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase font-bold">AVERAGE TPS (THROUGHPUT)</div>
          <div className="text-xl font-bold text-slate-100 font-mono mt-1">
            {avgTps} Tx/s
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Soroban WASM engine performance
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded p-4 shadow-sm">
          <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase font-bold">VALIDATOR FEE POOL</div>
          <div className="text-xl font-bold text-slate-100 font-mono mt-1">
            {currentFeePool} XLM
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Aggregated execution fee reserves
          </div>
        </div>
      </div>

      {/* Main Ledger view & Transaction submitter */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Live Ledger stream block card list */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Soroban Local Ledger Simulator</h3>
              <p className="text-[11px] text-slate-400 mt-1">Simulates Stellar ledger creation, sequence increments, and operation batching.</p>
            </div>
            
            <button
              id="btn-toggle-sandbox-stream"
              onClick={() => setIsStreaming(!isStreaming)}
              className={`text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 rounded border font-medium transition flex items-center gap-1.5 ${
                isStreaming 
                  ? 'bg-rose-950/20 text-rose-300 border-rose-900/60 hover:bg-rose-900/20' 
                  : 'bg-emerald-950/20 text-emerald-300 border-emerald-900/60 hover:bg-emerald-900/20'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`} />
              {isStreaming ? 'Pause Stream' : 'Resume Stream'}
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {blocks.map((block) => (
                <motion.div
                  key={block.sequence}
                  initial={{ opacity: 0, y: -15, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-950/80 border border-slate-800/60 rounded p-3.5 font-mono text-xs text-slate-300 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-950 text-sky-400 p-2 rounded border border-sky-900/30">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100">Ledger #{block.sequence}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Hash: {block.hash.substring(0, 16)}...{block.hash.substring(48)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-800/60">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TXS</div>
                      <div className="text-slate-300 font-bold mt-0.5">{block.transactionCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">OPS</div>
                      <div className="text-slate-300 font-bold mt-0.5">{block.operationsCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">FEE TOTAL</div>
                      <div className="text-emerald-400 font-bold mt-0.5">{block.totalFees} XLM</div>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-500 font-semibold self-end md:self-center">
                    {block.timestamp}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Transaction History log list */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Transaction Ledger Registry</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-400 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[9px] text-slate-500 tracking-widest font-bold uppercase">
                  <th className="pb-3 font-semibold">TX HASH</th>
                  <th className="pb-3 font-semibold">SOURCE ACCOUNT</th>
                  <th className="pb-3 font-semibold text-center">STATUS</th>
                  <th className="pb-3 font-semibold text-right">FEE</th>
                  <th className="pb-3 font-semibold text-right">TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-950/20 transition">
                    <td className="py-3 font-semibold text-slate-300">
                      <span className="text-sky-400 hover:underline cursor-pointer">
                        {tx.hash.substring(0, 10)}...{tx.hash.substring(54)}
                      </span>
                      {tx.contractId && (
                        <span className="block text-[9px] text-slate-500 mt-0.5 font-normal">
                          Soroban Call: {tx.functionName}() on {tx.contractId.substring(0, 8)}...
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-[11px] text-slate-400">
                      {tx.sourceAccount}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        tx.status === 'SUCCESS' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                          : 'bg-rose-950 text-rose-400 border border-rose-900'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-300">
                      {tx.fee} XLM
                    </td>
                    <td className="py-3 text-right text-slate-500 text-[10px]">
                      {tx.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Transaction Creator Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Simulate Transaction</h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
            Construct and sign customized Stellar & Soroban transactions directly in the browser sandbox.
          </p>

          <form onSubmit={handleSimulateTx} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-mono text-[10px] uppercase font-semibold">Transaction Operation Type</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                <button
                  type="button"
                  id="btn-tx-type-friendbot"
                  onClick={() => { setTxType('friendbot'); setSourceAcc('GBC7W..._FRIEND'); }}
                  className={`py-1 text-[9px] uppercase font-mono tracking-wider font-bold rounded transition ${txType === 'friendbot' ? 'bg-sky-500 text-slate-950 shadow-[0_0_8px_rgba(14,165,233,0.3)]' : 'text-slate-400'}`}
                >
                  Friendbot
                </button>
                <button
                  type="button"
                  id="btn-tx-type-payment"
                  onClick={() => { setTxType('payment'); setSourceAcc('GBC7W..._SENDER'); }}
                  className={`py-1 text-[9px] uppercase font-mono tracking-wider font-bold rounded transition ${txType === 'payment' ? 'bg-sky-500 text-slate-950 shadow-[0_0_8px_rgba(14,165,233,0.3)]' : 'text-slate-400'}`}
                >
                  Payment
                </button>
                <button
                  type="button"
                  id="btn-tx-type-contract"
                  onClick={() => { setTxType('contract'); setSourceAcc('GD7Y2..._CALLER'); }}
                  className={`py-1 text-[9px] uppercase font-mono tracking-wider font-bold rounded transition ${txType === 'contract' ? 'bg-sky-500 text-slate-950 shadow-[0_0_8px_rgba(14,165,233,0.3)]' : 'text-slate-400'}`}
                >
                  Soroban
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase font-semibold">Source Account Keypair</label>
              <input
                type="text"
                value={sourceAcc}
                onChange={(e) => setSourceAcc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500"
                placeholder="G..."
              />
            </div>

            {txType === 'payment' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase font-semibold">Destination Recipient Account</label>
                  <input
                    type="text"
                    value={destAcc}
                    onChange={(e) => setDestAcc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500"
                    placeholder="G..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase font-semibold">Payment Amount (XLM)</label>
                  <input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500"
                    placeholder="0"
                  />
                </div>
              </>
            )}

            {txType === 'contract' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase font-semibold">Contract ID Address</label>
                  <input
                    type="text"
                    value={txContractId}
                    onChange={(e) => setTxContractId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500"
                    placeholder="C..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase font-semibold">Invoking Method</label>
                    <input
                      type="text"
                      value={txMethod}
                      onChange={(e) => setTxMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase font-semibold">Mock Gas Fee</label>
                    <span className="block p-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-400 text-[11px]">
                      0.00042 XLM
                    </span>
                  </div>
                </div>
              </>
            )}

            {txType === 'friendbot' && (
              <div className="p-3 bg-sky-950/10 border border-sky-900/30 rounded text-[11px] text-slate-400 leading-relaxed font-mono">
                Friendbot is an automatic Stellar Faucet helper. Submitting this will distribute 10,000 test tokens (XLM) to your designated address instantly.
              </div>
            )}

            {txStatusMsg.status !== 'idle' && (
              <div className={`p-3 rounded border text-[11px] leading-relaxed font-mono flex items-start gap-2 ${
                txStatusMsg.status === 'loading'
                  ? 'bg-sky-950/10 border-sky-900/40 text-sky-300'
                  : txStatusMsg.status === 'success'
                  ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-900/50 text-rose-300'
              }`}>
                {txStatusMsg.status === 'loading' && (
                  <svg className="animate-spin h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span>{txStatusMsg.msg}</span>
              </div>
            )}

            <button
              id="btn-submit-tx-simulation"
              type="submit"
              disabled={txStatusMsg.status === 'loading'}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold p-2.5 rounded transition flex items-center justify-center gap-1.5 shadow text-[10px] uppercase font-mono tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              Sign & Submit Tx
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
