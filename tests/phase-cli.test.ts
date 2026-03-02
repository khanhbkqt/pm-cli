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

describe('phase CLI commands', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-phase-cli-test-'));
        // Initialize project, register agent, create and activate milestone
        run('init test-project', tempDir);
        run('agent register alice --role developer --type human', tempDir);

        fs.mkdirSync(path.join(tempDir, '.pm/templates'), { recursive: true });
        fs.writeFileSync(path.join(tempDir, '.pm/templates/phase-summary.md'), '# Phase {{phaseNumber}}: {{name}}');

        run('--agent alice milestone create v1 "Version 1"', tempDir);
        run('--agent alice milestone update v1 --status active', tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('pm phase add adds a phase', () => {
        const output = run('--agent alice phase add "Setup" --number 1', tempDir);
        expect(output).toContain('Phase #1 added');
        expect(output).toContain("milestone 'v1'");

        expect(fs.existsSync(path.join(tempDir, '.pm/milestones/v1/1/PHASE.md'))).toBe(true);
    });

    it('pm phase add without --agent shows identity error', () => {
        const output = runExpectFail('phase add "Setup" --number 1', tempDir);
        expect(output).toContain('Agent identity required');
    });

    it('pm phase add with --milestone flag targets specific milestone', { timeout: 15000 }, () => {
        run('--agent alice milestone create v2 "Version 2"', tempDir);
        const output = run('--agent alice phase add "Setup V2" --number 1 --milestone v2', tempDir);
        expect(output).toContain("milestone 'v2'");
    });

    it('pm phase add without --milestone defaults to active milestone', () => {
        const output = run('--agent alice phase add "Default milestone" --number 1', tempDir);
        expect(output).toContain("milestone 'v1'");
    });

    it('pm phase list shows phases for a milestone', { timeout: 15000 }, () => {
        run('--agent alice phase add "Phase A" --number 1', tempDir);
        run('--agent alice phase add "Phase B" --number 2', tempDir);

        const output = run('phase list', tempDir);
        expect(output).toContain('Phase A');
        expect(output).toContain('Phase B');
    });

    it('pm phase list --json outputs valid JSON array', () => {
        run('--agent alice phase add "JSON phase" --number 1', tempDir);

        const output = run('--json phase list', tempDir);
        const parsed = JSON.parse(output);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toHaveProperty('name', 'JSON phase');
    });

    it('pm phase list --status not_started filters correctly', { timeout: 20000 }, () => {
        run('--agent alice phase add "Phase A" --number 1', tempDir);
        run('--agent alice phase add "Phase B" --number 2', tempDir);

        // Get phase ID from JSON to update it
        const json = run('--json phase list', tempDir);
        const phases = JSON.parse(json);
        const phaseAId = phases.find((p: any) => p.name === 'Phase A').id;
        run(`--agent alice phase update ${phaseAId} --status in_progress`, tempDir);

        const output = run('phase list --status not_started', tempDir);
        expect(output).toContain('Phase B');
        expect(output).not.toContain('Phase A');
    });

    it('pm phase show displays phase details', () => {
        run('--agent alice phase add "Detailed Phase" --number 1 --description "A detailed description"', tempDir);

        const json = run('--json phase list', tempDir);
        const phases = JSON.parse(json);
        const phaseId = phases[0].id;

        const output = run(`phase show ${phaseId}`, tempDir);
        expect(output).toContain('Detailed Phase');
        expect(output).toContain('A detailed description');
        expect(output).toContain('not_started');
    });

    it('pm phase show nonexistent shows error', () => {
        const output = runExpectFail('phase show 99999', tempDir);
        expect(output).toContain('not found');
    });

    it('pm phase update changes status', { timeout: 15000 }, () => {
        run('--agent alice phase add "Updatable" --number 1', tempDir);

        const json = run('--json phase list', tempDir);
        const phases = JSON.parse(json);
        const phaseId = phases[0].id;

        const output = run(`--agent alice phase update ${phaseId} --status in_progress`, tempDir);
        expect(output).toContain(`Phase #${phaseId} updated`);

        const show = run(`--json phase show ${phaseId}`, tempDir);
        const parsed = JSON.parse(show);
        expect(parsed.status).toBe('in_progress');
    });

    it('pm phase update --status completed from not_started fails (invalid transition)', { timeout: 15000 }, () => {
        run('--agent alice phase add "Bad Jump" --number 1', tempDir);
        const json = run('--json phase list', tempDir);
        const phaseId = JSON.parse(json)[0].id;

        // not_started -> completed is not a valid transition
        const output = runExpectFail(`--agent alice phase update ${phaseId} --status completed`, tempDir);
        expect(output).toMatch(/invalid.*transition|cannot.*transition|not.*allow/i);
    });

    it('pm phase update --status in_progress --force transitions successfully', { timeout: 15000 }, () => {
        run('--agent alice phase add "Force Phase" --number 1', tempDir);
        const json = run('--json phase list', tempDir);
        const phaseId = JSON.parse(json)[0].id;

        // not_started -> in_progress is allowed anyway, --force ensures it works
        const output = run(`--agent alice phase update ${phaseId} --status in_progress --force`, tempDir);
        expect(output).toContain(`Phase #${phaseId} updated`);

        const show = run(`--json phase show ${phaseId}`, tempDir);
        expect(JSON.parse(show).status).toBe('in_progress');
    });
});
