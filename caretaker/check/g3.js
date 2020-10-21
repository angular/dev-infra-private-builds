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
                return multimatch(file, includes).length >= 1 && multimatch(file, excludes).length === 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBNEM7SUFDNUMsdUNBQXlDO0lBQ3pDLDZCQUEwQjtJQUMxQiw2QkFBd0M7SUFFeEMsa0VBQWtEO0lBQ2xELG9FQUFzRDtJQUd0RCwyRUFBMkU7SUFDM0UsU0FBc0IsaUJBQWlCLENBQUMsR0FBYzs7O1lBMkNwRCwrREFBK0Q7WUFDL0QsU0FBUyxxQkFBcUIsQ0FBQyxNQUFjO2dCQUMzQyx1Q0FBdUM7Z0JBQ3ZDLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7b0JBQ2xDLE9BQU8sRUFBRSxJQUFJO29CQUFFLHdCQUFzQixHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssU0FBSSxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksU0FBTTtvQkFDMUYsTUFBTTtpQkFDUCxDQUFDLENBQUM7Z0JBRUgsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUM7b0JBQ3hCLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLDhCQUE0QixNQUFRLENBQUMsRUFBRTtvQkFDckUsZUFBSyxDQUFDLFNBQU8sTUFBTSwyQ0FBd0MsQ0FBQyxDQUFDO29CQUM3RCxPQUFPLEtBQUssQ0FBQztpQkFDZDtnQkFDRCxPQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEUsQ0FBQztZQUVEOzs7ZUFHRztZQUNILFNBQVMsWUFBWTtnQkFDbkIscUNBQXFDO2dCQUNyQyxJQUFNLEtBQUssR0FBRztvQkFDWixVQUFVLEVBQUUsQ0FBQztvQkFDYixTQUFTLEVBQUUsQ0FBQztvQkFDWixLQUFLLEVBQUUsQ0FBQztvQkFD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SyxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVwQyxTQUFTLEdBQUcscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRWxELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQ3hCLHNCQUFPLGVBQUssQ0FBQyxxRUFBcUUsQ0FBQyxFQUFDO2lCQUNyRjtnQkFHSyxLQUFLLEdBQUcsWUFBWSxFQUFFLENBQUM7Z0JBRTdCLGNBQUksQ0FBQyxLQUFLLENBQUMsY0FBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDcEMsY0FBSSxDQUFJLEtBQUssQ0FBQyxPQUFPLG1DQUFnQyxDQUFDLENBQUM7Z0JBQ3ZELElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7b0JBQ3JCLGNBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO2lCQUMxQztxQkFBTTtvQkFDTCxjQUFJLENBQUksS0FBSyxDQUFDLEtBQUssd0JBQW1CLEtBQUssQ0FBQyxVQUFVLHdCQUNsRCxLQUFLLENBQUMsU0FBUyxvREFBaUQsQ0FBQyxDQUFDO2lCQUN2RTtnQkFDRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLGNBQUksRUFBRSxDQUFDOzs7O0tBa0VSO0lBMUdELDhDQTBHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4aXN0c1N5bmMsIHJlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgbXVsdGltYXRjaCBmcm9tICdtdWx0aW1hdGNoJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge3BhcnNlIGFzIHBhcnNlWWFtbH0gZnJvbSAneWFtbCc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2JvbGQsIGRlYnVnLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuXG4vKiogQ29tcGFyZSB0aGUgdXBzdHJlYW0gbWFzdGVyIHRvIHRoZSB1cHN0cmVhbSBnMyBicmFuY2gsIGlmIGl0IGV4aXN0cy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmludEczQ29tcGFyaXNvbihnaXQ6IEdpdENsaWVudCkge1xuICBjb25zdCBhbmd1bGFyUm9ib3RGaWxlUGF0aCA9IGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgJy5naXRodWIvYW5ndWxhci1yb2JvdC55bWwnKTtcbiAgaWYgKCFleGlzdHNTeW5jKGFuZ3VsYXJSb2JvdEZpbGVQYXRoKSkge1xuICAgIHJldHVybiBkZWJ1ZygnTm8gYW5ndWxhciByb2JvdCBjb25maWd1cmF0aW9uIGZpbGUgZXhpc3RzLCBza2lwcGluZy4nKTtcbiAgfVxuXG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciB0aGUgYW5ndWxhciByb2JvdC4gKi9cbiAgY29uc3Qgcm9ib3RDb25maWcgPSBwYXJzZVlhbWwocmVhZEZpbGVTeW5jKGFuZ3VsYXJSb2JvdEZpbGVQYXRoKS50b1N0cmluZygpKTtcbiAgLyoqIFRoZSBmaWxlcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgZzMgc3luYy4gKi9cbiAgY29uc3QgaW5jbHVkZUZpbGVzID0gcm9ib3RDb25maWc/Lm1lcmdlPy5nM1N0YXR1cz8uaW5jbHVkZSB8fCBbXTtcbiAgLyoqIFRoZSBmaWxlcyB0byBiZSBleHBlY3RlZCBpbiB0aGUgZzMgc3luYy4gKi9cbiAgY29uc3QgZXhjbHVkZUZpbGVzID0gcm9ib3RDb25maWc/Lm1lcmdlPy5nM1N0YXR1cz8uZXhjbHVkZSB8fCBbXTtcblxuICBpZiAoaW5jbHVkZUZpbGVzLmxlbmd0aCA9PT0gMCAmJiBleGNsdWRlRmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgZGVidWcoJ05vIGczU3RhdHVzIGluY2x1ZGUgb3IgZXhjbHVkZSBsaXN0cyBhcmUgZGVmaW5lZCBpbiB0aGUgYW5ndWxhciByb2JvdCBjb25maWd1cmF0aW9uLCcpO1xuICAgIGRlYnVnKCdza2lwcGluZy4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKiogVGhlIGxhdGVzdCBzaGEgZm9yIHRoZSBnMyBicmFuY2guICovXG4gIGNvbnN0IGczUmVmID0gZ2V0U2hhRm9yQnJhbmNoTGF0ZXN0KCdnMycpO1xuICAvKiogVGhlIGxhdGVzdCBzaGEgZm9yIHRoZSBtYXN0ZXIgYnJhbmNoLiAqL1xuICBjb25zdCBtYXN0ZXJSZWYgPSBnZXRTaGFGb3JCcmFuY2hMYXRlc3QoJ21hc3RlcicpO1xuXG4gIGlmICghZzNSZWYgJiYgIW1hc3RlclJlZikge1xuICAgIHJldHVybiBkZWJ1ZygnRXhpdGluZyBlYXJseSBhcyBlaXRoZXIgdGhlIGczIG9yIG1hc3RlciB3YXMgdW5hYmxlIHRvIGJlIHJldHJpZXZlZCcpO1xuICB9XG5cbiAgLyoqIFRoZSBzdGF0aXN0aWNhbCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZ2l0IGRpZmYgYmV0d2VlbiBtYXN0ZXIgYW5kIGczLiAqL1xuICBjb25zdCBzdGF0cyA9IGdldERpZmZTdGF0cygpO1xuXG4gIGluZm8uZ3JvdXAoYm9sZCgnZzMgYnJhbmNoIGNoZWNrJykpO1xuICBpbmZvKGAke3N0YXRzLmNvbW1pdHN9IGNvbW1pdHMgYmV0d2VlbiBnMyBhbmQgbWFzdGVyYCk7XG4gIGlmIChzdGF0cy5maWxlcyA9PT0gMCkge1xuICAgIGluZm8oJ+KchSBObyBzeW5jIGlzIG5lZWRlZCBhdCB0aGlzIHRpbWUnKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGAke3N0YXRzLmZpbGVzfSBmaWxlcyBjaGFuZ2VkLCAke3N0YXRzLmluc2VydGlvbnN9IGluc2VydGlvbnMoKyksICR7XG4gICAgICAgIHN0YXRzLmRlbGV0aW9uc30gZGVsZXRpb25zKC0pIHdpbGwgYmUgaW5jbHVkZWQgaW4gdGhlIG5leHQgc3luY2ApO1xuICB9XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgaW5mbygpO1xuXG5cbiAgLyoqIEZldGNoIGFuZCByZXRyaWV2ZSB0aGUgbGF0ZXN0IHNoYSBmb3IgYSBzcGVjaWZpYyBicmFuY2guICovXG4gIGZ1bmN0aW9uIGdldFNoYUZvckJyYW5jaExhdGVzdChicmFuY2g6IHN0cmluZykge1xuICAgIC8qKiBUaGUgcmVzdWx0IGZvIHRoZSBmZXRjaCBjb21tYW5kLiAqL1xuICAgIGNvbnN0IGZldGNoUmVzdWx0ID0gZ2l0LnJ1bkdyYWNlZnVsKFtcbiAgICAgICdmZXRjaCcsICctcScsIGBodHRwczovL2dpdGh1Yi5jb20vJHtnaXQucmVtb3RlQ29uZmlnLm93bmVyfS8ke2dpdC5yZW1vdGVDb25maWcubmFtZX0uZ2l0YCxcbiAgICAgIGJyYW5jaFxuICAgIF0pO1xuXG4gICAgaWYgKGZldGNoUmVzdWx0LnN0YXR1cyAhPT0gMCAmJlxuICAgICAgICBmZXRjaFJlc3VsdC5zdGRlcnIuaW5jbHVkZXMoYGNvdWxkbid0IGZpbmQgcmVtb3RlIHJlZiAke2JyYW5jaH1gKSkge1xuICAgICAgZGVidWcoYE5vICcke2JyYW5jaH0nIGJyYW5jaCBleGlzdHMgb24gdXBzdHJlYW0sIHNraXBwaW5nLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZ2l0LnJ1bkdyYWNlZnVsKFsncmV2LXBhcnNlJywgJ0ZFVENIX0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZ2l0IGRpZmYgc3RhdHMgYmV0d2VlbiBtYXN0ZXIgYW5kIGczLCBmb3IgYWxsIGZpbGVzIGFuZCBmaWx0ZXJlZCB0byBvbmx5IGczIGFmZmVjdGluZ1xuICAgKiBmaWxlcy5cbiAgICovXG4gIGZ1bmN0aW9uIGdldERpZmZTdGF0cygpIHtcbiAgICAvKiogVGhlIGRpZmYgc3RhdHMgdG8gYmUgcmV0dXJuZWQuICovXG4gICAgY29uc3Qgc3RhdHMgPSB7XG4gICAgICBpbnNlcnRpb25zOiAwLFxuICAgICAgZGVsZXRpb25zOiAwLFxuICAgICAgZmlsZXM6IDAsXG4gICAgICBjb21taXRzOiAwLFxuICAgIH07XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIG51bWJlciBvZiBjb21taXRzIGJldHdlZW4gbWFzdGVyIGFuZCBnMyByZWZzLiAqL1xuICAgIHN0YXRzLmNvbW1pdHMgPSBwYXJzZUludChnaXQucnVuKFsncmV2LWxpc3QnLCAnLS1jb3VudCcsIGAke2czUmVmfS4uJHttYXN0ZXJSZWZ9YF0pLnN0ZG91dCwgMTApO1xuXG4gICAgLy8gR2V0IHRoZSBudW1zdGF0IGluZm9ybWF0aW9uIGJldHdlZW4gbWFzdGVyIGFuZCBnM1xuICAgIGdpdC5ydW4oWydkaWZmJywgYCR7ZzNSZWZ9Li4uJHttYXN0ZXJSZWZ9YCwgJy0tbnVtc3RhdCddKVxuICAgICAgICAuc3Rkb3V0XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZXh0cmEgc3BhY2UgYWZ0ZXIgZ2l0J3Mgb3V0cHV0LlxuICAgICAgICAudHJpbSgpXG4gICAgICAgIC8vIFNwbGl0IGVhY2ggbGluZSBvZiBnaXQgb3V0cHV0IGludG8gYXJyYXlcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgZnJvbSB0aGUgZ2l0IG91dHB1dCBpbnRvIGNvbXBvbmVudHMgcGFydHM6IGluc2VydGlvbnMsXG4gICAgICAgIC8vIGRlbGV0aW9ucyBhbmQgZmlsZSBuYW1lIHJlc3BlY3RpdmVseVxuICAgICAgICAubWFwKGxpbmUgPT4gbGluZS5zcGxpdCgnXFx0JykpXG4gICAgICAgIC8vIFBhcnNlIG51bWJlciB2YWx1ZSBmcm9tIHRoZSBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgdmFsdWVzXG4gICAgICAgIC8vIEV4YW1wbGUgcmF3IGxpbmUgaW5wdXQ6XG4gICAgICAgIC8vICAgMTBcXHQ1XFx0c3JjL2ZpbGUvbmFtZS50c1xuICAgICAgICAubWFwKGxpbmUgPT4gW051bWJlcihsaW5lWzBdKSwgTnVtYmVyKGxpbmVbMV0pLCBsaW5lWzJdXSBhcyBbbnVtYmVyLCBudW1iZXIsIHN0cmluZ10pXG4gICAgICAgIC8vIEFkZCBlYWNoIGxpbmUncyB2YWx1ZSB0byB0aGUgZGlmZiBzdGF0cywgYW5kIGNvbmRpdGlvbmFsbHkgdG8gdGhlIGczXG4gICAgICAgIC8vIHN0YXRzIGFzIHdlbGwgaWYgdGhlIGZpbGUgbmFtZSBpcyBpbmNsdWRlZCBpbiB0aGUgZmlsZXMgc3luY2VkIHRvIGczLlxuICAgICAgICAuZm9yRWFjaCgoW2luc2VydGlvbnMsIGRlbGV0aW9ucywgZmlsZU5hbWVdKSA9PiB7XG4gICAgICAgICAgaWYgKGNoZWNrTWF0Y2hBZ2FpbnN0SW5jbHVkZUFuZEV4Y2x1ZGUoZmlsZU5hbWUsIGluY2x1ZGVGaWxlcywgZXhjbHVkZUZpbGVzKSkge1xuICAgICAgICAgICAgc3RhdHMuaW5zZXJ0aW9ucyArPSBpbnNlcnRpb25zO1xuICAgICAgICAgICAgc3RhdHMuZGVsZXRpb25zICs9IGRlbGV0aW9ucztcbiAgICAgICAgICAgIHN0YXRzLmZpbGVzICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICByZXR1cm4gc3RhdHM7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGZpbGUgbmFtZSBwYXNzZXMgYm90aCBpbmNsdWRlIGFuZCBleGNsdWRlIGNoZWNrcy4gKi9cbiAgZnVuY3Rpb24gY2hlY2tNYXRjaEFnYWluc3RJbmNsdWRlQW5kRXhjbHVkZShcbiAgICAgIGZpbGU6IHN0cmluZywgaW5jbHVkZXM6IHN0cmluZ1tdLCBleGNsdWRlczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gbXVsdGltYXRjaChmaWxlLCBpbmNsdWRlcykubGVuZ3RoID49IDEgJiYgbXVsdGltYXRjaChmaWxlLCBleGNsdWRlcykubGVuZ3RoID09PSAwO1xuICB9XG59XG4iXX0=