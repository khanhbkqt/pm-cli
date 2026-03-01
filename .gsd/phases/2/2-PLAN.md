---
phase: 2
plan: 2
wave: 1
title: "Update StatsCards & Overview with Milestone/Phase UI"
---

# Plan 2.2 — Update StatsCards & Overview with Milestone/Phase UI

## Goal

Enhance the Overview page and StatsCards component to display milestone context and phase progress, making the dashboard truly reflect the workflow engine state.

## Context

- `dashboard/src/components/StatsCards.tsx` — currently shows Plans/InProgress/Agents/Context cards
- `dashboard/src/pages/Overview.tsx` — shows StatsCards + ActivityFeed + AgentList
- `dashboard/src/api/types.ts` — will have Milestone/PhasesSummary types from Plan 2.1

## Tasks

<task id="2.2.1">
### Task 1: Update StatsCards with milestone & phase cards

**File:** `dashboard/src/components/StatsCards.tsx`

1. Replace the 4-card grid with a 5-card grid:
   - **Milestone** (new) — name of active milestone + status badge
   - **Phases** (new) — total phases with completed/in_progress/not_started bar
   - **Plans** (existing) — total plans with status bar
   - **In Progress** (existing) — count of in-progress plans
   - **Agents** (existing) — total agents with human/AI breakdown
2. Remove the "Context Entries" card (low value for overview)
3. Add CSS for the milestone card with gradient accent

**Also update:** `dashboard/src/components/StatsCards.css` for 5-column responsive grid

<verify>
```bash
cd dashboard && npx tsc --noEmit 2>&1 | tail -10
```
</verify>
</task>

<task id="2.2.2">
### Task 2: Add MilestoneProgress component to Overview

**File:** `dashboard/src/pages/Overview.tsx`

1. Add a milestone progress banner below StatsCards showing:
   - Active milestone name + goal (if available)
   - Phase progress bar (completed / total)
   - Current phase indicator
2. Keep the existing ActivityFeed + AgentList panels below

**File:** `dashboard/src/pages/Overview.css` — add styles for the milestone progress section

<verify>
```bash
cd dashboard && npx tsc --noEmit 2>&1 | tail -10
```
</verify>
</task>

<task id="2.2.3">
### Task 3: Full build verification

Run full build and test verification.

<verify>
```bash
npm run build 2>&1 | tail -10
npm test 2>&1 | tail -15
```
</verify>
</task>

## Success Criteria

- [ ] StatsCards shows milestone name, phase progress, and plan stats
- [ ] Overview page shows milestone context with progress visualization
- [ ] Full project build passes (backend + dashboard)
- [ ] All existing tests pass
