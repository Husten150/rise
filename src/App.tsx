import React, { useState, useCallback } from 'react';
import { TabType, SmartContract } from './types';
import ContractWorkspace from './components/ContractWorkspace';
import InterContractVisualizer from './components/InterContractVisualizer';
import SandboxLedger from './components/SandboxLedger';
import TestingRunner from './components/TestingRunner';
import DeploymentWorkflow from './components/DeploymentWorkflow';
import CicdRunner from './components/CicdRunner';
import ArchitectureDocs from './components/ArchitectureDocs';
import WalletConnector from './components/WalletConnector';
import { 
  Code, Network, FlaskConical, Play, Cpu, Layers, HelpCircle, 
  Terminal, Activity, Globe, Menu, X, CheckCircle, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('contracts');
  const [selectedContractForDeploy, setSelectedContractForDeploy] = useState<SmartContract | undefined>(undefined);
  const [selectedContractForTesting, setSelectedContractForTesting] = useState<string | undefined>(undefined);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  const handleDeployRequest = (contract: SmartContract) => {
    setSelectedContractForDeploy(contract);
    setActiveTab('deployment');
  };

  const handleRunTestRequest = (contractId: string) => {
    setSelectedContractForTesting(contractId);
    setActiveTab('testing');
  };

  const handleWalletConnect = useCallback((publicKey: string) => {
    setConnectedWallet(publicKey);
  }, []);

  const handleWalletDisconnect = useCallback(() => {
    setConnectedWallet(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* Real-time Stellar Sandbox network status ribbon */}
      <div className="bg-sky-950/20 border-b border-slate-800/80 px-6 py-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            STELLAR_LOCAL_SANDBOX
          </span>
          <span className="text-slate-800">|</span>
          <span>Protocol version: 20</span>
          <span className="text-slate-800">|</span>
          <span>Horizon Node: https://localhost:8000</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>TPS: 2.4</span>
          <span className="text-slate-800">|</span>
          <span>Ledger Time: ~5s</span>
        </div>
      </div>

      {/* Main Header navigation */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-6 py-3 h-16 flex items-center">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-sky-500 rounded-sm flex items-center justify-center font-bold text-slate-950 text-xl shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              S
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-widest uppercase text-sky-400">Stellar Dev Portal</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-mono">SOROBAN SMART CONTRACT STUDIO</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <WalletConnector
              onConnect={handleWalletConnect}
              onDisconnect={handleWalletDisconnect}
            />
          </div>

          {/* Desktop Tab Selector */}
          <nav className="hidden lg:flex items-center gap-0 bg-slate-950 border border-slate-800 rounded overflow-hidden">
            {[
              { id: 'contracts', label: 'Code Studio', icon: Code },
              { id: 'visualizer', label: 'Inter-Contract Map', icon: Activity },
              { id: 'sandbox', label: 'Sandbox Ledger', icon: Terminal },
              { id: 'testing', label: 'Testing Suite', icon: FlaskConical },
              { id: 'deployment', label: 'Deploy Wizard', icon: Globe },
              { id: 'cicd', label: 'CI/CD Pipeline', icon: Cpu },
              { id: 'docs', label: 'Manuals', icon: HelpCircle }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`text-[10px] font-mono uppercase tracking-wider px-3.5 py-2 h-9 transition-all flex items-center gap-1.5 border-r border-slate-800 last:border-r-0 ${
                    isActive 
                      ? 'bg-sky-500/10 text-sky-400 font-bold border-b-2 border-b-sky-500' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile navigation toggle */}
          <button
            id="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200 bg-slate-900 rounded border border-slate-800 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-900 border-b border-slate-800 text-xs font-mono font-medium divide-y divide-slate-800/50"
          >
            {[
              { id: 'contracts', label: 'Code Studio', icon: Code },
              { id: 'visualizer', label: 'Inter-Contract Map', icon: Activity },
              { id: 'sandbox', label: 'Sandbox Ledger', icon: Terminal },
              { id: 'testing', label: 'Testing Suite', icon: FlaskConical },
              { id: 'deployment', label: 'Deploy Wizard', icon: Globe },
              { id: 'cicd', label: 'CI/CD Pipeline', icon: Cpu },
              { id: 'docs', label: 'Manuals', icon: HelpCircle }
            ].map((item) => (
              <button
                key={item.id}
                id={`mobile-tab-btn-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-5 py-3.5 flex items-center gap-3 transition ${
                  activeTab === item.id ? 'bg-slate-950 text-sky-400' : 'text-slate-400'
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* Onboarding Welcome Tutorial Overlay Banner */}
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-slate-900/40 border border-slate-800 rounded relative flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded bg-sky-950 border border-sky-900/40 text-sky-400 shrink-0 shadow-[0_0_10px_rgba(14,165,233,0.15)]">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">Welcome to your Soroban Smart Contract Studio</h2>
                <p className="text-slate-400 text-[11px] leading-relaxed max-w-3xl">
                  An advanced web-based environment to craft, build, test, and deploy production-ready Soroban contracts. Learn how state tiers optimize transaction fees, visualize inter-contract transactions, run cargo assertion pipelines, and structure continuous integration workflows.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <button
                id="btn-close-onboarding"
                onClick={() => setShowOnboarding(false)}
                className="text-[10px] font-mono uppercase tracking-wider bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-4 py-2 rounded border border-slate-700 transition"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* Active Tab views */}
        <div className="transition-all duration-200">
          {activeTab === 'contracts' && (
            <ContractWorkspace 
              onDeployRequest={handleDeployRequest} 
              onRunTestRequest={handleRunTestRequest} 
            />
          )}

          {activeTab === 'visualizer' && <InterContractVisualizer />}

          {activeTab === 'sandbox' && <SandboxLedger />}

          {activeTab === 'testing' && (
            <TestingRunner initialContractId={selectedContractForTesting} />
          )}

          {activeTab === 'deployment' && (
            <DeploymentWorkflow initialContract={selectedContractForDeploy} />
          )}

          {activeTab === 'cicd' && <CicdRunner />}

          {activeTab === 'docs' && <ArchitectureDocs />}
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-8 bg-sky-950/30 border-t border-slate-800 flex items-center justify-between px-6 text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            BUILD: PASSING
          </div>
          <div>SHA: 8e2f9c1</div>
          <div className="text-sky-500 hover:underline cursor-pointer uppercase" onClick={() => setActiveTab('docs')}>VIEW DOCUMENTATION</div>
        </div>
        <div className="flex gap-4 items-center uppercase">
          <span className="text-slate-400">Network Latency: 12ms</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-white text-[9px]">v1.0.4-prod</span>
        </div>
      </footer>
    </div>
  );
}
