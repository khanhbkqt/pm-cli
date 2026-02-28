## Plan 2.1 Summary: Task API Routes

**Status:** ✅ Complete

### What was done
- Created `src/server/routes/tasks.ts` with 7 endpoints delegating to `src/core/task.ts`
- Mounted task routes in `src/server/app.ts` using `createTaskRoutes(db)` factory

### Endpoints
1. `GET /api/tasks` — list with optional `?status=&assigned_to=`
2. `POST /api/tasks` — create task (201)
3. `GET /api/tasks/:id` — show or 404
4. `PUT /api/tasks/:id` — update fields
5. `POST /api/tasks/:id/assign` — assign agent
6. `POST /api/tasks/:id/comments` — add comment (201)
7. `GET /api/tasks/:id/comments` — list comments
