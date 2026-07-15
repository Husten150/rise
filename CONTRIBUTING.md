# Contributing

Thank you for considering contributing to the Stellar dApp Developer Workspace.

## Code of Conduct

Be respectful, inclusive, and constructive. Harassment or toxic behavior will not be tolerated.

## How to Contribute

### Reporting Bugs

Open an issue with:
- A clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/environment details

### Feature Requests

Open an issue with:
- A clear description of the feature
- Why it would be valuable
- Any implementation ideas

### Pull Requests

1. Fork the repository
2. Create a branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run linting: `npm run lint`
5. Ensure the build passes: `npm run build`
6. Commit with a descriptive message
7. Push and open a PR against `main`

## Development Setup

```bash
git clone https://github.com/Husten150/rise.git
cd rise
npm install
npm run dev
```

## Project Structure

- `src/components/` — React components for each workspace module
- `src/data/` — Contract templates, test definitions, CI/CD data
- `src/types.ts` — Shared TypeScript interfaces

## Coding Style

- Use TypeScript with strict mode enabled
- Follow existing component patterns
- Use Tailwind CSS utility classes (no custom CSS unless necessary)
- Keep components focused and under 500 lines
