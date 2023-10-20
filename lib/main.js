"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = exports.SqlOpsDataClient = exports.FileBrowserFeature = exports.TaskServicesFeature = exports.ScriptingFeature = exports.ObjectExplorerFeature = exports.RestoreFeature = exports.BackupFeature = exports.AdminServicesFeature = exports.MetadataFeature = exports.QueryFeature = exports.ConnectionFeature = exports.CapabilitiesFeature = exports.SqlOpsFeature = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const is = require("vscode-languageclient/lib/utils/is");
const UUID = require("vscode-languageclient/lib/utils/uuid");
const azdata = require("azdata");
const vscode = require("vscode");
const codeConverter_1 = require("./codeConverter");
const protocol = require("./protocol");
const protocolConverter_1 = require("./protocolConverter");
function ensure(target, key) {
    if (target[key] === void 0) {
        target[key] = {};
    }
    return target[key];
}
/**
 *
 */
class SqlOpsFeature {
    constructor(_client, _message) {
        this._client = _client;
        this._message = _message;
        this._providers = new Map();
        this._disposables = [];
    }
    get messages() {
        return this._message;
    }
    register(messages, data) {
        // Error catching
        if (is.array(this.messages) && is.array(messages)) {
            let valid = messages.every(v => !!this.messages.find(i => i.method === v.method));
            if (!valid) {
                throw new Error(`Register called on wrong feature.`);
            }
        }
        else if (is.array(this.messages) && !is.array(messages)) {
            if (!this.messages.find(i => i.method === messages.method)) {
                throw new Error(`Register called on wrong feature.`);
            }
        }
        else if (!is.array(this.messages) && !is.array(messages)) {
            if (this.messages.method !== messages.method) {
                throw new Error(`Register called on wrong feature. Requested ${messages.method} but reached feature ${this.messages.method}`);
            }
        }
        let provider = this.registerProvider(data.registerOptions);
        if (provider) {
            this._providers.set(data.id, provider);
        }
    }
    unregister(id) {
        let provider = this._providers.get(id);
        if (provider) {
            provider.dispose();
            // TODO Should remove it from list
        }
    }
    dispose() {
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
    registerNotificationEmitter(notificationType) {
        const eventEmitter = new vscode.EventEmitter();
        this._disposables.push(eventEmitter);
        this._client.onNotification(notificationType, params => {
            eventEmitter.fire(params);
        });
        return eventEmitter;
    }
}
exports.SqlOpsFeature = SqlOpsFeature;
class CapabilitiesFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, CapabilitiesFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'capabilities').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let getServerCapabilities = (cap) => {
            return client.sendRequest(protocol.CapabiltiesDiscoveryRequest.type, cap).then(client.sqlp2c.asServerCapabilities, e => {
                client.logFailedRequest(protocol.CapabiltiesDiscoveryRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        return azdata.dataprotocol.registerCapabilitiesServiceProvider({
            providerId: client.providerId,
            getServerCapabilities
        });
    }
}
exports.CapabilitiesFeature = CapabilitiesFeature;
CapabilitiesFeature.messagesTypes = [
    protocol.CapabiltiesDiscoveryRequest.type
];
class ConnectionFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, ConnectionFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'connection').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let connect = (connUri, connInfo) => {
            return client.sendRequest(protocol.ConnectionRequest.type, client.sqlc2p.asConnectionParams(connUri, connInfo)).then(r => r, e => {
                client.logFailedRequest(protocol.ConnectionRequest.type, e);
                return Promise.resolve(false);
            });
        };
        let changePassword = (ownerUri, connInfo, newPassword) => {
            let params = {
                ownerUri,
                connection: {
                    options: connInfo.options
                },
                newPassword
            };
            return client.sendRequest(protocol.ChangePasswordRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.ChangePasswordRequest.type, e);
                return Promise.resolve(false);
            });
        };
        let disconnect = (ownerUri) => {
            let params = {
                ownerUri
            };
            return client.sendRequest(protocol.DisconnectRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.DisconnectRequest.type, e);
                return Promise.resolve(false);
            });
        };
        let cancelConnect = (ownerUri) => {
            let params = {
                ownerUri
            };
            return client.sendRequest(protocol.CancelConnectRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.CancelConnectRequest.type, e);
                return Promise.resolve(false);
            });
        };
        let changeDatabase = (ownerUri, newDatabase) => {
            let params = {
                ownerUri,
                newDatabase
            };
            return client.sendRequest(protocol.ChangeDatabaseRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.ChangeDatabaseRequest.type, e);
                return Promise.resolve(false);
            });
        };
        let listDatabases = (ownerUri) => {
            let params = {
                ownerUri
            };
            return client.sendRequest(protocol.ListDatabasesRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.ListDatabasesRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let getConnectionString = (ownerUri, includePassword) => {
            let params = {
                ownerUri,
                includePassword
            };
            return client.sendRequest(protocol.GetConnectionStringRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.GetConnectionStringRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let buildConnectionInfo = (connectionString) => {
            return client.sendRequest(protocol.BuildConnectionInfoRequest.type, connectionString).then(r => r, e => {
                client.logFailedRequest(protocol.BuildConnectionInfoRequest.type, e);
                return Promise.resolve(e);
            });
        };
        let rebuildIntelliSenseCache = (ownerUri) => {
            let params = {
                ownerUri
            };
            client.sendNotification(protocol.RebuildIntelliSenseNotification.type, params);
            return Promise.resolve();
        };
        const onConnectionCompleteEventEmitter = this.registerNotificationEmitter(protocol.ConnectionCompleteNotification.type);
        let registerOnConnectionComplete = (handler) => {
            return onConnectionCompleteEventEmitter.event(handler);
        };
        const onIntelliSenseReadyEventEmitter = this.registerNotificationEmitter(protocol.IntelliSenseReadyNotification.type);
        let registerOnIntelliSenseCacheComplete = (handler) => {
            return onIntelliSenseReadyEventEmitter.event(params => handler(params.ownerUri));
        };
        const onConnectionChangedEventEmitter = this.registerNotificationEmitter(protocol.ConnectionChangedNotification.type);
        let registerOnConnectionChanged = (handler) => {
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
exports.ConnectionFeature = ConnectionFeature;
ConnectionFeature.messagesTypes = [
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
class QueryFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, QueryFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'query').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let runQuery = (ownerUri, querySelection, executionPlanOptions) => {
            let params = {
                ownerUri,
                querySelection,
                executionPlanOptions: client.sqlc2p.asExecutionPlanOptions(executionPlanOptions)
            };
            return client.sendRequest(protocol.QueryExecuteRequest.type, params).then(r => undefined, e => {
                client.logFailedRequest(protocol.QueryExecuteRequest.type, e);
                return Promise.reject(e);
            });
        };
        let cancelQuery = (ownerUri) => {
            let params = { ownerUri };
            return client.sendRequest(protocol.QueryCancelRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.QueryCancelRequest.type, e);
                return Promise.reject(e);
            });
        };
        let runQueryStatement = (ownerUri, line, column) => {
            let params = {
                ownerUri,
                line,
                column
            };
            return client.sendRequest(protocol.QueryExecuteStatementRequest.type, params).then(r => undefined, e => {
                client.logFailedRequest(protocol.QueryExecuteStatementRequest.type, e);
                return Promise.reject(e);
            });
        };
        let runQueryString = (ownerUri, query) => {
            let params = { ownerUri, query };
            return client.sendRequest(protocol.QueryExecuteStringRequest.type, params).then(r => undefined, e => {
                client.logFailedRequest(protocol.QueryExecuteStringRequest.type, e);
                return Promise.reject(e);
            });
        };
        let runQueryAndReturn = (ownerUri, queryString) => {
            let params = { ownerUri, queryString };
            return client.sendRequest(protocol.SimpleExecuteRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.SimpleExecuteRequest.type, e);
                return Promise.reject(e);
            });
        };
        let parseSyntax = (ownerUri, query) => {
            let params = { ownerUri, query };
            return client.sendRequest(protocol.SyntaxParseRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.SyntaxParseRequest.type, e);
                return Promise.reject(e);
            });
        };
        let getQueryRows = (rowData) => {
            return client.sendRequest(protocol.QueryExecuteSubsetRequest.type, rowData).then(r => r, e => {
                client.logFailedRequest(protocol.QueryExecuteSubsetRequest.type, e);
                return Promise.reject(e);
            });
        };
        let disposeQuery = (ownerUri) => {
            let params = { ownerUri };
            return client.sendRequest(protocol.QueryDisposeRequest.type, params).then(r => undefined, e => {
                client.logFailedRequest(protocol.QueryDisposeRequest.type, e);
                return Promise.reject(e);
            });
        };
        let connectionUriChanged = (newOwnerUri, originalOwnerUri) => {
            let params = {
                newOwnerUri,
                originalOwnerUri
            };
            client.sendNotification(protocol.ConnectionUriChangedNotification.type, params);
            return Promise.resolve();
        };
        const onQueryCompleteEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteCompleteNotification.type);
        let registerOnQueryComplete = (handler) => {
            return onQueryCompleteEventEmitter.event(handler);
        };
        const onQueryExecuteBatchStartEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteBatchStartNotification.type);
        let registerOnBatchStart = (handler) => {
            return onQueryExecuteBatchStartEventEmitter.event(handler);
        };
        const onQueryExecuteBatchCompleteEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteBatchCompleteNotification.type);
        let registerOnBatchComplete = (handler) => {
            return onQueryExecuteBatchCompleteEventEmitter.event(handler);
        };
        const onQueryExecuteResultSetAvailableEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteResultSetAvailableNotification.type);
        let registerOnResultSetAvailable = (handler) => {
            return onQueryExecuteResultSetAvailableEventEmitter.event(handler);
        };
        const onQueryExecuteResultSetUpdatedEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteResultSetUpdatedNotification.type);
        let registerOnResultSetUpdated = (handler) => {
            return onQueryExecuteResultSetUpdatedEventEmitter.event(handler);
        };
        const onQueryExecuteMessageEventEmitter = this.registerNotificationEmitter(protocol.QueryExecuteMessageNotification.type);
        let registerOnMessage = (handler) => {
            return onQueryExecuteMessageEventEmitter.event(handler);
        };
        let saveResults = (requestParams) => {
            switch (requestParams.resultFormat) {
                case 'csv':
                    return client.sendRequest(protocol.SaveResultsAsCsvRequest.type, requestParams).then(undefined, e => {
                        client.logFailedRequest(protocol.SaveResultsAsCsvRequest.type, e);
                        return Promise.reject(e);
                    });
                case 'json':
                    return client.sendRequest(protocol.SaveResultsAsJsonRequest.type, requestParams).then(undefined, e => {
                        client.logFailedRequest(protocol.SaveResultsAsJsonRequest.type, e);
                        return Promise.reject(e);
                    });
                case 'markdown':
                    return client.sendRequest(protocol.SaveResultsAsMarkdownRequest.type, requestParams).then(undefined, e => {
                        client.logFailedRequest(protocol.SaveResultsAsMarkdownRequest.type, e);
                        return Promise.reject(e);
                    });
                case 'excel':
                    return client.sendRequest(protocol.SaveResultsAsExcelRequest.type, requestParams).then(undefined, e => {
                        client.logFailedRequest(protocol.SaveResultsAsExcelRequest.type, e);
                        return Promise.reject(e);
                    });
                case 'xml':
                    return client.sendRequest(protocol.SaveResultsAsXmlRequest.type, requestParams).then(undefined, e => {
                        client.logFailedRequest(protocol.SaveResultsAsXmlRequest.type, e);
                        return Promise.reject(e);
                    });
                default:
                    return Promise.reject('unsupported format');
            }
        };
        let setQueryExecutionOptions = (ownerUri, queryExecutionOptions) => {
            let params = {
                ownerUri: ownerUri,
                options: queryExecutionOptions
            };
            return client.sendRequest(protocol.QueryExecutionOptionsRequest.type, params).then(r => undefined, e => {
                client.logFailedRequest(protocol.QueryExecutionOptionsRequest.type, e);
                return Promise.reject(e);
            });
        };
        let copyResults = (params) => {
            return client.sendRequest(protocol.CopyResultsRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.CopyResultsRequest.type, e);
                return Promise.reject(e);
            });
        };
        // Edit Data Requests
        let commitEdit = (ownerUri) => {
            let params = { ownerUri };
            return client.sendRequest(protocol.EditCommitRequest.type, params).then(r => undefined, e => {
                client.logFailedRequest(protocol.EditCommitRequest.type, e);
                return Promise.reject(e);
            });
        };
        let createRow = (ownerUri) => {
            let params = { ownerUri: ownerUri };
            return client.sendRequest(protocol.EditCreateRowRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.EditCreateRowRequest.type, e);
                return Promise.reject(e);
            });
        };
        let deleteRow = (ownerUri, rowId) => {
            let params = { ownerUri, rowId };
            return client.sendRequest(protocol.EditDeleteRowRequest.type, params).then(r => undefined, e => {
                client.logFailedRequest(protocol.EditDeleteRowRequest.type, e);
                return Promise.reject(e);
            });
        };
        let disposeEdit = (ownerUri) => {
            let params = { ownerUri };
            return client.sendRequest(protocol.EditDisposeRequest.type, params).then(r => undefined, e => {
                client.logFailedRequest(protocol.EditDisposeRequest.type, e);
                return Promise.reject(e);
            });
        };
        let initializeEdit = (ownerUri, schemaName, objectName, objectType, LimitResults, queryString) => {
            let filters = { LimitResults };
            let params = { ownerUri, schemaName, objectName, objectType, filters, queryString };
            return client.sendRequest(protocol.EditInitializeRequest.type, params).then(r => undefined, e => {
                client.logFailedRequest(protocol.EditInitializeRequest.type, e);
                return Promise.reject(e);
            });
        };
        let revertCell = (ownerUri, rowId, columnId) => {
            let params = { ownerUri, rowId, columnId };
            return client.sendRequest(protocol.EditRevertCellRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.EditRevertCellRequest.type, e);
                return Promise.reject(e);
            });
        };
        let revertRow = (ownerUri, rowId) => {
            let params = { ownerUri, rowId };
            return client.sendRequest(protocol.EditRevertRowRequest.type, params).then(r => undefined, e => {
                client.logFailedRequest(protocol.EditRevertRowRequest.type, e);
                return Promise.reject(e);
            });
        };
        let updateCell = (ownerUri, rowId, columnId, newValue) => {
            let params = { ownerUri, rowId, columnId, newValue };
            return client.sendRequest(protocol.EditUpdateCellRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.EditUpdateCellRequest.type, e);
                return Promise.reject(e);
            });
        };
        let getEditRows = (rowData) => {
            return client.sendRequest(protocol.EditSubsetRequest.type, rowData).then(r => r, e => {
                client.logFailedRequest(protocol.EditSubsetRequest.type, e);
                return Promise.reject(e);
            });
        };
        // Edit Data Event Handlers
        const onEditSessionReadyEventEmitter = this.registerNotificationEmitter(protocol.EditSessionReadyNotification.type);
        let registerOnEditSessionReady = (handler) => {
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
exports.QueryFeature = QueryFeature;
QueryFeature.messagesTypes = [
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
class MetadataFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, MetadataFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'metadata').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let getMetadata = (ownerUri) => {
            let params = { ownerUri };
            return client.sendRequest(protocol.MetadataQueryRequest.type, params).then(client.sqlp2c.asProviderMetadata, e => {
                client.logFailedRequest(protocol.MetadataQueryRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let getDatabases = (ownerUri) => {
            let params = {
                ownerUri: ownerUri,
                includeDetails: true
            };
            return client.sendRequest(protocol.ListDatabasesRequest.type, params).then(r => { return r.databaseNames ? r.databaseNames : r.databases; }, e => {
                client.logFailedRequest(protocol.ListDatabasesRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let getTableInfo = (ownerUri, metadata) => {
            let params = { objectName: metadata.name, ownerUri, schema: metadata.schema };
            return client.sendRequest(protocol.TableMetadataRequest.type, params).then(r => r.columns, e => {
                client.logFailedRequest(protocol.TableMetadataRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let getViewInfo = (ownerUri, metadata) => {
            let params = { objectName: metadata.name, ownerUri, schema: metadata.schema };
            return client.sendRequest(protocol.ViewMetadataRequest.type, params).then(r => r.columns, e => {
                client.logFailedRequest(protocol.ViewMetadataRequest.type, e);
                return Promise.resolve(undefined);
            });
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
exports.MetadataFeature = MetadataFeature;
MetadataFeature.messagesTypes = [
    protocol.MetadataQueryRequest.type,
    protocol.ListDatabasesRequest.type,
    protocol.TableMetadataRequest.type,
    protocol.ViewMetadataRequest.type
];
class AdminServicesFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, AdminServicesFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'adminServices').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let createDatabase = (ownerUri, databaseInfo) => {
            let params = { ownerUri, databaseInfo };
            return client.sendRequest(protocol.CreateDatabaseRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.CreateDatabaseRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let getDefaultDatabaseInfo = (ownerUri) => {
            let params = { ownerUri };
            return client.sendRequest(protocol.DefaultDatabaseInfoRequest.type, params).then(r => r.defaultDatabaseInfo, e => {
                client.logFailedRequest(protocol.DefaultDatabaseInfoRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let getDatabaseInfo = (ownerUri) => {
            let params = { ownerUri };
            return client.sendRequest(protocol.GetDatabaseInfoRequest.type, params).then(r => r.databaseInfo, e => {
                client.logFailedRequest(protocol.GetDatabaseInfoRequest.type, e);
                return Promise.reject(e);
            });
        };
        let createLogin = (ownerUri, loginInfo) => {
            let params = { ownerUri, loginInfo };
            return client.sendRequest(protocol.CreateLoginRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.CreateLoginRequest.type, e);
                return Promise.resolve(undefined);
            });
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
exports.AdminServicesFeature = AdminServicesFeature;
AdminServicesFeature.messagesTypes = [
    protocol.CreateDatabaseRequest.type,
    protocol.DefaultDatabaseInfoRequest.type,
    protocol.GetDatabaseInfoRequest.type,
    protocol.CreateLoginRequest.type
];
class BackupFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, BackupFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'backup').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let backup = (ownerUri, backupInfo, taskExecutionMode) => {
            let params = { ownerUri, backupInfo, taskExecutionMode };
            return client.sendRequest(protocol.BackupRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.BackupRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let getBackupConfigInfo = (connectionUri) => {
            let params = { ownerUri: connectionUri };
            return client.sendRequest(protocol.BackupConfigInfoRequest.type, params).then(r => r.backupConfigInfo, e => {
                client.logFailedRequest(protocol.BackupConfigInfoRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        return azdata.dataprotocol.registerBackupProvider({
            providerId: client.providerId,
            backup,
            getBackupConfigInfo
        });
    }
}
exports.BackupFeature = BackupFeature;
BackupFeature.messagesTypes = [
    protocol.BackupRequest.type,
    protocol.BackupConfigInfoRequest.type
];
class RestoreFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, RestoreFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'restore').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let getRestorePlan = (ownerUri, restoreInfo) => {
            let params = { options: restoreInfo.options, ownerUri, taskExecutionMode: restoreInfo.taskExecutionMode };
            return client.sendRequest(protocol.RestorePlanRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.RestorePlanRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let restore = (ownerUri, restoreInfo) => {
            let params = { options: restoreInfo.options, ownerUri, taskExecutionMode: restoreInfo.taskExecutionMode };
            return client.sendRequest(protocol.RestoreRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.RestoreRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let getRestoreConfigInfo = (ownerUri) => {
            let params = { ownerUri };
            return client.sendRequest(protocol.RestoreConfigInfoRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.RestoreConfigInfoRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let cancelRestorePlan = (ownerUri, restoreInfo) => {
            let params = { options: restoreInfo.options, ownerUri, taskExecutionMode: restoreInfo.taskExecutionMode };
            return client.sendRequest(protocol.CancelRestorePlanRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.CancelRestorePlanRequest.type, e);
                return Promise.resolve(undefined);
            });
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
exports.RestoreFeature = RestoreFeature;
RestoreFeature.messagesTypes = [
    protocol.RestorePlanRequest.type,
    protocol.RestoreRequest.type,
    protocol.RestoreConfigInfoRequest.type,
    protocol.CancelRestorePlanRequest.type
];
class ObjectExplorerFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, ObjectExplorerFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'objectExplorer').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let createNewSession = (connInfo) => {
            return client.sendRequest(protocol.ObjectExplorerCreateSessionRequest.type, connInfo).then(r => r, e => {
                client.logFailedRequest(protocol.ObjectExplorerCreateSessionRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let expandNode = (nodeInfo) => {
            return client.sendRequest(protocol.ObjectExplorerExpandRequest.type, nodeInfo).then(r => r, e => {
                client.logFailedRequest(protocol.ObjectExplorerExpandRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let refreshNode = (nodeInfo) => {
            return client.sendRequest(protocol.ObjectExplorerRefreshRequest.type, nodeInfo).then(r => r, e => {
                client.logFailedRequest(protocol.ObjectExplorerRefreshRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let closeSession = (closeSessionInfo) => {
            return client.sendRequest(protocol.ObjectExplorerCloseSessionRequest.type, closeSessionInfo).then(r => r, e => {
                client.logFailedRequest(protocol.ObjectExplorerCloseSessionRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let findNodes = (findNodesInfo) => {
            return client.sendRequest(protocol.ObjectExplorerFindNodesRequest.type, findNodesInfo).then(r => r, e => {
                client.logFailedRequest(protocol.ObjectExplorerFindNodesRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        const onObjectExplorerCreateSessionCompleteEventEmitter = this.registerNotificationEmitter(protocol.ObjectExplorerCreateSessionCompleteNotification.type);
        let registerOnSessionCreated = (handler) => {
            return onObjectExplorerCreateSessionCompleteEventEmitter.event(handler);
        };
        const onObjectExplorerSessionDisconnectedEventEmitter = this.registerNotificationEmitter(protocol.ObjectExplorerSessionDisconnectedNotification.type);
        let registerOnSessionDisconnected = (handler) => {
            return onObjectExplorerSessionDisconnectedEventEmitter.event(handler);
        };
        const onObjectExplorerExpandCompleteEventEmitter = this.registerNotificationEmitter(protocol.ObjectExplorerExpandCompleteNotification.type);
        let registerOnExpandCompleted = (handler) => {
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
exports.ObjectExplorerFeature = ObjectExplorerFeature;
ObjectExplorerFeature.messagesTypes = [
    protocol.ObjectExplorerCreateSessionRequest.type,
    protocol.ObjectExplorerExpandRequest.type,
    protocol.ObjectExplorerRefreshRequest.type,
    protocol.ObjectExplorerCloseSessionRequest.type,
    protocol.ObjectExplorerCreateSessionCompleteNotification.type,
    protocol.ObjectExplorerExpandCompleteNotification.type,
    protocol.ObjectExplorerFindNodesRequest.type
];
class ScriptingFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, ScriptingFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'scripting').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let scriptAsOperation = (connectionUri, operation, metadata, paramDetails) => {
            return client.sendRequest(protocol.ScriptingRequest.type, client.sqlc2p.asScriptingParams(connectionUri, operation, metadata, paramDetails)).then(r => r, e => {
                client.logFailedRequest(protocol.ScriptingRequest.type, e);
                return Promise.reject(e);
            });
        };
        const onScriptingCompleteEventEmitter = this.registerNotificationEmitter(protocol.ScriptingCompleteNotification.type);
        let registerOnScriptingComplete = (handler) => {
            return onScriptingCompleteEventEmitter.event(handler);
        };
        return azdata.dataprotocol.registerScriptingProvider({
            providerId: client.providerId,
            registerOnScriptingComplete,
            scriptAsOperation
        });
    }
}
exports.ScriptingFeature = ScriptingFeature;
ScriptingFeature.messagesTypes = [
    protocol.ScriptingRequest.type,
    protocol.ScriptingCompleteNotification.type
];
class TaskServicesFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, TaskServicesFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'taskServices').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let getAllTasks = (listTasksParams) => {
            return client.sendRequest(protocol.ListTasksRequest.type, listTasksParams).then(r => r, e => {
                client.logFailedRequest(protocol.ListTasksRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        let cancelTask = (cancelTaskParams) => {
            return client.sendRequest(protocol.CancelTaskRequest.type, cancelTaskParams).then(r => r, e => {
                client.logFailedRequest(protocol.CancelTaskRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        const onTaskCreatedEventEmitter = this.registerNotificationEmitter(protocol.TaskCreatedNotification.type);
        let registerOnTaskCreated = (handler) => {
            return onTaskCreatedEventEmitter.event(handler);
        };
        const onTaskStatusChangedEventEmitter = this.registerNotificationEmitter(protocol.TaskStatusChangedNotification.type);
        let registerOnTaskStatusChanged = (handler) => {
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
exports.TaskServicesFeature = TaskServicesFeature;
TaskServicesFeature.messagesTypes = [
    protocol.ListTasksRequest.type,
    protocol.CancelTaskRequest.type,
    protocol.TaskCreatedNotification.type,
    protocol.TaskStatusChangedNotification.type
];
class FileBrowserFeature extends SqlOpsFeature {
    constructor(client) {
        super(client, FileBrowserFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
        ensure(ensure(capabilities, 'connection'), 'fileBrowser').dynamicRegistration = true;
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let openFileBrowser = (ownerUri, expandPath, fileFilters, changeFilter, showFoldersOnly) => {
            let params = { ownerUri, expandPath, fileFilters, changeFilter, showFoldersOnly };
            return client.sendRequest(protocol.FileBrowserOpenRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.FileBrowserOpenRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        const onFileBrowserOpenedEventEmitter = this.registerNotificationEmitter(protocol.FileBrowserOpenedNotification.type);
        let registerOnFileBrowserOpened = (handler) => {
            return onFileBrowserOpenedEventEmitter.event(handler);
        };
        let expandFolderNode = (ownerUri, expandPath) => {
            let params = { ownerUri, expandPath };
            return client.sendRequest(protocol.FileBrowserExpandRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.FileBrowserExpandRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        const onFileBrowserExpandedEventEmitter = this.registerNotificationEmitter(protocol.FileBrowserExpandedNotification.type);
        let registerOnFolderNodeExpanded = (handler) => {
            return onFileBrowserExpandedEventEmitter.event(handler);
        };
        let validateFilePaths = (ownerUri, serviceType, selectedFiles) => {
            let params = { ownerUri, serviceType, selectedFiles };
            return client.sendRequest(protocol.FileBrowserValidateRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.FileBrowserValidateRequest.type, e);
                return Promise.resolve(undefined);
            });
        };
        const onFileBrowserValidatedEventEmitter = this.registerNotificationEmitter(protocol.FileBrowserValidatedNotification.type);
        let registerOnFilePathsValidated = (handler) => {
            return onFileBrowserValidatedEventEmitter.event(handler);
        };
        let closeFileBrowser = (ownerUri) => {
            let params = { ownerUri };
            return client.sendRequest(protocol.FileBrowserCloseRequest.type, params).then(r => r, e => {
                client.logFailedRequest(protocol.FileBrowserCloseRequest.type, e);
                return Promise.resolve(undefined);
            });
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
exports.FileBrowserFeature = FileBrowserFeature;
FileBrowserFeature.messagesTypes = [
    protocol.FileBrowserOpenRequest.type,
    protocol.FileBrowserOpenedNotification.type,
    protocol.FileBrowserExpandRequest.type,
    protocol.FileBrowserExpandedNotification.type,
    protocol.FileBrowserValidateRequest.type,
    protocol.FileBrowserValidatedNotification.type,
    protocol.FileBrowserCloseRequest.type
];
/**
 *
 */
class SqlOpsDataClient extends vscode_languageclient_1.LanguageClient {
    constructor(arg1, arg2, arg3, arg4, arg5) {
        let features;
        if (is.string(arg2)) {
            super(arg1, arg2, arg3, arg4, arg5);
            this._providerId = arg4.providerId;
            features = arg4.features;
        }
        else {
            super(arg1, arg2, arg3, arg4);
            this._providerId = arg3.providerId;
            features = arg3.features;
        }
        this._sqlc2p = codeConverter_1.c2p;
        this._sqlp2c = protocolConverter_1.p2c;
        this.registerSqlopsFeatures(features || SqlOpsDataClient.defaultFeatures);
    }
    get sqlc2p() {
        return this._sqlc2p;
    }
    get sqlp2c() {
        return this._sqlp2c;
    }
    get providerId() {
        return this._providerId;
    }
    registerSqlopsFeatures(features) {
        features.map(f => {
            this.registerFeature(new f(this));
        });
    }
}
exports.SqlOpsDataClient = SqlOpsDataClient;
SqlOpsDataClient.defaultFeatures = [
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
/**
 * Base class containing shared code to reduce boilerplate for services
 */
class BaseService {
    constructor(client) {
        this.client = client;
    }
    /**
     * Sends the specified request and logs the failure through the client if one occurs before rethrowing.
     * @param type RequestType, typically in the format 'contracts.DoThingRequest.type'
     * @param params parameters to be passed to the request
     * @returns result from the request
     */
    runWithErrorHandling(type, params) {
        return this.client.sendRequest(type, params).then((result) => { return result; }, (error) => {
            this.client.logFailedRequest(type, error);
            return Promise.reject(error);
        });
    }
}
exports.BaseService = BaseService;
