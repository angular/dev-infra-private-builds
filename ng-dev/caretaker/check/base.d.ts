/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { GitClientConfig } from '../../utils/config';
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { CaretakerConfig } from '../config';
/** The BaseModule to extend modules for caretaker checks from. */
export declare abstract class BaseModule<Data> {
    protected config: {
        caretaker: CaretakerConfig;
        github: GitClientConfig;
    };
    /** The singleton instance of the authenticated git client. */
    protected git: AuthenticatedGitClient;
    /** The data for the module. */
    readonly data: Promise<Data>;
    constructor(config: {
        caretaker: CaretakerConfig;
        github: GitClientConfig;
    });
    /** Asyncronously retrieve data for the module. */
    protected abstract retrieveData(): Promise<Data>;
    /** Print the information discovered for the module to the terminal. */
    abstract printToTerminal(): Promise<void>;
}
