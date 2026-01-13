/**
 * Servicio comparador para secuencias.
 *
 * Compara secuencias entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/sequence-comparator
 */

import { z } from 'zod';
import type { CompareSequencesParams } from '../domain/types/comparison.types.js';
import { CompareSequencesParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateSequenceScript } from './sql-generator/index.js';

/**
 * Servicio comparador de secuencias.
 *
 * @class SequenceComparatorService
 */
export class SequenceComparatorService {
	/**
	 * Compara secuencias entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear secuencias faltantes
	 */
	public compare(params: CompareSequencesParams): string[] {
		const validationResult = CompareSequencesParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target } = params;
		const scripts: string[] = [];

		for (const sequenceKey in source) {
			const sourceSequence = source[sequenceKey];
			const targetSequence = target[sequenceKey];

			if (!sourceSequence) {
				continue;
			}

			// Solo generar script si la secuencia no existe en target
			if (!targetSequence) {
				scripts.push(
					generateCreateSequenceScript(
						sourceSequence.schema,
						sourceSequence.name,
						sourceSequence.increment,
						sourceSequence.min,
						sourceSequence.max,
						sourceSequence.start,
						sourceSequence.cycle,
					),
				);
			}
		}

		return scripts;
	}
}
