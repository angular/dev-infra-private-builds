/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/common/checkout-pr" />
export declare class UnexpectedLocalChangesError extends Error {
    constructor(m: string);
}
export declare class MaintainerModifyAccessError extends Error {
    constructor(m: string);
}
/** Options for checking out a PR */
export interface PullRequestCheckoutOptions {
    /** Whether the PR should be checked out if the maintainer cannot modify. */
    allowIfMaintainerCannotModify?: boolean;
}
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
export declare function checkOutPullRequestLocally(prNumber: number, githubToken: string, opts?: PullRequestCheckoutOptions): Promise<{
    /**
     * Pushes the current local branch to the PR on the upstream repository.
     *
     * @returns true If the command did not fail causing a GitCommandError to be thrown.
     * @throws GitCommandError Thrown when the push back to upstream fails.
     */
    pushToUpstream: () => true;
    /** Restores the state of the local repository to before the PR checkout occured. */
    resetGitState: () => boolean;
}>;
