---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Workflow Engine DB Schema

## Objective

Add 4 new tables to the SQLite schema for the workflow engine: `milestones`, `phases`, `plans`, and `workflow_state`. These tables enable milestone/phase/plan lifecycle management and session state persistence, building the data foundation for all subsequent v3.0 phases.

## Context

- .gsd/SPEC.md
- .gsd/ROADMAP.md (v3.0-workflow-engine must-haves)
- src/db/schema.ts (existing 4-table schema)
- src/db/connection.ts (createDatabase, initializeSchema, getDatabase)
- src/db/types.ts (existing TypeScript interfaces)
- src/db/index.ts (public API re-exports)

## Tasks

<task type="auto">
  <name>Add workflow tables to schema.ts</name>
  <files>src/db/schema.ts</files>
  <action>
    Append 4 new CREATE TABLE statements to the existing `SCHEMA_SQL` template literal:

    1. **milestones** table:
       - `id TEXT PRIMARY KEY` — slug identifier (e.g., "v3.0-workflow-engine")
       - `name TEXT NOT NULL` — display name
       - `goal TEXT` — milestone description/goal
       - `status TEXT NOT NULL DEFAULT 'planned'` — CHECK: planned, active, completed, archived
       - `created_by TEXT NOT NULL REFERENCES agents(id)`
       - `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
       - `completed_at DATETIME` — nullable, set when completed

    2. **phases** table:
       - `id INTEGER PRIMARY KEY AUTOINCREMENT`
       - `milestone_id TEXT NOT NULL REFERENCES milestones(id)`
       - `number INTEGER NOT NULL` — phase order within milestone
       - `name TEXT NOT NULL`
       - `description TEXT`
       - `status TEXT NOT NULL DEFAULT 'not_started'` — CHECK: not_started, planning, in_progress, completed, skipped
       - `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
       - `completed_at DATETIME`
       - UNIQUE(milestone_id, number)

    3. **plans** table:
       - `id INTEGER PRIMARY KEY AUTOINCREMENT`
       - `phase_id INTEGER NOT NULL REFERENCES phases(id)`
       - `number INTEGER NOT NULL` — plan order within phase
       - `name TEXT NOT NULL`
       - `wave INTEGER NOT NULL DEFAULT 1`
       - `status TEXT NOT NULL DEFAULT 'pending'` — CHECK: pending, in_progress, completed, failed
       - `content TEXT` — the plan content (markdown)
       - `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
       - `completed_at DATETIME`
       - UNIQUE(phase_id, number)

    4. **workflow_state** table:
       - `id INTEGER PRIMARY KEY AUTOINCREMENT`
       - `key TEXT UNIQUE NOT NULL` — e.g., "current_milestone", "current_phase", "session_notes"
       - `value TEXT NOT NULL`
       - `updated_by TEXT NOT NULL REFERENCES agents(id)`
       - `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`

    **Important:**
    - Keep existing tables untouched — only APPEND new tables
    - Use `CREATE TABLE IF NOT EXISTS` for idempotency
    - Foreign keys reference existing `agents(id)` where applicable
    - Status columns use CHECK constraints matching the enum values above
  </action>
  <verify>npx tsc --noEmit src/db/schema.ts</verify>
  <done>schema.ts contains 8 CREATE TABLE statements (4 original + 4 new), all with proper constraints and foreign keys</done>
</task>

<task type="auto">
  <name>Add TypeScript interfaces for new tables</name>
  <files>src/db/types.ts, src/db/index.ts</files>
  <action>
    1. In `src/db/types.ts`, add interfaces matching the new schema:
       - `Milestone` — matches milestones table columns
       - `Phase` — matches phases table columns
       - `Plan` — matches plans table columns
       - `WorkflowState` — matches workflow_state table columns

    2. In `src/db/index.ts`, add new type re-exports:
       - `export type { Milestone, Phase, Plan, WorkflowState } from './types.js';`

    **Important:**
    - Follow the exact same style as existing interfaces (string for dates, nullable fields use `| null`)
    - Status fields should use union literal types matching CHECK constraints
  </action>
  <verify>npx tsc --noEmit src/db/types.ts</verify>
  <done>types.ts contains 8 interfaces total, index.ts re-exports all 8 types, TypeScript compiles clean</done>
</task>

## Success Criteria

- [ ] `schema.ts` has 8 CREATE TABLE statements with proper constraints
- [ ] `types.ts` has 8 matching TypeScript interfaces
- [ ] `index.ts` re-exports all 8 types
- [ ] `npx tsc --noEmit` passes cleanly
- [ ] Existing tests still pass: `npx vitest run`
