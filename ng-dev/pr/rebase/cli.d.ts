/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommandModule } from 'yargs';
/** The options available to the rebase command via CLI. */
export interface RebaseOptions {
    githubToken: string;
    pr: number;
}
/** yargs command module for rebaseing a PR  */
export declare const RebaseCommandModule: CommandModule<{}, RebaseOptions>;
