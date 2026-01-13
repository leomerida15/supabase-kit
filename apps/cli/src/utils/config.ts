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
 * Estructura de una comparación.
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
     */
    compareOptions: Config['compareOptions'];

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
     * Diccionario de entornos (configuraciones de base de datos).
     */
    entornos: Record<string, EnvironmentConfig>;

    /**
     * Diccionario de comparaciones (entornos a comparar).
     */
    comparaciones: Record<string, ComparisonConfig>;
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
            entornos: {},
            comparaciones: {},
        };
    }

    const configJson = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(configJson) as ApplicationConfigFile;

    // Asegurar que la estructura sea correcta
    if (!parsed.entornos) {
        parsed.entornos = {};
    }
    if (!parsed.comparaciones) {
        parsed.comparaciones = {};
    }

    return parsed;
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

    configFile.entornos[environmentName] = {
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
    if (!configFile.entornos[comparisonConfig.sourceClient]) {
        throw new Error(`Entorno source "${comparisonConfig.sourceClient}" no existe`);
    }
    if (!configFile.entornos[comparisonConfig.targetClient]) {
        throw new Error(`Entorno target "${comparisonConfig.targetClient}" no existe`);
    }

    configFile.comparaciones[comparisonName] = comparisonConfig;

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

    const comparison = configFile.comparaciones[comparisonName];
    if (!comparison) {
        throw new Error(`Comparación "${comparisonName}" no encontrada en "${applicationName}"`);
    }

    const sourceEnv = configFile.entornos[comparison.sourceClient];
    const targetEnv = configFile.entornos[comparison.targetClient];

    if (!sourceEnv) {
        throw new Error(`Entorno source "${comparison.sourceClient}" no encontrado`);
    }
    if (!targetEnv) {
        throw new Error(`Entorno target "${comparison.targetClient}" no encontrado`);
    }

    return {
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
        compareOptions: comparison.compareOptions,
        migrationOptions: comparison.migrationOptions,
    };
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
    return Object.keys(configFile.entornos);
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
    return Object.keys(configFile.comparaciones);
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
    entornos: string[];
    comparaciones: string[];
} {
    const configFile = loadConfigFile({ applicationName });
    return {
        entornos: Object.keys(configFile.entornos),
        comparaciones: Object.keys(configFile.comparaciones),
    };
}
