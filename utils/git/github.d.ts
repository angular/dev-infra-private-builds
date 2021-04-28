/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/git/github" />
import * as Octokit from '@octokit/rest';
import { RequestParameters } from '@octokit/types';
import { query } from 'typed-graphqlify';
/**
 * An object representation of a Graphql Query to be used as a response type and
 * to generate a Graphql query string.
 */
export declare type GraphqlQueryObject = Parameters<typeof query>[1];
/** Interface describing a Github repository. */
export interface GithubRepo {
    /** Owner login of the repository. */
    owner: string;
    /** Name of the repository. */
    name: string;
}
/** Error for failed Github API requests. */
export declare class GithubApiRequestError extends Error {
    status: number;
    constructor(status: number, message: string);
}
/** Error for failed Github API requests. */
export declare class GithubGraphqlClientError extends Error {
}
/**
 * A Github client for interacting with the Github APIs.
 *
 * Additionally, provides convenience methods for actions which require multiple requests, or
 * would provide value from memoized style responses.
 **/
export declare class GithubClient extends Octokit {
    private token?;
    /** The current user based on checking against the Github API. */
    private _currentUser;
    /** The graphql instance with authentication set during construction. */
    private _graphql;
    /**
     * @param token The github authentication token for Github Rest and Graphql API requests.
     */
    constructor(token?: string | undefined);
    /** Perform a query using Github's Graphql API. */
    graphql<T extends GraphqlQueryObject>(queryObject: T, params?: RequestParameters): Promise<T>;
    /** Retrieve the login of the current user from Github. */
    getCurrentUser(): Promise<string>;
}
