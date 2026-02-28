---
phase: 2
plan: 3
wave: 2
---

# Plan 2.3: Agent CLI Commands

## Objective
Wire agent management commands into the CLI. This connects the core agent functions (Plan 2.1) and identity system (Plan 2.2) to Commander.js commands, completing Phase 2.

## Context
- .gsd/SPEC.md — Agent commands spec
- .gsd/ROADMAP.md — Phase 2 deliverables
- src/core/agent.ts — registerAgent, listAgents, getAgentByName (Plan 2.1)
- src/core/identity.ts — resolveIdentity, findProjectRoot, getProjectDb (Plan 2.2)
- src/cli/commands/init.ts — reference pattern for command registration
- src/cli/program.ts — Commander program
- src/index.ts — command registration entrypoint
- src/output/ — output formatting (currently empty)

## Tasks

<task type="auto">
  <name>Create output formatter</name>
  <files>src/output/formatter.ts</files>
  <action>
    Create `src/output/formatter.ts` with:

    1. `formatTable(headers: string[], rows: string[][])` — Simple ASCII table
       - Column widths auto-calculated from content
       - Returns formatted string

    2. `formatAgent(agent: Agent, json: boolean)` — Format single agent for display
       - If json: return JSON.stringify(agent, null, 2)
       - If human: return formatted key-value block:
         ```
         Name: alice
         Role: developer
         Type: human
         ID:   abc123
         Since: 2026-02-28
         ```

    3. `formatAgentList(agents: Agent[], json: boolean)` — Format agent list
       - If json: return JSON.stringify(agents, null, 2)
       - If human: return formatted table with columns: Name, Role, Type, Created

    Do NOT add chalk/colors dependency — keep output plain for v1 (agents need parseable output).
  </action>
  <verify>npx tsx -e "import { formatTable, formatAgent, formatAgentList } from './src/output/formatter.js'; console.log('✓ formatter compiles')"</verify>
  <done>src/output/formatter.ts exists with 3 exported functions</done>
</task>

<task type="auto">
  <name>Create agent CLI commands and wire up</name>
  <files>src/cli/commands/agent.ts, src/index.ts</files>
  <action>
    Create `src/cli/commands/agent.ts` with:

    1. `registerAgentCommands(program: Command)` — Register `pm agent` subcommand group:
    
       a. `pm agent register <name> --role <role> --type <human|ai>`
          - Required: name (positional), --role, --type
          - Uses getProjectDb() to get database
          - Calls registerAgent() from core
          - Output: "✓ Agent '<name>' registered (id: <id>)"
          - Supports --json flag on parent command
       
       b. `pm agent list`
          - Uses getProjectDb() to get database
          - Calls listAgents()
          - Uses formatAgentList() for output
          - Supports --json flag
       
       c. `pm agent show <name>`
          - Uses getProjectDb() to get database
          - Calls getAgentByName()
          - If not found: error "Agent '<name>' not found"
          - Uses formatAgent() for output
          - Supports --json flag
       
       d. `pm agent whoami`
          - Uses resolveIdentity() to get current agent
          - Uses formatAgent() for output
          - This is the one command that USES identity to show who the caller is
          - Supports --json flag

    Add `--json` flag as a global option on the program in `src/cli/program.ts`.
    
    Update `src/index.ts` to import and call `registerAgentCommands(program)`.
    
    Error handling: wrap each action in try/catch, print error message, exit(1).
    Do NOT enforce identity on `agent register` / `agent list` / `agent show` — those are management commands.
    Only `agent whoami` uses identity (it answers "who am I?").
  </action>
  <verify>npx tsx src/index.ts agent --help</verify>
  <done>
    - `pm agent register`, `pm agent list`, `pm agent show`, `pm agent whoami` commands all work
    - `pm agent --help` shows all 4 subcommands
    - --json flag is available globally
  </done>
</task>

<task type="auto">
  <name>Create agent CLI integration tests</name>
  <files>tests/agent-cli.test.ts</files>
  <action>
    Create `tests/agent-cli.test.ts` — integration tests using child_process.execSync:
    
    Setup: temp dir, run `pm init` via tsx, then test agent commands.

    Test cases:
    1. `pm agent register alice --role developer --type human` succeeds
    2. `pm agent register` without --role/--type shows error
    3. `pm agent register alice` twice shows duplicate error
    4. `pm agent list` shows registered agents
    5. `pm agent list --json` outputs valid JSON array
    6. `pm agent show alice` shows agent details
    7. `pm agent show nonexistent` shows not found error
    8. `pm agent whoami --agent alice` shows alice's details
    9. `pm agent whoami` without --agent or PM_AGENT shows identity error

    Use execSync with { cwd: tempDir, encoding: 'utf-8' } pattern.
    Run commands via: `npx tsx {path-to-src}/index.ts agent register ...`
  </action>
  <verify>npx vitest run tests/agent-cli.test.ts</verify>
  <done>All 9 test cases pass with `npx vitest run tests/agent-cli.test.ts`</done>
</task>

## Success Criteria
- [ ] `pm agent register <name> --role <role> --type <type>` works
- [ ] `pm agent list` and `pm agent list --json` work
- [ ] `pm agent show <name>` works
- [ ] `pm agent whoami --agent <name>` works
- [ ] All 9 integration tests pass
- [ ] `--json` flag available on all commands
