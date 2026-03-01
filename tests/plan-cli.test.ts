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

describe('plan CLI commands', () => {
    let tempDir: string;
    let phaseId: number;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-plan-cli-test-'));
        // Initialize project, register agent, create and activate milestone, add phase
        run('init test-project', tempDir);
        run('agent register alice --role developer --type human', tempDir);
        run('--agent alice milestone create v1 "Version 1"', tempDir);
        run('--agent alice milestone update v1 --status active', tempDir);
        run('--agent alice phase add "Setup" --number 1', tempDir);

        // Capture phase ID from JSON for use in plan commands
        const json = run('--json phase list', tempDir);
        const phases = JSON.parse(json);
        phaseId = phases[0].id;
    }, 30000);

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('pm plan create creates a plan', { timeout: 15000 }, () => {
        const output = run(`--agent alice plan create "My Plan" --phase ${phaseId} --number 1`, tempDir);
        expect(output).toContain('Plan #1 created');
        expect(output).toContain(`phase #${phaseId}`);
    });

    it('pm plan create without --agent shows identity error', { timeout: 15000 }, () => {
        const output = runExpectFail(`plan create "My Plan" --phase ${phaseId} --number 1`, tempDir);
        expect(output).toContain('Agent identity required');
    });

    it('pm plan list --phase shows created plans', { timeout: 15000 }, () => {
        run(`--agent alice plan create "Plan Alpha" --phase ${phaseId} --number 1`, tempDir);
        run(`--agent alice plan create "Plan Beta" --phase ${phaseId} --number 2`, tempDir);

        const output = run(`plan list --phase ${phaseId}`, tempDir);
        expect(output).toContain('Plan Alpha');
        expect(output).toContain('Plan Beta');
    });

    it('pm plan list --json outputs valid JSON array', { timeout: 15000 }, () => {
        run(`--agent alice plan create "JSON Plan" --phase ${phaseId} --number 1`, tempDir);

        const output = run(`--json plan list --phase ${phaseId}`, tempDir);
        const parsed = JSON.parse(output);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toHaveProperty('name', 'JSON Plan');
    });

    it('pm plan show displays plan details', { timeout: 15000 }, () => {
        run(`--agent alice plan create "Show Me" --phase ${phaseId} --number 1 --wave 2`, tempDir);

        const json = run(`--json plan list --phase ${phaseId}`, tempDir);
        const plans = JSON.parse(json);
        const planId = plans[0].id;

        const output = run(`plan show ${planId}`, tempDir);
        expect(output).toContain('Show Me');
        expect(output).toContain('2'); // wave
        expect(output).toContain('pending');
    });

    it('pm plan show nonexistent shows error', { timeout: 15000 }, () => {
        const output = runExpectFail('plan show 99999', tempDir);
        expect(output).toContain('not found');
    });

    it('pm plan update --name changes name', { timeout: 15000 }, () => {
        run(`--agent alice plan create "Old Name" --phase ${phaseId} --number 1`, tempDir);
        const json = run(`--json plan list --phase ${phaseId}`, tempDir);
        const planId = JSON.parse(json)[0].id;

        const output = run(`--agent alice plan update ${planId} --name "New Name"`, tempDir);
        expect(output).toContain(`Plan #${planId} updated`);

        const show = run(`--json plan show ${planId}`, tempDir);
        expect(JSON.parse(show).name).toBe('New Name');
    });

    it('pm plan update --status in_progress transitions via workflow', { timeout: 15000 }, () => {
        run(`--agent alice plan create "Transition Test" --phase ${phaseId} --number 1`, tempDir);
        const json = run(`--json plan list --phase ${phaseId}`, tempDir);
        const planId = JSON.parse(json)[0].id;

        const output = run(`--agent alice plan update ${planId} --status in_progress`, tempDir);
        expect(output).toContain(`Plan #${planId} updated`);

        const show = run(`--json plan show ${planId}`, tempDir);
        expect(JSON.parse(show).status).toBe('in_progress');
    });

    it('pm plan update --status completed from pending is invalid without --force', { timeout: 15000 }, () => {
        run(`--agent alice plan create "Invalid Transition" --phase ${phaseId} --number 1`, tempDir);
        const json = run(`--json plan list --phase ${phaseId}`, tempDir);
        const planId = JSON.parse(json)[0].id;

        // pending -> completed is not a valid transition (must go through in_progress first)
        const output = runExpectFail(`--agent alice plan update ${planId} --status completed`, tempDir);
        expect(output).toMatch(/invalid.*transition|cannot.*transition|not.*allow/i);
    });

    it('pm plan update --status completed --force bypasses validation', { timeout: 15000 }, () => {
        run(`--agent alice plan create "Force Test" --phase ${phaseId} --number 1`, tempDir);
        const json = run(`--json plan list --phase ${phaseId}`, tempDir);
        const planId = JSON.parse(json)[0].id;

        // Force jump from pending to completed
        const output = run(`--agent alice plan update ${planId} --status completed --force`, tempDir);
        expect(output).toContain(`Plan #${planId} updated`);

        const show = run(`--json plan show ${planId}`, tempDir);
        expect(JSON.parse(show).status).toBe('completed');
    });

    it('pm plan list --status filters correctly', { timeout: 15000 }, () => {
        run(`--agent alice plan create "Pending Plan" --phase ${phaseId} --number 1`, tempDir);
        run(`--agent alice plan create "Active Plan" --phase ${phaseId} --number 2`, tempDir);

        const listJson = run(`--json plan list --phase ${phaseId}`, tempDir);
        const activePlanId = JSON.parse(listJson).find((p: any) => p.name === 'Active Plan').id;
        run(`--agent alice plan update ${activePlanId} --status in_progress`, tempDir);

        const output = run(`plan list --phase ${phaseId} --status pending`, tempDir);
        expect(output).toContain('Pending Plan');
        expect(output).not.toContain('Active Plan');
    });

    it('pm phase show displays associated plans', { timeout: 15000 }, () => {
        run(`--agent alice plan create "Phase Plan" --phase ${phaseId} --number 1`, tempDir);

        const output = run(`phase show ${phaseId}`, tempDir);
        expect(output).toContain('Phase Plan');
        expect(output).toContain('Plans:');
    });
});
