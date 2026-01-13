/**
 * Puerto para operaciones de base de datos.
 *
 * Define la interfaz abstracta para operaciones de base de datos,
 * permitiendo desacoplar la lógica de negocio de la implementación concreta.
 *
 * @module core/connection/ports/database
 */

import type { DatabaseConnection, ConnectionParams } from '../domain/types/index.js';
import type { ServerVersion } from '../domain/entities/index.js';

/**
 * Puerto abstracto para operaciones de base de datos PostgreSQL.
 *
 * Define los métodos necesarios para conectar, consultar y gestionar
 * conexiones a bases de datos PostgreSQL, permitiendo diferentes
 * implementaciones (postgres.js, node-postgres, etc.).
 *
 * @interface DatabasePort
 */
export interface DatabasePort {
	/**
	 * Establece una nueva conexión a la base de datos.
	 *
	 * @param params - Parámetros de conexión
	 * @returns Promise que resuelve con la conexión establecida
	 *
	 * @throws {Error} Si no se puede establecer la conexión
	 */
	connect(params: ConnectionParams): Promise<DatabaseConnection>;

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
	query<T = unknown>(params: {
		connection: DatabaseConnection;
		sql: string;
		params?: unknown[];
	}): Promise<T[]>;

	/**
	 * Cierra una conexión a la base de datos.
	 *
	 * @param params - Parámetros para cerrar la conexión
	 * @param params.connection - Conexión a cerrar
	 * @returns Promise que se resuelve cuando la conexión se cierra
	 *
	 * @throws {Error} Si no se puede cerrar la conexión
	 */
	close(params: { connection: DatabaseConnection }): Promise<void>;

	/**
	 * Obtiene la versión del servidor PostgreSQL.
	 *
	 * @param params - Parámetros para obtener la versión
	 * @param params.connection - Conexión a la base de datos
	 * @returns Promise que resuelve con la versión del servidor
	 *
	 * @throws {Error} Si no se puede obtener la versión
	 */
	getServerVersion(params: { connection: DatabaseConnection }): Promise<ServerVersion>;
}
