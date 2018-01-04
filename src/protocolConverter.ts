import * as sqlops from 'sqlops';
import * as types from './types';

export interface Ip2c {
	asProviderMetadata(params: types.MetadataQueryResult): sqlops.ProviderMetadata;
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

export const p2c: Ip2c = {
	asProviderMetadata
};
