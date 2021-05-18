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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdGh1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUkvQyw0QkFBNEI7QUFDNUIsTUFBTSxVQUFnQixLQUFLLENBQVcsUUFBa0IsRUFBRSxRQUFnQixFQUFFLEdBQW9COzs7Ozs7b0JBRXhGLEtBQWdCLEdBQUcsQ0FBQyxZQUFZLEVBQS9CLEtBQUssV0FBQSxFQUFFLElBQUksVUFBQSxDQUFxQjtvQkFFakMsUUFBUSxHQUFHLE1BQU0sQ0FDbkI7d0JBQ0UsT0FBTyxFQUFFLE1BQU07d0JBQ2YsTUFBTSxFQUFFLFNBQVM7d0JBQ2pCLEtBQUssRUFBRSxTQUFTLEVBQUksZ0NBQWdDO3FCQUNyRCxFQUNEO3dCQUNFLFVBQVUsRUFBRSxNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsRUFBRTs0QkFDbkQsV0FBVyxFQUFFLE1BQU0sQ0FBQyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsRUFBRSxRQUFRLENBQUM7eUJBQ25ELENBQUM7cUJBQ0gsQ0FBQyxDQUFDO29CQUVTLHFCQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxPQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUMsQ0FBQyxFQUFBOztvQkFBN0UsTUFBTSxHQUFHLENBQUMsU0FBbUUsQ0FBQztvQkFDcEYsc0JBQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUM7Ozs7Q0FDdEM7QUFFRCx1Q0FBdUM7QUFDdkMsTUFBTSxVQUFnQixhQUFhLENBQVcsUUFBa0IsRUFBRSxHQUFvQjs7Ozs7O29CQUU5RSxLQUFnQixHQUFHLENBQUMsWUFBWSxFQUEvQixLQUFLLFdBQUEsRUFBRSxJQUFJLFVBQUEsQ0FBcUI7b0JBRWpDLFNBQVMsR0FBRyxNQUFNLENBQ3BCO3dCQUNFLE1BQU0sRUFBRSxLQUFLO3dCQUNiLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixNQUFNLEVBQUUsU0FBUzt3QkFDakIsS0FBSyxFQUFFLFNBQVMsRUFBSSw4QkFBOEI7cUJBQ25ELEVBQ0Q7d0JBQ0UsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxFQUFFOzRCQUNuRCxZQUFZLEVBQUUsTUFBTSxDQUNoQjtnQ0FDRSxLQUFLLEVBQUUsUUFBUTtnQ0FDZixLQUFLLEVBQUUsUUFBUTtnQ0FDZixNQUFNLEVBQUUsTUFBTTs2QkFDZixFQUNEO2dDQUNFLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQztnQ0FDakIsUUFBUSxFQUFFO29DQUNSLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTztvQ0FDMUIsU0FBUyxFQUFFLEtBQUssQ0FBQyxNQUFNO2lDQUN4Qjs2QkFDRixDQUFDO3lCQUNQLENBQUM7cUJBQ0gsQ0FBQyxDQUFDO29CQUlILFdBQVcsR0FBRyxJQUFJLENBQUM7b0JBRWpCLEdBQUcsR0FBb0IsRUFBRSxDQUFDOzs7eUJBR3pCLFdBQVc7b0JBQ1YsV0FBUzt3QkFDYixLQUFLLEVBQUUsTUFBTSxJQUFJLElBQUk7d0JBQ3JCLEtBQUssRUFBRSxHQUFHO3dCQUNWLEtBQUssT0FBQTt3QkFDTCxJQUFJLE1BQUE7cUJBQ0wsQ0FBQztvQkFDYyxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsUUFBTSxDQUFDLEVBQUE7O29CQUFyRCxPQUFPLEdBQUcsU0FBK0Q7b0JBQy9FLEdBQUcsQ0FBQyxJQUFJLE9BQVIsR0FBRywyQkFBUyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxLQUFLLElBQUU7b0JBQ25ELFdBQVcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO29CQUNuRSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQzs7d0JBRTlELHNCQUFPLEdBQUcsRUFBQzs7OztDQUNaIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC9pbmRleCc7XG5cbi8qKiBHZXQgYSBQUiBmcm9tIGdpdGh1YiAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcjxQclNjaGVtYT4ocHJTY2hlbWE6IFByU2NoZW1hLCBwck51bWJlcjogbnVtYmVyLCBnaXQ6IEdpdENsaWVudDx0cnVlPikge1xuICAvKiogVGhlIG93bmVyIGFuZCBuYW1lIG9mIHRoZSByZXBvc2l0b3J5ICovXG4gIGNvbnN0IHtvd25lciwgbmFtZX0gPSBnaXQucmVtb3RlQ29uZmlnO1xuICAvKiogVGhlIEdyYXBocWwgcXVlcnkgb2JqZWN0IHRvIGdldCBhIHRoZSBQUiAqL1xuICBjb25zdCBQUl9RVUVSWSA9IHBhcmFtcyhcbiAgICAgIHtcbiAgICAgICAgJG51bWJlcjogJ0ludCEnLCAgICAvLyBUaGUgUFIgbnVtYmVyXG4gICAgICAgICRvd25lcjogJ1N0cmluZyEnLCAgLy8gVGhlIG9yZ2FuaXphdGlvbiB0byBxdWVyeSBmb3JcbiAgICAgICAgJG5hbWU6ICdTdHJpbmchJywgICAvLyBUaGUgb3JnYW5pemF0aW9uIHRvIHF1ZXJ5IGZvclxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcmVwb3NpdG9yeTogcGFyYW1zKHtvd25lcjogJyRvd25lcicsIG5hbWU6ICckbmFtZSd9LCB7XG4gICAgICAgICAgcHVsbFJlcXVlc3Q6IHBhcmFtcyh7bnVtYmVyOiAnJG51bWJlcid9LCBwclNjaGVtYSksXG4gICAgICAgIH0pXG4gICAgICB9KTtcblxuICBjb25zdCByZXN1bHQgPSAoYXdhaXQgZ2l0LmdpdGh1Yi5ncmFwaHFsKFBSX1FVRVJZLCB7bnVtYmVyOiBwck51bWJlciwgb3duZXIsIG5hbWV9KSk7XG4gIHJldHVybiByZXN1bHQucmVwb3NpdG9yeS5wdWxsUmVxdWVzdDtcbn1cblxuLyoqIEdldCBhbGwgcGVuZGluZyBQUnMgZnJvbSBnaXRodWIgICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVuZGluZ1ByczxQclNjaGVtYT4ocHJTY2hlbWE6IFByU2NoZW1hLCBnaXQ6IEdpdENsaWVudDx0cnVlPikge1xuICAvKiogVGhlIG93bmVyIGFuZCBuYW1lIG9mIHRoZSByZXBvc2l0b3J5ICovXG4gIGNvbnN0IHtvd25lciwgbmFtZX0gPSBnaXQucmVtb3RlQ29uZmlnO1xuICAvKiogVGhlIEdyYXBocWwgcXVlcnkgb2JqZWN0IHRvIGdldCBhIHBhZ2Ugb2YgcGVuZGluZyBQUnMgKi9cbiAgY29uc3QgUFJTX1FVRVJZID0gcGFyYW1zKFxuICAgICAge1xuICAgICAgICAkZmlyc3Q6ICdJbnQnLCAgICAgIC8vIEhvdyBtYW55IGVudHJpZXMgdG8gZ2V0IHdpdGggZWFjaCByZXF1ZXN0XG4gICAgICAgICRhZnRlcjogJ1N0cmluZycsICAgLy8gVGhlIGN1cnNvciB0byBzdGFydCB0aGUgcGFnZSBhdFxuICAgICAgICAkb3duZXI6ICdTdHJpbmchJywgIC8vIFRoZSBvcmdhbml6YXRpb24gdG8gcXVlcnkgZm9yXG4gICAgICAgICRuYW1lOiAnU3RyaW5nIScsICAgLy8gVGhlIHJlcG9zaXRvcnkgdG8gcXVlcnkgZm9yXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICByZXBvc2l0b3J5OiBwYXJhbXMoe293bmVyOiAnJG93bmVyJywgbmFtZTogJyRuYW1lJ30sIHtcbiAgICAgICAgICBwdWxsUmVxdWVzdHM6IHBhcmFtcyhcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpcnN0OiAnJGZpcnN0JyxcbiAgICAgICAgICAgICAgICBhZnRlcjogJyRhZnRlcicsXG4gICAgICAgICAgICAgICAgc3RhdGVzOiBgT1BFTmAsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBub2RlczogW3ByU2NoZW1hXSxcbiAgICAgICAgICAgICAgICBwYWdlSW5mbzoge1xuICAgICAgICAgICAgICAgICAgaGFzTmV4dFBhZ2U6IHR5cGVzLmJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICBlbmRDdXJzb3I6IHR5cGVzLnN0cmluZyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAvKiogVGhlIGN1cnJlbnQgY3Vyc29yICovXG4gIGxldCBjdXJzb3I6IHN0cmluZ3x1bmRlZmluZWQ7XG4gIC8qKiBJZiBhbiBhZGRpdGlvbmFsIHBhZ2Ugb2YgbWVtYmVycyBpcyBleHBlY3RlZCAqL1xuICBsZXQgaGFzTmV4dFBhZ2UgPSB0cnVlO1xuICAvKiogQXJyYXkgb2YgcGVuZGluZyBQUnMgKi9cbiAgY29uc3QgcHJzOiBBcnJheTxQclNjaGVtYT4gPSBbXTtcblxuICAvLyBGb3IgZWFjaCBwYWdlIG9mIHRoZSByZXNwb25zZSwgZ2V0IHRoZSBwYWdlIGFuZCBhZGQgaXQgdG8gdGhlIGxpc3Qgb2YgUFJzXG4gIHdoaWxlIChoYXNOZXh0UGFnZSkge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIGFmdGVyOiBjdXJzb3IgfHwgbnVsbCxcbiAgICAgIGZpcnN0OiAxMDAsXG4gICAgICBvd25lcixcbiAgICAgIG5hbWUsXG4gICAgfTtcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgZ2l0LmdpdGh1Yi5ncmFwaHFsKFBSU19RVUVSWSwgcGFyYW1zKSBhcyB0eXBlb2YgUFJTX1FVRVJZO1xuICAgIHBycy5wdXNoKC4uLnJlc3VsdHMucmVwb3NpdG9yeS5wdWxsUmVxdWVzdHMubm9kZXMpO1xuICAgIGhhc05leHRQYWdlID0gcmVzdWx0cy5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0cy5wYWdlSW5mby5oYXNOZXh0UGFnZTtcbiAgICBjdXJzb3IgPSByZXN1bHRzLnJlcG9zaXRvcnkucHVsbFJlcXVlc3RzLnBhZ2VJbmZvLmVuZEN1cnNvcjtcbiAgfVxuICByZXR1cm4gcHJzO1xufVxuIl19