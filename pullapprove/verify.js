(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/verify", ["require", "exports", "fs", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/pullapprove/logging", "@angular/dev-infra-private/pullapprove/parse-yaml"], factory);
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
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
    var logging_1 = require("@angular/dev-infra-private/pullapprove/logging");
    var parse_yaml_1 = require("@angular/dev-infra-private/pullapprove/parse-yaml");
    function verify() {
        var git = git_client_1.GitClient.get();
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
        var allGroupConditionsValid = resultsByGroup.every(function (r) { return !r.unmatchedCount; }) && !unmatchedFiles.length;
        /** Whether all groups have at least one reviewer user or team defined.  */
        var groupsWithoutReviewers = groups.filter(function (group) { return Object.keys(group.reviewers).length === 0; });
        /** The overall result of the verifcation. */
        var overallResult = allGroupConditionsValid && groupsWithoutReviewers.length === 0;
        /**
         * Overall result
         */
        logging_1.logHeader('Overall Result');
        if (overallResult) {
            console_1.info('PullApprove verification succeeded!');
        }
        else {
            console_1.info("PullApprove verification failed.");
            console_1.info();
            console_1.info("Please update '.pullapprove.yml' to ensure that all necessary");
            console_1.info("files/directories have owners and all patterns that appear in");
            console_1.info("the file correspond to actual files/directories in the repo.");
        }
        /** Reviewers check */
        logging_1.logHeader("Group Reviewers Check");
        if (groupsWithoutReviewers.length === 0) {
            console_1.info('All group contain at least one reviewer user or team.');
        }
        else {
            console_1.info.group("Discovered " + groupsWithoutReviewers.length + " group(s) without a reviewer defined");
            groupsWithoutReviewers.forEach(function (g) { return console_1.info(g.groupName); });
            console_1.info.groupEnd();
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
        process.exit(overallResult ? 0 : 1);
    }
    exports.verify = verify;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCx5QkFBZ0M7SUFDaEMsNkJBQTZCO0lBRTdCLG9FQUE2QztJQUM3Qyw4RUFBa0Q7SUFDbEQsMEVBQThDO0lBQzlDLGdGQUErQztJQUUvQyxTQUFnQixNQUFNO1FBQ3BCLElBQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsMkNBQTJDO1FBQzNDLElBQU0sc0JBQXNCLEdBQUcsY0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUN4RSwyQ0FBMkM7UUFDM0MsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2xDLG9DQUFvQztRQUNwQyxJQUFNLGtCQUFrQixHQUFHLGlCQUFZLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEUseURBQXlEO1FBQ3pELElBQU0sTUFBTSxHQUFHLDhCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDckQ7OztXQUdHO1FBQ0gsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQXhCLENBQXdCLENBQUMsQ0FBQztRQUN2RSwwQ0FBMEM7UUFDMUMsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUF6QixDQUF5QixDQUFDLENBQUM7UUFDL0UscURBQXFEO1FBQ3JELElBQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztRQUNsQyx5REFBeUQ7UUFDekQs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QUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUF2QyxDQUF1QyxDQUFDLENBQUM7UUFDNUUsY0FBSSxDQUFDLEtBQUssQ0FBQyx1Q0FBcUMsOEJBQThCLENBQUMsTUFBTSxhQUFVLENBQUMsQ0FBQztRQUNqRyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxrQkFBUSxDQUFDLEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxFQUF6QyxDQUF5QyxDQUFDLENBQUM7UUFDM0YsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWhCLDJEQUEyRDtRQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBbEdELHdCQWtHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7bG9nR3JvdXAsIGxvZ0hlYWRlcn0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCB7Z2V0R3JvdXBzRnJvbVlhbWx9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnkoKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIEZ1bGwgcGF0aCB0byBQdWxsQXBwcm92ZSBjb25maWcgZmlsZSAqL1xuICBjb25zdCBQVUxMX0FQUFJPVkVfWUFNTF9QQVRIID0gcmVzb2x2ZShnaXQuYmFzZURpciwgJy5wdWxsYXBwcm92ZS55bWwnKTtcbiAgLyoqIEFsbCB0cmFja2VkIGZpbGVzIGluIHRoZSByZXBvc2l0b3J5LiAqL1xuICBjb25zdCBSRVBPX0ZJTEVTID0gZ2l0LmFsbEZpbGVzKCk7XG4gIC8qKiBUaGUgcHVsbCBhcHByb3ZlIGNvbmZpZyBmaWxlLiAqL1xuICBjb25zdCBwdWxsQXBwcm92ZVlhbWxSYXcgPSByZWFkRmlsZVN5bmMoUFVMTF9BUFBST1ZFX1lBTUxfUEFUSCwgJ3V0ZjgnKTtcbiAgLyoqIEFsbCBvZiB0aGUgZ3JvdXBzIGRlZmluZWQgaW4gdGhlIHB1bGxhcHByb3ZlIHlhbWwuICovXG4gIGNvbnN0IGdyb3VwcyA9IGdldEdyb3Vwc0Zyb21ZYW1sKHB1bGxBcHByb3ZlWWFtbFJhdyk7XG4gIC8qKlxuICAgKiBQdWxsQXBwcm92ZSBncm91cHMgd2l0aG91dCBjb25kaXRpb25zLiBUaGVzZSBhcmUgc2tpcHBlZCBpbiB0aGUgdmVyaWZpY2F0aW9uXG4gICAqIGFzIHRob3NlIHdvdWxkIGFsd2F5cyBiZSBhY3RpdmUgYW5kIGNhdXNlIHplcm8gdW5tYXRjaGVkIGZpbGVzLlxuICAgKi9cbiAgY29uc3QgZ3JvdXBzU2tpcHBlZCA9IGdyb3Vwcy5maWx0ZXIoZ3JvdXAgPT4gIWdyb3VwLmNvbmRpdGlvbnMubGVuZ3RoKTtcbiAgLyoqIFB1bGxBcHByb3ZlIGdyb3VwcyB3aXRoIGNvbmRpdGlvbnMuICovXG4gIGNvbnN0IGdyb3Vwc1dpdGhDb25kaXRpb25zID0gZ3JvdXBzLmZpbHRlcihncm91cCA9PiAhIWdyb3VwLmNvbmRpdGlvbnMubGVuZ3RoKTtcbiAgLyoqIEZpbGVzIHdoaWNoIGFyZSBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC4gKi9cbiAgY29uc3QgbWF0Y2hlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAvKiogRmlsZXMgd2hpY2ggYXJlIG5vdCBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC4gKi9cbiAgY29uc3QgdW5tYXRjaGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG5cbiAgLy8gVGVzdCBlYWNoIGZpbGUgaW4gdGhlIHJlcG8gYWdhaW5zdCBlYWNoIGdyb3VwIGZvciBiZWluZyBtYXRjaGVkLlxuICBSRVBPX0ZJTEVTLmZvckVhY2goKGZpbGU6IHN0cmluZykgPT4ge1xuICAgIGlmIChncm91cHNXaXRoQ29uZGl0aW9ucy5maWx0ZXIoZ3JvdXAgPT4gZ3JvdXAudGVzdEZpbGUoZmlsZSkpLmxlbmd0aCkge1xuICAgICAgbWF0Y2hlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVubWF0Y2hlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgfVxuICB9KTtcbiAgLyoqIFJlc3VsdHMgZm9yIGVhY2ggZ3JvdXAgKi9cbiAgY29uc3QgcmVzdWx0c0J5R3JvdXAgPSBncm91cHNXaXRoQ29uZGl0aW9ucy5tYXAoZ3JvdXAgPT4gZ3JvdXAuZ2V0UmVzdWx0cygpKTtcbiAgLyoqXG4gICAqIFdoZXRoZXIgYWxsIGdyb3VwIGNvbmRpdGlvbiBsaW5lcyBtYXRjaCBhdCBsZWFzdCBvbmUgZmlsZSBhbmQgYWxsIGZpbGVzXG4gICAqIGFyZSBtYXRjaGVkIGJ5IGF0IGxlYXN0IG9uZSBncm91cC5cbiAgICovXG4gIGNvbnN0IGFsbEdyb3VwQ29uZGl0aW9uc1ZhbGlkID1cbiAgICAgIHJlc3VsdHNCeUdyb3VwLmV2ZXJ5KHIgPT4gIXIudW5tYXRjaGVkQ291bnQpICYmICF1bm1hdGNoZWRGaWxlcy5sZW5ndGg7XG4gIC8qKiBXaGV0aGVyIGFsbCBncm91cHMgaGF2ZSBhdCBsZWFzdCBvbmUgcmV2aWV3ZXIgdXNlciBvciB0ZWFtIGRlZmluZWQuICAqL1xuICBjb25zdCBncm91cHNXaXRob3V0UmV2aWV3ZXJzID0gZ3JvdXBzLmZpbHRlcihncm91cCA9PiBPYmplY3Qua2V5cyhncm91cC5yZXZpZXdlcnMpLmxlbmd0aCA9PT0gMCk7XG4gIC8qKiBUaGUgb3ZlcmFsbCByZXN1bHQgb2YgdGhlIHZlcmlmY2F0aW9uLiAqL1xuICBjb25zdCBvdmVyYWxsUmVzdWx0ID0gYWxsR3JvdXBDb25kaXRpb25zVmFsaWQgJiYgZ3JvdXBzV2l0aG91dFJldmlld2Vycy5sZW5ndGggPT09IDA7XG5cbiAgLyoqXG4gICAqIE92ZXJhbGwgcmVzdWx0XG4gICAqL1xuICBsb2dIZWFkZXIoJ092ZXJhbGwgUmVzdWx0Jyk7XG4gIGlmIChvdmVyYWxsUmVzdWx0KSB7XG4gICAgaW5mbygnUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIHN1Y2NlZWRlZCEnKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGBQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gZmFpbGVkLmApO1xuICAgIGluZm8oKTtcbiAgICBpbmZvKGBQbGVhc2UgdXBkYXRlICcucHVsbGFwcHJvdmUueW1sJyB0byBlbnN1cmUgdGhhdCBhbGwgbmVjZXNzYXJ5YCk7XG4gICAgaW5mbyhgZmlsZXMvZGlyZWN0b3JpZXMgaGF2ZSBvd25lcnMgYW5kIGFsbCBwYXR0ZXJucyB0aGF0IGFwcGVhciBpbmApO1xuICAgIGluZm8oYHRoZSBmaWxlIGNvcnJlc3BvbmQgdG8gYWN0dWFsIGZpbGVzL2RpcmVjdG9yaWVzIGluIHRoZSByZXBvLmApO1xuICB9XG4gIC8qKiBSZXZpZXdlcnMgY2hlY2sgKi9cbiAgbG9nSGVhZGVyKGBHcm91cCBSZXZpZXdlcnMgQ2hlY2tgKTtcbiAgaWYgKGdyb3Vwc1dpdGhvdXRSZXZpZXdlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgaW5mbygnQWxsIGdyb3VwIGNvbnRhaW4gYXQgbGVhc3Qgb25lIHJldmlld2VyIHVzZXIgb3IgdGVhbS4nKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvLmdyb3VwKGBEaXNjb3ZlcmVkICR7Z3JvdXBzV2l0aG91dFJldmlld2Vycy5sZW5ndGh9IGdyb3VwKHMpIHdpdGhvdXQgYSByZXZpZXdlciBkZWZpbmVkYCk7XG4gICAgZ3JvdXBzV2l0aG91dFJldmlld2Vycy5mb3JFYWNoKGcgPT4gaW5mbyhnLmdyb3VwTmFtZSkpO1xuICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgfVxuICAvKipcbiAgICogRmlsZSBieSBmaWxlIFN1bW1hcnlcbiAgICovXG4gIGxvZ0hlYWRlcignUHVsbEFwcHJvdmUgcmVzdWx0cyBieSBmaWxlJyk7XG4gIGluZm8uZ3JvdXAoYE1hdGNoZWQgRmlsZXMgKCR7bWF0Y2hlZEZpbGVzLmxlbmd0aH0gZmlsZXMpYCk7XG4gIG1hdGNoZWRGaWxlcy5mb3JFYWNoKGZpbGUgPT4gZGVidWcoZmlsZSkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGluZm8uZ3JvdXAoYFVubWF0Y2hlZCBGaWxlcyAoJHt1bm1hdGNoZWRGaWxlcy5sZW5ndGh9IGZpbGVzKWApO1xuICB1bm1hdGNoZWRGaWxlcy5mb3JFYWNoKGZpbGUgPT4gaW5mbyhmaWxlKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgLyoqXG4gICAqIEdyb3VwIGJ5IGdyb3VwIFN1bW1hcnlcbiAgICovXG4gIGxvZ0hlYWRlcignUHVsbEFwcHJvdmUgcmVzdWx0cyBieSBncm91cCcpO1xuICBpbmZvLmdyb3VwKGBHcm91cHMgc2tpcHBlZCAoJHtncm91cHNTa2lwcGVkLmxlbmd0aH0gZ3JvdXBzKWApO1xuICBncm91cHNTa2lwcGVkLmZvckVhY2goZ3JvdXAgPT4gZGVidWcoYCR7Z3JvdXAuZ3JvdXBOYW1lfWApKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBjb25zdCBtYXRjaGVkR3JvdXBzID0gcmVzdWx0c0J5R3JvdXAuZmlsdGVyKGdyb3VwID0+ICFncm91cC51bm1hdGNoZWRDb3VudCk7XG4gIGluZm8uZ3JvdXAoYE1hdGNoZWQgY29uZGl0aW9ucyBieSBHcm91cCAoJHttYXRjaGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICBtYXRjaGVkR3JvdXBzLmZvckVhY2goZ3JvdXAgPT4gbG9nR3JvdXAoZ3JvdXAsICdtYXRjaGVkQ29uZGl0aW9ucycsIGRlYnVnKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgY29uc3QgdW5tYXRjaGVkR3JvdXBzID0gcmVzdWx0c0J5R3JvdXAuZmlsdGVyKGdyb3VwID0+IGdyb3VwLnVubWF0Y2hlZENvdW50KTtcbiAgaW5mby5ncm91cChgVW5tYXRjaGVkIGNvbmRpdGlvbnMgYnkgR3JvdXAgKCR7dW5tYXRjaGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICB1bm1hdGNoZWRHcm91cHMuZm9yRWFjaChncm91cCA9PiBsb2dHcm91cChncm91cCwgJ3VubWF0Y2hlZENvbmRpdGlvbnMnKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgY29uc3QgdW52ZXJpZmlhYmxlQ29uZGl0aW9uc0luR3JvdXBzID1cbiAgICAgIHJlc3VsdHNCeUdyb3VwLmZpbHRlcihncm91cCA9PiBncm91cC51bnZlcmlmaWFibGVDb25kaXRpb25zLmxlbmd0aCA+IDApO1xuICBpbmZvLmdyb3VwKGBVbnZlcmlmaWFibGUgY29uZGl0aW9ucyBieSBHcm91cCAoJHt1bnZlcmlmaWFibGVDb25kaXRpb25zSW5Hcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIHVudmVyaWZpYWJsZUNvbmRpdGlvbnNJbkdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IGxvZ0dyb3VwKGdyb3VwLCAndW52ZXJpZmlhYmxlQ29uZGl0aW9ucycpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuXG4gIC8vIFByb3ZpZGUgY29ycmVjdCBleGl0IGNvZGUgYmFzZWQgb24gdmVyaWZpY2F0aW9uIHN1Y2Nlc3MuXG4gIHByb2Nlc3MuZXhpdChvdmVyYWxsUmVzdWx0ID8gMCA6IDEpO1xufVxuIl19