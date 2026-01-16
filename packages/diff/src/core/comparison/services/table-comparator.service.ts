/**
 * Servicio comparador para tablas.
 *
 * Compara tablas entre base de datos source y target,
 * generando scripts SQL CREATE básicos (estructura básica para NIVEL 3).
 *
 * @module core/comparison/services/table-comparator
 */

import type { CompareTablesParams } from '../domain/types/comparison.types.js';
import { CompareTablesParamsSchema } from '../domain/schemas/comparison.schema.js';
import {
	generateCreateTableScriptBasic,
	generateCreateTableScript,
	generateDropTableScript,
	generateAddColumnScript,
	generateDropColumnScript,
	generateAlterColumnTypeScript,
	generateAlterColumnNullableScript,
	generateAlterColumnDefaultScript,
} from './sql-generator/index.js';

/**
 * Patrones de DEFAULT que generan valores aleatorios y pueden violar FKs.
 * Estos patrones deben omitirse cuando la columna tiene una FK y la tabla tiene datos.
 */
const RANDOM_DEFAULT_PATTERNS = [
	/gen_random_uuid\s*\(\s*\)/i,
	/uuid_generate_v[1-5]\s*\(\s*\)/i,
	/uuid_generate_v4\s*\(\s*\)/i,
	/random\s*\(\s*\)/i,
	/nextval\s*\(/i,
];

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

		const { source, target, sourceTableStructures, targetTableStructures, config, targetTableHasData, sourceForeignKeys } = params;
		const scripts: string[] = [];
		
		// Crear un mapa de columnas que tienen FK asociada: "schema.table.column" -> true
		const columnsWithFK = new Set<string>();
		if (sourceForeignKeys) {
			for (const fkKey in sourceForeignKeys) {
				const fk = sourceForeignKeys[fkKey];
				if (fk) {
					for (const column of fk.columns) {
						columnsWithFK.add(`${fk.schema}.${fk.tableName}.${column}`);
					}
				}
			}
		}

		// Contar tablas que se van a crear
		const tablesToCreate: string[] = [];
		for (const tableKey in source) {
			const sourceTable = source[tableKey];
			const targetTable = target[tableKey];

			if (!sourceTable) {
				continue;
			}

			if (!targetTable) {
				tablesToCreate.push(tableKey);
			}
		}

		// Agregar comentario de inicio si hay tablas para crear
		if (tablesToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- TABLES: Start (${tablesToCreate.length} table(s) to create)\n`);
			scripts.push('-- ============================================\n');
		}

		// Generar scripts CREATE para tablas que existen en source pero no en target
		for (const tableKey of tablesToCreate) {
			const sourceTable = source[tableKey];
			if (sourceTable) {
				// Intentar usar tableStructure si está disponible para generar SQL completo
				const tableStructure = sourceTableStructures?.[tableKey];
				if (tableStructure) {
					scripts.push(
						generateCreateTableScript(
							sourceTable.schema,
							sourceTable.name,
							tableStructure,
						),
					);
				} else {
					// Fallback a estructura básica si no hay tableStructure
				scripts.push(generateCreateTableScriptBasic(sourceTable.schema, sourceTable.name));
			}
			}
		}

		// Agregar comentario de fin si se crearon tablas
		if (tablesToCreate.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push('-- TABLES: End\n');
			scripts.push('-- ============================================\n');
		}

		// Comparar columnas de tablas existentes
		const columnChanges: string[] = [];
		for (const tableKey in source) {
			const sourceTable = source[tableKey];
			const targetTable = target[tableKey];

			// Solo comparar si la tabla existe en ambas bases de datos
			if (!sourceTable || !targetTable) {
				continue;
			}

			// Necesitamos las estructuras de ambas bases de datos para comparar columnas
			const sourceStructure = sourceTableStructures?.[tableKey];
			const targetStructure = targetTableStructures?.[tableKey];

			if (!sourceStructure || !targetStructure) {
				continue;
			}

			const sourceColumns = sourceStructure.columns;
			const targetColumns = targetStructure.columns;

			// Detectar columnas nuevas (en source pero no en target)
			for (const columnName in sourceColumns) {
				const sourceColumn = sourceColumns[columnName];
				if (!sourceColumn) {
					continue;
				}

				if (!targetColumns[columnName]) {
					// Verificar si la tabla tiene datos y la columna es NOT NULL
					// Si es así, forzar nullable para evitar errores de foreign key
					const tableHasData = targetTableHasData?.[tableKey] === true;
					const forceNullable = tableHasData && !sourceColumn.isNullable;
					
					// Verificar si la columna tiene una FK asociada y un DEFAULT que genera valores aleatorios
					// Si es así, debemos omitir el DEFAULT para evitar violaciones de FK
					const columnHasFK = columnsWithFK.has(`${sourceTable.schema}.${sourceTable.name}.${columnName}`);
					const hasRandomDefault = Boolean(sourceColumn.defaultValue) && 
						RANDOM_DEFAULT_PATTERNS.some(pattern => pattern.test(sourceColumn.defaultValue || ''));
					const skipDefault = tableHasData && columnHasFK && hasRandomDefault;

					// Agregar comentario informativo si se fuerza nullable
					if (forceNullable) {
						columnChanges.push(
							`-- NOTE: Column "${columnName}" added as NULL because table has existing data.\n` +
								`-- Update NULL values with valid foreign key references before creating the foreign key constraint.\n`,
						);
					}
					
					// Agregar comentario si se omite el DEFAULT por FK
					if (skipDefault) {
						columnChanges.push(
							`-- NOTE: Column "${columnName}" DEFAULT omitted because it has a foreign key constraint.\n` +
								`-- The default (${sourceColumn.defaultValue}) would generate values that violate the FK.\n` +
								`-- Update NULL values with valid foreign key references before creating the foreign key constraint.\n`,
						);
					}

					columnChanges.push(
						generateAddColumnScript(
							sourceTable.schema,
							sourceTable.name,
							columnName,
							sourceColumn,
							forceNullable,
							!!skipDefault,
						),
					);
				}
			}

			// Detectar cambios en columnas existentes
			for (const columnName in sourceColumns) {
				const sourceColumn = sourceColumns[columnName];
				const targetColumn = targetColumns[columnName];

				if (!sourceColumn) {
					continue;
				}

				if (!targetColumn) {
					continue; // Ya se manejó como columna nueva
				}

				// Comparar tipo de dato
				if (
					sourceColumn.dataType !== targetColumn.dataType ||
					sourceColumn.maxLength !== targetColumn.maxLength
				) {
					columnChanges.push(
						generateAlterColumnTypeScript(
							sourceTable.schema,
							sourceTable.name,
							columnName,
							sourceColumn.dataType,
							sourceColumn.maxLength,
						),
					);
				}

				// Comparar nullable
				if (sourceColumn.isNullable !== targetColumn.isNullable) {
					columnChanges.push(
						generateAlterColumnNullableScript(
							sourceTable.schema,
							sourceTable.name,
							columnName,
							sourceColumn.isNullable,
						),
					);
				}

				// Comparar default (comparar valores normalizados)
				const sourceDefault = sourceColumn.defaultValue?.trim() || null;
				const targetDefault = targetColumn.defaultValue?.trim() || null;
				if (sourceDefault !== targetDefault) {
					columnChanges.push(
						generateAlterColumnDefaultScript(
							sourceTable.schema,
							sourceTable.name,
							columnName,
							sourceDefault,
						),
					);
				}
			}
		}

		// Agregar comentarios de bloque para cambios de columnas
		if (columnChanges.length > 0) {
			scripts.push('-- ============================================\n');
			scripts.push(`-- COLUMNS: Start (${columnChanges.length} column change(s))\n`);
			scripts.push('-- ============================================\n');
			scripts.push(...columnChanges);
			scripts.push('-- ============================================\n');
			scripts.push('-- COLUMNS: End\n');
			scripts.push('-- ============================================\n');
		}

		// Generar scripts DROP para tablas que existen en target pero no en source (si está habilitado)
		if (config?.dropMissingTable) {
			const tablesToDrop: string[] = [];
			for (const tableKey in target) {
				const targetTable = target[tableKey];
				const sourceTable = source[tableKey];

				if (!targetTable) {
					continue;
				}

				if (!sourceTable) {
					tablesToDrop.push(tableKey);
				}
			}

			if (tablesToDrop.length > 0) {
				scripts.push('-- ============================================\n');
				scripts.push(`-- TABLES: Drop Start (${tablesToDrop.length} table(s) to drop)\n`);
				scripts.push('-- ============================================\n');

				for (const tableKey of tablesToDrop) {
					const targetTable = target[tableKey];
					if (targetTable) {
						scripts.push(generateDropTableScript(targetTable.schema, targetTable.name));
				}
				}

				scripts.push('-- ============================================\n');
				scripts.push('-- TABLES: Drop End\n');
				scripts.push('-- ============================================\n');
			}
		}

		return scripts;
	}
}
