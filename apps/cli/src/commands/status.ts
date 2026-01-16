/**
 * Comando para ver el estado de los patches.
 *
 * @module cli/commands/status
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import Enquirer from 'enquirer';
import { PatchStatus, ConnectionService, BunDatabaseAdapter } from '@pkg/diff';
import type { DatabaseConnection } from '@pkg/diff';
import { loadComparison, listApplications, listComparisons } from '../utils/config.js';

/**
 * Maneja el comando status para ver el estado de los patches.
 *
 * @throws {Error} Si hay errores al consultar el estado
 */
export async function handleStatusCommand(): Promise<void> {
    try {
        console.log('\n📊 Checking patch status...\n');

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

        // Leer archivos del directorio de patches
        const patchesDir = config.migrationOptions.patchesDirectory;
        const patchesDirPath = join(process.cwd(), patchesDir);

        if (!existsSync(patchesDirPath)) {
            throw new Error(`Patches directory does not exist: ${patchesDirPath}`);
        }

        const files = readdirSync(patchesDirPath);
        const sqlFiles = files.filter((file) => file.endsWith('.sql')).sort();

        if (sqlFiles.length === 0) {
            console.log(`📋 No .sql files found in ${patchesDir}\n`);
            return;
        }

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

        console.log('\n📋 Patch status:\n');

        // Crear conexión
        let connection: DatabaseConnection | null = null;

        try {
            connection = await connectionService.createConnection({
                config: configWithPassword.targetClient,
            });

            // Consultar historial para cada patch
            const statusResults: Array<{
                filename: string;
                status: string;
            }> = [];

            for (const filename of sqlFiles) {
                // Extraer versión y nombre del archivo (formato: TIMESTAMP_name.sql)
                const match = filename.match(/^(\d{14})_(.+)\.sql$/);
                if (!match) {
                    continue;
                }

                const version = match[1];

                try {
                    // Consultar estado del patch (estructura Supabase: solo verificar existencia por version)
                    const statusQuery = `
                        SELECT "version"
                        FROM ${fullTableName}
                        WHERE "version" = $1
                        LIMIT 1;
                    `;

                    const results = await databaseAdapter.query<{
                        version: string;
                    }>({
                        connection,
                        sql: statusQuery,
                        params: [version],
                    });

                    if (results.length > 0) {
                        // Existe = ya aplicada
                        statusResults.push({
                            filename,
                            status: PatchStatus.DONE,
                        });
                    } else {
                        // No existe = pendiente
                        statusResults.push({
                            filename,
                            status: PatchStatus.TO_APPLY,
                        });
                    }
                } catch (error) {
                    // Si hay error al consultar, marcar como pendiente
                    statusResults.push({
                        filename,
                        status: PatchStatus.TO_APPLY,
                    });
                }
            }

            // Mostrar tabla de estados (solo Pending o Applied en Supabase)
            const statusLabels: Record<string, string> = {
                [PatchStatus.TO_APPLY]: '⏳ Pending',
                [PatchStatus.DONE]: '✅ Applied',
            };

            console.log('Status      | File');
            console.log('------------|----------------------------------------');

            statusResults.forEach((result) => {
                const statusLabel = statusLabels[result.status] || result.status;
                console.log(`${statusLabel.padEnd(12)} | ${result.filename}`);
            });

            console.log('\n');
        } catch (error) {
            // Si la tabla no existe, todos los patches están pendientes
            if (error instanceof Error && error.message.includes('does not exist')) {
                console.log('📋 All patches are pending (history table does not exist)\n');
                sqlFiles.forEach((filename) => {
                    console.log(`   ⏳ ${filename}`);
                });
                console.log('');
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
            throw new Error(`Error checking status: ${error.message}`, { cause: error });
        }
        throw error;
    }
}
