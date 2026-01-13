/**
 * Puerto para operaciones de catálogo de base de datos.
 *
 * Define la interfaz abstracta para recopilar objetos del catálogo de PostgreSQL,
 * permitiendo desacoplar la lógica de negocio de la implementación concreta.
 *
 * @module core/catalog/ports/catalog
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
} from '../domain/entities/index.js';
import type { TableStructure } from '../domain/types/database-objects.types.js';
import type {
	RetrieveSchemasParams,
	RetrieveTablesParams,
	RetrieveViewsParams,
	RetrieveMaterializedViewsParams,
	RetrieveFunctionsParams,
	RetrieveAggregatesParams,
	RetrieveSequencesParams,
	RetrieveExtensionsParams,
	RetrieveEnumsParams,
	RetrieveTypesParams,
	RetrieveForeignKeysParams,
	RetrieveRLSPoliciesParams,
	RetrieveTableStructuresParams,
} from '../domain/types/catalog.types.js';

/**
 * Puerto abstracto para operaciones de catálogo de PostgreSQL.
 *
 * Define los métodos necesarios para recopilar diferentes tipos de objetos
 * del catálogo de PostgreSQL, permitiendo diferentes implementaciones.
 *
 * @interface CatalogPort
 */
export interface CatalogPort {
	/**
	 * Recopila todos los schemas disponibles.
	 *
	 * @param params - Parámetros para recopilar schemas
	 * @returns Promise que resuelve con un Record de schemas indexados por nombre
	 */
	retrieveAllSchemas(params: RetrieveSchemasParams): Promise<Record<string, Schema>>;

	/**
	 * Recopila todas las tablas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar tablas
	 * @returns Promise que resuelve con un Record de tablas indexadas por nombre completo (schema.name)
	 */
	retrieveTables(params: RetrieveTablesParams): Promise<Record<string, Table>>;

	/**
	 * Recopila todas las vistas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar vistas
	 * @returns Promise que resuelve con un Record de vistas indexadas por nombre completo (schema.name)
	 */
	retrieveViews(params: RetrieveViewsParams): Promise<Record<string, View>>;

	/**
	 * Recopila todas las vistas materializadas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar vistas materializadas
	 * @returns Promise que resuelve con un Record de vistas materializadas indexadas por nombre completo (schema.name)
	 */
	retrieveMaterializedViews(
		params: RetrieveMaterializedViewsParams,
	): Promise<Record<string, MaterializedView>>;

	/**
	 * Recopila todas las funciones de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar funciones
	 * @returns Promise que resuelve con un Record de funciones indexadas por nombre completo (schema.name)
	 */
	retrieveFunctions(params: RetrieveFunctionsParams): Promise<Record<string, Function>>;

	/**
	 * Recopila todas las funciones agregadas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar funciones agregadas
	 * @returns Promise que resuelve con un Record de funciones agregadas indexadas por nombre completo (schema.name)
	 */
	retrieveAggregates(params: RetrieveAggregatesParams): Promise<Record<string, Aggregate>>;

	/**
	 * Recopila todas las secuencias de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar secuencias
	 * @returns Promise que resuelve con un Record de secuencias indexadas por nombre completo (schema.name)
	 */
	retrieveSequences(params: RetrieveSequencesParams): Promise<Record<string, Sequence>>;

	/**
	 * Recopila todas las extensiones instaladas.
	 *
	 * @param params - Parámetros para recopilar extensiones
	 * @returns Promise que resuelve con un Record de extensiones indexadas por nombre
	 */
	retrieveExtensions(params: RetrieveExtensionsParams): Promise<Record<string, Extension>>;

	/**
	 * Recopila todos los tipos ENUM de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar ENUMs
	 * @returns Promise que resuelve con un Record de ENUMs indexados por nombre completo (schema.name)
	 */
	retrieveEnums(params: RetrieveEnumsParams): Promise<Record<string, Enum>>;

	/**
	 * Recopila todos los tipos personalizados de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar tipos personalizados
	 * @returns Promise que resuelve con un Record de tipos personalizados indexados por nombre completo (schema.name)
	 */
	retrieveTypes(params: RetrieveTypesParams): Promise<Record<string, CustomType>>;

	/**
	 * Recopila todas las claves foráneas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar claves foráneas
	 * @returns Promise que resuelve con un Record de claves foráneas indexadas por nombre completo (schema.tableName.name)
	 */
	retrieveForeignKeys(params: RetrieveForeignKeysParams): Promise<Record<string, ForeignKey>>;

	/**
	 * Recopila todas las políticas RLS de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar políticas RLS
	 * @returns Promise que resuelve con un Record de políticas RLS indexadas por nombre completo (schema.tableName.name)
	 */
	retrieveRLSPolicies(params: RetrieveRLSPoliciesParams): Promise<Record<string, RLSPolicy>>;

	/**
	 * Recopila las estructuras detalladas de las tablas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar estructuras de tablas
	 * @returns Promise que resuelve con un Record de estructuras de tablas indexadas por nombre completo (schema.tableName)
	 */
	retrieveTableStructures(
		params: RetrieveTableStructuresParams,
	): Promise<Record<string, TableStructure>>;
}
