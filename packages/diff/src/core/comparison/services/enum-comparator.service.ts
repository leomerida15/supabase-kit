/**
 * Servicio comparador para ENUMs.
 *
 * Compara ENUMs entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/enum-comparator
 */

import { z } from 'zod';
import type { CompareEnumsParams } from '../domain/types/comparison.types.js';
import { CompareEnumsParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateEnumScript } from './sql-generator/index.js';

/**
 * Servicio comparador de ENUMs.
 *
 * @class EnumComparatorService
 */
export class EnumComparatorService {
	/**
	 * Compara ENUMs entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear ENUMs faltantes
	 */
	public compare(params: CompareEnumsParams): string[] {
		const validationResult = CompareEnumsParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target } = params;
		const scripts: string[] = [];

		for (const enumKey in source) {
			const sourceEnum = source[enumKey];
			const targetEnum = target[enumKey];

			if (!sourceEnum) {
				continue;
			}

			// Solo generar script si el ENUM no existe en target
			if (!targetEnum) {
				scripts.push(
					generateCreateEnumScript(sourceEnum.schema, sourceEnum.name, sourceEnum.values),
				);
			}
		}

		return scripts;
	}
}
