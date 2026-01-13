/**
 * Servicio para validar dependencias entre objetos de base de datos.
 *
 * Valida que las dependencias entre objetos estén correctas antes de generar scripts,
 * verificando el orden de creación (schemas → types → tables → foreign keys).
 *
 * @module core/validation/services/dependency-validation
 */

import type { DatabaseObjects } from '../../catalog/domain/types/database-objects.types.js';
import type { ForeignKey } from '../../catalog/domain/entities/index.js';

/**
 * Problema de dependencia detectado.
 *
 * @interface DependencyIssue
 */
export interface DependencyIssue {
	/**
	 * Tipo de objeto con el problema.
	 */
	objectType: string;

	/**
	 * Nombre del objeto.
	 */
	objectName: string;

	/**
	 * Tipo de problema.
	 */
	issueType: 'MISSING_DEPENDENCY' | 'WRONG_ORDER';

	/**
	 * Mensaje descriptivo del problema.
	 */
	message: string;
}

/**
 * Servicio para validar dependencias.
 *
 * @class DependencyValidationService
 */
export class DependencyValidationService {
	/**
	 * Valida las dependencias entre objetos.
	 *
	 * @param dbObjects - Objetos de la base de datos a validar
	 * @returns Lista de problemas de dependencias detectados
	 */
	public validateDependencies(dbObjects: DatabaseObjects): DependencyIssue[] {
		const issues: DependencyIssue[] = [];

		// Validar que los schemas existan antes de crear objetos en ellos
		const schemas = new Set<string>();
		if (dbObjects.schemas) {
			for (const schemaKey in dbObjects.schemas) {
				const schema = dbObjects.schemas[schemaKey];
				if (schema) {
					schemas.add(schema.name);
				}
			}
		}

		// Validar dependencias de tipos ENUM
		if (dbObjects.enums) {
			for (const enumKey in dbObjects.enums) {
				const enumType = dbObjects.enums[enumKey];
				if (!enumType) {
					continue;
				}
				if (!schemas.has(enumType.schema)) {
					issues.push({
						objectType: 'ENUM',
						objectName: enumKey,
						issueType: 'MISSING_DEPENDENCY',
						message: `Schema "${enumType.schema}" does not exist for ENUM "${enumType.name}"`,
					});
				}
			}
		}

		// Validar dependencias de tipos personalizados
		if (dbObjects.types) {
			for (const typeKey in dbObjects.types) {
				const customType = dbObjects.types[typeKey];
				if (!customType) {
					continue;
				}
				if (!schemas.has(customType.schema)) {
					issues.push({
						objectType: 'TYPE',
						objectName: typeKey,
						issueType: 'MISSING_DEPENDENCY',
						message: `Schema "${customType.schema}" does not exist for TYPE "${customType.name}"`,
					});
				}
			}
		}

		// Validar dependencias de secuencias
		if (dbObjects.sequences) {
			for (const seqKey in dbObjects.sequences) {
				const sequence = dbObjects.sequences[seqKey];
				if (!sequence) {
					continue;
				}
				if (!schemas.has(sequence.schema)) {
					issues.push({
						objectType: 'SEQUENCE',
						objectName: seqKey,
						issueType: 'MISSING_DEPENDENCY',
						message: `Schema "${sequence.schema}" does not exist for SEQUENCE "${sequence.name}"`,
					});
				}
			}
		}

		// Validar dependencias de tablas
		if (dbObjects.tables) {
			for (const tableKey in dbObjects.tables) {
				const table = dbObjects.tables[tableKey];
				if (!table) {
					continue;
				}
				if (!schemas.has(table.schema)) {
					issues.push({
						objectType: 'TABLE',
						objectName: tableKey,
						issueType: 'MISSING_DEPENDENCY',
						message: `Schema "${table.schema}" does not exist for TABLE "${table.name}"`,
					});
				}
			}
		}

		// Validar dependencias de vistas
		if (dbObjects.views) {
			for (const viewKey in dbObjects.views) {
				const view = dbObjects.views[viewKey];
				if (!view) {
					continue;
				}
				if (!schemas.has(view.schema)) {
					issues.push({
						objectType: 'VIEW',
						objectName: viewKey,
						issueType: 'MISSING_DEPENDENCY',
						message: `Schema "${view.schema}" does not exist for VIEW "${view.name}"`,
					});
				}
			}
		}

		// Validar dependencias de funciones
		if (dbObjects.functions) {
			for (const funcKey in dbObjects.functions) {
				const func = dbObjects.functions[funcKey];
				if (!func) {
					continue;
				}
				if (!schemas.has(func.schema)) {
					issues.push({
						objectType: 'FUNCTION',
						objectName: funcKey,
						issueType: 'MISSING_DEPENDENCY',
						message: `Schema "${func.schema}" does not exist for FUNCTION "${func.name}"`,
					});
				}
			}
		}

		// Validar dependencias de foreign keys
		if (dbObjects.foreignKeys) {
			for (const fkKey in dbObjects.foreignKeys) {
				const fk: ForeignKey | undefined = dbObjects.foreignKeys[fkKey];
				if (!fk) {
					continue;
				}

				// Validar schema de la tabla local
				if (!schemas.has(fk.schema)) {
					issues.push({
						objectType: 'FOREIGN_KEY',
						objectName: fkKey,
						issueType: 'MISSING_DEPENDENCY',
						message: `Schema "${fk.schema}" does not exist for FOREIGN KEY "${fk.name}"`,
					});
				}

				// Validar schema de la tabla referenciada
				if (!schemas.has(fk.referencedSchema)) {
					issues.push({
						objectType: 'FOREIGN_KEY',
						objectName: fkKey,
						issueType: 'MISSING_DEPENDENCY',
						message: `Referenced schema "${fk.referencedSchema}" does not exist for FOREIGN KEY "${fk.name}"`,
					});
				}

				// Validar que la tabla referenciada exista
				const referencedTableKey = `${fk.referencedSchema}.${fk.referencedTable}`;
				if (!dbObjects.tables?.[referencedTableKey]) {
					issues.push({
						objectType: 'FOREIGN_KEY',
						objectName: fkKey,
						issueType: 'MISSING_DEPENDENCY',
						message: `Referenced table "${referencedTableKey}" does not exist for FOREIGN KEY "${fk.name}"`,
					});
				}
			}
		}

		return issues;
	}
}
