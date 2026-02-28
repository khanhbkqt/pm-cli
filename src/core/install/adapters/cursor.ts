import * as fs from 'fs';
import * as path from 'path';
import type { ClientAdapter, ClientConfig, GenerateResult, CleanResult } from '../types.js';
import { registerAdapter } from '../registry.js';
import { loadCanonicalTemplate } from '../template.js';

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
 * Generates `.cursor/rules/pm-guide.mdc` with MDC-format YAML frontmatter
 * wrapping the canonical AGENT_INSTRUCTIONS template.
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

        // Do NOT remove .cursor/ directory — may have other files

        return { removed, skipped };
    }

    getConfig(): ClientConfig {
        return {
            type: 'cursor',
            name: 'Cursor',
            configPaths: [RULES_PATH],
            configFormat: 'mdc+yaml-frontmatter',
        };
    }
}

registerAdapter('cursor', () => new CursorAdapter());
