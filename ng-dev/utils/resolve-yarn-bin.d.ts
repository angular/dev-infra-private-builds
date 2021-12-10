/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Type describing a Yarn configuration and its potential properties. */
export interface YarnConfiguration {
    'yarnPath': string | undefined;
    'yarn-path': string | undefined;
}
/** Type describing a configuration with its corresponding parsing mechanism. */
export declare type ConfigWithParser = {
    fileName: string;
    parse: (c: string) => YarnConfiguration;
};
/** Interface describing a command that will invoke Yarn. */
export interface YarnCommandInfo {
    binary: string;
    args: string[];
}
/** List of Yarn configuration files and their parsing mechanisms. */
export declare const yarnConfigFiles: ConfigWithParser[];
/**
 * Resolves Yarn for the given project directory.
 *
 * This function exists so that Yarn can be invoked from within Yarn-initiated processes.
 * Yarn uses some magical logic where it creates a temporary directory to make Yarn resolvable.
 * This temporary directory is then wired up in `process.env.PATH` and can break for example
 * when a command switches branches, causing the originally invoked Yarn checked-in file to
 * become unavailable.
 */
export declare function resolveYarnScriptForProject(projectDir: string): Promise<YarnCommandInfo>;
/** Gets the path to the Yarn binary from the NPM global binary directory. */
export declare function getYarnPathFromNpmGlobalBinaries(): Promise<string | null>;
