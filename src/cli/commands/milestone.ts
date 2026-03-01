import { Command } from 'commander';
import {
    createMilestone,
    listMilestones,
    getMilestoneById,
    updateMilestone,
    getActiveMilestone,
} from '../../core/milestone.js';
import { listPhases } from '../../core/phase.js';
import { transitionMilestone } from '../../core/workflow.js';
import { resolveIdentity, getProjectDb } from '../../core/identity.js';
import {
    formatMilestone,
    formatMilestoneList,
    formatPhaseList,
} from '../../output/formatter.js';

/**
 * Register all milestone management commands under `pm milestone`.
 */
export function registerMilestoneCommands(program: Command): void {
    const milestone = program
        .command('milestone')
        .description('Manage milestones');

    // pm milestone create <id> <name>
    milestone
        .command('create <id> <name>')
        .description('Create a new milestone')
        .option('--goal <text>', 'Goal description')
        .action(async (id: string, name: string, opts: { goal?: string }) => {
            try {
                const db = getProjectDb();
                const me = resolveIdentity(db, { agent: program.opts().agent });
                const created = createMilestone(db, {
                    id,
                    name,
                    goal: opts.goal,
                    created_by: me.id,
                });
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(created, null, 2));
                } else {
                    console.log(`✓ Milestone '${created.id}' created: "${created.name}"`);
                }
                db.close();
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error: ${error.message}`);
                } else {
                    console.error('An unexpected error occurred');
                }
                process.exit(1);
            }
        });

    // pm milestone list
    milestone
        .command('list')
        .description('List all milestones')
        .option('--status <status>', 'Filter by status: planned, active, completed, archived')
        .action(async (opts: { status?: string }) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;
                const milestones = listMilestones(db, { status: opts.status });
                console.log(formatMilestoneList(milestones, json));
                db.close();
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error: ${error.message}`);
                } else {
                    console.error('An unexpected error occurred');
                }
                process.exit(1);
            }
        });

    // pm milestone show <id>
    milestone
        .command('show <id>')
        .description('Show milestone details')
        .action(async (id: string) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;
                const found = getMilestoneById(db, id);

                if (!found) {
                    console.error(`Error: Milestone '${id}' not found.`);
                    process.exit(1);
                }

                if (json) {
                    const phases = listPhases(db, id);
                    console.log(JSON.stringify({ ...found, phases }, null, 2));
                } else {
                    console.log(formatMilestone(found, false));
                    const phases = listPhases(db, id);
                    if (phases.length > 0) {
                        console.log('\nPhases:');
                        console.log(formatPhaseList(phases, false));
                    }
                }
                db.close();
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error: ${error.message}`);
                } else {
                    console.error('An unexpected error occurred');
                }
                process.exit(1);
            }
        });

    // pm milestone update <id>
    milestone
        .command('update <id>')
        .description('Update milestone fields')
        .option('--name <name>', 'New name')
        .option('--goal <text>', 'New goal')
        .option('--status <status>', 'New status')
        .option('--force', 'Bypass transition validation')
        .action(async (id: string, opts: { name?: string; goal?: string; status?: string; force?: boolean }) => {
            try {
                const db = getProjectDb();
                resolveIdentity(db, { agent: program.opts().agent }); // enforce identity

                // If --status provided, route through workflow transitions
                if (opts.status) {
                    transitionMilestone(db, id, opts.status as any, { force: opts.force });
                }

                // Apply non-status updates via raw CRUD
                const otherUpdates: { name?: string; goal?: string } = {};
                if (opts.name !== undefined) otherUpdates.name = opts.name;
                if (opts.goal !== undefined) otherUpdates.goal = opts.goal;
                if (Object.keys(otherUpdates).length > 0) {
                    updateMilestone(db, id, otherUpdates);
                }

                const updated = getMilestoneById(db, id)!;
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(updated, null, 2));
                } else {
                    console.log(`✓ Milestone '${updated.id}' updated`);
                }
                db.close();
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error: ${error.message}`);
                } else {
                    console.error('An unexpected error occurred');
                }
                process.exit(1);
            }
        });
}
