/**
 * Servicio de catálogo para orquestar la recopilación de objetos de base de datos.
 *
 * Proporciona métodos de alto nivel para recopilar todos los objetos
 * del catálogo de PostgreSQL usando CatalogPort.
 *
 * @module core/catalog/services/catalog
 */

import type { CatalogPort } from '../ports/catalog.port.js';
import type { DatabaseObjects } from '../domain/types/database-objects.types.js';
import type { DatabaseConnection } from '../../connection/domain/types/index.js';

/**
 * Parámetros para recopilar todos los objetos del catálogo.
 *
 * @interface CollectAllObjectsParams
 */
export interface CollectAllObjectsParams {
	/**
	 * Conexión a la base de datos.
	 */
	connection: DatabaseConnection;

	/**
	 * Lista de nombres de schemas desde los cuales recopilar objetos.
	 * Si está vacío o no se proporciona, se recopilan todos los schemas.
	 */
	schemas?: string[];
}

/**
 * Servicio de catálogo.
 *
 * Orquesta la recopilación de objetos del catálogo de PostgreSQL
 * usando CatalogPort.
 *
 * @class CatalogService
 */
export class CatalogService {
	/**
	 * Adaptador de catálogo para recopilar objetos.
	 */
	private readonly catalogAdapter: CatalogPort;

	/**
	 * Crea una nueva instancia de CatalogService.
	 *
	 * @param params - Parámetros del servicio
	 * @param params.catalogAdapter - Adaptador de catálogo
	 */
	public constructor(params: { catalogAdapter: CatalogPort }) {
		this.catalogAdapter = params.catalogAdapter;
	}

	/**
	 * Recopila todos los objetos del catálogo de la base de datos.
	 *
	 * @param params - Parámetros para recopilar objetos
	 * @returns Promise que resuelve con DatabaseObjects conteniendo todos los objetos recopilados
	 */
	public async collectAllObjects(
		params: CollectAllObjectsParams,
	): Promise<DatabaseObjects> {
		const { connection, schemas } = params;

		// Si no se proporcionan schemas, obtener todos los schemas disponibles
		let targetSchemas = schemas;
		if (!targetSchemas || targetSchemas.length === 0) {
			const allSchemas = await this.catalogAdapter.retrieveAllSchemas({ connection });
			targetSchemas = Object.keys(allSchemas);
		}

		// Recopilar todos los objetos en paralelo donde sea posible
		const [
			schemasResult,
			tables,
			views,
			materializedViews,
			functions,
			aggregates,
			sequences,
			extensions,
			enums,
			types,
			foreignKeys,
			rlsPolicies,
			tableStructures,
		] = await Promise.all([
			this.catalogAdapter.retrieveAllSchemas({ connection, schemas: targetSchemas }),
			this.catalogAdapter.retrieveTables({ connection, schemas: targetSchemas }),
			this.catalogAdapter.retrieveViews({ connection, schemas: targetSchemas }),
			this.catalogAdapter.retrieveMaterializedViews({
				connection,
				schemas: targetSchemas,
			}),
			this.catalogAdapter.retrieveFunctions({ connection, schemas: targetSchemas }),
			this.catalogAdapter.retrieveAggregates({ connection, schemas: targetSchemas }),
			this.catalogAdapter.retrieveSequences({ connection, schemas: targetSchemas }),
			this.catalogAdapter.retrieveExtensions({ connection }),
			this.catalogAdapter.retrieveEnums({ connection, schemas: targetSchemas }),
			this.catalogAdapter.retrieveTypes({ connection, schemas: targetSchemas }),
			this.catalogAdapter.retrieveForeignKeys({ connection, schemas: targetSchemas }),
			this.catalogAdapter.retrieveRLSPolicies({ connection, schemas: targetSchemas }),
			this.catalogAdapter.retrieveTableStructures({
				connection,
				schemas: targetSchemas,
			}),
		]);

		return {
			schemas: schemasResult,
			tables,
			views,
			materializedViews,
			functions,
			aggregates,
			sequences,
			extensions,
			enums,
			types,
			foreignKeys,
			rlsPolicies,
			tableStructures,
		};
	}
}
