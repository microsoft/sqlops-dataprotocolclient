import * as azdata from 'azdata';
import * as proto from './protocol';
import * as types from './types';
export interface Ic2p {
    asConnectionParams(connectionUri: string, connectionInfo: azdata.ConnectionInfo): proto.ConnectParams;
    asExecutionPlanOptions(planOptions: azdata.ExecutionPlanOptions): types.ExecutionPlanOptions;
    asScriptingParams(connectionUri: string, operation: azdata.ScriptOperation, metadata: azdata.ObjectMetadata, paramDetails: azdata.ScriptingParamDetails): types.ScriptingParams;
}
export declare const c2p: Ic2p;
