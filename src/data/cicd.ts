import { PipelineStage } from '../types';

export const GITHUB_WORKFLOW_YML = `name: Soroban Smart Contract CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  CARGO_TERM_COLOR: always
  SOROBAN_VERSION: 20.0.0

jobs:
  lint-and-test:
    name: Lint, Test & Compile Smart Contracts
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Install Rust Toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          toolchain: stable
          targets: wasm32-unknown-unknown
          components: clippy, rustfmt

      - name: Cache Rust Dependencies
        uses: Swatinem/rust-cache@v2

      - name: Install Soroban CLI
        run: |
          cargo install --locked soroban-cli --version \${{ env.SOROBAN_VERSION }}

      - name: Check Formatting
        run: cargo fmt --all -- --check

      - name: Run Clippy Linter
        run: cargo clippy --all-targets -- -D warnings

      - name: Run Smart Contract Unit Tests
        run: cargo test --all

      - name: Build Optimized WASM Binaries
        run: |
          soroban contract build
          # Outputs optimized WASM files to ./target/wasm32-unknown-unknown/release/*.wasm

      - name: Audit Contract Storage Boundaries
        run: |
          # Verify WASM size is below Stellar network limitations (64KB)
          ls -lh target/wasm32-unknown-unknown/release/*.wasm
          for file in target/wasm32-unknown-unknown/release/*.wasm; do
            size=$(stat -c%s "$file")
            if [ $size -gt 65536 ]; then
              echo "Error: Smart contract WASM exceeds 64KB network limit!"
              exit 1
            fi
          done

      - name: Dry-Run Testnet Deployments
        run: |
          # Simulates Soroban dry-run execution on a temporary testnet sandbox
          soroban contract install --network testnet --source-account deployer --wasm target/wasm32-unknown-unknown/release/liquidity_pool.wasm
`;

export const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'checkout',
    name: 'Checkout & Env Setup',
    status: 'idle',
    duration: 0,
    logs: [
      'Retrieving repository metadata...',
      'Mapping branch commits to active SHA hashes...',
      'Installing system tools: build-essential, clang, git',
      'Configuring Rust target toolchain: wasm32-unknown-unknown',
      'Configuring soroban-cli (v20.0.0) environmental binaries...'
    ]
  },
  {
    id: 'fmt',
    name: 'Cargo Formatting Check',
    status: 'idle',
    duration: 0,
    logs: [
      'Running cargo fmt --all -- --check...',
      'Analyzing syntax trees of src/lib.rs, src/tests.rs...',
      'Checking Rust formatting styles: standard indentations, imports ordering...',
      'All source files comply with rustfmt styling specs. No diffs found.'
    ]
  },
  {
    id: 'clippy',
    name: 'Clippy static audit & Lints',
    status: 'idle',
    duration: 0,
    logs: [
      'Running cargo clippy --all-targets -- -D warnings...',
      'Executing static analysis checks on Soroban contract macros...',
      'Analyzing compiler-optimized allocations...',
      'Evaluating code against Soroban SDK best practices:',
      '  - Checked: No dangerous recursion in contract logic.',
      '  - Checked: Proper authorization validation with require_auth().',
      '  - Checked: Optimal use of env.storage() instance/persistent memory levels.',
      'Status: 0 warnings, 0 errors, audit passed successfully.'
    ]
  },
  {
    id: 'test',
    name: 'Cargo Contract Unit Tests',
    status: 'idle',
    duration: 0,
    logs: [
      'Running cargo test --all...',
      'Compiling smart contract workspace for test profile...',
      'Discovered 7 contract unit tests within active crate.',
      'Running tests/test_amm.rs...',
      '  - test_amm_initialization ... ok (0.01s)',
      '  - test_amm_deposit_and_shares ... ok (0.02s)',
      '  - test_amm_constant_product_swap ... ok (0.02s)',
      'Running tests/test_escrow.rs...',
      '  - test_escrow_deposit_lock ... ok (0.01s)',
      '  - test_escrow_dual_signature_release ... ok (0.03s)',
      '  - test_escrow_timelock_refund ... ok (0.02s)',
      'Running tests/test_oracle.rs...',
      '  - test_cross_contract_query ... ok (0.01s)',
      'Test results: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out.'
    ]
  },
  {
    id: 'build_wasm',
    name: 'Optimize & Build WASM',
    status: 'idle',
    duration: 0,
    logs: [
      'Building optimized production-ready WASM binaries...',
      'Running: cargo build --target wasm32-unknown-unknown --release',
      'Optimizing WASM size via cargo-strip and wasm-opt...',
      'Optimized file: target/wasm32-unknown-unknown/release/liquidity_pool.wasm',
      '  - Size: 18.4 KB (Well within Stellar 64 KB transaction payload envelope)',
      'Optimized file: target/wasm32-unknown-unknown/release/escrow_contract.wasm',
      '  - Size: 15.2 KB',
      'Optimized file: target/wasm32-unknown-unknown/release/oracle_router.wasm',
      '  - Size: 12.1 KB',
      'WASM optimization phase complete.'
    ]
  },
  {
    id: 'dry_run',
    name: 'Dry-Run Testnet Deployment',
    status: 'idle',
    duration: 0,
    logs: [
      'Loading Testnet deployment profiles...',
      'Retrieving mock deployer public key (G...DEPLOYER)...',
      'Installing WASM hashes on Stellar Testnet virtual ledger...',
      '  - Install Transaction Hash: 8fa7e466c1fbc0300d119e768b4b10b0...',
      '  - Initialized Contract Addresses generated:',
      '    - LiquidityPool: CAS3X7KYHWS27AJKR4PLDNVQCSGWSB7XSWP47MBLU2UYW',
      '    - EscrowContract: CBK8X9YYJKW6M9EHR4PLDNVQCSGWSB7XSWP47MBLU2UYR',
      '    - PriceOracleRouter: CC6X78RRP9YJKWM3PLDNVQCSGWSB7XSWP47MBLU2UYT',
      'Dry-run deployment tests succeeded.'
    ]
  }
];
