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
        define("@angular/dev-infra-private/caretaker/check/github", ["require", "exports", "tslib", "typed-graphqlify", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printGithubTasks = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /** Retrieve the number of matching issues for each github query. */
    function printGithubTasks(git, config) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!((_a = config === null || config === void 0 ? void 0 : config.githubQueries) === null || _a === void 0 ? void 0 : _a.length)) {
                            console_1.debug('No github queries defined in the configuration, skipping.');
                            return [2 /*return*/];
                        }
                        console_1.info.group(console_1.bold('Github Tasks'));
                        return [4 /*yield*/, getGithubInfo(git, config)];
                    case 1:
                        _b.sent();
                        console_1.info.groupEnd();
                        console_1.info();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.printGithubTasks = printGithubTasks;
    /** Retrieve query match counts and log discovered counts to the console. */
    function getGithubInfo(git, _a) {
        var _b = _a.githubQueries, queries = _b === void 0 ? [] : _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var graphQlQuery, repoFilter, results;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        graphQlQuery = {};
                        repoFilter = "repo:" + git.remoteConfig.owner + "/" + git.remoteConfig.name;
                        queries.forEach(function (_a) {
                            var name = _a.name, query = _a.query;
                            /** The name of the query, with spaces removed to match GraphQL requirements. */
                            var queryKey = typed_graphqlify_1.alias(name.replace(/ /g, ''), 'search');
                            graphQlQuery[queryKey] = typed_graphqlify_1.params({
                                type: 'ISSUE',
                                query: "\"" + repoFilter + " " + query.replace(/"/g, '\\"') + "\"",
                            }, { issueCount: typed_graphqlify_1.types.number });
                        });
                        return [4 /*yield*/, git.github.graphql.query(graphQlQuery)];
                    case 1:
                        results = _c.sent();
                        Object.values(results).forEach(function (result, i) {
                            var _a;
                            console_1.info(((_a = queries[i]) === null || _a === void 0 ? void 0 : _a.name.padEnd(25)) + " " + result.issueCount);
                        });
                        return [2 /*return*/];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jaGVjay9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHFEQUFzRDtJQUV0RCxvRUFBc0Q7SUFLdEQsb0VBQW9FO0lBQ3BFLFNBQXNCLGdCQUFnQixDQUFDLEdBQWMsRUFBRSxNQUF3Qjs7Ozs7O3dCQUM3RSxJQUFJLFFBQUMsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLGFBQWEsMENBQUUsTUFBTSxDQUFBLEVBQUU7NEJBQ2xDLGVBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDOzRCQUNuRSxzQkFBTzt5QkFDUjt3QkFDRCxjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxxQkFBTSxhQUFhLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFBOzt3QkFBaEMsU0FBZ0MsQ0FBQzt3QkFDakMsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNoQixjQUFJLEVBQUUsQ0FBQzs7Ozs7S0FDUjtJQVRELDRDQVNDO0lBRUQsNEVBQTRFO0lBQzVFLFNBQWUsYUFBYSxDQUFDLEdBQWMsRUFBRSxFQUE4QztZQUE3QyxxQkFBMkIsRUFBWixPQUFPLG1CQUFHLEVBQUUsS0FBQTs7Ozs7O3dCQUVqRSxZQUFZLEdBQTBDLEVBQUUsQ0FBQzt3QkFFekQsVUFBVSxHQUFHLFVBQVEsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFNLENBQUM7d0JBQzdFLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFhO2dDQUFaLElBQUksVUFBQSxFQUFFLEtBQUssV0FBQTs0QkFDM0IsZ0ZBQWdGOzRCQUNoRixJQUFNLFFBQVEsR0FBRyx3QkFBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUN6RCxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcseUJBQU0sQ0FDM0I7Z0NBQ0UsSUFBSSxFQUFFLE9BQU87Z0NBQ2IsS0FBSyxFQUFFLE9BQUksVUFBVSxTQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFHOzZCQUN2RCxFQUNELEVBQUMsVUFBVSxFQUFFLHdCQUFLLENBQUMsTUFBTSxFQUFDLENBQzdCLENBQUM7d0JBQ0osQ0FBQyxDQUFDLENBQUM7d0JBRWEscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFBOzt3QkFBdEQsT0FBTyxHQUFHLFNBQTRDO3dCQUM1RCxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDOzs0QkFDdkMsY0FBSSxDQUFDLE9BQUcsT0FBTyxDQUFDLENBQUMsQ0FBQywwQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsV0FBSyxNQUFNLENBQUMsVUFBWSxDQUFDLENBQUM7d0JBQzlELENBQUMsQ0FBQyxDQUFDOzs7OztLQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YWxpYXMsIHBhcmFtcywgdHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2JvbGQsIGRlYnVnLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuaW1wb3J0IHtDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cblxuLyoqIFJldHJpZXZlIHRoZSBudW1iZXIgb2YgbWF0Y2hpbmcgaXNzdWVzIGZvciBlYWNoIGdpdGh1YiBxdWVyeS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmludEdpdGh1YlRhc2tzKGdpdDogR2l0Q2xpZW50LCBjb25maWc/OiBDYXJldGFrZXJDb25maWcpIHtcbiAgaWYgKCFjb25maWc/LmdpdGh1YlF1ZXJpZXM/Lmxlbmd0aCkge1xuICAgIGRlYnVnKCdObyBnaXRodWIgcXVlcmllcyBkZWZpbmVkIGluIHRoZSBjb25maWd1cmF0aW9uLCBza2lwcGluZy4nKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5mby5ncm91cChib2xkKCdHaXRodWIgVGFza3MnKSk7XG4gIGF3YWl0IGdldEdpdGh1YkluZm8oZ2l0LCBjb25maWcpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGluZm8oKTtcbn1cblxuLyoqIFJldHJpZXZlIHF1ZXJ5IG1hdGNoIGNvdW50cyBhbmQgbG9nIGRpc2NvdmVyZWQgY291bnRzIHRvIHRoZSBjb25zb2xlLiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0R2l0aHViSW5mbyhnaXQ6IEdpdENsaWVudCwge2dpdGh1YlF1ZXJpZXM6IHF1ZXJpZXMgPSBbXX06IENhcmV0YWtlckNvbmZpZykge1xuICAvKiogVGhlIHF1ZXJ5IG9iamVjdCBmb3IgZ3JhcGhxbC4gKi9cbiAgY29uc3QgZ3JhcGhRbFF1ZXJ5OiB7W2tleTogc3RyaW5nXToge2lzc3VlQ291bnQ6IG51bWJlcn19ID0ge307XG4gIC8qKiBUaGUgR2l0aHViIHNlYXJjaCBmaWx0ZXIgZm9yIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gIGNvbnN0IHJlcG9GaWx0ZXIgPSBgcmVwbzoke2dpdC5yZW1vdGVDb25maWcub3duZXJ9LyR7Z2l0LnJlbW90ZUNvbmZpZy5uYW1lfWA7XG4gIHF1ZXJpZXMuZm9yRWFjaCgoe25hbWUsIHF1ZXJ5fSkgPT4ge1xuICAgIC8qKiBUaGUgbmFtZSBvZiB0aGUgcXVlcnksIHdpdGggc3BhY2VzIHJlbW92ZWQgdG8gbWF0Y2ggR3JhcGhRTCByZXF1aXJlbWVudHMuICovXG4gICAgY29uc3QgcXVlcnlLZXkgPSBhbGlhcyhuYW1lLnJlcGxhY2UoLyAvZywgJycpLCAnc2VhcmNoJyk7XG4gICAgZ3JhcGhRbFF1ZXJ5W3F1ZXJ5S2V5XSA9IHBhcmFtcyhcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdJU1NVRScsXG4gICAgICAgICAgcXVlcnk6IGBcIiR7cmVwb0ZpbHRlcn0gJHtxdWVyeS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJgLFxuICAgICAgICB9LFxuICAgICAgICB7aXNzdWVDb3VudDogdHlwZXMubnVtYmVyfSxcbiAgICApO1xuICB9KTtcbiAgLyoqIFRoZSByZXN1bHRzIG9mIHRoZSBnZW5lcmF0ZWQgZ2l0aHViIHF1ZXJ5LiAqL1xuICBjb25zdCByZXN1bHRzID0gYXdhaXQgZ2l0LmdpdGh1Yi5ncmFwaHFsLnF1ZXJ5KGdyYXBoUWxRdWVyeSk7XG4gIE9iamVjdC52YWx1ZXMocmVzdWx0cykuZm9yRWFjaCgocmVzdWx0LCBpKSA9PiB7XG4gICAgaW5mbyhgJHtxdWVyaWVzW2ldPy5uYW1lLnBhZEVuZCgyNSl9ICR7cmVzdWx0Lmlzc3VlQ291bnR9YCk7XG4gIH0pO1xufVxuIl19