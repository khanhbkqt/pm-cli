---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Canonical Template & Index

## Objective

Create the canonical template file that combines all Phase 1-3 documents into a single, structured agent instruction file — the master source that per-client adapters (v2.1) will derive from. Also create an index page.

## Context

- `docs/agent-guide/cli-reference.md` — CLI Reference (Phase 1)
- `docs/agent-guide/identity-setup.md` — Identity Setup (Phase 1)
- `docs/agent-guide/workflows/task-lifecycle.md` — Task Lifecycle (Phase 2)
- `docs/agent-guide/workflows/context-sharing.md` — Context Sharing (Phase 2)
- `docs/agent-guide/workflows/collaboration.md` — Collaboration (Phase 2)
- `docs/agent-guide/onboarding.md` — Onboarding (Phase 3)
- `docs/agent-guide/error-handling.md` — Error Handling (Phase 3)

## Tasks

<task type="auto">
  <name>Create Canonical Agent Instructions Template</name>
  <files>docs/agent-guide/AGENT_INSTRUCTIONS.md</files>
  <action>
    Create `docs/agent-guide/AGENT_INSTRUCTIONS.md` — a single, self-contained document that an AI agent can read to fully understand and use `pm` CLI. This is the CANONICAL source for v2.1 client adapters.

    Structure:
    1. **Header** — `# PM CLI Agent Instructions` with purpose statement
    2. **Quick Start** — 5-command onboarding (condensed from onboarding.md)
    3. **Identity** — Registration + PM_AGENT (key points from identity-setup.md)
    4. **Command Reference** — Complete CLI reference (from cli-reference.md)
    5. **Workflows** — Task lifecycle + context patterns (condensed from Phase 2)
    6. **Collaboration** — Multi-agent patterns (condensed from collaboration.md)
    7. **Error Recovery** — Common errors table (from error-handling.md)
    8. **Best Practices** — Top 10 rules for agents using pm

    Rules:
    - SELF-CONTAINED: No external links or references. Everything in one file.
    - CONCISE: Prefer tables over prose. Use code blocks for every command.
    - MACHINE-FIRST: Structure for easy parsing. Use consistent heading levels.
    - COMPLETE: Every command, every schema, every error.
    - Include a `<!-- version: 1.0.0 -->` comment at the top for versioning.

    Target: 400-600 lines. Comprehensive but scannable.
  </action>
  <verify>test -f docs/agent-guide/AGENT_INSTRUCTIONS.md && wc -l docs/agent-guide/AGENT_INSTRUCTIONS.md | awk '{if ($1 >= 300 && $1 <= 800) print "OK"; else print "FAIL: " $1 " lines"}'</verify>
  <done>File exists, 300-800 lines, contains all sections, fully self-contained</done>
</task>

<task type="auto">
  <name>Create Agent Guide Index</name>
  <files>docs/agent-guide/README.md</files>
  <action>
    Create `docs/agent-guide/README.md` with:

    1. **Title** — "Agent Workflow Guide"
    2. **Purpose** — What this guide is for: teaching AI coding agents to use pm CLI
    3. **Quick Link** — Link to AGENT_INSTRUCTIONS.md (the canonical all-in-one file)
    4. **Document Map** — Table of all docs with descriptions:
       - AGENT_INSTRUCTIONS.md — Canonical all-in-one reference
       - cli-reference.md — Detailed CLI command reference
       - identity-setup.md — Agent identity configuration
       - onboarding.md — First-time agent setup
       - error-handling.md — Error recovery guide
       - workflows/task-lifecycle.md — Task management workflow
       - workflows/context-sharing.md — Context sharing patterns
       - workflows/collaboration.md — Multi-agent coordination
    5. **For Client Integration** — Note that v2.1 will create per-client adapters from AGENT_INSTRUCTIONS.md
  </action>
  <verify>test -f docs/agent-guide/README.md && grep -c "AGENT_INSTRUCTIONS" docs/agent-guide/README.md | awk '{if ($1 >= 2) print "OK"; else print "FAIL"}'</verify>
  <done>Index file exists linking all 8 documents</done>
</task>

## Success Criteria

- [ ] `AGENT_INSTRUCTIONS.md` is self-contained with all commands, schemas, and workflows
- [ ] `README.md` index links to all 8 guide documents
- [ ] Canonical template has version comment for future client adapters
