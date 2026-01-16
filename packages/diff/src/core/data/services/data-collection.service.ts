/**
 * Servicio para recopilar datos de tablas.
 *
 * Implementa la recopilación de registros de tablas usando campos clave
 * y generación de hash para comparación eficiente.
 *
 * @module core/data/services/data-collection
 */

import type { DatabasePort } from '../../connection/ports/database.port.js';
import type {
	DataCollectionPort,
	TableRecords,
	CollectTableRecordsParams,
	CollectTableSequencesParams,
} from '../ports/data-collection.port.js';
import type { Sequence } from '../../catalog/domain/entities/index.js';

/**
 * Servicio para recopilar datos de tablas.
 *
 * @class DataCollectionService
 */
export class DataCollectionService implements DataCollectionPort {
	/**
	 * Adaptador de base de datos para ejecutar queries.
	 */
	private readonly databaseAdapter: DatabasePort;

	/**
	 * Crea una nueva instancia de DataCollectionService.
	 *
	 * @param params - Parámetros del servicio
	 * @param params.databaseAdapter - Adaptador de base de datos
	 */
	public constructor(params: { databaseAdapter: DatabasePort }) {
		this.databaseAdapter = params.databaseAdapter;
	}

	/**
	 * Recopila los registros de una tabla.
	 *
	 * @param params - Parámetros para recopilar registros
	 * @returns Promise que resuelve con los registros de la tabla
	 */
	public async collectTableRecords(params: CollectTableRecordsParams): Promise<TableRecords> {
		const { connection, tableDefinition, dbObjects, isNewTable = false } = params;

		// Si es una tabla nueva, retornar estructura vacía
		if (isNewTable) {
			return {
				fields: [],
				rows: [],
			};
		}

		const fullTableName = `"${tableDefinition.tableSchema || 'public'}"."${tableDefinition.tableName}"`;

		// Validar que los campos clave existan en la tabla
		const table = dbObjects.tables?.[fullTableName];
		if (!table) {
			throw new Error(`The table [${fullTableName}] does not exist in database objects`);
		}

		// Validar campos clave
		for (const keyField of tableDefinition.tableKeyFields) {
			// Los campos clave deben existir en la tabla
			// Por ahora, asumimos que la validación se hace en otro lugar
		}

		try {
			// Generar hash de fila usando campos clave
			const keyFieldsStr = tableDefinition.tableKeyFields.map((f: string) => `"${f}"`).join(',');
			const query = `
				SELECT
					MD5(ROW(${keyFieldsStr})::text) AS "rowHash",
					*
				FROM ${fullTableName}
			`;

			const results = await this.databaseAdapter.query<Record<string, unknown>>({
				connection,
				sql: query,
			});

			// Extraer nombres de campos (excluyendo rowHash)
			const fields: string[] = [];
			if (results.length > 0) {
				for (const field in results[0]) {
					if (field !== 'rowHash') {
						fields.push(field);
					}
				}
			}

			// Mapear resultados a formato TableRecords
			const rows = results.map((row) => {
				const rowData: Record<string, unknown> & { rowHash?: string } = {};
				for (const field of fields) {
					rowData[field] = row[field];
				}
				if (row.rowHash) {
					rowData.rowHash = row.rowHash as string;
				}
				return rowData;
			});

			return {
				fields,
				rows,
			};
		} catch (error) {
			throw new Error(`Failed to collect table records for ${fullTableName}`, {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila las secuencias asociadas a una tabla.
	 *
	 * @param params - Parámetros para recopilar secuencias
	 * @returns Promise que resuelve con las secuencias asociadas a la tabla
	 */
	public async collectTableSequences(
		params: CollectTableSequencesParams,
	): Promise<Sequence[]> {
		const { connection, tableDefinition } = params;
		const schema = tableDefinition.tableSchema || 'public';
		const tableName = tableDefinition.tableName;

		try {
			// Buscar secuencias asociadas a columnas de la tabla
			// Usar pg_sequences para obtener last_value y hacer JOIN con pg_sequence para seqcycle
			const query = `
				SELECT
					s.schemaname as schema,
					s.sequencename as name,
					s.last_value as current_value,
					s.increment_by as increment,
					s.min_value as min,
					s.max_value as max,
					s.start_value as start,
					COALESCE(seq.seqcycle, false) as cycle
				FROM pg_sequences s
				JOIN pg_class c_seq ON c_seq.relname = s.sequencename
				JOIN pg_namespace n_seq ON n_seq.oid = c_seq.relnamespace AND n_seq.nspname = s.schemaname
				LEFT JOIN pg_sequence seq ON seq.seqrelid = c_seq.oid
				INNER JOIN pg_depend d ON d.objid = c_seq.oid
				INNER JOIN pg_class c ON c.oid = d.refobjid
				INNER JOIN pg_namespace n ON n.oid = c.relnamespace
				WHERE n.nspname = $1 AND c.relname = $2
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				name: string;
				current_value: number;
				increment: number;
				min: number;
				max: number;
				start: number;
				cycle: boolean;
			}>({
				connection,
				sql: query,
				params: [schema, tableName],
			});

			// Importar SequenceEntity dinámicamente para evitar dependencias circulares
			const { Sequence: SequenceEntity } = await import(
				'../../catalog/domain/entities/sequence.entity.js'
			);

			return results.map(
				(row) =>
					new SequenceEntity({
						schema: row.schema,
						name: row.name,
						currentValue: row.current_value,
						increment: row.increment,
						min: row.min,
						max: row.max,
						start: row.start,
						cycle: row.cycle,
					}),
			);
		} catch (error) {
			throw new Error(
				`Failed to collect table sequences for "${schema}"."${tableName}"`,
				{
					cause: error instanceof Error ? error : new Error(String(error)),
				},
			);
		}
	}
}
