import type { Agent, ContextEntry, Milestone, Phase, Plan } from '../db/types.js';

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
 * `content` is loaded from the filesystem (.pm/milestones/...) by the caller.
 */
export function formatPlan(plan: Plan, json: boolean, content?: string): string {
    if (json) {
        return JSON.stringify({ ...plan, content: content ?? null }, null, 2);
    }

    const lines = [
        `ID:        ${plan.id}`,
        `Number:    ${plan.number}`,
        `Name:      ${plan.name}`,
        `Phase:     ${plan.phase_id}`,
        `Wave:      ${plan.wave}`,
        `Status:    ${plan.status}`,
        `Created:   ${plan.created_at}`,
        plan.completed_at ? `Completed: ${plan.completed_at}` : null,
    ].filter(Boolean) as string[];

    if (content) {
        lines.push('', '--- Content ---', content);
    }

    return lines.join('\n');
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

const BOARD_STATUS_ICONS: Record<string, string> = {
    pending: '⬜',
    in_progress: '▶',
    completed: '✅',
    failed: '❌',
};

/**
 * Format plans as a kanban-style board grouped by status.
 */
export function formatPlanBoard(plans: Plan[], json: boolean): string {
    if (json) {
        const grouped: Record<string, Plan[]> = {};
        for (const p of plans) {
            (grouped[p.status] ??= []).push(p);
        }
        return JSON.stringify(grouped, null, 2);
    }

    if (plans.length === 0) {
        return 'No plans found.';
    }

    const columns = ['pending', 'in_progress', 'completed', 'failed'] as const;
    const grouped = new Map<string, Plan[]>();
    for (const col of columns) grouped.set(col, []);
    for (const p of plans) {
        const list = grouped.get(p.status);
        if (list) list.push(p);
    }

    const sections: string[] = [];
    for (const col of columns) {
        const items = grouped.get(col) || [];
        const icon = BOARD_STATUS_ICONS[col] || '';
        const label = col.replace('_', ' ').toUpperCase();
        sections.push(`${icon} ${label} (${items.length})`);
        if (items.length === 0) {
            sections.push('  (empty)');
        } else {
            for (const p of items) {
                sections.push(`  #${p.number} ${p.name} [wave ${p.wave}]`);
            }
        }
        sections.push('');
    }

    return sections.join('\n').trimEnd();
}


/**
 * Phase enriched with plan statistics.
 */
interface PhaseProgress extends Phase {
    plans_total: number;
    plans_done: number;
    plans_failed: number;
}

/**
 * Data structure for progress display.
 */
interface ProgressData {
    milestone: Milestone;
    phases: PhaseProgress[];
    summary: { phases_total: number; phases_complete: number; phases_pct: number };
}

const STATUS_ICONS: Record<string, string> = {
    completed: '✅',
    in_progress: '▶',
    planning: '🔵',
    skipped: '⏭',
    not_started: '⬜',
};

/**
 * Format milestone progress for display.
 */
export function formatProgress(data: ProgressData, json: boolean): string {
    if (json) {
        return JSON.stringify(data, null, 2);
    }

    const { milestone, phases, summary } = data;

    const header = [
        `Active Milestone: ${milestone.name}${milestone.goal ? ' — ' + milestone.goal : ''}`,
        `Status: ${milestone.status}`,
        '',
    ];

    if (phases.length === 0) {
        return [...header, 'No phases defined.', '', `Progress: 0/0 phases complete (0%)`].join('\n');
    }

    const headers = ['', '#', 'Name', 'Plans'];
    const rows = phases.map(p => [
        STATUS_ICONS[p.status] ?? '⬜',
        String(p.number),
        p.name,
        `${p.plans_done}/${p.plans_total}`,
    ]);

    const table = formatTable(headers, rows);
    const footer = `\nProgress: ${summary.phases_complete}/${summary.phases_total} phases complete (${summary.phases_pct}%)`;

    return [...header, 'Phases:', table, footer].join('\n');
}
