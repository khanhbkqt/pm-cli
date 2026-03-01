# Phase 5 Research — Markdown Content View

## Discovery Level: 1 (Quick Verification)

Single well-known library choice. Low-risk, easily changed later.

## Finding

**Library: `react-markdown`** (v9.x)
- De facto standard for rendering markdown in React
- Supports GFM (tables, strikethrough, task lists) via `remark-gfm` plugin
- Supports syntax highlighting via `rehype-highlight` or `react-syntax-highlighter`
- Works with React 19
- Tree-shakeable, lightweight (~12KB gzip)

**Syntax Highlighting: `rehype-highlight`** (v7.x)
- Uses `highlight.js` under the hood
- Lightweight alternative to `react-syntax-highlighter`
- Only needs a CSS theme import — no large bundle

**Alternative considered:** `marked` + `DOMPurify` — heavier, requires dangerouslySetInnerHTML, not idiomatic React.

## Decision

Use `react-markdown` + `remark-gfm` + `rehype-highlight` for rendering plan content as rich markdown with code highlighting.

## What needs markdown rendering

1. **Plan content** — `Plan.content` field stores plan text (can be markdown)
2. **Milestone goal** — `Milestone.goal` field (could benefit from markdown)
3. **Phase description** — `Phase.description` field (could benefit from markdown)

Primary target: Plan detail view (click plan card → see rendered markdown content).
