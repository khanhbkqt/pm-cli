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

describe('progress CLI command', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-progress-cli-test-'));
        run('init test-project', tempDir);
        run('agent register alice --role developer --type human', tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('no active milestone shows friendly message', { timeout: 15000 }, () => {
        const output = run('progress', tempDir);
        expect(output).toContain('No active milestone');
    });

    it('active milestone shows progress', { timeout: 15000 }, () => {
        run('--agent alice milestone create v1 "Version 1"', tempDir);
        run('--agent alice milestone update v1 --status active', tempDir);
        run('--agent alice phase add "Setup" --number 1', tempDir);
        run('--agent alice phase add "Build" --number 2', tempDir);

        const output = run('progress', tempDir);
        expect(output).toContain('Version 1');
        expect(output).toContain('Setup');
        expect(output).toContain('Build');
    });

    it('JSON output has correct structure', { timeout: 15000 }, () => {
        run('--agent alice milestone create v1 "Version 1"', tempDir);
        run('--agent alice milestone update v1 --status active', tempDir);
        run('--agent alice phase add "Setup" --number 1', tempDir);
        run('--agent alice phase add "Build" --number 2', tempDir);

        const output = run('--json progress', tempDir);
        const parsed = JSON.parse(output);
        expect(parsed.milestone).toBeDefined();
        expect(parsed.phases).toBeInstanceOf(Array);
        expect(parsed.summary).toBeDefined();
        expect(parsed.summary.phases_total).toBe(2);
    });

    it('--milestone flag shows specific milestone', { timeout: 15000 }, () => {
        run('--agent alice milestone create v2 "Version 2"', tempDir);
        run('--agent alice phase add "Research" --number 1 --milestone v2', tempDir);

        const output = run('progress --milestone v2', tempDir);
        expect(output).toContain('Version 2');
    });

    it('completed phase shown correctly in summary', { timeout: 15000 }, () => {
        run('--agent alice milestone create v1 "Version 1"', tempDir);
        run('--agent alice milestone update v1 --status active', tempDir);
        run('--agent alice phase add "Done Phase" --number 1', tempDir);

        // Get phase ID
        const json = run('--json phase list', tempDir);
        const phases = JSON.parse(json);
        const phaseId = phases[0].id;

        // Transition to completed (need to go through in_progress first)
        run(`--agent alice phase update ${phaseId} --status in_progress`, tempDir);
        run(`--agent alice phase update ${phaseId} --status completed`, tempDir);

        const output = run('--json progress', tempDir);
        const parsed = JSON.parse(output);
        expect(parsed.summary.phases_complete).toBe(1);
        expect(parsed.summary.phases_pct).toBe(100);
    });
});
