# 🌟 Stellar dApp Developer Workspace & Smart Contract Studio

An end-to-end, high-performance web-based playground, testing suite, and CI/CD pipeline visualizer for **Soroban Smart Contracts** on the Stellar network. 

Designed with an elegant, high-contrast **Cosmic Slate Theme** (custom sky-blue accents, dark charcoal slate panels, and amber indicators), this developer studio serves as both an interactive training ground and a scaffolding assistant for compiling, testing, and deploying Rust-based smart contracts.

---

## 🚀 Live Environment Metrics
* **Protocol Version:** 20 (Full Soroban WASM Runtime Support)
* **Local Sandbox URL:** `https://localhost:8000`
* **Horizon Node State:** `ACTIVE` (Simulated)
* **Block Time:** ~5 seconds (Stellar Ledger consensus speed)

---

## 🛠️ Visual Modules & Architecture

The workspace is divided into seven major interconnected engineering hubs:

### 1. 📝 Code Studio (`ContractWorkspace`)
Browse and analyze robust, production-grade templates for Soroban contracts:
* **Constant Product AMM:** Implements token pools, `swap` operations, and liquidity calculations (`x * y = k`).
* **Multi-Sig Escrow:** Handles multi-signer conditional release rules with explicit expiration constraints.
* **Oracle Client Caller:** Demystifies cross-contract reading of price feeds and off-chain anchor points.
* **Interactive Parameters:** Tweak variables directly in the UI to see how parameters impact contract interfaces and entry points.

### 2. 🕸️ Inter-Contract Map (`InterContractVisualizer`)
An interactive graph-based topology panel illustrating call routing, validation checkpoints, and asset transfers:
* **Caller & Target Nodes:** Track dynamic connections from signer keys (`G-Addresses`) down to target contract addresses (`C-Addresses`).
* **Auth Guards:** Highlight where `Address.require_auth()` validation occurs dynamically on-chain.
* **Payload Tracing:** Easily follow parameters and returned responses visually.

### 3. 📦 Sandbox Ledger (`SandboxLedger`)
A live simulation of Stellar's consensus loop and ledger sequence incrementation:
* **Ledger Stream:** Live tracking of sequence increments, total simulated transactions, and transaction fee pools.
* **Simulated Transaction Builder:** Construct and sign custom transactions:
  * *Friendbot:* Automatically mint 10,000 testnet XLM.
  * *Payment:* Transfer assets with exact gas calculations.
  * *Soroban Call:* Trigger contract invocations on custom methods.
* **Dynamic Fee Pools:** Watch base reserve requirements and WASM execution fees aggregate in real-time.

### 4. 🧪 Testing Suite (`TestingRunner`)
Run cargo-test pipeline protocols entirely from your browser sandbox:
* **Assertion Checkpoints:** Audit Rust unit testing checks (`assert_eq!`) across the entire suite.
* **Cargo Log Console:** Scroll through realistic terminal logs detailing compile states, test executions, and duration profiles.
* **Coverage Tracking:** Monitor simulated mock test coverage rates (reaches up to 94%).
* **Panic Simulator:** Toggle a mock assertion failure to inspect how the dApp compiler catches, formats, and displays panics.

### 5. 🌍 Deploy Wizard (`DeploymentWorkflow`)
A step-by-step cryptographic walkthrough showing how smart contracts are initialized on-chain:
* **Step 1: Keypair Generation:** Generate real public keys (`G...`) and private seed secrets (`S...`) using secure browser-level entropy.
* **Step 2: Friendbot Funding:** Fund your active account using Stellar’s automatic testnet faucet (+10,000 XLM).
* **Step 3: Bytecode Upload:** Upload compiled `.wasm` assets to generate a global, permanent WASM code hash.
* **Step 4: Contract Instantiation:** Execute constructor rules to return your unique contract identifier beginning with `C...`.

### 6. 🔄 CI/CD Pipeline (`CicdRunner`)
A pipeline engine demonstrating continuous integration and security audits:
* **Stages:** Track compiler optimization (`cargo build --release`), security auditing, test suites, WASM footprint compression, and automated deployment.
* **Pipeline Logs:** Live terminal feedback detailing build-steps.
* **YAML Exporter:** Access, copy, and export standard GitHub Actions workflows (`.github/workflows/soroban-ci.yml`) to ship directly into production.

### 7. 📖 Manuals (`ArchitectureDocs`)
A curated developer encyclopedia detailing crucial Soroban development constraints:
* **Storage Optimization:** Practical breakdowns of **Temporary**, **Instance**, and **Persistent** storage levels, and managing TTL (Time-To-Live) boundaries.
* **Multi-Sig Auth:** Detailed implementation notes on `Address.require_auth()` native delegation.
* **Integer Safeties:** Instructions for math constraints (`checked_add`, `checked_mul`) to prevent overflows.
* **Cargo.toml Blueprint:** Exportable configuration settings.

---

## 📂 Local Directory Map

```bash
├── package.json               # Node.js dependencies & dev server configuration
├── tsconfig.json              # TypeScript compilation rules
├── vite.config.ts             # Tailwind CSS & React build configuration
├── src/
│   ├── main.tsx               # Primary application anchor
│   ├── App.tsx                # Main router & navigation container
│   ├── types.ts               # Shared TypeScript schemas and enums
│   ├── index.css              # Global Tailwind theme & custom styling rules
│   └── components/
│       ├── ContractWorkspace.tsx     # Contract Editor & studio
│       ├── InterContractVisualizer.tsx # Call routing visualizer
│       ├── SandboxLedger.tsx          # Real-time transaction simulator
│       ├── TestingRunner.tsx          # Unit testing panel
│       ├── DeploymentWorkflow.tsx     # Deploy Wizard timeline
│       ├── CicdRunner.tsx             # CI/CD & pipeline logs
│       └── ArchitectureDocs.tsx       # Developer manual & Cargo blueprint
```

---

## ⚙️ Local Development Guide

To run this Stellar dApp Developer Workspace locally or in your own pipeline, follow these quick steps:

### 1. Install Workspace Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### 2. Start the Hot-Reloading Server
Launch the development server on `localhost:3000`:
```bash
npm run dev
```

### 3. Build for Production
To bundle and optimize the application assets inside the `dist/` directory:
```bash
npm run build
```

---

## 🦀 Compiling Smart Contracts Locally

To move your workspace templates from the browser playground into a local terminal:

1. **Install Rust & the WASM Target:**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   ```

2. **Install the Stellar CLI (Soroban Client):**
   ```bash
   cargo install soroban-cli
   ```

3. **Build your Smart Contracts:**
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```
   *(This outputs optimized `.wasm` bytecode inside `target/wasm32-unknown-unknown/release/` ready for the Deploy Wizard!)*

---

## 🔒 Security Best Practices for Soroban

When translating templates from the playground into production:
* **TTL Extension:** Always call `env.storage().persistent().extend_ttl()` to extend rent/lease storage boundaries so your contract state does not get archived.
* **Authorization Placement:** Always invoke `Address.require_auth()` at the immediate entry point of functions before any math or state changes execute.
* **Bytecode Limit:** Ensure your final `.wasm` footprint does not exceed **64KB** (use optimization flags like `codegen-units = 1` and `opt-level = "z"` in your `Cargo.toml`).

---

*This developer portal was crafted with dedication to visual layout, high-contrast accessibility, and architectural accuracy for the Stellar & Soroban ecosystem.*
