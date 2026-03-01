---
phase: 6
plan: 2
wave: 1
title: Fix Flaky CLI Test Timeouts
---

# Plan 6.2: Fix Flaky CLI Test Timeouts

## Goal
Fix timeout-related failures in CLI integration tests (`agent-cli.test.ts`, `phase-cli.test.ts`, `progress-cli.test.ts`) by increasing test timeouts for subprocess-heavy tests.

## Tasks

<task id="1" name="Increase timeouts in agent-cli.test.ts">
- Add `{ timeout: 30000 }` to each `it()` call in agent-cli.test.ts OR increase the `describe` block timeout

<verify>
```bash
npx vitest run tests/agent-cli.test.ts
```
</verify>
</task>

<task id="2" name="Increase timeouts in phase-cli.test.ts">
- Add `{ timeout: 30000 }` to each `it()` call in phase-cli.test.ts OR increase the `describe` block timeout

<verify>
```bash
npx vitest run tests/phase-cli.test.ts
```
</verify>
</task>

<task id="3" name="Increase timeouts in all CLI tests">
- Audit remaining *-cli.test.ts files for low timeouts
- Ensure all CLI subprocess tests have at least 30s timeout

<verify>
```bash
npx vitest run tests/*-cli.test.ts
```
</verify>
</task>
