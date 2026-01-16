/**
 * Servicio para gestionar conexiones a bases de datos.
 *
 * Proporciona una capa de abstracción sobre DatabasePort, validando
 * configuraciones y manejando errores de conexión.
 *
 * @module core/connection/services/connection
 */

import type { DatabasePort } from '../ports/database.port.js';
import type { DatabaseConnection } from '../domain/types/index.js';
import type { ClientConfig } from '../../../types/config.types.js';
import type { ConnectionParams } from '../domain/types/index.js';
import { ClientConfigSchema } from '../../../types/config.schema.js';

/**
 * Servicio para gestionar conexiones a bases de datos.
 *
 * Encapsula la lógica de creación y validación de conexiones,
 * usando DatabasePort para la implementación concreta.
 *
 * @class ConnectionService
 */
export class ConnectionService {
	/**
	 * Adaptador de base de datos para realizar conexiones.
	 */
	private readonly databaseAdapter: DatabasePort;

	/**
	 * Crea una nueva instancia de ConnectionService.
	 *
	 * @param params - Parámetros del servicio
	 * @param params.databaseAdapter - Adaptador de base de datos
	 */
	public constructor(params: { databaseAdapter: DatabasePort }) {
		this.databaseAdapter = params.databaseAdapter;
	}

	/**
	 * Crea una nueva conexión a la base de datos.
	 *
	 * Valida la configuración del cliente, convierte ClientConfig a ConnectionParams
	 * y establece la conexión usando el adaptador de base de datos.
	 *
	 * @param params - Parámetros para crear la conexión
	 * @param params.config - Configuración del cliente (ClientConfig)
	 * @returns Promise que resuelve con la conexión establecida
	 *
	 * @throws {Error} Si la configuración es inválida o no se puede establecer la conexión
	 */
	public async createConnection(params: {
		config: ClientConfig;
	}): Promise<DatabaseConnection> {
		const { config } = params;

		// Validar configuración con Zod
		const validationResult = ClientConfigSchema.safeParse(config);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid client configuration', {
				cause: new TypeError('Client configuration validation failed'),
			});
		}

		const validatedConfig = validationResult.data;

		// Convertir ClientConfig a ConnectionParams
		// ClientConfig tiene database: string | null, pero ConnectionParams requiere string
		// La validación de Zod ya garantiza que database no es null
		// Para Supabase, la contraseña es requerida, así que si es null o vacía, lanzamos un error
		if (!validatedConfig.password || validatedConfig.password.trim() === '') {
			throw new Error(
				`Password is required for connection to ${validatedConfig.host}:${validatedConfig.port}/${validatedConfig.database}`,
				{
					cause: new Error('Password cannot be empty for database connection'),
				}
			);
		}
		
		const connectionParams: ConnectionParams = {
			host: validatedConfig.host,
			port: validatedConfig.port,
			database: validatedConfig.database!, // Non-null assertion: Zod garantiza que no es null
			user: validatedConfig.user,
			password: validatedConfig.password,
			applicationName: validatedConfig.applicationName,
			ssl: validatedConfig.ssl,
		};

		try {
			const connection = await this.databaseAdapter.connect(connectionParams);
			return connection;
		} catch (error) {
			throw new Error(
				`Failed to create connection: ${config.host}:${config.port}/${config.database}`,
				{
					cause: error instanceof Error ? error : new Error(String(error)),
				},
			);
		}
	}
}
