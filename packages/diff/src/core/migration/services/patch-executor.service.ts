/**
 * Servicio para ejecutar patches SQL.
 *
 * Proporciona funcionalidad para ejecutar patches SQL en bloques
 * BEGIN/END con manejo de transacciones.
 *
 * @module core/migration/services/patch-executor
 */

import type { DatabasePort } from '../../connection/ports/database.port.js';
import type { DatabaseConnection } from '../../connection/domain/types/index.js';
import type { ParsedScriptBlock } from './patch-reader.service.js';
import type { PatchInfo, MigrationConfig, PatchStatus } from '../domain/types/migration.types.js';

/**
 * Parámetros para ejecutar un patch.
 *
 * @interface ExecutePatchParams
 */
export interface ExecutePatchParams {
	/**
	 * Conexión a la base de datos.
	 */
	connection: DatabaseConnection;

	/**
	 * Bloques de script a ejecutar.
	 */
	blocks: ParsedScriptBlock[];

	/**
	 * Información del patch.
	 */
	patchInfo: PatchInfo;

	/**
	 * Configuración de migración.
	 */
	config: MigrationConfig;
}

/**
 * Resultado de ejecución de un patch.
 *
 * @interface PatchExecutionResult
 */
export interface PatchExecutionResult {
	/**
	 * Número de comandos ejecutados exitosamente.
	 */
	commandsExecuted: number;

	/**
	 * Número total de bloques.
	 */
	totalBlocks: number;

	/**
	 * Indica si la ejecución fue exitosa.
	 */
	success: boolean;

	/**
	 * Mensaje de error si la ejecución falló.
	 */
	errorMessage?: string;
}

/**
 * Servicio para ejecutar patches SQL.
 *
 * @class PatchExecutorService
 */
export class PatchExecutorService {
	/**
	 * Adaptador de base de datos para ejecutar queries.
	 */
	private readonly databaseAdapter: DatabasePort;

	/**
	 * Crea una nueva instancia de PatchExecutorService.
	 *
	 * @param params - Parámetros del servicio
	 * @param params.databaseAdapter - Adaptador de base de datos
	 */
	public constructor(params: { databaseAdapter: DatabasePort }) {
		this.databaseAdapter = params.databaseAdapter;
	}

	/**
	 * Ejecuta un patch SQL bloque por bloque.
	 * Cada bloque se ejecuta dentro de una transacción BEGIN/END.
	 *
	 * @param params - Parámetros para ejecutar el patch
	 * @returns Resultado de la ejecución
	 */
	public async executePatch(params: ExecutePatchParams): Promise<PatchExecutionResult> {
		const { connection, blocks, patchInfo } = params;

		let commandsExecuted = 0;
		let errorMessage: string | undefined;

		try {
			for (const block of blocks) {
				// Construir script del bloque con BEGIN/END
				const blockScript = this.wrapBlockInTransaction(block);

				// Ejecutar bloque
				await this.databaseAdapter.query({
					connection,
					sql: blockScript,
				});

				commandsExecuted++;
			}

			return {
				commandsExecuted,
				totalBlocks: blocks.length,
				success: true,
			};
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : String(error);
			return {
				commandsExecuted,
				totalBlocks: blocks.length,
				success: false,
				errorMessage,
			};
		}
	}

	/**
	 * Envuelve un bloque de script en una transacción BEGIN/END.
	 *
	 * @param block - Bloque de script a envolver
	 * @returns Script con transacción
	 */
	private wrapBlockInTransaction(block: ParsedScriptBlock): string {
		const scriptLines = block.lines.join('\n');
		return `BEGIN;\n${scriptLines}\nCOMMIT;`;
	}
}
