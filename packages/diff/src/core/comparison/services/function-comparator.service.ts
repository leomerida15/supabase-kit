/**
 * Servicio comparador para funciones.
 *
 * Compara funciones entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/function-comparator
 */

import { z } from 'zod';
import type { CompareFunctionsParams } from '../domain/types/comparison.types.js';
import { CompareFunctionsParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateFunctionScript, generateDropFunctionScript } from './sql-generator/index.js';

/**
 * Servicio comparador de funciones.
 *
 * @class FunctionComparatorService
 */
export class FunctionComparatorService {
	/**
	 * Compara funciones entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear funciones faltantes
	 */
	public compare(params: CompareFunctionsParams): string[] {
		const validationResult = CompareFunctionsParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target, config } = params;
		const scripts: string[] = [];

		// Generar scripts CREATE para funciones que existen en source pero no en target
		for (const functionKey in source) {
			const sourceFunction = source[functionKey];
			const targetFunction = target[functionKey];

			if (!sourceFunction) {
				continue;
			}

			if (!targetFunction) {
				scripts.push(
					generateCreateFunctionScript(
						sourceFunction.schema,
						sourceFunction.name,
						sourceFunction.definition,
					),
				);
			}
		}

		// Generar scripts DROP para funciones que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingFunction) {
			for (const functionKey in target) {
				const targetFunction = target[functionKey];
				const sourceFunction = source[functionKey];

				if (!targetFunction) {
					continue;
				}

				if (!sourceFunction) {
					// Extraer tipos de argumentos de los parámetros
					const argTypes = targetFunction.parameters.length > 0
						? targetFunction.parameters.join(', ')
						: undefined;
					scripts.push(generateDropFunctionScript(targetFunction.schema, targetFunction.name, argTypes));
				}
			}
		}

		return scripts;
	}
}
