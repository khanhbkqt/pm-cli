---
phase: 3-dashboard
plan: 2
wave: 2
---

# Plan 3.2: Dashboard Overview Page — Stats & Layout

## Objective
Build the main dashboard overview page with a responsive layout shell, stats cards showing task/agent/context counts, and a global CSS design system with modern dark theme.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md (Phase 3 deliverables)
- dashboard/src/api/client.ts (API client from Plan 3.1)
- dashboard/src/api/types.ts (StatusResponse type)
- src/server/routes/status.ts (GET /api/status response shape)

## Tasks

<task type="auto">
  <name>Design system and layout shell</name>
  <files>
    dashboard/src/index.css
    dashboard/src/App.tsx
    dashboard/src/App.css
    dashboard/src/components/Layout.tsx
    dashboard/src/components/Layout.css
    dashboard/src/hooks/useApi.ts
  </files>
  <action>
    1. Create `dashboard/src/index.css` — global reset and CSS custom properties:
       - Dark theme as default with CSS variables:
         - `--bg-primary: #0f0f23` (deep dark background)
         - `--bg-secondary: #1a1a2e` (cards/panels)
         - `--bg-tertiary: #16213e` (hover/active states)
         - `--text-primary: #e0e0ff` (main text)
         - `--text-secondary: #8888aa` (muted text)
         - `--accent-blue: #4fc3f7`
         - `--accent-green: #66bb6a`
         - `--accent-orange: #ffa726`
         - `--accent-red: #ef5350`
         - `--accent-purple: #ab47bc`
         - `--border-color: rgba(255, 255, 255, 0.08)`
         - `--radius: 12px`, `--radius-sm: 8px`
         - Font: Inter from Google Fonts (add to index.html `<link>`)
       - Box-sizing border-box reset
       - Smooth scrolling, antialiased text

    2. Create `dashboard/src/components/Layout.tsx`:
       - Sidebar (collapsible) with app title "PM Dashboard" and nav links
       - Main content area with header showing current page title
       - Use CSS modules or plain CSS file
       - Responsive: sidebar collapses to hamburger below 768px

    3. Create `dashboard/src/components/Layout.css`:
       - Sidebar: fixed left, 260px wide, dark glass effect (backdrop-filter)
       - Main: `margin-left: 260px`, padding
       - Transition for sidebar collapse
       - Media query for mobile

    4. Create `dashboard/src/hooks/useApi.ts`:
       - Custom hook: `useApi<T>(fetcher: () => Promise<T>)`
       - Returns `{ data, loading, error, refetch }`
       - Uses `useState` + `useEffect` with abort controller for cleanup
       - Handles error states gracefully

    5. Update `dashboard/src/App.tsx` to use Layout component

    DO NOT add Google Fonts link as external resource — use `@import` in CSS instead.
    DO NOT use any CSS framework — vanilla CSS only.
  </action>
  <verify>cd dashboard && npm run build && echo "Layout builds OK"</verify>
  <done>Layout shell renders with dark theme, sidebar nav, responsive design. useApi hook ready.</done>
</task>

<task type="auto">
  <name>Stats cards component</name>
  <files>
    dashboard/src/components/StatsCards.tsx
    dashboard/src/components/StatsCards.css
    dashboard/src/pages/Overview.tsx
    dashboard/src/pages/Overview.css
  </files>
  <action>
    1. Create `dashboard/src/components/StatsCards.tsx`:
       - Accept `status: StatusResponse` prop
       - Render 4 stat cards in a responsive grid:
         a. **Total Tasks** — large number, icon, colored accent border
         b. **In Progress** — count from `by_status.in_progress`
         c. **Agents** — total count with human/ai breakdown
         d. **Context Entries** — total count
       - Each card: glass-morphism background, subtle border, hover scale transform
       - Status distribution mini-bar under Total Tasks card (colored segments for todo/in-progress/done/blocked)
       - AnimatedCount component — numbers count up from 0 on mount (requestAnimationFrame)

    2. Create `dashboard/src/components/StatsCards.css`:
       - Grid layout: `repeat(auto-fit, minmax(240px, 1fr))`
       - Card: `background: var(--bg-secondary)`, `border: 1px solid var(--border-color)`
       - Glassmorphism: `backdrop-filter: blur(10px)`
       - Hover: `transform: translateY(-2px)`, box-shadow
       - Status bar: flex row with colored segments, rounded
       - Smooth transitions (0.2s ease)

    3. Create `dashboard/src/pages/Overview.tsx`:
       - Import `useApi` hook and `fetchStatus` from api client
       - Show loading skeleton while data loads
       - Show error state if API fails
       - Render StatsCards with StatusResponse data
       - Page title: "Project Overview"

    4. Create `dashboard/src/pages/Overview.css`:
       - Page-specific layout spacing
       - Section headings style

    5. Update `App.tsx` to render Overview page as default route
  </action>
  <verify>cd dashboard && npx tsc --noEmit && npm run build && echo "Stats OK"</verify>
  <done>Overview page renders stats cards with animated counts, status distribution bar, glass-morphism design</done>
</task>

## Success Criteria
- [ ] Dark theme design system with CSS variables applied globally
- [ ] Layout shell with sidebar nav and main content area
- [ ] 4 stats cards showing task/agent/context metrics from API
- [ ] Status distribution bar visualizing todo/in-progress/done/blocked
- [ ] Responsive grid layout (mobile-friendly)
- [ ] Loading and error states handled
