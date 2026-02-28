import type { Agent } from '../db/types.js';

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
