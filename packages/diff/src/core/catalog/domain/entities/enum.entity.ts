/**
 * Entidad que representa un tipo ENUM de PostgreSQL.
 *
 * @module core/catalog/domain/entities/enum
 */

/**
 * Entidad que representa un tipo ENUM de PostgreSQL.
 *
 * @class Enum
 */
export class Enum {
	/**
	 * Nombre del schema donde se encuentra el ENUM.
	 */
	public readonly schema: string;

	/**
	 * Nombre del ENUM.
	 */
	public readonly name: string;

	/**
	 * Valores del ENUM.
	 */
	public readonly values: string[];

	/**
	 * Crea una nueva instancia de Enum.
	 *
	 * @param params - Parámetros para crear el ENUM
	 * @param params.schema - Nombre del schema
	 * @param params.name - Nombre del ENUM
	 * @param params.values - Valores del ENUM
	 */
	public constructor(params: { schema: string; name: string; values: string[] }) {
		this.schema = params.schema;
		this.name = params.name;
		this.values = params.values;
	}
}
