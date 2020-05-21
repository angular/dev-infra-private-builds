(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/verify", ["require", "exports", "tslib", "fs", "path", "shelljs", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pullapprove/group", "@angular/dev-infra-private/pullapprove/logging", "@angular/dev-infra-private/pullapprove/parse-yaml"], factory);
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
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var group_1 = require("@angular/dev-infra-private/pullapprove/group");
    var logging_1 = require("@angular/dev-infra-private/pullapprove/logging");
    var parse_yaml_1 = require("@angular/dev-infra-private/pullapprove/parse-yaml");
    function verify(verbose) {
        if (verbose === void 0) { verbose = false; }
        // Exit early on shelljs errors
        shelljs_1.set('-e');
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
        // PullApprove groups without conditions. These are skipped in the verification
        // as those would always be active and cause zero unmatched files.
        var groupsSkipped = groups.filter(function (group) { return !group.conditions.length; });
        // PullApprove groups with conditions.
        var groupsWithConditions = groups.filter(function (group) { return !!group.conditions.length; });
        // Files which are matched by at least one group.
        var matchedFiles = [];
        // Files which are not matched by at least one group.
        var unmatchedFiles = [];
        // Test each file in the repo against each group for being matched.
        REPO_FILES.forEach(function (file) {
            if (groupsWithConditions.filter(function (group) { return group.testFile(file); }).length) {
                matchedFiles.push(file);
            }
            else {
                unmatchedFiles.push(file);
            }
        });
        // Results for each group
        var resultsByGroup = groupsWithConditions.map(function (group) { return group.getResults(); });
        // Whether all group condition lines match at least one file and all files
        // are matched by at least one group.
        var verificationSucceeded = resultsByGroup.every(function (r) { return !r.unmatchedCount; }) && !unmatchedFiles.length;
        /**
         * Overall result
         */
        logging_1.logHeader('Overall Result');
        if (verificationSucceeded) {
            console_1.info('PullApprove verification succeeded!');
        }
        else {
            console_1.info("PullApprove verification failed.");
            console_1.info();
            console_1.info("Please update '.pullapprove.yml' to ensure that all necessary");
            console_1.info("files/directories have owners and all patterns that appear in");
            console_1.info("the file correspond to actual files/directories in the repo.");
        }
        /**
         * File by file Summary
         */
        logging_1.logHeader('PullApprove results by file');
        console_1.info.group("Matched Files (" + matchedFiles.length + " files)");
        verbose && matchedFiles.forEach(function (file) { return console_1.info(file); });
        console_1.info.groupEnd();
        console_1.info.group("Unmatched Files (" + unmatchedFiles.length + " files)");
        unmatchedFiles.forEach(function (file) { return console_1.info(file); });
        console_1.info.groupEnd();
        /**
         * Group by group Summary
         */
        logging_1.logHeader('PullApprove results by group');
        console_1.info.group("Groups skipped (" + groupsSkipped.length + " groups)");
        verbose && groupsSkipped.forEach(function (group) { return console_1.info("" + group.groupName); });
        console_1.info.groupEnd();
        var matchedGroups = resultsByGroup.filter(function (group) { return !group.unmatchedCount; });
        console_1.info.group("Matched conditions by Group (" + matchedGroups.length + " groups)");
        verbose && matchedGroups.forEach(function (group) { return logging_1.logGroup(group); });
        console_1.info.groupEnd();
        var unmatchedGroups = resultsByGroup.filter(function (group) { return group.unmatchedCount; });
        console_1.info.group("Unmatched conditions by Group (" + unmatchedGroups.length + " groups)");
        unmatchedGroups.forEach(function (group) { return logging_1.logGroup(group, false); });
        console_1.info.groupEnd();
        // Provide correct exit code based on verification success.
        process.exit(verificationSucceeded ? 0 : 1);
    }
    exports.verify = verify;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCx5QkFBZ0M7SUFDaEMsMkJBQTZCO0lBQzdCLG1DQUFzQztJQUV0QyxrRUFBK0M7SUFDL0Msb0VBQXNDO0lBRXRDLHNFQUF5QztJQUN6QywwRUFBOEM7SUFDOUMsZ0ZBQWtEO0lBRWxELFNBQWdCLE1BQU0sQ0FBQyxPQUFlO1FBQWYsd0JBQUEsRUFBQSxlQUFlO1FBQ3BDLCtCQUErQjtRQUMvQixhQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDViw2Q0FBNkM7UUFDN0MsSUFBTSxXQUFXLEdBQUcsdUJBQWMsRUFBRSxDQUFDO1FBQ3JDLDBDQUEwQztRQUMxQyxZQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEIsdUNBQXVDO1FBQ3ZDLElBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUM3RSxtRkFBbUY7UUFDbkYsa0ZBQWtGO1FBQ2xGLG1DQUFtQztRQUNuQyxJQUFNLFVBQVUsR0FDWixjQUFJLENBQUMsY0FBYyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQVMsSUFBSyxPQUFBLENBQUMsQ0FBQyxDQUFDLEVBQUgsQ0FBRyxDQUFDLENBQUM7UUFDdkYsZ0NBQWdDO1FBQ2hDLElBQU0sa0JBQWtCLEdBQUcsaUJBQVksQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN4RSxvREFBb0Q7UUFDcEQsSUFBTSxXQUFXLEdBQUcsaUNBQW9CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM3RCxxREFBcUQ7UUFDckQsSUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsRUFBa0I7Z0JBQWxCLDBCQUFrQixFQUFqQixpQkFBUyxFQUFFLGFBQUs7WUFDdEUsT0FBTyxJQUFJLHdCQUFnQixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUNILCtFQUErRTtRQUMvRSxrRUFBa0U7UUFDbEUsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQXhCLENBQXdCLENBQUMsQ0FBQztRQUN2RSxzQ0FBc0M7UUFDdEMsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUF6QixDQUF5QixDQUFDLENBQUM7UUFDL0UsaURBQWlEO1FBQ2pELElBQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztRQUNsQyxxREFBcUQ7UUFDckQsSUFBTSxjQUFjLEdBQWEsRUFBRSxDQUFDO1FBRXBDLG1FQUFtRTtRQUNuRSxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBWTtZQUM5QixJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQXBCLENBQW9CLENBQUMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3JFLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDekI7aUJBQU07Z0JBQ0wsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gseUJBQXlCO1FBQ3pCLElBQU0sY0FBYyxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1FBQzdFLDBFQUEwRTtRQUMxRSxxQ0FBcUM7UUFDckMsSUFBTSxxQkFBcUIsR0FDdkIsY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBakIsQ0FBaUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQztRQUUzRTs7V0FFRztRQUNILG1CQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM1QixJQUFJLHFCQUFxQixFQUFFO1lBQ3pCLGNBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1NBQzdDO2FBQU07WUFDTCxjQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUN6QyxjQUFJLEVBQUUsQ0FBQztZQUNQLGNBQUksQ0FBQywrREFBK0QsQ0FBQyxDQUFDO1lBQ3RFLGNBQUksQ0FBQywrREFBK0QsQ0FBQyxDQUFDO1lBQ3RFLGNBQUksQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO1NBQ3RFO1FBQ0Q7O1dBRUc7UUFDSCxtQkFBUyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDekMsY0FBSSxDQUFDLEtBQUssQ0FBQyxvQkFBa0IsWUFBWSxDQUFDLE1BQU0sWUFBUyxDQUFDLENBQUM7UUFDM0QsT0FBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxjQUFJLENBQUMsSUFBSSxDQUFDLEVBQVYsQ0FBVSxDQUFDLENBQUM7UUFDcEQsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLGNBQUksQ0FBQyxLQUFLLENBQUMsc0JBQW9CLGNBQWMsQ0FBQyxNQUFNLFlBQVMsQ0FBQyxDQUFDO1FBQy9ELGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxjQUFJLENBQUMsSUFBSSxDQUFDLEVBQVYsQ0FBVSxDQUFDLENBQUM7UUFDM0MsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCOztXQUVHO1FBQ0gsbUJBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQzFDLGNBQUksQ0FBQyxLQUFLLENBQUMscUJBQW1CLGFBQWEsQ0FBQyxNQUFNLGFBQVUsQ0FBQyxDQUFDO1FBQzlELE9BQU8sSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsY0FBSSxDQUFDLEtBQUcsS0FBSyxDQUFDLFNBQVcsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7UUFDdEUsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQXJCLENBQXFCLENBQUMsQ0FBQztRQUM1RSxjQUFJLENBQUMsS0FBSyxDQUFDLGtDQUFnQyxhQUFhLENBQUMsTUFBTSxhQUFVLENBQUMsQ0FBQztRQUMzRSxPQUFPLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLGtCQUFRLENBQUMsS0FBSyxDQUFDLEVBQWYsQ0FBZSxDQUFDLENBQUM7UUFDM0QsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsY0FBYyxFQUFwQixDQUFvQixDQUFDLENBQUM7UUFDN0UsY0FBSSxDQUFDLEtBQUssQ0FBQyxvQ0FBa0MsZUFBZSxDQUFDLE1BQU0sYUFBVSxDQUFDLENBQUM7UUFDL0UsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLGtCQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDekQsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWhCLDJEQUEyRDtRQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUF4RkQsd0JBd0ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge2NkLCBleGVjLCBzZXR9IGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwfSBmcm9tICcuL2dyb3VwJztcbmltcG9ydCB7bG9nR3JvdXAsIGxvZ0hlYWRlcn0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCB7cGFyc2VQdWxsQXBwcm92ZVlhbWx9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnkodmVyYm9zZSA9IGZhbHNlKSB7XG4gIC8vIEV4aXQgZWFybHkgb24gc2hlbGxqcyBlcnJvcnNcbiAgc2V0KCctZScpO1xuICAvLyBGdWxsIHBhdGggb2YgdGhlIGFuZ3VsYXIgcHJvamVjdCBkaXJlY3RvcnlcbiAgY29uc3QgUFJPSkVDVF9ESVIgPSBnZXRSZXBvQmFzZURpcigpO1xuICAvLyBDaGFuZ2UgdG8gdGhlIEFuZ3VsYXIgcHJvamVjdCBkaXJlY3RvcnlcbiAgY2QoUFJPSkVDVF9ESVIpO1xuICAvLyBGdWxsIHBhdGggdG8gUHVsbEFwcHJvdmUgY29uZmlnIGZpbGVcbiAgY29uc3QgUFVMTF9BUFBST1ZFX1lBTUxfUEFUSCA9IHBhdGgucmVzb2x2ZShQUk9KRUNUX0RJUiwgJy5wdWxsYXBwcm92ZS55bWwnKTtcbiAgLy8gQWxsIHJlbGF0aXZlIHBhdGggZmlsZSBuYW1lcyBpbiB0aGUgZ2l0IHJlcG8sIHRoaXMgaXMgcmV0cmlldmVkIHVzaW5nIGdpdCByYXRoZXJcbiAgLy8gdGhhdCBhIGdsb2Igc28gdGhhdCB3ZSBvbmx5IGdldCBmaWxlcyB0aGF0IGFyZSBjaGVja2VkIGluLCBpZ25vcmluZyB0aGluZ3MgbGlrZVxuICAvLyBub2RlX21vZHVsZXMsIC5iYXplbHJjLnVzZXIsIGV0Y1xuICBjb25zdCBSRVBPX0ZJTEVTID1cbiAgICAgIGV4ZWMoJ2dpdCBscy1maWxlcycsIHtzaWxlbnQ6IHRydWV9KS50cmltKCkuc3BsaXQoJ1xcbicpLmZpbHRlcigoXzogc3RyaW5nKSA9PiAhIV8pO1xuICAvLyBUaGUgcHVsbCBhcHByb3ZlIGNvbmZpZyBmaWxlLlxuICBjb25zdCBwdWxsQXBwcm92ZVlhbWxSYXcgPSByZWFkRmlsZVN5bmMoUFVMTF9BUFBST1ZFX1lBTUxfUEFUSCwgJ3V0ZjgnKTtcbiAgLy8gSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgcHVsbGFwcHJvdmUgeWFtbCBmaWxlLlxuICBjb25zdCBwdWxsQXBwcm92ZSA9IHBhcnNlUHVsbEFwcHJvdmVZYW1sKHB1bGxBcHByb3ZlWWFtbFJhdyk7XG4gIC8vIEFsbCBvZiB0aGUgZ3JvdXBzIGRlZmluZWQgaW4gdGhlIHB1bGxhcHByb3ZlIHlhbWwuXG4gIGNvbnN0IGdyb3VwcyA9IE9iamVjdC5lbnRyaWVzKHB1bGxBcHByb3ZlLmdyb3VwcykubWFwKChbZ3JvdXBOYW1lLCBncm91cF0pID0+IHtcbiAgICByZXR1cm4gbmV3IFB1bGxBcHByb3ZlR3JvdXAoZ3JvdXBOYW1lLCBncm91cCk7XG4gIH0pO1xuICAvLyBQdWxsQXBwcm92ZSBncm91cHMgd2l0aG91dCBjb25kaXRpb25zLiBUaGVzZSBhcmUgc2tpcHBlZCBpbiB0aGUgdmVyaWZpY2F0aW9uXG4gIC8vIGFzIHRob3NlIHdvdWxkIGFsd2F5cyBiZSBhY3RpdmUgYW5kIGNhdXNlIHplcm8gdW5tYXRjaGVkIGZpbGVzLlxuICBjb25zdCBncm91cHNTa2lwcGVkID0gZ3JvdXBzLmZpbHRlcihncm91cCA9PiAhZ3JvdXAuY29uZGl0aW9ucy5sZW5ndGgpO1xuICAvLyBQdWxsQXBwcm92ZSBncm91cHMgd2l0aCBjb25kaXRpb25zLlxuICBjb25zdCBncm91cHNXaXRoQ29uZGl0aW9ucyA9IGdyb3Vwcy5maWx0ZXIoZ3JvdXAgPT4gISFncm91cC5jb25kaXRpb25zLmxlbmd0aCk7XG4gIC8vIEZpbGVzIHdoaWNoIGFyZSBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC5cbiAgY29uc3QgbWF0Y2hlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBGaWxlcyB3aGljaCBhcmUgbm90IG1hdGNoZWQgYnkgYXQgbGVhc3Qgb25lIGdyb3VwLlxuICBjb25zdCB1bm1hdGNoZWRGaWxlczogc3RyaW5nW10gPSBbXTtcblxuICAvLyBUZXN0IGVhY2ggZmlsZSBpbiB0aGUgcmVwbyBhZ2FpbnN0IGVhY2ggZ3JvdXAgZm9yIGJlaW5nIG1hdGNoZWQuXG4gIFJFUE9fRklMRVMuZm9yRWFjaCgoZmlsZTogc3RyaW5nKSA9PiB7XG4gICAgaWYgKGdyb3Vwc1dpdGhDb25kaXRpb25zLmZpbHRlcihncm91cCA9PiBncm91cC50ZXN0RmlsZShmaWxlKSkubGVuZ3RoKSB7XG4gICAgICBtYXRjaGVkRmlsZXMucHVzaChmaWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdW5tYXRjaGVkRmlsZXMucHVzaChmaWxlKTtcbiAgICB9XG4gIH0pO1xuICAvLyBSZXN1bHRzIGZvciBlYWNoIGdyb3VwXG4gIGNvbnN0IHJlc3VsdHNCeUdyb3VwID0gZ3JvdXBzV2l0aENvbmRpdGlvbnMubWFwKGdyb3VwID0+IGdyb3VwLmdldFJlc3VsdHMoKSk7XG4gIC8vIFdoZXRoZXIgYWxsIGdyb3VwIGNvbmRpdGlvbiBsaW5lcyBtYXRjaCBhdCBsZWFzdCBvbmUgZmlsZSBhbmQgYWxsIGZpbGVzXG4gIC8vIGFyZSBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC5cbiAgY29uc3QgdmVyaWZpY2F0aW9uU3VjY2VlZGVkID1cbiAgICAgIHJlc3VsdHNCeUdyb3VwLmV2ZXJ5KHIgPT4gIXIudW5tYXRjaGVkQ291bnQpICYmICF1bm1hdGNoZWRGaWxlcy5sZW5ndGg7XG5cbiAgLyoqXG4gICAqIE92ZXJhbGwgcmVzdWx0XG4gICAqL1xuICBsb2dIZWFkZXIoJ092ZXJhbGwgUmVzdWx0Jyk7XG4gIGlmICh2ZXJpZmljYXRpb25TdWNjZWVkZWQpIHtcbiAgICBpbmZvKCdQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gc3VjY2VlZGVkIScpO1xuICB9IGVsc2Uge1xuICAgIGluZm8oYFB1bGxBcHByb3ZlIHZlcmlmaWNhdGlvbiBmYWlsZWQuYCk7XG4gICAgaW5mbygpO1xuICAgIGluZm8oYFBsZWFzZSB1cGRhdGUgJy5wdWxsYXBwcm92ZS55bWwnIHRvIGVuc3VyZSB0aGF0IGFsbCBuZWNlc3NhcnlgKTtcbiAgICBpbmZvKGBmaWxlcy9kaXJlY3RvcmllcyBoYXZlIG93bmVycyBhbmQgYWxsIHBhdHRlcm5zIHRoYXQgYXBwZWFyIGluYCk7XG4gICAgaW5mbyhgdGhlIGZpbGUgY29ycmVzcG9uZCB0byBhY3R1YWwgZmlsZXMvZGlyZWN0b3JpZXMgaW4gdGhlIHJlcG8uYCk7XG4gIH1cbiAgLyoqXG4gICAqIEZpbGUgYnkgZmlsZSBTdW1tYXJ5XG4gICAqL1xuICBsb2dIZWFkZXIoJ1B1bGxBcHByb3ZlIHJlc3VsdHMgYnkgZmlsZScpO1xuICBpbmZvLmdyb3VwKGBNYXRjaGVkIEZpbGVzICgke21hdGNoZWRGaWxlcy5sZW5ndGh9IGZpbGVzKWApO1xuICB2ZXJib3NlICYmIG1hdGNoZWRGaWxlcy5mb3JFYWNoKGZpbGUgPT4gaW5mbyhmaWxlKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgaW5mby5ncm91cChgVW5tYXRjaGVkIEZpbGVzICgke3VubWF0Y2hlZEZpbGVzLmxlbmd0aH0gZmlsZXMpYCk7XG4gIHVubWF0Y2hlZEZpbGVzLmZvckVhY2goZmlsZSA9PiBpbmZvKGZpbGUpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICAvKipcbiAgICogR3JvdXAgYnkgZ3JvdXAgU3VtbWFyeVxuICAgKi9cbiAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSByZXN1bHRzIGJ5IGdyb3VwJyk7XG4gIGluZm8uZ3JvdXAoYEdyb3VwcyBza2lwcGVkICgke2dyb3Vwc1NraXBwZWQubGVuZ3RofSBncm91cHMpYCk7XG4gIHZlcmJvc2UgJiYgZ3JvdXBzU2tpcHBlZC5mb3JFYWNoKGdyb3VwID0+IGluZm8oYCR7Z3JvdXAuZ3JvdXBOYW1lfWApKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBjb25zdCBtYXRjaGVkR3JvdXBzID0gcmVzdWx0c0J5R3JvdXAuZmlsdGVyKGdyb3VwID0+ICFncm91cC51bm1hdGNoZWRDb3VudCk7XG4gIGluZm8uZ3JvdXAoYE1hdGNoZWQgY29uZGl0aW9ucyBieSBHcm91cCAoJHttYXRjaGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICB2ZXJib3NlICYmIG1hdGNoZWRHcm91cHMuZm9yRWFjaChncm91cCA9PiBsb2dHcm91cChncm91cCkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGNvbnN0IHVubWF0Y2hlZEdyb3VwcyA9IHJlc3VsdHNCeUdyb3VwLmZpbHRlcihncm91cCA9PiBncm91cC51bm1hdGNoZWRDb3VudCk7XG4gIGluZm8uZ3JvdXAoYFVubWF0Y2hlZCBjb25kaXRpb25zIGJ5IEdyb3VwICgke3VubWF0Y2hlZEdyb3Vwcy5sZW5ndGh9IGdyb3VwcylgKTtcbiAgdW5tYXRjaGVkR3JvdXBzLmZvckVhY2goZ3JvdXAgPT4gbG9nR3JvdXAoZ3JvdXAsIGZhbHNlKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcblxuICAvLyBQcm92aWRlIGNvcnJlY3QgZXhpdCBjb2RlIGJhc2VkIG9uIHZlcmlmaWNhdGlvbiBzdWNjZXNzLlxuICBwcm9jZXNzLmV4aXQodmVyaWZpY2F0aW9uU3VjY2VlZGVkID8gMCA6IDEpO1xufVxuIl19