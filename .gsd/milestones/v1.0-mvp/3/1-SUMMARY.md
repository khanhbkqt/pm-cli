## Plan 3.1 Summary: Task CRUD Core Logic + Formatters

**Status:** ✅ Complete

### What was done
- Created `src/core/task.ts` with 7 functions: `addTask`, `listTasks`, `getTaskById`, `updateTask`, `assignTask`, `addComment`, `getComments`
- Extended `src/output/formatter.ts` with 4 functions: `formatTask`, `formatTaskList`, `formatComment`, `formatCommentList`

### Key decisions
- Foreign key validation in core layer (agent exists, task exists)
- Dynamic WHERE/SET clause building for filters and updates
- No status transition validation per DECISION-004
