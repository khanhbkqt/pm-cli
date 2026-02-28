---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Agent, Context & Status API Routes

## Objective
Create REST API endpoints for agents, context entries, and project status overview. These complete the API layer that the dashboard UI will consume.

## Context
- .gsd/SPEC.md
- src/server/app.ts
- src/core/agent.ts
- src/core/context.ts
- src/core/task.ts
- src/db/types.ts

## Tasks

<task type="auto">
  <name>Create agent and context routes modules</name>
  <files>src/server/routes/agents.ts, src/server/routes/context.ts</files>
  <action>
    **src/server/routes/agents.ts** — export `createAgentRoutes(db): Router`:
    1. `GET /api/agents` — calls `listAgents(db)`. Returns `{ agents: Agent[] }`.
    2. `GET /api/agents/:id` — calls `getAgentById(db, id)`. Returns `{ agent: Agent }`. Returns 404 if not found.

    **src/server/routes/context.ts** — export `createContextRoutes(db): Router`:
    1. `GET /api/context` — calls `listContext(db, { category })` with optional `?category=` query param. Returns `{ entries: ContextEntry[] }`.
    2. `GET /api/context/search` — calls `searchContext(db, query)` with `?q=` query param. Returns 400 if `q` missing. Returns `{ entries: ContextEntry[] }`.

    Same error-handling pattern as task routes: try/catch, 400 for validation errors, 404 for not found.
    
    - Import core functions from `src/core/agent.ts` and `src/core/context.ts`
    - Do NOT write any SQL
  </action>
  <verify>npx tsx -e "import { createAgentRoutes } from './src/server/routes/agents.js'; import { createContextRoutes } from './src/server/routes/context.js'; console.log(typeof createAgentRoutes, typeof createContextRoutes)"</verify>
  <done>Both files exist, export factory functions, have all specified endpoints</done>
</task>

<task type="auto">
  <name>Create status route and mount all routes</name>
  <files>src/server/routes/status.ts, src/server/app.ts</files>
  <action>
    **src/server/routes/status.ts** — export `createStatusRoutes(db): Router`:
    1. `GET /api/status` — build a project overview object using direct SQL queries on `db`:
       ```
       {
         tasks: { total, by_status: { todo, in_progress, done, blocked }, by_priority: { low, medium, high, urgent } },
         agents: { total, by_type: { human, ai } },
         context: { total },
         recent_tasks: Task[] (last 5, ordered by updated_at DESC)
       }
       ```
       Use `db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?').get(status)` pattern for counts.
       This is the ONE route that uses direct SQL — it's an aggregation endpoint not covered by existing core functions.

    **src/server/app.ts** — mount ALL new routes:
    1. Import `createAgentRoutes`, `createContextRoutes`, `createStatusRoutes`
    2. Mount each router after task routes, before static file catch-all:
       - `app.use(createAgentRoutes(db))`
       - `app.use(createContextRoutes(db))`
       - `app.use(createStatusRoutes(db))`
    
    Also create `src/server/routes/index.ts` barrel export for all route factories.
  </action>
  <verify>npx tsx -e "import { createStatusRoutes } from './src/server/routes/status.js'; console.log(typeof createStatusRoutes)"</verify>
  <done>Status route returns aggregated project stats, all 4 route modules mounted in app.ts, barrel export exists</done>
</task>

## Success Criteria
- [ ] `GET /api/agents` returns agent list
- [ ] `GET /api/agents/:id` returns agent or 404
- [ ] `GET /api/context` returns context entries with optional category filter
- [ ] `GET /api/context/search?q=` returns search results
- [ ] `GET /api/status` returns project overview with task/agent/context counts
- [ ] All routes mounted in `createApp` correctly
