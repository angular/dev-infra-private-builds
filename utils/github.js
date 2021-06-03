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
        define("@angular/dev-infra-private/utils/github", ["require", "exports", "tslib", "typed-graphqlify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPendingPrs = exports.getPr = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    /** Get a PR from github  */
    function getPr(prSchema, prNumber, git) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, owner, name, PR_QUERY, result;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = git.remoteConfig, owner = _a.owner, name = _a.name;
                        PR_QUERY = typed_graphqlify_1.params({
                            $number: 'Int!',
                            $owner: 'String!',
                            $name: 'String!', // The organization to query for
                        }, {
                            repository: typed_graphqlify_1.params({ owner: '$owner', name: '$name' }, {
                                pullRequest: typed_graphqlify_1.params({ number: '$number' }, prSchema),
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
    exports.getPr = getPr;
    /** Get all pending PRs from github  */
    function getPendingPrs(prSchema, git) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, owner, name, PRS_QUERY, cursor, hasNextPage, prs, params_1, results;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = git.remoteConfig, owner = _a.owner, name = _a.name;
                        PRS_QUERY = typed_graphqlify_1.params({
                            $first: 'Int',
                            $after: 'String',
                            $owner: 'String!',
                            $name: 'String!', // The repository to query for
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
                        prs.push.apply(prs, tslib_1.__spreadArray([], tslib_1.__read(results.repository.pullRequests.nodes)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdGh1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgscURBQStDO0lBSS9DLDRCQUE0QjtJQUM1QixTQUFzQixLQUFLLENBQ3ZCLFFBQWtCLEVBQUUsUUFBZ0IsRUFBRSxHQUEyQjs7Ozs7O3dCQUU3RCxLQUFnQixHQUFHLENBQUMsWUFBWSxFQUEvQixLQUFLLFdBQUEsRUFBRSxJQUFJLFVBQUEsQ0FBcUI7d0JBRWpDLFFBQVEsR0FBRyx5QkFBTSxDQUNuQjs0QkFDRSxPQUFPLEVBQUUsTUFBTTs0QkFDZixNQUFNLEVBQUUsU0FBUzs0QkFDakIsS0FBSyxFQUFFLFNBQVMsRUFBSSxnQ0FBZ0M7eUJBQ3JELEVBQ0Q7NEJBQ0UsVUFBVSxFQUFFLHlCQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsRUFBRTtnQ0FDbkQsV0FBVyxFQUFFLHlCQUFNLENBQUMsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLEVBQUUsUUFBUSxDQUFDOzZCQUNuRCxDQUFDO3lCQUNILENBQUMsQ0FBQzt3QkFFUyxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssT0FBQSxFQUFFLElBQUksTUFBQSxFQUFDLENBQUMsRUFBQTs7d0JBQTdFLE1BQU0sR0FBRyxDQUFDLFNBQW1FLENBQUM7d0JBQ3BGLHNCQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFDOzs7O0tBQ3RDO0lBbkJELHNCQW1CQztJQUVELHVDQUF1QztJQUN2QyxTQUFzQixhQUFhLENBQVcsUUFBa0IsRUFBRSxHQUEyQjs7Ozs7O3dCQUVyRixLQUFnQixHQUFHLENBQUMsWUFBWSxFQUEvQixLQUFLLFdBQUEsRUFBRSxJQUFJLFVBQUEsQ0FBcUI7d0JBRWpDLFNBQVMsR0FBRyx5QkFBTSxDQUNwQjs0QkFDRSxNQUFNLEVBQUUsS0FBSzs0QkFDYixNQUFNLEVBQUUsUUFBUTs0QkFDaEIsTUFBTSxFQUFFLFNBQVM7NEJBQ2pCLEtBQUssRUFBRSxTQUFTLEVBQUksOEJBQThCO3lCQUNuRCxFQUNEOzRCQUNFLFVBQVUsRUFBRSx5QkFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLEVBQUU7Z0NBQ25ELFlBQVksRUFBRSx5QkFBTSxDQUNoQjtvQ0FDRSxLQUFLLEVBQUUsUUFBUTtvQ0FDZixLQUFLLEVBQUUsUUFBUTtvQ0FDZixNQUFNLEVBQUUsTUFBTTtpQ0FDZixFQUNEO29DQUNFLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQztvQ0FDakIsUUFBUSxFQUFFO3dDQUNSLFdBQVcsRUFBRSx3QkFBSyxDQUFDLE9BQU87d0NBQzFCLFNBQVMsRUFBRSx3QkFBSyxDQUFDLE1BQU07cUNBQ3hCO2lDQUNGLENBQUM7NkJBQ1AsQ0FBQzt5QkFDSCxDQUFDLENBQUM7d0JBSUgsV0FBVyxHQUFHLElBQUksQ0FBQzt3QkFFakIsR0FBRyxHQUFvQixFQUFFLENBQUM7Ozs2QkFHekIsV0FBVzt3QkFDVixXQUFTOzRCQUNiLEtBQUssRUFBRSxNQUFNLElBQUksSUFBSTs0QkFDckIsS0FBSyxFQUFFLEdBQUc7NEJBQ1YsS0FBSyxPQUFBOzRCQUNMLElBQUksTUFBQTt5QkFDTCxDQUFDO3dCQUNjLHFCQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFNLENBQUMsRUFBQTs7d0JBQXJELE9BQU8sR0FBRyxTQUErRDt3QkFDL0UsR0FBRyxDQUFDLElBQUksT0FBUixHQUFHLDJDQUFTLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssSUFBRTt3QkFDbkQsV0FBVyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7d0JBQ25FLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDOzs0QkFFOUQsc0JBQU8sR0FBRyxFQUFDOzs7O0tBQ1o7SUFqREQsc0NBaURDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4vZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5cblxuLyoqIEdldCBhIFBSIGZyb20gZ2l0aHViICAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByPFByU2NoZW1hPihcbiAgICBwclNjaGVtYTogUHJTY2hlbWEsIHByTnVtYmVyOiBudW1iZXIsIGdpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCkge1xuICAvKiogVGhlIG93bmVyIGFuZCBuYW1lIG9mIHRoZSByZXBvc2l0b3J5ICovXG4gIGNvbnN0IHtvd25lciwgbmFtZX0gPSBnaXQucmVtb3RlQ29uZmlnO1xuICAvKiogVGhlIEdyYXBocWwgcXVlcnkgb2JqZWN0IHRvIGdldCBhIHRoZSBQUiAqL1xuICBjb25zdCBQUl9RVUVSWSA9IHBhcmFtcyhcbiAgICAgIHtcbiAgICAgICAgJG51bWJlcjogJ0ludCEnLCAgICAvLyBUaGUgUFIgbnVtYmVyXG4gICAgICAgICRvd25lcjogJ1N0cmluZyEnLCAgLy8gVGhlIG9yZ2FuaXphdGlvbiB0byBxdWVyeSBmb3JcbiAgICAgICAgJG5hbWU6ICdTdHJpbmchJywgICAvLyBUaGUgb3JnYW5pemF0aW9uIHRvIHF1ZXJ5IGZvclxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcmVwb3NpdG9yeTogcGFyYW1zKHtvd25lcjogJyRvd25lcicsIG5hbWU6ICckbmFtZSd9LCB7XG4gICAgICAgICAgcHVsbFJlcXVlc3Q6IHBhcmFtcyh7bnVtYmVyOiAnJG51bWJlcid9LCBwclNjaGVtYSksXG4gICAgICAgIH0pXG4gICAgICB9KTtcblxuICBjb25zdCByZXN1bHQgPSAoYXdhaXQgZ2l0LmdpdGh1Yi5ncmFwaHFsKFBSX1FVRVJZLCB7bnVtYmVyOiBwck51bWJlciwgb3duZXIsIG5hbWV9KSk7XG4gIHJldHVybiByZXN1bHQucmVwb3NpdG9yeS5wdWxsUmVxdWVzdDtcbn1cblxuLyoqIEdldCBhbGwgcGVuZGluZyBQUnMgZnJvbSBnaXRodWIgICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVuZGluZ1ByczxQclNjaGVtYT4ocHJTY2hlbWE6IFByU2NoZW1hLCBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQpIHtcbiAgLyoqIFRoZSBvd25lciBhbmQgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeSAqL1xuICBjb25zdCB7b3duZXIsIG5hbWV9ID0gZ2l0LnJlbW90ZUNvbmZpZztcbiAgLyoqIFRoZSBHcmFwaHFsIHF1ZXJ5IG9iamVjdCB0byBnZXQgYSBwYWdlIG9mIHBlbmRpbmcgUFJzICovXG4gIGNvbnN0IFBSU19RVUVSWSA9IHBhcmFtcyhcbiAgICAgIHtcbiAgICAgICAgJGZpcnN0OiAnSW50JywgICAgICAvLyBIb3cgbWFueSBlbnRyaWVzIHRvIGdldCB3aXRoIGVhY2ggcmVxdWVzdFxuICAgICAgICAkYWZ0ZXI6ICdTdHJpbmcnLCAgIC8vIFRoZSBjdXJzb3IgdG8gc3RhcnQgdGhlIHBhZ2UgYXRcbiAgICAgICAgJG93bmVyOiAnU3RyaW5nIScsICAvLyBUaGUgb3JnYW5pemF0aW9uIHRvIHF1ZXJ5IGZvclxuICAgICAgICAkbmFtZTogJ1N0cmluZyEnLCAgIC8vIFRoZSByZXBvc2l0b3J5IHRvIHF1ZXJ5IGZvclxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcmVwb3NpdG9yeTogcGFyYW1zKHtvd25lcjogJyRvd25lcicsIG5hbWU6ICckbmFtZSd9LCB7XG4gICAgICAgICAgcHVsbFJlcXVlc3RzOiBwYXJhbXMoXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaXJzdDogJyRmaXJzdCcsXG4gICAgICAgICAgICAgICAgYWZ0ZXI6ICckYWZ0ZXInLFxuICAgICAgICAgICAgICAgIHN0YXRlczogYE9QRU5gLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbm9kZXM6IFtwclNjaGVtYV0sXG4gICAgICAgICAgICAgICAgcGFnZUluZm86IHtcbiAgICAgICAgICAgICAgICAgIGhhc05leHRQYWdlOiB0eXBlcy5ib29sZWFuLFxuICAgICAgICAgICAgICAgICAgZW5kQ3Vyc29yOiB0eXBlcy5zdHJpbmcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgLyoqIFRoZSBjdXJyZW50IGN1cnNvciAqL1xuICBsZXQgY3Vyc29yOiBzdHJpbmd8dW5kZWZpbmVkO1xuICAvKiogSWYgYW4gYWRkaXRpb25hbCBwYWdlIG9mIG1lbWJlcnMgaXMgZXhwZWN0ZWQgKi9cbiAgbGV0IGhhc05leHRQYWdlID0gdHJ1ZTtcbiAgLyoqIEFycmF5IG9mIHBlbmRpbmcgUFJzICovXG4gIGNvbnN0IHByczogQXJyYXk8UHJTY2hlbWE+ID0gW107XG5cbiAgLy8gRm9yIGVhY2ggcGFnZSBvZiB0aGUgcmVzcG9uc2UsIGdldCB0aGUgcGFnZSBhbmQgYWRkIGl0IHRvIHRoZSBsaXN0IG9mIFBSc1xuICB3aGlsZSAoaGFzTmV4dFBhZ2UpIHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBhZnRlcjogY3Vyc29yIHx8IG51bGwsXG4gICAgICBmaXJzdDogMTAwLFxuICAgICAgb3duZXIsXG4gICAgICBuYW1lLFxuICAgIH07XG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGdpdC5naXRodWIuZ3JhcGhxbChQUlNfUVVFUlksIHBhcmFtcykgYXMgdHlwZW9mIFBSU19RVUVSWTtcbiAgICBwcnMucHVzaCguLi5yZXN1bHRzLnJlcG9zaXRvcnkucHVsbFJlcXVlc3RzLm5vZGVzKTtcbiAgICBoYXNOZXh0UGFnZSA9IHJlc3VsdHMucmVwb3NpdG9yeS5wdWxsUmVxdWVzdHMucGFnZUluZm8uaGFzTmV4dFBhZ2U7XG4gICAgY3Vyc29yID0gcmVzdWx0cy5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0cy5wYWdlSW5mby5lbmRDdXJzb3I7XG4gIH1cbiAgcmV0dXJuIHBycztcbn1cbiJdfQ==