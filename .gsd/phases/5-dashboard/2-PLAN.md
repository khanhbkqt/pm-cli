---
phase: 5-dashboard
plan: 2
wave: 1
---

# Plan 5.2: Error Handling & Loading States

## Objective
Add a React error boundary, proper loading skeletons, inline error messages with retry, and empty-state illustrations so the dashboard handles all failure modes gracefully.

## Context
- dashboard/src/index.css — contains `.skeleton` animation already
- dashboard/src/App.tsx — top-level app component
- dashboard/src/pages/Overview.tsx — overview page
- dashboard/src/pages/TasksBoard.tsx — tasks page
- dashboard/src/components/StatsCards.tsx — stats grid
- dashboard/src/components/AgentList.tsx — agent list
- dashboard/src/components/ActivityFeed.tsx — activity feed
- dashboard/src/components/KanbanBoard.tsx — kanban board
- dashboard/src/api/client.ts — API fetch wrappers

## Tasks

<task type="auto">
  <name>Create ErrorBoundary and reusable state components</name>
  <files>
    dashboard/src/components/ErrorBoundary.tsx (NEW)
    dashboard/src/components/ErrorBoundary.css (NEW)
    dashboard/src/components/LoadingSpinner.tsx (NEW)
    dashboard/src/components/LoadingSpinner.css (NEW)
    dashboard/src/components/ErrorMessage.tsx (NEW)
    dashboard/src/components/ErrorMessage.css (NEW)
    dashboard/src/components/EmptyState.tsx (NEW)
    dashboard/src/components/EmptyState.css (NEW)
  </files>
  <action>
    1. Create `ErrorBoundary.tsx` — React class component:
       - Catches render errors, shows a friendly fallback UI with error message
       - "Reload" button that calls `window.location.reload()`
       - Styled consistently with the dark/light theme using CSS vars
    2. Create `LoadingSpinner.tsx` — reusable loading indicator:
       - Animated spinner using CSS (not a library)
       - Optional `message` prop for context (e.g. "Loading tasks...")
       - Centered layout for page-level use, inline for component-level
    3. Create `ErrorMessage.tsx` — inline error display:
       - Shows error message with a "Retry" button
       - Props: `message: string`, `onRetry: () => void`
       - Styled in accent-red with subtle background
    4. Create `EmptyState.tsx` — empty data display:
       - Shows icon + message + optional action button
       - Props: `icon: string`, `title: string`, `description?: string`, `action?: { label: string, onClick: () => void }`
    5. Use CSS custom properties from the design system for all components — do NOT hardcode colors
  </action>
  <verify>
    - `ls dashboard/src/components/ErrorBoundary.tsx dashboard/src/components/LoadingSpinner.tsx dashboard/src/components/ErrorMessage.tsx dashboard/src/components/EmptyState.tsx` — all exist
    - `npx tsc --noEmit -p dashboard/tsconfig.json` exits 0
  </verify>
  <done>
    - ErrorBoundary, LoadingSpinner, ErrorMessage, EmptyState components created
    - All use CSS custom properties for theme compatibility
    - TypeScript compiles
  </done>
</task>

<task type="auto">
  <name>Integrate state components into pages</name>
  <files>
    dashboard/src/App.tsx
    dashboard/src/pages/Overview.tsx
    dashboard/src/pages/TasksBoard.tsx
    dashboard/src/components/StatsCards.tsx
    dashboard/src/components/AgentList.tsx
    dashboard/src/components/ActivityFeed.tsx
  </files>
  <action>
    1. Wrap `<Routes>` in `App.tsx` with `<ErrorBoundary>`
    2. In `Overview.tsx`, add error and loading handling:
       - Show `<LoadingSpinner>` while data is loading
       - Show `<ErrorMessage>` with retry on API failure
       - Show `<EmptyState>` when no project data exists
    3. In `TasksBoard.tsx`, add error and loading handling:
       - Show `<LoadingSpinner>` while tasks/agents load
       - Show `<ErrorMessage>` with retry on fetch failure
       - Show `<EmptyState>` when no tasks exist (with "Create Task" action)
    4. In `StatsCards.tsx`, `AgentList.tsx`, `ActivityFeed.tsx`:
       - Add skeleton loading state using the existing `.skeleton` class
       - Handle empty arrays gracefully
    5. Review each component's existing error handling and ensure no raw error strings leak to the UI
  </action>
  <verify>
    - `grep -c 'ErrorBoundary' dashboard/src/App.tsx` returns ≥ 1
    - `grep -c 'LoadingSpinner\|ErrorMessage\|EmptyState' dashboard/src/pages/TasksBoard.tsx` returns ≥ 2
    - `npx tsc --noEmit -p dashboard/tsconfig.json` exits 0
  </verify>
  <done>
    - ErrorBoundary wraps the app at the top level
    - All pages show loading spinners during data fetch
    - All pages show error message + retry on API failure
    - Empty states shown when data arrays are empty
  </done>
</task>

## Success Criteria
- [ ] React error boundary catches and displays render errors gracefully
- [ ] Loading spinners shown during all API fetches
- [ ] API errors show inline error message with retry button
- [ ] Empty states shown with helpful messages when no data exists
- [ ] TypeScript compiles without errors
