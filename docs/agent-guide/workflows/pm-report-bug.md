---
description: Capture a properly formatted bug report from a brief user description — reporting only, no investigation
---

# /pm-report-bug Workflow

<objective>
Turn a brief bug description into a structured, actionable bug report. **This workflow is for reporting only.** Do not investigate, debug, or read source files.
</objective>

> ⚠️ **SCOPE LIMIT:** Do NOT grep files, read terminals, view source code, or research the root cause. That is the job of `/pm-fix-bug` and `/pm-debug`. Your only job here is to capture what the user tells you in a clean format.

<process>

## 1. Acknowledge and Ask (if needed)

Read the user's description. If you already have enough to fill the report, skip straight to Step 2.

If key fields are missing, ask **one round** of targeted questions only:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► REPORT BUG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Got it. A couple of quick questions:
1. {e.g. "What exact command or action triggered this?"}
2. {e.g. "What did you expect to happen?"}

(Skip any you're unsure about — I'll mark them as unknown)
───────────────────────────────────────────────────────
```

**Do not ask a second round. Do not investigate independently.**

---

## 2. Format the Bug Report

Fill in what you know. Use "Unknown" for anything missing.

```markdown
# Bug: {Clear, concise title}

## Description
{What went wrong, in the user's own words}

## Steps to Reproduce
1. {Step 1}
2. {Step 2}

## Expected Behavior
{What should have happened}

## Actual Behavior
{What actually occurred, including any error messages/stack traces}

## Environment / Context
- **Location:** {File/module/command — if provided}
- **Severity:** {blocking / high / medium / low}
```

---

## 3. Record the Bug

```bash
pm bug create \
  --title "{Bug Title}" \
  --severity {blocking|high|medium|low} \
  --description "{one-line summary}" \
  --agent <name>
```

---

## 4. Offer Next Steps

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► BUG REPORTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bug filed: {Title}
Severity: {severity}

───────────────────────────────────────────────────────

▶ NEXT

/pm-fix-bug   — Immediately start debugging and fixing this issue
/pm-plan-phase — Continue with regular planning or next steps
───────────────────────────────────────────────────────
```

</process>
