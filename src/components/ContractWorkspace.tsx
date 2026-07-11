import React, { useState, useEffect } from 'react';
import { SmartContract } from '../types';
import { CONTRACT_TEMPLATES } from '../data/contracts';
import { Code, Terminal, Play, Cpu, AlertTriangle, CheckCircle, Flame, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContractWorkspaceProps {
  onDeployRequest: (contract: SmartContract) => void;
  onRunTestRequest: (contractId: string) => void;
}

export default function ContractWorkspace({ onDeployRequest, onRunTestRequest }: ContractWorkspaceProps) {
  const [selectedContract, setSelectedContract] = useState<SmartContract>(CONTRACT_TEMPLATES[0]);
  const [editedCode, setEditedCode] = useState<string>(selectedContract.code);
  const [compilerStatus, setCompilerStatus] = useState<'idle' | 'compiling' | 'success' | 'error'>('idle');
  const [compilerLogs, setCompilerLogs] = useState<string[]>([]);
  const [wasmSize, setWasmSize] = useState<number>(0);
  const [estimatedGas, setEstimatedGas] = useState<number>(0);

  useEffect(() => {
    setEditedCode(selectedContract.code);
    setCompilerStatus('idle');
    setCompilerLogs([]);
    setWasmSize(0);
    setEstimatedGas(0);
  }, [selectedContract]);

  const handleCompile = () => {
    if (compilerStatus === 'compiling') return;
    
    setCompilerStatus('compiling');
    setCompilerLogs(['[cargo] Initializing build configuration for Soroban WASM...']);
    
    setTimeout(() => {
      setCompilerLogs(prev => [...prev, '[rustc] Parsing smart contract entry macros: #[contract] and #[contractimpl]...']);
    }, 300);

    setTimeout(() => {
      setCompilerLogs(prev => [...prev, '[rustc] Running borrow-checker audits for safe storage references...']);
    }, 600);

    setTimeout(() => {
      setCompilerLogs(prev => [...prev, '[soroban] Generating WASM interfaces and schema specifications (contract.json)...']);
    }, 950);

    setTimeout(() => {
      // Check if user entered buggy syntax in editor to simulate real error handling!
      if (editedCode.includes('bug') || editedCode.includes('panic_now!')) {
        setCompilerStatus('error');
        setCompilerLogs(prev => [
          ...prev,
          '[error] rustc: compiler error on line 42: unresolved import or syntax error!',
          '  --> src/lib.rs:42:5',
          '   |',
          '42 |     panic_now!("Explicit developer bug simulated!");',
          '   |     ^^^^^^^^^ help: check for correct Soroban-SDK macro declarations',
          '[soroban-sdk] Build failed with 1 compilation error.'
        ]);
      } else {
        const sizeKb = Math.round((selectedContract.id === 'amm_swap' ? 18.4 : selectedContract.id === 'multisig_escrow' ? 15.2 : 12.1) * 10) / 10;
        const gasLimit = selectedContract.id === 'amm_swap' ? 142050 : selectedContract.id === 'multisig_escrow' ? 112000 : 89000;
        
        setWasmSize(sizeKb);
        setEstimatedGas(gasLimit);
        setCompilerStatus('success');
        setCompilerLogs(prev => [
          ...prev,
          '[wasm] Compiled target/wasm32-unknown-unknown/release/contract.wasm successfully.',
          `[wasm] Stripped and optimized size: ${sizeKb} KB (Network storage limit is 64 KB).`,
          `[soroban] Estimated gas consumption limit: ${gasLimit} CPU Instructions.`,
          '[soroban-sdk] Contract compilation completed with success status!'
        ]);
      }
    }, 1500);
  };

  return (
    <div id="contract-studio" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar: Templates & Metadata */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Contract Templates</h2>
          <div className="space-y-3">
            {CONTRACT_TEMPLATES.map((contract) => {
              const isSelected = selectedContract.id === contract.id;
              return (
                <button
                  key={contract.id}
                  id={`btn-select-${contract.id}`}
                  onClick={() => setSelectedContract(contract)}
                  className={`w-full text-left p-4 rounded border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-sky-500/10 border-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.1)]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className={`p-2 rounded ${isSelected ? 'bg-sky-950 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 text-sm">{contract.name}</div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
                      {contract.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Soroban Storage Structure Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Soroban State Tiering Audit</h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            Soroban categorizes state storage to optimize network fees. Let's audit this contract's state footprints:
          </p>

          <div className="space-y-4 text-xs">
            {/* Instance storage */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-mono text-emerald-400 font-semibold">Instance Storage</span>
                <span>{selectedContract.storageTypes.instance.length} Keys</span>
              </div>
              <div className="bg-slate-950 p-2.5 border border-emerald-950/60 font-mono text-slate-400 flex flex-wrap gap-1.5 rounded">
                {selectedContract.storageTypes.instance.length > 0 ? (
                  selectedContract.storageTypes.instance.map((k) => (
                    <span key={k} className="bg-emerald-950/30 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-900/50">
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="italic text-slate-500">None declared</span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                Shares TTL limits with contract instance. Best for core configs, token details, reserves.
              </div>
            </div>

            {/* Persistent storage */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-mono text-sky-400 font-semibold">Persistent Storage</span>
                <span>{selectedContract.storageTypes.persistent.length} Keys</span>
              </div>
              <div className="bg-slate-950 p-2.5 border border-sky-950/60 font-mono text-slate-400 flex flex-wrap gap-1.5 rounded">
                {selectedContract.storageTypes.persistent.length > 0 ? (
                  selectedContract.storageTypes.persistent.map((k) => (
                    <span key={k} className="bg-sky-950/30 text-sky-300 px-1.5 py-0.5 rounded border border-sky-900/50">
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="italic text-slate-500">None declared</span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                Requires self-managed lease expansion. Best for large user-specific accounts, balances, active metrics.
              </div>
            </div>

            {/* Temporary storage */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-mono text-purple-400 font-semibold">Temporary Storage</span>
                <span>{selectedContract.storageTypes.temporary.length} Keys</span>
              </div>
              <div className="bg-slate-950 p-2.5 border border-purple-950/60 font-mono text-slate-400 flex flex-wrap gap-1.5 rounded">
                {selectedContract.storageTypes.temporary.length > 0 ? (
                  selectedContract.storageTypes.temporary.map((k) => (
                    <span key={k} className="bg-purple-950/30 text-purple-300 px-1.5 py-0.5 rounded border border-purple-900/50">
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="italic text-slate-500">None declared</span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                Cheap, volatile. Expires quickly unless renewed. Ideal for signatures, validation caches, temporary nonces.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Compiler Live Output Area */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden shadow-sm flex flex-col h-[520px]">
          {/* Editor Header */}
          <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-xs text-sky-400 font-semibold">{selectedContract.id}/src/lib.rs</span>
              <span className="bg-slate-850 text-sky-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800 uppercase">
                {selectedContract.language}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-run-tests-from-editor"
                onClick={() => onRunTestRequest(selectedContract.id)}
                className="text-[10px] uppercase font-mono tracking-wider bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-3 py-1.5 rounded border border-slate-700 transition"
              >
                Go to Tests
              </button>
              <button
                id="btn-compile-contract"
                onClick={handleCompile}
                disabled={compilerStatus === 'compiling'}
                className="text-[10px] uppercase font-mono tracking-wider bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-1.5 rounded transition flex items-center gap-1.5 shadow"
              >
                {compilerStatus === 'compiling' ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Compiling...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Compile WASM
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor Textarea */}
          <div className="flex-1 relative">
            <textarea
              id="contract-code-editor"
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
              className="w-full h-full p-4 bg-slate-950 text-slate-300 font-mono text-xs focus:outline-none resize-none leading-relaxed overflow-y-auto"
              spellCheck="false"
              placeholder="// Write Soroban contract code in Rust here..."
            />
            {/* Syntax highlight hint absolute badge */}
            <div className="absolute bottom-3 right-4 bg-slate-900/80 border border-slate-800 text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded pointer-events-none">
              Interactive Rust Editor
            </div>
          </div>
        </div>

        {/* Compiler Terminal Log panel */}
        <div className="bg-slate-950 border border-slate-800 rounded overflow-hidden shadow">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs text-slate-300">Soroban Compiler Console</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              {compilerStatus === 'success' && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Ready
                </span>
              )}
              {compilerStatus === 'error' && (
                <span className="flex items-center gap-1 text-rose-400 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> Compile Error
                </span>
              )}
              {compilerStatus === 'compiling' && (
                <span className="text-sky-400 animate-pulse">Processing compilation...</span>
              )}
              {compilerStatus === 'idle' && <span className="text-slate-500">Idle (Awaiting compilation)</span>}
            </div>
          </div>

          <div className="p-4 bg-slate-950 min-h-[140px] max-h-[220px] overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 scrollbar-thin">
            {compilerLogs.length === 0 ? (
              <p className="text-slate-600 italic">Click "Compile WASM" in the top bar to trigger compilation of this Soroban smart contract, checking rust borrow states, type assertions, and stripping optimized output metrics.</p>
            ) : (
              compilerLogs.map((log, i) => {
                let colorClass = 'text-slate-400';
                if (log.startsWith('[error]')) colorClass = 'text-rose-400 font-medium';
                else if (log.startsWith('[cargo]') || log.startsWith('[rustc]')) colorClass = 'text-sky-300';
                else if (log.startsWith('[wasm]')) colorClass = 'text-emerald-400 font-semibold';
                else if (log.startsWith('[soroban]')) colorClass = 'text-sky-400';
                
                return (
                  <div key={i} className={`whitespace-pre-wrap leading-relaxed ${colorClass}`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>

          {/* Compile Metrics Bar */}
          {compilerStatus === 'success' && (
            <div className="bg-slate-900/80 border-t border-slate-800 px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-[10px] text-slate-500">TARGET ARCHITECTURE</div>
                  <div className="text-slate-300 font-semibold">wasm32-unknown-unknown</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <div>
                  <div className="text-[10px] text-slate-500">OPTIMIZED WASM SIZE</div>
                  <div className={`font-semibold ${wasmSize > 64 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {wasmSize} KB <span className="text-slate-500 font-normal">/ 64KB</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                <Layers className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-[10px] text-slate-500">ESTIMATED CPU INSTRUCTIONS</div>
                  <div className="text-slate-300 font-semibold">{estimatedGas.toLocaleString()} Gas</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Compile Fail Test Mode */}
        <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Test Error-Handling State</h4>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
              Inject a simulated syntax bug inside the rust module to test the workspace compilation feedback and error validation flow.
            </p>
          </div>
          <button
            id="btn-inject-bug"
            onClick={() => {
              setEditedCode(prev => prev + '\n\n// Trigger simulated bug\nfn trigger_error() {\n    panic_now!("Explicit developer bug simulated!");\n}');
              setCompilerStatus('idle');
            }}
            className="text-[10px] uppercase font-mono tracking-wider shrink-0 px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/60 rounded transition"
          >
            Add Rust Bug
          </button>
        </div>

        {/* Deployment Integration Quick Button */}
        {compilerStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-sky-950/10 border border-sky-900/40 rounded flex items-center justify-between gap-4"
          >
            <div>
              <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Smart Contract Compiled Successfully!</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Move forward to install this compiled WASM hash, generate Stellar keypairs, fund with Friendbot, and spin up a live contract instance.
              </p>
            </div>
            <button
              id="btn-trigger-deploy-step"
              onClick={() => onDeployRequest(selectedContract)}
              className="text-[10px] uppercase font-mono tracking-wider font-bold bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded transition shadow-sm shrink-0"
            >
              Start Deploy Wizard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
