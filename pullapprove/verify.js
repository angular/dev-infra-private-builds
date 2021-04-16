(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/verify", ["require", "exports", "fs", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/repo-files", "@angular/dev-infra-private/pullapprove/logging", "@angular/dev-infra-private/pullapprove/parse-yaml"], factory);
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
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var repo_files_1 = require("@angular/dev-infra-private/utils/repo-files");
    var logging_1 = require("@angular/dev-infra-private/pullapprove/logging");
    var parse_yaml_1 = require("@angular/dev-infra-private/pullapprove/parse-yaml");
    function verify() {
        /** Full path to PullApprove config file */
        var PULL_APPROVE_YAML_PATH = path_1.resolve(config_1.getRepoBaseDir(), '.pullapprove.yml');
        /** All tracked files in the repository. */
        var REPO_FILES = repo_files_1.allFiles();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCx5QkFBZ0M7SUFDaEMsNkJBQTZCO0lBRTdCLGtFQUErQztJQUMvQyxvRUFBNkM7SUFDN0MsMEVBQTZDO0lBQzdDLDBFQUE4QztJQUM5QyxnRkFBK0M7SUFFL0MsU0FBZ0IsTUFBTTtRQUNwQiwyQ0FBMkM7UUFDM0MsSUFBTSxzQkFBc0IsR0FBRyxjQUFPLENBQUMsdUJBQWMsRUFBRSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDN0UsMkNBQTJDO1FBQzNDLElBQU0sVUFBVSxHQUFHLHFCQUFRLEVBQUUsQ0FBQztRQUM5QixvQ0FBb0M7UUFDcEMsSUFBTSxrQkFBa0IsR0FBRyxpQkFBWSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hFLHlEQUF5RDtRQUN6RCxJQUFNLE1BQU0sR0FBRyw4QkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3JEOzs7V0FHRztRQUNILElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUF4QixDQUF3QixDQUFDLENBQUM7UUFDdkUsMENBQTBDO1FBQzFDLElBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO1FBQy9FLHFEQUFxRDtRQUNyRCxJQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7UUFDbEMseURBQXlEO1FBQ3pELElBQU0sY0FBYyxHQUFhLEVBQUUsQ0FBQztRQUVwQyxtRUFBbUU7UUFDbkUsVUFB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SSxPQUFBLEtBQUssQ0FBQyxjQUFjLEVBQXBCLENBQW9CLENBQUMsQ0FBQztRQUM3RSxjQUFJLENBQUMsS0FBSyxDQUFDLG9DQUFrQyxlQUFlLENBQUMsTUFBTSxhQUFVLENBQUMsQ0FBQztRQUMvRSxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsa0JBQVEsQ0FBQyxLQUFLLEVBQUUscUJBQXFCLENBQUMsRUFBdEMsQ0FBc0MsQ0FBQyxDQUFDO1FBQ3pFLGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixJQUFNLDhCQUE4QixHQUNoQyxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQXZDLENBQXVDLENBQUMsQ0FBQztRQUM1RSxjQUFJLENBQUMsS0FBSyxDQUFDLHVDQUFxQyw4QkFBOEIsQ0FBQyxNQUFNLGFBQVUsQ0FBQyxDQUFDO1FBQ2pHLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLGtCQUFRLENBQUMsS0FBSyxFQUFFLHdCQUF3QixDQUFDLEVBQXpDLENBQXlDLENBQUMsQ0FBQztRQUMzRixjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFaEIsMkRBQTJEO1FBQzNELE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQXBGRCx3QkFvRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtkZWJ1ZywgaW5mb30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2FsbEZpbGVzfSBmcm9tICcuLi91dGlscy9yZXBvLWZpbGVzJztcbmltcG9ydCB7bG9nR3JvdXAsIGxvZ0hlYWRlcn0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCB7Z2V0R3JvdXBzRnJvbVlhbWx9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnkoKSB7XG4gIC8qKiBGdWxsIHBhdGggdG8gUHVsbEFwcHJvdmUgY29uZmlnIGZpbGUgKi9cbiAgY29uc3QgUFVMTF9BUFBST1ZFX1lBTUxfUEFUSCA9IHJlc29sdmUoZ2V0UmVwb0Jhc2VEaXIoKSwgJy5wdWxsYXBwcm92ZS55bWwnKTtcbiAgLyoqIEFsbCB0cmFja2VkIGZpbGVzIGluIHRoZSByZXBvc2l0b3J5LiAqL1xuICBjb25zdCBSRVBPX0ZJTEVTID0gYWxsRmlsZXMoKTtcbiAgLyoqIFRoZSBwdWxsIGFwcHJvdmUgY29uZmlnIGZpbGUuICovXG4gIGNvbnN0IHB1bGxBcHByb3ZlWWFtbFJhdyA9IHJlYWRGaWxlU3luYyhQVUxMX0FQUFJPVkVfWUFNTF9QQVRILCAndXRmOCcpO1xuICAvKiogQWxsIG9mIHRoZSBncm91cHMgZGVmaW5lZCBpbiB0aGUgcHVsbGFwcHJvdmUgeWFtbC4gKi9cbiAgY29uc3QgZ3JvdXBzID0gZ2V0R3JvdXBzRnJvbVlhbWwocHVsbEFwcHJvdmVZYW1sUmF3KTtcbiAgLyoqXG4gICAqIFB1bGxBcHByb3ZlIGdyb3VwcyB3aXRob3V0IGNvbmRpdGlvbnMuIFRoZXNlIGFyZSBza2lwcGVkIGluIHRoZSB2ZXJpZmljYXRpb25cbiAgICogYXMgdGhvc2Ugd291bGQgYWx3YXlzIGJlIGFjdGl2ZSBhbmQgY2F1c2UgemVybyB1bm1hdGNoZWQgZmlsZXMuXG4gICAqL1xuICBjb25zdCBncm91cHNTa2lwcGVkID0gZ3JvdXBzLmZpbHRlcihncm91cCA9PiAhZ3JvdXAuY29uZGl0aW9ucy5sZW5ndGgpO1xuICAvKiogUHVsbEFwcHJvdmUgZ3JvdXBzIHdpdGggY29uZGl0aW9ucy4gKi9cbiAgY29uc3QgZ3JvdXBzV2l0aENvbmRpdGlvbnMgPSBncm91cHMuZmlsdGVyKGdyb3VwID0+ICEhZ3JvdXAuY29uZGl0aW9ucy5sZW5ndGgpO1xuICAvKiogRmlsZXMgd2hpY2ggYXJlIG1hdGNoZWQgYnkgYXQgbGVhc3Qgb25lIGdyb3VwLiAqL1xuICBjb25zdCBtYXRjaGVkRmlsZXM6IHN0cmluZ1tdID0gW107XG4gIC8qKiBGaWxlcyB3aGljaCBhcmUgbm90IG1hdGNoZWQgYnkgYXQgbGVhc3Qgb25lIGdyb3VwLiAqL1xuICBjb25zdCB1bm1hdGNoZWRGaWxlczogc3RyaW5nW10gPSBbXTtcblxuICAvLyBUZXN0IGVhY2ggZmlsZSBpbiB0aGUgcmVwbyBhZ2FpbnN0IGVhY2ggZ3JvdXAgZm9yIGJlaW5nIG1hdGNoZWQuXG4gIFJFUE9fRklMRVMuZm9yRWFjaCgoZmlsZTogc3RyaW5nKSA9PiB7XG4gICAgaWYgKGdyb3Vwc1dpdGhDb25kaXRpb25zLmZpbHRlcihncm91cCA9PiBncm91cC50ZXN0RmlsZShmaWxlKSkubGVuZ3RoKSB7XG4gICAgICBtYXRjaGVkRmlsZXMucHVzaChmaWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdW5tYXRjaGVkRmlsZXMucHVzaChmaWxlKTtcbiAgICB9XG4gIH0pO1xuICAvKiogUmVzdWx0cyBmb3IgZWFjaCBncm91cCAqL1xuICBjb25zdCByZXN1bHRzQnlHcm91cCA9IGdyb3Vwc1dpdGhDb25kaXRpb25zLm1hcChncm91cCA9PiBncm91cC5nZXRSZXN1bHRzKCkpO1xuICAvKipcbiAgICogV2hldGhlciBhbGwgZ3JvdXAgY29uZGl0aW9uIGxpbmVzIG1hdGNoIGF0IGxlYXN0IG9uZSBmaWxlIGFuZCBhbGwgZmlsZXNcbiAgICogYXJlIG1hdGNoZWQgYnkgYXQgbGVhc3Qgb25lIGdyb3VwLlxuICAgKi9cbiAgY29uc3QgdmVyaWZpY2F0aW9uU3VjY2VlZGVkID1cbiAgICAgIHJlc3VsdHNCeUdyb3VwLmV2ZXJ5KHIgPT4gIXIudW5tYXRjaGVkQ291bnQpICYmICF1bm1hdGNoZWRGaWxlcy5sZW5ndGg7XG5cbiAgLyoqXG4gICAqIE92ZXJhbGwgcmVzdWx0XG4gICAqL1xuICBsb2dIZWFkZXIoJ092ZXJhbGwgUmVzdWx0Jyk7XG4gIGlmICh2ZXJpZmljYXRpb25TdWNjZWVkZWQpIHtcbiAgICBpbmZvKCdQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gc3VjY2VlZGVkIScpO1xuICB9IGVsc2Uge1xuICAgIGluZm8oYFB1bGxBcHByb3ZlIHZlcmlmaWNhdGlvbiBmYWlsZWQuYCk7XG4gICAgaW5mbygpO1xuICAgIGluZm8oYFBsZWFzZSB1cGRhdGUgJy5wdWxsYXBwcm92ZS55bWwnIHRvIGVuc3VyZSB0aGF0IGFsbCBuZWNlc3NhcnlgKTtcbiAgICBpbmZvKGBmaWxlcy9kaXJlY3RvcmllcyBoYXZlIG93bmVycyBhbmQgYWxsIHBhdHRlcm5zIHRoYXQgYXBwZWFyIGluYCk7XG4gICAgaW5mbyhgdGhlIGZpbGUgY29ycmVzcG9uZCB0byBhY3R1YWwgZmlsZXMvZGlyZWN0b3JpZXMgaW4gdGhlIHJlcG8uYCk7XG4gIH1cbiAgLyoqXG4gICAqIEZpbGUgYnkgZmlsZSBTdW1tYXJ5XG4gICAqL1xuICBsb2dIZWFkZXIoJ1B1bGxBcHByb3ZlIHJlc3VsdHMgYnkgZmlsZScpO1xuICBpbmZvLmdyb3VwKGBNYXRjaGVkIEZpbGVzICgke21hdGNoZWRGaWxlcy5sZW5ndGh9IGZpbGVzKWApO1xuICBtYXRjaGVkRmlsZXMuZm9yRWFjaChmaWxlID0+IGRlYnVnKGZpbGUpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBpbmZvLmdyb3VwKGBVbm1hdGNoZWQgRmlsZXMgKCR7dW5tYXRjaGVkRmlsZXMubGVuZ3RofSBmaWxlcylgKTtcbiAgdW5tYXRjaGVkRmlsZXMuZm9yRWFjaChmaWxlID0+IGluZm8oZmlsZSkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIC8qKlxuICAgKiBHcm91cCBieSBncm91cCBTdW1tYXJ5XG4gICAqL1xuICBsb2dIZWFkZXIoJ1B1bGxBcHByb3ZlIHJlc3VsdHMgYnkgZ3JvdXAnKTtcbiAgaW5mby5ncm91cChgR3JvdXBzIHNraXBwZWQgKCR7Z3JvdXBzU2tpcHBlZC5sZW5ndGh9IGdyb3VwcylgKTtcbiAgZ3JvdXBzU2tpcHBlZC5mb3JFYWNoKGdyb3VwID0+IGRlYnVnKGAke2dyb3VwLmdyb3VwTmFtZX1gKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgY29uc3QgbWF0Y2hlZEdyb3VwcyA9IHJlc3VsdHNCeUdyb3VwLmZpbHRlcihncm91cCA9PiAhZ3JvdXAudW5tYXRjaGVkQ291bnQpO1xuICBpbmZvLmdyb3VwKGBNYXRjaGVkIGNvbmRpdGlvbnMgYnkgR3JvdXAgKCR7bWF0Y2hlZEdyb3Vwcy5sZW5ndGh9IGdyb3VwcylgKTtcbiAgbWF0Y2hlZEdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IGxvZ0dyb3VwKGdyb3VwLCAnbWF0Y2hlZENvbmRpdGlvbnMnLCBkZWJ1ZykpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGNvbnN0IHVubWF0Y2hlZEdyb3VwcyA9IHJlc3VsdHNCeUdyb3VwLmZpbHRlcihncm91cCA9PiBncm91cC51bm1hdGNoZWRDb3VudCk7XG4gIGluZm8uZ3JvdXAoYFVubWF0Y2hlZCBjb25kaXRpb25zIGJ5IEdyb3VwICgke3VubWF0Y2hlZEdyb3Vwcy5sZW5ndGh9IGdyb3VwcylgKTtcbiAgdW5tYXRjaGVkR3JvdXBzLmZvckVhY2goZ3JvdXAgPT4gbG9nR3JvdXAoZ3JvdXAsICd1bm1hdGNoZWRDb25kaXRpb25zJykpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGNvbnN0IHVudmVyaWZpYWJsZUNvbmRpdGlvbnNJbkdyb3VwcyA9XG4gICAgICByZXN1bHRzQnlHcm91cC5maWx0ZXIoZ3JvdXAgPT4gZ3JvdXAudW52ZXJpZmlhYmxlQ29uZGl0aW9ucy5sZW5ndGggPiAwKTtcbiAgaW5mby5ncm91cChgVW52ZXJpZmlhYmxlIGNvbmRpdGlvbnMgYnkgR3JvdXAgKCR7dW52ZXJpZmlhYmxlQ29uZGl0aW9uc0luR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICB1bnZlcmlmaWFibGVDb25kaXRpb25zSW5Hcm91cHMuZm9yRWFjaChncm91cCA9PiBsb2dHcm91cChncm91cCwgJ3VudmVyaWZpYWJsZUNvbmRpdGlvbnMnKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcblxuICAvLyBQcm92aWRlIGNvcnJlY3QgZXhpdCBjb2RlIGJhc2VkIG9uIHZlcmlmaWNhdGlvbiBzdWNjZXNzLlxuICBwcm9jZXNzLmV4aXQodmVyaWZpY2F0aW9uU3VjY2VlZGVkID8gMCA6IDEpO1xufVxuIl19