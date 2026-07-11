import React, { useState } from 'react';
import { Network, ArrowRight, ShieldCheck, Cpu, Zap, Activity, Info, Coins, Radio } from 'lucide-react';
import { motion } from 'motion/react';

interface VisStep {
  title: string;
  desc: string;
  active: boolean;
  done: boolean;
}

export default function InterContractVisualizer() {
  const [activeModel, setActiveModel] = useState<'swap_sac' | 'escrow_release' | 'oracle_query'>('swap_sac');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState<number>(-1);
  const [gasConsumed, setGasConsumed] = useState<number>(0);
  const [latestEvents, setLatestEvents] = useState<{ topic: string; data: string; time: string }[]>([]);

  // Simulation parameters
  const [swapAmount, setSwapAmount] = useState('500');
  const [oracleAsset, setOracleAsset] = useState('XLM');

  // Multi-step flow descriptors based on active layout model
  const stepsMap: Record<typeof activeModel, VisStep[]> = {
    swap_sac: [
      { title: 'Signature Auth Check', desc: 'Sender GD7Y... signs transaction. Contract verifies signature with sender.require_auth().', active: false, done: false },
      { title: 'Reserve Fetch', desc: 'Swap Contract reads reserve_a (10000) and reserve_b (10000) from instance storage.', active: false, done: false },
      { title: 'Inter-Contract Transfer IN', desc: 'Swap Contract calls SAC Token A Contract: client_a.transfer(sender, swap_pool, 500).', active: false, done: false },
      { title: 'AMM Price Formula', desc: 'Swap Contract evaluates x * y = k. Deducts 0.3% LP fee. Output computed: 453 Token B.', active: false, done: false },
      { title: 'Inter-Contract Transfer OUT', desc: 'Swap Contract calls SAC Token B Contract: client_b.transfer(swap_pool, sender, 453).', active: false, done: false },
      { title: 'State Update & Event Emission', desc: 'Updates local reserve states. Emits soroban event "swap" (topics: sender, amount_in, amount_out).', active: false, done: false }
    ],
    escrow_release: [
      { title: 'Query Signatures state', desc: 'Escrow reads approved_a and approved_b from instance state storage.', active: false, done: false },
      { title: 'Auth Release Check', desc: 'Ensures both approvals are verified: assert!(approved_a && approved_b).', active: false, done: false },
      { title: 'Inter-Contract Transfer OUT', desc: 'Escrow Contract calls Standard SAC Token Contract: client.transfer(escrow, recipient, locked_funds).', active: false, done: false },
      { title: 'Persistent Storage Cleanup', desc: 'Contract deletes depositor and signer keys from storage to claim gas refunds.', active: false, done: false },
      { title: 'Publish Event', desc: 'Emits event "escrow_released" (topics: recipient, amount).', active: false, done: false }
    ],
    oracle_query: [
      { title: 'Router Triggered', desc: 'User calls get_asset_valuation(oracle_address, asset).', active: false, done: false },
      { title: 'Cross-Contract Call', desc: 'Router instantiates PriceOracleClient and calls oracle_client.get_price(asset).', active: false, done: false },
      { title: 'Oracle Query execution', desc: 'Oracle Contract resolves latest signed oracle prices from its own persistent storage.', active: false, done: false },
      { title: 'Normalize & return', desc: 'Router scales decimal values, emits event "cross_contract_query" and returns output.', active: false, done: false }
    ]
  };

  const steps = stepsMap[activeModel];

  const triggerSimulation = () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setExecutionStep(0);
    setGasConsumed(1200);

    const stepInterval = 1200;
    
    // Multi-step sequential timeout simulator
    const executeStep = (currentIdx: number) => {
      if (currentIdx >= steps.length) {
        setIsExecuting(false);
        // Append simulated final events
        const timestamp = new Date().toLocaleTimeString();
        if (activeModel === 'swap_sac') {
          const amtOut = Math.round(Number(swapAmount) * 0.906);
          setLatestEvents(prev => [
            { topic: 'swap', data: `GD7Y... swapped ${swapAmount} Token A -> ${amtOut} Token B`, time: timestamp },
            ...prev
          ]);
        } else if (activeModel === 'escrow_release') {
          setLatestEvents(prev => [
            { topic: 'escrow_released', data: `GBK8... released 1000 Tokens to GBS3...`, time: timestamp },
            ...prev
          ]);
        } else {
          setLatestEvents(prev => [
            { topic: 'cross_contract_query', data: `Oracle queried for ${oracleAsset}. Price: 0.125 USD`, time: timestamp },
            ...prev
          ]);
        }
        return;
      }

      setExecutionStep(currentIdx);
      setGasConsumed(prev => prev + Math.floor(Math.random() * 8000) + 5000);

      setTimeout(() => {
        executeStep(currentIdx + 1);
      }, stepInterval);
    };

    executeStep(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Visual Workspace Canvas */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Inter-Contract Architecture Visualizer</h2>
              <p className="text-[11px] text-slate-400 mt-1">Observe real-time cross-contract invocation, instruction gas scaling, and event emission paths.</p>
            </div>
            
            {/* Model Selectors */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 self-stretch sm:self-auto">
              <button
                onClick={() => { if (!isExecuting) { setActiveModel('swap_sac'); setExecutionStep(-1); } }}
                disabled={isExecuting}
                className={`flex-1 sm:flex-none text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 rounded transition ${
                  activeModel === 'swap_sac' ? 'bg-sky-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AMM ⇾ Tokens
              </button>
              <button
                onClick={() => { if (!isExecuting) { setActiveModel('escrow_release'); setExecutionStep(-1); } }}
                disabled={isExecuting}
                className={`flex-1 sm:flex-none text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 rounded transition ${
                  activeModel === 'escrow_release' ? 'bg-sky-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Escrow ⇾ Release
              </button>
              <button
                onClick={() => { if (!isExecuting) { setActiveModel('oracle_query'); setExecutionStep(-1); } }}
                disabled={isExecuting}
                className={`flex-1 sm:flex-none text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 rounded transition ${
                  activeModel === 'oracle_query' ? 'bg-sky-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Router ⇾ Oracle
              </button>
            </div>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="bg-slate-950 border border-slate-800/85 rounded p-6 min-h-[340px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-2.5 right-3 flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] text-slate-400 font-mono">
              <Activity className="w-3 h-3 text-sky-400 animate-pulse" />
              <span>Horizon Network Simulator</span>
            </div>

            {/* Simulated Nodes Map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center my-auto relative pt-4">
              
              {/* Node 1: Client Account */}
              <div className="flex flex-col items-center">
                <div className={`p-4 rounded border flex flex-col items-center gap-1.5 w-full max-w-[170px] bg-slate-900 transition-all ${
                  isExecuting && executionStep === 0 ? 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-105' : 'border-slate-800'
                }`}>
                  <div className="p-2 rounded bg-slate-950 text-slate-400">
                    <Activity className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-semibold text-slate-200 text-xs text-center">User Account</span>
                  <span className="font-mono text-[10px] text-slate-500">GD7Y2O...SENDER</span>
                </div>
              </div>

              {/* Arrow and Node 2: Main Smart Contract */}
              <div className="flex flex-col items-center relative">
                {/* Visual Connector particle lines */}
                {isExecuting && executionStep >= 0 && (
                  <div className="absolute left-[-50px] right-[-50px] top-1/2 h-0.5 bg-gradient-to-r from-amber-400 via-sky-500 to-cyan-400 animate-pulse hidden md:block" />
                )}

                <div className={`p-4 rounded border flex flex-col items-center gap-1.5 w-full max-w-[180px] bg-slate-900 z-10 transition-all ${
                  isExecuting && [1, 3].includes(executionStep) ? 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.25)] scale-105' : 'border-slate-800'
                }`}>
                  <div className="p-2 rounded bg-slate-950 text-sky-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-200 text-xs text-center text-ellipsis overflow-hidden">
                    {activeModel === 'swap_sac' && 'AMM Swap Pool'}
                    {activeModel === 'escrow_release' && 'Escrow Contract'}
                    {activeModel === 'oracle_query' && 'Oracle Router'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {activeModel === 'swap_sac' && 'CAS3X7...SWAP_P'}
                    {activeModel === 'escrow_release' && 'CBK8X9...ESCROW'}
                    {activeModel === 'oracle_query' && 'CC6X78...ROUTER'}
                  </span>
                </div>
              </div>

              {/* Node 3: Target Contracts Called Inter-contract */}
              <div className="flex flex-col items-center gap-3">
                {activeModel === 'swap_sac' ? (
                  <>
                    <div className={`p-3 rounded border flex items-center gap-2.5 w-full max-w-[180px] bg-slate-900 transition-all ${
                      isExecuting && executionStep === 2 ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-105' : 'border-slate-800'
                    }`}>
                      <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="text-left overflow-hidden">
                        <div className="font-semibold text-slate-300 text-xs">SAC Token A</div>
                        <span className="font-mono text-[9px] text-slate-500 block truncate">CBK8...TOKEN_A</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded border flex items-center gap-2.5 w-full max-w-[180px] bg-slate-900 transition-all ${
                      isExecuting && executionStep === 4 ? 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)] scale-105' : 'border-slate-800'
                    }`}>
                      <Coins className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="text-left overflow-hidden">
                        <div className="font-semibold text-slate-300 text-xs">SAC Token B</div>
                        <span className="font-mono text-[9px] text-slate-500 block truncate">CAS3...TOKEN_B</span>
                      </div>
                    </div>
                  </>
                ) : activeModel === 'escrow_release' ? (
                  <div className={`p-4 rounded border flex flex-col items-center gap-1.5 w-full max-w-[170px] bg-slate-900 transition-all ${
                    isExecuting && executionStep === 2 ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-105' : 'border-slate-800'
                  }`}>
                    <Coins className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-slate-300 text-xs">Recipient Token</span>
                    <span className="font-mono text-[10px] text-slate-500">GBS3X67...BENEF</span>
                  </div>
                ) : (
                  <div className={`p-4 rounded border flex flex-col items-center gap-1.5 w-full max-w-[170px] bg-slate-900 transition-all ${
                    isExecuting && executionStep === 2 ? 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)] scale-105' : 'border-slate-800'
                  }`}>
                    <Radio className="w-5 h-5 text-sky-400" />
                    <span className="font-semibold text-slate-300 text-xs">Price Oracle</span>
                    <span className="font-mono text-[10px] text-slate-500">CC6X...ORACLE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Execution Control Panel */}
            <div className="border-t border-slate-800/80 pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {activeModel === 'swap_sac' && (
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-xs font-mono">
                    <span className="text-slate-500 font-bold uppercase tracking-tighter text-[9px]">AMOUNT TO SWAP:</span>
                    <input
                      type="number"
                      value={swapAmount}
                      disabled={isExecuting}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      className="w-16 bg-slate-950 text-slate-200 border-none focus:ring-0 focus:outline-none p-0 text-center font-bold"
                    />
                    <span className="text-slate-400">Token A</span>
                  </div>
                )}
                {activeModel === 'oracle_query' && (
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-xs font-mono">
                    <span className="text-slate-500 font-bold uppercase tracking-tighter text-[9px]">QUERY ASSET:</span>
                    <select
                      value={oracleAsset}
                      disabled={isExecuting}
                      onChange={(e) => setOracleAsset(e.target.value)}
                      className="bg-transparent text-slate-200 border-none focus:ring-0 focus:outline-none p-0 font-bold cursor-pointer text-xs"
                    >
                      <option value="XLM" className="bg-slate-900">XLM</option>
                      <option value="USDC" className="bg-slate-900">USDC</option>
                      <option value="EURC" className="bg-slate-900">EURC</option>
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-mono text-[11px]">Gas Limit: 180,000</span>
                </div>
              </div>

              <button
                id="btn-trigger-visualizer"
                onClick={triggerSimulation}
                disabled={isExecuting}
                className="w-full sm:w-auto text-[10px] uppercase font-mono tracking-wider bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded transition shadow-sm disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center gap-1.5"
              >
                {isExecuting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Executing Inter-contract calls...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Trigger Invocation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Console Steps Log detailing execution path */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Step-by-Step Invocation Execution Path</h3>
          <div className="space-y-4">
            {steps.map((st, idx) => {
              const isActive = executionStep === idx;
              const isDone = executionStep > idx;
              
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded border transition-all text-xs flex gap-3 ${
                    isActive
                      ? 'bg-sky-500/10 border-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.1)]'
                      : isDone
                      ? 'bg-slate-950/40 border-slate-900 text-slate-400'
                      : 'bg-slate-950/20 border-transparent text-slate-500'
                  }`}
                >
                  <div className="flex flex-col items-center pt-0.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                      isActive
                        ? 'bg-sky-500 text-slate-950 shadow-[0_0_8px_rgba(14,165,233,0.4)] animate-pulse'
                        : isDone
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-0.5 h-6 mt-2 ${isDone ? 'bg-emerald-900/60' : 'bg-slate-800'}`} />
                    )}
                  </div>
                  <div>
                    <div className={`font-semibold ${isActive ? 'text-sky-400 font-bold' : isDone ? 'text-slate-300' : 'text-slate-400'}`}>
                      {st.title}
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar panel: Event Streams, gas metrics */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Real-time Soroban Gas Ledger</h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
            Soroban operates on custom-metered instructions. This panel tracks simulated CPU resource meters for current transactions:
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[9px] text-slate-500 font-mono block font-bold uppercase tracking-wider">CPU INSTRUCTIONS USED</span>
                <span className="font-mono text-xl font-bold text-slate-200">
                  {isExecuting ? gasConsumed.toLocaleString() : gasConsumed > 0 ? gasConsumed.toLocaleString() : '0'}
                </span>
              </div>
              <div className="bg-sky-950/20 text-sky-400 border border-sky-900/60 text-[10px] px-2 py-1 rounded font-mono font-bold uppercase">
                Metered
              </div>
            </div>

            <div className="text-xs space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Soroban Gas Limit:</span>
                <span className="font-mono text-slate-300">180,000 CPU</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Transaction Fee:</span>
                <span className="font-mono text-slate-300">
                  {isExecuting ? `${(gasConsumed / 1000000).toFixed(4)} XLM` : gasConsumed > 0 ? `${(gasConsumed / 1000000).toFixed(4)} XLM` : '0.0000 XLM'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Network Load Multiplier:</span>
                <span className="font-mono text-emerald-400">1.0x (Normal)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live event stream log */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Real-time Event Stream</h3>
            </div>
            <span className="bg-emerald-950/40 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-900/40 animate-pulse font-semibold">
              LIVE STREAM
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs text-slate-300 pr-1 scrollbar-thin">
            {latestEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Info className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-slate-500 italic text-[11px]">No contract events caught in current ledger stream yet. Trigger an invocation above to observe real-time publishing.</p>
              </div>
            ) : (
              latestEvents.map((evt, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] leading-relaxed space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 font-bold">Topic: {evt.topic}</span>
                    <span className="text-slate-500 text-[10px]">{evt.time}</span>
                  </div>
                  <p className="text-slate-300">{evt.data}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
