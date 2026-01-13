/**
 * Entidad que representa una extensión de PostgreSQL.
 *
 * @module core/catalog/domain/entities/extension
 */

/**
 * Entidad que representa una extensión de PostgreSQL.
 *
 * @class Extension
 */
export class Extension {
	/**
	 * Nombre de la extensión.
	 */
	public readonly name: string;

	/**
	 * Versión de la extensión.
	 */
	public readonly version: string;

	/**
	 * Crea una nueva instancia de Extension.
	 *
	 * @param params - Parámetros para crear la extensión
	 * @param params.name - Nombre de la extensión
	 * @param params.version - Versión de la extensión
	 */
	public constructor(params: { name: string; version: string }) {
		this.name = params.name;
		this.version = params.version;
	}
}
