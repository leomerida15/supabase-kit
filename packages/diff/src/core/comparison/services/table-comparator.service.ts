/**
 * Servicio comparador para tablas.
 *
 * Compara tablas entre base de datos source y target,
 * generando scripts SQL CREATE básicos (estructura básica para NIVEL 3).
 *
 * @module core/comparison/services/table-comparator
 */

import { z } from 'zod';
import type { CompareTablesParams } from '../domain/types/comparison.types.js';
import { CompareTablesParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateTableScriptBasic, generateDropTableScript } from './sql-generator/index.js';

/**
 * Servicio comparador de tablas.
 *
 * @class TableComparatorService
 */
export class TableComparatorService {
	/**
	 * Compara tablas entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear tablas faltantes (estructura básica)
	 */
	public compare(params: CompareTablesParams): string[] {
		const validationResult = CompareTablesParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target, config } = params;
		const scripts: string[] = [];

		// Generar scripts CREATE para tablas que existen en source pero no en target
		for (const tableKey in source) {
			const sourceTable = source[tableKey];
			const targetTable = target[tableKey];

			if (!sourceTable) {
				continue;
			}

			// Para NIVEL 3, solo estructura básica
			if (!targetTable) {
				scripts.push(generateCreateTableScriptBasic(sourceTable.schema, sourceTable.name));
			}
		}

		// Generar scripts DROP para tablas que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingTable) {
			for (const tableKey in target) {
				const targetTable = target[tableKey];
				const sourceTable = source[tableKey];

				if (!targetTable) {
					continue;
				}

				if (!sourceTable) {
					scripts.push(generateDropTableScript(targetTable.schema, targetTable.name));
				}
			}
		}

		return scripts;
	}
}
