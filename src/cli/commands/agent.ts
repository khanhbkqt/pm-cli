import { Command } from 'commander';
import { handleCommandError } from '../../cli/error.js';
import { registerAgent, listAgents, getAgentByName } from '../../core/agent.js';
import { resolveIdentity, getProjectDb } from '../../core/identity.js';
import { formatAgent, formatAgentList } from '../../output/formatter.js';

/**
 * Register all agent management commands under `pm agent`.
 */
export function registerAgentCommands(program: Command): void {
    const agent = program
        .command('agent')
        .description('Manage agents');

    // pm agent register <name> --role <role> --type <human|ai>
    agent
        .command('register <name>')
        .description('Register a new agent')
        .requiredOption('--role <role>', 'Agent role (e.g. developer, reviewer, pm)')
        .requiredOption('--type <type>', 'Agent type: human or ai')
        .action(async (name: string, opts: { role: string; type: string }) => {
            try {
                const db = getProjectDb();
                const created = registerAgent(db, { name, role: opts.role, type: opts.type });
                const json = program.opts().json;

                if (json) {
                    console.log(JSON.stringify(created, null, 2));
                } else {
                    console.log(`✓ Agent '${created.name}' registered (id: ${created.id})`);
                }
                db.close();
            } catch (error) {
                handleCommandError(error);
            }
        });

    // pm agent list
    agent
        .command('list')
        .description('List all registered agents')
        .action(async () => {
            try {
                const db = getProjectDb();
                const agents = listAgents(db);
                const json = program.opts().json;
                console.log(formatAgentList(agents, json));
                db.close();
            } catch (error) {
                handleCommandError(error);
            }
        });

    // pm agent show <name>
    agent
        .command('show <name>')
        .description('Show details of an agent')
        .action(async (name: string) => {
            try {
                const db = getProjectDb();
                const found = getAgentByName(db, name);
                if (!found) {
                    console.error(`Error: Agent '${name}' not found`);
                    process.exit(1);
                }
                const json = program.opts().json;
                console.log(formatAgent(found, json));
                db.close();
            } catch (error) {
                handleCommandError(error);
            }
        });

    // pm agent whoami
    agent
        .command('whoami')
        .description('Show the current agent identity')
        .action(async () => {
            try {
                const db = getProjectDb();
                const me = resolveIdentity(db, { agent: program.opts().agent });
                const json = program.opts().json;
                console.log(formatAgent(me, json));
                db.close();
            } catch (error) {
                handleCommandError(error);
            }
        });
}
