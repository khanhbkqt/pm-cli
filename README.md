# PM CLI

**Project Management CLI for Humans & AI Agents**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Overview

PM CLI (`pm`) is a local-first project management tool that serves as a shared protocol between humans and AI agents. It implements the **GSD (Get Shit Done)** methodology with workflow-driven state transitions — milestones, phases, and plans flow through enforced lifecycles. No server, no cloud, no config.

## Key Features

- 🔄 **Workflow Engine** — GSD-inspired lifecycle management (milestones → phases → plans) with state machine transitions
- 🤖 **Human-AI Collaboration** — Agents and humans share the same toolset; every action is tagged with identity
- 📐 **27 Agent Workflow Templates** — Installable instruction files covering plan/execute/verify patterns with git rules
- 🕵️ **Agent System** — Register agents, identify who did what, track activity per agent
- 📝 **Context Sharing** — Set, get, search key-value context entries across collaborators
- 📊 **Web Dashboard** — Local browser-based project view with plan board, stats, and activity feed
- 🔌 **Multi-Client Install** — One command to install agent guides for Antigravity, Claude Code, Cursor, Codex, OpenCode, and Gemini CLI
- 🔒 **Local-first** — Everything stays on your machine, zero config, instant startup

## Built on GSD Methodology

PM CLI implements the **Get Shit Done (GSD)** workflow engine:

**SPEC → PLAN → EXECUTE → VERIFY → COMMIT**

```
Milestone (planned → active → completed → archived)
  └─ Phase (not_started → planning → in_progress → completed)
       └─ Plan (pending → in_progress → completed)
```

- **Milestones** — top-level goals with status tracking
- **Phases** — ordered chunks of work within a milestone (3-5 per milestone)
- **Plans** — atomic execution units with wave-based parallel ordering
- **State Machine** — enforced status transitions prevent invalid workflows
- **Git Integration** — commit per plan, commit per phase, commit per milestone
- **Agent Templates** — 27 workflow instruction files teach AI agents the full lifecycle

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/cli-prj-mgmt.git
cd cli-prj-mgmt

# Install dependencies
npm install
cd dashboard && npm install && cd ..

# Build CLI + dashboard
npm run build

# Install the `pm` command globally
npm run install:local

# Create your first project
pm init my-project
```

## Usage Examples

### Initialize & set identity

```bash
pm init my-project
pm agent register claude --role developer --type ai
export PM_AGENT=claude
```

### Create a milestone with phases

```bash
pm milestone create v1-mvp "MVP Release" --goal "Ship core features"
pm milestone update v1-mvp --status active

pm phase add "Foundation" --number 1 --description "Project setup and schema"
pm phase add "Core API" --number 2 --description "Build REST endpoints"
pm phase add "Frontend" --number 3 --description "React UI"
```

### Create and execute plans

```bash
# Create plans for a phase
pm plan create "Setup database" --phase 1 --number 1 --wave 1
pm plan create "Create models" --phase 1 --number 2 --wave 1

# Execute plans
pm plan update 1 --status in_progress
# ... do the work ...
git add -A && git commit -m "feat(phase-1): setup database"
pm plan update 1 --status completed

# Check progress
pm progress
```

### Share context

```bash
pm context set api-version "v2" --category decision
pm context get api-version
pm context search "api"
```

### View plan board

```bash
pm plan board --phase 1
```

### Launch the dashboard

```bash
pm dashboard
```

## Dashboard

The web dashboard provides a local browser-based view of your project:

- **Project Overview** — Stats cards showing plan counts by status and agent breakdown
- **Plan Board** — Kanban-style view of plans grouped by status
- **Agents Page** — Browse registered agents and their activity
- **Context Browser** — Search and inspect shared context entries
- **Theme Toggle** — Switch between dark and light mode

```bash
pm dashboard                 # Launch on default port
pm dashboard --port 4000     # Specify a port
```

## AI Client Integration

Install PM agent workflows into any supported AI coding client:

```bash
pm install --detect          # Detect which clients are present
pm install <client>          # Install for a specific client
pm install --all             # Install for all detected clients
```

| Client | Config Format |
|--------|---------------|
| Antigravity | `.agent/workflows/pm-guide.md` + `.agent/rules/pm-cli.md` + 27 workflow files + 4 skill files |
| Claude Code | `CLAUDE.md` (section markers with workflow index) |
| Cursor | `.cursor/rules/pm-guide.mdc` + 31 `.mdc` workflow/skill files |
| Codex | `AGENTS.md` (section markers with workflow index) |
| OpenCode | `AGENTS.md` + `opencode.json` |
| Gemini CLI | `GEMINI.md` (section markers with workflow index) |

### What Gets Installed

- **Agent Instructions** — Core PM CLI usage guide
- **27 Workflow Files** — Step-by-step guides for plan, execute, verify, debug, pause, resume, etc.
- **4 Skill Files** — Identity, context, collaboration, and error recovery guides
- **CLI Reference** — Complete command reference (Antigravity/Cursor only)

## CLI Reference

### Project

| Command | Description |
|---------|-------------|
| `pm init [name]` | Initialize a new project |
| `pm status` | Show project overview and stats |

### Milestones

| Command | Description |
|---------|-------------|
| `pm milestone create <id> <name>` | Create a new milestone |
| `pm milestone list` | List all milestones |
| `pm milestone show <id>` | Show milestone details |
| `pm milestone update <id>` | Update milestone fields or transition status |

### Phases

| Command | Description |
|---------|-------------|
| `pm phase add <name>` | Add a phase to the active milestone |
| `pm phase list` | List phases for the active milestone |
| `pm phase show <id>` | Show phase details |
| `pm phase update <id>` | Update phase fields or transition status |

### Plans

| Command | Description |
|---------|-------------|
| `pm plan create <name>` | Create a plan within a phase |
| `pm plan list` | List plans (filter by `--phase`, `--status`) |
| `pm plan show <id>` | Show plan details |
| `pm plan update <id>` | Update plan fields or transition status |
| `pm plan board` | Show plans as a kanban board grouped by status |

### Progress

| Command | Description |
|---------|-------------|
| `pm progress` | Show active milestone progress dashboard |

### Agents

| Command | Description |
|---------|-------------|
| `pm agent register <name>` | Register a new agent |
| `pm agent list` | List all registered agents |
| `pm agent show <name>` | Show agent details |
| `pm agent whoami` | Show current agent identity |

### Context

| Command | Description |
|---------|-------------|
| `pm context set <key> <value>` | Set a context entry |
| `pm context get <key>` | Get a context entry |
| `pm context list` | List all context entries |
| `pm context search <query>` | Search context entries |

### Install

| Command | Description |
|---------|-------------|
| `pm install [client]` | Install agent config for a specific AI client |
| `pm install --all` | Install for all detected clients |
| `pm install --detect` | Detect AI clients present in the project |

### Dashboard

| Command | Description |
|---------|-------------|
| `pm dashboard` | Launch the web dashboard in your browser |

> **Note:** Commands that create or modify data require agent identity via `--agent <name>` or `PM_AGENT` env var. Read-only commands do not.

## Tech Stack

- **Runtime:** Node.js (≥18.0.0)
- **Language:** TypeScript (strict mode, ESM)
- **Database:** SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (WAL mode)
- **CLI Framework:** [Commander.js](https://github.com/tj/commander.js)
- **HTTP Server:** [Express](https://expressjs.com/)
- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) + TypeScript

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, code standards, and pull request guidelines.

For a deep dive into the codebase structure, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
