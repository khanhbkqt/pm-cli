# Plan 2.1 Summary: Core Bug Functions

## Objective
Create `src/core/bug.ts` with 6 core domain functions for bug CRUD operations.

## Changes
- Created `src/core/bug.ts` with exported functions:
  - `reportBug` — INSERT + template write to `.pm/bugs/<id>.md`
  - `listBugs` — SELECT with priority/status/blocking/milestone filters, priority-sorted
  - `getBugById` — SELECT single bug
  - `getBugContent` — Read filesystem content via `readBugContent`
  - `updateBug` — UPDATE fields, sets `resolved_at` on resolve/close
  - `getBlockingBugs` — SELECT active blocking bugs, optionally scoped

## Verification
- `npx tsc --noEmit` — passes clean (0 errors)

## Commit
`feat(phase-2): implement core bug domain functions`
