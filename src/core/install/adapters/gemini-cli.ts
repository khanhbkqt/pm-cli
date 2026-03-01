import * as fs from 'fs';
import * as path from 'path';
import type { ClientAdapter, ClientConfig, GenerateResult, CleanResult } from '../types.js';
import { registerAdapter } from '../registry.js';
import { loadCanonicalTemplate, loadWorkflowTemplates, loadSkillTemplates } from '../template.js';
import { buildWorkflowIndex } from '../workflow-index.js';

const GEMINI_FILE = 'GEMINI.md';

const WORKFLOW_DIR = '.gemini/workflows';
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

        // --- Individual workflow files ---
        const workflowDir = path.join(projectRoot, WORKFLOW_DIR);
        fs.mkdirSync(workflowDir, { recursive: true });
        for (const [filename, content] of workflows) {
            const wfPath = path.join(workflowDir, filename);
            if (fs.existsSync(wfPath)) {
                warnings.push(`Overwriting existing ${WORKFLOW_DIR}/${filename}`);
            }
            fs.writeFileSync(wfPath, content, 'utf-8');
            files.push(wfPath);
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

        // Remove individual workflow files (pm-*.md)
        const wfDir = path.join(projectRoot, WORKFLOW_DIR);
        if (fs.existsSync(wfDir)) {
            for (const entry of fs.readdirSync(wfDir)) {
                if (entry.startsWith('pm-') && entry.endsWith('.md')) {
                    const wfPath = path.join(wfDir, entry);
                    fs.unlinkSync(wfPath);
                    removed.push(wfPath);
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
            configPaths: [GEMINI_FILE, `${WORKFLOW_DIR}/pm-*.md`, `${SKILLS_DIR}/pm-*.md`],
            configFormat: 'markdown',
        };
    }
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

registerAdapter('gemini-cli', () => new GeminiCliAdapter());
