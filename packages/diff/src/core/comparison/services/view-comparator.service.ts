/**
 * Servicio comparador para vistas.
 *
 * Compara vistas entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/view-comparator
 */

import { z } from 'zod';
import type { CompareViewsParams } from '../domain/types/comparison.types.js';
import { CompareViewsParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateViewScript, generateDropViewScript } from './sql-generator/index.js';

/**
 * Servicio comparador de vistas.
 *
 * @class ViewComparatorService
 */
export class ViewComparatorService {
	/**
	 * Compara vistas entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear vistas faltantes
	 */
	public compare(params: CompareViewsParams): string[] {
		const validationResult = CompareViewsParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target, config } = params;
		const scripts: string[] = [];

		// Generar scripts CREATE para vistas que existen en source pero no en target
		for (const viewKey in source) {
			const sourceView = source[viewKey];
			const targetView = target[viewKey];

			if (!sourceView) {
				continue;
			}

			if (!targetView) {
				scripts.push(
					generateCreateViewScript(sourceView.schema, sourceView.name, sourceView.definition),
				);
			}
		}

		// Generar scripts DROP para vistas que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingView) {
			for (const viewKey in target) {
				const targetView = target[viewKey];
				const sourceView = source[viewKey];

				if (!targetView) {
					continue;
				}

				if (!sourceView) {
					scripts.push(generateDropViewScript(targetView.schema, targetView.name));
				}
			}
		}

		return scripts;
	}
}
