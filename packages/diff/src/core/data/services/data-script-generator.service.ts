/**
 * Servicio para generar scripts SQL de datos (INSERT/UPDATE/DELETE).
 *
 * Genera scripts SQL completos para sincronizar datos entre tablas,
 * respetando dependencias y orden de ejecución.
 *
 * @module core/data/services/data-script-generator
 */

import type { TableDefinition } from '../../../types/config.types.js';
import type { TableRecords } from '../domain/types/data-comparison.types.js';

/**
 * Parámetros para generar scripts de datos.
 *
 * @interface GenerateDataScriptsParams
 */
export interface GenerateDataScriptsParams {
	/**
	 * Definición de la tabla.
	 */
	tableDefinition: TableDefinition;

	/**
	 * Registros de source.
	 */
	sourceRecords: TableRecords;

	/**
	 * Registros de target.
	 */
	targetRecords: TableRecords;
}

/**
 * Servicio para generar scripts SQL de datos.
 *
 * @class DataScriptGeneratorService
 */
export class DataScriptGeneratorService {
	/**
	 * Genera scripts SQL completos para sincronizar datos.
	 *
	 * @param params - Parámetros para generar scripts
	 * @returns Array de scripts SQL
	 */
	public generateScripts(params: GenerateDataScriptsParams): string[] {
		const { tableDefinition, sourceRecords, targetRecords } = params;
		const scripts: string[] = [];

		const fullTableName = `"${tableDefinition.tableSchema || 'public'}"."${tableDefinition.tableName}"`;

		// Crear mapas de hash para comparación
		const sourceMap = new Map<string, Record<string, unknown>>();
		const targetMap = new Map<string, Record<string, unknown>>();

		for (const row of sourceRecords.rows) {
			if (row.rowHash) {
				sourceMap.set(row.rowHash as string, row);
			}
		}

		for (const row of targetRecords.rows) {
			if (row.rowHash) {
				targetMap.set(row.rowHash as string, row);
			}
		}

		// Generar INSERTs para registros nuevos
		for (const [hash, sourceRow] of sourceMap.entries()) {
			if (!targetMap.has(hash)) {
				scripts.push(this.generateInsertScript(fullTableName, sourceRow, sourceRecords.fields));
			}
		}

		// Generar UPDATEs para registros modificados
		for (const [hash, sourceRow] of sourceMap.entries()) {
			const targetRow = targetMap.get(hash);
			if (targetRow && this.hasDataChanged(sourceRow, targetRow, tableDefinition.tableKeyFields)) {
				scripts.push(
					this.generateUpdateScript(
						fullTableName,
						sourceRow,
						tableDefinition.tableKeyFields,
						sourceRecords.fields,
					),
				);
			}
		}

		// Generar DELETEs para registros eliminados
		for (const [hash, targetRow] of targetMap.entries()) {
			if (!sourceMap.has(hash)) {
				scripts.push(
					this.generateDeleteScript(fullTableName, targetRow, tableDefinition.tableKeyFields),
				);
			}
		}

		return scripts;
	}

	/**
	 * Genera script SQL INSERT.
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
	 */
	private generateDeleteScript(
		tableName: string,
		data: Record<string, unknown>,
		keyFields: string[],
	): string {
		const whereClauses = keyFields.map((f) => `"${f}" = ${this.formatValue(data[f])}`).join(' AND ');

		return `DELETE FROM ${tableName} WHERE ${whereClauses};\n`;
	}

	/**
	 * Verifica si los datos han cambiado.
	 */
	private hasDataChanged(
		sourceRow: Record<string, unknown>,
		targetRow: Record<string, unknown>,
		keyFields: string[],
	): boolean {
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
	 * Formatea un valor para SQL.
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
}
