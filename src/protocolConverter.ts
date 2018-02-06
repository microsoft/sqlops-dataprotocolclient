import * as sqlops from 'sqlops';
import * as types from './types';

export interface Ip2c {
	asProviderMetadata(params: types.MetadataQueryResult): sqlops.ProviderMetadata;
	asServerCapabilities(result: types.CapabiltiesDiscoveryResult): sqlops.DataProtocolServerCapabilities;
}

function asProviderMetadata(params: types.MetadataQueryResult): sqlops.ProviderMetadata {
	let objectMetadata: sqlops.ObjectMetadata[] = [];

	if (!params.metadata || !params.metadata.length) {
		return {
			objectMetadata
		};
	}

	for (let i = 0; i < params.metadata.length; ++i) {
		let metadata: sqlops.ObjectMetadata = params.metadata[i];

		let metadataTypeName: string;
		if (metadata.metadataTypeName) {
			// Read from the provider since it's defined
			metadataTypeName = metadata.metadataTypeName;
		} else if (metadata.metadataType === sqlops.MetadataType.View) {
			metadataTypeName = 'View';
		} else if (metadata.metadataType === sqlops.MetadataType.SProc) {
			metadataTypeName = 'StoredProcedure';
		} else if (metadata.metadataType === sqlops.MetadataType.Function) {
			metadataTypeName = 'Function';
		} else {
			metadataTypeName = 'Table';
		}

		objectMetadata.push({
			metadataTypeName,
			metadataType: metadata.metadataType,
			name: metadata.name,
			schema: metadata.schema,
			urn: metadata.urn
		});
	}

	return {
		objectMetadata
	};
}

function asServiceOptionType(val: string): sqlops.ServiceOptionType {
	if (val === 'string') {
		return sqlops.ServiceOptionType.string;
	} else if (val === 'multistring') {
		return sqlops.ServiceOptionType.multistring;
	} else if (val === 'password') {
		return sqlops.ServiceOptionType.password;
	} else if (val === 'number') {
		return sqlops.ServiceOptionType.number;
	} else if (val === 'boolean') {
		return sqlops.ServiceOptionType.boolean;
	} else if (val === 'category') {
		return sqlops.ServiceOptionType.category;
	} else if (val === 'object') {
		return sqlops.ServiceOptionType.object;
	}

	// assume string for unknown value types
	return sqlops.ServiceOptionType.string;
}



function buildServiceOption(srcOption: types.ServiceOption): sqlops.ServiceOption {
	return {
		name: srcOption.name,
		displayName: srcOption.displayName ? srcOption.displayName : srcOption.name,
		description: srcOption.description,
		groupName: srcOption.groupName,
		defaultValue: srcOption.defaultValue,
		categoryValues: srcOption.categoryValues,
		isRequired: srcOption.isRequired,
		isArray: srcOption.isArray,
		objectType: srcOption.objectType,
		valueType: asServiceOptionType(srcOption.valueType),
	};
}


function asServerCapabilities(result: types.CapabiltiesDiscoveryResult): sqlops.DataProtocolServerCapabilities {
	let capabilities: sqlops.DataProtocolServerCapabilities = {
		protocolVersion: result.capabilities.protocolVersion,
		providerName: result.capabilities.providerName,
		providerDisplayName: result.capabilities.providerDisplayName,
		connectionProvider: undefined,
		adminServicesProvider: undefined,
		features: []
	};

	if (result.capabilities.adminServicesProvider) {
		capabilities.adminServicesProvider = <sqlops.AdminServicesOptions>{
			databaseInfoOptions: new Array<sqlops.ServiceOption>(),
			databaseFileInfoOptions: new Array<sqlops.ServiceOption>(),
			fileGroupInfoOptions: new Array<sqlops.ServiceOption>()
		};

		if (result.capabilities.adminServicesProvider.databaseInfoOptions
			&& result.capabilities.adminServicesProvider.databaseInfoOptions.length > 0) {
			for (let i = 0; i < result.capabilities.adminServicesProvider.databaseInfoOptions.length; ++i) {
				let srcOption: any = result.capabilities.adminServicesProvider.databaseInfoOptions[i];
				let descOption: sqlops.ServiceOption = buildServiceOption(srcOption);
				capabilities.adminServicesProvider.databaseInfoOptions.push(descOption);
			}
		}

		if (result.capabilities.adminServicesProvider.databaseFileInfoOptions
			&& result.capabilities.adminServicesProvider.databaseFileInfoOptions.length > 0) {
			for (let i = 0; i < result.capabilities.adminServicesProvider.databaseFileInfoOptions.length; ++i) {
				//let srcOption: types.ServiceOption = result.capabilities.adminServicesProvider.databaseFileInfoOptions[i];
				let srcOption: any = result.capabilities.adminServicesProvider.databaseFileInfoOptions[i];
				let descOption: sqlops.ServiceOption = buildServiceOption(srcOption);
				capabilities.adminServicesProvider.databaseFileInfoOptions.push(descOption);
			}
		}

		if (result.capabilities.adminServicesProvider.fileGroupInfoOptions
			&& result.capabilities.adminServicesProvider.fileGroupInfoOptions.length > 0) {
			for (let i = 0; i < result.capabilities.adminServicesProvider.fileGroupInfoOptions.length; ++i) {
				//let srcOption: types.ServiceOption = result.capabilities.adminServicesProvider.fileGroupInfoOptions[i];
				let srcOption: any = result.capabilities.adminServicesProvider.fileGroupInfoOptions[i];
				let descOption: sqlops.ServiceOption = buildServiceOption(srcOption);
				capabilities.adminServicesProvider.fileGroupInfoOptions.push(descOption);
			}
		}
	}

	if (result.capabilities.connectionProvider
		&& result.capabilities.connectionProvider.options
		&& result.capabilities.connectionProvider.options.length > 0) {
		capabilities.connectionProvider = <sqlops.ConnectionProviderOptions>{
			options: new Array<sqlops.ConnectionOption>()
		};
		for (let i = 0; i < result.capabilities.connectionProvider.options.length; ++i) {
			let srcOption: any = result.capabilities.connectionProvider.options[i];
			let descOption: sqlops.ConnectionOption = {
				name: srcOption.name,
				displayName: srcOption.displayName ? srcOption.displayName : srcOption.name,
				description: srcOption.description,
				groupName: srcOption.groupName,
				defaultValue: srcOption.defaultValue,
				categoryValues: srcOption.categoryValues,
				isIdentity: srcOption.isIdentity,
				isRequired: srcOption.isRequired,
				valueType: asServiceOptionType(srcOption.valueType),
				specialValueType: undefined
			};

			if (srcOption.specialValueType === 'serverName') {
				descOption.specialValueType = sqlops.ConnectionOptionSpecialType.serverName;
			} else if (srcOption.specialValueType === 'databaseName') {
				descOption.specialValueType = sqlops.ConnectionOptionSpecialType.databaseName;
			} else if (srcOption.specialValueType === 'authType') {
				descOption.specialValueType = sqlops.ConnectionOptionSpecialType.authType;
			} else if (srcOption.specialValueType === 'userName') {
				descOption.specialValueType = sqlops.ConnectionOptionSpecialType.userName;
			} else if (srcOption.specialValueType === 'password') {
				descOption.specialValueType = sqlops.ConnectionOptionSpecialType.password;
			} else if (srcOption.specialValueType === 'appName') {
				descOption.specialValueType = sqlops.ConnectionOptionSpecialType.appName;
			}

			capabilities.connectionProvider.options.push(descOption);
		}
	}

	if (result.capabilities.features
		&& result.capabilities.features.length > 0) {
		result.capabilities.features.forEach(feature => {
			let descFeature: sqlops.FeatureMetadataProvider = {
				enabled: feature.enabled,
				featureName: feature.featureName,
				optionsMetadata: []
			};
			capabilities.features.push(descFeature);
			if (feature.optionsMetadata) {
				feature.optionsMetadata.forEach(srcOption => {
					descFeature.optionsMetadata.push(buildServiceOption(<any>srcOption));
				});
			}
		});
	}

	return capabilities;
}

export const p2c: Ip2c = {
	asProviderMetadata,
	asServerCapabilities
};
