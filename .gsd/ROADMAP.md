---
milestone: v3.1-dashboard-upgrade
version: 3.1.0
updated: 2026-03-01T14:55:00+07:00
---

# Roadmap

> **Current Milestone**: v3.1-dashboard-upgrade — Dashboard Upgrade
> **Last Completed**: v3.0-workflow-engine

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

<details>
<summary>✅ v1.1-dashboard — Local Dashboard (Complete)</summary>

### Must-Haves

- [x] `pm dashboard` command to launch local webview
- [x] Express HTTP server serving React frontend
- [x] Projects overview page (stats, agents, recent activity)
- [x] Tasks board UI (Kanban/list, filters, status columns)
- [x] CRUD actions from UI (create, update, assign tasks)
- [x] REST API layer reusing existing core logic

### Nice-to-Haves Delivered

- [x] Agent activity timeline
- [x] Dark/light theme toggle
- [x] Task detail panel with comments
- [x] Agents & Context screens
- [x] Open-source README, CONTRIBUTING.md, LICENSE

### Phases

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Web Server Foundation | ✅ | 3 |
| 2 | API Layer | ✅ | 3 |
| 3 | Dashboard UI — Projects Overview | ✅ | 3 |
| 4 | Dashboard UI — Tasks Board | ✅ | 3 |
| 5 | Dashboard UI — Agents & Context | ✅ | 3 |
| 6 | Polish & Integration | ✅ | 3 |
| 7 | Open-Source README & Guide | ✅ | 3 |

**Summary**: `.gsd/milestones/v1.1-dashboard/SUMMARY.md`

</details>

<details>
<summary>✅ v2.0-agent-workflow — Agent Workflow Guide (Complete)</summary>

### Goal

Create comprehensive workflow guides and instruction documents that teach AI coding agents how to use `pm` CLI effectively — command reference, usage patterns, best practices, and integration examples.

### Must-Haves

- [x] Agent instruction document — full `pm` CLI reference with `--json` output schemas
- [x] Workflow guide — step-by-step patterns (init → register → pick task → execute → comment → update status)
- [x] Agent onboarding flow — how a new agent bootstraps itself with `pm`
- [x] Error handling guide — common errors and how agents should recover
- [x] Multi-agent collaboration patterns — coordination via context sharing and task assignment
- [x] Template instructions file — canonical source that per-client adapters derive from

### Phases

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Agent Instruction Doc | ✅ Complete | 1 |
| 2 | Workflow Patterns | ✅ Complete | 2 |
| 3 | Onboarding & Error Handling | ✅ Complete | 1 |
| 4 | Template & Verification | ✅ Complete | 2 |

**Summary**: `.gsd/milestones/v2.0-agent-workflow/SUMMARY.md`

</details>

<details>
<summary>✅ v2.1-multi-client — Multi-Client Installation (Complete)</summary>

### Goal

Make the agent workflow guide installable on multiple AI coding clients, translating the canonical instructions into each client's native configuration format.

### Target Clients

| Client | Config Format | Location |
|--------|--------------|----------|
| **Antigravity** | `.agent/workflows/*.md` + `.agent/rules/*.md` | MD + YAML frontmatter |
| **Claude Code** | `CLAUDE.md` (root) | Markdown with project rules |
| **Cursor** | `.cursor/rules/*.mdc` | MD with YAML frontmatter + globs |
| **Codex** | `AGENTS.md` (root) | Markdown with commands, style |
| **OpenCode** | `AGENTS.md` + `opencode.json` | MD + JSON config |
| **Gemini CLI** | `GEMINI.md` (root) | Markdown context file |

### Must-Haves

- [x] Per-client adapter that generates native config from the canonical template
- [x] `pm install <client>` CLI command to install config for a specific client
- [x] `pm install --all` to install for all detected clients
- [x] Client detection (identify which AI clients are present in a project)
- [x] Each generated config respects the client's rules (frontmatter, globs, file structure)
- [x] Integration tests for all adapters

### Phases

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Architecture & Detection | ✅ Complete | 1 |
| 2 | Antigravity & Claude Code | ✅ Complete | 1 |
| 3 | Cursor & Codex | ✅ Complete | 1 |
| 4 | OpenCode & CLI Command | ✅ Complete | 1 |
| 5 | Gemini CLI & Antigravity Rules | ✅ Complete | 1 |
| 6 | Tests & Documentation | ✅ Complete | 1 |

**Summary**: `.gsd/milestones/v2.1-multi-client/SUMMARY.md`

</details>

<details>
<summary>✅ v3.0-workflow-engine — Workflow Engine (Complete)</summary>

### Goal

Xây dựng workflow engine tương tự GSD methodology, tích hợp trực tiếp vào pm-cli — biến pm-cli từ tool quản lý task thành project lifecycle manager hoàn chỉnh.

### Must-Haves

- [x] Milestone management — `pm milestone create/list/show/complete`
- [x] Phase management — `pm phase add/list/show/update` (thuộc milestone)
- [x] Workflow state machine — lifecycle transitions, validation rules
- [x] Plan management — `pm plan create/list/show` (execution plans)
- [x] Progress tracking — `pm progress` hiển thị tiến độ milestone/phase
- [x] State persistence — session state lưu DB, resume-friendly

### Phases

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | DB Schema & Models | ✅ Complete | 2 |
| 2 | Milestone & Phase CLI | ✅ Complete | 2 |
| 3 | Workflow State Machine | ✅ Complete | 2 |
| 4 | Plan & Execution CLI | ✅ Complete | 3 |
| 5 | Progress & Dashboard | ✅ Complete | 2 |
| 6 | Tests & Documentation | ✅ Complete | 3 |
| 7 | Agent Workflow Templates | ✅ Complete | 3 |
| 8 | Install System — Multi-file Workflows | ✅ Complete | 5 |
| 9 | Gap Closure | ✅ Complete | 2 |

</details>

---

## Active Milestone: v3.1-dashboard-upgrade — Dashboard Upgrade

### Goal

Fix dashboard loading bugs caused by stale task-based types/components (backend returns plans, frontend expects tasks), and add new pages to display milestones, phases, and plans in the dashboard UI.

### Must-Haves

- [x] Fix `/api/status` response mismatch — frontend `StatusResponse` type still expects `tasks`/`recent_tasks` but backend returns `plans`/`recent_plans`
- [x] Fix `StatsCards` — references `status.tasks.total` and `status.tasks.by_status` (crash)
- [x] Fix `Overview` page — passes `status.recent_tasks` to `ActivityFeed` (undefined)
- [x] Fix `ActivityFeed` — typed for `Task[]` but should accept `Plan[]`
- [x] Replace `TasksBoard` page — calls non-existent `/api/tasks` endpoint
- [ ] New Milestones page — list milestones with status and progress
- [ ] New Phases page — list phases for active milestone with plan counts
- [ ] New Plans page — kanban/list view of plans (replaces old TasksBoard)

### Nice-to-Haves

- [ ] Milestone detail view with phase progress visualization
- [ ] Phase detail view with plan list
- [ ] Plan detail panel (like old TaskDetailPanel)

### Phases

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Fix API Types & Status Endpoint | ✅ Complete | 2 |
| 2 | Fix Overview & StatsCards | ✅ Complete | 2 |
| 3 | Milestones & Phases API Routes | ✅ Complete | 2 |
| 4 | Dashboard Pages — Milestones, Phases, Plans | 📋 Planned | 3 |
| 5 | Tests & Polish | ⬜ Not Started | — |
