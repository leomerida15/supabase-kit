/**
 * Servicio para comparar registros de tablas.
 *
 * Compara registros entre source y target usando campos clave
 * e identifica registros a INSERT, UPDATE, DELETE.
 *
 * @module core/data/services/data-comparison
 */

import type {
	CompareTableDataParams,
	DataComparisonResult,
	TableData,
} from '../domain/types/data-comparison.types.js';
import type { TableDefinition } from '../../../types/config.types.js';

/**
 * Diferencia entre registros de source y target.
 *
 * @interface RecordDifference
 */
export interface RecordDifference {
	/**
	 * Hash del registro (identificador único).
	 */
	rowHash: string;

	/**
	 * Tipo de diferencia (INSERT, UPDATE, DELETE).
	 */
	type: 'INSERT' | 'UPDATE' | 'DELETE';

	/**
	 * Datos del registro (para INSERT/UPDATE).
	 */
	data?: Record<string, unknown>;
}

/**
 * Servicio para comparar registros de tablas.
 *
 * @class DataComparisonService
 */
export class DataComparisonService {
	/**
	 * Compara datos de una tabla entre source y target.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Resultado de la comparación con scripts SQL
	 */
	public compareTableData(params: CompareTableDataParams): DataComparisonResult {
		const { tableDefinition, sourceData, targetData } = params;
		const differences = this.findDifferences(sourceData, targetData, tableDefinition);
		const sqlScript = this.generateScripts(differences, tableDefinition, sourceData);

		// Verificar si se necesita rebase de secuencias
		const isSequenceRebaseNeeded = this.checkSequenceRebaseNeeded(
			sourceData,
			targetData,
			differences,
		);

		return {
			sqlScript,
			isSequenceRebaseNeeded,
		};
	}

	/**
	 * Encuentra diferencias entre registros de source y target.
	 *
	 * @param sourceData - Datos de source
	 * @param targetData - Datos de target
	 * @param tableDefinition - Definición de la tabla
	 * @returns Lista de diferencias
	 */
	private findDifferences(
		sourceData: TableData,
		targetData: TableData,
		tableDefinition: TableDefinition,
	): RecordDifference[] {
		const differences: RecordDifference[] = [];

		// Crear mapas de hash a registro para búsqueda eficiente
		const sourceMap = new Map<string, Record<string, unknown>>();
		const targetMap = new Map<string, Record<string, unknown>>();

		for (const row of sourceData.records.rows) {
			if (row.rowHash) {
				sourceMap.set(row.rowHash as string, row);
			}
		}

		for (const row of targetData.records.rows) {
			if (row.rowHash) {
				targetMap.set(row.rowHash as string, row);
			}
		}

		// Encontrar registros a INSERT (en source pero no en target)
		for (const [hash, sourceRow] of sourceMap.entries()) {
			if (!targetMap.has(hash)) {
				differences.push({
					rowHash: hash,
					type: 'INSERT',
					data: sourceRow,
				});
			} else {
				// Comparar contenido para detectar UPDATEs
				const targetRow = targetMap.get(hash)!;
				if (this.hasDataChanged(sourceRow, targetRow, tableDefinition.tableKeyFields)) {
					differences.push({
						rowHash: hash,
						type: 'UPDATE',
						data: sourceRow,
					});
				}
			}
		}

		// Encontrar registros a DELETE (en target pero no en source)
		for (const [hash] of targetMap.entries()) {
			if (!sourceMap.has(hash)) {
				differences.push({
					rowHash: hash,
					type: 'DELETE',
				});
			}
		}

		return differences;
	}

	/**
	 * Verifica si los datos de un registro han cambiado.
	 *
	 * @param sourceRow - Fila de source
	 * @param targetRow - Fila de target
	 * @param keyFields - Campos clave
	 * @returns true si los datos han cambiado
	 */
	private hasDataChanged(
		sourceRow: Record<string, unknown>,
		targetRow: Record<string, unknown>,
		keyFields: string[],
	): boolean {
		// Comparar todos los campos excepto los clave (que se usan para identificación)
		for (const field in sourceRow) {
			if (field === 'rowHash' || keyFields.includes(field)) {
				continue;
			}

			if (sourceRow[field] !== targetRow[field]) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Genera scripts SQL para aplicar las diferencias.
	 *
	 * @param differences - Lista de diferencias
	 * @param tableDefinition - Definición de la tabla
	 * @param sourceData - Datos de source (para obtener valores)
	 * @returns Array de scripts SQL
	 */
	private generateScripts(
		differences: RecordDifference[],
		tableDefinition: TableDefinition,
		sourceData: TableData,
	): string[] {
		const scripts: string[] = [];
		const fullTableName = `"${tableDefinition.tableSchema || 'public'}"."${tableDefinition.tableName}"`;

		for (const diff of differences) {
			switch (diff.type) {
				case 'INSERT':
					if (diff.data) {
						scripts.push(this.generateInsertScript(fullTableName, diff.data, sourceData.records.fields));
					}
					break;

				case 'UPDATE':
					if (diff.data) {
						scripts.push(
							this.generateUpdateScript(
								fullTableName,
								diff.data,
								tableDefinition.tableKeyFields,
								sourceData.records.fields,
							),
						);
					}
					break;

				case 'DELETE':
					// Para DELETE, necesitamos los datos del target
					// Por ahora, generamos un script básico
					scripts.push(
						this.generateDeleteScript(fullTableName, diff.rowHash, tableDefinition.tableKeyFields),
					);
					break;
			}
		}

		return scripts;
	}

	/**
	 * Genera script SQL INSERT.
	 *
	 * @param tableName - Nombre completo de la tabla
	 * @param data - Datos del registro
	 * @param fields - Nombres de campos
	 * @returns Script SQL INSERT
	 */
	private generateInsertScript(
		tableName: string,
		data: Record<string, unknown>,
		fields: string[],
	): string {
		const columns = fields.filter((f) => f !== 'rowHash').map((f) => `"${f}"`).join(', ');
		const values = fields
			.filter((f) => f !== 'rowHash')
			.map((f) => this.formatValue(data[f]))
			.join(', ');

		return `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
	}

	/**
	 * Genera script SQL UPDATE.
	 *
	 * @param tableName - Nombre completo de la tabla
	 * @param data - Datos del registro
	 * @param keyFields - Campos clave para WHERE
	 * @param fields - Nombres de campos
	 * @returns Script SQL UPDATE
	 */
	private generateUpdateScript(
		tableName: string,
		data: Record<string, unknown>,
		keyFields: string[],
		fields: string[],
	): string {
		const setClauses = fields
			.filter((f) => f !== 'rowHash' && !keyFields.includes(f))
			.map((f) => `"${f}" = ${this.formatValue(data[f])}`)
			.join(', ');

		const whereClauses = keyFields.map((f) => `"${f}" = ${this.formatValue(data[f])}`).join(' AND ');

		return `UPDATE ${tableName} SET ${setClauses} WHERE ${whereClauses};\n`;
	}

	/**
	 * Genera script SQL DELETE.
	 *
	 * @param tableName - Nombre completo de la tabla
	 * @param rowHash - Hash del registro
	 * @param keyFields - Campos clave
	 * @returns Script SQL DELETE (placeholder)
	 */
	private generateDeleteScript(
		tableName: string,
		rowHash: string,
		keyFields: string[],
	): string {
		// Para DELETE, necesitaríamos los valores de los campos clave
		// Por ahora, generamos un comentario
		return `-- DELETE FROM ${tableName} WHERE rowHash = '${rowHash}';\n`;
	}

	/**
	 * Formatea un valor para SQL.
	 *
	 * @param value - Valor a formatear
	 * @returns Valor formateado como string SQL
	 */
	private formatValue(value: unknown): string {
		if (value === null || value === undefined) {
			return 'NULL';
		}

		if (typeof value === 'string') {
			return `'${value.replace(/'/g, "''")}'`;
		}

		if (typeof value === 'number' || typeof value === 'boolean') {
			return String(value);
		}

		if (value instanceof Date) {
			return `'${value.toISOString()}'`;
		}

		if (Array.isArray(value)) {
			return `'{${value.join(',')}}'`;
		}

		if (typeof value === 'object') {
			return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
		}

		return `'${String(value).replace(/'/g, "''")}'`;
	}

	/**
	 * Verifica si se necesita rebase de secuencias.
	 *
	 * @param sourceData - Datos de source
	 * @param targetData - Datos de target
	 * @param differences - Diferencias encontradas
	 * @returns true si se necesita rebase
	 */
	private checkSequenceRebaseNeeded(
		sourceData: TableData,
		targetData: TableData,
		differences: RecordDifference[],
	): boolean {
		// Si hay INSERTs y hay secuencias, puede ser necesario rebase
		const hasInserts = differences.some((d) => d.type === 'INSERT');
		const hasSequences = sourceData.sequences.length > 0 || targetData.sequences.length > 0;

		return hasInserts && hasSequences;
	}
}
