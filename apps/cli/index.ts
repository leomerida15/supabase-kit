/**
 * CLI principal para el sistema de comparación y migración de PostgreSQL.
 *
 * @module cli/index
 */

import { handleDiffCommand } from './src/commands/diff.js';

/**
 * Muestra el saludo y el listado de comandos disponibles.
 */
function showWelcome(): void {
    console.log('\n✨ Welcome to Supa-Kit CLI ✨\n');
    console.log('Available commands:\n');
    console.log('  diff        Diff operations (compare, migrate, status, etc.)\n');
    console.log('Usage: supa-kit diff <subcommand>\n');
    console.log('Run "supa-kit diff" to see available subcommands.\n');

    console.log('made by GobernAI LLC and LatamEarth C.A. with ❤️');

    console.log('https://gobern.ai/');
    console.log('https://latamearth.com');
}

/**
 * Función principal del CLI.
 *
 * @throws {Error} Si hay errores en la ejecución
 */
async function main(): Promise<void> {
    try {
        const args = process.argv.slice(2);
        const command = args[0];

        // Si no hay comando, mostrar saludo y ayuda
        if (!command) {
            showWelcome();
            return;
        }

        // Ejecutar comando correspondiente
        switch (command) {
            case 'diff': {
                const remainingArgs = args.slice(1);
                await handleDiffCommand({ args: remainingArgs });
                break;
            }

            default: {
                console.error(`❌ Unknown command: ${command}\n`);
                showWelcome();
                process.exit(1);
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('\n❌ Error:', error.message);
            if (error.cause instanceof Error) {
                console.error('   Cause:', error.cause.message);
            }
            if (error.stack) {
                console.error('\nStack trace:');
                console.error(error.stack);
            }
        } else {
            console.error('\n❌ Unknown error:', error);
        }
        process.exit(1);
    }
}

// Ejecutar el CLI
main();
