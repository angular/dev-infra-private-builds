/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import semver from 'semver';
import { NpmDistTag } from './npm-registry.js';
export declare abstract class NpmCommand {
    /**
     * Runs NPM publish within a specified package directory.
     * @throws With the process log output if the publish failed.
     */
    static publish(packagePath: string, distTag: NpmDistTag, registryUrl: string | undefined): Promise<void>;
    /**
     * Sets the NPM tag to the specified version for the given package.
     * @throws With the process log output if the tagging failed.
     */
    static setDistTagForPackage(packageName: string, distTag: string, version: semver.SemVer, registryUrl: string | undefined): Promise<void>;
    /**
     * Checks whether the user is currently logged into NPM.
     * @returns Whether the user is currently logged into NPM.
     */
    static checkIsLoggedIn(registryUrl: string | undefined): Promise<boolean>;
    /**
     * Log into NPM at a provided registry using an interactive invocation.
     * @throws With the `npm login` status code if the login failed.
     */
    static startInteractiveLogin(registryUrl: string | undefined): Promise<void>;
    /**
     * Log out of NPM at a provided registry.
     * @returns Whether the user was logged out of NPM.
     */
    static logout(registryUrl: string | undefined): Promise<boolean>;
}
