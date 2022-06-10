/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuiltPackage } from '../config/index.js';
export declare abstract class BuildWorker {
    /**
     * Builds the release output without polluting the process stdout. Build scripts commonly
     * print messages to stderr or stdout. This is fine in most cases, but sometimes other tooling
     * reserves stdout for data transfer (e.g. when `ng release build --json` is invoked). To not
     * pollute the stdout in such cases, we launch a child process for building the release packages
     * and redirect all stdout output to the stderr channel (which can be read in the terminal).
     */
    static invokeBuild(): Promise<BuiltPackage[] | null>;
}
