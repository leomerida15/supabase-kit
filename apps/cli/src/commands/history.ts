/**
 * Comando para ver el historial de patches aplicados.
 *
 * @module cli/commands/history
 */

import Enquirer from 'enquirer';
import { ConnectionService, BunDatabaseAdapter, PatchStatus } from '@pkg/diff';
import type { DatabaseConnection } from '@pkg/diff';
import { loadComparison, listApplications, listComparisons } from '../utils/config.js';

/**
 * Maneja el comando history para ver el historial de patches aplicados.
 *
 * @throws {Error} Si hay errores al consultar el historial
 */
export async function handleHistoryCommand(): Promise<void> {
    try {
        console.log('\n📜 Checking patch history...\n');

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

        // Solicitar password del target
        const passwordAnswer = await Enquirer.prompt<{ password: string }>({
            type: 'password',
            name: 'password',
            message: `Password for ${config.targetClient.user}@${config.targetClient.host}:${config.targetClient.port}/${config.targetClient.database}:`,
        });

        // Agregar password a la configuración
        const configWithPassword = {
            ...config,
            targetClient: {
                ...config.targetClient,
                password: passwordAnswer.password || null,
            },
        };

        // Crear servicios para consultar historial
        const databaseAdapter = new BunDatabaseAdapter();
        const connectionService = new ConnectionService({ databaseAdapter });

        // Obtener información de la tabla de historial
        const historyTableSchema = config.migrationOptions.historyTableSchema;
        const historyTableName = config.migrationOptions.historyTableName;
        const fullTableName = `"${historyTableSchema}"."${historyTableName}"`;

        console.log('\n📜 Applied patches history:\n');

        // Crear conexión
        let connection: DatabaseConnection | null = null;

        try {
            connection = await connectionService.createConnection({
                config: configWithPassword.targetClient,
            });

            // Consultar todo el historial
            const historyQuery = `
                SELECT "version", "name", "status", "author", "message"
                FROM ${fullTableName}
                ORDER BY "version" DESC;
            `;

            const results = await databaseAdapter.query<{
                version: string;
                name: string;
                status: string;
                author: string;
                message: string | null;
            }>({
                connection,
                sql: historyQuery,
            });

            if (results.length === 0) {
                console.log('📋 No patches in history.\n');
                return;
            }

            // Mostrar lista de patches
            const statusLabels: Record<string, string> = {
                [PatchStatus.TO_APPLY]: '⏳ Pending',
                [PatchStatus.IN_PROGRESS]: '🔄 In progress',
                [PatchStatus.DONE]: '✅ Applied',
                [PatchStatus.ERROR]: '❌ Error',
            };

            results.forEach((result, index) => {
                const isLast = index === results.length - 1;
                const prefix = isLast ? '└──' : '├──';
                const filename = `${result.version}_${result.name}.sql`;
                const statusLabel = statusLabels[result.status] || result.status;
                const author = result.author ? ` (${result.author})` : '';
                const message = result.message ? ` - ${result.message}` : '';

                console.log(`   ${prefix} ${filename}`);
                console.log(`   ${isLast ? '    ' : '│   '}    ${statusLabel}${author}${message}`);
                if (!isLast) {
                    console.log('');
                }
            });

            console.log('\n');
        } catch (error) {
            if (error instanceof Error && error.message.includes('does not exist')) {
                console.log('📋 History table does not exist. No patches applied.\n');
            } else {
                throw error;
            }
        } finally {
            if (connection) {
                await databaseAdapter.close({ connection });
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error checking history: ${error.message}`, { cause: error });
        }
        throw error;
    }
}
