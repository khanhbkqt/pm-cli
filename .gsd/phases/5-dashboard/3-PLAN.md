---
phase: 5-dashboard
plan: 3
wave: 2
---

# Plan 5.3: Build Integration, Documentation & Verification

## Objective
Wire up the production build pipeline so `pm dashboard` serves the built React app, add README documentation for the dashboard feature, and visually verify the complete polished dashboard.

## Context
- dashboard/vite.config.ts — builds to `../dist/dashboard`
- src/server/app.ts — Express serves static from `__dirname/dashboard`
- package.json — root project scripts
- README.md — project documentation
- dashboard/package.json — dashboard scripts

## Tasks

<task type="auto">
  <name>Production build pipeline & npm scripts</name>
  <files>
    package.json
    dashboard/package.json
  </files>
  <action>
    1. In root `package.json`, add scripts:
       - `"build:dashboard": "cd dashboard && npm run build"` — builds the React app
       - `"build:all": "npm run build && npm run build:dashboard"` — builds CLI + dashboard
       - `"predashboard": "npm run build:dashboard"` — auto-builds before serving (if not already present)
    2. Verify `vite.config.ts` `outDir` matches what `src/server/app.ts` expects:
       - Vite outputs to `../dist/dashboard`
       - Express looks at `path.join(__dirname, 'dashboard')` — which when compiled is `dist/dashboard` ✓
    3. In dashboard `package.json`, ensure `build` script works standalone:
       - Current: `"build": "tsc -b && vite build"` — this is correct
    4. Run `npm run build:dashboard` to verify it produces output in `dist/dashboard/`
    5. Do NOT add any post-install hooks — keep it explicit
  </action>
  <verify>
    - `grep 'build:dashboard' package.json` finds the script
    - `npm run build:dashboard` exits 0
    - `test -f dist/dashboard/index.html` — build output exists
  </verify>
  <done>
    - `npm run build:dashboard` builds React app into dist/dashboard
    - `npm run build:all` builds both CLI and dashboard
    - Production `pm dashboard` serves the built React app
  </done>
</task>

<task type="auto">
  <name>README documentation for dashboard feature</name>
  <files>README.md</files>
  <action>
    1. Add a "Dashboard" section to `README.md` covering:
       - How to launch: `pm dashboard` (with `--port` option)
       - Features: project overview, task board, Kanban view, list view, filters
       - Theme: dark/light toggle
       - Development: `cd dashboard && npm run dev` with Vite proxy to backend
       - Building: `npm run build:dashboard` or `npm run build:all`
    2. Keep the section concise — this is a local-first CLI tool, not a SaaS product
    3. Maintain the existing README style and structure
  </action>
  <verify>
    - `grep -c 'dashboard\|Dashboard' README.md` returns ≥ 5
  </verify>
  <done>
    - README.md includes dashboard section with usage, features, and development instructions
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Visual verification of polished dashboard</name>
  <files>dashboard/src/**</files>
  <action>
    1. Start the dev server: `cd dashboard && npm run dev`
    2. Start the backend: `pm dashboard --port 4000` (in the initialized project)
    3. Browser verification checklist:
       a. Open http://localhost:5173 (or Vite dev URL)
       b. THEME: Click the theme toggle — verify light mode renders correctly, toggle back to dark
       c. RESPONSIVE: Resize browser to ≤768px — verify sidebar collapses, hamburger appears, kanban stacks
       d. ERROR: Stop the backend — verify error message appears with Retry button in both Overview and Tasks pages
       e. EMPTY STATE: Open with empty project (no tasks) — verify empty state illustration shows
       f. LOADING: Refresh page — verify loading spinners appear briefly
    4. All verifications should be visual — check for broken layouts, miscolored elements, and z-index issues
  </action>
  <verify>Visual inspection by human</verify>
  <done>
    - Dashboard passes visual verification in both themes and all responsive breakpoints
    - Error and empty states display correctly
  </done>
</task>

## Success Criteria
- [ ] `npm run build:dashboard` produces a working production build
- [ ] `pm dashboard` serves the built React app correctly
- [ ] README documents the dashboard feature
- [ ] Visual verification confirms theme toggle, responsive design, error/loading states all work
