import * as azdata from 'azdata';

export interface CreateSessionResponse {
	sessionId: string;
}

export interface SessionCreatedParameters {
	success: boolean;
	sessionId: string;
	rootNode: NodeInfo;
	errorMessage: string;
}

export interface SessionDisconnectedParameters {
	success: boolean;
	sessionId: string;
	errorMessage: string;
}

export interface ExpandResponse {
	nodePath: string;
	sessionId: string;
	nodes: NodeInfo[];
	errorMessage: string;
}

export interface NodeInfo {
	nodePath: string;
	nodeType: string;
	nodeSubType: string;
	nodeStatus: string;
	label: string;
	isLeaf: boolean;
	metadata: azdata.ObjectMetadata;
	errorMessage: string;
}

export interface ExpandParams {
	sessionId: string;
	nodePath: string;
}

export interface CloseSessionParams {
	sessionId: string;
}

export interface CloseSessionResponse {
	success: boolean;
	sessionId: string;
}

export interface FindNodesParams {
	sessionId: string;
	type: string;
	schema: string;
	name: string;
	database: string;
	parentObjectNames: string[];
}

export interface FindNodesResponse {
	nodes: NodeInfo[];
}

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

export interface ConnectionOption {
	name: string;

	displayName: string;

	description: string;

	groupName: string;

	valueType: string;

	defaultValue: string;

	objectType: string;

	categoryValues: CategoryValue[];

	specialValueType: string;

	isIdentity: boolean;

	isRequired: boolean;

	isArray: boolean;
}

export interface ConnectionProviderOptions {
	options: ConnectionOption[];
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
 * Summary that identifies a unique database connection.
 */
export class ConnectionSummary {
	/**
	 * server name
	 */
	public serverName: string;

	/**
	 * database name
	 */
	public databaseName: string;

	/**
	 * user name
	 */
	public userName: string;
}

/**
 * Connection response format.
 */
export class ConnectionCompleteParams {
	/**
	 * URI identifying the owner of the connection
	 */
	public ownerUri: string;

	/**
	 * connection id returned from service host.
	 */
	public connectionId: string;

	/**
	 * any diagnostic messages return from the service host.
	 */
	public messages: string;

	/**
	 * Error message returned from the engine, if any.
	 */
	public errorMessage: string;

	/**
	 * Error number returned from the engine, if any.
	 */
	public errorNumber: number;

	/**
	 * Information about the connected server.
	 */
	public serverInfo: ServerInfo;

	/**
	 * information about the actual connection established
	 */
	public connectionSummary: ConnectionSummary;
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

/**
 * Information about a SQL Server instance.
 */
export class ServerInfo {
	/**
	 * The major version of the SQL Server instance.
	 */
	public serverMajorVersion: number;

	/**
	 * The minor version of the SQL Server instance.
	 */
	public serverMinorVersion: number;

	/**
	 * The build of the SQL Server instance.
	 */
	public serverReleaseVersion: number;

	/**
	 * The ID of the engine edition of the SQL Server instance.
	 */
	public engineEditionId: number;

	/**
	 * String containing the full server version text.
	 */
	public serverVersion: string;

	/**
	 * String describing the product level of the server.
	 */
	public serverLevel: string;

	/**
	 * The edition of the SQL Server instance.
	 */
	public serverEdition: string;

	/**
	 * Whether the SQL Server instance is running in the cloud (Azure) or not.
	 */
	public isCloud: boolean;

	/**
	 * The version of Azure that the SQL Server instance is running on, if applicable.
	 */
	public azureVersion: number;

	/**
	 * The Operating System version string of the machine running the SQL Server instance.
	 */
	public osVersion: string;
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
export interface ResultSetSummary {
	id: number;
	batchId: number;
	rowCount: number;
	columnInfo: IDbColumn[];
}

export interface BatchSummary {
	hasError: boolean;
	id: number;
	selection: azdata.ISelectionData;
	resultSetSummaries: ResultSetSummary[];
	executionElapsed: string;
	executionEnd: string;
	executionStart: string;
}

export interface IDbColumn {
	allowDBNull?: boolean;
	baseCatalogName: string;
	baseColumnName: string;
	baseSchemaName: string;
	baseServerName: string;
	baseTableName: string;
	columnName: string;
	columnOrdinal?: number;
	columnSize?: number;
	isAliased?: boolean;
	isAutoIncrement?: boolean;
	isExpression?: boolean;
	isHidden?: boolean;
	isIdentity?: boolean;
	isKey?: boolean;
	isBytes?: boolean;
	isChars?: boolean;
	isSqlVariant?: boolean;
	isUdt?: boolean;
	dataType: string;
	isXml?: boolean;
	isJson?: boolean;
	isLong?: boolean;
	isReadOnly?: boolean;
	isUnique?: boolean;
	numericPrecision?: number;
	numericScale?: number;
	udtAssemblyQualifiedName: string;
	dataTypeName: string;
}

export interface IGridResultSet {
	columns: IDbColumn[];
	rowsUri: string;
	numberOfRows: number;
}

export interface IResultMessage {
	batchId?: number;
	isError: boolean;
	time: string;
	message: string;
}

export interface EditRow {
	cells: azdata.DbCellValue[];
	id: number;
	isDirty: boolean;
	state: azdata.EditRowState;
}

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

export interface ScriptingCompleteParams {
	/**
	 * The error details for an error that occurred during the scripting operation.
	 */
	errorDetails: string;

	/**
	 * The error message for an error that occurred during the scripting operation.
	 */
	errorMessage: string;

	/**
	 * A value to indicate an error occurred during the scripting operation.
	 */
	hasError: boolean;

	/**
	 * A value to indicate the scripting operation was canceled.
	 */
	canceled: boolean;

	/**
	 * A value to indicate the scripting operation successfully completed.
	 */
	success: boolean;
}

export class TableMetadata {

	columns: azdata.ColumnMetadata[];

}

/**
 * Parameters to start a profiler session
 */
export interface CreateXEventSessionParams {
	/**
	 * Session Owner URI
	 */
	ownerUri: string;

	/**
	 * Session name
	 */
	sessionName: string;

	/**
	 * Profiler Session template
	 */
	template: ProfilerSessionTemplate;
}

export interface CreateXEventSessionResponse { }

/**
 * Parameters to start a profiler session
 */
export interface StartProfilingParams {
	/**
	 * Session Owner URI
	 */
	ownerUri: string;

	/**
	 * Session name
	 */
	sessionName: string;
}

export interface StartProfilingResponse { }

/**
 * Parameters to stop a profiler session
 */
export interface StopProfilingParams {
	/**
	 * Session Owner URI
	 */
	ownerUri: string;
}

export interface StopProfilingResponse { }

/**
 * Parameters to pause a profiler session
 */
export interface PauseProfilingParams {
	/**
	 * Session Owner URI
	 */
	ownerUri: string;
}

export interface PauseProfilingResponse { }

/**
 * Parameters to get a list of XEvent sessions
 */
export interface GetXEventSessionsParams {
	/**
	 * Session Owner URI
	 */
	ownerUri: string;
}

export interface GetXEventSessionsResponse {
	/**
	 * List of all running XEvent Sessions on target server
	 */
	sessions: string[];
}

export interface DisconnectSessionParams {
	/**
	 * Session Owner URI
	 */
	ownerUri: string;
}

export interface DisconnectSessionResponse { }

/**
 * Profiler Event
 */
export interface ProfilerEvent {
	/**
	 * Event class name
	 */
	name: string;

	/**
	 * Event timestamp
	 */
	timestamp: string;

	/**
	 * Event values
	 */
	values: {};
}

/**
 * Profiler Session Template
 */
export interface ProfilerSessionTemplate {
	/**
	 * Template name
	 */
	name: string;

	/**
	 * Default view for template
	 */
	defaultView: string;

	/**
	 * TSQL for creating a session
	 */
	createStatement: string;
}

/**
 * Profiler events available notification parameters
 */
export interface ProfilerEventsAvailableParams {
	/**
	 * Session owner URI
	 */
	ownerUri: string;

	/**
	 * New profiler events available
	 */
	events: ProfilerEvent[];

	/**
	 * If events may have been dropped
	 */
	eventsLost: boolean;
}

/**
 * Profiler events available notification parameters
 */
export interface ProfilerSessionStoppedParams {
	/**
	 * Session owner URI
	 */
	ownerUri: string;

	/**
	 * Stopped session Id
	 */
	sessionId: number;
}

/**
 * Profiler session created notification parameters
 */
export interface ProfilerSessionCreatedParams {
	/**
	 * Session owner URI
	 */
	ownerUri: string;

	/**
	 * Created session name
	 */
	sessionName: string;

	/**
	 * Template used to create session
	 */
	templateName: string;
}
