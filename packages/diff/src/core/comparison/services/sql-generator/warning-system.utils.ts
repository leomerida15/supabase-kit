/**
 * Utilidades para el sistema de advertencias y errores en scripts SQL.
 *
 * Proporciona funciones para agregar comentarios WARN: y ERROR: a scripts
 * cuando se detectan problemas potenciales.
 *
 * @module core/comparison/services/sql-generator/warning-system
 */

/**
 * Tipos de advertencias y errores.
 */
export enum WarningType {
	EXTENSION_NOT_AVAILABLE = 'EXTENSION_NOT_AVAILABLE',
	TYPE_INCOMPATIBLE = 'TYPE_INCOMPATIBLE',
	DEPENDENCY_MISSING = 'DEPENDENCY_MISSING',
	PERMISSION_ISSUE = 'PERMISSION_ISSUE',
	DATA_LOSS_RISK = 'DATA_LOSS_RISK',
	ROLE_MISSING = 'ROLE_MISSING',
}

/**
 * Severidad de la advertencia o error.
 */
export enum Severity {
	WARN = 'WARN',
	ERROR = 'ERROR',
}

/**
 * Advertencia o error a agregar a un script.
 *
 * @interface ScriptWarning
 */
export interface ScriptWarning {
	/**
	 * Tipo de advertencia.
	 */
	type: WarningType;

	/**
	 * Severidad (WARN o ERROR).
	 */
	severity: Severity;

	/**
	 * Mensaje descriptivo.
	 */
	message: string;
}

/**
 * Agrega comentarios de advertencia o error a un script SQL.
 *
 * @param script - Script SQL original
 * @param warnings - Lista de advertencias/errores a agregar
 * @returns Script con comentarios agregados
 */
export function addWarningsToScript(script: string, warnings: ScriptWarning[]): string {
	if (warnings.length === 0) {
		return script;
	}

	const warningComments = warnings.map((warning) => {
		const prefix = warning.severity === Severity.ERROR ? '--ERROR:' : '--WARN:';
		return `${prefix} ${warning.message}`;
	});

	return warningComments.join('\n') + '\n' + script;
}

/**
 * Crea una advertencia para extensión no disponible.
 *
 * @param extensionName - Nombre de la extensión
 * @returns Advertencia
 */
export function createExtensionNotAvailableWarning(extensionName: string): ScriptWarning {
	return {
		type: WarningType.EXTENSION_NOT_AVAILABLE,
		severity: Severity.ERROR,
		message: `The extension "${extensionName}" cannot be installed on target server!`,
	};
}

/**
 * Crea una advertencia para tipo incompatible.
 *
 * @param typeName - Nombre del tipo
 * @param reason - Razón de incompatibilidad
 * @returns Advertencia
 */
export function createTypeIncompatibleWarning(typeName: string, reason: string): ScriptWarning {
	return {
		type: WarningType.TYPE_INCOMPATIBLE,
		severity: Severity.WARN,
		message: `Type "${typeName}" may be incompatible: ${reason}`,
	};
}

/**
 * Crea una advertencia para dependencia faltante.
 *
 * @param objectName - Nombre del objeto
 * @param dependencyName - Nombre de la dependencia faltante
 * @returns Advertencia
 */
export function createDependencyMissingWarning(
	objectName: string,
	dependencyName: string,
): ScriptWarning {
	return {
		type: WarningType.DEPENDENCY_MISSING,
		severity: Severity.ERROR,
		message: `Object "${objectName}" depends on "${dependencyName}" which may not exist in target database`,
	};
}

/**
 * Crea una advertencia para problema de permisos.
 *
 * @param objectName - Nombre del objeto
 * @param reason - Razón del problema
 * @returns Advertencia
 */
export function createPermissionIssueWarning(objectName: string, reason: string): ScriptWarning {
	return {
		type: WarningType.PERMISSION_ISSUE,
		severity: Severity.WARN,
		message: `Permission issue for "${objectName}": ${reason}`,
	};
}

/**
 * Crea una advertencia para riesgo de pérdida de datos.
 *
 * @param objectName - Nombre del objeto
 * @param operation - Operación que puede causar pérdida de datos
 * @returns Advertencia
 */
export function createDataLossRiskWarning(objectName: string, operation: string): ScriptWarning {
	return {
		type: WarningType.DATA_LOSS_RISK,
		severity: Severity.WARN,
		message: `${operation} on "${objectName}" can occur in data loss!`,
	};
}

/**
 * Crea una advertencia para rol faltante.
 *
 * @param roleName - Nombre del rol
 * @returns Advertencia
 */
export function createRoleMissingWarning(roleName: string): ScriptWarning {
	return {
		type: WarningType.ROLE_MISSING,
		severity: Severity.WARN,
		message: `Potential role missing: "${roleName}"`,
	};
}
