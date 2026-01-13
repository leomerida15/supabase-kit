/**
 * Entidad que representa una política RLS (Row Level Security) de PostgreSQL.
 *
 * @module core/catalog/domain/entities/rls-policy
 */

/**
 * Entidad que representa una política RLS (Row Level Security) de PostgreSQL.
 *
 * @class RLSPolicy
 */
export class RLSPolicy {
	/**
	 * Nombre del schema donde se encuentra la tabla.
	 */
	public readonly schema: string;

	/**
	 * Nombre de la tabla a la que aplica la política.
	 */
	public readonly tableName: string;

	/**
	 * Nombre de la política RLS.
	 */
	public readonly name: string;

	/**
	 * Comando de la política (ALL, SELECT, INSERT, UPDATE, DELETE).
	 */
	public readonly command: string;

	/**
	 * Definición de la política (expresión USING/FOR).
	 */
	public readonly definition: string;

	/**
	 * Roles a los que aplica la política.
	 */
	public readonly roles: string[];

	/**
	 * Crea una nueva instancia de RLSPolicy.
	 *
	 * @param params - Parámetros para crear la política RLS
	 */
	public constructor(params: {
		schema: string;
		tableName: string;
		name: string;
		command: string;
		definition: string;
		roles: string[];
	}) {
		this.schema = params.schema;
		this.tableName = params.tableName;
		this.name = params.name;
		this.command = params.command;
		this.definition = params.definition;
		this.roles = params.roles;
	}
}
