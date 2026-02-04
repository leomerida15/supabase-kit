/**
 * Clase principal para comparación y migración de esquemas PostgreSQL.
 *
 * Orquesta todos los servicios necesarios para comparar bases de datos
 * y ejecutar migraciones de patches SQL.
 *
 * @module pg-diff
 */

import type { Config } from './types/config.types.js';
import type { PatchInfo } from './core/migration/domain/types/migration.types.js';
import { BunDatabaseAdapter } from './core/connection/adapters/bun-database.adapter.js';
import { ConnectionService } from './core/connection/services/connection.service.js';
import { PostgresCatalogAdapter } from './core/catalog/adapters/postgres-catalog.adapter.js';
import { CatalogService } from './core/catalog/services/catalog.service.js';
import { ObjectComparisonService } from './core/comparison/services/object-comparison.service.js';
import { PatchFileService } from './core/patch/services/patch-file.service.js';
import { MigrationService } from './core/migration/services/migration.service.js';
import { EventEmitterAdapter } from './core/events/adapters/event-emitter.adapter.js';
import type { EventEmitterPort } from './core/events/ports/event-emitter.port.js';

// Type assertion helper para acceder al método emit
type EventEmitterWithEmit = EventEmitterPort & {
	emit(params: { event: string; message: string; progress?: number }): void;
};

/**
 * Clase principal para comparación y migración de PostgreSQL.
 *
 * Proporciona una interfaz de alto nivel para:
 * - Comparar esquemas entre bases de datos source y target
 * - Generar archivos patch SQL con las diferencias
 * - Ejecutar migraciones de patches pendientes
 *
 * @class PgDiff
 */
export class PgDiff {
	/**
	 * Configuración del sistema.
	 */
	private readonly config: Config;

	/**
	 * Adaptador de base de datos.
	 */
	private readonly databaseAdapter: BunDatabaseAdapter;

	/**
	 * Servicio de conexión.
	 */
	private readonly connectionService: ConnectionService;

	/**
	 * Adaptador de catálogo.
	 */
	private readonly catalogAdapter: PostgresCatalogAdapter;

	/**
	 * Servicio de catálogo.
	 */
	private readonly catalogService: CatalogService;

	/**
	 * Servicio de comparación de objetos.
	 */
	private readonly objectComparisonService: ObjectComparisonService;

	/**
	 * Servicio de archivos patch.
	 */
	private readonly patchFileService: PatchFileService;

	/**
	 * Servicio de migración.
	 */
	private readonly migrationService: MigrationService;

	/**
	 * Emisor de eventos.
	 */
	public readonly events: EventEmitterWithEmit;

	/**
	 * Crea una nueva instancia de PgDiff.
	 *
	 * @param params - Parámetros de inicialización
	 * @param params.config - Configuración completa del sistema
	 */
	public constructor(params: { config: Config }) {
		this.config = params.config;

		// Inicializar adaptadores
		this.databaseAdapter = new BunDatabaseAdapter();
		this.connectionService = new ConnectionService({ databaseAdapter: this.databaseAdapter });

		// Inicializar catálogo
		this.catalogAdapter = new PostgresCatalogAdapter({ databaseAdapter: this.databaseAdapter });
		this.catalogService = new CatalogService({ catalogAdapter: this.catalogAdapter });

		// Inicializar comparación
		this.objectComparisonService = new ObjectComparisonService();

		// Inicializar patch
		this.patchFileService = new PatchFileService();

		// Inicializar eventos
		const eventEmitter = new EventEmitterAdapter();
		this.events = eventEmitter as EventEmitterWithEmit;

		// Inicializar migración
		this.migrationService = new MigrationService({
			databaseAdapter: this.databaseAdapter,
			connectionService: this.connectionService,
			eventEmitter: eventEmitter,
		});
	}

	/**
	 * Compara las bases de datos source y target, generando un archivo patch SQL.
	 *
	 * @param params - Parámetros para la comparación
	 * @param params.scriptName - Nombre del script (sin extensión)
	 * @returns Promise que resuelve con la ruta del archivo patch generado
	 * @throws {Error} Si hay errores durante la comparación
	 */
	public async compare(params: { scriptName: string }): Promise<string> {
		const { scriptName } = params;

		this.events.emit({ event: 'compare', message: 'Starting database comparison...', progress: 0 });

		// Conectar a source
		this.events.emit({ event: 'compare', message: 'Connecting to source database...', progress: 5 });
		const sourceConnection = await this.connectionService.createConnection({
			config: this.config.sourceClient,
		});

		// Conectar a target
		this.events.emit({ event: 'compare', message: 'Connecting to target database...', progress: 10 });
		const targetConnection = await this.connectionService.createConnection({
			config: this.config.targetClient,
		});

		try {
			// Obtener versión del servidor source
			const sourceVersion = await this.databaseAdapter.getServerVersion({ connection: sourceConnection });
			this.events.emit({
				event: 'compare',
				message: `Connected to source: PostgreSQL ${sourceVersion.toString()} on [${this.config.sourceClient.host}:${this.config.sourceClient.port}/${this.config.sourceClient.database}]`,
				progress: 15,
			});

			// Obtener versión del servidor target
			const targetVersion = await this.databaseAdapter.getServerVersion({ connection: targetConnection });
			this.events.emit({
				event: 'compare',
				message: `Connected to target: PostgreSQL ${targetVersion.toString()} on [${this.config.targetClient.host}:${this.config.targetClient.port}/${this.config.targetClient.database}]`,
				progress: 20,
			});

			// Recopilar objetos del catálogo source
			this.events.emit({ event: 'analyze', message: 'Collecting objects from source database...', progress: 25 });
			const sourceObjects = await this.catalogService.collectAllObjects({
				connection: sourceConnection,
				schemas: this.config.compareOptions.schemaCompare.namespaces.length > 0
					? this.config.compareOptions.schemaCompare.namespaces
					: undefined,
			});
			this.events.emit({ event: 'analyze', message: `Collected ${Object.keys(sourceObjects.tables || {}).length} tables from source`, progress: 40 });
			const sourceFkCount = Object.keys(sourceObjects.foreignKeys || {}).length;
			this.events.emit({
				event: 'analyze',
				message: `Source: ${sourceFkCount} foreign key(s)`,
				progress: 41,
			});
			const fkByTable: Record<string, number> = {};
			for (const key of Object.keys(sourceObjects.foreignKeys || {})) {
				const parts = key.split('.');
				if (parts.length >= 2) {
					const tableKey = `${parts[0]}.${parts[1]}`;
					fkByTable[tableKey] = (fkByTable[tableKey] ?? 0) + 1;
				}
			}
			const relationTableKey = 'public.form_case_two_target_population_relation';
			if (fkByTable[relationTableKey] !== undefined) {
				this.events.emit({
					event: 'analyze',
					message: `Source: table ${relationTableKey} has ${fkByTable[relationTableKey]} FK(s)`,
					progress: 42,
				});
			}

			// Recopilar objetos del catálogo target
			this.events.emit({ event: 'analyze', message: 'Collecting objects from target database...', progress: 45 });
			const targetObjects = await this.catalogService.collectAllObjects({
				connection: targetConnection,
				schemas: this.config.compareOptions.schemaCompare.namespaces.length > 0
					? this.config.compareOptions.schemaCompare.namespaces
					: undefined,
			});
			this.events.emit({ event: 'analyze', message: `Collected ${Object.keys(targetObjects.tables || {}).length} tables from target`, progress: 60 });

			// Verificar qué tablas target tienen datos usando una única query optimizada
			const targetTableHasData: Record<string, boolean> = {};
			if (targetObjects.tables && Object.keys(targetObjects.tables).length > 0) {
				try {
					const schemasList = this.config.compareOptions.schemaCompare.namespaces.length > 0
						? this.config.compareOptions.schemaCompare.namespaces
						: Object.keys(targetObjects.schemas || {});
					const schemasStr = schemasList.map((s) => `'${s.replace(/'/g, "''")}'`).join(',');

					// Actualizar estadísticas antes de consultar reltuples para asegurar datos precisos
					// ANALYZE actualiza reltuples automáticamente y funciona con pool de conexiones
					this.events.emit({
						event: 'analyze',
						message: 'Updating table statistics (ANALYZE)...',
						progress: 58,
					});

					for (const schema of schemasList) {
						try {
							await this.databaseAdapter.query({
								connection: targetConnection,
								sql: `ANALYZE "${schema.replace(/"/g, '""')}";`,
							});
						} catch (analyzeError) {
							// Si falla ANALYZE en un schema, continuar con los demás
							// Puede fallar por permisos, pero no es crítico - usaremos estadísticas existentes
							this.events.emit({
								event: 'analyze',
								message: `Warning: ANALYZE failed for schema "${schema}", using existing statistics`,
								progress: 59,
							});
						}
					}

					// Query optimizada usando pg_class.reltuples (estadísticas del sistema)
					// reltuples > 0 indica que hay datos (ahora actualizado con ANALYZE ejecutado arriba)
					// reltuples = -1 indica que nunca se ha analizado, requiere verificación adicional
					const hasDataQuery = `
						SELECT 
							n.nspname as schema,
							c.relname as table_name,
							c.reltuples,
							CASE 
								WHEN c.reltuples = -1 THEN NULL  -- Requiere verificación adicional
								WHEN COALESCE(c.reltuples, 0) > 0 THEN true
								ELSE false
							END as has_data
						FROM pg_class c
						JOIN pg_namespace n ON c.relnamespace = n.oid
						WHERE c.relkind = 'r'  -- solo tablas regulares
							AND n.nspname IN (${schemasStr})
					`;

					const results = await this.databaseAdapter.query<{
						schema: string;
						table_name: string;
						reltuples: number;
						has_data: boolean | null;
					}>({
						connection: targetConnection,
						sql: hasDataQuery,
					});

					// Construir mapa con formato schema.table como clave
					// Para tablas con reltuples = -1, hacer verificación adicional con EXISTS
					for (const row of results) {
						const tableKey = `${row.schema}.${row.table_name}`;
						
						if (row.has_data === null) {
							// reltuples = -1, verificar con EXISTS (muy rápido, se detiene en primera fila)
							try {
								const existsQuery = `SELECT EXISTS (SELECT 1 FROM "${row.schema}"."${row.table_name}" LIMIT 1) as has_data`;
								const existsResult = await this.databaseAdapter.query<{ has_data: boolean }>({
									connection: targetConnection,
									sql: existsQuery,
								});
								targetTableHasData[tableKey] = existsResult[0]?.has_data || false;
							} catch {
								// Si falla, asumir que no hay datos por seguridad
								targetTableHasData[tableKey] = false;
							}
						} else {
							targetTableHasData[tableKey] = row.has_data;
						}
					}

					this.events.emit({
						event: 'analyze',
						message: `Checked data existence for ${Object.keys(targetTableHasData).length} tables`,
						progress: 60,
					});
				} catch (error) {
					// Si falla la consulta, asumir que no hay datos para evitar romper el flujo
					// Esto puede pasar si no hay permisos o si las tablas no existen aún
					this.events.emit({
						event: 'analyze',
						message: 'Warning: Could not check table data, assuming empty tables',
						progress: 60,
					});
				}
			}

			// Comparar objetos
			this.events.emit({ event: 'compare', message: 'Comparing database objects...', progress: 65 });
			const sqlScripts = this.objectComparisonService.compareDatabaseObjects({
				sourceObjects,
				targetObjects,
				config: this.config.compareOptions.schemaCompare,
				targetTableHasData,
			});
			this.events.emit({ event: 'compare', message: `Generated ${sqlScripts.length} SQL scripts`, progress: 80 });

			// Guardar patch
			this.events.emit({ event: 'compare', message: 'Saving patch file...', progress: 85 });
			const patchFilePath = await this.patchFileService.savePatch({
				scriptLines: sqlScripts,
				config: this.config.compareOptions,
				scriptName,
			});

			if (!patchFilePath) {
				this.events.emit({ event: 'compare', message: 'No differences found, patch file not created', progress: 100 });
				throw new Error('No differences found between source and target databases');
			}

			this.events.emit({ event: 'compare', message: `Patch file saved: ${patchFilePath}`, progress: 100 });

			return patchFilePath;
		} finally {
			// Cerrar conexiones
			await this.databaseAdapter.close({ connection: sourceConnection });
			await this.databaseAdapter.close({ connection: targetConnection });
		}
	}

	/**
	 * Ejecuta las migraciones de patches pendientes.
	 *
	 * @param params - Parámetros para la migración
	 * @param params.force - Si es true, fuerza la ejecución de patches con errores previos
	 * @param params.toSourceClient - Si es true, ejecuta en la base de datos source en lugar de target
	 * @returns Promise que resuelve con la lista de patches aplicados
	 * @throws {Error} Si hay errores durante la migración
	 */
	public async migrate(params: {
		force?: boolean;
		toSourceClient?: boolean;
	}): Promise<PatchInfo[]> {
		const { force = false, toSourceClient = false } = params;

		return await this.migrationService.migrate({
			config: this.config,
			force,
			toSourceClient,
		});
	}
}
