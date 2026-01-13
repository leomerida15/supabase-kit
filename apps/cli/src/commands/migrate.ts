/**
 * Comando para ejecutar migraciones de patches SQL.
 *
 * @module cli/commands/migrate
 */

import Enquirer from 'enquirer';
import { PgDiff, type EventListener } from '@pkg/diff';
import { loadComparison, listApplications, listComparisons } from '../utils/config.js';

/**
 * Maneja el comando migrate para ejecutar patches pendientes.
 *
 * @throws {Error} Si hay errores al ejecutar la migración
 */
export async function handleMigrateCommand(): Promise<void> {
    try {
        console.log('\n🚀 Starting patch migration...\n');

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

        // Cargar configuración
        const config = loadComparison({ applicationName, comparisonName });

        // Validar que patchesDirectory esté configurado
        if (!config.migrationOptions.patchesDirectory) {
            throw new Error(
                `Comparison "${comparisonName}" does not have patches directory configured.`,
            );
        }

        // Preguntar opciones
        const optionsAnswer = await Enquirer.prompt<{
            force: boolean;
            toSourceClient: boolean;
        }>([
            {
                type: 'confirm',
                name: 'force',
                message: 'Force execution of patches with errors?',
                initial: false,
            },
            {
                type: 'confirm',
                name: 'toSourceClient',
                message: 'Execute on source database (instead of target)?',
                initial: false,
            },
        ]);

        // Determinar qué cliente usar
        const targetClient = optionsAnswer.toSourceClient ? config.sourceClient : config.targetClient;

        // Solicitar password
        const passwordAnswer = await Enquirer.prompt<{ password: string }>({
            type: 'password',
            name: 'password',
            message: `Password for ${targetClient.user}@${targetClient.host}:${targetClient.port}/${targetClient.database}:`,
        });

        // Agregar password a la configuración
        const configWithPassword = {
            ...config,
            sourceClient: {
                ...config.sourceClient,
                password: optionsAnswer.toSourceClient ? passwordAnswer.password || null : null,
            },
            targetClient: {
                ...config.targetClient,
                password: !optionsAnswer.toSourceClient ? passwordAnswer.password || null : null,
            },
        };

        console.log('\n📋 Configuration:');
        console.log(`   Application: ${applicationName}`);
        console.log(`   Comparison: ${comparisonName}`);
        console.log(`   Patches directory: ${config.migrationOptions.patchesDirectory}`);
        console.log(`   Force execution: ${optionsAnswer.force ? 'Yes' : 'No'}`);
        console.log(`   Execute on: ${optionsAnswer.toSourceClient ? 'Source' : 'Target'}`);
        console.log(
            `   Database: ${targetClient.host}:${targetClient.port}/${targetClient.database}\n`,
        );

        // Crear instancia de PgDiff
        const pgDiff = new PgDiff({ config: configWithPassword });

        // Registrar listeners de eventos
        const eventListener: EventListener = (message: string, progress?: number) => {
            const progressText = progress !== undefined ? ` (${progress}%)` : '';
            console.log(message + progressText);
        };

        pgDiff.events.on({ event: 'migration', listener: eventListener });

        // Ejecutar migración
        console.log('🔄 Starting migration...\n');
        const appliedPatches = await pgDiff.migrate({
            force: optionsAnswer.force,
            toSourceClient: optionsAnswer.toSourceClient,
        });

        console.log('\n✅ Migration completed successfully!');
        console.log(`📦 Applied patches: ${appliedPatches.length}\n`);

        if (appliedPatches.length > 0) {
            console.log('📋 Applied patches:');
            appliedPatches.forEach((patch, index) => {
                const prefix = index === appliedPatches.length - 1 ? '└──' : '├──';
                console.log(`   ${prefix} ${patch.filename}`);
            });
            console.log('');
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error executing migration: ${error.message}`, { cause: error });
        }
        throw error;
    }
}
