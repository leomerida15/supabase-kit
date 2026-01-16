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
import {
	generateCreateViewScript,
	generateDropViewScript,
	normalizeViewDefinition,
} from './sql-generator/index.js';

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

		// Contar vistas que se van a crear
		const viewsToCreate: string[] = [];
		for (const viewKey in source) {
			const sourceView = source[viewKey];
			const targetView = target[viewKey];

			if (!sourceView) {
				continue;
			}

			if (!targetView) {
				viewsToCreate.push(viewKey);
			}
		}

		// Agregar comentario de inicio si hay vistas para crear
		if (viewsToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- VIEWS: Start (${viewsToCreate.length} view(s) to create)\n`);
			scripts.push('-- ============================================\n');
		}

		// Generar scripts CREATE para vistas que existen en source pero no en target
		for (const viewKey of viewsToCreate) {
			const sourceView = source[viewKey];
			if (sourceView) {
				scripts.push(
					generateCreateViewScript(sourceView.schema, sourceView.name, sourceView.definition),
				);
			}
		}

		// Agregar comentario de fin si se crearon vistas
		if (viewsToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push('-- VIEWS: End\n');
			scripts.push('-- ============================================\n');
		}

		// Comparar definiciones de vistas existentes
		const viewsToAlter: string[] = [];
		for (const viewKey in source) {
			const sourceView = source[viewKey];
			const targetView = target[viewKey];

			// Solo comparar si la vista existe en ambas bases de datos
			if (!sourceView || !targetView) {
				continue;
			}

			// Normalizar y comparar definiciones
			const normalizedSource = normalizeViewDefinition(sourceView.definition);
			const normalizedTarget = normalizeViewDefinition(targetView.definition);

			if (normalizedSource !== normalizedTarget) {
				viewsToAlter.push(viewKey);
			}
		}

		// Agregar comentarios de bloque para vistas a alterar
		if (viewsToAlter.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- VIEWS: Alter Start (${viewsToAlter.length} view(s) to replace)\n`);
			scripts.push('-- ============================================\n');

			for (const viewKey of viewsToAlter) {
				const sourceView = source[viewKey];
				if (sourceView) {
					// Usar CREATE OR REPLACE VIEW en lugar de DROP + CREATE
					scripts.push(
						generateCreateViewScript(
							sourceView.schema,
							sourceView.name,
							sourceView.definition,
							true, // useOrReplace = true
						),
					);
				}
			}

			scripts.push('-- ============================================\n');
			scripts.push('-- VIEWS: Alter End\n');
			scripts.push('-- ============================================\n');
		}

		// Generar scripts DROP para vistas que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingView) {
			const viewsToDrop: string[] = [];
			for (const viewKey in target) {
				const targetView = target[viewKey];
				const sourceView = source[viewKey];

				if (!targetView) {
					continue;
				}

				if (!sourceView) {
					viewsToDrop.push(viewKey);
				}
			}

			if (viewsToDrop.length > 0) {
				scripts.push('-- ============================================\n');
				scripts.push(`-- VIEWS: Drop Start (${viewsToDrop.length} view(s) to drop)\n`);
				scripts.push('-- ============================================\n');

				for (const viewKey of viewsToDrop) {
					const targetView = target[viewKey];
					if (targetView) {
						scripts.push(generateDropViewScript(targetView.schema, targetView.name));
				}
				}

				scripts.push('-- ============================================\n');
				scripts.push('-- VIEWS: Drop End\n');
				scripts.push('-- ============================================\n');
			}
		}

		return scripts;
	}
}
