/**
 * Utilidades para generar scripts SQL básicos.
 *
 * Genera scripts CREATE básicos para objetos de base de datos.
 * Los scripts ALTER/DROP complejos se implementan en NIVEL 5.
 *
 * @module core/comparison/services/sql-generator
 */

import type {
	TableStructure,
	TableColumnStructure,
} from '../../../catalog/domain/types/database-objects.types.js';

/**
 * Genera script SQL para crear una extensión.
 *
 * @param name - Nombre de la extensión
 * @returns Script SQL
 */
export function generateCreateExtensionScript(name: string): string {
	return `CREATE EXTENSION IF NOT EXISTS "${name}";\n\n`;
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
		return `CREATE SCHEMA IF NOT EXISTS "${name}" AUTHORIZATION ${owner};\n\n`;
	}
	return `CREATE SCHEMA IF NOT EXISTS "${name}";\n\n`;
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
	return `CREATE TYPE ${fullName} AS ENUM (${valuesStr});\n\n`;
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
	return `-- CREATE TYPE ${fullName} ... (type: ${type});\n\n`;
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
\t	${cycleClause};\n\n`;
}

/**
 * Normaliza una definición SQL de vista para comparación.
 * Elimina diferencias de formato que no afectan la semántica.
 *
 * @param definition - Definición SQL a normalizar
 * @returns Definición normalizada
 */
export function normalizeViewDefinition(definition: string): string {
	if (!definition) {
		return '';
	}

	// Normalizar saltos de línea: unificar \r\n, \r, \n a \n
	let normalized = definition.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

	// Dividir en líneas y procesar cada una
	const lines = normalized.split('\n');

	// Trim espacios al inicio/final de cada línea y eliminar líneas vacías múltiples
	const processedLines: string[] = [];
	let lastWasEmpty = false;

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed === '') {
			// Permitir máximo una línea vacía consecutiva
			if (!lastWasEmpty) {
				processedLines.push('');
				lastWasEmpty = true;
			}
		} else {
			processedLines.push(trimmed);
			lastWasEmpty = false;
		}
	}

	// Eliminar líneas vacías al inicio y final
	while (processedLines.length > 0 && processedLines[0] === '') {
		processedLines.shift();
	}
	while (processedLines.length > 0 && processedLines[processedLines.length - 1] === '') {
		processedLines.pop();
	}

	// Unir líneas con \n
	return processedLines.join('\n');
}

/**
 * Normaliza una definición de política RLS para comparación.
 * Elimina espacios en blanco extra y normaliza el formato.
 *
 * @param definition - Definición de la política
 * @returns Definición normalizada
 */
export function normalizeRLSPolicyDefinition(definition: string): string {
	return definition.trim().replace(/\s+/g, ' ');
}

/**
 * Normaliza un array de roles para comparación.
 * Ordena los roles y los convierte a minúsculas para comparación consistente.
 *
 * @param roles - Array de roles
 * @returns Array de roles normalizado y ordenado
 */
export function normalizeRLSPolicyRoles(roles: string[]): string[] {
	return [...roles].map((r) => r.toLowerCase().trim()).sort();
}

/**
 * Genera script SQL para crear una vista.
 *
 * @param schema - Schema de la vista
 * @param name - Nombre de la vista
 * @param definition - Definición de la vista
 * @param useOrReplace - Si es true, usa CREATE OR REPLACE VIEW en lugar de CREATE VIEW
 * @returns Script SQL
 */
export function generateCreateViewScript(
	schema: string,
	name: string,
	definition: string,
	useOrReplace: boolean = false,
): string {
	const fullName = `"${schema}"."${name}"`;
	const orReplace = useOrReplace ? ' OR REPLACE' : '';
	return `CREATE${orReplace} VIEW ${fullName} AS ${definition};\n\n`;
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
	return `CREATE MATERIALIZED VIEW ${fullName} AS ${definition};\n\n`;
}

/**
 * Genera script SQL para crear una función.
 *
 * @param schema - Schema de la función
 * @param name - Nombre de la función
 * @param definition - Definición completa de la función
 * @param useManualCheck - Si es true, usa verificación manual (IF NOT EXISTS) en lugar de CREATE OR REPLACE
 * @returns Script SQL
 */
export function generateCreateFunctionScript(
	schema: string,
	name: string,
	definition: string,
	useManualCheck: boolean = true,
): string {
	// La definición ya viene completa desde pg_get_functiondef
	// Normalizar: eliminar espacios en blanco al final
	let normalizedDefinition = definition.trim();
	
	// Eliminar punto y coma al final si existe (puede estar en línea separada)
	normalizedDefinition = normalizedDefinition.replace(/;\s*$/, '');
	
	// Asegurar que termine con punto y coma en la misma línea
	const lines = normalizedDefinition.split('\n');
	let lastNonEmptyIndex = -1;
	
	// Encontrar la última línea no vacía
	for (let i = lines.length - 1; i >= 0; i--) {
		const line = lines[i];
		if (line && line.trim()) {
			lastNonEmptyIndex = i;
			break;
		}
	}
	
	if (lastNonEmptyIndex >= 0) {
		const lastLineElement = lines[lastNonEmptyIndex];
		if (lastLineElement) {
			const lastLine = lastLineElement.trimEnd();
			// Si la última línea no termina con punto y coma, agregarlo
			if (!lastLine.endsWith(';')) {
				lines[lastNonEmptyIndex] = lastLine + ';';
			}
			normalizedDefinition = lines.join('\n');
		} else {
			// Si no hay líneas no vacías, agregar punto y coma al final
			normalizedDefinition += ';';
		}
	} else {
		// Si no hay líneas no vacías, agregar punto y coma al final
		normalizedDefinition += ';';
	}
	
	// Validar que use CREATE OR REPLACE FUNCTION
	// pg_get_functiondef() ya devuelve CREATE OR REPLACE FUNCTION, pero validamos por seguridad
	if (!normalizedDefinition.match(/^\s*CREATE\s+(OR\s+REPLACE\s+)?FUNCTION/i)) {
		// Si no tiene CREATE FUNCTION, asumimos que viene completo desde pg_get_functiondef
		// y no necesitamos modificarlo, pero esto no debería pasar
	}
	
	// Si se solicita verificación manual, envolver en un bloque DO con verificación
	if (useManualCheck) {
		// Extraer la definición sin CREATE OR REPLACE, solo CREATE FUNCTION
		const functionDefinition = normalizedDefinition.replace(
			/^\s*CREATE\s+OR\s+REPLACE\s+FUNCTION/i,
			'CREATE FUNCTION',
		);
		
		// Construir bloque DO con verificación
		// Nota: Verificamos solo por nombre y schema, ya que verificar por tipos de argumentos
		// requiere acceso a proargtypes que no está disponible fácilmente
		// PostgreSQL permite múltiples funciones con el mismo nombre pero diferentes tipos de argumentos
		return `DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = '${schema}'
        AND p.proname = '${name}'
    ) THEN
        ${functionDefinition.trim()}
    END IF;
END $$;\n\n`;
	}
	
	return `${normalizedDefinition}\n\n`;
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
	return `${definition};\n\n`;
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
 * Genera script SQL completo para crear una tabla usando TableStructure.
 *
 * @param schema - Schema de la tabla
 * @param name - Nombre de la tabla
 * @param tableStructure - Estructura completa de la tabla con columnas
 * @returns Script SQL completo para CREATE TABLE
 */
export function generateCreateTableScript(
	schema: string,
	name: string,
	tableStructure: TableStructure,
): string {
	const fullName = `"${schema}"."${name}"`;
	const parts: string[] = [];

	// Ordenar columnas por ordinalPosition
	const sortedColumns = Object.entries(tableStructure.columns).sort(
		([, a], [, b]) => a.ordinalPosition - b.ordinalPosition,
	);

	// Generar definiciones de columnas
	for (const [columnName, column] of sortedColumns) {
		const columnParts: string[] = [`"${columnName}"`];

		// Tipo de dato
		let dataType = column.dataType.toUpperCase();
		if (column.maxLength !== null && column.maxLength !== undefined) {
			// Para tipos como VARCHAR, CHAR, etc.
			if (['VARCHAR', 'CHAR', 'CHARACTER', 'CHARACTER VARYING'].includes(dataType)) {
				dataType = `${dataType}(${column.maxLength})`;
			}
		}
		columnParts.push(dataType);

		// NULL/NOT NULL
		if (!column.isNullable) {
			columnParts.push('NOT NULL');
		}

		// DEFAULT
		if (column.defaultValue) {
			columnParts.push(`DEFAULT ${column.defaultValue}`);
		}

		parts.push(`\t${columnParts.join(' ')}`);
	}

	// Agregar PRIMARY KEY constraint si hay columnas con isPrimaryKey
	const primaryKeyColumns = sortedColumns
		.filter(([, column]) => column.isPrimaryKey)
		.map(([columnName]) => `"${columnName}"`);

	if (primaryKeyColumns.length > 0) {
		parts.push(`\tPRIMARY KEY (${primaryKeyColumns.join(', ')})`);
	}

	// Construir el SQL completo
	const columnsDefinition = parts.join(',\n');
	return `CREATE TABLE IF NOT EXISTS ${fullName} (\n${columnsDefinition}\n);\n\n`;
}

/**
 * Genera script SQL para agregar una columna a una tabla existente.
 *
 * @param schema - Schema de la tabla
 * @param tableName - Nombre de la tabla
 * @param columnName - Nombre de la columna
 * @param columnStructure - Estructura de la columna
 * @param forceNullable - Si es true, fuerza la columna a ser nullable (para tablas con datos)
 * @param skipDefault - Si es true, omite el DEFAULT (para columnas con FK y default aleatorio)
 * @returns Script SQL
 */
export function generateAddColumnScript(
	schema: string,
	tableName: string,
	columnName: string,
	columnStructure: TableColumnStructure,
	forceNullable?: boolean,
	skipDefault?: boolean,
): string {
	const fullTableName = `"${schema}"."${tableName}"`;
	const parts: string[] = [`"${columnName}"`];

	// Tipo de dato
	let dataType = columnStructure.dataType.toUpperCase();
	if (columnStructure.maxLength !== null && columnStructure.maxLength !== undefined) {
		// Para tipos como VARCHAR, CHAR, etc.
		if (['VARCHAR', 'CHAR', 'CHARACTER', 'CHARACTER VARYING'].includes(dataType)) {
			dataType = `${dataType}(${columnStructure.maxLength})`;
		}
	}
	parts.push(dataType);

	// NULL/NOT NULL
	// Si forceNullable es true, siempre generar como nullable (ignorar isNullable)
	if (forceNullable) {
		// No agregar NOT NULL, la columna será nullable por defecto
	} else if (!columnStructure.isNullable) {
		parts.push('NOT NULL');
	}

	// DEFAULT
	// Si forceNullable o skipDefault es true, omitir DEFAULT para evitar valores inválidos
	// skipDefault se usa cuando la columna tiene una FK y un DEFAULT que genera valores aleatorios
	if (!forceNullable && !skipDefault && columnStructure.defaultValue) {
		parts.push(`DEFAULT ${columnStructure.defaultValue}`);
	}

	const columnDefinition = parts.join(' ');
	return `ALTER TABLE ${fullTableName} ADD COLUMN ${columnDefinition};\n\n`;
}

/**
 * Genera script SQL para eliminar una columna de una tabla existente.
 *
 * @param schema - Schema de la tabla
 * @param tableName - Nombre de la tabla
 * @param columnName - Nombre de la columna
 * @returns Script SQL
 */
export function generateDropColumnScript(schema: string, tableName: string, columnName: string): string {
	const fullTableName = `"${schema}"."${tableName}"`;
	return `ALTER TABLE ${fullTableName} DROP COLUMN IF EXISTS "${columnName}";\n\n`;
}

/**
 * Genera script SQL para cambiar el tipo de dato de una columna.
 *
 * @param schema - Schema de la tabla
 * @param tableName - Nombre de la tabla
 * @param columnName - Nombre de la columna
 * @param newType - Nuevo tipo de dato
 * @param maxLength - Longitud máxima (si aplica)
 * @returns Script SQL
 */
export function generateAlterColumnTypeScript(
	schema: string,
	tableName: string,
	columnName: string,
	newType: string,
	maxLength: number | null,
): string {
	const fullTableName = `"${schema}"."${tableName}"`;
	let dataType = newType.toUpperCase();
	if (maxLength !== null && maxLength !== undefined) {
		// Para tipos como VARCHAR, CHAR, etc.
		if (['VARCHAR', 'CHAR', 'CHARACTER', 'CHARACTER VARYING'].includes(dataType)) {
			dataType = `${dataType}(${maxLength})`;
		}
	}
	// Usar USING clause para conversión de tipos cuando sea necesario
	return `ALTER TABLE ${fullTableName} ALTER COLUMN "${columnName}" TYPE ${dataType} USING "${columnName}"::${dataType};\n\n`;
}

/**
 * Genera script SQL para cambiar la propiedad NULL/NOT NULL de una columna.
 *
 * @param schema - Schema de la tabla
 * @param tableName - Nombre de la tabla
 * @param columnName - Nombre de la columna
 * @param isNullable - Si la columna permite NULL
 * @returns Script SQL
 */
export function generateAlterColumnNullableScript(
	schema: string,
	tableName: string,
	columnName: string,
	isNullable: boolean,
): string {
	const fullTableName = `"${schema}"."${tableName}"`;
	const notNullClause = isNullable ? 'DROP NOT NULL' : 'SET NOT NULL';
	return `ALTER TABLE ${fullTableName} ALTER COLUMN "${columnName}" ${notNullClause};\n\n`;
}

/**
 * Genera script SQL para cambiar el valor por defecto de una columna.
 *
 * @param schema - Schema de la tabla
 * @param tableName - Nombre de la tabla
 * @param columnName - Nombre de la columna
 * @param defaultValue - Nuevo valor por defecto (null para eliminar)
 * @returns Script SQL
 */
export function generateAlterColumnDefaultScript(
	schema: string,
	tableName: string,
	columnName: string,
	defaultValue: string | null,
): string {
	const fullTableName = `"${schema}"."${tableName}"`;
	if (defaultValue === null || defaultValue === undefined) {
		return `ALTER TABLE ${fullTableName} ALTER COLUMN "${columnName}" DROP DEFAULT;\n\n`;
	}
	return `ALTER TABLE ${fullTableName} ALTER COLUMN "${columnName}" SET DEFAULT ${defaultValue};\n\n`;
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
	// PostgreSQL no soporta IF NOT EXISTS con ADD CONSTRAINT, usar DO block para verificar existencia
	const escapedSchema = schema.replace(/'/g, "''");
	const escapedTableName = tableName.replace(/'/g, "''");
	const escapedConstraintName = constraintName.replace(/'/g, "''");
	return `DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = '${escapedSchema}'
        AND t.relname = '${escapedTableName}'
        AND c.conname = '${escapedConstraintName}'
    ) THEN
        ALTER TABLE ${fullTableName} ADD CONSTRAINT "${constraintName}" FOREIGN KEY (${columnsStr}) REFERENCES ${fullReferencedTable} (${referencedColumnsStr})${onDeleteClause}${onUpdateClause};
    END IF;
END $$;\n\n`;
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
 * @param useOrReplace - Si es true, usa CREATE OR REPLACE POLICY en lugar de CREATE POLICY
 * @returns Script SQL
 */
export function generateCreateRLSPolicyScript(
	schema: string,
	tableName: string,
	policyName: string,
	command: string,
	definition: string,
	roles: string[],
	useOrReplace: boolean = false,
): string {
	const fullTableName = `"${schema}"."${tableName}"`;
	const rolesClause = roles.length > 0 ? ` TO ${roles.join(', ')}` : '';
	const orReplace = useOrReplace ? ' OR REPLACE' : '';
	return `CREATE${orReplace} POLICY "${policyName}" ON ${fullTableName} FOR ${command}${rolesClause} USING (${definition});\n\n`;
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
