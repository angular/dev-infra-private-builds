/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/config" />
/** Configuration for Git client interactions. */
export interface GitClientConfig {
    /** Owner name of the repository. */
    owner: string;
    /** Name of the repository. */
    name: string;
    /** If SSH protocol should be used for git interactions. */
    useSsh?: boolean;
    /** Whether the specified repository is private. */
    private?: boolean;
}
/**
 * Describes the Github configuration for dev-infra. This configuration is
 * used for API requests, determining the upstream remote, etc.
 */
export interface GithubConfig extends GitClientConfig {
}
/** The common configuration for ng-dev. */
declare type CommonConfig = {
    github: GithubConfig;
};
/**
 * The configuration for the specific ng-dev command, providing both the common
 * ng-dev config as well as the specific config of a subcommand.
 */
export declare type NgDevConfig<T = {}> = CommonConfig & T;
/**
 * Get the configuration from the file system, returning the already loaded
 * copy if it is defined.
 */
export declare function getConfig(): NgDevConfig;
export declare function getConfig(baseDir?: string): NgDevConfig;
/**
 * Asserts the provided array of error messages is empty. If any errors are in the array,
 * logs the errors and exit the process as a failure.
 */
export declare function assertNoErrors(errors: string[]): void;
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
export {};
