---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: API Client, Utilities & Navigation Wiring

## Objective
Add missing API client functions (`fetchAgentById`, `searchContext`), extract shared utility functions (`getInitials`, `hashColor`, `relativeTime`) from `AgentList.tsx` into a reusable `utils.ts`, and wire up sidebar navigation links for the Agents and Context pages.

## Context
- .gsd/SPEC.md
- .gsd/phases/5-dashboard/RESEARCH.md
- dashboard/src/api/client.ts
- dashboard/src/api/types.ts
- dashboard/src/components/AgentList.tsx
- dashboard/src/components/Layout.tsx
- dashboard/src/App.tsx

## Tasks

<task type="auto">
  <name>Add missing API client functions</name>
  <files>dashboard/src/api/client.ts</files>
  <action>
    Add two new exported functions to the API client:

    1. `fetchAgentById(id: string): Promise<Agent>` — calls `GET /api/agents/${id}`, unwraps `{ agent }` response
    2. `searchContext(query: string): Promise<ContextEntry[]>` — calls `GET /api/context/search?q=${encodeURIComponent(query)}`, unwraps `{ entries }` response

    - Follow the existing `apiFetch` pattern used by `fetchAgents()` and `fetchContext()`
    - Import `Agent` and `ContextEntry` types from `./types` (already imported)
    - Place new functions in the "Read endpoints" section after existing ones
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json</verify>
  <done>Both functions exist in client.ts, TypeScript compiles without errors</done>
</task>

<task type="auto">
  <name>Extract shared utilities to utils.ts</name>
  <files>dashboard/src/utils.ts, dashboard/src/components/AgentList.tsx</files>
  <action>
    1. Create `dashboard/src/utils.ts` with three exported functions extracted from `AgentList.tsx`:
       - `getInitials(name: string): string` — split name, take first chars, uppercase, max 2
       - `hashColor(name: string): string` — hash name to HSL color
       - `relativeTime(dateStr: string): string` — convert ISO date to "Xm ago" format

    2. Refactor `AgentList.tsx` to import from `../utils` instead of defining locally
       - Remove the three function definitions from AgentList.tsx
       - Add `import { getInitials, hashColor, relativeTime } from '../utils';`
       - Do NOT change any rendering logic or CSS
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json</verify>
  <done>utils.ts exists with 3 exported functions, AgentList.tsx imports from utils, TypeScript compiles</done>
</task>

<task type="auto">
  <name>Wire navigation and routing for Agents & Context pages</name>
  <files>dashboard/src/components/Layout.tsx, dashboard/src/App.tsx</files>
  <action>
    1. In `Layout.tsx`:
       - Replace the disabled `<a href="#">` for Agents (lines 57-60) with a `<NavLink to="/agents">` using the same `isActive` pattern as Overview/Tasks links
       - Replace the disabled `<a href="#">` for Context (lines 61-64) with a `<NavLink to="/context">` using the same pattern
       - Remove `sidebar__link--disabled` class from both
       - Add `'/agents': 'Agents'` and `'/context': 'Context'` to the `pageTitles` record

    2. In `App.tsx`:
       - Import placeholder page components: `AgentsPage` from `./pages/AgentsPage` and `ContextPage` from `./pages/ContextPage`
       - Add routes: `<Route path="/agents" element={<AgentsPage />} />` and `<Route path="/context" element={<ContextPage />} />`

    3. Create placeholder pages (will be fully implemented in Plans 5.2 and 5.3):
       - `dashboard/src/pages/AgentsPage.tsx` — simple export with `<div className="agents-page"><p>Loading agents...</p></div>`
       - `dashboard/src/pages/ContextPage.tsx` — simple export with `<div className="context-page"><p>Loading context...</p></div>`
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json && cd dashboard && npx vite build 2>&1 | tail -5</verify>
  <done>Sidebar links navigate to /agents and /context, routes render placeholder pages, build succeeds</done>
</task>

## Success Criteria
- [ ] `fetchAgentById` and `searchContext` functions exist in `client.ts`
- [ ] `utils.ts` exports `getInitials`, `hashColor`, `relativeTime`
- [ ] `AgentList.tsx` imports from utils (no local duplicates)
- [ ] Sidebar links for Agents/Context are `NavLink` (no longer disabled)
- [ ] Routes `/agents` and `/context` exist in `App.tsx`
- [ ] TypeScript compiles and Vite build passes
