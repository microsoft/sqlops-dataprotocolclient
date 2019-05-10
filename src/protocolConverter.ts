import * as azdata from 'azdata';
import * as types from './types';

export interface Ip2c {
	asProviderMetadata(params: types.MetadataQueryResult): azdata.ProviderMetadata;
	asServerCapabilities(result: types.CapabiltiesDiscoveryResult): azdata.DataProtocolServerCapabilities;
}

function asProviderMetadata(params: types.MetadataQueryResult): azdata.ProviderMetadata {
	let objectMetadata: azdata.ObjectMetadata[] = [];

	if (!params.metadata || !params.metadata.length) {
		return {
			objectMetadata
		};
	}

	for (let i = 0; i < params.metadata.length; ++i) {
		let metadata: azdata.ObjectMetadata = params.metadata[i];

		let metadataTypeName: string;
		if (metadata.metadataTypeName) {
			// Read from the provider since it's defined
			metadataTypeName = metadata.metadataTypeName;
		} else if (metadata.metadataType === azdata.MetadataType.View) {
			metadataTypeName = 'View';
		} else if (metadata.metadataType === azdata.MetadataType.SProc) {
			metadataTypeName = 'StoredProcedure';
		} else if (metadata.metadataType === azdata.MetadataType.Function) {
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

function asServiceOptionType(val: string): azdata.ServiceOptionType {
	if (val === 'string') {
		return azdata.ServiceOptionType.string;
	} else if (val === 'multistring') {
		return azdata.ServiceOptionType.multistring;
	} else if (val === 'password') {
		return azdata.ServiceOptionType.password;
	} else if (val === 'number') {
		return azdata.ServiceOptionType.number;
	} else if (val === 'boolean') {
		return azdata.ServiceOptionType.boolean;
	} else if (val === 'category') {
		return azdata.ServiceOptionType.category;
	} else if (val === 'object') {
		return azdata.ServiceOptionType.object;
	}

	// assume string for unknown value types
	return azdata.ServiceOptionType.string;
}



function buildServiceOption(srcOption: types.ServiceOption): azdata.ServiceOption {
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


function asServerCapabilities(result: types.CapabiltiesDiscoveryResult): azdata.DataProtocolServerCapabilities {
	let capabilities: azdata.DataProtocolServerCapabilities = {
		protocolVersion: result.capabilities.protocolVersion,
		providerName: result.capabilities.providerName,
		providerDisplayName: result.capabilities.providerDisplayName,
		connectionProvider: undefined,
		adminServicesProvider: undefined,
		features: []
	};

	if (result.capabilities.adminServicesProvider) {
		capabilities.adminServicesProvider = <azdata.AdminServicesOptions>{
			databaseInfoOptions: new Array<azdata.ServiceOption>(),
			databaseFileInfoOptions: new Array<azdata.ServiceOption>(),
			fileGroupInfoOptions: new Array<azdata.ServiceOption>()
		};

		if (result.capabilities.adminServicesProvider.databaseInfoOptions
			&& result.capabilities.adminServicesProvider.databaseInfoOptions.length > 0) {
			for (let i = 0; i < result.capabilities.adminServicesProvider.databaseInfoOptions.length; ++i) {
				let srcOption: any = result.capabilities.adminServicesProvider.databaseInfoOptions[i];
				let descOption: azdata.ServiceOption = buildServiceOption(srcOption);
				capabilities.adminServicesProvider.databaseInfoOptions.push(descOption);
			}
		}

		if (result.capabilities.adminServicesProvider.databaseFileInfoOptions
			&& result.capabilities.adminServicesProvider.databaseFileInfoOptions.length > 0) {
			for (let i = 0; i < result.capabilities.adminServicesProvider.databaseFileInfoOptions.length; ++i) {
				//let srcOption: types.ServiceOption = result.capabilities.adminServicesProvider.databaseFileInfoOptions[i];
				let srcOption: any = result.capabilities.adminServicesProvider.databaseFileInfoOptions[i];
				let descOption: azdata.ServiceOption = buildServiceOption(srcOption);
				capabilities.adminServicesProvider.databaseFileInfoOptions.push(descOption);
			}
		}

		if (result.capabilities.adminServicesProvider.fileGroupInfoOptions
			&& result.capabilities.adminServicesProvider.fileGroupInfoOptions.length > 0) {
			for (let i = 0; i < result.capabilities.adminServicesProvider.fileGroupInfoOptions.length; ++i) {
				//let srcOption: types.ServiceOption = result.capabilities.adminServicesProvider.fileGroupInfoOptions[i];
				let srcOption: any = result.capabilities.adminServicesProvider.fileGroupInfoOptions[i];
				let descOption: azdata.ServiceOption = buildServiceOption(srcOption);
				capabilities.adminServicesProvider.fileGroupInfoOptions.push(descOption);
			}
		}
	}

	if (result.capabilities.connectionProvider
		&& result.capabilities.connectionProvider.options
		&& result.capabilities.connectionProvider.options.length > 0) {
		capabilities.connectionProvider = <azdata.ConnectionProviderOptions>{
			options: new Array<azdata.ConnectionOption>()
		};
		for (let i = 0; i < result.capabilities.connectionProvider.options.length; ++i) {
			let srcOption: any = result.capabilities.connectionProvider.options[i];
			let descOption: azdata.ConnectionOption = {
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
				descOption.specialValueType = azdata.ConnectionOptionSpecialType.serverName;
			} else if (srcOption.specialValueType === 'databaseName') {
				descOption.specialValueType = azdata.ConnectionOptionSpecialType.databaseName;
			} else if (srcOption.specialValueType === 'authType') {
				descOption.specialValueType = azdata.ConnectionOptionSpecialType.authType;
			} else if (srcOption.specialValueType === 'userName') {
				descOption.specialValueType = azdata.ConnectionOptionSpecialType.userName;
			} else if (srcOption.specialValueType === 'password') {
				descOption.specialValueType = azdata.ConnectionOptionSpecialType.password;
			} else if (srcOption.specialValueType === 'appName') {
				descOption.specialValueType = azdata.ConnectionOptionSpecialType.appName;
			}

			capabilities.connectionProvider.options.push(descOption);
		}
	}

	if (result.capabilities.features
		&& result.capabilities.features.length > 0) {
		result.capabilities.features.forEach(feature => {
			let descFeature: azdata.FeatureMetadataProvider = {
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
