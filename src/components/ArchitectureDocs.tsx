import React, { useState } from 'react';
import { Layers, ShieldCheck, Download, Code, Clipboard, CheckCircle } from 'lucide-react';

export default function ArchitectureDocs() {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const CARGO_TOML = `[package]
name = "soroban-smart-contracts"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
soroban-sdk = "20.0.0"

[dev-dependencies]
soroban-sdk = { version = "20.0.0", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
lto = true
codegen-units = 1
panic = "abort"
strip = true`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-300">
      {/* Informative Columns */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded p-6 shadow-sm">
          <h2 className="text-xs font-bold text-slate-100 flex items-center gap-2 mb-3 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-sky-400" />
            Production Soroban Architecture Guidelines
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Building smart contracts on Stellar Soroban requires understanding the underlying state tier model, authorization guidelines, and contract inter-communication limits:
          </p>

          <div className="space-y-4 text-xs">
            {/* Storage Guidelines */}
            <div className="bg-slate-950 p-4 rounded border border-slate-800/80">
              <h3 className="font-bold text-sky-400 mb-1.5 font-mono text-[10px] uppercase tracking-wider">1. Storage Allocation and TTL</h3>
              <p className="text-slate-400 leading-relaxed">
                Soroban separates ledger space into three levels: **Temporary**, **Instance**, and **Persistent**. All on-chain keys are initialized with a Time-To-Live (TTL) sequence boundary. Developers must extend lease durations explicitly in production using the <code className="text-sky-400">env.storage().persistent().extend_ttl()</code> macro to prevent data from being archived.
              </p>
            </div>

            {/* require_auth Guidelines */}
            <div className="bg-slate-950 p-4 rounded border border-slate-800/80">
              <h3 className="font-bold text-sky-400 mb-1.5 font-mono text-[10px] uppercase tracking-wider">2. Dynamic Authorization Audits</h3>
              <p className="text-slate-400 leading-relaxed">
                Stellar accounts use multi-sig logic natively. Soroban contracts must avoid manually parsing cryptographic signatures. Use the built-in <code className="text-sky-400">Address.require_auth()</code> client pattern. The runtime guarantees secure validation against account signers automatically.
              </p>
            </div>

            {/* Inter-contract calls */}
            <div className="bg-slate-950 p-4 rounded border border-slate-800/80">
              <h3 className="font-bold text-sky-400 mb-1.5 font-mono text-[10px] uppercase tracking-wider">3. Cross-Contract Invocation Safeties</h3>
              <p className="text-slate-400 leading-relaxed">
                Soroban prevents re-entry vulnerabilities natively since calls are synchronized. However, calling external tokens or price oracles exposes callers to parameter spoofing. Always register known target addresses inside persistent contract registry slots, and verify returned WASM execution hashes.
              </p>
            </div>
          </div>
        </div>

        {/* Security checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded p-6 shadow-sm">
          <h2 className="text-xs font-bold text-slate-100 flex items-center gap-2 mb-3 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            Soroban Auditing Audit Checklist
          </h2>
          
          <div className="space-y-3.5 text-xs text-slate-400 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
              <div>
                <strong className="text-slate-300 font-mono text-[10px] uppercase tracking-wider block mb-0.5 text-sky-400">WASM Footprint Compression</strong> Ensure output binaries do not exceed the 64KB single-transaction size threshold. Compile with the profile configuration settings on the right.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
              <div>
                <strong className="text-slate-300 font-mono text-[10px] uppercase tracking-wider block mb-0.5 text-sky-400">Integer Overflows</strong> Standard Rust operators panic on overflow in debug profiles but wrap in release profiles. Always use safe mathematical extensions like <code className="text-rose-400 font-mono">checked_add()</code>, <code className="text-rose-400 font-mono">checked_mul()</code>, or specialized fixed-point libraries.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
              <div>
                <strong className="text-slate-300 font-mono text-[10px] uppercase tracking-wider block mb-0.5 text-sky-400">Authorization Placement</strong> Trigger auth requirements immediately at function entry points. Placing <code className="text-sky-400 font-mono">require_auth()</code> downstream inside calculations can leak execution logic states.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Tree Exporter */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded p-5 shadow-sm">
          <h3 className="font-bold text-slate-200 text-xs mb-3 uppercase tracking-wider">Interactive Workspace Export</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Copy standard files below to integrate this local sandboxed smart contract space into your local IDE.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-950 rounded overflow-hidden border border-slate-800">
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800/60 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Cargo.toml</span>
                <button
                  onClick={() => copyToClipboard(CARGO_TOML, 'cargo')}
                  className="text-slate-500 hover:text-slate-300 transition"
                >
                  {copiedFile === 'cargo' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <Clipboard className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="p-4 font-mono text-[11px] text-slate-400 max-h-[220px] overflow-y-auto leading-relaxed">
                <pre>{CARGO_TOML}</pre>
              </div>
            </div>

            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded text-xs leading-relaxed text-slate-400">
              To build these contracts locally:
              <ol className="list-decimal pl-4 mt-1.5 space-y-1 font-mono text-[11px] text-slate-300">
                <li>Install Rust: <code className="text-sky-400">curl --proto ...</code></li>
                <li>Add WASM Target: <code className="text-sky-400">rustup target add wasm32-unknown-unknown</code></li>
                <li>Install CLI: <code className="text-sky-400">cargo install soroban-cli</code></li>
                <li>Compile: <code className="text-sky-400">cargo build --target wasm32-unknown-unknown --release</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
