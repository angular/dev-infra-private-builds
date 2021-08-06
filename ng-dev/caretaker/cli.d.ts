/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Argv } from 'yargs';
/** Build the parser for the caretaker commands. */
export declare function buildCaretakerParser(yargs: Argv): Argv<import("./handoff/cli").CaretakerHandoffOptions>;
