import { program } from './cli/program.js';
import { registerInitCommand } from './cli/commands/init.js';
import { registerAgentCommands } from './cli/commands/agent.js';
import { registerTaskCommands } from './cli/commands/task.js';

// Register commands
registerInitCommand(program);
registerAgentCommands(program);
registerTaskCommands(program);

// Parse and execute
program.parse(process.argv);
