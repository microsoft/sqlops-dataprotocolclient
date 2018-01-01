import { DynamicFeature, ServerCapabilities, RegistrationData, RPCMessageType, Disposable } from 'vscode-languageclient';
import * as protocol from './protocol';
import { SqlOpsDataClient } from './main';
/**
 *
 */
export declare abstract class SqlOpsFeature<T> implements DynamicFeature<T> {
    protected _client: SqlOpsDataClient;
    private _message;
    protected _providers: Map<string, Disposable>;
    constructor(_client: SqlOpsDataClient, _message: RPCMessageType | RPCMessageType[]);
    readonly messages: RPCMessageType | RPCMessageType[];
    abstract fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    abstract initialize(capabilities: ServerCapabilities): void;
    register(messages: RPCMessageType | RPCMessageType[], data: RegistrationData<T>): void;
    protected abstract registerProvider(options: T): Disposable;
    unregister(id: string): void;
    dispose(): void;
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
export declare class ProfilerFeature extends SqlOpsFeature<undefined> {
    private static readonly messagesTypes;
    constructor(client: SqlOpsDataClient);
    fillClientCapabilities(capabilities: protocol.ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    protected registerProvider(options: undefined): Disposable;
}
