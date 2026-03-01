---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Milestones Page & Phases Page

## Objective
Create two new dashboard pages:
1. **MilestonesPage** — lists all milestones with status badges, goal text, and a "View Phases" action
2. **PhasesPage** — shows phases for a selected milestone, with plan count bars and status indicators

These form a drill-down flow: Milestones → Phases → (Plans, Plan 4.3).

## Context
- dashboard/src/pages/AgentsPage.tsx — reference pattern for page structure (toolbar, grid, cards)
- dashboard/src/pages/AgentsPage.css — reference for style patterns
- dashboard/src/hooks/useApi.ts — data fetching hook
- dashboard/src/api/client.ts — fetch functions from Plan 4.1
- dashboard/src/api/types.ts — types from Plan 4.1
- dashboard/src/components/ — reusable components (LoadingSpinner, ErrorMessage, EmptyState)
- dashboard/src/utils.ts — utility helpers (relativeTime, etc.)

## Tasks

<task type="auto">
  <name>Create MilestonesPage</name>
  <files>dashboard/src/pages/MilestonesPage.tsx, dashboard/src/pages/MilestonesPage.css</files>
  <action>
    1. Create `MilestonesPage.tsx`:
       - Use `useApi(fetchMilestones)` to load all milestones
       - Show loading skeleton (like AgentsPage pattern)
       - Show error state with retry
       - Display milestones as cards in a grid:
         - Milestone name as card title
         - Status badge (planned/active/completed/archived) with color coding
         - Goal text (truncated if long)
         - Created date (relative time)
         - "View Phases →" link that navigates to `/milestones/:id/phases`
       - Add status filter toolbar (All / Planned / Active / Completed / Archived)
       - Highlight the active milestone card with an accent border
    2. Create `MilestonesPage.css`:
       - Follow existing page CSS patterns (milestone-card, status badges, grid layout)
       - Use CSS variables from index.css for theming
       - Status badge colors: planned=secondary, active=blue, completed=green, archived=gray
  </action>
  <verify>npx tsc -p dashboard/tsconfig.json --noEmit</verify>
  <done>MilestonesPage renders milestone cards with status badges and navigation links</done>
</task>

<task type="auto">
  <name>Create PhasesPage</name>
  <files>dashboard/src/pages/PhasesPage.tsx, dashboard/src/pages/PhasesPage.css</files>
  <action>
    1. Create `PhasesPage.tsx`:
       - Read milestone ID from URL params (`useParams`)
       - Use `useApi(() => fetchMilestonePhases(milestoneId))` to load phases
       - Show milestone name in a breadcrumb: "Milestones / {milestone name}"
       - Display phases as cards in a numbered list/grid:
         - Phase number and name
         - Status badge (not_started/planning/in_progress/completed/skipped)
         - Plan progress: "X / Y plans done" with a mini progress bar
         - Description text (if available)
         - "View Plans →" link navigating to `/phases/:id/plans`
       - Add status filter (All / Not Started / In Progress / Completed)
    2. Create `PhasesPage.css`:
       - Phase cards with number indicator
       - Status badges with appropriate colors
       - Mini plan progress bar (reuse status-bar pattern from StatsCards)
  </action>
  <verify>npx tsc -p dashboard/tsconfig.json --noEmit</verify>
  <done>PhasesPage renders phase cards for a milestone with plan progress bars</done>
</task>

## Success Criteria
- [ ] MilestonesPage renders with milestone cards, status badges, filter toolbar
- [ ] PhasesPage renders with phase cards, plan progress, breadcrumb nav
- [ ] Both pages handle loading, error, and empty states
- [ ] Both pages compile without TypeScript errors
