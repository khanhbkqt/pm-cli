---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Dashboard API Routes

## Objective
Add bug CRUD API routes to the Express server and register them in the app.

## Context
- src/server/routes/plans.ts (reference route pattern)
- src/server/routes/index.ts (route exports)
- src/server/app.ts (route registration)
- src/core/bug.ts (domain functions)

## Tasks

<task type="auto">
  <name>Create bug API routes</name>
  <files>src/server/routes/bugs.ts, src/server/routes/index.ts, src/server/app.ts</files>
  <action>
    Create src/server/routes/bugs.ts exporting `createBugRoutes(db, projectRoot)`:

    1. GET /api/bugs — list bugs with query params: priority, status, blocking
       Returns JSON array of bugs.

    2. POST /api/bugs — report a bug from dashboard
       Body: { title, description?, priority?, reported_by, milestone_id?, phase_id?, blocking? }
       Returns created bug JSON.

    3. GET /api/bugs/:id — get bug detail + filesystem content
       Returns { ...bug, content: string | null }.

    4. PATCH /api/bugs/:id — update bug fields
       Body: { status?, priority?, assigned_to?, blocking?, description? }
       Returns updated bug JSON.

    In routes/index.ts: export createBugRoutes.
    In app.ts: import and register createBugRoutes(db, projectRoot).
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>4 API endpoints registered, TS compiles</done>
</task>

## Success Criteria
- [ ] Bug API routes created and registered
- [ ] GET/POST/PATCH endpoints follow existing route patterns
- [ ] `npx tsc --noEmit` passes
