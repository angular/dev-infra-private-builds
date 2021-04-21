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
        define("@angular/dev-infra-private/caretaker/check/github", ["require", "exports", "tslib", "typed-graphqlify", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/caretaker/check/base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GithubQueriesModule = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var base_1 = require("@angular/dev-infra-private/caretaker/check/base");
    /** The fragment for a result from Github's api for a Github query. */
    var GithubQueryResultFragment = {
        issueCount: typed_graphqlify_1.types.number,
        nodes: [tslib_1.__assign({}, typed_graphqlify_1.onUnion({
                PullRequest: {
                    url: typed_graphqlify_1.types.string,
                },
                Issue: {
                    url: typed_graphqlify_1.types.string,
                },
            }))],
    };
    /**
     * Cap the returned issues in the queries to an arbitrary 20. At that point, caretaker has a lot
     * of work to do and showing more than that isn't really useful.
     */
    var MAX_RETURNED_ISSUES = 20;
    var GithubQueriesModule = /** @class */ (function (_super) {
        tslib_1.__extends(GithubQueriesModule, _super);
        function GithubQueriesModule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        GithubQueriesModule.prototype.retrieveData = function () {
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var queries, queryResult, results, _b, owner, repo;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            queries = (_a = this.config.caretaker) === null || _a === void 0 ? void 0 : _a.githubQueries;
                            if (queries === undefined || queries.length === 0) {
                                console_1.debug('No github queries defined in the configuration, skipping');
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.git.github.graphql(this.buildGraphqlQuery(queries))];
                        case 1:
                            queryResult = _c.sent();
                            results = Object.values(queryResult);
                            _b = this.git.remoteConfig, owner = _b.owner, repo = _b.name;
                            return [2 /*return*/, results.map(function (result, i) {
                                    return {
                                        queryName: queries[i].name,
                                        count: result.issueCount,
                                        queryUrl: encodeURI("https://github.com/" + owner + "/" + repo + "/issues?q=" + queries[i].query),
                                        matchedUrls: result.nodes.map(function (node) { return node.url; })
                                    };
                                })];
                    }
                });
            });
        };
        /** Build a Graphql query statement for the provided queries. */
        GithubQueriesModule.prototype.buildGraphqlQuery = function (queries) {
            /** The query object for graphql. */
            var graphqlQuery = {};
            var _a = this.git.remoteConfig, owner = _a.owner, repo = _a.name;
            /** The Github search filter for the configured repository. */
            var repoFilter = "repo:" + owner + "/" + repo;
            queries.forEach(function (_a) {
                var name = _a.name, query = _a.query;
                /** The name of the query, with spaces removed to match Graphql requirements. */
                var queryKey = typed_graphqlify_1.alias(name.replace(/ /g, ''), 'search');
                graphqlQuery[queryKey] = typed_graphqlify_1.params({
                    type: 'ISSUE',
                    first: MAX_RETURNED_ISSUES,
                    query: "\"" + repoFilter + " " + query.replace(/"/g, '\\"') + "\"",
                }, tslib_1.__assign({}, GithubQueryResultFragment));
            });
            return graphqlQuery;
        };
        GithubQueriesModule.prototype.printToTerminal = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var queryResults, minQueryNameLength, queryResults_1, queryResults_1_1, queryResult;
                var e_1, _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.data];
                        case 1:
                            queryResults = _b.sent();
                            if (!queryResults) {
                                return [2 /*return*/];
                            }
                            console_1.info.group(console_1.bold('Github Tasks'));
                            minQueryNameLength = Math.max.apply(Math, tslib_1.__spreadArray([], tslib_1.__read(queryResults.map(function (result) { return result.queryName.length; }))));
                            try {
                                for (queryResults_1 = tslib_1.__values(queryResults), queryResults_1_1 = queryResults_1.next(); !queryResults_1_1.done; queryResults_1_1 = queryResults_1.next()) {
                                    queryResult = queryResults_1_1.value;
                                    console_1.info(queryResult.queryName.padEnd(minQueryNameLength) + "  " + queryResult.count);
                                    if (queryResult.count > 0) {
                                        console_1.info.group(queryResult.queryUrl);
                                        queryResult.matchedUrls.forEach(function (url) { return console_1.info("- " + url); });
                                        if (queryResult.count > MAX_RETURNED_ISSUES) {
                                            console_1.info("... " + (queryResult.count - MAX_RETURNED_ISSUES) + " additional matches");
                                        }
                                        console_1.info.groupEnd();
                                    }
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (queryResults_1_1 && !queryResults_1_1.done && (_a = queryResults_1.return)) _a.call(queryResults_1);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                            console_1.info.groupEnd();
                            console_1.info();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return GithubQueriesModule;
    }(base_1.BaseModule));
    exports.GithubQueriesModule = GithubQueriesModule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jaGVjay9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHFEQUErRDtJQUUvRCxvRUFBc0Q7SUFFdEQsd0VBQWtDO0lBVWxDLHNFQUFzRTtJQUN0RSxJQUFNLHlCQUF5QixHQUFHO1FBQ2hDLFVBQVUsRUFBRSx3QkFBSyxDQUFDLE1BQU07UUFDeEIsS0FBSyxFQUFFLHNCQUFLLDBCQUFPLENBQUM7Z0JBQ2xCLFdBQVcsRUFBRTtvQkFDWCxHQUFHLEVBQUUsd0JBQUssQ0FBQyxNQUFNO2lCQUNsQjtnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsR0FBRyxFQUFFLHdCQUFLLENBQUMsTUFBTTtpQkFDbEI7YUFDRixDQUFDLEVBQUU7S0FDTCxDQUFDO0lBT0Y7OztPQUdHO0lBQ0gsSUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7SUFFL0I7UUFBeUMsK0NBQW1DO1FBQTVFOztRQXlFQSxDQUFDO1FBeEVPLDBDQUFZLEdBQWxCOzs7Ozs7OzRCQUlNLE9BQU8sR0FBRyxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUywwQ0FBRSxhQUFjLENBQUM7NEJBQ3BELElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQ0FDakQsZUFBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7Z0NBQ2xFLHNCQUFPOzZCQUNSOzRCQUdtQixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUE7OzRCQUE1RSxXQUFXLEdBQUcsU0FBOEQ7NEJBQzVFLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUVy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QyxjQUFJLENBQUMsVUFBTyxXQUFXLENBQUMsS0FBSyxHQUFHLG1CQUFtQix5QkFBcUIsQ0FBQyxDQUFDO3lDQUMzRTt3Q0FDRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7cUNBQ2pCO2lDQUNGOzs7Ozs7Ozs7NEJBQ0QsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUNoQixjQUFJLEVBQUUsQ0FBQzs7Ozs7U0FDUjtRQUNILDBCQUFDO0lBQUQsQ0FBQyxBQXpFRCxDQUF5QyxpQkFBVSxHQXlFbEQ7SUF6RVksa0RBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YWxpYXMsIG9uVW5pb24sIHBhcmFtcywgdHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2JvbGQsIGRlYnVnLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Q2FyZXRha2VyQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtCYXNlTW9kdWxlfSBmcm9tICcuL2Jhc2UnO1xuXG4vKiogQSBsaXN0IG9mIGdlbmVyYXRlZCByZXN1bHRzIGZvciBhIGdpdGh1YiBxdWVyeS4gKi9cbnR5cGUgR2l0aHViUXVlcnlSZXN1bHRzID0ge1xuICBxdWVyeU5hbWU6IHN0cmluZyxcbiAgY291bnQ6IG51bWJlcixcbiAgcXVlcnlVcmw6IHN0cmluZyxcbiAgbWF0Y2hlZFVybHM6IHN0cmluZ1tdLFxufVtdO1xuXG4vKiogVGhlIGZyYWdtZW50IGZvciBhIHJlc3VsdCBmcm9tIEdpdGh1YidzIGFwaSBmb3IgYSBHaXRodWIgcXVlcnkuICovXG5jb25zdCBHaXRodWJRdWVyeVJlc3VsdEZyYWdtZW50ID0ge1xuICBpc3N1ZUNvdW50OiB0eXBlcy5udW1iZXIsXG4gIG5vZGVzOiBbey4uLm9uVW5pb24oe1xuICAgIFB1bGxSZXF1ZXN0OiB7XG4gICAgICB1cmw6IHR5cGVzLnN0cmluZyxcbiAgICB9LFxuICAgIElzc3VlOiB7XG4gICAgICB1cmw6IHR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9KX1dLFxufTtcblxuLyoqIEFuIG9iamVjdCBjb250YWluaW5nIHJlc3VsdHMgb2YgbXVsdGlwbGUgcXVlcmllcy4gICovXG50eXBlIEdpdGh1YlF1ZXJ5UmVzdWx0ID0ge1xuICBba2V5OiBzdHJpbmddOiB0eXBlb2YgR2l0aHViUXVlcnlSZXN1bHRGcmFnbWVudDtcbn07XG5cbi8qKlxuICogQ2FwIHRoZSByZXR1cm5lZCBpc3N1ZXMgaW4gdGhlIHF1ZXJpZXMgdG8gYW4gYXJiaXRyYXJ5IDIwLiBBdCB0aGF0IHBvaW50LCBjYXJldGFrZXIgaGFzIGEgbG90XG4gKiBvZiB3b3JrIHRvIGRvIGFuZCBzaG93aW5nIG1vcmUgdGhhbiB0aGF0IGlzbid0IHJlYWxseSB1c2VmdWwuXG4gKi9cbmNvbnN0IE1BWF9SRVRVUk5FRF9JU1NVRVMgPSAyMDtcblxuZXhwb3J0IGNsYXNzIEdpdGh1YlF1ZXJpZXNNb2R1bGUgZXh0ZW5kcyBCYXNlTW9kdWxlPEdpdGh1YlF1ZXJ5UmVzdWx0c3x2b2lkPiB7XG4gIGFzeW5jIHJldHJpZXZlRGF0YSgpIHtcbiAgICAvLyBOb24tbnVsbCBhc3NlcnRpb24gaXMgdXNlZCBoZXJlIGFzIHRoZSBjaGVjayBmb3IgdW5kZWZpbmVkIGltbWVkaWF0ZWx5IGZvbGxvd3MgdG8gY29uZmlybSB0aGVcbiAgICAvLyBhc3NlcnRpb24uICBUeXBlc2NyaXB0J3MgdHlwZSBmaWx0ZXJpbmcgZG9lcyBub3Qgc2VlbSB0byB3b3JrIGFzIG5lZWRlZCB0byB1bmRlcnN0YW5kXG4gICAgLy8gd2hldGhlciBnaXRodWJRdWVyaWVzIGlzIHVuZGVmaW5lZCBvciBub3QuXG4gICAgbGV0IHF1ZXJpZXMgPSB0aGlzLmNvbmZpZy5jYXJldGFrZXI/LmdpdGh1YlF1ZXJpZXMhO1xuICAgIGlmIChxdWVyaWVzID09PSB1bmRlZmluZWQgfHwgcXVlcmllcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGRlYnVnKCdObyBnaXRodWIgcXVlcmllcyBkZWZpbmVkIGluIHRoZSBjb25maWd1cmF0aW9uLCBza2lwcGluZycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qKiBUaGUgcmVzdWx0cyBvZiB0aGUgZ2VuZXJhdGVkIGdpdGh1YiBxdWVyeS4gKi9cbiAgICBjb25zdCBxdWVyeVJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5ncmFwaHFsKHRoaXMuYnVpbGRHcmFwaHFsUXVlcnkocXVlcmllcykpO1xuICAgIGNvbnN0IHJlc3VsdHMgPSBPYmplY3QudmFsdWVzKHF1ZXJ5UmVzdWx0KTtcblxuICAgIGNvbnN0IHtvd25lciwgbmFtZTogcmVwb30gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG5cbiAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdCwgaSkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcXVlcnlOYW1lOiBxdWVyaWVzW2ldLm5hbWUsXG4gICAgICAgIGNvdW50OiByZXN1bHQuaXNzdWVDb3VudCxcbiAgICAgICAgcXVlcnlVcmw6IGVuY29kZVVSSShgaHR0cHM6Ly9naXRodWIuY29tLyR7b3duZXJ9LyR7cmVwb30vaXNzdWVzP3E9JHtxdWVyaWVzW2ldLnF1ZXJ5fWApLFxuICAgICAgICBtYXRjaGVkVXJsczogcmVzdWx0Lm5vZGVzLm1hcChub2RlID0+IG5vZGUudXJsKVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBCdWlsZCBhIEdyYXBocWwgcXVlcnkgc3RhdGVtZW50IGZvciB0aGUgcHJvdmlkZWQgcXVlcmllcy4gKi9cbiAgcHJpdmF0ZSBidWlsZEdyYXBocWxRdWVyeShxdWVyaWVzOiBOb25OdWxsYWJsZTxDYXJldGFrZXJDb25maWdbJ2dpdGh1YlF1ZXJpZXMnXT4pIHtcbiAgICAvKiogVGhlIHF1ZXJ5IG9iamVjdCBmb3IgZ3JhcGhxbC4gKi9cbiAgICBjb25zdCBncmFwaHFsUXVlcnk6IEdpdGh1YlF1ZXJ5UmVzdWx0ID0ge307XG4gICAgY29uc3Qge293bmVyLCBuYW1lOiByZXBvfSA9IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZztcbiAgICAvKiogVGhlIEdpdGh1YiBzZWFyY2ggZmlsdGVyIGZvciB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICAgIGNvbnN0IHJlcG9GaWx0ZXIgPSBgcmVwbzoke293bmVyfS8ke3JlcG99YDtcblxuXG4gICAgcXVlcmllcy5mb3JFYWNoKCh7bmFtZSwgcXVlcnl9KSA9PiB7XG4gICAgICAvKiogVGhlIG5hbWUgb2YgdGhlIHF1ZXJ5LCB3aXRoIHNwYWNlcyByZW1vdmVkIHRvIG1hdGNoIEdyYXBocWwgcmVxdWlyZW1lbnRzLiAqL1xuICAgICAgY29uc3QgcXVlcnlLZXkgPSBhbGlhcyhuYW1lLnJlcGxhY2UoLyAvZywgJycpLCAnc2VhcmNoJyk7XG4gICAgICBncmFwaHFsUXVlcnlbcXVlcnlLZXldID0gcGFyYW1zKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICdJU1NVRScsXG4gICAgICAgICAgICBmaXJzdDogTUFYX1JFVFVSTkVEX0lTU1VFUyxcbiAgICAgICAgICAgIHF1ZXJ5OiBgXCIke3JlcG9GaWx0ZXJ9ICR7cXVlcnkucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpfVwiYCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsuLi5HaXRodWJRdWVyeVJlc3VsdEZyYWdtZW50fSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZ3JhcGhxbFF1ZXJ5O1xuICB9XG5cbiAgYXN5bmMgcHJpbnRUb1Rlcm1pbmFsKCkge1xuICAgIGNvbnN0IHF1ZXJ5UmVzdWx0cyA9IGF3YWl0IHRoaXMuZGF0YTtcbiAgICBpZiAoIXF1ZXJ5UmVzdWx0cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbmZvLmdyb3VwKGJvbGQoJ0dpdGh1YiBUYXNrcycpKTtcbiAgICBjb25zdCBtaW5RdWVyeU5hbWVMZW5ndGggPSBNYXRoLm1heCguLi5xdWVyeVJlc3VsdHMubWFwKHJlc3VsdCA9PiByZXN1bHQucXVlcnlOYW1lLmxlbmd0aCkpO1xuICAgIGZvciAoY29uc3QgcXVlcnlSZXN1bHQgb2YgcXVlcnlSZXN1bHRzKSB7XG4gICAgICBpbmZvKGAke3F1ZXJ5UmVzdWx0LnF1ZXJ5TmFtZS5wYWRFbmQobWluUXVlcnlOYW1lTGVuZ3RoKX0gICR7cXVlcnlSZXN1bHQuY291bnR9YCk7XG5cbiAgICAgIGlmIChxdWVyeVJlc3VsdC5jb3VudCA+IDApIHtcbiAgICAgICAgaW5mby5ncm91cChxdWVyeVJlc3VsdC5xdWVyeVVybCk7XG4gICAgICAgIHF1ZXJ5UmVzdWx0Lm1hdGNoZWRVcmxzLmZvckVhY2godXJsID0+IGluZm8oYC0gJHt1cmx9YCkpO1xuICAgICAgICBpZiAocXVlcnlSZXN1bHQuY291bnQgPiBNQVhfUkVUVVJORURfSVNTVUVTKSB7XG4gICAgICAgICAgaW5mbyhgLi4uICR7cXVlcnlSZXN1bHQuY291bnQgLSBNQVhfUkVUVVJORURfSVNTVUVTfSBhZGRpdGlvbmFsIG1hdGNoZXNgKTtcbiAgICAgICAgfVxuICAgICAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICBpbmZvKCk7XG4gIH1cbn1cbiJdfQ==