---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Filtering, Polish & Interactions

## Objective
Add milestone status filtering, expand/collapse all controls, and visual polish to the Plans Board hierarchy tree.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- dashboard/src/pages/BoardPage.tsx
- dashboard/src/pages/BoardPage.css

## Tasks

<task type="auto">
  <name>Milestone Filter and Expand/Collapse Controls</name>
  <files>
    - dashboard/src/pages/BoardPage.tsx
  </files>
  <action>
    Add a filter toolbar to the BoardPage:
    1. Implement a select dropdown or pill buttons to filter Milestones by status (All, Active, Planned, Completed, Archived). Default to All.
    2. Add "Expand All" and "Collapse All" button controls next to the filter.
    3. Implement state for the filter (`statusFilter`) and expand/collapse signal (`expandAllSignal`).
    4. Filter the parsed `milestones` array in `BoardPage` before rendering. 
    5. Pass the `expandAllSignal` (e.g., a counter or timestamp) prop down to `MilestoneRow` and `PhaseRow` components. Inside these components, use a `useEffect` on `expandAllSignal` to update their local `expanded` state accordingly based on the signal's value.
  </action>
  <verify>cd dashboard && npm run build</verify>
  <done>BoardPage has a working filter and expand/collapse all controls that correctly manage the milestone list and tree state.</done>
</task>

<task type="auto">
  <name>Visual Polish and Animations</name>
  <files>
    - dashboard/src/pages/BoardPage.css
  </files>
  <action>
    Enhance tree rows and overall UI:
    1. Add or improve hover states for `.tree-row` to look interactive and premium.
    2. Add smooth transitions/animations for tree expanding/collapsing. Ensure the CSS transitions for `max-height` and `opacity` are smooth.
    3. Add styles for the new filter toolbar and expand/collapse buttons.
    4. Verify responsive layout (e.g. ensure the new toolbar looks good on mobile).
  </action>
  <verify>cd dashboard && npm run build</verify>
  <done>BoardPage CSS contains all necessary styles for the new controls and polished hover/animation effects without breaking the build.</done>
</task>

## Success Criteria
- [ ] Milestone status filter works natively.
- [ ] Expand/Collapse all controls work for the entire tree.
- [ ] Tree expands/collapses smoothly with animations.
- [ ] Hover states and interactions look polished.
