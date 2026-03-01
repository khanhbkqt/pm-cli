---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Fix Layout Sidebar & Routing

## Objective
Rename the stale "Tasks" navigation label and `/tasks` route to "Plans" / `/plans`. The sidebar still displays "Tasks" and the page title still says "Tasks Board" — these should reflect the current plan-based data model.

## Context
- dashboard/src/components/Layout.tsx — sidebar nav links, `pageTitles` map
- dashboard/src/App.tsx — route definitions
- dashboard/src/pages/TasksBoard.tsx — the page component (already uses Plan data, just has old filename)
- dashboard/src/pages/TasksBoard.css — associated styles

## Tasks

<task type="auto">
  <name>Rename TasksBoard to PlansBoard</name>
  <files>dashboard/src/pages/TasksBoard.tsx, dashboard/src/pages/TasksBoard.css</files>
  <action>
    1. Rename `dashboard/src/pages/TasksBoard.tsx` → `dashboard/src/pages/PlansBoard.tsx`
    2. Rename `dashboard/src/pages/TasksBoard.css` → `dashboard/src/pages/PlansBoard.css`
    3. In `PlansBoard.tsx`:
       - Rename the exported function `TasksBoard` → `PlansBoard`
       - Update CSS import: `./TasksBoard.css` → `./PlansBoard.css`
       - Update CSS class names: `tasks-board` → `plans-board`
    4. In `PlansBoard.css`:
       - Update all `.tasks-board` selectors to `.plans-board`
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json 2>&1 | head -20</verify>
  <done>TasksBoard renamed to PlansBoard in both tsx and css files</done>
</task>

<task type="auto">
  <name>Update Layout sidebar & App routes</name>
  <files>dashboard/src/components/Layout.tsx, dashboard/src/App.tsx</files>
  <action>
    1. In `Layout.tsx`:
       - Update `pageTitles` map: `'/tasks': 'Tasks Board'` → `'/plans': 'Plans Board'`
       - Change NavLink `to="/tasks"` → `to="/plans"`
       - Change sidebar label text "Tasks" → "Plans"

    2. In `App.tsx`:
       - Update import: `TasksBoard` → `PlansBoard` from `'./pages/PlansBoard'`
       - Update route: `path="/tasks"` → `path="/plans"`
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json 2>&1 | head -20</verify>
  <done>Sidebar shows "Plans", route is /plans, page title is "Plans Board"</done>
</task>

## Success Criteria
- [ ] Sidebar link reads "Plans" and navigates to `/plans`
- [ ] Page title displays "Plans Board" when on that route
- [ ] No TypeScript errors
- [ ] No references to "Tasks" remain in Layout or App routing
