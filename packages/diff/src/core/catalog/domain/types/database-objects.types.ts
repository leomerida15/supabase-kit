/**
 * Tipos para objetos de base de datos.
 *
 * Define los tipos relacionados con la estructura de objetos de base de datos
 * y sus relaciones.
 *
 * @module core/catalog/domain/types/database-objects
 */

import type {
	Schema,
	Table,
	View,
	MaterializedView,
	Function,
	Aggregate,
	Sequence,
	Extension,
	Enum,
	CustomType,
	ForeignKey,
	RLSPolicy,
} from '../entities/index.js';

/**
 * Estructura de una columna de tabla.
 *
 * @interface TableColumnStructure
 */
export interface TableColumnStructure {
	/**
	 * Tipo de dato de la columna.
	 */
	dataType: string;

	/**
	 * Longitud máxima de la columna (si aplica).
	 */
	maxLength: number | null;

	/**
	 * Indica si la columna permite valores NULL.
	 */
	isNullable: boolean;

	/**
	 * Valor por defecto de la columna.
	 */
	defaultValue: string | null;

	/**
	 * Valor por defecto original de la columna (expresión SQL sin procesar).
	 */
	originalDefault: string | null;

	/**
	 * Posición ordinal de la columna en la tabla.
	 */
	ordinalPosition: number;

	/**
	 * Indica si la columna es parte de la clave primaria.
	 */
	isPrimaryKey: boolean;
}

/**
 * Estructura completa de una tabla.
 *
 * @interface TableStructure
 */
export interface TableStructure {
	/**
	 * Nombre del schema donde se encuentra la tabla.
	 */
	schema: string;

	/**
	 * Nombre de la tabla.
	 */
	tableName: string;

	/**
	 * Columnas de la tabla, indexadas por nombre de columna.
	 */
	columns: Record<string, TableColumnStructure>;
}

/**
 * Estructura que contiene todos los objetos de una base de datos.
 *
 * Cada propiedad es un Record indexado por nombre completo del objeto
 * (schema.name) o null si no hay objetos de ese tipo.
 *
 * @interface DatabaseObjects
 */
export interface DatabaseObjects {
	/**
	 * Schemas de la base de datos.
	 */
	schemas: Record<string, Schema> | null;

	/**
	 * Tablas de la base de datos.
	 */
	tables: Record<string, Table> | null;

	/**
	 * Vistas de la base de datos.
	 */
	views: Record<string, View> | null;

	/**
	 * Vistas materializadas de la base de datos.
	 */
	materializedViews: Record<string, MaterializedView> | null;

	/**
	 * Funciones de la base de datos.
	 */
	functions: Record<string, Function> | null;

	/**
	 * Funciones agregadas de la base de datos.
	 */
	aggregates: Record<string, Aggregate> | null;

	/**
	 * Secuencias de la base de datos.
	 */
	sequences: Record<string, Sequence> | null;

	/**
	 * Extensiones de la base de datos.
	 */
	extensions: Record<string, Extension> | null;

	/**
	 * Tipos ENUM de la base de datos.
	 */
	enums: Record<string, Enum> | null;

	/**
	 * Tipos personalizados de la base de datos.
	 */
	types: Record<string, CustomType> | null;

	/**
	 * Claves foráneas de la base de datos.
	 */
	foreignKeys: Record<string, ForeignKey> | null;

	/**
	 * Políticas RLS de la base de datos.
	 */
	rlsPolicies: Record<string, RLSPolicy> | null;

	/**
	 * Estructuras de tablas (metadatos detallados de columnas).
	 */
	tableStructures: Record<string, TableStructure> | null;
}
