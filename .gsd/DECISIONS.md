# DECISIONS.md — Architecture Decision Records

> **Purpose**: Log significant technical decisions and their rationale.

## Decisions

## [DECISION-001] CLI-only, No Server

**Date**: 2026-02-28
**Status**: Accepted

### Context
Cần chọn architecture: CLI-only vs Server + REST API vs Embedded server.

### Decision
CLI-only, không server. CLI là interface duy nhất.

### Rationale
Solo dev không cần server overhead. CLI là interface tự nhiên cho cả agents. Đơn giản hơn nhiều.

### Consequences
- Không có real-time sync giữa clients
- Agents buộc phải dùng CLI → consistent access
- Deployment đơn giản (npm install)

### Alternatives Considered
- Server + REST API: quá phức tạp cho solo dev
- Embedded server: thêm complexity không cần thiết

---

## [DECISION-002] SQLite Database

**Date**: 2026-02-28
**Status**: Accepted

### Context
Cần chọn persistence layer: file-based (YAML/MD) vs SQLite vs PostgreSQL.

### Decision
SQLite với WAL mode.

### Rationale
Structured queries, single file, agents buộc dùng CLI → consistent access. File-based thì agents có thể đọc trực tiếp → inconsistent.

### Consequences
- Cần SQLite driver (better-sqlite3)
- Single file backup/restore
- Không cần server process

### Alternatives Considered
- File-based (YAML/MD): agents bypass CLI, inconsistent state
- PostgreSQL: overkill cho local tool

---

## [DECISION-003] Node.js/TypeScript

**Date**: 2026-02-28
**Status**: Accepted

### Context
Chọn language/runtime cho CLI tool.

### Decision
Node.js với TypeScript.

### Rationale
Ecosystem phong phú cho CLI, dễ tích hợp AI tools, fast prototyping.

### Alternatives Considered
- Go: faster binary, but slower prototyping
- Rust: performance overkill for this use case
- Python: good ecosystem but slower CLI startup

---

## [DECISION-004] Data Integrity Only Validation

**Date**: 2026-02-28
**Status**: Accepted

### Context
CLI nên validate ở mức nào?

### Decision
Chỉ validate data integrity (task tồn tại, agent tồn tại, required fields). Không validate business logic (status transitions, permissions).

### Rationale
Công cụ nên đơn giản — chỉ đảm bảo data không hỏng. Logic thực thi do workflow quyết định. Tool ≠ Process.

### Alternatives Considered
- Zero validation: data corruption risk
- Full business logic: quá phức tạp, cứng nhắc

---

## [DECISION-005] Mandatory Agent Identity

**Date**: 2026-02-28
**Status**: Accepted

### Context
Agent identity có nên bắt buộc?

### Decision
Bắt buộc. CLI error nếu thiếu identity.

### Rationale
Mọi thao tác cần biết ai thực hiện. Core requirement cho collaboration tracking.

### Alternatives Considered
- Optional identity: mất trace, không biết ai làm gì

---

## Phase 1 Decisions

**Date:** 2026-02-28

### [DECISION-006] CLI Framework — Commander.js

**Status**: Accepted

**Decision:** Use Commander.js as the CLI framework.

**Rationale:** Most mature, simplest API, excellent docs, perfect for MVP. Alternatives (oclif, yargs, citty) are either too heavy or too young.

---

### [DECISION-007] Project Structure — Domain-Layered

**Status**: Accepted

**Decision:** Use domain-layered structure: `cli/`, `core/`, `db/`, `output/`.

**Rationale:** Small upfront cost vs flat structure, but pays off immediately as Phase 2–4 add commands. Keeps command parsing separated from domain logic.

---

### [DECISION-008] SQLite Driver — better-sqlite3 + Plain SQL

**Status**: Accepted

**Decision:** Use `better-sqlite3` with hand-written SQL. No ORM.

**Rationale:** Schema is small (4 tables) and fixed for MVP. ORM (drizzle) adds type safety but also complexity, dependencies, and migration tooling overhead that isn't justified.

---

### [DECISION-009] Build Pipeline — tsup + tsx

**Status**: Accepted

**Decision:** `tsup` for production builds, `tsx` for development.

**Rationale:** `tsup` (esbuild-based) is fast and bundles to a single file for npm distribution. `tsx` provides instant dev feedback with watch mode.

---

### [DECISION-010] CLI Name — Keep `pm`

**Status**: Accepted (provisional)

**Decision:** Keep `pm` as CLI name. Revisit before npm publish.

**Rationale:** Short and clean. Potential conflict with `pm2` is low-risk for local use. Can rename before publishing if needed.

---

### [DECISION-011] Testing — vitest

**Status**: Accepted

**Decision:** Use `vitest` with integration tests for `pm init`.

**Rationale:** Fast, ESM-native, great TypeScript support. Integration tests for `pm init` verify the critical bootstrapping flow (directory creation, DB schema, config file).

---

### [DECISION-012] Schema Scope — All Tables Upfront

**Status**: Accepted

**Decision:** `pm init` creates all 4 tables (agents, tasks, task_comments, context) immediately.

**Rationale:** Schema is already fully designed. No reason to defer table creation per phase — it simplifies the migration story and avoids "add table" steps in later phases.

---

*Last updated: 2026-02-28*
