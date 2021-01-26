/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/release-notes" />
import * as semver from 'semver';
/**
 * Gets the default pattern for extracting release notes for the given version.
 * This pattern matches for the conventional-changelog Angular preset.
 */
export declare function getDefaultExtractReleaseNotesPattern(version: semver.SemVer): RegExp;
/** Gets the path for the changelog file in a given project. */
export declare function getLocalChangelogFilePath(projectDir: string): string;
