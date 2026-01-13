/**
 * Entidad que representa un schema (namespace) de PostgreSQL.
 *
 * @module core/catalog/domain/entities/schema
 */

/**
 * Entidad que representa un schema de PostgreSQL.
 *
 * @class Schema
 */
export class Schema {
	/**
	 * Nombre del schema.
	 */
	public readonly name: string;

	/**
	 * Propietario del schema (opcional).
	 */
	public readonly owner?: string;

	/**
	 * Crea una nueva instancia de Schema.
	 *
	 * @param params - Parámetros para crear el schema
	 * @param params.name - Nombre del schema
	 * @param params.owner - Propietario del schema (opcional)
	 */
	public constructor(params: { name: string; owner?: string }) {
		this.name = params.name;
		this.owner = params.owner;
	}
}
