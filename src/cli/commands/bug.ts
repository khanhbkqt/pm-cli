import { Command } from 'commander';
import { handleCommandError } from '../../cli/error.js';
import {
    reportBug,
    listBugs,
    getBugById,
    getBugContent,
    updateBug,
} from '../../core/bug.js';
import { resolveIdentity, getProjectDb, findProjectRoot } from '../../core/identity.js';
import { formatBug, formatBugList } from '../../output/formatter.js';

/**
 * Register all bug management commands under `pm bug`.
 */
export function registerBugCommands(program: Command): void {
    const bug = program
        .command('bug')
        .description('Manage bug reports');

    // pm bug report <title>
    bug
        .command('report <title>')
        .description('Report a new bug')
        .option('--priority <level>', 'Priority: critical, high, medium, low', 'medium')
        .option('--description <text>', 'Bug description')
        .option('--milestone <id>', 'Associated milestone ID')
        .option('--phase <id>', 'Associated phase ID')
        .option('--blocking', 'Mark as blocking', false)
        .action(async (title: string, opts: {
            priority: string;
            description?: string;
            milestone?: string;
            phase?: string;
            blocking: boolean;
        }) => {
            try {
                const db = getProjectDb();
                const identity = resolveIdentity(db, { agent: program.opts().agent });
                const projectRoot = findProjectRoot();
                const created = reportBug(db, {
                    title,
                    description: opts.description,
                    priority: opts.priority as any,
                    reported_by: identity.id,
                    milestone_id: opts.milestone,
                    phase_id: opts.phase,
                    blocking: opts.blocking,
                    projectRoot,
                });
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(created, null, 2));
                } else {
                    console.log(`✓ Bug reported: ${created.title} (${created.id.substring(0, 8)})`);
                }
                db.close();
            } catch (error) {
                handleCommandError(error);
            }
        });

    // pm bug list
    bug
        .command('list')
        .description('List bugs')
        .option('--priority <level>', 'Filter by priority')
        .option('--status <status>', 'Filter by status')
        .option('--blocking', 'Show only blocking bugs')
        .action(async (opts: {
            priority?: string;
            status?: string;
            blocking?: boolean;
        }) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;
                const bugs = listBugs(db, {
                    priority: opts.priority as any,
                    status: opts.status as any,
                    blocking: opts.blocking,
                });
                console.log(formatBugList(bugs, json));
                db.close();
            } catch (error) {
                handleCommandError(error);
            }
        });

    // pm bug show <id>
    bug
        .command('show <id>')
        .description('Show bug details')
        .action(async (id: string) => {
            try {
                const db = getProjectDb();
                const projectRoot = findProjectRoot();
                const json = program.opts().json;
                const found = getBugById(db, id);

                if (!found) {
                    console.error(`Error: Bug '${id}' not found.`);
                    process.exit(1);
                }

                const content = getBugContent(db, id, projectRoot);
                console.log(formatBug(found, json, content ?? undefined));
                db.close();
            } catch (error) {
                handleCommandError(error);
            }
        });

    // pm bug update <id>
    bug
        .command('update <id>')
        .description('Update bug fields')
        .option('--status <status>', 'New status')
        .option('--priority <level>', 'New priority')
        .option('--assigned-to <agent>', 'Assign to agent')
        .option('--blocking', 'Set as blocking')
        .option('--no-blocking', 'Unset blocking')
        .option('--description <text>', 'Update description')
        .action(async (id: string, opts: {
            status?: string;
            priority?: string;
            assignedTo?: string;
            blocking?: boolean;
            description?: string;
        }) => {
            try {
                const db = getProjectDb();
                const projectRoot = findProjectRoot();
                resolveIdentity(db, { agent: program.opts().agent });

                const updates: Parameters<typeof updateBug>[2] = {};
                if (opts.status !== undefined) updates.status = opts.status as any;
                if (opts.priority !== undefined) updates.priority = opts.priority as any;
                if (opts.assignedTo !== undefined) updates.assigned_to = opts.assignedTo;
                if (opts.blocking !== undefined) updates.blocking = opts.blocking;
                if (opts.description !== undefined) updates.projectRoot = projectRoot;

                const updated = updateBug(db, id, updates);
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(updated, null, 2));
                } else {
                    console.log(`✓ Bug '${updated.id.substring(0, 8)}' updated`);
                }
                db.close();
            } catch (error) {
                handleCommandError(error);
            }
        });
}
