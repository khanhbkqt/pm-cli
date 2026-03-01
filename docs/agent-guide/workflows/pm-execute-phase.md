---
description: Execute plans in a phase using wave-based ordering
---

# Execute Phase Workflow

Work through a phase's plans in wave order, transitioning each plan through `pending → in_progress → completed`.

## When to Use

After plans have been created for a phase (via the Plan Phase workflow) and you're ready to start implementation.

## Prerequisites

- Phase has plans (`pm plan list --phase <phase-id>`)
- Plans are in `pending` status

---

## Step 1: Review Plans and Wave Order

```bash
pm plan list --phase <phase-id> --json
```

Group plans by wave. Execute wave 1 first, then wave 2, etc.

---

## Step 2: Start a Plan

Move the first pending plan to `in_progress`:

```bash
pm plan update <plan-id> --status in_progress
```

**Cascading behavior:** If the parent phase is `not_started`, starting a plan automatically transitions the phase to `in_progress`.

---

## Step 3: Do the Work

Implement what the plan describes. This is where actual code changes, documentation, or configuration happens.

---

## Step 4: Complete the Plan

When the plan's work is done and verified:

```bash
pm plan update <plan-id> --status completed
```

**Cascading behavior:** When all plans in a phase reach `completed` status, the phase automatically transitions to `completed`.

---

## Step 5: Handle Failures

If a plan's work cannot be completed:

```bash
pm plan update <plan-id> --status failed
```

To retry a failed plan:

```bash
pm plan update <plan-id> --status pending
```

Then start it again from Step 2.

---

## Step 6: Track Progress

Check overall milestone progress at any time:

```bash
pm progress
```

Or check a specific milestone:

```bash
pm progress --milestone <milestone-id>
```

---

## Wave Execution Order

1. Execute all **Wave 1** plans (can run in parallel)
2. Wait for all Wave 1 plans to complete
3. Execute all **Wave 2** plans
4. Repeat until all waves are done

Filter plans by wave:

```bash
pm plan list --phase <phase-id> --wave 1 --json
```

---

## Plan Status Transitions

```
pending → in_progress → completed
                      → failed → pending (retry)
```

## Cascading Behavior

- Starting a plan (`pending → in_progress`) auto-starts the parent phase if it's `not_started`
- Completing all plans in a phase auto-completes the phase
- Failed plans block phase auto-completion

## Success Criteria

- [ ] All plans in the phase are `completed`
- [ ] Phase status is `completed` (auto-transitioned)
- [ ] `pm progress` reflects the updated state

## Next Steps

→ [Verify Work](pm-verify-work.md) — validate deliverables against requirements
→ [Check Progress](pm-progress.md) — review milestone progress
