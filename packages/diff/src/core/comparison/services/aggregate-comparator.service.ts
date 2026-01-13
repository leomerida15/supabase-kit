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

		// Generar scripts CREATE para agregados que existen en source pero no en target
		for (const aggregateKey in source) {
			const sourceAggregate = source[aggregateKey];
			const targetAggregate = target[aggregateKey];

			if (!sourceAggregate) {
				continue;
			}

			if (!targetAggregate) {
				scripts.push(
					generateCreateAggregateScript(
						sourceAggregate.schema,
						sourceAggregate.name,
						sourceAggregate.definition,
					),
				);
			}
		}

		// Generar scripts DROP para agregados que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingAggregate) {
			for (const aggregateKey in target) {
				const targetAggregate = target[aggregateKey];
				const sourceAggregate = source[aggregateKey];

				if (!targetAggregate) {
					continue;
				}

				if (!sourceAggregate) {
					// Para agregados, necesitamos extraer los tipos de argumentos de la definición
					// Por ahora, generamos sin tipos (PostgreSQL puede manejarlo)
					scripts.push(generateDropAggregateScript(targetAggregate.schema, targetAggregate.name));
				}
			}
		}

		return scripts;
	}
}
