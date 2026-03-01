---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Client Detection & Adapter Interface

## Objective
Create the client detection module and adapter interface that all per-client adapters will implement. This is the foundation for the entire multi-client system.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md (v2.1-multi-client section)
- src/index.ts — CLI entry point pattern
- src/cli/commands/init.ts — command registration pattern
- docs/agent-guide/AGENT_INSTRUCTIONS.md — canonical template to generate from

## Tasks

<task type="auto">
  <name>Create adapter interface and types</name>
  <files>src/core/install/types.ts</files>
  <action>
    Create `src/core/install/types.ts` with:

    1. `ClientType` enum: `antigravity`, `claude-code`, `cursor`, `codex`, `opencode`
    2. `ClientConfig` interface:
       - `type: ClientType`
       - `name: string` (display name)
       - `configPaths: string[]` (relative paths the client uses)
       - `configFormat: string` (e.g. "markdown+yaml-frontmatter", "markdown", "json+markdown")
    3. `ClientAdapter` interface:
       - `detect(projectRoot: string): boolean` — returns true if client is present
       - `generate(projectRoot: string, templatePath: string): GenerateResult` — generates config files
       - `clean(projectRoot: string): CleanResult` — removes generated files
       - `getConfig(): ClientConfig`
    4. `GenerateResult` interface: `{ files: string[], warnings: string[] }`
    5. `CleanResult` interface: `{ removed: string[], skipped: string[] }`
    6. `DetectionResult` interface: `{ client: ClientType, confidence: 'high' | 'medium' | 'low', reason: string }`

    Keep types minimal — no implementation logic here.
  </action>
  <verify>npx tsc --noEmit src/core/install/types.ts</verify>
  <done>types.ts compiles with no errors, all interfaces exported</done>
</task>

<task type="auto">
  <name>Create client detection module</name>
  <files>src/core/install/detect.ts</files>
  <action>
    Create `src/core/install/detect.ts` with:

    1. `detectClients(projectRoot: string): DetectionResult[]`
       - Check for each client's signature files/directories:
         - **Antigravity**: `.agent/` dir OR `.gemini/` dir → high confidence
         - **Claude Code**: `CLAUDE.md` file → high; `.claude/` dir → medium
         - **Cursor**: `.cursor/` dir → high; `.cursorignore` → medium
         - **Codex**: `AGENTS.md` file → medium (shared with OpenCode)
         - **OpenCode**: `opencode.json` → high; `AGENTS.md` + no `opencode.json` → low
       - Use `fs.existsSync()` for detection — simple and fast
       - Return sorted by confidence (high first)
    2. `detectClient(projectRoot: string, client: ClientType): DetectionResult | null`
       - Single-client version for targeted checks

    Do NOT import any adapter implementations — detection is standalone.
  </action>
  <verify>npx tsc --noEmit src/core/install/detect.ts</verify>
  <done>detect.ts compiles, exports detectClients() and detectClient()</done>
</task>

<task type="auto">
  <name>Create adapter registry and template loader</name>
  <files>src/core/install/registry.ts, src/core/install/template.ts</files>
  <action>
    1. Create `src/core/install/registry.ts`:
       - `adapterRegistry: Map<ClientType, () => ClientAdapter>` — lazy factory map
       - `registerAdapter(type: ClientType, factory: () => ClientAdapter): void`
       - `getAdapter(type: ClientType): ClientAdapter`
       - `getAllAdapters(): ClientAdapter[]`
       - Start with empty registry — adapters register themselves in Phase 2-4

    2. Create `src/core/install/template.ts`:
       - `loadCanonicalTemplate(projectRoot: string): string`
         - Read `docs/agent-guide/AGENT_INSTRUCTIONS.md` from the npm package location
         - Fallback: read from `__dirname + '/../../docs/agent-guide/AGENT_INSTRUCTIONS.md'`
       - `getTemplatePath(): string` — resolve template absolute path
       - Template is read as raw string, adapters transform it

    Export from `src/core/install/index.ts` barrel file.
  </action>
  <verify>npx tsc --noEmit src/core/install/index.ts</verify>
  <done>registry.ts and template.ts compile, barrel exports all public APIs</done>
</task>

## Success Criteria
- [ ] All types defined and compile cleanly
- [ ] Detection logic identifies all 5 clients by filesystem markers
- [ ] Adapter registry supports lazy registration
- [ ] Template loader resolves canonical AGENT_INSTRUCTIONS.md path
- [ ] No runtime dependencies added (fs only)
