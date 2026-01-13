/**
 * Tipos para comparación de datos de tablas.
 *
 * Define los tipos relacionados con la comparación de datos/registros
 * entre tablas de bases de datos source y target.
 *
 * @module core/data/domain/types/data-comparison
 */

import type { Sequence } from '../../../catalog/domain/entities/index.js';
import type { DatabaseConnection } from '../../../connection/domain/types/index.js';
import type { DatabaseObjects } from '../../../catalog/domain/types/database-objects.types.js';
import type { TableDefinition } from '../../../../types/config.types.js';

/**
 * Registros de una tabla.
 *
 * @interface TableRecords
 */
export interface TableRecords {
	/**
	 * Nombres de los campos de la tabla.
	 */
	fields: string[];

	/**
	 * Filas de datos, cada fila es un objeto con campos como propiedades.
	 * Incluye un hash de fila para identificación única.
	 */
	rows: Array<Record<string, unknown> & { rowHash?: string }>;
}

/**
 * Datos completos de una tabla (source o target).
 *
 * @interface TableData
 */
export interface TableData {
	/**
	 * Registros de la tabla.
	 */
	records: TableRecords;

	/**
	 * Secuencias asociadas a la tabla.
	 */
	sequences: Sequence[];
}

/**
 * Resultado de comparación de datos de una tabla.
 *
 * @interface DataComparisonResult
 */
export interface DataComparisonResult {
	/**
	 * Scripts SQL generados como resultado de la comparación.
	 */
	sqlScript: string[];

	/**
	 * Indica si se necesita rebase de secuencias.
	 */
	isSequenceRebaseNeeded: boolean;
}

/**
 * Parámetros para recopilar registros de una tabla.
 *
 * @interface CollectTableRecordsParams
 */
export interface CollectTableRecordsParams {
	/**
	 * Conexión a la base de datos.
	 */
	connection: DatabaseConnection;

	/**
	 * Definición de la tabla a recopilar.
	 */
	tableDefinition: TableDefinition;

	/**
	 * Objetos de la base de datos (para validación).
	 */
	dbObjects: DatabaseObjects;

	/**
	 * Indica si la tabla es nueva (opcional).
	 */
	isNewTable?: boolean;
}

/**
 * Parámetros para recopilar secuencias de una tabla.
 *
 * @interface CollectTableSequencesParams
 */
export interface CollectTableSequencesParams {
	/**
	 * Conexión a la base de datos.
	 */
	connection: DatabaseConnection;

	/**
	 * Definición de la tabla.
	 */
	tableDefinition: TableDefinition;
}

/**
 * Parámetros para comparar datos de una tabla.
 *
 * @interface CompareTableDataParams
 */
export interface CompareTableDataParams {
	/**
	 * Definición de la tabla.
	 */
	tableDefinition: TableDefinition;

	/**
	 * Datos de la tabla source.
	 */
	sourceData: TableData;

	/**
	 * Datos de la tabla target.
	 */
	targetData: TableData;

	/**
	 * Columnas agregadas (opcional, para NIVEL 5+).
	 */
	addedColumns?: Record<string, unknown>;
}

/**
 * Parámetros para comparar todas las tablas configuradas.
 *
 * @interface CompareAllTablesDataParams
 */
export interface CompareAllTablesDataParams {
	/**
	 * Conexión a la base de datos source.
	 */
	sourceConnection: DatabaseConnection;

	/**
	 * Conexión a la base de datos target.
	 */
	targetConnection: DatabaseConnection;

	/**
	 * Objetos de la base de datos source.
	 */
	sourceObjects: DatabaseObjects;

	/**
	 * Objetos de la base de datos target.
	 */
	targetObjects: DatabaseObjects;

	/**
	 * Definiciones de tablas a comparar.
	 */
	tableDefinitions: TableDefinition[];

	/**
	 * Tablas agregadas (opcional, para NIVEL 5+).
	 */
	addedTables?: string[];

	/**
	 * Columnas agregadas (opcional, para NIVEL 5+).
	 */
	addedColumns?: Record<string, unknown>;
}
