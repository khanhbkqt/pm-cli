# PM CLI

**Project Management CLI for Humans & AI Agents**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Overview

PM CLI (`pm`) is a local-first project management tool that serves as a shared protocol between humans and AI agents. Every action — creating tasks, assigning work, sharing context — flows through the same CLI interface, keeping a single SQLite database as the source of truth. No server, no cloud, no config.

## Key Features

- 🤖 **Human-AI Collaboration** — Agents and humans share the same toolset; every action is tagged with identity
- 📋 **Task Management** — Full CRUD with status, priority, assignment, comments, and subtasks
- 🕵️ **Agent System** — Register agents, identify who did what, track activity per agent
- 📝 **Context Sharing** — Set, get, search key-value context entries across collaborators
- 📊 **Web Dashboard** — Local browser-based project view with Kanban board, stats, and activity feed
- 🔄 **Workflow Engine** — GSD-inspired lifecycle management (milestones → phases → plans) with state machine transitions
- 📐 **Agent Workflow Templates** — 15 installable instruction files for plan/execute/verify patterns
- 🔌 **Multi-Client Install** — One command to install agent guides for Antigravity, Claude Code, Cursor, Codex, OpenCode, and Gemini CLI
- 🔒 **Local-first** — Everything stays on your machine, zero config, instant startup

## Built on GSD Methodology

PM CLI implements the **Get Shit Done (GSD)** workflow engine — a structured lifecycle for managing projects from specification to delivery:

**SPEC → PLAN → EXECUTE → VERIFY → COMMIT**

- **Milestones** — top-level goals with tracking and completion
- **Phases** — ordered chunks of work within a milestone
- **Plans** — atomic execution units with verification criteria
- **State Machine** — enforced status transitions prevent invalid workflows
- **Agent Templates** — 15 workflow instruction files teach AI agents the full lifecycle

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

### Initialize a project

```bash
pm init my-project
```

### Register an agent

```bash
pm agent register --name "claude" --role "developer"
```

### Add a task

```bash
pm task add "Build login page" --priority high --agent claude
```

### List tasks

```bash
# Human-readable output
pm task list --agent claude

# JSON output (for AI agents)
pm task list --agent claude --json
```

### Update a task

```bash
pm task update 1 --status in-progress --agent claude
```

### Assign a task

```bash
pm task assign 1 --to claude --agent claude
```

### Add a comment

```bash
pm task comment 1 "Started working on the login form" --agent claude
```

### View project status

```bash
pm status --agent claude
```

### Share context

```bash
# Set a context entry
pm context set api-url "http://localhost:3000" --agent claude

# Retrieve a context entry
pm context get api-url --agent claude

# Search context entries
pm context search "api" --agent claude
```

### Launch the dashboard

```bash
pm dashboard --agent claude
```

## Dashboard

The web dashboard provides a local browser-based view of your project:

- **Project Overview** — Stats cards showing task counts by status, agent breakdown, and recent activity feed
- **Kanban Board** — Drag-and-drop task cards across status columns (todo, in-progress, done, blocked)
- **List View** — Alternative table view with sorting and filtering
- **Agents Page** — Browse registered agents, view assigned tasks and activity
- **Context Browser** — Search and inspect shared context entries
- **Task Detail** — Full task editing, assignment, and commenting from the UI
- **Theme Toggle** — Switch between dark and light mode (persists across sessions)
- **Responsive** — Works on mobile and tablet screens

### Launch

```bash
pm dashboard --agent claude           # Launches on an available port
pm dashboard --port 4000 --agent claude  # Specify a port
```

### Development

```bash
cd dashboard && npm run dev           # Vite dev server with HMR (proxies API to localhost:4000)
pm dashboard --port 4000 --agent claude  # Start the backend API in another terminal
```

### Build

```bash
npm run build:dashboard               # Build dashboard only
npm run build                          # Build CLI + dashboard
```

## AI Client Integration

Install the PM agent workflow guide into any supported AI coding client:

```bash
# Detect which AI clients are present in the project
pm install --detect

# Install for a specific client
pm install <client>

# Install for all detected clients
pm install --all
```

| Client | Config Format |
|--------|---------------|
| Antigravity | `.agent/workflows/pm-guide.md` + `.agent/rules/pm-cli.md` |
| Claude Code | `CLAUDE.md` (section markers) |
| Cursor | `.cursor/rules/pm-guide.mdc` |
| Codex | `AGENTS.md` (section markers) |
| OpenCode | `AGENTS.md` + `opencode.json` |
| Gemini CLI | `GEMINI.md` (section markers) |

## CLI Reference

### Project

| Command | Description |
|---------|-------------|
| `pm init <name>` | Initialize a new project |
| `pm status` | Show project overview and stats |

### Tasks

| Command | Description |
|---------|-------------|
| `pm task add <title>` | Create a new task |
| `pm task list` | List all tasks (filterable by status, agent, priority) |
| `pm task show <id>` | Show task details |
| `pm task update <id>` | Update task fields (status, priority, title) |
| `pm task assign <id>` | Assign a task to an agent |
| `pm task comment <id>` | Add a comment to a task |

### Agents

| Command | Description |
|---------|-------------|
| `pm agent register` | Register a new agent |
| `pm agent list` | List all registered agents |
| `pm agent show <name>` | Show agent details and activity |
| `pm agent whoami` | Show current agent identity |

### Context

| Command | Description |
|---------|-------------|
| `pm context set <key> <value>` | Set a context entry |
| `pm context get <key>` | Get a context entry |
| `pm context list` | List all context entries |
| `pm context search <query>` | Search context entries |

### Milestones

| Command | Description |
|---------|-------------|
| `pm milestone create <id> <name>` | Create a new milestone |
| `pm milestone list` | List all milestones |
| `pm milestone show <id>` | Show milestone details and phase summary |
| `pm milestone update <id>` | Update milestone fields or transition status |
| `pm milestone complete <id>` | Mark a milestone as complete |

### Phases

| Command | Description |
|---------|-------------|
| `pm phase add <name>` | Add a phase to the active milestone |
| `pm phase list` | List phases for the active milestone |
| `pm phase show <id>` | Show phase details and associated plans |
| `pm phase update <id>` | Update phase fields or transition status |

### Plans

| Command | Description |
|---------|-------------|
| `pm plan create <name>` | Create an execution plan within a phase |
| `pm plan list` | List plans (filter by `--phase`, `--status`) |
| `pm plan show <id>` | Show plan details |
| `pm plan update <id>` | Update plan fields or transition status |

### Progress

| Command | Description |
|---------|-------------|
| `pm progress` | Show current milestone progress dashboard |

### Install

| Command | Description |
|---------|-------------|
| `pm install <client>` | Install agent config for a specific AI client |
| `pm install --all` | Install for all detected clients |
| `pm install --detect` | Detect AI clients present in the project |

### Dashboard

| Command | Description |
|---------|-------------|
| `pm dashboard` | Launch the web dashboard in your browser |

> **Note:** All commands require agent identity via `--agent <name>` flag or `PM_AGENT` environment variable.

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
