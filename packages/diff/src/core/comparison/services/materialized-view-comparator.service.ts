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
import {
	generateCreateMaterializedViewScript,
	generateDropMaterializedViewScript,
	normalizeViewDefinition,
} from './sql-generator/index.js';

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

		// Contar vistas materializadas que se van a crear
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

		// Agregar comentario de inicio si hay vistas materializadas para crear
		if (viewsToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- MATERIALIZED VIEWS: Start (${viewsToCreate.length} materialized view(s) to create)\n`);
			scripts.push('-- ============================================\n');
		}

		// Generar scripts CREATE para vistas materializadas que existen en source pero no en target
		for (const viewKey of viewsToCreate) {
			const sourceView = source[viewKey];
			if (sourceView) {
				scripts.push(
					generateCreateMaterializedViewScript(
						sourceView.schema,
						sourceView.name,
						sourceView.definition,
					),
				);
			}
		}

		// Agregar comentario de fin si se crearon vistas materializadas
		if (viewsToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push('-- MATERIALIZED VIEWS: End\n');
			scripts.push('-- ============================================\n');
		}

		// Comparar definiciones de vistas materializadas existentes
		const viewsToAlter: string[] = [];
		for (const viewKey in source) {
			const sourceView = source[viewKey];
			const targetView = target[viewKey];

			// Solo comparar si la vista materializada existe en ambas bases de datos
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

		// Agregar comentarios de bloque para vistas materializadas a alterar
		if (viewsToAlter.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(
				`-- MATERIALIZED VIEWS: Alter Start (${viewsToAlter.length} materialized view(s) to recreate)\n`,
			);
			scripts.push('-- ============================================\n');

			for (const viewKey of viewsToAlter) {
				const sourceView = source[viewKey];
				if (sourceView) {
					// Primero DROP, luego CREATE
					scripts.push(generateDropMaterializedViewScript(sourceView.schema, sourceView.name));
					scripts.push(
						generateCreateMaterializedViewScript(
							sourceView.schema,
							sourceView.name,
							sourceView.definition,
						),
					);
				}
			}

			scripts.push('-- ============================================\n');
			scripts.push('-- MATERIALIZED VIEWS: Alter End\n');
			scripts.push('-- ============================================\n');
		}

		// Generar scripts DROP para vistas materializadas que existen en target pero no en source (si está habilitado)
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
				scripts.push(`-- MATERIALIZED VIEWS: Drop Start (${viewsToDrop.length} materialized view(s) to drop)\n`);
				scripts.push('-- ============================================\n');

				for (const viewKey of viewsToDrop) {
					const targetView = target[viewKey];
					if (targetView) {
						scripts.push(generateDropMaterializedViewScript(targetView.schema, targetView.name));
				}
				}

				scripts.push('-- ============================================\n');
				scripts.push('-- MATERIALIZED VIEWS: Drop End\n');
				scripts.push('-- ============================================\n');
			}
		}

		return scripts;
	}
}
