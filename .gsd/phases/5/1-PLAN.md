---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Markdown Rendering Foundation

## Objective
Install markdown rendering libraries and create a reusable `MarkdownView` component plus the `fetchPlanById` API client function. These are the building blocks for Plan 5.2.

## Context
- dashboard/package.json — current dependencies (React 19, react-router-dom, Vite)
- dashboard/src/api/client.ts — existing API fetch helpers
- dashboard/src/api/types.ts — Plan type has `content: string | null`
- src/server/routes/plans.ts — backend `GET /api/plans/:id` already exists

## Tasks

<task type="auto">
  <name>Install markdown dependencies</name>
  <files>dashboard/package.json</files>
  <action>
    Run `npm install react-markdown remark-gfm rehype-highlight highlight.js` in `dashboard/`.
    - `react-markdown` v9+ for rendering markdown as React components
    - `remark-gfm` for GitHub Flavored Markdown (tables, task lists, strikethrough)
    - `rehype-highlight` + `highlight.js` for code syntax highlighting
    Do NOT install `react-syntax-highlighter` — too heavy for this use case.
  </action>
  <verify>cat dashboard/package.json | grep react-markdown</verify>
  <done>react-markdown, remark-gfm, rehype-highlight, highlight.js in dependencies</done>
</task>

<task type="auto">
  <name>Create MarkdownView component</name>
  <files>
    dashboard/src/components/MarkdownView.tsx [NEW]
    dashboard/src/components/MarkdownView.css [NEW]
  </files>
  <action>
    Create a reusable MarkdownView component that:
    1. Accepts `content: string` prop
    2. Uses `react-markdown` with `remarkGfm` and `rehypeHighlight` plugins
    3. Import a highlight.js CSS theme (e.g. `highlight.js/styles/github-dark.css`)
    4. Style the rendered output with:
       - Proper typography (headings, paragraphs, lists)
       - Code blocks with dark background matching dashboard theme
       - Tables with borders and alternating row colors
       - Task list checkboxes styled
       - Links styled with accent color
       - Responsive container with max-width
    5. CSS should use `.markdown-view` class prefix and CSS variables from index.css

    Do NOT overcomplicate — keep it a simple presentational component.
    Do NOT create a separate theme file — inline the highlight.js import at component level.
  </action>
  <verify>cd dashboard && npx tsc --noEmit</verify>
  <done>MarkdownView.tsx compiles, renders markdown string to styled HTML</done>
</task>

<task type="auto">
  <name>Add fetchPlanById to API client</name>
  <files>dashboard/src/api/client.ts</files>
  <action>
    Add a `fetchPlanById(id: number): Promise<Plan>` function to `client.ts` that:
    1. Calls `GET /api/plans/${id}`
    2. Returns `res.plan` from the response
    3. Follow existing pattern from `fetchAgentById`
  </action>
  <verify>cd dashboard && npx tsc --noEmit</verify>
  <done>fetchPlanById exported from client.ts, TypeScript compiles</done>
</task>

## Success Criteria
- [ ] react-markdown + remark-gfm + rehype-highlight in dashboard/package.json
- [ ] MarkdownView component exists and compiles
- [ ] fetchPlanById function exported from api/client.ts
- [ ] `tsc --noEmit` passes in dashboard/
