import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Adapters (side-effect: self-register)
import '../src/core/install/adapters/antigravity.js';
import '../src/core/install/adapters/cursor.js';
import '../src/core/install/adapters/claude-code.js';

import { getAdapter } from '../src/core/install/registry.js';

/**
 * Seed a minimal AGENT_INSTRUCTIONS.md and workflow templates
 * so adapters can call loadCanonicalTemplate() and loadWorkflowTemplates().
 */
function seedTemplate(projectRoot: string): void {
    const templateDir = path.join(projectRoot, 'docs', 'agent-guide');
    fs.mkdirSync(templateDir, { recursive: true });
    const templatePath = path.join(templateDir, 'AGENT_INSTRUCTIONS.md');
    fs.writeFileSync(templatePath, '# PM CLI Agent Instructions\n\nSample template.\n', 'utf-8');

    // Seed workflow files
    const workflowsDir = path.join(templateDir, 'workflows');
    fs.mkdirSync(workflowsDir, { recursive: true });

    const workflows = [
        'pm-add-phase', 'pm-add-todo', 'pm-audit-milestone', 'pm-check-todos',
        'pm-complete-milestone', 'pm-debug', 'pm-discuss-phase', 'pm-execute-phase',
        'pm-new-milestone', 'pm-new-project', 'pm-pause', 'pm-plan-phase',
        'pm-progress', 'pm-resume', 'pm-verify-work',
    ];

    for (const wf of workflows) {
        const desc = wf.replace('pm-', '').replace(/-/g, ' ');
        const content = `---\ndescription: ${desc}\n---\n\n# ${desc}\n\nWorkflow instructions.\n`;
        fs.writeFileSync(path.join(workflowsDir, `${wf}.md`), content, 'utf-8');
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Antigravity adapter — multi-file workflows
// ────────────────────────────────────────────────────────────────────────────

describe('AntigravityAdapter multi-file workflows', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-mf-ag-'));
        seedTemplate(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('generates pm-guide.md + pm-cli.md + 15 workflow files', () => {
        const adapter = getAdapter('antigravity');
        const result = adapter.generate(tempDir, '');

        // pm-guide.md
        expect(fs.existsSync(path.join(tempDir, '.agent/workflows/pm-guide.md'))).toBe(true);
        // pm-cli.md
        expect(fs.existsSync(path.join(tempDir, '.agent/rules/pm-cli.md'))).toBe(true);

        // 15 individual workflow files
        const wfDir = path.join(tempDir, '.agent/workflows');
        const wfFiles = fs.readdirSync(wfDir).filter(f => f.startsWith('pm-') && f.endsWith('.md') && f !== 'pm-guide.md');
        expect(wfFiles.length).toBe(15);

        // All files are in the result
        expect(result.files.length).toBe(17); // pm-guide + pm-cli + 15 workflows
    });

    it('workflow files preserve their original content', () => {
        const adapter = getAdapter('antigravity');
        adapter.generate(tempDir, '');

        const wfPath = path.join(tempDir, '.agent/workflows/pm-plan-phase.md');
        expect(fs.existsSync(wfPath)).toBe(true);
        const content = fs.readFileSync(wfPath, 'utf-8');
        expect(content).toContain('description:');
        expect(content).toContain('plan phase');
    });

    it('clean() removes all pm-* files', () => {
        const adapter = getAdapter('antigravity');
        adapter.generate(tempDir, '');

        const result = adapter.clean(tempDir);

        // All workflow files should be removed
        const wfDir = path.join(tempDir, '.agent/workflows');
        const remaining = fs.readdirSync(wfDir).filter(f => f.startsWith('pm-'));
        expect(remaining.length).toBe(0);

        // Should have removed 17 files total (pm-guide + pm-cli + 15 workflows)
        expect(result.removed.length).toBe(17);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// Cursor adapter — multi-file workflows
// ────────────────────────────────────────────────────────────────────────────

describe('CursorAdapter multi-file workflows', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-mf-cur-'));
        seedTemplate(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('generates pm-guide.mdc + 15 workflow .mdc files', () => {
        const adapter = getAdapter('cursor');
        const result = adapter.generate(tempDir, '');

        // pm-guide.mdc
        expect(fs.existsSync(path.join(tempDir, '.cursor/rules/pm-guide.mdc'))).toBe(true);

        // 15 individual .mdc workflow files
        const rulesDir = path.join(tempDir, '.cursor/rules');
        const mdcFiles = fs.readdirSync(rulesDir).filter(f => f.startsWith('pm-') && f.endsWith('.mdc') && f !== 'pm-guide.mdc');
        expect(mdcFiles.length).toBe(15);

        // Total: pm-guide.mdc + 15 workflows = 16
        expect(result.files.length).toBe(16);
    });

    it('each .mdc file has alwaysApply: true in frontmatter', () => {
        const adapter = getAdapter('cursor');
        adapter.generate(tempDir, '');

        const rulesDir = path.join(tempDir, '.cursor/rules');
        const mdcFiles = fs.readdirSync(rulesDir).filter(f => f.startsWith('pm-') && f.endsWith('.mdc'));

        for (const file of mdcFiles) {
            const content = fs.readFileSync(path.join(rulesDir, file), 'utf-8');
            expect(content).toContain('alwaysApply: true');
        }
    });

    it('clean() removes all pm-*.mdc files', () => {
        const adapter = getAdapter('cursor');
        adapter.generate(tempDir, '');

        const result = adapter.clean(tempDir);

        const rulesDir = path.join(tempDir, '.cursor/rules');
        const remaining = fs.readdirSync(rulesDir).filter(f => f.startsWith('pm-'));
        expect(remaining.length).toBe(0);

        // 16 files removed (pm-guide.mdc + 15 workflows)
        expect(result.removed.length).toBe(16);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// Claude Code adapter — workflow index in PM section
// ────────────────────────────────────────────────────────────────────────────

describe('ClaudeCodeAdapter workflow index', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-mf-cc-'));
        seedTemplate(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('CLAUDE.md contains Available Workflows section', () => {
        const adapter = getAdapter('claude-code');
        adapter.generate(tempDir, '');

        const content = fs.readFileSync(path.join(tempDir, 'CLAUDE.md'), 'utf-8');
        expect(content).toContain('## Available Workflows');
    });

    it('workflow index table has 15 rows', () => {
        const adapter = getAdapter('claude-code');
        adapter.generate(tempDir, '');

        const content = fs.readFileSync(path.join(tempDir, 'CLAUDE.md'), 'utf-8');
        // Count data rows in the table (lines starting with "| " excluding header and separator)
        const dataRows = content.split('\n').filter(
            line => line.startsWith('| ') && !line.startsWith('| Workflow') && !line.startsWith('|---')
        );
        expect(dataRows.length).toBe(15);
    });

    it('clean() removes PM section including workflow index', () => {
        const adapter = getAdapter('claude-code');
        adapter.generate(tempDir, '');
        adapter.clean(tempDir);

        // File should be deleted entirely (only had PM content)
        expect(fs.existsSync(path.join(tempDir, 'CLAUDE.md'))).toBe(false);
    });
});
