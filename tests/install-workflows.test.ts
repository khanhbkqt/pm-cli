import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

import { getWorkflowsDir, loadWorkflowTemplates } from '../src/core/install/template.js';
import { buildWorkflowIndex } from '../src/core/install/workflow-index.js';

// ────────────────────────────────────────────────────────────────────────────
// loadWorkflowTemplates()
// ────────────────────────────────────────────────────────────────────────────

describe('loadWorkflowTemplates', () => {
    it('returns a Map with 15 entries', () => {
        const workflows = loadWorkflowTemplates();
        expect(workflows.size).toBe(15);
    });

    it('all keys match pm-*.md pattern', () => {
        const workflows = loadWorkflowTemplates();
        for (const key of workflows.keys()) {
            expect(key).toMatch(/^pm-.*\.md$/);
        }
    });

    it('all values are non-empty strings with description frontmatter', () => {
        const workflows = loadWorkflowTemplates();
        for (const [filename, content] of workflows) {
            expect(content.length).toBeGreaterThan(0);
            expect(content).toContain('description:');
        }
    });
});

// ────────────────────────────────────────────────────────────────────────────
// getWorkflowsDir()
// ────────────────────────────────────────────────────────────────────────────

describe('getWorkflowsDir', () => {
    it('returns path ending in docs/agent-guide/workflows', () => {
        const dir = getWorkflowsDir();
        expect(dir).toMatch(/docs\/agent-guide\/workflows$/);
    });

    it('returned directory exists on disk', () => {
        const dir = getWorkflowsDir();
        expect(fs.existsSync(dir)).toBe(true);
        expect(fs.statSync(dir).isDirectory()).toBe(true);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// buildWorkflowIndex()
// ────────────────────────────────────────────────────────────────────────────

describe('buildWorkflowIndex', () => {
    it('generates markdown with Available Workflows header', () => {
        const workflows = new Map<string, string>([
            ['pm-plan-phase.md', '---\ndescription: Create plans for a phase\n---\n\n# Plan Phase'],
            ['pm-execute-phase.md', '---\ndescription: Execute plans within a phase\n---\n\n# Execute Phase'],
        ]);

        const index = buildWorkflowIndex(workflows);
        expect(index).toContain('## Available Workflows');
    });

    it('contains table headers', () => {
        const workflows = new Map<string, string>([
            ['pm-test.md', '---\ndescription: Test workflow\n---\n\n# Test'],
        ]);

        const index = buildWorkflowIndex(workflows);
        expect(index).toContain('| Workflow | Description |');
        expect(index).toContain('|----------|-------------|');
    });

    it('contains one row per workflow entry', () => {
        const workflows = new Map<string, string>([
            ['pm-alpha.md', '---\ndescription: Alpha workflow\n---\n\n# Alpha'],
            ['pm-beta.md', '---\ndescription: Beta workflow\n---\n\n# Beta'],
            ['pm-gamma.md', '---\ndescription: Gamma workflow\n---\n\n# Gamma'],
        ]);

        const index = buildWorkflowIndex(workflows);
        expect(index).toContain('| alpha | Alpha workflow |');
        expect(index).toContain('| beta | Beta workflow |');
        expect(index).toContain('| gamma | Gamma workflow |');
    });

    it('sorts entries alphabetically', () => {
        const workflows = new Map<string, string>([
            ['pm-zebra.md', '---\ndescription: Zebra\n---\n\n# Z'],
            ['pm-alpha.md', '---\ndescription: Alpha\n---\n\n# A'],
        ]);

        const index = buildWorkflowIndex(workflows);
        const alphaPos = index.indexOf('alpha');
        const zebraPos = index.indexOf('zebra');
        expect(alphaPos).toBeLessThan(zebraPos);
    });

    it('works with real workflow files', () => {
        const workflows = loadWorkflowTemplates();
        const index = buildWorkflowIndex(workflows);
        expect(index).toContain('## Available Workflows');
        // Should have 15 data rows (excluding header rows)
        const dataRows = index.split('\n').filter(line => line.startsWith('| ') && !line.startsWith('| Workflow') && !line.startsWith('|---'));
        expect(dataRows.length).toBe(15);
    });
});
