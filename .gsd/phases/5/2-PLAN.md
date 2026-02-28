---
phase: 5
plan: 2
wave: 2
depends_on: [1]
---

# Plan 5.2: npm Scripts & End-to-End Verification

## Objective
Add `install:local` and `uninstall:local` convenience scripts to `package.json`, then verify the full install → use → uninstall cycle works.

## Context
- .gsd/SPEC.md
- .gsd/phases/5/RESEARCH.md
- package.json
- scripts/install.sh (created in Plan 5.1)
- scripts/uninstall.sh (created in Plan 5.1)

## Tasks

<task type="auto">
  <name>Add npm convenience scripts</name>
  <files>package.json</files>
  <action>
    Add two entries to the `scripts` section of `package.json`:
    - `"install:local": "bash scripts/install.sh"`
    - `"uninstall:local": "bash scripts/uninstall.sh"`
    - Place them after the existing `test:watch` entry
    - Do NOT modify any other fields
  </action>
  <verify>node -e "const p = JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log(p.scripts['install:local'], p.scripts['uninstall:local'])"</verify>
  <done>`npm run install:local` and `npm run uninstall:local` are valid package.json scripts</done>
</task>

<task type="checkpoint:human-verify">
  <name>End-to-end install verification</name>
  <files>scripts/install.sh, scripts/uninstall.sh</files>
  <action>
    Run the full cycle:
    1. `npm run install:local` — should build and link successfully
    2. `pm --version` — should print 1.0.0
    3. `pm --help` — should show available commands
    4. `which pm` — should point to npm global bin
    5. `npm run uninstall:local` — should remove the global link
    6. `which pm` — should return "not found"
  </action>
  <verify>pm --version</verify>
  <done>`pm --version` prints 1.0.0, `pm --help` shows commands, uninstall removes the command</done>
</task>

## Success Criteria
- [ ] `package.json` has `install:local` and `uninstall:local` scripts
- [ ] `npm run install:local` succeeds and `pm --version` outputs `1.0.0`
- [ ] `pm --help` displays available commands
- [ ] `npm run uninstall:local` succeeds and `pm` command is no longer available
