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
                            $name: 'String!',
                        }, {
                            repository: typed_graphqlify_1.params({ owner: '$owner', name: '$name' }, {
                                pullRequest: typed_graphqlify_1.params({ number: '$number' }, prSchema),
                            })
                        });
                        return [4 /*yield*/, git.github.graphql.query(PR_QUERY, { number: prNumber, owner: owner, name: name })];
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
                        return [4 /*yield*/, git.github.graphql.query(PRS_QUERY, params_1)];
                    case 2:
                        results = _b.sent();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdGh1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgscURBQStDO0lBSS9DLDRCQUE0QjtJQUM1QixTQUFzQixLQUFLLENBQVcsUUFBa0IsRUFBRSxRQUFnQixFQUFFLEdBQWM7Ozs7Ozt3QkFFbEYsS0FBZ0IsR0FBRyxDQUFDLFlBQVksRUFBL0IsS0FBSyxXQUFBLEVBQUUsSUFBSSxVQUFBLENBQXFCO3dCQUVqQyxRQUFRLEdBQUcseUJBQU0sQ0FDbkI7NEJBQ0UsT0FBTyxFQUFFLE1BQU07NEJBQ2YsTUFBTSxFQUFFLFNBQVM7NEJBQ2pCLEtBQUssRUFBRSxTQUFTO3lCQUNqQixFQUNEOzRCQUNFLFVBQVUsRUFBRSx5QkFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLEVBQUU7Z0NBQ25ELFdBQVcsRUFBRSx5QkFBTSxDQUFDLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBQyxFQUFFLFFBQVEsQ0FBQzs2QkFDbkQsQ0FBQzt5QkFDSCxDQUFDLENBQUM7d0JBRVMscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxPQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUMsQ0FBQyxFQUFBOzt3QkFBbkYsTUFBTSxHQUFHLENBQUMsU0FBeUUsQ0FBQzt3QkFDMUYsc0JBQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUM7Ozs7S0FDdEM7SUFsQkQsc0JBa0JDO0lBRUQsdUNBQXVDO0lBQ3ZDLFNBQXNCLGFBQWEsQ0FBVyxRQUFrQixFQUFFLEdBQWM7Ozs7Ozt3QkFFeEUsS0FBZ0IsR0FBRyxDQUFDLFlBQVksRUFBL0IsS0FBSyxXQUFBLEVBQUUsSUFBSSxVQUFBLENBQXFCO3dCQUVqQyxTQUFTLEdBQUcseUJBQU0sQ0FDcEI7NEJBQ0UsTUFBTSxFQUFFLEtBQUs7NEJBQ2IsTUFBTSxFQUFFLFFBQVE7NEJBQ2hCLE1BQU0sRUFBRSxTQUFTOzRCQUNqQixLQUFLLEVBQUUsU0FBUzt5QkFDakIsRUFDRDs0QkFDRSxVQUFVLEVBQUUseUJBQU0sQ0FBQyxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxFQUFFO2dDQUNuRCxZQUFZLEVBQUUseUJBQU0sQ0FDaEI7b0NBQ0UsS0FBSyxFQUFFLFFBQVE7b0NBQ2YsS0FBSyxFQUFFLFFBQVE7b0NBQ2YsTUFBTSxFQUFFLE1BQU07aUNBQ2YsRUFDRDtvQ0FDRSxLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUM7b0NBQ2pCLFFBQVEsRUFBRTt3Q0FDUixXQUFXLEVBQUUsd0JBQUssQ0FBQyxPQUFPO3dDQUMxQixTQUFTLEVBQUUsd0JBQUssQ0FBQyxNQUFNO3FDQUN4QjtpQ0FDRixDQUFDOzZCQUNQLENBQUM7eUJBQ0gsQ0FBQyxDQUFDO3dCQUlILFdBQVcsR0FBRyxJQUFJLENBQUM7d0JBRWpCLEdBQUcsR0FBb0IsRUFBRSxDQUFDOzs7NkJBR3pCLFdBQVc7d0JBQ1YsV0FBUzs0QkFDYixLQUFLLEVBQUUsTUFBTSxJQUFJLElBQUk7NEJBQ3JCLEtBQUssRUFBRSxHQUFHOzRCQUNWLEtBQUssT0FBQTs0QkFDTCxJQUFJLE1BQUE7eUJBQ0wsQ0FBQzt3QkFDYyxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFFBQU0sQ0FBQyxFQUFBOzt3QkFBM0QsT0FBTyxHQUFHLFNBQXFFO3dCQUNyRixHQUFHLENBQUMsSUFBSSxPQUFSLEdBQUcsbUJBQVMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFFO3dCQUNuRCxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQzt3QkFDbkUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7OzRCQUU5RCxzQkFBTyxHQUFHLEVBQUM7Ozs7S0FDWjtJQWpERCxzQ0FpREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwYXJhbXMsIHR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4vZ2l0JztcblxuLyoqIEdldCBhIFBSIGZyb20gZ2l0aHViICAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByPFByU2NoZW1hPihwclNjaGVtYTogUHJTY2hlbWEsIHByTnVtYmVyOiBudW1iZXIsIGdpdDogR2l0Q2xpZW50KSB7XG4gIC8qKiBUaGUgb3duZXIgYW5kIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkgKi9cbiAgY29uc3Qge293bmVyLCBuYW1lfSA9IGdpdC5yZW1vdGVDb25maWc7XG4gIC8qKiBUaGUgR3JhcGhRTCBxdWVyeSBvYmplY3QgdG8gZ2V0IGEgdGhlIFBSICovXG4gIGNvbnN0IFBSX1FVRVJZID0gcGFyYW1zKFxuICAgICAge1xuICAgICAgICAkbnVtYmVyOiAnSW50IScsICAgIC8vIFRoZSBQUiBudW1iZXJcbiAgICAgICAgJG93bmVyOiAnU3RyaW5nIScsICAvLyBUaGUgb3JnYW5pemF0aW9uIHRvIHF1ZXJ5IGZvclxuICAgICAgICAkbmFtZTogJ1N0cmluZyEnLCAgIC8vIFRoZSBvcmdhbml6YXRpb24gdG8gcXVlcnkgZm9yXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICByZXBvc2l0b3J5OiBwYXJhbXMoe293bmVyOiAnJG93bmVyJywgbmFtZTogJyRuYW1lJ30sIHtcbiAgICAgICAgICBwdWxsUmVxdWVzdDogcGFyYW1zKHtudW1iZXI6ICckbnVtYmVyJ30sIHByU2NoZW1hKSxcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuXG4gIGNvbnN0IHJlc3VsdCA9IChhd2FpdCBnaXQuZ2l0aHViLmdyYXBocWwucXVlcnkoUFJfUVVFUlksIHtudW1iZXI6IHByTnVtYmVyLCBvd25lciwgbmFtZX0pKTtcbiAgcmV0dXJuIHJlc3VsdC5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0O1xufVxuXG4vKiogR2V0IGFsbCBwZW5kaW5nIFBScyBmcm9tIGdpdGh1YiAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZW5kaW5nUHJzPFByU2NoZW1hPihwclNjaGVtYTogUHJTY2hlbWEsIGdpdDogR2l0Q2xpZW50KSB7XG4gIC8qKiBUaGUgb3duZXIgYW5kIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkgKi9cbiAgY29uc3Qge293bmVyLCBuYW1lfSA9IGdpdC5yZW1vdGVDb25maWc7XG4gIC8qKiBUaGUgR3JhcGhRTCBxdWVyeSBvYmplY3QgdG8gZ2V0IGEgcGFnZSBvZiBwZW5kaW5nIFBScyAqL1xuICBjb25zdCBQUlNfUVVFUlkgPSBwYXJhbXMoXG4gICAgICB7XG4gICAgICAgICRmaXJzdDogJ0ludCcsICAgICAgLy8gSG93IG1hbnkgZW50cmllcyB0byBnZXQgd2l0aCBlYWNoIHJlcXVlc3RcbiAgICAgICAgJGFmdGVyOiAnU3RyaW5nJywgICAvLyBUaGUgY3Vyc29yIHRvIHN0YXJ0IHRoZSBwYWdlIGF0XG4gICAgICAgICRvd25lcjogJ1N0cmluZyEnLCAgLy8gVGhlIG9yZ2FuaXphdGlvbiB0byBxdWVyeSBmb3JcbiAgICAgICAgJG5hbWU6ICdTdHJpbmchJywgICAvLyBUaGUgcmVwb3NpdG9yeSB0byBxdWVyeSBmb3JcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHJlcG9zaXRvcnk6IHBhcmFtcyh7b3duZXI6ICckb3duZXInLCBuYW1lOiAnJG5hbWUnfSwge1xuICAgICAgICAgIHB1bGxSZXF1ZXN0czogcGFyYW1zKFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmlyc3Q6ICckZmlyc3QnLFxuICAgICAgICAgICAgICAgIGFmdGVyOiAnJGFmdGVyJyxcbiAgICAgICAgICAgICAgICBzdGF0ZXM6IGBPUEVOYCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vZGVzOiBbcHJTY2hlbWFdLFxuICAgICAgICAgICAgICAgIHBhZ2VJbmZvOiB7XG4gICAgICAgICAgICAgICAgICBoYXNOZXh0UGFnZTogdHlwZXMuYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgIGVuZEN1cnNvcjogdHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICB9KVxuICAgICAgfSk7XG4gIC8qKiBUaGUgY3VycmVudCBjdXJzb3IgKi9cbiAgbGV0IGN1cnNvcjogc3RyaW5nfHVuZGVmaW5lZDtcbiAgLyoqIElmIGFuIGFkZGl0aW9uYWwgcGFnZSBvZiBtZW1iZXJzIGlzIGV4cGVjdGVkICovXG4gIGxldCBoYXNOZXh0UGFnZSA9IHRydWU7XG4gIC8qKiBBcnJheSBvZiBwZW5kaW5nIFBScyAqL1xuICBjb25zdCBwcnM6IEFycmF5PFByU2NoZW1hPiA9IFtdO1xuXG4gIC8vIEZvciBlYWNoIHBhZ2Ugb2YgdGhlIHJlc3BvbnNlLCBnZXQgdGhlIHBhZ2UgYW5kIGFkZCBpdCB0byB0aGUgbGlzdCBvZiBQUnNcbiAgd2hpbGUgKGhhc05leHRQYWdlKSB7XG4gICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgYWZ0ZXI6IGN1cnNvciB8fCBudWxsLFxuICAgICAgZmlyc3Q6IDEwMCxcbiAgICAgIG93bmVyLFxuICAgICAgbmFtZSxcbiAgICB9O1xuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBnaXQuZ2l0aHViLmdyYXBocWwucXVlcnkoUFJTX1FVRVJZLCBwYXJhbXMpIGFzIHR5cGVvZiBQUlNfUVVFUlk7XG4gICAgcHJzLnB1c2goLi4ucmVzdWx0cy5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0cy5ub2Rlcyk7XG4gICAgaGFzTmV4dFBhZ2UgPSByZXN1bHRzLnJlcG9zaXRvcnkucHVsbFJlcXVlc3RzLnBhZ2VJbmZvLmhhc05leHRQYWdlO1xuICAgIGN1cnNvciA9IHJlc3VsdHMucmVwb3NpdG9yeS5wdWxsUmVxdWVzdHMucGFnZUluZm8uZW5kQ3Vyc29yO1xuICB9XG4gIHJldHVybiBwcnM7XG59XG4iXX0=