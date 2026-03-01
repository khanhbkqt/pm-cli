---
phase: 2
level: 0
researched_at: 2026-03-01
---

# Phase 2 Research — Milestone & Phase CLI

## Questions Investigated

1. What existing CLI patterns should the milestone/phase commands follow?
2. What core functions already exist from Phase 1?
3. What output formatting is needed?
4. How are CLI commands tested?

## Findings

### Q1: CLI Command Pattern

All CLI commands follow a consistent pattern in `src/cli/commands/`:

```typescript
export function registerXxxCommands(program: Command): void {
    const xxx = program.command('xxx').description('...');
    xxx.command('subcommand <arg>').option('--opt').action(async (...) => {
        try {
            const db = getProjectDb();
            const me = resolveIdentity(db, { agent: program.opts().agent });
            // call core functions
            // format output (json or human)
            db.close();
        } catch (error) { ... process.exit(1); }
    });
}
```

Entry point `src/index.ts` imports and calls `registerXxxCommands(program)`.

**Recommendation:** Follow identical pattern for `milestone.ts` and `phase.ts` CLI commands.

### Q2: Core Functions Available (from Phase 1)

**`src/core/milestone.ts`** — 5 exported functions:
- `createMilestone(db, { id, name, goal?, created_by })` → Milestone
- `listMilestones(db, { status? })` → Milestone[]
- `getMilestoneById(db, id)` → Milestone | undefined
- `updateMilestone(db, id, { name?, goal?, status? })` → Milestone
- `getActiveMilestone(db)` → Milestone | undefined

**`src/core/phase.ts`** — 5 exported functions:
- `addPhase(db, { milestone_id, number, name, description? })` → Phase
- `listPhases(db, milestone_id, { status? })` → Phase[]
- `getPhaseById(db, id)` → Phase | undefined
- `updatePhase(db, id, { name?, description?, status? })` → Phase
- `getPhaseByNumber(db, milestone_id, number)` → Phase | undefined

**No new core logic needed** — Phase 2 is purely CLI wiring + formatters.

### Q3: Output Formatting

`src/output/formatter.ts` provides:
- `formatTable(headers, rows)` — ASCII table with auto-width columns
- Per-entity formatters: `formatAgent`, `formatAgentList`, `formatTask`, `formatTaskList`, `formatComment`, `formatCommentList`, `formatContext`, `formatContextList`

**Needed:** Add `formatMilestone`, `formatMilestoneList`, `formatPhase`, `formatPhaseList` following the same pattern. Import `Milestone` and `Phase` types.

### Q4: Testing Pattern

**Unit tests** (`tests/milestone.test.ts`, `tests/phase.test.ts`):
- Already exist for core functions — 23 total tests
- Use temp DB, `beforeEach`/`afterEach` lifecycle

**CLI integration tests** (`tests/task-cli.test.ts`):
- Use `execSync` with `npx tsx src/index.ts`
- `run()` and `runExpectFail()` helper functions
- Init project + register agent in `beforeEach`

**Needed:** Create `milestone-cli.test.ts` and `phase-cli.test.ts` following the `task-cli.test.ts` pattern.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CLI structure | `pm milestone create/list/show/update` + `pm phase add/list/show/update` | Matches SPEC requirements exactly |
| Agent identity | Required for create/update, optional for list/show | Consistent with task commands |
| Phase milestone ref | Use `--milestone <id>` flag (required for phase commands) | Phases always belong to a milestone |
| Active milestone shortcut | Default to active milestone if `--milestone` not provided | UX convenience for common workflow |
| Output format | Add formatters to existing `formatter.ts` | Maintains single formatter module |

## Patterns to Follow

- Commander.js subcommand groups (`program.command('milestone')`)
- `getProjectDb()` + `resolveIdentity()` for DB/identity
- JSON output via `program.opts().json`
- Try/catch with `process.exit(1)` error handling
- `db.close()` before exit

## Anti-Patterns to Avoid

- Don't create separate formatter files — add to existing `formatter.ts`
- Don't skip identity enforcement on mutating commands
- Don't hardcode milestone IDs — always resolve from active or flag

## Dependencies Identified

No new dependencies. All libraries already in use:
- `commander` — CLI framework
- `better-sqlite3` — DB access
- `vitest` — test framework

## Risks

- Phase commands need milestone context → mitigated by `--milestone` flag with active milestone fallback
- Many CLI subcommands → mitigated by following exact existing pattern, 2-3 tasks max

## Ready for Planning

- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
