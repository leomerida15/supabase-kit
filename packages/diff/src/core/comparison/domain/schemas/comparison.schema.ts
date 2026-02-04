/**
 * Schemas de Zod para validación en el módulo de comparación.
 *
 * Define los schemas de Zod para validar parámetros de comparación
 * de objetos de base de datos.
 *
 * @module core/comparison/domain/schemas/comparison
 */

import { z } from 'zod';

/**
 * Schema base para validar parámetros de comparación de objetos.
 */
const BaseCompareParamsSchema = z.object({
	source: z.record(z.string(), z.unknown()),
	target: z.record(z.string(), z.unknown()),
});

/**
 * Schema para validar CompareExtensionsParams.
 */
export const CompareExtensionsParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareSchemasParams.
 */
export const CompareSchemasParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareEnumsParams.
 */
export const CompareEnumsParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareTypesParams.
 */
export const CompareTypesParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareSequencesParams.
 */
export const CompareSequencesParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareTablesParams.
 */
export const CompareTablesParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareViewsParams.
 */
export const CompareViewsParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareMaterializedViewsParams.
 */
export const CompareMaterializedViewsParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareFunctionsParams.
 */
export const CompareFunctionsParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareAggregatesParams.
 */
export const CompareAggregatesParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareForeignKeysParams.
 */
export const CompareForeignKeysParamsSchema = BaseCompareParamsSchema.extend({
	config: z.object({
		namespaces: z.array(z.string()),
		crossSchemaForeignKeys: z
			.object({
				enabled: z.boolean(),
				mode: z.enum(['strict', 'simple']),
			})
			.optional(),
	}),
	tableKeysToCreate: z.array(z.string()).optional(),
});

/**
 * Schema para validar CompareRLSPoliciesParams.
 */
export const CompareRLSPoliciesParamsSchema = BaseCompareParamsSchema;

/**
 * Schema para validar CompareTriggersParams.
 */
export const CompareTriggersParamsSchema = BaseCompareParamsSchema;
