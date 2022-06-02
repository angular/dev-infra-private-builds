/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommandModule } from 'yargs';
import { BuiltPackageWithInfo } from '../config/index';
/**
 * Type describing the JSON stdin input of this command. The release tool will
 * deliver this information through `stdin` because command line arguments are
 * less reliable and have max-length limits.
 *
 * @important When changing this, make sure the release action
 *   invocation is updated as well.
 */
export interface ReleasePrecheckJsonStdin {
    /** Package output that has been built and can be checked. */
    builtPackagesWithInfo: BuiltPackageWithInfo[];
    /** New version that is intended to be released. */
    newVersion: string;
}
/** CLI command module for running checks before releasing. */
export declare const ReleasePrecheckCommandModule: CommandModule<{}, {}>;
