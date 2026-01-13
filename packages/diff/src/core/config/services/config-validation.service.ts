/**
 * Servicio de validación de configuración.
 *
 * Proporciona métodos centralizados para validar todos los tipos
 * de configuración usando schemas Zod.
 *
 * @module core/config/services/config-validation
 */

import type {
	Config,
	ClientConfig,
	SchemaCompare,
	MigrationOptions,
	CompareOptions,
	DataCompare,
} from '../../../types/config.types.js';
import {
	ConfigSchema,
	ClientConfigSchema,
	SchemaCompareSchema,
	MigrationOptionsSchema,
	CompareOptionsSchema,
	DataCompareSchema,
} from '../../../types/config.schema.js';

/**
 * Servicio de validación de configuración.
 *
 * Proporciona métodos para validar diferentes tipos de configuración
 * usando schemas Zod, lanzando errores descriptivos si la validación falla.
 *
 * @class ConfigValidationService
 */
export class ConfigValidationService {
	/**
	 * Valida una configuración completa de Config.
	 *
	 * @param config - Configuración a validar
	 * @returns Configuración validada
	 * @throws {Error} Si la configuración es inválida
	 */
	public validateConfig(config: unknown): Config {
		const result = ConfigSchema.safeParse(config);
		if (!result.success) {
			const firstError = result.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid configuration', {
				cause: new TypeError('Configuration validation failed'),
			});
		}
		return result.data;
	}

	/**
	 * Valida una configuración de cliente.
	 *
	 * @param config - Configuración de cliente a validar
	 * @returns Configuración de cliente validada
	 * @throws {Error} Si la configuración es inválida
	 */
	public validateClientConfig(config: unknown): ClientConfig {
		const result = ClientConfigSchema.safeParse(config);
		if (!result.success) {
			const firstError = result.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid client configuration', {
				cause: new TypeError('Client configuration validation failed'),
			});
		}
		return result.data;
	}

	/**
	 * Valida opciones de comparación de esquemas.
	 *
	 * @param config - Configuración de comparación de esquemas a validar
	 * @returns Configuración de comparación de esquemas validada
	 * @throws {Error} Si la configuración es inválida
	 */
	public validateSchemaCompare(config: unknown): SchemaCompare {
		const result = SchemaCompareSchema.safeParse(config);
		if (!result.success) {
			const firstError = result.error.issues[0];
			throw new Error(
				firstError?.message ?? 'Invalid schema compare configuration',
				{
					cause: new TypeError('Schema compare validation failed'),
				},
			);
		}
		return result.data;
	}

	/**
	 * Valida opciones de migración.
	 *
	 * @param config - Opciones de migración a validar
	 * @returns Opciones de migración validadas
	 * @throws {Error} Si la configuración es inválida
	 */
	public validateMigrationOptions(config: unknown): MigrationOptions {
		const result = MigrationOptionsSchema.safeParse(config);
		if (!result.success) {
			const firstError = result.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid migration options', {
				cause: new TypeError('Migration options validation failed'),
			});
		}
		return result.data;
	}

	/**
	 * Valida opciones de comparación.
	 *
	 * @param config - Opciones de comparación a validar
	 * @returns Opciones de comparación validadas
	 * @throws {Error} Si la configuración es inválida
	 */
	public validateCompareOptions(config: unknown): CompareOptions {
		const result = CompareOptionsSchema.safeParse(config);
		if (!result.success) {
			const firstError = result.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid compare options', {
				cause: new TypeError('Compare options validation failed'),
			});
		}
		return result.data;
	}

	/**
	 * Valida opciones de comparación de datos.
	 *
	 * @param config - Opciones de comparación de datos a validar
	 * @returns Opciones de comparación de datos validadas
	 * @throws {Error} Si la configuración es inválida
	 */
	public validateDataCompare(config: unknown): DataCompare {
		const result = DataCompareSchema.safeParse(config);
		if (!result.success) {
			const firstError = result.error.issues[0];
			throw new Error(
				firstError?.message ?? 'Invalid data compare configuration',
				{
					cause: new TypeError('Data compare validation failed'),
				},
			);
		}
		return result.data;
	}
}
