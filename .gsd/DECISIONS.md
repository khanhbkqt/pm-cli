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

*Last updated: 2026-02-28*
