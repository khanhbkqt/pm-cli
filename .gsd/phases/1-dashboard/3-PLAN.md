---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: Dashboard CLI Command & Integration

## Objective
Create the `pm dashboard` CLI command that starts the Express server, opens the browser, and handles graceful shutdown. Wire it into the main CLI entry point.

## Context
- .gsd/SPEC.md
- .gsd/phases/1-dashboard/RESEARCH.md
- src/index.ts — main entry point, command registration pattern
- src/cli/commands/status.ts — example command pattern (Commander + getProjectDb)
- src/server/app.ts — createApp factory
- src/server/utils.ts — getAvailablePort, openBrowser

## Tasks

<task type="auto">
  <name>Create dashboard CLI command</name>
  <files>src/cli/commands/dashboard.ts</files>
  <action>
    Create `src/cli/commands/dashboard.ts` following the existing command pattern:
    
    1. Export `registerDashboardCommand(program: Command): void`
    2. Register command: `program.command('dashboard').description('Launch project dashboard in browser')`
    3. Add options:
       - `--port <number>` — Preferred port (default: 4000)
       - `--no-open` — Don't auto-open browser
    4. Action handler:
       a. Call `getProjectDb()` to get database connection (validates project exists)
       b. Call `createApp(db)` to build the Express app
       c. Call `getAvailablePort(port)` to find available port
       d. Start server: `const server = app.listen(resolvedPort)`
       e. Log: `Dashboard running at http://localhost:{port}` and `Press Ctrl+C to stop`
       f. If `--no-open` is NOT set, call `openBrowser(url)`
       g. Register `SIGINT` and `SIGTERM` handlers:
          - Log `\nShutting down dashboard...`
          - `server.close(() => { db.close(); process.exit(0); })`
    
    - Follow the SAME error handling pattern as `src/cli/commands/status.ts`
    - Do NOT require `--agent` flag for dashboard (it's a viewing tool, not an action)
    - Import from `../../server/index.js`
  </action>
  <verify>
    npx tsx -e "import { registerDashboardCommand } from './src/cli/commands/dashboard.js'; console.log(typeof registerDashboardCommand)"
  </verify>
  <done>`registerDashboardCommand` function exists and is importable</done>
</task>

<task type="auto">
  <name>Register dashboard command in main entry</name>
  <files>src/index.ts</files>
  <action>
    Add to `src/index.ts`:
    
    1. Add import: `import { registerDashboardCommand } from './cli/commands/dashboard.js';`
    2. Add registration call: `registerDashboardCommand(program);`
    3. Place it after the existing `registerStatusCommand(program)` line
    
    - Do NOT change any other existing imports or registrations
    - Do NOT change `program.parse(process.argv)`
  </action>
  <verify>
    npm run build && node dist/index.js dashboard --help
  </verify>
  <done>`pm dashboard --help` shows usage with --port and --no-open options; build succeeds</done>
</task>

<task type="auto">
  <name>Write unit test for server module</name>
  <files>tests/server.test.ts</files>
  <action>
    Create `tests/server.test.ts` with vitest:
    
    1. Test `getAvailablePort`:
       - Should return default port (4000) when available
       - Should return an alternative port when preferred port is busy (start a server on 4000 first)
    
    2. Test `createApp`:
       - Should return an Express app with `listen` function
       - Should respond to `GET /api/health` with `{ status: 'ok' }` — use supertest-like approach: start app on random port, fetch, close
    
    Import from `../src/server/index.js`
    Use `import Database from 'better-sqlite3'` for in-memory db
    Use native `fetch()` (available in Node 18+) to test HTTP responses
    
    - Clean up servers and db connections in afterEach
    - Do NOT import supertest — use native fetch
  </action>
  <verify>npx vitest run tests/server.test.ts</verify>
  <done>All server tests pass; port discovery and health endpoint are validated</done>
</task>

## Success Criteria
- [ ] `pm dashboard --help` shows command with --port and --no-open options
- [ ] `pm dashboard` starts server, prints URL, opens browser
- [ ] Ctrl+C gracefully shuts down server and closes DB
- [ ] `npm run build` succeeds with dashboard command included
- [ ] Server tests pass (`npx vitest run tests/server.test.ts`)
