# Architecture

> A contributor-focused overview of PM CLI's system design.

## Overview

PM CLI is a local-first project management tool with a CLI interface and web dashboard. All data is stored in a single SQLite database (`.pm/data.db`) per project. There is no background server process — the database is accessed directly, and the web dashboard runs an embedded Express server on demand.

## System Diagram

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  CLI             │────▶│  Core Logic   │────▶│  SQLite          │
│  (Commander.js)  │     │  (TypeScript) │     │  (better-sqlite3)│
└─────────────────┘     └──────┬───────┘     └─────────────────┘
                               │
                        ┌──────┴──────┐
                        │   Express    │
                        │   Server     │
                        └──────┬──────┘
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

### Core Layer (`src/core/`)

Pure business logic — no I/O formatting, no CLI concerns. Each module exposes functions that operate on the database.

**Files:**
- `task.ts` — Task CRUD (add, list, show, update, assign, comment)
- `agent.ts` — Agent management (register, list, show)
- `context.ts` — Context sharing (set, get, list, search)
- `init.ts` — Project initialization (create DB, config)
- `identity.ts` — Agent identity resolution (`--agent` flag or `PM_AGENT` env)

### Database Layer (`src/db/`)

SQLite wrapper using `better-sqlite3` (synchronous API). Handles schema creation, WAL mode setup, and provides the database connection.

**Files:**
- `connection.ts` — Database connection factory
- `schema.ts` — Table definitions and migrations
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
- `routes/` — API route handlers (tasks, agents, context, status)
- `utils.ts` — Server utilities (port finding, etc.)

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

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/index.ts` | CLI entry point |
| `src/core/task.ts` | Task business logic |
| `src/core/agent.ts` | Agent business logic |
| `src/core/context.ts` | Context business logic |
| `src/db/schema.ts` | Database schema definitions |
| `src/server/app.ts` | Express app configuration |
| `dashboard/src/App.tsx` | React app entry |
| `package.json` | Scripts, dependencies |
| `tsup.config.ts` | CLI build configuration |
| `vitest.config.ts` | Test configuration |

---

*For setup and contribution guidelines, see [CONTRIBUTING.md](../CONTRIBUTING.md).*
