---
phase: 8
level: 2
researched_at: 2026-03-01
---

# Phase 8 Research — Install System: Multi-file Workflows

## Questions Investigated

1. What does the current install system do and what needs to change?
2. How should multiple workflow files be registered and deployed?
3. What are the per-client path conventions for each supported client?
4. How should the template loading system be generalized?
5. How does `pm uninstall` need to change?
6. What are backward compatibility concerns?

## Findings

### Q1: Current Install System

Current flow (`pm install <client>`):
```
src/core/install/template.ts   → loadCanonicalTemplate()  → reads AGENT_INSTRUCTIONS.md (single file)
src/core/install/registry.ts   → getAdapter(clientType)
src/core/install/adapters/*.ts → adapter.generate()       → writes 1-2 files per client
src/cli/commands/install.ts    → orchestrates the above
```

**Current output per client:**
| Client | Files Installed |
|--------|----------------|
| Antigravity | `.agent/workflows/pm-guide.md` + `.agent/rules/pm-cli.md` |
| Claude Code | `.claude/commands/pm-guide.md` |
| Cursor | `.cursor/rules/pm-guide.mdc` |
| Codex | `AGENTS.md` (appended) |
| OpenCode | `.opencode/instructions/pm-guide.md` |
| Gemini CLI | `GEMINI.md` (appended) |

**What needs to change:** Each adapter currently reads a single `AGENT_INSTRUCTIONS.md` template. Phase 8 must extend it to also deploy the 15 workflow markdown files from Phase 7.

### Q2: Multi-file Registration Design

**Option A: Template loader returns file list**
- `loadWorkflowTemplates()` returns `Map<string, string>` (filename → content)
- Adapters iterate the map and write each file to the client-appropriate directory

**Option B: Adapter receives workflow directory path**
- Adapters copy all files from `docs/agent-guide/workflows/pm-*.md` into the target dir
- Simpler for adapters, but couples them to source directory structure

**Option C: Adapter-specific workflow selection**
- Each adapter declares which files it wants
- More flexible but more code per adapter

**Recommendation: Option A** — `loadWorkflowTemplates()` returns the full set, adapters write all of them. Clean separation: template system knows files, adapters know paths.

New function in `template.ts`:
```typescript
export function loadWorkflowTemplates(projectRoot?: string): Map<string, string> {
    // Returns Map<filename, content> for all pm-*.md files in workflows/
    // e.g., { 'pm-plan-phase.md' => '---\ndescription: ...\n...' }
}
```

### Q3: Per-Client Path Conventions

Each client has a specific directory where workflow/instruction files should go:

| Client | Workflow Directory | Format | Frontmatter Required |
|--------|-------------------|--------|---------------------|
| **Antigravity** | `.agent/workflows/` | `.md` | `description:` |
| **Claude Code** | `.claude/commands/` | `.md` | `name:`, `description:` |
| **Cursor** | `.cursor/rules/` | `.mdc` | `description:`, `globs:`, `alwaysApply:` |
| **Codex** | `AGENTS.md` (single file) | Appended section | — |
| **OpenCode** | `.opencode/instructions/` | `.md` | none required |
| **Gemini CLI** | `GEMINI.md` (single file) | Appended section | — |

**Note for single-file clients (Codex, Gemini CLI):** These append content to a single file. For workflow files, they should append a workflows index section rather than all 15 files inline. The index lists workflow names and their objectives — agents can load specifics on demand.

### Q4: Template Loading Generalization

Current `template.ts` lookup order:
1. `{projectRoot}/docs/agent-guide/AGENT_INSTRUCTIONS.md`
2. `{packageRoot}/docs/agent-guide/AGENT_INSTRUCTIONS.md`

Same pattern for workflow directory:
1. `{projectRoot}/docs/agent-guide/workflows/pm-*.md`
2. `{packageRoot}/docs/agent-guide/workflows/pm-*.md`

New `template.ts` exports:
```typescript
// Existing (unchanged)
export function loadCanonicalTemplate(projectRoot?: string): string

// New
export function loadWorkflowTemplates(projectRoot?: string): Map<string, string>
export function getWorkflowsDir(projectRoot?: string): string
```

### Q5: Uninstall Changes

`clean()` in each adapter currently removes 1-2 hardcoded paths. 

With multi-file, adapters need to track and remove all workflow files. Two approaches:

**Track by pattern:** Remove all `pm-*.md` files from the workflow directory. Simple, no state needed.

**Track by manifest:** Write a `.pm-install-manifest.json` at install time listing all installed files. Safer for clients that might have other files in the same directory.

**Recommendation: Pattern-based** for directory clients (delete `pm-*.md` from target dir), **section-based** for single-file clients (remove the pm-cli section from `AGENTS.md` / `GEMINI.md`).

### Q6: Backward Compatibility

- The current `pm-guide.md` single file should continue to be installed alongside the workflow files for backward compatibility. Agents with older instructions will still find it.
- No changes to `types.ts` `ClientAdapter` interface needed if adapters consume `loadWorkflowTemplates()` internally — the `generate()` signature stays the same.
- `GenerateResult.files` already handles multiple paths — no type change needed.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multi-file loading | `loadWorkflowTemplates()` returns `Map<filename, content>` | Clean separation of concerns |
| Per-client directory | Each adapter writes to its own native workflow dir | Client convention compliance |
| Single-file clients | Append workflow index section | Avoid bloating AGENTS.md / GEMINI.md |
| Uninstall | Pattern-based (`pm-*.md` deletion) | Simple, no manifest state needed |
| Backward compat | Keep `pm-guide.md` alongside new workflow files | Graceful upgrade for existing installs |
| ClientAdapter interface | No changes | `generate()` return type already supports multiple files |

## Patterns to Follow

- Existing adapter pattern in all 6 `adapters/*.ts` files
- `loadCanonicalTemplate()` pattern for the new `loadWorkflowTemplates()` function
- `mkdirSync({ recursive: true })` before writing files
- `warnings.push()` when overwriting existing files

## Anti-Patterns to Avoid

- Don't change `ClientAdapter` interface signature — avoid breaking adapter contract
- Don't hardcode workflow filenames in adapters — read from `loadWorkflowTemplates()`
- Don't remove the existing `pm-guide.md` install (backward compat)
- Don't write all 15 workflow files inline into `AGENTS.md`/`GEMINI.md`

## Files to Modify

| File | Change |
|------|--------|
| `src/core/install/template.ts` | Add `loadWorkflowTemplates()`, `getWorkflowsDir()` |
| `src/core/install/adapters/antigravity.ts` | Write workflow files to `.agent/workflows/` |
| `src/core/install/adapters/claude-code.ts` | Write workflow files to `.claude/commands/` |
| `src/core/install/adapters/cursor.ts` | Write workflow files (as `.mdc`) to `.cursor/rules/` |
| `src/core/install/adapters/opencode.ts` | Write workflow files to `.opencode/instructions/` |
| `src/core/install/adapters/codex.ts` | Append workflow index section to `AGENTS.md` |
| `src/core/install/adapters/gemini-cli.ts` | Append workflow index section to `GEMINI.md` |

## Dependencies Identified

No new npm packages. Depends on:
- Phase 7 complete (workflow files must exist before adapters can deploy them)
- `fs.readdirSync` / `fs.readFileSync` (already used in codebase)

## Risks

- **Cursor `.mdc` format**: Cursor rules use `.mdc` extension with specific frontmatter (`globs`, `alwaysApply`). Each workflow file needs appropriate frontmatter added. Mitigated by cursor adapter transforming the source `.md` frontmatter.
- **AGENTS.md / GEMINI.md section management**: Removing a specific section on uninstall requires pattern matching. Mitigated by using clear delimiting comments around the injected section.
- **File count**: 15+ new files per install — risk of cluttering client dirs. Mitigated by using `pm-` prefix for easy identification.

## Ready for Planning

- [x] Questions answered
- [x] Architecture decided (Option A: template loader)
- [x] Per-client paths documented
- [x] Backward compat plan confirmed
- [x] All 6 adapter files identified for modification
