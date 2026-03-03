---
phase: 4
plan: 2
wave: 2
---

# Plan 4.2: Dashboard Bug UI Page

## Objective
Add a Bugs page to the dashboard frontend with list view, detail panel, and report form.

## Context
- dashboard/ (existing dashboard frontend)
- src/server/routes/bugs.ts (API endpoints)

## Tasks

<task type="auto">
  <name>Analyze existing dashboard structure</name>
  <files>dashboard/</files>
  <action>
    Read the dashboard directory structure to understand:
    - Framework used (React, vanilla, etc.)
    - Component patterns
    - How other pages (Milestones, Phases, Plans) are structured
    - Navigation/routing mechanism
    This determines how to build the Bugs page.
  </action>
  <verify>ls dashboard/</verify>
  <done>Dashboard structure understood, ready to implement</done>
</task>

<task type="auto">
  <name>Create Bugs page</name>
  <files>dashboard/</files>
  <action>
    Following the existing page patterns:
    1. Create Bugs page component with:
       - Bug list table with columns: Priority (icon), Title, Status, Blocking, Created
       - Priority filter dropdown
       - Status filter dropdown
       - "Report Bug" button/form
    2. Bug detail panel (click a bug to see full details + markdown content)
    3. Add Bugs to the navigation/sidebar
    4. Style consistently with existing pages (use same CSS patterns)
  </action>
  <verify>npm run build (if applicable) or visual verification via dashboard</verify>
  <done>Bugs page visible in dashboard with list, filters, detail panel, and report form</done>
</task>

## Success Criteria
- [ ] Bugs page accessible from dashboard navigation
- [ ] Bug list with priority icons and status badges
- [ ] Report bug form functional
- [ ] Bug detail panel shows markdown content
