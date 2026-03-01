import * as fs from 'fs';
import * as path from 'path';
import type { ClientAdapter, ClientConfig, GenerateResult, CleanResult } from '../types.js';
import { registerAdapter } from '../registry.js';
import { loadCanonicalTemplate, loadWorkflowTemplates, loadSkillTemplates } from '../template.js';

const RULES_DIR = '.cursor/rules';
const RULES_FILE = 'pm-guide.mdc';
const RULES_PATH = `${RULES_DIR}/${RULES_FILE}`;

/** MDC-format YAML frontmatter for Cursor rules. */
const FRONTMATTER = `---
description: PM CLI agent workflow guide — command reference, usage patterns, and best practices
globs: "**/*"
alwaysApply: true
---

`;

/**
 * Cursor adapter.
 *
 * Generates \`.cursor/rules/pm-guide.mdc\` with MDC-format YAML frontmatter
 * wrapping the canonical AGENT_INSTRUCTIONS template. Also generates 
 * individual .mdc files for workflows and skills.
 */
export class CursorAdapter implements ClientAdapter {
    detect(projectRoot: string): boolean {
        const cursorDir = path.join(projectRoot, '.cursor');
        const cursorIgnore = path.join(projectRoot, '.cursorignore');

        return (
            (fs.existsSync(cursorDir) && fs.statSync(cursorDir).isDirectory()) ||
            fs.existsSync(cursorIgnore)
        );
    }

    generate(projectRoot: string, templatePath: string): GenerateResult {
        const files: string[] = [];
        const warnings: string[] = [];

        const templateContent = loadCanonicalTemplate(projectRoot);

        // Ensure .cursor/rules/ exists
        const rulesDir = path.join(projectRoot, RULES_DIR);
        fs.mkdirSync(rulesDir, { recursive: true });

        // Write pm-guide.mdc with MDC frontmatter + canonical content
        const outputPath = path.join(projectRoot, RULES_PATH);

        if (fs.existsSync(outputPath)) {
            warnings.push(`Overwriting existing ${RULES_PATH}`);
        }

        const content = FRONTMATTER + templateContent;
        fs.writeFileSync(outputPath, content, 'utf-8');
        files.push(outputPath);

        // Helper to process markdown files into MDC
        const processMarkdown = (items: Map<string, string>) => {
            for (const [filename, fileContent] of items) {
                // Extract description from original frontmatter
                const fmMatch = fileContent.match(/^---\s*\n([\s\S]*?)\n---/);
                let description = '';
                let body = fileContent;
                if (fmMatch) {
                    const descMatch = fmMatch[1].match(/^description:\s*(.+)$/m);
                    if (descMatch) {
                        description = descMatch[1].trim();
                    }
                    // Strip original frontmatter, keep body
                    body = fileContent.slice(fmMatch[0].length).trimStart();
                }

                // Build MDC frontmatter (alwaysApply false for sub-skills/workflows, they are loaded via glob context by Cursor if needed, or by active prompt)
                const mdcContent = `---\ndescription: ${description}\nglobs: "**/*"\nalwaysApply: false\n---\n\n${body}`;

                // Write as .mdc
                const mdcFilename = filename.replace(/\.md$/, '.mdc');
                const mdcPath = path.join(projectRoot, RULES_DIR, mdcFilename);
                if (fs.existsSync(mdcPath)) {
                    warnings.push(`Overwriting existing ${RULES_DIR}/${mdcFilename}`);
                }
                fs.writeFileSync(mdcPath, mdcContent, 'utf-8');
                files.push(mdcPath);
            }
        };

        // --- Individual workflow .mdc files ---
        processMarkdown(loadWorkflowTemplates(projectRoot));

        // --- Individual skill .mdc files ---
        processMarkdown(loadSkillTemplates(projectRoot));

        return { files, warnings };
    }

    clean(projectRoot: string): CleanResult {
        const removed: string[] = [];
        const skipped: string[] = [];

        const outputPath = path.join(projectRoot, RULES_PATH);

        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            removed.push(outputPath);
        } else {
            skipped.push(outputPath);
        }

        // Remove individual workflow/skill .mdc files (pm-*.mdc but not pm-guide.mdc)
        const cursorRulesDir = path.join(projectRoot, RULES_DIR);
        if (fs.existsSync(cursorRulesDir)) {
            for (const entry of fs.readdirSync(cursorRulesDir)) {
                if (entry.startsWith('pm-') && entry.endsWith('.mdc') && entry !== RULES_FILE) {
                    const wfPath = path.join(cursorRulesDir, entry);
                    fs.unlinkSync(wfPath);
                    removed.push(wfPath);
                }
            }
        }

        // Do NOT remove .cursor/ directory — may have other files

        return { removed, skipped };
    }

    getConfig(): ClientConfig {
        return {
            type: 'cursor',
            name: 'Cursor',
            configPaths: [RULES_PATH, '.cursor/rules/pm-*.mdc'],
            configFormat: 'mdc+yaml-frontmatter',
        };
    }
}

registerAdapter('cursor', () => new CursorAdapter());
