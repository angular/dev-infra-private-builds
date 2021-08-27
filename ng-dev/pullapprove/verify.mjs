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
const fs_1 = require("fs");
const path_1 = require("path");
const console_1 = require("../utils/console");
const git_client_1 = require("../utils/git/git-client");
const logging_1 = require("./logging");
const parse_yaml_1 = require("./parse-yaml");
function verify() {
    const git = git_client_1.GitClient.get();
    /** Full path to PullApprove config file */
    const PULL_APPROVE_YAML_PATH = (0, path_1.resolve)(git.baseDir, '.pullapprove.yml');
    /** All tracked files in the repository. */
    const REPO_FILES = git.allFiles();
    /** The pull approve config file. */
    const pullApproveYamlRaw = (0, fs_1.readFileSync)(PULL_APPROVE_YAML_PATH, 'utf8');
    /** All of the groups defined in the pullapprove yaml. */
    const groups = (0, parse_yaml_1.getGroupsFromYaml)(pullApproveYamlRaw);
    /**
     * PullApprove groups without conditions. These are skipped in the verification
     * as those would always be active and cause zero unmatched files.
     */
    const groupsSkipped = groups.filter((group) => !group.conditions.length);
    /** PullApprove groups with conditions. */
    const groupsWithConditions = groups.filter((group) => !!group.conditions.length);
    /** Files which are matched by at least one group. */
    const matchedFiles = [];
    /** Files which are not matched by at least one group. */
    const unmatchedFiles = [];
    // Test each file in the repo against each group for being matched.
    REPO_FILES.forEach((file) => {
        if (groupsWithConditions.filter((group) => group.testFile(file)).length) {
            matchedFiles.push(file);
        }
        else {
            unmatchedFiles.push(file);
        }
    });
    /** Results for each group */
    const resultsByGroup = groupsWithConditions.map((group) => group.getResults());
    /**
     * Whether all group condition lines match at least one file and all files
     * are matched by at least one group.
     */
    const allGroupConditionsValid = resultsByGroup.every((r) => !r.unmatchedCount) && !unmatchedFiles.length;
    /** Whether all groups have at least one reviewer user or team defined.  */
    const groupsWithoutReviewers = groups.filter((group) => Object.keys(group.reviewers).length === 0);
    /** The overall result of the verifcation. */
    const overallResult = allGroupConditionsValid && groupsWithoutReviewers.length === 0;
    /**
     * Overall result
     */
    (0, logging_1.logHeader)('Overall Result');
    if (overallResult) {
        (0, console_1.info)('PullApprove verification succeeded!');
    }
    else {
        (0, console_1.info)(`PullApprove verification failed.`);
        (0, console_1.info)();
        (0, console_1.info)(`Please update '.pullapprove.yml' to ensure that all necessary`);
        (0, console_1.info)(`files/directories have owners and all patterns that appear in`);
        (0, console_1.info)(`the file correspond to actual files/directories in the repo.`);
    }
    /** Reviewers check */
    (0, logging_1.logHeader)(`Group Reviewers Check`);
    if (groupsWithoutReviewers.length === 0) {
        (0, console_1.info)('All group contain at least one reviewer user or team.');
    }
    else {
        console_1.info.group(`Discovered ${groupsWithoutReviewers.length} group(s) without a reviewer defined`);
        groupsWithoutReviewers.forEach((g) => (0, console_1.info)(g.groupName));
        console_1.info.groupEnd();
    }
    /**
     * File by file Summary
     */
    (0, logging_1.logHeader)('PullApprove results by file');
    console_1.info.group(`Matched Files (${matchedFiles.length} files)`);
    matchedFiles.forEach((file) => (0, console_1.debug)(file));
    console_1.info.groupEnd();
    console_1.info.group(`Unmatched Files (${unmatchedFiles.length} files)`);
    unmatchedFiles.forEach((file) => (0, console_1.info)(file));
    console_1.info.groupEnd();
    /**
     * Group by group Summary
     */
    (0, logging_1.logHeader)('PullApprove results by group');
    console_1.info.group(`Groups skipped (${groupsSkipped.length} groups)`);
    groupsSkipped.forEach((group) => (0, console_1.debug)(`${group.groupName}`));
    console_1.info.groupEnd();
    const matchedGroups = resultsByGroup.filter((group) => !group.unmatchedCount);
    console_1.info.group(`Matched conditions by Group (${matchedGroups.length} groups)`);
    matchedGroups.forEach((group) => (0, logging_1.logGroup)(group, 'matchedConditions', console_1.debug));
    console_1.info.groupEnd();
    const unmatchedGroups = resultsByGroup.filter((group) => group.unmatchedCount);
    console_1.info.group(`Unmatched conditions by Group (${unmatchedGroups.length} groups)`);
    unmatchedGroups.forEach((group) => (0, logging_1.logGroup)(group, 'unmatchedConditions'));
    console_1.info.groupEnd();
    const unverifiableConditionsInGroups = resultsByGroup.filter((group) => group.unverifiableConditions.length > 0);
    console_1.info.group(`Unverifiable conditions by Group (${unverifiableConditionsInGroups.length} groups)`);
    unverifiableConditionsInGroups.forEach((group) => (0, logging_1.logGroup)(group, 'unverifiableConditions'));
    console_1.info.groupEnd();
    // Provide correct exit code based on verification success.
    process.exit(overallResult ? 0 : 1);
}
exports.verify = verify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwyQkFBZ0M7QUFDaEMsK0JBQTZCO0FBRTdCLDhDQUE2QztBQUM3Qyx3REFBa0Q7QUFDbEQsdUNBQThDO0FBQzlDLDZDQUErQztBQUUvQyxTQUFnQixNQUFNO0lBQ3BCLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDNUIsMkNBQTJDO0lBQzNDLE1BQU0sc0JBQXNCLEdBQUcsSUFBQSxjQUFPLEVBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3hFLDJDQUEyQztJQUMzQyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsb0NBQW9DO0lBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxpQkFBWSxFQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hFLHlEQUF5RDtJQUN6RCxNQUFNLE1BQU0sR0FBRyxJQUFBLDhCQUFpQixFQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDckQ7OztPQUdHO0lBQ0gsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pFLDBDQUEwQztJQUMxQyxNQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pGLHFEQUFxRDtJQUNyRCxNQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7SUFDbEMseURBQXlEO0lBQ3pELE1BQU0sY0FBYyxH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QUMxRCxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQ25ELENBQUM7SUFDRixjQUFJLENBQUMsS0FBSyxDQUFDLHFDQUFxQyw4QkFBOEIsQ0FBQyxNQUFNLFVBQVUsQ0FBQyxDQUFDO0lBQ2pHLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBQSxrQkFBUSxFQUFDLEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7SUFDN0YsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRWhCLDJEQUEyRDtJQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBckdELHdCQXFHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7bG9nR3JvdXAsIGxvZ0hlYWRlcn0gZnJvbSAnLi9sb2dnaW5nJztcbmltcG9ydCB7Z2V0R3JvdXBzRnJvbVlhbWx9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnkoKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIEZ1bGwgcGF0aCB0byBQdWxsQXBwcm92ZSBjb25maWcgZmlsZSAqL1xuICBjb25zdCBQVUxMX0FQUFJPVkVfWUFNTF9QQVRIID0gcmVzb2x2ZShnaXQuYmFzZURpciwgJy5wdWxsYXBwcm92ZS55bWwnKTtcbiAgLyoqIEFsbCB0cmFja2VkIGZpbGVzIGluIHRoZSByZXBvc2l0b3J5LiAqL1xuICBjb25zdCBSRVBPX0ZJTEVTID0gZ2l0LmFsbEZpbGVzKCk7XG4gIC8qKiBUaGUgcHVsbCBhcHByb3ZlIGNvbmZpZyBmaWxlLiAqL1xuICBjb25zdCBwdWxsQXBwcm92ZVlhbWxSYXcgPSByZWFkRmlsZVN5bmMoUFVMTF9BUFBST1ZFX1lBTUxfUEFUSCwgJ3V0ZjgnKTtcbiAgLyoqIEFsbCBvZiB0aGUgZ3JvdXBzIGRlZmluZWQgaW4gdGhlIHB1bGxhcHByb3ZlIHlhbWwuICovXG4gIGNvbnN0IGdyb3VwcyA9IGdldEdyb3Vwc0Zyb21ZYW1sKHB1bGxBcHByb3ZlWWFtbFJhdyk7XG4gIC8qKlxuICAgKiBQdWxsQXBwcm92ZSBncm91cHMgd2l0aG91dCBjb25kaXRpb25zLiBUaGVzZSBhcmUgc2tpcHBlZCBpbiB0aGUgdmVyaWZpY2F0aW9uXG4gICAqIGFzIHRob3NlIHdvdWxkIGFsd2F5cyBiZSBhY3RpdmUgYW5kIGNhdXNlIHplcm8gdW5tYXRjaGVkIGZpbGVzLlxuICAgKi9cbiAgY29uc3QgZ3JvdXBzU2tpcHBlZCA9IGdyb3Vwcy5maWx0ZXIoKGdyb3VwKSA9PiAhZ3JvdXAuY29uZGl0aW9ucy5sZW5ndGgpO1xuICAvKiogUHVsbEFwcHJvdmUgZ3JvdXBzIHdpdGggY29uZGl0aW9ucy4gKi9cbiAgY29uc3QgZ3JvdXBzV2l0aENvbmRpdGlvbnMgPSBncm91cHMuZmlsdGVyKChncm91cCkgPT4gISFncm91cC5jb25kaXRpb25zLmxlbmd0aCk7XG4gIC8qKiBGaWxlcyB3aGljaCBhcmUgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuICovXG4gIGNvbnN0IG1hdGNoZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEZpbGVzIHdoaWNoIGFyZSBub3QgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuICovXG4gIGNvbnN0IHVubWF0Y2hlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIFRlc3QgZWFjaCBmaWxlIGluIHRoZSByZXBvIGFnYWluc3QgZWFjaCBncm91cCBmb3IgYmVpbmcgbWF0Y2hlZC5cbiAgUkVQT19GSUxFUy5mb3JFYWNoKChmaWxlOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoZ3JvdXBzV2l0aENvbmRpdGlvbnMuZmlsdGVyKChncm91cCkgPT4gZ3JvdXAudGVzdEZpbGUoZmlsZSkpLmxlbmd0aCkge1xuICAgICAgbWF0Y2hlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVubWF0Y2hlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgfVxuICB9KTtcbiAgLyoqIFJlc3VsdHMgZm9yIGVhY2ggZ3JvdXAgKi9cbiAgY29uc3QgcmVzdWx0c0J5R3JvdXAgPSBncm91cHNXaXRoQ29uZGl0aW9ucy5tYXAoKGdyb3VwKSA9PiBncm91cC5nZXRSZXN1bHRzKCkpO1xuICAvKipcbiAgICogV2hldGhlciBhbGwgZ3JvdXAgY29uZGl0aW9uIGxpbmVzIG1hdGNoIGF0IGxlYXN0IG9uZSBmaWxlIGFuZCBhbGwgZmlsZXNcbiAgICogYXJlIG1hdGNoZWQgYnkgYXQgbGVhc3Qgb25lIGdyb3VwLlxuICAgKi9cbiAgY29uc3QgYWxsR3JvdXBDb25kaXRpb25zVmFsaWQgPVxuICAgIHJlc3VsdHNCeUdyb3VwLmV2ZXJ5KChyKSA9PiAhci51bm1hdGNoZWRDb3VudCkgJiYgIXVubWF0Y2hlZEZpbGVzLmxlbmd0aDtcbiAgLyoqIFdoZXRoZXIgYWxsIGdyb3VwcyBoYXZlIGF0IGxlYXN0IG9uZSByZXZpZXdlciB1c2VyIG9yIHRlYW0gZGVmaW5lZC4gICovXG4gIGNvbnN0IGdyb3Vwc1dpdGhvdXRSZXZpZXdlcnMgPSBncm91cHMuZmlsdGVyKFxuICAgIChncm91cCkgPT4gT2JqZWN0LmtleXMoZ3JvdXAucmV2aWV3ZXJzKS5sZW5ndGggPT09IDAsXG4gICk7XG4gIC8qKiBUaGUgb3ZlcmFsbCByZXN1bHQgb2YgdGhlIHZlcmlmY2F0aW9uLiAqL1xuICBjb25zdCBvdmVyYWxsUmVzdWx0ID0gYWxsR3JvdXBDb25kaXRpb25zVmFsaWQgJiYgZ3JvdXBzV2l0aG91dFJldmlld2Vycy5sZW5ndGggPT09IDA7XG5cbiAgLyoqXG4gICAqIE92ZXJhbGwgcmVzdWx0XG4gICAqL1xuICBsb2dIZWFkZXIoJ092ZXJhbGwgUmVzdWx0Jyk7XG4gIGlmIChvdmVyYWxsUmVzdWx0KSB7XG4gICAgaW5mbygnUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIHN1Y2NlZWRlZCEnKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGBQdWxsQXBwcm92ZSB2ZXJpZmljYXRpb24gZmFpbGVkLmApO1xuICAgIGluZm8oKTtcbiAgICBpbmZvKGBQbGVhc2UgdXBkYXRlICcucHVsbGFwcHJvdmUueW1sJyB0byBlbnN1cmUgdGhhdCBhbGwgbmVjZXNzYXJ5YCk7XG4gICAgaW5mbyhgZmlsZXMvZGlyZWN0b3JpZXMgaGF2ZSBvd25lcnMgYW5kIGFsbCBwYXR0ZXJucyB0aGF0IGFwcGVhciBpbmApO1xuICAgIGluZm8oYHRoZSBmaWxlIGNvcnJlc3BvbmQgdG8gYWN0dWFsIGZpbGVzL2RpcmVjdG9yaWVzIGluIHRoZSByZXBvLmApO1xuICB9XG4gIC8qKiBSZXZpZXdlcnMgY2hlY2sgKi9cbiAgbG9nSGVhZGVyKGBHcm91cCBSZXZpZXdlcnMgQ2hlY2tgKTtcbiAgaWYgKGdyb3Vwc1dpdGhvdXRSZXZpZXdlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgaW5mbygnQWxsIGdyb3VwIGNvbnRhaW4gYXQgbGVhc3Qgb25lIHJldmlld2VyIHVzZXIgb3IgdGVhbS4nKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvLmdyb3VwKGBEaXNjb3ZlcmVkICR7Z3JvdXBzV2l0aG91dFJldmlld2Vycy5sZW5ndGh9IGdyb3VwKHMpIHdpdGhvdXQgYSByZXZpZXdlciBkZWZpbmVkYCk7XG4gICAgZ3JvdXBzV2l0aG91dFJldmlld2Vycy5mb3JFYWNoKChnKSA9PiBpbmZvKGcuZ3JvdXBOYW1lKSk7XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICB9XG4gIC8qKlxuICAgKiBGaWxlIGJ5IGZpbGUgU3VtbWFyeVxuICAgKi9cbiAgbG9nSGVhZGVyKCdQdWxsQXBwcm92ZSByZXN1bHRzIGJ5IGZpbGUnKTtcbiAgaW5mby5ncm91cChgTWF0Y2hlZCBGaWxlcyAoJHttYXRjaGVkRmlsZXMubGVuZ3RofSBmaWxlcylgKTtcbiAgbWF0Y2hlZEZpbGVzLmZvckVhY2goKGZpbGUpID0+IGRlYnVnKGZpbGUpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBpbmZvLmdyb3VwKGBVbm1hdGNoZWQgRmlsZXMgKCR7dW5tYXRjaGVkRmlsZXMubGVuZ3RofSBmaWxlcylgKTtcbiAgdW5tYXRjaGVkRmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4gaW5mbyhmaWxlKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgLyoqXG4gICAqIEdyb3VwIGJ5IGdyb3VwIFN1bW1hcnlcbiAgICovXG4gIGxvZ0hlYWRlcignUHVsbEFwcHJvdmUgcmVzdWx0cyBieSBncm91cCcpO1xuICBpbmZvLmdyb3VwKGBHcm91cHMgc2tpcHBlZCAoJHtncm91cHNTa2lwcGVkLmxlbmd0aH0gZ3JvdXBzKWApO1xuICBncm91cHNTa2lwcGVkLmZvckVhY2goKGdyb3VwKSA9PiBkZWJ1ZyhgJHtncm91cC5ncm91cE5hbWV9YCkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGNvbnN0IG1hdGNoZWRHcm91cHMgPSByZXN1bHRzQnlHcm91cC5maWx0ZXIoKGdyb3VwKSA9PiAhZ3JvdXAudW5tYXRjaGVkQ291bnQpO1xuICBpbmZvLmdyb3VwKGBNYXRjaGVkIGNvbmRpdGlvbnMgYnkgR3JvdXAgKCR7bWF0Y2hlZEdyb3Vwcy5sZW5ndGh9IGdyb3VwcylgKTtcbiAgbWF0Y2hlZEdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4gbG9nR3JvdXAoZ3JvdXAsICdtYXRjaGVkQ29uZGl0aW9ucycsIGRlYnVnKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgY29uc3QgdW5tYXRjaGVkR3JvdXBzID0gcmVzdWx0c0J5R3JvdXAuZmlsdGVyKChncm91cCkgPT4gZ3JvdXAudW5tYXRjaGVkQ291bnQpO1xuICBpbmZvLmdyb3VwKGBVbm1hdGNoZWQgY29uZGl0aW9ucyBieSBHcm91cCAoJHt1bm1hdGNoZWRHcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIHVubWF0Y2hlZEdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4gbG9nR3JvdXAoZ3JvdXAsICd1bm1hdGNoZWRDb25kaXRpb25zJykpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGNvbnN0IHVudmVyaWZpYWJsZUNvbmRpdGlvbnNJbkdyb3VwcyA9IHJlc3VsdHNCeUdyb3VwLmZpbHRlcihcbiAgICAoZ3JvdXApID0+IGdyb3VwLnVudmVyaWZpYWJsZUNvbmRpdGlvbnMubGVuZ3RoID4gMCxcbiAgKTtcbiAgaW5mby5ncm91cChgVW52ZXJpZmlhYmxlIGNvbmRpdGlvbnMgYnkgR3JvdXAgKCR7dW52ZXJpZmlhYmxlQ29uZGl0aW9uc0luR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICB1bnZlcmlmaWFibGVDb25kaXRpb25zSW5Hcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IGxvZ0dyb3VwKGdyb3VwLCAndW52ZXJpZmlhYmxlQ29uZGl0aW9ucycpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuXG4gIC8vIFByb3ZpZGUgY29ycmVjdCBleGl0IGNvZGUgYmFzZWQgb24gdmVyaWZpY2F0aW9uIHN1Y2Nlc3MuXG4gIHByb2Nlc3MuZXhpdChvdmVyYWxsUmVzdWx0ID8gMCA6IDEpO1xufVxuIl19