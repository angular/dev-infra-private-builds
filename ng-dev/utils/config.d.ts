/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Assertions, MultipleAssertions } from './config-assertions.js';
import { setCachedConfig } from './config-cache.js';
/**
 * Type describing a ng-dev configuration.
 *
 * This is a branded type to ensure that we can safely assert an object
 * being a config object instead of it being e.g. a `Promise` object.
 */
export declare type NgDevConfig<T = {}> = T & {
    __isNgDevConfigObject: boolean;
};
/**
 * Describes the Github configuration for dev-infra. This configuration is
 * used for API requests, determining the upstream remote, etc.
 */
export interface GithubConfig {
    /** Owner name of the repository. */
    owner: string;
    /** Name of the repository. */
    name: string;
    /** Main branch name for the repository. */
    mainBranchName: string;
    /** If SSH protocol should be used for git interactions. */
    useSsh?: boolean;
    /** Whether the specified repository is private. */
    private?: boolean;
}
/**
 * Set the cached configuration object to be loaded later. Only to be used on
 * CI and test situations in which loading from the `.ng-dev/` directory is not possible.
 */
export declare const setConfig: typeof setCachedConfig;
/**
 * Get the configuration from the file system, returning the already loaded
 * copy if it is defined.
 */
export declare function getConfig(): Promise<NgDevConfig>;
export declare function getConfig(baseDir: string): Promise<NgDevConfig>;
export declare function getConfig<A extends MultipleAssertions>(assertions: A): Promise<NgDevConfig<Assertions<A>>>;
/**
 * Get the local user configuration from the file system, returning the already loaded copy if it is
 * defined.
 *
 * @returns The user configuration object, or an empty object if no user configuration file is
 * present. The object is an untyped object as there are no required user configurations.
 */
export declare function getUserConfig(): Promise<{
    [x: string]: any;
}>;
/** A standard error class to thrown during assertions while validating configuration. */
export declare class ConfigValidationError extends Error {
    readonly errors: string[];
    constructor(message?: string, errors?: string[]);
}
/** Validate th configuration has been met for the ng-dev command. */
export declare function assertValidGithubConfig<T extends NgDevConfig>(config: T & Partial<{
    github: GithubConfig;
}>): asserts config is T & {
    github: GithubConfig;
};
