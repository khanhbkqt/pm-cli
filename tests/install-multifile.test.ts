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
        'pm-add-phase', 'pm-add-todo', 'pm-audit-milestone', 'pm-brainstorm',
        'pm-check-todos', 'pm-complete-milestone', 'pm-debug', 'pm-discuss-phase',
        'pm-execute-phase', 'pm-help', 'pm-insert-phase', 'pm-install',
        'pm-list-phase-assumptions', 'pm-map', 'pm-new-milestone', 'pm-new-project',
        'pm-pause', 'pm-plan-milestone-gaps', 'pm-plan-phase', 'pm-progress',
        'pm-remove-phase', 'pm-research-phase', 'pm-resume', 'pm-update',
        'pm-verify-work', 'pm-web-search', 'pm-whats-new',
    ];

    for (const wf of workflows) {
        const desc = wf.replace('pm-', '').replace(/-/g, ' ');
        const content = `---\ndescription: ${desc}\n---\n\n# ${desc}\n\nWorkflow instructions.\n`;
        fs.writeFileSync(path.join(workflowsDir, `${wf}.md`), content, 'utf-8');
    }

    // Seed skill files
    const skillsDir = path.join(templateDir, 'skills');
    fs.mkdirSync(skillsDir, { recursive: true });

    const skills = ['pm-collaboration', 'pm-context', 'pm-errors', 'pm-identity'];

    for (const skill of skills) {
        const desc = skill.replace('pm-', '').replace(/-/g, ' ');
        const content = `---\ndescription: PM ${desc}\n---\n\n# PM ${desc}\n\nSkill instructions.\n`;
        fs.writeFileSync(path.join(skillsDir, `${skill}.md`), content, 'utf-8');
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

    it('generates pm-guide.md + pm-cli.md + 27 workflow + 4 skill files', () => {
        const adapter = getAdapter('antigravity');
        const result = adapter.generate(tempDir, '');

        // pm-guide.md
        expect(fs.existsSync(path.join(tempDir, '.agent/workflows/pm-guide.md'))).toBe(true);
        // pm-cli.md
        expect(fs.existsSync(path.join(tempDir, '.agent/rules/pm-cli.md'))).toBe(true);

        // 27 individual workflow files
        const wfDir = path.join(tempDir, '.agent/workflows');
        const wfFiles = fs.readdirSync(wfDir).filter(f => f.startsWith('pm-') && f.endsWith('.md') && f !== 'pm-guide.md');
        expect(wfFiles.length).toBe(27);

        // All files are in the result
        expect(result.files.length).toBe(33); // pm-guide + pm-cli + 27 workflows + 4 skills
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

        // Should have removed 33 files total (pm-guide + pm-cli + 27 workflows + 4 skills)
        expect(result.removed.length).toBe(33);
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

    it('generates pm-guide.mdc + 27 workflow + 4 skill .mdc files', () => {
        const adapter = getAdapter('cursor');
        const result = adapter.generate(tempDir, '');

        // pm-guide.mdc
        expect(fs.existsSync(path.join(tempDir, '.cursor/rules/pm-guide.mdc'))).toBe(true);

        // 31 individual .mdc files (27 workflows + 4 skills)
        const rulesDir = path.join(tempDir, '.cursor/rules');
        const mdcFiles = fs.readdirSync(rulesDir).filter(f => f.startsWith('pm-') && f.endsWith('.mdc') && f !== 'pm-guide.mdc');
        expect(mdcFiles.length).toBe(31);

        // Total: pm-guide.mdc + 31 = 32
        expect(result.files.length).toBe(32);
    });

    it('each .mdc file has alwaysApply: false in frontmatter', () => {
        const adapter = getAdapter('cursor');
        adapter.generate(tempDir, '');

        const rulesDir = path.join(tempDir, '.cursor/rules');
        const mdcFiles = fs.readdirSync(rulesDir).filter(f => f.startsWith('pm-') && f.endsWith('.mdc') && f !== 'pm-guide.mdc');

        for (const file of mdcFiles) {
            const content = fs.readFileSync(path.join(rulesDir, file), 'utf-8');
            expect(content).toContain('alwaysApply: false');
        }
    });

    it('clean() removes all pm-*.mdc files', () => {
        const adapter = getAdapter('cursor');
        adapter.generate(tempDir, '');

        const result = adapter.clean(tempDir);

        const rulesDir = path.join(tempDir, '.cursor/rules');
        const remaining = fs.readdirSync(rulesDir).filter(f => f.startsWith('pm-'));
        expect(remaining.length).toBe(0);

        // 32 files removed (pm-guide.mdc + 27 workflows + 4 skills)
        expect(result.removed.length).toBe(32);
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

    it('workflow index table has 27 rows', () => {
        const adapter = getAdapter('claude-code');
        adapter.generate(tempDir, '');

        const content = fs.readFileSync(path.join(tempDir, 'CLAUDE.md'), 'utf-8');
        // Count data rows in the table (lines starting with "| " excluding header and separator)
        const dataRows = content.split('\n').filter(
            line => line.startsWith('| ') && !line.startsWith('| Workflow') && !line.startsWith('|---')
        );
        expect(dataRows.length).toBe(27);
    });

    it('clean() removes PM section including workflow index', () => {
        const adapter = getAdapter('claude-code');
        adapter.generate(tempDir, '');
        adapter.clean(tempDir);

        // File should be deleted entirely (only had PM content)
        expect(fs.existsSync(path.join(tempDir, 'CLAUDE.md'))).toBe(false);
    });
});
