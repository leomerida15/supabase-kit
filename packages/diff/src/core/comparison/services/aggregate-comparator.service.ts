/**
 * Servicio comparador para agregados.
 *
 * Compara agregados entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/aggregate-comparator
 */

import { z } from 'zod';
import type { CompareAggregatesParams } from '../domain/types/comparison.types.js';
import { CompareAggregatesParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateAggregateScript, generateDropAggregateScript } from './sql-generator/index.js';

/**
 * Servicio comparador de agregados.
 *
 * @class AggregateComparatorService
 */
export class AggregateComparatorService {
	/**
	 * Compara agregados entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear agregados faltantes
	 */
	public compare(params: CompareAggregatesParams): string[] {
		const validationResult = CompareAggregatesParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target, config } = params;
		const scripts: string[] = [];

		// Contar agregados que se van a crear
		const aggregatesToCreate: string[] = [];
		for (const aggregateKey in source) {
			const sourceAggregate = source[aggregateKey];
			const targetAggregate = target[aggregateKey];

			if (!sourceAggregate) {
				continue;
			}

			if (!targetAggregate) {
				aggregatesToCreate.push(aggregateKey);
			}
		}

		// Agregar comentario de inicio si hay agregados para crear
		if (aggregatesToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- AGGREGATES: Start (${aggregatesToCreate.length} aggregate(s) to create)\n`);
			scripts.push('-- ============================================\n');
		}

		// Generar scripts CREATE para agregados que existen en source pero no en target
		for (const aggregateKey of aggregatesToCreate) {
			const sourceAggregate = source[aggregateKey];
			if (sourceAggregate) {
				scripts.push(
					generateCreateAggregateScript(
						sourceAggregate.schema,
						sourceAggregate.name,
						sourceAggregate.definition,
					),
				);
			}
		}

		// Agregar comentario de fin si se crearon agregados
		if (aggregatesToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push('-- AGGREGATES: End\n');
			scripts.push('-- ============================================\n');
		}

		// Generar scripts DROP para agregados que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingAggregate) {
			const aggregatesToDrop: string[] = [];
			for (const aggregateKey in target) {
				const targetAggregate = target[aggregateKey];
				const sourceAggregate = source[aggregateKey];

				if (!targetAggregate) {
					continue;
				}

				if (!sourceAggregate) {
					aggregatesToDrop.push(aggregateKey);
				}
			}

			if (aggregatesToDrop.length > 0) {
				scripts.push('-- ============================================\n');
				scripts.push(`-- AGGREGATES: Drop Start (${aggregatesToDrop.length} aggregate(s) to drop)\n`);
				scripts.push('-- ============================================\n');

				for (const aggregateKey of aggregatesToDrop) {
					const targetAggregate = target[aggregateKey];
					if (targetAggregate) {
					// Para agregados, necesitamos extraer los tipos de argumentos de la definición
					// Por ahora, generamos sin tipos (PostgreSQL puede manejarlo)
					scripts.push(generateDropAggregateScript(targetAggregate.schema, targetAggregate.name));
				}
				}

				scripts.push('-- ============================================\n');
				scripts.push('-- AGGREGATES: Drop End\n');
				scripts.push('-- ============================================\n');
			}
		}

		return scripts;
	}
}
