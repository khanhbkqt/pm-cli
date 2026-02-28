---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: TypeScript Project Scaffolding

## Objective
Bootstrap the Node.js/TypeScript project with build pipeline, dev tooling, and domain-layered directory structure. This is the foundation everything else builds on.

## Context
- .gsd/SPEC.md — Tech stack: Node.js/TypeScript
- .gsd/DECISIONS.md — DECISION-007 (domain-layered), DECISION-009 (tsup+tsx), DECISION-010 (CLI name `pm`), DECISION-011 (vitest)
- docs/design/final-design.md — Project structure

## Tasks

<task type="auto">
  <name>Initialize npm project and install dependencies</name>
  <files>package.json, tsconfig.json, .gitignore</files>
  <action>
    1. Run `npm init -y` in project root
    2. Edit package.json:
       - name: "@pm-cli/pm"
       - version: "0.1.0"
       - type: "module"
       - bin: { "pm": "./dist/index.js" }
       - scripts:
         - "dev": "tsx watch src/index.ts"
         - "build": "tsup"
         - "test": "vitest run"
         - "test:watch": "vitest"
    3. Install dev dependencies:
       `npm install -D typescript tsup tsx vitest @types/node @types/better-sqlite3`
    4. Install production dependencies:
       `npm install commander better-sqlite3 yaml`
    5. Create tsconfig.json:
       - target: "ES2022"
       - module: "ESNext"
       - moduleResolution: "bundler"
       - outDir: "./dist"
       - rootDir: "./src"
       - strict: true
       - esModuleInterop: true
       - declaration: true
    6. Create tsup.config.ts:
       - entry: ["src/index.ts"]
       - format: ["esm"]
       - target: "node18"
       - clean: true
       - shims: true
       - banner with #!/usr/bin/env node
    7. Update .gitignore: add node_modules/, dist/, .pm/
  </action>
  <verify>
    npm run build 2>&1 | tail -5
    # Should complete without errors (may warn about empty entry)
  </verify>
  <done>package.json exists with correct scripts, tsconfig.json compiles, tsup builds without fatal errors</done>
</task>

<task type="auto">
  <name>Create domain-layered directory structure</name>
  <files>src/index.ts, src/cli/, src/core/, src/db/, src/output/</files>
  <action>
    1. Create directory structure:
       ```
       src/
       ├── index.ts          # Entry point — imports and runs CLI
       ├── cli/              # Command definitions (Commander.js)
       │   └── .gitkeep
       ├── core/             # Domain logic (init, agents, tasks, context)
       │   └── .gitkeep
       ├── db/               # Database layer (schema, queries, connection)
       │   └── .gitkeep
       └── output/           # Formatters (human-readable, JSON)
           └── .gitkeep
       ```
    2. Create src/index.ts with minimal content:
       ```typescript
       #!/usr/bin/env node
       console.log('pm-cli v0.1.0');
       ```
    3. Ensure `npm run build` produces dist/index.js
    4. Ensure `node dist/index.js` prints version

    **Avoid**: Don't add any real CLI logic yet — that's Plan 1.3.
  </action>
  <verify>
    npm run build && node dist/index.js
    # Should output: pm-cli v0.1.0
  </verify>
  <done>Domain directories exist, build outputs dist/index.js, running it prints version string</done>
</task>

## Success Criteria
- [ ] `npm run build` completes successfully
- [ ] `node dist/index.js` runs and prints version
- [ ] `npm run dev` starts tsx watch mode
- [ ] Directory structure matches domain-layered pattern (cli/, core/, db/, output/)
- [ ] All dependencies installed (commander, better-sqlite3, yaml, vitest, tsup, tsx)
