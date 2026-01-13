/**
 * Schemas de Zod para validación en el módulo de comparación de datos.
 *
 * Define los schemas de Zod para validar parámetros de comparación
 * de datos entre tablas.
 *
 * @module core/data/domain/schemas/data-comparison
 */

import { z } from 'zod';

/**
 * Schema para validar TableDefinition.
 * Se valida básicamente, detalles completos en config.types.ts
 */
const TableDefinitionSchema = z.object({
	tableSchema: z.string().optional(),
	tableName: z.string().min(1),
	tableKeyFields: z.array(z.string().min(1)).min(1),
});

/**
 * Schema base para validar parámetros con conexión.
 */
const BaseConnectionParamsSchema = z.object({
	connection: z.unknown(), // DatabaseConnection se valida en tiempo de ejecución
});

/**
 * Schema para validar CollectTableRecordsParams.
 */
export const CollectTableRecordsParamsSchema = BaseConnectionParamsSchema.extend({
	tableDefinition: TableDefinitionSchema,
	dbObjects: z.unknown(), // DatabaseObjects se valida en tiempo de ejecución
	isNewTable: z.boolean().optional(),
});

/**
 * Schema para validar CollectTableSequencesParams.
 */
export const CollectTableSequencesParamsSchema = BaseConnectionParamsSchema.extend({
	tableDefinition: TableDefinitionSchema,
});

/**
 * Schema para validar CompareTableDataParams.
 */
export const CompareTableDataParamsSchema = z.object({
	tableDefinition: TableDefinitionSchema,
	sourceData: z.unknown(), // TableData se valida en tiempo de ejecución
	targetData: z.unknown(), // TableData se valida en tiempo de ejecución
	addedColumns: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema para validar CompareAllTablesDataParams.
 */
export const CompareAllTablesDataParamsSchema = z.object({
	sourceConnection: z.unknown(), // DatabaseConnection se valida en tiempo de ejecución
	targetConnection: z.unknown(), // DatabaseConnection se valida en tiempo de ejecución
	sourceObjects: z.unknown(), // DatabaseObjects se valida en tiempo de ejecución
	targetObjects: z.unknown(), // DatabaseObjects se valida en tiempo de ejecución
	tableDefinitions: z.array(TableDefinitionSchema).min(1),
	addedTables: z.array(z.string()).optional(),
	addedColumns: z.record(z.string(), z.unknown()).optional(),
});
