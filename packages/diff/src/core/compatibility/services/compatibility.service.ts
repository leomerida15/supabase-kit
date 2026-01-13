/**
 * Servicio de compatibilidad de versiones del servidor PostgreSQL.
 *
 * Proporciona funcionalidades para verificar la compatibilidad
 * de versiones del servidor PostgreSQL.
 *
 * @module core/compatibility/services/compatibility
 */

import type { ServerVersion } from '../../connection/domain/entities/server-version.entity.js';

/**
 * Servicio para verificar compatibilidad de versiones del servidor PostgreSQL.
 *
 * Proporciona métodos para validar si una versión del servidor cumple
 * con los requisitos mínimos de versión.
 *
 * @class CompatibilityService
 */
export class CompatibilityService {
	/**
	 * Verifica si la versión del servidor es compatible con los requisitos especificados.
	 *
	 * Retorna true si la versión mayor es mayor o igual a la requerida, y si la versión
	 * menor es mayor o igual a la requerida cuando la versión mayor coincide.
	 *
	 * @param params - Parámetros para la verificación
	 * @param params.serverVersion - Versión del servidor PostgreSQL
	 * @param params.majorVersion - Versión mayor mínima requerida
	 * @param params.minorVersion - Versión menor mínima requerida
	 * @returns true si la versión es compatible, false en caso contrario
	 */
	public checkCompatibility(params: {
		serverVersion: ServerVersion;
		majorVersion: number;
		minorVersion: number;
	}): boolean {
		const { serverVersion, majorVersion, minorVersion } = params;

		// Verificar versión mayor
		if (serverVersion.major > majorVersion) {
			return true;
		}

		if (serverVersion.major < majorVersion) {
			return false;
		}

		// Si la versión mayor coincide, verificar versión menor
		return serverVersion.minor >= minorVersion;
	}
}
