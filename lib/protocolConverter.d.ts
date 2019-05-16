import * as azdata from 'azdata';
import * as types from './types';
export interface Ip2c {
    asProviderMetadata(params: types.MetadataQueryResult): azdata.ProviderMetadata;
    asServerCapabilities(result: types.CapabiltiesDiscoveryResult): azdata.DataProtocolServerCapabilities;
}
export declare const p2c: Ip2c;
