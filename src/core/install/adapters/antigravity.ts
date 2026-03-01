import * as fs from 'fs';
import * as path from 'path';
import type { ClientAdapter, ClientConfig, GenerateResult, CleanResult } from '../types.js';
import { registerAdapter } from '../registry.js';
import { loadCanonicalTemplate, loadWorkflowTemplates } from '../template.js';

const WORKFLOW_DIR = '.agent/workflows';
const WORKFLOW_FILE = 'pm-guide.md';
const WORKFLOW_PATH = `${WORKFLOW_DIR}/${WORKFLOW_FILE}`;

const RULES_DIR = '.agent/rules';
const RULES_FILE = 'pm-cli.md';
const RULES_PATH = `${RULES_DIR}/${RULES_FILE}`;

/** YAML frontmatter prepended to the workflow file. */
const WORKFLOW_FRONTMATTER = `---
description: PM CLI agent workflow guide — command reference, usage patterns, and best practices
---

`;

/** Rule file content — a concise always-active rule that points to the full workflow. */
const RULE_CONTENT = `# PM CLI Project Management

This project uses the \`pm\` CLI for project management. Always follow the PM CLI workflow guide when working on tasks.

- Before starting work, run \`pm agent whoami\` to check your identity or \`pm agent register\` to register.
- Use \`pm task list --json\` to discover tasks and \`pm task update\` to report progress.
- Share important context with \`pm context set\` so other agents can find it.
- See the full workflow guide at \`.agent/workflows/pm-guide.md\` for detailed patterns.
`;

/**
 * Antigravity adapter.
 *
 * Generates two files:
 * 1. \`.agent/workflows/pm-guide.md\` — full AGENT_INSTRUCTIONS with YAML frontmatter
 * 2. \`.agent/rules/pm-cli.md\` — always-active rule with key instructions
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

        // --- 1. Workflow file (full template) ---
        const workflowDir = path.join(projectRoot, WORKFLOW_DIR);
        fs.mkdirSync(workflowDir, { recursive: true });

        const workflowPath = path.join(projectRoot, WORKFLOW_PATH);
        if (fs.existsSync(workflowPath)) {
            warnings.push(`Overwriting existing ${WORKFLOW_PATH}`);
        }

        const workflowContent = WORKFLOW_FRONTMATTER + templateContent;
        fs.writeFileSync(workflowPath, workflowContent, 'utf-8');
        files.push(workflowPath);

        // --- 2. Rule file (always-active) ---
        const rulesDir = path.join(projectRoot, RULES_DIR);
        fs.mkdirSync(rulesDir, { recursive: true });

        const rulePath = path.join(projectRoot, RULES_PATH);
        if (fs.existsSync(rulePath)) {
            warnings.push(`Overwriting existing ${RULES_PATH}`);
        }

        fs.writeFileSync(rulePath, RULE_CONTENT, 'utf-8');
        files.push(rulePath);

        // --- 3. Individual workflow files ---
        const workflows = loadWorkflowTemplates(projectRoot);
        for (const [filename, content] of workflows) {
            const wfPath = path.join(projectRoot, WORKFLOW_DIR, filename);
            if (fs.existsSync(wfPath)) {
                warnings.push(`Overwriting existing ${WORKFLOW_DIR}/${filename}`);
            }
            fs.writeFileSync(wfPath, content, 'utf-8');
            files.push(wfPath);
        }

        return { files, warnings };
    }

    clean(projectRoot: string): CleanResult {
        const removed: string[] = [];
        const skipped: string[] = [];

        // Remove workflow file
        const workflowPath = path.join(projectRoot, WORKFLOW_PATH);
        if (fs.existsSync(workflowPath)) {
            fs.unlinkSync(workflowPath);
            removed.push(workflowPath);
        } else {
            skipped.push(workflowPath);
        }

        // Remove rule file
        const rulePath = path.join(projectRoot, RULES_PATH);
        if (fs.existsSync(rulePath)) {
            fs.unlinkSync(rulePath);
            removed.push(rulePath);
        } else {
            skipped.push(rulePath);
        }

        // Remove individual workflow files (pm-*.md but not pm-guide.md)
        const wfDir = path.join(projectRoot, WORKFLOW_DIR);
        if (fs.existsSync(wfDir)) {
            for (const entry of fs.readdirSync(wfDir)) {
                if (entry.startsWith('pm-') && entry.endsWith('.md') && entry !== WORKFLOW_FILE) {
                    const wfPath = path.join(wfDir, entry);
                    fs.unlinkSync(wfPath);
                    removed.push(wfPath);
                }
            }
        }

        // Do NOT remove .agent/ directories — may have other files

        return { removed, skipped };
    }

    getConfig(): ClientConfig {
        return {
            type: 'antigravity',
            name: 'Antigravity',
            configPaths: [WORKFLOW_PATH, RULES_PATH, '.agent/workflows/pm-*.md'],
            configFormat: 'markdown+yaml-frontmatter',
        };
    }
}

registerAdapter('antigravity', () => new AntigravityAdapter());
