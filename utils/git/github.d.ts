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
/**
 * A Github client for interacting with the Github APIs.
 *
 * Additionally, provides convenience methods for actions which require multiple requests, or
 * would provide value from memoized style responses.
 **/
export declare class GithubClient extends Octokit {
    /** The Github GraphQL (v4) API. */
    graphql: GithubGraphqlClient;
    /** The current user based on checking against the Github API. */
    private _currentUser;
    constructor(token?: string);
    /** Retrieve the login of the current user from Github. */
    getCurrentUser(): Promise<string>;
}
/**
 * An object representation of a GraphQL Query to be used as a response type and
 * to generate a GraphQL query string.
 */
export declare type GraphQLQueryObject = Parameters<typeof query>[1];
/** A client for interacting with Github's GraphQL API. */
export declare class GithubGraphqlClient {
    /** The Github GraphQL (v4) API. */
    private graqhql;
    constructor(token?: string);
    /** Perform a query using Github's GraphQL API. */
    query<T extends GraphQLQueryObject>(queryObject: T, params?: RequestParameters): Promise<T>;
}
