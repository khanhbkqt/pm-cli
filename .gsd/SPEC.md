# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: No code may be written until this spec is marked `FINALIZED`.

## Vision

**PM CLI** (`pm`) — một command-line tool quản lý dự án local, đóng vai trò ngôn ngữ chung giữa Humans và AI Agents. Mọi thao tác (tạo task, assign, comment, chia sẻ context) đều qua CLI — không server, không API riêng. SQLite làm single source of truth.

## Goals

1. **CLI as Protocol** — CLI là interface duy nhất cho cả humans và AI agents. Mọi interaction đều qua commands.
2. **Human-AI Collaboration** — Agents và humans cùng dùng chung toolset, mỗi action đều gắn identity (ai làm gì).
3. **Local-first, Zero Config** — `pm init` tạo `.pm/` folder với SQLite DB, không cần server hay cloud. Chạy ngay.
4. **Data Integrity, Not Business Logic** — CLI validate data (task tồn tại, agent tồn tại), không enforce workflow rules. Workflow do người dùng/agent tự quyết.

## Non-Goals (Out of Scope)

- ❌ Không thay thế Git
- ❌ Không chạy/execute code (không phải CI/CD)
- ❌ Không Web UI
- ❌ Không quản lý secrets/API keys
- ❌ Không server/REST API
- ❌ Không auth/permissions (v2)
- ❌ Không task dependencies (v2)
- ❌ Không MCP protocol (v2)

## Constraints

- **Tech stack**: Node.js / TypeScript
- **Database**: SQLite (WAL mode)
- **Deploy**: Local only (optional Docker)
- **Scale**: Solo dev → thiết kế mở rộng được
- **Identity**: Agent identity bắt buộc trên mỗi command (`--agent` flag hoặc `PM_AGENT` env var)

## Success Criteria

- [ ] `pm init` tạo project với `.pm/data.db` + `config.yaml`
- [ ] Task CRUD hoạt động: add, list, show, update, assign, comment
- [ ] Agent registration và management: register, list, show, whoami
- [ ] Context sharing: set, get, list, search
- [ ] Output human-readable mặc định, `--json` cho agents
- [ ] Scaffold templates hoạt động
- [ ] Mọi command yêu cầu agent identity

## User Stories

### As a Human Developer
- I want to create and manage tasks via CLI
- So that I have a single source of truth for project state

### As an AI Agent
- I want to read tasks and context via `--json` output
- So that I can parse and act on project data programmatically

### As a Project Collaborator (Human or AI)
- I want every action tagged with agent identity
- So that I know who did what and can trace decisions

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| SQLite with WAL mode | Must-have | Concurrent read support |
| `--json` output flag | Must-have | AI agent parsing |
| `--agent` identity flag | Must-have | Required on every command |
| `PM_AGENT` env var | Must-have | Convenience for AI sessions |
| Subtask support (parent_id) | Must-have | Task hierarchy |
| Config as suggestion only | Must-have | CLI không enforce business logic |
| npm global install | Should-have | `npm i -g @pm/cli` |

---

*Last updated: 2026-02-28*
