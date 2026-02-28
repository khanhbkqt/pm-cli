---
milestone: v1.1-dashboard
version: 1.1.0
updated: 2026-02-28T19:20:00+07:00
---

# Roadmap

> **Current Milestone**: v1.1-dashboard
> **Goal**: Local browser-based dashboard for viewing projects, managing tasks, and monitoring agent activity

## Previous Milestones

<details>
<summary>✅ v1.0-mvp — CLI Foundation (Complete)</summary>

### Must-Haves (from SPEC)

- [x] Project scaffolding (`pm init`)
- [x] Task CRUD (add, list, show, update, assign, comment)
- [x] Agent management (register, list, show, whoami)
- [x] Context sharing (set, get, list, search)
- [x] Agent identity on every command
- [x] `--json` output support

### Phases

| Phase | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Project Foundation | ✅ | 2026-02-28 |
| 2 | Agent System | ✅ | 2026-02-28 |
| 3 | Task Management | ✅ | 2026-02-28 |
| 4 | Context & Polish | ✅ | 2026-02-28 |
| 5 | Installation Script | ✅ | 2026-02-28 |

</details>

---

## Must-Haves

- [ ] `pm dashboard` command to launch local webview
- [ ] Express HTTP server serving React frontend
- [ ] Projects overview page (stats, agents, recent activity)
- [ ] Tasks board UI (Kanban/list, filters, status columns)
- [ ] CRUD actions from UI (create, update, assign tasks)
- [ ] REST API layer reusing existing core logic

## Nice-to-Haves

- [ ] Agent activity timeline
- [ ] Dark/light theme toggle
- [ ] Task detail modal with comments
- [ ] Live reload / auto-refresh

---

## Phases

### Phase 1: Web Server Foundation
**Status:** ✅ Complete
**Objective:** Add Express HTTP server to `pm`, serve static files, create `pm dashboard` command to launch
**Depends on:** v1.0-mvp

**Deliverables:**
- Express server integrated into the CLI codebase
- `pm dashboard` command (opens browser, starts server on available port)
- Static file serving for React build output
- Graceful shutdown handling

---

### Phase 2: API Layer
**Status:** ✅ Complete
**Objective:** REST endpoints exposing projects, tasks, agents, context data from SQLite
**Depends on:** Phase 1

**Deliverables:**
- `GET/POST /api/tasks` — list & create tasks
- `GET/PUT /api/tasks/:id` — show & update task
- `POST /api/tasks/:id/assign` — assign agent
- `POST /api/tasks/:id/comment` — add comment
- `GET /api/agents` — list agents
- `GET /api/context` — list context entries
- `GET /api/status` — project overview stats
- Error handling & JSON responses

---

### Phase 3: Dashboard UI — Projects Overview
**Status:** ✅ Complete
**Objective:** React frontend with project overview page showing stats, agents, and recent activity
**Depends on:** Phase 2

**Deliverables:**
- React app scaffolding (Vite + React + TypeScript)
- Project overview dashboard page
- Stats cards (total tasks, by status, by agent)
- Agent list panel
- Recent activity feed
- Responsive layout with modern design

---

### Phase 4: Dashboard UI — Tasks Board
**Status:** ✅ Complete
**Objective:** Kanban/list board with full task management capabilities
**Depends on:** Phase 3

**Deliverables:**
- Kanban board view with status columns (todo, in-progress, done, blocked)
- List view alternative
- Task creation form
- Task detail panel (edit, assign, comment)
- Filters by status, agent, priority
- Drag-and-drop status updates (Kanban)

---

### Phase 5: Dashboard UI — Agents & Context Screens
**Status:** ✅ Complete
**Objective:** Add dedicated dashboard screens for viewing agents and context entries
**Depends on:** Phase 4

**Deliverables:**
- Agents page — list all registered agents with details (name, role, status)
- Agent detail view — show agent info, assigned tasks, activity
- Context page — list all shared context entries
- Context detail view — show full context value, metadata
- Search & filter capabilities for both screens
- Navigation updates (sidebar links to Agents & Context pages)

---

### Phase 6: Polish & Integration
**Status:** ✅ Complete
**Objective:** Theme support, responsive design, error handling, testing, and documentation
**Depends on:** Phase 5

**Deliverables:**
- Dark/light theme toggle
- Responsive design (mobile-friendly)
- Error handling & loading states
- E2E testing
- README documentation for dashboard feature
- Production build integration with `pm dashboard`

---

### Phase 7: Open-Source README & Guide
**Status:** ✅ Complete
**Objective:** Create a polished open-source README, contributor guide, and documentation for public release
**Depends on:** Phase 6

**Deliverables:**
- Professional README.md (badges, features, screenshots, install instructions)
- CONTRIBUTING.md (setup, code standards, PR workflow)
- LICENSE file selection and addition
- Architecture overview for contributors
- Usage examples and quick-start guide

**Verification:**
- README renders correctly on GitHub
- All links and badges resolve
- Installation steps work from scratch

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1 | ✅ | 3 | 3 |
| 2 | ✅ | 3 | 3 |
| 3 | ✅ | 3 | 3 |
| 4 | ✅ | 3 | 3 |
| 5 | ✅ | 3 | 3 |
| 6 | ✅ | 3 | 3 |
| 7 | ✅ | 3 | 3 |

---

## Upcoming Milestones

<details>
<summary>🔜 v2.0-agent-workflow — Agent Workflow Guide</summary>

### Goal

Create comprehensive workflow guides and instruction documents that teach AI coding agents how to use `pm` CLI effectively — command reference, usage patterns, best practices, and integration examples.

### Must-Haves

- [ ] Agent instruction document — full `pm` CLI reference with `--json` output schemas
- [ ] Workflow guide — step-by-step patterns (init → register → pick task → execute → comment → update status)
- [ ] Agent onboarding flow — how a new agent bootstraps itself with `pm`
- [ ] Error handling guide — common errors and how agents should recover
- [ ] Multi-agent collaboration patterns — coordination via context sharing and task assignment
- [ ] Template instructions file — canonical source that per-client adapters derive from

### Nice-to-Haves

- [ ] Example session transcripts (agent using `pm` end-to-end)
- [ ] Quick-reference cheat sheet for agents
- [ ] Context-aware prompts (suggest next `pm` command based on state)

### Phases

| Phase | Name | Objective |
|-------|------|-----------|
| 1 | Agent Instruction Doc | Full CLI reference with `--json` examples, output schemas, identity setup |
| 2 | Workflow Patterns | Step-by-step usage patterns: task lifecycle, context sharing, collaboration |
| 3 | Onboarding & Error Handling | Agent bootstrap flow, common error recovery, best practices |
| 4 | Template & Verification | Canonical template file, E2E test that an agent can follow the guide |

</details>

---

<details>
<summary>🔜 v2.1-multi-client — Multi-Client Installation</summary>

### Goal

Make the agent workflow guide installable on multiple AI coding clients, translating the canonical instructions into each client's native configuration format.

### Target Clients

| Client | Config Format | Location |
|--------|--------------|----------|
| **Antigravity** | `.agent/workflows/*.md` + `.gemini/` | MD + YAML frontmatter |
| **Claude Code** | `CLAUDE.md` (root) | Markdown with project rules |
| **Cursor** | `.cursor/rules/*.mdc` | MD with YAML frontmatter + globs |
| **Codex** | `AGENTS.md` (root) | Markdown with commands, style |
| **OpenCode** | `AGENTS.md` + `opencode.json` | MD + JSON config |

### Must-Haves

- [ ] Per-client adapter that generates native config from the canonical template
- [ ] `pm install <client>` CLI command to install config for a specific client
- [ ] `pm install --all` to install for all detected clients
- [ ] Client detection (identify which AI clients are present in a project)
- [ ] `/install` workflow updated with client selection
- [ ] Each generated config respects the client's rules (frontmatter, globs, file structure)

### Nice-to-Haves

- [ ] Auto-detect and suggest clients on `pm init`
- [ ] Config sync (update client configs when canonical template changes)
- [ ] Client-specific skill adapters
- [ ] Uninstall / cleanup per client

### Phases

| Phase | Name | Objective |
|-------|------|-----------|
| 1 | Architecture & Detection | Client detection logic, adapter interface design |
| 2 | Antigravity & Claude Code | Generate `.agent/` files and `CLAUDE.md` |
| 3 | Cursor & Codex | Generate `.cursor/rules/*.mdc` and `AGENTS.md` |
| 4 | OpenCode & CLI Command | Generate `opencode.json`, add `pm install <client>` command |
| 5 | Install Workflow & Testing | Update `/install` workflow, E2E tests, documentation |

</details>
