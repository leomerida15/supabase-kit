/**
 * Servicio comparador para extensiones.
 *
 * Compara extensiones entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/extension-comparator
 */

import { z } from 'zod';
import type { CompareExtensionsParams } from '../domain/types/comparison.types.js';
import type { Extension } from '../../catalog/domain/entities/index.js';
import { CompareExtensionsParamsSchema } from '../domain/schemas/comparison.schema.js';
import {
	generateCreateExtensionScript,
	addWarningsToScript,
	createExtensionNotAvailableWarning,
} from './sql-generator/index.js';

/**
 * Servicio comparador de extensiones.
 *
 * @class ExtensionComparatorService
 */
export class ExtensionComparatorService {
	/**
	 * Compara extensiones entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear extensiones faltantes
	 */
	public compare(params: CompareExtensionsParams): string[] {
		const validationResult = CompareExtensionsParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target } = params;
		const scripts: string[] = [];

		for (const extensionName in source) {
			const sourceExtension = source[extensionName];
			const targetExtension = target[extensionName];

			if (!sourceExtension) {
				continue;
			}

			// Solo generar script si la extensión no existe en target
			if (!targetExtension) {
				let script = generateCreateExtensionScript(sourceExtension.name);

				// Agregar advertencia si la extensión no tiene versión (puede no estar disponible)
				if (!sourceExtension.version) {
					const warning = createExtensionNotAvailableWarning(sourceExtension.name);
					script = addWarningsToScript(script, [warning]);
				}

				scripts.push(script);
			}
		}

		return scripts;
	}
}
