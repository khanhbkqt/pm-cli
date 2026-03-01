---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: API Client — Milestone, Phase & Plan Fetch Functions

## Objective
Add frontend API types and fetch functions that consume the Phase 3 backend routes (`/api/milestones`, `/api/milestones/:id/phases`, `/api/phases/:phaseId/plans`, etc.). This is the data layer foundation the new pages depend on.

## Context
- dashboard/src/api/types.ts — existing types (Milestone is minimal, no Phase type)
- dashboard/src/api/client.ts — existing fetch helpers
- dashboard/src/api/index.ts — barrel exports
- src/db/types.ts — canonical DB types (Milestone, Phase, Plan)
- src/server/routes/milestones.ts — GET /api/milestones, /api/milestones/active, /api/milestones/:id
- src/server/routes/phases.ts — GET /api/milestones/:milestoneId/phases, /api/phases/:id
- src/server/routes/plans.ts — GET /api/phases/:phaseId/plans, /api/plans/:id

## Tasks

<task type="auto">
  <name>Add full Milestone + Phase types to dashboard API types</name>
  <files>dashboard/src/api/types.ts</files>
  <action>
    1. Expand `Milestone` interface to match backend `src/db/types.ts`:
       - Add `goal: string | null`, `status` union (`planned|active|completed|archived`), `created_by: string`, `created_at: string`, `completed_at: string | null`
    2. Add `Phase` interface mirroring `src/db/types.ts`:
       - `id: number`, `milestone_id: string`, `number: number`, `name: string`, `description: string | null`, `status` union, `created_at`, `completed_at`
    3. Add `PhaseWithPlanCounts` type (the enriched response the phases route returns):
       - Extends `Phase` with `plans_total: number`, `plans_done: number`
    4. Update `PhasesSummary` if needed (already exists, should be fine)
    5. Do NOT break existing `StatusResponse` — it still uses the simple `Milestone` shape. Create a `MilestoneDetail` type alias if needed.
  </action>
  <verify>npx tsc -p dashboard/tsconfig.json --noEmit</verify>
  <done>Dashboard compiles with new Milestone, Phase, PhaseWithPlanCounts types</done>
</task>

<task type="auto">
  <name>Add fetch functions for milestones, phases, plans</name>
  <files>dashboard/src/api/client.ts, dashboard/src/api/index.ts</files>
  <action>
    1. In `client.ts`, add:
       - `fetchMilestones()` → GET /api/milestones → returns `Milestone[]`
       - `fetchActiveMilestone()` → GET /api/milestones/active → returns `{ milestone, phases_summary }`
       - `fetchMilestonePhases(milestoneId: string)` → GET /api/milestones/:milestoneId/phases → returns `PhaseWithPlanCounts[]`
       - `fetchPhasePlans(phaseId: number)` → GET /api/phases/:phaseId/plans → returns `Plan[]`
    2. Follow existing `apiFetch` pattern from `fetchAgents()` / `fetchContext()`
    3. Update `index.ts` barrel exports with new functions and types
  </action>
  <verify>npx tsc -p dashboard/tsconfig.json --noEmit</verify>
  <done>All new fetch functions compile and are exported from barrel</done>
</task>

## Success Criteria
- [ ] `Milestone` type has all fields from backend DB type
- [ ] `Phase` and `PhaseWithPlanCounts` types exist
- [ ] 4 new fetch functions compile without errors
- [ ] Barrel exports updated
- [ ] Existing code (Overview, StatsCards, TasksBoard) still compiles
