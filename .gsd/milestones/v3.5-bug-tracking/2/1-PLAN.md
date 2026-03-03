---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Core Bug Functions

## Objective
Create `src/core/bug.ts` with the core domain functions for bug CRUD operations, following the `plan.ts` pattern.

## Context
- src/core/plan.ts (reference pattern)
- src/db/schema.ts (bugs table)
- src/db/types.ts (Bug interface)
- src/core/content.ts (bug content helpers)

## Tasks

<task type="auto">
  <name>Implement bug domain functions</name>
  <files>src/core/bug.ts</files>
  <action>
    Create src/core/bug.ts with these exported functions:

    1. `reportBug(db, params)` — INSERT into bugs table, write template to `.pm/bugs/<id>.md`
       params: { title, description?, priority?, reported_by, milestone_id?, phase_id?, blocking?, projectRoot? }
       Generate UUID for id. Write comprehensive report to filesystem if projectRoot provided.

    2. `listBugs(db, filters?)` — SELECT with optional filters
       filters: { priority?, status?, blocking?, milestone_id? }
       Order by: CASE priority (critical=0, high=1, medium=2, low=3), then created_at DESC.

    3. `getBugById(db, id)` — SELECT single bug by ID, return Bug | undefined

    4. `getBugContent(db, bugId, projectRoot)` — Read filesystem content via readBugContent

    5. `updateBug(db, id, updates)` — UPDATE fields, set resolved_at when status changes to resolved/closed.
       Write updated content to filesystem if projectRoot provided.
       updates: { title?, description?, status?, priority?, assigned_to?, blocking?, milestone_id?, phase_id?, projectRoot? }

    6. `getBlockingBugs(db, milestoneId?, phaseId?)` — SELECT bugs WHERE blocking = 1 AND status IN ('open', 'investigating', 'fixing')
       Optional scope by milestone_id/phase_id.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>6 functions exported, TS compiles clean</done>
</task>

## Success Criteria
- [ ] `src/core/bug.ts` created with all 6 functions
- [ ] Functions follow `plan.ts` dual-storage pattern
- [ ] Priority sorting: critical > high > medium > low
- [ ] `npx tsc --noEmit` passes
