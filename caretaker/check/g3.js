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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBNEM7SUFDNUMsdUNBQXlDO0lBQ3pDLDZCQUEwQjtJQUMxQiw2QkFBd0M7SUFFeEMsa0VBQWtEO0lBQ2xELG9FQUFzRDtJQUd0RCwyRUFBMkU7SUFDM0UsU0FBc0IsaUJBQWlCLENBQUMsR0FBYzs7O1lBd0RwRDs7O2VBR0c7WUFDSCxTQUFTLFlBQVksQ0FBQyxHQUFjO2dCQUNsQyxxQ0FBcUM7Z0JBQ3JDLElBQU0sS0FBSyxHQUFHO29CQUNaLFVBQVUsRUFBRSxDQUFDO29CQUNiLFNBQVMsRUFBRSxDQUFDO29CQUNaLEtBQUssRUFBRSxDQUFDO29CQUNSLE9BQU8sRUFBRSxDQUFDO2lCQUNYLENBQUM7Z0JBR0YsaUVBQWlFO2dCQUNqRSxLQUFLLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBSyxLQUFLLFVBQUssU0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRWhHLG9EQUFvRDtnQkFDcEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBSyxLQUFLLFdBQU0sU0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3FCQUNwRCxNQUFNO29CQUNQLDZDQUE2QztxQkFDNUMsSUFBSSxFQUFFO29CQUNQLDJDQUEyQztxQkFDMUMsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFDWix5RUFBeUU7b0JBQ3pFLHVDQUF1QztxQkFDdEMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQztvQkFDOUIsOERBQThEO29C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QUFDO3FCQUM1RDtvQkFDRCxNQUFNLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO2lCQUN2RTtnQkFHSyxLQUFLLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVoQyx3REFBd0Q7Z0JBQ3hELEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUVwRCxjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLGNBQUksQ0FBSSxLQUFLLENBQUMsT0FBTyxtQ0FBZ0MsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO29CQUNyQixjQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztpQkFDMUM7cUJBQU07b0JBQ0wsY0FBSSxDQUFJLEtBQUssQ0FBQyxLQUFLLHdCQUFtQixLQUFLLENBQUMsVUFBVSx3QkFDbEQsS0FBSyxDQUFDLFNBQVMsb0RBQWlELENBQUMsQ0FBQztpQkFDdkU7Z0JBQ0QsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNoQixjQUFJLEVBQUUsQ0FBQzs7OztLQW1EUjtJQXhHRCw4Q0F3R0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jLCByZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG11bHRpbWF0Y2ggZnJvbSAnbXVsdGltYXRjaCc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtwYXJzZSBhcyBwYXJzZVlhbWx9IGZyb20gJ3lhbWwnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtib2xkLCBkZWJ1ZywgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0JztcblxuLyoqIENvbXBhcmUgdGhlIHVwc3RyZWFtIG1hc3RlciB0byB0aGUgdXBzdHJlYW0gZzMgYnJhbmNoLCBpZiBpdCBleGlzdHMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJpbnRHM0NvbXBhcmlzb24oZ2l0OiBHaXRDbGllbnQpIHtcbiAgY29uc3QgYW5ndWxhclJvYm90RmlsZVBhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksICcuZ2l0aHViL2FuZ3VsYXItcm9ib3QueW1sJyk7XG4gIGlmICghZXhpc3RzU3luYyhhbmd1bGFyUm9ib3RGaWxlUGF0aCkpIHtcbiAgICByZXR1cm4gZGVidWcoJ05vIGFuZ3VsYXIgcm9ib3QgY29uZmlndXJhdGlvbiBmaWxlIGV4aXN0cywgc2tpcHBpbmcuJyk7XG4gIH1cblxuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZGVmaW5lZCBmb3IgdGhlIGFuZ3VsYXIgcm9ib3QuICovXG4gIGNvbnN0IHJvYm90Q29uZmlnID0gcGFyc2VZYW1sKHJlYWRGaWxlU3luYyhhbmd1bGFyUm9ib3RGaWxlUGF0aCkudG9TdHJpbmcoKSk7XG4gIC8qKiBUaGUgZmlsZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIGczIHN5bmMuICovXG4gIGNvbnN0IGluY2x1ZGVGaWxlcyA9IHJvYm90Q29uZmlnPy5tZXJnZT8uZzNTdGF0dXM/LmluY2x1ZGUgfHwgW107XG4gIC8qKiBUaGUgZmlsZXMgdG8gYmUgZXhwZWN0ZWQgaW4gdGhlIGczIHN5bmMuICovXG4gIGNvbnN0IGV4Y2x1ZGVGaWxlcyA9IHJvYm90Q29uZmlnPy5tZXJnZT8uZzNTdGF0dXM/LmV4Y2x1ZGUgfHwgW107XG5cbiAgaWYgKGluY2x1ZGVGaWxlcy5sZW5ndGggPT09IDAgJiYgZXhjbHVkZUZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGRlYnVnKCdObyBnM1N0YXR1cyBpbmNsdWRlIG9yIGV4Y2x1ZGUgbGlzdHMgYXJlIGRlZmluZWQgaW4gdGhlIGFuZ3VsYXIgcm9ib3QgY29uZmlndXJhdGlvbiwnKTtcbiAgICBkZWJ1Zygnc2tpcHBpbmcuJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqIFJhbmRvbSBwcmVmaXggdG8gY3JlYXRlIHVuaXF1ZSBicmFuY2ggbmFtZXMuICovXG4gIGNvbnN0IHJhbmRvbVByZWZpeCA9IGBwcmVmaXgke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApfWA7XG4gIC8qKiBSZWYgbmFtZSBvZiB0aGUgdGVtcG9yYXJ5IG1hc3RlciBicmFuY2guICovXG4gIGNvbnN0IG1hc3RlclJlZiA9IGAke3JhbmRvbVByZWZpeH0tbWFzdGVyYDtcbiAgLyoqIFJlZiBuYW1lIG9mIHRoZSB0ZW1wb3JhcnkgZzMgYnJhbmNoLiAqL1xuICBjb25zdCBnM1JlZiA9IGAke3JhbmRvbVByZWZpeH0tZzNgO1xuICAvKiogVXJsIG9mIHRoZSByZWYgZm9yIGZldGNoaW5nIG1hc3RlciBhbmQgZzMgYnJhbmNoZXMuICovXG4gIGNvbnN0IHJlZlVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHtnaXQucmVtb3RlQ29uZmlnLm93bmVyfS8ke2dpdC5yZW1vdGVDb25maWcubmFtZX0uZ2l0YDtcbiAgLyoqIFRoZSByZXN1bHQgZm8gdGhlIGZldGNoIGNvbW1hbmQuICovXG4gIGNvbnN0IGZldGNoUmVzdWx0ID0gZ2l0LnJ1bkdyYWNlZnVsKFsnZmV0Y2gnLCByZWZVcmwsIGBtYXN0ZXI6JHttYXN0ZXJSZWZ9YCwgYGczOiR7ZzNSZWZ9YF0pO1xuXG4gIC8vIElmIHRoZSB1cHN0cmVhbSByZXBvc2l0b3J5IGRvZXMgbm90IGhhdmUgYSBnMyBicmFuY2ggdG8gY29tcGFyZSB0bywgc2tpcCB0aGUgY29tcGFyaXNvbi5cbiAgaWYgKGZldGNoUmVzdWx0LnN0YXR1cyAhPT0gMCkge1xuICAgIGlmIChmZXRjaFJlc3VsdC5zdGRlcnIuaW5jbHVkZXMoYGNvdWxkbid0IGZpbmQgcmVtb3RlIHJlZiBnM2ApKSB7XG4gICAgICByZXR1cm4gZGVidWcoJ05vIGczIGJyYW5jaCBleGlzdHMgb24gdXBzdHJlYW0sIHNraXBwaW5nLicpO1xuICAgIH1cbiAgICB0aHJvdyBFcnJvcignRmV0Y2ggb2YgbWFzdGVyIGFuZCBnMyBicmFuY2hlcyBmb3IgY29tcGFyaXNvbiBmYWlsZWQuJyk7XG4gIH1cblxuICAvKiogVGhlIHN0YXRpc3RpY2FsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBnaXQgZGlmZiBiZXR3ZWVuIG1hc3RlciBhbmQgZzMuICovXG4gIGNvbnN0IHN0YXRzID0gZ2V0RGlmZlN0YXRzKGdpdCk7XG5cbiAgLy8gRGVsZXRlIHRoZSB0ZW1wb3JhcmlseSBjcmVhdGVkIG1hdGVyIGFuZCBnMyBicmFuY2hlcy5cbiAgZ2l0LnJ1bkdyYWNlZnVsKFsnYnJhbmNoJywgJy1EJywgbWFzdGVyUmVmLCBnM1JlZl0pO1xuXG4gIGluZm8uZ3JvdXAoYm9sZCgnZzMgYnJhbmNoIGNoZWNrJykpO1xuICBpbmZvKGAke3N0YXRzLmNvbW1pdHN9IGNvbW1pdHMgYmV0d2VlbiBnMyBhbmQgbWFzdGVyYCk7XG4gIGlmIChzdGF0cy5maWxlcyA9PT0gMCkge1xuICAgIGluZm8oJ+KchSBObyBzeW5jIGlzIG5lZWRlZCBhdCB0aGlzIHRpbWUnKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGAke3N0YXRzLmZpbGVzfSBmaWxlcyBjaGFuZ2VkLCAke3N0YXRzLmluc2VydGlvbnN9IGluc2VydGlvbnMoKyksICR7XG4gICAgICAgIHN0YXRzLmRlbGV0aW9uc30gZGVsZXRpb25zKC0pIHdpbGwgYmUgaW5jbHVkZWQgaW4gdGhlIG5leHQgc3luY2ApO1xuICB9XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgaW5mbygpO1xuXG5cbiAgLyoqXG4gICAqIEdldCBnaXQgZGlmZiBzdGF0cyBiZXR3ZWVuIG1hc3RlciBhbmQgZzMsIGZvciBhbGwgZmlsZXMgYW5kIGZpbHRlcmVkIHRvIG9ubHkgZzMgYWZmZWN0aW5nXG4gICAqIGZpbGVzLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0RGlmZlN0YXRzKGdpdDogR2l0Q2xpZW50KSB7XG4gICAgLyoqIFRoZSBkaWZmIHN0YXRzIHRvIGJlIHJldHVybmVkLiAqL1xuICAgIGNvbnN0IHN0YXRzID0ge1xuICAgICAgaW5zZXJ0aW9uczogMCxcbiAgICAgIGRlbGV0aW9uczogMCxcbiAgICAgIGZpbGVzOiAwLFxuICAgICAgY29tbWl0czogMCxcbiAgICB9O1xuXG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIG51bWJlciBvZiBjb21taXRzIGJldHdlZW4gbWFzdGVyIGFuZCBnMyByZWZzLiAqL1xuICAgIHN0YXRzLmNvbW1pdHMgPSBwYXJzZUludChnaXQucnVuKFsncmV2LWxpc3QnLCAnLS1jb3VudCcsIGAke2czUmVmfS4uJHttYXN0ZXJSZWZ9YF0pLnN0ZG91dCwgMTApO1xuXG4gICAgLy8gR2V0IHRoZSBudW1zdGF0IGluZm9ybWF0aW9uIGJldHdlZW4gbWFzdGVyIGFuZCBnM1xuICAgIGdpdC5ydW4oWydkaWZmJywgYCR7ZzNSZWZ9Li4uJHttYXN0ZXJSZWZ9YCwgJy0tbnVtc3RhdCddKVxuICAgICAgICAuc3Rkb3V0XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZXh0cmEgc3BhY2UgYWZ0ZXIgZ2l0J3Mgb3V0cHV0LlxuICAgICAgICAudHJpbSgpXG4gICAgICAgIC8vIFNwbGl0IGVhY2ggbGluZSBvZiBnaXQgb3V0cHV0IGludG8gYXJyYXlcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgZnJvbSB0aGUgZ2l0IG91dHB1dCBpbnRvIGNvbXBvbmVudHMgcGFydHM6IGluc2VydGlvbnMsXG4gICAgICAgIC8vIGRlbGV0aW9ucyBhbmQgZmlsZSBuYW1lIHJlc3BlY3RpdmVseVxuICAgICAgICAubWFwKGxpbmUgPT4gbGluZS5zcGxpdCgnXFx0JykpXG4gICAgICAgIC8vIFBhcnNlIG51bWJlciB2YWx1ZSBmcm9tIHRoZSBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgdmFsdWVzXG4gICAgICAgIC8vIEV4YW1wbGUgcmF3IGxpbmUgaW5wdXQ6XG4gICAgICAgIC8vICAgMTBcXHQ1XFx0c3JjL2ZpbGUvbmFtZS50c1xuICAgICAgICAubWFwKGxpbmUgPT4gW051bWJlcihsaW5lWzBdKSwgTnVtYmVyKGxpbmVbMV0pLCBsaW5lWzJdXSBhcyBbbnVtYmVyLCBudW1iZXIsIHN0cmluZ10pXG4gICAgICAgIC8vIEFkZCBlYWNoIGxpbmUncyB2YWx1ZSB0byB0aGUgZGlmZiBzdGF0cywgYW5kIGNvbmRpdGlvbmFsbHkgdG8gdGhlIGczXG4gICAgICAgIC8vIHN0YXRzIGFzIHdlbGwgaWYgdGhlIGZpbGUgbmFtZSBpcyBpbmNsdWRlZCBpbiB0aGUgZmlsZXMgc3luY2VkIHRvIGczLlxuICAgICAgICAuZm9yRWFjaCgoW2luc2VydGlvbnMsIGRlbGV0aW9ucywgZmlsZU5hbWVdKSA9PiB7XG4gICAgICAgICAgaWYgKGNoZWNrTWF0Y2hBZ2FpbnN0SW5jbHVkZUFuZEV4Y2x1ZGUoZmlsZU5hbWUsIGluY2x1ZGVGaWxlcywgZXhjbHVkZUZpbGVzKSkge1xuICAgICAgICAgICAgc3RhdHMuaW5zZXJ0aW9ucyArPSBpbnNlcnRpb25zO1xuICAgICAgICAgICAgc3RhdHMuZGVsZXRpb25zICs9IGRlbGV0aW9ucztcbiAgICAgICAgICAgIHN0YXRzLmZpbGVzICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICByZXR1cm4gc3RhdHM7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGZpbGUgbmFtZSBwYXNzZXMgYm90aCBpbmNsdWRlIGFuZCBleGNsdWRlIGNoZWNrcy4gKi9cbiAgZnVuY3Rpb24gY2hlY2tNYXRjaEFnYWluc3RJbmNsdWRlQW5kRXhjbHVkZShcbiAgICAgIGZpbGU6IHN0cmluZywgaW5jbHVkZXM6IHN0cmluZ1tdLCBleGNsdWRlczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gbXVsdGltYXRjaChtdWx0aW1hdGNoKGZpbGUsIGluY2x1ZGVzKSwgZXhjbHVkZXMsIHtmbGlwTmVnYXRlOiB0cnVlfSkubGVuZ3RoICE9PSAwO1xuICB9XG59XG4iXX0=