/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/publish/external-commands" />
import * as semver from 'semver';
import { BuiltPackage } from '../config/index';
import { NpmDistTag } from '../versioning';
/**
 * Invokes the `ng-dev release set-dist-tag` command in order to set the specified
 * NPM dist tag for all packages in the checked out branch to the given version.
 */
export declare function invokeSetNpmDistCommand(npmDistTag: NpmDistTag, version: semver.SemVer): Promise<void>;
/**
 * Invokes the `ng-dev release build` command in order to build the release
 * packages for the currently checked out branch.
 */
export declare function invokeReleaseBuildCommand(): Promise<BuiltPackage[]>;
/**
 * Invokes the `yarn install` command in order to install dependencies for
 * the configured project with the currently checked out revision.
 */
export declare function invokeYarnInstallCommand(projectDir: string): Promise<void>;
