/**
 * Servicio comparador para políticas RLS.
 *
 * Compara políticas RLS entre base de datos source y target,
 * generando scripts SQL CREATE básicos.
 *
 * @module core/comparison/services/rls-policy-comparator
 */

import { z } from 'zod';
import type { CompareRLSPoliciesParams } from '../domain/types/comparison.types.js';
import { CompareRLSPoliciesParamsSchema } from '../domain/schemas/comparison.schema.js';
import { generateCreateRLSPolicyScript, generateDropRLSPolicyScript } from './sql-generator/index.js';

/**
 * Servicio comparador de políticas RLS.
 *
 * @class RLSPolicyComparatorService
 */
export class RLSPolicyComparatorService {
	/**
	 * Compara políticas RLS entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para crear políticas RLS faltantes
	 */
	public compare(params: CompareRLSPoliciesParams): string[] {
		const validationResult = CompareRLSPoliciesParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { source, target, config } = params;
		const scripts: string[] = [];

		// Solo procesar si RLS está habilitado
		if (config?.enableRLSPolicies === false) {
			return scripts;
		}

		// Generar scripts CREATE para políticas RLS que existen en source pero no en target
		for (const policyKey in source) {
			const sourcePolicy = source[policyKey];
			const targetPolicy = target[policyKey];

			if (!sourcePolicy) {
				continue;
			}

			if (!targetPolicy) {
				scripts.push(
					generateCreateRLSPolicyScript(
						sourcePolicy.schema,
						sourcePolicy.tableName,
						sourcePolicy.name,
						sourcePolicy.command,
						sourcePolicy.definition,
						sourcePolicy.roles,
					),
				);
			}
		}

		// Generar scripts DROP para políticas RLS que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingRLSPolicy) {
			for (const policyKey in target) {
				const targetPolicy = target[policyKey];
				const sourcePolicy = source[policyKey];

				if (!targetPolicy) {
					continue;
				}

				if (!sourcePolicy) {
					scripts.push(
						generateDropRLSPolicyScript(targetPolicy.schema, targetPolicy.tableName, targetPolicy.name),
					);
				}
			}
		}

		return scripts;
	}
}
