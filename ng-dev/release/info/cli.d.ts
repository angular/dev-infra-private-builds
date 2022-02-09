/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommandModule } from 'yargs';
import { NpmPackage } from '../config/index';
/**
 * Type describing the JSON output of this command.
 *
 * @important When changing this, make sure the release action
 *   invocation is updated as well.
 */
export declare type ReleaseInfoJsonStdout = {
    npmPackages: NpmPackage[];
};
/** Command line options for printing release information. */
export interface ReleaseInfoOptions {
    json: boolean;
}
/** CLI command module for retrieving release information. */
export declare const ReleaseInfoCommandModule: CommandModule<{}, ReleaseInfoOptions>;
