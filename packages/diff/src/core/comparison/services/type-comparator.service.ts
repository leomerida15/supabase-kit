/**
 * Servicio comparador para tipos personalizados.
 *
 * Compara tipos personalizados entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/type-comparator
 */

import { z } from 'zod';
import type { CompareTypesParams } from '../domain/types/comparison.types.js';
import { CompareTypesParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateTypeScript } from './sql-generator/index.js';

/**
 * Servicio comparador de tipos personalizados.
 *
 * @class TypeComparatorService
 */
export class TypeComparatorService {
	/**
	 * Compara tipos personalizados entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear tipos faltantes
	 */
	public compare(params: CompareTypesParams): string[] {
		const validationResult = CompareTypesParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target } = params;
		const scripts: string[] = [];

		for (const typeKey in source) {
			const sourceType = source[typeKey];
			const targetType = target[typeKey];

			if (!sourceType) {
				continue;
			}

			// Solo generar script si el tipo no existe en target
			if (!targetType) {
				scripts.push(generateCreateTypeScript(sourceType.schema, sourceType.name, sourceType.type));
			}
		}

		return scripts;
	}
}
