/**
 * Servicios de migración.
 *
 * @module core/migration/services
 */

export { MigrationHistoryService } from './migration-history.service.js';
export { PatchReaderService } from './patch-reader.service.js';
export type { ParsedScriptBlock, ParsedPatch } from './patch-reader.service.js';
export { PatchExecutorService } from './patch-executor.service.js';
export type { ExecutePatchParams, PatchExecutionResult } from './patch-executor.service.js';
export { MigrationService } from './migration.service.js';
export type { MigrateParams } from './migration.service.js';
