/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/build/cli" />
import { CommandModule } from 'yargs';
/** Command line options for building a release. */
export interface ReleaseBuildOptions {
    json: boolean;
}
/** CLI command module for building release output. */
export declare const ReleaseBuildCommandModule: CommandModule<{}, ReleaseBuildOptions>;
