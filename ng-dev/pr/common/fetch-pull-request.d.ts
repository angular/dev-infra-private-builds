/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CheckConclusionState, CheckStatusState, MergeableState, PullRequestState, StatusState } from '@octokit/graphql-schema';
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
/** A status for a pull request status or check. */
export declare enum PullRequestStatus {
    PASSING = 0,
    FAILING = 1,
    PENDING = 2
}
/** Graphql schema for the response body the requested pull request. */
export declare const PR_SCHEMA: {
    url: string;
    isDraft: boolean;
    state: PullRequestState;
    number: number;
    mergeable: MergeableState;
    updatedAt: string;
    commits: {
        totalCount: number;
        nodes: {
            commit: {
                statusCheckRollup: {
                    state: StatusState;
                    contexts: {
                        nodes: ({
                            __typename: "CheckRun";
                            status: CheckStatusState;
                            conclusion: CheckConclusionState | null;
                            name: string;
                            state?: undefined;
                            context?: undefined;
                        } | {
                            __typename: "StatusContext";
                            state: StatusState;
                            context: string;
                            status?: undefined;
                            conclusion?: undefined;
                            name?: undefined;
                        })[];
                    };
                } | null | undefined;
                message: string;
            };
        }[];
    };
    maintainerCanModify: boolean;
    viewerDidAuthor: boolean;
    headRefOid: string;
    headRef: {
        name: string;
        repository: {
            url: string;
            nameWithOwner: string;
        };
    };
    baseRef: {
        name: string;
        repository: {
            url: string;
            nameWithOwner: string;
        };
    };
    baseRefName: string;
    title: string;
    labels: {
        nodes: {
            name: string;
        }[];
    };
};
export declare type PullRequestFromGithub = typeof PR_SCHEMA;
/** Type describing the normalized and combined status of a pull request. */
export declare type PullRequestStatusInfo = {
    combinedStatus: PullRequestStatus;
    statuses: {
        status: PullRequestStatus;
        type: 'check' | 'status';
        name: string;
    }[];
};
/** Fetches a pull request from Github. Returns null if an error occurred. */
export declare function fetchPullRequestFromGithub(git: AuthenticatedGitClient, prNumber: number): Promise<PullRequestFromGithub | null>;
/** Fetches a pull request from Github. Returns null if an error occurred. */
export declare function fetchPendingPullRequestsFromGithub(git: AuthenticatedGitClient): Promise<PullRequestFromGithub[] | null>;
/**
 * Gets the statuses for a commit from a pull request, using a consistent interface
 * for both status and checks results.
 */
export declare function getStatusesForPullRequest(pullRequest: PullRequestFromGithub): PullRequestStatusInfo;
