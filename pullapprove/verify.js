(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/verify", ["require", "exports", "tslib", "fs", "path", "shelljs", "@angular/dev-infra-private/pullapprove/group", "@angular/dev-infra-private/pullapprove/logging", "@angular/dev-infra-private/pullapprove/parse-yaml", "@angular/dev-infra-private/utils/config"], factory);
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
    var path = require("path");
    var shelljs_1 = require("shelljs");
    var group_1 = require("@angular/dev-infra-private/pullapprove/group");
    var logging_1 = require("@angular/dev-infra-private/pullapprove/logging");
    var parse_yaml_1 = require("@angular/dev-infra-private/pullapprove/parse-yaml");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    function verify() {
        // Exit early on shelljs errors
        shelljs_1.set('-e');
        // Whether to log verbosely
        var VERBOSE_MODE = process.argv.includes('-v');
        // Full path of the angular project directory
        var PROJECT_DIR = config_1.getRepoBaseDir();
        // Change to the Angular project directory
        shelljs_1.cd(PROJECT_DIR);
        // Full path to PullApprove config file
        var PULL_APPROVE_YAML_PATH = path.resolve(PROJECT_DIR, '.pullapprove.yml');
        // All relative path file names in the git repo, this is retrieved using git rather
        // that a glob so that we only get files that are checked in, ignoring things like
        // node_modules, .bazelrc.user, etc
        var REPO_FILES = shelljs_1.exec('git ls-files', { silent: true }).trim().split('\n').filter(function (_) { return !!_; });
        // The pull approve config file.
        var pullApproveYamlRaw = fs_1.readFileSync(PULL_APPROVE_YAML_PATH, 'utf8');
        // JSON representation of the pullapprove yaml file.
        var pullApprove = parse_yaml_1.parsePullApproveYaml(pullApproveYamlRaw);
        // All of the groups defined in the pullapprove yaml.
        var groups = Object.entries(pullApprove.groups).map(function (_a) {
            var _b = tslib_1.__read(_a, 2), groupName = _b[0], group = _b[1];
            return new group_1.PullApproveGroup(groupName, group);
        });
        // PullApprove groups without matchers.
        var groupsWithoutMatchers = groups.filter(function (group) { return !group.hasMatchers; });
        // PullApprove groups with matchers.
        var groupsWithMatchers = groups.filter(function (group) { return group.hasMatchers; });
        // All lines from group conditions which are not parsable.
        var groupsWithBadLines = groups.filter(function (g) { return !!g.getBadLines().length; });
        // If any groups contains bad lines, log bad lines and exit failing.
        if (groupsWithBadLines.length) {
            logging_1.logHeader('PullApprove config file parsing failure');
            console.info("Discovered errors in " + groupsWithBadLines.length + " groups");
            groupsWithBadLines.forEach(function (group) {
                console.info(" - [" + group.groupName + "]");
                group.getBadLines().forEach(function (line) { return console.info("    " + line); });
            });
            console.info("Correct the invalid conditions, before PullApprove verification can be completed");
            process.exit(1);
        }
        // Files which are matched by at least one group.
        var matchedFiles = [];
        // Files which are not matched by at least one group.
        var unmatchedFiles = [];
        // Test each file in the repo against each group for being matched.
        REPO_FILES.forEach(function (file) {
            if (groupsWithMatchers.filter(function (group) { return group.testFile(file); }).length) {
                matchedFiles.push(file);
            }
            else {
                unmatchedFiles.push(file);
            }
        });
        // Results for each group
        var resultsByGroup = groupsWithMatchers.map(function (group) { return group.getResults(); });
        // Whether all group condition lines match at least one file and all files
        // are matched by at least one group.
        var verificationSucceeded = resultsByGroup.every(function (r) { return !r.unmatchedCount; }) && !unmatchedFiles.length;
        /**
         * Overall result
         */
        logging_1.logHeader('Overall Result');
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
        logging_1.logHeader('PullApprove results by file');
        console.groupCollapsed("Matched Files (" + matchedFiles.length + " files)");
        VERBOSE_MODE && matchedFiles.forEach(function (file) { return console.info(file); });
        console.groupEnd();
        console.groupCollapsed("Unmatched Files (" + unmatchedFiles.length + " files)");
        unmatchedFiles.forEach(function (file) { return console.info(file); });
        console.groupEnd();
        /**
         * Group by group Summary
         */
        logging_1.logHeader('PullApprove results by group');
        console.groupCollapsed("Groups without matchers (" + groupsWithoutMatchers.length + " groups)");
        VERBOSE_MODE && groupsWithoutMatchers.forEach(function (group) { return console.info("" + group.groupName); });
        console.groupEnd();
        var matchedGroups = resultsByGroup.filter(function (group) { return !group.unmatchedCount; });
        console.groupCollapsed("Matched conditions by Group (" + matchedGroups.length + " groups)");
        VERBOSE_MODE && matchedGroups.forEach(function (group) { return logging_1.logGroup(group); });
        console.groupEnd();
        var unmatchedGroups = resultsByGroup.filter(function (group) { return group.unmatchedCount; });
        console.groupCollapsed("Unmatched conditions by Group (" + unmatchedGroups.length + " groups)");
        unmatchedGroups.forEach(function (group) { return logging_1.logGroup(group, false); });
        console.groupEnd();
        // Provide correct exit code based on verification success.
        process.exit(verificationSucceeded ? 0 : 1);
    }
    exports.verify = verify;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCx5QkFBZ0M7SUFDaEMsMkJBQTZCO0lBQzdCLG1DQUFzQztJQUV0QyxzRUFBeUM7SUFDekMsMEVBQThDO0lBQzlDLGdGQUFrRDtJQUNsRCxrRUFBK0M7SUFFL0MsU0FBZ0IsTUFBTTtRQUNwQiwrQkFBK0I7UUFDL0IsYUFBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1YsMkJBQTJCO1FBQzNCLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELDZDQUE2QztRQUM3QyxJQUFNLFdBQVcsR0FBRyx1QkFBYyxFQUFFLENBQUM7UUFDckMsMENBQTBDO1FBQzFDLFlBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNoQix1Q0FBdUM7UUFDdkMsSUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQzdFLG1GQUFtRjtRQUNuRixrRkFBa0Y7UUFDbEYsbUNBQW1DO1FBQ25DLElBQU0sVUFBVSxHQUNaLGNBQUksQ0FBQyxjQUFjLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBUyxJQUFLLE9BQUEsQ0FBQyxDQUFDLENBQUMsRUFBSCxDQUFHLENBQUMsQ0FBQztRQUN2RixnQ0FBZ0M7UUFDaEMsSUFBTSxrQkFBa0IsR0FBRyxpQkFBWSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hFLG9EQUFvRDtRQUNwRCxJQUFNLFdBQVcsR0FBRyxpQ0FBb0Is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QU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixJQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFyQixDQUFxQixDQUFDLENBQUM7UUFDNUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxrQ0FBZ0MsYUFBYSxDQUFDLE1BQU0sYUFBVSxDQUFDLENBQUM7UUFDdkYsWUFBWSxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxrQkFBUSxDQUFDLEtBQUssQ0FBQyxFQUFmLENBQWUsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixJQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLGNBQWMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO1FBQzdFLE9BQU8sQ0FBQyxjQUFjLENBQUMsb0NBQWtDLGVBQWUsQ0FBQyxNQUFNLGFBQVUsQ0FBQyxDQUFDO1FBQzNGLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxrQkFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVuQiwyREFBMkQ7UUFDM0QsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBdEdELHdCQXNHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtjZCwgZXhlYywgc2V0fSBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwfSBmcm9tICcuL2dyb3VwJztcbmltcG9ydCB7bG9nR3JvdXAsIGxvZ0hlYWRlcn0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCB7cGFyc2VQdWxsQXBwcm92ZVlhbWx9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5KCkge1xuICAvLyBFeGl0IGVhcmx5IG9uIHNoZWxsanMgZXJyb3JzXG4gIHNldCgnLWUnKTtcbiAgLy8gV2hldGhlciB0byBsb2cgdmVyYm9zZWx5XG4gIGNvbnN0IFZFUkJPU0VfTU9ERSA9IHByb2Nlc3MuYXJndi5pbmNsdWRlcygnLXYnKTtcbiAgLy8gRnVsbCBwYXRoIG9mIHRoZSBhbmd1bGFyIHByb2plY3QgZGlyZWN0b3J5XG4gIGNvbnN0IFBST0pFQ1RfRElSID0gZ2V0UmVwb0Jhc2VEaXIoKTtcbiAgLy8gQ2hhbmdlIHRvIHRoZSBBbmd1bGFyIHByb2plY3QgZGlyZWN0b3J5XG4gIGNkKFBST0pFQ1RfRElSKTtcbiAgLy8gRnVsbCBwYXRoIHRvIFB1bGxBcHByb3ZlIGNvbmZpZyBmaWxlXG4gIGNvbnN0IFBVTExfQVBQUk9WRV9ZQU1MX1BBVEggPSBwYXRoLnJlc29sdmUoUFJPSkVDVF9ESVIsICcucHVsbGFwcHJvdmUueW1sJyk7XG4gIC8vIEFsbCByZWxhdGl2ZSBwYXRoIGZpbGUgbmFtZXMgaW4gdGhlIGdpdCByZXBvLCB0aGlzIGlzIHJldHJpZXZlZCB1c2luZyBnaXQgcmF0aGVyXG4gIC8vIHRoYXQgYSBnbG9iIHNvIHRoYXQgd2Ugb25seSBnZXQgZmlsZXMgdGhhdCBhcmUgY2hlY2tlZCBpbiwgaWdub3JpbmcgdGhpbmdzIGxpa2VcbiAgLy8gbm9kZV9tb2R1bGVzLCAuYmF6ZWxyYy51c2VyLCBldGNcbiAgY29uc3QgUkVQT19GSUxFUyA9XG4gICAgICBleGVjKCdnaXQgbHMtZmlsZXMnLCB7c2lsZW50OiB0cnVlfSkudHJpbSgpLnNwbGl0KCdcXG4nKS5maWx0ZXIoKF86IHN0cmluZykgPT4gISFfKTtcbiAgLy8gVGhlIHB1bGwgYXBwcm92ZSBjb25maWcgZmlsZS5cbiAgY29uc3QgcHVsbEFwcHJvdmVZYW1sUmF3ID0gcmVhZEZpbGVTeW5jKFBVTExfQVBQUk9WRV9ZQU1MX1BBVEgsICd1dGY4Jyk7XG4gIC8vIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHB1bGxhcHByb3ZlIHlhbWwgZmlsZS5cbiAgY29uc3QgcHVsbEFwcHJvdmUgPSBwYXJzZVB1bGxBcHByb3ZlWWFtbChwdWxsQXBwcm92ZVlhbWxSYXcpO1xuICAvLyBBbGwgb2YgdGhlIGdyb3VwcyBkZWZpbmVkIGluIHRoZSBwdWxsYXBwcm92ZSB5YW1sLlxuICBjb25zdCBncm91cHMgPSBPYmplY3QuZW50cmllcyhwdWxsQXBwcm92ZS5ncm91cHMpLm1hcCgoW2dyb3VwTmFtZSwgZ3JvdXBdKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQdWxsQXBwcm92ZUdyb3VwKGdyb3VwTmFtZSwgZ3JvdXApO1xuICB9KTtcbiAgLy8gUHVsbEFwcHJvdmUgZ3JvdXBzIHdpdGhvdXQgbWF0Y2hlcnMuXG4gIGNvbnN0IGdyb3Vwc1dpdGhvdXRNYXRjaGVycyA9IGdyb3Vwcy5maWx0ZXIoZ3JvdXAgPT4gIWdyb3VwLmhhc01hdGNoZXJzKTtcbiAgLy8gUHVsbEFwcHJvdmUgZ3JvdXBzIHdpdGggbWF0Y2hlcnMuXG4gIGNvbnN0IGdyb3Vwc1dpdGhNYXRjaGVycyA9IGdyb3Vwcy5maWx0ZXIoZ3JvdXAgPT4gZ3JvdXAuaGFzTWF0Y2hlcnMpO1xuICAvLyBBbGwgbGluZXMgZnJvbSBncm91cCBjb25kaXRpb25zIHdoaWNoIGFyZSBub3QgcGFyc2FibGUuXG4gIGNvbnN0IGdyb3Vwc1dpdGhCYWRMaW5lcyA9IGdyb3Vwcy5maWx0ZXIoZyA9PiAhIWcuZ2V0QmFkTGluZXMoKS5sZW5ndGgpO1xuICAvLyBJZiBhbnkgZ3JvdXBzIGNvbnRhaW5zIGJhZCBsaW5lcywgbG9nIGJhZCBsaW5lcyBhbmQgZXhpdCBmYWlsaW5nLlxuICBpZiAoZ3JvdXBzV2l0aEJhZExpbmVzLmxlbmd0aCkge1xuICAgIGxvZ0hlYWRlcignUHVsbEFwcHJvdmUgY29uZmlnIGZpbGUgcGFyc2luZyBmYWlsdXJlJyk7XG4gICAgY29uc29sZS5pbmZvKGBEaXNjb3ZlcmVkIGVycm9ycyBpbiAke2dyb3Vwc1dpdGhCYWRMaW5lcy5sZW5ndGh9IGdyb3Vwc2ApO1xuICAgIGdyb3Vwc1dpdGhCYWRMaW5lcy5mb3JFYWNoKGdyb3VwID0+IHtcbiAgICAgIGNvbnNvbGUuaW5mbyhgIC0gWyR7Z3JvdXAuZ3JvdXBOYW1lfV1gKTtcbiAgICAgIGdyb3VwLmdldEJhZExpbmVzKCkuZm9yRWFjaChsaW5lID0+IGNvbnNvbGUuaW5mbyhgICAgICR7bGluZX1gKSk7XG4gICAgfSk7XG4gICAgY29uc29sZS5pbmZvKFxuICAgICAgICBgQ29ycmVjdCB0aGUgaW52YWxpZCBjb25kaXRpb25zLCBiZWZvcmUgUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIGNhbiBiZSBjb21wbGV0ZWRgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgLy8gRmlsZXMgd2hpY2ggYXJlIG1hdGNoZWQgYnkgYXQgbGVhc3Qgb25lIGdyb3VwLlxuICBjb25zdCBtYXRjaGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG4gIC8vIEZpbGVzIHdoaWNoIGFyZSBub3QgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuXG4gIGNvbnN0IHVubWF0Y2hlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIFRlc3QgZWFjaCBmaWxlIGluIHRoZSByZXBvIGFnYWluc3QgZWFjaCBncm91cCBmb3IgYmVpbmcgbWF0Y2hlZC5cbiAgUkVQT19GSUxFUy5mb3JFYWNoKChmaWxlOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoZ3JvdXBzV2l0aE1hdGNoZXJzLmZpbHRlcihncm91cCA9PiBncm91cC50ZXN0RmlsZShmaWxlKSkubGVuZ3RoKSB7XG4gICAgICBtYXRjaGVkRmlsZXMucHVzaChmaWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdW5tYXRjaGVkRmlsZXMucHVzaChmaWxlKTtcbiAgICB9XG4gIH0pO1xuICAvLyBSZXN1bHRzIGZvciBlYWNoIGdyb3VwXG4gIGNvbnN0IHJlc3VsdHNCeUdyb3VwID0gZ3JvdXBzV2l0aE1hdGNoZXJzLm1hcChncm91cCA9PiBncm91cC5nZXRSZXN1bHRzKCkpO1xuICAvLyBXaGV0aGVyIGFsbCBncm91cCBjb25kaXRpb24gbGluZXMgbWF0Y2ggYXQgbGVhc3Qgb25lIGZpbGUgYW5kIGFsbCBmaWxlc1xuICAvLyBhcmUgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuXG4gIGNvbnN0IHZlcmlmaWNhdGlvblN1Y2NlZWRlZCA9XG4gICAgICByZXN1bHRzQnlHcm91cC5ldmVyeShyID0+ICFyLnVubWF0Y2hlZENvdW50KSAmJiAhdW5tYXRjaGVkRmlsZXMubGVuZ3RoO1xuXG4gIC8qKlxuICAgKiBPdmVyYWxsIHJlc3VsdFxuICAgKi9cbiAgbG9nSGVhZGVyKCdPdmVyYWxsIFJlc3VsdCcpO1xuICBpZiAodmVyaWZpY2F0aW9uU3VjY2VlZGVkKSB7XG4gICAgY29uc29sZS5pbmZvKCdQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gc3VjY2VlZGVkIScpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuaW5mbyhgUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIGZhaWxlZC5cXG5gKTtcbiAgICBjb25zb2xlLmluZm8oYFBsZWFzZSB1cGRhdGUgJy5wdWxsYXBwcm92ZS55bWwnIHRvIGVuc3VyZSB0aGF0IGFsbCBuZWNlc3NhcnlgKTtcbiAgICBjb25zb2xlLmluZm8oYGZpbGVzL2RpcmVjdG9yaWVzIGhhdmUgb3duZXJzIGFuZCBhbGwgcGF0dGVybnMgdGhhdCBhcHBlYXIgaW5gKTtcbiAgICBjb25zb2xlLmluZm8oYHRoZSBmaWxlIGNvcnJlc3BvbmQgdG8gYWN0dWFsIGZpbGVzL2RpcmVjdG9yaWVzIGluIHRoZSByZXBvLmApO1xuICB9XG4gIC8qKlxuICAgKiBGaWxlIGJ5IGZpbGUgU3VtbWFyeVxuICAgKi9cbiAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSByZXN1bHRzIGJ5IGZpbGUnKTtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgTWF0Y2hlZCBGaWxlcyAoJHttYXRjaGVkRmlsZXMubGVuZ3RofSBmaWxlcylgKTtcbiAgVkVSQk9TRV9NT0RFICYmIG1hdGNoZWRGaWxlcy5mb3JFYWNoKGZpbGUgPT4gY29uc29sZS5pbmZvKGZpbGUpKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xuICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBVbm1hdGNoZWQgRmlsZXMgKCR7dW5tYXRjaGVkRmlsZXMubGVuZ3RofSBmaWxlcylgKTtcbiAgdW5tYXRjaGVkRmlsZXMuZm9yRWFjaChmaWxlID0+IGNvbnNvbGUuaW5mbyhmaWxlKSk7XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgLyoqXG4gICAqIEdyb3VwIGJ5IGdyb3VwIFN1bW1hcnlcbiAgICovXG4gIGxvZ0hlYWRlcignUHVsbEFwcHJvdmUgcmVzdWx0cyBieSBncm91cCcpO1xuICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBHcm91cHMgd2l0aG91dCBtYXRjaGVycyAoJHtncm91cHNXaXRob3V0TWF0Y2hlcnMubGVuZ3RofSBncm91cHMpYCk7XG4gIFZFUkJPU0VfTU9ERSAmJiBncm91cHNXaXRob3V0TWF0Y2hlcnMuZm9yRWFjaChncm91cCA9PiBjb25zb2xlLmluZm8oYCR7Z3JvdXAuZ3JvdXBOYW1lfWApKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xuICBjb25zdCBtYXRjaGVkR3JvdXBzID0gcmVzdWx0c0J5R3JvdXAuZmlsdGVyKGdyb3VwID0+ICFncm91cC51bm1hdGNoZWRDb3VudCk7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYE1hdGNoZWQgY29uZGl0aW9ucyBieSBHcm91cCAoJHttYXRjaGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICBWRVJCT1NFX01PREUgJiYgbWF0Y2hlZEdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IGxvZ0dyb3VwKGdyb3VwKSk7XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgY29uc3QgdW5tYXRjaGVkR3JvdXBzID0gcmVzdWx0c0J5R3JvdXAuZmlsdGVyKGdyb3VwID0+IGdyb3VwLnVubWF0Y2hlZENvdW50KTtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgVW5tYXRjaGVkIGNvbmRpdGlvbnMgYnkgR3JvdXAgKCR7dW5tYXRjaGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICB1bm1hdGNoZWRHcm91cHMuZm9yRWFjaChncm91cCA9PiBsb2dHcm91cChncm91cCwgZmFsc2UpKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xuXG4gIC8vIFByb3ZpZGUgY29ycmVjdCBleGl0IGNvZGUgYmFzZWQgb24gdmVyaWZpY2F0aW9uIHN1Y2Nlc3MuXG4gIHByb2Nlc3MuZXhpdCh2ZXJpZmljYXRpb25TdWNjZWVkZWQgPyAwIDogMSk7XG59XG4iXX0=