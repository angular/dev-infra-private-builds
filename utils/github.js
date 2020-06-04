/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
    exports.getPendingPrs = exports.getPr = void 0;
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
    /** Get a PR from github  */
    function getPr(prSchema, number, _a) {
        var owner = _a.owner, name = _a.name;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var PR_QUERY, result;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        PR_QUERY = typed_graphqlify_1.params({
                            $number: 'Int!',
                            $owner: 'String!',
                            $name: 'String!',
                        }, {
                            repository: typed_graphqlify_1.params({ owner: '$owner', name: '$name' }, {
                                pullRequest: typed_graphqlify_1.params({ number: '$number' }, prSchema),
                            })
                        });
                        return [4 /*yield*/, graphql(typed_graphqlify_1.query(PR_QUERY), { number: number, owner: owner, name: name })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result.repository.pullRequest];
                }
            });
        });
    }
    exports.getPr = getPr;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdGh1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNENBQW1FO0lBRW5FLHFEQUFzRTtJQU10RTs7O09BR0c7SUFDSCxJQUFNLE9BQU8sR0FBRyxpQkFBc0IsQ0FBQyxRQUFRLENBQUM7UUFDOUMsT0FBTyxFQUFFO1lBQ1Asd0ZBQXdGO1lBQ3hGLHVGQUF1RjtZQUN2RixhQUFhLEVBQUUsWUFBUyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFFO1NBQy9FO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsNEJBQTRCO0lBQzVCLFNBQXNCLEtBQUssQ0FDdkIsUUFBa0IsRUFBRSxNQUFjLEVBQUUsRUFBMkI7WUFBMUIsS0FBSyxXQUFBLEVBQUUsSUFBSSxVQUFBOzs7Ozs7d0JBQzVDLFFBQVEsR0FBRyx5QkFBTSxDQUNuQjs0QkFDRSxPQUFPLEVBQUUsTUFBTTs0QkFDZixNQUFNLEVBQUUsU0FBUzs0QkFDakIsS0FBSyxFQUFFLFNBQVM7eUJBQ2pCLEVBQ0Q7NEJBQ0UsVUFBVSxFQUFFLHlCQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsRUFBRTtnQ0FDbkQsV0FBVyxFQUFFLHlCQUFNLENBQUMsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLEVBQUUsUUFBUSxDQUFDOzZCQUNuRCxDQUFDO3lCQUNILENBQUMsQ0FBQzt3QkFFUSxxQkFBTSxPQUFPLENBQUMsd0JBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFDLE1BQU0sUUFBQSxFQUFFLEtBQUssT0FBQSxFQUFFLElBQUksTUFBQSxFQUFDLENBQUMsRUFBQTs7d0JBQXJFLE1BQU0sR0FBRyxTQUErRTt3QkFDOUYsc0JBQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUM7Ozs7S0FDdEM7SUFoQkQsc0JBZ0JDO0lBRUQsdUNBQXVDO0lBQ3ZDLFNBQXNCLGFBQWEsQ0FBVyxRQUFrQixFQUFFLEVBQTJCO1lBQTFCLEtBQUssV0FBQSxFQUFFLElBQUksVUFBQTs7Ozs7O3dCQUV0RSxTQUFTLEdBQUcseUJBQU0sQ0FDcEI7NEJBQ0UsTUFBTSxFQUFFLEtBQUs7NEJBQ2IsTUFBTSxFQUFFLFFBQVE7NEJBQ2hCLE1BQU0sRUFBRSxTQUFTOzRCQUNqQixLQUFLLEVBQUUsU0FBUzt5QkFDakIsRUFDRDs0QkFDRSxVQUFVLEVBQUUseUJBQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxFQUFFO2dDQUNuRCxZQUFZLEVBQUUseUJBQU0sQ0FDaEI7b0NBQ0UsS0FBSyxFQUFFLFFBQVE7b0NBQ2YsS0FBSyxFQUFFLFFBQVE7b0NBQ2YsTUFBTSxFQUFFLE1BQU07aUNBQ2YsRUFDRDtvQ0FDRSxLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUM7b0NBQ2pCLFFBQVEsRUFBRTt3Q0FDUixXQUFXLEVBQUUsd0JBQUssQ0FBQyxPQUFPO3dDQUMxQixTQUFTLEVBQUUsd0JBQUssQ0FBQyxNQUFNO3FDQUN4QjtpQ0FDRixDQUFDOzZCQUNQLENBQUM7eUJBQ0gsQ0FBQyxDQUFDO3dCQUNELEtBQUssR0FBRyx3QkFBWSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQzt3QkFLM0MsWUFBWSxHQUFHLFVBQUMsS0FBYSxFQUFFLE1BQWU7NEJBQ2xELE9BQU87Z0NBQ0wsS0FBSyxPQUFBO2dDQUNMLE1BQU0sRUFBRTtvQ0FDTixLQUFLLEVBQUUsTUFBTSxJQUFJLElBQUk7b0NBQ3JCLEtBQUssRUFBRSxLQUFLO29DQUNaLEtBQUssT0FBQTtvQ0FDTCxJQUFJLE1BQUE7aUNBQ0w7NkJBQ0YsQ0FBQzt3QkFDSixDQUFDLENBQUM7d0JBS0UsV0FBVyxHQUFHLElBQUksQ0FBQzt3QkFFakIsR0FBRyxHQUFvQixFQUFFLENBQUM7Ozs2QkFJekIsV0FBVzt3QkFDVixLQUFrQixZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUExQyxrQkFBSyxFQUFFLG9CQUFNLENBQThCO3dCQUNsQyxxQkFBTSxPQUFPLENBQUMsT0FBSyxFQUFFLFFBQU0sQ0FBQyxFQUFBOzt3QkFBdEMsT0FBTyxHQUFHLFNBQWdEO3dCQUVoRSxHQUFHLENBQUMsSUFBSSxPQUFSLEdBQUcsbUJBQVMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFFO3dCQUNuRCxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQzt3QkFDbkUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7OzRCQUU5RCxzQkFBTyxHQUFHLEVBQUM7Ozs7S0FDWjtJQTdERCxzQ0E2REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtncmFwaHFsIGFzIHVuYXV0aGVudGljYXRlZEdyYXBocWx9IGZyb20gJ0BvY3Rva2l0L2dyYXBocWwnO1xuXG5pbXBvcnQge3BhcmFtcywgcXVlcnkgYXMgZ3JhcGhxbFF1ZXJ5LCB0eXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5pbXBvcnQge05nRGV2Q29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKiBUaGUgY29uZmlndXJhdGlvbiByZXF1aXJlZCBmb3IgZ2l0aHViIGludGVyYWN0aW9ucy4gKi9cbnR5cGUgR2l0aHViQ29uZmlnID0gTmdEZXZDb25maWdbJ2dpdGh1YiddO1xuXG4vKipcbiAqIEF1dGhlbnRpY2F0ZWQgaW5zdGFuY2Ugb2YgR2l0aHViIEdyYXBoUWwgQVBJIHNlcnZpY2UsIHJlbGllcyBvbiBhXG4gKiBwZXJzb25hbCBhY2Nlc3MgdG9rZW4gYmVpbmcgYXZhaWxhYmxlIGluIHRoZSBUT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAqL1xuY29uc3QgZ3JhcGhxbCA9IHVuYXV0aGVudGljYXRlZEdyYXBocWwuZGVmYXVsdHMoe1xuICBoZWFkZXJzOiB7XG4gICAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogUmVtb3ZlIHJlZmVyZW5jZSB0byBUT0tFTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBhcyBwYXJ0IG9mIGxhcmdlclxuICAgIC8vIGVmZm9ydCB0byBtaWdyYXRlIHRvIGV4cGVjdGluZyB0b2tlbnMgdmlhIEdJVEhVQl9BQ0NFU1NfVE9LRU4gZW52aXJvbm1lbnQgdmFyaWFibGVzLlxuICAgIGF1dGhvcml6YXRpb246IGB0b2tlbiAke3Byb2Nlc3MuZW52LlRPS0VOIHx8IHByb2Nlc3MuZW52LkdJVEhVQl9BQ0NFU1NfVE9LRU59YCxcbiAgfVxufSk7XG5cbi8qKiBHZXQgYSBQUiBmcm9tIGdpdGh1YiAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcjxQclNjaGVtYT4oXG4gICAgcHJTY2hlbWE6IFByU2NoZW1hLCBudW1iZXI6IG51bWJlciwge293bmVyLCBuYW1lfTogR2l0aHViQ29uZmlnKSB7XG4gIGNvbnN0IFBSX1FVRVJZID0gcGFyYW1zKFxuICAgICAge1xuICAgICAgICAkbnVtYmVyOiAnSW50IScsICAgIC8vIFRoZSBQUiBudW1iZXJcbiAgICAgICAgJG93bmVyOiAnU3RyaW5nIScsICAvLyBUaGUgb3JnYW5pemF0aW9uIHRvIHF1ZXJ5IGZvclxuICAgICAgICAkbmFtZTogJ1N0cmluZyEnLCAgIC8vIFRoZSBvcmdhbml6YXRpb24gdG8gcXVlcnkgZm9yXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICByZXBvc2l0b3J5OiBwYXJhbXMoe293bmVyOiAnJG93bmVyJywgbmFtZTogJyRuYW1lJ30sIHtcbiAgICAgICAgICBwdWxsUmVxdWVzdDogcGFyYW1zKHtudW1iZXI6ICckbnVtYmVyJ30sIHByU2NoZW1hKSxcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdyYXBocWwoZ3JhcGhxbFF1ZXJ5KFBSX1FVRVJZKSwge251bWJlciwgb3duZXIsIG5hbWV9KSBhcyB0eXBlb2YgUFJfUVVFUlk7XG4gIHJldHVybiByZXN1bHQucmVwb3NpdG9yeS5wdWxsUmVxdWVzdDtcbn1cblxuLyoqIEdldCBhbGwgcGVuZGluZyBQUnMgZnJvbSBnaXRodWIgICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVuZGluZ1ByczxQclNjaGVtYT4ocHJTY2hlbWE6IFByU2NoZW1hLCB7b3duZXIsIG5hbWV9OiBHaXRodWJDb25maWcpIHtcbiAgLy8gVGhlIEdyYXBoUUwgcXVlcnkgb2JqZWN0IHRvIGdldCBhIHBhZ2Ugb2YgcGVuZGluZyBQUnNcbiAgY29uc3QgUFJTX1FVRVJZID0gcGFyYW1zKFxuICAgICAge1xuICAgICAgICAkZmlyc3Q6ICdJbnQnLCAgICAgIC8vIEhvdyBtYW55IGVudHJpZXMgdG8gZ2V0IHdpdGggZWFjaCByZXF1ZXN0XG4gICAgICAgICRhZnRlcjogJ1N0cmluZycsICAgLy8gVGhlIGN1cnNvciB0byBzdGFydCB0aGUgcGFnZSBhdFxuICAgICAgICAkb3duZXI6ICdTdHJpbmchJywgIC8vIFRoZSBvcmdhbml6YXRpb24gdG8gcXVlcnkgZm9yXG4gICAgICAgICRuYW1lOiAnU3RyaW5nIScsICAgLy8gVGhlIHJlcG9zaXRvcnkgdG8gcXVlcnkgZm9yXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICByZXBvc2l0b3J5OiBwYXJhbXMoe293bmVyOiAnJG93bmVyJywgbmFtZTogJyRuYW1lJ30sIHtcbiAgICAgICAgICBwdWxsUmVxdWVzdHM6IHBhcmFtcyhcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpcnN0OiAnJGZpcnN0JyxcbiAgICAgICAgICAgICAgICBhZnRlcjogJyRhZnRlcicsXG4gICAgICAgICAgICAgICAgc3RhdGVzOiBgT1BFTmAsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBub2RlczogW3ByU2NoZW1hXSxcbiAgICAgICAgICAgICAgICBwYWdlSW5mbzoge1xuICAgICAgICAgICAgICAgICAgaGFzTmV4dFBhZ2U6IHR5cGVzLmJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICBlbmRDdXJzb3I6IHR5cGVzLnN0cmluZyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICBjb25zdCBxdWVyeSA9IGdyYXBocWxRdWVyeSgnbWVtYmVycycsIFBSU19RVUVSWSk7XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHF1ZXJ5IGFuZCBxdWVyeVBhcmFtcyBmb3IgYSBzcGVjaWZpYyBwYWdlIG9mIGVudHJpZXMuXG4gICAqL1xuICBjb25zdCBxdWVyeUJ1aWxkZXIgPSAoY291bnQ6IG51bWJlciwgY3Vyc29yPzogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHF1ZXJ5LFxuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIGFmdGVyOiBjdXJzb3IgfHwgbnVsbCxcbiAgICAgICAgZmlyc3Q6IGNvdW50LFxuICAgICAgICBvd25lcixcbiAgICAgICAgbmFtZSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfTtcblxuICAvLyBUaGUgY3VycmVudCBjdXJzb3JcbiAgbGV0IGN1cnNvcjogc3RyaW5nfHVuZGVmaW5lZDtcbiAgLy8gSWYgYW4gYWRkaXRpb25hbCBwYWdlIG9mIG1lbWJlcnMgaXMgZXhwZWN0ZWRcbiAgbGV0IGhhc05leHRQYWdlID0gdHJ1ZTtcbiAgLy8gQXJyYXkgb2YgcGVuZGluZyBQUnNcbiAgY29uc3QgcHJzOiBBcnJheTxQclNjaGVtYT4gPSBbXTtcblxuICAvLyBGb3IgZWFjaCBwYWdlIG9mIHRoZSByZXNwb25zZSwgZ2V0IHRoZSBwYWdlIGFuZCBhZGQgaXQgdG8gdGhlXG4gIC8vIGxpc3Qgb2YgUFJzXG4gIHdoaWxlIChoYXNOZXh0UGFnZSkge1xuICAgIGNvbnN0IHtxdWVyeSwgcGFyYW1zfSA9IHF1ZXJ5QnVpbGRlcigxMDAsIGN1cnNvcik7XG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGdyYXBocWwocXVlcnksIHBhcmFtcykgYXMgdHlwZW9mIFBSU19RVUVSWTtcblxuICAgIHBycy5wdXNoKC4uLnJlc3VsdHMucmVwb3NpdG9yeS5wdWxsUmVxdWVzdHMubm9kZXMpO1xuICAgIGhhc05leHRQYWdlID0gcmVzdWx0cy5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0cy5wYWdlSW5mby5oYXNOZXh0UGFnZTtcbiAgICBjdXJzb3IgPSByZXN1bHRzLnJlcG9zaXRvcnkucHVsbFJlcXVlc3RzLnBhZ2VJbmZvLmVuZEN1cnNvcjtcbiAgfVxuICByZXR1cm4gcHJzO1xufVxuIl19