import * as azdata from 'azdata';
import * as proto from './protocol';
import * as types from './types';

export interface Ic2p {
	asConnectionParams(connectionUri: string, connectionInfo: azdata.ConnectionInfo): proto.ConnectParams;
	asExecutionPlanOptions(planOptions: azdata.ExecutionPlanOptions): types.ExecutionPlanOptions;
	asScriptingParams(connectionUri: string, operation: azdata.ScriptOperation, metadata: azdata.ObjectMetadata, paramDetails: azdata.ScriptingParamDetails): types.ScriptingParams;
}

function asConnectionParams(ownerUri: string, connInfo: azdata.ConnectionInfo): proto.ConnectParams {
	return {
		ownerUri,
		connection: {
			options: connInfo.options
		}
	};
}

function asExecutionPlanOptions(planOptions: azdata.ExecutionPlanOptions): types.ExecutionPlanOptions {
	return {
		includeEstimatedExecutionPlanXml: planOptions ? planOptions.displayEstimatedQueryPlan : undefined,
		includeActualExecutionPlanXml: planOptions ? planOptions.displayActualQueryPlan : undefined
	};
}

function asScriptingParams(ownerURI: string, operation: azdata.ScriptOperation, metadata: azdata.ObjectMetadata, paramDetails: azdata.ScriptingParamDetails): types.ScriptingParams {
	let scriptingObject: types.ScriptingObject = {
		type: metadata.metadataTypeName,
		schema: metadata.schema,
		name: metadata.name
	};
	let targetDatabaseEngineEdition = paramDetails.targetDatabaseEngineEdition;
	let targetDatabaseEngineType = paramDetails.targetDatabaseEngineType;
	let scriptCompatibilityOption = paramDetails.scriptCompatibilityOption;
	let scriptOptions: types.ScriptOptions = {
		scriptCreateDrop: (operation === azdata.ScriptOperation.Delete) ? 'ScriptDrop' :
			(operation === azdata.ScriptOperation.Select) ? 'ScriptSelect' : 'ScriptCreate',
		typeOfDataToScript: 'SchemaOnly',
		scriptStatistics: 'ScriptStatsNone',
		targetDatabaseEngineEdition: targetDatabaseEngineEdition ? targetDatabaseEngineEdition : 'SqlServerEnterpriseEdition',
		targetDatabaseEngineType: targetDatabaseEngineType ? targetDatabaseEngineType : 'SingleInstance',
		scriptCompatibilityOption: scriptCompatibilityOption ? scriptCompatibilityOption : 'Script140Compat'
	};
	return {
		connectionString: null,
		filePath: paramDetails.filePath,
		scriptingObjects: [scriptingObject],
		scriptDestination: 'ToEditor',
		includeObjectCriteria: null,
		excludeObjectCriteria: null,
		includeSchemas: null,
		excludeSchemas: null,
		includeTypes: null,
		excludeTypes: null,
		scriptOptions,
		connectionDetails: null,
		selectScript: null,
		ownerURI,
		operation
	};
}

export const c2p: Ic2p = {
	asConnectionParams,
	asExecutionPlanOptions,
	asScriptingParams
};
