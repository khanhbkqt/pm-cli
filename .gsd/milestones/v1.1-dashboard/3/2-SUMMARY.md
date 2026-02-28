## Plan 3.2 Summary: Task CLI Commands

**Status:** ✅ Complete

### What was done
- Created `src/cli/commands/task.ts` with 6 subcommands: `add`, `list`, `show`, `update`, `assign`, `comment`
- Wired into `src/index.ts` via `registerTaskCommands()`

### Key decisions
- Identity enforced on write operations (add, update, assign, comment)
- Read operations (list, show) work without identity
- Agent name → ID resolution in CLI layer for `--assigned` and `--to` options
