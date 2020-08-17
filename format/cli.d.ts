/// <amd-module name="@angular/dev-infra-private/format/cli" />
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';
/** Build the parser for the format commands. */
export declare function buildFormatParser(localYargs: yargs.Argv): yargs.Argv<{
    check: boolean;
} & {
    shaOrRef: string | undefined;
} & {
    files: string[] | undefined;
}>;
