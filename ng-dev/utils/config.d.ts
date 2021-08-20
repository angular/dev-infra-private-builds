/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Configuration for Git client interactions. */
export interface GitClientConfig {
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
 * Get the configuration from the file system, returning the already loaded
 * copy if it is defined.
 */
export declare function getConfig(): {};
export declare function getConfig(baseDir?: string): {};
/**
 * Get the local user configuration from the file system, returning the already loaded copy if it is
 * defined.
 *
 * @returns The user configuration object, or an empty object if no user configuration file is
 * present. The object is an untyped object as there are no required user configurations.
 */
export declare function getUserConfig(): {
    [x: string]: any;
};
/** A standard error class to thrown during assertions while validating configuration. */
export declare class ConfigValidationError extends Error {
    readonly errors: string[];
    constructor(message?: string, errors?: string[]);
}
/** Validate the common configuration has been met for the ng-dev command. */
export declare function assertValidGithubConfig<T>(config: T & Partial<{
    github: GitClientConfig;
}>): asserts config is T & {
    github: GitClientConfig;
};
/**
 * Asserts the provided array of error messages is empty. If any errors are in the array,
 * logs the errors and exit the process as a failure.
 */
export declare function assertNoErrors(errors: string[]): void;
