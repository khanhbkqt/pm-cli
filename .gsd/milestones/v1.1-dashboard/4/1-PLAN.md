---
phase: 4-dashboard
plan: 1
wave: 1
---

# Plan 4.1: Routing & API Mutations

## Objective
Add client-side routing so the sidebar links work, create the Tasks page shell, and extend the API client with mutation functions (create, update, assign, comment) needed by the Tasks Board.

## Context
- dashboard/src/App.tsx
- dashboard/src/components/Layout.tsx
- dashboard/src/api/client.ts
- dashboard/src/api/types.ts
- dashboard/package.json
- src/server/routes/tasks.ts

## Tasks

<task type="auto">
  <name>Install react-router-dom and add routing</name>
  <files>
    dashboard/package.json
    dashboard/src/App.tsx
    dashboard/src/main.tsx
  </files>
  <action>
    1. Run `npm install react-router-dom` in `dashboard/` directory.
    2. Update `dashboard/src/App.tsx`:
       - Import `BrowserRouter`, `Routes`, `Route` from react-router-dom.
       - Wrap content in `<BrowserRouter>`.
       - Define routes: `/` → Overview, `/tasks` → TasksBoard (new page).
       - Keep `<Layout>` as the wrapper around routes.
    3. Create `dashboard/src/pages/TasksBoard.tsx` as a minimal placeholder that renders "Tasks Board" heading.
    4. Create `dashboard/src/pages/TasksBoard.css` with empty content.
  </action>
  <verify>
    Run `cd dashboard && npx tsc --noEmit` — no type errors.
    Run `cd dashboard && npm run build` — builds successfully.
  </verify>
  <done>
    - react-router-dom installed
    - `/` renders Overview, `/tasks` renders TasksBoard
    - TypeScript compiles clean
  </done>
</task>

<task type="auto">
  <name>Update Layout sidebar with working navigation links</name>
  <files>
    dashboard/src/components/Layout.tsx
    dashboard/src/components/Layout.css
  </files>
  <action>
    1. Replace `<a href="#">` links in Layout sidebar with react-router `<NavLink>` components.
    2. Remove `sidebar__link--disabled` class from Tasks link — make it active/navigable.
    3. Keep Agents and Context links as disabled for now (future phases).
    4. Use `NavLink` className callback to apply `sidebar__link--active` based on current route.
    5. Update the `<h1>` in the header to be dynamic — show "Project Overview" for `/` and "Tasks Board" for `/tasks`.
       - Use `useLocation()` hook to detect current path.
    6. Do NOT change any existing CSS — only add new classes if needed.
  </action>
  <verify>
    Run `cd dashboard && npx tsc --noEmit` — no type errors.
  </verify>
  <done>
    - Sidebar "Overview" link navigates to `/`
    - Sidebar "Tasks" link navigates to `/tasks`
    - Active link is highlighted based on current route
    - Page title updates per route
  </done>
</task>

<task type="auto">
  <name>Extend API client with mutation functions</name>
  <files>
    dashboard/src/api/client.ts
    dashboard/src/api/types.ts
  </files>
  <action>
    1. Add `apiPost<T>` and `apiPut<T>` helpers to `client.ts` alongside existing `apiFetch<T>`:
       - Both send JSON body with Content-Type header
       - `apiPost` uses POST method, `apiPut` uses PUT method
       - Same error handling pattern as `apiFetch`
    2. Add these client functions:
       - `createTask(data: CreateTaskInput): Promise<Task>` — POST /api/tasks
       - `updateTask(id: number, data: UpdateTaskInput): Promise<Task>` — PUT /api/tasks/:id
       - `assignTask(id: number, agentId: string): Promise<Task>` — POST /api/tasks/:id/assign
       - `addTaskComment(id: number, data: AddCommentInput): Promise<TaskComment>` — POST /api/tasks/:id/comments
       - `fetchTaskComments(taskId: number): Promise<TaskComment[]>` — GET /api/tasks/:id/comments
    3. Add corresponding input types to `types.ts`:
       - `CreateTaskInput { title: string; description?: string; priority?: string; assigned_to?: string; created_by: string; }`
       - `UpdateTaskInput { title?: string; description?: string; status?: string; priority?: string; }`
       - `AddCommentInput { agent_id: string; content: string; }`
  </action>
  <verify>
    Run `cd dashboard && npx tsc --noEmit` — no type errors.
  </verify>
  <done>
    - API client has all mutation functions
    - Input types defined in types.ts
    - TypeScript compiles clean
  </done>
</task>

## Success Criteria
- [ ] react-router-dom installed and working
- [ ] Two routes: `/` (Overview), `/tasks` (TasksBoard placeholder)
- [ ] Layout sidebar navigates between pages
- [ ] API client has create/update/assign/comment mutation functions
- [ ] `npm run build` succeeds in dashboard/
