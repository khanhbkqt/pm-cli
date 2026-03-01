---
phase: 7
plan: 1
wave: 1
---

# Plan 7.1: Read/API Backend for Board

## Objective
Create the `/api/board` endpoint to fetch the full hierarchy (Milestone → Phase → Plan) and update frontend types/client to consume it.

## Context
- .gsd/ROADMAP.md
- src/server/routes/board.ts
- src/server/routes/index.ts
- src/server/app.ts
- dashboard/src/api/types.ts
- dashboard/src/api/client.ts

## Tasks

<task type="auto">
  <name>Create Backend Board Route</name>
  <files>
    - src/server/routes/board.ts
    - src/server/routes/index.ts
    - src/server/app.ts
  </files>
  <action>
    - Create `src/server/routes/board.ts` with `createBoardRoutes(db)` exporting `GET /api/board`.
    - The endpoint should return a hierarchical structure: all milestones, each containing its phases, and each phase containing its plans.
    - Use `listMilestones(db)`, then for each loop and attach `phases: listPhases(db, m.id)`, and for each phase loop and attach `plans: listPlans(db, p.id)`. (Make sure you import `listPlans` from `../../core/plan.js`).
    - Export `createBoardRoutes` from `src/server/routes/index.ts`.
    - Register the route in `src/server/app.ts` using `app.use(createBoardRoutes(db))`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>The backend successfully compiles and the `/api/board` endpoint is registered.</done>
</task>

<task type="auto">
  <name>Update Frontend Types and Client</name>
  <files>
    - dashboard/src/api/types.ts
    - dashboard/src/api/client.ts
  </files>
  <action>
    - In `types.ts`, add `BoardMilestone`, `BoardPhase`, and `BoardData` interfaces to reflect the nested structure.
    - `BoardPhase` extends `Phase` and includes `plans: Plan[]`.
    - `BoardMilestone` extends `Milestone` and includes `phases: BoardPhase[]`.
    - `BoardData` is an array of `BoardMilestone` or `{ board: BoardMilestone[] }`.
    - In `client.ts`, add a `fetchBoard(): Promise<BoardMilestone[]>` function that calls `GET /api/board`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>The frontend successfully compiles with the new types and client function.</done>
</task>

## Success Criteria
- [ ] Backend route `/api/board` handles requests and returns the hierarchy.
- [ ] Frontend API client types match the backend response.
- [ ] TypeScript compiler passes with `npx tsc --noEmit` and tests pass.
