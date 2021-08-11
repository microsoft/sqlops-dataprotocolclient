/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// This is the place for API experiments and proposal.

declare module 'azdata' {
	export interface QueryProvider {
		renameQuery(newUri: string, oldUri: string): Thenable<void>;
	}
}
