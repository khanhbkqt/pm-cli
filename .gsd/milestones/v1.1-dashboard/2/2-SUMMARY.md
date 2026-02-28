## Plan 2.2 Summary: Agent, Context & Status API Routes

**Status:** ✅ Complete

### What was done
- Created `src/server/routes/agents.ts` with 2 endpoints
- Created `src/server/routes/context.ts` with 2 endpoints
- Created `src/server/routes/status.ts` with 1 aggregation endpoint
- Created `src/server/routes/index.ts` barrel export
- Mounted all routes in `src/server/app.ts`

### Endpoints
1. `GET /api/agents` — list all agents
2. `GET /api/agents/:id` — show agent or 404
3. `GET /api/context` — list with optional `?category=`
4. `GET /api/context/search?q=` — search (400 if `q` missing)
5. `GET /api/status` — project overview (tasks/agents/context counts + recent tasks)
