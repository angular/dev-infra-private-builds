/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/dry-run" />
import { Argv } from 'yargs';
/**
 * Add a --dry-run flag to the available options for the yargs argv object. When present, sets an
 * environment variable noting dry run mode.
 */
export declare function addDryRunFlag<T>(args: Argv<T>): Argv<T & {
    dryRun: boolean;
}>;
/** Whether the current environment is in dry run mode. */
export declare function isDryRun(): boolean;
/** Error to be thrown when a function or method is called in dryRun mode and shouldn't be. */
export declare class DryRunError extends Error {
    constructor();
}
