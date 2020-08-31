/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/rebase/cli" />
import { Arguments, Argv } from 'yargs';
/** The options available to the rebase command via CLI. */
export interface RebaseCommandOptions {
    githubToken: string;
    prNumber: number;
}
/** Builds the rebase pull request command. */
export declare function buildRebaseCommand(yargs: Argv): Argv<RebaseCommandOptions>;
/** Handles the rebase pull request command. */
export declare function handleRebaseCommand({ prNumber, githubToken }: Arguments<RebaseCommandOptions>): Promise<void>;
