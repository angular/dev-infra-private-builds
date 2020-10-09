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
    /**
     * Cap the returned issues in the queries to an arbitrary 100. At that point, caretaker has a lot
     * of work to do and showing more than that isn't really useful.
     */
    var MAX_RETURNED_ISSUES = 20;
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
                        console_1.info.group(console_1.bold("Github Tasks"));
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
                                first: MAX_RETURNED_ISSUES,
                                query: "\"" + repoFilter + " " + query.replace(/"/g, '\\"') + "\"",
                            }, {
                                issueCount: typed_graphqlify_1.types.number,
                                nodes: [tslib_1.__assign({}, typed_graphqlify_1.onUnion({
                                        PullRequest: {
                                            url: typed_graphqlify_1.types.string,
                                        },
                                        Issue: {
                                            url: typed_graphqlify_1.types.string,
                                        },
                                    }))],
                            });
                        });
                        return [4 /*yield*/, git.github.graphql.query(graphQlQuery)];
                    case 1:
                        results = _c.sent();
                        Object.values(results).forEach(function (result, i) {
                            var e_1, _a;
                            var _b, _c;
                            console_1.info(((_b = queries[i]) === null || _b === void 0 ? void 0 : _b.name.padEnd(25)) + " " + result.issueCount);
                            if (result.issueCount > 0) {
                                var _d = git.remoteConfig, owner = _d.owner, repo = _d.name;
                                var url = encodeURI("https://github.com/" + owner + "/" + repo + "/issues?q=" + ((_c = queries[i]) === null || _c === void 0 ? void 0 : _c.query));
                                console_1.info.group("" + url);
                                if (result.nodes.length === MAX_RETURNED_ISSUES && result.nodes.length < result.issueCount) {
                                    console_1.info("(first " + MAX_RETURNED_ISSUES + ")");
                                }
                                try {
                                    for (var _e = tslib_1.__values(result.nodes), _f = _e.next(); !_f.done; _f = _e.next()) {
                                        var node = _f.value;
                                        console_1.info("- " + node.url);
                                    }
                                }
                                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                finally {
                                    try {
                                        if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                                    }
                                    finally { if (e_1) throw e_1.error; }
                                }
                                console_1.info.groupEnd();
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jaGVjay9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHFEQUErRDtJQUUvRCxvRUFBc0Q7SUFJdEQ7OztPQUdHO0lBQ0gsSUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7SUFFL0Isb0VBQW9FO0lBQ3BFLFNBQXNCLGdCQUFnQixDQUFDLEdBQWMsRUFBRSxNQUF3Qjs7Ozs7O3dCQUM3RSxJQUFJLFFBQUMsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLGFBQWEsMENBQUUsTUFBTSxDQUFBLEVBQUU7NEJBQ2xDLGVBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDOzRCQUNuRSxzQkFBTzt5QkFDUjt3QkFDRCxjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxxQkFBTSxhQUFhLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFBOzt3QkFBaEMsU0FBZ0MsQ0FBQzt3QkFDakMsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNoQixjQUFJLEVBQUUsQ0FBQzs7Ozs7S0FDUjtJQVRELDRDQVNDO0lBRUQsNEVBQTRFO0lBQzVFLFNBQWUsYUFBYSxDQUFDLEdBQWMsRUFBRSxFQUE4QztZQUE3QyxxQkFBMkIsRUFBWixPQUFPLG1CQUFHLEVBQUUsS0FBQTs7Ozs7O3dCQUVqRSxZQUFZLEdBS2QsRUFBRSxDQUFDO3dCQUVELFVBQVUsR0FBRyxVQUFRLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxTQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBTSxDQUFDO3dCQUM3RSxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBYTtnQ0FBWixJQUFJLFVBQUEsRUFBRSxLQUFLLFdBQUE7NEJBQzNCLGdGQUFnRjs0QkFDaEYsSUFBTSxRQUFRLEdBQUcsd0JBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQzs0QkFDekQsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLHlCQUFNLENBQzNCO2dDQUNFLElBQUksRUFBRSxPQUFPO2dDQUNiLEtBQUssRUFBRSxtQkFBbUI7Z0NBQzFCLEtBQUssRUFBRSxPQUFJLFVBQVUsU0FBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsT0FBRzs2QkFDdkQsRUFDRDtnQ0FDRSxVQUFVLEVBQUUsd0JBQUssQ0FBQyxNQUFNO2dDQUN4QixLQUFLLEVBQUUsc0JBQUssMEJBQU8sQ0FBQzt3Q0FDbEIsV0FBVyxFQUFFOzRDQUNYLEdBQUcsRUFBRSx3QkFBSyxDQUFDLE1BQU07eUNBQ2xCO3dDQUNELEtBQUssRUFBRTs0Q0FDTCxHQUFHLEVBQUUsd0JBQUssQ0FBQyxNQUFNO3lDQUNsQjtxQ0FDRixDQUFDLEVBQUU7NkJBQ0wsQ0FDSixDQUFDO3dCQUNKLENBQUMsQ0FBQyxDQUFDO3dCQUVhLHFCQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBQTs7d0JBQXRELE9BQU8sR0FBRyxTQUE0Qzt3QkFDNUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUUsQ0FBQzs7OzRCQUN2QyxjQUFJLENBQUMsT0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLDBDQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxXQUFLLE1BQU0sQ0FBQyxVQUFZLENBQUMsQ0FBQzs0QkFDNUQsSUFBSSxNQUFNLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRTtnQ0FDbkIsSUFBQSxLQUFzQixHQUFHLENBQUMsWUFBWSxFQUFyQyxLQUFLLFdBQUEsRUFBUSxJQUFJLFVBQW9CLENBQUM7Z0NBQzdDLElBQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyx3QkFBc0IsS0FBSyxTQUFJLElBQUkseUJBQWEsT0FBTyxDQUFDLENBQUMsQ0FBQywwQ0FBRSxLQUFLLENBQUUsQ0FBQyxDQUFDO2dDQUMzRixjQUFJLENBQUMsS0FBSyxDQUFDLEtBQUcsR0FBSyxDQUFDLENBQUM7Z0NBQ3JCLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssbUJBQW1CLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRTtvQ0FDMUYsY0FBSSxDQUFDLFlBQVUsbUJBQW1CLE1BQUcsQ0FBQyxDQUFDO2lDQUN4Qzs7b0NBQ0QsS0FBbUIsSUFBQSxLQUFBLGlCQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUEsZ0JBQUEsNEJBQUU7d0NBQTVCLElBQU0sSUFBSSxXQUFBO3dDQUNiLGNBQUksQ0FBQyxPQUFLLElBQUksQ0FBQyxHQUFLLENBQUMsQ0FBQztxQ0FDdkI7Ozs7Ozs7OztnQ0FDRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7NkJBQ2pCO3dCQUNILENBQUMsQ0FBQyxDQUFDOzs7OztLQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YWxpYXMsIG9uVW5pb24sIHBhcmFtcywgdHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2JvbGQsIGRlYnVnLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuaW1wb3J0IHtDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbi8qKlxuICogQ2FwIHRoZSByZXR1cm5lZCBpc3N1ZXMgaW4gdGhlIHF1ZXJpZXMgdG8gYW4gYXJiaXRyYXJ5IDEwMC4gQXQgdGhhdCBwb2ludCwgY2FyZXRha2VyIGhhcyBhIGxvdFxuICogb2Ygd29yayB0byBkbyBhbmQgc2hvd2luZyBtb3JlIHRoYW4gdGhhdCBpc24ndCByZWFsbHkgdXNlZnVsLlxuICovXG5jb25zdCBNQVhfUkVUVVJORURfSVNTVUVTID0gMjA7XG5cbi8qKiBSZXRyaWV2ZSB0aGUgbnVtYmVyIG9mIG1hdGNoaW5nIGlzc3VlcyBmb3IgZWFjaCBnaXRodWIgcXVlcnkuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJpbnRHaXRodWJUYXNrcyhnaXQ6IEdpdENsaWVudCwgY29uZmlnPzogQ2FyZXRha2VyQ29uZmlnKSB7XG4gIGlmICghY29uZmlnPy5naXRodWJRdWVyaWVzPy5sZW5ndGgpIHtcbiAgICBkZWJ1ZygnTm8gZ2l0aHViIHF1ZXJpZXMgZGVmaW5lZCBpbiB0aGUgY29uZmlndXJhdGlvbiwgc2tpcHBpbmcuJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGluZm8uZ3JvdXAoYm9sZChgR2l0aHViIFRhc2tzYCkpO1xuICBhd2FpdCBnZXRHaXRodWJJbmZvKGdpdCwgY29uZmlnKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBpbmZvKCk7XG59XG5cbi8qKiBSZXRyaWV2ZSBxdWVyeSBtYXRjaCBjb3VudHMgYW5kIGxvZyBkaXNjb3ZlcmVkIGNvdW50cyB0byB0aGUgY29uc29sZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEdpdGh1YkluZm8oZ2l0OiBHaXRDbGllbnQsIHtnaXRodWJRdWVyaWVzOiBxdWVyaWVzID0gW119OiBDYXJldGFrZXJDb25maWcpIHtcbiAgLyoqIFRoZSBxdWVyeSBvYmplY3QgZm9yIGdyYXBocWwuICovXG4gIGNvbnN0IGdyYXBoUWxRdWVyeToge1xuICAgIFtrZXk6IHN0cmluZ106IHtcbiAgICAgIGlzc3VlQ291bnQ6IG51bWJlcixcbiAgICAgIG5vZGVzOiBBcnJheTx7dXJsOiBzdHJpbmd9PixcbiAgICB9XG4gIH0gPSB7fTtcbiAgLyoqIFRoZSBHaXRodWIgc2VhcmNoIGZpbHRlciBmb3IgdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgY29uc3QgcmVwb0ZpbHRlciA9IGByZXBvOiR7Z2l0LnJlbW90ZUNvbmZpZy5vd25lcn0vJHtnaXQucmVtb3RlQ29uZmlnLm5hbWV9YDtcbiAgcXVlcmllcy5mb3JFYWNoKCh7bmFtZSwgcXVlcnl9KSA9PiB7XG4gICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBxdWVyeSwgd2l0aCBzcGFjZXMgcmVtb3ZlZCB0byBtYXRjaCBHcmFwaFFMIHJlcXVpcmVtZW50cy4gKi9cbiAgICBjb25zdCBxdWVyeUtleSA9IGFsaWFzKG5hbWUucmVwbGFjZSgvIC9nLCAnJyksICdzZWFyY2gnKTtcbiAgICBncmFwaFFsUXVlcnlbcXVlcnlLZXldID0gcGFyYW1zKFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ0lTU1VFJyxcbiAgICAgICAgICBmaXJzdDogTUFYX1JFVFVSTkVEX0lTU1VFUyxcbiAgICAgICAgICBxdWVyeTogYFwiJHtyZXBvRmlsdGVyfSAke3F1ZXJ5LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cImAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpc3N1ZUNvdW50OiB0eXBlcy5udW1iZXIsXG4gICAgICAgICAgbm9kZXM6IFt7Li4ub25Vbmlvbih7XG4gICAgICAgICAgICBQdWxsUmVxdWVzdDoge1xuICAgICAgICAgICAgICB1cmw6IHR5cGVzLnN0cmluZyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBJc3N1ZToge1xuICAgICAgICAgICAgICB1cmw6IHR5cGVzLnN0cmluZyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSl9XSxcbiAgICAgICAgfSxcbiAgICApO1xuICB9KTtcbiAgLyoqIFRoZSByZXN1bHRzIG9mIHRoZSBnZW5lcmF0ZWQgZ2l0aHViIHF1ZXJ5LiAqL1xuICBjb25zdCByZXN1bHRzID0gYXdhaXQgZ2l0LmdpdGh1Yi5ncmFwaHFsLnF1ZXJ5KGdyYXBoUWxRdWVyeSk7XG4gIE9iamVjdC52YWx1ZXMocmVzdWx0cykuZm9yRWFjaCgocmVzdWx0LCBpKSA9PiB7XG4gICAgaW5mbyhgJHtxdWVyaWVzW2ldPy5uYW1lLnBhZEVuZCgyNSl9ICR7cmVzdWx0Lmlzc3VlQ291bnR9YCk7XG4gICAgaWYgKHJlc3VsdC5pc3N1ZUNvdW50ID4gMCkge1xuICAgICAgY29uc3Qge293bmVyLCBuYW1lOiByZXBvfSA9IGdpdC5yZW1vdGVDb25maWc7XG4gICAgICBjb25zdCB1cmwgPSBlbmNvZGVVUkkoYGh0dHBzOi8vZ2l0aHViLmNvbS8ke293bmVyfS8ke3JlcG99L2lzc3Vlcz9xPSR7cXVlcmllc1tpXT8ucXVlcnl9YCk7XG4gICAgICBpbmZvLmdyb3VwKGAke3VybH1gKTtcbiAgICAgIGlmIChyZXN1bHQubm9kZXMubGVuZ3RoID09PSBNQVhfUkVUVVJORURfSVNTVUVTICYmIHJlc3VsdC5ub2Rlcy5sZW5ndGggPCByZXN1bHQuaXNzdWVDb3VudCkge1xuICAgICAgICBpbmZvKGAoZmlyc3QgJHtNQVhfUkVUVVJORURfSVNTVUVTfSlgKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiByZXN1bHQubm9kZXMpIHtcbiAgICAgICAgaW5mbyhgLSAke25vZGUudXJsfWApO1xuICAgICAgfVxuICAgICAgaW5mby5ncm91cEVuZCgpO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=