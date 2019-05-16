import { ClientCapabilities as VSClientCapabilities, RequestType, NotificationType } from 'vscode-languageclient';

import * as types from './types';
import * as azdata from 'azdata';

export interface ConnectionClientCapabilities {
	connection?: {
		/**
		 * Whether the connection support dynamic registration
		 */
		dynamicRegistration?: boolean;
	};
	backup?: {
		/**
		 * Whether the backup support dynamic registration
		 */
		dynamicRegistration?: boolean;
	};
	restore?: {
		/**
		 * Whether the restore support dynamic registration
		 */
		dynamicRegistration?: boolean;
	};
	query?: {
		/**
		 * Whether the query support dynamic registration
		 */
		dynamicRegistration?: boolean;
	};
	objectExplorer?: {
		/**
		 * Whether the object explorer support dynamic registration
		 */
		dynamicRegistration?: boolean;
	};
	scripting?: {
		/**
		 * Whether the scripting support dynamic registration
		 */
		dynamicRegistration?: boolean;
	};
	taskServices?: {
		/**
		 * Whether the task services support dynamic registration
		 */
		dynamicRegistration?: boolean;
	};
	fileBrowser?: {
		/**
		 * Whether the file browser support dynamic registration
		 */
		dynamicRegistration?: boolean;
	};
	profiler?: {
		/**
		 * Whether the profiler support dynamic registration
		 */
		dynamicRegistration?: boolean;
	};
	capabilities?: {
		/**
		 *
		 */
		dynamicRegistration?: boolean;
	};
	metadata?: {
		/**
		 *
		 */
		dynamicRegistration?: boolean;
	};
	adminServices?: {
		/**
		 *
		 */
		dynamicRegistration?: boolean;
	};
}

export interface ClientCapabilities extends VSClientCapabilities {
	connection?: ConnectionClientCapabilities;
}

//---- Refresh IntelliSense ----------------------------------------

/**
 * Notification sent when the an IntelliSense cache invalidation is requested
 */
export namespace RebuildIntelliSenseNotification {
	export const type = new NotificationType<RebuildIntelliSenseParams, void>('textDocument/rebuildIntelliSense');
}

/**
 * Rebuild IntelliSense notification parameters
 */
export class RebuildIntelliSenseParams {
	/**
	 * URI identifying the text document
	 */
	public ownerUri: string;
}


// ------------------------------- < Connect Request > ----------------------------------------------

/**
 * Connection request message format
 */
export interface ConnectParams {
	/**
	 * URI identifying the owner of the connection
	 */
	ownerUri: string;

	/**
	 * Details for creating the connection
	 */
	connection: azdata.ConnectionInfo;
}


// Connection request message callback declaration
export namespace ConnectionRequest {
	export const type = new RequestType<ConnectParams, boolean, void, void>('connection/connect');
}

// ------------------------------- < Connection Complete Event > ------------------------------------


export namespace ConnectionCompleteNotification {
	export const type = new NotificationType<types.ConnectionCompleteParams, void>('connection/complete');
}

// ------------------------------- < Connection Changed Event > -------------------------------------

/**
 * Parameters for the ConnectionChanged notification.
 */
export class ConnectionChangedParams {
	/**
	 * Owner URI of the connection that changed.
	 */
	public ownerUri: string;

	/**
	 * Summary of details containing any connection changes.
	 */
	public connection: types.ConnectionSummary;
}

/**
 * Connection changed event callback declaration.
 */
export namespace ConnectionChangedNotification {
	export const type = new NotificationType<ConnectionChangedParams, void>('connection/connectionchanged');
}

// ------------------------------- < Disconnect Request > -------------------------------------------

// Disconnect request message format
export class DisconnectParams {
	// URI identifying the owner of the connection
	public ownerUri: string;
}

// Disconnect response format
export type DisconnectResult = boolean;

// Disconnect request message callback declaration
export namespace DisconnectRequest {
	export const type = new RequestType<DisconnectParams, DisconnectResult, void, void>('connection/disconnect');
}

// ------------------------------- < Cancel Connect Request > ---------------------------------------


// Cancel connect request message format
export class CancelConnectParams {
	/**
	 * URI identifying the owner of the connection
	 */
	public ownerUri: string;
}

// Cancel connect response format.
export type CancelConnectResult = boolean;

// Cancel connect request message callback declaration
export namespace CancelConnectRequest {
	export const type = new RequestType<CancelConnectParams, CancelConnectResult, void, void>('connection/cancelconnect');
}

// ------------------------------- < Change Database Request > -------------------------------------

export class ChangeDatabaseParams {
	public ownerUri: string;
	public newDatabase: string;
}

export namespace ChangeDatabaseRequest {
	export const type = new RequestType<ChangeDatabaseParams, boolean, void, void>('connection/changedatabase');
}

// ------------------------------- < List Databases Request > ---------------------------------------

// List databases request format
export class ListDatabasesParams {
	// Connection information to use for querying master
	public ownerUri: string;
}

// List databases request callback declaration
export namespace ListDatabasesRequest {
	export const type = new RequestType<ListDatabasesParams, azdata.ListDatabasesResult, void, void>('connection/listdatabases');
}

// ------------------------------- < Get Connection String Request > ---------------------------------------

// Get Connection String request format
export class GetConnectionStringParams {
	// Connection key to lookup connection string for
	public ownerUri: string;

	// Indicates whether to include the password in the connection string
	public includePassword: boolean;
}

// Get Connection String request callback declaration
export namespace GetConnectionStringRequest {
	export const type = new RequestType<GetConnectionStringParams, string, void, void>('connection/getconnectionstring');
}

// ------------------------------- < Get Connection String Request > ---------------------------------------

// Get Connection String request callback declaration
export namespace BuildConnectionInfoRequest {
	export const type = new RequestType<string, azdata.ConnectionInfo, void, void>('connection/buildconnectioninfo');
}

// Language Flavor Changed ================================================================================

/**
 * Parameters to provide when sending a language flavor changed notification
 */
export interface DidChangeLanguageFlavorParams {
	uri: string;
	language: string;
	flavor: string;
}

// ------------------------------- < Language Flavor Changed Notification > ---------------------------------------
export namespace LanguageFlavorChangedNotification {
	export const type = new NotificationType<DidChangeLanguageFlavorParams, void>('connection/languageflavorchanged');
}

// ------------------------------- < Table Metadata Request > ---------------------------------------

// Table metadata request format
export class TableMetadataParams {
	// Connection information to use for querying master
	public ownerUri: string;

	public schema: string;

	public objectName: string;
}

// Table metadata response format
export class TableMetadataResult {
	public columns: azdata.ColumnMetadata[];
}

// Table metadata request callback declaration
export namespace TableMetadataRequest {
	export const type = new RequestType<TableMetadataParams, TableMetadataResult, void, void>('metadata/table');
}

// ------------------------------- < View Metadata Request > ---------------------------------------

// Table metadata request callback declaration
export namespace ViewMetadataRequest {
	export const type = new RequestType<TableMetadataParams, TableMetadataResult, void, void>('metadata/view');
}

/**
 * Event sent when the language service is finished updating after a connection
 */
export namespace IntelliSenseReadyNotification {
	export const type = new NotificationType<types.IntelliSenseReadyParams, void>('textDocument/intelliSenseReady');
}

// ------------------------------- < Capabilties Discovery Event > ------------------------------------

export class CapabiltiesDiscoveryParams {
	public hostName: string;

	public hostVersion: string;
}

export namespace CapabiltiesDiscoveryRequest {
	export const type = new RequestType<CapabiltiesDiscoveryParams, types.CapabiltiesDiscoveryResult, void, void>('capabilities/list');
}

// Query Execution ================================================================================
// ------------------------------- < Query Cancellation Request > ------------------------------------
export namespace QueryCancelRequest {
	export const type = new RequestType<QueryCancelParams, azdata.QueryCancelResult, void, void>('query/cancel');
}

export interface QueryCancelParams {
	ownerUri: string;
}

// ------------------------------- < Query Dispose Request > ------------------------------------

export namespace QueryDisposeRequest {
	export const type = new RequestType<QueryDisposeParams, QueryDisposeResult, void, void>('query/dispose');
}

/**
 * Parameters to provide when disposing of a query
 */
export interface QueryDisposeParams {
	ownerUri: string;
}

/**
 * Result received upon successful disposal of a query
 */
export interface QueryDisposeResult {
}

// ------------------------------- < Query Execution Complete Notification > ------------------------------------
export namespace QueryExecuteCompleteNotification {
	export const type = new NotificationType<azdata.QueryExecuteCompleteNotificationResult, void>('query/complete');
}

// ------------------------------- < Query Batch Start  Notification > ------------------------------------
export namespace QueryExecuteBatchStartNotification {
	export const type = new NotificationType<azdata.QueryExecuteBatchNotificationParams, void>('query/batchStart');
}

// ------------------------------- < Query Batch Complete Notification > ------------------------------------
export namespace QueryExecuteBatchCompleteNotification {
	export const type = new NotificationType<azdata.QueryExecuteBatchNotificationParams, void>('query/batchComplete');
}

// ------------------------------- < Query ResultSet Complete Notification > ------------------------------------
export namespace QueryExecuteResultSetAvailableNotification {
	export const type = new NotificationType<azdata.QueryExecuteResultSetNotificationParams, void>('query/resultSetAvailable');
}

// ------------------------------- < Query Resultset available notification > ------------------------------------
export namespace QueryExecuteResultSetUpdatedNotification {
	export const type = new NotificationType<azdata.QueryExecuteResultSetNotificationParams, void>('query/resultSetUpdated');
}

// ------------------------------- < Query Message Notification > ------------------------------------
export namespace QueryExecuteMessageNotification {
	export const type = new NotificationType<azdata.QueryExecuteMessageParams, void>('query/message');
}

// ------------------------------- < Query Execution Request > ------------------------------------
export namespace QueryExecuteRequest {
	export const type = new RequestType<types.QueryExecuteParams, QueryExecuteResult, void, void>('query/executeDocumentSelection');
}

export interface QueryExecuteResult { }

// ------------------------------- < Query Results Request > ------------------------------------
export namespace QueryExecuteSubsetRequest {
	export const type = new RequestType<azdata.QueryExecuteSubsetParams, azdata.QueryExecuteSubsetResult, void, void>('query/subset');
}

export interface ResultSetSubset {
	rowCount: number;
	rows: azdata.DbCellValue[][];
}

// ------------------------------- < Execute Statement > ------------------------------------
export interface QueryExecuteStatementParams {
	ownerUri: string;
	line: number;
	column: number;
}

export namespace QueryExecuteStatementRequest {
	export const type = new RequestType<QueryExecuteStatementParams, QueryExecuteResult, void, void>('query/executedocumentstatement');
}

// --------------------------------- < Save Results as CSV Request > ------------------------------------------

// save results in csv format
export namespace SaveResultsAsCsvRequest {
	export const type = new RequestType<azdata.SaveResultsRequestParams, azdata.SaveResultRequestResult, void, void>('query/saveCsv');
}
// --------------------------------- </ Save Results as CSV Request > ------------------------------------------

// --------------------------------- < Save Results as JSON Request > ------------------------------------------
// save results in json format
export namespace SaveResultsAsJsonRequest {
	export const type = new RequestType<azdata.SaveResultsRequestParams, azdata.SaveResultRequestResult, void, void>('query/saveJson');
}
// --------------------------------- </ Save Results as JSON Request > ------------------------------------------

// --------------------------------- < Save Results as Excel Request > ------------------------------------------
// save results in Excel format
export namespace SaveResultsAsExcelRequest {
	export const type = new RequestType<azdata.SaveResultsRequestParams, azdata.SaveResultRequestResult, void, void>('query/saveExcel');
}
// --------------------------------- </ Save Results as Excel Request > ------------------------------------------

// --------------------------------- < Save Results as Xml Request > ------------------------------------------
// save results in Xml format
export namespace SaveResultsAsXmlRequest {
	export const type = new RequestType<azdata.SaveResultsRequestParams, azdata.SaveResultRequestResult, void, void>('query/saveXml');
}
// --------------------------------- </ Save Results as Xml Request > ------------------------------------------

// ------------------------------- < T-SQL Syntax Parse > -----------------------------------
export namespace SyntaxParseRequest {
	export const type = new RequestType<azdata.SyntaxParseParams, azdata.SyntaxParseResult, void, void>('query/syntaxparse');
}

// ------------------------------- < Execute and Return > -----------------------------------

export namespace SimpleExecuteRequest {
	export const type = new RequestType<azdata.SimpleExecuteParams, azdata.SimpleExecuteResult, void, void>('query/simpleexecute');
}

// ------------------------------- < Execute String > ------------------------------------
export interface QueryExecuteStringParams {
	query: string;
	ownerUri: string;
}

export namespace QueryExecuteStringRequest {
	export const type = new RequestType<QueryExecuteStringParams, QueryExecuteResult, void, void>('query/executeString');
}

// ------------------------------- < Query Options Request > ------------------------------------
export namespace QueryExecutionOptionsRequest {
	export const type = new RequestType<types.QueryExecutionOptionsParams, boolean, void, void>('query/setexecutionoptions');
}

// ------------------------------- < Metadata Events > ------------------------------------

export namespace MetadataQueryRequest {
	export const type = new RequestType<types.MetadataQueryParams, types.MetadataQueryResult, void, void>('metadata/list');
}

// ------------------------------- < Scripting Events > ------------------------------------

export namespace ScriptingRequest {
	export const type = new RequestType<types.ScriptingParams, azdata.ScriptingResult, void, void>('scripting/script');
}

// ------------------------------- < Scripting Complete Event > ------------------------------------

export namespace ScriptingCompleteNotification {
	export const type = new NotificationType<types.ScriptingCompleteParams, void>('scripting/scriptComplete');
}


// Edit Data ======================================================================================
// Shared Interfaces --------------------------------------------------------------------------
export interface EditSessionOperationParams {
	ownerUri: string;
}

export interface EditRowOperationParams extends EditSessionOperationParams {
	rowId: number;
}

export interface EditCellResult {
	cell: azdata.EditCell;
	isRowDirty: boolean;
}

// edit/commit --------------------------------------------------------------------------------
export namespace EditCommitRequest {
	export const type = new RequestType<azdata.EditCommitParams, EditCommitResult, void, void>('edit/commit');
}

export interface EditCommitResult { }

// edit/createRow -----------------------------------------------------------------------------
export namespace EditCreateRowRequest {
	export const type = new RequestType<azdata.EditCreateRowParams, azdata.EditCreateRowResult, void, void>('edit/createRow');
}

// edit/deleteRow -----------------------------------------------------------------------------
export namespace EditDeleteRowRequest {
	export const type = new RequestType<azdata.EditDeleteRowParams, EditDeleteRowResult, void, void>('edit/deleteRow');
}

export interface EditDeleteRowResult { }

// edit/dispose -------------------------------------------------------------------------------
export namespace EditDisposeRequest {
	export const type = new RequestType<azdata.EditDisposeParams, EditDisposeResult, void, void>('edit/dispose');
}

export interface EditDisposeResult { }

// edit/initialize ----------------------------------------------------------------------------
export namespace EditInitializeRequest {
	export const type = new RequestType<azdata.EditInitializeParams, EditInitializeResult, void, void>('edit/initialize');
}

export interface EditInitializeResult { }

// edit/revertCell --------------------------------------------------------------------------------
export namespace EditRevertCellRequest {
	export const type = new RequestType<azdata.EditRevertCellParams, azdata.EditRevertCellResult, void, void>('edit/revertCell');
}

// edit/revertRow -----------------------------------------------------------------------------
export namespace EditRevertRowRequest {
	export const type = new RequestType<azdata.EditRevertRowParams, EditRevertRowResult, void, void>('edit/revertRow');
}

export interface EditRevertRowResult { }

// edit/sessionReady Event --------------------------------------------------------------------
export namespace EditSessionReadyNotification {
	export const type = new NotificationType<azdata.EditSessionReadyParams, void>('edit/sessionReady');
}

// edit/updateCell ----------------------------------------------------------------------------
export namespace EditUpdateCellRequest {
	export const type = new RequestType<azdata.EditUpdateCellParams, azdata.EditUpdateCellResult, void, void>('edit/updateCell');
}

// edit/subset ------------------------------------------------------------------------------------
export namespace EditSubsetRequest {
	export const type = new RequestType<azdata.EditSubsetParams, azdata.EditSubsetResult, void, void>('edit/subset');
}

// ------------------------------- < Object Explorer Events > ------------------------------------

export namespace ObjectExplorerCreateSessionRequest {
	export const type = new RequestType<azdata.ConnectionInfo, types.CreateSessionResponse, void, void>('objectexplorer/createsession');
}

export namespace ObjectExplorerExpandRequest {
	export const type = new RequestType<types.ExpandParams, boolean, void, void>('objectexplorer/expand');
}

export namespace ObjectExplorerRefreshRequest {
	export const type = new RequestType<types.ExpandParams, boolean, void, void>('objectexplorer/refresh');
}

export namespace ObjectExplorerCloseSessionRequest {
	export const type = new RequestType<types.CloseSessionParams, types.CloseSessionResponse, void, void>('objectexplorer/closesession');
}

export namespace ObjectExplorerFindNodesRequest {
	export const type = new RequestType<types.FindNodesParams, types.FindNodesResponse, void, void>('objectexplorer/findnodes');
}

// ------------------------------- < Object Explorer Events > ------------------------------------


export namespace ObjectExplorerCreateSessionCompleteNotification {
	export const type = new NotificationType<types.SessionCreatedParameters, void>('objectexplorer/sessioncreated');
}

export namespace ObjectExplorerSessionDisconnectedNotification {
	export const type = new NotificationType<types.SessionDisconnectedParameters, void>('objectexplorer/sessiondisconnected');
}

export namespace ObjectExplorerExpandCompleteNotification {
	export const type = new NotificationType<types.ExpandResponse, void>('objectexplorer/expandCompleted');
}

// ------------------------------- < Task Service Events > ------------------------------------

export namespace ListTasksRequest {
	export const type = new RequestType<azdata.ListTasksParams, azdata.ListTasksResponse, void, void>('tasks/listtasks');
}

export namespace CancelTaskRequest {
	export const type = new RequestType<azdata.CancelTaskParams, boolean, void, void>('tasks/canceltask');
}

// ------------------------------- < Task Service Events > ------------------------------------


export namespace TaskStatusChangedNotification {
	export const type = new NotificationType<azdata.TaskProgressInfo, void>('tasks/statuschanged');
}

export namespace TaskCreatedNotification {
	export const type = new NotificationType<azdata.TaskInfo, void>('tasks/newtaskcreated');
}

// ------------------------------- < Admin Service Events > ------------------------------------

export namespace CreateDatabaseRequest {
	export const type = new RequestType<types.CreateDatabaseParams, azdata.CreateDatabaseResponse, void, void>('admin/createdatabase');
}

export namespace DefaultDatabaseInfoRequest {
	export const type = new RequestType<types.DefaultDatabaseInfoParams, types.DefaultDatabaseInfoResponse, void, void>('admin/defaultdatabaseinfo');
}

export namespace CreateLoginRequest {
	export const type = new RequestType<types.CreateLoginParams, azdata.CreateLoginResponse, void, void>('admin/createlogin');
}

export namespace GetDatabaseInfoRequest {
	export const type = new RequestType<types.GetDatabaseInfoParams, types.GetDatabaseInfoResponse, void, void>('admin/getdatabaseinfo');
}

// ------------------------------- < Disaster Recovery Events > ------------------------------------

export namespace BackupRequest {
	export const type = new RequestType<types.BackupParams, azdata.BackupResponse, void, void>('backup/backup');
}

export namespace BackupConfigInfoRequest {
	export const type = new RequestType<types.DefaultDatabaseInfoParams, types.BackupConfigInfoResponse, void, void>('backup/backupconfiginfo');
}

export namespace RestoreRequest {
	export const type = new RequestType<types.RestoreParams, azdata.RestoreResponse, void, void>('restore/restore');
}

export namespace RestorePlanRequest {
	export const type = new RequestType<types.RestoreParams, azdata.RestorePlanResponse, void, void>('restore/restoreplan');
}

export namespace CancelRestorePlanRequest {
	export const type = new RequestType<types.RestoreParams, boolean, void, void>('restore/cancelrestoreplan');
}

export namespace RestoreConfigInfoRequest {
	export const type = new RequestType<types.RestoreConfigInfoRequestParams, types.RestoreConfigInfoResponse, void, void>('restore/restoreconfiginfo');
}

// ------------------------------- < File Browser Events > ------------------------------------

export namespace FileBrowserOpenRequest {
	export const type = new RequestType<types.FileBrowserOpenParams, boolean, void, void>('filebrowser/open');
}

export namespace FileBrowserOpenedNotification {
	export const type = new NotificationType<azdata.FileBrowserOpenedParams, void>('filebrowser/opencomplete');
}

export namespace FileBrowserExpandRequest {
	export const type = new RequestType<types.FileBrowserExpandParams, boolean, void, void>('filebrowser/expand');
}

export namespace FileBrowserExpandedNotification {
	export const type = new NotificationType<azdata.FileBrowserExpandedParams, void>('filebrowser/expandcomplete');
}

export namespace FileBrowserValidateRequest {
	export const type = new RequestType<types.FileBrowserValidateParams, boolean, void, void>('filebrowser/validate');
}

export namespace FileBrowserValidatedNotification {
	export const type = new NotificationType<azdata.FileBrowserValidatedParams, void>('filebrowser/validatecomplete');
}

export namespace FileBrowserCloseRequest {
	export const type = new RequestType<types.FileBrowserCloseParams, azdata.FileBrowserCloseResponse, void, void>('filebrowser/close');
}


// ------------------------------- < Profiler Events > ------------------------------------

export namespace CreateXEventSessionRequest {
	export const type = new RequestType<types.CreateXEventSessionParams, types.CreateXEventSessionResponse, void, void>('profiler/createsession');
}

export namespace StartProfilingRequest {
	export const type = new RequestType<types.StartProfilingParams, types.StartProfilingResponse, void, void>('profiler/start');
}

export namespace StopProfilingRequest {
	export const type = new RequestType<types.StopProfilingParams, types.StopProfilingResponse, void, void>('profiler/stop');
}

export namespace PauseProfilingRequest {
	export const type = new RequestType<types.PauseProfilingParams, types.PauseProfilingResponse, void, void>('profiler/pause');
}

export namespace GetXEventSessionsRequest {
	export const type = new RequestType<types.GetXEventSessionsParams, types.GetXEventSessionsResponse, void, void>('profiler/getsessions');
}

export namespace DisconnectSessionRequest {
	export const type = new RequestType<types.DisconnectSessionParams, types.DisconnectSessionResponse, void, void>('profiler/disconnect');
}

export namespace ProfilerEventsAvailableNotification {
	export const type = new NotificationType<types.ProfilerEventsAvailableParams, void>('profiler/eventsavailable');
}

export namespace ProfilerSessionStoppedNotification {
	export const type = new NotificationType<types.ProfilerSessionStoppedParams, void>('profiler/sessionstopped');
}

export namespace ProfilerSessionCreatedNotification {
	export const type = new NotificationType<types.ProfilerSessionCreatedParams, void>('profiler/sessioncreated');
}
