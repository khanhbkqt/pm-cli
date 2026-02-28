---
phase: 4-dashboard
plan: 2
wave: 2
---

# Plan 4.2: Kanban Board & Task Cards

## Objective
Build the main Kanban board view with status columns, task cards, filter bar, and list/kanban view toggle. This is the core visual component of the Tasks Board page.

## Context
- dashboard/src/pages/TasksBoard.tsx
- dashboard/src/pages/TasksBoard.css
- dashboard/src/api/client.ts (fetchTasks, fetchAgents)
- dashboard/src/api/types.ts (Task, Agent)
- dashboard/src/hooks/useApi.ts
- dashboard/src/index.css (design tokens)

## Tasks

<task type="auto">
  <name>Build KanbanBoard and TaskCard components</name>
  <files>
    dashboard/src/components/KanbanBoard.tsx
    dashboard/src/components/KanbanBoard.css
    dashboard/src/components/TaskCard.tsx
    dashboard/src/components/TaskCard.css
  </files>
  <action>
    1. Create `TaskCard.tsx`:
       - Props: `task: Task`, `onClick: (task: Task) => void`
       - Show: title, priority badge (color-coded), assigned agent, created date
       - Priority colors: urgent=red, high=orange, medium=blue, low=green (use CSS vars from index.css)
       - Add hover effect and subtle border-left color matching priority
       - Card styling: bg-secondary background, border-color borders, radius-sm corners

    2. Create `TaskCard.css`:
       - `.task-card` — card container with padding, hover transform scale, transition
       - `.task-card__priority` — small badge top-right
       - `.task-card__title` — truncate long titles (ellipsis)
       - `.task-card__meta` — assigned_to + date, text-secondary color

    3. Create `KanbanBoard.tsx`:
       - Props: `tasks: Task[]`, `onTaskClick: (task: Task) => void`
       - 4 columns: todo, in-progress, done, blocked
       - Column headers show status label + count
       - Tasks filtered into appropriate columns by status field
       - Empty column shows subtle placeholder text
       - Handle drag-and-drop for status changes using HTML5 drag API (native, no library):
         - `draggable` on TaskCard
         - `onDragStart` sets task ID in dataTransfer
         - `onDragOver` on column prevents default
         - `onDrop` on column calls `onStatusChange(taskId, newStatus)` prop
       - Add `onStatusChange: (taskId: number, newStatus: string) => void` prop

    4. Create `KanbanBoard.css`:
       - `.kanban` — horizontal flex layout with gap
       - `.kanban__column` — flex-1, min-width 250px, bg-tertiary background
       - `.kanban__header` — column title + count badge
       - `.kanban__cards` — vertical stack of cards with gap
       - `.kanban__column--dragover` — highlight border when dragging over
  </action>
  <verify>
    Run `cd dashboard && npx tsc --noEmit` — no type errors.
  </verify>
  <done>
    - TaskCard renders task info with priority coloring
    - KanbanBoard renders 4 status columns
    - Drag-and-drop moves cards between columns
    - All styling uses existing design tokens
  </done>
</task>

<task type="auto">
  <name>Build FilterBar and integrate TasksBoard page</name>
  <files>
    dashboard/src/components/FilterBar.tsx
    dashboard/src/components/FilterBar.css
    dashboard/src/components/ListView.tsx
    dashboard/src/components/ListView.css
    dashboard/src/pages/TasksBoard.tsx
    dashboard/src/pages/TasksBoard.css
  </files>
  <action>
    1. Create `FilterBar.tsx`:
       - Props: filters state + setters, view mode toggle
       - Status filter: dropdown/button group — All, Todo, In Progress, Done, Blocked
       - Priority filter: dropdown — All, Urgent, High, Medium, Low
       - Agent filter: dropdown populated from agents list (prop: `agents: Agent[]`)
       - View toggle: Kanban / List icons/buttons
       - Design: horizontal bar with pill-style filter buttons, glass-morphism bg

    2. Create `FilterBar.css`:
       - `.filter-bar` — flex row, items-center, gap, padding, bg with blur backdrop
       - `.filter-bar__group` — filter section with label
       - `.filter-bar__btn` — pill button, active state with accent color
       - `.filter-bar__toggle` — view mode toggle group

    3. Create `ListView.tsx`:
       - Props: `tasks: Task[]`, `onTaskClick: (task: Task) => void`
       - Table-style view with columns: ID, Title, Status, Priority, Assigned To, Updated
       - Status shown as colored badge
       - Sortable headers (click to toggle asc/desc) — start with updated_at desc
       - Row click calls onTaskClick

    4. Create `ListView.css`:
       - `.list-view` — full width table styling using design tokens
       - `.list-view__row` — hover highlight
       - `.list-view__badge` — status/priority badges

    5. Wire up `TasksBoard.tsx`:
       - Use `useApi` hook with `fetchTasks()` and `fetchAgents()`
       - Manage filter state: `{ status, priority, agent }` — client-side filtering
       - Manage view mode state: 'kanban' | 'list'
       - Pass filtered tasks to KanbanBoard or ListView based on view mode
       - Handle `onTaskClick` — set selectedTask state (for Plan 4.3)
       - Handle `onStatusChange` from KanbanBoard — call `updateTask` API, then refetch
       - Show loading skeleton and error states

    6. Create `TasksBoard.css`:
       - `.tasks-board` — page container
       - `.tasks-board__loading` — skeleton placeholders
       - `.tasks-board__error` — error message styling
       - `.tasks-board__empty` — empty state when no tasks
  </action>
  <verify>
    Run `cd dashboard && npx tsc --noEmit` — no type errors.
    Run `cd dashboard && npm run build` — builds successfully.
  </verify>
  <done>
    - Filter bar filters tasks by status, priority, agent
    - View toggle switches between Kanban and List views
    - Kanban drag-and-drop updates task status via API
    - Loading and error states handled
    - Build succeeds
  </done>
</task>

## Success Criteria
- [ ] Kanban board shows 4 columns with task cards
- [ ] Task cards show title, priority badge, assignee
- [ ] Drag-and-drop changes task status
- [ ] Filter bar filters by status, priority, agent
- [ ] List view alternative with sortable columns
- [ ] View toggle switches between Kanban/List
- [ ] `npm run build` succeeds
