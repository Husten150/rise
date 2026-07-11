import React, { useState } from 'react';
import { SmartContract } from '../types';
import { CONTRACT_TEMPLATES } from '../data/contracts';
import { Key, Shield, HelpCircle, ArrowRight, Play, CheckCircle, RefreshCw, Clipboard, ExternalLink, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DeploymentWorkflow({ initialContract }: { initialContract?: SmartContract }) {
  const [selectedContract, setSelectedContract] = useState<SmartContract>(initialContract || CONTRACT_TEMPLATES[0]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Deployer states
  const [keypair, setKeypair] = useState<{ public: string; secret: string } | null>(null);
  const [friendbotFunded, setFriendbotFunded] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [wasmHash, setWasmHash] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [installTxHash, setInstallTxHash] = useState<string>('');
  const [instantiateTxHash, setInstantiateTxHash] = useState<string>('');

  const [stepLogs, setStepLogs] = useState<string[]>([]);

  // Step names
  const stepsList = [
    { num: 1, title: 'Keypair Auth' },
    { num: 2, title: 'Fund Account' },
    { num: 3, title: 'Install WASM' },
    { num: 4, title: 'Initialize Instance' }
  ];

  // Helper: Append logs
  const addLog = (log: string, delay = 0) => {
    if (delay === 0) {
      setStepLogs(prev => [...prev, log]);
    } else {
      setTimeout(() => {
        setStepLogs(prev => [...prev, log]);
      }, delay);
    }
  };

  const generateKeys = () => {
    setLoading(true);
    setStepLogs(['[stellar] Dispatching cryptographically secure entropy generator...']);
    
    setTimeout(() => {
      // Simulate cryptographic keypair creation
      const pub = 'GBD' + Math.random().toString(36).substring(2, 12).toUpperCase() + '6XJK...' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const sec = 'SBC' + Math.random().toString(36).substring(2, 12).toUpperCase() + '9EJK...' + Math.random().toString(36).substring(2, 6).toUpperCase();
      
      setKeypair({ public: pub, secret: sec });
      addLog(`[stellar-sdk] Keypair successfully created:`);
      addLog(`  -> Public Key (Account ID): ${pub}`);
      addLog(`  -> Secret Seed: ${sec.substring(0, 10)}****************************`);
      addLog(`[horizon] Status: Account is currently UNFUNDED (Not on-chain yet).`);
      setLoading(false);
    }, 1000);
  };

  const fundWithFriendbot = () => {
    if (!keypair) return;
    setLoading(true);
    setStepLogs(['[friendbot] Requesting XLM allocation for Account ID from Friendbot Faucet...']);
    addLog(`[http] GET https://friendbot.stellar.org/?addr=${keypair.public}`, 300);

    setTimeout(() => {
      addLog(`[horizon] Ledger response received. Account funded with 10,000.0000000 XLM.`);
      addLog(`[stellar-sdk] Sequence ID allocated: 24820935122`);
      setFriendbotFunded(true);
      setBalance(10000);
      setLoading(false);
    }, 1800);
  };

  const installWasmCode = () => {
    setLoading(true);
    setStepLogs(['[soroban-sdk] Preparing compiled WASM bundle payload...']);
    addLog(`[soroban] Running compression optimizations (Strip names, shrink parameters)...`, 300);

    setTimeout(() => {
      addLog(`[horizon] Submitting Transaction Envelope containing WASM bytes...`);
    }, 800);

    setTimeout(() => {
      const computedHash = 'wasm_hash_' + Math.random().toString(16).substring(2, 34);
      const computedTx = Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18);
      setWasmHash(computedHash);
      setInstallTxHash(computedTx);
      addLog(`[horizon] Transaction SUCCESS. WASM bytecode uploaded securely.`);
      addLog(`[soroban] Allocated WASM Registration Hash: ${computedHash}`);
      addLog(`[stellar] Install Tx Hash: ${computedTx}`);
      setLoading(false);
    }, 1800);
  };

  const instantiateContract = () => {
    setLoading(true);
    setStepLogs([`[soroban] Assembling contract constructor arguments for '${selectedContract.id}'...`]);
    
    // Simulate reading parameters from contract
    const argsStr = Object.entries(selectedContract.functions[0]?.defaultArgs || {})
      .map(([k, v]) => `${k}: ${v}`).join(', ');
    addLog(`[soroban] Configured args: { ${argsStr} }`, 300);

    setTimeout(() => {
      addLog(`[horizon] Invoking instantiation transaction to instantiate WASM code hash...`);
    }, 800);

    setTimeout(() => {
      const contractAddr = 'C' + Math.random().toString(36).substring(2, 12).toUpperCase() + Math.random().toString(36).substring(2, 12).toUpperCase();
      const instanceTx = Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18);
      setContractAddress(contractAddr);
      setInstantiateTxHash(instanceTx);
      setBalance(b => b - 1.25); // Deduct deployment gas fee
      addLog(`[horizon] Transaction SUCCESS. Contract instance successfully instantiated.`);
      addLog(`[soroban] Active Contract ID Address: ${contractAddr}`);
      addLog(`[stellar] Instantiate Tx Hash: ${instanceTx}`);
      addLog(`[stellar] Deployment gas cost: 1.25 XLM. Remaining Balance: 9998.75 XLM`);
      setLoading(false);
    }, 2000);
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setKeypair(null);
    setFriendbotFunded(false);
    setBalance(0);
    setWasmHash('');
    setContractAddress('');
    setInstallTxHash('');
    setInstantiateTxHash('');
    setStepLogs([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Wizard timeline */}
      <div className="lg:col-span-12">
        <div className="bg-slate-900 border border-slate-800 rounded p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Soroban Contract Deploy Wizard</h2>
              <p className="text-[11px] text-slate-400 mt-1">Step-by-step setup to publish smart contracts directly onto Stellar's live Testnet.</p>
            </div>
            <button
              id="btn-deploy-reset"
              onClick={resetWizard}
              className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 hover:text-slate-200 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 transition"
            >
              Reset Deployer
            </button>
          </div>

          {/* Progress Timeline Nodes */}
          <div className="grid grid-cols-4 gap-2 mt-6 relative">
            {stepsList.map((st) => {
              const isCurrent = currentStep === st.num;
              const isPassed = currentStep > st.num;
              return (
                <div key={st.num} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                    isCurrent 
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.35)] scale-105' 
                      : isPassed 
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' 
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}>
                    {isPassed ? '✔' : st.num}
                  </div>
                  <span className={`text-[9px] mt-2 font-mono font-bold uppercase tracking-wider text-center truncate w-full ${
                    isCurrent ? 'text-sky-400 font-bold' : isPassed ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {st.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main wizard control board */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[380px]">
          
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sky-400">
                  <Key className="w-5 h-5" />
                  <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Step 1: Cryptographic Keypair Generation</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Stellar transactions require cryptographic signing. Generate a secure, private, and public keypair pair. The public key acts as your on-chain account address (often referred to as your G-Address).
                </p>

                {keypair ? (
                  <div className="bg-slate-950 rounded p-4 border border-slate-800 space-y-3 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">PUBLIC ADDRESS (ACCOUNT ID)</span>
                      <div className="flex items-center justify-between text-slate-300 gap-2 mt-1 bg-slate-900 p-2 rounded border border-slate-800/60">
                        <span className="truncate">{keypair.public}</span>
                        <Clipboard className="w-4 h-4 text-slate-500 shrink-0 hover:text-slate-300 cursor-pointer" />
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">SECRET SEED (PRIVATE KEY - DO NOT SHARE)</span>
                      <div className="flex items-center justify-between text-rose-400 bg-slate-900 p-2 rounded border border-slate-800/60">
                        <span>{keypair.secret.substring(0, 15)}***********************************</span>
                        <Clipboard className="w-4 h-4 text-slate-500 shrink-0 hover:text-slate-300 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 border border-dashed border-slate-800 rounded flex items-center justify-center bg-slate-950/20 text-slate-500 text-xs font-mono uppercase tracking-wider">
                    No active cryptographic keypair generated yet
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    id="btn-generate-keypair"
                    onClick={generateKeys}
                    disabled={loading}
                    className="text-[10px] uppercase font-mono tracking-wider font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-4 py-2 rounded transition"
                  >
                    {loading ? 'Generating...' : 'Generate New Keypair'}
                  </button>
                  <button
                    id="btn-step1-next"
                    onClick={() => setCurrentStep(2)}
                    disabled={!keypair}
                    className="text-[10px] uppercase font-mono tracking-wider font-bold bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 px-5 py-2 rounded transition flex items-center gap-1 shadow-[0_0_8px_rgba(14,165,233,0.25)]"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sky-400">
                  <Globe className="w-5 h-5" />
                  <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Step 2: Friendbot Account Funding</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Before a Stellar keypair can transact on-chain, it must be loaded/funded with a base reserve (minimum 1 XLM) to open ledger entries. Friendbot is an automated faucet allocating 10,000 test tokens for testing.
                </p>

                {friendbotFunded ? (
                  <div className="bg-emerald-950/20 rounded p-4 border border-emerald-900/40 flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <div>
                        <span className="font-bold block text-slate-200 uppercase tracking-wider text-[11px]">Account Funded</span>
                        <span className="text-[10px] text-slate-400 font-normal">Sequence Registered on Testnet</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">BALANCE</span>
                      <div className="font-bold text-slate-100 text-sm">{balance.toLocaleString()} XLM</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Account:</span>
                      <span className="text-slate-300 truncate w-48 text-right">{keypair?.public || 'None'}</span>
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Network Fee Pool:</span>
                      <span className="text-slate-300">Stellar Testnet Horizon</span>
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fund Allocation:</span>
                      <span className="text-emerald-400 font-bold">+10,000.00 XLM</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    id="btn-step2-prev"
                    onClick={() => setCurrentStep(1)}
                    className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 hover:text-slate-200 bg-transparent px-3 py-2 rounded transition"
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      id="btn-fund-friendbot"
                      onClick={fundWithFriendbot}
                      disabled={loading || !keypair || friendbotFunded}
                      className="text-[10px] uppercase font-mono tracking-wider font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-4 py-2 rounded transition flex items-center gap-1.5"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Funding...
                        </>
                      ) : (
                        'Request Friendbot XLM'
                      )}
                    </button>
                    <button
                      id="btn-step2-next"
                      onClick={() => setCurrentStep(3)}
                      disabled={!friendbotFunded}
                      className="text-[10px] uppercase font-mono tracking-wider font-bold bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 px-5 py-2 rounded transition flex items-center gap-1 shadow-[0_0_8px_rgba(14,165,233,0.25)]"
                    >
                      Next Step <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sky-400">
                  <Shield className="w-5 h-5" />
                  <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Step 3: Upload compiled WASM bytecode</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In Soroban, smart contract logic is first installed as bytecode onto the shared ledger storage. This returns a permanent WASM registration code hash. This separation allows multiple instances to reference the same underlying code structure.
                </p>

                <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Contract File:</span>
                    <span className="text-slate-300">{selectedContract.name} ({selectedContract.id}.wasm)</span>
                  </div>
                  {wasmHash && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">WASM Code Hash:</span>
                        <span className="text-emerald-400 font-bold truncate w-40 text-right">{wasmHash}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Install Tx Hash:</span>
                        <span className="text-sky-400 truncate w-40 text-right">{installTxHash}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    id="btn-step3-prev"
                    onClick={() => setCurrentStep(2)}
                    className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 hover:text-slate-200 bg-transparent px-3 py-2 rounded transition"
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      id="btn-install-wasm"
                      onClick={installWasmCode}
                      disabled={loading || wasmHash !== ''}
                      className="text-[10px] uppercase font-mono tracking-wider font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 px-4 py-2 rounded transition"
                    >
                      {loading ? 'Uploading WASM bytes...' : wasmHash ? 'WASM Installed' : 'Install WASM hash'}
                    </button>
                    <button
                      id="btn-step3-next"
                      onClick={() => setCurrentStep(4)}
                      disabled={wasmHash === ''}
                      className="text-[10px] uppercase font-mono tracking-wider font-bold bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 px-5 py-2 rounded transition flex items-center gap-1 shadow-[0_0_8px_rgba(14,165,233,0.25)]"
                    >
                      Next Step <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-sky-400">
                  <HelpCircle className="w-5 h-5" />
                  <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Step 4: Instantiate active Contract Instance</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The final phase executes the constructor initialization routine of the contract, committing instance state storage parameters and generating your unique contract address beginning with <code className="text-sky-400 font-mono text-[10px]">C...</code>.
                </p>

                {contractAddress ? (
                  <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded text-xs font-mono space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-bold uppercase tracking-wider text-[11px]">CONTRACT DEPLOYED SUCCESSFULLY!</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Unique Contract Address:</span>
                      <span className="text-emerald-400 font-bold truncate w-40 text-right">{contractAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Creation Tx Hash:</span>
                      <span className="text-sky-400 truncate w-40 text-right">{instantiateTxHash}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs font-mono">
                    <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider mb-2">INITIALIZATION CONSTRUCTOR ARGS</span>
                    <div className="space-y-2">
                      {selectedContract.functions[0]?.parameters.map(p => (
                        <div key={p.name} className="flex justify-between text-slate-400">
                          <span>{p.name} ({p.type}):</span>
                          <span className="text-slate-200 font-semibold">{selectedContract.functions[0]?.defaultArgs[p.name] || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    id="btn-step4-prev"
                    onClick={() => setCurrentStep(3)}
                    disabled={contractAddress !== ''}
                    className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 hover:text-slate-200 bg-transparent px-3 py-2 rounded transition"
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      id="btn-instantiate-contract"
                      onClick={instantiateContract}
                      disabled={loading || contractAddress !== ''}
                      className="text-[10px] uppercase font-mono tracking-wider font-bold bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 px-4 py-2 rounded transition flex items-center gap-1 shadow-[0_0_8px_rgba(14,165,233,0.25)]"
                    >
                      {loading ? 'Instantiating on-chain...' : contractAddress ? 'Instantiated' : 'Instantiate Contract'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Terminal log logs */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-950 border border-slate-800 rounded overflow-hidden shadow flex flex-col h-[380px]">
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800/80 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">Deploy Terminal logs</span>
          </div>
          
          <div className="flex-1 p-4 bg-slate-950 font-mono text-[11px] text-slate-300 space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
            {stepLogs.length === 0 ? (
              <p className="text-slate-600 italic">Select a deployment step to trigger on-chain client actions and view transaction payloads.</p>
            ) : (
              stepLogs.map((log, i) => {
                let colorClass = 'text-slate-400';
                if (log.startsWith('[error]')) colorClass = 'text-rose-400';
                else if (log.startsWith('[stellar') || log.startsWith('[stellar-sdk]')) colorClass = 'text-sky-300';
                else if (log.startsWith('[friendbot]')) colorClass = 'text-purple-300';
                else if (log.startsWith('[soroban')) colorClass = 'text-sky-400';
                else if (log.startsWith('[horizon]')) colorClass = 'text-emerald-400 font-medium';
                
                return (
                  <div key={i} className={`whitespace-pre-wrap leading-relaxed ${colorClass}`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
