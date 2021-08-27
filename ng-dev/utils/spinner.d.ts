/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export declare class Spinner {
    private text;
    /** The id of the interval being used to trigger frame printing. */
    private intervalId;
    /** The characters to iterate through to create the appearance of spinning in the spinner. */
    private spinnerCharacters;
    /** The index of the spinner character used in the frame. */
    private currentSpinnerCharacterIndex;
    constructor(text: string);
    /** Get the next spinner character. */
    private getNextSpinnerCharacter;
    /** Print the current text for the spinner to the  */
    private printFrame;
    /** Updates the spinner text with the provided text. */
    update(text: string): void;
    /** Completes the spinner. */
    complete(): void;
}
