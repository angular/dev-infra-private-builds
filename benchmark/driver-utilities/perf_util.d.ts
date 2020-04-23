/// <amd-module name="@angular/dev-infra/benchmark/driver-utilities/perf_util" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export { verifyNoBrowserErrors } from './e2e_util';
export declare function runBenchmark(config: {
    id: string;
    url: string;
    params: {
        name: string;
        value: any;
    }[];
    ignoreBrowserSynchronization?: boolean;
    microMetrics?: {
        [key: string]: string;
    };
    work?: () => void;
    prepare?: () => void;
    setup?: () => void;
}): Promise<any>;
