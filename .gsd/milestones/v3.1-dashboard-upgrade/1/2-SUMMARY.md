# Plan 1.2 Summary — Fix StatsCards, ActivityFeed & Overview Components

## What Was Done
- **`dashboard/src/components/StatsCards.tsx`**: Changed all `status.tasks` → `status.plans`. Updated label "Total Tasks" → "Total Plans". Fixed `StatusBar` segments from `done/todo/blocked` to `completed/pending/failed`. Updated CSS class `stat-card--tasks` → `stat-card--plans`.
- **`dashboard/src/components/ActivityFeed.tsx`**: Changed `tasks: Task[]` prop to `plans: Plan[]`. Updated STATUS_COLORS keys to plan statuses. Removed `PRIORITY_COLORS` (plans have no priority). Updated render to use `plan.name`/`plan.created_at` instead of `task.title`/`task.updated_at`. Removed priority dot badge.
- **`dashboard/src/pages/Overview.tsx`**: Changed `status.recent_tasks` → `status.recent_plans`, prop `tasks={...}` → `plans={...}`.
- **Additional cleanup**: Converted `TasksBoard.tsx` to a Plan-based kanban using `status.recent_plans`. Fixed `AgentDetailPanel.tsx` (removed `fetchTasks`/`Task` imports). Deleted 5 orphaned task-only components: `CreateTaskModal`, `KanbanBoard`, `ListView`, `TaskCard`, `TaskDetailPanel`.

## Verification
```
npx tsc --noEmit --project dashboard/tsconfig.json
# → 0 errors

npx vitest run tests/api.test.ts
# → 10/10 passed
```

## Status: ✅ COMPLETE
