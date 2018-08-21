import { ClientCapabilities as VSClientCapabilities, RequestType, NotificationType } from 'vscode-languageclient';
import * as types from './types';
import * as sqlops from 'sqlops';
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
/**
 * Notification sent when the an IntelliSense cache invalidation is requested
 */
export declare namespace RebuildIntelliSenseNotification {
    const type: NotificationType<RebuildIntelliSenseParams, void>;
}
/**
 * Rebuild IntelliSense notification parameters
 */
export declare class RebuildIntelliSenseParams {
    /**
     * URI identifying the text document
     */
    ownerUri: string;
}
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
    connection: sqlops.ConnectionInfo;
}
export declare namespace ConnectionRequest {
    const type: RequestType<ConnectParams, boolean, void, void>;
}
export declare namespace ConnectionCompleteNotification {
    const type: NotificationType<types.ConnectionCompleteParams, void>;
}
/**
 * Parameters for the ConnectionChanged notification.
 */
export declare class ConnectionChangedParams {
    /**
     * Owner URI of the connection that changed.
     */
    ownerUri: string;
    /**
     * Summary of details containing any connection changes.
     */
    connection: types.ConnectionSummary;
}
/**
 * Connection changed event callback declaration.
 */
export declare namespace ConnectionChangedNotification {
    const type: NotificationType<ConnectionChangedParams, void>;
}
export declare class DisconnectParams {
    ownerUri: string;
}
export declare type DisconnectResult = boolean;
export declare namespace DisconnectRequest {
    const type: RequestType<DisconnectParams, boolean, void, void>;
}
export declare class CancelConnectParams {
    /**
     * URI identifying the owner of the connection
     */
    ownerUri: string;
}
export declare type CancelConnectResult = boolean;
export declare namespace CancelConnectRequest {
    const type: RequestType<CancelConnectParams, boolean, void, void>;
}
export declare class ChangeDatabaseParams {
    ownerUri: string;
    newDatabase: string;
}
export declare namespace ChangeDatabaseRequest {
    const type: RequestType<ChangeDatabaseParams, boolean, void, void>;
}
export declare class ListDatabasesParams {
    ownerUri: string;
}
export declare namespace ListDatabasesRequest {
    const type: RequestType<ListDatabasesParams, sqlops.ListDatabasesResult, void, void>;
}
export declare class GetConnectionStringParams {
    ownerUri: string;
    includePassword: boolean;
}
export declare namespace GetConnectionStringRequest {
    const type: RequestType<GetConnectionStringParams, string, void, void>;
}
export declare namespace BuildConnectionInfoRequest {
    const type: RequestType<string, sqlops.ConnectionInfo, void, void>;
}
/**
 * Parameters to provide when sending a language flavor changed notification
 */
export interface DidChangeLanguageFlavorParams {
    uri: string;
    language: string;
    flavor: string;
}
export declare namespace LanguageFlavorChangedNotification {
    const type: NotificationType<DidChangeLanguageFlavorParams, void>;
}
export declare class TableMetadataParams {
    ownerUri: string;
    schema: string;
    objectName: string;
}
export declare class TableMetadataResult {
    columns: sqlops.ColumnMetadata[];
}
export declare namespace TableMetadataRequest {
    const type: RequestType<TableMetadataParams, TableMetadataResult, void, void>;
}
export declare namespace ViewMetadataRequest {
    const type: RequestType<TableMetadataParams, TableMetadataResult, void, void>;
}
/**
 * Event sent when the language service is finished updating after a connection
 */
export declare namespace IntelliSenseReadyNotification {
    const type: NotificationType<types.IntelliSenseReadyParams, void>;
}
export declare class CapabiltiesDiscoveryParams {
    hostName: string;
    hostVersion: string;
}
export declare namespace CapabiltiesDiscoveryRequest {
    const type: RequestType<CapabiltiesDiscoveryParams, types.CapabiltiesDiscoveryResult, void, void>;
}
export declare namespace QueryCancelRequest {
    const type: RequestType<QueryCancelParams, sqlops.QueryCancelResult, void, void>;
}
export interface QueryCancelParams {
    ownerUri: string;
}
export declare namespace QueryDisposeRequest {
    const type: RequestType<QueryDisposeParams, QueryDisposeResult, void, void>;
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
export declare namespace QueryExecuteCompleteNotification {
    const type: NotificationType<sqlops.QueryExecuteCompleteNotificationResult, void>;
}
export declare namespace QueryExecuteBatchStartNotification {
    const type: NotificationType<sqlops.QueryExecuteBatchNotificationParams, void>;
}
export declare namespace QueryExecuteBatchCompleteNotification {
    const type: NotificationType<sqlops.QueryExecuteBatchNotificationParams, void>;
}
export declare namespace QueryExecuteResultSetCompleteNotification {
    const type: NotificationType<sqlops.QueryExecuteResultSetCompleteNotificationParams, void>;
}
export declare namespace QueryExecuteMessageNotification {
    const type: NotificationType<sqlops.QueryExecuteMessageParams, void>;
}
export declare namespace QueryExecuteRequest {
    const type: RequestType<types.QueryExecuteParams, QueryExecuteResult, void, void>;
}
export interface QueryExecuteResult {
}
export declare namespace QueryExecuteSubsetRequest {
    const type: RequestType<sqlops.QueryExecuteSubsetParams, sqlops.QueryExecuteSubsetResult, void, void>;
}
export interface ResultSetSubset {
    rowCount: number;
    rows: sqlops.DbCellValue[][];
}
export interface QueryExecuteStatementParams {
    ownerUri: string;
    line: number;
    column: number;
}
export declare namespace QueryExecuteStatementRequest {
    const type: RequestType<QueryExecuteStatementParams, QueryExecuteResult, void, void>;
}
export declare namespace SaveResultsAsCsvRequest {
    const type: RequestType<sqlops.SaveResultsRequestParams, sqlops.SaveResultRequestResult, void, void>;
}
export declare namespace SaveResultsAsJsonRequest {
    const type: RequestType<sqlops.SaveResultsRequestParams, sqlops.SaveResultRequestResult, void, void>;
}
export declare namespace SaveResultsAsExcelRequest {
    const type: RequestType<sqlops.SaveResultsRequestParams, sqlops.SaveResultRequestResult, void, void>;
}
export declare namespace SyntaxParseRequest {
    const type: RequestType<sqlops.SyntaxParseParams, sqlops.SyntaxParseResult, void, void>;
}
export declare namespace SimpleExecuteRequest {
    const type: RequestType<sqlops.SimpleExecuteParams, sqlops.SimpleExecuteResult, void, void>;
}
export interface QueryExecuteStringParams {
    query: string;
    ownerUri: string;
}
export declare namespace QueryExecuteStringRequest {
    const type: RequestType<QueryExecuteStringParams, QueryExecuteResult, void, void>;
}
export declare namespace MetadataQueryRequest {
    const type: RequestType<types.MetadataQueryParams, types.MetadataQueryResult, void, void>;
}
export declare namespace ScriptingRequest {
    const type: RequestType<types.ScriptingParams, sqlops.ScriptingResult, void, void>;
}
export declare namespace ScriptingCompleteNotification {
    const type: NotificationType<types.ScriptingCompleteParams, void>;
}
export interface EditSessionOperationParams {
    ownerUri: string;
}
export interface EditRowOperationParams extends EditSessionOperationParams {
    rowId: number;
}
export interface EditCellResult {
    cell: sqlops.EditCell;
    isRowDirty: boolean;
}
export declare namespace EditCommitRequest {
    const type: RequestType<sqlops.EditCommitParams, EditCommitResult, void, void>;
}
export interface EditCommitResult {
}
export declare namespace EditCreateRowRequest {
    const type: RequestType<sqlops.EditCreateRowParams, sqlops.EditCreateRowResult, void, void>;
}
export declare namespace EditDeleteRowRequest {
    const type: RequestType<sqlops.EditDeleteRowParams, EditDeleteRowResult, void, void>;
}
export interface EditDeleteRowResult {
}
export declare namespace EditDisposeRequest {
    const type: RequestType<sqlops.EditDisposeParams, EditDisposeResult, void, void>;
}
export interface EditDisposeResult {
}
export declare namespace EditInitializeRequest {
    const type: RequestType<sqlops.EditInitializeParams, EditInitializeResult, void, void>;
}
export interface EditInitializeResult {
}
export declare namespace EditRevertCellRequest {
    const type: RequestType<sqlops.EditRevertCellParams, sqlops.EditRevertCellResult, void, void>;
}
export declare namespace EditRevertRowRequest {
    const type: RequestType<sqlops.EditRevertRowParams, EditRevertRowResult, void, void>;
}
export interface EditRevertRowResult {
}
export declare namespace EditSessionReadyNotification {
    const type: NotificationType<sqlops.EditSessionReadyParams, void>;
}
export declare namespace EditUpdateCellRequest {
    const type: RequestType<sqlops.EditUpdateCellParams, sqlops.EditUpdateCellResult, void, void>;
}
export declare namespace EditSubsetRequest {
    const type: RequestType<sqlops.EditSubsetParams, sqlops.EditSubsetResult, void, void>;
}
export declare namespace ObjectExplorerCreateSessionRequest {
    const type: RequestType<sqlops.ConnectionInfo, types.CreateSessionResponse, void, void>;
}
export declare namespace ObjectExplorerExpandRequest {
    const type: RequestType<types.ExpandParams, boolean, void, void>;
}
export declare namespace ObjectExplorerRefreshRequest {
    const type: RequestType<types.ExpandParams, boolean, void, void>;
}
export declare namespace ObjectExplorerCloseSessionRequest {
    const type: RequestType<types.CloseSessionParams, types.CloseSessionResponse, void, void>;
}
export declare namespace ObjectExplorerFindNodesRequest {
    const type: RequestType<types.FindNodesParams, types.FindNodesResponse, void, void>;
}
export declare namespace ObjectExplorerCreateSessionCompleteNotification {
    const type: NotificationType<types.SessionCreatedParameters, void>;
}
export declare namespace ObjectExplorerExpandCompleteNotification {
    const type: NotificationType<types.ExpandResponse, void>;
}
export declare namespace ListTasksRequest {
    const type: RequestType<sqlops.ListTasksParams, sqlops.ListTasksResponse, void, void>;
}
export declare namespace CancelTaskRequest {
    const type: RequestType<sqlops.CancelTaskParams, boolean, void, void>;
}
export declare namespace TaskStatusChangedNotification {
    const type: NotificationType<sqlops.TaskProgressInfo, void>;
}
export declare namespace TaskCreatedNotification {
    const type: NotificationType<sqlops.TaskInfo, void>;
}
export declare namespace CreateDatabaseRequest {
    const type: RequestType<types.CreateDatabaseParams, sqlops.CreateDatabaseResponse, void, void>;
}
export declare namespace DefaultDatabaseInfoRequest {
    const type: RequestType<types.DefaultDatabaseInfoParams, types.DefaultDatabaseInfoResponse, void, void>;
}
export declare namespace CreateLoginRequest {
    const type: RequestType<types.CreateLoginParams, sqlops.CreateLoginResponse, void, void>;
}
export declare namespace GetDatabaseInfoRequest {
    const type: RequestType<types.GetDatabaseInfoParams, types.GetDatabaseInfoResponse, void, void>;
}
export declare namespace BackupRequest {
    const type: RequestType<types.BackupParams, sqlops.BackupResponse, void, void>;
}
export declare namespace BackupConfigInfoRequest {
    const type: RequestType<types.DefaultDatabaseInfoParams, types.BackupConfigInfoResponse, void, void>;
}
export declare namespace RestoreRequest {
    const type: RequestType<types.RestoreParams, sqlops.RestoreResponse, void, void>;
}
export declare namespace RestorePlanRequest {
    const type: RequestType<types.RestoreParams, sqlops.RestorePlanResponse, void, void>;
}
export declare namespace CancelRestorePlanRequest {
    const type: RequestType<types.RestoreParams, boolean, void, void>;
}
export declare namespace RestoreConfigInfoRequest {
    const type: RequestType<types.RestoreConfigInfoRequestParams, types.RestoreConfigInfoResponse, void, void>;
}
export declare namespace FileBrowserOpenRequest {
    const type: RequestType<types.FileBrowserOpenParams, boolean, void, void>;
}
export declare namespace FileBrowserOpenedNotification {
    const type: NotificationType<sqlops.FileBrowserOpenedParams, void>;
}
export declare namespace FileBrowserExpandRequest {
    const type: RequestType<types.FileBrowserExpandParams, boolean, void, void>;
}
export declare namespace FileBrowserExpandedNotification {
    const type: NotificationType<sqlops.FileBrowserExpandedParams, void>;
}
export declare namespace FileBrowserValidateRequest {
    const type: RequestType<types.FileBrowserValidateParams, boolean, void, void>;
}
export declare namespace FileBrowserValidatedNotification {
    const type: NotificationType<sqlops.FileBrowserValidatedParams, void>;
}
export declare namespace FileBrowserCloseRequest {
    const type: RequestType<types.FileBrowserCloseParams, sqlops.FileBrowserCloseResponse, void, void>;
}
export declare namespace CreateXEventSessionRequest {
    const type: RequestType<types.CreateXEventSessionParams, types.CreateXEventSessionResponse, void, void>;
}
export declare namespace StartProfilingRequest {
    const type: RequestType<types.StartProfilingParams, types.StartProfilingResponse, void, void>;
}
export declare namespace StopProfilingRequest {
    const type: RequestType<types.StopProfilingParams, types.StopProfilingResponse, void, void>;
}
export declare namespace PauseProfilingRequest {
    const type: RequestType<types.PauseProfilingParams, types.PauseProfilingResponse, void, void>;
}
export declare namespace GetXEventSessionsRequest {
    const type: RequestType<types.GetXEventSessionsParams, types.GetXEventSessionsResponse, void, void>;
}
export declare namespace ProfilerEventsAvailableNotification {
    const type: NotificationType<types.ProfilerEventsAvailableParams, void>;
}
export declare namespace ProfilerSessionStoppedNotification {
    const type: NotificationType<types.ProfilerSessionStoppedParams, void>;
}
export declare namespace ProfilerSessionCreatedNotification {
    const type: NotificationType<types.ProfilerSessionCreatedParams, void>;
}
