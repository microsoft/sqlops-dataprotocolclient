"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageclient_1 = require("vscode-languageclient");
const is = require("vscode-languageclient/lib/utils/is");
const codeConverter_1 = require("./codeConverter");
const protocolConverter_1 = require("./protocolConverter");
__export(require("./features"));
/**
 *
 */
class SqlOpsDataClient extends vscode_languageclient_1.LanguageClient {
    get sqlc2p() {
        return this._sqlc2p;
    }
    get sqlp2c() {
        return this._sqlp2c;
    }
    get providerId() {
        return this._providerId;
    }
    constructor(arg1, arg2, arg3, arg4, arg5) {
        if (is.string(arg2)) {
            super(arg1, arg2, arg3, arg4, arg5);
            this._providerId = arg4.providerId;
        }
        else {
            super(arg1, arg2, arg3, arg4);
            this._providerId = arg3.providerId;
        }
        this._sqlc2p = codeConverter_1.c2p;
        this._sqlp2c = protocolConverter_1.p2c;
    }
}
exports.SqlOpsDataClient = SqlOpsDataClient;
