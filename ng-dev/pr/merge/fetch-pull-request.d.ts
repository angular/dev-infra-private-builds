/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
/** Graphql schema for the response body the requested pull request. */
declare const PR_SCHEMA: {
    url: string;
    isDraft: boolean;
    state: "OPEN" | "MERGED" | "CLOSED";
    number: number;
    commits: {
        totalCount: number;
        nodes: {
            commit: {
                status: {
                    state: "FAILURE" | "PENDING" | "SUCCESS";
                };
                message: string;
            };
        }[];
    };
    baseRefName: string;
    title: string;
    labels: {
        nodes: {
            name: string;
        }[];
    };
};
/** A pull request retrieved from github via the graphql API. */
export declare type RawPullRequest = typeof PR_SCHEMA;
/** Fetches a pull request from Github. Returns null if an error occurred. */
export declare function fetchPullRequestFromGithub(git: AuthenticatedGitClient, prNumber: number): Promise<RawPullRequest | null>;
export {};
