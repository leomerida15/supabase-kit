/**
 * Entidad que representa un tipo personalizado de PostgreSQL.
 *
 * @module core/catalog/domain/entities/custom-type
 */

/**
 * Entidad que representa un tipo personalizado de PostgreSQL (composite type, domain, etc.).
 *
 * @class CustomType
 */
export class CustomType {
	/**
	 * Nombre del schema donde se encuentra el tipo.
	 */
	public readonly schema: string;

	/**
	 * Nombre del tipo.
	 */
	public readonly name: string;

	/**
	 * Tipo del tipo (composite, domain, etc.).
	 */
	public readonly type: string;

	/**
	 * Categoría del tipo.
	 */
	public readonly category: string;

	/**
	 * Crea una nueva instancia de CustomType.
	 *
	 * @param params - Parámetros para crear el tipo personalizado
	 * @param params.schema - Nombre del schema
	 * @param params.name - Nombre del tipo
	 * @param params.type - Tipo del tipo
	 * @param params.category - Categoría del tipo
	 */
	public constructor(params: {
		schema: string;
		name: string;
		type: string;
		category: string;
	}) {
		this.schema = params.schema;
		this.name = params.name;
		this.type = params.type;
		this.category = params.category;
	}
}
