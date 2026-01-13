/**
 * Servicio comparador para vistas materializadas.
 *
 * Compara vistas materializadas entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/materialized-view-comparator
 */

import { z } from 'zod';
import type { CompareMaterializedViewsParams } from '../domain/types/comparison.types.js';
import { CompareMaterializedViewsParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateMaterializedViewScript, generateDropMaterializedViewScript } from './sql-generator/index.js';

/**
 * Servicio comparador de vistas materializadas.
 *
 * @class MaterializedViewComparatorService
 */
export class MaterializedViewComparatorService {
	/**
	 * Compara vistas materializadas entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear vistas materializadas faltantes
	 */
	public compare(params: CompareMaterializedViewsParams): string[] {
		const validationResult = CompareMaterializedViewsParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target, config } = params;
		const scripts: string[] = [];

		// Generar scripts CREATE para vistas materializadas que existen en source pero no en target
		for (const viewKey in source) {
			const sourceView = source[viewKey];
			const targetView = target[viewKey];

			if (!sourceView) {
				continue;
			}

			if (!targetView) {
				scripts.push(
					generateCreateMaterializedViewScript(
						sourceView.schema,
						sourceView.name,
						sourceView.definition,
					),
				);
			}
		}

		// Generar scripts DROP para vistas materializadas que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingView) {
			for (const viewKey in target) {
				const targetView = target[viewKey];
				const sourceView = source[viewKey];

				if (!targetView) {
					continue;
				}

				if (!sourceView) {
					scripts.push(generateDropMaterializedViewScript(targetView.schema, targetView.name));
				}
			}
		}

		return scripts;
	}
}
