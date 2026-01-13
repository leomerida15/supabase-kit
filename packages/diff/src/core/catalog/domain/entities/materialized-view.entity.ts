/**
 * Entidad que representa una vista materializada de PostgreSQL.
 *
 * @module core/catalog/domain/entities/materialized-view
 */

/**
 * Entidad que representa una vista materializada de PostgreSQL.
 *
 * @class MaterializedView
 */
export class MaterializedView {
	/**
	 * Nombre del schema donde se encuentra la vista materializada.
	 */
	public readonly schema: string;

	/**
	 * Nombre de la vista materializada.
	 */
	public readonly name: string;

	/**
	 * Definición SQL de la vista materializada (CREATE MATERIALIZED VIEW statement).
	 */
	public readonly definition: string;

	/**
	 * Crea una nueva instancia de MaterializedView.
	 *
	 * @param params - Parámetros para crear la vista materializada
	 * @param params.schema - Nombre del schema
	 * @param params.name - Nombre de la vista materializada
	 * @param params.definition - Definición SQL de la vista materializada
	 */
	public constructor(params: {
		schema: string;
		name: string;
		definition: string;
	}) {
		this.schema = params.schema;
		this.name = params.name;
		this.definition = params.definition;
	}
}
