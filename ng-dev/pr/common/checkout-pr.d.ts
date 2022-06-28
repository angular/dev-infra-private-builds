/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Error being thrown if there are unexpected local changes in the project repo. */
export declare class UnexpectedLocalChangesError extends Error {
}
/** Error being thrown if a requested pull request could not be found upstream. */
export declare class PullRequestNotFoundError extends Error {
}
/** Error being thrown if the pull request does not allow for maintainer modifications. */
export declare class MaintainerModifyAccessError extends Error {
}
/** Options for checking out a PR */
export interface PullRequestCheckoutOptions {
    /** Whether the PR should be checked out if the maintainer cannot modify. */
    allowIfMaintainerCannotModify?: boolean;
}
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 *
 * @throws {UnexpectedLocalChangesError} If the pull request cannot be checked out
 *   due to uncommitted local changes.
 * @throws {PullRequestNotFoundError} If the pull request cannot be checked out
 *   because it is unavailable on Github.
 * @throws {MaintainerModifyAccessError} If the pull request does not allow maintainers
 *   to modify a pull request. Skipped if `allowIfMaintainerCannotModify` is set.
 */
export declare function checkOutPullRequestLocally(prNumber: number, githubToken: string, opts?: PullRequestCheckoutOptions): Promise<{
    /**
     * Pushes the current local branch to the PR on the upstream repository.
     *
     * @returns true If the command did not fail causing a GitCommandError to be thrown.
     * @throws {GitCommandError} Thrown when the push back to upstream fails.
     */
    pushToUpstream: () => true;
    /** Restores the state of the local repository to before the PR checkout occured. */
    resetGitState: () => boolean;
    pushToUpstreamCommand: string;
    resetGitStateCommand: string;
}>;
