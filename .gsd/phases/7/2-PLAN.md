---
phase: 7
plan: 2
wave: 2
---

# Plan 7.2: Hierarchy Board UI

## Objective
Redesign the Plans board so it groups plans by Milestone → Phase, giving a clear hierarchical overview.

## Context
- .gsd/ROADMAP.md
- dashboard/src/pages/BoardPage.tsx
- dashboard/src/pages/BoardPage.css
- dashboard/src/App.tsx
- dashboard/src/components/Layout.tsx

## Tasks

<task type="auto">
  <name>Create BoardPage Component</name>
  <files>
    - dashboard/src/pages/BoardPage.tsx
    - dashboard/src/pages/BoardPage.css
  </files>
  <action>
    - Create a new `BoardPage` component that uses `fetchBoard()` to render the project hierarchy.
    - The UI should have collapsible sections for each Milestone and Phase to keep the view clean.
    - Render `Plan` items under each phase.
    - Ensure status badges are displayed at each level (Milestone, Phase, Plan).
    - Add styles in `BoardPage.css` keeping with the existing dashboard aesthetic.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>BoardPage component is created, styled, and compiles without errors.</done>
</task>

<task type="auto">
  <name>Update Routing and Navigation</name>
  <files>
    - dashboard/src/App.tsx
    - dashboard/src/components/Layout.tsx
  </files>
  <action>
    - Update `App.tsx` routing: add `<Route path="/board" element={<BoardPage />} />`.
    - Note that `/plans` or `/tasks` routes might exist. We should point the navigation item to `/board`.
    - Update `Layout.tsx` navigation link from "Plans Board" (which currently points to `/tasks`) to point to `/board`.
  </action>
  <verify>npm run build --prefix dashboard</verify>
  <done>The dashboard builds successfully and navigation points to the new hierarchical board.</done>
</task>

## Success Criteria
- [ ] Dashboard Plans Board displays a nested Milestone → Phase → Plan structure.
- [ ] Milestone and Phase sections are collapsible.
- [ ] Status badges are clearly visible at all levels.
