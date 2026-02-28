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

describe('task CLI commands', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-task-cli-test-'));
        // Initialize project and register agent
        run('init test-project', tempDir);
        run('agent register alice --role developer --type human', tempDir);
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('pm task add creates a task', () => {
        const output = run('--agent alice task add "My first task"', tempDir);
        expect(output).toContain('Task #1 created');
        expect(output).toContain('My first task');
    });

    it('pm task add without --agent shows identity error', () => {
        const output = runExpectFail('task add "No identity"', tempDir);
        expect(output).toContain('Agent identity required');
    });

    it('pm task list shows created tasks (no identity required)', () => {
        run('--agent alice task add "Task A"', tempDir);
        run('--agent alice task add "Task B"', tempDir);

        const output = run('task list', tempDir);
        expect(output).toContain('Task A');
        expect(output).toContain('Task B');
    });

    it('pm task list --json outputs valid JSON array', () => {
        run('--agent alice task add "JSON task"', tempDir);

        const output = run('--json task list', tempDir);
        const parsed = JSON.parse(output);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toHaveProperty('title', 'JSON task');
    });

    it('pm task list --status todo filters correctly', { timeout: 20000 }, () => {
        run('--agent alice task add "Todo one"', tempDir);
        run('--agent alice task add "Todo two"', tempDir);
        run('--agent alice task update 1 --status done', tempDir);

        const output = run('task list --status todo', tempDir);
        expect(output).toContain('Todo two');
        expect(output).not.toContain('Todo one');
    });

    it('pm task show displays task details', () => {
        run('--agent alice task add "Show me"', tempDir);

        const output = run('task show 1', tempDir);
        expect(output).toContain('Show me');
        expect(output).toContain('todo');
        expect(output).toContain('medium');
    });

    it('pm task show nonexistent shows not found error', () => {
        const output = runExpectFail('task show 999', tempDir);
        expect(output).toContain('not found');
    });

    it('pm task update changes task fields', { timeout: 15000 }, () => {
        run('--agent alice task add "Original"', tempDir);

        const output = run('--agent alice task update 1 --status done', tempDir);
        expect(output).toContain('Task #1 updated');

        // Verify the change
        const show = run('--json task show 1', tempDir);
        const parsed = JSON.parse(show);
        expect(parsed.status).toBe('done');
    });

    it('pm task assign assigns task to agent', () => {
        run('--agent alice task add "Assign me"', tempDir);

        const output = run('--agent alice task assign 1 --to alice', tempDir);
        expect(output).toContain("Task #1 assigned to 'alice'");
    });

    it('pm task comment adds comment to task', () => {
        run('--agent alice task add "Commentable"', tempDir);

        const output = run('--agent alice task comment 1 "Great work"', tempDir);
        expect(output).toContain('Comment added to task #1');
    });

    it('pm task show after comment shows the comment', { timeout: 15000 }, () => {
        run('--agent alice task add "With comment"', tempDir);
        run('--agent alice task comment 1 "Nice progress"', tempDir);

        const output = run('task show 1', tempDir);
        expect(output).toContain('Nice progress');
    });

    it('pm task add with --parent creates subtask', { timeout: 15000 }, () => {
        run('--agent alice task add "Parent task"', tempDir);
        const output = run('--agent alice task add "Subtask" --parent 1', tempDir);
        expect(output).toContain('Task #2 created');

        const show = run('--json task show 2', tempDir);
        const parsed = JSON.parse(show);
        expect(parsed.parent_id).toBe(1);
    });

    it('pm task list --json --assigned alice filters by assigned agent', { timeout: 20000 }, () => {
        run('--agent alice task add "Unassigned"', tempDir);
        run('--agent alice task add "Assigned"', tempDir);
        run('--agent alice task assign 2 --to alice', tempDir);

        const output = run('--json task list --assigned alice', tempDir);
        const parsed = JSON.parse(output);
        expect(parsed).toHaveLength(1);
        expect(parsed[0].title).toBe('Assigned');
    });
});
