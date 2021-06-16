/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/notes/cli" />
import { SemVer } from 'semver';
import { CommandModule } from 'yargs';
/** Command line options for building a release. */
export interface ReleaseNotesOptions {
    from?: string;
    to: string;
    outFile?: string;
    releaseVersion: SemVer;
    type: 'github-release' | 'changelog';
}
/** CLI command module for generating release notes. */
export declare const ReleaseNotesCommandModule: CommandModule<{}, ReleaseNotesOptions>;
