---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Bug Schema & Migration

## Objective
Add the `bugs` table to the SQLite schema, create the `Bug` TypeScript interface, and implement the v2→v3 migration.

## Context
- src/db/schema.ts
- src/db/types.ts
- src/db/connection.ts
- src/db/index.ts

## Tasks

<task type="auto">
  <name>Add bugs table to schema</name>
  <files>src/db/schema.ts</files>
  <action>
    Bump SCHEMA_VERSION from 2 to 3.
    Add a `bugs` table to SCHEMA_SQL with columns:
    - id TEXT PRIMARY KEY
    - title TEXT NOT NULL
    - description TEXT
    - priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('critical','high','medium','low'))
    - status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','investigating','fixing','resolved','closed','wontfix','duplicate'))
    - reported_by TEXT NOT NULL REFERENCES agents(id)
    - assigned_to TEXT REFERENCES agents(id)
    - milestone_id TEXT REFERENCES milestones(id)
    - phase_id TEXT REFERENCES phases(id)
    - blocking INTEGER NOT NULL DEFAULT 0
    - created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    - updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    - resolved_at DATETIME
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>schema.ts contains bugs table, SCHEMA_VERSION is 3</done>
</task>

<task type="auto">
  <name>Add Bug type and migration</name>
  <files>src/db/types.ts, src/db/connection.ts, src/db/index.ts</files>
  <action>
    1. In types.ts, add Bug interface matching the schema columns.
    2. In connection.ts, add migration block for currentVersion === 2:
       - Simply run `db.exec(SCHEMA_SQL)` — IF NOT EXISTS is safe for new table.
       - Set currentVersion = 3.
    3. In index.ts, export the Bug type.
  </action>
  <verify>npx tsc --noEmit && npx vitest run tests/migration.test.ts</verify>
  <done>Bug type exported, migration v2→v3 exists, existing migration tests still pass</done>
</task>

## Success Criteria
- [ ] `bugs` table defined in SCHEMA_SQL
- [ ] SCHEMA_VERSION is 3
- [ ] `Bug` interface exported from `src/db/types.ts`
- [ ] v2→v3 migration in `connection.ts`
- [ ] `npx tsc --noEmit` passes
