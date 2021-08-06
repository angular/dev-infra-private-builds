/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommandModule } from 'yargs';
export interface CaretakerHandoffOptions {
    githubToken: string;
}
/** yargs command module for assisting in handing off caretaker.  */
export declare const HandoffModule: CommandModule<{}, CaretakerHandoffOptions>;
