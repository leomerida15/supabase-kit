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
	normalizeViewDefinition,
	normalizeRLSPolicyDefinition,
	normalizeRLSPolicyRoles,
	generateCreateFunctionScript,
	generateCreateAggregateScript,
	generateCreateTableScriptBasic,
	generateCreateTableScript,
	generateCreateForeignKeyScript,
	generateCreateRLSPolicyScript,
	generateCreateTriggerScript,
	generateDropTableScript,
	generateDropViewScript,
	generateDropMaterializedViewScript,
	generateDropFunctionScript,
	generateDropAggregateScript,
	generateDropRLSPolicyScript,
	generateAddColumnScript,
	generateDropColumnScript,
	generateAlterColumnTypeScript,
	generateAlterColumnNullableScript,
	generateAlterColumnDefaultScript,
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
