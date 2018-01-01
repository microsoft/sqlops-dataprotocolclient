"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types = require("./types");
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
        else if (metadata.metadataType === types.MetadataType.View) {
            metadataTypeName = 'View';
        }
        else if (metadata.metadataType === types.MetadataType.SProc) {
            metadataTypeName = 'StoredProcedure';
        }
        else if (metadata.metadataType === types.MetadataType.Function) {
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
exports.p2c = {
    asProviderMetadata
};
