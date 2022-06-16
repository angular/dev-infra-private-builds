/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import semver from 'semver';
import { NpmDistTag } from '../versioning/index.js';
import { ReleaseBuildJsonStdout } from '../build/cli.js';
import { ReleaseInfoJsonStdout } from '../info/cli.js';
import { BuiltPackageWithInfo } from '../config/index.js';
/** Class holding method for invoking release action external commands. */
export declare abstract class ExternalCommands {
    /**
     * Invokes the `ng-dev release set-dist-tag` command in order to set the specified
     * NPM dist tag for all packages in the checked out branch to the given version.
     *
     * Optionally, the NPM dist tag update can be skipped for experimental packages. This
     * is useful when tagging long-term-support packages within NPM.
     */
    static invokeSetNpmDist(projectDir: string, npmDistTag: NpmDistTag, version: semver.SemVer, options?: {
        skipExperimentalPackages: boolean;
    }): Promise<void>;
    /**
     * Invokes the `ng-dev release build` command in order to build the release
     * packages for the currently checked out branch.
     */
    static invokeReleaseBuild(projectDir: string): Promise<ReleaseBuildJsonStdout>;
    /**
     * Invokes the `ng-dev release info` command in order to retrieve information
     * about the release for the currently checked-out branch.
     *
     * This is useful to e.g. determine whether a built package is currently
     * denoted as experimental or not.
     */
    static invokeReleaseInfo(projectDir: string): Promise<ReleaseInfoJsonStdout>;
    /**
     * Invokes the `ng-dev release precheck` command in order to validate the
     * built packages or run other validations before actually releasing.
     *
     * This is run as an external command because prechecks can be customized
     * through the `ng-dev` configuration, and we wouldn't want to run prechecks
     * from the `next` branch for older branches, like patch or an LTS branch.
     */
    static invokeReleasePrecheck(projectDir: string, newVersion: semver.SemVer, builtPackagesWithInfo: BuiltPackageWithInfo[]): Promise<void>;
    /**
     * Invokes the `yarn install` command in order to install dependencies for
     * the configured project with the currently checked out revision.
     */
    static invokeYarnInstall(projectDir: string): Promise<void>;
}
