/**
 * Entidad que representa una función agregada de PostgreSQL.
 *
 * @module core/catalog/domain/entities/aggregate
 */

/**
 * Entidad que representa una función agregada de PostgreSQL.
 *
 * @class Aggregate
 */
export class Aggregate {
	/**
	 * Nombre del schema donde se encuentra la función agregada.
	 */
	public readonly schema: string;

	/**
	 * Nombre de la función agregada.
	 */
	public readonly name: string;

	/**
	 * Definición SQL de la función agregada (CREATE AGGREGATE statement).
	 */
	public readonly definition: string;

	/**
	 * Crea una nueva instancia de Aggregate.
	 *
	 * @param params - Parámetros para crear la función agregada
	 * @param params.schema - Nombre del schema
	 * @param params.name - Nombre de la función agregada
	 * @param params.definition - Definición SQL de la función agregada
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
