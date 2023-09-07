import * as azdata from 'azdata';

export interface CategoryValue {
	displayName: string;

	name: string;
}

export interface ServiceOption {
	name: string;

	displayName: string;

	description: string;

	groupName: string;

	valueType: string;

	defaultValue: string;

	objectType: string;

	categoryValues: CategoryValue[];

	isRequired: boolean;

	isArray: boolean;
}

export interface AdminServicesProviderOptions {
	databaseInfoOptions: ServiceOption[];

	databaseFileInfoOptions: ServiceOption[];

	fileGroupInfoOptions: ServiceOption[];
}

export interface FeatureMetadataProvider {
	enabled: boolean;
	featureName: string;
	optionsMetadata: ServiceOption[];
}

/**
 * Update event parameters
 */
export class IntelliSenseReadyParams {
	/**
	 * URI identifying the text document
	 */
	public ownerUri: string;
}

export class CapabiltiesDiscoveryResult {
	public capabilities: azdata.DataProtocolServerCapabilities;
}

// Admin Services types

export interface CreateDatabaseParams {
	ownerUri: string;

	databaseInfo: azdata.DatabaseInfo;
}

export interface DefaultDatabaseInfoParams {
	ownerUri: string;
}

export interface DefaultDatabaseInfoResponse {
	defaultDatabaseInfo: azdata.DatabaseInfo;
}

export interface GetDatabaseInfoResponse {
	databaseInfo: azdata.DatabaseInfo;
}

export interface GetDatabaseInfoParams {
	ownerUri: string;
}

export interface BackupConfigInfoResponse {
	backupConfigInfo: azdata.BackupConfigInfo;
}

export interface CreateLoginParams {
	ownerUri: string;

	loginInfo: azdata.LoginInfo;
}

// Disaster Recovery types

export interface BackupInfo {
	ownerUri: string;

	databaseName: string;

	backupType: number;

	backupComponent: number;

	backupDeviceType: number;

	selectedFiles: string;

	backupsetName: string;

	selectedFileGroup: { [path: string]: string };

	// List of {key: backup path, value: device type}
	backupPathDevices: { [path: string]: number };

	backupPathList: [string];

	isCopyOnly: boolean;

	formatMedia: boolean;

	initialize: boolean;

	skipTapeHeader: boolean;

	mediaName: string;

	mediaDescription: string;

	checksum: boolean;

	continueAfterError: boolean;

	logTruncation: boolean;

	tailLogBackup: boolean;

	retainDays: number;

	compressionOption: number;

	verifyBackupRequired: boolean;

	encryptionAlgorithm: number;

	encryptorType: number;

	encryptorName: string;
}

export interface BackupParams {
	ownerUri: string;

	backupInfo: BackupInfo;

	taskExecutionMode: azdata.TaskExecutionMode;
}

export interface RestoreParams {
	ownerUri: string;
	options: {};
	taskExecutionMode: azdata.TaskExecutionMode;
}

export interface RestoreConfigInfoRequestParams {
	ownerUri: string;
}

export interface RestoreConfigInfoResponse {
	configInfo: { [key: string]: any };
}

export interface RestoreDatabaseFileInfo {
	fileType: string;

	logicalFileName: string;

	originalFileName: string;

	restoreAsFileName: string;
}

export interface FileBrowserOpenParams {
	ownerUri: string;
	expandPath: string;
	fileFilters: string[];
	changeFilter: boolean;
	showFoldersOnly?: boolean;
}

export interface FileTreeNode {
	children: FileTreeNode[];
	isExpanded: boolean;
	isFile: boolean;
	name: string;
	fullPath: string;
}

export interface FileTree {
	rootNode: FileTreeNode;
	selectedNode: FileTreeNode;
}

export interface FileBrowserExpandParams {
	ownerUri: string;
	expandPath: string;
}

export interface FileBrowserValidateParams {
	ownerUri: string;
	serviceType: string;
	selectedFiles: string[];
}

export interface FileBrowserCloseParams {
	ownerUri: string;
}

export interface DatabaseFileInfo {
	properties: LocalizedPropertyInfo[];
	id: string;
	isSelected: boolean;
}

export interface LocalizedPropertyInfo {
	propertyName: string;
	propertyValue: string;
	propertyDisplayName: string;
	propertyValueDisplayName: string;
}

export interface RestorePlanDetailInfo {
	name: string;
	currentValue: any;
	isReadOnly: boolean;
	isVisible: boolean;
	defaultValue: any;

}

// Query Execution types

export interface ExecutionPlanOptions {
	includeEstimatedExecutionPlanXml?: boolean;
	includeActualExecutionPlanXml?: boolean;
}

export interface QueryExecuteParams {
	ownerUri: string;
	querySelection: azdata.ISelectionData;
	executionPlanOptions?: ExecutionPlanOptions;
}

export interface QueryExecutionOptionsParams {
	ownerUri: string;
	options: azdata.QueryExecutionOptions;
}

export class MetadataQueryParams {
	/**
	 * Owner URI of the connection that changed.
	 */
	public ownerUri: string;
}

export class MetadataQueryResult {
	public metadata: azdata.ObjectMetadata[];
}

export interface ScriptOptions {
	/**
	 * Generate ANSI padding statements
	 */
	scriptANSIPadding?: boolean;

	/**
	 * Append the generated script to a file
	 */
	appendToFile?: boolean;

	/**
	 * Continue to script if an error occurs. Otherwise, stop.
	 */
	continueScriptingOnError?: boolean;

	/**
	 * Convert user-defined data types to base types.
	 */
	convertUDDTToBaseType?: boolean;

	/**
	 * Generate script for dependent objects for each object scripted.
	 */
	generateScriptForDependentObjects?: boolean;

	/**
	 * Include descriptive headers for each object generated.
	 */
	includeDescriptiveHeaders?: boolean;

	/**
	 * Check that an object with the given name exists before dropping or altering or that an object with the given name does not exist before creating.
	 */
	includeIfNotExists?: boolean;

	/**
	 * Script options to set vardecimal storage format.
	 */
	includeVarDecimal?: boolean;

	/**
	 * Include system generated constraint names to enforce declarative referential integrity.
	 */
	scriptDRIIncludeSystemNames?: boolean;

	/**
	 * Include statements in the script that are not supported on the specified SQL Server database engine type.
	 */
	includeUnsupportedStatements?: boolean;

	/**
	 * Prefix object names with the object schema.
	 */
	schemaQualify?: boolean;

	/**
	 * Script options to set bindings option.
	 */
	bindings?: boolean;

	/**
	 * Script the objects that use collation.
	 */
	collation?: boolean;

	/**
	 * Script the default values.
	 */
	default?: boolean;

	/**
	 * Script Object CREATE/DROP statements.
	 */
	scriptCreateDrop: string;

	/**
	 * Script the Extended Properties for each object scripted.
	 */
	scriptExtendedProperties?: boolean;

	/**
	 * Script only features compatible with the specified version of SQL Server.
	 */
	scriptCompatibilityOption: string;

	/**
	 * Script only features compatible with the specified SQL Server database engine type.
	 */
	targetDatabaseEngineType: string;

	/**
	 * Script only features compatible with the specified SQL Server database engine edition.
	 */
	targetDatabaseEngineEdition: string;

	/**
	 * Script all logins available on the server. Passwords will not be scripted.
	 */
	scriptLogins?: boolean;

	/**
	 * Generate object-level permissions.
	 */
	scriptObjectLevelPermissions?: boolean;

	/**
	 * Script owner for the objects.
	 */
	scriptOwner?: boolean;

	/**
	 * Script statistics, and optionally include histograms, for each selected table or view.
	 */
	scriptStatistics: string;

	/**
	 * Generate USE DATABASE statement.
	 */
	scripUseDatabase?: boolean;

	/**
	 * Generate script that contains schema only or schema and azdata.
	 */
	typeOfDataToScript: string;

	/**
	 * Scripts the change tracking information.
	 */
	scriptChangeTracking?: boolean;

	/**
	 * Script the check constraints for each table or view scripted.
	 */
	scriptCheckConstraints?: boolean;

	/**
	 * Scripts the data compression information.
	 */
	scriptDataCompressionOptions?: boolean;

	/**
	 * Script the foreign keys for each table scripted.
	 */
	scriptForeignKeys?: boolean;

	/**
	 * Script the full-text indexes for each table or indexed view scripted.
	 */
	scriptFullTextIndexes?: boolean;

	/**
	 * Script the indexes (including XML and clustered indexes) for each table or indexed view scripted.
	 */
	scriptIndexes?: boolean;

	/**
	 * Script the primary keys for each table or view scripted
	 */
	scriptPrimaryKeys?: boolean;

	/**
	 * Script the triggers for each table or view scripted
	 */
	scriptTriggers?: boolean;

	/**
	 * Script the unique keys for each table or view scripted.
	 */
	uniqueKeys?: boolean;
}

export interface ScriptingObject {
	/**
	 * The database object type
	 */
	type: string;

	/**
	 * The schema of the database object
	 */
	schema: string;

	/**
	 * The database object name
	 */
	name: string;

	/**
	 * The parent object name which is needed for scripting subobjects like triggers or indexes
	 */
	parentName: string;

	/**
	 * The parent object type name such as Table, View, etc.
	 */
	parentTypeName: string;
}

export interface ScriptingParams {
	/**
	 * File path used when writing out the script.
	 */
	filePath: string;

	/**
	 * Whether scripting to a single file or file per object.
	 */
	scriptDestination: string;

	/**
	 * Connection string of the target database the scripting operation will run against.
	 */
	connectionString: string;

	/**
	 * A list of scripting objects to script
	 */
	scriptingObjects: ScriptingObject[];

	/**
	 * A list of scripting object which specify the include criteria of objects to script.
	 */
	includeObjectCriteria: ScriptingObject[];

	/**
	 * A list of scripting object which specify the exclude criteria of objects to not script.
	 */
	excludeObjectCriteria: ScriptingObject[];

	/**
	 * A list of schema name of objects to script.
	 */
	includeSchemas: string[];

	/**
	 * A list of schema name of objects to not script.
	 */
	excludeSchemas: string[];

	/**
	 * A list of type name of objects to script.
	 */
	includeTypes: string[];

	/**
	 * A list of type name of objects to not script.
	 */
	excludeTypes: string[];

	/**
	 * Scripting options for the ScriptingParams
	 */
	scriptOptions: ScriptOptions;

	/**
	 * Connection details for the ScriptingParams
	 */
	connectionDetails: azdata.ConnectionInfo;

	/**
	 * Owner URI of the connection
	 */
	ownerURI: string;

	/**
	 * Whether the scripting operation is for
	 * select script statements
	 */
	selectScript: boolean;

	/**
	 * Operation associated with the script request
	 */
	operation: azdata.ScriptOperation;
}

export class TableMetadata {

	columns: azdata.ColumnMetadata[];

}

