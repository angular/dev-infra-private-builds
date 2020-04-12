/// <amd-module name="@angular/dev-infra-private/commit-message/validate" />
/** Options for commit message validation. */
export interface ValidateCommitMessageOptions {
    disallowSquash?: boolean;
    nonFixupCommitHeaders?: string[];
}
/** Parse a full commit message into its composite parts. */
export declare function parseCommitMessage(commitMsg: string): {
    header: string;
    body: string;
    bodyWithoutLinking: string;
    type: string;
    scope: string;
    subject: string;
    isFixup: boolean;
    isSquash: boolean;
    isRevert: boolean;
};
/** Validate a commit message against using the local repo's config. */
export declare function validateCommitMessage(commitMsg: string, options?: ValidateCommitMessageOptions): boolean;
