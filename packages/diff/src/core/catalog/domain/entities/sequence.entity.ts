/**
 * Entidad que representa una secuencia de PostgreSQL.
 *
 * @module core/catalog/domain/entities/sequence
 */

/**
 * Entidad que representa una secuencia de PostgreSQL.
 *
 * @class Sequence
 */
export class Sequence {
	/**
	 * Nombre del schema donde se encuentra la secuencia.
	 */
	public readonly schema: string;

	/**
	 * Nombre de la secuencia.
	 */
	public readonly name: string;

	/**
	 * Valor actual de la secuencia.
	 */
	public readonly currentValue: number;

	/**
	 * Incremento de la secuencia.
	 */
	public readonly increment: number;

	/**
	 * Valor mínimo de la secuencia.
	 */
	public readonly min: number;

	/**
	 * Valor máximo de la secuencia.
	 */
	public readonly max: number;

	/**
	 * Valor inicial de la secuencia.
	 */
	public readonly start: number;

	/**
	 * Indica si la secuencia cicla (vuelve al inicio después del máximo).
	 */
	public readonly cycle: boolean;

	/**
	 * Crea una nueva instancia de Sequence.
	 *
	 * @param params - Parámetros para crear la secuencia
	 */
	public constructor(params: {
		schema: string;
		name: string;
		currentValue: number;
		increment: number;
		min: number;
		max: number;
		start: number;
		cycle: boolean;
	}) {
		this.schema = params.schema;
		this.name = params.name;
		this.currentValue = params.currentValue;
		this.increment = params.increment;
		this.min = params.min;
		this.max = params.max;
		this.start = params.start;
		this.cycle = params.cycle;
	}
}
