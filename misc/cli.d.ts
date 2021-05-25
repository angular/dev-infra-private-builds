/// <amd-module name="@angular/dev-infra-private/misc/cli" />
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';
/** Build the parser for the misc commands. */
export declare function buildMiscParser(localYargs: yargs.Argv): yargs.Argv<import("@angular/dev-infra-private/misc/build-and-link/cli").BuildAndLinkOptions>;
