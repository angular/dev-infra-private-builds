/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Argv } from 'yargs';
/** Build the parser for the format commands. */
export declare function buildFormatParser(localYargs: Argv): Argv<{
    check: boolean;
} & {
    shaOrRef: string | undefined;
} & {
    files: string[] | undefined;
}>;
