# Summary: Plan 7.3 — Refactor Phase & Plan IDs to Short UUIDs

## Tasks Completed

### Migrate DB Schema and Core Types
- `schema.ts`: `phases.id` and `plans.id` changed to `TEXT PRIMARY KEY`; `plans.phase_id` changed to `TEXT`
- `types.ts` (backend): `Phase.id` and `Plan.id`/`Plan.phase_id` changed to `string`
- `phase.ts`: uses `crypto.randomUUID()` before INSERT; all `id: number` params → `string`
- `plan.ts`: same pattern; `phase_id: number` → `string`
- `workflow.ts`: `transitionPhase(id: string)` and `transitionPlan(id: string)` updated

### Update Routes and Frontend API Types
- `routes/phases.ts`: removed `parseInt`, use raw string IDs
- `routes/plans.ts`: removed `parseInt`, use raw string IDs
- `routes/board.ts`: no changes needed (already used string IDs from phase)
- `dashboard/src/api/types.ts`: `Phase.id`/`Plan.id`/`Plan.phase_id` → `string`
- `dashboard/src/api/client.ts`: `fetchPhasePlans(phaseId: string)`, `fetchPlanById(id: string)`
- `PlansPage.tsx`, `PlanDetailPage.tsx`: removed `Number()` casts

### Update Tests
- `tests/phase.test.ts`: string IDs, updated error message format
- `tests/plan.test.ts`: `phaseId: string`, updated error messages
- `tests/workflow.test.ts`: `phaseId: string`/`planId: string`, updated error messages

## Verification
- `npx tsc --noEmit` — PASS
- `npm run build --prefix dashboard` — PASS
- `npx vitest run` — ALL 175+ tests GREEN
