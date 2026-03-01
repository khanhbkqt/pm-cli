---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Fix StatsCards, ActivityFeed & Overview Components

## Objective
Update the dashboard components that consume `StatusResponse` to use the new `plans`/`recent_plans` shape instead of the removed `tasks`/`recent_tasks`. This fixes the dashboard crash reported in STATE.md.

## Context
- dashboard/src/api/types.ts — Plan 1.1 changed StatusResponse to use `plans`/`recent_plans`
- dashboard/src/components/StatsCards.tsx — references `status.tasks.total`, `status.tasks.by_status`
- dashboard/src/components/ActivityFeed.tsx — typed for `Task[]`, renders task.title/status/priority
- dashboard/src/pages/Overview.tsx — passes `status.recent_tasks` to ActivityFeed

## Tasks

<task type="auto">
  <name>Update StatsCards.tsx for plans</name>
  <files>dashboard/src/components/StatsCards.tsx</files>
  <action>
    1. Change all `status.tasks` references to `status.plans`:
       - `status.tasks.total` → `status.plans.total`
       - `status.tasks.by_status` → `status.plans.by_status`
       - `status.tasks.by_status.in_progress` → `status.plans.by_status.in_progress`

    2. Update labels to reflect plans:
       - "Total Tasks" → "Total Plans"

    3. Update `StatusBar` segments to match plan statuses:
       - Backend returns: `pending`, `in_progress`, `completed`, `failed`
       - Replace old segments: `done` → `completed`, `todo` → `pending`, `blocked` → `failed`

    4. Update CSS class `stat-card--tasks` → `stat-card--plans`
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json 2>&1 | head -20</verify>
  <done>StatsCards compiles without errors, references status.plans not status.tasks</done>
</task>

<task type="auto">
  <name>Update ActivityFeed.tsx and Overview.tsx for plans</name>
  <files>dashboard/src/components/ActivityFeed.tsx, dashboard/src/pages/Overview.tsx</files>
  <action>
    1. In `ActivityFeed.tsx`:
       - Change import from `Task` to `Plan`
       - Rename props: `tasks: Task[]` → `plans: Plan[]`
       - Rename param in component: `{ tasks }` → `{ plans }`
       - Update all `tasks.` references to `plans.`
       - Update item render: `task` → `plan`
       - Plans have no `priority` field — remove priority dot/badge rendering
       - Update STATUS_COLORS keys to match plan statuses:
         `pending` (grey), `in_progress` (blue), `completed` (green), `failed` (red)
       - Remove PRIORITY_COLORS (not applicable to plans)
       - Use `plan.name` instead of `task.title`
       - Use `plan.created_at` instead of `task.updated_at` (plans don't have updated_at)

    2. In `Overview.tsx`:
       - Change `status.recent_tasks` → `status.recent_plans`
       - Change prop name: `tasks={...}` → `plans={...}`
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json 2>&1 | head -20</verify>
  <done>ActivityFeed and Overview compile without errors, render plan data instead of task data</done>
</task>

## Success Criteria
- [ ] `StatsCards` renders plan stats (`status.plans.total`, `status.plans.by_status`)
- [ ] `ActivityFeed` accepts `Plan[]` and renders plan name/status
- [ ] `Overview` passes `status.recent_plans` to ActivityFeed
- [ ] Full dashboard TypeScript compilation passes: `npx tsc --noEmit --project dashboard/tsconfig.json`
- [ ] Existing backend tests still pass: `npx vitest run tests/api.test.ts`
