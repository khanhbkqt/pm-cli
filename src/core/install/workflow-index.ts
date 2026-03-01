/**
 * Workflow Index — builds a markdown table from workflow file frontmatter.
 *
 * Used by section-based adapters (Claude Code, Codex, OpenCode, Gemini CLI)
 * to embed an index of available workflows inside their config files.
 */

/**
 * Build a markdown index table from a Map of workflow files.
 *
 * Parses YAML frontmatter `description:` from each workflow file and
 * generates a sorted markdown table listing all available workflows.
 */
export function buildWorkflowIndex(workflows: Map<string, string>): string {
    const rows: Array<{ name: string; description: string }> = [];

    for (const [filename, content] of workflows) {
        // Extract description from YAML frontmatter using simple regex
        const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        let description = '';
        if (fmMatch) {
            const descMatch = fmMatch[1].match(/^description:\s*(.+)$/m);
            if (descMatch) {
                description = descMatch[1].trim();
            }
        }

        // Strip pm- prefix and .md extension for display name
        const name = filename.replace(/^pm-/, '').replace(/\.md$/, '');
        rows.push({ name, description });
    }

    // Sort alphabetically by name
    rows.sort((a, b) => a.name.localeCompare(b.name));

    const lines = [
        '## Available Workflows',
        '',
        '| Workflow | Description |',
        '|----------|-------------|',
    ];

    for (const row of rows) {
        lines.push(`| ${row.name} | ${row.description} |`);
    }

    return lines.join('\n');
}
