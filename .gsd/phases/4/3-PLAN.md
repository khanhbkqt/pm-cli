---
phase: 4
plan: 3
wave: 2
---

# Plan 4.3: Plans Page + Navigation & Routing

## Objective
1. Create the PlansPage — shows plans for a specific phase with kanban/list view
2. Update the sidebar navigation and routing to include the new pages
3. Rename/replace the old "Tasks" nav item with "Milestones" (the new entry point)

This plan depends on 4.1 (API types/functions) and 4.2 (Milestones/Phases pages).

## Context
- dashboard/src/pages/TasksBoard.tsx — existing kanban pattern to reuse/evolve
- dashboard/src/pages/TasksBoard.css — existing kanban styles
- dashboard/src/App.tsx — route definitions
- dashboard/src/components/Layout.tsx — sidebar nav, pageTitles
- dashboard/src/api/client.ts — fetchPhasePlans from Plan 4.1
- dashboard/src/pages/MilestonesPage.tsx — from Plan 4.2
- dashboard/src/pages/PhasesPage.tsx — from Plan 4.2

## Tasks

<task type="auto">
  <name>Create PlansPage for a specific phase</name>
  <files>dashboard/src/pages/PlansPage.tsx, dashboard/src/pages/PlansPage.css</files>
  <action>
    1. Create `PlansPage.tsx`:
       - Read phase ID from URL params (`useParams`)
       - Use `useApi(() => fetchPhasePlans(phaseId))` to load plans
       - Show breadcrumb: "Milestones / Phases / Plans"
       - Kanban view with 4 columns: Pending, In Progress, Completed, Failed
         - Reuse the column/card pattern from TasksBoard.tsx
       - Each plan card shows:
         - Plan name
         - Wave number badge
         - Status with color
         - Created date
       - Add status filter tabs and a wave filter dropdown
    2. Create `PlansPage.css`:
       - Evolve from TasksBoard.css patterns
       - Add wave badge styling
       - Improve card hover effects and transitions
  </action>
  <verify>npx tsc -p dashboard/tsconfig.json --noEmit</verify>
  <done>PlansPage renders kanban view of plans for a phase with filters</done>
</task>

<task type="auto">
  <name>Update App routing and Layout navigation</name>
  <files>dashboard/src/App.tsx, dashboard/src/components/Layout.tsx</files>
  <action>
    1. In `App.tsx`:
       - Import MilestonesPage, PhasesPage, PlansPage
       - Add routes:
         - `/milestones` → MilestonesPage
         - `/milestones/:milestoneId/phases` → PhasesPage
         - `/phases/:phaseId/plans` → PlansPage
       - Keep `/tasks` route as-is pointing to TasksBoard (don't break existing bookmarks)
    2. In `Layout.tsx`:
       - Replace "Tasks" nav link with "Milestones" pointing to `/milestones`
         - Icon: 🎯
       - Add `pageTitles` entries for new routes:
         - `/milestones` → "Milestones"
         - Phases and Plans pages will use dynamic titles from their breadcrumbs
    3. Do NOT remove TasksBoard — keep it accessible via direct URL for backward compat
  </action>
  <verify>npx tsc -p dashboard/tsconfig.json --noEmit</verify>
  <done>All 3 new pages accessible via sidebar nav and URL routing</done>
</task>

## Success Criteria
- [ ] PlansPage renders kanban view for a phase's plans
- [ ] Sidebar shows "Milestones" instead of "Tasks" 
- [ ] Routes work: /milestones → /milestones/:id/phases → /phases/:id/plans
- [ ] Old /tasks route still works
- [ ] Full TypeScript compilation passes
- [ ] `npx vitest run` passes (no regressions)
