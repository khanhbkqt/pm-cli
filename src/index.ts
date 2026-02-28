import { program } from './cli/program.js';
import { registerInitCommand } from './cli/commands/init.js';
import { registerAgentCommands } from './cli/commands/agent.js';

// Register commands
registerInitCommand(program);
registerAgentCommands(program);

// Parse and execute
program.parse(process.argv);
