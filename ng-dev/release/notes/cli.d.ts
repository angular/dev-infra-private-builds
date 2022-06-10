/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import semver from 'semver';
import { CommandModule } from 'yargs';
/** Command line options for building a release. */
export interface Options {
    from: string;
    to: string;
    prependToChangelog: boolean;
    releaseVersion: semver.SemVer;
    type: 'github-release' | 'changelog';
}
/** CLI command module for generating release notes. */
export declare const ReleaseNotesCommandModule: CommandModule<{}, Options>;
