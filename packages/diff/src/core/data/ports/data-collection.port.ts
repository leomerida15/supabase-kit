/**
 * Puerto para recopilación de datos de tablas.
 *
 * Define la interfaz abstracta para recopilar datos/registros de tablas,
 * permitiendo desacoplar la lógica de negocio de la implementación concreta.
 *
 * @module core/data/ports/data-collection
 */

import type {
	TableRecords,
	CollectTableRecordsParams,
	CollectTableSequencesParams,
} from '../domain/types/data-comparison.types.js';
import type { Sequence } from '../../catalog/domain/entities/index.js';

export type {
	TableRecords,
	CollectTableRecordsParams,
	CollectTableSequencesParams,
} from '../domain/types/data-comparison.types.js';

/**
 * Puerto abstracto para recopilación de datos de tablas.
 *
 * Define los métodos necesarios para recopilar datos de tablas,
 * permitiendo diferentes implementaciones.
 *
 * @interface DataCollectionPort
 */
export interface DataCollectionPort {
	/**
	 * Recopila los registros de una tabla.
	 *
	 * @param params - Parámetros para recopilar registros
	 * @returns Promise que resuelve con los registros de la tabla
	 */
	collectTableRecords(params: CollectTableRecordsParams): Promise<TableRecords>;

	/**
	 * Recopila las secuencias asociadas a una tabla.
	 *
	 * @param params - Parámetros para recopilar secuencias
	 * @returns Promise que resuelve con las secuencias asociadas a la tabla
	 */
	collectTableSequences(params: CollectTableSequencesParams): Promise<Sequence[]>;
}
