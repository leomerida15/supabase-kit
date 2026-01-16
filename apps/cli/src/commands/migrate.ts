/**
 * Comando para ejecutar migraciones de patches SQL.
 *
 * @module cli/commands/migrate
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import Enquirer from 'enquirer';
import { PgDiff, type EventListener, PatchStatus, ConnectionService, BunDatabaseAdapter } from '@pkg/diff';
import type { DatabaseConnection } from '@pkg/diff';
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

        // Siempre solicitar los schemas al usuario
        const existingSchemas = config.compareOptions.schemaCompare.namespaces || [];
        const initialValue = existingSchemas.length > 0 ? existingSchemas.join(', ') : '';

        const schemasAnswer = await Enquirer.prompt<{ schemas: string }>({
            type: 'input',
            name: 'schemas',
            message: 'Schemas to migrate (comma-separated, empty for all):',
            initial: initialValue,
        });

        const schemas = schemasAnswer.schemas.trim()
            ? schemasAnswer.schemas
                  .split(',')
                  .map((s: string) => s.trim())
                  .filter((s: string) => s !== '')
            : [];

        // Actualizar la configuración con los schemas seleccionados
        config.compareOptions.schemaCompare.namespaces = schemas;

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

        // Validar que la contraseña no esté vacía
        if (!passwordAnswer.password || passwordAnswer.password.trim() === '') {
            throw new Error('Password is required for database connection');
        }

        // Agregar password a la configuración
        const configWithPassword = {
            ...config,
            sourceClient: {
                ...config.sourceClient,
                password: optionsAnswer.toSourceClient ? passwordAnswer.password : null,
            },
            targetClient: {
                ...config.targetClient,
                password: !optionsAnswer.toSourceClient ? passwordAnswer.password : null,
            },
        };

        // Listar migraciones locales y consultar su estado en la base de datos
        console.log('\n📋 Listing local migrations and checking status...\n');

        const patchesDir = config.migrationOptions.patchesDirectory;
        const patchesDirPath = join(process.cwd(), patchesDir);

        if (!existsSync(patchesDirPath)) {
            throw new Error(`Patches directory does not exist: ${patchesDirPath}`);
        }

        const files = readdirSync(patchesDirPath);
        const sqlFiles = files.filter((file) => file.endsWith('.sql')).sort();

        if (sqlFiles.length === 0) {
            console.log(`❌ No .sql files found in ${patchesDir}\n`);
            console.log('💡 Use the "compare" command to generate migration patches.\n');
            return;
        }

        // Crear servicios para consultar historial
        const databaseAdapter = new BunDatabaseAdapter();
        const connectionService = new ConnectionService({ databaseAdapter });

        // Obtener información de la tabla de historial
        const historyTableSchema = config.migrationOptions.historyTableSchema;
        const historyTableName = config.migrationOptions.historyTableName;
        const fullTableName = `"${historyTableSchema}"."${historyTableName}"`;

        console.log('📊 Migration status:\n');

        // Crear conexión para consultar el estado
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
                    // CONSULTA A LA BASE DE DATOS para verificar si la migración ya se aplicó (estructura Supabase)
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
                        // La migración existe en la tabla de historial = ya aplicada
                        statusResults.push({
                            filename,
                            status: PatchStatus.DONE,
                        });
                    } else {
                        // La migración no existe en la tabla de historial (pendiente)
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

            // Mostrar tabla de estados
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

            // Encontrar la próxima migración a aplicar
            const nextMigration = statusResults.find(
                (result) => result.status === PatchStatus.TO_APPLY,
            );

            if (nextMigration) {
                console.log(`\n💡 Next migration to apply: ${nextMigration.filename}\n`);
            } else {
                console.log('\n✅ All migrations have been applied.\n');
            }
        } catch (error) {
            // Si la tabla no existe, todos los patches están pendientes
            if (error instanceof Error && error.message.includes('does not exist')) {
                console.log('📋 All patches are pending (history table does not exist)\n');
                sqlFiles.forEach((filename) => {
                    console.log(`   ⏳ ${filename}`);
                });
                if (sqlFiles.length > 0) {
                    console.log(`\n💡 Next migration to apply: ${sqlFiles[0]}\n`);
                }
            } else {
                throw error;
            }
        } finally {
            if (connection) {
                await databaseAdapter.close({ connection });
            }
        }

        // Confirmar antes de ejecutar
        const confirmAnswer = await Enquirer.prompt<{ confirm: boolean }>({
            type: 'confirm',
            name: 'confirm',
            message: 'Do you want to proceed with the migration?',
            initial: true,
        });

        if (!confirmAnswer.confirm) {
            console.log('\n❌ Migration cancelled by user.\n');
            return;
        }

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
            // Mostrar el error completo incluyendo la causa si existe
            let errorMessage = `Error executing migration: ${error.message}`;
            if (error.cause instanceof Error) {
                errorMessage += `\n   Cause: ${error.cause.message}`;
                if (error.cause.stack && process.env.DEBUG) {
                    errorMessage += `\n   Stack: ${error.cause.stack}`;
                }
            }
            throw new Error(errorMessage, { cause: error });
        }
        throw error;
    }
}
