---
phase: 4
level: 2
researched_at: 2026-02-28
---

# Phase 4 Research

## Questions Investigated
1. What patterns should context CRUD follow? Is the existing codebase structure sufficient?
2. How should `INSERT OR REPLACE` (upsert) work with the context table schema?
3. What is the `pm scaffold` command supposed to do, and is it in scope?
4. What needs to happen for npm publish readiness?
5. Are there any gaps between existing Phase 4 plans and the ROADMAP/SPEC?

## Findings

### 1. Context CRUD Patterns — Zero Ambiguity

The codebase has extremely consistent patterns. Context CRUD is a straight copy of `task.ts` patterns:

| Pattern | Source | Context Equivalent |
|---------|--------|--------------------|
| Agent validation | `requireAgent()` in task.ts | Reuse for `setContext` |
| CRUD returns | `SELECT * ... WHERE id = ?` after insert | Same pattern, return `ContextEntry` |
| List with filters | Dynamic WHERE clause in `listTasks` | `listContext` with category filter |
| Search | N/A (new) | SQL `LIKE '%query%'` on key + value |

**Key finding:** The `context` table already has `key TEXT UNIQUE NOT NULL`, so `INSERT OR REPLACE` works natively for upsert. No schema changes needed.

**Recommendation:** Follow `task.ts` exactly. Copy patterns verbatim.

---

### 2. Upsert Behavior with `INSERT OR REPLACE`

**Investigated:** SQLite `INSERT OR REPLACE` behavior with the context table.

**Finding:** When `key` already exists, `INSERT OR REPLACE` will:
- Delete the old row entirely (including its `id`, `created_at`)
- Insert a new row with a new autoincrement `id`

**Risk:** The `id` field changes on upsert, and `created_at` resets.

**Recommendation:** Use `INSERT ... ON CONFLICT(key) DO UPDATE SET` instead. This preserves the original `id` and `created_at`:

```sql
INSERT INTO context (key, value, category, created_by)
VALUES (?, ?, ?, ?)
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  category = excluded.category,
  created_by = excluded.created_by,
  updated_at = CURRENT_TIMESTAMP
```

This is the correct upsert behavior — Plan 4.1 says "INSERT OR REPLACE" but `ON CONFLICT ... DO UPDATE` is the right call.

---

### 3. Scaffold Command — Not in Plans

**Investigated:** ROADMAP lists `pm scaffold <template>` as a Phase 4 deliverable.

**Finding:** None of the 3 existing plans (4.1, 4.2, 4.3) include scaffold implementation. The SPEC mentions "Scaffold templates hoạt động" as a success criterion.

**Recommendation:** The scaffold command is **out of scope for the current plans**. This is a gap to flag. The 3 existing plans cover:
- 4.1: Context CRUD + formatters
- 4.2: Context CLI + registration  
- 4.3: Tests + status dashboard + npm polish

The scaffold command would need a separate plan (4.4) or be deferred to a later milestone. Given the MVP focus, it's reasonable to defer.

---

### 4. npm Publish Readiness

**Current state of `package.json`:**

| Field | Current | Needed |
|-------|---------|--------|
| version | `0.1.0` | `1.0.0` |
| bin | `"pm": "./dist/index.js"` | ✅ correct |
| files | missing | `["dist"]` |
| repository | missing | should add |
| engines | missing | `{ "node": ">=18" }` |
| name | `@pm-cli/pm` | consider rename before publish |

**DECISION-010** (Keep `pm`) notes: "Revisit before npm publish." The `pm` name conflicts with `pm2` — worth flagging.

**Recommendation:** Add `files`, `engines`, bump version. Leave `name` decision to user.

---

### 5. Identity Requirements — Read vs Write Split

**Investigated:** Should context `get`, `list`, `search` require agent identity?

**Finding:** Consistent with existing patterns:
- `task list`, `task show` — no identity required
- `task add`, `task update`, `task assign`, `task comment` — identity required
- `agent list`, `agent show`, `agent whoami` — no identity required

**Recommendation:** Plan 4.2 already correctly specifies: identity required only for `set` (write), not for `get`/`list`/`search` (read). ✅

---

### 6. Status Dashboard Queries

**Investigated:** What queries does `pm status` need?

**Finding:** Three simple COUNT queries:

```sql
SELECT COUNT(*) as count FROM agents;
SELECT status, COUNT(*) as count FROM tasks GROUP BY status;
SELECT COUNT(*) as count FROM context;
```

**Recommendation:** No complexity. Straightforward implementation in Plan 4.3.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Upsert SQL | `ON CONFLICT ... DO UPDATE` | Preserves id and created_at, unlike `INSERT OR REPLACE` |
| Scaffold command | Defer / separate plan | Not included in existing plans, MVP can ship without it |
| Read ops identity | Not required | Consistent with task/agent read commands |
| CLI name | Flag to user | DECISION-010 says revisit before publish |

## Patterns to Follow
- **`task.ts` CRUD pattern**: requireAgent → SQL → SELECT back the row → return typed
- **`formatter.ts` pattern**: json mode = `JSON.stringify(x, null, 2)`, human mode = multi-line or `formatTable`
- **`task.ts` CLI pattern**: `registerXCommands(program)` → `program.command('x')` → subcommands
- **Test pattern (core)**: tempDir + getDatabase + registerAgent in beforeEach, db.close + rmSync in afterEach
- **Test pattern (CLI)**: `run()` helper using `execSync` + `npx tsx`, `runExpectFail()` for error cases

## Anti-Patterns to Avoid
- **`INSERT OR REPLACE`**: Destroys row identity (id, created_at). Use `ON CONFLICT ... DO UPDATE` instead.
- **Schema changes**: Context table is already created by `pm init`. Do not modify schema.
- **Business logic validation**: Don't validate category transitions or key naming conventions. Data integrity only (DECISION-004).

## Dependencies Identified

| Package | Version | Purpose |
|---------|---------|---------|
| better-sqlite3 | ^12.6.2 | Already installed — SQLite driver |
| commander | ^14.0.3 | Already installed — CLI framework |
| vitest | ^4.0.18 | Already installed — test runner |

No new dependencies needed.

## Risks
- **Scaffold gap**: ROADMAP lists `pm scaffold` but no plan covers it. Mitigation: defer or add Plan 4.4.
- **CLI name conflict**: `pm` vs `pm2`. Mitigation: user decision before npm publish.
- **Upsert correctness**: Plan 4.1 says `INSERT OR REPLACE` which is lossy. Mitigation: use `ON CONFLICT ... DO UPDATE` instead.

## Ready for Planning
- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
