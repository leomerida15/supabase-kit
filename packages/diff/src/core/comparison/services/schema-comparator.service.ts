/**
 * Servicio comparador para schemas.
 *
 * Compara schemas entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/schema-comparator
 */

import { z } from 'zod';
import type { CompareSchemasParams } from '../domain/types/comparison.types.js';
import { CompareSchemasParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateSchemaScript } from './sql-generator/index.js';

/**
 * Servicio comparador de schemas.
 *
 * @class SchemaComparatorService
 */
export class SchemaComparatorService {
	/**
	 * Compara schemas entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear schemas faltantes
	 */
	public compare(params: CompareSchemasParams): string[] {
		const validationResult = CompareSchemasParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target } = params;
		const scripts: string[] = [];

		// Contar schemas que se van a crear
		const schemasToCreate: string[] = [];
		for (const schemaName in source) {
			const sourceSchema = source[schemaName];
			const targetSchema = target[schemaName];

			if (!sourceSchema) {
				continue;
			}

			if (!targetSchema) {
				schemasToCreate.push(schemaName);
			}
		}

		// Agregar comentario de inicio si hay schemas para crear
		if (schemasToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- SCHEMAS: Start (${schemasToCreate.length} schema(s) to create)\n`);
			scripts.push('-- ============================================\n');
		}

		// Generar scripts CREATE para schemas que existen en source pero no en target
		for (const schemaName of schemasToCreate) {
			const sourceSchema = source[schemaName];
			if (sourceSchema) {
				scripts.push(generateCreateSchemaScript(sourceSchema.name, sourceSchema.owner || undefined));
			}
		}

		// Agregar comentario de fin si se crearon schemas
		if (schemasToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push('-- SCHEMAS: End\n');
			scripts.push('-- ============================================\n');
		}

		return scripts;
	}
}
