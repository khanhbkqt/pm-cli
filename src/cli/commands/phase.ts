import { Command } from 'commander';
import {
    addPhase,
    listPhases,
    getPhaseById,
    updatePhase,
} from '../../core/phase.js';
import { getActiveMilestone } from '../../core/milestone.js';
import { transitionPhase } from '../../core/workflow.js';
import { listPlans } from '../../core/plan.js';
import { resolveIdentity, getProjectDb } from '../../core/identity.js';
import {
    formatPhase,
    formatPhaseList,
    formatPlanList,
} from '../../output/formatter.js';

/**
 * Register all phase management commands under `pm phase`.
 */
export function registerPhaseCommands(program: Command): void {
    const phase = program
        .command('phase')
        .description('Manage phases');

    // pm phase add <name>
    phase
        .command('add <name>')
        .description('Add a phase to a milestone')
        .requiredOption('--number <n>', 'Phase number')
        .option('--milestone <id>', 'Milestone ID (defaults to active milestone)')
        .option('--description <text>', 'Phase description')
        .action(async (name: string, opts: { number: string; milestone?: string; description?: string }) => {
            try {
                const db = getProjectDb();
                resolveIdentity(db, { agent: program.opts().agent }); // enforce identity

                let milestoneId = opts.milestone;
                if (!milestoneId) {
                    const active = getActiveMilestone(db);
                    if (!active) {
                        console.error('Error: No active milestone. Use --milestone to specify one.');
                        process.exit(1);
                    }
                    milestoneId = active.id;
                }

                const created = addPhase(db, {
                    milestone_id: milestoneId,
                    number: parseInt(opts.number, 10),
                    name,
                    description: opts.description,
                });
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(created, null, 2));
                } else {
                    console.log(`✓ Phase #${created.number} added to milestone '${milestoneId}'`);
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

    // pm phase list
    phase
        .command('list')
        .description('List phases for a milestone')
        .option('--milestone <id>', 'Milestone ID (defaults to active milestone)')
        .option('--status <status>', 'Filter by status')
        .action(async (opts: { milestone?: string; status?: string }) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;

                let milestoneId = opts.milestone;
                if (!milestoneId) {
                    const active = getActiveMilestone(db);
                    if (!active) {
                        console.error('Error: No active milestone. Use --milestone to specify one.');
                        process.exit(1);
                    }
                    milestoneId = active.id;
                }

                const phases = listPhases(db, milestoneId, { status: opts.status });
                console.log(formatPhaseList(phases, json));
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

    // pm phase show <id>
    phase
        .command('show <id>')
        .description('Show phase details')
        .action(async (id: string) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;
                const found = getPhaseById(db, id);

                if (!found) {
                    console.error(`Error: Phase #${id} not found.`);
                    process.exit(1);
                }

                const plans = listPlans(db, found.id);

                if (json) {
                    console.log(JSON.stringify({ ...found, plans }, null, 2));
                } else {
                    console.log(formatPhase(found, false));
                    if (plans.length > 0) {
                        console.log('\nPlans:');
                        console.log(formatPlanList(plans, false));
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

    // pm phase update <id>
    phase
        .command('update <id>')
        .description('Update phase fields')
        .option('--name <name>', 'New name')
        .option('--description <text>', 'New description')
        .option('--status <status>', 'New status')
        .option('--force', 'Bypass transition validation')
        .action(async (id: string, opts: { name?: string; description?: string; status?: string; force?: boolean }) => {
            try {
                const db = getProjectDb();
                resolveIdentity(db, { agent: program.opts().agent }); // enforce identity

                // If --status provided, route through workflow transitions
                if (opts.status) {
                    transitionPhase(db, id, opts.status as any, { force: opts.force });
                }

                // Apply non-status updates via raw CRUD
                const otherUpdates: { name?: string; description?: string } = {};
                if (opts.name !== undefined) otherUpdates.name = opts.name;
                if (opts.description !== undefined) otherUpdates.description = opts.description;
                if (Object.keys(otherUpdates).length > 0) {
                    updatePhase(db, id, otherUpdates);
                }

                const updated = getPhaseById(db, id)!;
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(updated, null, 2));
                } else {
                    console.log(`✓ Phase #${updated.id} updated`);
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
