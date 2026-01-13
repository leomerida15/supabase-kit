/**
 * Entidad que representa una vista de PostgreSQL.
 *
 * @module core/catalog/domain/entities/view
 */

/**
 * Entidad que representa una vista de PostgreSQL.
 *
 * @class View
 */
export class View {
	/**
	 * Nombre del schema donde se encuentra la vista.
	 */
	public readonly schema: string;

	/**
	 * Nombre de la vista.
	 */
	public readonly name: string;

	/**
	 * Definición SQL de la vista (CREATE VIEW statement).
	 */
	public readonly definition: string;

	/**
	 * Crea una nueva instancia de View.
	 *
	 * @param params - Parámetros para crear la vista
	 * @param params.schema - Nombre del schema
	 * @param params.name - Nombre de la vista
	 * @param params.definition - Definición SQL de la vista
	 */
	public constructor(params: { schema: string; name: string; definition: string }) {
		this.schema = params.schema;
		this.name = params.name;
		this.definition = params.definition;
	}
}
