---
phase: 6
plan: 1
wave: 1
title: Remove Dead TasksBoard Code & Clean Up Dashboard
---

# Plan 6.1: Remove Dead TasksBoard Code & Clean Up Dashboard

## Goal
Remove the unused TasksBoard page and its route. Clean up any stale "tasks" references in the dashboard.

## Tasks

<task id="1" name="Remove TasksBoard route and import from App.tsx">
- Remove the `import { TasksBoard }` line
- Remove the `<Route path="/tasks" ...>` line

<verify>
```bash
! grep -q "TasksBoard" dashboard/src/App.tsx
```
</verify>
</task>

<task id="2" name="Remove TasksBoard component files">
- Delete `dashboard/src/pages/TasksBoard.tsx`
- Delete `dashboard/src/pages/TasksBoard.css`

<verify>
```bash
! test -f dashboard/src/pages/TasksBoard.tsx
! test -f dashboard/src/pages/TasksBoard.css
```
</verify>
</task>

<task id="3" name="Remove Tasks nav link from Layout">
- Check Layout.tsx for any "Tasks" nav entry and remove it

<verify>
```bash
! grep -qi "tasks" dashboard/src/components/Layout.tsx
```
</verify>
</task>
