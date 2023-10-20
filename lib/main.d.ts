import { LanguageClient, ServerOptions, LanguageClientOptions as VSLanguageClientOptions, DynamicFeature, ServerCapabilities, RegistrationData, RPCMessageType, Disposable, RequestType, NotificationType } from 'vscode-languageclient';
import * as vscode from 'vscode';
import { Ic2p } from './codeConverter';
import * as protocol from './protocol';
import { Ip2c } from './protocolConverter';
export interface ISqlOpsFeature {
    new (client: SqlOpsDataClient): any;
}
export interface ClientOptions extends VSLanguageClientOptions {
    providerId: string;
    features?: Array<ISqlOpsFeature>;
}
/**
 *
 */
export declare abstract class SqlOpsFeature<T> implements DynamicFeature<T> {
    protected _client: SqlOpsDataClient;
    private _message;
    protected _providers: Map<string, Disposable>;
    protected _disposables: Disposable[];
    constructor(_client: SqlOpsDataClient, _message: RPCMessageType | RPCMessageType[]);
    get messages(): RPCMessageType | RPCMessageType[];
    abstract fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    abstract initialize(capabilities: ServerCapabilities): void;
    register(messages: RPCMessageType | RPCMessageType[], data: RegistrationData<T>): void;
    protected abstract registerProvider(options: T): Disposable;
    unregister(id: string): void;
    dispose(): void;
    /**
     * Registers an EventEmitter for the specified notification, which will fire an event whenever that notification is received.
     */
    protected registerNotificationEmitter<P, RO>(notificationType: NotificationType<P, RO>): vscode.EventEmitter<P>;
}
export declare class CapabilitiesFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
export declare class ConnectionFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
export declare class QueryFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
export declare class MetadataFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
export declare class AdminServicesFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
export declare class BackupFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
export declare class RestoreFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
export declare class ObjectExplorerFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
export declare class ScriptingFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
export declare class TaskServicesFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
export declare class FileBrowserFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
/**
 *
 */
export declare class SqlOpsDataClient extends LanguageClient {
    static readonly defaultFeatures: Array<ISqlOpsFeature>;
    private _sqlc2p;
    private _sqlp2c;
    private _providerId;
    get sqlc2p(): Ic2p;
    get sqlp2c(): Ip2c;
    get providerId(): string;
    constructor(name: string, serverOptions: ServerOptions, clientOptions: ClientOptions, forceDebug?: boolean);
    constructor(id: string, name: string, serverOptions: ServerOptions, clientOptions: ClientOptions, forceDebug?: boolean);
    private registerSqlopsFeatures;
}
/**
 * Base class containing shared code to reduce boilerplate for services
 */
export declare abstract class BaseService {
    protected readonly client: SqlOpsDataClient;
    constructor(client: SqlOpsDataClient);
    /**
     * Sends the specified request and logs the failure through the client if one occurs before rethrowing.
     * @param type RequestType, typically in the format 'contracts.DoThingRequest.type'
     * @param params parameters to be passed to the request
     * @returns result from the request
     */
    protected runWithErrorHandling<P, R, E, RO>(type: RequestType<P, R, E, RO>, params: P): Thenable<R>;
}
