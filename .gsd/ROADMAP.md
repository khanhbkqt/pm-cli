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
**Status:** ⬜ Not Started
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
**Status:** ⬜ Not Started
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
| 6 | ⬜ | — | — |
| 7 | ⬜ | — | — |
