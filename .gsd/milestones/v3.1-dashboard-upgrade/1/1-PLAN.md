---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Fix StatusResponse Type & Remove Task Dead Code

## Objective
Align the frontend `StatusResponse` type with what the backend `/api/status` actually returns (`plans`/`recent_plans` instead of `tasks`/`recent_tasks`). Add a `Plan` interface to dashboard types and remove all stale Task-related types and functions from the API layer.

## Context
- dashboard/src/api/types.ts — `StatusResponse` still has `tasks`/`recent_tasks` fields
- dashboard/src/api/client.ts — `fetchTasks` and mutation functions hit `/api/tasks` (removed endpoint)
- dashboard/src/api/index.ts — barrel exports `Task`, `TaskComment`, `fetchTasks`
- src/db/types.ts — backend `Plan` interface (source of truth for shape)
- src/server/routes/status.ts — backend returns `{ plans, agents, context, recent_plans }`

## Tasks

<task type="auto">
  <name>Update dashboard/src/api/types.ts</name>
  <files>dashboard/src/api/types.ts</files>
  <action>
    1. Remove `Task`, `TaskComment`, `CreateTaskInput`, `UpdateTaskInput`, `AddCommentInput` interfaces
       - WHY: task entity removed in v3.0; these are dead code

    2. Add `Plan` interface matching backend `src/db/types.ts`:
       ```ts
       export interface Plan {
         id: number;
         phase_id: number;
         number: number;
         name: string;
         wave: number;
         status: 'pending' | 'in_progress' | 'completed' | 'failed';
         content: string | null;
         created_at: string;
         completed_at: string | null;
       }
       ```

    3. Update `StatusResponse` to match backend response:
       ```ts
       export interface StatusResponse {
         plans: {
           total: number;
           by_status: Record<string, number>;
         };
         agents: {
           total: number;
           by_type: Record<string, number>;
         };
         context: {
           total: number;
         };
         recent_plans: Plan[];
       }
       ```
       - Remove `by_priority` — plans don't have priority
       - Rename `tasks` → `plans`, `recent_tasks` → `recent_plans`
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json 2>&1 | head -20</verify>
  <done>types.ts has Plan interface, StatusResponse uses plans/recent_plans, all Task types removed</done>
</task>

<task type="auto">
  <name>Clean up dashboard/src/api/client.ts and index.ts</name>
  <files>dashboard/src/api/client.ts, dashboard/src/api/index.ts</files>
  <action>
    1. In `client.ts`:
       - Remove imports: `Task`, `TaskComment`, `CreateTaskInput`, `UpdateTaskInput`, `AddCommentInput`
       - Add import: `Plan`
       - Remove functions: `fetchTasks`, `createTask`, `updateTask`, `assignTask`, `fetchTaskComments`, `addTaskComment`
         - WHY: all hit `/api/tasks` which no longer exists
       - Keep: `fetchStatus`, `fetchAgents`, `fetchContext`, `fetchAgentById`, `searchContext`

    2. In `index.ts` — update barrel exports:
       ```ts
       export type { StatusResponse, Plan, Agent, ContextEntry } from './types';
       export { fetchStatus, fetchAgents, fetchContext } from './client';
       ```
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json 2>&1 | head -20</verify>
  <done>No Task references in client.ts or index.ts, Plan exported, TypeScript compiles (downstream errors expected — fixed in Plan 1.2)</done>
</task>

## Success Criteria
- [ ] `StatusResponse` matches backend `/api/status` response shape exactly
- [ ] `Plan` interface exists in dashboard types
- [ ] All `Task`-related dead code removed from api/ layer
