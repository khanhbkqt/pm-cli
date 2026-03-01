# Plan 3.2 Summary: Wire Routes & API Integration Tests

## Completed Tasks

1. **Wire routes in app.ts and routes/index.ts**
   - Added 3 exports to `routes/index.ts`
   - Registered `createMilestoneRoutes`, `createPhaseRoutes`, `createPlanRoutes` in `app.ts`

2. **Add API integration tests** — `tests/api-milestones.test.ts`
   - 15 test cases covering all milestone, phase, and plan endpoints
   - Tests: list, filter by status, filter by wave, active milestone, 404s, enriched responses

## Verification

- `npx vitest run tests/api-milestones.test.ts`: 15/15 PASS
- `npx vitest run`: 251/253 PASS (2 pre-existing timeout flakes in agent-cli.test.ts)
