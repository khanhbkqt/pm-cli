---
phase: 9
plan: fix-stale-todos
wave: 1
gap_closure: true
---

# Fix: Stale MVP items in TODO.md

## Problem
The `TODO.md` file contains two lingering "Research" items from the initial v1.0 MVP phase (2026-02-28: "Research CLI framework options", "Verify pm CLI name").

## Root Cause
These items were resolved via architecture decisions logging in `DECISIONS.md` but not cleaned up from the `TODO.md` tracking list.

## Tasks

<task type="auto">
  <name>Clean up TODO.md</name>
  <files>.gsd/TODO.md</files>
  <action>Remove the 2026-02-28 MVP items ("Verify pm CLI name doesn't conflict" and "Research CLI framework options") from the file.</action>
  <verify>cat .gsd/TODO.md | grep -v "2026-02-28"</verify>
  <done>TODO.md is cleared of stale items.</done>
</task>
