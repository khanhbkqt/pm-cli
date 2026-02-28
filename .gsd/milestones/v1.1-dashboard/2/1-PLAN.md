---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Task API Routes

## Objective
Create REST API endpoints for task operations (list, create, show, update, assign, comment) by wiring Express route handlers to existing `src/core/task.ts` functions. These endpoints are the core data layer for the dashboard UI.

## Context
- .gsd/SPEC.md
- src/server/app.ts
- src/core/task.ts
- src/db/types.ts

## Tasks

<task type="auto">
  <name>Create task routes module</name>
  <files>src/server/routes/tasks.ts</files>
  <action>
    Create `src/server/routes/tasks.ts` exporting an Express Router with these endpoints:

    1. `GET /api/tasks` — calls `listTasks(db, { status, assigned_to })` with optional query params `?status=&assigned_to=`. Returns `{ tasks: Task[] }`.
    2. `POST /api/tasks` — calls `addTask(db, body)`. Body: `{ title, description?, priority?, assigned_to?, parent_id?, created_by }`. Returns `{ task: Task }` with 201 status.
    3. `GET /api/tasks/:id` — calls `getTaskById(db, id)`. Returns `{ task: Task }`. Returns 404 if not found.
    4. `PUT /api/tasks/:id` — calls `updateTask(db, id, body)`. Body: `{ title?, description?, status?, priority?, assigned_to? }`. Returns `{ task: Task }`.
    5. `POST /api/tasks/:id/assign` — calls `assignTask(db, id, body.agent_id)`. Body: `{ agent_id }`. Returns `{ task: Task }`.
    6. `POST /api/tasks/:id/comments` — calls `addComment(db, { task_id: id, agent_id, content })`. Body: `{ agent_id, content }`. Returns `{ comment: TaskComment }` with 201 status.
    7. `GET /api/tasks/:id/comments` — calls `getComments(db, id)`. Returns `{ comments: TaskComment[] }`.

    Use the Express Router factory pattern: `export function createTaskRoutes(db: Database.Database): Router`.

    Each handler wraps core function calls in try/catch. On error: return `{ error: message }` with 400 status (validation errors) or 404 (not found — check error message for "not found").

    - Do NOT write any SQL — import and call functions from `src/core/task.ts`
    - Do NOT re-validate data that core functions already validate
    - Parse `:id` param as integer with `parseInt(req.params.id, 10)` — return 400 if NaN
  </action>
  <verify>npx tsx -e "import { createTaskRoutes } from './src/server/routes/tasks.js'; console.log(typeof createTaskRoutes)"</verify>
  <done>File exists, exports createTaskRoutes function, has all 7 route handlers</done>
</task>

<task type="auto">
  <name>Mount task routes in Express app</name>
  <files>src/server/app.ts</files>
  <action>
    Modify `createApp` in `src/server/app.ts` to:

    1. Import `createTaskRoutes` from `./routes/tasks.js`
    2. After `app.use(express.json())`, mount: `app.use(createTaskRoutes(db))`
    3. Ensure task routes are mounted BEFORE the static file catch-all route

    - Do NOT change the existing `/api/health` endpoint
    - Do NOT change the static file serving logic
    - Keep the `db` parameter — it's already passed through
  </action>
  <verify>npx tsx -e "import { createApp } from './src/server/app.js'; import Database from 'better-sqlite3'; const db = new Database(':memory:'); const app = createApp(db); console.log('mounted ok')"</verify>
  <done>Task routes mounted in createApp, health endpoint unchanged, static serving unchanged</done>
</task>

## Success Criteria
- [ ] `GET /api/tasks` returns JSON array of tasks
- [ ] `POST /api/tasks` creates a task and returns 201
- [ ] `GET /api/tasks/:id` returns a single task or 404
- [ ] `PUT /api/tasks/:id` updates task fields
- [ ] `POST /api/tasks/:id/assign` assigns agent to task
- [ ] `POST /api/tasks/:id/comments` creates comment with 201
- [ ] `GET /api/tasks/:id/comments` returns comments array
- [ ] All handlers delegate to `src/core/task.ts` — no raw SQL
