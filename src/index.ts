import { program } from './cli/program.js';
import { registerInitCommand } from './cli/commands/init.js';
import { registerAgentCommands } from './cli/commands/agent.js';
import { registerTaskCommands } from './cli/commands/task.js';
import { registerMilestoneCommands } from './cli/commands/milestone.js';
import { registerPhaseCommands } from './cli/commands/phase.js';
import { registerPlanCommands } from './cli/commands/plan.js';
import { registerContextCommands } from './cli/commands/context.js';
import { registerStatusCommand } from './cli/commands/status.js';
import { registerDashboardCommand } from './cli/commands/dashboard.js';
import { registerInstallCommand } from './cli/commands/install.js';
import { registerProgressCommand } from './cli/commands/progress.js';

// Register commands
registerInitCommand(program);
registerAgentCommands(program);
registerTaskCommands(program);
registerContextCommands(program);
registerStatusCommand(program);
registerDashboardCommand(program);
registerInstallCommand(program);
registerMilestoneCommands(program);
registerPhaseCommands(program);
registerPlanCommands(program);
registerProgressCommand(program);

// Parse and execute
program.parseAsync(process.argv);

