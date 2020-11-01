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
        define("@angular/dev-infra-private/caretaker/check/g3", ["require", "exports", "tslib", "fs", "multimatch", "path", "yaml", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printG3Comparison = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var multimatch = require("multimatch");
    var path_1 = require("path");
    var yaml_1 = require("yaml");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /** Compare the upstream master to the upstream g3 branch, if it exists. */
    function printG3Comparison(git) {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            /** Fetch and retrieve the latest sha for a specific branch. */
            function getShaForBranchLatest(branch) {
                /** The result fo the fetch command. */
                var fetchResult = git.runGraceful([
                    'fetch', '-q',
                    "https://github.com/" + git.remoteConfig.owner + "/" + git.remoteConfig.name + ".git",
                    branch
                ]);
                if (fetchResult.status !== 0 &&
                    fetchResult.stderr.includes("couldn't find remote ref " + branch)) {
                    console_1.debug("No '" + branch + "' branch exists on upstream, skipping.");
                    return false;
                }
                return git.runGraceful(['rev-parse', 'FETCH_HEAD']).stdout.trim();
            }
            /**
             * Get git diff stats between master and g3, for all files and filtered to only g3 affecting
             * files.
             */
            function getDiffStats() {
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
                return (multimatch.call(undefined, file, includes).length >= 1 &&
                    multimatch.call(undefined, file, excludes).length === 0);
            }
            var angularRobotFilePath, robotConfig, includeFiles, excludeFiles, g3Ref, masterRef, stats;
            return tslib_1.__generator(this, function (_e) {
                angularRobotFilePath = path_1.join(config_1.getRepoBaseDir(), '.github/angular-robot.yml');
                if (!fs_1.existsSync(angularRobotFilePath)) {
                    return [2 /*return*/, console_1.debug('No angular robot configuration file exists, skipping.')];
                }
                robotConfig = yaml_1.parse(fs_1.readFileSync(angularRobotFilePath).toString());
                includeFiles = ((_b = (_a = robotConfig === null || robotConfig === void 0 ? void 0 : robotConfig.merge) === null || _a === void 0 ? void 0 : _a.g3Status) === null || _b === void 0 ? void 0 : _b.include) || [];
                excludeFiles = ((_d = (_c = robotConfig === null || robotConfig === void 0 ? void 0 : robotConfig.merge) === null || _c === void 0 ? void 0 : _c.g3Status) === null || _d === void 0 ? void 0 : _d.exclude) || [];
                if (includeFiles.length === 0 && excludeFiles.length === 0) {
                    console_1.debug('No g3Status include or exclude lists are defined in the angular robot configuration,');
                    console_1.debug('skipping.');
                    return [2 /*return*/];
                }
                g3Ref = getShaForBranchLatest('g3');
                masterRef = getShaForBranchLatest('master');
                if (!g3Ref && !masterRef) {
                    return [2 /*return*/, console_1.debug('Exiting early as either the g3 or master was unable to be retrieved')];
                }
                stats = getDiffStats();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBNEM7SUFDNUMsdUNBQXlDO0lBQ3pDLDZCQUEwQjtJQUMxQiw2QkFBd0M7SUFFeEMsa0VBQWtEO0lBQ2xELG9FQUFzRDtJQUd0RCwyRUFBMkU7SUFDM0UsU0FBc0IsaUJBQWlCLENBQUMsR0FBYzs7O1lBMkNwRCwrREFBK0Q7WUFDL0QsU0FBUyxxQkFBcUIsQ0FBQyxNQUFjO2dCQUMzQyx1Q0FBdUM7Z0JBQ3ZDLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7b0JBQ2xDLE9BQU8sRUFBRSxJQUFJO29CQUFFLHdCQUFzQixHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssU0FBSSxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksU0FBTTtvQkFDMUYsTUFBTTtpQkFDUCxDQUFDLENBQUM7Z0JBRUgsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUM7b0JBQ3hCLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLDhCQUE0QixNQUFRLENBQUMsRUFBRTtvQkFDckUsZUFBSyxDQUFDLFNBQU8sTUFBTSwyQ0FBd0MsQ0FBQyxDQUFDO29CQUM3RCxPQUFPLEtBQUssQ0FBQztpQkFDZDtnQkFDRCxPQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEUsQ0FBQztZQUVEOzs7ZUFHRztZQUNILFNBQVMsWUFBWTtnQkFDbkIscUNBQXFDO2dCQUNyQyxJQUFNLEtBQUssR0FBRztvQkFDWixVQUFVLEVBQUUsQ0FBQztvQkFDYixTQUFTLEVBQUUsQ0FBQztvQkFDWixLQUFLLEVBQUUsQ0FBQztvQkFD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QUFLLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ25CLHNCQUFPO2lCQUNSO2dCQUdLLEtBQUssR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFcEMsU0FBUyxHQUFHLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUVsRCxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUN4QixzQkFBTyxlQUFLLENBQUMscUVBQXFFLENBQUMsRUFBQztpQkFDckY7Z0JBR0ssS0FBSyxHQUFHLFlBQVksRUFBRSxDQUFDO2dCQUU3QixjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLGNBQUksQ0FBSSxLQUFLLENBQUMsT0FBTyxtQ0FBZ0MsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO29CQUNyQixjQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztpQkFDMUM7cUJBQU07b0JBQ0wsY0FBSSxDQUFJLEtBQUssQ0FBQyxLQUFLLHdCQUFtQixLQUFLLENBQUMsVUFBVSx3QkFDbEQsS0FBSyxDQUFDLFNBQVMsb0RBQWlELENBQUMsQ0FBQztpQkFDdkU7Z0JBQ0QsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQixjQUFJLEVBQUUsQ0FBQzs7OztLQW9FUjtJQTVHRCw4Q0E0R0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jLCByZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG11bHRpbWF0Y2ggZnJvbSAnbXVsdGltYXRjaCc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtwYXJzZSBhcyBwYXJzZVlhbWx9IGZyb20gJ3lhbWwnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtib2xkLCBkZWJ1ZywgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcblxuLyoqIENvbXBhcmUgdGhlIHVwc3RyZWFtIG1hc3RlciB0byB0aGUgdXBzdHJlYW0gZzMgYnJhbmNoLCBpZiBpdCBleGlzdHMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJpbnRHM0NvbXBhcmlzb24oZ2l0OiBHaXRDbGllbnQpIHtcbiAgY29uc3QgYW5ndWxhclJvYm90RmlsZVBhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksICcuZ2l0aHViL2FuZ3VsYXItcm9ib3QueW1sJyk7XG4gIGlmICghZXhpc3RzU3luYyhhbmd1bGFyUm9ib3RGaWxlUGF0aCkpIHtcbiAgICByZXR1cm4gZGVidWcoJ05vIGFuZ3VsYXIgcm9ib3QgY29uZmlndXJhdGlvbiBmaWxlIGV4aXN0cywgc2tpcHBpbmcuJyk7XG4gIH1cblxuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZGVmaW5lZCBmb3IgdGhlIGFuZ3VsYXIgcm9ib3QuICovXG4gIGNvbnN0IHJvYm90Q29uZmlnID0gcGFyc2VZYW1sKHJlYWRGaWxlU3luYyhhbmd1bGFyUm9ib3RGaWxlUGF0aCkudG9TdHJpbmcoKSk7XG4gIC8qKiBUaGUgZmlsZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIGczIHN5bmMuICovXG4gIGNvbnN0IGluY2x1ZGVGaWxlcyA9IHJvYm90Q29uZmlnPy5tZXJnZT8uZzNTdGF0dXM/LmluY2x1ZGUgfHwgW107XG4gIC8qKiBUaGUgZmlsZXMgdG8gYmUgZXhwZWN0ZWQgaW4gdGhlIGczIHN5bmMuICovXG4gIGNvbnN0IGV4Y2x1ZGVGaWxlcyA9IHJvYm90Q29uZmlnPy5tZXJnZT8uZzNTdGF0dXM/LmV4Y2x1ZGUgfHwgW107XG5cbiAgaWYgKGluY2x1ZGVGaWxlcy5sZW5ndGggPT09IDAgJiYgZXhjbHVkZUZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGRlYnVnKCdObyBnM1N0YXR1cyBpbmNsdWRlIG9yIGV4Y2x1ZGUgbGlzdHMgYXJlIGRlZmluZWQgaW4gdGhlIGFuZ3VsYXIgcm9ib3QgY29uZmlndXJhdGlvbiwnKTtcbiAgICBkZWJ1Zygnc2tpcHBpbmcuJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqIFRoZSBsYXRlc3Qgc2hhIGZvciB0aGUgZzMgYnJhbmNoLiAqL1xuICBjb25zdCBnM1JlZiA9IGdldFNoYUZvckJyYW5jaExhdGVzdCgnZzMnKTtcbiAgLyoqIFRoZSBsYXRlc3Qgc2hhIGZvciB0aGUgbWFzdGVyIGJyYW5jaC4gKi9cbiAgY29uc3QgbWFzdGVyUmVmID0gZ2V0U2hhRm9yQnJhbmNoTGF0ZXN0KCdtYXN0ZXInKTtcblxuICBpZiAoIWczUmVmICYmICFtYXN0ZXJSZWYpIHtcbiAgICByZXR1cm4gZGVidWcoJ0V4aXRpbmcgZWFybHkgYXMgZWl0aGVyIHRoZSBnMyBvciBtYXN0ZXIgd2FzIHVuYWJsZSB0byBiZSByZXRyaWV2ZWQnKTtcbiAgfVxuXG4gIC8qKiBUaGUgc3RhdGlzdGljYWwgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGdpdCBkaWZmIGJldHdlZW4gbWFzdGVyIGFuZCBnMy4gKi9cbiAgY29uc3Qgc3RhdHMgPSBnZXREaWZmU3RhdHMoKTtcblxuICBpbmZvLmdyb3VwKGJvbGQoJ2czIGJyYW5jaCBjaGVjaycpKTtcbiAgaW5mbyhgJHtzdGF0cy5jb21taXRzfSBjb21taXRzIGJldHdlZW4gZzMgYW5kIG1hc3RlcmApO1xuICBpZiAoc3RhdHMuZmlsZXMgPT09IDApIHtcbiAgICBpbmZvKCfinIUgTm8gc3luYyBpcyBuZWVkZWQgYXQgdGhpcyB0aW1lJyk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhgJHtzdGF0cy5maWxlc30gZmlsZXMgY2hhbmdlZCwgJHtzdGF0cy5pbnNlcnRpb25zfSBpbnNlcnRpb25zKCspLCAke1xuICAgICAgICBzdGF0cy5kZWxldGlvbnN9IGRlbGV0aW9ucygtKSB3aWxsIGJlIGluY2x1ZGVkIGluIHRoZSBuZXh0IHN5bmNgKTtcbiAgfVxuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGluZm8oKTtcblxuXG4gIC8qKiBGZXRjaCBhbmQgcmV0cmlldmUgdGhlIGxhdGVzdCBzaGEgZm9yIGEgc3BlY2lmaWMgYnJhbmNoLiAqL1xuICBmdW5jdGlvbiBnZXRTaGFGb3JCcmFuY2hMYXRlc3QoYnJhbmNoOiBzdHJpbmcpIHtcbiAgICAvKiogVGhlIHJlc3VsdCBmbyB0aGUgZmV0Y2ggY29tbWFuZC4gKi9cbiAgICBjb25zdCBmZXRjaFJlc3VsdCA9IGdpdC5ydW5HcmFjZWZ1bChbXG4gICAgICAnZmV0Y2gnLCAnLXEnLCBgaHR0cHM6Ly9naXRodWIuY29tLyR7Z2l0LnJlbW90ZUNvbmZpZy5vd25lcn0vJHtnaXQucmVtb3RlQ29uZmlnLm5hbWV9LmdpdGAsXG4gICAgICBicmFuY2hcbiAgICBdKTtcblxuICAgIGlmIChmZXRjaFJlc3VsdC5zdGF0dXMgIT09IDAgJiZcbiAgICAgICAgZmV0Y2hSZXN1bHQuc3RkZXJyLmluY2x1ZGVzKGBjb3VsZG4ndCBmaW5kIHJlbW90ZSByZWYgJHticmFuY2h9YCkpIHtcbiAgICAgIGRlYnVnKGBObyAnJHticmFuY2h9JyBicmFuY2ggZXhpc3RzIG9uIHVwc3RyZWFtLCBza2lwcGluZy5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGdpdC5ydW5HcmFjZWZ1bChbJ3Jldi1wYXJzZScsICdGRVRDSF9IRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdpdCBkaWZmIHN0YXRzIGJldHdlZW4gbWFzdGVyIGFuZCBnMywgZm9yIGFsbCBmaWxlcyBhbmQgZmlsdGVyZWQgdG8gb25seSBnMyBhZmZlY3RpbmdcbiAgICogZmlsZXMuXG4gICAqL1xuICBmdW5jdGlvbiBnZXREaWZmU3RhdHMoKSB7XG4gICAgLyoqIFRoZSBkaWZmIHN0YXRzIHRvIGJlIHJldHVybmVkLiAqL1xuICAgIGNvbnN0IHN0YXRzID0ge1xuICAgICAgaW5zZXJ0aW9uczogMCxcbiAgICAgIGRlbGV0aW9uczogMCxcbiAgICAgIGZpbGVzOiAwLFxuICAgICAgY29tbWl0czogMCxcbiAgICB9O1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBudW1iZXIgb2YgY29tbWl0cyBiZXR3ZWVuIG1hc3RlciBhbmQgZzMgcmVmcy4gKi9cbiAgICBzdGF0cy5jb21taXRzID0gcGFyc2VJbnQoZ2l0LnJ1bihbJ3Jldi1saXN0JywgJy0tY291bnQnLCBgJHtnM1JlZn0uLiR7bWFzdGVyUmVmfWBdKS5zdGRvdXQsIDEwKTtcblxuICAgIC8vIEdldCB0aGUgbnVtc3RhdCBpbmZvcm1hdGlvbiBiZXR3ZWVuIG1hc3RlciBhbmQgZzNcbiAgICBnaXQucnVuKFsnZGlmZicsIGAke2czUmVmfS4uLiR7bWFzdGVyUmVmfWAsICctLW51bXN0YXQnXSlcbiAgICAgICAgLnN0ZG91dFxuICAgICAgICAvLyBSZW1vdmUgdGhlIGV4dHJhIHNwYWNlIGFmdGVyIGdpdCdzIG91dHB1dC5cbiAgICAgICAgLnRyaW0oKVxuICAgICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgb2YgZ2l0IG91dHB1dCBpbnRvIGFycmF5XG4gICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgLy8gU3BsaXQgZWFjaCBsaW5lIGZyb20gdGhlIGdpdCBvdXRwdXQgaW50byBjb21wb25lbnRzIHBhcnRzOiBpbnNlcnRpb25zLFxuICAgICAgICAvLyBkZWxldGlvbnMgYW5kIGZpbGUgbmFtZSByZXNwZWN0aXZlbHlcbiAgICAgICAgLm1hcChsaW5lID0+IGxpbmUuc3BsaXQoJ1xcdCcpKVxuICAgICAgICAvLyBQYXJzZSBudW1iZXIgdmFsdWUgZnJvbSB0aGUgaW5zZXJ0aW9ucyBhbmQgZGVsZXRpb25zIHZhbHVlc1xuICAgICAgICAvLyBFeGFtcGxlIHJhdyBsaW5lIGlucHV0OlxuICAgICAgICAvLyAgIDEwXFx0NVxcdHNyYy9maWxlL25hbWUudHNcbiAgICAgICAgLm1hcChsaW5lID0+IFtOdW1iZXIobGluZVswXSksIE51bWJlcihsaW5lWzFdKSwgbGluZVsyXV0gYXMgW251bWJlciwgbnVtYmVyLCBzdHJpbmddKVxuICAgICAgICAvLyBBZGQgZWFjaCBsaW5lJ3MgdmFsdWUgdG8gdGhlIGRpZmYgc3RhdHMsIGFuZCBjb25kaXRpb25hbGx5IHRvIHRoZSBnM1xuICAgICAgICAvLyBzdGF0cyBhcyB3ZWxsIGlmIHRoZSBmaWxlIG5hbWUgaXMgaW5jbHVkZWQgaW4gdGhlIGZpbGVzIHN5bmNlZCB0byBnMy5cbiAgICAgICAgLmZvckVhY2goKFtpbnNlcnRpb25zLCBkZWxldGlvbnMsIGZpbGVOYW1lXSkgPT4ge1xuICAgICAgICAgIGlmIChjaGVja01hdGNoQWdhaW5zdEluY2x1ZGVBbmRFeGNsdWRlKGZpbGVOYW1lLCBpbmNsdWRlRmlsZXMsIGV4Y2x1ZGVGaWxlcykpIHtcbiAgICAgICAgICAgIHN0YXRzLmluc2VydGlvbnMgKz0gaW5zZXJ0aW9ucztcbiAgICAgICAgICAgIHN0YXRzLmRlbGV0aW9ucyArPSBkZWxldGlvbnM7XG4gICAgICAgICAgICBzdGF0cy5maWxlcyArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIHN0YXRzO1xuICB9XG5cbiAgLyoqIERldGVybWluZSB3aGV0aGVyIHRoZSBmaWxlIG5hbWUgcGFzc2VzIGJvdGggaW5jbHVkZSBhbmQgZXhjbHVkZSBjaGVja3MuICovXG4gIGZ1bmN0aW9uIGNoZWNrTWF0Y2hBZ2FpbnN0SW5jbHVkZUFuZEV4Y2x1ZGUoXG4gICAgICBmaWxlOiBzdHJpbmcsIGluY2x1ZGVzOiBzdHJpbmdbXSwgZXhjbHVkZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgbXVsdGltYXRjaC5jYWxsKHVuZGVmaW5lZCwgZmlsZSwgaW5jbHVkZXMpLmxlbmd0aCA+PSAxICYmXG4gICAgICAgIG11bHRpbWF0Y2guY2FsbCh1bmRlZmluZWQsIGZpbGUsIGV4Y2x1ZGVzKS5sZW5ndGggPT09IDApO1xuICB9XG59XG4iXX0=