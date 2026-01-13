/**
 * Servicio para validar integridad referencial de foreign keys.
 *
 * Detecta problemas de integridad referencial en foreign keys,
 * como tablas o columnas referenciadas que no existen.
 *
 * @module core/validation/services/referential-integrity
 */

import type { ForeignKey } from '../../catalog/domain/entities/index.js';
import type { DatabaseObjects } from '../../catalog/domain/types/database-objects.types.js';

/**
 * Problema de integridad referencial detectado.
 *
 * @interface ReferentialIntegrityIssue
 */
export interface ReferentialIntegrityIssue {
	/**
	 * Foreign key que tiene el problema.
	 */
	foreignKey: ForeignKey;

	/**
	 * Tipo de problema.
	 */
	issueType: 'MISSING_TABLE' | 'MISSING_COLUMN' | 'CIRCULAR_REFERENCE';

	/**
	 * Mensaje descriptivo del problema.
	 */
	message: string;
}

/**
 * Servicio para validar integridad referencial.
 *
 * @class ReferentialIntegrityService
 */
export class ReferentialIntegrityService {
	/**
	 * Valida la integridad referencial de todas las foreign keys.
	 *
	 * @param foreignKeys - Foreign keys a validar
	 * @param dbObjects - Objetos de la base de datos para validación
	 * @returns Lista de problemas detectados
	 */
	public validateForeignKeys(
		foreignKeys: Record<string, ForeignKey>,
		dbObjects: DatabaseObjects,
	): ReferentialIntegrityIssue[] {
		const issues: ReferentialIntegrityIssue[] = [];

		for (const fkKey in foreignKeys) {
			const fk = foreignKeys[fkKey];

			if (!fk) {
				continue;
			}

			// Validar que la tabla referenciada exista
			const referencedTableKey = `${fk.referencedSchema}.${fk.referencedTable}`;
			const referencedTable = dbObjects.tables?.[referencedTableKey];

			if (!referencedTable) {
				issues.push({
					foreignKey: fk,
					issueType: 'MISSING_TABLE',
					message: `Referenced table "${fk.referencedSchema}"."${fk.referencedTable}" does not exist`,
				});
				continue;
			}

			// Validar que las columnas referenciadas existan
			// Nota: Esto requiere acceso a la estructura de columnas de la tabla
			// Por ahora, solo validamos que la tabla exista
			// La validación de columnas se puede agregar cuando tengamos acceso a TableStructure
		}

		// Detectar referencias circulares
		const circularRefs = this.detectCircularReferences(foreignKeys);
		for (const circularRef of circularRefs) {
			issues.push({
				foreignKey: circularRef,
				issueType: 'CIRCULAR_REFERENCE',
				message: `Circular reference detected involving "${circularRef.schema}"."${circularRef.tableName}"`,
			});
		}

		return issues;
	}

	/**
	 * Detecta referencias circulares en foreign keys.
	 *
	 * @param foreignKeys - Foreign keys a analizar
	 * @returns Lista de foreign keys involucradas en referencias circulares
	 */
	private detectCircularReferences(foreignKeys: Record<string, ForeignKey>): ForeignKey[] {
		const circularRefs: ForeignKey[] = [];
		const visited = new Set<string>();
		const recursionStack = new Set<string>();

		const dfs = (fkKey: string): boolean => {
			if (recursionStack.has(fkKey)) {
				// Ciclo detectado
				return true;
			}

			if (visited.has(fkKey)) {
				return false;
			}

			visited.add(fkKey);
			recursionStack.add(fkKey);

			const fk = foreignKeys[fkKey];
			if (!fk) {
				recursionStack.delete(fkKey);
				return false;
			}

			const referencedKey = `${fk.referencedSchema}.${fk.referencedTable}`;

			// Buscar foreign keys que referencian la tabla local
			for (const otherFkKey in foreignKeys) {
				const otherFk = foreignKeys[otherFkKey];
				if (!otherFk) {
					continue;
				}
				if (
					otherFk.schema === fk.referencedSchema &&
					otherFk.tableName === fk.referencedTable
				) {
					const otherFkFullKey = `${otherFk.schema}.${otherFk.tableName}.${otherFk.name}`;
					if (dfs(otherFkFullKey)) {
						circularRefs.push(fk);
						recursionStack.delete(fkKey);
						return true;
					}
				}
			}

			recursionStack.delete(fkKey);
			return false;
		};

		for (const fkKey in foreignKeys) {
			if (!visited.has(fkKey)) {
				dfs(fkKey);
			}
		}

		return circularRefs;
	}
}
