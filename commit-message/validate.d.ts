/// <amd-module name="@angular/dev-infra-private/commit-message/validate" />
import { ParsedCommitMessage } from './parse';
/** Options for commit message validation. */
export interface ValidateCommitMessageOptions {
    disallowSquash?: boolean;
    nonFixupCommitHeaders?: string[];
}
/** The result of a commit message validation check. */
export interface ValidateCommitMessageResult {
    valid: boolean;
    errors: string[];
    commit: ParsedCommitMessage;
}
/** Validate a commit message against using the local repo's config. */
export declare function validateCommitMessage(commitMsg: string, options?: ValidateCommitMessageOptions): ValidateCommitMessageResult;
/** Print the error messages from the commit message validation to the console. */
export declare function printValidationErrors(errors: string[], print?: {
    (...text: string[]): void;
    group(text: string, collapsed?: boolean | undefined): void;
    groupEnd(): void;
}): void;
