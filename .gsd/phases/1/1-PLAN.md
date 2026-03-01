---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Extend Design System — Missing CSS Custom Properties

## Objective

`BoardPage.css` (and other page stylesheets) reference CSS custom properties that are not defined in `dashboard/src/index.css`, causing them to silently fall back to browser defaults. This plan adds all missing tokens so the entire design system is consistent and the board redesign in Plan 1.2 has a solid foundation.

## Context

- `dashboard/src/index.css` — global design tokens (currently missing aliases)
- `dashboard/src/pages/BoardPage.css` — uses `--border`, `--surface`, `--bg`, `--hover`, `--text-tertiary`, `--space-1..5`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--font-mono`
- `dashboard/src/components/Layout.css` — uses `--border-color` (already defined), `--radius-sm` (already defined)

## Tasks

<task type="auto">
  <name>Add missing CSS custom properties to index.css :root</name>
  <files>dashboard/src/index.css</files>
  <action>
    Append the following token groups to the `:root` block in `index.css` (and mirror them in `[data-theme="dark"]` and `[data-theme="light"]` blocks):

    **Aliases for existing tokens (dark theme defaults):**
    ```css
    --bg: var(--bg-primary);
    --surface: var(--bg-secondary);
    --border: var(--border-color);
    --hover: rgba(255, 255, 255, 0.04);
    --text-tertiary: rgba(136, 136, 170, 0.5);
    --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    ```

    **Light theme overrides in `[data-theme="light"]`:**
    ```css
    --bg: var(--bg-primary);
    --surface: var(--bg-secondary);
    --border: var(--border-color);
    --hover: rgba(0, 0, 0, 0.04);
    --text-tertiary: rgba(107, 107, 138, 0.5);
    ```

    **Spacing scale (add to `:root`):**
    ```css
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 24px;
    --space-6: 32px;
    ```

    **Border-radius scale (add to `:root`):**
    ```css
    --radius-xs: 4px;
    --radius-sm: 8px;   /* already defined, keep existing */
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-xl: 20px;
    --radius: 12px;     /* already defined, keep existing */
    ```

    **Tree-view specific tokens for the hierarchy board (add to `:root` dark):**
    ```css
    --tree-indent: 24px;
    --tree-line-color: rgba(255, 255, 255, 0.08);
    --tree-row-height: 44px;
    --progress-track: rgba(255, 255, 255, 0.08);
    --progress-fill-active: var(--accent-blue);
    --progress-fill-done: var(--accent-green);
    ```

    **Light theme tree token overrides in `[data-theme="light"]`:**
    ```css
    --tree-line-color: rgba(0, 0, 0, 0.08);
    --progress-track: rgba(0, 0, 0, 0.06);
    ```

    Do NOT remove or rename any existing tokens. Only add new ones.
    Place new tokens in clearly labelled comment sections (e.g. `/* Spacing */`, `/* Tree View */`).
  </action>
  <verify>cd dashboard && npx tsc --noEmit</verify>
  <done>
    - All new CSS variables present in `:root`, `[data-theme="dark"]`, and `[data-theme="light"]`
    - TypeScript compilation passes (no type errors introduced)
    - No existing variables removed or renamed
  </done>
</task>

## Success Criteria

- [ ] All `--space-N`, `--radius-md`, `--radius-lg`, `--border`, `--surface`, `--bg`, `--hover`, `--text-tertiary`, `--font-mono` defined in `:root`
- [ ] All tree-view tokens (`--tree-indent`, `--tree-line-color`, `--tree-row-height`, `--progress-track`, `--progress-fill-*`) defined in `:root`
- [ ] Light theme overrides correct in `[data-theme="light"]`
- [ ] `npx tsc --noEmit` passes in `dashboard/`
