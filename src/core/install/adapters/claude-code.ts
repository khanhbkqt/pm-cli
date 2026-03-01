import * as fs from 'fs';
import * as path from 'path';
import type { ClientAdapter, ClientConfig, GenerateResult, CleanResult } from '../types.js';
import { registerAdapter } from '../registry.js';
import { loadCanonicalTemplate, loadWorkflowTemplates } from '../template.js';
import { buildWorkflowIndex } from '../workflow-index.js';

const CLAUDE_FILE = 'CLAUDE.md';

/** Section marker used to delimit PM CLI content inside CLAUDE.md. */
const SECTION_START = '<!-- pm-cli:start -->';
const SECTION_END = '<!-- pm-cli:end -->';

/** Header prepended to the PM section. */
const SECTION_HEADER = `## PM CLI Integration

This project uses \`pm\` CLI for project management. Follow these instructions when working on tasks.

`;

/**
 * Claude Code adapter.
 *
 * Generates or updates \`CLAUDE.md\` at the project root.
 * PM content is wrapped in HTML comment markers so it can be
 * updated (or removed) without disturbing user-authored content.
 */
export class ClaudeCodeAdapter implements ClientAdapter {
    detect(projectRoot: string): boolean {
        const claudeFile = path.join(projectRoot, CLAUDE_FILE);
        const claudeDir = path.join(projectRoot, '.claude');

        return (
            fs.existsSync(claudeFile) ||
            (fs.existsSync(claudeDir) && fs.statSync(claudeDir).isDirectory())
        );
    }

    generate(projectRoot: string, templatePath: string): GenerateResult {
        const files: string[] = [];
        const warnings: string[] = [];

        const templateContent = loadCanonicalTemplate(projectRoot);
        const claudePath = path.join(projectRoot, CLAUDE_FILE);

        const workflows = loadWorkflowTemplates(projectRoot);
        const workflowIndex = buildWorkflowIndex(workflows);
        const pmBlock = [SECTION_START, SECTION_HEADER + templateContent + '\n\n' + workflowIndex, SECTION_END].join('\n');

        if (fs.existsSync(claudePath)) {
            // Update existing CLAUDE.md — replace PM section if present, append otherwise
            const existing = fs.readFileSync(claudePath, 'utf-8');

            if (existing.includes(SECTION_START)) {
                // Replace existing PM section
                const regex = new RegExp(
                    `${escapeRegex(SECTION_START)}[\\s\\S]*?${escapeRegex(SECTION_END)}`,
                );
                const updated = existing.replace(regex, pmBlock);
                fs.writeFileSync(claudePath, updated, 'utf-8');
                warnings.push('Updated existing PM CLI section in CLAUDE.md');
            } else {
                // Append PM section to existing file
                const separator = existing.endsWith('\n') ? '\n' : '\n\n';
                fs.writeFileSync(claudePath, existing + separator + pmBlock + '\n', 'utf-8');
                warnings.push('Appended PM CLI section to existing CLAUDE.md');
            }
        } else {
            // Create new CLAUDE.md
            const content = `# Project Rules\n\n${pmBlock}\n`;
            fs.writeFileSync(claudePath, content, 'utf-8');
        }

        files.push(claudePath);
        return { files, warnings };
    }

    clean(projectRoot: string): CleanResult {
        const removed: string[] = [];
        const skipped: string[] = [];

        const claudePath = path.join(projectRoot, CLAUDE_FILE);

        if (!fs.existsSync(claudePath)) {
            skipped.push(claudePath);
            return { removed, skipped };
        }

        const content = fs.readFileSync(claudePath, 'utf-8');

        if (!content.includes(SECTION_START)) {
            // No PM section found — nothing to clean
            skipped.push(claudePath);
            return { removed, skipped };
        }

        // Remove the PM section
        const regex = new RegExp(
            `\\n?${escapeRegex(SECTION_START)}[\\s\\S]*?${escapeRegex(SECTION_END)}\\n?`,
        );
        const cleaned = content.replace(regex, '').trim();

        if (cleaned.length === 0 || cleaned === '# Project Rules') {
            // File only had PM content — remove entirely
            fs.unlinkSync(claudePath);
            removed.push(claudePath);
        } else {
            // Preserve user content, just strip PM section
            fs.writeFileSync(claudePath, cleaned + '\n', 'utf-8');
            removed.push(claudePath); // signals PM content was removed from this file
        }

        return { removed, skipped };
    }

    getConfig(): ClientConfig {
        return {
            type: 'claude-code',
            name: 'Claude Code',
            configPaths: [CLAUDE_FILE],
            configFormat: 'markdown',
        };
    }
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

registerAdapter('claude-code', () => new ClaudeCodeAdapter());
