---
phase: 1
plan: 2
wave: 2
---

# Plan 1.2: Jira-Style Tree Table Layout — BoardPage Skeleton

## Objective

Replace the current flat accordion-style `BoardPage` with the core structural skeleton of a Jira-style hierarchy tree table. This plan creates the layout container, header row, and correct indentation depth for Milestone → Phase → Plan rows. No progress bars or filter toolbar yet (those come in Phase 2/3).

## Context

- `dashboard/src/pages/BoardPage.tsx` — current flat accordion, to be rewritten
- `dashboard/src/pages/BoardPage.css` — current accordion styles, to be rewritten
- `dashboard/src/index.css` — design tokens added in Plan 1.1
- `dashboard/src/api/types.ts` — contains `BoardMilestone`, `BoardPhase`, `Plan` types (DO NOT change)
- `dashboard/src/api/client.ts` — contains `fetchBoard()` (DO NOT change)

## Tasks

<task type="auto">
  <name>Rewrite BoardPage.css with tree table layout styles</name>
  <files>dashboard/src/pages/BoardPage.css</files>
  <action>
    Replace the entire contents of `BoardPage.css` with a clean Jira-style tree table implementation:

    **Key design patterns to implement:**
    - `.board-tree` — full-width table-like container, no horizontal scroll
    - `.board-tree__header` — sticky column header row (Name | Status | Progress | Plans/Wave)
    - `.tree-row` — base row class: `display: flex; align-items: center; height: var(--tree-row-height); border-bottom: 1px solid var(--tree-line-color);`
    - `.tree-row--milestone` — milestone-level row with slightly stronger background, font-size 0.9rem, font-weight 700
    - `.tree-row--phase` — phase-level row indented by `var(--tree-indent)`, font-weight 600
    - `.tree-row--plan` — plan-level row indented by `calc(var(--tree-indent) * 2)`, font-weight 400, slightly muted
    - `.tree-row:hover` — `background: var(--hover)` hover highlight
    - `.tree-row__expand` — chevron toggle button (12×12px, no border, `color: var(--text-tertiary)`)
    - `.tree-row__icon` — emoji icon column (20px wide, centered)
    - `.tree-row__name` — flex:1, truncate with ellipsis
    - `.tree-row__id` — monospace identifier, `color: var(--text-secondary)`, `font-size: 0.72rem`
    - `.tree-row__status` — fixed width 110px, badge display
    - `.tree-row__meta` — right-side meta text (plan counts, wave number), `color: var(--text-secondary)`, `font-size: 0.75rem`
    - `.board-badge` — keep existing badge styles (planned/active/completed/failed/archived)
    - `.board-page__header` — page header with title and subtitle count
    - Smooth expand/collapse: add CSS transition `max-height` on the children container

    **Indentation visual guide:**
    ```
    ▼ 🎯 v3.3-board-redesign  Plans Board Redesign   [Active]   3 phases · 6 plans
      ▼  Phase 1  Design System & Hierarchy Layout    [⬜ Not Started]  2 plans
           #1  Plan 1.1: Extend Design System          [Pending]   Wave 1
           #2  Plan 1.2: Tree Table Layout             [Pending]   Wave 2
    ```

    **Avoid:**
    - Do NOT use CSS Grid for rows (flexbox only, to keep alignment simple)
    - Do NOT use `position: absolute` for indent lines
    - Do NOT add progress bars yet (Phase 2)
    - Keep file under 300 lines

    Preserve ALL existing `.status--*` badge classes as they are.
  </action>
  <verify>cd dashboard && npx tsc --noEmit</verify>
  <done>
    - `BoardPage.css` contains `.board-tree`, `.tree-row`, `.tree-row--milestone`, `.tree-row--phase`, `.tree-row--plan`
    - TypeScript compilation passes
    - No references to old class names that no longer exist (verify with: grep -n "board-milestone\|board-phase\|board-plan-card" dashboard/src/pages/BoardPage.tsx)
  </done>
</task>

<task type="auto">
  <name>Rewrite BoardPage.tsx with tree table component structure</name>
  <files>dashboard/src/pages/BoardPage.tsx</files>
  <action>
    Rewrite `BoardPage.tsx` to use the new tree table structure. Keep the same data-fetching logic (`useApi` + `fetchBoard`) but replace the rendering with:

    **Component structure:**
    ```
    BoardPage
    ├── board-page__header (h1 + subtitle count)
    └── board-tree
        ├── board-tree__header (column labels: Name, Status, Details)
        └── board-tree__body
            └── MilestoneRow (per milestone)
                └── PhaseRow (per phase, shown when milestone expanded)
                    └── PlanRow (per plan, shown when phase expanded)
    ```

    **MilestoneRow component:**
    - State: `expanded` (default true for active milestone, false for others)
    - Classes: `tree-row tree-row--milestone`
    - Shows: chevron toggle | 🎯 icon | milestone.id (mono) | milestone.name | badge | "N phases · M plans"
    - On click: toggle phase rows visibility

    **PhaseRow component:**
    - State: `expanded` (default true if phase is `in_progress`, false otherwise)
    - Classes: `tree-row tree-row--phase`
    - Shows: chevron toggle | phase number (mono, e.g. "P1") | phase.name | badge | "N plans"
    - On click: toggle plan rows visibility

    **PlanRow component:**
    - No state (leaf node, no children)
    - Classes: `tree-row tree-row--plan`
    - Wraps in `<Link to={'/plans/' + plan.id}>`
    - Shows: plan number (mono, e.g. "#1") | plan.name | badge | "Wave N"

    **Status badge mapping:** Keep the existing `MILESTONE_STATUS_CLASS`, `PHASE_STATUS_CLASS`, `PLAN_STATUS_CLASS` maps and `formatStatus()` helper.

    **Important constraints:**
    - Keep all TypeScript types — `BoardMilestone`, `BoardPhase`, `Plan` from `'../api/types'`
    - Keep `LoadingSpinner`, `ErrorMessage`, `EmptyState` usage for states
    - Default `expanded` for milestone: `milestone.status === 'active'`
    - Default `expanded` for phase: `phase.status === 'in_progress'`
    - No `any` types
    - File should be under 200 lines
  </action>
  <verify>cd dashboard && npx tsc --noEmit && echo "TypeScript OK"</verify>
  <done>
    - `BoardPage.tsx` compiles with zero TypeScript errors
    - `MilestoneRow`, `PhaseRow`, `PlanRow` components present
    - Each row uses correct class names matching `BoardPage.css` tree classes
    - `Link` used for plan rows with correct path
    - No accidental removal of data hooks or loading/error states
  </done>
</task>

## Success Criteria

- [ ] `cd dashboard && npx tsc --noEmit` exits 0
- [ ] `BoardPage.tsx` < 200 lines, `BoardPage.css` < 300 lines
- [ ] All three row types (milestone/phase/plan) have distinct indent and visual weight
- [ ] Expand/collapse works at milestone and phase level
- [ ] Status badges use consistent `.board-badge .status--*` classes
- [ ] Plans link to `/plans/:id` via React Router `<Link>`

<task type="checkpoint:human-verify">
  <name>Visual verification of tree layout</name>
  <action>
    Run the dev server and visually confirm the board renders correctly:
    ```bash
    cd dashboard && npm run dev
    ```
    Navigate to http://localhost:5173 → click "Board" in sidebar.
    Confirm:
    1. Milestones appear as top-level rows (bold, icon)
    2. Phases appear indented under expanded milestones
    3. Plans appear double-indented under expanded phases
    4. Badges show correct colors (active=blue, completed=green, planned=gray)
    5. Clicking chevron collapses/expands child rows
  </action>
  <verify>Visual inspection in browser at http://localhost:5173</verify>
  <done>Tree layout renders without layout breakage, indentation is visible, collapse/expand works</done>
</task>
