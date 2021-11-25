/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Graphql Github API query that can be used to find forks of a given repository
 * that are owned by the current viewer authenticated with the Github API.
 */
export declare const findOwnedForksOfRepoQuery: {
    repository: {
        forks: {
            nodes: {
                owner: {
                    login: string;
                };
                name: string;
            }[];
        };
    };
};
