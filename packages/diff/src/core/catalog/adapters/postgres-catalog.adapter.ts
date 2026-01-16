/**
 * Adaptador de catálogo para PostgreSQL usando postgres.js.
 *
 * Implementa CatalogPort consultando information_schema y pg_catalog
 * para recopilar metadatos de objetos de base de datos.
 *
 * @module core/catalog/adapters/postgres-catalog
 */

import type { CatalogPort } from '../ports/catalog.port.js';
import type { DatabasePort } from '../../connection/ports/database.port.js';
import type {
	Schema,
	Table,
	View,
	MaterializedView,
	Function,
	Aggregate,
	Sequence,
	Extension,
	Enum,
	CustomType,
	ForeignKey,
	RLSPolicy,
} from '../domain/entities/index.js';
import type { TableStructure } from '../domain/types/database-objects.types.js';
import type {
	RetrieveSchemasParams,
	RetrieveTablesParams,
	RetrieveViewsParams,
	RetrieveMaterializedViewsParams,
	RetrieveFunctionsParams,
	RetrieveAggregatesParams,
	RetrieveSequencesParams,
	RetrieveExtensionsParams,
	RetrieveEnumsParams,
	RetrieveTypesParams,
	RetrieveForeignKeysParams,
	RetrieveRLSPoliciesParams,
	RetrieveTableStructuresParams,
} from '../domain/types/catalog.types.js';
import {
	Schema as SchemaEntity,
	Table as TableEntity,
	View as ViewEntity,
	MaterializedView as MaterializedViewEntity,
	Function as FunctionEntity,
	Aggregate as AggregateEntity,
	Sequence as SequenceEntity,
	Extension as ExtensionEntity,
	Enum as EnumEntity,
	CustomType as CustomTypeEntity,
	ForeignKey as ForeignKeyEntity,
	RLSPolicy as RLSPolicyEntity,
} from '../domain/entities/index.js';
import {
	RetrieveSchemasParamsSchema,
	RetrieveTablesParamsSchema,
	RetrieveViewsParamsSchema,
	RetrieveMaterializedViewsParamsSchema,
	RetrieveFunctionsParamsSchema,
	RetrieveAggregatesParamsSchema,
	RetrieveSequencesParamsSchema,
	RetrieveExtensionsParamsSchema,
	RetrieveEnumsParamsSchema,
	RetrieveTypesParamsSchema,
	RetrieveForeignKeysParamsSchema,
	RetrieveRLSPoliciesParamsSchema,
	RetrieveTableStructuresParamsSchema,
} from '../domain/schemas/catalog.schema.js';

/**
 * Adaptador de catálogo para PostgreSQL.
 *
 * Implementa CatalogPort consultando information_schema y pg_catalog
 * para recopilar objetos del catálogo de PostgreSQL.
 *
 * @class PostgresCatalogAdapter
 */
export class PostgresCatalogAdapter implements CatalogPort {
	/**
	 * Adaptador de base de datos para ejecutar queries.
	 */
	private readonly databaseAdapter: DatabasePort;

	/**
	 * Crea una nueva instancia de PostgresCatalogAdapter.
	 *
	 * @param params - Parámetros del adaptador
	 * @param params.databaseAdapter - Adaptador de base de datos
	 */
	public constructor(params: { databaseAdapter: DatabasePort }) {
		this.databaseAdapter = params.databaseAdapter;
	}

	/**
	 * Recopila todos los schemas disponibles.
	 *
	 * @param params - Parámetros para recopilar schemas
	 * @returns Promise que resuelve con un Record de schemas indexados por nombre
	 */
	public async retrieveAllSchemas(
		params: RetrieveSchemasParams,
	): Promise<Record<string, Schema>> {
		const validationResult = RetrieveSchemasParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas: requestedSchemas } = params;

		try {
			// Si se especifican schemas, filtrar solo esos; si no, obtener todos excepto los del sistema
			const schemasFilter = requestedSchemas && requestedSchemas.length > 0
				? `AND nspname IN (${requestedSchemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',')})`
				: '';

			const query = `
				SELECT nspname as name
				FROM pg_namespace
				WHERE nspname NOT IN ('pg_catalog', 'information_schema')
				AND nspname NOT LIKE 'pg_toast%'
				AND nspname NOT LIKE 'pg_temp%'
				${schemasFilter}
			`;

			const results = await this.databaseAdapter.query<{ name: string }>({
				connection,
				sql: query,
			});

			const schemas: Record<string, Schema> = {};
			for (const row of results) {
				schemas[row.name] = new SchemaEntity({ name: row.name });
			}

			return schemas;
		} catch (error) {
			throw new Error('Failed to retrieve schemas', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila todas las tablas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar tablas
	 * @returns Promise que resuelve con un Record de tablas indexadas por nombre completo (schema.name)
	 */
	public async retrieveTables(params: RetrieveTablesParams): Promise<Record<string, Table>> {
		const validationResult = RetrieveTablesParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		// Implementación básica - se puede expandir para incluir columnas, constraints, etc.
		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			const query = `
				SELECT
					t.schemaname as schema,
					t.tablename as name,
					'' as columns,
					'' as constraints,
					'' as indexes,
					'' as privileges,
					'' as triggers
				FROM pg_tables t
				WHERE t.schemaname IN (${schemasList})
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				name: string;
				columns: string;
				constraints: string;
				indexes: string;
				privileges: string;
				triggers: string;
			}>({
				connection,
				sql: query,
			});

			const tables: Record<string, Table> = {};
			for (const row of results) {
				const key = `${row.schema}.${row.name}`;
				tables[key] = new TableEntity({
					schema: row.schema,
					name: row.name,
					columns: row.columns,
					constraints: row.constraints,
					indexes: row.indexes,
					privileges: row.privileges,
					triggers: row.triggers,
				});
			}

			return tables;
		} catch (error) {
			throw new Error('Failed to retrieve tables', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila todas las vistas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar vistas
	 * @returns Promise que resuelve con un Record de vistas indexadas por nombre completo (schema.name)
	 */
	public async retrieveViews(params: RetrieveViewsParams): Promise<Record<string, View>> {
		const validationResult = RetrieveViewsParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			const query = `
				SELECT
					table_schema as schema,
					table_name as name,
					view_definition as definition
				FROM information_schema.views
				WHERE table_schema IN (${schemasList})
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				name: string;
				definition: string;
			}>({
				connection,
				sql: query,
			});

			const views: Record<string, View> = {};
			for (const row of results) {
				const key = `${row.schema}.${row.name}`;
				views[key] = new ViewEntity({
					schema: row.schema,
					name: row.name,
					definition: row.definition,
				});
			}

			return views;
		} catch (error) {
			throw new Error('Failed to retrieve views', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila todas las vistas materializadas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar vistas materializadas
	 * @returns Promise que resuelve con un Record de vistas materializadas indexadas por nombre completo (schema.name)
	 */
	public async retrieveMaterializedViews(
		params: RetrieveMaterializedViewsParams,
	): Promise<Record<string, MaterializedView>> {
		const validationResult = RetrieveMaterializedViewsParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			const query = `
				SELECT
					schemaname as schema,
					matviewname as name,
					definition
				FROM pg_matviews
				WHERE schemaname IN (${schemasList})
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				name: string;
				definition: string;
			}>({
				connection,
				sql: query,
			});

			const materializedViews: Record<string, MaterializedView> = {};
			for (const row of results) {
				const key = `${row.schema}.${row.name}`;
				materializedViews[key] = new MaterializedViewEntity({
					schema: row.schema,
					name: row.name,
					definition: row.definition,
				});
			}

			return materializedViews;
		} catch (error) {
			throw new Error('Failed to retrieve materialized views', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila todas las funciones de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar funciones
	 * @returns Promise que resuelve con un Record de funciones indexadas por nombre completo (schema.name)
	 */
	public async retrieveFunctions(
		params: RetrieveFunctionsParams,
	): Promise<Record<string, Function>> {
		const validationResult = RetrieveFunctionsParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			const query = `
				SELECT
					n.nspname as schema,
					p.proname as name,
					pg_get_functiondef(p.oid) as definition,
					l.lanname as language,
					pg_get_function_result(p.oid) as return_type,
					pg_get_function_arguments(p.oid) as parameters
				FROM pg_proc p
				JOIN pg_namespace n ON p.pronamespace = n.oid
				JOIN pg_language l ON p.prolang = l.oid
				WHERE n.nspname IN (${schemasList})
				AND p.prokind = 'f'
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				name: string;
				definition: string;
				language: string;
				return_type: string;
				parameters: string;
			}>({
				connection,
				sql: query,
			});

			const functions: Record<string, Function> = {};
			for (const row of results) {
				const key = `${row.schema}.${row.name}`;
				functions[key] = new FunctionEntity({
					schema: row.schema,
					name: row.name,
					definition: row.definition,
					language: row.language,
					returnType: row.return_type,
					parameters: row.parameters ? [row.parameters] : [],
				});
			}

			return functions;
		} catch (error) {
			throw new Error('Failed to retrieve functions', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila todas las funciones agregadas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar funciones agregadas
	 * @returns Promise que resuelve con un Record de funciones agregadas indexadas por nombre completo (schema.name)
	 */
	public async retrieveAggregates(
		params: RetrieveAggregatesParams,
	): Promise<Record<string, Aggregate>> {
		const validationResult = RetrieveAggregatesParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			// Obtener funciones agregadas
			// pg_get_functiondef() no funciona con funciones agregadas (lanza excepción)
			// Obtener primero los nombres y luego intentar obtener definiciones individualmente
			// o usar un placeholder para las que fallan
			// Excluir agregados nativos del sistema (en pg_catalog) y agregados de extensiones
			const query = `
				SELECT
					n.nspname as schema,
					p.proname as name
				FROM pg_proc p
				JOIN pg_namespace n ON p.pronamespace = n.oid
				JOIN pg_aggregate a ON p.oid = a.aggfnoid
				WHERE n.nspname IN (${schemasList})
				AND p.prokind = 'a'
				AND a.aggkind = 'n'
				AND n.nspname != 'pg_catalog'
				AND p.oid NOT IN (
					SELECT d.objid 
					FROM pg_depend d
					WHERE d.deptype = 'e'
				)
			`;

			// Primero obtener los nombres
			const nameResults = await this.databaseAdapter.query<{
				schema: string;
				name: string;
			}>({
				connection,
				sql: query,
			});

			// pg_get_functiondef() NO funciona con funciones agregadas (lanza excepción)
			// Por lo tanto, solo usamos placeholders para las definiciones
			const aggregates: Record<string, Aggregate> = {};
			
			for (const row of nameResults) {
				// Usar placeholder ya que pg_get_functiondef() no funciona con agregados
				const definition = `CREATE AGGREGATE ${row.schema}.${row.name} (...) -- Definition not available via pg_get_functiondef()`;
				
				const key = `${row.schema}.${row.name}`;
				aggregates[key] = new AggregateEntity({
					schema: row.schema,
					name: row.name,
					definition: definition,
				});
			}

			return aggregates;
		} catch (error) {
			// Si la consulta falla completamente, intentar obtener solo los nombres
			// sin las definiciones para diagnóstico
			try {
				const fallbackQuery = `
					SELECT
						n.nspname as schema,
						p.proname as name
					FROM pg_proc p
					JOIN pg_namespace n ON p.pronamespace = n.oid
					WHERE n.nspname IN (${schemasList})
					AND p.prokind = 'a'
				`;
				
				const fallbackResults = await this.databaseAdapter.query<{
					schema: string;
					name: string;
				}>({
					connection,
					sql: fallbackQuery,
				});

				const errorMessage = error instanceof Error ? error.message : String(error);
				const causeMessage = error instanceof Error && error.cause instanceof Error 
					? error.cause.message 
					: '';
				const aggregatesList = fallbackResults.length > 0 
					? fallbackResults.map(r => `${r.schema}.${r.name}`).join(', ')
					: 'none';
				
				throw new Error(
					`Failed to retrieve aggregate definitions: ${errorMessage}${causeMessage ? `\n   Cause: ${causeMessage}` : ''}\n` +
					`   Found ${fallbackResults.length} aggregate(s): ${aggregatesList}\n` +
					`   This may be due to insufficient permissions or system aggregates that cannot be accessed.`,
					{
						cause: error instanceof Error ? error : new Error(String(error)),
					}
				);
			} catch (fallbackError) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				const causeMessage = error instanceof Error && error.cause instanceof Error 
					? error.cause.message 
					: '';
				
				throw new Error(
					`Failed to retrieve aggregates: ${errorMessage}${causeMessage ? `\n   Cause: ${causeMessage}` : ''}`,
					{
						cause: error instanceof Error ? error : new Error(String(error)),
					}
				);
			}
		}
	}

	/**
	 * Recopila todas las secuencias de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar secuencias
	 * @returns Promise que resuelve con un Record de secuencias indexadas por nombre completo (schema.name)
	 */
	public async retrieveSequences(
		params: RetrieveSequencesParams,
	): Promise<Record<string, Sequence>> {
		const validationResult = RetrieveSequencesParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			// Usar pg_sequences (vista) para obtener last_value y otros valores básicos
			// Hacer JOIN con pg_sequence (tabla del sistema) solo para obtener seqcycle
			// porque pg_sequences no tiene la columna is_cycled/seqcycle
			const query = `
				SELECT
					s.schemaname as schema,
					s.sequencename as name,
					s.last_value as current_value,
					s.increment_by as increment,
					s.min_value::bigint as min,
					s.max_value::bigint as max,
					s.start_value::bigint as start,
					COALESCE(seq.seqcycle, false) as cycle
				FROM pg_sequences s
				JOIN pg_class c ON c.relname = s.sequencename
				JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = s.schemaname
				LEFT JOIN pg_sequence seq ON seq.seqrelid = c.oid
				WHERE s.schemaname IN (${schemasList})
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				name: string;
				current_value: number;
				increment: number;
				min: number;
				max: number;
				start: number;
				cycle: boolean;
			}>({
				connection,
				sql: query,
			});

			const sequences: Record<string, Sequence> = {};
			for (const row of results) {
				const key = `${row.schema}.${row.name}`;
				sequences[key] = new SequenceEntity({
					schema: row.schema,
					name: row.name,
					currentValue: row.current_value,
					increment: row.increment,
					min: row.min,
					max: row.max,
					start: row.start,
					cycle: row.cycle,
				});
			}

			return sequences;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const causeMessage = error instanceof Error && error.cause instanceof Error 
				? error.cause.message 
				: '';
			
			throw new Error(
				`Failed to retrieve sequences: ${errorMessage}${causeMessage ? `\n   Cause: ${causeMessage}` : ''}`,
				{
				cause: error instanceof Error ? error : new Error(String(error)),
				}
			);
		}
	}

	/**
	 * Recopila todas las extensiones instaladas.
	 *
	 * @param params - Parámetros para recopilar extensiones
	 * @returns Promise que resuelve con un Record de extensiones indexadas por nombre
	 */
	public async retrieveExtensions(
		params: RetrieveExtensionsParams,
	): Promise<Record<string, Extension>> {
		const validationResult = RetrieveExtensionsParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection } = params;

		try {
			const query = `
				SELECT
					extname as name,
					extversion as version
				FROM pg_extension
			`;

			const results = await this.databaseAdapter.query<{
				name: string;
				version: string;
			}>({
				connection,
				sql: query,
			});

			const extensions: Record<string, Extension> = {};
			for (const row of results) {
				extensions[row.name] = new ExtensionEntity({
					name: row.name,
					version: row.version,
				});
			}

			return extensions;
		} catch (error) {
			throw new Error('Failed to retrieve extensions', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila todos los tipos ENUM de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar ENUMs
	 * @returns Promise que resuelve con un Record de ENUMs indexados por nombre completo (schema.name)
	 */
	public async retrieveEnums(params: RetrieveEnumsParams): Promise<Record<string, Enum>> {
		const validationResult = RetrieveEnumsParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			const query = `
				SELECT
					n.nspname as schema,
					t.typname as name,
					array_agg(e.enumlabel ORDER BY e.enumsortorder)::text[] as values
				FROM pg_type t
				JOIN pg_enum e ON t.oid = e.enumtypid
				JOIN pg_namespace n ON t.typnamespace = n.oid
				WHERE n.nspname IN (${schemasList})
				GROUP BY n.nspname, t.typname
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				name: string;
				values: string[];
			}>({
				connection,
				sql: query,
			});

			const enums: Record<string, Enum> = {};
			for (const row of results) {
				const key = `${row.schema}.${row.name}`;
				enums[key] = new EnumEntity({
					schema: row.schema,
					name: row.name,
					values: row.values,
				});
			}

			return enums;
		} catch (error) {
			throw new Error('Failed to retrieve enums', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila todos los tipos personalizados de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar tipos personalizados
	 * @returns Promise que resuelve con un Record de tipos personalizados indexados por nombre completo (schema.name)
	 */
	public async retrieveTypes(
		params: RetrieveTypesParams,
	): Promise<Record<string, CustomType>> {
		const validationResult = RetrieveTypesParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			// Solo obtener custom types (domains y composite types que NO son automáticos)
			// Excluir tipos compuestos que se crean automáticamente cuando se crea una tabla, vista o vista materializada
			// Estos tipos se crean automáticamente y no deben migrarse por separado
			const query = `
				SELECT
					n.nspname as schema,
					t.typname as name,
					t.typtype as type,
					t.typcategory as category
				FROM pg_type t
				JOIN pg_namespace n ON t.typnamespace = n.oid
				LEFT JOIN pg_class c ON c.relname = t.typname 
					AND c.relnamespace = n.oid 
					AND c.relkind IN ('r', 'v', 'm')
				WHERE n.nspname IN (${schemasList})
				AND t.typtype IN ('c', 'd')
				AND t.typname NOT LIKE '\\_%'
				-- Excluir tipos compuestos que corresponden a tablas, vistas o vistas materializadas
				-- Solo incluir domains ('d') y composite types sin relación asociada (custom types)
				AND (t.typtype = 'd' OR c.oid IS NULL)
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				name: string;
				type: string;
				category: string;
			}>({
				connection,
				sql: query,
			});

			const types: Record<string, CustomType> = {};
			for (const row of results) {
				const key = `${row.schema}.${row.name}`;
				types[key] = new CustomTypeEntity({
					schema: row.schema,
					name: row.name,
					type: row.type,
					category: row.category,
				});
			}

			return types;
		} catch (error) {
			throw new Error('Failed to retrieve types', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila todas las claves foráneas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar claves foráneas
	 * @returns Promise que resuelve con un Record de claves foráneas indexadas por nombre completo (schema.tableName.name)
	 */
	public async retrieveForeignKeys(
		params: RetrieveForeignKeysParams,
	): Promise<Record<string, ForeignKey>> {
		const validationResult = RetrieveForeignKeysParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			// Consulta completa para obtener toda la información de foreign keys
			const query = `
				SELECT
					tc.table_schema as schema,
					tc.table_name as table_name,
					tc.constraint_name as name,
					rc.unique_constraint_schema as referenced_schema,
					rc.unique_constraint_name as referenced_constraint_name,
					rc.update_rule as on_update,
					rc.delete_rule as on_delete,
					-- Columnas locales de la foreign key
					COALESCE(
						STRING_AGG(
							kcu_local.column_name::text,
							','
							ORDER BY kcu_local.ordinal_position
						),
						''
					) as columns,
					-- Tabla referenciada (obtenida desde unique_constraint)
					COALESCE(
						(
							SELECT DISTINCT tc_ref.table_name
							FROM information_schema.table_constraints tc_ref
							WHERE tc_ref.constraint_schema = rc.unique_constraint_schema
							AND tc_ref.constraint_name = rc.unique_constraint_name
							LIMIT 1
						),
						''
					) as referenced_table,
					-- Columnas referenciadas
					COALESCE(
						STRING_AGG(
							kcu_ref.column_name::text,
							','
							ORDER BY kcu_ref.ordinal_position
						),
						''
					) as referenced_columns
				FROM information_schema.table_constraints tc
				INNER JOIN information_schema.referential_constraints rc
					ON tc.constraint_schema = rc.constraint_schema
					AND tc.constraint_name = rc.constraint_name
				-- Columnas locales
				LEFT JOIN information_schema.key_column_usage kcu_local
					ON tc.constraint_schema = kcu_local.constraint_schema
					AND tc.constraint_name = kcu_local.constraint_name
					AND tc.table_schema = kcu_local.table_schema
					AND tc.table_name = kcu_local.table_name
				-- Columnas referenciadas
				LEFT JOIN information_schema.key_column_usage kcu_ref
					ON rc.unique_constraint_schema = kcu_ref.constraint_schema
					AND rc.unique_constraint_name = kcu_ref.constraint_name
				WHERE tc.constraint_type = 'FOREIGN KEY'
				AND tc.table_schema IN (${schemasList})
				GROUP BY
					tc.table_schema,
					tc.table_name,
					tc.constraint_name,
					rc.unique_constraint_schema,
					rc.unique_constraint_name,
					rc.update_rule,
					rc.delete_rule
				ORDER BY tc.table_schema, tc.table_name, tc.constraint_name
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				table_name: string;
				name: string;
				columns: string;
				referenced_schema: string;
				referenced_table: string;
				referenced_columns: string;
				on_delete: string;
				on_update: string;
			}>({
				connection,
				sql: query,
			});

			const foreignKeys: Record<string, ForeignKey> = {};
			for (const row of results) {
				const key = `${row.schema}.${row.table_name}.${row.name}`;

				// Parsear columnas desde string separado por comas
				const columns = row.columns ? row.columns.split(',').map((c) => c.trim()) : [];
				const referencedColumns = row.referenced_columns
					? row.referenced_columns.split(',').map((c) => c.trim())
					: [];

				foreignKeys[key] = new ForeignKeyEntity({
					schema: row.schema,
					tableName: row.table_name,
					name: row.name,
					columns,
					referencedSchema: row.referenced_schema || '',
					referencedTable: row.referenced_table || '',
					referencedColumns,
					onDelete: row.on_delete || 'NO ACTION',
					onUpdate: row.on_update || 'NO ACTION',
				});
			}

			return foreignKeys;
		} catch (error) {
			throw new Error('Failed to retrieve foreign keys', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila todas las políticas RLS de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar políticas RLS
	 * @returns Promise que resuelve con un Record de políticas RLS indexadas por nombre completo (schema.tableName.name)
	 */
	public async retrieveRLSPolicies(
		params: RetrieveRLSPoliciesParams,
	): Promise<Record<string, RLSPolicy>> {
		const validationResult = RetrieveRLSPoliciesParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			const query = `
				SELECT
					schemaname as schema,
					tablename as table_name,
					policyname as name,
					cmd as command,
					qual as definition,
					roles::text[] as roles
				FROM pg_policies
				WHERE schemaname IN (${schemasList})
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				table_name: string;
				name: string;
				command: string;
				definition: string;
				roles: string[];
			}>({
				connection,
				sql: query,
			});

			const rlsPolicies: Record<string, RLSPolicy> = {};
			for (const row of results) {
				const key = `${row.schema}.${row.table_name}.${row.name}`;
				rlsPolicies[key] = new RLSPolicyEntity({
					schema: row.schema,
					tableName: row.table_name,
					name: row.name,
					command: row.command,
					definition: row.definition || '',
					roles: row.roles || [],
				});
			}

			return rlsPolicies;
		} catch (error) {
			throw new Error('Failed to retrieve RLS policies', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}

	/**
	 * Recopila las estructuras detalladas de las tablas de los schemas especificados.
	 *
	 * @param params - Parámetros para recopilar estructuras de tablas
	 * @returns Promise que resuelve con un Record de estructuras de tablas indexadas por nombre completo (schema.tableName)
	 */
	public async retrieveTableStructures(
		params: RetrieveTableStructuresParams,
	): Promise<Record<string, TableStructure>> {
		const validationResult = RetrieveTableStructuresParamsSchema.safeParse(params);
		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			throw new Error(firstError?.message ?? 'Invalid parameters', {
				cause: new TypeError('Parameter validation failed'),
			});
		}

		const { connection, schemas } = params;
		const schemasList = schemas.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

		try {
			// Query para obtener columnas con información de primary keys
			const query = `
				SELECT
					c.table_schema as schema,
					c.table_name,
					c.column_name,
					c.data_type,
					c.character_maximum_length as max_length,
					c.is_nullable = 'YES' as is_nullable,
					c.column_default as defaultValue,
					c.ordinal_position,
					CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
				FROM information_schema.columns c
				LEFT JOIN (
					SELECT
						ku.table_schema,
						ku.table_name,
						ku.column_name
					FROM information_schema.table_constraints tc
					INNER JOIN information_schema.key_column_usage ku
						ON tc.constraint_name = ku.constraint_name
						AND tc.table_schema = ku.table_schema
					WHERE tc.constraint_type = 'PRIMARY KEY'
						AND tc.table_schema IN (${schemasList})
				) pk ON c.table_schema = pk.table_schema
					AND c.table_name = pk.table_name
					AND c.column_name = pk.column_name
				WHERE c.table_schema IN (${schemasList})
				ORDER BY c.table_schema, c.table_name, c.ordinal_position
			`;

			const results = await this.databaseAdapter.query<{
				schema: string;
				table_name: string;
				column_name: string;
				data_type: string;
				max_length: number | null;
				is_nullable: boolean;
				defaultvalue: string | null;
				ordinal_position: number;
				is_primary_key: boolean;
			}>({
				connection,
				sql: query,
			});

			const structures: Record<string, TableStructure> = {};

			for (const row of results) {
				const key = `${row.schema}.${row.table_name}`;
				if (!structures[key]) {
					structures[key] = {
						schema: row.schema,
						tableName: row.table_name,
						columns: {},
					};
				}

				structures[key]!.columns[row.column_name] = {
					dataType: row.data_type,
					maxLength: row.max_length,
					isNullable: row.is_nullable,
					defaultValue: row.defaultvalue,
					originalDefault: row.defaultvalue,
					ordinalPosition: row.ordinal_position,
					isPrimaryKey: row.is_primary_key,
				};
			}

			return structures;
		} catch (error) {
			throw new Error('Failed to retrieve table structures', {
				cause: error instanceof Error ? error : new Error(String(error)),
			});
		}
	}
}
