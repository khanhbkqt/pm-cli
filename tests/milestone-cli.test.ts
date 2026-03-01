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

describe('milestone CLI commands', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-milestone-cli-test-'));
        // Initialize project and register agent
        run('init test-project', tempDir);
        run('agent register alice --role developer --type human', tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('pm milestone create creates a milestone', () => {
        const output = run('--agent alice milestone create v1 "Version 1"', tempDir);
        expect(output).toContain("Milestone 'v1' created");
        expect(output).toContain('Version 1');
    });

    it('pm milestone create without --agent shows identity error', () => {
        const output = runExpectFail('milestone create v1 "Version 1"', tempDir);
        expect(output).toContain('Agent identity required');
    });

    it('pm milestone create with --goal stores the goal', { timeout: 15000 }, () => {
        run('--agent alice milestone create v1 "Version 1" --goal "Ship MVP"', tempDir);

        const show = run('--json milestone show v1', tempDir);
        const parsed = JSON.parse(show);
        expect(parsed.goal).toBe('Ship MVP');
    });

    it('pm milestone list shows created milestones', { timeout: 15000 }, () => {
        run('--agent alice milestone create v1 "Version 1"', tempDir);
        run('--agent alice milestone create v2 "Version 2"', tempDir);

        const output = run('milestone list', tempDir);
        expect(output).toContain('Version 1');
        expect(output).toContain('Version 2');
    });

    it('pm milestone list --json outputs valid JSON array', () => {
        run('--agent alice milestone create v1 "Version 1"', tempDir);

        const output = run('--json milestone list', tempDir);
        const parsed = JSON.parse(output);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toHaveProperty('name', 'Version 1');
    });

    it('pm milestone list --status active filters correctly', { timeout: 20000 }, () => {
        run('--agent alice milestone create v1 "Version 1"', tempDir);
        run('--agent alice milestone create v2 "Version 2"', tempDir);
        run('--agent alice milestone update v1 --status active', tempDir);

        const output = run('milestone list --status active', tempDir);
        expect(output).toContain('Version 1');
        expect(output).not.toContain('Version 2');
    });

    it('pm milestone show displays milestone details', () => {
        run('--agent alice milestone create v1 "Version 1" --goal "Ship it"', tempDir);

        const output = run('milestone show v1', tempDir);
        expect(output).toContain('Version 1');
        expect(output).toContain('Ship it');
        expect(output).toContain('planned');
    });

    it('pm milestone show nonexistent shows error', () => {
        const output = runExpectFail('milestone show nonexistent', tempDir);
        expect(output).toContain('not found');
    });

    it('pm milestone update changes status', { timeout: 15000 }, () => {
        run('--agent alice milestone create v1 "Version 1"', tempDir);

        const output = run('--agent alice milestone update v1 --status active', tempDir);
        expect(output).toContain("Milestone 'v1' updated");

        const show = run('--json milestone show v1', tempDir);
        const parsed = JSON.parse(show);
        expect(parsed.status).toBe('active');
    });

    it('pm milestone show after adding phases shows phases section', { timeout: 20000 }, () => {
        run('--agent alice milestone create v1 "Version 1"', tempDir);
        run('--agent alice milestone update v1 --status active', tempDir);
        run('--agent alice phase add "Setup" --number 1 --milestone v1', tempDir);

        const output = run('milestone show v1', tempDir);
        expect(output).toContain('Setup');
        expect(output).toContain('Phases:');
    });
});
