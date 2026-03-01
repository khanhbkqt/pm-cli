---
phase: 5
plan: 2
wave: 2
---

# Plan 5.2: Plan Detail Page & Navigation

## Objective
Create a dedicated PlanDetailPage that shows a plan's metadata and renders its markdown content using the MarkdownView component from Plan 5.1. Wire up routing and make plan cards clickable.

## Context
- dashboard/src/components/MarkdownView.tsx — from Plan 5.1
- dashboard/src/api/client.ts — fetchPlanById from Plan 5.1
- dashboard/src/pages/PlansPage.tsx — kanban board with plan cards (needs click-through)
- dashboard/src/App.tsx — route definitions
- dashboard/src/pages/PlansPage.css — existing card styles

## Tasks

<task type="auto">
  <name>Create PlanDetailPage</name>
  <files>
    dashboard/src/pages/PlanDetailPage.tsx [NEW]
    dashboard/src/pages/PlanDetailPage.css [NEW]
  </files>
  <action>
    Create a PlanDetailPage component that:
    1. Uses `useParams` to get `planId` from the URL
    2. Calls `fetchPlanById(planId)` via `useApi` hook
    3. Shows loading/error states (same pattern as PlansPage)
    4. Renders header with:
       - Breadcrumb: Milestones / Plans / Plan #{number}
       - Plan name as title
       - Status badge (colored dot + label)
       - Wave indicator
       - Timestamps (created_at, completed_at if present)
    5. Renders plan content area:
       - If `plan.content` is non-null: render with `<MarkdownView content={plan.content} />`
       - If `plan.content` is null: show `<EmptyState>` with message "No content for this plan"
    6. Add a "Back to Plans" link

    CSS should follow existing dashboard patterns:
    - `.plan-detail` prefix
    - Use CSS variables from index.css
    - Responsive layout
    - Subtle card/panel styling for the content area
  </action>
  <verify>cd dashboard && npx tsc --noEmit</verify>
  <done>PlanDetailPage renders plan metadata + markdown content</done>
</task>

<task type="auto">
  <name>Wire routing and plan card links</name>
  <files>
    dashboard/src/App.tsx
    dashboard/src/pages/PlansPage.tsx
  </files>
  <action>
    1. In App.tsx:
       - Import PlanDetailPage
       - Add route: `<Route path="/plans/:planId" element={<PlanDetailPage />} />`

    2. In PlansPage.tsx:
       - Wrap each plan card in a `<Link to={"/plans/${plan.id}"}>`
       - Style the link to not affect card appearance (no underline, inherit color)
       - Add hover effect on card to indicate clickability (subtle scale or border glow)

    Do NOT break existing kanban layout — the Link wrapper should be transparent.
  </action>
  <verify>cd dashboard && npx tsc --noEmit && npx vite build</verify>
  <done>Plan cards are clickable, route works, full build succeeds</done>
</task>

## Success Criteria
- [ ] PlanDetailPage exists at `/plans/:planId` route
- [ ] Plan cards in kanban are clickable links
- [ ] Clicking a plan card navigates to detail page
- [ ] Markdown content rendered with syntax highlighting
- [ ] Empty state shown when plan has no content
- [ ] `vite build` succeeds in dashboard/
