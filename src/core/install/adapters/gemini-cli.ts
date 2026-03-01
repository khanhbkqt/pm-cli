import * as fs from 'fs';
import * as path from 'path';
import type { ClientAdapter, ClientConfig, GenerateResult, CleanResult } from '../types.js';
import { registerAdapter } from '../registry.js';
import { loadCanonicalTemplate } from '../template.js';

const GEMINI_FILE = 'GEMINI.md';

/** Section marker used to delimit PM CLI content inside GEMINI.md. */
const SECTION_START = '<!-- pm-cli:start -->';
const SECTION_END = '<!-- pm-cli:end -->';

/** Header prepended to the PM section. */
const SECTION_HEADER = `## PM CLI Integration

This project uses \`pm\` CLI for project management. Follow these instructions when working on tasks.

`;

/**
 * Gemini CLI adapter.
 *
 * Generates or updates `GEMINI.md` at the project root with PM CLI
 * instructions wrapped in section markers. This file serves as the
 * always-active context file for Google's Gemini CLI.
 */
export class GeminiCliAdapter implements ClientAdapter {
    detect(projectRoot: string): boolean {
        const geminiFile = path.join(projectRoot, GEMINI_FILE);
        const geminiDir = path.join(projectRoot, '.gemini');

        return (
            fs.existsSync(geminiFile) ||
            (fs.existsSync(geminiDir) && fs.statSync(geminiDir).isDirectory())
        );
    }

    generate(projectRoot: string, templatePath: string): GenerateResult {
        const files: string[] = [];
        const warnings: string[] = [];

        const templateContent = loadCanonicalTemplate(projectRoot);
        const geminiPath = path.join(projectRoot, GEMINI_FILE);
        const pmBlock = [SECTION_START, SECTION_HEADER + templateContent, SECTION_END].join('\n');

        if (fs.existsSync(geminiPath)) {
            const existing = fs.readFileSync(geminiPath, 'utf-8');

            if (existing.includes(SECTION_START)) {
                // Replace existing PM section
                const regex = new RegExp(
                    `${escapeRegex(SECTION_START)}[\\s\\S]*?${escapeRegex(SECTION_END)}`,
                );
                const updated = existing.replace(regex, pmBlock);
                fs.writeFileSync(geminiPath, updated, 'utf-8');
                warnings.push('Updated existing PM CLI section in GEMINI.md');
            } else {
                // Append PM section to existing file
                const separator = existing.endsWith('\n') ? '\n' : '\n\n';
                fs.writeFileSync(geminiPath, existing + separator + pmBlock + '\n', 'utf-8');
                warnings.push('Appended PM CLI section to existing GEMINI.md');
            }
        } else {
            // Create new GEMINI.md
            const content = `# Gemini CLI Context\n\n${pmBlock}\n`;
            fs.writeFileSync(geminiPath, content, 'utf-8');
        }

        files.push(geminiPath);
        return { files, warnings };
    }

    clean(projectRoot: string): CleanResult {
        const removed: string[] = [];
        const skipped: string[] = [];

        const geminiPath = path.join(projectRoot, GEMINI_FILE);

        if (!fs.existsSync(geminiPath)) {
            skipped.push(geminiPath);
            return { removed, skipped };
        }

        const content = fs.readFileSync(geminiPath, 'utf-8');

        if (!content.includes(SECTION_START)) {
            skipped.push(geminiPath);
            return { removed, skipped };
        }

        const regex = new RegExp(
            `\\n?${escapeRegex(SECTION_START)}[\\s\\S]*?${escapeRegex(SECTION_END)}\\n?`,
        );
        const cleaned = content.replace(regex, '').trim();

        if (cleaned.length === 0 || cleaned === '# Gemini CLI Context') {
            fs.unlinkSync(geminiPath);
            removed.push(geminiPath);
        } else {
            fs.writeFileSync(geminiPath, cleaned + '\n', 'utf-8');
            removed.push(geminiPath);
        }

        return { removed, skipped };
    }

    getConfig(): ClientConfig {
        return {
            type: 'gemini-cli',
            name: 'Gemini CLI',
            configPaths: [GEMINI_FILE],
            configFormat: 'markdown',
        };
    }
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

registerAdapter('gemini-cli', () => new GeminiCliAdapter());
