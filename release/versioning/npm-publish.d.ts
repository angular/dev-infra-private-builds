/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/versioning/npm-publish" />
import * as semver from 'semver';
import { NpmDistTag } from './npm-registry';
/**
 * Runs NPM publish within a specified package directory.
 * @throws With the process log output if the publish failed.
 */
export declare function runNpmPublish(packagePath: string, distTag: NpmDistTag, registryUrl: string | undefined): Promise<void>;
/**
 * Sets the NPM tag to the specified version for the given package.
 * @throws With the process log output if the tagging failed.
 */
export declare function setNpmTagForPackage(packageName: string, distTag: string, version: semver.SemVer, registryUrl: string | undefined): Promise<void>;
/**
 * Checks whether the user is currently logged into NPM.
 * @returns Whether the user is currently logged into NPM.
 */
export declare function npmIsLoggedIn(registryUrl: string | undefined): Promise<boolean>;
/**
 * Log into NPM at a provided registry.
 * @throws With the `npm login` status code if the login failed.
 */
export declare function npmLogin(registryUrl: string | undefined): Promise<void>;
/**
 * Log out of NPM at a provided registry.
 * @returns Whether the user was logged out of NPM.
 */
export declare function npmLogout(registryUrl: string | undefined): Promise<boolean>;
