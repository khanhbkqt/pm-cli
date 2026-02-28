import * as fs from 'fs';
import * as path from 'path';
import type { ClientAdapter, ClientConfig, GenerateResult, CleanResult } from '../types.js';
import { registerAdapter } from '../registry.js';
import { loadCanonicalTemplate } from '../template.js';

const AGENTS_FILE = 'AGENTS.md';

/** Section marker used to delimit PM CLI content inside AGENTS.md. */
const SECTION_START = '<!-- pm-cli:start -->';
const SECTION_END = '<!-- pm-cli:end -->';

/** Header prepended to the PM section. */
const SECTION_HEADER = `## PM CLI Integration

This project uses \`pm\` CLI for project management. Follow these instructions when working on tasks.

`;

/**
 * Codex adapter.
 *
 * Generates or updates `AGENTS.md` at the project root.
 * PM content is wrapped in HTML comment markers so it can be
 * updated (or removed) without disturbing user-authored content.
 *
 * Detection uses lower confidence because `AGENTS.md` is shared
 * with OpenCode — Codex is preferred when `opencode.json` is absent.
 */
export class CodexAdapter implements ClientAdapter {
    detect(projectRoot: string): boolean {
        const agentsFile = path.join(projectRoot, AGENTS_FILE);
        const opencodeJson = path.join(projectRoot, 'opencode.json');

        // AGENTS.md is a shared signal: only claim Codex if opencode.json is NOT present
        return fs.existsSync(agentsFile) && !fs.existsSync(opencodeJson);
    }

    generate(projectRoot: string, templatePath: string): GenerateResult {
        const files: string[] = [];
        const warnings: string[] = [];

        const templateContent = loadCanonicalTemplate(projectRoot);
        const agentsPath = path.join(projectRoot, AGENTS_FILE);

        const pmBlock = [SECTION_START, SECTION_HEADER + templateContent, SECTION_END].join('\n');

        if (fs.existsSync(agentsPath)) {
            // Update existing AGENTS.md — replace PM section if present, append otherwise
            const existing = fs.readFileSync(agentsPath, 'utf-8');

            if (existing.includes(SECTION_START)) {
                // Replace existing PM section
                const regex = new RegExp(
                    `${escapeRegex(SECTION_START)}[\\s\\S]*?${escapeRegex(SECTION_END)}`,
                );
                const updated = existing.replace(regex, pmBlock);
                fs.writeFileSync(agentsPath, updated, 'utf-8');
                warnings.push('Updated existing PM CLI section in AGENTS.md');
            } else {
                // Append PM section to existing file
                const separator = existing.endsWith('\n') ? '\n' : '\n\n';
                fs.writeFileSync(agentsPath, existing + separator + pmBlock + '\n', 'utf-8');
                warnings.push('Appended PM CLI section to existing AGENTS.md');
            }
        } else {
            // Create new AGENTS.md
            const content = `# Agents Guide\n\n${pmBlock}\n`;
            fs.writeFileSync(agentsPath, content, 'utf-8');
        }

        files.push(agentsPath);
        return { files, warnings };
    }

    clean(projectRoot: string): CleanResult {
        const removed: string[] = [];
        const skipped: string[] = [];

        const agentsPath = path.join(projectRoot, AGENTS_FILE);

        if (!fs.existsSync(agentsPath)) {
            skipped.push(agentsPath);
            return { removed, skipped };
        }

        const content = fs.readFileSync(agentsPath, 'utf-8');

        if (!content.includes(SECTION_START)) {
            // No PM section found — nothing to clean
            skipped.push(agentsPath);
            return { removed, skipped };
        }

        // Remove the PM section
        const regex = new RegExp(
            `\\n?${escapeRegex(SECTION_START)}[\\s\\S]*?${escapeRegex(SECTION_END)}\\n?`,
        );
        const cleaned = content.replace(regex, '').trim();

        if (cleaned.length === 0 || cleaned === '# Agents Guide') {
            // File only had PM content — remove entirely
            fs.unlinkSync(agentsPath);
            removed.push(agentsPath);
        } else {
            // Preserve user content, just strip PM section
            fs.writeFileSync(agentsPath, cleaned + '\n', 'utf-8');
            removed.push(agentsPath); // signals PM content was removed from this file
        }

        return { removed, skipped };
    }

    getConfig(): ClientConfig {
        return {
            type: 'codex',
            name: 'Codex',
            configPaths: [AGENTS_FILE],
            configFormat: 'markdown',
        };
    }
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

registerAdapter('codex', () => new CodexAdapter());
