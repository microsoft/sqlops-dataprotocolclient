import {
	LanguageClient, ServerOptions, LanguageClientOptions as VSLanguageClientOptions, DynamicFeature, ServerCapabilities, RegistrationData,
	RPCMessageType, Disposable, RequestType, NotificationType
} from 'vscode-languageclient';

import * as is from 'vscode-languageclient/lib/utils/is';
import * as UUID from 'vscode-languageclient/lib/utils/uuid';

import * as azdata from 'azdata';
import * as vscode from 'vscode';

import { c2p, Ic2p } from './codeConverter';

import * as protocol from './protocol';
import * as types from './types';
import { Ip2c, p2c } from './protocolConverter';

function ensure<T, K extends keyof T>(target: T, key: K): T[K] {
	if (target[key] === void 0) {
		target[key] = {} as any;
	}
	return target[key];
}

export interface ISqlOpsFeature {
	new(client: SqlOpsDataClient);
}

export interface ClientOptions extends VSLanguageClientOptions {
	providerId: string;
	features?: Array<ISqlOpsFeature>;
}

/**
 *
 */
export abstract class SqlOpsFeature<T> implements DynamicFeature<T> {

	protected _providers: Map<string, Disposable> = new Map<string, Disposable>();
	protected _disposables: Disposable[] = [];

	constructor(protected _client: SqlOpsDataClient, private _message: RPCMessageType | RPCMessageType[]) {
	}

	public get messages(): RPCMessageType | RPCMessageType[] {
		return this._message;
	}

	public abstract fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;

	public abstract initialize(capabilities: ServerCapabilities): void;

	public register(messages: RPCMessageType | RPCMessageType[], data: RegistrationData<T>): void {
		// Error catching
		if (is.array<RPCMessageType>(this.messages) && is.array<RPCMessageType>(messages)) {
			let valid = messages.every(v => !!(this.messages as RPCMessageType[]).find(i => i.method === v.method));
			if (!valid) {
				throw new Error(`Register called on wrong feature.`);
			}
		} else if (is.array<RPCMessageType>(this.messages) && !is.array<RPCMessageType>(messages)) {
			if (!this.messages.find(i => i.method === messages.method)) {
				throw new Error(`Register called on wrong feature.`);
			}
		} else if (!is.array<RPCMessageType>(this.messages) && !is.array<RPCMessageType>(messages)) {
			if (this.messages.method !== messages.method) {
				throw new Error(`Register called on wrong feature. Requested ${messages.method} but reached feature ${this.messages.method}`);
			}
		}

		let provider = this.registerProvider(data.registerOptions);
		if (provider) {
			this._providers.set(data.id, provider);
		}
	}

	protected abstract registerProvider(options: T): Disposable;

	public unregister(id: string): void {
		let provider = this._providers.get(id);
		if (provider) {
			provider.dispose();
			// TODO Should remove it from list
		}
	}

	public dispose(): void {
		this._providers.forEach((value) => {
			value.dispose();
		});
		this._disposables.forEach(d => d.dispose());
		this._providers.clear();
		this._disposables = [];
	}

	/**
	 * Registers an EventEmitter for the specified notification, which will fire an event whenever that notification is received.
	 */
	protected registerNotificationEmitter<P, RO>(notificationType: NotificationType<P, RO>): vscode.EventEmitter<P> {
		const eventEmitter = new vscode.EventEmitter<P>();
		this._disposables.push(eventEmitter);
		this._client.onNotification(notificationType, params => {
			eventEmitter.fire(params);
		});
		return eventEmitter;
	}
}

export class CapabilitiesFeature extends SqlOpsFeature<undefined> {

	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.CapabiltiesDiscoveryRequest.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, CapabilitiesFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'capabilities')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;

		let getServerCapabilities = (cap: azdata.DataProtocolClientCapabilities): Thenable<azdata.DataProtocolServerCapabilities> => {
			return client.sendRequest(protocol.CapabiltiesDiscoveryRequest.type, cap).then(
				client.sqlp2c.asServerCapabilities,
				e => {
					client.logFailedRequest(protocol.CapabiltiesDiscoveryRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		return azdata.dataprotocol.registerCapabilitiesServiceProvider({
			providerId: client.providerId,
			getServerCapabilities
		});
	}
}

export class ConnectionFeature extends SqlOpsFeature<undefined> {

	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.ConnectionRequest.type,
		protocol.ConnectionCompleteNotification.type,
		protocol.ConnectionChangedNotification.type,
		protocol.DisconnectRequest.type,
		protocol.CancelConnectRequest.type,
		protocol.ChangeDatabaseRequest.type,
		protocol.ListDatabasesRequest.type,
		protocol.GetConnectionStringRequest.type,
		protocol.LanguageFlavorChangedNotification.type,
		protocol.ChangePasswordRequest.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, ConnectionFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'connection')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;
		let connect = (connUri: string, connInfo: azdata.ConnectionInfo): Thenable<boolean> => {
			return client.sendRequest(protocol.ConnectionRequest.type, client.sqlc2p.asConnectionParams(connUri, connInfo)).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.ConnectionRequest.type, e);
					return Promise.resolve(false);
				}
			);
		};

		let changePassword = (ownerUri: string, connInfo: azdata.ConnectionInfo, newPassword: string): Thenable<azdata.PasswordChangeResult> => {
			let params: protocol.ChangePasswordParams = {
				ownerUri,
				connection: {
					options: connInfo.options
				},
				newPassword
			};
			return client.sendRequest(protocol.ChangePasswordRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.ChangePasswordRequest.type, e);
					return Promise.resolve(false);
				}
			);
		};

		let disconnect = (ownerUri: string): Thenable<boolean> => {
			let params: protocol.DisconnectParams = {
				ownerUri
			};

			return client.sendRequest(protocol.DisconnectRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.DisconnectRequest.type, e);
					return Promise.resolve(false);
				}
			);
		};

		let cancelConnect = (ownerUri: string): Thenable<boolean> => {
			let params: protocol.CancelConnectParams = {
				ownerUri
			};

			return client.sendRequest(protocol.CancelConnectRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.CancelConnectRequest.type, e);
					return Promise.resolve(false);
				}
			);
		};

		let changeDatabase = (ownerUri: string, newDatabase: string): Thenable<boolean> => {
			let params: protocol.ChangeDatabaseParams = {
				ownerUri,
				newDatabase
			};

			return client.sendRequest(protocol.ChangeDatabaseRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.ChangeDatabaseRequest.type, e);
					return Promise.resolve(false);
				}
			);
		};

		let listDatabases = (ownerUri: string): Thenable<azdata.ListDatabasesResult> => {
			let params: protocol.ListDatabasesParams = {
				ownerUri
			};

			return client.sendRequest(protocol.ListDatabasesRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.ListDatabasesRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let getConnectionString = (ownerUri: string, includePassword: boolean): Thenable<string> => {
			let params: protocol.GetConnectionStringParams = {
				ownerUri,
				includePassword
			};

			return client.sendRequest(protocol.GetConnectionStringRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.GetConnectionStringRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let buildConnectionInfo = (connectionString: string): Thenable<azdata.ConnectionInfo> => {
			return client.sendRequest(protocol.BuildConnectionInfoRequest.type, connectionString).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.BuildConnectionInfoRequest.type, e);
					return Promise.resolve(e);
				}
			);
		};

		let rebuildIntelliSenseCache = (ownerUri: string): Thenable<void> => {
			let params: protocol.RebuildIntelliSenseParams = {
				ownerUri
			};

			client.sendNotification(protocol.RebuildIntelliSenseNotification.type, params);
			return Promise.resolve();
		};

		const onConnectionCompleteEventEmitter = this.registerNotificationEmitter(protocol.ConnectionCompleteNotification.type);
		let registerOnConnectionComplete = (handler: (connSummary: azdata.ConnectionInfoSummary) => any): vscode.Disposable => {
			return onConnectionCompleteEventEmitter.event(handler);
		};

		const onIntelliSenseReadyEventEmitter = this.registerNotificationEmitter(protocol.IntelliSenseReadyNotification.type);
		let registerOnIntelliSenseCacheComplete = (handler: (connectionUri: string) => any): vscode.Disposable => {
			return onIntelliSenseReadyEventEmitter.event(params => handler(params.ownerUri));
		};

		const onConnectionChangedEventEmitter = this.registerNotificationEmitter(protocol.ConnectionChangedNotification.type);
		let registerOnConnectionChanged = (handler: (changedConnInfo: azdata.ChangedConnectionInfo) => any): vscode.Disposable => {
			// NOTE: The parameter types here are currently different than what's defined in ADS - that uses "connectionUri" while
			// this uses "ownerUri". So we need to translate that here so that the object ADS gets is actually correct.
			// See https://github.com/microsoft/sqlops-dataprotocolclient/issues/88 for details
			return onConnectionChangedEventEmitter.event(params => handler({
				connectionUri: params.ownerUri,
				connection: params.connection
			}));
		};

		azdata.dataprotocol.onDidChangeLanguageFlavor((params) => {
			client.sendNotification(protocol.LanguageFlavorChangedNotification.type, params);
		});

		return azdata.dataprotocol.registerConnectionProvider({
			providerId: client.providerId,
			connect,
			disconnect,
			cancelConnect,
			changeDatabase,
			changePassword,
			listDatabases,
			getConnectionString,
			buildConnectionInfo,
			rebuildIntelliSenseCache,
			registerOnConnectionChanged,
			registerOnIntelliSenseCacheComplete,
			registerOnConnectionComplete
		});
	}
}

export class QueryFeature extends SqlOpsFeature<undefined> {
	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.QueryExecuteRequest.type,
		protocol.QueryCancelRequest.type,
		protocol.QueryExecuteStatementRequest.type,
		protocol.QueryExecuteStringRequest.type,
		protocol.SimpleExecuteRequest.type,
		protocol.QueryExecuteSubsetRequest.type,
		protocol.QueryDisposeRequest.type,
		protocol.ConnectionUriChangedNotification.type,
		protocol.QueryExecuteCompleteNotification.type,
		protocol.QueryExecuteBatchStartNotification.type,
		protocol.QueryExecuteBatchCompleteNotification.type,
		protocol.QueryExecuteResultSetAvailableNotification.type,
		protocol.QueryExecuteResultSetUpdatedNotification.type,
		protocol.QueryExecuteMessageNotification.type,
		protocol.QueryExecutionOptionsRequest.type,
		protocol.SaveResultsAsCsvRequest.type,
		protocol.SaveResultsAsJsonRequest.type,
		protocol.SaveResultsAsMarkdownRequest.type,
		protocol.SaveResultsAsExcelRequest.type,
		protocol.SaveResultsAsXmlRequest.type,
		protocol.CopyResultsRequest.type,
		protocol.EditCommitRequest.type,
		protocol.EditCreateRowRequest.type,
		protocol.EditDeleteRowRequest.type,
		protocol.EditDisposeRequest.type,
		protocol.EditInitializeRequest.type,
		protocol.EditRevertCellRequest.type,
		protocol.EditRevertRowRequest.type,
		protocol.EditUpdateCellRequest.type,
		protocol.EditSubsetRequest.type,
		protocol.EditSessionReadyNotification.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, QueryFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'query')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;
		let runQuery = (ownerUri: string, querySelection: azdata.ISelectionData, executionPlanOptions?: azdata.ExecutionPlanOptions): Thenable<void> => {
			let params: types.QueryExecuteParams = {
				ownerUri,
				querySelection,
				executionPlanOptions: client.sqlc2p.asExecutionPlanOptions(executionPlanOptions)
			};
			return client.sendRequest(protocol.QueryExecuteRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.QueryExecuteRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let cancelQuery = (ownerUri: string): Thenable<azdata.QueryCancelResult> => {
			let params: protocol.QueryCancelParams = { ownerUri };
			return client.sendRequest(protocol.QueryCancelRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.QueryCancelRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let runQueryStatement = (ownerUri: string, line: number, column: number): Thenable<void> => {
			let params: protocol.QueryExecuteStatementParams = {
				ownerUri,
				line,
				column
			};
			return client.sendRequest(protocol.QueryExecuteStatementRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.QueryExecuteStatementRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let runQueryString = (ownerUri: string, query: string): Thenable<void> => {
			let params: protocol.QueryExecuteStringParams = { ownerUri, query };
			return client.sendRequest(protocol.QueryExecuteStringRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.QueryExecuteStringRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let runQueryAndReturn = (ownerUri: string, queryString: string): Thenable<azdata.SimpleExecuteResult> => {
			let params: azdata.SimpleExecuteParams = { ownerUri, queryString };
			return client.sendRequest(protocol.SimpleExecuteRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.SimpleExecuteRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let parseSyntax = (ownerUri: string, query: string): Thenable<azdata.SyntaxParseResult> => {
			let params: azdata.SyntaxParseParams = { ownerUri, query };
			return client.sendRequest(protocol.SyntaxParseRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.SyntaxParseRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let getQueryRows = (rowData: azdata.QueryExecuteSubsetParams): Thenable<azdata.QueryExecuteSubsetResult> => {
			return client.sendRequest(protocol.QueryExecuteSubsetRequest.type, rowData).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.QueryExecuteSubsetRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let disposeQuery = (ownerUri: string): Thenable<void> => {
			let params: protocol.QueryDisposeParams = { ownerUri };
			return client.sendRequest(protocol.QueryDisposeRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.QueryDisposeRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let connectionUriChanged = (newOwnerUri: string, originalOwnerUri: string): Thenable<void> => {
			let params: protocol.ConnectionUriChangedParams = {
				newOwnerUri,
				originalOwnerUri
			};

			client.sendNotification(protocol.ConnectionUriChangedNotification.type, params);
			return Promise.resolve();
		};

		const onQueryCompleteEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteCompleteNotification.type);
		let registerOnQueryComplete = (handler: (result: azdata.QueryExecuteCompleteNotificationResult) => any): vscode.Disposable => {
			return onQueryCompleteEventEmitter.event(handler);
		};

		const onQueryExecuteBatchStartEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteBatchStartNotification.type);
		let registerOnBatchStart = (handler: (batchInfo: azdata.QueryExecuteBatchNotificationParams) => any): vscode.Disposable => {
			return onQueryExecuteBatchStartEventEmitter.event(handler);
		};

		const onQueryExecuteBatchCompleteEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteBatchCompleteNotification.type);
		let registerOnBatchComplete = (handler: (batchInfo: azdata.QueryExecuteBatchNotificationParams) => any): vscode.Disposable => {
			return onQueryExecuteBatchCompleteEventEmitter.event(handler);
		};

		const onQueryExecuteResultSetAvailableEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteResultSetAvailableNotification.type);
		let registerOnResultSetAvailable = (handler: (resultSetInfo: azdata.QueryExecuteResultSetNotificationParams) => any): vscode.Disposable => {
			return onQueryExecuteResultSetAvailableEventEmitter.event(handler);
		};

		const onQueryExecuteResultSetUpdatedEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteResultSetUpdatedNotification.type);
		let registerOnResultSetUpdated = (handler: (resultSetInfo: azdata.QueryExecuteResultSetNotificationParams) => any): vscode.Disposable => {
			return onQueryExecuteResultSetUpdatedEventEmitter.event(handler);
		};

		const onQueryExecuteMessageEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteMessageNotification.type);
		let registerOnMessage = (handler: (message: azdata.QueryExecuteMessageParams) => any): vscode.Disposable => {
			return onQueryExecuteMessageEventEmitter.event(handler);
		};

		let saveResults = (requestParams: azdata.SaveResultsRequestParams): Thenable<azdata.SaveResultRequestResult> => {
			switch (requestParams.resultFormat) {
				case 'csv':
					return client.sendRequest(protocol.SaveResultsAsCsvRequest.type, requestParams).then(
						undefined,
						e => {
							client.logFailedRequest(protocol.SaveResultsAsCsvRequest.type, e);
							return Promise.reject(e);
						}
					);
				case 'json':
					return client.sendRequest(protocol.SaveResultsAsJsonRequest.type, requestParams).then(
						undefined,
						e => {
							client.logFailedRequest(protocol.SaveResultsAsJsonRequest.type, e);
							return Promise.reject(e);
						}
					);
				case 'markdown':
					return client.sendRequest(protocol.SaveResultsAsMarkdownRequest.type, requestParams).then(
						undefined,
						e => {
							client.logFailedRequest(protocol.SaveResultsAsMarkdownRequest.type, e);
							return Promise.reject(e);
						}
					);
				case 'excel':
					return client.sendRequest(protocol.SaveResultsAsExcelRequest.type, requestParams).then(
						undefined,
						e => {
							client.logFailedRequest(protocol.SaveResultsAsExcelRequest.type, e);
							return Promise.reject(e);
						}
					);
				case 'xml':
					return client.sendRequest(protocol.SaveResultsAsXmlRequest.type, requestParams).then(
						undefined,
						e => {
							client.logFailedRequest(protocol.SaveResultsAsXmlRequest.type, e);
							return Promise.reject(e);
						}
					);
				default:
					return Promise.reject('unsupported format');
			}
		};

		let setQueryExecutionOptions = (ownerUri: string, queryExecutionOptions: azdata.QueryExecutionOptions): Thenable<void> => {
			let params: types.QueryExecutionOptionsParams = {
				ownerUri: ownerUri,
				options: queryExecutionOptions
			};
			return client.sendRequest(protocol.QueryExecutionOptionsRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.QueryExecutionOptionsRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let copyResults = (params: azdata.CopyResultsRequestParams): Thenable<void> => {
			return client.sendRequest(protocol.CopyResultsRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.CopyResultsRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		// Edit Data Requests
		let commitEdit = (ownerUri: string): Thenable<void> => {
			let params: azdata.EditCommitParams = { ownerUri };
			return client.sendRequest(protocol.EditCommitRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.EditCommitRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let createRow = (ownerUri: string): Thenable<azdata.EditCreateRowResult> => {
			let params: azdata.EditCreateRowParams = { ownerUri: ownerUri };
			return client.sendRequest(protocol.EditCreateRowRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.EditCreateRowRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let deleteRow = (ownerUri: string, rowId: number): Thenable<void> => {
			let params: azdata.EditDeleteRowParams = { ownerUri, rowId };
			return client.sendRequest(protocol.EditDeleteRowRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.EditDeleteRowRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let disposeEdit = (ownerUri: string): Thenable<void> => {
			let params: azdata.EditDisposeParams = { ownerUri };
			return client.sendRequest(protocol.EditDisposeRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.EditDisposeRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let initializeEdit = (
			ownerUri: string,
			schemaName: string,
			objectName: string,
			objectType: string,
			LimitResults: number,
			queryString: string): Thenable<void> => {
			let filters: azdata.EditInitializeFiltering = { LimitResults };
			let params: azdata.EditInitializeParams = { ownerUri, schemaName, objectName, objectType, filters, queryString };
			return client.sendRequest(protocol.EditInitializeRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.EditInitializeRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let revertCell = (ownerUri: string, rowId: number, columnId: number): Thenable<azdata.EditRevertCellResult> => {
			let params: azdata.EditRevertCellParams = { ownerUri, rowId, columnId };
			return client.sendRequest(protocol.EditRevertCellRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.EditRevertCellRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let revertRow = (ownerUri: string, rowId: number): Thenable<void> => {
			let params: azdata.EditRevertRowParams = { ownerUri, rowId };
			return client.sendRequest(protocol.EditRevertRowRequest.type, params).then(
				r => undefined,
				e => {
					client.logFailedRequest(protocol.EditRevertRowRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let updateCell = (ownerUri: string, rowId: number, columnId: number, newValue: string): Thenable<azdata.EditUpdateCellResult> => {
			let params: azdata.EditUpdateCellParams = { ownerUri, rowId, columnId, newValue };
			return client.sendRequest(protocol.EditUpdateCellRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.EditUpdateCellRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let getEditRows = (rowData: azdata.EditSubsetParams): Thenable<azdata.EditSubsetResult> => {
			return client.sendRequest(protocol.EditSubsetRequest.type, rowData).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.EditSubsetRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		// Edit Data Event Handlers
		const onEditSessionReadyEventEmitter = this.registerNotificationEmitter(protocol.EditSessionReadyNotification.type);
		let registerOnEditSessionReady = (handler: (ownerUri: string, success: boolean, message: string) => any): vscode.Disposable => {
			return onEditSessionReadyEventEmitter.event(params => handler(params.ownerUri, params.success, params.message));
		};

		return azdata.dataprotocol.registerQueryProvider({
			providerId: client.providerId,
			cancelQuery,
			commitEdit,
			createRow,
			deleteRow,
			disposeEdit,
			disposeQuery,
			connectionUriChanged,
			getEditRows,
			getQueryRows,
			setQueryExecutionOptions,
			initializeEdit,
			registerOnBatchComplete,
			registerOnBatchStart,
			registerOnEditSessionReady,
			registerOnMessage,
			registerOnQueryComplete,
			registerOnResultSetAvailable,
			registerOnResultSetUpdated,
			revertCell,
			revertRow,
			runQuery,
			runQueryAndReturn,
			parseSyntax,
			runQueryStatement,
			runQueryString,
			saveResults,
			updateCell,
			copyResults
		});
	}
}

export class MetadataFeature extends SqlOpsFeature<undefined> {
	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.MetadataQueryRequest.type,
		protocol.ListDatabasesRequest.type,
		protocol.TableMetadataRequest.type,
		protocol.ViewMetadataRequest.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, MetadataFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'metadata')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;

		let getMetadata = (ownerUri: string): Thenable<azdata.ProviderMetadata> => {
			let params: types.MetadataQueryParams = { ownerUri };
			return client.sendRequest(protocol.MetadataQueryRequest.type, params).then(
				client.sqlp2c.asProviderMetadata,
				e => {
					client.logFailedRequest(protocol.MetadataQueryRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let getDatabases = (ownerUri: string): Thenable<string[] | azdata.DatabaseInfo[]> => {
			let params: protocol.ListDatabasesParams = {
				ownerUri: ownerUri,
				includeDetails: true
			};
			return client.sendRequest(protocol.ListDatabasesRequest.type, params).then(
				r => { return r.databaseNames ? r.databaseNames : r.databases; },
				e => {
					client.logFailedRequest(protocol.ListDatabasesRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let getTableInfo = (ownerUri: string, metadata: azdata.ObjectMetadata): Thenable<azdata.ColumnMetadata[]> => {
			let params: protocol.TableMetadataParams = { objectName: metadata.name, ownerUri, schema: metadata.schema };
			return client.sendRequest(protocol.TableMetadataRequest.type, params).then(
				r => r.columns,
				e => {
					client.logFailedRequest(protocol.TableMetadataRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let getViewInfo = (ownerUri: string, metadata: azdata.ObjectMetadata): Thenable<azdata.ColumnMetadata[]> => {
			let params: protocol.TableMetadataParams = { objectName: metadata.name, ownerUri, schema: metadata.schema };
			return client.sendRequest(protocol.ViewMetadataRequest.type, params).then(
				r => r.columns,
				e => {
					client.logFailedRequest(protocol.ViewMetadataRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		return azdata.dataprotocol.registerMetadataProvider({
			providerId: client.providerId,
			getDatabases,
			getMetadata,
			getTableInfo,
			getViewInfo
		});
	}
}

export class AdminServicesFeature extends SqlOpsFeature<undefined> {
	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.CreateDatabaseRequest.type,
		protocol.DefaultDatabaseInfoRequest.type,
		protocol.GetDatabaseInfoRequest.type,
		protocol.CreateLoginRequest.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, AdminServicesFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'adminServices')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;

		let createDatabase = (ownerUri: string, databaseInfo: azdata.DatabaseInfo): Thenable<azdata.CreateDatabaseResponse> => {
			let params: types.CreateDatabaseParams = { ownerUri, databaseInfo };
			return client.sendRequest(protocol.CreateDatabaseRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.CreateDatabaseRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let getDefaultDatabaseInfo = (ownerUri: string): Thenable<azdata.DatabaseInfo> => {
			let params: types.DefaultDatabaseInfoParams = { ownerUri };
			return client.sendRequest(protocol.DefaultDatabaseInfoRequest.type, params).then(
				r => r.defaultDatabaseInfo,
				e => {
					client.logFailedRequest(protocol.DefaultDatabaseInfoRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let getDatabaseInfo = (ownerUri: string): Thenable<azdata.DatabaseInfo> => {
			let params: types.GetDatabaseInfoParams = { ownerUri };
			return client.sendRequest(protocol.GetDatabaseInfoRequest.type, params).then(
				r => r.databaseInfo,
				e => {
					client.logFailedRequest(protocol.GetDatabaseInfoRequest.type, e);
					return Promise.reject(e);
				}
			);
		};

		let createLogin = (ownerUri: string, loginInfo: azdata.LoginInfo): Thenable<azdata.CreateLoginResponse> => {
			let params: types.CreateLoginParams = { ownerUri, loginInfo };
			return client.sendRequest(protocol.CreateLoginRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.CreateLoginRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		return azdata.dataprotocol.registerAdminServicesProvider({
			providerId: client.providerId,
			createDatabase,
			createLogin,
			getDatabaseInfo,
			getDefaultDatabaseInfo
		});
	}
}

export class BackupFeature extends SqlOpsFeature<undefined> {
	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.BackupRequest.type,
		protocol.BackupConfigInfoRequest.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, BackupFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'backup')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;

		let backup = (ownerUri: string, backupInfo: types.BackupInfo, taskExecutionMode: azdata.TaskExecutionMode): Thenable<azdata.BackupResponse> => {
			let params: types.BackupParams = { ownerUri, backupInfo, taskExecutionMode };
			return client.sendRequest(protocol.BackupRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.BackupRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let getBackupConfigInfo = (connectionUri: string): Thenable<azdata.BackupConfigInfo> => {
			let params: types.DefaultDatabaseInfoParams = { ownerUri: connectionUri };
			return client.sendRequest(protocol.BackupConfigInfoRequest.type, params).then(
				r => r.backupConfigInfo,
				e => {
					client.logFailedRequest(protocol.BackupConfigInfoRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		return azdata.dataprotocol.registerBackupProvider({
			providerId: client.providerId,
			backup,
			getBackupConfigInfo
		});
	}
}

export class RestoreFeature extends SqlOpsFeature<undefined> {
	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.RestorePlanRequest.type,
		protocol.RestoreRequest.type,
		protocol.RestoreConfigInfoRequest.type,
		protocol.CancelRestorePlanRequest.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, RestoreFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'restore')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;

		let getRestorePlan = (ownerUri: string, restoreInfo: azdata.RestoreInfo): Thenable<azdata.RestorePlanResponse> => {
			let params: types.RestoreParams = { options: restoreInfo.options, ownerUri, taskExecutionMode: restoreInfo.taskExecutionMode };
			return client.sendRequest(protocol.RestorePlanRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.RestorePlanRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let restore = (ownerUri: string, restoreInfo: azdata.RestoreInfo): Thenable<azdata.RestoreResponse> => {
			let params: types.RestoreParams = { options: restoreInfo.options, ownerUri, taskExecutionMode: restoreInfo.taskExecutionMode };
			return client.sendRequest(protocol.RestoreRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.RestoreRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let getRestoreConfigInfo = (ownerUri: string): Thenable<azdata.RestoreConfigInfo> => {
			let params: types.RestoreConfigInfoRequestParams = { ownerUri };
			return client.sendRequest(protocol.RestoreConfigInfoRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.RestoreConfigInfoRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let cancelRestorePlan = (ownerUri: string, restoreInfo: azdata.RestoreInfo): Thenable<boolean> => {
			let params: types.RestoreParams = { options: restoreInfo.options, ownerUri, taskExecutionMode: restoreInfo.taskExecutionMode };
			return client.sendRequest(protocol.CancelRestorePlanRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.CancelRestorePlanRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		return azdata.dataprotocol.registerRestoreProvider({
			providerId: client.providerId,
			cancelRestorePlan,
			getRestoreConfigInfo,
			getRestorePlan,
			restore
		});
	}
}

export class ObjectExplorerFeature extends SqlOpsFeature<undefined> {
	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.ObjectExplorerCreateSessionRequest.type,
		protocol.ObjectExplorerExpandRequest.type,
		protocol.ObjectExplorerRefreshRequest.type,
		protocol.ObjectExplorerCloseSessionRequest.type,
		protocol.ObjectExplorerCreateSessionCompleteNotification.type,
		protocol.ObjectExplorerExpandCompleteNotification.type,
		protocol.ObjectExplorerFindNodesRequest.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, ObjectExplorerFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'objectExplorer')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;
		let createNewSession = (connInfo: azdata.ConnectionInfo): Thenable<azdata.ObjectExplorerSessionResponse> => {
			return client.sendRequest(protocol.ObjectExplorerCreateSessionRequest.type, connInfo).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.ObjectExplorerCreateSessionRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let expandNode = (nodeInfo: azdata.ExpandNodeInfo): Thenable<boolean> => {
			return client.sendRequest(protocol.ObjectExplorerExpandRequest.type, nodeInfo).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.ObjectExplorerExpandRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let refreshNode = (nodeInfo: azdata.ExpandNodeInfo): Thenable<boolean> => {
			return client.sendRequest(protocol.ObjectExplorerRefreshRequest.type, nodeInfo).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.ObjectExplorerRefreshRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let closeSession = (closeSessionInfo: azdata.ObjectExplorerCloseSessionInfo): Thenable<any> => {
			return client.sendRequest(protocol.ObjectExplorerCloseSessionRequest.type, closeSessionInfo).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.ObjectExplorerCloseSessionRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		let findNodes = (findNodesInfo: azdata.FindNodesInfo): Thenable<any> => {
			return client.sendRequest(protocol.ObjectExplorerFindNodesRequest.type, findNodesInfo).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.ObjectExplorerFindNodesRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		const onObjectExplorerCreateSessionCompleteEventEmitter = this.registerNotificationEmitter(protocol.ObjectExplorerCreateSessionCompleteNotification.type);
		let registerOnSessionCreated = (handler: (response: azdata.ObjectExplorerSession) => any): vscode.Disposable => {
			return onObjectExplorerCreateSessionCompleteEventEmitter.event(handler);
		};

		const onObjectExplorerSessionDisconnectedEventEmitter = this.registerNotificationEmitter(protocol.ObjectExplorerSessionDisconnectedNotification.type);
		let registerOnSessionDisconnected = (handler: (response: azdata.ObjectExplorerSession) => any): vscode.Disposable => {
			return onObjectExplorerSessionDisconnectedEventEmitter.event(handler);
		};

		const onObjectExplorerExpandCompleteEventEmitter = this.registerNotificationEmitter(protocol.ObjectExplorerExpandCompleteNotification.type);
		let registerOnExpandCompleted = (handler: (response: azdata.ObjectExplorerExpandInfo) => any): vscode.Disposable => {
			return onObjectExplorerExpandCompleteEventEmitter.event(handler);
		};

		return azdata.dataprotocol.registerObjectExplorerProvider({
			providerId: client.providerId,
			closeSession,
			createNewSession,
			expandNode,
			refreshNode,
			findNodes,
			registerOnExpandCompleted,
			registerOnSessionCreated,
			registerOnSessionDisconnected
		});
	}
}

export class ScriptingFeature extends SqlOpsFeature<undefined> {
	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.ScriptingRequest.type,
		protocol.ScriptingCompleteNotification.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, ScriptingFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'scripting')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;

		let scriptAsOperation = (
			connectionUri: string,
			operation: azdata.ScriptOperation,
			metadata: azdata.ObjectMetadata,
			paramDetails: azdata.ScriptingParamDetails): Thenable<azdata.ScriptingResult> => {
			return client.sendRequest(protocol.ScriptingRequest.type,
				client.sqlc2p.asScriptingParams(connectionUri, operation, metadata, paramDetails)).then(
					r => r,
					e => {
						client.logFailedRequest(protocol.ScriptingRequest.type, e);
						return Promise.reject(e);
					}
				);
		};

		const onScriptingCompleteEventEmitter = this.registerNotificationEmitter(protocol.ScriptingCompleteNotification.type);
		let registerOnScriptingComplete = (handler: (scriptingCompleteResult: azdata.ScriptingCompleteResult) => any): vscode.Disposable => {
			return onScriptingCompleteEventEmitter.event(handler);
		};

		return azdata.dataprotocol.registerScriptingProvider({
			providerId: client.providerId,
			registerOnScriptingComplete,
			scriptAsOperation
		});
	}
}

export class TaskServicesFeature extends SqlOpsFeature<undefined> {
	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.ListTasksRequest.type,
		protocol.CancelTaskRequest.type,
		protocol.TaskCreatedNotification.type,
		protocol.TaskStatusChangedNotification.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, TaskServicesFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'taskServices')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;

		let getAllTasks = (listTasksParams: azdata.ListTasksParams): Thenable<azdata.ListTasksResponse> => {
			return client.sendRequest(protocol.ListTasksRequest.type, listTasksParams).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.ListTasksRequest.type, e);
					return Promise.resolve(undefined);
				}
			);

		};

		let cancelTask = (cancelTaskParams: azdata.CancelTaskParams): Thenable<boolean> => {
			return client.sendRequest(protocol.CancelTaskRequest.type, cancelTaskParams).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.CancelTaskRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		const onTaskCreatedEventEmitter = this.registerNotificationEmitter(protocol.TaskCreatedNotification.type);
		let registerOnTaskCreated = (handler: (response: azdata.TaskInfo) => any): vscode.Disposable => {
			return onTaskCreatedEventEmitter.event(handler);
		};

		const onTaskStatusChangedEventEmitter = this.registerNotificationEmitter(protocol.TaskStatusChangedNotification.type);
		let registerOnTaskStatusChanged = (handler: (response: azdata.TaskProgressInfo) => any): vscode.Disposable => {
			return onTaskStatusChangedEventEmitter.event(handler);
		};

		return azdata.dataprotocol.registerTaskServicesProvider({
			providerId: client.providerId,
			cancelTask,
			getAllTasks,
			registerOnTaskCreated,
			registerOnTaskStatusChanged
		});
	}
}

export class FileBrowserFeature extends SqlOpsFeature<undefined> {
	private static readonly messagesTypes: RPCMessageType[] = [
		protocol.FileBrowserOpenRequest.type,
		protocol.FileBrowserOpenedNotification.type,
		protocol.FileBrowserExpandRequest.type,
		protocol.FileBrowserExpandedNotification.type,
		protocol.FileBrowserValidateRequest.type,
		protocol.FileBrowserValidatedNotification.type,
		protocol.FileBrowserCloseRequest.type
	];

	constructor(client: SqlOpsDataClient) {
		super(client, FileBrowserFeature.messagesTypes);
	}

	public fillClientCapabilities(capabilities: protocol.ClientCapabilities): void {
		ensure(ensure(capabilities, 'connection')!, 'fileBrowser')!.dynamicRegistration = true;
	}

	public initialize(capabilities: ServerCapabilities): void {
		this.register(this.messages, {
			id: UUID.generateUuid(),
			registerOptions: undefined
		});
	}

	protected registerProvider(options: undefined): Disposable {
		const client = this._client;

		let openFileBrowser = (ownerUri: string, expandPath: string, fileFilters: string[], changeFilter: boolean, showFoldersOnly?: boolean): Thenable<boolean> => {
			let params: types.FileBrowserOpenParams = { ownerUri, expandPath, fileFilters, changeFilter, showFoldersOnly };
			return client.sendRequest(protocol.FileBrowserOpenRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.FileBrowserOpenRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		const onFileBrowserOpenedEventEmitter = this.registerNotificationEmitter(protocol.FileBrowserOpenedNotification.type);
		let registerOnFileBrowserOpened = (handler: (response: azdata.FileBrowserOpenedParams) => any): vscode.Disposable => {
			return onFileBrowserOpenedEventEmitter.event(handler);
		};

		let expandFolderNode = (ownerUri: string, expandPath: string): Thenable<boolean> => {
			let params: types.FileBrowserExpandParams = { ownerUri, expandPath };
			return client.sendRequest(protocol.FileBrowserExpandRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.FileBrowserExpandRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		const onFileBrowserExpandedEventEmitter = this.registerNotificationEmitter(protocol.FileBrowserExpandedNotification.type);
		let registerOnFolderNodeExpanded = (handler: (response: azdata.FileBrowserExpandedParams) => any): vscode.Disposable => {
			return onFileBrowserExpandedEventEmitter.event(handler);
		};

		let validateFilePaths = (ownerUri: string, serviceType: string, selectedFiles: string[]): Thenable<boolean> => {
			let params: types.FileBrowserValidateParams = { ownerUri, serviceType, selectedFiles };
			return client.sendRequest(protocol.FileBrowserValidateRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.FileBrowserValidateRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		const onFileBrowserValidatedEventEmitter = this.registerNotificationEmitter(protocol.FileBrowserValidatedNotification.type);
		let registerOnFilePathsValidated = (handler: (response: azdata.FileBrowserValidatedParams) => any): vscode.Disposable => {
			return onFileBrowserValidatedEventEmitter.event(handler);
		};

		let closeFileBrowser = (ownerUri: string): Thenable<azdata.FileBrowserCloseResponse> => {
			let params: types.FileBrowserCloseParams = { ownerUri };
			return client.sendRequest(protocol.FileBrowserCloseRequest.type, params).then(
				r => r,
				e => {
					client.logFailedRequest(protocol.FileBrowserCloseRequest.type, e);
					return Promise.resolve(undefined);
				}
			);
		};

		return azdata.dataprotocol.registerFileBrowserProvider({
			providerId: client.providerId,
			closeFileBrowser,
			expandFolderNode,
			openFileBrowser,
			registerOnFileBrowserOpened,
			registerOnFilePathsValidated,
			registerOnFolderNodeExpanded,
			validateFilePaths
		});
	}
}



/**
 *
 */
export class SqlOpsDataClient extends LanguageClient {

	public static readonly defaultFeatures: Array<ISqlOpsFeature> = [
		ConnectionFeature,
		CapabilitiesFeature,
		QueryFeature,
		MetadataFeature,
		AdminServicesFeature,
		BackupFeature,
		RestoreFeature,
		ObjectExplorerFeature,
		ScriptingFeature,
		TaskServicesFeature,
		FileBrowserFeature
	];

	private _sqlc2p: Ic2p;
	private _sqlp2c: Ip2c;
	private _providerId: string;

	public get sqlc2p(): Ic2p {
		return this._sqlc2p;
	}

	public get sqlp2c(): Ip2c {
		return this._sqlp2c;
	}

	public get providerId(): string {
		return this._providerId;
	}

	public constructor(name: string, serverOptions: ServerOptions, clientOptions: ClientOptions, forceDebug?: boolean);
	public constructor(id: string, name: string, serverOptions: ServerOptions, clientOptions: ClientOptions, forceDebug?: boolean);
	public constructor(arg1: string, arg2: ServerOptions | string, arg3: ClientOptions | ServerOptions, arg4?: boolean | ClientOptions, arg5?: boolean) {
		let features: Array<ISqlOpsFeature>;
		if (is.string(arg2)) {
			super(arg1, arg2, arg3 as ServerOptions, arg4 as ClientOptions, arg5);
			this._providerId = (arg4 as ClientOptions).providerId;
			features = (arg4 as ClientOptions).features;
		} else {
			super(arg1, arg2 as ServerOptions, arg3 as ClientOptions, arg4 as boolean);
			this._providerId = (arg3 as ClientOptions).providerId;
			features = (arg3 as ClientOptions).features;
		}
		this._sqlc2p = c2p;
		this._sqlp2c = p2c;
		this.registerSqlopsFeatures(features || SqlOpsDataClient.defaultFeatures);
	}

	private registerSqlopsFeatures(features: Array<ISqlOpsFeature>): void {
		features.map(f => {
			this.registerFeature(new f(this));
		});
	}
}

/**
 * Base class containing shared code to reduce boilerplate for services
 */
export abstract class BaseService {
	constructor(protected readonly client: SqlOpsDataClient) { }

	/**
	 * Sends the specified request and logs the failure through the client if one occurs before rethrowing.
	 * @param type RequestType, typically in the format 'contracts.DoThingRequest.type'
	 * @param params parameters to be passed to the request
	 * @returns result from the request
	 */
	protected runWithErrorHandling<P, R, E, RO>(type: RequestType<P, R, E, RO>, params: P): Thenable<R> {
		return this.client.sendRequest(type, params).then(
			(result) => { return result; },
			(error) => {
				this.client.logFailedRequest(type, error);
				return Promise.reject(error);
			}
		);
	}
}
