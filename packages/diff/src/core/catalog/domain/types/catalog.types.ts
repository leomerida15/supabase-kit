/**
 * Tipos para parámetros de recolección del catálogo.
 *
 * Define los tipos relacionados con los parámetros necesarios
 * para recopilar objetos del catálogo de PostgreSQL.
 *
 * @module core/catalog/domain/types/catalog
 */

import type { DatabaseConnection } from '../../../connection/domain/types/index.js';

/**
 * Parámetros base para recopilar objetos del catálogo.
 *
 * @interface BaseRetrieveParams
 */
export interface BaseRetrieveParams {
	/**
	 * Conexión a la base de datos.
	 */
	connection: DatabaseConnection;
}

/**
 * Parámetros para recopilar schemas.
 *
 * @interface RetrieveSchemasParams
 */
export interface RetrieveSchemasParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas a recopilar.
	 * Si está vacío o no se proporciona, se recopilan todos los schemas.
	 */
	schemas?: string[];
}

/**
 * Parámetros para recopilar tablas.
 *
 * @interface RetrieveTablesParams
 */
export interface RetrieveTablesParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar tablas.
	 */
	schemas: string[];
}

/**
 * Parámetros para recopilar vistas.
 *
 * @interface RetrieveViewsParams
 */
export interface RetrieveViewsParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar vistas.
	 */
	schemas: string[];
}

/**
 * Parámetros para recopilar vistas materializadas.
 *
 * @interface RetrieveMaterializedViewsParams
 */
export interface RetrieveMaterializedViewsParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar vistas materializadas.
	 */
	schemas: string[];
}

/**
 * Parámetros para recopilar funciones.
 *
 * @interface RetrieveFunctionsParams
 */
export interface RetrieveFunctionsParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar funciones.
	 */
	schemas: string[];
}

/**
 * Parámetros para recopilar funciones agregadas.
 *
 * @interface RetrieveAggregatesParams
 */
export interface RetrieveAggregatesParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar funciones agregadas.
	 */
	schemas: string[];
}

/**
 * Parámetros para recopilar secuencias.
 *
 * @interface RetrieveSequencesParams
 */
export interface RetrieveSequencesParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar secuencias.
	 */
	schemas: string[];
}

/**
 * Parámetros para recopilar extensiones.
 *
 * @interface RetrieveExtensionsParams
 */
export interface RetrieveExtensionsParams extends BaseRetrieveParams {
	// No requiere parámetros adicionales, todas las extensiones se recopilan
}

/**
 * Parámetros para recopilar tipos ENUM.
 *
 * @interface RetrieveEnumsParams
 */
export interface RetrieveEnumsParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar ENUMs.
	 */
	schemas: string[];
}

/**
 * Parámetros para recopilar tipos personalizados.
 *
 * @interface RetrieveTypesParams
 */
export interface RetrieveTypesParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar tipos personalizados.
	 */
	schemas: string[];
}

/**
 * Parámetros para recopilar claves foráneas.
 *
 * @interface RetrieveForeignKeysParams
 */
export interface RetrieveForeignKeysParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar claves foráneas.
	 */
	schemas: string[];
}

/**
 * Parámetros para recopilar políticas RLS.
 *
 * @interface RetrieveRLSPoliciesParams
 */
export interface RetrieveRLSPoliciesParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar políticas RLS.
	 */
	schemas: string[];
}

/**
 * Parámetros para recopilar estructuras de tablas.
 *
 * @interface RetrieveTableStructuresParams
 */
export interface RetrieveTableStructuresParams extends BaseRetrieveParams {
	/**
	 * Lista de nombres de schemas desde los cuales recopilar estructuras de tablas.
	 */
	schemas: string[];
}
