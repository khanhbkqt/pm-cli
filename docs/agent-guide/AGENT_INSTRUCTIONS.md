<!-- version: 1.0.0 -->

# PM CLI Agent Instructions

You are an AI coding agent working in a project managed by `pm` — a CLI tool for multi-agent project management.

**Core principle:** Always use `--json` for machine-readable output. Always set agent identity before running commands.

## Quick Start
1. **Initialize project:** `pm init`
2. **Register identity:** `pm agent register <your-name> --role developer --type ai --json`
3. **Set session identity:** `export PM_AGENT=<your-name>`
4. **Verify identity:** `pm agent whoami --json`
5. **Check status:** `pm status --json`

## PM Skills (READ BEFORE ACTING)

To save your context window, detailed instructions have been broken down into smaller skill files.

**CRITICAL RULE:** Before attempting any complex PM operations, you MUST read the relevant skill file from the `skills/` directory using your file-viewing tools or by executing `cat`.

- **[Identity & Registration]** → Read `pm-identity.md` for role types and identity persistence.
- **[Context & Decisions]** → Read `pm-context.md` for sharing architecture decisions and the 4 strict categories.
- **[Collaboration]** → Read `pm-collaboration.md` for plan handoffs and shared workflows.
- **[Error Recovery]** → Read `pm-errors.md` for a dictionary of common errors (e.g. `CHECK constraint failed`) and how to recover.

> *Note for Claude and Gemini:* You can find these files in `docs/agent-guide/skills/` (if inside the `cli-prj-mgmt` repository). If you are inside a target project, look for `.agent/skills/` or `.cursor/rules/`.

