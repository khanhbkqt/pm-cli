---
milestone: (none active)
version: 1.1.0
updated: 2026-02-28T21:20:00+07:00
---

# Roadmap

> **Current Milestone**: None — ready for next milestone
> **Last Completed**: v1.1-dashboard

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

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Agent Instruction Doc | 📋 Planned | 1 |
| 2 | Workflow Patterns | 📋 Planned | 2 |
| 3 | Onboarding & Error Handling | 📋 Planned | 1 |
| 4 | Template & Verification | 📋 Planned | 2 |

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
