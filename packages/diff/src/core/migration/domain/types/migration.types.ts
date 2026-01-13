/**
 * Tipos para el módulo de migración.
 *
 * Define los tipos relacionados con la gestión de migraciones
 * y patches SQL.
 *
 * @module core/migration/domain/types/migration
 */

import type { DatabaseConnection } from '../../../connection/domain/types/connection.types.js';

/**
 * Estados posibles de un patch en el historial de migraciones.
 */
export enum PatchStatus {
	TO_APPLY = 'TO_APPLY',
	IN_PROGRESS = 'IN_PROGRESS',
	DONE = 'DONE',
	ERROR = 'ERROR',
}

/**
 * Información de un archivo patch.
 *
 * @interface PatchInfo
 */
export interface PatchInfo {
	/**
	 * Nombre completo del archivo (con extensión).
	 */
	filename: string;

	/**
	 * Ruta completa del archivo.
	 */
	filepath: string;

	/**
	 * Versión del patch (timestamp del nombre del archivo).
	 */
	version: string;

	/**
	 * Nombre del patch (sin timestamp ni extensión).
	 */
	name: string;

	/**
	 * Estado actual del patch.
	 */
	status?: PatchStatus;
}

/**
 * Configuración de migración preparada.
 *
 * @interface MigrationConfig
 */
export interface MigrationConfig {
	/**
	 * Directorio donde se encuentran los archivos patch.
	 */
	patchesDirectory: string;

	/**
	 * Configuración de la tabla de historial.
	 */
	migrationHistory: {
		tableName: string;
		tableSchema: string;
		fullTableName: string;
		primaryKeyName: string;
		tableOwner: string;
	};
}

/**
 * Parámetros para preparar la tabla de historial.
 *
 * @interface PrepareHistoryTableParams
 */
export interface PrepareHistoryTableParams {
	/**
	 * Conexión a la base de datos.
	 */
	connection: DatabaseConnection;

	/**
	 * Configuración de migración.
	 */
	config: MigrationConfig;
}

/**
 * Parámetros para verificar el estado de un patch.
 *
 * @interface CheckPatchStatusParams
 */
export interface CheckPatchStatusParams {
	/**
	 * Conexión a la base de datos.
	 */
	connection: DatabaseConnection;

	/**
	 * Información del patch.
	 */
	patchInfo: PatchInfo;

	/**
	 * Configuración de migración.
	 */
	config: MigrationConfig;
}

/**
 * Resultado de verificación de estado de patch.
 *
 * @interface PatchStatusResult
 */
export interface PatchStatusResult {
	/**
	 * Estado del patch.
	 */
	status: PatchStatus;

	/**
	 * Mensaje de error si el estado es ERROR.
	 */
	errorMessage?: string;
}
