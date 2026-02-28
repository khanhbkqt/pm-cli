import { program } from './cli/program.js';
import { registerInitCommand } from './cli/commands/init.js';

// Register commands
registerInitCommand(program);

// Parse and execute
program.parse(process.argv);
