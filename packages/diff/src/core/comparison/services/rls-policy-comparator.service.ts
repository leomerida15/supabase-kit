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
import {
	generateCreateRLSPolicyScript,
	generateDropRLSPolicyScript,
	normalizeRLSPolicyDefinition,
	normalizeRLSPolicyRoles,
} from './sql-generator/index.js';

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

		// Contar políticas que se van a crear
		const policiesToCreate: string[] = [];
		for (const policyKey in source) {
			const sourcePolicy = source[policyKey];
			const targetPolicy = target[policyKey];

			if (!sourcePolicy) {
				continue;
			}

			if (!targetPolicy) {
				policiesToCreate.push(policyKey);
			}
		}

		// Agregar comentario de inicio si hay políticas para crear
		if (policiesToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- RLS POLICIES: Start (${policiesToCreate.length} policy(ies) to create)\n`);
			scripts.push('-- ============================================\n');
		}

		// Generar scripts CREATE para políticas RLS que existen en source pero no en target
		for (const policyKey of policiesToCreate) {
			const sourcePolicy = source[policyKey];
			if (sourcePolicy) {
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

		// Agregar comentario de fin si se crearon políticas
		if (policiesToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push('-- RLS POLICIES: End\n');
			scripts.push('-- ============================================\n');
		}

		// Comparar políticas existentes para detectar cambios
		const policiesToAlter: string[] = [];
		for (const policyKey in source) {
			const sourcePolicy = source[policyKey];
			const targetPolicy = target[policyKey];

			// Solo comparar si la política existe en ambas bases de datos
			if (!sourcePolicy || !targetPolicy) {
				continue;
			}

			// Normalizar y comparar propiedades
			const normalizedSourceDefinition = normalizeRLSPolicyDefinition(sourcePolicy.definition);
			const normalizedTargetDefinition = normalizeRLSPolicyDefinition(targetPolicy.definition);
			const normalizedSourceRoles = normalizeRLSPolicyRoles(sourcePolicy.roles);
			const normalizedTargetRoles = normalizeRLSPolicyRoles(targetPolicy.roles);
			const normalizedSourceCommand = sourcePolicy.command.trim().toUpperCase();
			const normalizedTargetCommand = targetPolicy.command.trim().toUpperCase();

			// Detectar cambios en command, definition o roles
			const hasChanges =
				normalizedSourceDefinition !== normalizedTargetDefinition ||
				normalizedSourceCommand !== normalizedTargetCommand ||
				JSON.stringify(normalizedSourceRoles) !== JSON.stringify(normalizedTargetRoles);

			if (hasChanges) {
				policiesToAlter.push(policyKey);
			}
		}

		// Agregar comentarios de bloque para políticas a alterar
		if (policiesToAlter.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- RLS POLICIES: Alter Start (${policiesToAlter.length} policy(ies) to replace)\n`);
			scripts.push('-- ============================================\n');

			for (const policyKey of policiesToAlter) {
				const sourcePolicy = source[policyKey];
				if (sourcePolicy) {
					// Usar CREATE OR REPLACE POLICY en lugar de DROP + CREATE
					scripts.push(
						generateCreateRLSPolicyScript(
							sourcePolicy.schema,
							sourcePolicy.tableName,
							sourcePolicy.name,
							sourcePolicy.command,
							sourcePolicy.definition,
							sourcePolicy.roles,
							true, // useOrReplace = true
						),
					);
				}
			}

			scripts.push('-- ============================================\n');
			scripts.push('-- RLS POLICIES: Alter End\n');
			scripts.push('-- ============================================\n');
		}

		// Generar scripts DROP para políticas RLS que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingRLSPolicy) {
			const policiesToDrop: string[] = [];
			for (const policyKey in target) {
				const targetPolicy = target[policyKey];
				const sourcePolicy = source[policyKey];

				if (!targetPolicy) {
					continue;
				}

				if (!sourcePolicy) {
					policiesToDrop.push(policyKey);
				}
			}

			if (policiesToDrop.length > 0) {
				scripts.push('-- ============================================\n');
				scripts.push(`-- RLS POLICIES: Drop Start (${policiesToDrop.length} policy(ies) to drop)\n`);
				scripts.push('-- ============================================\n');

				for (const policyKey of policiesToDrop) {
					const targetPolicy = target[policyKey];
					if (targetPolicy) {
						scripts.push(
							generateDropRLSPolicyScript(targetPolicy.schema, targetPolicy.tableName, targetPolicy.name),
						);
					}
				}

				scripts.push('-- ============================================\n');
				scripts.push('-- RLS POLICIES: Drop End\n');
				scripts.push('-- ============================================\n');
			}
		}

		return scripts;
	}
}
