---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Express Dependencies & Build Config

## Objective
Install Express.js as a dependency and update the tsup build configuration to externalize Express and better-sqlite3. This ensures the CLI binary can use Express at runtime without bundling issues.

## Context
- .gsd/SPEC.md
- .gsd/phases/1-dashboard/RESEARCH.md
- package.json
- tsup.config.ts

## Tasks

<task type="auto">
  <name>Install Express dependency</name>
  <files>package.json</files>
  <action>
    Run `npm install express` to add Express as a production dependency.
    Run `npm install --save-dev @types/express` to add TypeScript types.
    
    - Do NOT install any port-finding or browser-opening libraries — we use Node.js built-ins per research decision.
  </action>
  <verify>
    grep '"express"' package.json && grep '"@types/express"' package.json
  </verify>
  <done>Express and @types/express appear in package.json dependencies/devDependencies</done>
</task>

<task type="auto">
  <name>Update tsup externals</name>
  <files>tsup.config.ts</files>
  <action>
    Add `external: ['better-sqlite3', 'express']` to tsup.config.ts.
    
    Both are needed because:
    - `better-sqlite3` is a native module (cannot be bundled)
    - `express` is a large Node.js framework that should remain in node_modules
    
    Do NOT change any other tsup settings (entry, format, target, clean, shims, banner).
  </action>
  <verify>
    npx tsup && node -e "import('file://' + process.cwd() + '/dist/index.js').catch(() => {})" 2>&1 | head -5
  </verify>
  <done>tsup builds successfully with external config; `dist/index.js` does not contain Express source code</done>
</task>

## Success Criteria
- [ ] `express` in package.json dependencies
- [ ] `@types/express` in package.json devDependencies
- [ ] `tsup.config.ts` has `external: ['better-sqlite3', 'express']`
- [ ] `npm run build` succeeds
