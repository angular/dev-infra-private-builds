/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Commit } from './parse.js';
/** Options for commit message validation. */
export interface ValidateCommitMessageOptions {
    disallowSquash?: boolean;
    nonFixupCommitHeaders?: string[];
}
/** The result of a commit message validation check. */
export interface ValidateCommitMessageResult {
    valid: boolean;
    errors: string[];
    commit: Commit;
}
/** Validate a commit message against using the local repo's config. */
export declare function validateCommitMessage(commitMsg: string | Commit, options?: ValidateCommitMessageOptions): Promise<ValidateCommitMessageResult>;
/** Print the error messages from the commit message validation to the console. */
export declare function printValidationErrors(errors: string[], print?: {
    (...values: unknown[]): void;
    group(label: string, collapsed?: boolean | undefined): void;
    groupEnd(): void;
}): void;
