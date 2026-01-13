/**
 * Tipos del dominio para conexiones a bases de datos.
 *
 * Define los tipos relacionados con la conexión a bases de datos PostgreSQL.
 *
 * @module core/connection/domain/types
 */

import type { Sql } from 'postgres';

/**
 * Parámetros para establecer una conexión a una base de datos.
 *
 * @interface ConnectionParams
 */
export interface ConnectionParams {
	/**
	 * Host o dirección IP del servidor PostgreSQL.
	 */
	host: string;

	/**
	 * Puerto del servidor PostgreSQL.
	 */
	port: number;

	/**
	 * Nombre de la base de datos.
	 */
	database: string;

	/**
	 * Nombre de usuario para autenticación.
	 */
	user: string;

	/**
	 * Contraseña para autenticación.
	 * Puede ser una cadena vacía si no se requiere contraseña.
	 */
	password: string;

	/**
	 * Nombre de la aplicación para identificación en el servidor.
	 */
	applicationName: string;

	/**
	 * Indica si se debe usar SSL para la conexión.
	 */
	ssl: boolean;
}

/**
 * Representa una conexión activa a una base de datos PostgreSQL.
 *
 * @interface DatabaseConnection
 */
export interface DatabaseConnection {
	/**
	 * Identificador único de la conexión.
	 */
	readonly id: string;

	/**
	 * Instancia Sql de postgres.js asociada a esta conexión.
	 */
	readonly sql: Sql;

	/**
	 * Host del servidor PostgreSQL.
	 */
	readonly host: string;

	/**
	 * Puerto del servidor PostgreSQL.
	 */
	readonly port: number;
}

/**
 * Configuración de conexión simplificada.
 *
 * @interface ConnectionConfig
 */
export interface ConnectionConfig {
	/**
	 * Host o dirección IP del servidor.
	 */
	host: string;

	/**
	 * Puerto del servidor.
	 */
	port: number;

	/**
	 * Nombre de la base de datos.
	 */
	database: string;

	/**
	 * Nombre de usuario.
	 */
	user: string;

	/**
	 * Contraseña (opcional).
	 */
	password?: string;

	/**
	 * Nombre de la aplicación.
	 */
	applicationName?: string;

	/**
	 * Habilitar SSL.
	 */
	ssl?: boolean;
}
