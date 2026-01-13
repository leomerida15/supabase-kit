/**
 * Servicio comparador para claves foráneas.
 *
 * Compara claves foráneas entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/foreign-key-comparator
 */

import { z } from 'zod';
import type { CompareForeignKeysParams } from '../domain/types/comparison.types.js';
import { CompareForeignKeysParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateForeignKeyScript } from './sql-generator/index.js';

/**
 * Servicio comparador de claves foráneas.
 *
 * @class ForeignKeyComparatorService
 */
export class ForeignKeyComparatorService {
	/**
	 * Compara claves foráneas entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear claves foráneas faltantes
	 */
	public compare(params: CompareForeignKeysParams): string[] {
		const validationResult = CompareForeignKeysParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target, config } = params;
		const scripts: string[] = [];
		const { namespaces, crossSchemaForeignKeys } = config;

		for (const fkKey in source) {
			const sourceFK = source[fkKey];
			const targetFK = target[fkKey];

			// Validar que sourceFK existe
			if (!sourceFK) {
				continue;
			}

			// Solo generar script si la clave foránea no existe en target
			if (!targetFK) {
				// Validar cross-schema si está habilitado
				const isCrossSchema = sourceFK.schema !== sourceFK.referencedSchema;

				if (isCrossSchema && crossSchemaForeignKeys?.enabled) {
					if (crossSchemaForeignKeys.mode === 'strict') {
						// Modo estricto: ambos schemas deben estar en namespaces
						const localSchemaInConfig = namespaces.includes(sourceFK.schema);
						const referencedSchemaInConfig = namespaces.includes(sourceFK.referencedSchema);

						if (!localSchemaInConfig || !referencedSchemaInConfig) {
							// Omitir esta foreign key en modo strict
							continue;
						}
					}
					// Modo simple: incluir todas las foreign keys sin validación
					// (confía en el usuario)
				}

				scripts.push(
					generateCreateForeignKeyScript(
						sourceFK.schema,
						sourceFK.tableName,
						sourceFK.name,
						sourceFK.columns,
						sourceFK.referencedSchema,
						sourceFK.referencedTable,
						sourceFK.referencedColumns,
						sourceFK.onDelete,
						sourceFK.onUpdate,
					),
				);
			}
		}

		return scripts;
	}
}
