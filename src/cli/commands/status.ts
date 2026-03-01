import { Command } from 'commander';
import { handleCommandError } from '../../cli/error.js';
import { getProjectDb } from '../../core/identity.js';

/**
 * Register the `pm status` dashboard command.
 */
export function registerStatusCommand(program: Command): void {
    program
        .command('status')
        .description('Show project status dashboard')
        .action(async () => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;

                // Query counts
                const agentCount = (db.prepare('SELECT COUNT(*) as count FROM agents').get() as { count: number }).count;

                const taskTotal = (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }).count;
                const taskTodo = (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'todo'").get() as { count: number }).count;
                const taskInProgress = (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'in-progress'").get() as { count: number }).count;
                const taskDone = (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'done'").get() as { count: number }).count;

                const contextCount = (db.prepare('SELECT COUNT(*) as count FROM context').get() as { count: number }).count;

                if (json) {
                    console.log(JSON.stringify({
                        agents: agentCount,
                        tasks: {
                            total: taskTotal,
                            todo: taskTodo,
                            'in-progress': taskInProgress,
                            done: taskDone,
                        },
                        context: contextCount,
                    }, null, 2));
                } else {
                    console.log('📋 Project Status');
                    console.log('─────────────────');
                    console.log(`Agents:  ${agentCount} registered`);
                    console.log(`Tasks:   ${taskTotal} total (${taskTodo} todo, ${taskInProgress} in-progress, ${taskDone} done)`);
                    console.log(`Context: ${contextCount} entries`);
                }

                db.close();
            } catch (error) {
                handleCommandError(error);
            }
        });
}
