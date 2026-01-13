/**
 * Adaptador de base de datos usando postgres.js para Bun.
 *
 * Implementa DatabasePort usando el paquete postgres.js para establecer
 * conexiones y ejecutar queries en PostgreSQL.
 *
 * @module core/connection/adapters/bun-database
 */

import postgres from 'postgres';
import type { Sql } from 'postgres';
import type { DatabasePort } from '../ports/database.port.js';
import type {
	ConnectionParams,
	DatabaseConnection,
} from '../domain/types/index.js';
import { ServerVersion } from '../domain/entities/server-version.entity.js';
import { ConnectionParamsSchema } from '../domain/schemas/connection.schema.js';
import { generateConnectionId } from './BunDatabaseAdapter/infrastructure/connection/connection-id-generator.js';

/**
 * Adaptador de base de datos que usa postgres.js.
 *
 * Implementa DatabasePort para conectar y consultar bases de datos PostgreSQL
 * usando el paquete postgres.js.
 *
 * @class BunDatabaseAdapter
 */
export class BunDatabaseAdapter implements DatabasePort {
	/**
	 * Establece una nueva conexión a la base de datos usando postgres.js.
	 *
	 * @param params - Parámetros de conexión
	 * @returns Promise que resuelve con la conexión establecida
	 *
	 * @throws {Error} Si los parámetros son inválidos o no se puede establecer la conexión
	 */
	public async connect(params: ConnectionParams): Promise<DatabaseConnection> {
		// Validar parámetros con Zod
		const validationResult = ConnectionParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid connection parameters', {
				cause: new TypeError('Connection parameters validation failed'),
			});
		}

		const validatedParams = validationResult.data;

		try {
			// Crear conexión usando postgres.js
			const sql: Sql = postgres({
				host: validatedParams.host,
				port: validatedParams.port,
				database: validatedParams.database,
				user: validatedParams.user,
				password: validatedParams.password || undefined,
				ssl: validatedParams.ssl ? { rejectUnauthorized: false } : false,
				// postgres.js usa connection.application_name para application_name
				connection: {
					application_name: validatedParams.applicationName,
				},
			});

			// Generar ID único para la conexión
			const connectionId = generateConnectionId({
				host: validatedParams.host,
				port: validatedParams.port,
				database: validatedParams.database,
				user: validatedParams.user,
			});

			const connection: DatabaseConnection = {
				id: connectionId,
				sql,
				host: validatedParams.host,
				port: validatedParams.port,
			};

			return connection;
		} catch (error) {
			throw new Error(
				`Failed to connect to database: ${validatedParams.host}:${validatedParams.port}/${validatedParams.database}`,
				{
					cause: error instanceof Error ? error : new Error(String(error)),
				},
			);
		}
	}

	/**
	 * Ejecuta una consulta SQL en la base de datos.
	 *
	 * @param params - Parámetros para la consulta
	 * @param params.connection - Conexión a la base de datos
	 * @param params.sql - Consulta SQL como string (con placeholders $1, $2, etc.)
	 * @param params.params - Parámetros opcionales para la consulta
	 * @returns Promise que resuelve con los resultados de la consulta
	 *
	 * @throws {Error} Si la consulta falla
	 */
	public async query<T = unknown>(params: {
		connection: DatabaseConnection;
		sql: string;
		params?: unknown[];
	}): Promise<T[]> {
		const { connection, sql: sqlString, params: queryParams = [] } = params;

		try {
			// postgres.js usa .unsafe() para ejecutar queries SQL raw con placeholders
			const result = await connection.sql.unsafe(sqlString, queryParams as never[]);
			return result.concat() as unknown as T[];
		} catch (error) {
			throw new Error(`Query execution failed: ${sqlString.substring(0, 100)}...`, {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Cierra una conexión a la base de datos.
	 *
	 * @param params - Parámetros para cerrar la conexión
	 * @param params.connection - Conexión a cerrar
	 * @returns Promise que se resuelve cuando la conexión se cierra
	 *
	 * @throws {Error} Si no se puede cerrar la conexión
	 */
	public async close(params: { connection: DatabaseConnection }): Promise<void> {
		const { connection } = params;

		try {
			await connection.sql.end();
		} catch (error) {
			throw new Error('Failed to close database connection', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Obtiene la versión del servidor PostgreSQL.
	 *
	 * @param params - Parámetros para obtener la versión
	 * @param params.connection - Conexión a la base de datos
	 * @returns Promise que resuelve con la versión del servidor
	 *
	 * @throws {Error} Si no se puede obtener la versión
	 */
	public async getServerVersion(params: {
		connection: DatabaseConnection;
	}): Promise<ServerVersion> {
		const { connection } = params;

		try {
			// Ejecutar query para obtener la versión del servidor
			const result = await connection.sql`
				SELECT current_setting('server_version') as version
			`;

			if (!result || result.length === 0) {
				throw new Error('Could not retrieve server version', {
					cause: new Error('Empty result from server_version query'),
				});
			}

			const versionString = (result[0] as { version: string })?.version;

			if (typeof versionString !== 'string') {
				throw new Error('Invalid server version format', {
					cause: new TypeError(`Expected string, got ${typeof versionString}`),
				});
			}

			// Parsear versión (formato: "14.5.2" o "14.5")
			const versionParts = versionString.split('.').map((part) => parseInt(part, 10));

			if (versionParts.length < 2 || versionParts.some((part) => isNaN(part))) {
				throw new Error('Invalid server version format', {
					cause: new Error(`Could not parse version: ${versionString}`),
				});
			}

			const major = versionParts[0] ?? 0;
			const minor = versionParts[1] ?? 0;
			const patch = versionParts[2] ?? 0;

			return new ServerVersion({
				major,
				minor,
				patch,
			});
		} catch (error) {
			if (error instanceof Error && error.cause) {
				throw error;
			}

			throw new Error('Failed to fetch server version', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}
}
