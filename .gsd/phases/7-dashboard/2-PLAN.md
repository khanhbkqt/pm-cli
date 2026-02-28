---
phase: 7-dashboard
plan: 2
wave: 1
---

# Plan 7.2: CONTRIBUTING.md & LICENSE

## Objective
Create contributor guidelines and add an open-source license so the project is ready for public contributions. CONTRIBUTING.md explains how to set up, develop, test, and submit changes. LICENSE provides legal clarity.

## Context
- .gsd/SPEC.md — Constraints (Node.js/TypeScript, SQLite)
- package.json — Scripts (dev, build, test, install:local), engines (Node >=18)
- tsconfig.json — TypeScript configuration
- tsup.config.ts — Build configuration
- vitest.config.ts — Test configuration
- tests/ — Existing test files (agent.test.ts, task.test.ts, context.test.ts, etc.)
- src/ — Source structure (cli/, core/, db/, output/, server/)
- dashboard/ — React frontend (separate npm project)

## Tasks

<task type="auto">
  <name>Create CONTRIBUTING.md</name>
  <files>CONTRIBUTING.md (NEW)</files>
  <action>
    Create `CONTRIBUTING.md` in the project root with these sections:

    1. **Welcome**: Brief welcome message, link to issues for first-time contributors

    2. **Prerequisites**: List required tools:
       - Node.js >= 18.0.0
       - npm
       - Git

    3. **Development Setup**:
       ```
       git clone <repo-url>
       cd cli-prj-mgmt
       npm install
       cd dashboard && npm install && cd ..
       npm run build
       ```

    4. **Project Structure**: Show the directory layout with brief descriptions:
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
       ```

    5. **Development Workflow**:
       - `npm run dev` — watch mode for CLI
       - `npm run build` — build both CLI and dashboard
       - `npm test` — run all tests
       - `npm run install:local` — install `pm` command globally

    6. **Code Standards**:
       - TypeScript strict mode
       - ESM modules (`"type": "module"` in package.json)
       - All CLI commands require `--agent` flag or `PM_AGENT` env var
       - `--json` output support is mandatory for all commands
       - Use `better-sqlite3` for all DB operations (not async)

    7. **Testing**:
       - Framework: Vitest
       - Run: `npm test`
       - Test files live in `tests/` with `.test.ts` extension
       - Naming: `{module}.test.ts` for core, `{module}-cli.test.ts` for CLI
       - All new features must include tests

    8. **Pull Request Process**:
       - Fork and create a feature branch
       - Follow existing code patterns
       - Include tests
       - Ensure `npm test` passes
       - Write clear commit messages
       - One feature per PR

    Style: Keep it concise and actionable. English only.
  </action>
  <verify>
    - `test -f CONTRIBUTING.md` — file exists
    - `grep -c '##' CONTRIBUTING.md` — should have ≥6 section headers
    - `grep 'npm test' CONTRIBUTING.md` — mentions test command
    - `grep 'npm run dev' CONTRIBUTING.md` — mentions dev command
  </verify>
  <done>
    - CONTRIBUTING.md exists in project root
    - Contains all 8 sections with accurate setup instructions
    - Commands match actual package.json scripts
  </done>
</task>

<task type="auto">
  <name>Add MIT LICENSE file</name>
  <files>LICENSE (NEW), package.json</files>
  <action>
    1. Create `LICENSE` file in project root with the standard MIT License text.
       - Year: 2026
       - Copyright holder: use the project name "PM CLI Contributors" (generic for open-source)

    2. Update `package.json`:
       - Change `"license": "ISC"` to `"license": "MIT"` (line 31)
       - This matches the LICENSE file being added

    Keep the MIT license text exactly as the standard template from opensource.org.
  </action>
  <verify>
    - `test -f LICENSE` — file exists
    - `grep 'MIT' LICENSE` — contains MIT reference
    - `grep '"license": "MIT"' package.json` — package.json updated
  </verify>
  <done>
    - LICENSE file exists with standard MIT text
    - package.json license field updated from ISC to MIT
  </done>
</task>

## Success Criteria
- [ ] CONTRIBUTING.md exists with setup, standards, and PR process
- [ ] LICENSE file exists with MIT license
- [ ] package.json license field is "MIT"
- [ ] All commands in CONTRIBUTING.md match actual project scripts
