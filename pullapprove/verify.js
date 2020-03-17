(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/verify", ["require", "exports", "tslib", "fs", "minimatch", "path", "shelljs", "yaml"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var fs_1 = require("fs");
    var minimatch_1 = require("minimatch");
    var path = require("path");
    var shelljs_1 = require("shelljs");
    var yaml_1 = require("yaml");
    function verify() {
        // Exit early on shelljs errors
        shelljs_1.set('-e');
        // Regex Matcher for contains_any_globs conditions
        var CONTAINS_ANY_GLOBS_REGEX = /^'([^']+)',?$/;
        // Full path of the angular project directory
        var ANGULAR_PROJECT_DIR = process.cwd();
        // Change to the Angular project directory
        shelljs_1.cd(ANGULAR_PROJECT_DIR);
        // Whether to log verbosely
        var VERBOSE_MODE = process.argv.includes('-v');
        // Full path to PullApprove config file
        var PULL_APPROVE_YAML_PATH = path.resolve(ANGULAR_PROJECT_DIR, '.pullapprove.yml');
        // All relative path file names in the git repo, this is retrieved using git rather
        // that a glob so that we only get files that are checked in, ignoring things like
        // node_modules, .bazelrc.user, etc
        var ALL_FILES = shelljs_1.exec('git ls-tree --full-tree -r --name-only HEAD', { silent: true })
            .trim()
            .split('\n')
            .filter(function (_) { return !!_; });
        if (!ALL_FILES.length) {
            console.error("No files were found to be in the git tree, did you run this command from \n" +
                "inside the angular repository?");
            process.exit(1);
        }
        /** Gets the glob matching information from each group's condition. */
        function getGlobMatchersFromCondition(groupName, condition) {
            var trimmedCondition = condition.trim();
            var globMatchers = [];
            var badConditionLines = [];
            // If the condition starts with contains_any_globs, evaluate all of the globs
            if (trimmedCondition.startsWith('contains_any_globs')) {
                trimmedCondition.split('\n')
                    .slice(1, -1)
                    .map(function (glob) {
                    var trimmedGlob = glob.trim();
                    var match = trimmedGlob.match(CONTAINS_ANY_GLOBS_REGEX);
                    if (!match) {
                        badConditionLines.push(trimmedGlob);
                        return '';
                    }
                    return match[1];
                })
                    .filter(function (globString) { return !!globString; })
                    .forEach(function (globString) { return globMatchers.push({
                    group: groupName,
                    glob: globString,
                    matcher: new minimatch_1.Minimatch(globString, { dot: true }),
                    matchCount: 0,
                }); });
            }
            return [globMatchers, badConditionLines];
        }
        /** Create logs for each review group. */
        function logGroups(groups) {
            Array.from(groups.entries()).sort().forEach(function (_a) {
                var _b = tslib_1.__read(_a, 2), groupName = _b[0], globs = _b[1];
                console.groupCollapsed(groupName);
                Array.from(globs.values())
                    .sort(function (a, b) { return b.matchCount - a.matchCount; })
                    .forEach(function (glob) { return console.info(glob.glob + " - " + glob.matchCount); });
                console.groupEnd();
            });
        }
        /** Logs a header within a text drawn box. */
        function logHeader() {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            var totalWidth = 80;
            var fillWidth = totalWidth - 2;
            var headerText = params.join(' ').substr(0, fillWidth);
            var leftSpace = Math.ceil((fillWidth - headerText.length) / 2);
            var rightSpace = fillWidth - leftSpace - headerText.length;
            var fill = function (count, content) { return content.repeat(count); };
            console.info("\u250C" + fill(fillWidth, '─') + "\u2510");
            console.info("\u2502" + fill(leftSpace, ' ') + headerText + fill(rightSpace, ' ') + "\u2502");
            console.info("\u2514" + fill(fillWidth, '─') + "\u2518");
        }
        /** Runs the pull approve verification check on provided files. */
        function runVerification(files) {
            var e_1, _a;
            // All of the globs created for each group's conditions.
            var allGlobs = [];
            // The pull approve config file.
            var pullApprove = fs_1.readFileSync(PULL_APPROVE_YAML_PATH, { encoding: 'utf8' });
            // All of the PullApprove groups, parsed from the PullApprove yaml file.
            var parsedPullApproveGroups = yaml_1.parse(pullApprove).groups;
            // All files which were found to match a condition in PullApprove.
            var matchedFiles = new Set();
            // All files which were not found to match a condition in PullApprove.
            var unmatchedFiles = new Set();
            // All PullApprove groups which matched at least one file.
            var matchedGroups = new Map();
            // All PullApprove groups which did not match at least one file.
            var unmatchedGroups = new Map();
            // All condition lines which were not able to be correctly parsed, by group.
            var badConditionLinesByGroup = new Map();
            // Total number of condition lines which were not able to be correctly parsed.
            var badConditionLineCount = 0;
            // Get all of the globs from the PullApprove group conditions.
            Object.entries(parsedPullApproveGroups).forEach(function (_a) {
                var e_2, _b;
                var _c = tslib_1.__read(_a, 2), groupName = _c[0], group = _c[1];
                try {
                    for (var _d = tslib_1.__values(group.conditions), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var condition = _e.value;
                        var _f = tslib_1.__read(getGlobMatchersFromCondition(groupName, condition), 2), matchers = _f[0], badConditions = _f[1];
                        if (badConditions.length) {
                            badConditionLinesByGroup.set(groupName, badConditions);
                            badConditionLineCount += badConditions.length;
                        }
                        allGlobs.push.apply(allGlobs, tslib_1.__spread(matchers));
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            });
            if (badConditionLineCount) {
                console.info("Discovered " + badConditionLineCount + " parsing errors in PullApprove conditions");
                console.info("Attempted parsing using: " + CONTAINS_ANY_GLOBS_REGEX);
                console.info();
                console.info("Unable to properly parse the following line(s) by group:");
                badConditionLinesByGroup.forEach(function (badConditionLines, groupName) {
                    console.info("- " + groupName + ":");
                    badConditionLines.forEach(function (line) { return console.info("    " + line); });
                });
                console.info();
                console.info("Please correct the invalid conditions, before PullApprove verification can be completed");
                process.exit(1);
            }
            var _loop_1 = function (file) {
                var matched = allGlobs.filter(function (glob) { return glob.matcher.match(file); });
                matched.length ? matchedFiles.add(file) : unmatchedFiles.add(file);
                matched.forEach(function (glob) { return glob.matchCount++; });
            };
            try {
                // Check each file for if it is matched by a PullApprove condition.
                for (var files_1 = tslib_1.__values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                    var file = files_1_1.value;
                    _loop_1(file);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Add each glob for each group to a map either matched or unmatched.
            allGlobs.forEach(function (glob) {
                var groups = glob.matchCount ? matchedGroups : unmatchedGroups;
                var globs = groups.get(glob.group) || new Map();
                // Set the globs map in the groups map
                groups.set(glob.group, globs);
                // Set the glob in the globs map
                globs.set(glob.glob, glob);
            });
            // PullApprove is considered verified if no files or groups are found to be unsed.
            var verificationSucceeded = !(unmatchedFiles.size || unmatchedGroups.size);
            /**
             * Overall result
             */
            logHeader('Result');
            if (verificationSucceeded) {
                console.info('PullApprove verification succeeded!');
            }
            else {
                console.info("PullApprove verification failed.\n");
                console.info("Please update '.pullapprove.yml' to ensure that all necessary");
                console.info("files/directories have owners and all patterns that appear in");
                console.info("the file correspond to actual files/directories in the repo.");
            }
            /**
             * File by file Summary
             */
            logHeader('PullApprove file match results');
            console.groupCollapsed("Matched Files (" + matchedFiles.size + " files)");
            VERBOSE_MODE && matchedFiles.forEach(function (file) { return console.info(file); });
            console.groupEnd();
            console.groupCollapsed("Unmatched Files (" + unmatchedFiles.size + " files)");
            unmatchedFiles.forEach(function (file) { return console.info(file); });
            console.groupEnd();
            /**
             * Group by group Summary
             */
            logHeader('PullApprove group matches');
            console.groupCollapsed("Matched Groups (" + matchedGroups.size + " groups)");
            VERBOSE_MODE && logGroups(matchedGroups);
            console.groupEnd();
            console.groupCollapsed("Unmatched Groups (" + unmatchedGroups.size + " groups)");
            logGroups(unmatchedGroups);
            console.groupEnd();
            // Provide correct exit code based on verification success.
            process.exit(verificationSucceeded ? 0 : 1);
        }
        runVerification(ALL_FILES);
    }
    exports.verify = verify;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCx5QkFBZ0M7SUFDaEMsdUNBQWdEO0lBQ2hELDJCQUE2QjtJQUM3QixtQ0FBc0M7SUFDdEMsNkJBQXdDO0lBU3hDLFNBQWdCLE1BQU07UUFDcEIsK0JBQStCO1FBQy9CLGFBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVWLGtEQUFrRDtRQUNsRCxJQUFNLHdCQUF3QixHQUFHLGVBQWUsQ0FBQztRQUNqRCw2Q0FBNkM7UUFDN0MsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDMUMsMENBQTBDO1FBQzFDLFlBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRXhCLDJCQUEyQjtRQUMzQixJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCx1Q0FBdUM7UUFDdkMsSUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDckYsbUZBQW1GO1FBQ25GLGtGQUFrRjtRQUNsRixtQ0FBbUM7UUFDbkMsSUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLDZDQUE2QyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDO2FBQzlELElBQUksRUFBRTthQUNOLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDWCxNQUFNLENBQUMsVUFBQyxDQUFTLElBQUssT0FBQSxDQUFDLENBQUMsQ0FBQyxFQUFILENBQUcsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQ1QsNkVBQTZFO2dCQUM3RSxn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QUFFLENBQUM7WUFDbkIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxzQkFBb0IsY0FBYyxDQUFDLElBQUksWUFBUyxDQUFDLENBQUM7WUFDekUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQztZQUNuRCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFbkI7O2VBRUc7WUFDSCxTQUFTLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUN2QyxPQUFPLENBQUMsY0FBYyxDQUFDLHFCQUFtQixhQUFhLENBQUMsSUFBSSxhQUFVLENBQUMsQ0FBQztZQUN4RSxZQUFZLElBQUksU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQixPQUFPLENBQUMsY0FBYyxDQUFDLHVCQUFxQixlQUFlLENBQUMsSUFBSSxhQUFVLENBQUMsQ0FBQztZQUM1RSxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDM0IsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRW5CLDJEQUEyRDtZQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFHRCxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQWxNRCx3QkFrTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtJTWluaW1hdGNoLCBNaW5pbWF0Y2h9IGZyb20gJ21pbmltYXRjaCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtjZCwgZXhlYywgc2V0fSBmcm9tICdzaGVsbGpzJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VZYW1sfSBmcm9tICd5YW1sJztcblxuaW50ZXJmYWNlIEdsb2JNYXRjaGVyIHtcbiAgZ3JvdXA6IHN0cmluZztcbiAgZ2xvYjogc3RyaW5nO1xuICBtYXRjaGVyOiBJTWluaW1hdGNoO1xuICBtYXRjaENvdW50OiBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnkoKSB7XG4gIC8vIEV4aXQgZWFybHkgb24gc2hlbGxqcyBlcnJvcnNcbiAgc2V0KCctZScpO1xuXG4gIC8vIFJlZ2V4IE1hdGNoZXIgZm9yIGNvbnRhaW5zX2FueV9nbG9icyBjb25kaXRpb25zXG4gIGNvbnN0IENPTlRBSU5TX0FOWV9HTE9CU19SRUdFWCA9IC9eJyhbXiddKyknLD8kLztcbiAgLy8gRnVsbCBwYXRoIG9mIHRoZSBhbmd1bGFyIHByb2plY3QgZGlyZWN0b3J5XG4gIGNvbnN0IEFOR1VMQVJfUFJPSkVDVF9ESVIgPSBwcm9jZXNzLmN3ZCgpO1xuICAvLyBDaGFuZ2UgdG8gdGhlIEFuZ3VsYXIgcHJvamVjdCBkaXJlY3RvcnlcbiAgY2QoQU5HVUxBUl9QUk9KRUNUX0RJUik7XG5cbiAgLy8gV2hldGhlciB0byBsb2cgdmVyYm9zZWx5XG4gIGNvbnN0IFZFUkJPU0VfTU9ERSA9IHByb2Nlc3MuYXJndi5pbmNsdWRlcygnLXYnKTtcbiAgLy8gRnVsbCBwYXRoIHRvIFB1bGxBcHByb3ZlIGNvbmZpZyBmaWxlXG4gIGNvbnN0IFBVTExfQVBQUk9WRV9ZQU1MX1BBVEggPSBwYXRoLnJlc29sdmUoQU5HVUxBUl9QUk9KRUNUX0RJUiwgJy5wdWxsYXBwcm92ZS55bWwnKTtcbiAgLy8gQWxsIHJlbGF0aXZlIHBhdGggZmlsZSBuYW1lcyBpbiB0aGUgZ2l0IHJlcG8sIHRoaXMgaXMgcmV0cmlldmVkIHVzaW5nIGdpdCByYXRoZXJcbiAgLy8gdGhhdCBhIGdsb2Igc28gdGhhdCB3ZSBvbmx5IGdldCBmaWxlcyB0aGF0IGFyZSBjaGVja2VkIGluLCBpZ25vcmluZyB0aGluZ3MgbGlrZVxuICAvLyBub2RlX21vZHVsZXMsIC5iYXplbHJjLnVzZXIsIGV0Y1xuICBjb25zdCBBTExfRklMRVMgPSBleGVjKCdnaXQgbHMtdHJlZSAtLWZ1bGwtdHJlZSAtciAtLW5hbWUtb25seSBIRUFEJywge3NpbGVudDogdHJ1ZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudHJpbSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChfOiBzdHJpbmcpID0+ICEhXyk7XG4gIGlmICghQUxMX0ZJTEVTLmxlbmd0aCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIGBObyBmaWxlcyB3ZXJlIGZvdW5kIHRvIGJlIGluIHRoZSBnaXQgdHJlZSwgZGlkIHlvdSBydW4gdGhpcyBjb21tYW5kIGZyb20gXFxuYCArXG4gICAgICAgIGBpbnNpZGUgdGhlIGFuZ3VsYXIgcmVwb3NpdG9yeT9gKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZ2xvYiBtYXRjaGluZyBpbmZvcm1hdGlvbiBmcm9tIGVhY2ggZ3JvdXAncyBjb25kaXRpb24uICovXG4gIGZ1bmN0aW9uIGdldEdsb2JNYXRjaGVyc0Zyb21Db25kaXRpb24oXG4gICAgICBncm91cE5hbWU6IHN0cmluZywgY29uZGl0aW9uOiBzdHJpbmcpOiBbR2xvYk1hdGNoZXJbXSwgc3RyaW5nW11dIHtcbiAgICBjb25zdCB0cmltbWVkQ29uZGl0aW9uID0gY29uZGl0aW9uLnRyaW0oKTtcbiAgICBjb25zdCBnbG9iTWF0Y2hlcnM6IEdsb2JNYXRjaGVyW10gPSBbXTtcbiAgICBjb25zdCBiYWRDb25kaXRpb25MaW5lczogc3RyaW5nW10gPSBbXTtcblxuICAgIC8vIElmIHRoZSBjb25kaXRpb24gc3RhcnRzIHdpdGggY29udGFpbnNfYW55X2dsb2JzLCBldmFsdWF0ZSBhbGwgb2YgdGhlIGdsb2JzXG4gICAgaWYgKHRyaW1tZWRDb25kaXRpb24uc3RhcnRzV2l0aCgnY29udGFpbnNfYW55X2dsb2JzJykpIHtcbiAgICAgIHRyaW1tZWRDb25kaXRpb24uc3BsaXQoJ1xcbicpXG4gICAgICAgICAgLnNsaWNlKDEsIC0xKVxuICAgICAgICAgIC5tYXAoZ2xvYiA9PiB7XG4gICAgICAgICAgICBjb25zdCB0cmltbWVkR2xvYiA9IGdsb2IudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSB0cmltbWVkR2xvYi5tYXRjaChDT05UQUlOU19BTllfR0xPQlNfUkVHRVgpO1xuICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgICBiYWRDb25kaXRpb25MaW5lcy5wdXNoKHRyaW1tZWRHbG9iKTtcbiAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoWzFdO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbHRlcihnbG9iU3RyaW5nID0+ICEhZ2xvYlN0cmluZylcbiAgICAgICAgICAuZm9yRWFjaChnbG9iU3RyaW5nID0+IGdsb2JNYXRjaGVycy5wdXNoKHtcbiAgICAgICAgICAgIGdyb3VwOiBncm91cE5hbWUsXG4gICAgICAgICAgICBnbG9iOiBnbG9iU3RyaW5nLFxuICAgICAgICAgICAgbWF0Y2hlcjogbmV3IE1pbmltYXRjaChnbG9iU3RyaW5nLCB7ZG90OiB0cnVlfSksXG4gICAgICAgICAgICBtYXRjaENvdW50OiAwLFxuICAgICAgICAgIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIFtnbG9iTWF0Y2hlcnMsIGJhZENvbmRpdGlvbkxpbmVzXTtcbiAgfVxuXG4gIC8qKiBDcmVhdGUgbG9ncyBmb3IgZWFjaCByZXZpZXcgZ3JvdXAuICovXG4gIGZ1bmN0aW9uIGxvZ0dyb3Vwcyhncm91cHM6IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIEdsb2JNYXRjaGVyPj4pIHtcbiAgICBBcnJheS5mcm9tKGdyb3Vwcy5lbnRyaWVzKCkpLnNvcnQoKS5mb3JFYWNoKChbZ3JvdXBOYW1lLCBnbG9ic10pID0+IHtcbiAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoZ3JvdXBOYW1lKTtcbiAgICAgIEFycmF5LmZyb20oZ2xvYnMudmFsdWVzKCkpXG4gICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIubWF0Y2hDb3VudCAtIGEubWF0Y2hDb3VudClcbiAgICAgICAgICAuZm9yRWFjaChnbG9iID0+IGNvbnNvbGUuaW5mbyhgJHtnbG9iLmdsb2J9IC0gJHtnbG9iLm1hdGNoQ291bnR9YCkpO1xuICAgICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIExvZ3MgYSBoZWFkZXIgd2l0aGluIGEgdGV4dCBkcmF3biBib3guICovXG4gIGZ1bmN0aW9uIGxvZ0hlYWRlciguLi5wYXJhbXM6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgdG90YWxXaWR0aCA9IDgwO1xuICAgIGNvbnN0IGZpbGxXaWR0aCA9IHRvdGFsV2lkdGggLSAyO1xuICAgIGNvbnN0IGhlYWRlclRleHQgPSBwYXJhbXMuam9pbignICcpLnN1YnN0cigwLCBmaWxsV2lkdGgpO1xuICAgIGNvbnN0IGxlZnRTcGFjZSA9IE1hdGguY2VpbCgoZmlsbFdpZHRoIC0gaGVhZGVyVGV4dC5sZW5ndGgpIC8gMik7XG4gICAgY29uc3QgcmlnaHRTcGFjZSA9IGZpbGxXaWR0aCAtIGxlZnRTcGFjZSAtIGhlYWRlclRleHQubGVuZ3RoO1xuICAgIGNvbnN0IGZpbGwgPSAoY291bnQ6IG51bWJlciwgY29udGVudDogc3RyaW5nKSA9PiBjb250ZW50LnJlcGVhdChjb3VudCk7XG5cbiAgICBjb25zb2xlLmluZm8oYOKUjCR7ZmlsbChmaWxsV2lkdGgsICfilIAnKX3ilJBgKTtcbiAgICBjb25zb2xlLmluZm8oYOKUgiR7ZmlsbChsZWZ0U3BhY2UsICcgJyl9JHtoZWFkZXJUZXh0fSR7ZmlsbChyaWdodFNwYWNlLCAnICcpfeKUgmApO1xuICAgIGNvbnNvbGUuaW5mbyhg4pSUJHtmaWxsKGZpbGxXaWR0aCwgJ+KUgCcpfeKUmGApO1xuICB9XG5cbiAgLyoqIFJ1bnMgdGhlIHB1bGwgYXBwcm92ZSB2ZXJpZmljYXRpb24gY2hlY2sgb24gcHJvdmlkZWQgZmlsZXMuICovXG4gIGZ1bmN0aW9uIHJ1blZlcmlmaWNhdGlvbihmaWxlczogc3RyaW5nW10pIHtcbiAgICAvLyBBbGwgb2YgdGhlIGdsb2JzIGNyZWF0ZWQgZm9yIGVhY2ggZ3JvdXAncyBjb25kaXRpb25zLlxuICAgIGNvbnN0IGFsbEdsb2JzOiBHbG9iTWF0Y2hlcltdID0gW107XG4gICAgLy8gVGhlIHB1bGwgYXBwcm92ZSBjb25maWcgZmlsZS5cbiAgICBjb25zdCBwdWxsQXBwcm92ZSA9IHJlYWRGaWxlU3luYyhQVUxMX0FQUFJPVkVfWUFNTF9QQVRILCB7ZW5jb2Rpbmc6ICd1dGY4J30pO1xuICAgIC8vIEFsbCBvZiB0aGUgUHVsbEFwcHJvdmUgZ3JvdXBzLCBwYXJzZWQgZnJvbSB0aGUgUHVsbEFwcHJvdmUgeWFtbCBmaWxlLlxuICAgIGNvbnN0IHBhcnNlZFB1bGxBcHByb3ZlR3JvdXBzID1cbiAgICAgICAgcGFyc2VZYW1sKHB1bGxBcHByb3ZlKS5ncm91cHMgYXN7W2tleTogc3RyaW5nXToge2NvbmRpdGlvbnM6IHN0cmluZ319O1xuICAgIC8vIEFsbCBmaWxlcyB3aGljaCB3ZXJlIGZvdW5kIHRvIG1hdGNoIGEgY29uZGl0aW9uIGluIFB1bGxBcHByb3ZlLlxuICAgIGNvbnN0IG1hdGNoZWRGaWxlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIC8vIEFsbCBmaWxlcyB3aGljaCB3ZXJlIG5vdCBmb3VuZCB0byBtYXRjaCBhIGNvbmRpdGlvbiBpbiBQdWxsQXBwcm92ZS5cbiAgICBjb25zdCB1bm1hdGNoZWRGaWxlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIC8vIEFsbCBQdWxsQXBwcm92ZSBncm91cHMgd2hpY2ggbWF0Y2hlZCBhdCBsZWFzdCBvbmUgZmlsZS5cbiAgICBjb25zdCBtYXRjaGVkR3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIEdsb2JNYXRjaGVyPj4oKTtcbiAgICAvLyBBbGwgUHVsbEFwcHJvdmUgZ3JvdXBzIHdoaWNoIGRpZCBub3QgbWF0Y2ggYXQgbGVhc3Qgb25lIGZpbGUuXG4gICAgY29uc3QgdW5tYXRjaGVkR3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIEdsb2JNYXRjaGVyPj4oKTtcbiAgICAvLyBBbGwgY29uZGl0aW9uIGxpbmVzIHdoaWNoIHdlcmUgbm90IGFibGUgdG8gYmUgY29ycmVjdGx5IHBhcnNlZCwgYnkgZ3JvdXAuXG4gICAgY29uc3QgYmFkQ29uZGl0aW9uTGluZXNCeUdyb3VwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuICAgIC8vIFRvdGFsIG51bWJlciBvZiBjb25kaXRpb24gbGluZXMgd2hpY2ggd2VyZSBub3QgYWJsZSB0byBiZSBjb3JyZWN0bHkgcGFyc2VkLlxuICAgIGxldCBiYWRDb25kaXRpb25MaW5lQ291bnQgPSAwO1xuXG4gICAgLy8gR2V0IGFsbCBvZiB0aGUgZ2xvYnMgZnJvbSB0aGUgUHVsbEFwcHJvdmUgZ3JvdXAgY29uZGl0aW9ucy5cbiAgICBPYmplY3QuZW50cmllcyhwYXJzZWRQdWxsQXBwcm92ZUdyb3VwcykuZm9yRWFjaCgoW2dyb3VwTmFtZSwgZ3JvdXBdKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGNvbmRpdGlvbiBvZiBncm91cC5jb25kaXRpb25zKSB7XG4gICAgICAgIGNvbnN0IFttYXRjaGVycywgYmFkQ29uZGl0aW9uc10gPSBnZXRHbG9iTWF0Y2hlcnNGcm9tQ29uZGl0aW9uKGdyb3VwTmFtZSwgY29uZGl0aW9uKTtcbiAgICAgICAgaWYgKGJhZENvbmRpdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgYmFkQ29uZGl0aW9uTGluZXNCeUdyb3VwLnNldChncm91cE5hbWUsIGJhZENvbmRpdGlvbnMpO1xuICAgICAgICAgIGJhZENvbmRpdGlvbkxpbmVDb3VudCArPSBiYWRDb25kaXRpb25zLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBhbGxHbG9icy5wdXNoKC4uLm1hdGNoZXJzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChiYWRDb25kaXRpb25MaW5lQ291bnQpIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhgRGlzY292ZXJlZCAke2JhZENvbmRpdGlvbkxpbmVDb3VudH0gcGFyc2luZyBlcnJvcnMgaW4gUHVsbEFwcHJvdmUgY29uZGl0aW9uc2ApO1xuICAgICAgY29uc29sZS5pbmZvKGBBdHRlbXB0ZWQgcGFyc2luZyB1c2luZzogJHtDT05UQUlOU19BTllfR0xPQlNfUkVHRVh9YCk7XG4gICAgICBjb25zb2xlLmluZm8oKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgVW5hYmxlIHRvIHByb3Blcmx5IHBhcnNlIHRoZSBmb2xsb3dpbmcgbGluZShzKSBieSBncm91cDpgKTtcbiAgICAgIGJhZENvbmRpdGlvbkxpbmVzQnlHcm91cC5mb3JFYWNoKChiYWRDb25kaXRpb25MaW5lcywgZ3JvdXBOYW1lKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhgLSAke2dyb3VwTmFtZX06YCk7XG4gICAgICAgIGJhZENvbmRpdGlvbkxpbmVzLmZvckVhY2gobGluZSA9PiBjb25zb2xlLmluZm8oYCAgICAke2xpbmV9YCkpO1xuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmluZm8oKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgICBgUGxlYXNlIGNvcnJlY3QgdGhlIGludmFsaWQgY29uZGl0aW9ucywgYmVmb3JlIFB1bGxBcHByb3ZlIHZlcmlmaWNhdGlvbiBjYW4gYmUgY29tcGxldGVkYCk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZWFjaCBmaWxlIGZvciBpZiBpdCBpcyBtYXRjaGVkIGJ5IGEgUHVsbEFwcHJvdmUgY29uZGl0aW9uLlxuICAgIGZvciAobGV0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgIGNvbnN0IG1hdGNoZWQgPSBhbGxHbG9icy5maWx0ZXIoZ2xvYiA9PiBnbG9iLm1hdGNoZXIubWF0Y2goZmlsZSkpO1xuICAgICAgbWF0Y2hlZC5sZW5ndGggPyBtYXRjaGVkRmlsZXMuYWRkKGZpbGUpIDogdW5tYXRjaGVkRmlsZXMuYWRkKGZpbGUpO1xuICAgICAgbWF0Y2hlZC5mb3JFYWNoKGdsb2IgPT4gZ2xvYi5tYXRjaENvdW50KyspO1xuICAgIH1cblxuICAgIC8vIEFkZCBlYWNoIGdsb2IgZm9yIGVhY2ggZ3JvdXAgdG8gYSBtYXAgZWl0aGVyIG1hdGNoZWQgb3IgdW5tYXRjaGVkLlxuICAgIGFsbEdsb2JzLmZvckVhY2goZ2xvYiA9PiB7XG4gICAgICBjb25zdCBncm91cHMgPSBnbG9iLm1hdGNoQ291bnQgPyBtYXRjaGVkR3JvdXBzIDogdW5tYXRjaGVkR3JvdXBzO1xuICAgICAgY29uc3QgZ2xvYnMgPSBncm91cHMuZ2V0KGdsb2IuZ3JvdXApIHx8IG5ldyBNYXA8c3RyaW5nLCBHbG9iTWF0Y2hlcj4oKTtcbiAgICAgIC8vIFNldCB0aGUgZ2xvYnMgbWFwIGluIHRoZSBncm91cHMgbWFwXG4gICAgICBncm91cHMuc2V0KGdsb2IuZ3JvdXAsIGdsb2JzKTtcbiAgICAgIC8vIFNldCB0aGUgZ2xvYiBpbiB0aGUgZ2xvYnMgbWFwXG4gICAgICBnbG9icy5zZXQoZ2xvYi5nbG9iLCBnbG9iKTtcbiAgICB9KTtcblxuICAgIC8vIFB1bGxBcHByb3ZlIGlzIGNvbnNpZGVyZWQgdmVyaWZpZWQgaWYgbm8gZmlsZXMgb3IgZ3JvdXBzIGFyZSBmb3VuZCB0byBiZSB1bnNlZC5cbiAgICBjb25zdCB2ZXJpZmljYXRpb25TdWNjZWVkZWQgPSAhKHVubWF0Y2hlZEZpbGVzLnNpemUgfHwgdW5tYXRjaGVkR3JvdXBzLnNpemUpO1xuXG4gICAgLyoqXG4gICAgICogT3ZlcmFsbCByZXN1bHRcbiAgICAgKi9cbiAgICBsb2dIZWFkZXIoJ1Jlc3VsdCcpO1xuICAgIGlmICh2ZXJpZmljYXRpb25TdWNjZWVkZWQpIHtcbiAgICAgIGNvbnNvbGUuaW5mbygnUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIHN1Y2NlZWRlZCEnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5pbmZvKGBQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gZmFpbGVkLlxcbmApO1xuICAgICAgY29uc29sZS5pbmZvKGBQbGVhc2UgdXBkYXRlICcucHVsbGFwcHJvdmUueW1sJyB0byBlbnN1cmUgdGhhdCBhbGwgbmVjZXNzYXJ5YCk7XG4gICAgICBjb25zb2xlLmluZm8oYGZpbGVzL2RpcmVjdG9yaWVzIGhhdmUgb3duZXJzIGFuZCBhbGwgcGF0dGVybnMgdGhhdCBhcHBlYXIgaW5gKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgdGhlIGZpbGUgY29ycmVzcG9uZCB0byBhY3R1YWwgZmlsZXMvZGlyZWN0b3JpZXMgaW4gdGhlIHJlcG8uYCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpbGUgYnkgZmlsZSBTdW1tYXJ5XG4gICAgICovXG4gICAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSBmaWxlIG1hdGNoIHJlc3VsdHMnKTtcbiAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBNYXRjaGVkIEZpbGVzICgke21hdGNoZWRGaWxlcy5zaXplfSBmaWxlcylgKTtcbiAgICBWRVJCT1NFX01PREUgJiYgbWF0Y2hlZEZpbGVzLmZvckVhY2goZmlsZSA9PiBjb25zb2xlLmluZm8oZmlsZSkpO1xuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBVbm1hdGNoZWQgRmlsZXMgKCR7dW5tYXRjaGVkRmlsZXMuc2l6ZX0gZmlsZXMpYCk7XG4gICAgdW5tYXRjaGVkRmlsZXMuZm9yRWFjaChmaWxlID0+IGNvbnNvbGUuaW5mbyhmaWxlKSk7XG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xuXG4gICAgLyoqXG4gICAgICogR3JvdXAgYnkgZ3JvdXAgU3VtbWFyeVxuICAgICAqL1xuICAgIGxvZ0hlYWRlcignUHVsbEFwcHJvdmUgZ3JvdXAgbWF0Y2hlcycpO1xuICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYE1hdGNoZWQgR3JvdXBzICgke21hdGNoZWRHcm91cHMuc2l6ZX0gZ3JvdXBzKWApO1xuICAgIFZFUkJPU0VfTU9ERSAmJiBsb2dHcm91cHMobWF0Y2hlZEdyb3Vwcyk7XG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYFVubWF0Y2hlZCBHcm91cHMgKCR7dW5tYXRjaGVkR3JvdXBzLnNpemV9IGdyb3VwcylgKTtcbiAgICBsb2dHcm91cHModW5tYXRjaGVkR3JvdXBzKTtcbiAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG5cbiAgICAvLyBQcm92aWRlIGNvcnJlY3QgZXhpdCBjb2RlIGJhc2VkIG9uIHZlcmlmaWNhdGlvbiBzdWNjZXNzLlxuICAgIHByb2Nlc3MuZXhpdCh2ZXJpZmljYXRpb25TdWNjZWVkZWQgPyAwIDogMSk7XG4gIH1cblxuXG4gIHJ1blZlcmlmaWNhdGlvbihBTExfRklMRVMpO1xufVxuIl19