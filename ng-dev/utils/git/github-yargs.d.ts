/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Argv } from 'yargs';
export declare type ArgvWithGithubToken = Argv<{
    githubToken: string;
}>;
/** Sets up the `github-token` command option for the given Yargs instance. */
export declare function addGithubTokenOption(yargs: Argv): ArgvWithGithubToken;
