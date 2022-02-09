/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as semver from 'semver';
import { NpmDistTag } from '../versioning';
import { ReleaseBuildJsonStdout } from '../build/cli';
import { ReleaseInfoJsonStdout } from '../info/cli';
/**
 * Invokes the `ng-dev release set-dist-tag` command in order to set the specified
 * NPM dist tag for all packages in the checked out branch to the given version.
 *
 * Optionally, the NPM dist tag update can be skipped for experimental packages. This
 * is useful when tagging long-term-support packages within NPM.
 */
export declare function invokeSetNpmDistCommand(projectDir: string, npmDistTag: NpmDistTag, version: semver.SemVer, options?: {
    skipExperimentalPackages: boolean;
}): Promise<void>;
/**
 * Invokes the `ng-dev release build` command in order to build the release
 * packages for the currently checked out branch.
 */
export declare function invokeReleaseBuildCommand(projectDir: string): Promise<ReleaseBuildJsonStdout>;
/**
 * Invokes the `ng-dev release info` command in order to retrieve information
 * about the release for the currently checked-out branch.
 *
 * This is useful to e.g. determine whether a built package is currently
 * denoted as experimental or not.
 */
export declare function invokeReleaseInfoCommand(projectDir: string): Promise<ReleaseInfoJsonStdout>;
/**
 * Invokes the `yarn install` command in order to install dependencies for
 * the configured project with the currently checked out revision.
 */
export declare function invokeYarnInstallCommand(projectDir: string): Promise<void>;
