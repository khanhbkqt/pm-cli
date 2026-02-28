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

describe('context CLI commands', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-context-cli-test-'));
        // Initialize project and register agent
        run('init test-project', tempDir);
        run('agent register alice --role developer --type human', tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('pm context set stores a context entry', () => {
        const output = run('--agent alice context set api-url https://api.test.com', tempDir);
        expect(output).toContain("Context 'api-url' set");
    });

    it('pm context set without --agent shows identity error', () => {
        const output = runExpectFail('context set key val', tempDir);
        expect(output).toContain('Agent identity required');
    });

    it('pm context get retrieves a context entry', () => {
        run('--agent alice context set mykey myvalue', tempDir);
        const output = run('context get mykey', tempDir);
        expect(output).toContain('mykey');
        expect(output).toContain('myvalue');
    });

    it('pm context get nonexistent key shows error', () => {
        const output = runExpectFail('context get nonexistent', tempDir);
        expect(output).toContain("Context key 'nonexistent' not found");
    });

    it('pm context list shows all entries', { timeout: 15000 }, () => {
        run('--agent alice context set key1 val1', tempDir);
        run('--agent alice context set key2 val2', tempDir);

        const output = run('context list', tempDir);
        expect(output).toContain('key1');
        expect(output).toContain('key2');
    });

    it('pm context list --category filters entries', { timeout: 15000 }, () => {
        run('--agent alice context set note1 val1 --category note', tempDir);
        run('--agent alice context set dec1 val2 --category decision', tempDir);

        const output = run('context list --category decision', tempDir);
        expect(output).toContain('dec1');
        expect(output).not.toContain('note1');
    });

    it('pm context search finds matching entries', { timeout: 15000 }, () => {
        run('--agent alice context set api-endpoint https://api.test.com', tempDir);
        run('--agent alice context set db-host localhost', tempDir);

        const output = run('context search api', tempDir);
        expect(output).toContain('api-endpoint');
        expect(output).not.toContain('db-host');
    });

    it('pm context set --json outputs JSON', () => {
        const output = run('--json --agent alice context set jkey jval', tempDir);
        const parsed = JSON.parse(output);
        expect(parsed).toHaveProperty('key', 'jkey');
        expect(parsed).toHaveProperty('value', 'jval');
    });

    it('pm context list --json outputs JSON array', () => {
        run('--agent alice context set key1 val1', tempDir);

        const output = run('--json context list', tempDir);
        const parsed = JSON.parse(output);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toHaveProperty('key', 'key1');
    });

    it('pm context get --json outputs JSON object', () => {
        run('--agent alice context set getjson val', tempDir);

        const output = run('--json context get getjson', tempDir);
        const parsed = JSON.parse(output);
        expect(parsed).toHaveProperty('key', 'getjson');
    });
});
