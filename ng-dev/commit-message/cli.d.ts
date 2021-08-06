/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';
/** Build the parser for the commit-message commands. */
export declare function buildCommitMessageParser(localYargs: yargs.Argv): yargs.Argv<import("./validate-range/cli").ValidateRangeOptions>;
