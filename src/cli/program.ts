import { Command } from 'commander';

const program = new Command();

program
    .name('pm')
    .description('Project Management CLI for Humans & AI Agents')
    .version('0.1.0')
    .option('--json', 'Output in JSON format')
    .option('--agent <name>', 'Agent identity for operations');

export { program };
