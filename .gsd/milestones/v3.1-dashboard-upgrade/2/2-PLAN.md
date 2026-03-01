---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Add Milestone/Phase Types & fetchProgress Client

## Objective
Add `Milestone`, `Phase`, and `ProgressResponse` types to the dashboard API layer, and create a `fetchProgress()` function that calls the existing backend `/api/progress` endpoint. This prepares the frontend data layer for the progress widget in Plan 2.3.

## Context
- src/db/types.ts — backend `Milestone` and `Phase` interfaces (source of truth)
- src/server/routes/progress.ts — backend `/api/progress` endpoint returns `{ milestone, phases, summary }`
- dashboard/src/api/types.ts — currently has `Plan`, `Agent`, `ContextEntry`, `StatusResponse`
- dashboard/src/api/client.ts — currently has `fetchStatus`, `fetchAgents`, `fetchContext`, etc.
- dashboard/src/api/index.ts — barrel exports

## Tasks

<task type="auto">
  <name>Add Milestone, Phase, ProgressResponse types</name>
  <files>dashboard/src/api/types.ts</files>
  <action>
    1. Add `Milestone` interface matching `src/db/types.ts`:
       ```ts
       export interface Milestone {
         id: string;
         name: string;
         goal: string | null;
         status: 'planned' | 'active' | 'completed' | 'archived';
         created_by: string;
         created_at: string;
         completed_at: string | null;
       }
       ```

    2. Add `Phase` interface matching `src/db/types.ts`:
       ```ts
       export interface Phase {
         id: number;
         milestone_id: string;
         number: number;
         name: string;
         description: string | null;
         status: 'not_started' | 'planning' | 'in_progress' | 'completed' | 'skipped';
         created_at: string;
         completed_at: string | null;
       }
       ```

    3. Add `EnrichedPhase` (phase + plan counts from progress endpoint):
       ```ts
       export interface EnrichedPhase extends Phase {
         plans_total: number;
         plans_done: number;
         plans_failed: number;
       }
       ```

    4. Add `ProgressResponse` matching backend `/api/progress` response:
       ```ts
       export interface ProgressResponse {
         milestone: Milestone;
         phases: EnrichedPhase[];
         summary: {
           phases_total: number;
           phases_complete: number;
           phases_pct: number;
         };
       }
       ```
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json 2>&1 | head -20</verify>
  <done>Milestone, Phase, EnrichedPhase, ProgressResponse types added to types.ts</done>
</task>

<task type="auto">
  <name>Add fetchProgress client function + barrel export</name>
  <files>dashboard/src/api/client.ts, dashboard/src/api/index.ts</files>
  <action>
    1. In `client.ts`:
       - Add import: `ProgressResponse`
       - Add function:
         ```ts
         /** Fetch active milestone progress. */
         export function fetchProgress(): Promise<ProgressResponse> {
           return apiFetch<ProgressResponse>('/api/progress');
         }
         ```

    2. In `index.ts`:
       - Add type exports: `Milestone`, `Phase`, `EnrichedPhase`, `ProgressResponse`
       - Add function export: `fetchProgress`
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json 2>&1 | head -20</verify>
  <done>fetchProgress function exists, all new types exported from barrel</done>
</task>

## Success Criteria
- [ ] `Milestone`, `Phase`, `EnrichedPhase`, `ProgressResponse` types exist in `types.ts`
- [ ] `fetchProgress()` function exists in `client.ts` calling `/api/progress`
- [ ] All new types and function exported from `api/index.ts`
- [ ] Full TypeScript compilation passes
