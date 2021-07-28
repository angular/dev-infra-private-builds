/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/caretaker/check/base" />
import { NgDevConfig } from '../../utils/config';
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { CaretakerConfig } from '../config';
/** The BaseModule to extend modules for caretaker checks from. */
export declare abstract class BaseModule<Data> {
    protected config: NgDevConfig<{
        caretaker: CaretakerConfig;
    }>;
    /** The singleton instance of the authenticated git client. */
    protected git: AuthenticatedGitClient;
    /** The data for the module. */
    readonly data: Promise<Data>;
    constructor(config: NgDevConfig<{
        caretaker: CaretakerConfig;
    }>);
    /** Asyncronously retrieve data for the module. */
    protected abstract retrieveData(): Promise<Data>;
    /** Print the information discovered for the module to the terminal. */
    abstract printToTerminal(): Promise<void>;
}
