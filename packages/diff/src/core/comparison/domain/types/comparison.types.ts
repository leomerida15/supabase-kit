/**
 * Tipos para comparación de objetos de base de datos.
 *
 * Define los tipos relacionados con la comparación de objetos
 * entre bases de datos source y target.
 *
 * @module core/comparison/domain/types/comparison
 */

import type { DatabaseObjects } from '../../../catalog/domain/types/database-objects.types.js';
import type { SchemaCompare } from '../../../../types/config.types.js';
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
} from '../../../catalog/domain/entities/index.js';

/**
 * Resultado de comparación de objetos.
 *
 * @interface ObjectComparisonResult
 */
export interface ObjectComparisonResult {
	/**
	 * Scripts SQL generados como resultado de la comparación.
	 */
	sqlScripts: string[];

	/**
	 * Lista de diferencias encontradas (información adicional).
	 */
	differences: string[];
}

/**
 * Parámetros para comparar objetos de base de datos.
 *
 * @interface ComparisonParams
 */
export interface ComparisonParams {
	/**
	 * Objetos de la base de datos source.
	 */
	sourceObjects: DatabaseObjects;

	/**
	 * Objetos de la base de datos target.
	 */
	targetObjects: DatabaseObjects;

	/**
	 * Configuración de comparación de esquemas.
	 */
	config: SchemaCompare;
}

/**
 * Parámetros para comparar extensiones.
 *
 * @interface CompareExtensionsParams
 */
export interface CompareExtensionsParams {
	/**
	 * Extensiones de la base de datos source.
	 */
	source: Record<string, Extension>;

	/**
	 * Extensiones de la base de datos target.
	 */
	target: Record<string, Extension>;
}

/**
 * Parámetros para comparar schemas.
 *
 * @interface CompareSchemasParams
 */
export interface CompareSchemasParams {
	/**
	 * Schemas de la base de datos source.
	 */
	source: Record<string, Schema>;

	/**
	 * Schemas de la base de datos target.
	 */
	target: Record<string, Schema>;
}

/**
 * Parámetros para comparar ENUMs.
 *
 * @interface CompareEnumsParams
 */
export interface CompareEnumsParams {
	/**
	 * ENUMs de la base de datos source.
	 */
	source: Record<string, Enum>;

	/**
	 * ENUMs de la base de datos target.
	 */
	target: Record<string, Enum>;
}

/**
 * Parámetros para comparar tipos personalizados.
 *
 * @interface CompareTypesParams
 */
export interface CompareTypesParams {
	/**
	 * Tipos personalizados de la base de datos source.
	 */
	source: Record<string, CustomType>;

	/**
	 * Tipos personalizados de la base de datos target.
	 */
	target: Record<string, CustomType>;
}

/**
 * Parámetros para comparar secuencias.
 *
 * @interface CompareSequencesParams
 */
export interface CompareSequencesParams {
	/**
	 * Secuencias de la base de datos source.
	 */
	source: Record<string, Sequence>;

	/**
	 * Secuencias de la base de datos target.
	 */
	target: Record<string, Sequence>;
}

/**
 * Parámetros para comparar tablas.
 *
 * @interface CompareTablesParams
 */
export interface CompareTablesParams {
	/**
	 * Tablas de la base de datos source.
	 */
	source: Record<string, Table>;

	/**
	 * Tablas de la base de datos target.
	 */
	target: Record<string, Table>;

	/**
	 * Configuración de comparación (opcional, para scripts DROP).
	 */
	config?: Pick<SchemaCompare, 'dropMissingTable'>;
}

/**
 * Parámetros para comparar vistas.
 *
 * @interface CompareViewsParams
 */
export interface CompareViewsParams {
	/**
	 * Vistas de la base de datos source.
	 */
	source: Record<string, View>;

	/**
	 * Vistas de la base de datos target.
	 */
	target: Record<string, View>;

	/**
	 * Configuración de comparación (opcional, para scripts DROP).
	 */
	config?: Pick<SchemaCompare, 'dropMissingView'>;
}

/**
 * Parámetros para comparar vistas materializadas.
 *
 * @interface CompareMaterializedViewsParams
 */
export interface CompareMaterializedViewsParams {
	/**
	 * Vistas materializadas de la base de datos source.
	 */
	source: Record<string, MaterializedView>;

	/**
	 * Vistas materializadas de la base de datos target.
	 */
	target: Record<string, MaterializedView>;

	/**
	 * Configuración de comparación (opcional, para scripts DROP).
	 */
	config?: Pick<SchemaCompare, 'dropMissingView'>;
}

/**
 * Parámetros para comparar funciones.
 *
 * @interface CompareFunctionsParams
 */
export interface CompareFunctionsParams {
	/**
	 * Funciones de la base de datos source.
	 */
	source: Record<string, Function>;

	/**
	 * Funciones de la base de datos target.
	 */
	target: Record<string, Function>;

	/**
	 * Configuración de comparación (opcional, para scripts DROP).
	 */
	config?: Pick<SchemaCompare, 'dropMissingFunction'>;
}

/**
 * Parámetros para comparar agregados.
 *
 * @interface CompareAggregatesParams
 */
export interface CompareAggregatesParams {
	/**
	 * Agregados de la base de datos source.
	 */
	source: Record<string, Aggregate>;

	/**
	 * Agregados de la base de datos target.
	 */
	target: Record<string, Aggregate>;

	/**
	 * Configuración de comparación (opcional, para scripts DROP).
	 */
	config?: Pick<SchemaCompare, 'dropMissingAggregate'>;
}

/**
 * Parámetros para comparar claves foráneas.
 *
 * @interface CompareForeignKeysParams
 */
export interface CompareForeignKeysParams {
	/**
	 * Claves foráneas de la base de datos source.
	 */
	source: Record<string, ForeignKey>;

	/**
	 * Claves foráneas de la base de datos target.
	 */
	target: Record<string, ForeignKey>;

	/**
	 * Configuración de comparación de esquemas.
	 * Incluye namespaces y crossSchemaForeignKeys para validación.
	 */
	config: Pick<SchemaCompare, 'namespaces' | 'crossSchemaForeignKeys'>;
}

/**
 * Parámetros para comparar políticas RLS.
 *
 * @interface CompareRLSPoliciesParams
 */
export interface CompareRLSPoliciesParams {
	/**
	 * Políticas RLS de la base de datos source.
	 */
	source: Record<string, RLSPolicy>;

	/**
	 * Políticas RLS de la base de datos target.
	 */
	target: Record<string, RLSPolicy>;

	/**
	 * Configuración de comparación (opcional, para scripts DROP).
	 */
	config?: Pick<SchemaCompare, 'dropMissingRLSPolicy' | 'enableRLSPolicies'>;
}

/**
 * Parámetros para comparar triggers.
 *
 * @interface CompareTriggersParams
 */
export interface CompareTriggersParams {
	/**
	 * Tablas de la base de datos source (contienen los triggers).
	 */
	source: Record<string, Table>;

	/**
	 * Tablas de la base de datos target (contienen los triggers).
	 */
	target: Record<string, Table>;
}
