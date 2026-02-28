---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: CLI Framework + `pm init` Command

## Objective
Wire up Commander.js CLI framework and implement the `pm init` command that creates `.pm/` directory with `data.db` (initialized schema) and `config.yaml`.

## Context
- .gsd/SPEC.md — `pm init` creates `.pm/data.db` + `config.yaml`
- .gsd/DECISIONS.md — DECISION-006 (Commander.js), DECISION-012 (all tables upfront)
- docs/design/final-design.md — Section 4: Project Scaffolding, config.yaml structure
- src/db/ — Database module from Plan 1.2

## Tasks

<task type="auto">
  <name>Set up Commander.js CLI skeleton with init command</name>
  <files>src/index.ts, src/cli/program.ts, src/cli/commands/init.ts</files>
  <action>
    1. Create `src/cli/program.ts`:
       - Import Commander's `Command`
       - Create and export program instance
       - Set name('pm'), description('Project Management CLI for Humans & AI Agents'), version('0.1.0')

    2. Create `src/cli/commands/init.ts`:
       - Export a function `registerInitCommand(program: Command): void`
       - Register `pm init [name]` command with:
         - description: "Initialize a new PM project"
         - Optional `name` argument (defaults to current directory name)
         - Action handler that calls core init logic

    3. Create `src/core/init.ts`:
       - Export async function `initProject(name: string, targetDir: string): void`
       - Logic:
         a. Check if `.pm/` already exists → error "Project already initialized"
         b. Create `.pm/` directory
         c. Create SQLite database at `.pm/data.db` using `getDatabase()`
         d. Initialize schema (all 4 tables)
         e. Create `.pm/config.yaml` with default content:
            ```yaml
            project:
              name: <project-name>
              created_at: <ISO timestamp>
              version: 1

            settings:
              task_statuses:
                - todo
                - in_progress
                - review
                - done
                - blocked
                - cancelled
              agent_roles:
                - developer
                - reviewer
                - pm
                - researcher
            ```
         f. Print success message with project name

    4. Update `src/index.ts`:
       - Import program from cli/program.ts
       - Import and register init command
       - Call `program.parse(process.argv)`

    **Avoid**: Don't add `--agent` requirement to `pm init` — init is the one command that doesn't need agent identity (no agents exist yet).
    **Avoid**: Don't add other commands yet — those come in Phase 2+.
  </action>
  <verify>
    npm run build && cd /tmp && rm -rf pm-test-project && mkdir pm-test-project && cd pm-test-project && node /Users/khanhnguyen/Projects/cli-prj-mgmt/dist/index.js init my-project
    # Should create .pm/data.db and .pm/config.yaml
    ls -la /tmp/pm-test-project/.pm/
    cat /tmp/pm-test-project/.pm/config.yaml
  </verify>
  <done>`pm init my-project` creates .pm/ with data.db (4 tables, WAL mode) and config.yaml (default settings)</done>
</task>

<task type="auto">
  <name>Create integration test for pm init</name>
  <files>tests/init.test.ts, vitest.config.ts</files>
  <action>
    1. Create `vitest.config.ts` in project root:
       ```typescript
       import { defineConfig } from 'vitest/config';
       export default defineConfig({
         test: {
           globals: true,
         },
       });
       ```

    2. Create `tests/init.test.ts`:
       - Test: "creates .pm directory"
         - Call initProject() in a temp directory
         - Assert .pm/ directory exists
       - Test: "creates data.db with correct schema"
         - Call initProject() in temp dir
         - Open .pm/data.db with better-sqlite3
         - Query sqlite_master for tables
         - Assert all 4 tables exist: agents, tasks, task_comments, context
       - Test: "enables WAL mode"
         - Open .pm/data.db
         - Check pragma journal_mode = wal
       - Test: "creates config.yaml with project name"
         - Call initProject('my-project', tempDir)
         - Read and parse .pm/config.yaml
         - Assert project.name === 'my-project'
         - Assert settings.task_statuses contains expected values
       - Test: "errors if .pm already exists"
         - Create .pm directory manually
         - Call initProject() and expect error
       - Use beforeEach/afterEach to create and clean temp directories

    3. Run tests: `npm test`

    **Avoid**: Don't mock the database — use real SQLite for integration tests.
    **Avoid**: Don't test CLI parsing here — test core logic directly.
  </action>
  <verify>
    npm test
    # All tests should pass
  </verify>
  <done>Integration tests cover: directory creation, schema verification, WAL mode, config.yaml content, error on re-init. All passing.</done>
</task>

## Success Criteria
- [ ] `pm init my-project` creates `.pm/data.db` with 4 tables in WAL mode
- [ ] `pm init my-project` creates `.pm/config.yaml` with correct default content
- [ ] `pm init` errors gracefully if `.pm/` already exists
- [ ] `pm --help` shows available commands
- [ ] `npm test` passes all integration tests
- [ ] `npm run build` produces working dist/index.js
