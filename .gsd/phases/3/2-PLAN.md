---
phase: 3
plan: 2
wave: 1
---

# Plan 3.2: Wire Routes & API Integration Tests

## Objective
Register the three new route modules in the Express app and add integration tests to verify every endpoint returns correct data. This completes Phase 3 by ensuring the API layer is wired and tested.

## Context
- .gsd/phases/3/1-PLAN.md (route files from Plan 3.1)
- src/server/app.ts (route registration — `app.use()`)
- src/server/routes/index.ts (barrel exports)
- tests/server.test.ts (existing test pattern)
- tests/api.test.ts (existing API test pattern)
- src/db/types.ts (Milestone, Phase, Plan interfaces)

## Tasks

<task type="auto">
  <name>Wire routes in app.ts and routes/index.ts</name>
  <files>src/server/app.ts, src/server/routes/index.ts</files>
  <action>
    1. In `src/server/routes/index.ts`, add exports:
       - `export { createMilestoneRoutes } from './milestones.js';`
       - `export { createPhaseRoutes } from './phases.js';`
       - `export { createPlanRoutes } from './plans.js';`
    2. In `src/server/app.ts`:
       - Update the import from `'./routes/index.js'` to include `createMilestoneRoutes`, `createPhaseRoutes`, `createPlanRoutes`
       - Add `app.use(createMilestoneRoutes(db));` after existing route registrations
       - Add `app.use(createPhaseRoutes(db));`
       - Add `app.use(createPlanRoutes(db));`
    - Do NOT remove existing imports or routes
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Routes registered, TypeScript compiles, `app.ts` imports all 6 route creators</done>
</task>

<task type="auto">
  <name>Add API integration tests</name>
  <files>tests/api-milestones.test.ts</files>
  <action>
    Create `tests/api-milestones.test.ts` using the pattern from `tests/server.test.ts`:
    - Use `vitest` (describe, it, expect, beforeEach, afterEach)
    - Create in-memory SQLite DB with schema from `src/db/schema.ts` (or run initDb)
    - Create Express app via `createApp(db)`
    - Start server on ephemeral port via `getAvailablePort()`

    Test cases:
    1. `GET /api/milestones` — returns empty array initially
    2. `GET /api/milestones` — returns milestones after inserting test data
    3. `GET /api/milestones?status=active` — filters by status
    4. `GET /api/milestones/active` — returns 404 when no active milestone
    5. `GET /api/milestones/active` — returns active milestone when exists
    6. `GET /api/milestones/:id` — returns 404 for non-existent ID
    7. `GET /api/milestones/:id` — returns milestone with phase count
    8. `GET /api/milestones/:milestoneId/phases` — returns phases for milestone
    9. `GET /api/phases/:id` — returns phase with plans
    10. `GET /api/phases/:phaseId/plans` — returns plans for phase
    11. `GET /api/plans/:id` — returns single plan
    12. `GET /api/plans/:id` — returns 404 for non-existent plan

    Seed data: Insert milestone, phases, plans directly via `db.prepare().run()` to avoid needing agent setup for core milestone/phase/plan functions.
  </action>
  <verify>npx vitest run tests/api-milestones.test.ts</verify>
  <done>All 12 test cases pass, `npx vitest run` shows green</done>
</task>

## Success Criteria
- [ ] Routes wired in `app.ts` — all 6 route creators registered
- [ ] `routes/index.ts` exports all route creators
- [ ] `npx tsc --noEmit` passes
- [ ] `npx vitest run tests/api-milestones.test.ts` — all tests pass
- [ ] `npx vitest run` — full test suite passes (no regressions)
