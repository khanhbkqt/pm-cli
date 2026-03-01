---
description: Verify completed work against requirements
---

# Verify Work Workflow

Validate that completed plans actually deliver what they promised, using empirical evidence rather than assumptions.

## When to Use

After executing a phase's plans, before considering the phase done. Verification ensures deliverables match requirements.

## Prerequisites

- Phase plans have been executed (`pm plan list --phase <phase-id>`)
- Work artifacts exist to verify (code, tests, documentation)

---

## Step 1: Check Current Progress

```bash
pm progress
```

Review which plans are completed and which are still pending or failed.

---

## Step 2: Verify Each Plan's Deliverables

For each completed plan, verify its outputs exist and work correctly.

**Proof requirements by change type:**

| Change Type | Required Proof |
|-------------|----------------|
| API endpoint | `curl` / HTTP response |
| UI change | Screenshot |
| Build/compile | Command output |
| Test | Test runner output |
| Config | Verification command |
| Documentation | File exists and content is correct |

**Never accept:** "It looks correct", "This should work", "I've done similar before."
**Always require:** Captured output, screenshot, or test result.

---

## Step 3: Mark Plans Based on Evidence

If a plan's deliverables are verified:

```bash
pm plan update <plan-id> --status completed
```

If a plan's deliverables are missing or incorrect:

```bash
pm plan update <plan-id> --status failed
```

**Retry path** — to rework a failed plan:

```bash
pm plan update <plan-id> --status pending
```

Then return to the execute workflow.

---

## Step 4: Check Phase Completion

After verifying all plans:

```bash
pm plan list --phase <phase-id> --json
```

- If all plans are `completed` → phase auto-completes
- If any plans are `failed` → phase stays `in_progress`, fix and re-verify

---

## Plan Status Transitions

```
pending → in_progress → completed ✓
                      → failed → pending (retry)
```

## Cascading Behavior

- All plans `completed` → phase automatically transitions to `completed`
- Failed plans prevent phase auto-completion

## Success Criteria

- [ ] Every plan has empirical proof of completion
- [ ] All plans are `completed`
- [ ] Phase status is `completed`
- [ ] `pm progress` shows phase as done

## Next Steps

→ [Check Progress](pm-progress.md) — review milestone-level status
→ [Audit Milestone](pm-audit-milestone.md) — pre-completion review
→ [Complete Milestone](pm-complete-milestone.md) — if all phases are done
