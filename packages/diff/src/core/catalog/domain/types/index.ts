/**
 * Barrel export para tipos del catálogo.
 *
 * @module core/catalog/domain/types
 */

export type {
	DatabaseObjects,
	TableStructure,
	TableColumnStructure,
} from './database-objects.types.js';

export type {
	BaseRetrieveParams,
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
} from './catalog.types.js';
