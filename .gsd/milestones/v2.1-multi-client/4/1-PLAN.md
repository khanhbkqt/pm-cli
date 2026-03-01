---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: OpenCode Adapter & `pm install` CLI Command

## Objective
Create the OpenCode adapter and add the `pm install <client>` CLI command that ties everything together.

## Context
- src/core/install/types.ts — ClientAdapter interface
- src/core/install/registry.ts — adapter registry
- src/core/install/detect.ts — client detection
- src/cli/commands/init.ts — command registration pattern
- src/index.ts — CLI entry point

## Tasks

<task type="auto">
  <name>Implement OpenCode adapter</name>
  <files>src/core/install/adapters/opencode.ts</files>
  <action>
    Create `src/core/install/adapters/opencode.ts` implementing `ClientAdapter`:

    1. `detect(projectRoot)`:
       - Check for `opencode.json` → high confidence
       - Check for `AGENTS.md` without `opencode.json` → low confidence

    2. `generate(projectRoot, templatePath)`:
       - Create or update `AGENTS.md` with PM CLI section (same pattern as Codex adapter)
       - Create or update `opencode.json`:
         - If exists, parse and add/update `"instructions"` field pointing to AGENTS.md
         - If not exists, create minimal config: `{ "instructions": "See AGENTS.md" }`
       - Return list of created/modified files

    3. `clean(projectRoot)`:
       - Remove PM section from `AGENTS.md`
       - Remove `instructions` field from `opencode.json` (preserve other config)

    Register with `registerAdapter(ClientType.OpenCode, () => new OpenCodeAdapter())`
  </action>
  <verify>npx tsc --noEmit src/core/install/adapters/opencode.ts</verify>
  <done>Adapter compiles, generates both AGENTS.md and opencode.json</done>
</task>

<task type="auto">
  <name>Create `pm install` CLI command</name>
  <files>src/cli/commands/install.ts, src/core/install/index.ts</files>
  <action>
    1. Create `src/cli/commands/install.ts`:
       - `registerInstallCommand(program: Command): void`
       - Subcommands:
         - `pm install <client>` — install config for specific client
           - Validate client name against ClientType enum
           - Get adapter from registry
           - Load canonical template
           - Run adapter.generate()
           - Print created files list
         - `pm install --all` — install for all detected clients
           - Run detectClients()
           - For each detected, run adapter.generate()
           - Print summary
         - `pm install --detect` — list detected clients (no changes)
           - Run detectClients()
           - Print detection results

       - Support `--json` output flag (consistent with other commands)
       - Support `--force` flag to overwrite existing files without section merging

    2. Update `src/index.ts`:
       - Import and register `registerInstallCommand`

    3. Update `src/core/install/index.ts`:
       - Import all 5 adapters to trigger registration
       - Export `installForClient()` and `installForAll()` orchestration functions
  </action>
  <verify>npx tsc --noEmit src/cli/commands/install.ts && npx tsc --noEmit src/index.ts</verify>
  <done>install command compiles, registered in CLI entry point, supports --all and --detect flags</done>
</task>

## Success Criteria
- [ ] OpenCode adapter generates both `AGENTS.md` and `opencode.json`
- [ ] `pm install antigravity` works end-to-end
- [ ] `pm install --all` detects and installs all present clients
- [ ] `pm install --detect` lists detected clients with confidence levels
- [ ] `--json` output supported for all install subcommands
- [ ] `--force` flag overrides existing files
