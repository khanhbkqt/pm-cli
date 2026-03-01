import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Adapters (side-effect: self-register)
import '../src/core/install/adapters/antigravity.js';
import '../src/core/install/adapters/claude-code.js';
import '../src/core/install/adapters/cursor.js';
import '../src/core/install/adapters/codex.js';
import '../src/core/install/adapters/opencode.js';
import '../src/core/install/adapters/gemini-cli.js';

import { getAdapter } from '../src/core/install/registry.js';

/**
 * Create a minimal AGENT_INSTRUCTIONS.md template so adapters can
 * call `loadCanonicalTemplate(projectRoot)` without hitting the real file.
 */
function seedTemplate(projectRoot: string): string {
    const templateDir = path.join(projectRoot, 'docs', 'agent-guide');
    fs.mkdirSync(templateDir, { recursive: true });
    const templatePath = path.join(templateDir, 'AGENT_INSTRUCTIONS.md');
    const content = '# PM CLI Agent Instructions\n\nSample template content for testing.\n';
    fs.writeFileSync(templatePath, content, 'utf-8');
    return templatePath;
}

// ────────────────────────────────────────────────────────────────────────────
// Antigravity adapter
// ────────────────────────────────────────────────────────────────────────────

describe('AntigravityAdapter', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-install-ag-'));
        seedTemplate(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('generates .agent/workflows/pm-guide.md with YAML frontmatter', () => {
        const adapter = getAdapter('antigravity');
        const result = adapter.generate(tempDir, '');

        const workflowPath = path.join(tempDir, '.agent/workflows/pm-guide.md');
        expect(fs.existsSync(workflowPath)).toBe(true);
        expect(result.files).toContain(workflowPath);

        const content = fs.readFileSync(workflowPath, 'utf-8');
        expect(content).toContain('---');
        expect(content).toContain('description:');
        expect(content).toContain('PM CLI Agent Instructions');
    });

    it('generates .agent/rules/pm-cli.md rule file', () => {
        const adapter = getAdapter('antigravity');
        const result = adapter.generate(tempDir, '');

        const rulePath = path.join(tempDir, '.agent/rules/pm-cli.md');
        expect(fs.existsSync(rulePath)).toBe(true);
        expect(result.files).toContain(rulePath);

        const content = fs.readFileSync(rulePath, 'utf-8');
        expect(content).toContain('PM CLI');
        expect(content).toContain('pm agent whoami');
    });

    it('clean() removes generated files', () => {
        const adapter = getAdapter('antigravity');
        adapter.generate(tempDir, '');

        const workflowPath = path.join(tempDir, '.agent/workflows/pm-guide.md');
        const rulePath = path.join(tempDir, '.agent/rules/pm-cli.md');
        expect(fs.existsSync(workflowPath)).toBe(true);
        expect(fs.existsSync(rulePath)).toBe(true);

        const cleanResult = adapter.clean(tempDir);
        expect(cleanResult.removed).toContain(workflowPath);
        expect(cleanResult.removed).toContain(rulePath);
        expect(fs.existsSync(workflowPath)).toBe(false);
        expect(fs.existsSync(rulePath)).toBe(false);
    });

    it('clean() preserves .agent/ directory (may have other files)', () => {
        const adapter = getAdapter('antigravity');
        adapter.generate(tempDir, '');

        // Add a user file in .agent/
        fs.writeFileSync(path.join(tempDir, '.agent/my-config.md'), 'user file');

        adapter.clean(tempDir);
        expect(fs.existsSync(path.join(tempDir, '.agent'))).toBe(true);
        expect(fs.existsSync(path.join(tempDir, '.agent/my-config.md'))).toBe(true);
    });

    it('clean() skips if files do not exist', () => {
        const adapter = getAdapter('antigravity');
        const cleanResult = adapter.clean(tempDir);
        expect(cleanResult.removed).toHaveLength(0);
        expect(cleanResult.skipped.length).toBeGreaterThan(0);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// Claude Code adapter
// ────────────────────────────────────────────────────────────────────────────

describe('ClaudeCodeAdapter', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-install-cc-'));
        seedTemplate(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('creates CLAUDE.md with PM section markers', () => {
        const adapter = getAdapter('claude-code');
        const result = adapter.generate(tempDir, '');

        const claudePath = path.join(tempDir, 'CLAUDE.md');
        expect(fs.existsSync(claudePath)).toBe(true);
        expect(result.files).toContain(claudePath);

        const content = fs.readFileSync(claudePath, 'utf-8');
        expect(content).toContain('<!-- pm-cli:start -->');
        expect(content).toContain('<!-- pm-cli:end -->');
        expect(content).toContain('PM CLI Integration');
    });

    it('preserves existing CLAUDE.md content and appends PM section', () => {
        const claudePath = path.join(tempDir, 'CLAUDE.md');
        fs.writeFileSync(claudePath, '# My Project Rules\n\nSome existing rules.\n');

        const adapter = getAdapter('claude-code');
        adapter.generate(tempDir, '');

        const content = fs.readFileSync(claudePath, 'utf-8');
        expect(content).toContain('# My Project Rules');
        expect(content).toContain('Some existing rules.');
        expect(content).toContain('<!-- pm-cli:start -->');
    });

    it('replaces existing PM section on re-generate', () => {
        const adapter = getAdapter('claude-code');
        adapter.generate(tempDir, '');
        adapter.generate(tempDir, '');

        const content = fs.readFileSync(path.join(tempDir, 'CLAUDE.md'), 'utf-8');
        // Exactly one PM section (not duplicated)
        const starts = content.split('<!-- pm-cli:start -->').length - 1;
        expect(starts).toBe(1);
    });

    it('clean() removes PM section but preserves user content', () => {
        const claudePath = path.join(tempDir, 'CLAUDE.md');
        fs.writeFileSync(claudePath, '# My Rules\n\nKeep this.\n');

        const adapter = getAdapter('claude-code');
        adapter.generate(tempDir, '');
        adapter.clean(tempDir);

        const content = fs.readFileSync(claudePath, 'utf-8');
        expect(content).toContain('My Rules');
        expect(content).not.toContain('pm-cli:start');
    });

    it('clean() removes entire file if only PM content', () => {
        const adapter = getAdapter('claude-code');
        adapter.generate(tempDir, '');

        const claudePath = path.join(tempDir, 'CLAUDE.md');
        expect(fs.existsSync(claudePath)).toBe(true);

        const cleanResult = adapter.clean(tempDir);
        expect(cleanResult.removed).toContain(claudePath);
        expect(fs.existsSync(claudePath)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// Cursor adapter
// ────────────────────────────────────────────────────────────────────────────

describe('CursorAdapter', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-install-cur-'));
        seedTemplate(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('generates .cursor/rules/pm-guide.mdc with MDC frontmatter', () => {
        const adapter = getAdapter('cursor');
        const result = adapter.generate(tempDir, '');

        const mdcPath = path.join(tempDir, '.cursor/rules/pm-guide.mdc');
        expect(fs.existsSync(mdcPath)).toBe(true);
        expect(result.files).toContain(mdcPath);

        const content = fs.readFileSync(mdcPath, 'utf-8');
        expect(content).toContain('---');
        expect(content).toContain('alwaysApply: true');
        expect(content).toContain('globs:');
        expect(content).toContain('PM CLI Agent Instructions');
    });

    it('clean() removes pm-guide.mdc', () => {
        const adapter = getAdapter('cursor');
        adapter.generate(tempDir, '');

        const mdcPath = path.join(tempDir, '.cursor/rules/pm-guide.mdc');
        expect(fs.existsSync(mdcPath)).toBe(true);

        const cleanResult = adapter.clean(tempDir);
        expect(cleanResult.removed).toContain(mdcPath);
        expect(fs.existsSync(mdcPath)).toBe(false);
    });

    it('clean() preserves .cursor/ directory', () => {
        const adapter = getAdapter('cursor');
        adapter.generate(tempDir, '');

        fs.writeFileSync(path.join(tempDir, '.cursor/settings.json'), '{}');

        adapter.clean(tempDir);
        expect(fs.existsSync(path.join(tempDir, '.cursor'))).toBe(true);
        expect(fs.existsSync(path.join(tempDir, '.cursor/settings.json'))).toBe(true);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// Codex adapter
// ────────────────────────────────────────────────────────────────────────────

describe('CodexAdapter', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-install-cdx-'));
        seedTemplate(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('creates AGENTS.md with PM section markers', () => {
        const adapter = getAdapter('codex');
        const result = adapter.generate(tempDir, '');

        const agentsPath = path.join(tempDir, 'AGENTS.md');
        expect(fs.existsSync(agentsPath)).toBe(true);
        expect(result.files).toContain(agentsPath);

        const content = fs.readFileSync(agentsPath, 'utf-8');
        expect(content).toContain('<!-- pm-cli:start -->');
        expect(content).toContain('<!-- pm-cli:end -->');
        expect(content).toContain('PM CLI Integration');
    });

    it('preserves existing AGENTS.md content', () => {
        const agentsPath = path.join(tempDir, 'AGENTS.md');
        fs.writeFileSync(agentsPath, '# Custom Agent Config\n\nExisting stuff.\n');

        const adapter = getAdapter('codex');
        adapter.generate(tempDir, '');

        const content = fs.readFileSync(agentsPath, 'utf-8');
        expect(content).toContain('Custom Agent Config');
        expect(content).toContain('Existing stuff.');
        expect(content).toContain('<!-- pm-cli:start -->');
    });

    it('clean() removes PM section, preserves user content', () => {
        const agentsPath = path.join(tempDir, 'AGENTS.md');
        fs.writeFileSync(agentsPath, '# My Config\n\nKeep.\n');

        const adapter = getAdapter('codex');
        adapter.generate(tempDir, '');
        adapter.clean(tempDir);

        const content = fs.readFileSync(agentsPath, 'utf-8');
        expect(content).toContain('My Config');
        expect(content).not.toContain('pm-cli:start');
    });

    it('clean() removes entire file if only PM content', () => {
        const adapter = getAdapter('codex');
        adapter.generate(tempDir, '');

        const agentsPath = path.join(tempDir, 'AGENTS.md');
        adapter.clean(tempDir);
        expect(fs.existsSync(agentsPath)).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// OpenCode adapter
// ────────────────────────────────────────────────────────────────────────────

describe('OpenCodeAdapter', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-install-oc-'));
        seedTemplate(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('creates AGENTS.md and opencode.json', () => {
        const adapter = getAdapter('opencode');
        const result = adapter.generate(tempDir, '');

        const agentsPath = path.join(tempDir, 'AGENTS.md');
        const jsonPath = path.join(tempDir, 'opencode.json');
        expect(fs.existsSync(agentsPath)).toBe(true);
        expect(fs.existsSync(jsonPath)).toBe(true);
        expect(result.files).toContain(agentsPath);
        expect(result.files).toContain(jsonPath);

        const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        expect(jsonContent.instructions).toContain('AGENTS.md');
    });

    it('preserves existing opencode.json fields', () => {
        const jsonPath = path.join(tempDir, 'opencode.json');
        fs.writeFileSync(jsonPath, JSON.stringify({ theme: 'dark', port: 3000 }, null, 2));

        const adapter = getAdapter('opencode');
        adapter.generate(tempDir, '');

        const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        expect(jsonContent.theme).toBe('dark');
        expect(jsonContent.port).toBe(3000);
        expect(jsonContent.instructions).toBeDefined();
    });

    it('clean() removes AGENTS.md and opencode.json if only PM content', () => {
        const adapter = getAdapter('opencode');
        adapter.generate(tempDir, '');

        adapter.clean(tempDir);

        const agentsPath = path.join(tempDir, 'AGENTS.md');
        const jsonPath = path.join(tempDir, 'opencode.json');
        expect(fs.existsSync(agentsPath)).toBe(false);
        expect(fs.existsSync(jsonPath)).toBe(false);
    });

    it('clean() preserves other fields in opencode.json', () => {
        const jsonPath = path.join(tempDir, 'opencode.json');
        fs.writeFileSync(jsonPath, JSON.stringify({ theme: 'dark' }, null, 2));

        const adapter = getAdapter('opencode');
        adapter.generate(tempDir, '');
        adapter.clean(tempDir);

        const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        expect(jsonContent.theme).toBe('dark');
        expect(jsonContent.instructions).toBeUndefined();
    });
});

// ────────────────────────────────────────────────────────────────────────────
// Gemini CLI adapter
// ────────────────────────────────────────────────────────────────────────────

describe('GeminiCliAdapter', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-install-gc-'));
        seedTemplate(tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('creates GEMINI.md with PM section markers', () => {
        const adapter = getAdapter('gemini-cli');
        const result = adapter.generate(tempDir, '');

        const geminiPath = path.join(tempDir, 'GEMINI.md');
        expect(fs.existsSync(geminiPath)).toBe(true);
        expect(result.files).toContain(geminiPath);

        const content = fs.readFileSync(geminiPath, 'utf-8');
        expect(content).toContain('<!-- pm-cli:start -->');
        expect(content).toContain('<!-- pm-cli:end -->');
        expect(content).toContain('PM CLI Integration');
    });

    it('preserves existing GEMINI.md content', () => {
        const geminiPath = path.join(tempDir, 'GEMINI.md');
        fs.writeFileSync(geminiPath, '# My Gemini Context\n\nExisting.\n');

        const adapter = getAdapter('gemini-cli');
        adapter.generate(tempDir, '');

        const content = fs.readFileSync(geminiPath, 'utf-8');
        expect(content).toContain('My Gemini Context');
        expect(content).toContain('Existing.');
        expect(content).toContain('<!-- pm-cli:start -->');
    });

    it('clean() removes PM section, preserves user content', () => {
        const geminiPath = path.join(tempDir, 'GEMINI.md');
        fs.writeFileSync(geminiPath, '# My Context\n\nKeep.\n');

        const adapter = getAdapter('gemini-cli');
        adapter.generate(tempDir, '');
        adapter.clean(tempDir);

        const content = fs.readFileSync(geminiPath, 'utf-8');
        expect(content).toContain('My Context');
        expect(content).not.toContain('pm-cli:start');
    });

    it('clean() removes entire file if only PM content', () => {
        const adapter = getAdapter('gemini-cli');
        adapter.generate(tempDir, '');

        const geminiPath = path.join(tempDir, 'GEMINI.md');
        adapter.clean(tempDir);
        expect(fs.existsSync(geminiPath)).toBe(false);
    });
});
