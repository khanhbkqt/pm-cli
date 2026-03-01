---
phase: 2
plan: 3
wave: 2
---

# Plan 2.3: Add MilestoneProgress Widget to Overview

## Objective
Add a MilestoneProgress component to the Overview page that displays the active milestone name, overall completion percentage, and a list of phases with their status and plan progress. Uses the `fetchProgress()` function created in Plan 2.2.

## Context
- dashboard/src/api/ — `fetchProgress`, `ProgressResponse`, `EnrichedPhase` (from Plan 2.2)
- dashboard/src/pages/Overview.tsx — currently shows StatsCards + ActivityFeed + AgentList
- dashboard/src/hooks/useApi.ts — generic data‑fetch hook
- dashboard/src/pages/Overview.css — current Overview styles

## Tasks

<task type="auto">
  <name>Create MilestoneProgress component</name>
  <files>dashboard/src/components/MilestoneProgress.tsx, dashboard/src/components/MilestoneProgress.css</files>
  <action>
    1. Create `MilestoneProgress.tsx`:
       - Props: `{ progress: ProgressResponse }`
       - Render:
         a. Header: milestone name + status badge + overall completion %
         b. Progress bar showing `summary.phases_pct` visually
         c. Phase list — for each `EnrichedPhase`:
            - Phase number + name
            - Status chip (color-coded: not_started=grey, planning=yellow, in_progress=blue, completed=green, skipped=dimmed)
            - Mini progress: `plans_done / plans_total` plans completed
            - Failed count if > 0

    2. Create `MilestoneProgress.css`:
       - `.milestone-progress` container card
       - `.milestone-progress__header` — flexbox with name + badge
       - `.milestone-progress__bar` — full-width progress bar with percentage
       - `.milestone-progress__phases` — phase list
       - `.milestone-progress__phase` — individual phase row
       - `.phase-status` — status chips with semantic colors
       - Use CSS variables from `index.css` for consistency
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json 2>&1 | head -20</verify>
  <done>MilestoneProgress component renders milestone name, progress bar, and phase list</done>
</task>

<task type="auto">
  <name>Integrate MilestoneProgress into Overview page</name>
  <files>dashboard/src/pages/Overview.tsx, dashboard/src/pages/Overview.css</files>
  <action>
    1. In `Overview.tsx`:
       - Import `fetchProgress` from `'../api'`
       - Import `MilestoneProgress` component
       - Add `useApi(fetchProgress)` hook call
       - Render `MilestoneProgress` in the overview layout between `StatsCards` and the panels section
       - Handle loading/error/null progress gracefully (skip widget if no active milestone — 404 from endpoint)

    2. In `Overview.css`:
       - Adjust `.overview` layout to accommodate the new progress section
       - Ensure responsive spacing between StatsCards → MilestoneProgress → panels
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json 2>&1 | head -20</verify>
  <done>Overview page shows milestone progress widget below stats cards when active milestone exists</done>
</task>

## Success Criteria
- [ ] `MilestoneProgress` component renders milestone name, progress %, and phase list
- [ ] Phase status chips use semantic colors (green=completed, blue=in_progress, etc.)
- [ ] Plan progress shown as `N/M completed` per phase
- [ ] Overview page integrates the widget, gracefully handles no-active-milestone case
- [ ] Full TypeScript compilation passes
