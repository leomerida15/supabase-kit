/**
 * Entidad que representa una clave foránea de PostgreSQL.
 *
 * @module core/catalog/domain/entities/foreign-key
 */

/**
 * Entidad que representa una clave foránea de PostgreSQL.
 *
 * @class ForeignKey
 */
export class ForeignKey {
	/**
	 * Nombre del schema donde se encuentra la tabla.
	 */
	public readonly schema: string;

	/**
	 * Nombre de la tabla que contiene la clave foránea.
	 */
	public readonly tableName: string;

	/**
	 * Nombre de la clave foránea.
	 */
	public readonly name: string;

	/**
	 * Columnas de la tabla que forman la clave foránea.
	 */
	public readonly columns: string[];

	/**
	 * Nombre del schema de la tabla referenciada.
	 */
	public readonly referencedSchema: string;

	/**
	 * Nombre de la tabla referenciada.
	 */
	public readonly referencedTable: string;

	/**
	 * Columnas de la tabla referenciada.
	 */
	public readonly referencedColumns: string[];

	/**
	 * Acción a realizar cuando se elimina un registro referenciado (ON DELETE).
	 */
	public readonly onDelete: string;

	/**
	 * Acción a realizar cuando se actualiza un registro referenciado (ON UPDATE).
	 */
	public readonly onUpdate: string;

	/**
	 * Crea una nueva instancia de ForeignKey.
	 *
	 * @param params - Parámetros para crear la clave foránea
	 */
	public constructor(params: {
		schema: string;
		tableName: string;
		name: string;
		columns: string[];
		referencedSchema: string;
		referencedTable: string;
		referencedColumns: string[];
		onDelete: string;
		onUpdate: string;
	}) {
		this.schema = params.schema;
		this.tableName = params.tableName;
		this.name = params.name;
		this.columns = params.columns;
		this.referencedSchema = params.referencedSchema;
		this.referencedTable = params.referencedTable;
		this.referencedColumns = params.referencedColumns;
		this.onDelete = params.onDelete;
		this.onUpdate = params.onUpdate;
	}
}
