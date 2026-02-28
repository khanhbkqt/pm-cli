---
phase: 4-dashboard
plan: 3
wave: 3
---

# Plan 4.3: Task CRUD UI & Visual Verification

## Objective
Build task creation form and task detail panel with edit, assign, and comment functionality. Verify the complete Tasks Board visually in the browser.

## Context
- dashboard/src/pages/TasksBoard.tsx
- dashboard/src/api/client.ts (createTask, updateTask, assignTask, addTaskComment, fetchTaskComments)
- dashboard/src/api/types.ts
- dashboard/src/hooks/useApi.ts
- dashboard/src/index.css (design tokens)

## Tasks

<task type="auto">
  <name>Build TaskDetailPanel and CreateTaskModal</name>
  <files>
    dashboard/src/components/TaskDetailPanel.tsx
    dashboard/src/components/TaskDetailPanel.css
    dashboard/src/components/CreateTaskModal.tsx
    dashboard/src/components/CreateTaskModal.css
  </files>
  <action>
    1. Create `TaskDetailPanel.tsx` — slide-in side panel:
       - Props: `task: Task | null`, `agents: Agent[]`, `onClose: () => void`, `onUpdate: () => void`
       - Slide in from right side of screen (CSS transform)
       - Shows task title (editable inline), description (editable textarea)
       - Status dropdown: todo, in-progress, done, blocked
       - Priority dropdown: low, medium, high, urgent
       - Assign agent dropdown (populated from agents prop)
       - Comments section at bottom:
         - Fetch comments with `fetchTaskComments(task.id)`
         - Display comment list (agent name, content, timestamp)
         - Add comment form: agent dropdown + text input + submit button
       - Save button calls `updateTask` API with changed fields
       - Close button (✕) dismisses panel

    2. Create `TaskDetailPanel.css`:
       - `.task-detail` — fixed position, right 0, height 100vh, width 420px, bg-secondary
       - `.task-detail--open` — translateX(0), transition
       - `.task-detail--closed` — translateX(100%)
       - `.task-detail__overlay` — backdrop overlay
       - `.task-detail__field` — label + input/select groups
       - `.task-detail__comments` — scrollable comment list
       - `.task-detail__comment` — individual comment bubble

    3. Create `CreateTaskModal.tsx` — modal dialog:
       - Props: `agents: Agent[]`, `onClose: () => void`, `onCreate: () => void`
       - Form fields: title (required), description (optional), priority (dropdown), assign to (dropdown)
       - `created_by` field: dropdown from agents list (required)
       - Submit calls `createTask` API, then `onCreate()` callback to refetch
       - Cancel button dismisses modal
       - Backdrop click closes modal

    4. Create `CreateTaskModal.css`:
       - `.create-modal__overlay` — centered overlay, blur backdrop
       - `.create-modal` — card with form styling, max-width 520px
       - `.create-modal__field` — form field with label
       - `.create-modal__input` / `.create-modal__select` — styled inputs matching design system
       - `.create-modal__actions` — button row (cancel + create)

    5. Wire into TasksBoard.tsx:
       - Add "Create Task" button in page header / filter bar area
       - `showCreateModal` state toggle for CreateTaskModal
       - `selectedTask` state for TaskDetailPanel
       - `onTaskClick` sets selectedTask → opens detail panel
       - On create/update success → refetch tasks list
  </action>
  <verify>
    Run `cd dashboard && npx tsc --noEmit` — no type errors.
    Run `cd dashboard && npm run build` — builds successfully.
  </verify>
  <done>
    - Task detail panel slides in showing task info
    - Task fields are editable (title, description, status, priority, assignee)
    - Comments load and can be added
    - Create task modal creates new tasks via API
    - TasksBoard integrates both components
    - Build succeeds
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Visual verification of Tasks Board</name>
  <files>
    dashboard/src/pages/TasksBoard.tsx
  </files>
  <action>
    1. Start the dashboard dev server: `cd dashboard && npm run dev`
    2. Also start the PM server if not running: `pm dashboard` (or equivalent)
    3. Open browser to http://localhost:4000/tasks
    4. Verify:
       - Kanban board renders with 4 columns
       - Task cards display correctly with priority colors
       - Click "Tasks" in sidebar navigates correctly
       - Click a task card opens detail panel
       - Detail panel shows editable fields
       - Create Task button opens modal
       - Filter bar works (status, priority, agent filters)
       - View toggle switches between Kanban and List
       - Drag-and-drop changes task status in Kanban view
    5. Take screenshot for documentation
  </action>
  <verify>
    Visual inspection in browser at /tasks
  </verify>
  <done>
    - Tasks Board fully functional and visually polished
    - All CRUD actions work through UI
    - Design is consistent with Overview page
  </done>
</task>

## Success Criteria
- [ ] Task detail panel opens and shows task info
- [ ] Task fields are editable and saved via API
- [ ] Comments section loads and allows adding comments
- [ ] Create task modal submits and creates tasks
- [ ] Full visual verification in browser passes
- [ ] `npm run build` succeeds
