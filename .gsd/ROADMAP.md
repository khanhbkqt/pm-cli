---
milestone: v1.0-mvp
version: 1.0.0
updated: 2026-02-28T18:12:00+07:00
---

# Roadmap

> **Current Phase:** 3 - Task Management
> **Status:** planned — ready for execution

## Must-Haves (from SPEC)

- [x] Project scaffolding (`pm init`)
- [ ] Task CRUD (add, list, show, update, assign, comment)
- [ ] Agent management (register, list, show, whoami)
- [ ] Context sharing (set, get, list, search)
- [ ] Agent identity on every command
- [ ] `--json` output support

---

## Phases

### Phase 1: Project Foundation
**Status:** ✅ Complete
**Objective:** Setup TypeScript project, SQLite schema, CLI framework, and `pm init` command
**Requirements:** Project scaffolding, database schema, CLI infrastructure

**Deliverables:**
- TypeScript project with build pipeline
- SQLite database schema (agents, tasks, task_comments, context tables)
- CLI framework (Commander.js)
- `pm init` command creating `.pm/` directory with `data.db` + `config.yaml`

---

### Phase 2: Agent System
**Status:** ✅ Complete
**Objective:** Agent registration, identity enforcement, and management commands
**Depends on:** Phase 1

**Deliverables:**
- `pm agent register <name> --role <role> --type <human|ai>`
- `pm agent list`
- `pm agent show <name>`
- `pm agent whoami`
- Identity enforcement (`--agent` flag / `PM_AGENT` env var)

---

### Phase 3: Task Management
**Status:** ⬜ Not Started
**Objective:** Full task CRUD with assignment, comments, and subtasks
**Depends on:** Phase 2

**Deliverables:**
- `pm task add "title"` — tạo task mới
- `pm task list` — filter by status, agent
- `pm task show <id>` — chi tiết task
- `pm task update <id> --status <status>` — cập nhật
- `pm task assign <id> --agent <name>` — gán agent
- `pm task comment <id> "note"` — thêm comment
- Subtask support via `parent_id`
- Output: human-readable default, `--json` flag

---

### Phase 4: Context & Polish
**Status:** ⬜ Not Started
**Objective:** Context sharing system, scaffold command, and final polish
**Depends on:** Phase 3

**Deliverables:**
- `pm context set <key> <value>` — lưu context
- `pm context get <key>` — đọc context
- `pm context list` — liệt kê
- `pm context search <query>` — tìm kiếm
- `pm scaffold <template>` — tạo structure
- `pm status` — project overview dashboard
- End-to-end testing
- npm package preparation

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1 | ✅ | 3/3 | 2026-02-28 |
| 2 | ✅ | 3/3 | 2026-02-28 |
| 3 | 📋 Planned | 3/3 | — |
| 4 | ⬜ | 0/0 | — |

---

## Timeline

| Phase | Started | Completed | Duration |
|-------|---------|-----------|----------|
| 1 | 2026-02-28 | 2026-02-28 | ~10 min |
| 2 | 2026-02-28 | 2026-02-28 | ~10 min |
| 3 | — | — | — |
| 4 | — | — | — |
