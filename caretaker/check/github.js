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
                            return [4 /*yield*/, this.git.github.graphql.query(this.buildGraphqlQuery(queries))];
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
            var graphQlQuery = {};
            var _a = this.git.remoteConfig, owner = _a.owner, repo = _a.name;
            /** The Github search filter for the configured repository. */
            var repoFilter = "repo:" + owner + "/" + repo;
            queries.forEach(function (_a) {
                var name = _a.name, query = _a.query;
                /** The name of the query, with spaces removed to match GraphQL requirements. */
                var queryKey = typed_graphqlify_1.alias(name.replace(/ /g, ''), 'search');
                graphQlQuery[queryKey] = typed_graphqlify_1.params({
                    type: 'ISSUE',
                    first: MAX_RETURNED_ISSUES,
                    query: "\"" + repoFilter + " " + query.replace(/"/g, '\\"') + "\"",
                }, tslib_1.__assign({}, GithubQueryResultFragment));
            });
            return graphQlQuery;
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
                            minQueryNameLength = Math.max.apply(Math, tslib_1.__spread(queryResults.map(function (result) { return result.queryName.length; })));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jaGVjay9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHFEQUErRDtJQUUvRCxvRUFBc0Q7SUFFdEQsd0VBQWtDO0lBVWxDLHNFQUFzRTtJQUN0RSxJQUFNLHlCQUF5QixHQUFHO1FBQ2hDLFVBQVUsRUFBRSx3QkFBSyxDQUFDLE1BQU07UUFDeEIsS0FBSyxFQUFFLHNCQUFLLDBCQUFPLENBQUM7Z0JBQ2xCLFdBQVcsRUFBRTtvQkFDWCxHQUFHLEVBQUUsd0JBQUssQ0FBQyxNQUFNO2lCQUNsQjtnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsR0FBRyxFQUFFLHdCQUFLLENBQUMsTUFBTTtpQkFDbEI7YUFDRixDQUFDLEVBQUU7S0FDTCxDQUFDO0lBT0Y7OztPQUdHO0lBQ0gsSUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7SUFFL0I7UUFBeUMsK0NBQW1DO1FBQTVFOztRQXlFQSxDQUFDO1FBeEVPLDBDQUFZLEdBQWxCOzs7Ozs7OzRCQUlNLE9BQU8sR0FBRyxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUywwQ0FBRSxhQUFjLENBQUM7NEJBQ3BELElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQ0FDakQsZUFBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7Z0NBQ2xFLHNCQUFPOzZCQUNSOzRCQUdtQixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFBOzs0QkFBbEYsV0FBVyxHQUFHLFNBQW9FOzRCQUNsRixPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQzs0QkFFckMsS0FBc0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQTFDLEtBQUssV0FBQSxFQUFRLElBQUksVUFBQSxDQUEwQjs0QkFFbEQsc0JBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDO29DQUMzQixPQUFPO3dDQUNMLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTt3Q0FDMUIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxVQUFVO3dDQUN4QixRQUFRLEVBQUUsU0FBUyxDQUFDLHdCQUFzQixLQUFLLFNBQUksSUFBSSxrQkFBYSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBTyxDQUFDO3dDQUN2RixXQUFXLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsR0FBRyxFQUFSLENBQVEsQ0FBQztxQ0FDaEQsQ0FBQztnQ0FDSixDQUFDLENBQUMsRUFBQzs7OztTQUNKO1FBRUQsZ0VBQWdFO1FBQ3hELCtDQUFpQixHQUF6QixVQUEwQixPQUFzRDtZQUM5RSxvQ0FBb0M7WUFDcEMsSUFBTSxZQUFZLEdBQXNCLEVBQUUsQ0FBQztZQUNyQyxJQUFBLEtBQXNCLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUExQyxLQUFLLFdBQUEsRUFBUSxJQUFJLFVBQXlCLENBQUM7WUFDbEQsOERBQThEO1lBQzlELElBQU0sVUFBVSxHQUFHLFVBQVEsS0FBSyxTQUFJLElBQU0sQ0FBQztZQUczQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBYTtvQkFBWixJQUFJLFVBQUEsRUFBRSxLQUFLLFdBQUE7Z0JBQzNCLGdGQUFnRjtnQkFDaEYsSUFBTSxRQUFRLEdBQUcsd0JBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDekQsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLHlCQUFNLENBQzNCO29CQUNFLElBQUksRUFBRSxPQUFPO29CQUNiLEtBQUssRUFBRSxtQkFBbUI7b0JBQzFCLEtBQUssRUFBRSxPQUFJLFVBQVUsU0FBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsT0FBRztpQkFDdkQsdUJBQ0cseUJBQXlCLEVBQUUsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sWUFBWSxDQUFDO1FBQ3RCLENBQUM7UUFFSyw2Q0FBZSxHQUFyQjs7Ozs7O2dDQUN1QixxQkFBTSxJQUFJLENBQUMsSUFBSSxFQUFBOzs0QkFBOUIsWUFBWSxHQUFHLFNBQWU7NEJBQ3BDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0NBQ2pCLHNCQUFPOzZCQUNSOzRCQUNELGNBQUksQ0FBQyxLQUFLLENBQUMsY0FBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7NEJBQzNCLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLE9BQVIsSUFBSSxtQkFBUSxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQXZCLENBQXVCLENBQUMsRUFBQyxDQUFDOztnQ0FDNUYsS0FBMEIsaUJBQUEsaUJBQUEsWUFBWSxDQUFBLDhHQUFFO29DQUE3QixXQUFXO29DQUNwQixjQUFJLENBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsVUFBSyxXQUFXLENBQUMsS0FBTyxDQUFDLENBQUM7b0NBRWxGLElBQUksV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7d0NBQ3pCLGNBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dDQUNqQyxXQUFXLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLGNBQUksQ0FBQyxPQUFLLEdBQUssQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUM7d0NBQ3pELElBQUksV0FBVyxDQUFDLEtBQUssR0FBRyxtQkFBbUIsRUFBRTs0Q0FDM0MsY0FBSSxDQUFDLFVBQU8sV0FBVyxDQUFDLEtBQUssR0FBRyxtQkFBbUIseUJBQXFCLENBQUMsQ0FBQzt5Q0FDM0U7d0NBQ0QsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3FDQUNqQjtpQ0FDRjs7Ozs7Ozs7OzRCQUNELGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDaEIsY0FBSSxFQUFFLENBQUM7Ozs7O1NBQ1I7UUFDSCwwQkFBQztJQUFELENBQUMsQUF6RUQsQ0FBeUMsaUJBQVUsR0F5RWxEO0lBekVZLGtEQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2FsaWFzLCBvblVuaW9uLCBwYXJhbXMsIHR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtib2xkLCBkZWJ1ZywgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0NhcmV0YWtlckNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7QmFzZU1vZHVsZX0gZnJvbSAnLi9iYXNlJztcblxuLyoqIEEgbGlzdCBvZiBnZW5lcmF0ZWQgcmVzdWx0cyBmb3IgYSBnaXRodWIgcXVlcnkuICovXG50eXBlIEdpdGh1YlF1ZXJ5UmVzdWx0cyA9IHtcbiAgcXVlcnlOYW1lOiBzdHJpbmcsXG4gIGNvdW50OiBudW1iZXIsXG4gIHF1ZXJ5VXJsOiBzdHJpbmcsXG4gIG1hdGNoZWRVcmxzOiBzdHJpbmdbXSxcbn1bXTtcblxuLyoqIFRoZSBmcmFnbWVudCBmb3IgYSByZXN1bHQgZnJvbSBHaXRodWIncyBhcGkgZm9yIGEgR2l0aHViIHF1ZXJ5LiAqL1xuY29uc3QgR2l0aHViUXVlcnlSZXN1bHRGcmFnbWVudCA9IHtcbiAgaXNzdWVDb3VudDogdHlwZXMubnVtYmVyLFxuICBub2RlczogW3suLi5vblVuaW9uKHtcbiAgICBQdWxsUmVxdWVzdDoge1xuICAgICAgdXJsOiB0eXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgICBJc3N1ZToge1xuICAgICAgdXJsOiB0eXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSl9XSxcbn07XG5cbi8qKiBBbiBvYmplY3QgY29udGFpbmluZyByZXN1bHRzIG9mIG11bHRpcGxlIHF1ZXJpZXMuICAqL1xudHlwZSBHaXRodWJRdWVyeVJlc3VsdCA9IHtcbiAgW2tleTogc3RyaW5nXTogdHlwZW9mIEdpdGh1YlF1ZXJ5UmVzdWx0RnJhZ21lbnQ7XG59O1xuXG4vKipcbiAqIENhcCB0aGUgcmV0dXJuZWQgaXNzdWVzIGluIHRoZSBxdWVyaWVzIHRvIGFuIGFyYml0cmFyeSAyMC4gQXQgdGhhdCBwb2ludCwgY2FyZXRha2VyIGhhcyBhIGxvdFxuICogb2Ygd29yayB0byBkbyBhbmQgc2hvd2luZyBtb3JlIHRoYW4gdGhhdCBpc24ndCByZWFsbHkgdXNlZnVsLlxuICovXG5jb25zdCBNQVhfUkVUVVJORURfSVNTVUVTID0gMjA7XG5cbmV4cG9ydCBjbGFzcyBHaXRodWJRdWVyaWVzTW9kdWxlIGV4dGVuZHMgQmFzZU1vZHVsZTxHaXRodWJRdWVyeVJlc3VsdHN8dm9pZD4ge1xuICBhc3luYyByZXRyaWV2ZURhdGEoKSB7XG4gICAgLy8gTm9uLW51bGwgYXNzZXJ0aW9uIGlzIHVzZWQgaGVyZSBhcyB0aGUgY2hlY2sgZm9yIHVuZGVmaW5lZCBpbW1lZGlhdGVseSBmb2xsb3dzIHRvIGNvbmZpcm0gdGhlXG4gICAgLy8gYXNzZXJ0aW9uLiAgVHlwZXNjcmlwdCdzIHR5cGUgZmlsdGVyaW5nIGRvZXMgbm90IHNlZW0gdG8gd29yayBhcyBuZWVkZWQgdG8gdW5kZXJzdGFuZFxuICAgIC8vIHdoZXRoZXIgZ2l0aHViUXVlcmllcyBpcyB1bmRlZmluZWQgb3Igbm90LlxuICAgIGxldCBxdWVyaWVzID0gdGhpcy5jb25maWcuY2FyZXRha2VyPy5naXRodWJRdWVyaWVzITtcbiAgICBpZiAocXVlcmllcyA9PT0gdW5kZWZpbmVkIHx8IHF1ZXJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBkZWJ1ZygnTm8gZ2l0aHViIHF1ZXJpZXMgZGVmaW5lZCBpbiB0aGUgY29uZmlndXJhdGlvbiwgc2tpcHBpbmcnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKiogVGhlIHJlc3VsdHMgb2YgdGhlIGdlbmVyYXRlZCBnaXRodWIgcXVlcnkuICovXG4gICAgY29uc3QgcXVlcnlSZXN1bHQgPSBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ3JhcGhxbC5xdWVyeSh0aGlzLmJ1aWxkR3JhcGhxbFF1ZXJ5KHF1ZXJpZXMpKTtcbiAgICBjb25zdCByZXN1bHRzID0gT2JqZWN0LnZhbHVlcyhxdWVyeVJlc3VsdCk7XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWU6IHJlcG99ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuXG4gICAgcmV0dXJuIHJlc3VsdHMubWFwKChyZXN1bHQsIGkpID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHF1ZXJ5TmFtZTogcXVlcmllc1tpXS5uYW1lLFxuICAgICAgICBjb3VudDogcmVzdWx0Lmlzc3VlQ291bnQsXG4gICAgICAgIHF1ZXJ5VXJsOiBlbmNvZGVVUkkoYGh0dHBzOi8vZ2l0aHViLmNvbS8ke293bmVyfS8ke3JlcG99L2lzc3Vlcz9xPSR7cXVlcmllc1tpXS5xdWVyeX1gKSxcbiAgICAgICAgbWF0Y2hlZFVybHM6IHJlc3VsdC5ub2Rlcy5tYXAobm9kZSA9PiBub2RlLnVybClcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKiogQnVpbGQgYSBHcmFwaHFsIHF1ZXJ5IHN0YXRlbWVudCBmb3IgdGhlIHByb3ZpZGVkIHF1ZXJpZXMuICovXG4gIHByaXZhdGUgYnVpbGRHcmFwaHFsUXVlcnkocXVlcmllczogTm9uTnVsbGFibGU8Q2FyZXRha2VyQ29uZmlnWydnaXRodWJRdWVyaWVzJ10+KSB7XG4gICAgLyoqIFRoZSBxdWVyeSBvYmplY3QgZm9yIGdyYXBocWwuICovXG4gICAgY29uc3QgZ3JhcGhRbFF1ZXJ5OiBHaXRodWJRdWVyeVJlc3VsdCA9IHt9O1xuICAgIGNvbnN0IHtvd25lciwgbmFtZTogcmVwb30gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgLyoqIFRoZSBHaXRodWIgc2VhcmNoIGZpbHRlciBmb3IgdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgICBjb25zdCByZXBvRmlsdGVyID0gYHJlcG86JHtvd25lcn0vJHtyZXBvfWA7XG5cblxuICAgIHF1ZXJpZXMuZm9yRWFjaCgoe25hbWUsIHF1ZXJ5fSkgPT4ge1xuICAgICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBxdWVyeSwgd2l0aCBzcGFjZXMgcmVtb3ZlZCB0byBtYXRjaCBHcmFwaFFMIHJlcXVpcmVtZW50cy4gKi9cbiAgICAgIGNvbnN0IHF1ZXJ5S2V5ID0gYWxpYXMobmFtZS5yZXBsYWNlKC8gL2csICcnKSwgJ3NlYXJjaCcpO1xuICAgICAgZ3JhcGhRbFF1ZXJ5W3F1ZXJ5S2V5XSA9IHBhcmFtcyhcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAnSVNTVUUnLFxuICAgICAgICAgICAgZmlyc3Q6IE1BWF9SRVRVUk5FRF9JU1NVRVMsXG4gICAgICAgICAgICBxdWVyeTogYFwiJHtyZXBvRmlsdGVyfSAke3F1ZXJ5LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cImAsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7Li4uR2l0aHViUXVlcnlSZXN1bHRGcmFnbWVudH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGdyYXBoUWxRdWVyeTtcbiAgfVxuXG4gIGFzeW5jIHByaW50VG9UZXJtaW5hbCgpIHtcbiAgICBjb25zdCBxdWVyeVJlc3VsdHMgPSBhd2FpdCB0aGlzLmRhdGE7XG4gICAgaWYgKCFxdWVyeVJlc3VsdHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW5mby5ncm91cChib2xkKCdHaXRodWIgVGFza3MnKSk7XG4gICAgY29uc3QgbWluUXVlcnlOYW1lTGVuZ3RoID0gTWF0aC5tYXgoLi4ucXVlcnlSZXN1bHRzLm1hcChyZXN1bHQgPT4gcmVzdWx0LnF1ZXJ5TmFtZS5sZW5ndGgpKTtcbiAgICBmb3IgKGNvbnN0IHF1ZXJ5UmVzdWx0IG9mIHF1ZXJ5UmVzdWx0cykge1xuICAgICAgaW5mbyhgJHtxdWVyeVJlc3VsdC5xdWVyeU5hbWUucGFkRW5kKG1pblF1ZXJ5TmFtZUxlbmd0aCl9ICAke3F1ZXJ5UmVzdWx0LmNvdW50fWApO1xuXG4gICAgICBpZiAocXVlcnlSZXN1bHQuY291bnQgPiAwKSB7XG4gICAgICAgIGluZm8uZ3JvdXAocXVlcnlSZXN1bHQucXVlcnlVcmwpO1xuICAgICAgICBxdWVyeVJlc3VsdC5tYXRjaGVkVXJscy5mb3JFYWNoKHVybCA9PiBpbmZvKGAtICR7dXJsfWApKTtcbiAgICAgICAgaWYgKHF1ZXJ5UmVzdWx0LmNvdW50ID4gTUFYX1JFVFVSTkVEX0lTU1VFUykge1xuICAgICAgICAgIGluZm8oYC4uLiAke3F1ZXJ5UmVzdWx0LmNvdW50IC0gTUFYX1JFVFVSTkVEX0lTU1VFU30gYWRkaXRpb25hbCBtYXRjaGVzYCk7XG4gICAgICAgIH1cbiAgICAgICAgaW5mby5ncm91cEVuZCgpO1xuICAgICAgfVxuICAgIH1cbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuICB9XG59XG4iXX0=