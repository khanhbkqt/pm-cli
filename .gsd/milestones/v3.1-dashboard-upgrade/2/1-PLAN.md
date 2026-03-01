---
phase: 2
plan: 1
wave: 1
title: "Enhance Status API with Milestone/Phase Data"
---

# Plan 2.1 — Enhance Status API with Milestone/Phase Data

## Goal

Add active milestone and phase progress data to the `/api/status` response so the Overview page can display workflow context.

## Context

- Backend: `src/server/routes/status.ts` — current status endpoint (plans/agents/context only)
- Backend: `src/server/routes/progress.ts` — already has milestone/phase queries (reference pattern)
- Frontend types: `dashboard/src/api/types.ts` — StatusResponse needs milestone/phase fields
- Core functions: `src/core/milestone.ts` → `getActiveMilestone()`, `src/core/phase.ts` → `listPhases()`

## Tasks

<task id="2.1.1">
### Task 1: Add milestone/phase data to `/api/status` response

**File:** `src/server/routes/status.ts`

1. Import `getActiveMilestone` from `../../core/milestone.js`
2. Import `listPhases` from `../../core/phase.js`
3. In the GET handler, call `getActiveMilestone(db)` and `listPhases(db, milestone.id)`
4. Add to response JSON:
   - `milestone`: `{ id, name, status }` or `null` if none active
   - `phases`: `{ total, completed, in_progress, not_started }`

<verify>
```bash
npm run build 2>&1 | tail -5
npm test -- tests/server.test.ts 2>&1 | tail -10
```
</verify>
</task>

<task id="2.1.2">
### Task 2: Update frontend types

**File:** `dashboard/src/api/types.ts`

1. Add `Milestone` interface: `{ id: string; name: string; status: string }`
2. Add `PhasesSummary` interface: `{ total: number; completed: number; in_progress: number; not_started: number }`
3. Extend `StatusResponse` with:
   - `milestone: Milestone | null`
   - `phases: PhasesSummary`

<verify>
```bash
cd dashboard && npx tsc --noEmit 2>&1 | tail -10
```
</verify>
</task>

## Success Criteria

- [ ] `/api/status` returns milestone and phases summary alongside existing data
- [ ] Frontend types match new response shape
- [ ] Backend build passes
- [ ] Existing server tests still pass
