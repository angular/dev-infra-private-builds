/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/benchmark/driver-utilities/e2e_util" />
export declare function openBrowser(config: {
    url?: string;
    params?: {
        name: string;
        value: any;
    }[];
    ignoreBrowserSynchronization?: boolean;
}): void;
/**
 * @experimental This API will be moved to Protractor.
 */
export declare function verifyNoBrowserErrors(): void;
