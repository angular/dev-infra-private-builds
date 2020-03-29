(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/verify", ["require", "exports", "tslib", "fs", "path", "shelljs", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/pullapprove/group", "@angular/dev-infra-private/pullapprove/logging", "@angular/dev-infra-private/pullapprove/parse-yaml"], factory);
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
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var group_1 = require("@angular/dev-infra-private/pullapprove/group");
    var logging_1 = require("@angular/dev-infra-private/pullapprove/logging");
    var parse_yaml_1 = require("@angular/dev-infra-private/pullapprove/parse-yaml");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCx5QkFBZ0M7SUFDaEMsMkJBQTZCO0lBQzdCLG1DQUFzQztJQUV0QyxrRUFBK0M7SUFFL0Msc0VBQXlDO0lBQ3pDLDBFQUE4QztJQUM5QyxnRkFBa0Q7SUFFbEQsU0FBZ0IsTUFBTTtRQUNwQiwrQkFBK0I7UUFDL0IsYUFBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1YsMkJBQTJCO1FBQzNCLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELDZDQUE2QztRQUM3QyxJQUFNLFdBQVcsR0FBRyx1QkFBYyxFQUFFLENBQUM7UUFDckMsMENBQTBDO1FBQzFDLFlBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNoQix1Q0FBdUM7UUFDdkMsSUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQzdFLG1GQUFtRjtRQUNuRixrRkFBa0Y7UUFDbEYsbUNBQW1DO1FBQ25DLElBQU0sVUFBVSxHQUNaLGNBQUksQ0FBQyxjQUFjLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBUyxJQUFLLE9BQUEsQ0FBQyxDQUFDLENBQUMsRUFBSCxDQUFHLENBQUMsQ0FBQztRQUN2RixnQ0FBZ0M7UUFDaEMsSUFBTSxrQkFBa0IsR0FBRyxpQkFBWSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hFLG9EQUFvRDtRQUNwRCxJQUFNLFdBQVcsR0FBRyxpQ0FBb0Is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QU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixJQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFyQixDQUFxQixDQUFDLENBQUM7UUFDNUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxrQ0FBZ0MsYUFBYSxDQUFDLE1BQU0sYUFBVSxDQUFDLENBQUM7UUFDdkYsWUFBWSxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxrQkFBUSxDQUFDLEtBQUssQ0FBQyxFQUFmLENBQWUsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixJQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLGNBQWMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO1FBQzdFLE9BQU8sQ0FBQyxjQUFjLENBQUMsb0NBQWtDLGVBQWUsQ0FBQyxNQUFNLGFBQVUsQ0FBQyxDQUFDO1FBQzNGLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxrQkFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVuQiwyREFBMkQ7UUFDM0QsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBdEdELHdCQXNHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtjZCwgZXhlYywgc2V0fSBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwfSBmcm9tICcuL2dyb3VwJztcbmltcG9ydCB7bG9nR3JvdXAsIGxvZ0hlYWRlcn0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCB7cGFyc2VQdWxsQXBwcm92ZVlhbWx9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnkoKSB7XG4gIC8vIEV4aXQgZWFybHkgb24gc2hlbGxqcyBlcnJvcnNcbiAgc2V0KCctZScpO1xuICAvLyBXaGV0aGVyIHRvIGxvZyB2ZXJib3NlbHlcbiAgY29uc3QgVkVSQk9TRV9NT0RFID0gcHJvY2Vzcy5hcmd2LmluY2x1ZGVzKCctdicpO1xuICAvLyBGdWxsIHBhdGggb2YgdGhlIGFuZ3VsYXIgcHJvamVjdCBkaXJlY3RvcnlcbiAgY29uc3QgUFJPSkVDVF9ESVIgPSBnZXRSZXBvQmFzZURpcigpO1xuICAvLyBDaGFuZ2UgdG8gdGhlIEFuZ3VsYXIgcHJvamVjdCBkaXJlY3RvcnlcbiAgY2QoUFJPSkVDVF9ESVIpO1xuICAvLyBGdWxsIHBhdGggdG8gUHVsbEFwcHJvdmUgY29uZmlnIGZpbGVcbiAgY29uc3QgUFVMTF9BUFBST1ZFX1lBTUxfUEFUSCA9IHBhdGgucmVzb2x2ZShQUk9KRUNUX0RJUiwgJy5wdWxsYXBwcm92ZS55bWwnKTtcbiAgLy8gQWxsIHJlbGF0aXZlIHBhdGggZmlsZSBuYW1lcyBpbiB0aGUgZ2l0IHJlcG8sIHRoaXMgaXMgcmV0cmlldmVkIHVzaW5nIGdpdCByYXRoZXJcbiAgLy8gdGhhdCBhIGdsb2Igc28gdGhhdCB3ZSBvbmx5IGdldCBmaWxlcyB0aGF0IGFyZSBjaGVja2VkIGluLCBpZ25vcmluZyB0aGluZ3MgbGlrZVxuICAvLyBub2RlX21vZHVsZXMsIC5iYXplbHJjLnVzZXIsIGV0Y1xuICBjb25zdCBSRVBPX0ZJTEVTID1cbiAgICAgIGV4ZWMoJ2dpdCBscy1maWxlcycsIHtzaWxlbnQ6IHRydWV9KS50cmltKCkuc3BsaXQoJ1xcbicpLmZpbHRlcigoXzogc3RyaW5nKSA9PiAhIV8pO1xuICAvLyBUaGUgcHVsbCBhcHByb3ZlIGNvbmZpZyBmaWxlLlxuICBjb25zdCBwdWxsQXBwcm92ZVlhbWxSYXcgPSByZWFkRmlsZVN5bmMoUFVMTF9BUFBST1ZFX1lBTUxfUEFUSCwgJ3V0ZjgnKTtcbiAgLy8gSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgcHVsbGFwcHJvdmUgeWFtbCBmaWxlLlxuICBjb25zdCBwdWxsQXBwcm92ZSA9IHBhcnNlUHVsbEFwcHJvdmVZYW1sKHB1bGxBcHByb3ZlWWFtbFJhdyk7XG4gIC8vIEFsbCBvZiB0aGUgZ3JvdXBzIGRlZmluZWQgaW4gdGhlIHB1bGxhcHByb3ZlIHlhbWwuXG4gIGNvbnN0IGdyb3VwcyA9IE9iamVjdC5lbnRyaWVzKHB1bGxBcHByb3ZlLmdyb3VwcykubWFwKChbZ3JvdXBOYW1lLCBncm91cF0pID0+IHtcbiAgICByZXR1cm4gbmV3IFB1bGxBcHByb3ZlR3JvdXAoZ3JvdXBOYW1lLCBncm91cCk7XG4gIH0pO1xuICAvLyBQdWxsQXBwcm92ZSBncm91cHMgd2l0aG91dCBtYXRjaGVycy5cbiAgY29uc3QgZ3JvdXBzV2l0aG91dE1hdGNoZXJzID0gZ3JvdXBzLmZpbHRlcihncm91cCA9PiAhZ3JvdXAuaGFzTWF0Y2hlcnMpO1xuICAvLyBQdWxsQXBwcm92ZSBncm91cHMgd2l0aCBtYXRjaGVycy5cbiAgY29uc3QgZ3JvdXBzV2l0aE1hdGNoZXJzID0gZ3JvdXBzLmZpbHRlcihncm91cCA9PiBncm91cC5oYXNNYXRjaGVycyk7XG4gIC8vIEFsbCBsaW5lcyBmcm9tIGdyb3VwIGNvbmRpdGlvbnMgd2hpY2ggYXJlIG5vdCBwYXJzYWJsZS5cbiAgY29uc3QgZ3JvdXBzV2l0aEJhZExpbmVzID0gZ3JvdXBzLmZpbHRlcihnID0+ICEhZy5nZXRCYWRMaW5lcygpLmxlbmd0aCk7XG4gIC8vIElmIGFueSBncm91cHMgY29udGFpbnMgYmFkIGxpbmVzLCBsb2cgYmFkIGxpbmVzIGFuZCBleGl0IGZhaWxpbmcuXG4gIGlmIChncm91cHNXaXRoQmFkTGluZXMubGVuZ3RoKSB7XG4gICAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSBjb25maWcgZmlsZSBwYXJzaW5nIGZhaWx1cmUnKTtcbiAgICBjb25zb2xlLmluZm8oYERpc2NvdmVyZWQgZXJyb3JzIGluICR7Z3JvdXBzV2l0aEJhZExpbmVzLmxlbmd0aH0gZ3JvdXBzYCk7XG4gICAgZ3JvdXBzV2l0aEJhZExpbmVzLmZvckVhY2goZ3JvdXAgPT4ge1xuICAgICAgY29uc29sZS5pbmZvKGAgLSBbJHtncm91cC5ncm91cE5hbWV9XWApO1xuICAgICAgZ3JvdXAuZ2V0QmFkTGluZXMoKS5mb3JFYWNoKGxpbmUgPT4gY29uc29sZS5pbmZvKGAgICAgJHtsaW5lfWApKTtcbiAgICB9KTtcbiAgICBjb25zb2xlLmluZm8oXG4gICAgICAgIGBDb3JyZWN0IHRoZSBpbnZhbGlkIGNvbmRpdGlvbnMsIGJlZm9yZSBQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gY2FuIGJlIGNvbXBsZXRlZGApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuICAvLyBGaWxlcyB3aGljaCBhcmUgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuXG4gIGNvbnN0IG1hdGNoZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgLy8gRmlsZXMgd2hpY2ggYXJlIG5vdCBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC5cbiAgY29uc3QgdW5tYXRjaGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gVGVzdCBlYWNoIGZpbGUgaW4gdGhlIHJlcG8gYWdhaW5zdCBlYWNoIGdyb3VwIGZvciBiZWluZyBtYXRjaGVkLlxuICBSRVBPX0ZJTEVTLmZvckVhY2goKGZpbGU6IHN0cmluZykgPT4ge1xuICAgIGlmIChncm91cHNXaXRoTWF0Y2hlcnMuZmlsdGVyKGdyb3VwID0+IGdyb3VwLnRlc3RGaWxlKGZpbGUpKS5sZW5ndGgpIHtcbiAgICAgIG1hdGNoZWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1bm1hdGNoZWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgIH1cbiAgfSk7XG4gIC8vIFJlc3VsdHMgZm9yIGVhY2ggZ3JvdXBcbiAgY29uc3QgcmVzdWx0c0J5R3JvdXAgPSBncm91cHNXaXRoTWF0Y2hlcnMubWFwKGdyb3VwID0+IGdyb3VwLmdldFJlc3VsdHMoKSk7XG4gIC8vIFdoZXRoZXIgYWxsIGdyb3VwIGNvbmRpdGlvbiBsaW5lcyBtYXRjaCBhdCBsZWFzdCBvbmUgZmlsZSBhbmQgYWxsIGZpbGVzXG4gIC8vIGFyZSBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC5cbiAgY29uc3QgdmVyaWZpY2F0aW9uU3VjY2VlZGVkID1cbiAgICAgIHJlc3VsdHNCeUdyb3VwLmV2ZXJ5KHIgPT4gIXIudW5tYXRjaGVkQ291bnQpICYmICF1bm1hdGNoZWRGaWxlcy5sZW5ndGg7XG5cbiAgLyoqXG4gICAqIE92ZXJhbGwgcmVzdWx0XG4gICAqL1xuICBsb2dIZWFkZXIoJ092ZXJhbGwgUmVzdWx0Jyk7XG4gIGlmICh2ZXJpZmljYXRpb25TdWNjZWVkZWQpIHtcbiAgICBjb25zb2xlLmluZm8oJ1B1bGxBcHByb3ZlIHZlcmlmaWNhdGlvbiBzdWNjZWVkZWQhJyk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5pbmZvKGBQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gZmFpbGVkLlxcbmApO1xuICAgIGNvbnNvbGUuaW5mbyhgUGxlYXNlIHVwZGF0ZSAnLnB1bGxhcHByb3ZlLnltbCcgdG8gZW5zdXJlIHRoYXQgYWxsIG5lY2Vzc2FyeWApO1xuICAgIGNvbnNvbGUuaW5mbyhgZmlsZXMvZGlyZWN0b3JpZXMgaGF2ZSBvd25lcnMgYW5kIGFsbCBwYXR0ZXJucyB0aGF0IGFwcGVhciBpbmApO1xuICAgIGNvbnNvbGUuaW5mbyhgdGhlIGZpbGUgY29ycmVzcG9uZCB0byBhY3R1YWwgZmlsZXMvZGlyZWN0b3JpZXMgaW4gdGhlIHJlcG8uYCk7XG4gIH1cbiAgLyoqXG4gICAqIEZpbGUgYnkgZmlsZSBTdW1tYXJ5XG4gICAqL1xuICBsb2dIZWFkZXIoJ1B1bGxBcHByb3ZlIHJlc3VsdHMgYnkgZmlsZScpO1xuICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBNYXRjaGVkIEZpbGVzICgke21hdGNoZWRGaWxlcy5sZW5ndGh9IGZpbGVzKWApO1xuICBWRVJCT1NFX01PREUgJiYgbWF0Y2hlZEZpbGVzLmZvckVhY2goZmlsZSA9PiBjb25zb2xlLmluZm8oZmlsZSkpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYFVubWF0Y2hlZCBGaWxlcyAoJHt1bm1hdGNoZWRGaWxlcy5sZW5ndGh9IGZpbGVzKWApO1xuICB1bm1hdGNoZWRGaWxlcy5mb3JFYWNoKGZpbGUgPT4gY29uc29sZS5pbmZvKGZpbGUpKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xuICAvKipcbiAgICogR3JvdXAgYnkgZ3JvdXAgU3VtbWFyeVxuICAgKi9cbiAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSByZXN1bHRzIGJ5IGdyb3VwJyk7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYEdyb3VwcyB3aXRob3V0IG1hdGNoZXJzICgke2dyb3Vwc1dpdGhvdXRNYXRjaGVycy5sZW5ndGh9IGdyb3VwcylgKTtcbiAgVkVSQk9TRV9NT0RFICYmIGdyb3Vwc1dpdGhvdXRNYXRjaGVycy5mb3JFYWNoKGdyb3VwID0+IGNvbnNvbGUuaW5mbyhgJHtncm91cC5ncm91cE5hbWV9YCkpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gIGNvbnN0IG1hdGNoZWRHcm91cHMgPSByZXN1bHRzQnlHcm91cC5maWx0ZXIoZ3JvdXAgPT4gIWdyb3VwLnVubWF0Y2hlZENvdW50KTtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgTWF0Y2hlZCBjb25kaXRpb25zIGJ5IEdyb3VwICgke21hdGNoZWRHcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIFZFUkJPU0VfTU9ERSAmJiBtYXRjaGVkR3JvdXBzLmZvckVhY2goZ3JvdXAgPT4gbG9nR3JvdXAoZ3JvdXApKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xuICBjb25zdCB1bm1hdGNoZWRHcm91cHMgPSByZXN1bHRzQnlHcm91cC5maWx0ZXIoZ3JvdXAgPT4gZ3JvdXAudW5tYXRjaGVkQ291bnQpO1xuICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBVbm1hdGNoZWQgY29uZGl0aW9ucyBieSBHcm91cCAoJHt1bm1hdGNoZWRHcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIHVubWF0Y2hlZEdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IGxvZ0dyb3VwKGdyb3VwLCBmYWxzZSkpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG5cbiAgLy8gUHJvdmlkZSBjb3JyZWN0IGV4aXQgY29kZSBiYXNlZCBvbiB2ZXJpZmljYXRpb24gc3VjY2Vzcy5cbiAgcHJvY2Vzcy5leGl0KHZlcmlmaWNhdGlvblN1Y2NlZWRlZCA/IDAgOiAxKTtcbn1cbiJdfQ==