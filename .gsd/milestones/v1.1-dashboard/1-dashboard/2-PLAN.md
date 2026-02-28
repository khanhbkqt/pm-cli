---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Express Server Module

## Objective
Create the `src/server/` module with an Express app factory, port discovery utility, and static file serving. This is the core server infrastructure that the `pm dashboard` command will use.

## Context
- .gsd/SPEC.md
- .gsd/phases/1-dashboard/RESEARCH.md
- src/db/connection.ts — database creation pattern
- src/core/identity.ts — `findProjectRoot()`, `getProjectDb()` reusable helpers

## Tasks

<task type="auto">
  <name>Create server utilities</name>
  <files>src/server/utils.ts</files>
  <action>
    Create `src/server/utils.ts` with two utility functions:
    
    1. `getAvailablePort(preferred: number = 4000): Promise<number>`
       - Try to listen on `preferred` port using Node.js `net.createServer()`
       - On success, close the test server and return `preferred`
       - On error (port busy), listen on port 0 to let OS assign, return that port
       - Use `import net from 'net'` (ESM)
    
    2. `openBrowser(url: string): void`
       - Use `import { exec } from 'child_process'`
       - Switch on `process.platform`: `darwin` → `open`, `win32` → `start`, default → `xdg-open`
       - Execute the command (fire-and-forget, ignore errors)
    
    - Do NOT install any external packages for these
    - Export both functions
  </action>
  <verify>
    npx tsx -e "import { getAvailablePort } from './src/server/utils.js'; getAvailablePort().then(p => console.log('Port:', p))"
  </verify>
  <done>Both functions exist, getAvailablePort returns a valid port number</done>
</task>

<task type="auto">
  <name>Create Express app factory</name>
  <files>src/server/app.ts, src/server/index.ts</files>
  <action>
    Create `src/server/app.ts`:
    
    1. `createApp(db: Database.Database): express.Express`
       - Create Express app with `express.json()` middleware
       - Mount a health check: `GET /api/health` → `{ status: 'ok' }`
       - Serve static files from the dashboard directory:
         ```
         const dashboardPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dashboard');
         if (fs.existsSync(dashboardPath)) {
           app.use(express.static(dashboardPath));
           app.get('*', (req, res) => {
             if (!req.path.startsWith('/api')) {
               res.sendFile(path.join(dashboardPath, 'index.html'));
             }
           });
         }
         ```
       - Return the app instance (do NOT call `.listen()` here)
       - Accept `db` parameter for future API routes (Phase 2)
    
    2. Import `express`, `path`, `fs`, `fileURLToPath` from `url`
    
    Create `src/server/index.ts`:
    - Re-export from `./app.js` and `./utils.js`
    
    - Do NOT write API route handlers yet (Phase 2)
    - Do NOT hardcode file paths — use `import.meta.url` for resolution
    - The `db` parameter is stored but not used until Phase 2 adds API routes
  </action>
  <verify>
    npx tsx -e "
      import { createApp } from './src/server/app.js';
      import Database from 'better-sqlite3';
      const db = new Database(':memory:');
      const app = createApp(db);
      console.log('App created:', typeof app.listen === 'function');
      db.close();
    "
  </verify>
  <done>Express app factory creates a valid Express app; health endpoint is registered; static serving is configured</done>
</task>

## Success Criteria
- [ ] `src/server/utils.ts` exports `getAvailablePort` and `openBrowser`
- [ ] `src/server/app.ts` exports `createApp(db)` returning an Express app
- [ ] `src/server/index.ts` re-exports all server modules
- [ ] Health check at `GET /api/health` returns `{ status: 'ok' }`
- [ ] Static dashboard directory is served if it exists
