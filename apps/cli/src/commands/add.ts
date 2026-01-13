/**
 * Comando para agregar entornos o comparaciones.
 *
 * @module cli/commands/add
 */

import Enquirer from 'enquirer';
import type { Config } from '@pkg/diff';
import {
    saveEnvironment,
    saveComparison,
    listEnvironments,
    listApplications,
    type EnvironmentConfig,
} from '../utils/config.js';

/**
 * Parámetros para crear un cliente de configuración.
 */
interface ClientConfigParams {
    label: string;
}

/**
 * Solicita la configuración de un cliente de base de datos.
 *
 * @param params - Parámetros para la configuración del cliente
 * @param params.label - Etiqueta descriptiva del cliente (ej: "Source", "Target")
 * @returns Configuración del cliente (sin password)
 */
async function promptClientConfig({ label }: ClientConfigParams): Promise<EnvironmentConfig> {
    const clientAnswers = await Enquirer.prompt<{
        host: string;
        port: string;
        database: string;
        user: string;
        ssl: boolean;
    }>([
        {
            type: 'input',
            name: 'host',
            message: `${label} - Host:`,
            initial: 'localhost',
            validate: (value: string) => {
                if (!value || value.trim() === '') {
                    return 'Host is required';
                }
                return true;
            },
        },
        {
            type: 'input',
            name: 'port',
            message: `${label} - Port:`,
            initial: '5432',
            validate: (value: string) => {
                const port = parseInt(value, 10);
                if (isNaN(port) || port <= 0 || port > 65535) {
                    return 'Port must be a number between 1 and 65535';
                }
                return true;
            },
        },
        {
            type: 'input',
            name: 'database',
            message: `${label} - Database:`,
            validate: (value: string) => {
                if (!value || value.trim() === '') {
                    return 'Database name is required';
                }
                return true;
            },
        },
        {
            type: 'input',
            name: 'user',
            message: `${label} - User:`,
            validate: (value: string) => {
                if (!value || value.trim() === '') {
                    return 'User is required';
                }
                return true;
            },
        },
        {
            type: 'confirm',
            name: 'ssl',
            message: `${label} - Use SSL?`,
            initial: false,
        },
    ]);

    return {
        host: clientAnswers.host.trim(),
        port: parseInt(clientAnswers.port, 10),
        database: clientAnswers.database.trim(),
        user: clientAnswers.user.trim(),
        ssl: clientAnswers.ssl,
    };
}

/**
 * Solicita la configuración de comparación de esquemas usando checklist.
 *
 * @returns Configuración de comparación de esquemas
 */
async function promptSchemaCompare(): Promise<Config['compareOptions']['schemaCompare']> {
    const namespacesAnswer = await Enquirer.prompt<{ namespaces: string }>({
        type: 'input',
        name: 'namespaces',
        message: 'Schemas to compare (comma-separated, empty for all):',
        initial: '',
    });

    const enabledFeaturesPrompt = {
        type: 'multiselect' as const,
        name: 'enabledFeatures',
        message: 'Select features to compare:',
        choices: [
            { name: 'enableExtensions', message: 'Extensions', value: 'enableExtensions' },
            { name: 'enableEnums', message: 'Enumerations (ENUMs)', value: 'enableEnums' },
            { name: 'enableTypes', message: 'Custom types', value: 'enableTypes' },
            { name: 'enableSequences', message: 'Sequences', value: 'enableSequences' },
            { name: 'enableTables', message: 'Tables', value: 'enableTables' },
            { name: 'enableViews', message: 'Views', value: 'enableViews' },
            {
                name: 'enableMaterializedViews',
                message: 'Materialized views',
                value: 'enableMaterializedViews',
            },
            { name: 'enableFunctions', message: 'Functions', value: 'enableFunctions' },
            { name: 'enableAggregates', message: 'Aggregates', value: 'enableAggregates' },
            {
                name: 'enableForeignKeys',
                message: 'Foreign keys',
                value: 'enableForeignKeys',
            },
            { name: 'enableRLSPolicies', message: 'RLS policies', value: 'enableRLSPolicies' },
            { name: 'enableTriggers', message: 'Triggers', value: 'enableTriggers' },
        ],
        initial: [
            'enableExtensions',
            'enableEnums',
            'enableTypes',
            'enableSequences',
            'enableTables',
            'enableViews',
            'enableMaterializedViews',
            'enableFunctions',
            'enableAggregates',
            'enableForeignKeys',
            'enableRLSPolicies',
            'enableTriggers',
        ],
    };

    const enabledFeaturesAnswer = await Enquirer.prompt<{ enabledFeatures: string[] }>(
        enabledFeaturesPrompt as Parameters<typeof Enquirer.prompt>[0],
    );

    const dropMissingPrompt = {
        type: 'multiselect' as const,
        name: 'dropMissing',
        message: 'Select which missing objects should generate DROP:',
        choices: [
            {
                name: 'dropMissingTable',
                message: 'Missing tables',
                value: 'dropMissingTable',
            },
            { name: 'dropMissingView', message: 'Missing views', value: 'dropMissingView' },
            {
                name: 'dropMissingFunction',
                message: 'Missing functions',
                value: 'dropMissingFunction',
            },
            {
                name: 'dropMissingAggregate',
                message: 'Missing aggregates',
                value: 'dropMissingAggregate',
            },
            {
                name: 'dropMissingRLSPolicy',
                message: 'Missing RLS policies',
                value: 'dropMissingRLSPolicy',
            },
        ],
        initial: [],
    };

    const dropMissingAnswer = await Enquirer.prompt<{ dropMissing: string[] }>(
        dropMissingPrompt as Parameters<typeof Enquirer.prompt>[0],
    );

    const rolesAnswer = await Enquirer.prompt<{ roles: string }>({
        type: 'input',
        name: 'roles',
        message: 'Roles to compare permissions (comma-separated, empty for none):',
        initial: '',
    });

    const crossSchemaAnswer = await Enquirer.prompt<{ crossSchemaForeignKeysEnabled: boolean }>({
        type: 'confirm',
        name: 'crossSchemaForeignKeysEnabled',
        message: 'Enable foreign keys between schemas?',
        initial: false,
    });

    const namespaces = namespacesAnswer.namespaces.trim()
        ? namespacesAnswer.namespaces
              .split(',')
              .map((n: string) => n.trim())
              .filter((n: string) => n !== '')
        : [];

    const roles = rolesAnswer.roles.trim()
        ? rolesAnswer.roles
              .split(',')
              .map((r) => r.trim())
              .filter((r) => r !== '')
        : [];

    const enabledFeatures = enabledFeaturesAnswer.enabledFeatures;
    const dropMissing = dropMissingAnswer.dropMissing;

    let crossSchemaForeignKeys: { enabled: boolean; mode: 'strict' | 'simple' } | undefined;

    if (crossSchemaAnswer.crossSchemaForeignKeysEnabled) {
        const modeAnswer = await Enquirer.prompt<{ mode: 'strict' | 'simple' }>({
            type: 'select',
            name: 'mode',
            message: 'Foreign keys between schemas mode:',
            choices: ['strict', 'simple'],
            initial: 1,
        });

        crossSchemaForeignKeys = {
            enabled: true,
            mode: modeAnswer.mode,
        };
    }

    return {
        namespaces,
        enableExtensions: enabledFeatures.includes('enableExtensions'),
        enableEnums: enabledFeatures.includes('enableEnums'),
        enableTypes: enabledFeatures.includes('enableTypes'),
        enableSequences: enabledFeatures.includes('enableSequences'),
        enableTables: enabledFeatures.includes('enableTables'),
        enableViews: enabledFeatures.includes('enableViews'),
        enableMaterializedViews: enabledFeatures.includes('enableMaterializedViews'),
        enableFunctions: enabledFeatures.includes('enableFunctions'),
        enableAggregates: enabledFeatures.includes('enableAggregates'),
        enableForeignKeys: enabledFeatures.includes('enableForeignKeys'),
        enableRLSPolicies: enabledFeatures.includes('enableRLSPolicies'),
        enableTriggers: enabledFeatures.includes('enableTriggers'),
        dropMissingTable: dropMissing.includes('dropMissingTable'),
        dropMissingView: dropMissing.includes('dropMissingView'),
        dropMissingFunction: dropMissing.includes('dropMissingFunction'),
        dropMissingAggregate: dropMissing.includes('dropMissingAggregate'),
        dropMissingRLSPolicy: dropMissing.includes('dropMissingRLSPolicy'),
        roles,
        crossSchemaForeignKeys,
    };
}

/**
 * Configuración por defecto para opciones de comparación.
 *
 * @returns Configuración de comparación de esquemas con valores por defecto
 */
function getDefaultSchemaCompare(): Config['compareOptions']['schemaCompare'] {
    return {
        namespaces: [],
        enableExtensions: true,
        enableEnums: true,
        enableTypes: true,
        enableSequences: true,
        enableTables: true,
        enableViews: true,
        enableMaterializedViews: true,
        enableFunctions: true,
        enableAggregates: true,
        enableForeignKeys: true,
        enableRLSPolicies: true,
        enableTriggers: true,
        dropMissingTable: false,
        dropMissingView: false,
        dropMissingFunction: false,
        dropMissingAggregate: false,
        dropMissingRLSPolicy: false,
        roles: [],
        crossSchemaForeignKeys: undefined,
    };
}

/**
 * Solicita la configuración de opciones de comparación.
 *
 * @returns Configuración de opciones de comparación
 */
async function promptCompareOptions(): Promise<Config['compareOptions']> {
    const modeAnswer = await Enquirer.prompt<{ mode: 'default' | 'custom' }>({
        type: 'select',
        name: 'mode',
        message: 'Comparison configuration mode:',
        choices: [
            { name: 'default', message: 'Default (recommended)' },
            { name: 'custom', message: 'Custom (checklist)' },
        ],
        initial: 0,
    });

    const compareAnswers = await Enquirer.prompt<{
        outputDirectory: string;
        author: string;
        getAuthorFromGit: boolean;
        enableDataCompare: boolean;
    }>([
        {
            type: 'input',
            name: 'outputDirectory',
            message: 'Output directory for patches:',
            initial: './patches',
            validate: (value: string) => {
                if (!value || value.trim() === '') {
                    return 'Output directory is required';
                }
                return true;
            },
        },
        {
            type: 'input',
            name: 'author',
            message: 'Author (empty to omit):',
            initial: '',
        },
        {
            type: 'confirm',
            name: 'getAuthorFromGit',
            message: 'Get author from Git?',
            initial: false,
        },
        {
            type: 'confirm',
            name: 'enableDataCompare',
            message: 'Enable data comparison?',
            initial: false,
        },
    ]);

    let schemaCompare: Config['compareOptions']['schemaCompare'];

    if (modeAnswer.mode === 'default') {
        schemaCompare = getDefaultSchemaCompare();
    } else {
        schemaCompare = await promptSchemaCompare();
    }

    return {
        outputDirectory: compareAnswers.outputDirectory.trim(),
        author: compareAnswers.author.trim() || null,
        getAuthorFromGit: compareAnswers.getAuthorFromGit,
        schemaCompare,
        dataCompare: {
            enable: compareAnswers.enableDataCompare,
            tables: [],
        },
    };
}

/**
 * Solicita la configuración de opciones de migración.
 *
 * @returns Configuración de opciones de migración
 */
async function promptMigrationOptions(): Promise<Config['migrationOptions']> {
    const migrationAnswers = await Enquirer.prompt<{
        patchesDirectory: string;
        historyTableName: string;
        historyTableSchema: string;
    }>([
        {
            type: 'input',
            name: 'patchesDirectory',
            message: 'Patches directory (empty to disable migrations):',
            initial: './patches',
        },
        {
            type: 'input',
            name: 'historyTableName',
            message: 'History table name:',
            initial: 'pg_diff_history',
            validate: (value: string) => {
                if (!value || value.trim() === '') {
                    return 'History table name is required';
                }
                return true;
            },
        },
        {
            type: 'input',
            name: 'historyTableSchema',
            message: 'History table schema:',
            initial: 'public',
            validate: (value: string) => {
                if (!value || value.trim() === '') {
                    return 'History table schema is required';
                }
                return true;
            },
        },
    ]);

    return {
        patchesDirectory: migrationAnswers.patchesDirectory.trim() || null,
        historyTableName: migrationAnswers.historyTableName.trim(),
        historyTableSchema: migrationAnswers.historyTableSchema.trim(),
    };
}

/**
 * Maneja el comando add para agregar entornos o comparaciones.
 *
 * @throws {Error} Si hay errores al crear la configuración
 */
export async function handleAddCommand(): Promise<void> {
    try {
        console.log('\n🚀 Initializing new configuration...\n');

        // Listar aplicaciones existentes
        const existingApplications = listApplications();
        const applicationChoices = [
            ...existingApplications.map((app) => ({ name: app, message: app })),
            { name: '__create_new__', message: '➕ Create new application' },
        ];

        const applicationAnswer = await Enquirer.prompt<{ applicationName: string }>({
            type: 'select',
            name: 'applicationName',
            message: 'Select an application:',
            choices: applicationChoices,
        });

        let applicationName: string;

        if (applicationAnswer.applicationName === '__create_new__') {
            // Solicitar nombre de la nueva aplicación
            const newAppAnswer = await Enquirer.prompt<{ applicationName: string }>({
                type: 'input',
                name: 'applicationName',
                message: 'New application name:',
                validate: (value: string) => {
                    if (!value || value.trim() === '') {
                        return 'Application name is required';
                    }
                    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                        return 'Application name can only contain letters, numbers, hyphens and underscores';
                    }
                    if (existingApplications.includes(value.trim())) {
                        return 'An application with that name already exists';
                    }
                    return true;
                },
            });
            applicationName = newAppAnswer.applicationName.trim();
        } else {
            applicationName = applicationAnswer.applicationName;
        }

        // Preguntar qué se quiere crear
        const actionAnswer = await Enquirer.prompt<{ action: 'environment' | 'comparison' }>({
            type: 'select',
            name: 'action',
            message: 'What do you want to create?',
            choices: [
                { name: 'environment', message: 'Environment (database configuration)' },
                { name: 'comparison', message: 'Comparison (environments to compare)' },
            ],
            initial: 0,
        });

        if (actionAnswer.action === 'environment') {
            // Crear entorno
            console.log('\n📋 Environment Configuration (Database):\n');
            const environmentConfig = await promptClientConfig({
                label: 'Environment',
            });

            const environmentNameAnswer = await Enquirer.prompt<{ environmentName: string }>({
                type: 'input',
                name: 'environmentName',
                message: 'Environment name:',
                validate: (value: string) => {
                    if (!value || value.trim() === '') {
                        return 'Environment name is required';
                    }
                    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                        return 'Environment name can only contain letters, numbers, hyphens and underscores';
                    }
                    return true;
                },
            });

            const environmentName = environmentNameAnswer.environmentName.trim();

            saveEnvironment({
                applicationName,
                environmentName,
                environmentConfig,
            });

            console.log(
                `\n✅ Environment "${environmentName}" saved successfully in application "${applicationName}"\n`,
            );
        } else {
            // Crear comparación
            const availableEnvironments = listEnvironments({ applicationName });

            if (availableEnvironments.length < 2) {
                console.log('\n❌ At least 2 environments are required to create a comparison.\n');
                console.log('💡 Create environments first using the "add" command.\n');
                return;
            }

            console.log('\n📋 Comparison Configuration:\n');

            const sourceEnvAnswer = await Enquirer.prompt<{ sourceEnvironment: string }>({
                type: 'select',
                name: 'sourceEnvironment',
                message: 'Source environment (origin):',
                choices: availableEnvironments,
            });

            const targetEnvAnswer = await Enquirer.prompt<{ targetEnvironment: string }>({
                type: 'select',
                name: 'targetEnvironment',
                message: 'Target environment (destination):',
                choices: availableEnvironments.filter(
                    (env) => env !== sourceEnvAnswer.sourceEnvironment,
                ),
            });

            console.log('\n📋 Comparison Options:\n');
            const compareOptions = await promptCompareOptions();

            console.log('\n📋 Migration Options:\n');
            const migrationOptions = await promptMigrationOptions();

            const comparisonNameAnswer = await Enquirer.prompt<{ comparisonName: string }>({
                type: 'input',
                name: 'comparisonName',
                message: 'Comparison name:',
                validate: (value: string) => {
                    if (!value || value.trim() === '') {
                        return 'Comparison name is required';
                    }
                    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                        return 'Comparison name can only contain letters, numbers, hyphens and underscores';
                    }
                    return true;
                },
            });

            const comparisonName = comparisonNameAnswer.comparisonName.trim();

            saveComparison({
                applicationName,
                comparisonName,
                comparisonConfig: {
                    sourceClient: sourceEnvAnswer.sourceEnvironment,
                    targetClient: targetEnvAnswer.targetEnvironment,
                    compareOptions,
                    migrationOptions,
                },
            });

            console.log(
                `\n✅ Comparison "${comparisonName}" saved successfully in application "${applicationName}"\n`,
            );
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error initializing configuration: ${error.message}`, {
                cause: error,
            });
        }
        throw error;
    }
}
