import { Command } from 'commander';
import {
    addTask,
    listTasks,
    getTaskById,
    updateTask,
    assignTask,
    addComment,
    getComments,
} from '../../core/task.js';
import { getAgentByName } from '../../core/agent.js';
import { resolveIdentity, getProjectDb } from '../../core/identity.js';
import {
    formatTask,
    formatTaskList,
    formatComment,
    formatCommentList,
} from '../../output/formatter.js';

/**
 * Register all task management commands under `pm task`.
 */
export function registerTaskCommands(program: Command): void {
    const task = program
        .command('task')
        .description('Manage tasks');

    // pm task add <title>
    task
        .command('add <title>')
        .description('Create a new task')
        .option('--description <desc>', 'Task description')
        .option('--priority <priority>', 'Priority: low, medium, high, urgent')
        .option('--parent <id>', 'Parent task ID for subtasks')
        .action(async (title: string, opts: { description?: string; priority?: string; parent?: string }) => {
            try {
                const db = getProjectDb();
                const me = resolveIdentity(db, { agent: program.opts().agent });
                const created = addTask(db, {
                    title,
                    description: opts.description,
                    priority: opts.priority,
                    parent_id: opts.parent ? parseInt(opts.parent, 10) : undefined,
                    created_by: me.id,
                });
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(created, null, 2));
                } else {
                    console.log(`✓ Task #${created.id} created: "${created.title}"`);
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

    // pm task list
    task
        .command('list')
        .description('List tasks')
        .option('--status <status>', 'Filter by status')
        .option('--assigned <agent>', 'Filter by assigned agent name')
        .option('--parent <id>', 'Filter by parent task ID')
        .action(async (opts: { status?: string; assigned?: string; parent?: string }) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;

                // Resolve agent name to ID if filtering by assigned
                let assignedId: string | undefined;
                if (opts.assigned) {
                    const agent = getAgentByName(db, opts.assigned);
                    if (!agent) {
                        console.error(`Error: Agent '${opts.assigned}' not found.`);
                        process.exit(1);
                    }
                    assignedId = agent.id;
                }

                const tasks = listTasks(db, {
                    status: opts.status,
                    assigned_to: assignedId,
                    parent_id: opts.parent ? parseInt(opts.parent, 10) : undefined,
                });
                console.log(formatTaskList(tasks, json));
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

    // pm task show <id>
    task
        .command('show <id>')
        .description('Show task details and comments')
        .action(async (id: string) => {
            try {
                const db = getProjectDb();
                const json = program.opts().json;
                const taskId = parseInt(id, 10);
                const found = getTaskById(db, taskId);

                if (!found) {
                    console.error(`Error: Task #${id} not found.`);
                    process.exit(1);
                }

                if (json) {
                    const comments = getComments(db, taskId);
                    console.log(JSON.stringify({ ...found, comments }, null, 2));
                } else {
                    console.log(formatTask(found, false));
                    const comments = getComments(db, taskId);
                    if (comments.length > 0) {
                        console.log('\nComments:');
                        console.log(formatCommentList(comments, false));
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

    // pm task update <id>
    task
        .command('update <id>')
        .description('Update task fields')
        .option('--title <title>', 'New title')
        .option('--description <desc>', 'New description')
        .option('--status <status>', 'New status')
        .option('--priority <priority>', 'New priority')
        .action(async (id: string, opts: { title?: string; description?: string; status?: string; priority?: string }) => {
            try {
                const db = getProjectDb();
                resolveIdentity(db, { agent: program.opts().agent }); // enforce identity
                const taskId = parseInt(id, 10);
                const updated = updateTask(db, taskId, {
                    title: opts.title,
                    description: opts.description,
                    status: opts.status,
                    priority: opts.priority,
                });
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(updated, null, 2));
                } else {
                    console.log(`✓ Task #${updated.id} updated`);
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

    // pm task assign <id>
    task
        .command('assign <id>')
        .description('Assign task to an agent')
        .requiredOption('--to <agent>', 'Agent name to assign to')
        .action(async (id: string, opts: { to: string }) => {
            try {
                const db = getProjectDb();
                resolveIdentity(db, { agent: program.opts().agent }); // enforce identity

                // Resolve agent name to ID
                const agent = getAgentByName(db, opts.to);
                if (!agent) {
                    console.error(`Error: Agent '${opts.to}' not found.`);
                    process.exit(1);
                }

                const taskId = parseInt(id, 10);
                const updated = assignTask(db, taskId, agent.id);
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(updated, null, 2));
                } else {
                    console.log(`✓ Task #${updated.id} assigned to '${opts.to}'`);
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

    // pm task comment <id> <message>
    task
        .command('comment <id> <message>')
        .description('Add a comment to a task')
        .action(async (id: string, message: string) => {
            try {
                const db = getProjectDb();
                const me = resolveIdentity(db, { agent: program.opts().agent });
                const taskId = parseInt(id, 10);

                // Validate task exists
                const found = getTaskById(db, taskId);
                if (!found) {
                    console.error(`Error: Task #${id} not found.`);
                    process.exit(1);
                }

                const comment = addComment(db, {
                    task_id: taskId,
                    agent_id: me.id,
                    content: message,
                });
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(comment, null, 2));
                } else {
                    console.log(`✓ Comment added to task #${taskId}`);
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
