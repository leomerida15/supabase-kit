/**
 * Servicio comparador para privilegios.
 *
 * Compara privilegios entre base de datos source y target,
 * generando scripts SQL GRANT/REVOKE.
 *
 * @module core/comparison/services/privilege-comparator
 */

import type { SchemaCompare } from '../../../types/config.types.js';
import {
	generateTableRoleGrantsScript,
	generateChangesTableRoleGrantsScript,
	type TablePrivileges,
} from './sql-generator/privilege-generator.utils.js';

/**
 * Parámetros para comparar privilegios de una tabla.
 *
 * @interface CompareTablePrivilegesParams
 */
export interface CompareTablePrivilegesParams {
	/**
	 * Nombre completo de la tabla (con schema).
	 */
	tableName: string;

	/**
	 * Privilegios de la base de datos source.
	 */
	sourcePrivileges: Record<string, TablePrivileges>;

	/**
	 * Privilegios de la base de datos target.
	 */
	targetPrivileges: Record<string, TablePrivileges>;

	/**
	 * Configuración de comparación de esquemas.
	 */
	config: Pick<SchemaCompare, 'roles'>;
}

/**
 * Servicio comparador de privilegios.
 *
 * @class PrivilegeComparatorService
 */
export class PrivilegeComparatorService {
	/**
	 * Compara privilegios de una tabla entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL para sincronizar privilegios
	 */
	public compareTablePrivileges(params: CompareTablePrivilegesParams): string[] {
		const { tableName, sourcePrivileges, targetPrivileges, config } = params;
		const scripts: string[] = [];
		const { roles } = config;

		// Solo procesar roles configurados si hay una lista específica
		const rolesToProcess =
			roles.length > 0
				? Object.keys(sourcePrivileges).filter((role) => roles.includes(role))
				: Object.keys(sourcePrivileges);

		for (const role of rolesToProcess) {
			const sourcePrivilege = sourcePrivileges[role];
			const targetPrivilege = targetPrivileges[role];

			if (!sourcePrivilege) {
				continue;
			}

			if (targetPrivilege) {
				// Privilegios existen en ambos, comparar y generar cambios
				const changes: TablePrivileges = {};

				if (sourcePrivilege.select !== targetPrivilege.select) {
					changes.select = sourcePrivilege.select;
				}
				if (sourcePrivilege.insert !== targetPrivilege.insert) {
					changes.insert = sourcePrivilege.insert;
				}
				if (sourcePrivilege.update !== targetPrivilege.update) {
					changes.update = sourcePrivilege.update;
				}
				if (sourcePrivilege.delete !== targetPrivilege.delete) {
					changes.delete = sourcePrivilege.delete;
				}
				if (sourcePrivilege.truncate !== targetPrivilege.truncate) {
					changes.truncate = sourcePrivilege.truncate;
				}
				if (sourcePrivilege.references !== targetPrivilege.references) {
					changes.references = sourcePrivilege.references;
				}
				if (sourcePrivilege.trigger !== targetPrivilege.trigger) {
					changes.trigger = sourcePrivilege.trigger;
				}

				if (Object.keys(changes).length > 0) {
					scripts.push(generateChangesTableRoleGrantsScript(tableName, role, changes));
				}
			} else if (sourcePrivilege) {
				// Privilegios no existen en target, generar GRANT completo
				scripts.push(generateTableRoleGrantsScript(tableName, role, sourcePrivilege));
			}
		}

		return scripts;
	}
}
