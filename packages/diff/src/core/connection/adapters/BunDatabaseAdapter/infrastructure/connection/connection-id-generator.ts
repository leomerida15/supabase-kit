/**
 * Generador de IDs únicos para conexiones.
 *
 * @module core/connection/adapters/BunDatabaseAdapter/infrastructure/connection/connection-id-generator
 */

/**
 * Genera un ID único para una conexión basado en los parámetros de conexión.
 *
 * @param params - Parámetros de conexión
 * @returns ID único para la conexión
 */
export function generateConnectionId(params: {
	host: string;
	port: number;
	database: string;
	user: string;
}): string {
	const { host, port, database, user } = params;
	return `${user}@${host}:${port}/${database}`;
}
