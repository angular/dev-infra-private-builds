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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQWdDO0lBQ2hDLDJCQUE2QjtJQUM3QixtQ0FBc0M7SUFFdEMsa0VBQStDO0lBRS9DLHNFQUF5QztJQUN6QywwRUFBOEM7SUFDOUMsZ0ZBQWtEO0lBRWxELFNBQWdCLE1BQU0sQ0FBQyxPQUFlO1FBQWYsd0JBQUEsRUFBQSxlQUFlO1FBQ3BDLCtCQUErQjtRQUMvQixhQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDViw2Q0FBNkM7UUFDN0MsSUFBTSxXQUFXLEdBQUcsdUJBQWMsRUFBRSxDQUFDO1FBQ3JDLDBDQUEwQztRQUMxQyxZQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEIsdUNBQXVDO1FBQ3ZDLElBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUM3RSxtRkFBbUY7UUFDbkYsa0ZBQWtGO1FBQ2xGLG1DQUFtQztRQUNuQyxJQUFNLFVBQVUsR0FDWixjQUFJLENBQUMsY0FBYyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQVMsSUFBSyxPQUFBLENBQUMsQ0FBQyxDQUFDLEVBQUgsQ0FBRyxDQUFDLENBQUM7UUFDdkYsZ0NBQWdDO1FBQ2hDLElBQU0sa0JBQWtCLEdBQUcsaUJBQVksQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN4RSxvREFBb0Q7UUFDcEQsSUFBTSxXQUFXLEdBQUcsaUNBQW9CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUM3RCxxREFBcUQ7UUFDckQsSUFBTSxN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O1FBRW5CLDJEQUEyRDtRQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUF2RkQsd0JBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge2NkLCBleGVjLCBzZXR9IGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXB9IGZyb20gJy4vZ3JvdXAnO1xuaW1wb3J0IHtsb2dHcm91cCwgbG9nSGVhZGVyfSBmcm9tICcuL2xvZ2dpbmcnO1xuaW1wb3J0IHtwYXJzZVB1bGxBcHByb3ZlWWFtbH0gZnJvbSAnLi9wYXJzZS15YW1sJztcblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeSh2ZXJib3NlID0gZmFsc2UpIHtcbiAgLy8gRXhpdCBlYXJseSBvbiBzaGVsbGpzIGVycm9yc1xuICBzZXQoJy1lJyk7XG4gIC8vIEZ1bGwgcGF0aCBvZiB0aGUgYW5ndWxhciBwcm9qZWN0IGRpcmVjdG9yeVxuICBjb25zdCBQUk9KRUNUX0RJUiA9IGdldFJlcG9CYXNlRGlyKCk7XG4gIC8vIENoYW5nZSB0byB0aGUgQW5ndWxhciBwcm9qZWN0IGRpcmVjdG9yeVxuICBjZChQUk9KRUNUX0RJUik7XG4gIC8vIEZ1bGwgcGF0aCB0byBQdWxsQXBwcm92ZSBjb25maWcgZmlsZVxuICBjb25zdCBQVUxMX0FQUFJPVkVfWUFNTF9QQVRIID0gcGF0aC5yZXNvbHZlKFBST0pFQ1RfRElSLCAnLnB1bGxhcHByb3ZlLnltbCcpO1xuICAvLyBBbGwgcmVsYXRpdmUgcGF0aCBmaWxlIG5hbWVzIGluIHRoZSBnaXQgcmVwbywgdGhpcyBpcyByZXRyaWV2ZWQgdXNpbmcgZ2l0IHJhdGhlclxuICAvLyB0aGF0IGEgZ2xvYiBzbyB0aGF0IHdlIG9ubHkgZ2V0IGZpbGVzIHRoYXQgYXJlIGNoZWNrZWQgaW4sIGlnbm9yaW5nIHRoaW5ncyBsaWtlXG4gIC8vIG5vZGVfbW9kdWxlcywgLmJhemVscmMudXNlciwgZXRjXG4gIGNvbnN0IFJFUE9fRklMRVMgPVxuICAgICAgZXhlYygnZ2l0IGxzLWZpbGVzJywge3NpbGVudDogdHJ1ZX0pLnRyaW0oKS5zcGxpdCgnXFxuJykuZmlsdGVyKChfOiBzdHJpbmcpID0+ICEhXyk7XG4gIC8vIFRoZSBwdWxsIGFwcHJvdmUgY29uZmlnIGZpbGUuXG4gIGNvbnN0IHB1bGxBcHByb3ZlWWFtbFJhdyA9IHJlYWRGaWxlU3luYyhQVUxMX0FQUFJPVkVfWUFNTF9QQVRILCAndXRmOCcpO1xuICAvLyBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwdWxsYXBwcm92ZSB5YW1sIGZpbGUuXG4gIGNvbnN0IHB1bGxBcHByb3ZlID0gcGFyc2VQdWxsQXBwcm92ZVlhbWwocHVsbEFwcHJvdmVZYW1sUmF3KTtcbiAgLy8gQWxsIG9mIHRoZSBncm91cHMgZGVmaW5lZCBpbiB0aGUgcHVsbGFwcHJvdmUgeWFtbC5cbiAgY29uc3QgZ3JvdXBzID0gT2JqZWN0LmVudHJpZXMocHVsbEFwcHJvdmUuZ3JvdXBzKS5tYXAoKFtncm91cE5hbWUsIGdyb3VwXSkgPT4ge1xuICAgIHJldHVybiBuZXcgUHVsbEFwcHJvdmVHcm91cChncm91cE5hbWUsIGdyb3VwKTtcbiAgfSk7XG4gIC8vIFB1bGxBcHByb3ZlIGdyb3VwcyB3aXRob3V0IGNvbmRpdGlvbnMuIFRoZXNlIGFyZSBza2lwcGVkIGluIHRoZSB2ZXJpZmljYXRpb25cbiAgLy8gYXMgdGhvc2Ugd291bGQgYWx3YXlzIGJlIGFjdGl2ZSBhbmQgY2F1c2UgemVybyB1bm1hdGNoZWQgZmlsZXMuXG4gIGNvbnN0IGdyb3Vwc1NraXBwZWQgPSBncm91cHMuZmlsdGVyKGdyb3VwID0+ICFncm91cC5jb25kaXRpb25zLmxlbmd0aCk7XG4gIC8vIFB1bGxBcHByb3ZlIGdyb3VwcyB3aXRoIGNvbmRpdGlvbnMuXG4gIGNvbnN0IGdyb3Vwc1dpdGhDb25kaXRpb25zID0gZ3JvdXBzLmZpbHRlcihncm91cCA9PiAhIWdyb3VwLmNvbmRpdGlvbnMubGVuZ3RoKTtcbiAgLy8gRmlsZXMgd2hpY2ggYXJlIG1hdGNoZWQgYnkgYXQgbGVhc3Qgb25lIGdyb3VwLlxuICBjb25zdCBtYXRjaGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG4gIC8vIEZpbGVzIHdoaWNoIGFyZSBub3QgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuXG4gIGNvbnN0IHVubWF0Y2hlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIFRlc3QgZWFjaCBmaWxlIGluIHRoZSByZXBvIGFnYWluc3QgZWFjaCBncm91cCBmb3IgYmVpbmcgbWF0Y2hlZC5cbiAgUkVQT19GSUxFUy5mb3JFYWNoKChmaWxlOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoZ3JvdXBzV2l0aENvbmRpdGlvbnMuZmlsdGVyKGdyb3VwID0+IGdyb3VwLnRlc3RGaWxlKGZpbGUpKS5sZW5ndGgpIHtcbiAgICAgIG1hdGNoZWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1bm1hdGNoZWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgIH1cbiAgfSk7XG4gIC8vIFJlc3VsdHMgZm9yIGVhY2ggZ3JvdXBcbiAgY29uc3QgcmVzdWx0c0J5R3JvdXAgPSBncm91cHNXaXRoQ29uZGl0aW9ucy5tYXAoZ3JvdXAgPT4gZ3JvdXAuZ2V0UmVzdWx0cygpKTtcbiAgLy8gV2hldGhlciBhbGwgZ3JvdXAgY29uZGl0aW9uIGxpbmVzIG1hdGNoIGF0IGxlYXN0IG9uZSBmaWxlIGFuZCBhbGwgZmlsZXNcbiAgLy8gYXJlIG1hdGNoZWQgYnkgYXQgbGVhc3Qgb25lIGdyb3VwLlxuICBjb25zdCB2ZXJpZmljYXRpb25TdWNjZWVkZWQgPVxuICAgICAgcmVzdWx0c0J5R3JvdXAuZXZlcnkociA9PiAhci51bm1hdGNoZWRDb3VudCkgJiYgIXVubWF0Y2hlZEZpbGVzLmxlbmd0aDtcblxuICAvKipcbiAgICogT3ZlcmFsbCByZXN1bHRcbiAgICovXG4gIGxvZ0hlYWRlcignT3ZlcmFsbCBSZXN1bHQnKTtcbiAgaWYgKHZlcmlmaWNhdGlvblN1Y2NlZWRlZCkge1xuICAgIGNvbnNvbGUuaW5mbygnUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIHN1Y2NlZWRlZCEnKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmluZm8oYFB1bGxBcHByb3ZlIHZlcmlmaWNhdGlvbiBmYWlsZWQuXFxuYCk7XG4gICAgY29uc29sZS5pbmZvKGBQbGVhc2UgdXBkYXRlICcucHVsbGFwcHJvdmUueW1sJyB0byBlbnN1cmUgdGhhdCBhbGwgbmVjZXNzYXJ5YCk7XG4gICAgY29uc29sZS5pbmZvKGBmaWxlcy9kaXJlY3RvcmllcyBoYXZlIG93bmVycyBhbmQgYWxsIHBhdHRlcm5zIHRoYXQgYXBwZWFyIGluYCk7XG4gICAgY29uc29sZS5pbmZvKGB0aGUgZmlsZSBjb3JyZXNwb25kIHRvIGFjdHVhbCBmaWxlcy9kaXJlY3RvcmllcyBpbiB0aGUgcmVwby5gKTtcbiAgfVxuICAvKipcbiAgICogRmlsZSBieSBmaWxlIFN1bW1hcnlcbiAgICovXG4gIGxvZ0hlYWRlcignUHVsbEFwcHJvdmUgcmVzdWx0cyBieSBmaWxlJyk7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYE1hdGNoZWQgRmlsZXMgKCR7bWF0Y2hlZEZpbGVzLmxlbmd0aH0gZmlsZXMpYCk7XG4gIHZlcmJvc2UgJiYgbWF0Y2hlZEZpbGVzLmZvckVhY2goZmlsZSA9PiBjb25zb2xlLmluZm8oZmlsZSkpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYFVubWF0Y2hlZCBGaWxlcyAoJHt1bm1hdGNoZWRGaWxlcy5sZW5ndGh9IGZpbGVzKWApO1xuICB1bm1hdGNoZWRGaWxlcy5mb3JFYWNoKGZpbGUgPT4gY29uc29sZS5pbmZvKGZpbGUpKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xuICAvKipcbiAgICogR3JvdXAgYnkgZ3JvdXAgU3VtbWFyeVxuICAgKi9cbiAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSByZXN1bHRzIGJ5IGdyb3VwJyk7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYEdyb3VwcyBza2lwcGVkICgke2dyb3Vwc1NraXBwZWQubGVuZ3RofSBncm91cHMpYCk7XG4gIHZlcmJvc2UgJiYgZ3JvdXBzU2tpcHBlZC5mb3JFYWNoKGdyb3VwID0+IGNvbnNvbGUuaW5mbyhgJHtncm91cC5ncm91cE5hbWV9YCkpO1xuICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gIGNvbnN0IG1hdGNoZWRHcm91cHMgPSByZXN1bHRzQnlHcm91cC5maWx0ZXIoZ3JvdXAgPT4gIWdyb3VwLnVubWF0Y2hlZENvdW50KTtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgTWF0Y2hlZCBjb25kaXRpb25zIGJ5IEdyb3VwICgke21hdGNoZWRHcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIHZlcmJvc2UgJiYgbWF0Y2hlZEdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IGxvZ0dyb3VwKGdyb3VwKSk7XG4gIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgY29uc3QgdW5tYXRjaGVkR3JvdXBzID0gcmVzdWx0c0J5R3JvdXAuZmlsdGVyKGdyb3VwID0+IGdyb3VwLnVubWF0Y2hlZENvdW50KTtcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgVW5tYXRjaGVkIGNvbmRpdGlvbnMgYnkgR3JvdXAgKCR7dW5tYXRjaGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICB1bm1hdGNoZWRHcm91cHMuZm9yRWFjaChncm91cCA9PiBsb2dHcm91cChncm91cCwgZmFsc2UpKTtcbiAgY29uc29sZS5ncm91cEVuZCgpO1xuXG4gIC8vIFByb3ZpZGUgY29ycmVjdCBleGl0IGNvZGUgYmFzZWQgb24gdmVyaWZpY2F0aW9uIHN1Y2Nlc3MuXG4gIHByb2Nlc3MuZXhpdCh2ZXJpZmljYXRpb25TdWNjZWVkZWQgPyAwIDogMSk7XG59XG4iXX0=