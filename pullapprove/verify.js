(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/verify", ["require", "exports", "tslib", "fs", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/repo-files", "@angular/dev-infra-private/pullapprove/group", "@angular/dev-infra-private/pullapprove/logging", "@angular/dev-infra-private/pullapprove/parse-yaml"], factory);
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
    var path_1 = require("path");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var repo_files_1 = require("@angular/dev-infra-private/utils/repo-files");
    var group_1 = require("@angular/dev-infra-private/pullapprove/group");
    var logging_1 = require("@angular/dev-infra-private/pullapprove/logging");
    var parse_yaml_1 = require("@angular/dev-infra-private/pullapprove/parse-yaml");
    function verify() {
        /** Full path to PullApprove config file */
        var PULL_APPROVE_YAML_PATH = path_1.resolve(config_1.getRepoBaseDir(), '.pullapprove.yml');
        /** All tracked files in the repository. */
        var REPO_FILES = repo_files_1.allFiles();
        /** The pull approve config file. */
        var pullApproveYamlRaw = fs_1.readFileSync(PULL_APPROVE_YAML_PATH, 'utf8');
        /** JSON representation of the pullapprove yaml file. */
        var pullApprove = parse_yaml_1.parsePullApproveYaml(pullApproveYamlRaw);
        /** All of the groups defined in the pullapprove yaml. */
        var groups = Object.entries(pullApprove.groups).map(function (_a) {
            var _b = tslib_1.__read(_a, 2), groupName = _b[0], group = _b[1];
            return new group_1.PullApproveGroup(groupName, group);
        });
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
        matchedGroups.forEach(function (group) { return logging_1.logGroup(group, true, console_1.debug); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQWdDO0lBQ2hDLDZCQUE2QjtJQUU3QixrRUFBK0M7SUFDL0Msb0VBQTZDO0lBQzdDLDBFQUE2QztJQUU3QyxzRUFBeUM7SUFDekMsMEVBQThDO0lBQzlDLGdGQUFrRDtJQUVsRCxTQUFnQixNQUFNO1FBQ3BCLDJDQUEyQztRQUMzQyxJQUFNLHNCQUFzQixHQUFHLGNBQU8sQ0FBQyx1QkFBYyxFQUFFLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUM3RSwyQ0FBMkM7UUFDM0MsSUFBTSxVQUFVLEdBQUcscUJBQVEsRUFBRSxDQUFDO1FBQzlCLG9DQUFvQztRQUNwQyxJQUFNLGtCQUFrQixHQUFHLGlCQUFZLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEUsd0RBQXdEO1FBQ3hELElBQU0sV0FBVyxHQUFHLGlDQUFvQixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDN0QseURBQXlEO1FBQ3pELElBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEVBQWtCO2dCQUFsQixLQUFBLHFCQUFrQixFQUFqQixTQUFTLFFBQUEsRUFBRSxLQUFLLFFBQUE7WUFDdEUsT0FBTyxJQUFJLHdCQUFnQixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUNIOzs7V0FHRztRQUNILElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUF4QixDQUF3QixDQUFDLENBQUM7UUFDdkUs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QUFDLGtDQUFnQyxhQUFhLENBQUMsTUFBTSxhQUFVLENBQUMsQ0FBQztRQUMzRSxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsa0JBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLGVBQUssQ0FBQyxFQUE1QixDQUE0QixDQUFDLENBQUM7UUFDN0QsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsY0FBYyxFQUFwQixDQUFvQixDQUFDLENBQUM7UUFDN0UsY0FBSSxDQUFDLEtBQUssQ0FBQyxvQ0FBa0MsZUFBZSxDQUFDLE1BQU0sYUFBVSxDQUFDLENBQUM7UUFDL0UsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLGtCQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDekQsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWhCLDJEQUEyRDtRQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFuRkQsd0JBbUZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtyZXNvbHZlfSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHthbGxGaWxlc30gZnJvbSAnLi4vdXRpbHMvcmVwby1maWxlcyc7XG5cbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cH0gZnJvbSAnLi9ncm91cCc7XG5pbXBvcnQge2xvZ0dyb3VwLCBsb2dIZWFkZXJ9IGZyb20gJy4vbG9nZ2luZyc7XG5pbXBvcnQge3BhcnNlUHVsbEFwcHJvdmVZYW1sfSBmcm9tICcuL3BhcnNlLXlhbWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5KCkge1xuICAvKiogRnVsbCBwYXRoIHRvIFB1bGxBcHByb3ZlIGNvbmZpZyBmaWxlICovXG4gIGNvbnN0IFBVTExfQVBQUk9WRV9ZQU1MX1BBVEggPSByZXNvbHZlKGdldFJlcG9CYXNlRGlyKCksICcucHVsbGFwcHJvdmUueW1sJyk7XG4gIC8qKiBBbGwgdHJhY2tlZCBmaWxlcyBpbiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgY29uc3QgUkVQT19GSUxFUyA9IGFsbEZpbGVzKCk7XG4gIC8qKiBUaGUgcHVsbCBhcHByb3ZlIGNvbmZpZyBmaWxlLiAqL1xuICBjb25zdCBwdWxsQXBwcm92ZVlhbWxSYXcgPSByZWFkRmlsZVN5bmMoUFVMTF9BUFBST1ZFX1lBTUxfUEFUSCwgJ3V0ZjgnKTtcbiAgLyoqIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHB1bGxhcHByb3ZlIHlhbWwgZmlsZS4gKi9cbiAgY29uc3QgcHVsbEFwcHJvdmUgPSBwYXJzZVB1bGxBcHByb3ZlWWFtbChwdWxsQXBwcm92ZVlhbWxSYXcpO1xuICAvKiogQWxsIG9mIHRoZSBncm91cHMgZGVmaW5lZCBpbiB0aGUgcHVsbGFwcHJvdmUgeWFtbC4gKi9cbiAgY29uc3QgZ3JvdXBzID0gT2JqZWN0LmVudHJpZXMocHVsbEFwcHJvdmUuZ3JvdXBzKS5tYXAoKFtncm91cE5hbWUsIGdyb3VwXSkgPT4ge1xuICAgIHJldHVybiBuZXcgUHVsbEFwcHJvdmVHcm91cChncm91cE5hbWUsIGdyb3VwKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBQdWxsQXBwcm92ZSBncm91cHMgd2l0aG91dCBjb25kaXRpb25zLiBUaGVzZSBhcmUgc2tpcHBlZCBpbiB0aGUgdmVyaWZpY2F0aW9uXG4gICAqIGFzIHRob3NlIHdvdWxkIGFsd2F5cyBiZSBhY3RpdmUgYW5kIGNhdXNlIHplcm8gdW5tYXRjaGVkIGZpbGVzLlxuICAgKi9cbiAgY29uc3QgZ3JvdXBzU2tpcHBlZCA9IGdyb3Vwcy5maWx0ZXIoZ3JvdXAgPT4gIWdyb3VwLmNvbmRpdGlvbnMubGVuZ3RoKTtcbiAgLyoqIFB1bGxBcHByb3ZlIGdyb3VwcyB3aXRoIGNvbmRpdGlvbnMuICovXG4gIGNvbnN0IGdyb3Vwc1dpdGhDb25kaXRpb25zID0gZ3JvdXBzLmZpbHRlcihncm91cCA9PiAhIWdyb3VwLmNvbmRpdGlvbnMubGVuZ3RoKTtcbiAgLyoqIEZpbGVzIHdoaWNoIGFyZSBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC4gKi9cbiAgY29uc3QgbWF0Y2hlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAvKiogRmlsZXMgd2hpY2ggYXJlIG5vdCBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC4gKi9cbiAgY29uc3QgdW5tYXRjaGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gVGVzdCBlYWNoIGZpbGUgaW4gdGhlIHJlcG8gYWdhaW5zdCBlYWNoIGdyb3VwIGZvciBiZWluZyBtYXRjaGVkLlxuICBSRVBPX0ZJTEVTLmZvckVhY2goKGZpbGU6IHN0cmluZykgPT4ge1xuICAgIGlmIChncm91cHNXaXRoQ29uZGl0aW9ucy5maWx0ZXIoZ3JvdXAgPT4gZ3JvdXAudGVzdEZpbGUoZmlsZSkpLmxlbmd0aCkge1xuICAgICAgbWF0Y2hlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVubWF0Y2hlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgfVxuICB9KTtcbiAgLyoqIFJlc3VsdHMgZm9yIGVhY2ggZ3JvdXAgKi9cbiAgY29uc3QgcmVzdWx0c0J5R3JvdXAgPSBncm91cHNXaXRoQ29uZGl0aW9ucy5tYXAoZ3JvdXAgPT4gZ3JvdXAuZ2V0UmVzdWx0cygpKTtcbiAgLyoqXG4gICAqIFdoZXRoZXIgYWxsIGdyb3VwIGNvbmRpdGlvbiBsaW5lcyBtYXRjaCBhdCBsZWFzdCBvbmUgZmlsZSBhbmQgYWxsIGZpbGVzXG4gICAqIGFyZSBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC5cbiAgICovXG4gIGNvbnN0IHZlcmlmaWNhdGlvblN1Y2NlZWRlZCA9XG4gICAgICByZXN1bHRzQnlHcm91cC5ldmVyeShyID0+ICFyLnVubWF0Y2hlZENvdW50KSAmJiAhdW5tYXRjaGVkRmlsZXMubGVuZ3RoO1xuXG4gIC8qKlxuICAgKiBPdmVyYWxsIHJlc3VsdFxuICAgKi9cbiAgbG9nSGVhZGVyKCdPdmVyYWxsIFJlc3VsdCcpO1xuICBpZiAodmVyaWZpY2F0aW9uU3VjY2VlZGVkKSB7XG4gICAgaW5mbygnUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIHN1Y2NlZWRlZCEnKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGBQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gZmFpbGVkLmApO1xuICAgIGluZm8oKTtcbiAgICBpbmZvKGBQbGVhc2UgdXBkYXRlICcucHVsbGFwcHJvdmUueW1sJyB0byBlbnN1cmUgdGhhdCBhbGwgbmVjZXNzYXJ5YCk7XG4gICAgaW5mbyhgZmlsZXMvZGlyZWN0b3JpZXMgaGF2ZSBvd25lcnMgYW5kIGFsbCBwYXR0ZXJucyB0aGF0IGFwcGVhciBpbmApO1xuICAgIGluZm8oYHRoZSBmaWxlIGNvcnJlc3BvbmQgdG8gYWN0dWFsIGZpbGVzL2RpcmVjdG9yaWVzIGluIHRoZSByZXBvLmApO1xuICB9XG4gIC8qKlxuICAgKiBGaWxlIGJ5IGZpbGUgU3VtbWFyeVxuICAgKi9cbiAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSByZXN1bHRzIGJ5IGZpbGUnKTtcbiAgaW5mby5ncm91cChgTWF0Y2hlZCBGaWxlcyAoJHttYXRjaGVkRmlsZXMubGVuZ3RofSBmaWxlcylgKTtcbiAgbWF0Y2hlZEZpbGVzLmZvckVhY2goZmlsZSA9PiBkZWJ1ZyhmaWxlKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgaW5mby5ncm91cChgVW5tYXRjaGVkIEZpbGVzICgke3VubWF0Y2hlZEZpbGVzLmxlbmd0aH0gZmlsZXMpYCk7XG4gIHVubWF0Y2hlZEZpbGVzLmZvckVhY2goZmlsZSA9PiBpbmZvKGZpbGUpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICAvKipcbiAgICogR3JvdXAgYnkgZ3JvdXAgU3VtbWFyeVxuICAgKi9cbiAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSByZXN1bHRzIGJ5IGdyb3VwJyk7XG4gIGluZm8uZ3JvdXAoYEdyb3VwcyBza2lwcGVkICgke2dyb3Vwc1NraXBwZWQubGVuZ3RofSBncm91cHMpYCk7XG4gIGdyb3Vwc1NraXBwZWQuZm9yRWFjaChncm91cCA9PiBkZWJ1ZyhgJHtncm91cC5ncm91cE5hbWV9YCkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGNvbnN0IG1hdGNoZWRHcm91cHMgPSByZXN1bHRzQnlHcm91cC5maWx0ZXIoZ3JvdXAgPT4gIWdyb3VwLnVubWF0Y2hlZENvdW50KTtcbiAgaW5mby5ncm91cChgTWF0Y2hlZCBjb25kaXRpb25zIGJ5IEdyb3VwICgke21hdGNoZWRHcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIG1hdGNoZWRHcm91cHMuZm9yRWFjaChncm91cCA9PiBsb2dHcm91cChncm91cCwgdHJ1ZSwgZGVidWcpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBjb25zdCB1bm1hdGNoZWRHcm91cHMgPSByZXN1bHRzQnlHcm91cC5maWx0ZXIoZ3JvdXAgPT4gZ3JvdXAudW5tYXRjaGVkQ291bnQpO1xuICBpbmZvLmdyb3VwKGBVbm1hdGNoZWQgY29uZGl0aW9ucyBieSBHcm91cCAoJHt1bm1hdGNoZWRHcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIHVubWF0Y2hlZEdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IGxvZ0dyb3VwKGdyb3VwLCBmYWxzZSkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG5cbiAgLy8gUHJvdmlkZSBjb3JyZWN0IGV4aXQgY29kZSBiYXNlZCBvbiB2ZXJpZmljYXRpb24gc3VjY2Vzcy5cbiAgcHJvY2Vzcy5leGl0KHZlcmlmaWNhdGlvblN1Y2NlZWRlZCA/IDAgOiAxKTtcbn1cbiJdfQ==