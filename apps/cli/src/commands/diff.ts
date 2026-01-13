/**
 * Comando raíz diff y sus subcomandos.
 *
 * @module cli/commands/diff
 */

import { handleAddCommand } from './add.js';
import { handleLsCommand } from './ls.js';
import { handleCompareCommand } from './compare.js';
import { handleMigrateCommand } from './migrate.js';
import { handleStatusCommand } from './status.js';
import { handleHistoryCommand } from './history.js';

/**
 * Lista de subcomandos disponibles bajo diff.
 */
const DIFF_SUBCOMMANDS = [
    {
        name: 'add',
        description: 'Add environment or comparison',
    },
    {
        name: 'ls',
        description: 'List applications, environments and comparisons',
    },
    {
        name: 'compare',
        description: 'Generate SQL patch (compare databases)',
    },
    {
        name: 'migrate',
        description: 'Execute migrations (pending patches)',
    },
    {
        name: 'status',
        description: 'View status of all patches',
    },
    {
        name: 'history',
        description: 'View history of applied patches',
    },
] as const;

/**
 * Muestra la ayuda de los subcomandos disponibles bajo diff.
 */
function showDiffHelp(): void {
    console.log('\n🔍 Diff Command\n');
    console.log('Available subcommands:\n');

    DIFF_SUBCOMMANDS.forEach(({ name, description }) => {
        console.log(`  ${name.padEnd(10)} ${description}`);
    });

    console.log('\n');
    console.log('Usage: supa-kit diff <subcommand>\n');
}

/**
 * Maneja el comando diff y sus subcomandos.
 *
 * @param args - Argumentos restantes después de 'diff'
 * @throws {Error} Si hay errores al ejecutar el comando
 */
export async function handleDiffCommand({ args }: { args: string[] }): Promise<void> {
    try {
        const subcommand = args[0];

        // Si no hay subcomando, mostrar ayuda
        if (!subcommand) {
            showDiffHelp();
            return;
        }

        // Ejecutar subcomando correspondiente
        switch (subcommand) {
            case 'add': {
                await handleAddCommand();
                break;
            }

            case 'ls': {
                await handleLsCommand();
                break;
            }

            case 'compare': {
                await handleCompareCommand();
                break;
            }

            case 'migrate': {
                await handleMigrateCommand();
                break;
            }

            case 'status': {
                await handleStatusCommand();
                break;
            }

            case 'history': {
                await handleHistoryCommand();
                break;
            }

            default: {
                console.error(`❌ Unknown subcommand: ${subcommand}\n`);
                showDiffHelp();
                process.exit(1);
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error executing diff command: ${error.message}`, { cause: error });
        }
        throw error;
    }
}
