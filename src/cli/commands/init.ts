import { Command } from 'commander';
import { handleCommandError } from '../../cli/error.js';
import { initProject } from '../../core/init.js';
import path from 'path';

export function registerInitCommand(program: Command): void {
    program
        .command('init [name]')
        .description('Initialize a new PM project')
        .action(async (name?: string) => {
            const targetDir = process.cwd();
            const projectName = name || path.basename(targetDir);

            try {
                await initProject(projectName, targetDir);
            } catch (error) {
                handleCommandError(error);
            }
        });
}
