/**
 * Utilidades para generar scripts SQL de permisos (GRANT/REVOKE).
 *
 * Genera scripts GRANT y REVOKE para diferentes tipos de objetos.
 *
 * @module core/comparison/services/sql-generator/privilege-generator
 */

/**
 * Definición de privilegios para una tabla.
 *
 * @interface TablePrivileges
 */
export interface TablePrivileges {
	select?: boolean;
	insert?: boolean;
	update?: boolean;
	delete?: boolean;
	truncate?: boolean;
	references?: boolean;
	trigger?: boolean;
}

/**
 * Genera scripts GRANT para todos los privilegios de una tabla.
 *
 * @param tableName - Nombre completo de la tabla (con schema)
 * @param role - Nombre del rol
 * @param privileges - Privilegios a otorgar
 * @returns Script SQL con todos los GRANT
 */
export function generateTableRoleGrantsScript(
	tableName: string,
	role: string,
	privileges: TablePrivileges,
): string {
	const grants: string[] = [];

	if (privileges.select) {
		grants.push(`GRANT SELECT ON TABLE ${tableName} TO ${role};`);
	}
	if (privileges.insert) {
		grants.push(`GRANT INSERT ON TABLE ${tableName} TO ${role};`);
	}
	if (privileges.update) {
		grants.push(`GRANT UPDATE ON TABLE ${tableName} TO ${role};`);
	}
	if (privileges.delete) {
		grants.push(`GRANT DELETE ON TABLE ${tableName} TO ${role};`);
	}
	if (privileges.truncate) {
		grants.push(`GRANT TRUNCATE ON TABLE ${tableName} TO ${role};`);
	}
	if (privileges.references) {
		grants.push(`GRANT REFERENCES ON TABLE ${tableName} TO ${role};`);
	}
	if (privileges.trigger) {
		grants.push(`GRANT TRIGGER ON TABLE ${tableName} TO ${role};`);
	}

	return grants.length > 0 ? grants.join('\n') + '\n' : '';
}

/**
 * Genera scripts GRANT/REVOKE para cambios en privilegios de una tabla.
 *
 * @param tableName - Nombre completo de la tabla (con schema)
 * @param role - Nombre del rol
 * @param changes - Cambios en privilegios (solo los que cambiaron)
 * @returns Script SQL con GRANT/REVOKE según cambios
 */
export function generateChangesTableRoleGrantsScript(
	tableName: string,
	role: string,
	changes: TablePrivileges,
): string {
	const scripts: string[] = [];

	if (Object.prototype.hasOwnProperty.call(changes, 'select')) {
		scripts.push(
			`${changes.select ? 'GRANT' : 'REVOKE'} SELECT ON TABLE ${tableName} ${changes.select ? 'TO' : 'FROM'} ${role}; --WARN: Potential role missing\n`,
		);
	}
	if (Object.prototype.hasOwnProperty.call(changes, 'insert')) {
		scripts.push(
			`${changes.insert ? 'GRANT' : 'REVOKE'} INSERT ON TABLE ${tableName} ${changes.insert ? 'TO' : 'FROM'} ${role}; --WARN: Potential role missing\n`,
		);
	}
	if (Object.prototype.hasOwnProperty.call(changes, 'update')) {
		scripts.push(
			`${changes.update ? 'GRANT' : 'REVOKE'} UPDATE ON TABLE ${tableName} ${changes.update ? 'TO' : 'FROM'} ${role}; --WARN: Potential role missing\n`,
		);
	}
	if (Object.prototype.hasOwnProperty.call(changes, 'delete')) {
		scripts.push(
			`${changes.delete ? 'GRANT' : 'REVOKE'} DELETE ON TABLE ${tableName} ${changes.delete ? 'TO' : 'FROM'} ${role}; --WARN: Potential role missing\n`,
		);
	}
	if (Object.prototype.hasOwnProperty.call(changes, 'truncate')) {
		scripts.push(
			`${changes.truncate ? 'GRANT' : 'REVOKE'} TRUNCATE ON TABLE ${tableName} ${changes.truncate ? 'TO' : 'FROM'} ${role}; --WARN: Potential role missing\n`,
		);
	}
	if (Object.prototype.hasOwnProperty.call(changes, 'references')) {
		scripts.push(
			`${changes.references ? 'GRANT' : 'REVOKE'} REFERENCES ON TABLE ${tableName} ${changes.references ? 'TO' : 'FROM'} ${role}; --WARN: Potential role missing\n`,
		);
	}
	if (Object.prototype.hasOwnProperty.call(changes, 'trigger')) {
		scripts.push(
			`${changes.trigger ? 'GRANT' : 'REVOKE'} TRIGGER ON TABLE ${tableName} ${changes.trigger ? 'TO' : 'FROM'} ${role}; --WARN: Potential role missing\n`,
		);
	}

	return scripts.join('');
}
