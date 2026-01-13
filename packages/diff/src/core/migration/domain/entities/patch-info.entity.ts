/**
 * Entidad que representa información de un patch.
 *
 * @module core/migration/domain/entities/patch-info
 */

import type { PatchInfo as PatchInfoType, PatchStatus } from '../types/migration.types.js';

/**
 * Entidad que representa información de un patch.
 *
 * @class PatchInfo
 */
export class PatchInfoEntity implements PatchInfoType {
	/**
	 * Nombre completo del archivo (con extensión).
	 */
	public readonly filename: string;

	/**
	 * Ruta completa del archivo.
	 */
	public readonly filepath: string;

	/**
	 * Versión del patch (timestamp del nombre del archivo).
	 */
	public readonly version: string;

	/**
	 * Nombre del patch (sin timestamp ni extensión).
	 */
	public readonly name: string;

	/**
	 * Estado actual del patch.
	 */
	public readonly status?: PatchStatus;

	/**
	 * Crea una nueva instancia de PatchInfo.
	 *
	 * @param params - Parámetros para crear el patch info
	 */
	public constructor(params: {
		filename: string;
		filepath: string;
		version: string;
		name: string;
		status?: PatchStatus;
	}) {
		this.filename = params.filename;
		this.filepath = params.filepath;
		this.version = params.version;
		this.name = params.name;
		this.status = params.status;
	}
}
