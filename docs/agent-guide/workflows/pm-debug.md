---
description: Track and resolve bugs systematically
---

# Debug Workflow

Use tasks and context to track a debugging session — from discovery through resolution.

## When to Use

When you encounter a bug or unexpected behavior that needs systematic investigation.

---

## Step 1: Create a Debug Task

```bash
pm task add "Debug: <issue description>" --priority high
```

**Example:**

```bash
pm task add "Debug: API returns 500 on milestone creation" --priority high --description "Error occurs when goal text contains special characters"
```

---

## Step 2: Investigate

As you investigate, record findings in context:

```bash
pm context set debug:issue "<description of what's wrong>"
pm context set debug:hypothesis "<your theory>"
pm context set debug:findings "<what you discovered>"
```

**Example:**

```bash
pm context set debug:issue "milestone create fails with special chars in goal"
pm context set debug:hypothesis "SQL injection protection is too aggressive"
pm context set debug:findings "Found: goal parameter not properly escaped in db.ts line 42"
```

---

## Step 3: Fix and Verify

Implement the fix, then verify it works with empirical evidence (test output, curl response, etc.).

---

## Step 4: Close the Debug Task

```bash
pm task update <task-id> --status done
```

---

## Tips

- Create the task first, even before investigating — this tracks time spent
- Be specific in context entries so future sessions can reference them
- If debugging takes more than 3 attempts, consider pausing (→ [Pause Work](pm-pause.md))

## Success Criteria

- [ ] Bug identified and documented
- [ ] Fix implemented and verified with proof
- [ ] Debug task marked as done

## Next Steps

→ [Resume Work](pm-resume.md) — if you paused during debugging
