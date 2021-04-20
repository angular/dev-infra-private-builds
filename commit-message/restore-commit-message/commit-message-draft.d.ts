/// <amd-module name="@angular/dev-infra-private/commit-message/restore-commit-message/commit-message-draft" />
/** Load the commit message draft from the file system if it exists. */
export declare function loadCommitMessageDraft(basePath: string): string;
/** Remove the commit message draft from the file system. */
export declare function deleteCommitMessageDraft(basePath: string): void;
/** Save the commit message draft to the file system for later retrieval. */
export declare function saveCommitMessageDraft(basePath: string, commitMessage: string): void;
