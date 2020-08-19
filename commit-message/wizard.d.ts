/// <amd-module name="@angular/dev-infra-private/commit-message/wizard" />
/**
 * The source triggering the git commit message creation.
 * As described in: https://git-scm.com/docs/githooks#_prepare_commit_msg
 */
export declare type PrepareCommitMsgHookSource = 'message' | 'template' | 'merge' | 'squash' | 'commit';
export declare function runWizard(args: {
    filePath: string;
    source?: PrepareCommitMsgHookSource;
    commitSha?: string;
}): Promise<void>;
