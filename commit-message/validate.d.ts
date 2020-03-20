/// <amd-module name="@angular/dev-infra-private/commit-message/validate" />
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
export declare function validateCommitMessage(commitMsg: string, disallowSquash?: boolean, nonFixupCommitHeaders?: string[]): boolean;
