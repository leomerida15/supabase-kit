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
	 * Verifica si un lenguaje de función requiere permisos de superusuario.
	 *
	 * @param language - Nombre del lenguaje de la función
	 * @returns true si el lenguaje requiere permisos de superusuario
	 */
	private isSuperuserLanguage(language: string): boolean {
		return language === 'c' || language === 'internal';
	}

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

		// Verificar si debemos excluir funciones de superusuario
		const excludeSuperuser = config?.excludeSuperuserFunctions !== false; // Por defecto true

		// Contar funciones que se van a crear
		const functionsToCreate: string[] = [];
		const excludedFunctions: string[] = [];
		for (const functionKey in source) {
			const sourceFunction = source[functionKey];
			const targetFunction = target[functionKey];

			if (!sourceFunction) {
				continue;
			}

			// Filtrar funciones de superusuario si está habilitado
			if (excludeSuperuser && this.isSuperuserLanguage(sourceFunction.language)) {
				excludedFunctions.push(functionKey);
				continue;
			}

			if (!targetFunction) {
				functionsToCreate.push(functionKey);
			}
		}

		// Agregar comentario si se excluyeron funciones de superusuario
		if (excludedFunctions.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- NOTE: ${excludedFunctions.length} function(s) with superuser languages (c, internal) were excluded\n`);
			scripts.push('-- These functions require superuser permissions and cannot be created by regular users\n');
			scripts.push('-- ============================================\n');
		}

		// Agregar comentario de inicio si hay funciones para crear
		if (functionsToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- FUNCTIONS: Start (${functionsToCreate.length} function(s) to create)\n`);
			scripts.push('-- ============================================\n');
		}

		// Generar scripts CREATE para funciones que existen en source pero no en target
		const useManualCheck = config?.useManualFunctionCheck !== false; // Por defecto true
		for (const functionKey of functionsToCreate) {
			const sourceFunction = source[functionKey];
			if (sourceFunction) {
				scripts.push(
					generateCreateFunctionScript(
						sourceFunction.schema,
						sourceFunction.name,
						sourceFunction.definition,
						useManualCheck,
					),
				);
			}
		}

		// Agregar comentario de fin si se crearon funciones
		if (functionsToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push('-- FUNCTIONS: End\n');
			scripts.push('-- ============================================\n');
		}

		// Generar scripts DROP para funciones que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingFunction) {
			const functionsToDrop: string[] = [];
			for (const functionKey in target) {
				const targetFunction = target[functionKey];
				const sourceFunction = source[functionKey];

				if (!targetFunction) {
					continue;
				}

				// Filtrar funciones de superusuario también al hacer DROP
				if (excludeSuperuser && this.isSuperuserLanguage(targetFunction.language)) {
					continue;
				}

				if (!sourceFunction) {
					functionsToDrop.push(functionKey);
				}
			}

			if (functionsToDrop.length > 0) {
				scripts.push('-- ============================================\n');
				scripts.push(`-- FUNCTIONS: Drop Start (${functionsToDrop.length} function(s) to drop)\n`);
				scripts.push('-- ============================================\n');

				for (const functionKey of functionsToDrop) {
					const targetFunction = target[functionKey];
					if (targetFunction) {
					// Extraer tipos de argumentos de los parámetros
					const argTypes = targetFunction.parameters.length > 0
						? targetFunction.parameters.join(', ')
						: undefined;
					scripts.push(generateDropFunctionScript(targetFunction.schema, targetFunction.name, argTypes));
				}
				}

				scripts.push('-- ============================================\n');
				scripts.push('-- FUNCTIONS: Drop End\n');
				scripts.push('-- ============================================\n');
			}
		}

		return scripts;
	}
}
