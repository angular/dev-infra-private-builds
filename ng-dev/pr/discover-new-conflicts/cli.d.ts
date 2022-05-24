/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommandModule } from 'yargs';
/** The options available to the discover-new-conflicts command via CLI. */
export interface DiscoverNewConflictsOptions {
    date: number;
    pr: number;
}
/** yargs command module for discovering new conflicts for a PR  */
export declare const DiscoverNewConflictsCommandModule: CommandModule<{}, DiscoverNewConflictsOptions>;
