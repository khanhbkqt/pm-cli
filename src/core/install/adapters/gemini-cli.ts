import * as fs from 'fs';
import * as path from 'path';
import type { ClientAdapter, ClientConfig, GenerateResult, CleanResult } from '../types.js';
import { registerAdapter } from '../registry.js';
import { loadCanonicalTemplate, loadWorkflowTemplates, loadSkillTemplates } from '../template.js';
import { buildWorkflowIndex } from '../workflow-index.js';

const GEMINI_FILE = 'GEMINI.md';

const COMMANDS_DIR = '.gemini/commands/pm';
const SKILLS_DIR = '.gemini/skills';

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

        const workflows = loadWorkflowTemplates(projectRoot);
        const workflowIndex = buildWorkflowIndex(workflows);
        const pmBlock = [SECTION_START, SECTION_HEADER + templateContent + '\n\n' + workflowIndex, SECTION_END].join('\n');

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

        // --- Individual workflow files → .gemini/commands/pm/<command>.md ---
        const commandsDir = path.join(projectRoot, COMMANDS_DIR);
        fs.mkdirSync(commandsDir, { recursive: true });
        for (const [filename, content] of workflows) {
            // Strip the 'pm-' prefix and change extension to .toml: pm-execute-phase.md → execute-phase.toml
            const commandFilename = filename.replace(/^pm-/, '').replace(/\.md$/, '.toml');
            const cmdPath = path.join(commandsDir, commandFilename);
            if (fs.existsSync(cmdPath)) {
                warnings.push(`Overwriting existing ${COMMANDS_DIR}/${commandFilename}`);
            }
            fs.writeFileSync(cmdPath, content, 'utf-8');
            files.push(cmdPath);
        }

        // --- Individual skill files ---
        const skillsDir = path.join(projectRoot, SKILLS_DIR);
        fs.mkdirSync(skillsDir, { recursive: true });
        const skills = loadSkillTemplates(projectRoot);
        for (const [filename, content] of skills) {
            const skillPath = path.join(skillsDir, filename);
            if (fs.existsSync(skillPath)) {
                warnings.push(`Overwriting existing ${SKILLS_DIR}/${filename}`);
            }
            fs.writeFileSync(skillPath, content, 'utf-8');
            files.push(skillPath);
        }

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

        // Remove workflow command files (.gemini/commands/pm/*.md)
        const cmdDir = path.join(projectRoot, COMMANDS_DIR);
        if (fs.existsSync(cmdDir)) {
            for (const entry of fs.readdirSync(cmdDir)) {
                if (entry.endsWith('.toml')) {
                    const cmdPath = path.join(cmdDir, entry);
                    fs.unlinkSync(cmdPath);
                    removed.push(cmdPath);
                }
            }
        }

        // Remove individual skill files (pm-*.md)
        const skDir = path.join(projectRoot, SKILLS_DIR);
        if (fs.existsSync(skDir)) {
            for (const entry of fs.readdirSync(skDir)) {
                if (entry.startsWith('pm-') && entry.endsWith('.md')) {
                    const skPath = path.join(skDir, entry);
                    fs.unlinkSync(skPath);
                    removed.push(skPath);
                }
            }
        }

        // Do NOT remove .agent/ directories — may have other files

        return { removed, skipped };
    }

    getConfig(): ClientConfig {
        return {
            type: 'gemini-cli',
            name: 'Gemini CLI',
            configPaths: [GEMINI_FILE, `${COMMANDS_DIR}/*.toml`, `${SKILLS_DIR}/pm-*.md`],
            configFormat: 'markdown',
        };
    }
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

registerAdapter('gemini-cli', () => new GeminiCliAdapter());
