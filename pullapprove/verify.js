(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/verify", ["require", "exports", "fs", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/pullapprove/logging", "@angular/dev-infra-private/pullapprove/parse-yaml"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verify = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var fs_1 = require("fs");
    var path_1 = require("path");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    var logging_1 = require("@angular/dev-infra-private/pullapprove/logging");
    var parse_yaml_1 = require("@angular/dev-infra-private/pullapprove/parse-yaml");
    function verify() {
        var git = index_1.GitClient.getInstance();
        /** Full path to PullApprove config file */
        var PULL_APPROVE_YAML_PATH = path_1.resolve(git.baseDir, '.pullapprove.yml');
        /** All tracked files in the repository. */
        var REPO_FILES = git.allFiles();
        /** The pull approve config file. */
        var pullApproveYamlRaw = fs_1.readFileSync(PULL_APPROVE_YAML_PATH, 'utf8');
        /** All of the groups defined in the pullapprove yaml. */
        var groups = parse_yaml_1.getGroupsFromYaml(pullApproveYamlRaw);
        /**
         * PullApprove groups without conditions. These are skipped in the verification
         * as those would always be active and cause zero unmatched files.
         */
        var groupsSkipped = groups.filter(function (group) { return !group.conditions.length; });
        /** PullApprove groups with conditions. */
        var groupsWithConditions = groups.filter(function (group) { return !!group.conditions.length; });
        /** Files which are matched by at least one group. */
        var matchedFiles = [];
        /** Files which are not matched by at least one group. */
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
        /** Results for each group */
        var resultsByGroup = groupsWithConditions.map(function (group) { return group.getResults(); });
        /**
         * Whether all group condition lines match at least one file and all files
         * are matched by at least one group.
         */
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
        matchedFiles.forEach(function (file) { return console_1.debug(file); });
        console_1.info.groupEnd();
        console_1.info.group("Unmatched Files (" + unmatchedFiles.length + " files)");
        unmatchedFiles.forEach(function (file) { return console_1.info(file); });
        console_1.info.groupEnd();
        /**
         * Group by group Summary
         */
        logging_1.logHeader('PullApprove results by group');
        console_1.info.group("Groups skipped (" + groupsSkipped.length + " groups)");
        groupsSkipped.forEach(function (group) { return console_1.debug("" + group.groupName); });
        console_1.info.groupEnd();
        var matchedGroups = resultsByGroup.filter(function (group) { return !group.unmatchedCount; });
        console_1.info.group("Matched conditions by Group (" + matchedGroups.length + " groups)");
        matchedGroups.forEach(function (group) { return logging_1.logGroup(group, 'matchedConditions', console_1.debug); });
        console_1.info.groupEnd();
        var unmatchedGroups = resultsByGroup.filter(function (group) { return group.unmatchedCount; });
        console_1.info.group("Unmatched conditions by Group (" + unmatchedGroups.length + " groups)");
        unmatchedGroups.forEach(function (group) { return logging_1.logGroup(group, 'unmatchedConditions'); });
        console_1.info.groupEnd();
        var unverifiableConditionsInGroups = resultsByGroup.filter(function (group) { return group.unverifiableConditions.length > 0; });
        console_1.info.group("Unverifiable conditions by Group (" + unverifiableConditionsInGroups.length + " groups)");
        unverifiableConditionsInGroups.forEach(function (group) { return logging_1.logGroup(group, 'unverifiableConditions'); });
        console_1.info.groupEnd();
        // Provide correct exit code based on verification success.
        process.exit(verificationSucceeded ? 0 : 1);
    }
    exports.verify = verify;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCx5QkFBZ0M7SUFDaEMsNkJBQTZCO0lBRTdCLG9FQUE2QztJQUM3QyxvRUFBNkM7SUFDN0MsMEVBQThDO0lBQzlDLGdGQUErQztJQUUvQyxTQUFnQixNQUFNO1FBQ3BCLElBQU0sR0FBRyxHQUFHLGlCQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEMsMkNBQTJDO1FBQzNDLElBQU0sc0JBQXNCLEdBQUcsY0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUN4RSwyQ0FBMkM7UUFDM0MsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2xDLG9DQUFvQztRQUNwQyxJQUFNLGtCQUFrQixHQUFHLGlCQUFZLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEUseURBQXlEO1FBQ3pELElBQU0sTUFBTSxHQUFHLDhCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDckQ7OztXQUdHO1FBQ0gsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQXhCLENBQXdCLENBQUMsQ0FBQztRQUN2RSwwQ0FBMEM7UUFDMUMsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUF6QixDQUF5QixDQUFDLENBQUM7UUFDL0UscURBQXFEO1FBQ3JELElBQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztRQUNsQyx5REFBeUQ7UUFDekQsSUFBTSxjQUFjLEdBQWEsRUFBRSxDQUFDO1FBRXBDLG1FQUFtRTtRQUNuRSxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBWTtZQUM5QixJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQXBCLENBQW9CLENBQUMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3JFLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDekI7aUJBQU07Z0JBQ0wsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsNkJBQTZCO1FBQzdCLElBQU0sY0FBYyxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1FBQzdFOzs7V0FHRztRQUNILElBQU0scUJBQXFCLEdBQ3ZCLGNBQWMsQ0FBQyxLQUFLLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQWpCLENBQWlCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7UUFFM0U7O1dBRUc7UUFDSCxtQkFBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDNUIsSUFBSSxxQkFBcUIsRUFBRTtZQUN6QixjQUFJLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUM3QzthQUFNO1lBQ0wsY0FBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7WUFDekMsY0FBSSxFQUFFLENBQUM7WUFDUCxjQUFJLENBQUMsK0RBQStELENBQUMsQ0FBQztZQUN0RSxjQUFJLENBQUMsK0RBQStELENBQUMsQ0FBQztZQUN0RSxjQUFJLENBQUMsOERBQThELENBQUMsQ0FBQztTQUN0RTtRQUNEOztXQUVHO1FBQ0gsbUJBQVMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBQ3pDLGNBQUksQ0FBQyxLQUFLLENBQUMsb0JBQWtCLFlBQVksQ0FBQyxNQUFNLFlBQVMsQ0FBQyxDQUFDO1FBQzNELFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxlQUFLLENBQUMsSUFBSSxDQUFDLEVBQVgsQ0FBVyxDQUFDLENBQUM7UUFDMUMsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLGNBQUksQ0FBQyxLQUFLLENBQUMsc0JBQW9CLGNBQWMsQ0FBQyxNQUFNLFlBQVMsQ0FBQyxDQUFDO1FBQy9ELGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxjQUFJLENBQUMsSUFBSSxDQUFDLEVBQVYsQ0FBVSxDQUFDLENBQUM7UUFDM0MsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCOztXQUVHO1FBQ0gsbUJBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQzFDLGNBQUksQ0FBQyxLQUFLLENBQUMscUJBQW1CLGFBQWEsQ0FBQyxNQUFNLGFBQVUsQ0FBQyxDQUFDO1FBQzlELGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxlQUFLLENBQUMsS0FBRyxLQUFLLENBQUMsU0FBVyxDQUFDLEVBQTNCLENBQTJCLENBQUMsQ0FBQztRQUM1RCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEIsSUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1FBQzVFLGNBQUksQ0FBQyxLQUFLLENBQUMsa0NBQWdDLGFBQWEsQ0FBQyxNQUFNLGFBQVUsQ0FBQyxDQUFDO1FBQzNFLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxrQkFBUSxDQUFDLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxlQUFLLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO1FBQzVFLGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixJQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLGNBQWMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO1FBQzdFLGNBQUksQ0FBQyxLQUFLLENBQUMsb0NBQWtDLGVBQWUsQ0FBQyxNQUFNLGFBQVUsQ0FBQyxDQUFDO1FBQy9FLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxrQkFBUSxDQUFDLEtBQUssRUFBRSxxQkFBcUIsQ0FBQyxFQUF0QyxDQUFzQyxDQUFDLENBQUM7UUFDekUsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQU0sOEJBQThCLEdBQ2hDLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBdkMsQ0FBdUMsQ0FBQyxDQUFDO1FBQzVFLGNBQUksQ0FBQyxLQUFLLENBQUMsdUNBQXFDLDhCQUE4QixDQUFDLE1BQU0sYUFBVSxDQUFDLENBQUM7UUFDakcsOEJBQThCLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsa0JBQVEsQ0FBQyxLQUFLLEVBQUUsd0JBQXdCLENBQUMsRUFBekMsQ0FBeUMsQ0FBQyxDQUFDO1FBQzNGLGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVoQiwyREFBMkQ7UUFDM0QsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBckZELHdCQXFGQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge2xvZ0dyb3VwLCBsb2dIZWFkZXJ9IGZyb20gJy4vbG9nZ2luZyc7XG5pbXBvcnQge2dldEdyb3Vwc0Zyb21ZYW1sfSBmcm9tICcuL3BhcnNlLXlhbWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5KCkge1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0SW5zdGFuY2UoKTtcbiAgLyoqIEZ1bGwgcGF0aCB0byBQdWxsQXBwcm92ZSBjb25maWcgZmlsZSAqL1xuICBjb25zdCBQVUxMX0FQUFJPVkVfWUFNTF9QQVRIID0gcmVzb2x2ZShnaXQuYmFzZURpciwgJy5wdWxsYXBwcm92ZS55bWwnKTtcbiAgLyoqIEFsbCB0cmFja2VkIGZpbGVzIGluIHRoZSByZXBvc2l0b3J5LiAqL1xuICBjb25zdCBSRVBPX0ZJTEVTID0gZ2l0LmFsbEZpbGVzKCk7XG4gIC8qKiBUaGUgcHVsbCBhcHByb3ZlIGNvbmZpZyBmaWxlLiAqL1xuICBjb25zdCBwdWxsQXBwcm92ZVlhbWxSYXcgPSByZWFkRmlsZVN5bmMoUFVMTF9BUFBST1ZFX1lBTUxfUEFUSCwgJ3V0ZjgnKTtcbiAgLyoqIEFsbCBvZiB0aGUgZ3JvdXBzIGRlZmluZWQgaW4gdGhlIHB1bGxhcHByb3ZlIHlhbWwuICovXG4gIGNvbnN0IGdyb3VwcyA9IGdldEdyb3Vwc0Zyb21ZYW1sKHB1bGxBcHByb3ZlWWFtbFJhdyk7XG4gIC8qKlxuICAgKiBQdWxsQXBwcm92ZSBncm91cHMgd2l0aG91dCBjb25kaXRpb25zLiBUaGVzZSBhcmUgc2tpcHBlZCBpbiB0aGUgdmVyaWZpY2F0aW9uXG4gICAqIGFzIHRob3NlIHdvdWxkIGFsd2F5cyBiZSBhY3RpdmUgYW5kIGNhdXNlIHplcm8gdW5tYXRjaGVkIGZpbGVzLlxuICAgKi9cbiAgY29uc3QgZ3JvdXBzU2tpcHBlZCA9IGdyb3Vwcy5maWx0ZXIoZ3JvdXAgPT4gIWdyb3VwLmNvbmRpdGlvbnMubGVuZ3RoKTtcbiAgLyoqIFB1bGxBcHByb3ZlIGdyb3VwcyB3aXRoIGNvbmRpdGlvbnMuICovXG4gIGNvbnN0IGdyb3Vwc1dpdGhDb25kaXRpb25zID0gZ3JvdXBzLmZpbHRlcihncm91cCA9PiAhIWdyb3VwLmNvbmRpdGlvbnMubGVuZ3RoKTtcbiAgLyoqIEZpbGVzIHdoaWNoIGFyZSBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC4gKi9cbiAgY29uc3QgbWF0Y2hlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAvKiogRmlsZXMgd2hpY2ggYXJlIG5vdCBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC4gKi9cbiAgY29uc3QgdW5tYXRjaGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gVGVzdCBlYWNoIGZpbGUgaW4gdGhlIHJlcG8gYWdhaW5zdCBlYWNoIGdyb3VwIGZvciBiZWluZyBtYXRjaGVkLlxuICBSRVBPX0ZJTEVTLmZvckVhY2goKGZpbGU6IHN0cmluZykgPT4ge1xuICAgIGlmIChncm91cHNXaXRoQ29uZGl0aW9ucy5maWx0ZXIoZ3JvdXAgPT4gZ3JvdXAudGVzdEZpbGUoZmlsZSkpLmxlbmd0aCkge1xuICAgICAgbWF0Y2hlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVubWF0Y2hlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgfVxuICB9KTtcbiAgLyoqIFJlc3VsdHMgZm9yIGVhY2ggZ3JvdXAgKi9cbiAgY29uc3QgcmVzdWx0c0J5R3JvdXAgPSBncm91cHNXaXRoQ29uZGl0aW9ucy5tYXAoZ3JvdXAgPT4gZ3JvdXAuZ2V0UmVzdWx0cygpKTtcbiAgLyoqXG4gICAqIFdoZXRoZXIgYWxsIGdyb3VwIGNvbmRpdGlvbiBsaW5lcyBtYXRjaCBhdCBsZWFzdCBvbmUgZmlsZSBhbmQgYWxsIGZpbGVzXG4gICAqIGFyZSBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC5cbiAgICovXG4gIGNvbnN0IHZlcmlmaWNhdGlvblN1Y2NlZWRlZCA9XG4gICAgICByZXN1bHRzQnlHcm91cC5ldmVyeShyID0+ICFyLnVubWF0Y2hlZENvdW50KSAmJiAhdW5tYXRjaGVkRmlsZXMubGVuZ3RoO1xuXG4gIC8qKlxuICAgKiBPdmVyYWxsIHJlc3VsdFxuICAgKi9cbiAgbG9nSGVhZGVyKCdPdmVyYWxsIFJlc3VsdCcpO1xuICBpZiAodmVyaWZpY2F0aW9uU3VjY2VlZGVkKSB7XG4gICAgaW5mbygnUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIHN1Y2NlZWRlZCEnKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGBQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gZmFpbGVkLmApO1xuICAgIGluZm8oKTtcbiAgICBpbmZvKGBQbGVhc2UgdXBkYXRlICcucHVsbGFwcHJvdmUueW1sJyB0byBlbnN1cmUgdGhhdCBhbGwgbmVjZXNzYXJ5YCk7XG4gICAgaW5mbyhgZmlsZXMvZGlyZWN0b3JpZXMgaGF2ZSBvd25lcnMgYW5kIGFsbCBwYXR0ZXJucyB0aGF0IGFwcGVhciBpbmApO1xuICAgIGluZm8oYHRoZSBmaWxlIGNvcnJlc3BvbmQgdG8gYWN0dWFsIGZpbGVzL2RpcmVjdG9yaWVzIGluIHRoZSByZXBvLmApO1xuICB9XG4gIC8qKlxuICAgKiBGaWxlIGJ5IGZpbGUgU3VtbWFyeVxuICAgKi9cbiAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSByZXN1bHRzIGJ5IGZpbGUnKTtcbiAgaW5mby5ncm91cChgTWF0Y2hlZCBGaWxlcyAoJHttYXRjaGVkRmlsZXMubGVuZ3RofSBmaWxlcylgKTtcbiAgbWF0Y2hlZEZpbGVzLmZvckVhY2goZmlsZSA9PiBkZWJ1ZyhmaWxlKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgaW5mby5ncm91cChgVW5tYXRjaGVkIEZpbGVzICgke3VubWF0Y2hlZEZpbGVzLmxlbmd0aH0gZmlsZXMpYCk7XG4gIHVubWF0Y2hlZEZpbGVzLmZvckVhY2goZmlsZSA9PiBpbmZvKGZpbGUpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICAvKipcbiAgICogR3JvdXAgYnkgZ3JvdXAgU3VtbWFyeVxuICAgKi9cbiAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSByZXN1bHRzIGJ5IGdyb3VwJyk7XG4gIGluZm8uZ3JvdXAoYEdyb3VwcyBza2lwcGVkICgke2dyb3Vwc1NraXBwZWQubGVuZ3RofSBncm91cHMpYCk7XG4gIGdyb3Vwc1NraXBwZWQuZm9yRWFjaChncm91cCA9PiBkZWJ1ZyhgJHtncm91cC5ncm91cE5hbWV9YCkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGNvbnN0IG1hdGNoZWRHcm91cHMgPSByZXN1bHRzQnlHcm91cC5maWx0ZXIoZ3JvdXAgPT4gIWdyb3VwLnVubWF0Y2hlZENvdW50KTtcbiAgaW5mby5ncm91cChgTWF0Y2hlZCBjb25kaXRpb25zIGJ5IEdyb3VwICgke21hdGNoZWRHcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIG1hdGNoZWRHcm91cHMuZm9yRWFjaChncm91cCA9PiBsb2dHcm91cChncm91cCwgJ21hdGNoZWRDb25kaXRpb25zJywgZGVidWcpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBjb25zdCB1bm1hdGNoZWRHcm91cHMgPSByZXN1bHRzQnlHcm91cC5maWx0ZXIoZ3JvdXAgPT4gZ3JvdXAudW5tYXRjaGVkQ291bnQpO1xuICBpbmZvLmdyb3VwKGBVbm1hdGNoZWQgY29uZGl0aW9ucyBieSBHcm91cCAoJHt1bm1hdGNoZWRHcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIHVubWF0Y2hlZEdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IGxvZ0dyb3VwKGdyb3VwLCAndW5tYXRjaGVkQ29uZGl0aW9ucycpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBjb25zdCB1bnZlcmlmaWFibGVDb25kaXRpb25zSW5Hcm91cHMgPVxuICAgICAgcmVzdWx0c0J5R3JvdXAuZmlsdGVyKGdyb3VwID0+IGdyb3VwLnVudmVyaWZpYWJsZUNvbmRpdGlvbnMubGVuZ3RoID4gMCk7XG4gIGluZm8uZ3JvdXAoYFVudmVyaWZpYWJsZSBjb25kaXRpb25zIGJ5IEdyb3VwICgke3VudmVyaWZpYWJsZUNvbmRpdGlvbnNJbkdyb3Vwcy5sZW5ndGh9IGdyb3VwcylgKTtcbiAgdW52ZXJpZmlhYmxlQ29uZGl0aW9uc0luR3JvdXBzLmZvckVhY2goZ3JvdXAgPT4gbG9nR3JvdXAoZ3JvdXAsICd1bnZlcmlmaWFibGVDb25kaXRpb25zJykpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG5cbiAgLy8gUHJvdmlkZSBjb3JyZWN0IGV4aXQgY29kZSBiYXNlZCBvbiB2ZXJpZmljYXRpb24gc3VjY2Vzcy5cbiAgcHJvY2Vzcy5leGl0KHZlcmlmaWNhdGlvblN1Y2NlZWRlZCA/IDAgOiAxKTtcbn1cbiJdfQ==