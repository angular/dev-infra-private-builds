/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/utils/github", ["require", "exports", "tslib", "@octokit/graphql", "typed-graphqlify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var graphql_1 = require("@octokit/graphql");
    var typed_graphqlify_1 = require("typed-graphqlify");
    /**
     * Authenticated instance of Github GraphQl API service, relies on a
     * personal access token being available in the TOKEN environment variable.
     */
    var graphql = graphql_1.graphql.defaults({
        headers: {
            // TODO(josephperrott): Remove reference to TOKEN environment variable as part of larger
            // effort to migrate to expecting tokens via GITHUB_ACCESS_TOKEN environment variables.
            authorization: "token " + (process.env.TOKEN || process.env.GITHUB_ACCESS_TOKEN),
        }
    });
    /** Get all pending PRs from github  */
    function getPendingPrs(prSchema, _a) {
        var owner = _a.owner, name = _a.name;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var PRS_QUERY, query, queryBuilder, cursor, hasNextPage, prs, _b, query_1, params_1, results;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        PRS_QUERY = typed_graphqlify_1.params({
                            $first: 'Int',
                            $after: 'String',
                            $owner: 'String!',
                            $name: 'String!',
                        }, {
                            repository: typed_graphqlify_1.params({ owner: '$owner', name: '$name' }, {
                                pullRequests: typed_graphqlify_1.params({
                                    first: '$first',
                                    after: '$after',
                                    states: "OPEN",
                                }, {
                                    nodes: [prSchema],
                                    pageInfo: {
                                        hasNextPage: typed_graphqlify_1.types.boolean,
                                        endCursor: typed_graphqlify_1.types.string,
                                    },
                                }),
                            })
                        });
                        query = typed_graphqlify_1.query('members', PRS_QUERY);
                        queryBuilder = function (count, cursor) {
                            return {
                                query: query,
                                params: {
                                    after: cursor || null,
                                    first: count,
                                    owner: owner,
                                    name: name,
                                },
                            };
                        };
                        hasNextPage = true;
                        prs = [];
                        _c.label = 1;
                    case 1:
                        if (!hasNextPage) return [3 /*break*/, 3];
                        _b = queryBuilder(100, cursor), query_1 = _b.query, params_1 = _b.params;
                        return [4 /*yield*/, graphql(query_1, params_1)];
                    case 2:
                        results = _c.sent();
                        prs.push.apply(prs, tslib_1.__spread(results.repository.pullRequests.nodes));
                        hasNextPage = results.repository.pullRequests.pageInfo.hasNextPage;
                        cursor = results.repository.pullRequests.pageInfo.endCursor;
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, prs];
                }
            });
        });
    }
    exports.getPendingPrs = getPendingPrs;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdGh1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw0Q0FBbUU7SUFFbkUscURBQXNFO0lBTXRFOzs7T0FHRztJQUNILElBQU0sT0FBTyxHQUFHLGlCQUFzQixDQUFDLFFBQVEsQ0FBQztRQUM5QyxPQUFPLEVBQUU7WUFDUCx3RkFBd0Y7WUFDeEYsdUZBQXVGO1lBQ3ZGLGFBQWEsRUFBRSxZQUFTLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUU7U0FDL0U7S0FDRixDQUFDLENBQUM7SUFFSCx1Q0FBdUM7SUFDdkMsU0FBc0IsYUFBYSxDQUFXLFFBQWtCLEVBQUUsRUFBMkI7WUFBMUIsZ0JBQUssRUFBRSxjQUFJOzs7Ozs7d0JBRXRFLFNBQVMsR0FBRyx5QkFBTSxDQUNwQjs0QkFDRSxNQUFNLEVBQUUsS0FBSzs0QkFDYixNQUFNLEVBQUUsUUFBUTs0QkFDaEIsTUFBTSxFQUFFLFNBQVM7NEJBQ2pCLEtBQUssRUFBRSxTQUFTO3lCQUNqQixFQUNEOzRCQUNFLFVBQVUsRUFBRSx5QkFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLEVBQUU7Z0NBQ25ELFlBQVksRUFBRSx5QkFBTSxDQUNoQjtvQ0FDRSxLQUFLLEVBQUUsUUFBUTtvQ0FDZixLQUFLLEVBQUUsUUFBUTtvQ0FDZixNQUFNLEVBQUUsTUFBTTtpQ0FDZixFQUNEO29DQUNFLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQztvQ0FDakIsUUFBUSxFQUFFO3dDQUNSLFdBQVcsRUFBRSx3QkFBSyxDQUFDLE9BQU87d0NBQzFCLFNBQVMsRUFBRSx3QkFBSyxDQUFDLE1BQU07cUNBQ3hCO2lDQUNGLENBQUM7NkJBQ1AsQ0FBQzt5QkFDSCxDQUFDLENBQUM7d0JBQ0QsS0FBSyxHQUFHLHdCQUFZLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO3dCQUszQyxZQUFZLEdBQUcsVUFBQyxLQUFhLEVBQUUsTUFBZTs0QkFDbEQsT0FBTztnQ0FDTCxLQUFLLE9BQUE7Z0NBQ0wsTUFBTSxFQUFFO29DQUNOLEtBQUssRUFBRSxNQUFNLElBQUksSUFBSTtvQ0FDckIsS0FBSyxFQUFFLEtBQUs7b0NBQ1osS0FBSyxPQUFBO29DQUNMLElBQUksTUFBQTtpQ0FDTDs2QkFDRixDQUFDO3dCQUNKLENBQUMsQ0FBQzt3QkFLRSxXQUFXLEdBQUcsSUFBSSxDQUFDO3dCQUVqQixHQUFHLEdBQW9CLEVBQUUsQ0FBQzs7OzZCQUl6QixXQUFXO3dCQUNWLEtBQWtCLFlBQVksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQTFDLGtCQUFLLEVBQUUsb0JBQU0sQ0FBOEI7d0JBQ2xDLHFCQUFNLE9BQU8sQ0FBQyxPQUFLLEVBQUUsUUFBTSxDQUFDLEVBQUE7O3dCQUF0QyxPQUFPLEdBQUcsU0FBZ0Q7d0JBRWhFLEdBQUcsQ0FBQyxJQUFJLE9BQVIsR0FBRyxtQkFBUyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUU7d0JBQ25ELFdBQVcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO3dCQUNuRSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQzs7NEJBRTlELHNCQUFPLEdBQUcsRUFBQzs7OztLQUNaO0lBN0RELHNDQTZEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtncmFwaHFsIGFzIHVuYXV0aGVudGljYXRlZEdyYXBocWx9IGZyb20gJ0BvY3Rva2l0L2dyYXBocWwnO1xuXG5pbXBvcnQge3BhcmFtcywgcXVlcnkgYXMgZ3JhcGhxbFF1ZXJ5LCB0eXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5pbXBvcnQge05nRGV2Q29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKiBUaGUgY29uZmlndXJhdGlvbiByZXF1aXJlZCBmb3IgZ2l0aHViIGludGVyYWN0aW9ucy4gKi9cbnR5cGUgR2l0aHViQ29uZmlnID0gTmdEZXZDb25maWdbJ2dpdGh1YiddO1xuXG4vKipcbiAqIEF1dGhlbnRpY2F0ZWQgaW5zdGFuY2Ugb2YgR2l0aHViIEdyYXBoUWwgQVBJIHNlcnZpY2UsIHJlbGllcyBvbiBhXG4gKiBwZXJzb25hbCBhY2Nlc3MgdG9rZW4gYmVpbmcgYXZhaWxhYmxlIGluIHRoZSBUT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAqL1xuY29uc3QgZ3JhcGhxbCA9IHVuYXV0aGVudGljYXRlZEdyYXBocWwuZGVmYXVsdHMoe1xuICBoZWFkZXJzOiB7XG4gICAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogUmVtb3ZlIHJlZmVyZW5jZSB0byBUT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBhcyBwYXJ0IG9mIGxhcmdlclxuICAgIC8vIGVmZm9ydCB0byBtaWdyYXRlIHRvIGV4cGVjdGluZyB0b2tlbnMgdmlhIEdJVEhVQl9BQ0NFU1NfVE9LRU4gZW52aXJvbm1lbnQgdmFyaWFibGVzLlxuICAgIGF1dGhvcml6YXRpb246IGB0b2tlbiAke3Byb2Nlc3MuZW52LlRPS0VOIHx8IHByb2Nlc3MuZW52LkdJVEhVQl9BQ0NFU1NfVE9LRU59YCxcbiAgfVxufSk7XG5cbi8qKiBHZXQgYWxsIHBlbmRpbmcgUFJzIGZyb20gZ2l0aHViICAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlbmRpbmdQcnM8UHJTY2hlbWE+KHByU2NoZW1hOiBQclNjaGVtYSwge293bmVyLCBuYW1lfTogR2l0aHViQ29uZmlnKSB7XG4gIC8vIFRoZSBHcmFwaFFMIHF1ZXJ5IG9iamVjdCB0byBnZXQgYSBwYWdlIG9mIHBlbmRpbmcgUFJzXG4gIGNvbnN0IFBSU19RVUVSWSA9IHBhcmFtcyhcbiAgICAgIHtcbiAgICAgICAgJGZpcnN0OiAnSW50JywgICAgICAvLyBIb3cgbWFueSBlbnRyaWVzIHRvIGdldCB3aXRoIGVhY2ggcmVxdWVzdFxuICAgICAgICAkYWZ0ZXI6ICdTdHJpbmcnLCAgIC8vIFRoZSBjdXJzb3IgdG8gc3RhcnQgdGhlIHBhZ2UgYXRcbiAgICAgICAgJG93bmVyOiAnU3RyaW5nIScsICAvLyBUaGUgb3JnYW5pemF0aW9uIHRvIHF1ZXJ5IGZvclxuICAgICAgICAkbmFtZTogJ1N0cmluZyEnLCAgIC8vIFRoZSByZXBvc2l0b3J5IHRvIHF1ZXJ5IGZvclxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcmVwb3NpdG9yeTogcGFyYW1zKHtvd25lcjogJyRvd25lcicsIG5hbWU6ICckbmFtZSd9LCB7XG4gICAgICAgICAgcHVsbFJlcXVlc3RzOiBwYXJhbXMoXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaXJzdDogJyRmaXJzdCcsXG4gICAgICAgICAgICAgICAgYWZ0ZXI6ICckYWZ0ZXInLFxuICAgICAgICAgICAgICAgIHN0YXRlczogYE9QRU5gLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbm9kZXM6IFtwclNjaGVtYV0sXG4gICAgICAgICAgICAgICAgcGFnZUluZm86IHtcbiAgICAgICAgICAgICAgICAgIGhhc05leHRQYWdlOiB0eXBlcy5ib29sZWFuLFxuICAgICAgICAgICAgICAgICAgZW5kQ3Vyc29yOiB0eXBlcy5zdHJpbmcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgY29uc3QgcXVlcnkgPSBncmFwaHFsUXVlcnkoJ21lbWJlcnMnLCBQUlNfUVVFUlkpO1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBxdWVyeSBhbmQgcXVlcnlQYXJhbXMgZm9yIGEgc3BlY2lmaWMgcGFnZSBvZiBlbnRyaWVzLlxuICAgKi9cbiAgY29uc3QgcXVlcnlCdWlsZGVyID0gKGNvdW50OiBudW1iZXIsIGN1cnNvcj86IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBxdWVyeSxcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBhZnRlcjogY3Vyc29yIHx8IG51bGwsXG4gICAgICAgIGZpcnN0OiBjb3VudCxcbiAgICAgICAgb3duZXIsXG4gICAgICAgIG5hbWUsXG4gICAgICB9LFxuICAgIH07XG4gIH07XG5cbiAgLy8gVGhlIGN1cnJlbnQgY3Vyc29yXG4gIGxldCBjdXJzb3I6IHN0cmluZ3x1bmRlZmluZWQ7XG4gIC8vIElmIGFuIGFkZGl0aW9uYWwgcGFnZSBvZiBtZW1iZXJzIGlzIGV4cGVjdGVkXG4gIGxldCBoYXNOZXh0UGFnZSA9IHRydWU7XG4gIC8vIEFycmF5IG9mIHBlbmRpbmcgUFJzXG4gIGNvbnN0IHByczogQXJyYXk8UHJTY2hlbWE+ID0gW107XG5cbiAgLy8gRm9yIGVhY2ggcGFnZSBvZiB0aGUgcmVzcG9uc2UsIGdldCB0aGUgcGFnZSBhbmQgYWRkIGl0IHRvIHRoZVxuICAvLyBsaXN0IG9mIFBSc1xuICB3aGlsZSAoaGFzTmV4dFBhZ2UpIHtcbiAgICBjb25zdCB7cXVlcnksIHBhcmFtc30gPSBxdWVyeUJ1aWxkZXIoMTAwLCBjdXJzb3IpO1xuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBncmFwaHFsKHF1ZXJ5LCBwYXJhbXMpIGFzIHR5cGVvZiBQUlNfUVVFUlk7XG5cbiAgICBwcnMucHVzaCguLi5yZXN1bHRzLnJlcG9zaXRvcnkucHVsbFJlcXVlc3RzLm5vZGVzKTtcbiAgICBoYXNOZXh0UGFnZSA9IHJlc3VsdHMucmVwb3NpdG9yeS5wdWxsUmVxdWVzdHMucGFnZUluZm8uaGFzTmV4dFBhZ2U7XG4gICAgY3Vyc29yID0gcmVzdWx0cy5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0cy5wYWdlSW5mby5lbmRDdXJzb3I7XG4gIH1cbiAgcmV0dXJuIHBycztcbn1cbiJdfQ==