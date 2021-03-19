/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/ts-circular-dependencies" />
import * as yargs from 'yargs';
import { CircularDependenciesTestConfig } from './config';
export declare function tsCircularDependenciesBuilder(localYargs: yargs.Argv): yargs.Argv<{
    config: string;
} & {
    warnings: boolean | undefined;
}>;
/**
 * Runs the ts-circular-dependencies tool.
 * @param approve Whether the detected circular dependencies should be approved.
 * @param config Configuration for the current circular dependencies test.
 * @param printWarnings Whether warnings should be printed out.
 * @returns Status code.
 */
export declare function main(approve: boolean, config: CircularDependenciesTestConfig, printWarnings: boolean): number;
