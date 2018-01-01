import { LanguageClient, ServerOptions, LanguageClientOptions as VSLanguageClientOptions } from 'vscode-languageclient';
import { Ic2p } from './codeConverter';
import { Ip2c } from './protocolConverter';
export * from './features';
export interface LanguageClientOptions extends VSLanguageClientOptions {
    providerId: string;
    serverConnectionMetadata: any;
}
/**
 *
 */
export declare class SqlOpsDataClient extends LanguageClient {
    private _sqlc2p;
    private _sqlp2c;
    private _providerId;
    readonly sqlc2p: Ic2p;
    readonly sqlp2c: Ip2c;
    readonly providerId: string;
    constructor(name: string, serverOptions: ServerOptions, clientOptions: LanguageClientOptions, forceDebug?: boolean);
    constructor(id: string, name: string, serverOptions: ServerOptions, clientOptions: LanguageClientOptions, forceDebug?: boolean);
}
