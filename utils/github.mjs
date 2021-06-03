/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __generator, __read, __spreadArray } from "tslib";
import { params, types } from 'typed-graphqlify';
/** Get a PR from github  */
export function getPr(prSchema, prNumber, git) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, owner, name, PR_QUERY, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = git.remoteConfig, owner = _a.owner, name = _a.name;
                    PR_QUERY = params({
                        $number: 'Int!',
                        $owner: 'String!',
                        $name: 'String!', // The organization to query for
                    }, {
                        repository: params({ owner: '$owner', name: '$name' }, {
                            pullRequest: params({ number: '$number' }, prSchema),
                        })
                    });
                    return [4 /*yield*/, git.github.graphql(PR_QUERY, { number: prNumber, owner: owner, name: name })];
                case 1:
                    result = (_b.sent());
                    return [2 /*return*/, result.repository.pullRequest];
            }
        });
    });
}
/** Get all pending PRs from github  */
export function getPendingPrs(prSchema, git) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, owner, name, PRS_QUERY, cursor, hasNextPage, prs, params_1, results;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = git.remoteConfig, owner = _a.owner, name = _a.name;
                    PRS_QUERY = params({
                        $first: 'Int',
                        $after: 'String',
                        $owner: 'String!',
                        $name: 'String!', // The repository to query for
                    }, {
                        repository: params({ owner: '$owner', name: '$name' }, {
                            pullRequests: params({
                                first: '$first',
                                after: '$after',
                                states: "OPEN",
                            }, {
                                nodes: [prSchema],
                                pageInfo: {
                                    hasNextPage: types.boolean,
                                    endCursor: types.string,
                                },
                            }),
                        })
                    });
                    hasNextPage = true;
                    prs = [];
                    _b.label = 1;
                case 1:
                    if (!hasNextPage) return [3 /*break*/, 3];
                    params_1 = {
                        after: cursor || null,
                        first: 100,
                        owner: owner,
                        name: name,
                    };
                    return [4 /*yield*/, git.github.graphql(PRS_QUERY, params_1)];
                case 2:
                    results = _b.sent();
                    prs.push.apply(prs, __spreadArray([], __read(results.repository.pullRequests.nodes)));
                    hasNextPage = results.repository.pullRequests.pageInfo.hasNextPage;
                    cursor = results.repository.pullRequests.pageInfo.endCursor;
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, prs];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdGh1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUkvQyw0QkFBNEI7QUFDNUIsTUFBTSxVQUFnQixLQUFLLENBQ3ZCLFFBQWtCLEVBQUUsUUFBZ0IsRUFBRSxHQUEyQjs7Ozs7O29CQUU3RCxLQUFnQixHQUFHLENBQUMsWUFBWSxFQUEvQixLQUFLLFdBQUEsRUFBRSxJQUFJLFVBQUEsQ0FBcUI7b0JBRWpDLFFBQVEsR0FBRyxNQUFNLENBQ25CO3dCQUNFLE9BQU8sRUFBRSxNQUFNO3dCQUNmLE1BQU0sRUFBRSxTQUFTO3dCQUNqQixLQUFLLEVBQUUsU0FBUyxFQUFJLGdDQUFnQztxQkFDckQsRUFDRDt3QkFDRSxVQUFVLEVBQUUsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLEVBQUU7NEJBQ25ELFdBQVcsRUFBRSxNQUFNLENBQUMsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLEVBQUUsUUFBUSxDQUFDO3lCQUNuRCxDQUFDO3FCQUNILENBQUMsQ0FBQztvQkFFUyxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssT0FBQSxFQUFFLElBQUksTUFBQSxFQUFDLENBQUMsRUFBQTs7b0JBQTdFLE1BQU0sR0FBRyxDQUFDLFNBQW1FLENBQUM7b0JBQ3BGLHNCQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFDOzs7O0NBQ3RDO0FBRUQsdUNBQXVDO0FBQ3ZDLE1BQU0sVUFBZ0IsYUFBYSxDQUFXLFFBQWtCLEVBQUUsR0FBMkI7Ozs7OztvQkFFckYsS0FBZ0IsR0FBRyxDQUFDLFlBQVksRUFBL0IsS0FBSyxXQUFBLEVBQUUsSUFBSSxVQUFBLENBQXFCO29CQUVqQyxTQUFTLEdBQUcsTUFBTSxDQUNwQjt3QkFDRSxNQUFNLEVBQUUsS0FBSzt3QkFDYixNQUFNLEVBQUUsUUFBUTt3QkFDaEIsTUFBTSxFQUFFLFNBQVM7d0JBQ2pCLEtBQUssRUFBRSxTQUFTLEVBQUksOEJBQThCO3FCQUNuRCxFQUNEO3dCQUNFLFVBQVUsRUFBRSxNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsRUFBRTs0QkFDbkQsWUFBWSxFQUFFLE1BQU0sQ0FDaEI7Z0NBQ0UsS0FBSyxFQUFFLFFBQVE7Z0NBQ2YsS0FBSyxFQUFFLFFBQVE7Z0NBQ2YsTUFBTSxFQUFFLE1BQU07NkJBQ2YsRUFDRDtnQ0FDRSxLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0NBQ2pCLFFBQVEsRUFBRTtvQ0FDUixXQUFXLEVBQUUsS0FBSyxDQUFDLE9BQU87b0NBQzFCLFNBQVMsRUFBRSxLQUFLLENBQUMsTUFBTTtpQ0FDeEI7NkJBQ0YsQ0FBQzt5QkFDUCxDQUFDO3FCQUNILENBQUMsQ0FBQztvQkFJSCxXQUFXLEdBQUcsSUFBSSxDQUFDO29CQUVqQixHQUFHLEdBQW9CLEVBQUUsQ0FBQzs7O3lCQUd6QixXQUFXO29CQUNWLFdBQVM7d0JBQ2IsS0FBSyxFQUFFLE1BQU0sSUFBSSxJQUFJO3dCQUNyQixLQUFLLEVBQUUsR0FBRzt3QkFDVixLQUFLLE9BQUE7d0JBQ0wsSUFBSSxNQUFBO3FCQUNMLENBQUM7b0JBQ2MscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQU0sQ0FBQyxFQUFBOztvQkFBckQsT0FBTyxHQUFHLFNBQStEO29CQUMvRSxHQUFHLENBQUMsSUFBSSxPQUFSLEdBQUcsMkJBQVMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsS0FBSyxJQUFFO29CQUNuRCxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztvQkFDbkUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7O3dCQUU5RCxzQkFBTyxHQUFHLEVBQUM7Ozs7Q0FDWiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3BhcmFtcywgdHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuXG5cbi8qKiBHZXQgYSBQUiBmcm9tIGdpdGh1YiAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcjxQclNjaGVtYT4oXG4gICAgcHJTY2hlbWE6IFByU2NoZW1hLCBwck51bWJlcjogbnVtYmVyLCBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQpIHtcbiAgLyoqIFRoZSBvd25lciBhbmQgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeSAqL1xuICBjb25zdCB7b3duZXIsIG5hbWV9ID0gZ2l0LnJlbW90ZUNvbmZpZztcbiAgLyoqIFRoZSBHcmFwaHFsIHF1ZXJ5IG9iamVjdCB0byBnZXQgYSB0aGUgUFIgKi9cbiAgY29uc3QgUFJfUVVFUlkgPSBwYXJhbXMoXG4gICAgICB7XG4gICAgICAgICRudW1iZXI6ICdJbnQhJywgICAgLy8gVGhlIFBSIG51bWJlclxuICAgICAgICAkb3duZXI6ICdTdHJpbmchJywgIC8vIFRoZSBvcmdhbml6YXRpb24gdG8gcXVlcnkgZm9yXG4gICAgICAgICRuYW1lOiAnU3RyaW5nIScsICAgLy8gVGhlIG9yZ2FuaXphdGlvbiB0byBxdWVyeSBmb3JcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHJlcG9zaXRvcnk6IHBhcmFtcyh7b3duZXI6ICckb3duZXInLCBuYW1lOiAnJG5hbWUnfSwge1xuICAgICAgICAgIHB1bGxSZXF1ZXN0OiBwYXJhbXMoe251bWJlcjogJyRudW1iZXInfSwgcHJTY2hlbWEpLFxuICAgICAgICB9KVxuICAgICAgfSk7XG5cbiAgY29uc3QgcmVzdWx0ID0gKGF3YWl0IGdpdC5naXRodWIuZ3JhcGhxbChQUl9RVUVSWSwge251bWJlcjogcHJOdW1iZXIsIG93bmVyLCBuYW1lfSkpO1xuICByZXR1cm4gcmVzdWx0LnJlcG9zaXRvcnkucHVsbFJlcXVlc3Q7XG59XG5cbi8qKiBHZXQgYWxsIHBlbmRpbmcgUFJzIGZyb20gZ2l0aHViICAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlbmRpbmdQcnM8UHJTY2hlbWE+KHByU2NoZW1hOiBQclNjaGVtYSwgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50KSB7XG4gIC8qKiBUaGUgb3duZXIgYW5kIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkgKi9cbiAgY29uc3Qge293bmVyLCBuYW1lfSA9IGdpdC5yZW1vdGVDb25maWc7XG4gIC8qKiBUaGUgR3JhcGhxbCBxdWVyeSBvYmplY3QgdG8gZ2V0IGEgcGFnZSBvZiBwZW5kaW5nIFBScyAqL1xuICBjb25zdCBQUlNfUVVFUlkgPSBwYXJhbXMoXG4gICAgICB7XG4gICAgICAgICRmaXJzdDogJ0ludCcsICAgICAgLy8gSG93IG1hbnkgZW50cmllcyB0byBnZXQgd2l0aCBlYWNoIHJlcXVlc3RcbiAgICAgICAgJGFmdGVyOiAnU3RyaW5nJywgICAvLyBUaGUgY3Vyc29yIHRvIHN0YXJ0IHRoZSBwYWdlIGF0XG4gICAgICAgICRvd25lcjogJ1N0cmluZyEnLCAgLy8gVGhlIG9yZ2FuaXphdGlvbiB0byBxdWVyeSBmb3JcbiAgICAgICAgJG5hbWU6ICdTdHJpbmchJywgICAvLyBUaGUgcmVwb3NpdG9yeSB0byBxdWVyeSBmb3JcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHJlcG9zaXRvcnk6IHBhcmFtcyh7b3duZXI6ICckb3duZXInLCBuYW1lOiAnJG5hbWUnfSwge1xuICAgICAgICAgIHB1bGxSZXF1ZXN0czogcGFyYW1zKFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmlyc3Q6ICckZmlyc3QnLFxuICAgICAgICAgICAgICAgIGFmdGVyOiAnJGFmdGVyJyxcbiAgICAgICAgICAgICAgICBzdGF0ZXM6IGBPUEVOYCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vZGVzOiBbcHJTY2hlbWFdLFxuICAgICAgICAgICAgICAgIHBhZ2VJbmZvOiB7XG4gICAgICAgICAgICAgICAgICBoYXNOZXh0UGFnZTogdHlwZXMuYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgIGVuZEN1cnNvcjogdHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICB9KVxuICAgICAgfSk7XG4gIC8qKiBUaGUgY3VycmVudCBjdXJzb3IgKi9cbiAgbGV0IGN1cnNvcjogc3RyaW5nfHVuZGVmaW5lZDtcbiAgLyoqIElmIGFuIGFkZGl0aW9uYWwgcGFnZSBvZiBtZW1iZXJzIGlzIGV4cGVjdGVkICovXG4gIGxldCBoYXNOZXh0UGFnZSA9IHRydWU7XG4gIC8qKiBBcnJheSBvZiBwZW5kaW5nIFBScyAqL1xuICBjb25zdCBwcnM6IEFycmF5PFByU2NoZW1hPiA9IFtdO1xuXG4gIC8vIEZvciBlYWNoIHBhZ2Ugb2YgdGhlIHJlc3BvbnNlLCBnZXQgdGhlIHBhZ2UgYW5kIGFkZCBpdCB0byB0aGUgbGlzdCBvZiBQUnNcbiAgd2hpbGUgKGhhc05leHRQYWdlKSB7XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgYWZ0ZXI6IGN1cnNvciB8fCBudWxsLFxuICAgICAgZmlyc3Q6IDEwMCxcbiAgICAgIG93bmVyLFxuICAgICAgbmFtZSxcbiAgICB9O1xuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBnaXQuZ2l0aHViLmdyYXBocWwoUFJTX1FVRVJZLCBwYXJhbXMpIGFzIHR5cGVvZiBQUlNfUVVFUlk7XG4gICAgcHJzLnB1c2goLi4ucmVzdWx0cy5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0cy5ub2Rlcyk7XG4gICAgaGFzTmV4dFBhZ2UgPSByZXN1bHRzLnJlcG9zaXRvcnkucHVsbFJlcXVlc3RzLnBhZ2VJbmZvLmhhc05leHRQYWdlO1xuICAgIGN1cnNvciA9IHJlc3VsdHMucmVwb3NpdG9yeS5wdWxsUmVxdWVzdHMucGFnZUluZm8uZW5kQ3Vyc29yO1xuICB9XG4gIHJldHVybiBwcnM7XG59XG4iXX0=