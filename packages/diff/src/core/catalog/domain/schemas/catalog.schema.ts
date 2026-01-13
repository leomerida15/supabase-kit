/**
 * Schemas de Zod para validación en el módulo de catálogo.
 *
 * Define los schemas de Zod para validar parámetros de recopilación
 * del catálogo de PostgreSQL.
 *
 * @module core/catalog/domain/schemas/catalog
 */

import { z } from 'zod';

/**
 * Schema base para validar parámetros de recopilación.
 */
const BaseRetrieveParamsSchema = z.object({
	connection: z.unknown(), // DatabaseConnection se valida en tiempo de ejecución
});

/**
 * Schema para validar RetrieveSchemasParams.
 */
export const RetrieveSchemasParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1)).optional(),
});

/**
 * Schema para validar RetrieveTablesParams.
 */
export const RetrieveTablesParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});

/**
 * Schema para validar RetrieveViewsParams.
 */
export const RetrieveViewsParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});

/**
 * Schema para validar RetrieveMaterializedViewsParams.
 */
export const RetrieveMaterializedViewsParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});

/**
 * Schema para validar RetrieveFunctionsParams.
 */
export const RetrieveFunctionsParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});

/**
 * Schema para validar RetrieveAggregatesParams.
 */
export const RetrieveAggregatesParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});

/**
 * Schema para validar RetrieveSequencesParams.
 */
export const RetrieveSequencesParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});

/**
 * Schema para validar RetrieveExtensionsParams.
 */
export const RetrieveExtensionsParamsSchema = BaseRetrieveParamsSchema;

/**
 * Schema para validar RetrieveEnumsParams.
 */
export const RetrieveEnumsParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});

/**
 * Schema para validar RetrieveTypesParams.
 */
export const RetrieveTypesParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});

/**
 * Schema para validar RetrieveForeignKeysParams.
 */
export const RetrieveForeignKeysParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});

/**
 * Schema para validar RetrieveRLSPoliciesParams.
 */
export const RetrieveRLSPoliciesParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});

/**
 * Schema para validar RetrieveTableStructuresParams.
 */
export const RetrieveTableStructuresParamsSchema = BaseRetrieveParamsSchema.extend({
	schemas: z.array(z.string().min(1), {
		message: 'Schemas array cannot be empty',
	}),
});
