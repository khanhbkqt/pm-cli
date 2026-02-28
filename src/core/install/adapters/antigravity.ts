import * as fs from 'fs';
import * as path from 'path';
import type { ClientAdapter, ClientConfig, GenerateResult, CleanResult } from '../types.js';
import { registerAdapter } from '../registry.js';
import { loadCanonicalTemplate } from '../template.js';

const WORKFLOW_DIR = '.agent/workflows';
const WORKFLOW_FILE = 'pm-guide.md';
const WORKFLOW_PATH = `${WORKFLOW_DIR}/${WORKFLOW_FILE}`;

/** YAML frontmatter prepended to the workflow file. */
const FRONTMATTER = `---
description: PM CLI agent workflow guide — command reference, usage patterns, and best practices
---

`;

/**
 * Antigravity adapter.
 *
 * Generates `.agent/workflows/pm-guide.md` with YAML frontmatter
 * wrapping the canonical AGENT_INSTRUCTIONS template.
 */
export class AntigravityAdapter implements ClientAdapter {
    detect(projectRoot: string): boolean {
        const agentDir = path.join(projectRoot, '.agent');
        const geminiDir = path.join(projectRoot, '.gemini');

        return (
            (fs.existsSync(agentDir) && fs.statSync(agentDir).isDirectory()) ||
            (fs.existsSync(geminiDir) && fs.statSync(geminiDir).isDirectory())
        );
    }

    generate(projectRoot: string, templatePath: string): GenerateResult {
        const files: string[] = [];
        const warnings: string[] = [];

        const templateContent = loadCanonicalTemplate(projectRoot);

        // Ensure .agent/workflows/ exists
        const workflowDir = path.join(projectRoot, WORKFLOW_DIR);
        fs.mkdirSync(workflowDir, { recursive: true });

        // Write pm-guide.md with frontmatter + canonical content
        const outputPath = path.join(projectRoot, WORKFLOW_PATH);

        if (fs.existsSync(outputPath)) {
            warnings.push(`Overwriting existing ${WORKFLOW_PATH}`);
        }

        const content = FRONTMATTER + templateContent;
        fs.writeFileSync(outputPath, content, 'utf-8');
        files.push(outputPath);

        return { files, warnings };
    }

    clean(projectRoot: string): CleanResult {
        const removed: string[] = [];
        const skipped: string[] = [];

        const outputPath = path.join(projectRoot, WORKFLOW_PATH);

        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            removed.push(outputPath);
        } else {
            skipped.push(outputPath);
        }

        // Do NOT remove .agent/ or .gemini/ directories — may have other files

        return { removed, skipped };
    }

    getConfig(): ClientConfig {
        return {
            type: 'antigravity',
            name: 'Antigravity',
            configPaths: [WORKFLOW_PATH],
            configFormat: 'markdown+yaml-frontmatter',
        };
    }
}

registerAdapter('antigravity', () => new AntigravityAdapter());
