---
phase: 5-dashboard
plan: 1
wave: 1
---

# Plan 5.1: Theme Toggle & Responsive Design

## Objective
Add dark/light theme support with a toggle button in the sidebar, and make the dashboard fully responsive for mobile/tablet screens. Currently the dashboard is dark-only with no media queries.

## Context
- dashboard/src/index.css — CSS custom properties (the design system root)
- dashboard/src/components/Layout.tsx — sidebar + main layout
- dashboard/src/components/Layout.css — layout styling with `--sidebar-width`
- dashboard/src/components/StatsCards.css — stats grid
- dashboard/src/components/KanbanBoard.css — kanban columns
- dashboard/src/components/FilterBar.css — filter bar
- dashboard/src/components/TaskCard.css — task cards
- dashboard/src/components/TaskDetailPanel.css — detail panel
- dashboard/src/components/CreateTaskModal.css — create modal
- dashboard/src/components/ListView.css — list view
- dashboard/src/components/ActivityFeed.css — activity feed
- dashboard/src/components/AgentList.css — agent list

## Tasks

<task type="auto">
  <name>Implement theme system with CSS custom properties</name>
  <files>dashboard/src/index.css, dashboard/src/hooks/useTheme.ts (NEW)</files>
  <action>
    1. In `index.css`, duplicate the `:root` color variables into `[data-theme="dark"]` selector (current values).
    2. Add `[data-theme="light"]` selector with light-mode counterparts:
       - `--bg-primary: #f5f5f8`, `--bg-secondary: #ffffff`, `--bg-tertiary: #eef0f5`
       - `--text-primary: #1a1a2e`, `--text-secondary: #6b6b8a`
       - `--border-color: rgba(0, 0, 0, 0.08)`
       - Accent colors can remain the same or slightly adjust saturation for readability
    3. Create `hooks/useTheme.ts` custom hook:
       - Read initial theme from `localStorage.getItem('pm-dashboard-theme')` or default to `'dark'`
       - Set `document.documentElement.dataset.theme` on mount and on toggle
       - Return `{ theme, toggleTheme }` tuple
       - Persist choice to localStorage on change
    4. Do NOT change any component CSS files — they already use `var(--*)` tokens, so they will automatically adapt.
  </action>
  <verify>
    - `grep -c 'data-theme' dashboard/src/index.css` returns ≥ 2
    - `test -f dashboard/src/hooks/useTheme.ts`
  </verify>
  <done>
    - Light and dark CSS variable sets defined in index.css under `[data-theme]` selectors
    - useTheme hook created with localStorage persistence
  </done>
</task>

<task type="auto">
  <name>Add theme toggle button to Layout & responsive breakpoints</name>
  <files>dashboard/src/components/Layout.tsx, dashboard/src/components/Layout.css, dashboard/src/index.css</files>
  <action>
    1. In `Layout.tsx`:
       - Import and use `useTheme` hook
       - Add a theme toggle button in the sidebar footer (before version), using 🌙/☀ icons
       - Button should call `toggleTheme`
    2. In `Layout.css`, add responsive breakpoints:
       - `@media (max-width: 768px)`: hide sidebar by default, show hamburger, full-width main content
       - `@media (max-width: 480px)`: reduce padding, smaller font sizes
       - The sidebar overlay behavior already exists (hamburger + close button + overlay), so the CSS just needs to hide the sidebar at the breakpoint
    3. In `index.css`, add responsive utility for stats grid and kanban columns:
       - `@media (max-width: 768px)` for `.stats-grid` to 2 columns
       - `@media (max-width: 480px)` for `.stats-grid` to 1 column
    4. Add responsive rules to relevant component CSS files:
       - `KanbanBoard.css`: stack columns vertically on mobile
       - `FilterBar.css`: wrap filters on small screens
       - `TaskDetailPanel.css`: full-screen panel on mobile instead of side panel
       - `CreateTaskModal.css`: full-width modal on mobile
    5. Do NOT add breakpoints that conflict with existing hamburger/sidebar mobile behavior already in Layout.css
  </action>
  <verify>
    - `grep -c 'toggleTheme\|useTheme' dashboard/src/components/Layout.tsx` returns ≥ 2
    - `grep -c '@media' dashboard/src/components/Layout.css` returns ≥ 2
    - `npx tsc --noEmit -p dashboard/tsconfig.json` exits 0
  </verify>
  <done>
    - Theme toggle button visible in sidebar footer
    - Dashboard is responsive: sidebar collapses on ≤768px, content stacks on ≤480px
    - TypeScript compiles without errors
  </done>
</task>

## Success Criteria
- [ ] Light/dark theme toggle persists across page reloads
- [ ] All components inherit theme colors automatically via CSS custom properties
- [ ] Dashboard is usable on screens ≤768px wide (sidebar collapses, content stacks)
- [ ] TypeScript compiles without errors
