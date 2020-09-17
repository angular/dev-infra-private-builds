/// <amd-module name="@angular/dev-infra-private/commit-message/validate" />
/** Options for commit message validation. */
export interface ValidateCommitMessageOptions {
    disallowSquash?: boolean;
    nonFixupCommitHeaders?: string[];
}
/** Validate a commit message against using the local repo's config. */
export declare function validateCommitMessage(commitMsg: string, options?: ValidateCommitMessageOptions): boolean;
