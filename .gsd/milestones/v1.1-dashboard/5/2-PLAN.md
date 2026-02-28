---
phase: 5
plan: 2
wave: 1
---

# Plan 5.2: Agents Page & Agent Detail Panel

## Objective
Implement the full Agents page with a list of all registered agents, search/filter capabilities, and a slide-in agent detail panel showing agent info and assigned tasks.

## Context
- .gsd/phases/5-dashboard/RESEARCH.md
- dashboard/src/pages/AgentsPage.tsx (placeholder from Plan 5.1)
- dashboard/src/api/client.ts (fetchAgents, fetchAgentById, fetchTasks)
- dashboard/src/hooks/useApi.ts
- dashboard/src/utils.ts (getInitials, hashColor, relativeTime)
- dashboard/src/components/TaskDetailPanel.tsx (slide-in panel pattern reference)
- dashboard/src/components/FilterBar.tsx (filter bar pattern reference)

## Tasks

<task type="auto">
  <name>Implement AgentsPage with list and filters</name>
  <files>dashboard/src/pages/AgentsPage.tsx, dashboard/src/pages/AgentsPage.css</files>
  <action>
    Replace the placeholder AgentsPage with a full implementation:

    1. **Data fetching**: Use `useApi(fetchAgents)` hook for agent list
    2. **Search bar**: Client-side text filter on agent name/role (agents are a small dataset)
    3. **Type filter**: Toggle buttons for "All", "Human", "AI" agent types
    4. **Agent cards**: Grid layout with cards showing:
       - Avatar with `hashColor()` gradient background and `getInitials()` text
       - Agent name, role, type badge (Human/AI)
       - Created date via `relativeTime()`
       - Click handler to open agent detail panel
    5. **Empty state**: Show icon + message when no agents match filters
    6. **Loading & error states**: Consistent with existing pages

    CSS in `AgentsPage.css`:
    - Use CSS custom properties from `index.css` (--bg-card, --text-primary, --border-color, etc.)
    - BEM naming: `.agents-page`, `.agents-page__search`, `.agents-page__grid`, `.agent-card`, etc.
    - Responsive grid: 3 columns on desktop, 2 on tablet, 1 on mobile
    - Hover effect on agent cards (subtle lift/glow)
    - Do NOT use inline styles except for dynamic avatar colors
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json</verify>
  <done>AgentsPage renders agent list with search, type filter, and clickable cards</done>
</task>

<task type="auto">
  <name>Implement AgentDetailPanel slide-in component</name>
  <files>dashboard/src/components/AgentDetailPanel.tsx, dashboard/src/components/AgentDetailPanel.css</files>
  <action>
    Create a slide-in detail panel (following TaskDetailPanel pattern):

    1. **Props**: `agentId: string | null`, `onClose: () => void`
    2. **Data fetching**: When `agentId` is set:
       - Fetch agent details via `fetchAgentById(agentId)`
       - Fetch assigned tasks via `fetchTasks({ assigned_to: agentId })`
    3. **Agent info section**:
       - Large avatar with gradient
       - Name, role, type badge
       - ID (monospace, copyable feel)
       - Registered date (formatted)
    4. **Assigned tasks section**:
       - Header: "Assigned Tasks (N)"
       - List of task items showing title, status badge, priority
       - Empty state: "No tasks assigned" message
    5. **Overlay**: Dark overlay behind panel (click to close)
    6. **Animation**: Slide in from right (CSS transition, matching TaskDetailPanel)

    CSS in `AgentDetailPanel.css`:
    - Follow `TaskDetailPanel.css` patterns exactly
    - BEM naming: `.agent-detail`, `.agent-detail--open`, `.agent-detail__overlay`
    - Same slide-in animation approach
    - Status/priority badges should match TaskCard styling
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json</verify>
  <done>AgentDetailPanel slides in showing agent info + assigned tasks, closes on overlay click</done>
</task>

## Success Criteria
- [ ] Agents page lists all agents in a responsive card grid
- [ ] Search bar filters agents by name/role (client-side)
- [ ] Type toggle filters by Human/AI/All
- [ ] Clicking an agent card opens the AgentDetailPanel
- [ ] Detail panel shows agent info and assigned tasks
- [ ] Loading, error, and empty states all render correctly
- [ ] TypeScript compiles without errors
