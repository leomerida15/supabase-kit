/**
 * Comando para comparar bases de datos y generar patches SQL.
 *
 * @module cli/commands/compare
 */

import Enquirer from 'enquirer';
import { PgDiff, type EventListener } from '@pkg/diff';
import { loadComparison, listApplications, listComparisons } from '../utils/config.js';

/**
 * Maneja el comando compare para generar patches SQL.
 *
 * @throws {Error} Si hay errores al ejecutar la comparación
 */
export async function handleCompareCommand(): Promise<void> {
    try {
        console.log('\n🔄 Starting database comparison...\n');

        // Listar aplicaciones existentes
        const applications = listApplications();

        if (applications.length === 0) {
            console.log('❌ No applications configured.\n');
            console.log('💡 Use the "add" command to create a new application.\n');
            return;
        }

        // Seleccionar aplicación
        const applicationChoices = applications.map((app) => ({ name: app, message: app }));

        const applicationAnswer = await Enquirer.prompt<{ applicationName: string }>({
            type: 'select',
            name: 'applicationName',
            message: 'Select an application:',
            choices: applicationChoices,
        });

        const applicationName = applicationAnswer.applicationName;

        // Listar comparaciones de la aplicación
        const comparisons = listComparisons({ applicationName });

        if (comparisons.length === 0) {
            console.log(`❌ Application "${applicationName}" has no comparisons configured.\n`);
            console.log('💡 Use the "add" command to create a comparison.\n');
            return;
        }

        // Seleccionar comparación
        const comparisonChoices = comparisons.map((comp) => ({ name: comp, message: comp }));

        const comparisonAnswer = await Enquirer.prompt<{ comparisonName: string }>({
            type: 'select',
            name: 'comparisonName',
            message: 'Select a comparison:',
            choices: comparisonChoices,
        });

        const comparisonName = comparisonAnswer.comparisonName;

        // Solicitar nombre del script
        const scriptAnswer = await Enquirer.prompt<{ scriptName: string }>({
            type: 'input',
            name: 'scriptName',
            message: 'Script name (without extension):',
            validate: (value: string) => {
                if (!value || value.trim() === '') {
                    return 'Script name is required';
                }
                if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                    return 'Script name can only contain letters, numbers, hyphens and underscores';
                }
                return true;
            },
        });

        const scriptName = scriptAnswer.scriptName.trim();

        // Cargar configuración
        const config = loadComparison({ applicationName, comparisonName });

        // Solicitar passwords
        const sourcePasswordAnswer = await Enquirer.prompt<{ password: string }>({
            type: 'password',
            name: 'password',
            message: `Password for ${config.sourceClient.user}@${config.sourceClient.host}:${config.sourceClient.port}/${config.sourceClient.database}:`,
        });

        const targetPasswordAnswer = await Enquirer.prompt<{ password: string }>({
            type: 'password',
            name: 'password',
            message: `Password for ${config.targetClient.user}@${config.targetClient.host}:${config.targetClient.port}/${config.targetClient.database}:`,
        });

        // Agregar passwords a la configuración
        const configWithPasswords = {
            ...config,
            sourceClient: {
                ...config.sourceClient,
                password: sourcePasswordAnswer.password || null,
            },
            targetClient: {
                ...config.targetClient,
                password: targetPasswordAnswer.password || null,
            },
        };

        console.log('\n📋 Configuration:');
        console.log(`   Application: ${applicationName}`);
        console.log(`   Comparison: ${comparisonName}`);
        console.log(`   Script: ${scriptName}`);
        console.log(
            `   Source: ${config.sourceClient.host}:${config.sourceClient.port}/${config.sourceClient.database}`,
        );
        console.log(
            `   Target: ${config.targetClient.host}:${config.targetClient.port}/${config.targetClient.database}`,
        );
        console.log(`   Output: ${config.compareOptions.outputDirectory}\n`);

        // Crear instancia de PgDiff
        const pgDiff = new PgDiff({ config: configWithPasswords });

        // Registrar listeners de eventos
        const eventListener: EventListener = (message: string, progress?: number) => {
            const progressText = progress !== undefined ? ` (${progress}%)` : '';
            console.log(message + progressText);
        };

        pgDiff.events.on({ event: 'compare', listener: eventListener });
        pgDiff.events.on({ event: 'analyze', listener: eventListener });
        pgDiff.events.on({ event: 'data-compare', listener: eventListener });

        // Ejecutar comparación
        console.log('🔄 Starting comparison...\n');
        const patchFile = await pgDiff.compare({ scriptName });

        console.log('\n✅ Comparison completed successfully!');
        console.log(`📄 Generated file: ${patchFile}\n`);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error executing comparison: ${error.message}`, { cause: error });
        }
        throw error;
    }
}
