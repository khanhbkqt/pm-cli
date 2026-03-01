# Plan 6.2 Summary: Update ARCHITECTURE.md with Workflow Engine

## What Was Done

- Added 5 new CLI command entries: `milestone.ts`, `phase.ts`, `plan.ts`, `progress.ts`, `install.ts`
- Added 5 new core module entries: `milestone.ts`, `phase.ts`, `plan.ts`, `workflow.ts`, `install/`
- Added new **Install Layer** section documenting all 6 client adapters and supporting files
- Added workflow transition data-flow example
- Added 2 new Key Design Decisions: GSD workflow engine and multi-client install adapters
- Updated Key Files Reference with 8 new entries

## Verification

```
grep -c "milestone|workflow|install" docs/ARCHITECTURE.md
28
```
(≥ 10 required)

## Commit

`docs(phase-6): update ARCHITECTURE.md with workflow engine and install system`
