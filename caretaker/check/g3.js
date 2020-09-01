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
        define("@angular/dev-infra-private/caretaker/service-statuses/g3", ["require", "exports", "tslib", "fs-extra", "multimatch", "path", "yaml", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printG3Comparison = void 0;
    var tslib_1 = require("tslib");
    var fs_extra_1 = require("fs-extra");
    var multimatch = require("multimatch");
    var path_1 = require("path");
    var yaml_1 = require("yaml");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /** Compare the upstream master to the upstream g3 branch, if it exists. */
    function printG3Comparison(git) {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            /**
             * Get git diff stats between master and g3, for all files and filtered to only g3 affecting
             * files.
             */
            function getDiffStats(git) {
                /** The diff stats to be returned. */
                var stats = {
                    insertions: 0,
                    deletions: 0,
                    files: 0,
                    commits: 0,
                };
                // Determine the number of commits between master and g3 refs. */
                stats.commits = parseInt(git.run(['rev-list', '--count', g3Ref + ".." + masterRef]).stdout, 10);
                // Get the numstat information between master and g3
                git.run(['diff', g3Ref + "..." + masterRef, '--numstat'])
                    .stdout
                    // Remove the extra space after git's output.
                    .trim()
                    // Split each line of git output into array
                    .split('\n')
                    // Split each line from the git output into components parts: insertions,
                    // deletions and file name respectively
                    .map(function (line) { return line.split('\t'); })
                    // Parse number value from the insertions and deletions values
                    // Example raw line input:
                    //   10\t5\tsrc/file/name.ts
                    .map(function (line) { return [Number(line[0]), Number(line[1]), line[2]]; })
                    // Add each line's value to the diff stats, and conditionally to the g3
                    // stats as well if the file name is included in the files synced to g3.
                    .forEach(function (_a) {
                    var _b = tslib_1.__read(_a, 3), insertions = _b[0], deletions = _b[1], fileName = _b[2];
                    if (checkMatchAgainstIncludeAndExclude(fileName, includeFiles, excludeFiles)) {
                        stats.insertions += insertions;
                        stats.deletions += deletions;
                        stats.files += 1;
                    }
                });
                return stats;
            }
            /** Determine whether the file name passes both include and exclude checks. */
            function checkMatchAgainstIncludeAndExclude(file, includes, excludes) {
                return multimatch(multimatch(file, includes), excludes, { flipNegate: true }).length !== 0;
            }
            var angularRobotFilePath, robotConfig, includeFiles, excludeFiles, randomPrefix, masterRef, g3Ref, refUrl, fetchResult, stats;
            return tslib_1.__generator(this, function (_e) {
                angularRobotFilePath = path_1.join(config_1.getRepoBaseDir(), '.github/angular-robot.yml');
                if (!fs_extra_1.existsSync(angularRobotFilePath)) {
                    return [2 /*return*/, console_1.debug('No angular robot configuration file exists, skipping.')];
                }
                robotConfig = yaml_1.parse(fs_extra_1.readFileSync(angularRobotFilePath).toString());
                includeFiles = ((_b = (_a = robotConfig === null || robotConfig === void 0 ? void 0 : robotConfig.merge) === null || _a === void 0 ? void 0 : _a.g3Status) === null || _b === void 0 ? void 0 : _b.include) || [];
                excludeFiles = ((_d = (_c = robotConfig === null || robotConfig === void 0 ? void 0 : robotConfig.merge) === null || _c === void 0 ? void 0 : _c.g3Status) === null || _d === void 0 ? void 0 : _d.exclude) || [];
                if (includeFiles.length === 0 && excludeFiles.length === 0) {
                    console_1.debug('No g3Status include or exclude lists are defined in the angular robot configuration,');
                    console_1.debug('skipping.');
                    return [2 /*return*/];
                }
                randomPrefix = "prefix" + Math.floor(Math.random() * 1000000);
                masterRef = randomPrefix + "-master";
                g3Ref = randomPrefix + "-g3";
                refUrl = "https://github.com/" + git.remoteConfig.owner + "/" + git.remoteConfig.name + ".git";
                fetchResult = git.runGraceful(['fetch', refUrl, "master:" + masterRef, "g3:" + g3Ref]);
                // If the upstream repository does not have a g3 branch to compare to, skip the comparison.
                if (fetchResult.status !== 0) {
                    if (fetchResult.stderr.includes("couldn't find remote ref g3")) {
                        return [2 /*return*/, console_1.debug('No g3 branch exists on upstream, skipping.')];
                    }
                    throw Error('Fetch of master and g3 branches for comparison failed.');
                }
                stats = getDiffStats(git);
                // Delete the temporarily created mater and g3 branches.
                git.runGraceful(['branch', '-D', masterRef, g3Ref]);
                console_1.info.group(console_1.bold('g3 branch check'));
                console_1.info(stats.commits + " commits between g3 and master");
                if (stats.files === 0) {
                    console_1.info('✅ No sync is needed at this time');
                }
                else {
                    console_1.info(stats.files + " files changed, " + stats.insertions + " insertions(+), " + stats.deletions + " deletions(-) will be included in the next sync");
                }
                console_1.info.groupEnd();
                console_1.info();
                return [2 /*return*/];
            });
        });
    }
    exports.printG3Comparison = printG3Comparison;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxQ0FBa0Q7SUFDbEQsdUNBQXlDO0lBQ3pDLDZCQUEwQjtJQUMxQiw2QkFBd0M7SUFFeEMsa0VBQWtEO0lBQ2xELG9FQUFzRDtJQUd0RCwyRUFBMkU7SUFDM0UsU0FBc0IsaUJBQWlCLENBQUMsR0FBYzs7O1lBd0RwRDs7O2VBR0c7WUFDSCxTQUFTLFlBQVksQ0FBQyxHQUFjO2dCQUNsQyxxQ0FBcUM7Z0JBQ3JDLElBQU0sS0FBSyxHQUFHO29CQUNaLFVBQVUsRUFBRSxDQUFDO29CQUNiLFNBQVMsRUFBRSxDQUFDO29CQUNaLEtBQUssRUFBRSxDQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDO2lCQUNYLENBQUM7Z0JBR0YsaUVBQWlFO2dCQUNqRSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBSyxLQUFLLFVBQUssU0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRWhHLG9EQUFvRDtnQkFDcEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBSyxLQUFLLFdBQU0sU0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3FCQUNwRCxNQUFNO29CQUNQLDZDQUE2QztxQkFDNUMsSUFBSSxFQUFFO29CQUNQLDJDQUEyQztxQkFDMUMsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFDWix5RUFBeUU7b0JBQ3pFLHVDQUF1QztxQkFDdEMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQztvQkFDOUIsOERBQThEO29C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RUFBQztxQkFDNUQ7b0JBQ0QsTUFBTSxLQUFLLENBQUMsd0RBQXdELENBQUMsQ0FBQztpQkFDdkU7Z0JBR0ssS0FBSyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFaEMsd0RBQXdEO2dCQUN4RCxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFFcEQsY0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxjQUFJLENBQUksS0FBSyxDQUFDLE9BQU8sbUNBQWdDLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtvQkFDckIsY0FBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7aUJBQzFDO3FCQUFNO29CQUNMLGNBQUksQ0FBSSxLQUFLLENBQUMsS0FBSyx3QkFBbUIsS0FBSyxDQUFDLFVBQVUsd0JBQ2xELEtBQUssQ0FBQyxTQUFTLG9EQUFpRCxDQUFDLENBQUM7aUJBQ3ZFO2dCQUNELGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEIsY0FBSSxFQUFFLENBQUM7Ozs7S0FtRFI7SUF4R0QsOENBd0dDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jfSBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBtdWx0aW1hdGNoIGZyb20gJ211bHRpbWF0Y2gnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VZYW1sfSBmcm9tICd5YW1sJztcblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7Ym9sZCwgZGVidWcsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5cbi8qKiBDb21wYXJlIHRoZSB1cHN0cmVhbSBtYXN0ZXIgdG8gdGhlIHVwc3RyZWFtIGczIGJyYW5jaCwgaWYgaXQgZXhpc3RzLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50RzNDb21wYXJpc29uKGdpdDogR2l0Q2xpZW50KSB7XG4gIGNvbnN0IGFuZ3VsYXJSb2JvdEZpbGVQYXRoID0gam9pbihnZXRSZXBvQmFzZURpcigpLCAnLmdpdGh1Yi9hbmd1bGFyLXJvYm90LnltbCcpO1xuICBpZiAoIWV4aXN0c1N5bmMoYW5ndWxhclJvYm90RmlsZVBhdGgpKSB7XG4gICAgcmV0dXJuIGRlYnVnKCdObyBhbmd1bGFyIHJvYm90IGNvbmZpZ3VyYXRpb24gZmlsZSBleGlzdHMsIHNraXBwaW5nLicpO1xuICB9XG5cbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGRlZmluZWQgZm9yIHRoZSBhbmd1bGFyIHJvYm90LiAqL1xuICBjb25zdCByb2JvdENvbmZpZyA9IHBhcnNlWWFtbChyZWFkRmlsZVN5bmMoYW5ndWxhclJvYm90RmlsZVBhdGgpLnRvU3RyaW5nKCkpO1xuICAvKiogVGhlIGZpbGVzIHRvIGJlIGluY2x1ZGVkIGluIHRoZSBnMyBzeW5jLiAqL1xuICBjb25zdCBpbmNsdWRlRmlsZXMgPSByb2JvdENvbmZpZz8ubWVyZ2U/LmczU3RhdHVzPy5pbmNsdWRlIHx8IFtdO1xuICAvKiogVGhlIGZpbGVzIHRvIGJlIGV4cGVjdGVkIGluIHRoZSBnMyBzeW5jLiAqL1xuICBjb25zdCBleGNsdWRlRmlsZXMgPSByb2JvdENvbmZpZz8ubWVyZ2U/LmczU3RhdHVzPy5leGNsdWRlIHx8IFtdO1xuXG4gIGlmIChpbmNsdWRlRmlsZXMubGVuZ3RoID09PSAwICYmIGV4Y2x1ZGVGaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICBkZWJ1ZygnTm8gZzNTdGF0dXMgaW5jbHVkZSBvciBleGNsdWRlIGxpc3RzIGFyZSBkZWZpbmVkIGluIHRoZSBhbmd1bGFyIHJvYm90IGNvbmZpZ3VyYXRpb24sJyk7XG4gICAgZGVidWcoJ3NraXBwaW5nLicpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKiBSYW5kb20gcHJlZml4IHRvIGNyZWF0ZSB1bmlxdWUgYnJhbmNoIG5hbWVzLiAqL1xuICBjb25zdCByYW5kb21QcmVmaXggPSBgcHJlZml4JHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKX1gO1xuICAvKiogUmVmIG5hbWUgb2YgdGhlIHRlbXBvcmFyeSBtYXN0ZXIgYnJhbmNoLiAqL1xuICBjb25zdCBtYXN0ZXJSZWYgPSBgJHtyYW5kb21QcmVmaXh9LW1hc3RlcmA7XG4gIC8qKiBSZWYgbmFtZSBvZiB0aGUgdGVtcG9yYXJ5IGczIGJyYW5jaC4gKi9cbiAgY29uc3QgZzNSZWYgPSBgJHtyYW5kb21QcmVmaXh9LWczYDtcbiAgLyoqIFVybCBvZiB0aGUgcmVmIGZvciBmZXRjaGluZyBtYXN0ZXIgYW5kIGczIGJyYW5jaGVzLiAqL1xuICBjb25zdCByZWZVcmwgPSBgaHR0cHM6Ly9naXRodWIuY29tLyR7Z2l0LnJlbW90ZUNvbmZpZy5vd25lcn0vJHtnaXQucmVtb3RlQ29uZmlnLm5hbWV9LmdpdGA7XG4gIC8qKiBUaGUgcmVzdWx0IGZvIHRoZSBmZXRjaCBjb21tYW5kLiAqL1xuICBjb25zdCBmZXRjaFJlc3VsdCA9IGdpdC5ydW5HcmFjZWZ1bChbJ2ZldGNoJywgcmVmVXJsLCBgbWFzdGVyOiR7bWFzdGVyUmVmfWAsIGBnMzoke2czUmVmfWBdKTtcblxuICAvLyBJZiB0aGUgdXBzdHJlYW0gcmVwb3NpdG9yeSBkb2VzIG5vdCBoYXZlIGEgZzMgYnJhbmNoIHRvIGNvbXBhcmUgdG8sIHNraXAgdGhlIGNvbXBhcmlzb24uXG4gIGlmIChmZXRjaFJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICBpZiAoZmV0Y2hSZXN1bHQuc3RkZXJyLmluY2x1ZGVzKGBjb3VsZG4ndCBmaW5kIHJlbW90ZSByZWYgZzNgKSkge1xuICAgICAgcmV0dXJuIGRlYnVnKCdObyBnMyBicmFuY2ggZXhpc3RzIG9uIHVwc3RyZWFtLCBza2lwcGluZy4nKTtcbiAgICB9XG4gICAgdGhyb3cgRXJyb3IoJ0ZldGNoIG9mIG1hc3RlciBhbmQgZzMgYnJhbmNoZXMgZm9yIGNvbXBhcmlzb24gZmFpbGVkLicpO1xuICB9XG5cbiAgLyoqIFRoZSBzdGF0aXN0aWNhbCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZ2l0IGRpZmYgYmV0d2VlbiBtYXN0ZXIgYW5kIGczLiAqL1xuICBjb25zdCBzdGF0cyA9IGdldERpZmZTdGF0cyhnaXQpO1xuXG4gIC8vIERlbGV0ZSB0aGUgdGVtcG9yYXJpbHkgY3JlYXRlZCBtYXRlciBhbmQgZzMgYnJhbmNoZXMuXG4gIGdpdC5ydW5HcmFjZWZ1bChbJ2JyYW5jaCcsICctRCcsIG1hc3RlclJlZiwgZzNSZWZdKTtcblxuICBpbmZvLmdyb3VwKGJvbGQoJ2czIGJyYW5jaCBjaGVjaycpKTtcbiAgaW5mbyhgJHtzdGF0cy5jb21taXRzfSBjb21taXRzIGJldHdlZW4gZzMgYW5kIG1hc3RlcmApO1xuICBpZiAoc3RhdHMuZmlsZXMgPT09IDApIHtcbiAgICBpbmZvKCfinIUgTm8gc3luYyBpcyBuZWVkZWQgYXQgdGhpcyB0aW1lJyk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhgJHtzdGF0cy5maWxlc30gZmlsZXMgY2hhbmdlZCwgJHtzdGF0cy5pbnNlcnRpb25zfSBpbnNlcnRpb25zKCspLCAke1xuICAgICAgICBzdGF0cy5kZWxldGlvbnN9IGRlbGV0aW9ucygtKSB3aWxsIGJlIGluY2x1ZGVkIGluIHRoZSBuZXh0IHN5bmNgKTtcbiAgfVxuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGluZm8oKTtcblxuXG4gIC8qKlxuICAgKiBHZXQgZ2l0IGRpZmYgc3RhdHMgYmV0d2VlbiBtYXN0ZXIgYW5kIGczLCBmb3IgYWxsIGZpbGVzIGFuZCBmaWx0ZXJlZCB0byBvbmx5IGczIGFmZmVjdGluZ1xuICAgKiBmaWxlcy5cbiAgICovXG4gIGZ1bmN0aW9uIGdldERpZmZTdGF0cyhnaXQ6IEdpdENsaWVudCkge1xuICAgIC8qKiBUaGUgZGlmZiBzdGF0cyB0byBiZSByZXR1cm5lZC4gKi9cbiAgICBjb25zdCBzdGF0cyA9IHtcbiAgICAgIGluc2VydGlvbnM6IDAsXG4gICAgICBkZWxldGlvbnM6IDAsXG4gICAgICBmaWxlczogMCxcbiAgICAgIGNvbW1pdHM6IDAsXG4gICAgfTtcblxuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBudW1iZXIgb2YgY29tbWl0cyBiZXR3ZWVuIG1hc3RlciBhbmQgZzMgcmVmcy4gKi9cbiAgICBzdGF0cy5jb21taXRzID0gcGFyc2VJbnQoZ2l0LnJ1bihbJ3Jldi1saXN0JywgJy0tY291bnQnLCBgJHtnM1JlZn0uLiR7bWFzdGVyUmVmfWBdKS5zdGRvdXQsIDEwKTtcblxuICAgIC8vIEdldCB0aGUgbnVtc3RhdCBpbmZvcm1hdGlvbiBiZXR3ZWVuIG1hc3RlciBhbmQgZzNcbiAgICBnaXQucnVuKFsnZGlmZicsIGAke2czUmVmfS4uLiR7bWFzdGVyUmVmfWAsICctLW51bXN0YXQnXSlcbiAgICAgICAgLnN0ZG91dFxuICAgICAgICAvLyBSZW1vdmUgdGhlIGV4dHJhIHNwYWNlIGFmdGVyIGdpdCdzIG91dHB1dC5cbiAgICAgICAgLnRyaW0oKVxuICAgICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgb2YgZ2l0IG91dHB1dCBpbnRvIGFycmF5XG4gICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgLy8gU3BsaXQgZWFjaCBsaW5lIGZyb20gdGhlIGdpdCBvdXRwdXQgaW50byBjb21wb25lbnRzIHBhcnRzOiBpbnNlcnRpb25zLFxuICAgICAgICAvLyBkZWxldGlvbnMgYW5kIGZpbGUgbmFtZSByZXNwZWN0aXZlbHlcbiAgICAgICAgLm1hcChsaW5lID0+IGxpbmUuc3BsaXQoJ1xcdCcpKVxuICAgICAgICAvLyBQYXJzZSBudW1iZXIgdmFsdWUgZnJvbSB0aGUgaW5zZXJ0aW9ucyBhbmQgZGVsZXRpb25zIHZhbHVlc1xuICAgICAgICAvLyBFeGFtcGxlIHJhdyBsaW5lIGlucHV0OlxuICAgICAgICAvLyAgIDEwXFx0NVxcdHNyYy9maWxlL25hbWUudHNcbiAgICAgICAgLm1hcChsaW5lID0+IFtOdW1iZXIobGluZVswXSksIE51bWJlcihsaW5lWzFdKSwgbGluZVsyXV0gYXMgW251bWJlciwgbnVtYmVyLCBzdHJpbmddKVxuICAgICAgICAvLyBBZGQgZWFjaCBsaW5lJ3MgdmFsdWUgdG8gdGhlIGRpZmYgc3RhdHMsIGFuZCBjb25kaXRpb25hbGx5IHRvIHRoZSBnM1xuICAgICAgICAvLyBzdGF0cyBhcyB3ZWxsIGlmIHRoZSBmaWxlIG5hbWUgaXMgaW5jbHVkZWQgaW4gdGhlIGZpbGVzIHN5bmNlZCB0byBnMy5cbiAgICAgICAgLmZvckVhY2goKFtpbnNlcnRpb25zLCBkZWxldGlvbnMsIGZpbGVOYW1lXSkgPT4ge1xuICAgICAgICAgIGlmIChjaGVja01hdGNoQWdhaW5zdEluY2x1ZGVBbmRFeGNsdWRlKGZpbGVOYW1lLCBpbmNsdWRlRmlsZXMsIGV4Y2x1ZGVGaWxlcykpIHtcbiAgICAgICAgICAgIHN0YXRzLmluc2VydGlvbnMgKz0gaW5zZXJ0aW9ucztcbiAgICAgICAgICAgIHN0YXRzLmRlbGV0aW9ucyArPSBkZWxldGlvbnM7XG4gICAgICAgICAgICBzdGF0cy5maWxlcyArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIHN0YXRzO1xuICB9XG5cbiAgLyoqIERldGVybWluZSB3aGV0aGVyIHRoZSBmaWxlIG5hbWUgcGFzc2VzIGJvdGggaW5jbHVkZSBhbmQgZXhjbHVkZSBjaGVja3MuICovXG4gIGZ1bmN0aW9uIGNoZWNrTWF0Y2hBZ2FpbnN0SW5jbHVkZUFuZEV4Y2x1ZGUoXG4gICAgICBmaWxlOiBzdHJpbmcsIGluY2x1ZGVzOiBzdHJpbmdbXSwgZXhjbHVkZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIG11bHRpbWF0Y2gobXVsdGltYXRjaChmaWxlLCBpbmNsdWRlcyksIGV4Y2x1ZGVzLCB7ZmxpcE5lZ2F0ZTogdHJ1ZX0pLmxlbmd0aCAhPT0gMDtcbiAgfVxufVxuIl19