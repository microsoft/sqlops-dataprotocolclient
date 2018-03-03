import * as sqlops from 'sqlops';
import * as types from './types';
export interface Ip2c {
    asProviderMetadata(params: types.MetadataQueryResult): sqlops.ProviderMetadata;
    asServerCapabilities(result: types.CapabiltiesDiscoveryResult): sqlops.DataProtocolServerCapabilities;
}
export declare const p2c: Ip2c;
