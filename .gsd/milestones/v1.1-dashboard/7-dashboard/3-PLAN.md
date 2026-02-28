---
phase: 7-dashboard
plan: 3
wave: 2
---

# Plan 7.3: Architecture Overview & Verification

## Objective
Create an architecture document for contributors that explains the system design, and verify all open-source documentation renders correctly and contains accurate information.

## Context
- README.md — Main project documentation (created in Plan 7.1)
- CONTRIBUTING.md — Contributor guide (created in Plan 7.2)
- LICENSE — MIT license (created in Plan 7.2)
- src/ — Source code structure
- dashboard/ — React frontend
- .gsd/SPEC.md — Project vision

## Tasks

<task type="auto">
  <name>Create docs/ARCHITECTURE.md</name>
  <files>docs/ARCHITECTURE.md (NEW)</files>
  <action>
    Create `docs/ARCHITECTURE.md` with a contributor-focused architecture overview:

    1. **Overview**: High-level description — PM CLI is a local-first project management tool with a CLI interface and web dashboard. All data stored in SQLite.

    2. **System Diagram**: ASCII art or text-based diagram showing:
       ```
       ┌──────────┐    ┌──────────────┐    ┌───────────┐
       │  CLI     │───▶│  Core Logic  │───▶│  SQLite   │
       │ (Commander)│   │  (TypeScript)│    │(better-sqlite3)│
       └──────────┘    └──────────────┘    └───────────┘
                              │
                       ┌──────┴──────┐
                       │  Express    │
                       │  Server     │
                       └──────┬──────┘
                              │
                       ┌──────┴──────┐
                       │  React      │
                       │  Dashboard  │
                       └─────────────┘
       ```

    3. **Layer Descriptions**:
       - **CLI Layer** (`src/cli/`): Commander.js command definitions, argument parsing, output formatting. Entry point is `src/index.ts`.
       - **Core Layer** (`src/core/`): Business logic — task CRUD, agent management, context sharing, identity resolution. No I/O formatting here.
       - **Database Layer** (`src/db/`): SQLite wrapper using better-sqlite3. Handles schema creation, migrations, WAL mode setup.
       - **Output Layer** (`src/output/`): Formatter that switches between human-readable and JSON output based on `--json` flag.
       - **Server Layer** (`src/server/`): Express HTTP server with REST API routes. Reuses core logic. Serves dashboard static files.
       - **Dashboard** (`dashboard/`): React + Vite + TypeScript SPA. Communicates with server via REST API.

    4. **Data Flow**: Explain how a command flows:
       - CLI parses args → calls core function → core queries/mutates SQLite → output formatter renders result
       - Dashboard: React component → fetch API → Express route → core function → SQLite → JSON response

    5. **Key Design Decisions**:
       - SQLite for simplicity and zero-config (no server process)
       - Agent identity required on every command for traceability
       - CLI as protocol (same interface for humans and AI)
       - Core logic separated from I/O (testable, reusable by both CLI and API)

    6. **File Reference**: Quick reference table mapping key files to their purpose

    Keep it concise (80-150 lines). Focus on helping new contributors understand WHERE to make changes.
  </action>
  <verify>
    - `test -f docs/ARCHITECTURE.md` — file exists
    - `wc -l docs/ARCHITECTURE.md` — should be 80-150 lines
    - `grep -c '##' docs/ARCHITECTURE.md` — should have ≥5 section headers
  </verify>
  <done>
    - docs/ARCHITECTURE.md exists with system diagram and layer descriptions
    - Accurate to actual source structure
    - Concise and contributor-focused
  </done>
</task>

<task type="auto">
  <name>Cross-verify all documentation links and accuracy</name>
  <files>README.md, CONTRIBUTING.md, LICENSE, docs/ARCHITECTURE.md</files>
  <action>
    Verify all documentation is consistent and accurate:

    1. **README.md checks**:
       - Verify all CLI command examples match the actual Commander.js command definitions in `src/cli/commands/`
       - Verify install steps work: `npm install && npm run build && npm run install:local`
       - Verify the link to CONTRIBUTING.md points to correct path
       - Verify the link to LICENSE points to correct path
       - Verify the link to docs/ARCHITECTURE.md points to correct path
       - Verify badge URLs are valid shields.io format

    2. **CONTRIBUTING.md checks**:
       - Verify all npm scripts mentioned exist in package.json
       - Verify test command `npm test` runs successfully
       - Verify directory structure matches actual `src/` layout

    3. **LICENSE checks**:
       - Verify MIT license is standard text
       - Verify package.json `license` field matches

    4. **Fix any inconsistencies found**

    Do NOT skip this verification — documentation with wrong commands is worse than no documentation.
  </action>
  <verify>
    - `npm test` exits 0 (tests still pass, nothing broken)
    - `grep -l 'CONTRIBUTING' README.md` — README references CONTRIBUTING
    - `grep -l 'ARCHITECTURE' README.md` — README references architecture doc
    - `grep '"license": "MIT"' package.json` — license updated
  </verify>
  <done>
    - All cross-references between docs are correct
    - All CLI examples match actual commands
    - All npm scripts referenced actually exist
    - Tests still pass
  </done>
</task>

## Success Criteria
- [ ] docs/ARCHITECTURE.md exists with accurate system overview
- [ ] All documentation files cross-reference each other correctly
- [ ] All CLI command examples are verified against actual source
- [ ] `npm test` passes (no regressions)
