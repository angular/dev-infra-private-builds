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
                        if (!((_a = config.githubQueries) === null || _a === void 0 ? void 0 : _a.length)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jaGVjay9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHFEQUFzRDtJQUV0RCxvRUFBc0Q7SUFXdEQsb0VBQW9FO0lBQ3BFLFNBQXNCLGdCQUFnQixDQUFDLEdBQWMsRUFBRSxNQUF1Qjs7Ozs7O3dCQUM1RSxJQUFJLFFBQUMsTUFBTSxDQUFDLGFBQWEsMENBQUUsTUFBTSxDQUFBLEVBQUU7NEJBQ2pDLGVBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDOzRCQUNuRSxzQkFBTzt5QkFDUjt3QkFDRCxjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxxQkFBTSxhQUFhLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFBOzt3QkFBaEMsU0FBZ0MsQ0FBQzt3QkFDakMsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNoQixjQUFJLEVBQUUsQ0FBQzs7Ozs7S0FDUjtJQVRELDRDQVNDO0lBRUQsNEVBQTRFO0lBQzVFLFNBQWUsYUFBYSxDQUFDLEdBQWMsRUFBRSxFQUE4QztZQUE3QyxxQkFBMkIsRUFBWixPQUFPLG1CQUFHLEVBQUUsS0FBQTs7Ozs7O3dCQUVqRSxZQUFZLEdBQTBDLEVBQUUsQ0FBQzt3QkFFekQsVUFBVSxHQUFHLFVBQVEsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFNLENBQUM7d0JBQzdFLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFhO2dDQUFaLElBQUksVUFBQSxFQUFFLEtBQUssV0FBQTs0QkFDM0IsZ0ZBQWdGOzRCQUNoRixJQUFNLFFBQVEsR0FBRyx3QkFBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzRCQUN6RCxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcseUJBQU0sQ0FDM0I7Z0NBQ0UsSUFBSSxFQUFFLE9BQU87Z0NBQ2IsS0FBSyxFQUFFLE9BQUksVUFBVSxTQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFHOzZCQUN2RCxFQUNELEVBQUMsVUFBVSxFQUFFLHdCQUFLLENBQUMsTUFBTSxFQUFDLENBQzdCLENBQUM7d0JBQ0osQ0FBQyxDQUFDLENBQUM7d0JBRWEscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFBOzt3QkFBdEQsT0FBTyxHQUFHLFNBQTRDO3dCQUM1RCxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDOzs0QkFDdkMsY0FBSSxDQUFDLE9BQUcsT0FBTyxDQUFDLENBQUMsQ0FBQywwQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsV0FBSyxNQUFNLENBQUMsVUFBWSxDQUFDLENBQUM7d0JBQzlELENBQUMsQ0FBQyxDQUFDOzs7OztLQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YWxpYXMsIHBhcmFtcywgdHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2JvbGQsIGRlYnVnLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuaW1wb3J0IHtDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cblxuaW50ZXJmYWNlIEdpdGh1YkluZm9RdWVyeSB7XG4gIFtrZXk6IHN0cmluZ106IHtcbiAgICBpc3N1ZUNvdW50OiBudW1iZXIsXG4gIH07XG59XG5cbi8qKiBSZXRyaWV2ZSB0aGUgbnVtYmVyIG9mIG1hdGNoaW5nIGlzc3VlcyBmb3IgZWFjaCBnaXRodWIgcXVlcnkuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJpbnRHaXRodWJUYXNrcyhnaXQ6IEdpdENsaWVudCwgY29uZmlnOiBDYXJldGFrZXJDb25maWcpIHtcbiAgaWYgKCFjb25maWcuZ2l0aHViUXVlcmllcz8ubGVuZ3RoKSB7XG4gICAgZGVidWcoJ05vIGdpdGh1YiBxdWVyaWVzIGRlZmluZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24sIHNraXBwaW5nLicpO1xuICAgIHJldHVybjtcbiAgfVxuICBpbmZvLmdyb3VwKGJvbGQoJ0dpdGh1YiBUYXNrcycpKTtcbiAgYXdhaXQgZ2V0R2l0aHViSW5mbyhnaXQsIGNvbmZpZyk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgaW5mbygpO1xufVxuXG4vKiogUmV0cmlldmUgcXVlcnkgbWF0Y2ggY291bnRzIGFuZCBsb2cgZGlzY292ZXJlZCBjb3VudHMgdG8gdGhlIGNvbnNvbGUuICovXG5hc3luYyBmdW5jdGlvbiBnZXRHaXRodWJJbmZvKGdpdDogR2l0Q2xpZW50LCB7Z2l0aHViUXVlcmllczogcXVlcmllcyA9IFtdfTogQ2FyZXRha2VyQ29uZmlnKSB7XG4gIC8qKiBUaGUgcXVlcnkgb2JqZWN0IGZvciBncmFwaHFsLiAqL1xuICBjb25zdCBncmFwaFFsUXVlcnk6IHtba2V5OiBzdHJpbmddOiB7aXNzdWVDb3VudDogbnVtYmVyfX0gPSB7fTtcbiAgLyoqIFRoZSBHaXRodWIgc2VhcmNoIGZpbHRlciBmb3IgdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgY29uc3QgcmVwb0ZpbHRlciA9IGByZXBvOiR7Z2l0LnJlbW90ZUNvbmZpZy5vd25lcn0vJHtnaXQucmVtb3RlQ29uZmlnLm5hbWV9YDtcbiAgcXVlcmllcy5mb3JFYWNoKCh7bmFtZSwgcXVlcnl9KSA9PiB7XG4gICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBxdWVyeSwgd2l0aCBzcGFjZXMgcmVtb3ZlZCB0byBtYXRjaCBHcmFwaFFMIHJlcXVpcmVtZW50cy4gKi9cbiAgICBjb25zdCBxdWVyeUtleSA9IGFsaWFzKG5hbWUucmVwbGFjZSgvIC9nLCAnJyksICdzZWFyY2gnKTtcbiAgICBncmFwaFFsUXVlcnlbcXVlcnlLZXldID0gcGFyYW1zKFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ0lTU1VFJyxcbiAgICAgICAgICBxdWVyeTogYFwiJHtyZXBvRmlsdGVyfSAke3F1ZXJ5LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cImAsXG4gICAgICAgIH0sXG4gICAgICAgIHtpc3N1ZUNvdW50OiB0eXBlcy5udW1iZXJ9LFxuICAgICk7XG4gIH0pO1xuICAvKiogVGhlIHJlc3VsdHMgb2YgdGhlIGdlbmVyYXRlZCBnaXRodWIgcXVlcnkuICovXG4gIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBnaXQuZ2l0aHViLmdyYXBocWwucXVlcnkoZ3JhcGhRbFF1ZXJ5KTtcbiAgT2JqZWN0LnZhbHVlcyhyZXN1bHRzKS5mb3JFYWNoKChyZXN1bHQsIGkpID0+IHtcbiAgICBpbmZvKGAke3F1ZXJpZXNbaV0/Lm5hbWUucGFkRW5kKDI1KX0gJHtyZXN1bHQuaXNzdWVDb3VudH1gKTtcbiAgfSk7XG59XG4iXX0=