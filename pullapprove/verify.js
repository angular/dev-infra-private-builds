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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQWdDO0lBQ2hDLDJCQUE2QjtJQUM3QixtQ0FBc0M7SUFFdEMsa0VBQStDO0lBQy9DLG9FQUFzQztJQUV0QyxzRUFBeUM7SUFDekMsMEVBQThDO0lBQzlDLGdGQUFrRDtJQUVsRCxTQUFnQixNQUFNLENBQUMsT0FBZTtRQUFmLHdCQUFBLEVBQUEsZUFBZTtRQUNwQywrQkFBK0I7UUFDL0IsYUFBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1YsNkNBQTZDO1FBQzdDLElBQU0sV0FBVyxHQUFHLHVCQUFjLEVBQUUsQ0FBQztRQUNyQywwQ0FBMEM7UUFDMUMsWUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hCLHVDQUF1QztRQUN2QyxJQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDN0UsbUZBQW1GO1FBQ25GLGtGQUFrRjtRQUNsRixtQ0FBbUM7UUFDbkMsSUFBTSxVQUFVLEdBQ1osY0FBSSxDQUFDLGNBQWMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFTLElBQUssT0FBQSxDQUFDLENBQUMsQ0FBQyxFQUFILENBQUcsQ0FBQyxDQUFDO1FBQ3ZGLGdDQUFnQztRQUNoQyxJQUFNLGtCQUFrQixHQUFHLGlCQUFZLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEUsb0RBQW9EO1FBQ3BELElBQU0sV0FBVyxHQUFHLGlDQUFvQixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDN0QscURBQXFE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LENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUF4RkQsd0JBd0ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7Y2QsIGV4ZWMsIHNldH0gZnJvbSAnc2hlbGxqcyc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2luZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXB9IGZyb20gJy4vZ3JvdXAnO1xuaW1wb3J0IHtsb2dHcm91cCwgbG9nSGVhZGVyfSBmcm9tICcuL2xvZ2dpbmcnO1xuaW1wb3J0IHtwYXJzZVB1bGxBcHByb3ZlWWFtbH0gZnJvbSAnLi9wYXJzZS15YW1sJztcblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeSh2ZXJib3NlID0gZmFsc2UpIHtcbiAgLy8gRXhpdCBlYXJseSBvbiBzaGVsbGpzIGVycm9yc1xuICBzZXQoJy1lJyk7XG4gIC8vIEZ1bGwgcGF0aCBvZiB0aGUgYW5ndWxhciBwcm9qZWN0IGRpcmVjdG9yeVxuICBjb25zdCBQUk9KRUNUX0RJUiA9IGdldFJlcG9CYXNlRGlyKCk7XG4gIC8vIENoYW5nZSB0byB0aGUgQW5ndWxhciBwcm9qZWN0IGRpcmVjdG9yeVxuICBjZChQUk9KRUNUX0RJUik7XG4gIC8vIEZ1bGwgcGF0aCB0byBQdWxsQXBwcm92ZSBjb25maWcgZmlsZVxuICBjb25zdCBQVUxMX0FQUFJPVkVfWUFNTF9QQVRIID0gcGF0aC5yZXNvbHZlKFBST0pFQ1RfRElSLCAnLnB1bGxhcHByb3ZlLnltbCcpO1xuICAvLyBBbGwgcmVsYXRpdmUgcGF0aCBmaWxlIG5hbWVzIGluIHRoZSBnaXQgcmVwbywgdGhpcyBpcyByZXRyaWV2ZWQgdXNpbmcgZ2l0IHJhdGhlclxuICAvLyB0aGF0IGEgZ2xvYiBzbyB0aGF0IHdlIG9ubHkgZ2V0IGZpbGVzIHRoYXQgYXJlIGNoZWNrZWQgaW4sIGlnbm9yaW5nIHRoaW5ncyBsaWtlXG4gIC8vIG5vZGVfbW9kdWxlcywgLmJhemVscmMudXNlciwgZXRjXG4gIGNvbnN0IFJFUE9fRklMRVMgPVxuICAgICAgZXhlYygnZ2l0IGxzLWZpbGVzJywge3NpbGVudDogdHJ1ZX0pLnRyaW0oKS5zcGxpdCgnXFxuJykuZmlsdGVyKChfOiBzdHJpbmcpID0+ICEhXyk7XG4gIC8vIFRoZSBwdWxsIGFwcHJvdmUgY29uZmlnIGZpbGUuXG4gIGNvbnN0IHB1bGxBcHByb3ZlWWFtbFJhdyA9IHJlYWRGaWxlU3luYyhQVUxMX0FQUFJPVkVfWUFNTF9QQVRILCAndXRmOCcpO1xuICAvLyBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwdWxsYXBwcm92ZSB5YW1sIGZpbGUuXG4gIGNvbnN0IHB1bGxBcHByb3ZlID0gcGFyc2VQdWxsQXBwcm92ZVlhbWwocHVsbEFwcHJvdmVZYW1sUmF3KTtcbiAgLy8gQWxsIG9mIHRoZSBncm91cHMgZGVmaW5lZCBpbiB0aGUgcHVsbGFwcHJvdmUgeWFtbC5cbiAgY29uc3QgZ3JvdXBzID0gT2JqZWN0LmVudHJpZXMocHVsbEFwcHJvdmUuZ3JvdXBzKS5tYXAoKFtncm91cE5hbWUsIGdyb3VwXSkgPT4ge1xuICAgIHJldHVybiBuZXcgUHVsbEFwcHJvdmVHcm91cChncm91cE5hbWUsIGdyb3VwKTtcbiAgfSk7XG4gIC8vIFB1bGxBcHByb3ZlIGdyb3VwcyB3aXRob3V0IGNvbmRpdGlvbnMuIFRoZXNlIGFyZSBza2lwcGVkIGluIHRoZSB2ZXJpZmljYXRpb25cbiAgLy8gYXMgdGhvc2Ugd291bGQgYWx3YXlzIGJlIGFjdGl2ZSBhbmQgY2F1c2UgemVybyB1bm1hdGNoZWQgZmlsZXMuXG4gIGNvbnN0IGdyb3Vwc1NraXBwZWQgPSBncm91cHMuZmlsdGVyKGdyb3VwID0+ICFncm91cC5jb25kaXRpb25zLmxlbmd0aCk7XG4gIC8vIFB1bGxBcHByb3ZlIGdyb3VwcyB3aXRoIGNvbmRpdGlvbnMuXG4gIGNvbnN0IGdyb3Vwc1dpdGhDb25kaXRpb25zID0gZ3JvdXBzLmZpbHRlcihncm91cCA9PiAhIWdyb3VwLmNvbmRpdGlvbnMubGVuZ3RoKTtcbiAgLy8gRmlsZXMgd2hpY2ggYXJlIG1hdGNoZWQgYnkgYXQgbGVhc3Qgb25lIGdyb3VwLlxuICBjb25zdCBtYXRjaGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG4gIC8vIEZpbGVzIHdoaWNoIGFyZSBub3QgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuXG4gIGNvbnN0IHVubWF0Y2hlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIFRlc3QgZWFjaCBmaWxlIGluIHRoZSByZXBvIGFnYWluc3QgZWFjaCBncm91cCBmb3IgYmVpbmcgbWF0Y2hlZC5cbiAgUkVQT19GSUxFUy5mb3JFYWNoKChmaWxlOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoZ3JvdXBzV2l0aENvbmRpdGlvbnMuZmlsdGVyKGdyb3VwID0+IGdyb3VwLnRlc3RGaWxlKGZpbGUpKS5sZW5ndGgpIHtcbiAgICAgIG1hdGNoZWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1bm1hdGNoZWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgIH1cbiAgfSk7XG4gIC8vIFJlc3VsdHMgZm9yIGVhY2ggZ3JvdXBcbiAgY29uc3QgcmVzdWx0c0J5R3JvdXAgPSBncm91cHNXaXRoQ29uZGl0aW9ucy5tYXAoZ3JvdXAgPT4gZ3JvdXAuZ2V0UmVzdWx0cygpKTtcbiAgLy8gV2hldGhlciBhbGwgZ3JvdXAgY29uZGl0aW9uIGxpbmVzIG1hdGNoIGF0IGxlYXN0IG9uZSBmaWxlIGFuZCBhbGwgZmlsZXNcbiAgLy8gYXJlIG1hdGNoZWQgYnkgYXQgbGVhc3Qgb25lIGdyb3VwLlxuICBjb25zdCB2ZXJpZmljYXRpb25TdWNjZWVkZWQgPVxuICAgICAgcmVzdWx0c0J5R3JvdXAuZXZlcnkociA9PiAhci51bm1hdGNoZWRDb3VudCkgJiYgIXVubWF0Y2hlZEZpbGVzLmxlbmd0aDtcblxuICAvKipcbiAgICogT3ZlcmFsbCByZXN1bHRcbiAgICovXG4gIGxvZ0hlYWRlcignT3ZlcmFsbCBSZXN1bHQnKTtcbiAgaWYgKHZlcmlmaWNhdGlvblN1Y2NlZWRlZCkge1xuICAgIGluZm8oJ1B1bGxBcHByb3ZlIHZlcmlmaWNhdGlvbiBzdWNjZWVkZWQhJyk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhgUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIGZhaWxlZC5gKTtcbiAgICBpbmZvKCk7XG4gICAgaW5mbyhgUGxlYXNlIHVwZGF0ZSAnLnB1bGxhcHByb3ZlLnltbCcgdG8gZW5zdXJlIHRoYXQgYWxsIG5lY2Vzc2FyeWApO1xuICAgIGluZm8oYGZpbGVzL2RpcmVjdG9yaWVzIGhhdmUgb3duZXJzIGFuZCBhbGwgcGF0dGVybnMgdGhhdCBhcHBlYXIgaW5gKTtcbiAgICBpbmZvKGB0aGUgZmlsZSBjb3JyZXNwb25kIHRvIGFjdHVhbCBmaWxlcy9kaXJlY3RvcmllcyBpbiB0aGUgcmVwby5gKTtcbiAgfVxuICAvKipcbiAgICogRmlsZSBieSBmaWxlIFN1bW1hcnlcbiAgICovXG4gIGxvZ0hlYWRlcignUHVsbEFwcHJvdmUgcmVzdWx0cyBieSBmaWxlJyk7XG4gIGluZm8uZ3JvdXAoYE1hdGNoZWQgRmlsZXMgKCR7bWF0Y2hlZEZpbGVzLmxlbmd0aH0gZmlsZXMpYCk7XG4gIHZlcmJvc2UgJiYgbWF0Y2hlZEZpbGVzLmZvckVhY2goZmlsZSA9PiBpbmZvKGZpbGUpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBpbmZvLmdyb3VwKGBVbm1hdGNoZWQgRmlsZXMgKCR7dW5tYXRjaGVkRmlsZXMubGVuZ3RofSBmaWxlcylgKTtcbiAgdW5tYXRjaGVkRmlsZXMuZm9yRWFjaChmaWxlID0+IGluZm8oZmlsZSkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIC8qKlxuICAgKiBHcm91cCBieSBncm91cCBTdW1tYXJ5XG4gICAqL1xuICBsb2dIZWFkZXIoJ1B1bGxBcHByb3ZlIHJlc3VsdHMgYnkgZ3JvdXAnKTtcbiAgaW5mby5ncm91cChgR3JvdXBzIHNraXBwZWQgKCR7Z3JvdXBzU2tpcHBlZC5sZW5ndGh9IGdyb3VwcylgKTtcbiAgdmVyYm9zZSAmJiBncm91cHNTa2lwcGVkLmZvckVhY2goZ3JvdXAgPT4gaW5mbyhgJHtncm91cC5ncm91cE5hbWV9YCkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGNvbnN0IG1hdGNoZWRHcm91cHMgPSByZXN1bHRzQnlHcm91cC5maWx0ZXIoZ3JvdXAgPT4gIWdyb3VwLnVubWF0Y2hlZENvdW50KTtcbiAgaW5mby5ncm91cChgTWF0Y2hlZCBjb25kaXRpb25zIGJ5IEdyb3VwICgke21hdGNoZWRHcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIHZlcmJvc2UgJiYgbWF0Y2hlZEdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IGxvZ0dyb3VwKGdyb3VwKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgY29uc3QgdW5tYXRjaGVkR3JvdXBzID0gcmVzdWx0c0J5R3JvdXAuZmlsdGVyKGdyb3VwID0+IGdyb3VwLnVubWF0Y2hlZENvdW50KTtcbiAgaW5mby5ncm91cChgVW5tYXRjaGVkIGNvbmRpdGlvbnMgYnkgR3JvdXAgKCR7dW5tYXRjaGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICB1bm1hdGNoZWRHcm91cHMuZm9yRWFjaChncm91cCA9PiBsb2dHcm91cChncm91cCwgZmFsc2UpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuXG4gIC8vIFByb3ZpZGUgY29ycmVjdCBleGl0IGNvZGUgYmFzZWQgb24gdmVyaWZpY2F0aW9uIHN1Y2Nlc3MuXG4gIHByb2Nlc3MuZXhpdCh2ZXJpZmljYXRpb25TdWNjZWVkZWQgPyAwIDogMSk7XG59XG4iXX0=