/**
 * Schemas Zod para validación de tipos de configuración.
 *
 * Define schemas de Zod para validar todos los tipos de configuración
 * del sistema de comparación y migración de PostgreSQL.
 *
 * @module types/config.schema
 */

import { z } from 'zod';
import { existsSync } from 'fs';
import { dirname } from 'path';

/**
 * Schema para validar rutas de directorios.
 * Verifica que el directorio existe o que el directorio padre existe
 * (para permitir crear el directorio si no existe).
 */
const DirectoryPathSchema = z
	.string()
	.min(1, 'Directory path cannot be empty')
	.refine(
		(path) => {
			try {
				if (existsSync(path)) {
					return true;
				}
				// Si no existe, validar que el directorio padre existe
				const parentDir = dirname(path);
				return existsSync(parentDir);
			} catch {
				return false;
			}
		},
		{ message: 'Directory path is invalid or cannot be created' },
	);

/**
 * Schema para validar TableDefinition.
 */
export const TableDefinitionSchema = z.object({
	tableName: z.string().min(1, 'Table name cannot be empty'),
	tableSchema: z.string().min(1, 'Table schema cannot be empty'),
	tableKeyFields: z
		.array(z.string().min(1, 'Key field cannot be empty'))
		.min(1, 'At least one key field is required'),
});

/**
 * Schema para validar DataCompare.
 */
export const DataCompareSchema = z.object({
	enable: z.boolean({
		message: 'Data compare enable must be a boolean',
	}),
	tables: z.array(TableDefinitionSchema),
});

/**
 * Schema para validar SchemaCompare.
 */
export const SchemaCompareSchema = z.object({
	namespaces: z
		.array(z.string().min(1, 'Namespace cannot be empty'))
		.min(0, 'Namespaces must be an array'),
	enableExtensions: z.boolean().optional(),
	enableEnums: z.boolean().optional(),
	enableTypes: z.boolean().optional(),
	enableSequences: z.boolean().optional(),
	enableTables: z.boolean().optional(),
	enableViews: z.boolean().optional(),
	enableMaterializedViews: z.boolean().optional(),
	enableFunctions: z.boolean().optional(),
	enableAggregates: z.boolean().optional(),
	enableForeignKeys: z.boolean().optional(),
	enableRLSPolicies: z.boolean().optional(),
	enableTriggers: z.boolean().optional(),
	dropMissingTable: z.boolean({
		message: 'dropMissingTable must be a boolean',
	}),
	dropMissingView: z.boolean({
		message: 'dropMissingView must be a boolean',
	}),
	dropMissingFunction: z.boolean({
		message: 'dropMissingFunction must be a boolean',
	}),
	dropMissingAggregate: z.boolean({
		message: 'dropMissingAggregate must be a boolean',
	}),
	dropMissingRLSPolicy: z.boolean().optional(),
	roles: z.array(z.string().min(1, 'Role name cannot be empty')),
	crossSchemaForeignKeys: z
		.object({
			enabled: z.boolean({
				message: 'crossSchemaForeignKeys.enabled must be a boolean',
			}),
			mode: z.enum(['strict', 'simple'], {
				message: 'crossSchemaForeignKeys.mode must be "strict" or "simple"',
			}),
		})
		.optional(),
});

/**
 * Schema para validar CompareOptions.
 */
export const CompareOptionsSchema = z.object({
	outputDirectory: DirectoryPathSchema,
	author: z.string().nullable(),
	getAuthorFromGit: z.boolean({
		message: 'getAuthorFromGit must be a boolean',
	}),
	schemaCompare: SchemaCompareSchema,
	dataCompare: DataCompareSchema,
});

/**
 * Schema para validar MigrationOptions.
 */
export const MigrationOptionsSchema = z.object({
	patchesDirectory: z.string().nullable(),
	historyTableName: z.string().min(1, 'History table name cannot be empty'),
	historyTableSchema: z.string().min(1, 'History table schema cannot be empty'),
});

/**
 * Schema para validar ClientConfig.
 */
export const ClientConfigSchema = z.object({
	host: z.string().min(1, 'Host cannot be empty').trim(),
	port: z
		.number({
			message: 'Port must be a number',
		})
		.int('Port must be an integer')
		.min(1, 'Port must be between 1 and 65535')
		.max(65535, 'Port must be between 1 and 65535'),
	database: z
		.string()
		.nullable()
		.refine(
			(val) => val !== null && val.length > 0,
			{
				message: 'Database cannot be null or empty when creating a connection',
			},
		),
	user: z.string().min(1, 'User cannot be empty').trim(),
	password: z.string().nullable(),
	applicationName: z.string().min(1, 'Application name cannot be empty').trim(),
	ssl: z.boolean({
		message: 'SSL must be a boolean',
	}),
});

/**
 * Schema para validar Config completo.
 */
export const ConfigSchema = z.object({
	targetClient: ClientConfigSchema,
	sourceClient: ClientConfigSchema,
	compareOptions: CompareOptionsSchema,
	migrationOptions: MigrationOptionsSchema,
});

/**
 * Tipos inferidos de los schemas.
 */
export type TableDefinitionInput = z.infer<typeof TableDefinitionSchema>;
export type DataCompareInput = z.infer<typeof DataCompareSchema>;
export type SchemaCompareInput = z.infer<typeof SchemaCompareSchema>;
export type CompareOptionsInput = z.infer<typeof CompareOptionsSchema>;
export type MigrationOptionsInput = z.infer<typeof MigrationOptionsSchema>;
export type ClientConfigInput = z.infer<typeof ClientConfigSchema>;
export type ConfigInput = z.infer<typeof ConfigSchema>;
