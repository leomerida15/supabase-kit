/**
 * Servicio principal de migración.
 *
 * Orquesta el proceso completo de migración de patches SQL,
 * integrando todos los servicios de migración.
 *
 * @module core/migration/services/migration
 */

import type { DatabasePort } from '../../connection/ports/database.port.js';
import type { ConnectionService } from '../../connection/services/connection.service.js';
import type { EventEmitterPort } from '../../events/ports/event-emitter.port.js';
import type { Config, ClientConfig } from '../../../types/config.types.js';
import type { PatchInfo, MigrationConfig, PatchStatus } from '../domain/types/migration.types.js';
import { PatchStatus as PatchStatusEnum } from '../domain/types/migration.types.js';
import { MigrationHistoryService } from './migration-history.service.js';
import { PatchReaderService } from './patch-reader.service.js';
import { PatchExecutorService } from './patch-executor.service.js';
import { resolve } from 'path';

/**
 * Parámetros para ejecutar migración.
 *
 * @interface MigrateParams
 */
export interface MigrateParams {
	/**
	 * Configuración completa del sistema.
	 */
	config: Config;

	/**
	 * Si es true, fuerza la ejecución de patches con errores previos.
	 */
	force?: boolean;

	/**
	 * Si es true, ejecuta patches en la base de datos source en lugar de target.
	 */
	toSourceClient?: boolean;
}

/**
 * Servicio principal de migración.
 *
 * @class MigrationService
 */
export class MigrationService {
	/**
	 * Adaptador de base de datos.
	 */
	private readonly databaseAdapter: DatabasePort;

	/**
	 * Servicio de conexión.
	 */
	private readonly connectionService: ConnectionService;

	/**
	 * Adaptador de eventos.
	 */
	private readonly eventEmitter: EventEmitterPort;

	/**
	 * Servicio de historial de migraciones.
	 */
	private readonly historyService: MigrationHistoryService;

	/**
	 * Servicio de lectura de patches.
	 */
	private readonly patchReader: PatchReaderService;

	/**
	 * Servicio de ejecución de patches.
	 */
	private readonly patchExecutor: PatchExecutorService;

	/**
	 * Crea una nueva instancia de MigrationService.
	 *
	 * @param params - Parámetros del servicio
	 */
	public constructor(params: {
		databaseAdapter: DatabasePort;
		connectionService: ConnectionService;
		eventEmitter: EventEmitterPort;
	}) {
		this.databaseAdapter = params.databaseAdapter;
		this.connectionService = params.connectionService;
		this.eventEmitter = params.eventEmitter;
		this.historyService = new MigrationHistoryService({
			databaseAdapter: this.databaseAdapter,
		});
		this.patchReader = new PatchReaderService();
		this.patchExecutor = new PatchExecutorService({
			databaseAdapter: this.databaseAdapter,
		});
	}

	/**
	 * Prepara la configuración de migración desde la configuración completa.
	 *
	 * @param config - Configuración completa
	 * @returns Configuración de migración preparada
	 */
	private prepareMigrationConfig(config: Config): MigrationConfig {
		if (!config.migrationOptions.patchesDirectory) {
			throw new Error('Missing configuration property "patchesDirectory"!');
		}

		const patchesDirectory = resolve(
			config.migrationOptions.patchesDirectory.startsWith('/')
				? config.migrationOptions.patchesDirectory
				: process.cwd(),
			config.migrationOptions.patchesDirectory,
		);

		const clientConfig = config.targetClient;
		const tableName = config.migrationOptions.historyTableName;
		const tableSchema = config.migrationOptions.historyTableSchema;

		return {
			patchesDirectory,
			migrationHistory: {
				tableName,
				tableSchema,
				fullTableName: `"${tableSchema}"."${tableName}"`,
				primaryKeyName: `"${tableName}_pkey"`,
				tableOwner: clientConfig.user || 'postgres',
			},
		};
	}

	/**
	 * Ejecuta el proceso completo de migración.
	 *
	 * @param params - Parámetros para ejecutar la migración
	 * @returns Lista de patches procesados
	 */
	public async migrate(params: MigrateParams): Promise<PatchInfo[]> {
		const { config, force = false, toSourceClient = false } = params;

		this.eventEmitter.emit({ event: 'migrate', message: 'Migration started', progress: 0 });

		// Preparar configuración
		const migrationConfig = this.prepareMigrationConfig(config);

		// Seleccionar cliente (source o target)
		const clientConfig: ClientConfig = toSourceClient ? config.sourceClient : config.targetClient;

		this.eventEmitter.emit({ event: 'migrate', message: 'Connecting to database ...', progress: 20 });

		// Crear conexión
		const connection = await this.connectionService.createConnection({ config: clientConfig });

		try {
			// Obtener versión del servidor
			const serverVersion = await this.databaseAdapter.getServerVersion({ connection });
			this.eventEmitter.emit({
				event: 'migrate',
				message: `Connected to PostgreSQL ${serverVersion.version} on [${clientConfig.host}:${clientConfig.port}/${clientConfig.database}]`,
				progress: 25,
			});

			// Preparar tabla de historial
			this.eventEmitter.emit({ event: 'migrate', message: 'Preparing migration history table ...', progress: 30 });
			await this.historyService.prepareHistoryTable({
				connection,
				config: migrationConfig,
			});
			this.eventEmitter.emit({ event: 'migrate', message: 'Migration history table has been prepared', progress: 35 });

			// Leer archivos patch
			this.eventEmitter.emit({ event: 'migrate', message: 'Collecting patches ...', progress: 40 });
			const patchFiles = await this.patchReader.readPatchFiles(migrationConfig.patchesDirectory);
			this.eventEmitter.emit({ event: 'migrate', message: 'Patches collected', progress: 45 });

			if (patchFiles.length <= 0) {
				this.eventEmitter.emit({ event: 'migrate', message: 'The patch folder is empty', progress: 100 });
				return [];
			}

			const result: PatchInfo[] = [];
			const progressStep = 50 / patchFiles.length / 3;
			let progressValue = 50;

			// Procesar cada patch
			for (const patchFileInfo of patchFiles) {
				progressValue += progressStep;
				this.eventEmitter.emit({ event: 'migrate', message: 'Reading patch status ...', progress: progressValue });

				// Verificar estado del patch
				const statusResult = await this.historyService.checkPatchStatus({
					connection,
					patchInfo: patchFileInfo,
					config: migrationConfig,
				});

				let shouldExecute = false;

				switch (statusResult.status) {
					case PatchStatusEnum.IN_PROGRESS:
						if (!force) {
							throw new Error(
								`The patch version={${patchFileInfo.version}} and name={${patchFileInfo.name}} is still in progress!`,
							);
						}
						shouldExecute = true;
						break;

					case PatchStatusEnum.ERROR:
						if (!force) {
							throw new Error(
								`The patch version={${patchFileInfo.version}} and name={${patchFileInfo.name}} previously encountered an error! Try to "force" migration with argument -mr.`,
							);
						}
						shouldExecute = true;
						break;

					case PatchStatusEnum.DONE:
						progressValue += progressStep * 2;
						this.eventEmitter.emit({
							event: 'migrate',
							message: `Skip patch ${patchFileInfo.filename} because already executed`,
							progress: progressValue,
						});
						continue;

					case PatchStatusEnum.TO_APPLY:
						shouldExecute = true;
						break;
				}

				if (shouldExecute) {
					progressValue += progressStep;
					this.eventEmitter.emit({ event: 'migrate', message: `Executing patch ${patchFileInfo.filename} ...`, progress: progressValue });

					// Leer y ejecutar patch
					const parsedPatch = await this.patchReader.readPatch(patchFileInfo);

					// Marcar como IN_PROGRESS
					await this.historyService.updateRecordToHistoryTable({
						connection,
						patchInfo: patchFileInfo,
						status: PatchStatusEnum.IN_PROGRESS,
						config: migrationConfig,
					});

					// Ejecutar patch
					const executionResult = await this.patchExecutor.executePatch({
						connection,
						blocks: parsedPatch.blocks,
						patchInfo: patchFileInfo,
						config: migrationConfig,
					});

					if (executionResult.success) {
						// Marcar como DONE
						await this.historyService.updateRecordToHistoryTable({
							connection,
							patchInfo: patchFileInfo,
							status: PatchStatusEnum.DONE,
							message: '',
							script: parsedPatch.rawContent,
							config: migrationConfig,
						});

						result.push(patchFileInfo);
						progressValue += progressStep;
						this.eventEmitter.emit({ event: 'migrate', message: `Patch ${patchFileInfo.filename} has been executed`, progress: progressValue });
					} else {
						// Marcar como ERROR
						await this.historyService.updateRecordToHistoryTable({
							connection,
							patchInfo: patchFileInfo,
							status: PatchStatusEnum.ERROR,
							message: executionResult.errorMessage || 'Unknown error',
							config: migrationConfig,
						});

						throw new Error(
							`Failed to execute patch ${patchFileInfo.filename}: ${executionResult.errorMessage}`,
						);
					}
				}
			}

			return result;
		} finally {
			// Cerrar conexión
			await this.databaseAdapter.close({ connection });
		}
	}

	/**
	 * Registra un patch en el historial sin ejecutarlo.
	 *
	 * @param params - Parámetros para guardar el patch
	 * @param params.config - Configuración completa
	 * @param params.patchFileName - Nombre del archivo patch
	 */
	public async savePatch(params: { config: Config; patchFileName: string }): Promise<void> {
		const { config, patchFileName } = params;

		const migrationConfig = this.prepareMigrationConfig(config);
		const connection = await this.connectionService.createConnection({
			config: config.sourceClient,
		});

		try {
			// Preparar tabla de historial
			await this.historyService.prepareHistoryTable({
				connection,
				config: migrationConfig,
			});

			// Parsear información del patch usando el método privado a través de readPatchFiles
			// Primero intentamos leer el archivo para validar que existe
			const patchFiles = await this.patchReader.readPatchFiles(migrationConfig.patchesDirectory);
			const patchInfo = patchFiles.find((p) => p.filename === patchFileName);

			if (!patchInfo) {
				throw new Error(`The patch file ${patchFileName} does not exist in ${migrationConfig.patchesDirectory}!`);
			}

			// Registrar como DONE sin ejecutar
			await this.historyService.addRecordToHistoryTable({
				connection,
				patchInfo: {
					...patchInfo,
					status: PatchStatusEnum.DONE,
				},
				config: migrationConfig,
			});
		} finally {
			await this.databaseAdapter.close({ connection });
		}
	}
}
