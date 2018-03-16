"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlops = require("sqlops");
function asProviderMetadata(params) {
    let objectMetadata = [];
    if (!params.metadata || !params.metadata.length) {
        return {
            objectMetadata
        };
    }
    for (let i = 0; i < params.metadata.length; ++i) {
        let metadata = params.metadata[i];
        let metadataTypeName;
        if (metadata.metadataTypeName) {
            // Read from the provider since it's defined
            metadataTypeName = metadata.metadataTypeName;
        }
        else if (metadata.metadataType === sqlops.MetadataType.View) {
            metadataTypeName = 'View';
        }
        else if (metadata.metadataType === sqlops.MetadataType.SProc) {
            metadataTypeName = 'StoredProcedure';
        }
        else if (metadata.metadataType === sqlops.MetadataType.Function) {
            metadataTypeName = 'Function';
        }
        else {
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
function asServiceOptionType(val) {
    if (val === 'string') {
        return sqlops.ServiceOptionType.string;
    }
    else if (val === 'multistring') {
        return sqlops.ServiceOptionType.multistring;
    }
    else if (val === 'password') {
        return sqlops.ServiceOptionType.password;
    }
    else if (val === 'number') {
        return sqlops.ServiceOptionType.number;
    }
    else if (val === 'boolean') {
        return sqlops.ServiceOptionType.boolean;
    }
    else if (val === 'category') {
        return sqlops.ServiceOptionType.category;
    }
    else if (val === 'object') {
        return sqlops.ServiceOptionType.object;
    }
    // assume string for unknown value types
    return sqlops.ServiceOptionType.string;
}
function buildServiceOption(srcOption) {
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
function asServerCapabilities(result) {
    let capabilities = {
        protocolVersion: result.capabilities.protocolVersion,
        providerName: result.capabilities.providerName,
        providerDisplayName: result.capabilities.providerDisplayName,
        connectionProvider: undefined,
        adminServicesProvider: undefined,
        features: []
    };
    if (result.capabilities.adminServicesProvider) {
        capabilities.adminServicesProvider = {
            databaseInfoOptions: new Array(),
            databaseFileInfoOptions: new Array(),
            fileGroupInfoOptions: new Array()
        };
        if (result.capabilities.adminServicesProvider.databaseInfoOptions
            && result.capabilities.adminServicesProvider.databaseInfoOptions.length > 0) {
            for (let i = 0; i < result.capabilities.adminServicesProvider.databaseInfoOptions.length; ++i) {
                let srcOption = result.capabilities.adminServicesProvider.databaseInfoOptions[i];
                let descOption = buildServiceOption(srcOption);
                capabilities.adminServicesProvider.databaseInfoOptions.push(descOption);
            }
        }
        if (result.capabilities.adminServicesProvider.databaseFileInfoOptions
            && result.capabilities.adminServicesProvider.databaseFileInfoOptions.length > 0) {
            for (let i = 0; i < result.capabilities.adminServicesProvider.databaseFileInfoOptions.length; ++i) {
                //let srcOption: types.ServiceOption = result.capabilities.adminServicesProvider.databaseFileInfoOptions[i];
                let srcOption = result.capabilities.adminServicesProvider.databaseFileInfoOptions[i];
                let descOption = buildServiceOption(srcOption);
                capabilities.adminServicesProvider.databaseFileInfoOptions.push(descOption);
            }
        }
        if (result.capabilities.adminServicesProvider.fileGroupInfoOptions
            && result.capabilities.adminServicesProvider.fileGroupInfoOptions.length > 0) {
            for (let i = 0; i < result.capabilities.adminServicesProvider.fileGroupInfoOptions.length; ++i) {
                //let srcOption: types.ServiceOption = result.capabilities.adminServicesProvider.fileGroupInfoOptions[i];
                let srcOption = result.capabilities.adminServicesProvider.fileGroupInfoOptions[i];
                let descOption = buildServiceOption(srcOption);
                capabilities.adminServicesProvider.fileGroupInfoOptions.push(descOption);
            }
        }
    }
    if (result.capabilities.connectionProvider
        && result.capabilities.connectionProvider.options
        && result.capabilities.connectionProvider.options.length > 0) {
        capabilities.connectionProvider = {
            options: new Array()
        };
        for (let i = 0; i < result.capabilities.connectionProvider.options.length; ++i) {
            let srcOption = result.capabilities.connectionProvider.options[i];
            let descOption = {
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
            }
            else if (srcOption.specialValueType === 'databaseName') {
                descOption.specialValueType = sqlops.ConnectionOptionSpecialType.databaseName;
            }
            else if (srcOption.specialValueType === 'authType') {
                descOption.specialValueType = sqlops.ConnectionOptionSpecialType.authType;
            }
            else if (srcOption.specialValueType === 'userName') {
                descOption.specialValueType = sqlops.ConnectionOptionSpecialType.userName;
            }
            else if (srcOption.specialValueType === 'password') {
                descOption.specialValueType = sqlops.ConnectionOptionSpecialType.password;
            }
            else if (srcOption.specialValueType === 'appName') {
                descOption.specialValueType = sqlops.ConnectionOptionSpecialType.appName;
            }
            capabilities.connectionProvider.options.push(descOption);
        }
    }
    if (result.capabilities.features
        && result.capabilities.features.length > 0) {
        result.capabilities.features.forEach(feature => {
            let descFeature = {
                enabled: feature.enabled,
                featureName: feature.featureName,
                optionsMetadata: []
            };
            capabilities.features.push(descFeature);
            if (feature.optionsMetadata) {
                feature.optionsMetadata.forEach(srcOption => {
                    descFeature.optionsMetadata.push(buildServiceOption(srcOption));
                });
            }
        });
    }
    return capabilities;
}
exports.p2c = {
    asProviderMetadata,
    asServerCapabilities
};
