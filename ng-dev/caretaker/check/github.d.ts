/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseModule } from './base.js';
/** A list of generated results for a github query. */
declare type GithubQueryResults = {
    queryName: string;
    count: number;
    queryUrl: string;
    matchedUrls: string[];
}[];
export declare class GithubQueriesModule extends BaseModule<GithubQueryResults | void> {
    retrieveData(): Promise<{
        queryName: string;
        count: number;
        queryUrl: string;
        matchedUrls: string[];
    }[] | undefined>;
    /** Build a Graphql query statement for the provided queries. */
    private buildGraphqlQuery;
    printToTerminal(): Promise<void>;
}
export {};
