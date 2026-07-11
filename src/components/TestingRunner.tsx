import React, { useState, useEffect } from 'react';
import { CONTRACT_TESTS } from '../data/tests';
import { Play, Shield, FlaskConical, CheckCircle2, XCircle, Terminal, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function TestingRunner({ initialContractId }: { initialContractId?: string }) {
  const [activeSuite, setActiveSuite] = useState<string>('amm_swap');
  const [tests, setTests] = useState(CONTRACT_TESTS[activeSuite] || []);
  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState<string[]>([]);
  const [assertionsStatus, setAssertionsStatus] = useState<Record<string, 'pending' | 'success' | 'failed'>>({});
  const [simulateFail, setSimulateFail] = useState(false);
  const [testSummary, setTestSummary] = useState<{ passed: number; failed: number } | null>(null);

  useEffect(() => {
    if (initialContractId && CONTRACT_TESTS[initialContractId]) {
      setActiveSuite(initialContractId);
    }
  }, [initialContractId]);

  useEffect(() => {
    setTests(CONTRACT_TESTS[activeSuite] || []);
    setStdout([]);
    setAssertionsStatus({});
    setTestSummary(null);
  }, [activeSuite]);

  const runTests = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTestSummary(null);
    setStdout(['$ cargo test --package soroban-contract-workspace --lib -- tests']);
    
    // reset status
    const initialStatus: Record<string, 'pending' | 'success' | 'failed'> = {};
    tests.forEach(t => {
      t.assertions.forEach(as => {
        initialStatus[`${t.id}_${as.name}`] = 'pending';
      });
    });
    setAssertionsStatus(initialStatus);

    setTimeout(() => {
      setStdout(prev => [...prev, '   Compiling soroban-contract-test-suite v0.1.0 (/sandbox/workspace/tests)']);
    }, 400);

    setTimeout(() => {
      setStdout(prev => [...prev, '    Finished test profile [unoptimized + debuginfo] target(s) in 0.85s']);
      setStdout(prev => [...prev, `     Running unittests src/lib.rs (target/debug/deps/contract_workspace_test-${Math.random().toString(16).substring(2,6)})`]);
      setStdout(prev => [...prev, `\nrunning ${tests.length} tests`]);
    }, 1100);

    // Sequential test simulator
    let passedCount = 0;
    let failedCount = 0;

    tests.forEach((test, testIdx) => {
      setTimeout(() => {
        setStdout(prev => [...prev, `test tests::${test.id} ... starting execution`]);
        
        let testCaseFailed = false;

        // Assertion processing with stagger
        test.assertions.forEach((assertion, assertionIdx) => {
          setTimeout(() => {
            // If simulate fail is ON and this is the last test case, fail the last assertion
            const shouldFailThis = simulateFail && testIdx === tests.length - 1 && assertionIdx === test.assertions.length - 1;
            
            if (shouldFailThis) {
              testCaseFailed = true;
              setAssertionsStatus(prev => ({
                ...prev,
                [`${test.id}_${assertion.name}`]: 'failed'
              }));
              setStdout(prev => [
                ...prev,
                `  [ASSERTION FAILED] Assert: ${assertion.name}`,
                `  --> error: thread 'tests::${test.id}' panicked at 'assertion failed: assert_eq!(balance, expected)', src/tests.rs:142:5`,
                `  note: run with \`RUST_BACKTRACE=1\` environment variable to display a backtrace`
              ]);
            } else {
              setAssertionsStatus(prev => ({
                ...prev,
                [`${test.id}_${assertion.name}`]: 'success'
              }));
              setStdout(prev => [...prev, `  [ASSERTION PASS] Verified: ${assertion.name}`]);
            }
          }, (assertionIdx + 1) * 180);
        });

        setTimeout(() => {
          if (testCaseFailed) {
            failedCount++;
            setStdout(prev => [...prev, `test tests::${test.id} ... FAILED ✘`]);
          } else {
            passedCount++;
            setStdout(prev => [...prev, `test tests::${test.id} ... ok ✔`]);
          }

          // If last test case finishes, output summary metrics
          if (testIdx === tests.length - 1) {
            setTimeout(() => {
              const finalPassed = passedCount;
              const finalFailed = failedCount;
              setTestSummary({ passed: finalPassed, failed: finalFailed });
              setStdout(prev => [
                ...prev,
                `\ntest result: ${finalFailed > 0 ? 'FAILED' : 'ok'}. ${finalPassed} passed; ${finalFailed} failed; 0 ignored; 0 measured; 0 filtered out; finished in 1.48s\n`,
                finalFailed > 0 
                  ? 'error: test suite failed. Check Rust assertion errors above to debug code logic.' 
                  : 'success: all Smart Contract testing assertions verified successfully!'
              ]);
              setIsRunning(false);
            }, 500);
          }
        }, (test.assertions.length + 1) * 200);

      }, 1500 + testIdx * 1200);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Test cases list & controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Choose Test Suite</h2>
          <div className="space-y-2">
            <button
              onClick={() => setActiveSuite('amm_swap')}
              id="btn-suite-amm"
              disabled={isRunning}
              className={`w-full text-left p-3.5 rounded border text-[10px] uppercase tracking-wider font-bold font-mono flex items-center justify-between transition ${
                activeSuite === 'amm_swap'
                  ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.15)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                <span>Constant Product AMM</span>
              </div>
              <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-normal">3 Tests</span>
            </button>

            <button
              onClick={() => setActiveSuite('multisig_escrow')}
              id="btn-suite-escrow"
              disabled={isRunning}
              className={`w-full text-left p-3.5 rounded border text-[10px] uppercase tracking-wider font-bold font-mono flex items-center justify-between transition ${
                activeSuite === 'multisig_escrow'
                  ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.15)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                <span>Multi-Sig Escrow</span>
              </div>
              <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-normal">3 Tests</span>
            </button>

            <button
              onClick={() => setActiveSuite('oracle_caller')}
              id="btn-suite-oracle"
              disabled={isRunning}
              className={`w-full text-left p-3.5 rounded border text-[10px] uppercase tracking-wider font-bold font-mono flex items-center justify-between transition ${
                activeSuite === 'oracle_caller'
                  ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.15)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                <span>Oracle Client Caller</span>
              </div>
              <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-normal">1 Test</span>
            </button>
          </div>
        </div>

        {/* Dynamic assertions checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            Assertion Checkpoints
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
            Unit tests utilize the standard rust macros <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-pink-400 text-[10px]">assert_eq!</code> to audit contract output properties:
          </p>

          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test.id} className="space-y-2 border-b border-slate-800/80 pb-3 last:border-none last:pb-0">
                <div className="font-bold text-xs text-slate-300 font-mono flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded bg-sky-400" />
                  {test.name}
                </div>
                <div className="space-y-1.5 pl-3">
                  {test.assertions.map((as) => {
                    const statusKey = `${test.id}_${as.name}`;
                    const currentStatus = assertionsStatus[statusKey] || 'pending';
                    
                    return (
                      <div key={as.name} className="flex items-start gap-2 text-[11px] leading-snug">
                        {currentStatus === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : currentStatus === 'failed' ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded border border-slate-700 shrink-0 mt-0.5" />
                        )}
                        <span className={currentStatus === 'success' ? 'text-slate-300' : currentStatus === 'failed' ? 'text-rose-300' : 'text-slate-500'}>
                          {as.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code viewer & terminal log panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Test Code Block viewer */}
        <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden shadow-sm flex flex-col h-[320px]">
          <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-xs text-sky-400 font-semibold">tests/test_{activeSuite}.rs</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded text-[11px] font-mono">
                <span className="text-slate-500 font-bold uppercase text-[9px]">Mock Auths:</span>
                <span className="text-emerald-400 font-bold">ON</span>
              </div>
              <button
                id="btn-run-cargo-test"
                onClick={runTests}
                disabled={isRunning}
                className="text-[10px] uppercase font-mono tracking-wider bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-4 py-1.5 rounded transition flex items-center gap-1.5 shadow"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Running tests...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Run cargo test
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-950 p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin">
            <pre className="text-slate-450">
              {tests[0]?.code || '// No active test suite found'}
            </pre>
          </div>
        </div>

        {/* Cargo terminal terminal output */}
        <div className="bg-slate-950 border border-slate-800 rounded overflow-hidden shadow">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-xs text-slate-300">Cargo Test Output</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              {testSummary && (
                <span className={`flex items-center gap-1 ${testSummary.failed > 0 ? 'text-rose-400 animate-pulse font-bold' : 'text-emerald-400 font-bold'}`}>
                  {testSummary.failed > 0 ? 'Tests Failed' : 'All Tests Passed'}
                </span>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-950 min-h-[160px] max-h-[240px] overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 scrollbar-thin">
            {stdout.length === 0 ? (
              <p className="text-slate-600 italic">Click "Run cargo test" above to execute compiling, sandbox mocking, and individual assertion routines in a virtual console window.</p>
            ) : (
              stdout.map((line, i) => {
                let colorClass = 'text-slate-400';
                if (line.includes('ok ✔') || line.includes('ok.') || line.includes('PASS')) colorClass = 'text-emerald-400 font-semibold';
                else if (line.includes('FAILED') || line.includes('failed') || line.includes('panic')) colorClass = 'text-rose-400 font-medium';
                else if (line.startsWith('$') || line.includes('Running')) colorClass = 'text-sky-300';
                else if (line.includes('Compiling') || line.includes('Finished')) colorClass = 'text-sky-400';
                
                return (
                  <div key={i} className={`whitespace-pre-wrap leading-relaxed ${colorClass}`}>
                    {line}
                  </div>
                );
              })
            )}
          </div>

          {/* Test Coverage Summary stats */}
          {testSummary && (
            <div className="bg-slate-900/80 border-t border-slate-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TEST SUMMARY</div>
                  <div className="text-slate-300 font-semibold">
                    {testSummary.passed} passed; {testSummary.failed} failed
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">MOCK COVERAGE</div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-950 h-2 rounded overflow-hidden">
                      <div 
                        className={`h-full ${testSummary.failed > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: testSummary.failed > 0 ? '64%' : '94%' }} 
                      />
                    </div>
                    <span className={testSummary.failed > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {testSummary.failed > 0 ? '64%' : '94%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Failed assertion simulator toggle */}
        <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Simulate Assertion Panic State</h4>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                Activate this toggle to test how the dApp compiler runner captures and formats standard Rust `panic!` outputs and unresolved assert validations.
              </p>
            </div>
          </div>
          <button
            id="btn-toggle-fail-sim"
            onClick={() => setSimulateFail(!simulateFail)}
            className={`text-[10px] uppercase font-mono tracking-wider px-3.5 py-1.5 border rounded transition shrink-0 ${
              simulateFail 
                ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
          >
            {simulateFail ? 'Fail Simulation Active' : 'Simulate Fail'}
          </button>
        </div>

      </div>
    </div>
  );
}
