---
phase: 5
level: 1
researched_at: 2026-02-28
---

# Phase 5 Research — Agents & Context Screens

## Questions Investigated

1. What backend API endpoints already exist for agents and context?
2. What frontend API client / types / hooks are already in place?
3. What UI patterns (pages, components, CSS) should new screens follow?
4. Are any new backend routes or DB changes required?
5. How should agent detail view show assigned tasks / activity?

## Findings

### 1. Backend APIs — Already Sufficient

All needed endpoints exist in `src/server/routes/`:

| Endpoint | File | Purpose |
|----------|------|---------|
| `GET /api/agents` | `agents.ts` | List all agents |
| `GET /api/agents/:id` | `agents.ts` | Agent by ID |
| `GET /api/context` | `context.ts` | List entries (optional `?category=` filter) |
| `GET /api/context/search?q=` | `context.ts` | Full-text search on key/value |
| `GET /api/tasks?assigned_to=` | `tasks.ts` | Tasks filtered by agent ID |

**Recommendation:** No new backend routes needed. Existing endpoints cover listing, detail, filtering, and search for both agents and context. Tasks assigned to an agent can be fetched via `GET /api/tasks?assigned_to={agentId}`.

### 2. Frontend API Client — Ready

`dashboard/src/api/client.ts` already exports:
- `fetchAgents()` → `Agent[]`
- `fetchContext(filters?)` → `ContextEntry[]`
- `fetchTasks(filters?)` → `Task[]`

Missing:
- `fetchAgentById(id)` → need to add
- `searchContext(query)` → need to add

Both map to existing backend endpoints, so only thin client wrappers needed.

### 3. Frontend Patterns — Clear Conventions

| Pattern | Convention |
|---------|-----------|
| **Pages** | `dashboard/src/pages/{Name}.tsx` + `{Name}.css` |
| **Components** | `dashboard/src/components/{Name}.tsx` + `{Name}.css` |
| **Data fetching** | `useApi(fetcher)` hook from `hooks/useApi.ts` |
| **Routing** | `react-router-dom` v7, routes in `App.tsx`, sidebar `NavLink` in `Layout.tsx` |
| **Design system** | CSS custom properties in `index.css` (dark theme palette), `Inter` font, `--radius`, `--border-color` tokens |
| **Component style** | BEM-ish naming, `.panel-title`, avatar with `hashColor()`, `relativeTime()` helper |

### 4. Existing Reusable Code

- `AgentList.tsx` — compact agent list panel (Overview sidebar). Utility functions `getInitials()`, `hashColor()`, `relativeTime()` can be reused/extracted.
- `FilterBar.tsx` — status/agent filter bar. Pattern can be adapted for category/search filters.
- `TaskCard.tsx` — card pattern reusable for context entry cards.

### 5. Navigation Wiring

`Layout.tsx` already has disabled sidebar links for Agents and Context (lines 57–64). These need to be converted from `<a href="#">` to `<NavLink>` pointing to `/agents` and `/context`, and `pageTitles` map needs two new entries.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| New backend routes | None needed | Existing API covers all data needs |
| DB schema changes | None needed | Agent, Context, Task tables already have all fields |
| Agent detail view | Slide-in panel (like TaskDetailPanel) | Consistent pattern, avoids separate route |
| Context detail view | Expandable row / modal | Context values can be long; inline expansion is best UX |
| Search implementation | Client-side for agents (small dataset), server-side for context (uses existing search endpoint) | Agents are typically few; context entries can be many |
| Utility extraction | Extract `getInitials`, `hashColor`, `relativeTime` to `utils.ts` | Reuse across AgentList, new Agents page |

## Patterns to Follow

- Page = `useApi` hook → loading/error/data states → render
- CSS file per component/page, BEM naming, CSS custom properties
- Filter bar as a separate component with controlled state
- Empty states with icon + message (see `AgentList` empty state)
- `NavLink` for routing, sidebar `--active` class for current page

## Anti-Patterns to Avoid

- **No new npm dependencies** — the stack is intentionally minimal (React + RRD + Vite). No UI libraries.
- **Don't fetch data inline** — always use `useApi` hook for consistency and abort cleanup
- **Don't duplicate type definitions** — types are in `api/types.ts`, matching backend `db/types.ts`
- **Don't use inline styles** — CSS custom properties and class-based styling only (except dynamic avatar colors)

## Dependencies Identified

| Package | Version | Purpose |
|---------|---------|---------|
| (none) | — | No new dependencies required |

## Risks

- **Agent detail: no dedicated `/api/agents/:id/tasks` endpoint** — mitigated by using existing `GET /api/tasks?assigned_to=` filter. Two API calls needed per agent detail view (agent + their tasks). Acceptable overhead for small dataset.
- **Context search latency** — mitigated by debouncing search input before hitting backend. `GET /api/context/search?q=` already exists.

## Ready for Planning

- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
