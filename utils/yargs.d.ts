/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/yargs" />
import { Argv } from 'yargs';
export declare type ArgvWithGithubToken = Argv<{
    githubToken: string;
}>;
export declare function addGithubTokenFlag(yargs: Argv): ArgvWithGithubToken;
/** URL to the Github page where personal access tokens can be generated. */
export declare const GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens/new";
