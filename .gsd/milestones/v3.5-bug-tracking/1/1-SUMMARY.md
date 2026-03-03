---
phase: 1
plan: 1
wave: 1
status: completed
---

# Plan 1.1 Summary: Bug Schema & Migration

## Changes
- `src/db/schema.ts`: Added `bugs` table (13 columns), bumped SCHEMA_VERSION to 3
- `src/db/types.ts`: Added `Bug` interface with typed priority/status unions
- `src/db/connection.ts`: Added v2→v3 migration (runs SCHEMA_SQL with IF NOT EXISTS)
- `src/db/index.ts`: Exported `Bug` type

## Verification
- `npx tsc --noEmit` — clean
- `npx vitest run tests/migration.test.ts` — 3/3 pass (updated expectations for version 3)
