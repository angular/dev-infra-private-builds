/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/discover-new-conflicts/cli" />
import { Arguments, Argv } from 'yargs';
/** Builds the discover-new-conflicts pull request command. */
export declare function buildDiscoverNewConflictsCommand(yargs: Argv): Argv;
/** Handles the discover-new-conflicts pull request command. */
export declare function handleDiscoverNewConflictsCommand({ prNumber, date }: Arguments): Promise<void>;
