/**
 * Entidad de versión del servidor PostgreSQL.
 *
 * Representa la versión del servidor PostgreSQL con formato semántico
 * (major, minor, patch) y proporciona métodos para comparación.
 *
 * @module core/connection/domain/entities/server-version
 */

/**
 * Entidad que representa la versión de un servidor PostgreSQL.
 *
 * Almacena los componentes de versión (major, minor, patch) y proporciona
 * métodos para comparar versiones y obtener representaciones de cadena.
 *
 * @class ServerVersion
 */
export class ServerVersion {
	/**
	 * Versión mayor del servidor (ej: 14 en "14.5.2").
	 */
	public readonly major: number;

	/**
	 * Versión menor del servidor (ej: 5 en "14.5.2").
	 */
	public readonly minor: number;

	/**
	 * Versión de parche del servidor (ej: 2 en "14.5.2").
	 */
	public readonly patch: number;

	/**
	 * Crea una nueva instancia de versión del servidor.
	 *
	 * @param params - Parámetros para crear la versión
	 * @param params.major - Versión mayor
	 * @param params.minor - Versión menor
	 * @param params.patch - Versión de parche
	 */
	public constructor(params: { major: number; minor: number; patch: number }) {
		const { major, minor, patch } = params;

		if (typeof major !== 'number' || isNaN(major) || major < 0) {
			throw new Error('Major version must be a valid non-negative number', {
				cause: new TypeError(`Invalid major version: ${major}`),
			});
		}

		if (typeof minor !== 'number' || isNaN(minor) || minor < 0) {
			throw new Error('Minor version must be a valid non-negative number', {
				cause: new TypeError(`Invalid minor version: ${minor}`),
			});
		}

		if (typeof patch !== 'number' || isNaN(patch) || patch < 0) {
			throw new Error('Patch version must be a valid non-negative number', {
				cause: new TypeError(`Invalid patch version: ${patch}`),
			});
		}

		this.major = major;
		this.minor = minor;
		this.patch = patch;
	}

	/**
	 * Compara esta versión con otra versión.
	 *
	 * Retorna:
	 * - Número negativo si esta versión es menor que la otra
	 * - Cero si las versiones son iguales
	 * - Número positivo si esta versión es mayor que la otra
	 *
	 * @param other - Otra versión con la cual comparar
	 * @returns Resultado de la comparación (-1, 0, o 1)
	 *
	 * @throws {Error} Si other es null o undefined
	 */
	public compare(other: ServerVersion): number {
		if (!other) {
			throw new Error('Other version is required', {
				cause: new TypeError('other cannot be null or undefined'),
			});
		}

		// Comparar major
		if (this.major !== other.major) {
			return this.major - other.major;
		}

		// Comparar minor
		if (this.minor !== other.minor) {
			return this.minor - other.minor;
		}

		// Comparar patch
		return this.patch - other.patch;
	}

	/**
	 * Versión del servidor como cadena (ej: "14.5.2").
	 */
	public get version(): string {
		return this.toString();
	}

	/**
	 * Convierte la versión a una cadena legible.
	 *
	 * @returns Cadena con formato "major.minor.patch" (ej: "14.5.2")
	 */
	public toString(): string {
		return `${this.major}.${this.minor}.${this.patch}`;
	}
}
