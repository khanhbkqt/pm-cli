---
milestone: v3.0-workflow-engine
version: 3.0.0
updated: 2026-03-01T07:55:00+07:00
---

# Roadmap

> **Current Milestone**: v3.0-workflow-engine — Workflow Engine
> **Last Completed**: v2.1-multi-client

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

---

## Active Milestone: v3.0-workflow-engine — Workflow Engine

### Goal

Xây dựng workflow engine tương tự GSD methodology, tích hợp trực tiếp vào pm-cli — biến pm-cli từ tool quản lý task thành project lifecycle manager hoàn chỉnh. Workflow state machine (SPEC → PLAN → EXECUTE → VERIFY → COMMIT) được quản lý qua CLI commands với dữ liệu lưu trữ trong SQLite.

### Must-Haves

- [ ] Milestone management — `pm milestone create/list/show/complete`
- [ ] Phase management — `pm phase add/list/show/update` (thuộc milestone)
- [ ] Workflow state machine — lifecycle transitions, validation rules
- [ ] Plan management — `pm plan create/list/show` (execution plans)
- [ ] Progress tracking — `pm progress` hiển thị tiến độ milestone/phase
- [ ] State persistence — session state lưu DB, resume-friendly

### Nice-to-Haves

- [ ] Wave-based execution grouping
- [ ] Proof/evidence attachment cho verification
- [ ] Export markdown (tương thích GSD format)

### Phases

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | DB Schema & Models | ✅ Complete | 2 |
| 2 | Milestone & Phase CLI | ✅ Complete | 2 |
| 3 | Workflow State Machine | ✅ Complete | 2 |
| 4 | Plan & Execution CLI | ✅ Complete | 3 |
| 5 | Progress & Dashboard | ✅ Complete | 2 |
| 6 | Tests & Documentation | ⬜ Not Started | — |
| 7 | Agent Workflow Templates | ✅ Complete | 3 |
| 8 | Install System — Multi-file Workflows | ✅ Complete | 5 |

---

### Phase 7: Agent Workflow Templates
**Status**: ✅ Complete
**Objective**: Create GSD-style workflow instruction markdown files that teach agents how to use `pm` CLI for the full project lifecycle — plan, execute, verify, progress, milestone management and session.
**Depends on**: Phase 5 (Progress & Dashboard), Phase 6 (Tests & Documentation)

**Completed**:
- [x] 6 must-have core lifecycle workflows (pm-plan-phase, pm-execute-phase, pm-verify-work, pm-progress, pm-new-milestone, pm-complete-milestone)
- [x] 5 should-have supporting workflows (pm-discuss-phase, pm-audit-milestone, pm-pause, pm-resume, pm-add-phase)
- [x] 4 nice-to-have utility workflows (pm-new-project, pm-debug, pm-add-todo, pm-check-todos)
- [x] All 15 files cross-verified for consistency, accuracy, and client-agnostic format

**Verification**:
- All 15 workflow files exist in `docs/agent-guide/workflows/`
- Zero XML directives or client-specific content
- Consistent structure: YAML frontmatter, steps, cascading behavior, success criteria, next steps

---

### Phase 8: Install System — Multi-file Workflows
**Status**: ✅ Complete
**Objective**: Update `pm install` to deploy multiple workflow instruction files (from Phase 7) into target client directories instead of a single monolithic `pm-guide.md`. Support client-specific path conventions (Antigravity, Cursor, Gemini CLI).
**Depends on**: Phase 7 (Agent Workflow Templates)

**Completed**:
- [x] Template loader (`loadWorkflowTemplates`, `getWorkflowsDir`) and workflow-index utility (`buildWorkflowIndex`)
- [x] Antigravity adapter writes 15 individual workflow files to `.agent/workflows/`
- [x] Cursor adapter writes 15 `.mdc` workflow files to `.cursor/rules/`
- [x] Section-based adapters (Claude Code, Codex, OpenCode, Gemini CLI) embed workflow index table
- [x] Module exports updated in `src/core/install/index.ts`
- [x] 19 new integration tests — all passing

**Verification**:
- `npm run build` succeeds
- 44 install tests pass (25 existing + 19 new)
- Antigravity generates 17 files (pm-guide.md + pm-cli.md + 15 workflows)
- Cursor generates 16 files (pm-guide.mdc + 15 .mdc workflows)
- Claude Code's CLAUDE.md contains `## Available Workflows` with 15-row table
