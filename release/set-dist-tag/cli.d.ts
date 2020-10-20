/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/set-dist-tag/cli" />
import { CommandModule } from 'yargs';
/** Command line options for setting an NPM dist tag. */
export interface ReleaseSetDistTagOptions {
    tagName: string;
    targetVersion: string;
}
/** CLI command module for setting an NPM dist tag. */
export declare const ReleaseSetDistTagCommand: CommandModule<{}, ReleaseSetDistTagOptions>;
