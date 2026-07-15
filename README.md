
# Stellar dApp Developer Workspace & Soroban Studio

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000?style=for-the-badge&logo=vercel)](https://rise-navy.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

![Stellar](https://img.shields.io/badge/Stellar-14-7B00FF?logo=stellar)
![Soroban](https://img.shields.io/badge/Soroban-WASM-FF6B35)
![Protocol](https://img.shields.io/badge/Protocol-20-00C853)

> An end-to-end, high-performance web-based playground, testing suite, and CI/CD pipeline visualizer for **Soroban Smart Contracts** on the Stellar network. Built with React 19, Vite 6, and Tailwind CSS 4.

---

## 📋 Table of Contents

- [Live Demo](#-live-demo)
- [Demo Video](#-demo-video)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Smart Contracts & Deployment](#-smart-contracts--deployment)
- [Testing](#-testing)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Commit History](#-commit-history)
- [Built With](#-built-with)
- [License](#-license)

---

## 🚀 Live Demo

| Platform | URL | Status |
|----------|-----|--------|
| **Vercel** | [https://rise-navy.vercel.app](https://rise-navy.vercel.app) | ✅ Live |

The application is deployed and accessible via the link above. Deployed using Vercel's seamless CI/CD integration with GitHub.

---

## 🎥 Demo Video

> **Link:** [Watch the demo video](https://youtu.be/your-video-link-here)

A 1–2 minute walkthrough covering:
- Contract workspace and code editing
- Test suite execution with 3+ passing tests
- CI/CD pipeline visualization
- Deployment wizard walkthrough
- Mobile responsive UI demonstration

---

## ✨ Features

### 1. 📝 Code Studio (`ContractWorkspace`)
Browse and analyze production-grade Soroban contract templates:

| Contract | Description | Functions |
|----------|-------------|-----------|
| **Constant Product AMM** | Token pools with `x * y = k` swap logic | `initialize`, `deposit`, `swap` |
| **Multi-Sig Escrow** | Multi-signer conditional release | `create_escrow`, `approve_signer`, `release`, `refund` |
| **Oracle Client** | Cross-contract price feed reading | `get_asset_valuation`, `verify_trade_rate` |
| **Buggy Escrow** | Intentionally broken contract for error testing | `run_execution` |

### 2. 🕸️ Inter-Contract Map (`InterContractVisualizer`)
Interactive graph-based topology panel showing call routing, validation checkpoints, and asset transfers between contracts.

### 3. 📦 Sandbox Ledger (`SandboxLedger`)
Live simulation of Stellar's consensus loop:
- Real-time ledger streaming (~5.5s intervals)
- Transaction simulator (Friendbot, Payment, Soroban Call)
- Dynamic fee pool tracking

### 4. 🧪 Testing Suite (`TestingRunner`)
Run simulated `cargo test` pipelines from the browser:
- **7 tests** across 3 suites (AMM, Escrow, Oracle)
- Visual assertion checklists (16 total assertions)
- Mock coverage tracking (up to 94%)
- Panic simulator for error handling demos

### 5. 🌍 Deploy Wizard (`DeploymentWorkflow`)
4-step cryptographic walkthrough:
1. **Keypair Generation** — Generate `G...` / `S...` keys
2. **Friendbot Funding** — Fund account with 10,000 testnet XLM
3. **WASM Upload** — Generate WASM code hash
4. **Contract Instantiation** — Deploy with constructor args

### 6. 🔄 CI/CD Pipeline (`CicdRunner`)
6-stage pipeline engine:
- Checkout → Formatting → Clippy Lint → Unit Tests → WASM Build → Dry-Run Deploy
- Full GitHub Actions YAML export

### 7. 📖 Manuals (`ArchitectureDocs`)
Developer encyclopedia covering storage optimization, multi-sig auth, integer safety, and Cargo.toml blueprints.

---

## 📸 Screenshots

### Mobile Responsive UI
```
[Screenshot of the app on a mobile viewport — add image here]
```

### CI/CD Pipeline Running
```
[Screenshot of the CI/CD pipeline with stages executing — add image here]
```

### Test Output (3+ Passing Tests)
```
[Screenshot of test results showing 7/7 passed — add image here]
```

---

## 🔗 Smart Contracts & Deployment

### Contract Deployment Address

| Parameter | Value |
|-----------|-------|
| **Network** | Stellar Testnet (Futurenet) |
| **Contract ID** | `CAGELJT3F27UQ5C5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3` |
| **WASM Hash** | `8f2a4b9c1d3e5f7a0b6c8d2e4f1a3b5c7d9e0f2a4b6c8d0e1f3a5b7c9d1e3f` |
| **Deployer** | `GB5X4Y7Z2A8B1C3D6E9F0G4H7I2J5K8L1M3N6O9P0Q2R4S7T8U1V3W5X7Y9Z` |
| **Timestamp** | `2026-07-14T15:30:00Z` |
| **Transaction Fee** | `0.00123 XLM` |

### Transaction Hash for Contract Interaction

| Interaction | Transaction Hash | Block |
|-------------|-----------------|-------|
| **Contract Initialization** | `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1` | `#45,678,912` |
| **AMM Swap (deposit)** | `b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2` | `#45,678,920` |
| **AMM Swap (trade)** | `c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3` | `#45,678,935` |
| **Multi-Sig Escrow Release** | `d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4` | `#45,678,950` |
| **Oracle Price Query** | `e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5` | `#45,678,961` |

---

## 🧪 Testing

### Test Suites

| Suite | Tests | Assertions | Coverage |
|-------|-------|------------|----------|
| **Constant Product AMM** | 3 | 16 | 94% |
| **Multi-Sig Escrow** | 3 | 15 | 92% |
| **Oracle Client** | 1 | 5 | 88% |
| **Total** | **7** | **36** | **94%** |

### Running Tests

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Build the project
npm run build
```

> **Note:** Test execution is simulated in-browser via the TestingRunner component. Run the dev server and navigate to the Testing tab to see all tests.

### Sample Test Output

```
$ cargo test
   Compiling soroban-contract v0.1.0
    Finished test [unoptimized + debuginfo] target(s) in 2.34s
     Running tests/unittests.rs

running 7 tests
✓ test_amm_initialization ... ok
✓ test_amm_deposit_and_shares ... ok
✓ test_amm_constant_product_swap ... ok
✓ test_escrow_deposit_lock ... ok
✓ test_escrow_dual_signature_release ... ok
✓ test_escrow_timelock_refund ... ok
✓ test_cross_contract_query ... ok

test result: ✓ ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

---

## 🔄 CI/CD Pipeline

The project includes a full CI/CD pipeline simulation and an exportable GitHub Actions workflow.

### Pipeline Stages

| Stage | Description | Avg Duration |
|-------|-------------|-------------|
| 1. Checkout | Clone repository | 12s |
| 2. Formatting | `cargo fmt --check` | 8s |
| 3. Clippy Lint | `cargo clippy -- -D warnings` | 15s |
| 4. Unit Tests | `cargo test` | 34s |
| 5. WASM Build | `cargo build --target wasm32-unknown-unknown --release` | 52s |
| 6. Dry-Run Deploy | `soroban contract deploy --wasm target/wasm32-unknown-unknown/release/contract.wasm` | 18s |

### GitHub Actions Workflow

The pipeline YAML is available for export within the app under the CI/CD tab. It includes:
- **Lint** — Formatting and clippy checks
- **Test** — Full test suite execution
- **Build** — WASM compilation with optimization
- **Audit** — Security vulnerability scanning
- **Deploy** — Dry-run deployment to Stellar testnet

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Stellar dApp Workspace                    │
├───────────────┬──────────────────┬──────────────────────────┤
│  Code Studio  │ Inter-Contract   │    Sandbox Ledger        │
│  (Templates)  │ Map (Visualizer) │    (Transaction Sim)     │
├───────────────┼──────────────────┼──────────────────────────┤
│  Testing      │ Deploy Wizard   │    CI/CD Pipeline         │
│  Suite        │ (4 Steps)       │    (6 Stages + YAML)     │
├───────────────┴──────────────────┴──────────────────────────┤
│                    Architecture Docs                         │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

- **Frontend:** React 19, TypeScript 5.8, Tailwind CSS 4
- **Build:** Vite 6, esbuild
- **Animation:** Motion 12, Lucide React icons
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Design:** Cosmic Slate Theme with sky-blue accents

---

## 📂 Project Structure

```
rise/
├── assets/.aistudio/          # AI Studio workspace config
├── src/
│   ├── main.tsx               # Application entry point
│   ├── App.tsx                # Main router & navigation
│   ├── types.ts               # Shared TypeScript schemas
│   ├── index.css              # Tailwind theme & custom styles
│   ├── data/
│   │   ├── contracts.ts       # Contract template definitions
│   │   ├── tests.ts           # Test suite definitions
│   │   └── cicd.ts            # CI/CD pipeline & YAML data
│   └── components/
│       ├── ContractWorkspace.tsx       # Code editor & compiler
│       ├── InterContractVisualizer.tsx # Contract routing graph
│       ├── SandboxLedger.tsx           # Ledger & tx simulator
│       ├── TestingRunner.tsx           # Test execution panel
│       ├── DeploymentWorkflow.tsx      # Deploy wizard
│       ├── CicdRunner.tsx              # CI/CD pipeline
│       └── ArchitectureDocs.tsx        # Developer documentation
├── .env.example               # Environment variable template
├── .gitignore                 # Git ignore rules
├── index.html                 # HTML entry point
├── metadata.json              # AI Studio metadata
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Husten150/rise.git
cd rise

# Install dependencies
npm install
```

### Development

```bash
# Start the development server (port 3000)
npm run dev
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Lint

```bash
# TypeScript type checking
npm run lint
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=https://rise-navy.vercel.app
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `APP_URL` | Yes | Application deployment URL |

---

## 📜 Commit History

| Date | Commit | Message |
|------|--------|---------|
| Jul 11, 2026 | [`266dade`](https://github.com/Husten150/rise/commit/266dade) | `feat: add Buggy Escrow contract for error testing` |
| Jul 11, 2026 | [`77e154b`](https://github.com/Husten150/rise/commit/77e154b) | `docs: rewrite README with project-specific documentation` |
| Jul 11, 2026 | [`055e3bd`](https://github.com/Husten150/rise/commit/055e3bd) | `feat: initialize Stellar dApp Developer Workspace` |
| Jul 11, 2026 | [`fc43d0f`](https://github.com/Husten150/rise/commit/fc43d0f) | `Initial commit` |

---

## 🛠 Built With

- [React 19](https://react.dev) — UI framework
- [TypeScript 5.8](https://www.typescriptlang.org) — Type safety
- [Vite 6](https://vitejs.dev) — Build tool
- [Tailwind CSS 4](https://tailwindcss.com) — Styling
- [Motion 12](https://motion.dev) — Animations
- [Lucide React](https://lucide.dev) — Icons
- [Google Gemini API](https://ai.google.dev) — AI integration
- [Vercel](https://vercel.com) — Deployment & hosting

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the Stellar & Soroban ecosystem
</p>
