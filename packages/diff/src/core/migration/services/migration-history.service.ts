/**
 * Servicio para gestionar la tabla de historial de migraciones.
 *
 * Proporciona funcionalidad para preparar y consultar la tabla
 * de historial de migraciones.
 *
 * @module core/migration/services/migration-history
 */

import type { DatabasePort } from '../../connection/ports/database.port.js';
import type { DatabaseConnection } from '../../connection/domain/types/index.js';
import type {
	PrepareHistoryTableParams,
	CheckPatchStatusParams,
	PatchStatusResult,
	MigrationConfig,
	PatchInfo,
	PatchStatus,
} from '../domain/types/migration.types.js';
import { PatchStatus as PatchStatusEnum } from '../domain/types/migration.types.js';

/**
 * Servicio para gestionar la tabla de historial de migraciones.
 *
 * @class MigrationHistoryService
 */
export class MigrationHistoryService {
	/**
	 * Adaptador de base de datos para ejecutar queries.
	 */
	private readonly databaseAdapter: DatabasePort;

	/**
	 * Crea una nueva instancia de MigrationHistoryService.
	 *
	 * @param params - Parámetros del servicio
	 * @param params.databaseAdapter - Adaptador de base de datos
	 */
	public constructor(params: { databaseAdapter: DatabasePort }) {
		this.databaseAdapter = params.databaseAdapter;
	}

	/**
	 * Prepara la tabla de historial de migraciones.
	 * Crea la tabla si no existe.
	 *
	 * @param params - Parámetros para preparar la tabla
	 */
	public async prepareHistoryTable(params: PrepareHistoryTableParams): Promise<void> {
		const { connection, config } = params;
		const { migrationHistory } = config;

		// Generar script CREATE TABLE IF NOT EXISTS
		const createTableScript = this.generateHistoryTableScript(migrationHistory);

		try {
			await this.databaseAdapter.query({
				connection,
				sql: createTableScript,
			});
		} catch (error) {
			throw new Error('Failed to prepare migration history table', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Verifica el estado de un patch en la tabla de historial.
	 *
	 * @param params - Parámetros para verificar el estado
	 * @returns Estado del patch y mensaje de error si aplica
	 */
	public async checkPatchStatus(params: CheckPatchStatusParams): Promise<PatchStatusResult> {
		const { connection, patchInfo, config } = params;
		const { migrationHistory } = config;

		const query = `
			SELECT status, last_message
			FROM ${migrationHistory.fullTableName}
			WHERE version = $1 AND name = $2
			LIMIT 1
		`;

		try {
			const results = await this.databaseAdapter.query<{
				status: string;
				last_message: string | null;
			}>({
				connection,
				sql: query,
				params: [patchInfo.version, patchInfo.name],
			});

			if (results.length === 0) {
				return {
					status: PatchStatusEnum.TO_APPLY,
				};
			}

			const row = results[0];
			if (!row) {
				return {
					status: PatchStatusEnum.TO_APPLY,
				};
			}
			return {
				status: row.status as PatchStatus,
				errorMessage: row.last_message || undefined,
			};
		} catch (error) {
			throw new Error('Failed to check patch status', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Agrega un registro a la tabla de historial.
	 *
	 * @param params - Parámetros para agregar el registro
	 * @param params.connection - Conexión a la base de datos
	 * @param params.patchInfo - Información del patch
	 * @param params.config - Configuración de migración
	 */
	public async addRecordToHistoryTable(params: {
		connection: DatabaseConnection;
		patchInfo: PatchInfo;
		config: MigrationConfig;
	}): Promise<void> {
		const { connection, patchInfo, config } = params;
		const { migrationHistory } = config;

		const query = `
			INSERT INTO ${migrationHistory.fullTableName}
				("version", "name", "status", "last_message", "script", "applied_on")
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT ("version")
			DO UPDATE SET
				"name" = EXCLUDED."name",
				"status" = EXCLUDED."status",
				"last_message" = EXCLUDED."last_message",
				"script" = EXCLUDED."script",
				"applied_on" = EXCLUDED."applied_on"
		`;

		try {
			await this.databaseAdapter.query({
				connection,
				sql: query,
				params: [
					patchInfo.version,
					patchInfo.name,
					patchInfo.status || PatchStatusEnum.TO_APPLY,
					'',
					'',
					null,
				],
			});
		} catch (error) {
			throw new Error('Failed to add record to history table', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Actualiza un registro en la tabla de historial.
	 *
	 * @param params - Parámetros para actualizar el registro
	 * @param params.connection - Conexión a la base de datos
	 * @param params.patchInfo - Información del patch
	 * @param params.status - Nuevo estado
	 * @param params.message - Mensaje (opcional)
	 * @param params.script - Script ejecutado (opcional)
	 * @param params.config - Configuración de migración
	 */
	public async updateRecordToHistoryTable(params: {
		connection: DatabaseConnection;
		patchInfo: PatchInfo;
		status: PatchStatus;
		message?: string;
		script?: string;
		config: MigrationConfig;
	}): Promise<void> {
		const { connection, patchInfo, status, message, script, config } = params;
		const { migrationHistory } = config;

		const appliedOn = status === PatchStatusEnum.DONE || status === PatchStatusEnum.ERROR ? new Date() : null;

		const query = `
			UPDATE ${migrationHistory.fullTableName}
			SET
				"status" = $1,
				"last_message" = $2,
				"script" = $3,
				"applied_on" = $4
			WHERE "version" = $5 AND "name" = $6
		`;

		try {
			await this.databaseAdapter.query({
				connection,
				sql: query,
				params: [
					status,
					message || '',
					script || '',
					appliedOn,
					patchInfo.version,
					patchInfo.name,
				],
			});
		} catch (error) {
			throw new Error('Failed to update record in history table', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Genera el script SQL para crear la tabla de historial.
	 *
	 * @param migrationHistory - Configuración de la tabla de historial
	 * @returns Script SQL CREATE TABLE
	 */
	private generateHistoryTableScript(migrationHistory: MigrationConfig['migrationHistory']): string {
		const { fullTableName, tableName, primaryKeyName, tableOwner } = migrationHistory;

		return `
			CREATE TABLE IF NOT EXISTS ${fullTableName} (
				"version" VARCHAR(17) NOT NULL,
				"name" VARCHAR NOT NULL,
				"status" VARCHAR(5) NOT NULL DEFAULT '',
				"last_message" VARCHAR,
				"script" VARCHAR NOT NULL DEFAULT '',
				"applied_on" TIMESTAMP,
				CONSTRAINT ${primaryKeyName} PRIMARY KEY ("version")
			);

			ALTER TABLE ${fullTableName} OWNER TO ${tableOwner};
		`;
	}
}
