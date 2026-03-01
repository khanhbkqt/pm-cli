import * as fs from 'fs';
import * as path from 'path';
import type { ClientAdapter, ClientConfig, GenerateResult, CleanResult } from '../types.js';
import { registerAdapter } from '../registry.js';
import { loadCanonicalTemplate } from '../template.js';

const AGENTS_FILE = 'AGENTS.md';
const OPENCODE_JSON = 'opencode.json';

/** Section marker used to delimit PM CLI content inside AGENTS.md. */
const SECTION_START = '<!-- pm-cli:start -->';
const SECTION_END = '<!-- pm-cli:end -->';

/** Header prepended to the PM section. */
const SECTION_HEADER = `## PM CLI Integration

This project uses \`pm\` CLI for project management. Follow these instructions when working on tasks.

`;

/**
 * OpenCode adapter.
 *
 * Generates or updates two files:
 * 1. `AGENTS.md` with PM CLI section markers (same format as Codex)
 * 2. `opencode.json` with an `instructions` field
 *
 * Detection prioritises `opencode.json` (high confidence) over
 * bare `AGENTS.md` (low confidence) to disambiguate from Codex.
 */
export class OpenCodeAdapter implements ClientAdapter {
    detect(projectRoot: string): boolean {
        const opencodeJson = path.join(projectRoot, OPENCODE_JSON);
        const agentsFile = path.join(projectRoot, AGENTS_FILE);

        // High confidence: opencode.json exists
        if (fs.existsSync(opencodeJson)) return true;

        // Low confidence: AGENTS.md without opencode.json
        return fs.existsSync(agentsFile);
    }

    generate(projectRoot: string, templatePath: string): GenerateResult {
        const files: string[] = [];
        const warnings: string[] = [];

        const templateContent = loadCanonicalTemplate(projectRoot);

        // --- 1. AGENTS.md (same section-marker pattern as Codex) ---
        const agentsPath = path.join(projectRoot, AGENTS_FILE);
        const pmBlock = [SECTION_START, SECTION_HEADER + templateContent, SECTION_END].join('\n');

        if (fs.existsSync(agentsPath)) {
            const existing = fs.readFileSync(agentsPath, 'utf-8');

            if (existing.includes(SECTION_START)) {
                const regex = new RegExp(
                    `${escapeRegex(SECTION_START)}[\\s\\S]*?${escapeRegex(SECTION_END)}`,
                );
                const updated = existing.replace(regex, pmBlock);
                fs.writeFileSync(agentsPath, updated, 'utf-8');
                warnings.push('Updated existing PM CLI section in AGENTS.md');
            } else {
                const separator = existing.endsWith('\n') ? '\n' : '\n\n';
                fs.writeFileSync(agentsPath, existing + separator + pmBlock + '\n', 'utf-8');
                warnings.push('Appended PM CLI section to existing AGENTS.md');
            }
        } else {
            const content = `# Agents Guide\n\n${pmBlock}\n`;
            fs.writeFileSync(agentsPath, content, 'utf-8');
        }

        files.push(agentsPath);

        // --- 2. opencode.json ---
        const opencodeJsonPath = path.join(projectRoot, OPENCODE_JSON);

        if (fs.existsSync(opencodeJsonPath)) {
            try {
                const raw = fs.readFileSync(opencodeJsonPath, 'utf-8');
                const config = JSON.parse(raw);
                config.instructions = 'See AGENTS.md for project management instructions.';
                fs.writeFileSync(opencodeJsonPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
                warnings.push('Updated instructions field in existing opencode.json');
            } catch {
                warnings.push('Could not parse existing opencode.json — created backup and overwrote');
                fs.copyFileSync(opencodeJsonPath, opencodeJsonPath + '.bak');
                const config = { instructions: 'See AGENTS.md for project management instructions.' };
                fs.writeFileSync(opencodeJsonPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
            }
        } else {
            const config = { instructions: 'See AGENTS.md for project management instructions.' };
            fs.writeFileSync(opencodeJsonPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
        }

        files.push(opencodeJsonPath);

        return { files, warnings };
    }

    clean(projectRoot: string): CleanResult {
        const removed: string[] = [];
        const skipped: string[] = [];

        // --- 1. Clean PM section from AGENTS.md ---
        const agentsPath = path.join(projectRoot, AGENTS_FILE);

        if (fs.existsSync(agentsPath)) {
            const content = fs.readFileSync(agentsPath, 'utf-8');

            if (content.includes(SECTION_START)) {
                const regex = new RegExp(
                    `\\n?${escapeRegex(SECTION_START)}[\\s\\S]*?${escapeRegex(SECTION_END)}\\n?`,
                );
                const cleaned = content.replace(regex, '').trim();

                if (cleaned.length === 0 || cleaned === '# Agents Guide') {
                    fs.unlinkSync(agentsPath);
                    removed.push(agentsPath);
                } else {
                    fs.writeFileSync(agentsPath, cleaned + '\n', 'utf-8');
                    removed.push(agentsPath);
                }
            } else {
                skipped.push(agentsPath);
            }
        }

        // --- 2. Clean instructions from opencode.json ---
        const opencodeJsonPath = path.join(projectRoot, OPENCODE_JSON);

        if (fs.existsSync(opencodeJsonPath)) {
            try {
                const raw = fs.readFileSync(opencodeJsonPath, 'utf-8');
                const config = JSON.parse(raw);
                delete config.instructions;

                if (Object.keys(config).length === 0) {
                    // Config was only the instructions field — remove file
                    fs.unlinkSync(opencodeJsonPath);
                    removed.push(opencodeJsonPath);
                } else {
                    // Preserve other config, just strip instructions
                    fs.writeFileSync(opencodeJsonPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
                    removed.push(opencodeJsonPath);
                }
            } catch {
                skipped.push(opencodeJsonPath);
            }
        }

        return { removed, skipped };
    }

    getConfig(): ClientConfig {
        return {
            type: 'opencode',
            name: 'OpenCode',
            configPaths: [AGENTS_FILE, OPENCODE_JSON],
            configFormat: 'markdown+json',
        };
    }
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

registerAdapter('opencode', () => new OpenCodeAdapter());
