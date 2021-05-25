/// <amd-module name="@angular/dev-infra-private/release/cli" />
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';
/** Build the parser for the release commands. */
export declare function buildReleaseParser(localYargs: yargs.Argv): yargs.Argv<import("@angular/dev-infra-private/release/notes/cli").ReleaseNotesOptions>;
