## Plan 4.1 Summary — Dashboard API Routes

**Completed**: 2026-03-03

### Changes
- Created `src/server/routes/bugs.ts` with 4 endpoints:
  - `GET /api/bugs` — list bugs with priority/status/blocking/milestone_id filters
  - `POST /api/bugs` — report a new bug (with filesystem content write)
  - `GET /api/bugs/:id` — get bug detail + filesystem markdown content
  - `PATCH /api/bugs/:id` — update bug fields (status, priority, assigned_to, etc.)
- Exported `createBugRoutes` from `src/server/routes/index.ts`
- Registered bug routes in `src/server/app.ts`

### Verification
- `npx tsc --noEmit` — passes clean
