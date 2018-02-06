import * as sqlops from 'sqlops';
import * as proto from './protocol';
import * as types from './types';

export interface Ic2p {
	asConnectionParams(connectionUri: string, connectionInfo: sqlops.ConnectionInfo): proto.ConnectParams;
	asExecutionPlanOptions(planOptions: sqlops.ExecutionPlanOptions): types.ExecutionPlanOptions;
	asScriptingParams(connectionUri: string, operation: sqlops.ScriptOperation, metadata: sqlops.ObjectMetadata, paramDetails: sqlops.ScriptingParamDetails): types.ScriptingParams;
}

function asConnectionParams(ownerUri: string, connInfo: sqlops.ConnectionInfo): proto.ConnectParams {
	return {
		ownerUri,
		connection: {
			options: connInfo.options
		}
	};
}

function asExecutionPlanOptions(planOptions: sqlops.ExecutionPlanOptions): types.ExecutionPlanOptions {
	return {
		includeEstimatedExecutionPlanXml: planOptions ? planOptions.displayEstimatedQueryPlan : undefined,
		includeActualExecutionPlanXml: planOptions ? planOptions.displayActualQueryPlan : undefined
	};
}

function asScriptingParams(ownerURI: string, operation: sqlops.ScriptOperation, metadata: sqlops.ObjectMetadata, paramDetails: sqlops.ScriptingParamDetails): types.ScriptingParams {
	let scriptingObject: types.ScriptingObject = {
		type: metadata.metadataTypeName,
		schema: metadata.schema,
		name: metadata.name
	};
	let targetDatabaseEngineEdition = paramDetails.targetDatabaseEngineEdition;
	let targetDatabaseEngineType = paramDetails.targetDatabaseEngineType;
	let scriptCompatibilityOption = paramDetails.scriptCompatibilityOption;
	let scriptOptions: types.ScriptOptions = {
		scriptCreateDrop: (operation === sqlops.ScriptOperation.Delete) ? 'ScriptDrop' :
			(operation === sqlops.ScriptOperation.Select) ? 'ScriptSelect' : 'ScriptCreate',
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
