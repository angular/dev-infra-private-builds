/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/config" />
/**
 * Gets the path of the directory for the repository base.
 */
export declare function getRepoBaseDir(): string;
/**
 * Retrieve the configuration from the .ng-dev-config.js file.
 */
export declare function getAngularDevConfig<K, T>(supressError?: boolean): DevInfraConfig<K, T>;
/**
 * Interface exressing the expected structure of the DevInfraConfig.
 * Allows for providing a typing for a part of the config to read.
 */
export interface DevInfraConfig<K, T> {
    [K: string]: T;
}
