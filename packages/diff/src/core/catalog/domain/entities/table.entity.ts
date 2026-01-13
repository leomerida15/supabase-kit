/**
 * Entidad que representa una tabla de PostgreSQL.
 *
 * @module core/catalog/domain/entities/table
 */

/**
 * Entidad que representa una tabla de PostgreSQL.
 *
 * @class Table
 */
export class Table {
	/**
	 * Nombre del schema donde se encuentra la tabla.
	 */
	public readonly schema: string;

	/**
	 * Nombre de la tabla.
	 */
	public readonly name: string;

	/**
	 * Columnas de la tabla (definición de columnas).
	 */
	public readonly columns: string;

	/**
	 * Constraints de la tabla.
	 */
	public readonly constraints: string;

	/**
	 * Índices de la tabla.
	 */
	public readonly indexes: string;

	/**
	 * Privilegios de la tabla.
	 */
	public readonly privileges: string;

	/**
	 * Triggers de la tabla.
	 */
	public readonly triggers: string;

	/**
	 * Crea una nueva instancia de Table.
	 *
	 * @param params - Parámetros para crear la tabla
	 */
	public constructor(params: {
		schema: string;
		name: string;
		columns: string;
		constraints: string;
		indexes: string;
		privileges: string;
		triggers: string;
	}) {
		this.schema = params.schema;
		this.name = params.name;
		this.columns = params.columns;
		this.constraints = params.constraints;
		this.indexes = params.indexes;
		this.privileges = params.privileges;
		this.triggers = params.triggers;
	}
}
