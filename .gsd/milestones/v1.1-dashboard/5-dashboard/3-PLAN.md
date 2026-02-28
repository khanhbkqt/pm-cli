---
phase: 5
plan: 3
wave: 2
---

# Plan 5.3: Context Page & Context Detail

## Objective
Implement the Context page with a list of all shared context entries, category filters, server-side search, and an expandable detail view for viewing full context values.

## Context
- .gsd/phases/5-dashboard/RESEARCH.md
- dashboard/src/pages/ContextPage.tsx (placeholder from Plan 5.1)
- dashboard/src/api/client.ts (fetchContext, searchContext)
- dashboard/src/hooks/useApi.ts
- dashboard/src/utils.ts (relativeTime)
- dashboard/src/api/types.ts (ContextEntry type)
- dashboard/src/components/FilterBar.tsx (filter pattern reference)

## Tasks

<task type="auto">
  <name>Implement ContextPage with list, category filter, and search</name>
  <files>dashboard/src/pages/ContextPage.tsx, dashboard/src/pages/ContextPage.css</files>
  <action>
    Replace the placeholder ContextPage with a full implementation:

    1. **Data fetching**: Use `useApi` hook with `fetchContext()` for initial load
    2. **Category filter**: Tab-style buttons for "All", "decision", "spec", "note", "constraint"
       - When category selected, refetch with `fetchContext({ category: selected })`
    3. **Search bar**: Text input with debounce (300ms)
       - When search query is set, call `searchContext(query)` instead of `fetchContext`
       - Clear search returns to category-filtered view
    4. **Context entries list**: Table/card layout showing:
       - Key (monospace, prominent)
       - Category badge (colored by category type)
       - Created by (agent name)
       - Created/updated date via `relativeTime()`
       - Click to expand/toggle detail view
    5. **Empty state**: Icon + message when no entries match
    6. **Loading & error states**: Consistent with other pages

    CSS in `ContextPage.css`:
    - Use CSS custom properties from `index.css`
    - BEM naming: `.context-page`, `.context-page__search`, `.context-entry`, etc.
    - Category badges: use distinct colors per category (CSS classes `.context-entry__badge--decision`, etc.)
    - Responsive: single column on mobile, table-like on desktop
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json</verify>
  <done>Context page renders entries with category filter and server-side search</done>
</task>

<task type="auto">
  <name>Implement context detail expansion</name>
  <files>dashboard/src/pages/ContextPage.tsx, dashboard/src/pages/ContextPage.css</files>
  <action>
    Add expandable detail view to context entries (inline expansion, not a separate panel):

    1. **Expand/collapse**: Clicking an entry row toggles expanded state
       - Track expanded entry ID in component state: `expandedId: number | null`
       - Clicking same entry collapses it, clicking different entry switches
    2. **Expanded content**:
       - Full context value displayed in a `<pre>` block (preserving formatting)
       - If value is JSON, format it nicely with indentation
       - Metadata row: created_by, created_at, updated_at
       - Subtle expand/collapse animation (max-height transition)
    3. **Visual indicator**: Chevron icon (▶/▼) on each entry row indicating expandable state
    4. **Value formatting helper**: Create inline function `formatValue(value: string)`:
       - Try JSON.parse; if valid, return `JSON.stringify(parsed, null, 2)`
       - Otherwise return raw value

    CSS additions to `ContextPage.css`:
    - `.context-entry--expanded` class for expanded state styling
    - `.context-entry__value` — pre block with `--bg-surface` background, `--radius` border-radius
    - Slide-down animation for expansion
  </action>
  <verify>npx tsc --noEmit --project dashboard/tsconfig.json && cd dashboard && npx vite build 2>&1 | tail -5</verify>
  <done>Context entries expand/collapse to show full value, JSON is formatted, build succeeds</done>
</task>

## Success Criteria
- [ ] Context page lists all context entries with key, category, author, date
- [ ] Category filter tabs work (refetches with server filter)
- [ ] Search input triggers debounced server-side search
- [ ] Clicking entry expands to show full value (formatted if JSON)
- [ ] Empty, loading, and error states render correctly
- [ ] TypeScript compiles and Vite build passes
