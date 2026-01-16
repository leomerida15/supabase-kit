/**
 * Utilidades para gestionar configuraciones de entornos.
 *
 * @module cli/utils/config
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { Config } from '@pkg/diff';

/**
 * Configuración de un entorno (base de datos).
 */
export interface EnvironmentConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    ssl: boolean;
}

/**
 * Estructura de una comparación (como se guarda en JSON).
 * Usa "schemas" en lugar de "namespaces" para mayor claridad.
 */
export interface ComparisonConfig {
    /**
     * Nombre del entorno source (referencia a entornos).
     */
    sourceClient: string;

    /**
     * Nombre del entorno target (referencia a entornos).
     */
    targetClient: string;

    /**
     * Opciones de comparación.
     * En el JSON usamos "schemas" en lugar de "namespaces".
     */
    compareOptions: Omit<Config['compareOptions'], 'schemaCompare'> & {
        schemaCompare: Omit<Config['compareOptions']['schemaCompare'], 'namespaces'> & {
            schemas: string[];
        };
    };

    /**
     * Opciones de migración.
     */
    migrationOptions: Config['migrationOptions'];
}

/**
 * Estructura del archivo de configuración de una aplicación.
 */
export interface ApplicationConfigFile {
    /**
     * Dictionary of environments (database configurations).
     */
    environments: Record<string, EnvironmentConfig>;

    /**
     * Dictionary of comparisons (environments to compare).
     */
    comparisons: Record<string, ComparisonConfig>;
}

/**
 * Obtiene la ruta del directorio raíz del proyecto.
 *
 * @returns Ruta absoluta del directorio raíz
 */
function getProjectRoot(): string {
    return process.cwd();
}

/**
 * Obtiene el nombre del archivo de configuración basado en el nombre de la aplicación.
 *
 * @param params - Parámetros
 * @param params.applicationName - Nombre de la aplicación
 * @returns Nombre del archivo de configuración
 */
function getConfigFileName({ applicationName }: { applicationName: string }): string {
    return `${applicationName}.diffconfig.json`;
}

/**
 * Carga un archivo de configuración existente o retorna uno vacío.
 *
 * @param params - Parámetros
 * @param params.applicationName - Nombre de la aplicación
 * @returns Archivo de configuración
 */
export function loadConfigFile({
    applicationName,
}: {
    applicationName: string;
}): ApplicationConfigFile {
    const projectRoot = getProjectRoot();
    const configPath = join(projectRoot, getConfigFileName({ applicationName }));

    if (!existsSync(configPath)) {
        return {
            environments: {},
            comparisons: {},
        };
    }

    const configJson = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(configJson) as any;

    // Soporte para compatibilidad hacia atrás con nombres en español
    const environments = parsed.environments ?? parsed.entornos ?? {};
    const comparisons = parsed.comparisons ?? parsed.comparaciones ?? {};

    return {
        environments,
        comparisons,
    };
}

/**
 * Guarda un entorno (configuración de base de datos).
 *
 * @param params - Parámetros para guardar el entorno
 * @param params.applicationName - Nombre de la aplicación
 * @param params.environmentName - Nombre del entorno
 * @param params.environmentConfig - Configuración del entorno
 * @throws {Error} Si no se puede guardar la configuración
 */
export function saveEnvironment({
    applicationName,
    environmentName,
    environmentConfig,
}: {
    applicationName: string;
    environmentName: string;
    environmentConfig: EnvironmentConfig;
}): void {
    const projectRoot = getProjectRoot();
    const configPath = join(projectRoot, getConfigFileName({ applicationName }));

    const configFile = loadConfigFile({ applicationName });

    configFile.environments[environmentName] = {
        ...environmentConfig,
    };

    const configJson = JSON.stringify(configFile, null, 2);
    writeFileSync(configPath, configJson, 'utf-8');
}

/**
 * Guarda una comparación.
 *
 * @param params - Parámetros para guardar la comparación
 * @param params.applicationName - Nombre de la aplicación
 * @param params.comparisonName - Nombre de la comparación
 * @param params.comparisonConfig - Configuración de la comparación
 * @throws {Error} Si no se puede guardar la configuración
 */
export function saveComparison({
    applicationName,
    comparisonName,
    comparisonConfig,
}: {
    applicationName: string;
    comparisonName: string;
    comparisonConfig: ComparisonConfig;
}): void {
    const projectRoot = getProjectRoot();
    const configPath = join(projectRoot, getConfigFileName({ applicationName }));

    const configFile = loadConfigFile({ applicationName });

    // Validar que los entornos referenciados existan
    if (!configFile.environments[comparisonConfig.sourceClient]) {
        throw new Error(`Source environment "${comparisonConfig.sourceClient}" does not exist`);
    }
    if (!configFile.environments[comparisonConfig.targetClient]) {
        throw new Error(`Target environment "${comparisonConfig.targetClient}" does not exist`);
    }

    // Mapear "namespaces" del tipo Config a "schemas" para el JSON
    const schemaCompare = comparisonConfig.compareOptions.schemaCompare;
    const { namespaces, ...schemaCompareRest } = schemaCompare;
    const schemaCompareForJson = {
        ...schemaCompareRest,
        schemas: namespaces || [],
    };

    configFile.comparisons[comparisonName] = {
        ...comparisonConfig,
        compareOptions: {
            ...comparisonConfig.compareOptions,
            schemaCompare: schemaCompareForJson,
        },
    };

    const configJson = JSON.stringify(configFile, null, 2);
    writeFileSync(configPath, configJson, 'utf-8');
}

/**
 * Carga una comparación y resuelve las referencias a entornos.
 *
 * @param params - Parámetros para cargar la comparación
 * @param params.applicationName - Nombre de la aplicación
 * @param params.comparisonName - Nombre de la comparación
 * @returns Configuración completa con entornos resueltos
 * @throws {Error} Si no se puede cargar la configuración
 */
export function loadComparison({
    applicationName,
    comparisonName,
}: {
    applicationName: string;
    comparisonName: string;
}): Config {
    const configFile = loadConfigFile({ applicationName });

    const comparison = configFile.comparisons[comparisonName];
    if (!comparison) {
        throw new Error(`Comparison "${comparisonName}" not found in "${applicationName}"`);
    }

    const sourceEnv = configFile.environments[comparison.sourceClient];
    const targetEnv = configFile.environments[comparison.targetClient];

    if (!sourceEnv) {
        throw new Error(`Source environment "${comparison.sourceClient}" not found`);
    }
    if (!targetEnv) {
        throw new Error(`Target environment "${comparison.targetClient}" not found`);
    }

    // Mapear "schemas" del JSON a "namespaces" del tipo Config
    // También soportamos "namespaces" para compatibilidad hacia atrás
    const schemaCompare = comparison.compareOptions.schemaCompare as any;
    const schemas = schemaCompare.schemas ?? schemaCompare.namespaces ?? [];
    const { schemas: _, namespaces: __, ...schemaCompareRest } = schemaCompare;
    const schemaCompareMapped = {
        ...schemaCompareRest,
        namespaces: schemas || [],
    };

    const result = {
        sourceClient: {
            ...sourceEnv,
            password: null,
            applicationName: 'pg-diff-cli',
        },
        targetClient: {
            ...targetEnv,
            password: null,
            applicationName: 'pg-diff-cli',
        },
        compareOptions: {
            ...comparison.compareOptions,
            schemaCompare: schemaCompareMapped,
        },
        migrationOptions: comparison.migrationOptions,
    };

    return result;
}

/**
 * Lista todos los entornos de una aplicación.
 *
 * @param params - Parámetros
 * @param params.applicationName - Nombre de la aplicación
 * @returns Lista de nombres de entornos
 */
export function listEnvironments({ applicationName }: { applicationName: string }): string[] {
    const configFile = loadConfigFile({ applicationName });
    return Object.keys(configFile.environments);
}

/**
 * Lista todas las comparaciones de una aplicación.
 *
 * @param params - Parámetros
 * @param params.applicationName - Nombre de la aplicación
 * @returns Lista de nombres de comparaciones
 */
export function listComparisons({ applicationName }: { applicationName: string }): string[] {
    const configFile = loadConfigFile({ applicationName });
    return Object.keys(configFile.comparisons);
}

/**
 * Lista todas las aplicaciones disponibles.
 *
 * @returns Lista de nombres de aplicaciones
 */
export function listApplications(): string[] {
    const projectRoot = getProjectRoot();

    if (!existsSync(projectRoot)) {
        return [];
    }

    const files = readdirSync(projectRoot);
    return files
        .filter((file) => file.endsWith('.diffconfig.json'))
        .map((file) => file.replace('.diffconfig.json', ''));
}

/**
 * Obtiene información sobre una aplicación.
 *
 * @param params - Parámetros
 * @param params.applicationName - Nombre de la aplicación
 * @returns Información de la aplicación
 */
export function getApplicationInfo({ applicationName }: { applicationName: string }): {
    environments: string[];
    comparisons: string[];
} {
    const configFile = loadConfigFile({ applicationName });
    return {
        environments: Object.keys(configFile.environments),
        comparisons: Object.keys(configFile.comparisons),
    };
}
