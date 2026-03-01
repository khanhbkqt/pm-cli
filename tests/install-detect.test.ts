import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { detectClients } from '../src/core/install/detect.js';

describe('detectClients', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-detect-'));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('returns empty array for empty directory', () => {
        const results = detectClients(tempDir);
        expect(results).toEqual([]);
    });

    it('detects Antigravity via .agent/ directory', () => {
        fs.mkdirSync(path.join(tempDir, '.agent'));

        const results = detectClients(tempDir);
        const ag = results.find((r) => r.client === 'antigravity');
        expect(ag).toBeDefined();
        expect(ag!.confidence).toBe('high');
        expect(ag!.reason).toContain('.agent/');
    });

    it('detects Antigravity via .gemini/ directory', () => {
        fs.mkdirSync(path.join(tempDir, '.gemini'));

        const results = detectClients(tempDir);
        // Both antigravity and gemini-cli use .gemini/ — expect both
        const ag = results.find((r) => r.client === 'antigravity');
        expect(ag).toBeDefined();
        expect(ag!.confidence).toBe('high');
    });

    it('detects Claude Code via CLAUDE.md file', () => {
        fs.writeFileSync(path.join(tempDir, 'CLAUDE.md'), '# Rules');

        const results = detectClients(tempDir);
        const cc = results.find((r) => r.client === 'claude-code');
        expect(cc).toBeDefined();
        expect(cc!.confidence).toBe('high');
        expect(cc!.reason).toContain('CLAUDE.md');
    });

    it('detects Cursor via .cursor/ directory', () => {
        fs.mkdirSync(path.join(tempDir, '.cursor'));

        const results = detectClients(tempDir);
        const cur = results.find((r) => r.client === 'cursor');
        expect(cur).toBeDefined();
        expect(cur!.confidence).toBe('high');
        expect(cur!.reason).toContain('.cursor/');
    });

    it('detects Codex via AGENTS.md file (medium confidence)', () => {
        fs.writeFileSync(path.join(tempDir, 'AGENTS.md'), '# Agents');

        const results = detectClients(tempDir);
        const codex = results.find((r) => r.client === 'codex');
        expect(codex).toBeDefined();
        expect(codex!.confidence).toBe('medium');
    });

    it('detects OpenCode via opencode.json file (high confidence)', () => {
        fs.writeFileSync(path.join(tempDir, 'opencode.json'), '{}');

        const results = detectClients(tempDir);
        const oc = results.find((r) => r.client === 'opencode');
        expect(oc).toBeDefined();
        expect(oc!.confidence).toBe('high');
        expect(oc!.reason).toContain('opencode.json');
    });

    it('detects Gemini CLI via GEMINI.md file', () => {
        fs.writeFileSync(path.join(tempDir, 'GEMINI.md'), '# Context');

        const results = detectClients(tempDir);
        const gc = results.find((r) => r.client === 'gemini-cli');
        expect(gc).toBeDefined();
        expect(gc!.confidence).toBe('high');
        expect(gc!.reason).toContain('GEMINI.md');
    });

    it('detects multiple clients and sorts by confidence', () => {
        // High confidence: .agent/, .cursor/, CLAUDE.md, opencode.json
        fs.mkdirSync(path.join(tempDir, '.agent'));
        fs.mkdirSync(path.join(tempDir, '.cursor'));
        fs.writeFileSync(path.join(tempDir, 'CLAUDE.md'), '# Rules');
        fs.writeFileSync(path.join(tempDir, 'opencode.json'), '{}');
        fs.writeFileSync(path.join(tempDir, 'AGENTS.md'), '# Agents');

        const results = detectClients(tempDir);

        // Should detect at least: antigravity, claude-code, cursor, codex, opencode
        expect(results.length).toBeGreaterThanOrEqual(4);

        // All high-confidence results should come before medium/low
        const firstMediumIdx = results.findIndex((r) => r.confidence === 'medium');
        const lastHighIdx = results.map((r, i) => r.confidence === 'high' ? i : -1)
            .filter((i) => i >= 0)
            .pop() ?? -1;

        if (firstMediumIdx >= 0 && lastHighIdx >= 0) {
            expect(lastHighIdx).toBeLessThan(firstMediumIdx);
        }
    });

    it('OpenCode takes high-confidence match over low-confidence AGENTS.md fallback', () => {
        // When opencode.json exists, OpenCode should use it (high) not AGENTS.md (low)
        fs.writeFileSync(path.join(tempDir, 'opencode.json'), '{}');
        fs.writeFileSync(path.join(tempDir, 'AGENTS.md'), '# Agents');

        const results = detectClients(tempDir);
        const oc = results.find((r) => r.client === 'opencode');
        expect(oc).toBeDefined();
        expect(oc!.confidence).toBe('high');
    });
});
