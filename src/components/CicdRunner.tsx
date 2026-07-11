import React, { useState } from 'react';
import { GITHUB_WORKFLOW_YML, INITIAL_PIPELINE_STAGES } from '../data/cicd';
import { PipelineStage } from '../types';
import { Play, FileText, CheckCircle2, XCircle, Terminal, RefreshCw, Cpu, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CicdRunner() {
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_PIPELINE_STAGES);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'visual' | 'yaml'>('visual');

  const triggerPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleLogs(['[runner] Initializing virtual host runner container...']);
    
    // Reset stages
    setStages(prev => prev.map(s => ({ ...s, status: 'idle', duration: 0 })));

    const stageTimeouts = [
      { id: 'checkout', delay: 1800 },
      { id: 'fmt', delay: 1500 },
      { id: 'clippy', delay: 2000 },
      { id: 'test', delay: 2500 },
      { id: 'build_wasm', delay: 2200 },
      { id: 'dry_run', delay: 1800 }
    ];

    const runStage = (index: number) => {
      if (index >= stageTimeouts.length) {
        setIsRunning(false);
        setActiveStageId(null);
        setConsoleLogs(prev => [...prev, '\n[workflow] Success: GitHub Actions workflow run completed with status (0). All checks green!']);
        return;
      }

      const stageInfo = stageTimeouts[index];
      setActiveStageId(stageInfo.id);
      
      // Update stage status to running
      setStages(prev => prev.map(s => s.id === stageInfo.id ? { ...s, status: 'running' } : s));
      
      const targetStage = stages.find(s => s.id === stageInfo.id);
      if (targetStage) {
        setConsoleLogs(prev => [
          ...prev, 
          `\n--- Starting Stage: ${targetStage.name} ---`,
          ...targetStage.logs
        ]);
      }

      setTimeout(() => {
        // Complete stage
        setStages(prev => prev.map(s => s.id === stageInfo.id ? { ...s, status: 'success', duration: Math.round(stageInfo.delay / 100) / 10 } : s));
        runStage(index + 1);
      }, stageInfo.delay);
    };

    runStage(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar: Pipeline Stages map */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Build Pipeline</h2>
            <button
              id="btn-trigger-cicd"
              onClick={triggerPipeline}
              disabled={isRunning}
              className="text-[10px] uppercase font-mono tracking-wider font-bold bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 px-3 py-1.5 rounded transition flex items-center gap-1 shadow-[0_0_8px_rgba(14,165,233,0.25)]"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Trigger CI
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {stages.map((stage, idx) => {
              const isActive = activeStageId === stage.id;
              const isSuccess = stage.status === 'success';
              const isRunningStatus = stage.status === 'running';

              return (
                <div
                  key={stage.id}
                  className={`p-3.5 rounded border transition-all text-xs flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-sky-500/10 border-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.15)]'
                      : isSuccess
                      ? 'bg-emerald-950/20 border-emerald-900/30'
                      : 'bg-slate-950/40 border-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                      isSuccess
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                        : isRunningStatus
                        ? 'bg-sky-500 text-slate-950 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isSuccess ? '✓' : idx + 1}
                    </div>
                    <div>
                      <div className={`font-semibold ${isActive ? 'text-sky-400 font-bold' : isSuccess ? 'text-slate-300' : 'text-slate-400'}`}>
                        {stage.name}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {isRunningStatus ? 'Executing...' : isSuccess ? `Succeeded (${stage.duration}s)` : 'Awaiting trigger'}
                      </span>
                    </div>
                  </div>

                  {isRunningStatus && (
                    <svg className="animate-spin h-4.5 w-4.5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* YAML viewer or terminal logs console */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden shadow-sm flex flex-col h-[480px]">
          
          {/* Header toggles */}
          <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-xs text-slate-300">Continuous Integration Panel</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded border border-slate-800">
              <button
                onClick={() => setActiveTab('visual')}
                className={`text-[9px] uppercase font-mono tracking-wider font-bold px-3 py-1 rounded transition ${
                  activeTab === 'visual' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Runner Logs
              </button>
              <button
                onClick={() => setActiveTab('yaml')}
                className={`text-[9px] uppercase font-mono tracking-wider font-bold px-3 py-1 rounded transition ${
                  activeTab === 'yaml' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                GitHub Actions YAML
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-950 p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin">
            {activeTab === 'yaml' ? (
              <pre className="text-slate-400">{GITHUB_WORKFLOW_YML}</pre>
            ) : (
              <div className="space-y-1.5">
                {consoleLogs.length === 0 ? (
                  <p className="text-slate-600 italic">No container logs. Click "Trigger CI" in the left column to run the build pipeline (Runs formatting checks, Clippy safety checks, Rust contract tests, optimized WASM compression, and dry-run deploys).</p>
                ) : (
                  consoleLogs.map((log, i) => {
                    let colorClass = 'text-slate-400';
                    if (log.startsWith('--- Starting Stage:')) colorClass = 'text-sky-400 font-bold mt-3 border-b border-slate-900 pb-1';
                    else if (log.includes('PASSED') || log.includes('passed') || log.includes('ok')) colorClass = 'text-emerald-400 font-semibold';
                    else if (log.startsWith('[error]') || log.includes('Error')) colorClass = 'text-rose-400';
                    else if (log.startsWith('[workflow]') || log.startsWith('[runner]')) colorClass = 'text-purple-300 font-semibold';
                    
                    return (
                      <div key={i} className={`whitespace-pre-wrap ${colorClass}`}>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
