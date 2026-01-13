/**
 * Utilidades para generar scripts SQL básicos.
 *
 * Genera scripts CREATE básicos para objetos de base de datos.
 * Los scripts ALTER/DROP complejos se implementan en NIVEL 5.
 *
 * @module core/comparison/services/sql-generator
 */

/**
 * Genera script SQL para crear una extensión.
 *
 * @param name - Nombre de la extensión
 * @returns Script SQL
 */
export function generateCreateExtensionScript(name: string): string {
	return `CREATE EXTENSION IF NOT EXISTS "${name}";\n`;
}

/**
 * Genera script SQL para crear un schema.
 *
 * @param name - Nombre del schema
 * @param owner - Propietario del schema (opcional)
 * @returns Script SQL
 */
export function generateCreateSchemaScript(name: string, owner?: string): string {
	if (owner) {
		return `CREATE SCHEMA IF NOT EXISTS "${name}" AUTHORIZATION ${owner};\n`;
	}
	return `CREATE SCHEMA IF NOT EXISTS "${name}";\n`;
}

/**
 * Genera script SQL para crear un tipo ENUM.
 *
 * @param schema - Schema del ENUM
 * @param name - Nombre del ENUM
 * @param values - Valores del ENUM
 * @returns Script SQL
 */
export function generateCreateEnumScript(schema: string, name: string, values: string[]): string {
	const valuesStr = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(', ');
	const fullName = `"${schema}"."${name}"`;
	return `CREATE TYPE ${fullName} AS ENUM (${valuesStr});\n`;
}

/**
 * Genera script SQL para crear un tipo personalizado.
 *
 * @param schema - Schema del tipo
 * @param name - Nombre del tipo
 * @param type - Tipo de dato (category)
 * @returns Script SQL
 */
export function generateCreateTypeScript(schema: string, name: string, type: string): string {
	const fullName = `"${schema}"."${name}"`;
	// Para tipos básicos, se crea como dominio o tipo compuesto según la categoría
	// Por ahora, generamos un script básico que deberá ser completado según el tipo
	return `-- CREATE TYPE ${fullName} ... (type: ${type});\n`;
}

/**
 * Genera script SQL para crear una secuencia.
 *
 * @param schema - Schema de la secuencia
 * @param name - Nombre de la secuencia
 * @param increment - Incremento de la secuencia
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @param start - Valor inicial
 * @param cycle - Si la secuencia debe hacer ciclo
 * @returns Script SQL
 */
export function generateCreateSequenceScript(
	schema: string,
	name: string,
	increment: number,
	min: number,
	max: number,
	start: number,
	cycle: boolean,
): string {
	const fullName = `"${schema}"."${name}"`;
	const cycleClause = cycle ? 'CYCLE' : 'NO CYCLE';
	return `CREATE SEQUENCE IF NOT EXISTS ${fullName}
\tINCREMENT BY ${increment}
\tMINVALUE ${min}
\tMAXVALUE ${max}
\tSTART WITH ${start}
\t${cycleClause};\n`;
}

/**
 * Genera script SQL para crear una vista.
 *
 * @param schema - Schema de la vista
 * @param name - Nombre de la vista
 * @param definition - Definición de la vista
 * @returns Script SQL
 */
export function generateCreateViewScript(schema: string, name: string, definition: string): string {
	const fullName = `"${schema}"."${name}"`;
	return `CREATE VIEW ${fullName} AS ${definition};\n`;
}

/**
 * Genera script SQL para crear una vista materializada.
 *
 * @param schema - Schema de la vista materializada
 * @param name - Nombre de la vista materializada
 * @param definition - Definición de la vista materializada
 * @returns Script SQL
 */
export function generateCreateMaterializedViewScript(
	schema: string,
	name: string,
	definition: string,
): string {
	const fullName = `"${schema}"."${name}"`;
	return `CREATE MATERIALIZED VIEW ${fullName} AS ${definition};\n`;
}

/**
 * Genera script SQL para crear una función.
 *
 * @param schema - Schema de la función
 * @param name - Nombre de la función
 * @param definition - Definición completa de la función
 * @returns Script SQL
 */
export function generateCreateFunctionScript(schema: string, name: string, definition: string): string {
	// La definición ya viene completa desde pg_get_functiondef
	return `${definition};\n`;
}

/**
 * Genera script SQL para crear un agregado.
 *
 * @param schema - Schema del agregado
 * @param name - Nombre del agregado
 * @param definition - Definición completa del agregado
 * @returns Script SQL
 */
export function generateCreateAggregateScript(schema: string, name: string, definition: string): string {
	// La definición ya viene completa
	return `${definition};\n`;
}

/**
 * Genera script SQL para crear una tabla (estructura básica).
 *
 * @param schema - Schema de la tabla
 * @param name - Nombre de la tabla
 * @returns Script SQL básico
 */
export function generateCreateTableScriptBasic(schema: string, name: string): string {
	const fullName = `"${schema}"."${name}"`;
	// Para NIVEL 3, solo generamos la estructura básica
	// La definición completa se implementa en NIVEL 5
	return `-- CREATE TABLE ${fullName} (...);\n`;
}

/**
 * Genera script SQL para agregar una clave foránea.
 *
 * @param schema - Schema de la tabla
 * @param tableName - Nombre de la tabla
 * @param constraintName - Nombre de la constraint
 * @param columns - Columnas locales
 * @param referencedSchema - Schema de la tabla referenciada
 * @param referencedTable - Tabla referenciada
 * @param referencedColumns - Columnas referenciadas
 * @param onDelete - Acción ON DELETE
 * @param onUpdate - Acción ON UPDATE
 * @returns Script SQL
 */
export function generateCreateForeignKeyScript(
	schema: string,
	tableName: string,
	constraintName: string,
	columns: string[],
	referencedSchema: string,
	referencedTable: string,
	referencedColumns: string[],
	onDelete: string,
	onUpdate: string,
): string {
	const fullTableName = `"${schema}"."${tableName}"`;
	const fullReferencedTable = `"${referencedSchema}"."${referencedTable}"`;
	const columnsStr = columns.map((c) => `"${c}"`).join(', ');
	const referencedColumnsStr = referencedColumns.map((c) => `"${c}"`).join(', ');
	const onDeleteClause = onDelete ? ` ON DELETE ${onDelete}` : '';
	const onUpdateClause = onUpdate ? ` ON UPDATE ${onUpdate}` : '';
	return `ALTER TABLE ${fullTableName} ADD CONSTRAINT "${constraintName}" FOREIGN KEY (${columnsStr}) REFERENCES ${fullReferencedTable} (${referencedColumnsStr})${onDeleteClause}${onUpdateClause};\n`;
}

/**
 * Genera script SQL para crear una política RLS.
 *
 * @param schema - Schema de la tabla
 * @param tableName - Nombre de la tabla
 * @param policyName - Nombre de la política
 * @param command - Comando de la política (SELECT, INSERT, UPDATE, DELETE, ALL)
 * @param definition - Definición de la política
 * @param roles - Roles a los que aplica la política
 * @returns Script SQL
 */
export function generateCreateRLSPolicyScript(
	schema: string,
	tableName: string,
	policyName: string,
	command: string,
	definition: string,
	roles: string[],
): string {
	const fullTableName = `"${schema}"."${tableName}"`;
	const rolesClause = roles.length > 0 ? ` TO ${roles.join(', ')}` : '';
	return `CREATE POLICY "${policyName}" ON ${fullTableName} FOR ${command}${rolesClause} USING (${definition});\n`;
}

/**
 * Genera script SQL para crear un trigger.
 *
 * @param schema - Schema de la tabla
 * @param tableName - Nombre de la tabla
 * @param definition - Definición completa del trigger
 * @returns Script SQL
 */
export function generateCreateTriggerScript(schema: string, tableName: string, definition: string): string {
	// La definición ya viene completa
	return `${definition};\n`;
}

/**
 * Genera script SQL para eliminar una tabla.
 *
 * @param schema - Schema de la tabla
 * @param name - Nombre de la tabla
 * @returns Script SQL
 */
export function generateDropTableScript(schema: string, name: string): string {
	const fullName = `"${schema}"."${name}"`;
	return `DROP TABLE IF EXISTS ${fullName}; --WARN: Drop table can occur in data loss!\n`;
}

/**
 * Genera script SQL para eliminar una vista.
 *
 * @param schema - Schema de la vista
 * @param name - Nombre de la vista
 * @returns Script SQL
 */
export function generateDropViewScript(schema: string, name: string): string {
	const fullName = `"${schema}"."${name}"`;
	return `DROP VIEW IF EXISTS ${fullName};\n`;
}

/**
 * Genera script SQL para eliminar una vista materializada.
 *
 * @param schema - Schema de la vista materializada
 * @param name - Nombre de la vista materializada
 * @returns Script SQL
 */
export function generateDropMaterializedViewScript(schema: string, name: string): string {
	const fullName = `"${schema}"."${name}"`;
	return `DROP MATERIALIZED VIEW IF EXISTS ${fullName};\n`;
}

/**
 * Genera script SQL para eliminar una función.
 *
 * @param schema - Schema de la función
 * @param name - Nombre de la función
 * @param argTypes - Tipos de argumentos (opcional)
 * @returns Script SQL
 */
export function generateDropFunctionScript(schema: string, name: string, argTypes?: string): string {
	const fullName = `"${schema}"."${name}"`;
	const args = argTypes ? `(${argTypes})` : '';
	return `DROP FUNCTION IF EXISTS ${fullName}${args};\n`;
}

/**
 * Genera script SQL para eliminar un agregado.
 *
 * @param schema - Schema del agregado
 * @param name - Nombre del agregado
 * @param argTypes - Tipos de argumentos (opcional)
 * @returns Script SQL
 */
export function generateDropAggregateScript(schema: string, name: string, argTypes?: string): string {
	const fullName = `"${schema}"."${name}"`;
	const args = argTypes ? `(${argTypes})` : '';
	return `DROP AGGREGATE IF EXISTS ${fullName}${args};\n`;
}

/**
 * Genera script SQL para eliminar una política RLS.
 *
 * @param schema - Schema de la tabla
 * @param tableName - Nombre de la tabla
 * @param policyName - Nombre de la política
 * @returns Script SQL
 */
export function generateDropRLSPolicyScript(schema: string, tableName: string, policyName: string): string {
	const fullTableName = `"${schema}"."${tableName}"`;
	return `DROP POLICY IF EXISTS "${policyName}" ON ${fullTableName};\n`;
}
