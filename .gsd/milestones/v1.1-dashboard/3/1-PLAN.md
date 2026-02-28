---
phase: 3-dashboard
plan: 1
wave: 1
---

# Plan 3.1: React App Scaffolding & Build Integration

## Objective
Scaffold a Vite + React + TypeScript frontend inside the CLI project, configure the build pipeline so `npm run build:dashboard` outputs to `dist/dashboard/`, and set up the API client layer with shared TypeScript types.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md (Phase 3 deliverables)
- src/server/app.ts (static serving from `dist/dashboard/`)
- src/db/types.ts (Task, Agent, ContextEntry, TaskComment interfaces)
- package.json (current scripts and deps)
- tsup.config.ts (CLI build — separate from dashboard build)

## Tasks

<task type="auto">
  <name>Scaffold React app with Vite</name>
  <files>
    dashboard/package.json
    dashboard/tsconfig.json
    dashboard/vite.config.ts
    dashboard/index.html
    dashboard/src/main.tsx
    dashboard/src/App.tsx
    dashboard/src/vite-env.d.ts
  </files>
  <action>
    Create a `dashboard/` subdirectory at project root.
    Initialize a minimal Vite + React + TypeScript project:
    - `dashboard/package.json` with react, react-dom, typescript, @vitejs/plugin-react, vite
    - `dashboard/vite.config.ts` with:
      - `base: './'` (relative paths for static serving)
      - `build.outDir: '../dist/dashboard'` (output alongside CLI dist)
      - `build.emptyOutDir: true`
      - `server.proxy: { '/api': 'http://localhost:4000' }` (dev proxy to Express)
    - `dashboard/tsconfig.json` with strict mode, JSX react-jsx
    - `dashboard/index.html` — entry point loading `/src/main.tsx`
    - `dashboard/src/main.tsx` — ReactDOM.createRoot render
    - `dashboard/src/App.tsx` — simple placeholder component
    - `dashboard/src/vite-env.d.ts` — Vite type reference

    DO NOT install deps yet (that's in verify step).
    DO NOT modify the root `package.json` scripts yet (next task).
  </action>
  <verify>cd dashboard && npm install && npm run build && test -f ../dist/dashboard/index.html && echo "OK"</verify>
  <done>dashboard/ folder exists with Vite config, React entry point, and build outputs to dist/dashboard/index.html</done>
</task>

<task type="auto">
  <name>API client and shared types</name>
  <files>
    dashboard/src/api/client.ts
    dashboard/src/api/types.ts
    dashboard/src/api/index.ts
    package.json (root — add build:dashboard script)
    .gitignore (add dashboard/node_modules)
  </files>
  <action>
    1. Create `dashboard/src/api/types.ts` mirroring the DB types from `src/db/types.ts`:
       - Task, Agent, ContextEntry, TaskComment interfaces
       - StatusResponse type matching GET /api/status response shape:
         ```ts
         interface StatusResponse {
           tasks: { total: number; by_status: Record<string, number>; by_priority: Record<string, number> };
           agents: { total: number; by_type: Record<string, number> };
           context: { total: number };
           recent_tasks: Task[];
         }
         ```

    2. Create `dashboard/src/api/client.ts`:
       - `fetchStatus(): Promise<StatusResponse>` — GET /api/status
       - `fetchTasks(filters?): Promise<Task[]>` — GET /api/tasks
       - `fetchAgents(): Promise<Agent[]>` — GET /api/agents
       - `fetchContext(filters?): Promise<ContextEntry[]>` — GET /api/context
       - Base `apiFetch(path)` helper wrapping `fetch()` with error handling
       - All functions use relative URLs (`/api/...`) — works in both dev proxy and production

    3. Create `dashboard/src/api/index.ts` — barrel export

    4. Add to root `package.json` scripts:
       - `"build:dashboard": "cd dashboard && npm run build"`
       - Update `"build"` to: `"tsup && cd dashboard && npm run build"`

    5. Add `dashboard/node_modules` to root `.gitignore`
  </action>
  <verify>cd dashboard && npx tsc --noEmit && echo "Types OK"</verify>
  <done>API client module compiles, root build script includes dashboard, .gitignore updated</done>
</task>

## Success Criteria
- [ ] `dashboard/` directory created with Vite + React + TS setup
- [ ] `npm run build` in `dashboard/` produces `dist/dashboard/index.html`
- [ ] API client typed with StatusResponse, Task, Agent, ContextEntry
- [ ] Root `package.json` has `build:dashboard` script
- [ ] Dashboard code compiles without type errors
