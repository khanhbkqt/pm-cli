import type { Agent, Task, TaskComment, ContextEntry, Milestone, Phase, Plan } from '../db/types.js';

/**
 * Format a simple ASCII table from headers and rows.
 * Column widths are auto-calculated from content.
 */
export function formatTable(headers: string[], rows: string[][]): string {
    // Calculate column widths
    const widths = headers.map((h, i) => {
        const colValues = rows.map(r => (r[i] || '').length);
        return Math.max(h.length, ...colValues);
    });

    const divider = widths.map(w => '─'.repeat(w + 2)).join('┼');
    const formatRow = (cells: string[]) =>
        cells.map((cell, i) => ` ${(cell || '').padEnd(widths[i])} `).join('│');

    const lines = [
        formatRow(headers),
        divider,
        ...rows.map(row => formatRow(row)),
    ];

    return lines.join('\n');
}

/**
 * Format a single agent for display.
 */
export function formatAgent(agent: Agent, json: boolean): string {
    if (json) {
        return JSON.stringify(agent, null, 2);
    }

    const created = agent.created_at.split('T')[0] || agent.created_at;
    return [
        `Name:  ${agent.name}`,
        `Role:  ${agent.role}`,
        `Type:  ${agent.type}`,
        `ID:    ${agent.id}`,
        `Since: ${created}`,
    ].join('\n');
}

/**
 * Format a list of agents for display.
 */
export function formatAgentList(agents: Agent[], json: boolean): string {
    if (json) {
        return JSON.stringify(agents, null, 2);
    }

    if (agents.length === 0) {
        return 'No agents registered.';
    }

    const headers = ['Name', 'Role', 'Type', 'Created'];
    const rows = agents.map(a => [
        a.name,
        a.role,
        a.type,
        a.created_at.split('T')[0] || a.created_at,
    ]);

    return formatTable(headers, rows);
}

/**
 * Format a single task for display.
 */
export function formatTask(task: Task, json: boolean): string {
    if (json) {
        return JSON.stringify(task, null, 2);
    }

    return [
        `ID:       #${task.id}`,
        `Title:    ${task.title}`,
        `Status:   ${task.status}`,
        `Priority: ${task.priority}`,
        `Assigned: ${task.assigned_to || 'unassigned'}`,
        `Creator:  ${task.created_by}`,
        `Parent:   ${task.parent_id ?? 'none'}`,
        task.description ? `Desc:     ${task.description}` : null,
        `Created:  ${task.created_at}`,
        `Updated:  ${task.updated_at}`,
    ].filter(Boolean).join('\n');
}

/**
 * Format a list of tasks for display.
 */
export function formatTaskList(tasks: Task[], json: boolean): string {
    if (json) {
        return JSON.stringify(tasks, null, 2);
    }

    if (tasks.length === 0) {
        return 'No tasks found.';
    }

    const headers = ['ID', 'Title', 'Status', 'Priority', 'Assigned'];
    const rows = tasks.map(t => [
        String(t.id),
        t.title,
        t.status,
        t.priority,
        t.assigned_to || '-',
    ]);

    return formatTable(headers, rows);
}

/**
 * Format a single comment for display.
 */
export function formatComment(comment: TaskComment, json: boolean): string {
    if (json) {
        return JSON.stringify(comment, null, 2);
    }

    return `[${comment.created_at}] ${comment.agent_id}: ${comment.content}`;
}

/**
 * Format a list of comments for display.
 */
export function formatCommentList(comments: TaskComment[], json: boolean): string {
    if (json) {
        return JSON.stringify(comments, null, 2);
    }

    if (comments.length === 0) {
        return 'No comments.';
    }

    return comments.map(c => formatComment(c, false)).join('\n');
}

/**
 * Format a single context entry for display.
 */
export function formatContext(entry: ContextEntry, json: boolean): string {
    if (json) {
        return JSON.stringify(entry, null, 2);
    }

    return [
        `Key:      ${entry.key}`,
        `Value:    ${entry.value}`,
        `Category: ${entry.category}`,
        `Creator:  ${entry.created_by}`,
        `Created:  ${entry.created_at}`,
        `Updated:  ${entry.updated_at}`,
    ].join('\n');
}

/**
 * Format a list of context entries for display.
 */
export function formatContextList(entries: ContextEntry[], json: boolean): string {
    if (json) {
        return JSON.stringify(entries, null, 2);
    }

    if (entries.length === 0) {
        return 'No context entries.';
    }

    const headers = ['Key', 'Value', 'Category', 'Creator'];
    const rows = entries.map(e => [
        e.key,
        e.value,
        e.category,
        e.created_by,
    ]);

    return formatTable(headers, rows);
}

/**
 * Format a single milestone for display.
 */
export function formatMilestone(milestone: Milestone, json: boolean): string {
    if (json) {
        return JSON.stringify(milestone, null, 2);
    }

    return [
        `ID:        ${milestone.id}`,
        `Name:      ${milestone.name}`,
        `Goal:      ${milestone.goal || 'none'}`,
        `Status:    ${milestone.status}`,
        `Creator:   ${milestone.created_by}`,
        `Created:   ${milestone.created_at}`,
        milestone.completed_at ? `Completed: ${milestone.completed_at}` : null,
    ].filter(Boolean).join('\n');
}

/**
 * Format a list of milestones for display.
 */
export function formatMilestoneList(milestones: Milestone[], json: boolean): string {
    if (json) {
        return JSON.stringify(milestones, null, 2);
    }

    if (milestones.length === 0) {
        return 'No milestones found.';
    }

    const headers = ['ID', 'Name', 'Status', 'Creator', 'Created'];
    const rows = milestones.map(m => [
        m.id,
        m.name,
        m.status,
        m.created_by,
        m.created_at.split('T')[0] || m.created_at,
    ]);

    return formatTable(headers, rows);
}

/**
 * Format a single phase for display.
 */
export function formatPhase(phase: Phase, json: boolean): string {
    if (json) {
        return JSON.stringify(phase, null, 2);
    }

    return [
        `ID:          ${phase.id}`,
        `Number:      ${phase.number}`,
        `Name:        ${phase.name}`,
        `Milestone:   ${phase.milestone_id}`,
        `Status:      ${phase.status}`,
        phase.description ? `Description: ${phase.description}` : null,
        `Created:     ${phase.created_at}`,
        phase.completed_at ? `Completed:   ${phase.completed_at}` : null,
    ].filter(Boolean).join('\n');
}

/**
 * Format a list of phases for display.
 */
export function formatPhaseList(phases: Phase[], json: boolean): string {
    if (json) {
        return JSON.stringify(phases, null, 2);
    }

    if (phases.length === 0) {
        return 'No phases found.';
    }

    const headers = ['#', 'Name', 'Status', 'Created'];
    const rows = phases.map(p => [
        String(p.number),
        p.name,
        p.status,
        p.created_at.split('T')[0] || p.created_at,
    ]);

    return formatTable(headers, rows);
}

/**
 * Format a single plan for display.
 */
export function formatPlan(plan: Plan, json: boolean): string {
    if (json) {
        return JSON.stringify(plan, null, 2);
    }

    return [
        `ID:        ${plan.id}`,
        `Number:    ${plan.number}`,
        `Name:      ${plan.name}`,
        `Phase:     ${plan.phase_id}`,
        `Wave:      ${plan.wave}`,
        `Status:    ${plan.status}`,
        plan.content ? `Content:   ${plan.content}` : null,
        `Created:   ${plan.created_at}`,
        plan.completed_at ? `Completed: ${plan.completed_at}` : null,
    ].filter(Boolean).join('\n');
}

/**
 * Format a list of plans for display.
 */
export function formatPlanList(plans: Plan[], json: boolean): string {
    if (json) {
        return JSON.stringify(plans, null, 2);
    }

    if (plans.length === 0) {
        return 'No plans found.';
    }

    const headers = ['#', 'Name', 'Wave', 'Status', 'Created'];
    const rows = plans.map(p => [
        String(p.number),
        p.name,
        String(p.wave),
        p.status,
        p.created_at.split('T')[0] || p.created_at,
    ]);

    return formatTable(headers, rows);
}
