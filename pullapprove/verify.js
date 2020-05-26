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
    exports.verify = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
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
        verbose && matchedFiles.forEach(function (file) { return console.info(file); });
        console.groupEnd();
        console.groupCollapsed("Unmatched Files (" + unmatchedFiles.length + " files)");
        unmatchedFiles.forEach(function (file) { return console.info(file); });
        console.groupEnd();
        /**
         * Group by group Summary
         */
        logging_1.logHeader('PullApprove results by group');
        console.groupCollapsed("Groups skipped (" + groupsSkipped.length + " groups)");
        verbose && groupsSkipped.forEach(function (group) { return console.info("" + group.groupName); });
        console.groupEnd();
        var matchedGroups = resultsByGroup.filter(function (group) { return !group.unmatchedCount; });
        console.groupCollapsed("Matched conditions by Group (" + matchedGroups.length + " groups)");
        verbose && matchedGroups.forEach(function (group) { return logging_1.logGroup(group); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQWdDO0lBQ2hDLDJCQUE2QjtJQUM3QixtQ0FBc0M7SUFFdEMsa0VBQStDO0lBRS9DLHNFQUF5QztJQUN6QywwRUFBOEM7SUFDOUMsZ0ZBQWtEO0lBRWxELFNBQWdCLE1BQU0sQ0FBQyxPQUFlO1FBQWYsd0JBQUEsRUFBQSxlQUFlO1FBQ3BDLCtCQUErQjtRQUMvQixhQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDViw2Q0FBNkM7UUFDN0MsSUFBTSxXQUFXLEdBQUcsdUJBQWMsRUFBRSxDQUFDO1FBQ3JDLDBDQUEwQztRQUMxQyxZQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEIsdUNBQXVDO1FBQ3ZDLElBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUM3RSxtRkFBbUY7UUFDbkYsa0ZBQWtGO1FBQ2xGLG1DQUFtQztRQUNuQyxJQUFNLFVBQVUsR0FDWixjQUFJLENBQUMsY0FBYyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQVMsSUFBSyxPQUFBLENBQUMsQ0FBQyxDQUFDLEVBQUgsQ0FBRyxDQUFDLENBQUM7UUFDdkYsZ0NBQWdDO1FBQ2hDLElBQU0sa0JBQWtCLEdBQUcsaUJBQVksQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN4RSxvREFBb0Q7UUFDcEQsSUFBTSxXQUFXLEdBQUcsaUNBQW9CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM3RCxxREFBcUQ7UUFDckQsSUFBTSxN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O1FBRW5CLDJEQUEyRDtRQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUF2RkQsd0JBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7Y2QsIGV4ZWMsIHNldH0gZnJvbSAnc2hlbGxqcyc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cH0gZnJvbSAnLi9ncm91cCc7XG5pbXBvcnQge2xvZ0dyb3VwLCBsb2dIZWFkZXJ9IGZyb20gJy4vbG9nZ2luZyc7XG5pbXBvcnQge3BhcnNlUHVsbEFwcHJvdmVZYW1sfSBmcm9tICcuL3BhcnNlLXlhbWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5KHZlcmJvc2UgPSBmYWxzZSkge1xuICAvLyBFeGl0IGVhcmx5IG9uIHNoZWxsanMgZXJyb3JzXG4gIHNldCgnLWUnKTtcbiAgLy8gRnVsbCBwYXRoIG9mIHRoZSBhbmd1bGFyIHByb2plY3QgZGlyZWN0b3J5XG4gIGNvbnN0IFBST0pFQ1RfRElSID0gZ2V0UmVwb0Jhc2VEaXIoKTtcbiAgLy8gQ2hhbmdlIHRvIHRoZSBBbmd1bGFyIHByb2plY3QgZGlyZWN0b3J5XG4gIGNkKFBST0pFQ1RfRElSKTtcbiAgLy8gRnVsbCBwYXRoIHRvIFB1bGxBcHByb3ZlIGNvbmZpZyBmaWxlXG4gIGNvbnN0IFBVTExfQVBQUk9WRV9ZQU1MX1BBVEggPSBwYXRoLnJlc29sdmUoUFJPSkVDVF9ESVIsICcucHVsbGFwcHJvdmUueW1sJyk7XG4gIC8vIEFsbCByZWxhdGl2ZSBwYXRoIGZpbGUgbmFtZXMgaW4gdGhlIGdpdCByZXBvLCB0aGlzIGlzIHJldHJpZXZlZCB1c2luZyBnaXQgcmF0aGVyXG4gIC8vIHRoYXQgYSBnbG9iIHNvIHRoYXQgd2Ugb25seSBnZXQgZmlsZXMgdGhhdCBhcmUgY2hlY2tlZCBpbiwgaWdub3JpbmcgdGhpbmdzIGxpa2VcbiAgLy8gbm9kZV9tb2R1bGVzLCAuYmF6ZWxyYy51c2VyLCBldGNcbiAgY29uc3QgUkVQT19GSUxFUyA9XG4gICAgICBleGVjKCdnaXQgbHMtZmlsZXMnLCB7c2lsZW50OiB0cnVlfSkudHJpbSgpLnNwbGl0KCdcXG4nKS5maWx0ZXIoKF86IHN0cmluZykgPT4gISFfKTtcbiAgLy8gVGhlIHB1bGwgYXBwcm92ZSBjb25maWcgZmlsZS5cbiAgY29uc3QgcHVsbEFwcHJvdmVZYW1sUmF3ID0gcmVhZEZpbGVTeW5jKFBVTExfQVBQUk9WRV9ZQU1MX1BBVEgsICd1dGY4Jyk7XG4gIC8vIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHB1bGxhcHByb3ZlIHlhbWwgZmlsZS5cbiAgY29uc3QgcHVsbEFwcHJvdmUgPSBwYXJzZVB1bGxBcHByb3ZlWWFtbChwdWxsQXBwcm92ZVlhbWxSYXcpO1xuICAvLyBBbGwgb2YgdGhlIGdyb3VwcyBkZWZpbmVkIGluIHRoZSBwdWxsYXBwcm92ZSB5YW1sLlxuICBjb25zdCBncm91cHMgPSBPYmplY3QuZW50cmllcyhwdWxsQXBwcm92ZS5ncm91cHMpLm1hcCgoW2dyb3VwTmFtZSwgZ3JvdXBdKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQdWxsQXBwcm92ZUdyb3VwKGdyb3VwTmFtZSwgZ3JvdXApO1xuICB9KTtcbiAgLy8gUHVsbEFwcHJvdmUgZ3JvdXBzIHdpdGhvdXQgY29uZGl0aW9ucy4gVGhlc2UgYXJlIHNraXBwZWQgaW4gdGhlIHZlcmlmaWNhdGlvblxuICAvLyBhcyB0aG9zZSB3b3VsZCBhbHdheXMgYmUgYWN0aXZlIGFuZCBjYXVzZSB6ZXJvIHVubWF0Y2hlZCBmaWxlcy5cbiAgY29uc3QgZ3JvdXBzU2tpcHBlZCA9IGdyb3Vwcy5maWx0ZXIoZ3JvdXAgPT4gIWdyb3VwLmNvbmRpdGlvbnMubGVuZ3RoKTtcbiAgLy8gUHVsbEFwcHJvdmUgZ3JvdXBzIHdpdGggY29uZGl0aW9ucy5cbiAgY29uc3QgZ3JvdXBzV2l0aENvbmRpdGlvbnMgPSBncm91cHMuZmlsdGVyKGdyb3VwID0+ICEhZ3JvdXAuY29uZGl0aW9ucy5sZW5ndGgpO1xuICAvLyBGaWxlcyB3aGljaCBhcmUgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuXG4gIGNvbnN0IG1hdGNoZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgLy8gRmlsZXMgd2hpY2ggYXJlIG5vdCBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC5cbiAgY29uc3QgdW5tYXRjaGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gVGVzdCBlYWNoIGZpbGUgaW4gdGhlIHJlcG8gYWdhaW5zdCBlYWNoIGdyb3VwIGZvciBiZWluZyBtYXRjaGVkLlxuICBSRVBPX0ZJTEVTLmZvckVhY2goKGZpbGU6IHN0cmluZykgPT4ge1xuICAgIGlmIChncm91cHNXaXRoQ29uZGl0aW9ucy5maWx0ZXIoZ3JvdXAgPT4gZ3JvdXAudGVzdEZpbGUoZmlsZSkpLmxlbmd0aCkge1xuICAgICAgbWF0Y2hlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVubWF0Y2hlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgfVxuICB9KTtcbiAgLy8gUmVzdWx0cyBmb3IgZWFjaCBncm91cFxuICBjb25zdCByZXN1bHRzQnlHcm91cCA9IGdyb3Vwc1dpdGhDb25kaXRpb25zLm1hcChncm91cCA9PiBncm91cC5nZXRSZXN1bHRzKCkpO1xuICAvLyBXaGV0aGVyIGFsbCBncm91cCBjb25kaXRpb24gbGluZXMgbWF0Y2ggYXQgbGVhc3Qgb25lIGZpbGUgYW5kIGFsbCBmaWxlc1xuICAvLyBhcmUgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuXG4gIGNvbnN0IHZlcmlmaWNhdGlvblN1Y2NlZWRlZCA9XG4gICAgICByZXN1bHRzQnlHcm91cC5ldmVyeShyID0+ICFyLnVubWF0Y2hlZENvdW50KSAmJiAhdW5tYXRjaGVkRmlsZXMubGVuZ3RoO1xuXG4gIC8qKlxuICAgKiBPdmVyYWxsIHJlc3VsdFxuICAgKi9cbiAgbG9nSGVhZGVyKCdPdmVyYWxsIFJlc3VsdCcpO1xuICBpZiAodmVyaWZpY2F0aW9uU3VjY2VlZGVkKSB7XG4gICAgY29uc29sZS5pbmZvKCdQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gc3VjY2VlZGVkIScpO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuaW5mbyhgUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIGZhaWxlZC5cXG5gKTtcbiAgICBjb25zb2xlLmluZm8oYFBsZWFzZSB1cGRhdGUgJy5wdWxsYXBwcm92ZS55bWwnIHRvIGVuc3VyZSB0aGF0IGFsbCBuZWNlc3NhcnlgKTtcbiAgICBjb25zb2xlLmluZm8oYGZpbGVzL2RpcmVjdG9yaWVzIGhhdmUgb3duZXJzIGFuZCBhbGwgcGF0dGVybnMgdGhhdCBhcHBlYXIgaW5gKTtcbiAgICBjb25zb2xlLmluZm8oYHRoZSBmaWxlIGNvcnJlc3BvbmQgdG8gYWN0dWFsIGZpbGVzL2RpcmVjdG9yaWVzIGluIHRoZSByZXBvLmApO1xuICB9XG4gIC8qKlxuICAgKiBGaWxlIGJ5IGZpbGUgU3VtbWFyeVxuICAgKi9cbiAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSByZXN1bHRzIGJ5IGZpbGUnKTtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgTWF0Y2hlZCBGaWxlcyAoJHttYXRjaGVkRmlsZXMubGVuZ3RofSBmaWxlcylgKTtcbiAgdmVyYm9zZSAmJiBtYXRjaGVkRmlsZXMuZm9yRWFjaChmaWxlID0+IGNvbnNvbGUuaW5mbyhmaWxlKSk7XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgVW5tYXRjaGVkIEZpbGVzICgke3VubWF0Y2hlZEZpbGVzLmxlbmd0aH0gZmlsZXMpYCk7XG4gIHVubWF0Y2hlZEZpbGVzLmZvckVhY2goZmlsZSA9PiBjb25zb2xlLmluZm8oZmlsZSkpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gIC8qKlxuICAgKiBHcm91cCBieSBncm91cCBTdW1tYXJ5XG4gICAqL1xuICBsb2dIZWFkZXIoJ1B1bGxBcHByb3ZlIHJlc3VsdHMgYnkgZ3JvdXAnKTtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgR3JvdXBzIHNraXBwZWQgKCR7Z3JvdXBzU2tpcHBlZC5sZW5ndGh9IGdyb3VwcylgKTtcbiAgdmVyYm9zZSAmJiBncm91cHNTa2lwcGVkLmZvckVhY2goZ3JvdXAgPT4gY29uc29sZS5pbmZvKGAke2dyb3VwLmdyb3VwTmFtZX1gKSk7XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgY29uc3QgbWF0Y2hlZEdyb3VwcyA9IHJlc3VsdHNCeUdyb3VwLmZpbHRlcihncm91cCA9PiAhZ3JvdXAudW5tYXRjaGVkQ291bnQpO1xuICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBNYXRjaGVkIGNvbmRpdGlvbnMgYnkgR3JvdXAgKCR7bWF0Y2hlZEdyb3Vwcy5sZW5ndGh9IGdyb3VwcylgKTtcbiAgdmVyYm9zZSAmJiBtYXRjaGVkR3JvdXBzLmZvckVhY2goZ3JvdXAgPT4gbG9nR3JvdXAoZ3JvdXApKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xuICBjb25zdCB1bm1hdGNoZWRHcm91cHMgPSByZXN1bHRzQnlHcm91cC5maWx0ZXIoZ3JvdXAgPT4gZ3JvdXAudW5tYXRjaGVkQ291bnQpO1xuICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBVbm1hdGNoZWQgY29uZGl0aW9ucyBieSBHcm91cCAoJHt1bm1hdGNoZWRHcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIHVubWF0Y2hlZEdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IGxvZ0dyb3VwKGdyb3VwLCBmYWxzZSkpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG5cbiAgLy8gUHJvdmlkZSBjb3JyZWN0IGV4aXQgY29kZSBiYXNlZCBvbiB2ZXJpZmljYXRpb24gc3VjY2Vzcy5cbiAgcHJvY2Vzcy5leGl0KHZlcmlmaWNhdGlvblN1Y2NlZWRlZCA/IDAgOiAxKTtcbn1cbiJdfQ==