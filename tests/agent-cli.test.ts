import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync, execFileSync } from 'child_process';
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
        // Return combined stdout + stderr
        return (error.stdout || '') + (error.stderr || '');
    }
}

describe('agent CLI commands', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-cli-test-'));
        // Initialize project
        run('init test-project', tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('pm agent register alice succeeds', () => {
        const output = run('agent register alice --role developer --type human', tempDir);
        expect(output).toContain("Agent 'alice' registered");
        expect(output).toContain('id:');
    });

    it('pm agent register without --role/--type shows error', () => {
        const output = runExpectFail('agent register alice', tempDir);
        expect(output).toContain('required');
    });

    it('pm agent register duplicate name shows error', () => {
        run('agent register alice --role developer --type human', tempDir);
        const output = runExpectFail('agent register alice --role reviewer --type ai', tempDir);
        expect(output).toContain("Agent 'alice' already exists");
    });

    it('pm agent list shows registered agents', () => {
        run('agent register alice --role developer --type human', tempDir);
        run('agent register bob --role reviewer --type ai', tempDir);

        const output = run('agent list', tempDir);
        expect(output).toContain('alice');
        expect(output).toContain('bob');
        expect(output).toContain('developer');
        expect(output).toContain('reviewer');
    });

    it('pm agent list --json outputs valid JSON array', () => {
        run('agent register alice --role developer --type human', tempDir);
        run('agent register bob --role reviewer --type ai', tempDir);

        const output = run('--json agent list', tempDir);
        const parsed = JSON.parse(output);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toHaveLength(2);
        expect(parsed[0]).toHaveProperty('name');
        expect(parsed[0]).toHaveProperty('role');
    });

    it('pm agent show alice shows agent details', () => {
        run('agent register alice --role developer --type human', tempDir);

        const output = run('agent show alice', tempDir);
        expect(output).toContain('alice');
        expect(output).toContain('developer');
        expect(output).toContain('human');
    });

    it('pm agent show nonexistent shows not found error', () => {
        const output = runExpectFail('agent show nonexistent', tempDir);
        expect(output).toContain("Agent 'nonexistent' not found");
    });

    it('pm agent whoami --agent alice shows alice details', () => {
        run('agent register alice --role developer --type human', tempDir);

        const output = run('--agent alice agent whoami', tempDir);
        expect(output).toContain('alice');
        expect(output).toContain('developer');
    });

    it('pm agent whoami without --agent or PM_AGENT shows identity error', () => {
        const output = runExpectFail('agent whoami', tempDir);
        expect(output).toContain('Agent identity required');
    });
});
