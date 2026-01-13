/**
 * Entidad que representa una función de PostgreSQL.
 *
 * @module core/catalog/domain/entities/function
 */

/**
 * Entidad que representa una función de PostgreSQL.
 *
 * @class Function
 */
export class Function {
	/**
	 * Nombre del schema donde se encuentra la función.
	 */
	public readonly schema: string;

	/**
	 * Nombre de la función.
	 */
	public readonly name: string;

	/**
	 * Definición SQL de la función (CREATE FUNCTION statement).
	 */
	public readonly definition: string;

	/**
	 * Lenguaje de la función (plpgsql, sql, etc.).
	 */
	public readonly language: string;

	/**
	 * Tipo de retorno de la función.
	 */
	public readonly returnType: string;

	/**
	 * Parámetros de la función.
	 */
	public readonly parameters: string[];

	/**
	 * Crea una nueva instancia de Function.
	 *
	 * @param params - Parámetros para crear la función
	 */
	public constructor(params: {
		schema: string;
		name: string;
		definition: string;
		language: string;
		returnType: string;
		parameters: string[];
	}) {
		this.schema = params.schema;
		this.name = params.name;
		this.definition = params.definition;
		this.language = params.language;
		this.returnType = params.returnType;
		this.parameters = params.parameters;
	}
}
