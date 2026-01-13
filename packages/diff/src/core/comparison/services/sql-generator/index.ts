/**
 * Barrel export para utilidades de generación SQL.
 *
 * @module core/comparison/services/sql-generator
 */

export {
	generateCreateExtensionScript,
	generateCreateSchemaScript,
	generateCreateEnumScript,
	generateCreateTypeScript,
	generateCreateSequenceScript,
	generateCreateViewScript,
	generateCreateMaterializedViewScript,
	generateCreateFunctionScript,
	generateCreateAggregateScript,
	generateCreateTableScriptBasic,
	generateCreateForeignKeyScript,
	generateCreateRLSPolicyScript,
	generateCreateTriggerScript,
	generateDropTableScript,
	generateDropViewScript,
	generateDropMaterializedViewScript,
	generateDropFunctionScript,
	generateDropAggregateScript,
	generateDropRLSPolicyScript,
} from './sql-generator.utils.js';

export {
	generateTableRoleGrantsScript,
	generateChangesTableRoleGrantsScript,
	type TablePrivileges,
} from './privilege-generator.utils.js';

export {
	addWarningsToScript,
	createExtensionNotAvailableWarning,
	createTypeIncompatibleWarning,
	createDependencyMissingWarning,
	createPermissionIssueWarning,
	createDataLossRiskWarning,
	createRoleMissingWarning,
	WarningType,
	Severity,
	type ScriptWarning,
} from './warning-system.utils.js';
