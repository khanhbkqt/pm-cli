# Architecture

> A contributor-focused overview of PM CLI's system design.

## Overview

PM CLI is a local-first project management tool with a CLI interface, web dashboard, and GSD-inspired workflow engine. All data is stored in a single SQLite database (`.pm/data.db`) per project. There is no background server process — the database is accessed directly, and the web dashboard runs an embedded Express server on demand.

## System Diagram

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  CLI             │────▶│  Core Logic   │────▶│  SQLite          │
│  (Commander.js)  │     │  (TypeScript) │     │  (better-sqlite3)│
└─────────────────┘     └──────┬───────┘     └─────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐
       │   Workflow   │  │   Express    │  │   Install    │
       │   Engine     │  │   Server     │  │   Adapters   │
       └─────────────┘  └──────┬──────┘  └─────────────┘
                               │
                        ┌──────┴──────┐
                        │   React      │
                        │   Dashboard  │
                        └─────────────┘
```

The CLI and the dashboard both use the **Core Logic** layer, which is the single source of truth for all business operations.

## Layer Descriptions

### CLI Layer (`src/cli/`)

Entry point: `src/index.ts` → `src/cli/program.ts`

Commander.js command definitions and argument parsing. Each command file in `src/cli/commands/` maps to a CLI subcommand. Commands call core functions, then pass results to the output formatter.

**Files:**
- `program.ts` — Commander program setup
- `commands/init.ts` — `pm init`
- `commands/task.ts` — `pm task add|list|show|update|assign|comment`
- `commands/agent.ts` — `pm agent register|list|show|whoami`
- `commands/context.ts` — `pm context set|get|list|search`
- `commands/dashboard.ts` — `pm dashboard`
- `commands/status.ts` — `pm status`
- `commands/milestone.ts` — `pm milestone create|list|show|update|complete`
- `commands/phase.ts` — `pm phase add|list|show|update`
- `commands/plan.ts` — `pm plan create|list|show|update`
- `commands/progress.ts` — `pm progress`
- `commands/install.ts` — `pm install <client>`

### Core Layer (`src/core/`)

Pure business logic — no I/O formatting, no CLI concerns. Each module exposes functions that operate on the database.

**Files:**
- `task.ts` — Task CRUD (add, list, show, update, assign, comment)
- `agent.ts` — Agent management (register, list, show)
- `context.ts` — Context sharing (set, get, list, search)
- `init.ts` — Project initialization (create DB, config)
- `identity.ts` — Agent identity resolution (`--agent` flag or `PM_AGENT` env)
- `milestone.ts` — Milestone CRUD (create, list, show, update, complete)
- `phase.ts` — Phase management within milestones (add, list, show, update)
- `plan.ts` — Execution plan management within phases (create, list, show, update)
- `workflow.ts` — State machine (transitions, validation rules, cascading status)
- `install/` — Multi-client adapter system (see Install Layer below)

### Database Layer (`src/db/`)

SQLite wrapper using `better-sqlite3` (synchronous API). Handles schema creation, WAL mode setup, and provides the database connection.

**Files:**
- `connection.ts` — Database connection factory
- `schema.ts` — Table definitions and migrations (includes `milestones`, `phases`, `plans`, `workflow_state` tables)
- `types.ts` — TypeScript type definitions for DB rows
- `index.ts` — Public exports

### Output Layer (`src/output/`)

Formatter that switches between human-readable tables and JSON output based on the `--json` flag.

**Files:**
- `formatter.ts` — Output formatting (human/JSON switch)

### Server Layer (`src/server/`)

Express HTTP server with REST API routes. Started by `pm dashboard`, serves the React frontend as static files and exposes JSON API endpoints.

**Files:**
- `app.ts` — Express app setup, middleware, static serving
- `routes/` — API route handlers (tasks, agents, context, status, progress)
- `utils.ts` — Server utilities (port finding, etc.)

### Install Layer (`src/core/install/`)

Multi-client adapter system that translates canonical agent workflow instructions into each AI client's native configuration format. Supports writing single files or directories of workflow markdown files.

**Files:**
- `registry.ts` — Client detection and adapter registry
- `template.ts` — Template loader (`loadTemplate`, `loadWorkflowTemplates`, `getWorkflowsDir`)
- `workflow-index.ts` — Builds the workflow index table (`buildWorkflowIndex`)
- `adapters/antigravity.ts` — Writes `.agent/workflows/*.md` + `.agent/rules/*.md`
- `adapters/claude-code.ts` — Writes `CLAUDE.md` with embedded workflow index
- `adapters/cursor.ts` — Writes `.cursor/rules/*.mdc` workflow files
- `adapters/codex.ts` — Writes `AGENTS.md` with embedded workflow index
- `adapters/opencode.ts` — Writes `AGENTS.md` + `opencode.json`
- `adapters/gemini-cli.ts` — Writes `GEMINI.md` with embedded workflow index
- `index.ts` — Public exports

### Dashboard (`dashboard/`)

React + Vite + TypeScript single-page application. Communicates with the server via REST API. Built output is served as static files by the Express server.

## Data Flow

### CLI Command

```
User types `pm task list --agent claude`
  → Commander parses args
    → commands/task.ts calls core/task.ts
      → core/task.ts queries SQLite via db/connection.ts
        → output/formatter.ts renders result (table or JSON)
```

### Workflow Transition

```
User types `pm milestone update v1 --status active`
  → commands/milestone.ts resolves identity
    → core/milestone.ts calls core/workflow.ts
      → workflow.ts validates transition (planning → active)
        → SQLite update + cascading state changes
```

### Dashboard Request

```
React component fetches /api/tasks
  → Express route handler
    → core/task.ts queries SQLite
      → JSON response back to React
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite (no server DB) | Zero-config, single-file, instant startup |
| Agent identity required | Every action is traced — who did what |
| CLI as protocol | Same interface for humans and AI agents |
| Core logic separated from I/O | Testable, reusable by both CLI and API |
| Synchronous DB (better-sqlite3) | Simpler code, no async overhead for local-only tool |
| Express embedded (not standalone) | Dashboard is optional, no persistent process |
| GSD-inspired workflow engine | Project lifecycle (milestones → phases → plans) enforced by a state machine — prevents invalid status transitions and ensures structured delivery |
| Multi-client install adapters | Canonical workflow instructions adapted to each AI client's native config format — one source of truth, multiple targets |

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/index.ts` | CLI entry point |
| `src/core/task.ts` | Task business logic |
| `src/core/agent.ts` | Agent business logic |
| `src/core/context.ts` | Context business logic |
| `src/core/milestone.ts` | Milestone CRUD and lifecycle |
| `src/core/phase.ts` | Phase management within milestones |
| `src/core/plan.ts` | Execution plan management |
| `src/core/workflow.ts` | State machine transitions and validation |
| `src/core/install/registry.ts` | Client detection and adapter lookup |
| `src/core/install/template.ts` | Template and workflow file loader |
| `src/db/schema.ts` | Database schema definitions |
| `src/server/app.ts` | Express app configuration |
| `dashboard/src/App.tsx` | React app entry |
| `docs/agent-guide/` | Agent instruction files and workflow templates |
| `package.json` | Scripts, dependencies |
| `tsup.config.ts` | CLI build configuration |
| `vitest.config.ts` | Test configuration |

---

*For setup and contribution guidelines, see [CONTRIBUTING.md](../CONTRIBUTING.md).*
