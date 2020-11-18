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
        define("@angular/dev-infra-private/pr/check-target-branches/check-target-branches", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/pr/merge/config", "@angular/dev-infra-private/pr/merge/target-label"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkTargetBranchesForPr = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    var config_2 = require("@angular/dev-infra-private/pr/merge/config");
    var target_label_1 = require("@angular/dev-infra-private/pr/merge/target-label");
    function checkTargetBranchesForPr(prNumber, jsonOutput) {
        if (jsonOutput === void 0) { jsonOutput = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var config, _a, owner, repo, git, _b, mergeConfig, errors, prData, labels, githubTargetBranch, targetLabel, targets;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        config = config_1.getConfig();
                        _a = config.github, owner = _a.owner, repo = _a.name;
                        git = new index_1.GitClient(undefined, config);
                        return [4 /*yield*/, config_2.loadAndValidateConfig(config, git.github)];
                    case 1:
                        _b = _c.sent(), mergeConfig = _b.config, errors = _b.errors;
                        if (errors !== undefined) {
                            throw Error("Invalid configuration found: " + errors);
                        }
                        return [4 /*yield*/, git.github.pulls.get({ owner: owner, repo: repo, pull_number: prNumber })];
                    case 2:
                        prData = (_c.sent()).data;
                        labels = prData.labels.map(function (l) { return l.name; });
                        githubTargetBranch = prData.base.ref;
                        targetLabel = target_label_1.getTargetLabelFromPullRequest(mergeConfig, labels);
                        if (targetLabel === null) {
                            console_1.error(console_1.red("No target label was found on pr #" + prNumber));
                            process.exitCode = 1;
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, target_label_1.getBranchesFromTargetLabel(targetLabel, githubTargetBranch)];
                    case 3:
                        targets = _c.sent();
                        // When requested, print a json output to stdout, rather than using standard ng-dev logging.
                        if (jsonOutput) {
                            process.stdout.write(JSON.stringify(targets));
                            return [2 /*return*/];
                        }
                        console_1.info.group("PR #" + prNumber + " will merge into:");
                        targets.forEach(function (target) { return console_1.info("- " + target); });
                        console_1.info.groupEnd();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.checkTargetBranchesForPr = checkTargetBranchesForPr;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stdGFyZ2V0LWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jaGVjay10YXJnZXQtYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILGtFQUE2QztJQUM3QyxvRUFBcUQ7SUFDckQsb0VBQWdEO0lBQ2hELHFFQUFzRDtJQUN0RCxpRkFBZ0c7SUFFaEcsU0FBc0Isd0JBQXdCLENBQUMsUUFBZ0IsRUFBRSxVQUFrQjtRQUFsQiwyQkFBQSxFQUFBLGtCQUFrQjs7Ozs7O3dCQUUzRSxNQUFNLEdBQUcsa0JBQVMsRUFBRSxDQUFDO3dCQUVyQixLQUFzQixNQUFNLENBQUMsTUFBTSxFQUFsQyxLQUFLLFdBQUEsRUFBUSxJQUFJLFVBQUEsQ0FBa0I7d0JBRXBDLEdBQUcsR0FBRyxJQUFJLGlCQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUVQLHFCQUFNLDhCQUFxQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUE7O3dCQUEvRSxLQUFnQyxTQUErQyxFQUF0RSxXQUFXLFlBQUEsRUFBRSxNQUFNLFlBQUE7d0JBQ2xDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTs0QkFDeEIsTUFBTSxLQUFLLENBQUMsa0NBQWdDLE1BQVEsQ0FBQyxDQUFDO3lCQUN2RDt3QkFFZSxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxLQUFLLE9BQUEsRUFBRSxJQUFJLE1BQUEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBQTs7d0JBQTFFLE1BQU0sR0FBRyxDQUFDLFNBQWdFLENBQUMsQ0FBQyxJQUFJO3dCQUVoRixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO3dCQUV4QyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQzt3QkFFckMsV0FBVyxHQUFHLDRDQUE2QixDQUFDLFdBQVksRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDeEUsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFOzRCQUN4QixlQUFLLENBQUMsYUFBRyxDQUFDLHNDQUFvQyxRQUFVLENBQUMsQ0FBQyxDQUFDOzRCQUMzRCxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQzs0QkFDckIsc0JBQU87eUJBQ1I7d0JBRWUscUJBQU0seUNBQTBCLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLEVBQUE7O3dCQUEzRSxPQUFPLEdBQUcsU0FBaUU7d0JBRWpGLDRGQUE0Rjt3QkFDNUYsSUFBSSxVQUFVLEVBQUU7NEJBQ2QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzRCQUM5QyxzQkFBTzt5QkFDUjt3QkFFRCxjQUFJLENBQUMsS0FBSyxDQUFDLFNBQU8sUUFBUSxzQkFBbUIsQ0FBQyxDQUFDO3dCQUMvQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsY0FBSSxDQUFDLE9BQUssTUFBUSxDQUFDLEVBQW5CLENBQW1CLENBQUMsQ0FBQzt3QkFDL0MsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOzs7OztLQUNqQjtJQXJDRCw0REFxQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZ30gZnJvbSAnLi4vbWVyZ2UvY29uZmlnJztcbmltcG9ydCB7Z2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0fSBmcm9tICcuLi9tZXJnZS90YXJnZXQtbGFiZWwnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tUYXJnZXRCcmFuY2hlc0ZvclByKHByTnVtYmVyOiBudW1iZXIsIGpzb25PdXRwdXQgPSBmYWxzZSkge1xuICAvKiogVGhlIG5nLWRldiBjb25maWd1cmF0aW9uLiAqL1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgLyoqIFJlcG8gb3duZXIgYW5kIG5hbWUgZm9yIHRoZSBnaXRodWIgcmVwb3NpdG9yeS4gKi9cbiAgY29uc3Qge293bmVyLCBuYW1lOiByZXBvfSA9IGNvbmZpZy5naXRodWI7XG4gIC8qKiBUaGUgZ2l0IGNsaWVudCB0byBnZXQgYSBHaXRodWIgQVBJIHNlcnZpY2UgaW5zdGFuY2UuICovXG4gIGNvbnN0IGdpdCA9IG5ldyBHaXRDbGllbnQodW5kZWZpbmVkLCBjb25maWcpO1xuICAvKiogVGhlIHZhbGlkYXRlZCBtZXJnZSBjb25maWcuICovXG4gIGNvbnN0IHtjb25maWc6IG1lcmdlQ29uZmlnLCBlcnJvcnN9ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlQ29uZmlnKGNvbmZpZywgZ2l0LmdpdGh1Yik7XG4gIGlmIChlcnJvcnMgIT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IEVycm9yKGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gZm91bmQ6ICR7ZXJyb3JzfWApO1xuICB9XG4gIC8qKiBUaGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgcHVsbCByZXF1ZXN0IGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwckRhdGEgPSAoYXdhaXQgZ2l0LmdpdGh1Yi5wdWxscy5nZXQoe293bmVyLCByZXBvLCBwdWxsX251bWJlcjogcHJOdW1iZXJ9KSkuZGF0YTtcbiAgLyoqIFRoZSBsaXN0IG9mIGxhYmVscyBvbiB0aGUgUFIgYXMgc3RyaW5ncy4gKi9cbiAgY29uc3QgbGFiZWxzID0gcHJEYXRhLmxhYmVscy5tYXAobCA9PiBsLm5hbWUpO1xuICAvKiogVGhlIGJyYW5jaCB0YXJnZXR0ZWQgdmlhIHRoZSBHaXRodWIgVUkuICovXG4gIGNvbnN0IGdpdGh1YlRhcmdldEJyYW5jaCA9IHByRGF0YS5iYXNlLnJlZjtcbiAgLyoqIFRoZSBhY3RpdmUgbGFiZWwgd2hpY2ggaXMgYmVpbmcgdXNlZCBmb3IgdGFyZ2V0dGluZyB0aGUgUFIuICovXG4gIGNvbnN0IHRhcmdldExhYmVsID0gZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QobWVyZ2VDb25maWchLCBsYWJlbHMpO1xuICBpZiAodGFyZ2V0TGFiZWwgPT09IG51bGwpIHtcbiAgICBlcnJvcihyZWQoYE5vIHRhcmdldCBsYWJlbCB3YXMgZm91bmQgb24gcHIgIyR7cHJOdW1iZXJ9YCkpO1xuICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICAgIHJldHVybjtcbiAgfVxuICAvKiogVGhlIHRhcmdldCBicmFuY2hlcyBiYXNlZCBvbiB0aGUgdGFyZ2V0IGxhYmVsIGFuZCBicmFuY2ggdGFyZ2V0dGVkIGluIHRoZSBHaXRodWIgVUkuICovXG4gIGNvbnN0IHRhcmdldHMgPSBhd2FpdCBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCh0YXJnZXRMYWJlbCwgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcblxuICAvLyBXaGVuIHJlcXVlc3RlZCwgcHJpbnQgYSBqc29uIG91dHB1dCB0byBzdGRvdXQsIHJhdGhlciB0aGFuIHVzaW5nIHN0YW5kYXJkIG5nLWRldiBsb2dnaW5nLlxuICBpZiAoanNvbk91dHB1dCkge1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKEpTT04uc3RyaW5naWZ5KHRhcmdldHMpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpbmZvLmdyb3VwKGBQUiAjJHtwck51bWJlcn0gd2lsbCBtZXJnZSBpbnRvOmApO1xuICB0YXJnZXRzLmZvckVhY2godGFyZ2V0ID0+IGluZm8oYC0gJHt0YXJnZXR9YCkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG59XG4iXX0=