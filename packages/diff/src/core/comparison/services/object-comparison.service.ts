/**
 * Servicio principal de comparación de objetos.
 *
 * Orquesta la comparación de todos los tipos de objetos de base de datos
 * en el orden correcto respetando dependencias.
 *
 * @module core/comparison/services/object-comparison
 */

import type { ComparisonParams } from '../domain/types/comparison.types.js';
import { ExtensionComparatorService } from './extension-comparator.service.js';
import { SchemaComparatorService } from './schema-comparator.service.js';
import { EnumComparatorService } from './enum-comparator.service.js';
import { TypeComparatorService } from './type-comparator.service.js';
import { SequenceComparatorService } from './sequence-comparator.service.js';
import { TableComparatorService } from './table-comparator.service.js';
import { ViewComparatorService } from './view-comparator.service.js';
import { MaterializedViewComparatorService } from './materialized-view-comparator.service.js';
import { FunctionComparatorService } from './function-comparator.service.js';
import { AggregateComparatorService } from './aggregate-comparator.service.js';
import { ForeignKeyComparatorService } from './foreign-key-comparator.service.js';
import { RLSPolicyComparatorService } from './rls-policy-comparator.service.js';
import { TriggerComparatorService } from './trigger-comparator.service.js';
import { PrivilegeComparatorService } from './privilege-comparator.service.js';

/**
 * Servicio principal de comparación de objetos.
 *
 * Orquesta la comparación de objetos en el orden correcto:
 * 1. Extensions (sin dependencias)
 * 2. Schemas (requiere extensions)
 * 3. Enums (requiere schemas)
 * 4. Types (requiere schemas)
 * 5. Sequences (requiere schemas)
 * 6. Tables (requiere schemas, enums, types, sequences)
 * 7. Views (requiere schemas, tables)
 * 8. Materialized Views (requiere schemas, tables)
 * 9. Functions (requiere schemas, types)
 * 10. Aggregates (requiere schemas, types, functions)
 * 11. Foreign Keys (requiere tables)
 * 12. RLS Policies (requiere tables)
 * 13. Triggers (requiere tables, functions)
 *
 * @class ObjectComparisonService
 */
export class ObjectComparisonService {
	/**
	 * Compara todos los objetos de base de datos.
	 *
	 * @param params - Parámetros de comparación
	 * @returns Array de scripts SQL generados
	 */
	public compareDatabaseObjects(params: ComparisonParams): string[] {
		const { sourceObjects, targetObjects, config } = params;
		const allScripts: string[] = [];

		// 1. Extensions (sin dependencias)
		if (config.enableExtensions !== false) {
			const extensionComparator = new ExtensionComparatorService();
			const source = sourceObjects.extensions || {};
			const target = targetObjects.extensions || {};
			allScripts.push(...extensionComparator.compare({ source, target }));
		}

		// 2. Schemas (requiere extensions)
		const schemaComparator = new SchemaComparatorService();
		const sourceSchemas = sourceObjects.schemas || {};
		const targetSchemas = targetObjects.schemas || {};
		allScripts.push(...schemaComparator.compare({ source: sourceSchemas, target: targetSchemas }));

		// 3. Enums (requiere schemas)
		if (config.enableEnums !== false) {
			const enumComparator = new EnumComparatorService();
			const source = sourceObjects.enums || {};
			const target = targetObjects.enums || {};
			allScripts.push(...enumComparator.compare({ source, target }));
		}

		// 4. Types (requiere schemas)
		if (config.enableTypes !== false) {
			const typeComparator = new TypeComparatorService();
			const source = sourceObjects.types || {};
			const target = targetObjects.types || {};
			allScripts.push(...typeComparator.compare({ source, target }));
		}

		// 5. Sequences (requiere schemas)
		if (config.enableSequences !== false) {
			const sequenceComparator = new SequenceComparatorService();
			const source = sourceObjects.sequences || {};
			const target = targetObjects.sequences || {};
			allScripts.push(...sequenceComparator.compare({ source, target }));
		}

		// 6. Tables (requiere schemas, enums, types, sequences)
		if (config.enableTables !== false) {
			const tableComparator = new TableComparatorService();
			const source = sourceObjects.tables || {};
			const target = targetObjects.tables || {};
			const sourceTableStructures = sourceObjects.tableStructures || undefined;
			const targetTableStructures = targetObjects.tableStructures || undefined;
			
			// Extraer información de FKs del source para detectar columnas con FK
			const sourceFKs = sourceObjects.foreignKeys || {};
			const sourceForeignKeys: Record<string, { schema: string; tableName: string; columns: string[] }> = {};
			for (const fkKey in sourceFKs) {
				const fk = sourceFKs[fkKey];
				if (fk) {
					sourceForeignKeys[fkKey] = {
						schema: fk.schema,
						tableName: fk.tableName,
						columns: fk.columns,
					};
				}
			}
			
			allScripts.push(
				...tableComparator.compare({
					source,
					target,
					sourceTableStructures,
					targetTableStructures,
					config: {
						dropMissingTable: config.dropMissingTable,
					},
					targetTableHasData: params.targetTableHasData,
					sourceForeignKeys,
				}),
			);
		}

		// 7. Views (requiere schemas, tables)
		if (config.enableViews !== false) {
			const viewComparator = new ViewComparatorService();
			const source = sourceObjects.views || {};
			const target = targetObjects.views || {};
			allScripts.push(
				...viewComparator.compare({
					source,
					target,
					config: {
						dropMissingView: config.dropMissingView,
					},
				}),
			);
		}

		// 8. Materialized Views (requiere schemas, tables)
		if (config.enableMaterializedViews !== false) {
			const materializedViewComparator = new MaterializedViewComparatorService();
			const source = sourceObjects.materializedViews || {};
			const target = targetObjects.materializedViews || {};
			allScripts.push(
				...materializedViewComparator.compare({
					source,
					target,
					config: {
						dropMissingView: config.dropMissingView,
					},
				}),
			);
		}

		// 9. Functions (requiere schemas, types)
		if (config.enableFunctions !== false) {
			const functionComparator = new FunctionComparatorService();
			const source = sourceObjects.functions || {};
			const target = targetObjects.functions || {};
			allScripts.push(
				...functionComparator.compare({
					source,
					target,
					config: {
						dropMissingFunction: config.dropMissingFunction,
						useManualFunctionCheck: config.useManualFunctionCheck,
						excludeSuperuserFunctions: config.excludeSuperuserFunctions,
					},
				}),
			);
		}

		// 10. Aggregates (requiere schemas, types, functions)
		if (config.enableAggregates !== false) {
			const aggregateComparator = new AggregateComparatorService();
			const source = sourceObjects.aggregates || {};
			const target = targetObjects.aggregates || {};
			allScripts.push(
				...aggregateComparator.compare({
					source,
					target,
					config: {
						dropMissingAggregate: config.dropMissingAggregate,
					},
				}),
			);
		}

		// 11. Foreign Keys (requiere tables)
		if (config.enableForeignKeys !== false) {
			const foreignKeyComparator = new ForeignKeyComparatorService();
			const source = sourceObjects.foreignKeys || {};
			const target = targetObjects.foreignKeys || {};
			const sourceTables = sourceObjects.tables || {};
			const targetTables = targetObjects.tables || {};
			const tableKeysToCreate: string[] = [];
			for (const tableKey in sourceTables) {
				if (sourceTables[tableKey] && !targetTables[tableKey]) {
					tableKeysToCreate.push(tableKey);
				}
			}
			allScripts.push(
				...foreignKeyComparator.compare({
					source,
					target,
					config: {
						namespaces: config.namespaces,
						crossSchemaForeignKeys: config.crossSchemaForeignKeys,
					},
					tableKeysToCreate,
				}),
			);
		}

		// 12. RLS Policies (requiere tables)
		if (config.enableRLSPolicies !== false) {
			const rlsPolicyComparator = new RLSPolicyComparatorService();
			const source = sourceObjects.rlsPolicies || {};
			const target = targetObjects.rlsPolicies || {};
			allScripts.push(
				...rlsPolicyComparator.compare({
					source,
					target,
					config: {
						enableRLSPolicies: config.enableRLSPolicies,
						dropMissingRLSPolicy: config.dropMissingRLSPolicy,
					},
				}),
			);
		}

		// 13. Triggers (requiere tables, functions)
		if (config.enableTriggers !== false) {
			const triggerComparator = new TriggerComparatorService();
			const source = sourceObjects.tables || {};
			const target = targetObjects.tables || {};
			allScripts.push(...triggerComparator.compare({ source, target }));
		}

		// 14. Privileges (requiere tables, views, functions, etc.)
		// Solo procesar si hay roles configurados
		if (config.roles.length > 0) {
			const privilegeComparator = new PrivilegeComparatorService();

			// Comparar privilegios de tablas
			if (config.enableTables !== false) {
				const sourceTables = sourceObjects.tables || {};
				const targetTables = targetObjects.tables || {};

				for (const tableKey in sourceTables) {
					const sourceTable = sourceTables[tableKey];
					const targetTable = targetTables[tableKey];

					if (sourceTable && targetTable) {
						// Parsear privilegios desde string (asumiendo formato JSON)
						try {
							const sourcePrivileges: Record<string, any> = sourceTable.privileges
								? JSON.parse(sourceTable.privileges)
								: {};
							const targetPrivileges: Record<string, any> = targetTable.privileges
								? JSON.parse(targetTable.privileges)
								: {};

							const fullTableName = `"${sourceTable.schema}"."${sourceTable.name}"`;
							allScripts.push(
								...privilegeComparator.compareTablePrivileges({
									tableName: fullTableName,
									sourcePrivileges,
									targetPrivileges,
									config: {
										roles: config.roles,
									},
								}),
							);
						} catch {
							// Si no se pueden parsear, continuar sin procesar privilegios
						}
					}
				}
			}
		}

		return allScripts;
	}
}
