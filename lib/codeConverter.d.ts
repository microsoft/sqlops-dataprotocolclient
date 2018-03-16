import * as sqlops from 'sqlops';
import * as proto from './protocol';
import * as types from './types';
export interface Ic2p {
    asConnectionParams(connectionUri: string, connectionInfo: sqlops.ConnectionInfo): proto.ConnectParams;
    asExecutionPlanOptions(planOptions: sqlops.ExecutionPlanOptions): types.ExecutionPlanOptions;
    asScriptingParams(connectionUri: string, operation: sqlops.ScriptOperation, metadata: sqlops.ObjectMetadata, paramDetails: sqlops.ScriptingParamDetails): types.ScriptingParams;
}
export declare const c2p: Ic2p;
