---
phase: 3-dashboard
plan: 3
wave: 2
---

# Plan 3.3: Agent List Panel & Recent Activity Feed

## Objective
Complete the Overview page with an agent list panel and a recent activity feed, plus visual verification that the full dashboard renders correctly against the live API.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md (Phase 3 deliverables)
- dashboard/src/api/client.ts (fetchAgents, fetchStatus from Plan 3.1)
- dashboard/src/api/types.ts (Agent, Task types)
- dashboard/src/pages/Overview.tsx (from Plan 3.2)
- src/server/routes/agents.ts (GET /api/agents response)
- src/server/routes/status.ts (recent_tasks in GET /api/status)

## Tasks

<task type="auto">
  <name>Agent list and activity feed components</name>
  <files>
    dashboard/src/components/AgentList.tsx
    dashboard/src/components/AgentList.css
    dashboard/src/components/ActivityFeed.tsx
    dashboard/src/components/ActivityFeed.css
    dashboard/src/pages/Overview.tsx (update)
    dashboard/src/pages/Overview.css (update)
  </files>
  <action>
    1. Create `dashboard/src/components/AgentList.tsx`:
       - Accept `agents: Agent[]` prop
       - Render list of agents with:
         - Avatar circle (initials from agent name, hashed color)
         - Agent name and role
         - Type badge: "Human" (blue) or "AI" (purple)
         - Created date in relative format ("2h ago", "3d ago")
       - Empty state message if no agents registered
       - Card container with section title "Agents"

    2. Create `dashboard/src/components/AgentList.css`:
       - List item: flex row, padding, hover background
       - Avatar: 36px circle, centered initials, gradient background
       - Type badge: pill shape, small font
       - Transitions on hover

    3. Create `dashboard/src/components/ActivityFeed.tsx`:
       - Accept `tasks: Task[]` prop (recent_tasks from status API)
       - Render timeline-style feed:
         - Each entry: task title, status badge (colored), updated timestamp
         - Status badges: todo (gray), in-progress (blue), done (green), blocked (red)
         - Priority indicator dot (low=green, medium=yellow, high=orange, urgent=red)
       - Empty state message if no recent activity
       - Section title "Recent Activity"

    4. Create `dashboard/src/components/ActivityFeed.css`:
       - Timeline: vertical line left side, dots on line
       - Feed item: flex row, gap between elements
       - Status badge: pill, colored per status
       - Timestamp: muted text, right-aligned

    5. Update `dashboard/src/pages/Overview.tsx`:
       - Add `useApi(fetchAgents)` call
       - Render below stats cards in a 2-column grid:
         - Left (wider): ActivityFeed with recent_tasks
         - Right: AgentList with agents
       - Both sections in glass-morphism card containers
       - Responsive: stack to single column below 1024px

    6. Update `dashboard/src/pages/Overview.css`:
       - Two-column grid: `grid-template-columns: 1.5fr 1fr`
       - Gap between sections
       - Media query for stacking
  </action>
  <verify>cd dashboard && npx tsc --noEmit && npm run build && echo "Components OK"</verify>
  <done>Overview page shows agent list panel and activity feed timeline with all styling</done>
</task>

<task type="checkpoint:human-verify">
  <name>Visual verification of full dashboard</name>
  <files>
    dashboard/src/**
  </files>
  <action>
    1. Build the full project: `npm run build` (root)
    2. Start the dashboard: `pm dashboard` (or `tsx src/index.ts dashboard`)
    3. Open browser to verify:
       - Dark theme renders correctly
       - Stats cards show real data from SQLite
       - Agent list shows registered agents
       - Activity feed shows recent tasks
       - Layout is responsive (resize window)
       - No console errors
    4. Test with empty database (fresh `pm init`) to verify empty states
  </action>
  <verify>Manual browser inspection — all sections render, no console errors, responsive layout works</verify>
  <done>Dashboard overview page visually verified with live data, responsive design confirmed</done>
</task>

## Success Criteria
- [ ] Agent list panel renders with avatars, type badges, relative dates
- [ ] Activity feed shows recent tasks with status badges and priority dots
- [ ] Overview page has 2-column layout (feed + agents) below stats
- [ ] Empty states handled gracefully for all sections
- [ ] Full dashboard builds and serves via `pm dashboard`
- [ ] Responsive: mobile single-column, desktop two-column
