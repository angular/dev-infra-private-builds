/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/commit-message/validate" />
import { Commit } from './parse';
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
export declare function validateCommitMessage(commitMsg: string | Commit, options?: ValidateCommitMessageOptions): ValidateCommitMessageResult;
/** Print the error messages from the commit message validation to the console. */
export declare function printValidationErrors(errors: string[], print?: {
    (...text: string[]): void;
    group(text: string, collapsed?: boolean | undefined): void;
    groupEnd(): void;
}): void;
