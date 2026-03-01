---
phase: 7
plan: 3
wave: 3
---

# Plan 7.3: Refactor Phase & Plan IDs to Short UUIDs

## Objective
Replace auto-increment integer IDs on `phases` and `plans` tables with short UUIDs (`TEXT`), consistent with how `milestones.id` and `agents.id` already work. This makes IDs URL-safe, human-readable, and avoids sequential ID leakage.

## Context
- src/db/schema.ts
- src/db/types.ts
- src/core/phase.ts
- src/core/plan.ts
- src/core/workflow.ts
- src/server/routes/phases.ts
- src/server/routes/plans.ts
- src/server/routes/board.ts
- dashboard/src/api/types.ts
- dashboard/src/api/client.ts
- tests/phase.test.ts
- tests/plan.test.ts
- tests/phase-cli.test.ts
- tests/plan-cli.test.ts
- tests/server.test.ts
- tests/api.test.ts

## Tasks

<task type="auto">
  <name>Migrate DB Schema and Core Types to TEXT IDs</name>
  <files>
    - src/db/schema.ts
    - src/db/types.ts
    - src/core/phase.ts
    - src/core/plan.ts
    - src/core/workflow.ts
  </files>
  <action>
    In `schema.ts`:
    - Change `phases.id` from `INTEGER PRIMARY KEY AUTOINCREMENT` to `id TEXT PRIMARY KEY`.
    - Change `plans.id` from `INTEGER PRIMARY KEY AUTOINCREMENT` to `id TEXT PRIMARY KEY`.
    - Change `plans.phase_id` from `INTEGER NOT NULL REFERENCES phases(id)` to `TEXT NOT NULL REFERENCES phases(id)`.

    In `types.ts`:
    - Change `Phase.id` from `number` to `string`.
    - Change `Plan.id` from `number` to `string`.
    - Change `Plan.phase_id` from `number` to `string`.

    In `phase.ts`:
    - Use `crypto.randomUUID()` to generate `id` before the INSERT statement.
    - Change all `id: number` parameter types to `id: string`.
    - Update all SQL queries that use `WHERE id = ?` to pass the string id.
    - Remove `lastInsertRowid` usage — instead SELECT by the generated UUID immediately after INSERT.

    In `plan.ts`:
    - Same pattern: generate `id` with `crypto.randomUUID()` before INSERT.
    - Change all `phase_id: number` to `phase_id: string`.
    - Update SQL queries and retrieval logic accordingly.

    In `workflow.ts`:
    - Fix any `plan.phase_id` references where it's typed as `number` — update to `string`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>All type errors are resolved. `phases.id` and `plans.id` are now TEXT in schema and types. `crypto.randomUUID()` generates the ID before INSERT on both core functions.</done>
</task>

<task type="auto">
  <name>Update Routes and Frontend API Types</name>
  <files>
    - src/server/routes/phases.ts
    - src/server/routes/plans.ts
    - src/server/routes/board.ts
    - dashboard/src/api/types.ts
    - dashboard/src/api/client.ts
  </files>
  <action>
    In `phases.ts`:
    - Remove `parseInt(req.params.id, 10)` — use `req.params.id` directly as a string.

    In `plans.ts`:
    - Same: remove `parseInt` calls, use raw string params.

    In `board.ts` (new file from Plan 7.1):
    - Ensure the board aggregation uses string IDs when calling `listPlans(db, phase.id)` — verify it compiles now that `phase.id` is `string`.

    In `dashboard/src/api/types.ts`:
    - Change `Phase.id` from `number` to `string`.
    - Change `Plan.id` from `number` to `string`.
    - Change `Plan.phase_id` from `number` to `string`.
    - Update `PhaseWithPlanCounts` and any related types accordingly.

    In `dashboard/src/api/client.ts`:
    - Update any typed fetch params that treated phase/plan IDs as numbers.
  </action>
  <verify>npx tsc --noEmit && npm run build --prefix dashboard</verify>
  <done>Backend and frontend both compile cleanly with string IDs throughout.</done>
</task>

<task type="auto">
  <name>Update Tests to Use String IDs</name>
  <files>
    - tests/phase.test.ts
    - tests/plan.test.ts
    - tests/phase-cli.test.ts
    - tests/plan-cli.test.ts
    - tests/server.test.ts
    - tests/api.test.ts
    - tests/api-milestones.test.ts
  </files>
  <action>
    - Replace any test assertions checking `id` as a number (e.g. `expect(phase.id).toBe(1)`) with a UUID string check (e.g. `expect(typeof phase.id).toBe('string')` and `expect(phase.id).toMatch(/^[0-9a-f-]{36}$/)`).
    - Replace numeric ID lookups like `getPhaseById(db, 1)` with the string ID returned from `createPhase(...)`.
    - In route tests (`server.test.ts`, `api.test.ts`), update any hardcoded `/api/phases/1` or `/api/plans/1` URLs to use the string IDs returned by the creation calls.
    - Avoid any `parseInt` in tests.
  </action>
  <verify>npx vitest run</verify>
  <done>All tests pass (full suite green).</done>
</task>

## Success Criteria
- [ ] `phases.id` and `plans.id` are `TEXT` in the schema (UUIDs).
- [ ] `crypto.randomUUID()` is used to generate both phase and plan IDs before INSERT.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] Frontend builds: `npm run build --prefix dashboard` succeeds.
- [ ] `npx vitest run` — all tests pass.
