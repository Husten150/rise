# Changelog

## v0.1.0 (2026-07-11)

### Features
- Initial Stellar dApp Developer Workspace scaffold
- 4 contract templates: AMM, Multi-Sig Escrow, Oracle Client, Buggy Escrow
- Interactive inter-contract call graph visualizer
- Sandbox ledger with real-time block streaming
- Simulated test runner with 7 tests across 3 suites
- 4-step deployment wizard (keypair, funding, WASM upload, instantiation)
- CI/CD pipeline visualizer with GitHub Actions YAML export
- Developer documentation with storage, auth, and security guides
- Cosmic Slate Theme with Tailwind CSS 4 styling

## v0.1.1 (2026-07-15)

### Documentation
- Comprehensive README with feature docs, deployment details, and test output
- Added MIT LICENSE file
- Added CONTRIBUTING.md with contribution guidelines
- Added CHANGELOG.md

### CI/CD
- Added GitHub Actions workflow for lint, build, and deploy

### Bug Fixes
- Fixed invalid Tailwind class `bg-slate-850` → `bg-slate-800`
- Fixed `NodeJS.Timeout` type to `number` for browser `setInterval`
- Made `clean` script cross-platform (Windows/Unix compatible)
- Fixed garbled UTF-8 character in `vite.config.ts` comment

### Chore
- Enabled strict TypeScript checks (`strict`, `strictNullChecks`, `noImplicitAny`)
- Added `.editorconfig` for consistent coding styles
- Added `test` npm script
