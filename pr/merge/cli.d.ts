/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/cli" />
import { CommandModule } from 'yargs';
/** The options available to the merge command via CLI. */
export interface MergeCommandOptions {
    githubToken: string;
    pr: number;
    branchPrompt: boolean;
}
/** yargs command module describing the command. */
export declare const MergeCommandModule: CommandModule<{}, MergeCommandOptions>;
