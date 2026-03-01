import { Command } from 'commander';
import {
    createPlan,
    listPlans,
    getPlanById,
    updatePlan,
} from '../../core/plan.js';
import { transitionPlan } from '../../core/workflow.js';
import { resolveIdentity, getProjectDb } from '../../core/identity.js';
import {
    formatPlan,
    formatPlanList,
    formatPlanBoard,
} from '../../output/formatter.js';

/**
 * Register all plan management commands under `pm plan`.
 */
export function registerPlanCommands(program: Command): void {
    const plan = program
        .command('plan')
        .description('Manage execution plans');

    // pm plan create <name>
    plan
        .command('create <name>')
        .description('Create a plan within a phase')
        .requiredOption('--phase <id>', 'Phase DB ID')
        .requiredOption('--number <n>', 'Plan number')
        .option('--wave <n>', 'Wave number (default: 1)')
        .option('--content <text>', 'Plan content/description')
        .action(async (name: string, opts: { phase: string; number: string; wave?: string; content?: string }) => {
            try {
                const db = getProjectDb();
                resolveIdentity(db, { agent: program.opts().agent });
                const phaseId = parseInt(opts.phase, 10);
                const created = createPlan(db, {
                    phase_id: phaseId,
                    number: parseInt(opts.number, 10),
                    name,
                    wave: opts.wave ? parseInt(opts.wave, 10) : 1,
                    content: opts.content,
                });
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(created, null, 2));
                } else {
                    console.log(`✓ Plan #${created.number} created in phase #${phaseId}`);
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

    // pm plan list
    plan
        .command('list')
        .description('List plans for a phase')
        .requiredOption('--phase <id>', 'Phase DB ID')
        .option('--status <status>', 'Filter by status: pending, in_progress, completed, failed')
        .option('--wave <n>', 'Filter by wave number')
        .action(async (opts: { phase: string; status?: string; wave?: string }) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;
                const phaseId = parseInt(opts.phase, 10);
                const plans = listPlans(db, phaseId, {
                    status: opts.status,
                    wave: opts.wave !== undefined ? parseInt(opts.wave, 10) : undefined,
                });
                console.log(formatPlanList(plans, json));
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

    // pm plan show <id>
    plan
        .command('show <id>')
        .description('Show plan details')
        .action(async (id: string) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;
                const found = getPlanById(db, parseInt(id, 10));

                if (!found) {
                    console.error(`Error: Plan #${id} not found.`);
                    process.exit(1);
                }

                console.log(formatPlan(found, json));
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

    // pm plan update <id>
    plan
        .command('update <id>')
        .description('Update plan fields')
        .option('--name <name>', 'New name')
        .option('--status <status>', 'New status (routed through workflow transitions)')
        .option('--content <text>', 'New content')
        .option('--wave <n>', 'New wave number')
        .option('--force', 'Bypass transition validation')
        .action(async (id: string, opts: { name?: string; status?: string; content?: string; wave?: string; force?: boolean }) => {
            try {
                const db = getProjectDb();
                resolveIdentity(db, { agent: program.opts().agent });
                const planId = parseInt(id, 10);

                // If --status provided, route through workflow transitions
                if (opts.status) {
                    transitionPlan(db, planId, opts.status as any, { force: opts.force });
                }

                // Apply non-status updates via raw CRUD
                const otherUpdates: { name?: string; content?: string; wave?: number } = {};
                if (opts.name !== undefined) otherUpdates.name = opts.name;
                if (opts.content !== undefined) otherUpdates.content = opts.content;
                if (opts.wave !== undefined) otherUpdates.wave = parseInt(opts.wave, 10);

                if (Object.keys(otherUpdates).length > 0) {
                    updatePlan(db, planId, otherUpdates);
                }

                const updated = getPlanById(db, planId)!;
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(updated, null, 2));
                } else {
                    console.log(`✓ Plan #${updated.id} updated`);
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

    // pm plan board
    plan
        .command('board')
        .description('Show plans as a kanban board grouped by status')
        .requiredOption('--phase <id>', 'Phase DB ID')
        .action(async (opts: { phase: string }) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;
                const phaseId = parseInt(opts.phase, 10);
                const plans = listPlans(db, phaseId);
                console.log(formatPlanBoard(plans, json));
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
