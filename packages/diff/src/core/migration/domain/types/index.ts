/**
 * Barrel export para tipos de migración.
 *
 * @module core/migration/domain/types
 */

export type {
	PatchInfo,
	MigrationConfig,
	PrepareHistoryTableParams,
	CheckPatchStatusParams,
	PatchStatusResult,
} from './migration.types.js';

export { PatchStatus } from './migration.types.js';
