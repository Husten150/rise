
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

> An end-to-end Stellar dApp with real Soroban smart contracts, Freighter wallet integration, and a full developer workspace. Built with React 19, Vite 6, Tailwind CSS 4, and @stellar/stellar-sdk.

---

## Table of Contents

- [Features](#features)
- [Smart Contracts](#smart-contracts)
- [Frontend Integration](#frontend-integration)
- [Deployment](#deployment)
- [Testing](#testing)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Features

### 1. Wallet Connection (Freighter)
Real Stellar wallet integration using `@stellar/freighter-api`:
- Connect/disconnect Freighter wallet
- Display wallet public key and network
- Sign transactions directly from the browser
- Auto-detect network (Testnet/Mainnet)

### 2. Real Soroban Smart Contracts
Three production-grade Soroban contracts in `contracts/`:

| Contract | Functions | Storage |
|----------|-----------|---------|
| **Constant Product AMM** | `initialize`, `deposit`, `swap_a_to_b`, `swap_b_to_a`, `get_reserves`, `get_lp_balance` | Instance (reserves, LP supply) |
| **Multi-Sig Escrow** | `create_escrow`, `approve_a`, `approve_b`, `release`, `refund`, `get_escrow` | Instance (escrow state) |
| **Price Oracle** | `initialize`, `set_price`, `get_price`, `get_asset_valuation`, `verify_trade_rate`, `get_all_assets` | Instance (price entries) |

### 3. Contract SDK Integration
Frontend contract interaction via `@stellar/stellar-sdk`:
- `SorobanRpc.Server` for testnet/mainnet RPC calls
- `Contract` type-safe contract invocation
- `TransactionBuilder` for constructing Soroban operations
- Real simulation and submission pipeline

---

## Smart Contracts

Located in `contracts/` — each contract is a standalone Rust project:

```
contracts/
├── Cargo.toml              # Workspace root
├── amm/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs          # AMM: x*y=k swap with 0.3% fee
│       └── test.rs         # 5 tests
├── multisig_escrow/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs          # Dual-signature escrow with timelock
│       └── test.rs         # 5 tests
└── oracle/
    ├── Cargo.toml
    └── src/
        ├── lib.rs          # Price feed oracle
        └── test.rs         # 5 tests
```

### Build Contracts

```bash
# Install Soroban CLI
cargo install soroban-cli

# Build all contracts
cd contracts
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test
```

### Deploy to Testnet

```bash
# Deploy AMM
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/amm.wasm \
  --source SECRET_KEY \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Initialize AMM
soroban contract invoke \
  --id CONTRACT_ID \
  --source SECRET_KEY \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015" \
  -- \
  initialize \
  --admin G... \
  --token_a C... \
  --token_b C...
```

---

## Frontend Integration

### Wallet Connection

The app uses `@stellar/freighter-api` for wallet connectivity:

```typescript
// src/hooks/useWallet.ts
- window.freighter.isConnected() — check connection
- window.freighter.setAllowed() — request permission
- window.freighter.getAddress() — get public key
- window.freighter.getNetwork() — detect network
- window.freighter.signTransaction() — sign XDR
```

### Contract Calls

The app uses `@stellar/stellar-sdk` for Soroban RPC interactions:

```typescript
// src/services/sorobanClient.ts
- SorobanRpc.Server — RPC client for testnet/mainnet
- Contract — type-safe contract call builder
- TransactionBuilder — Soroban transaction construction

// src/services/contractInteractions.ts
- AMM_FUNCTIONS — getReserves, deposit, swapAtoB, swapBtoA
- ESCROW_FUNCTIONS — createEscrow, approveA/B, release, refund
- ORACLE_FUNCTIONS — getPrice, getAssetValuation, verifyTradeRate
```

---

## Deployment

### Contract Deployment Address (Testnet)

| Parameter | Value |
|-----------|-------|
| **Network** | Stellar Testnet |
| **RPC URL** | `https://soroban-testnet.stellar.org` |
| **Network Passphrase** | `Test SDF Network ; September 2015` |

After deployment, set contract IDs in `.env`:

```env
VITE_AMM_CONTRACT_ID="<deployed-amm-contract-id>"
VITE_ESCROW_CONTRACT_ID="<deployed-escrow-contract-id>"
VITE_ORACLE_CONTRACT_ID="<deployed-oracle-contract-id>"
VITE_RPC_URL="https://soroban-testnet.stellar.org"
```

### Frontend Deployment

The app is hosted on Vercel at [https://rise-navy.vercel.app](https://rise-navy.vercel.app).

---

## Testing

### Smart Contract Tests (Rust)

```bash
cd contracts
cargo test
```

| Suite | Tests | Coverage |
|-------|-------|----------|
| **AMM** | 5 | Pool init, deposit, swap A->B, swap B->A, constant product invariant |
| **Multi-Sig Escrow** | 5 | Create escrow, dual-signature release, timelock refund, cannot release w/o approval, cannot approve twice |
| **Oracle** | 5 | Initialize, set/get price, get all assets, asset valuation, verify trade rate, negative price guard |
| **Total** | **15** | **Full coverage** |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Stellar dApp Workspace                     │
├───────────────┬──────────────────┬───────────────────────────┤
│  Wallet       │  Contract SDK    │    Workspace UI            │
│  (Freighter)  │  (stellar-sdk)   │    (Code Studio, Ledger)   │
├───────────────┴──────────────────┴───────────────────────────┤
│                    Soroban RPC (Testnet)                      │
├───────────────┬──────────────────┬───────────────────────────┤
│  AMM Contract │ Escrow Contract  │   Oracle Contract          │
│  (amm/)       │ (multisig_escrow)│   (oracle/)               │
└───────────────┴──────────────────┴───────────────────────────┘
```

### Tech Stack

- **Frontend:** React 19, TypeScript 5.8, Tailwind CSS 4
- **Build:** Vite 6, esbuild
- **Blockchain:** Stellar Soroban (Protocol 20)
- **Wallet:** @stellar/freighter-api
- **SDK:** @stellar/stellar-sdk (SorobanRPC)
- **Smart Contracts:** Rust, soroban-sdk 22.0.0
- **Animation:** Motion 12, Lucide React icons
- **Deployment:** Vercel

---

## Project Structure

```
rise/
├── contracts/                  # Soroban smart contracts
│   ├── Cargo.toml              # Workspace root
│   ├── amm/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs          # AMM implementation
│   │       └── test.rs         # AMM tests
│   ├── multisig_escrow/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs          # Escrow implementation
│   │       └── test.rs         # Escrow tests
│   └── oracle/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs          # Oracle implementation
│           └── test.rs         # Oracle tests
├── src/
│   ├── main.tsx                # Application entry point
│   ├── App.tsx                 # Main router & navigation
│   ├── types.ts                # Shared TypeScript schemas
│   ├── index.css               # Tailwind theme & custom styles
│   ├── hooks/
│   │   └── useWallet.ts        # Freighter wallet hook
│   ├── services/
│   │   ├── sorobanClient.ts    # Soroban RPC client
│   │   └── contractInteractions.ts  # Contract function calls
│   ├── components/
│   │   ├── WalletConnector.tsx       # Wallet connect UI
│   │   ├── ContractWorkspace.tsx     # Code editor & compiler
│   │   ├── InterContractVisualizer.tsx # Contract routing graph
│   │   ├── SandboxLedger.tsx         # Ledger & tx simulator
│   │   ├── TestingRunner.tsx         # Test execution panel
│   │   ├── DeploymentWorkflow.tsx    # Deploy wizard
│   │   ├── CicdRunner.tsx            # CI/CD pipeline
│   │   └── ArchitectureDocs.tsx      # Developer documentation
│   └── data/
│       ├── contracts.ts        # Contract template definitions
│       ├── tests.ts            # Test suite definitions
│       └── cicd.ts             # CI/CD pipeline & YAML data
├── .env.example                # Environment variable template
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite build configuration
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://rustup.rs/) (for contract compilation)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup) (for contract deployment)
- [Freighter Wallet](https://freighter.app) browser extension

### Installation

```bash
git clone https://github.com/Husten150/rise.git
cd rise

# Install frontend dependencies
npm install

# Build smart contracts
cd contracts
cargo build --target wasm32-unknown-unknown --release
cd ..
```

### Development

```bash
# Start the development server (port 3000)
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=https://rise-navy.vercel.app
VITE_RPC_URL=https://soroban-testnet.stellar.org
VITE_AMM_CONTRACT_ID=<deployed-amm-contract-id>
VITE_ESCROW_CONTRACT_ID=<deployed-escrow-contract-id>
VITE_ORACLE_CONTRACT_ID=<deployed-oracle-contract-id>
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `APP_URL` | Yes | Application deployment URL |
| `VITE_RPC_URL` | Yes | Soroban RPC endpoint |
| `VITE_AMM_CONTRACT_ID` | Yes | Deployed AMM contract address |
| `VITE_ESCROW_CONTRACT_ID` | Yes | Deployed Escrow contract address |
| `VITE_ORACLE_CONTRACT_ID` | Yes | Deployed Oracle contract address |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
