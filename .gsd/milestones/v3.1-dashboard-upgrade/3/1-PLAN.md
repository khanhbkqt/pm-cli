---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Milestones, Phases & Plans API Route Files

## Objective
Create three new API route files that expose milestone, phase, and plan data to the dashboard frontend. These reuse existing core module functions and follow the established Express Router pattern from `agents.ts`/`context.ts`.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md (Phase 3 — Milestones & Phases API Routes)
- src/server/routes/agents.ts (pattern reference)
- src/core/milestone.ts (listMilestones, getMilestoneById, getActiveMilestone)
- src/core/phase.ts (listPhases, getPhaseById)
- src/core/plan.ts (listPlans, getPlanById)
- src/db/types.ts (Milestone, Phase, Plan interfaces)

## Tasks

<task type="auto">
  <name>Create milestones API route</name>
  <files>src/server/routes/milestones.ts</files>
  <action>
    Create `src/server/routes/milestones.ts` following the `agents.ts` pattern:
    - Import `Router` from 'express', `Database` from 'better-sqlite3'
    - Import `listMilestones`, `getMilestoneById`, `getActiveMilestone` from `../../core/milestone.js`
    - Import `listPhases` from `../../core/phase.js` (for enriching milestone detail)
    - Export `createMilestoneRoutes(db): Router`
    - `GET /api/milestones` — list all milestones, support `?status=` query param filter
      - Returns `{ milestones: Milestone[] }`
    - `GET /api/milestones/active` — get active milestone with phase summary
      - Returns `{ milestone, phases_summary: { total, completed, in_progress, not_started } }`
      - 404 if no active milestone
    - `GET /api/milestones/:id` — get single milestone by ID, enriched with phase count
      - Returns `{ milestone, phases_total }`
      - 404 if not found
    - All endpoints wrapped in try/catch returning 400/500 on error
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>File exists, exports createMilestoneRoutes, TypeScript compiles cleanly</done>
</task>

<task type="auto">
  <name>Create phases API route</name>
  <files>src/server/routes/phases.ts</files>
  <action>
    Create `src/server/routes/phases.ts`:
    - Import `Router`, `Database`
    - Import `listPhases`, `getPhaseById` from `../../core/phase.js`
    - Import `listPlans` from `../../core/plan.js` (for enriching phases with plan counts)
    - Export `createPhaseRoutes(db): Router`
    - `GET /api/milestones/:milestoneId/phases` — list phases for a milestone
      - Support `?status=` query param filter
      - Enrich each phase with `plans_total` and `plans_done` counts
      - Returns `{ phases: EnrichedPhase[] }`
    - `GET /api/phases/:id` — get single phase by ID, enriched with plans
      - Returns `{ phase, plans }`
      - 404 if not found
    - All endpoints wrapped in try/catch
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>File exists, exports createPhaseRoutes, TypeScript compiles cleanly</done>
</task>

<task type="auto">
  <name>Create plans API route</name>
  <files>src/server/routes/plans.ts</files>
  <action>
    Create `src/server/routes/plans.ts`:
    - Import `Router`, `Database`
    - Import `listPlans`, `getPlanById` from `../../core/plan.js`
    - Export `createPlanRoutes(db): Router`
    - `GET /api/phases/:phaseId/plans` — list plans for a phase
      - Support `?status=` and `?wave=` query param filters
      - Returns `{ plans: Plan[] }`
    - `GET /api/plans/:id` — get single plan by ID
      - Returns `{ plan }`
      - 404 if not found
    - All endpoints wrapped in try/catch
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>File exists, exports createPlanRoutes, TypeScript compiles cleanly</done>
</task>

## Success Criteria
- [ ] Three new route files created in `src/server/routes/`
- [ ] All files follow the existing Router pattern (agents.ts/context.ts)
- [ ] `npx tsc --noEmit` passes with zero errors
