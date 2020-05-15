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
    exports.getPendingPrs = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdGh1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNENBQW1FO0lBRW5FLHFEQUFzRTtJQU10RTs7O09BR0c7SUFDSCxJQUFNLE9BQU8sR0FBRyxpQkFBc0IsQ0FBQyxRQUFRLENBQUM7UUFDOUMsT0FBTyxFQUFFO1lBQ1Asd0ZBQXdGO1lBQ3hGLHVGQUF1RjtZQUN2RixhQUFhLEVBQUUsWUFBUyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFFO1NBQy9FO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsdUNBQXVDO0lBQ3ZDLFNBQXNCLGFBQWEsQ0FBVyxRQUFrQixFQUFFLEVBQTJCO1lBQTFCLEtBQUssV0FBQSxFQUFFLElBQUksVUFBQTs7Ozs7O3dCQUV0RSxTQUFTLEdBQUcseUJBQU0sQ0FDcEI7NEJBQ0UsTUFBTSxFQUFFLEtBQUs7NEJBQ2IsTUFBTSxFQUFFLFFBQVE7NEJBQ2hCLE1BQU0sRUFBRSxTQUFTOzRCQUNqQixLQUFLLEVBQUUsU0FBUzt5QkFDakIsRUFDRDs0QkFDRSxVQUFVLEVBQUUseUJBQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxFQUFFO2dDQUNuRCxZQUFZLEVBQUUseUJBQU0sQ0FDaEI7b0NBQ0UsS0FBSyxFQUFFLFFBQVE7b0NBQ2YsS0FBSyxFQUFFLFFBQVE7b0NBQ2YsTUFBTSxFQUFFLE1BQU07aUNBQ2YsRUFDRDtvQ0FDRSxLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUM7b0NBQ2pCLFFBQVEsRUFBRTt3Q0FDUixXQUFXLEVBQUUsd0JBQUssQ0FBQyxPQUFPO3dDQUMxQixTQUFTLEVBQUUsd0JBQUssQ0FBQyxNQUFNO3FDQUN4QjtpQ0FDRixDQUFDOzZCQUNQLENBQUM7eUJBQ0gsQ0FBQyxDQUFDO3dCQUNELEtBQUssR0FBRyx3QkFBWSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQzt3QkFLM0MsWUFBWSxHQUFHLFVBQUMsS0FBYSxFQUFFLE1BQWU7NEJBQ2xELE9BQU87Z0NBQ0wsS0FBSyxPQUFBO2dDQUNMLE1BQU0sRUFBRTtvQ0FDTixLQUFLLEVBQUUsTUFBTSxJQUFJLElBQUk7b0NBQ3JCLEtBQUssRUFBRSxLQUFLO29DQUNaLEtBQUssT0FBQTtvQ0FDTCxJQUFJLE1BQUE7aUNBQ0w7NkJBQ0YsQ0FBQzt3QkFDSixDQUFDLENBQUM7d0JBS0UsV0FBVyxHQUFHLElBQUksQ0FBQzt3QkFFakIsR0FBRyxHQUFvQixFQUFFLENBQUM7Ozs2QkFJekIsV0FBVzt3QkFDVixLQUFrQixZQUFZLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUExQyxrQkFBSyxFQUFFLG9CQUFNLENBQThCO3dCQUNsQyxxQkFBTSxPQUFPLENBQUMsT0FBSyxFQUFFLFFBQU0sQ0FBQyxFQUFBOzt3QkFBdEMsT0FBTyxHQUFHLFNBQWdEO3dCQUVoRSxHQUFHLENBQUMsSUFBSSxPQUFSLEdBQUcsbUJBQVMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFFO3dCQUNuRCxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQzt3QkFDbkUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7OzRCQUU5RCxzQkFBTyxHQUFHLEVBQUM7Ozs7S0FDWjtJQTdERCxzQ0E2REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z3JhcGhxbCBhcyB1bmF1dGhlbnRpY2F0ZWRHcmFwaHFsfSBmcm9tICdAb2N0b2tpdC9ncmFwaHFsJztcblxuaW1wb3J0IHtwYXJhbXMsIHF1ZXJ5IGFzIGdyYXBocWxRdWVyeSwgdHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuaW1wb3J0IHtOZ0RldkNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuXG4vKiogVGhlIGNvbmZpZ3VyYXRpb24gcmVxdWlyZWQgZm9yIGdpdGh1YiBpbnRlcmFjdGlvbnMuICovXG50eXBlIEdpdGh1YkNvbmZpZyA9IE5nRGV2Q29uZmlnWydnaXRodWInXTtcblxuLyoqXG4gKiBBdXRoZW50aWNhdGVkIGluc3RhbmNlIG9mIEdpdGh1YiBHcmFwaFFsIEFQSSBzZXJ2aWNlLCByZWxpZXMgb24gYVxuICogcGVyc29uYWwgYWNjZXNzIHRva2VuIGJlaW5nIGF2YWlsYWJsZSBpbiB0aGUgVE9LRU4gZW52aXJvbm1lbnQgdmFyaWFibGUuXG4gKi9cbmNvbnN0IGdyYXBocWwgPSB1bmF1dGhlbnRpY2F0ZWRHcmFwaHFsLmRlZmF1bHRzKHtcbiAgaGVhZGVyczoge1xuICAgIC8vIFRPRE8oam9zZXBocGVycm90dCk6IFJlbW92ZSByZWZlcmVuY2UgdG8gVE9LRU4gZW52aXJvbm1lbnQgdmFyaWFibGUgYXMgcGFydCBvZiBsYXJnZXJcbiAgICAvLyBlZmZvcnQgdG8gbWlncmF0ZSB0byBleHBlY3RpbmcgdG9rZW5zIHZpYSBHSVRIVUJfQUNDRVNTX1RPS0VOIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbiAgICBhdXRob3JpemF0aW9uOiBgdG9rZW4gJHtwcm9jZXNzLmVudi5UT0tFTiB8fCBwcm9jZXNzLmVudi5HSVRIVUJfQUNDRVNTX1RPS0VOfWAsXG4gIH1cbn0pO1xuXG4vKiogR2V0IGFsbCBwZW5kaW5nIFBScyBmcm9tIGdpdGh1YiAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nUHJzPFByU2NoZW1hPihwclNjaGVtYTogUHJTY2hlbWEsIHtvd25lciwgbmFtZX06IEdpdGh1YkNvbmZpZykge1xuICAvLyBUaGUgR3JhcGhRTCBxdWVyeSBvYmplY3QgdG8gZ2V0IGEgcGFnZSBvZiBwZW5kaW5nIFBSc1xuICBjb25zdCBQUlNfUVVFUlkgPSBwYXJhbXMoXG4gICAgICB7XG4gICAgICAgICRmaXJzdDogJ0ludCcsICAgICAgLy8gSG93IG1hbnkgZW50cmllcyB0byBnZXQgd2l0aCBlYWNoIHJlcXVlc3RcbiAgICAgICAgJGFmdGVyOiAnU3RyaW5nJywgICAvLyBUaGUgY3Vyc29yIHRvIHN0YXJ0IHRoZSBwYWdlIGF0XG4gICAgICAgICRvd25lcjogJ1N0cmluZyEnLCAgLy8gVGhlIG9yZ2FuaXphdGlvbiB0byBxdWVyeSBmb3JcbiAgICAgICAgJG5hbWU6ICdTdHJpbmchJywgICAvLyBUaGUgcmVwb3NpdG9yeSB0byBxdWVyeSBmb3JcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHJlcG9zaXRvcnk6IHBhcmFtcyh7b3duZXI6ICckb3duZXInLCBuYW1lOiAnJG5hbWUnfSwge1xuICAgICAgICAgIHB1bGxSZXF1ZXN0czogcGFyYW1zKFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmlyc3Q6ICckZmlyc3QnLFxuICAgICAgICAgICAgICAgIGFmdGVyOiAnJGFmdGVyJyxcbiAgICAgICAgICAgICAgICBzdGF0ZXM6IGBPUEVOYCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vZGVzOiBbcHJTY2hlbWFdLFxuICAgICAgICAgICAgICAgIHBhZ2VJbmZvOiB7XG4gICAgICAgICAgICAgICAgICBoYXNOZXh0UGFnZTogdHlwZXMuYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgIGVuZEN1cnNvcjogdHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICB9KVxuICAgICAgfSk7XG4gIGNvbnN0IHF1ZXJ5ID0gZ3JhcGhxbFF1ZXJ5KCdtZW1iZXJzJywgUFJTX1FVRVJZKTtcblxuICAvKipcbiAgICogR2V0cyB0aGUgcXVlcnkgYW5kIHF1ZXJ5UGFyYW1zIGZvciBhIHNwZWNpZmljIHBhZ2Ugb2YgZW50cmllcy5cbiAgICovXG4gIGNvbnN0IHF1ZXJ5QnVpbGRlciA9IChjb3VudDogbnVtYmVyLCBjdXJzb3I/OiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgcXVlcnksXG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgYWZ0ZXI6IGN1cnNvciB8fCBudWxsLFxuICAgICAgICBmaXJzdDogY291bnQsXG4gICAgICAgIG93bmVyLFxuICAgICAgICBuYW1lLFxuICAgICAgfSxcbiAgICB9O1xuICB9O1xuXG4gIC8vIFRoZSBjdXJyZW50IGN1cnNvclxuICBsZXQgY3Vyc29yOiBzdHJpbmd8dW5kZWZpbmVkO1xuICAvLyBJZiBhbiBhZGRpdGlvbmFsIHBhZ2Ugb2YgbWVtYmVycyBpcyBleHBlY3RlZFxuICBsZXQgaGFzTmV4dFBhZ2UgPSB0cnVlO1xuICAvLyBBcnJheSBvZiBwZW5kaW5nIFBSc1xuICBjb25zdCBwcnM6IEFycmF5PFByU2NoZW1hPiA9IFtdO1xuXG4gIC8vIEZvciBlYWNoIHBhZ2Ugb2YgdGhlIHJlc3BvbnNlLCBnZXQgdGhlIHBhZ2UgYW5kIGFkZCBpdCB0byB0aGVcbiAgLy8gbGlzdCBvZiBQUnNcbiAgd2hpbGUgKGhhc05leHRQYWdlKSB7XG4gICAgY29uc3Qge3F1ZXJ5LCBwYXJhbXN9ID0gcXVlcnlCdWlsZGVyKDEwMCwgY3Vyc29yKTtcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgZ3JhcGhxbChxdWVyeSwgcGFyYW1zKSBhcyB0eXBlb2YgUFJTX1FVRVJZO1xuXG4gICAgcHJzLnB1c2goLi4ucmVzdWx0cy5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0cy5ub2Rlcyk7XG4gICAgaGFzTmV4dFBhZ2UgPSByZXN1bHRzLnJlcG9zaXRvcnkucHVsbFJlcXVlc3RzLnBhZ2VJbmZvLmhhc05leHRQYWdlO1xuICAgIGN1cnNvciA9IHJlc3VsdHMucmVwb3NpdG9yeS5wdWxsUmVxdWVzdHMucGFnZUluZm8uZW5kQ3Vyc29yO1xuICB9XG4gIHJldHVybiBwcnM7XG59XG4iXX0=