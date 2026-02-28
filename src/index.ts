import { program } from './cli/program.js';
import { registerInitCommand } from './cli/commands/init.js';
import { registerAgentCommands } from './cli/commands/agent.js';
import { registerTaskCommands } from './cli/commands/task.js';
import { registerContextCommands } from './cli/commands/context.js';
import { registerStatusCommand } from './cli/commands/status.js';
import { registerDashboardCommand } from './cli/commands/dashboard.js';

// Register commands
registerInitCommand(program);
registerAgentCommands(program);
registerTaskCommands(program);
registerContextCommands(program);
registerStatusCommand(program);
registerDashboardCommand(program);

// Parse and execute
program.parseAsync(process.argv);

