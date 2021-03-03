/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/cli" />
import * as yargs from 'yargs';
/** Build the parser for pull request commands. */
export declare function buildPrParser(localYargs: yargs.Argv): yargs.Argv<import("@angular/dev-infra-private/pr/check-target-branches/cli").CheckTargetBranchesOptions>;
