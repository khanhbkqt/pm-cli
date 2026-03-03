import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CLI = path.resolve('src/index.ts');

function run(args: string, cwd: string): string {
    return execSync(`npx tsx ${CLI} ${args}`, {
        cwd,
        encoding: 'utf-8',
        env: { ...process.env, PM_AGENT: undefined },
    }).trim();
}

function runExpectFail(args: string, cwd: string): string {
    try {
        execSync(`npx tsx ${CLI} ${args}`, {
            cwd,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, PM_AGENT: undefined },
        });
        throw new Error('Expected command to fail but it succeeded');
    } catch (error: any) {
        return (error.stdout || '') + (error.stderr || '');
    }
}

describe('bug CLI commands', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-bug-cli-test-'));
        run('init test-project', tempDir);
        run('agent register alice --role developer --type human', tempDir);
    }, 30000);

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('pm bug report creates a bug', { timeout: 15000 }, () => {
        const output = run('--agent alice bug report "Crash on login"', tempDir);
        expect(output).toContain('Bug reported');
        expect(output).toContain('Crash on login');
    });

    it('pm bug report without --agent shows identity error', { timeout: 15000 }, () => {
        const output = runExpectFail('bug report "No agent bug"', tempDir);
        expect(output).toContain('Agent identity required');
    });

    it('pm bug report with --priority critical sets priority', { timeout: 15000 }, () => {
        run('--agent alice bug report "Critical issue" --priority critical', tempDir);
        const json = run('--json bug list', tempDir);
        const bugs = JSON.parse(json);
        expect(bugs[0].priority).toBe('critical');
    });

    it('pm bug report with --blocking sets blocking flag', { timeout: 15000 }, () => {
        run('--agent alice bug report "Blocks release" --blocking', tempDir);
        const json = run('--json bug list', tempDir);
        const bugs = JSON.parse(json);
        expect(bugs[0].blocking).toBe(1);
    });

    it('pm bug list shows reported bugs', { timeout: 15000 }, () => {
        run('--agent alice bug report "Bug A"', tempDir);
        run('--agent alice bug report "Bug B"', tempDir);
        const output = run('bug list', tempDir);
        expect(output).toContain('Bug A');
        expect(output).toContain('Bug B');
    });

    it('pm bug list --priority critical filters by priority', { timeout: 15000 }, () => {
        run('--agent alice bug report "Critical one" --priority critical', tempDir);
        run('--agent alice bug report "Low one" --priority low', tempDir);
        const output = run('bug list --priority critical', tempDir);
        expect(output).toContain('Critical one');
        expect(output).not.toContain('Low one');
    });

    it('pm bug list --blocking shows only blocking bugs', { timeout: 15000 }, () => {
        run('--agent alice bug report "Blocker" --blocking', tempDir);
        run('--agent alice bug report "Non-blocker"', tempDir);
        const output = run('bug list --blocking', tempDir);
        expect(output).toContain('Blocker');
        expect(output).not.toContain('Non-blocker');
    });

    it('pm --json bug list outputs valid JSON array', { timeout: 15000 }, () => {
        run('--agent alice bug report "JSON test bug"', tempDir);
        const output = run('--json bug list', tempDir);
        const parsed = JSON.parse(output);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toHaveProperty('title', 'JSON test bug');
    });

    it('pm bug show displays bug details', { timeout: 15000 }, () => {
        run('--agent alice bug report "Show this bug"', tempDir);
        const json = run('--json bug list', tempDir);
        const bugId = JSON.parse(json)[0].id;

        const output = run(`bug show ${bugId}`, tempDir);
        expect(output).toContain('Show this bug');
        expect(output).toContain('medium'); // default priority
        expect(output).toContain('open'); // default status
    });

    it('pm bug show nonexistent shows error', { timeout: 15000 }, () => {
        const output = runExpectFail('bug show nonexistent-id-12345', tempDir);
        expect(output).toContain('not found');
    });

    it('pm bug update --status investigating updates status', { timeout: 15000 }, () => {
        run('--agent alice bug report "Update me"', tempDir);
        const json = run('--json bug list', tempDir);
        const bugId = JSON.parse(json)[0].id;

        run(`--agent alice bug update ${bugId} --status investigating`, tempDir);

        const showJson = run(`--json bug show ${bugId}`, tempDir);
        const updated = JSON.parse(showJson);
        expect(updated.status).toBe('investigating');
    });

    it('pm bug update --status resolved sets resolved_at', { timeout: 15000 }, () => {
        run('--agent alice bug report "Resolve me"', tempDir);
        const json = run('--json bug list', tempDir);
        const bugId = JSON.parse(json)[0].id;

        run(`--agent alice bug update ${bugId} --status resolved`, tempDir);

        const showJson = run(`--json bug show ${bugId}`, tempDir);
        const updated = JSON.parse(showJson);
        expect(updated.status).toBe('resolved');
        expect(updated.resolved_at).not.toBeNull();
    });
});
