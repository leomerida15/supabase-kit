/**
 * Servicio para gestionar la tabla de historial de migraciones.
 *
 * Proporciona funcionalidad para preparar y consultar la tabla
 * de historial de migraciones usando la estructura de Supabase.
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

		try {
			// Primero, crear el schema si no existe
			const createSchemaScript = `
				CREATE SCHEMA IF NOT EXISTS "${migrationHistory.tableSchema}";
			`;

			await this.databaseAdapter.query({
				connection,
				sql: createSchemaScript,
			});

			// Luego, generar y ejecutar el script CREATE TABLE IF NOT EXISTS
			const createTableScript = this.generateHistoryTableScript(migrationHistory);

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
	 * En la estructura de Supabase, si existe el registro = DONE, si no = TO_APPLY
	 *
	 * @param params - Parámetros para verificar el estado
	 * @returns Estado del patch
	 */
	public async checkPatchStatus(params: CheckPatchStatusParams): Promise<PatchStatusResult> {
		const { connection, patchInfo, config } = params;
		const { migrationHistory } = config;

		// Consultar solo si existe el registro (estructura Supabase)
		const query = `
			SELECT "version"
			FROM ${migrationHistory.fullTableName}
			WHERE "version" = $1
			LIMIT 1
		`;

		try {
			const results = await this.databaseAdapter.query<{
				version: string;
			}>({
				connection,
				sql: query,
				params: [patchInfo.version],
			});

			if (results.length === 0) {
				// No existe = pendiente de aplicar
				return {
					status: PatchStatusEnum.TO_APPLY,
				};
			}

			// Existe = ya aplicada
			return {
				status: PatchStatusEnum.DONE,
			};
		} catch (error) {
			// Si hay error (tabla no existe, etc), considerar como pendiente
			return {
				status: PatchStatusEnum.TO_APPLY,
			};
		}
	}

	/**
	 * Agrega un registro a la tabla de historial.
	 * Usa la estructura de Supabase: version, statements, name
	 *
	 * @param params - Parámetros para agregar el registro
	 * @param params.connection - Conexión a la base de datos
	 * @param params.patchInfo - Información del patch
	 * @param params.config - Configuración de migración
	 * @param params.statements - Array de statements SQL ejecutados (opcional)
	 */
	public async addRecordToHistoryTable(params: {
		connection: DatabaseConnection;
		patchInfo: PatchInfo;
		config: MigrationConfig;
		statements?: string[];
		author?: string;
	}): Promise<void> {
		const { connection, patchInfo, config, statements, author } = params;
		const { migrationHistory } = config;

		// Estructura Supabase: version, statements (TEXT[]), name, author
		const query = `
			INSERT INTO ${migrationHistory.fullTableName}
				("version", "statements", "name", "author")
			VALUES ($1, $2, $3, $4)
			ON CONFLICT ("version")
			DO UPDATE SET
				"statements" = EXCLUDED."statements",
				"name" = EXCLUDED."name",
				"author" = EXCLUDED."author"
		`;

		try {
			// postgres.js maneja arrays de JavaScript automáticamente
			// Si statements es undefined, usar NULL en lugar de array vacío
			const statementsParam = statements !== undefined && statements.length > 0 ? statements : null;

			await this.databaseAdapter.query({
				connection,
				sql: query,
				params: [
					patchInfo.version,
					statementsParam,
					patchInfo.name || null,
					author || null,
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
	 * En Supabase, solo insertamos cuando se completa exitosamente.
	 * Si hay error, no se guarda nada (o se puede eliminar si ya existe).
	 *
	 * @param params - Parámetros para actualizar el registro
	 * @param params.connection - Conexión a la base de datos
	 * @param params.patchInfo - Información del patch
	 * @param params.status - Nuevo estado
	 * @param params.message - Mensaje (opcional, no se usa en Supabase)
	 * @param params.script - Script ejecutado (opcional, se convierte a statements)
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
		const { connection, patchInfo, status, script, config } = params;
		const { migrationHistory } = config;

		// Solo guardar si se completó exitosamente
		if (status === PatchStatusEnum.DONE) {
			// En Supabase, el campo statements puede ser NULL o un array
			// Lo importante es que el registro exista con el version correcto
			// Guardamos el script completo como un solo statement para evitar problemas
			// con split(';') que puede dividir incorrectamente (dentro de strings, funciones, etc.)
			const statements: string[] | null = script && script.trim().length > 0
				? [script.trim()] // Guardar el script completo como un solo statement
				: null; // NULL si no hay script

			// Extraer el autor del script
			const author = this.extractAuthorFromScript(script);

			// Insertar o actualizar el registro
			await this.addRecordToHistoryTable({
				connection,
				patchInfo,
				config,
				statements: statements || undefined,
				author: author ?? undefined,
			});
		} else if (status === PatchStatusEnum.ERROR) {
			// Si hay error, eliminar el registro si existe (para poder reintentar)
			const deleteQuery = `
				DELETE FROM ${migrationHistory.fullTableName}
				WHERE "version" = $1
			`;

			try {
				await this.databaseAdapter.query({
					connection,
					sql: deleteQuery,
					params: [patchInfo.version],
				});
			} catch (error) {
				// Ignorar errores al eliminar
			}
		}
		// Para IN_PROGRESS, no hacemos nada (no guardamos estados intermedios)
	}

	/**
	 * Extrae el autor del header del script SQL.
	 * Busca los patrones:
	 * - Formato nuevo: -- SCRIPT AUTHOR: Nombre
	 * - Formato viejo: /*** SCRIPT AUTHOR: Nombre **​/
	 *
	 * @param script - Script SQL completo
	 * @returns Nombre del autor o null si no se encuentra
	 */
	private extractAuthorFromScript(script?: string): string | null {
		if (!script) {
			return null;
		}

		// Buscar el patrón nuevo: -- SCRIPT AUTHOR: Nombre (hasta el fin de línea)
		const newFormatMatch = script.match(/--\s*SCRIPT AUTHOR:\s*(.+?)(?:\r?\n|$)/i);
		if (newFormatMatch && newFormatMatch[1]) {
			return newFormatMatch[1].trim();
		}

		// Buscar el patrón viejo: /*** SCRIPT AUTHOR: Nombre ***/
		const oldFormatMatch = script.match(/\/\*\*\*\s*SCRIPT AUTHOR:\s*([^*]+)\s*\*\*\*\//i);
		if (oldFormatMatch && oldFormatMatch[1]) {
			return oldFormatMatch[1].trim();
		}

		return null;
	}

	/**
	 * Genera el script SQL para crear la tabla de historial usando la estructura de Supabase.
	 *
	 * @param migrationHistory - Configuración de la tabla de historial
	 * @returns Script SQL CREATE TABLE
	 */
	private generateHistoryTableScript(migrationHistory: MigrationConfig['migrationHistory']): string {
		const { fullTableName } = migrationHistory;

		// Estructura de Supabase: version (TEXT PK), statements (TEXT[]), name (TEXT), author (TEXT NOT NULL)
		return `
			CREATE TABLE IF NOT EXISTS ${fullTableName} (
				"version" TEXT NOT NULL,
				"statements" TEXT[] NULL,
				"name" TEXT NULL,
				"author" TEXT NOT NULL,
				CONSTRAINT ${migrationHistory.primaryKeyName} PRIMARY KEY ("version")
			);
		`;
	}
}
