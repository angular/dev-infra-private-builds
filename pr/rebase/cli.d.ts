/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/rebase/cli" />
import { Arguments, Argv } from 'yargs';
/** URL to the Github page where personal access tokens can be generated. */
export declare const GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens";
/** The options available to the rebase command via CLI. */
export interface RebaseCommandOptions {
    'github-token'?: string;
    prNumber: number;
}
/** Builds the rebase pull request command. */
export declare function buildRebaseCommand(yargs: Argv): Argv<RebaseCommandOptions>;
/** Handles the rebase pull request command. */
export declare function handleRebaseCommand(args: Arguments<RebaseCommandOptions>): Promise<void>;
