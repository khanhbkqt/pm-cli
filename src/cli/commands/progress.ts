import type { Command } from 'commander';
import { program } from '../program.js';
import { getProjectDb } from '../../core/identity.js';
import { getActiveMilestone, getMilestoneById } from '../../core/milestone.js';
import { listPhases } from '../../core/phase.js';
import { listPlans } from '../../core/plan.js';
import { formatProgress } from '../../output/formatter.js';

/**
 * Register the `pm progress` command.
 * Read-only — does not require agent identity.
 */
export function registerProgressCommand(program: Command): void {
    program
        .command('progress')
        .description('Show active milestone progress')
        .option('--milestone <id>', 'Show a specific milestone by slug/id')
        .action(async (opts: { milestone?: string }) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;

                // Resolve milestone
                let milestone;
                if (opts.milestone) {
                    milestone = getMilestoneById(db, opts.milestone);
                    if (!milestone) {
                        console.error(`Milestone '${opts.milestone}' not found.`);
                        db.close();
                        process.exit(1);
                    }
                } else {
                    milestone = getActiveMilestone(db);
                    if (!milestone) {
                        console.log('No active milestone. Create one with: pm milestone create');
                        db.close();
                        process.exit(0);
                    }
                }

                // Enrich phases with plan stats
                const phases = listPhases(db, milestone.id);
                const enrichedPhases = phases.map(phase => {
                    const plans = listPlans(db, phase.id);
                    return {
                        ...phase,
                        plans_total: plans.length,
                        plans_done: plans.filter(p => p.status === 'completed').length,
                        plans_failed: plans.filter(p => p.status === 'failed').length,
                    };
                });

                // Compute summary
                const phases_total = phases.length;
                const phases_complete = phases.filter(p => p.status === 'completed').length;
                const phases_pct = phases_total > 0 ? Math.round((phases_complete / phases_total) * 100) : 0;

                const output = formatProgress(
                    {
                        milestone,
                        phases: enrichedPhases,
                        summary: { phases_total, phases_complete, phases_pct },
                    },
                    json
                );

                console.log(output);
                db.close();
            } catch (err: any) {
                console.error(`Error: ${err.message}`);
                process.exit(1);
            }
        });
}
