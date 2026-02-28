# Contributing to PM CLI

Welcome! We're glad you're interested in contributing to PM CLI. Whether it's a bug fix, new feature, or documentation improvement — all contributions are appreciated.

Check out [open issues](https://github.com/your-org/cli-prj-mgmt/issues) for ideas or create a new one to discuss your proposal.

## Prerequisites

- **Node.js** ≥ 18.0.0
- **npm**
- **Git**

## Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/cli-prj-mgmt.git
cd cli-prj-mgmt

# Install CLI dependencies
npm install

# Install dashboard dependencies
cd dashboard && npm install && cd ..

# Build everything
npm run build

# (Optional) Install the `pm` command globally for local testing
npm run install:local
```

## Project Structure

```
src/
  cli/commands/   — CLI command handlers (Commander.js)
  core/           — Business logic (task, agent, context, init, identity)
  db/             — SQLite database layer (better-sqlite3)
  output/         — Output formatting (human-readable + JSON)
  server/         — Express HTTP server + API routes
dashboard/        — React frontend (Vite + TypeScript)
tests/            — Vitest test files
scripts/          — Install/uninstall scripts
docs/             — Architecture and design documentation
```

## Development Workflow

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode for CLI (auto-recompile on change) |
| `npm run build` | Build both CLI and dashboard |
| `npm run build:dashboard` | Build dashboard only |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run install:local` | Install `pm` command globally |
| `npm run uninstall:local` | Remove global `pm` command |

## Code Standards

- **TypeScript** strict mode — all code must pass type-checking
- **ESM modules** — the project uses `"type": "module"` in package.json
- **Agent identity** — all CLI commands require `--agent` flag or `PM_AGENT` env var
- **JSON output** — every command must support `--json` flag for machine-readable output
- **Database** — use `better-sqlite3` for all DB operations (synchronous API, not async)
- **Keep core logic separate** — business logic lives in `src/core/`, not in command handlers

## Testing

- **Framework:** [Vitest](https://vitest.dev/)
- **Run:** `npm test`
- **Watch mode:** `npm run test:watch`
- **Location:** test files live in `tests/` with `.test.ts` extension
- **Naming:** `{module}.test.ts` for core modules, `{module}-cli.test.ts` for CLI commands

All new features **must** include tests. If you're fixing a bug, add a test that reproduces it.

## Pull Request Process

1. **Fork** the repository and create a feature branch (`git checkout -b feat/my-feature`)
2. **Follow** existing code patterns and conventions
3. **Include** tests for any new functionality
4. **Ensure** `npm test` passes before submitting
5. **Write** clear, descriptive commit messages
6. **One feature per PR** — keep changes focused and reviewable
7. **Open** a pull request with a clear description of the change

## Questions?

If you have questions or need help, open an issue and we'll be happy to assist.
