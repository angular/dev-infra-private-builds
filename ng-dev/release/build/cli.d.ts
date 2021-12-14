/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommandModule } from 'yargs';
import { BuiltPackage } from '../config/index';
/**
 * Type describing the JSON output of this command.
 *
 * @important When changing this, make sure the release action
 *   invocation is updated as well.
 */
export declare type ReleaseBuildJsonStdout = BuiltPackage[];
/** Command line options for building a release. */
export interface ReleaseBuildOptions {
    json: boolean;
}
/** CLI command module for building release output. */
export declare const ReleaseBuildCommandModule: CommandModule<{}, ReleaseBuildOptions>;
