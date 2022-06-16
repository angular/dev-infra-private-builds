/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare abstract class Prompt {
    /** Prompts the user with a confirmation question and a specified message. */
    static confirm(message: string, defaultValue?: boolean): Promise<boolean>;
    /** Prompts the user for one line of input. */
    static input(message: string): Promise<string>;
}
