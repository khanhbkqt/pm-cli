---
phase: 1
milestone: v1.1-dashboard
level: 2
researched_at: 2026-02-28
---

# Phase 1 Research — Web Server Foundation

## Questions Investigated

1. How to integrate Express.js into the existing ESM + tsup CLI codebase?
2. How to handle tsup bundling with Express + better-sqlite3 (native modules)?
3. How to find an available port dynamically?
4. How to launch the user's browser automatically from CLI?
5. How to serve React build output as static files from Express?
6. How to handle graceful shutdown of the Express server?

## Findings

### 1. Express.js + ESM Compatibility

The project already uses `"type": "module"` and ESM throughout. Express.js works fine with ESM imports via `import express from 'express'`. No compatibility issues expected — same pattern as the existing `better-sqlite3` import.

**Recommendation:** Standard `import express from 'express'` — no special handling needed.

### 2. tsup Build Strategy

Native modules (`better-sqlite3`) and large Node.js frameworks (`express`) must be **externalized** in tsup — they cannot be bundled into a single JS file.

Current `tsup.config.ts` bundles everything into one `dist/index.js`. Two options:

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Single entry, externalize express | Simple config change | CLI binary now needs `node_modules` at runtime |
| B | Separate entry for server | Clean separation | More complex build config |

**Recommendation:** Option A — add `express` to `external` in tsup config. The project already requires `node_modules` at runtime (for `better-sqlite3`), so externalizing `express` is consistent. Tsup config change:

```ts
external: ['better-sqlite3', 'express']
```

> **Note:** `better-sqlite3` should already be externalized (it's a native module). Verify and fix if missing.

### 3. Port Discovery

| Library | Last Updated | Weekly Downloads | Key Feature |
|---------|-------------|-----------------|-------------|
| `detect-port` | Dec 2024 | High (used by CRA, Storybook) | Checks multiple interfaces, TS support |
| `get-port` | Mar 2024 | Unclear | Race condition mitigation |
| `net.createServer` (built-in) | N/A | N/A | Zero dependencies, listen on port 0 |

**Recommendation:** Use Node.js built-in `net.createServer({ port: 0 })` approach. Zero dependencies, perfectly reliable for local-only use. Wrap in a simple utility function:

```ts
function getAvailablePort(preferred = 4000): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(preferred, () => {
      resolve(preferred);
      server.close();
    });
    server.on('error', () => {
      // Preferred port busy, let OS pick
      server.listen(0, () => {
        const addr = server.address();
        resolve(typeof addr === 'object' ? addr!.port : 0);
        server.close();
      });
    });
  });
}
```

### 4. Browser Launch

Node.js `child_process.exec` with platform-specific commands:

| Platform | Command |
|----------|---------|
| macOS | `open <url>` |
| Linux | `xdg-open <url>` |
| Windows | `start <url>` |

**Recommendation:** Simple utility function using `process.platform` switch. No external dependency needed:

```ts
import { exec } from 'child_process';

function openBrowser(url: string): void {
  const cmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start'
    : 'xdg-open';
  exec(`${cmd} ${url}`);
}
```

### 5. Serving React Build Output

React (Vite) produces a `dist/` folder with `index.html` + static assets. Express serves these via `express.static()`:

```ts
app.use(express.static(path.join(__dirname, 'dashboard')));
// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});
```

**Key decisions:**
- React app will live in a `dashboard/` subdirectory within the project
- Build output will be copied/embedded into `dist/dashboard/` during the CLI build
- API routes mounted at `/api/*`, static files served from root

**Recommendation:** Add a build script that:
1. Builds the React app (`cd dashboard && npm run build`)
2. Copies `dashboard/dist/*` → `dist/dashboard/`
3. CLI build includes serving from `dist/dashboard/`

### 6. Graceful Shutdown

The Express server needs to shut down cleanly when:
- User presses Ctrl+C in terminal
- CLI process exits

**Recommendation:** Listen for `SIGINT` and `SIGTERM`, close the HTTP server, then close the SQLite connection:

```ts
const server = app.listen(port);

process.on('SIGINT', () => {
  console.log('\nShutting down dashboard...');
  server.close(() => {
    db.close();
    process.exit(0);
  });
});
```

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Express externalization | Externalize in tsup | Already need node_modules for better-sqlite3 |
| Port discovery | Built-in `net` module | Zero deps, reliable for local use |
| Browser launch | Built-in `child_process` | Zero deps, simple cross-platform |
| Static file location | `dist/dashboard/` | Clean separation from CLI bundle |
| API prefix | `/api/*` | Standard REST convention, avoids SPA route conflicts |
| Default port | 4000 | Avoids conflict with common dev ports (3000, 5173, 8080) |

## Patterns to Follow

- Keep server code in `src/server/` directory, separate from CLI code
- Reuse existing core logic (`src/core/*`) in API route handlers — no duplicate DB logic
- Express app factory pattern (`createApp(db)`) for testability
- Commander subcommand pattern: `registerDashboardCommand(program)` consistent with existing commands

## Anti-Patterns to Avoid

- **Don't duplicate core logic in API handlers**: Route handlers should call `src/core/*` functions, not write SQL directly
- **Don't bundle Express into the CLI binary**: Keep it external, the binary already depends on `node_modules`
- **Don't hardcode port**: Always try preferred port, fallback to available
- **Don't block CLI on server**: The `pm dashboard` command should start server and open browser, then keep process alive until Ctrl+C

## Dependencies Identified

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.21 | HTTP server framework |
| @types/express | ^5.0 | TypeScript types (devDep) |

> No additional dependencies needed — port finding and browser launch use Node.js built-ins.

## Risks

- **Bundle size**: Express adds ~2MB to `node_modules` — acceptable for a local CLI tool
- **Port conflicts**: Mitigated by fallback to OS-assigned port + clear console output showing URL
- **React build integration**: Build pipeline complexity — mitigated by keeping dashboard as a separate Vite project with a simple copy step

## Ready for Planning

- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
- [x] Build strategy defined
- [x] No blockers found
