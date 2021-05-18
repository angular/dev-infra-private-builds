/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { debug, info } from '../utils/console';
import { GitClient } from '../utils/git/index';
import { logGroup, logHeader } from './logging';
import { getGroupsFromYaml } from './parse-yaml';
export function verify() {
    const git = GitClient.getInstance();
    /** Full path to PullApprove config file */
    const PULL_APPROVE_YAML_PATH = resolve(git.baseDir, '.pullapprove.yml');
    /** All tracked files in the repository. */
    const REPO_FILES = git.allFiles();
    /** The pull approve config file. */
    const pullApproveYamlRaw = readFileSync(PULL_APPROVE_YAML_PATH, 'utf8');
    /** All of the groups defined in the pullapprove yaml. */
    const groups = getGroupsFromYaml(pullApproveYamlRaw);
    /**
     * PullApprove groups without conditions. These are skipped in the verification
     * as those would always be active and cause zero unmatched files.
     */
    const groupsSkipped = groups.filter(group => !group.conditions.length);
    /** PullApprove groups with conditions. */
    const groupsWithConditions = groups.filter(group => !!group.conditions.length);
    /** Files which are matched by at least one group. */
    const matchedFiles = [];
    /** Files which are not matched by at least one group. */
    const unmatchedFiles = [];
    // Test each file in the repo against each group for being matched.
    REPO_FILES.forEach((file) => {
        if (groupsWithConditions.filter(group => group.testFile(file)).length) {
            matchedFiles.push(file);
        }
        else {
            unmatchedFiles.push(file);
        }
    });
    /** Results for each group */
    const resultsByGroup = groupsWithConditions.map(group => group.getResults());
    /**
     * Whether all group condition lines match at least one file and all files
     * are matched by at least one group.
     */
    const verificationSucceeded = resultsByGroup.every(r => !r.unmatchedCount) && !unmatchedFiles.length;
    /**
     * Overall result
     */
    logHeader('Overall Result');
    if (verificationSucceeded) {
        info('PullApprove verification succeeded!');
    }
    else {
        info(`PullApprove verification failed.`);
        info();
        info(`Please update '.pullapprove.yml' to ensure that all necessary`);
        info(`files/directories have owners and all patterns that appear in`);
        info(`the file correspond to actual files/directories in the repo.`);
    }
    /**
     * File by file Summary
     */
    logHeader('PullApprove results by file');
    info.group(`Matched Files (${matchedFiles.length} files)`);
    matchedFiles.forEach(file => debug(file));
    info.groupEnd();
    info.group(`Unmatched Files (${unmatchedFiles.length} files)`);
    unmatchedFiles.forEach(file => info(file));
    info.groupEnd();
    /**
     * Group by group Summary
     */
    logHeader('PullApprove results by group');
    info.group(`Groups skipped (${groupsSkipped.length} groups)`);
    groupsSkipped.forEach(group => debug(`${group.groupName}`));
    info.groupEnd();
    const matchedGroups = resultsByGroup.filter(group => !group.unmatchedCount);
    info.group(`Matched conditions by Group (${matchedGroups.length} groups)`);
    matchedGroups.forEach(group => logGroup(group, 'matchedConditions', debug));
    info.groupEnd();
    const unmatchedGroups = resultsByGroup.filter(group => group.unmatchedCount);
    info.group(`Unmatched conditions by Group (${unmatchedGroups.length} groups)`);
    unmatchedGroups.forEach(group => logGroup(group, 'unmatchedConditions'));
    info.groupEnd();
    const unverifiableConditionsInGroups = resultsByGroup.filter(group => group.unverifiableConditions.length > 0);
    info.group(`Unverifiable conditions by Group (${unverifiableConditionsInGroups.length} groups)`);
    unverifiableConditionsInGroups.forEach(group => logGroup(group, 'unverifiableConditions'));
    info.groupEnd();
    // Provide correct exit code based on verification success.
    process.exit(verificationSucceeded ? 0 : 1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL3ZlcmlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sSUFBSSxDQUFDO0FBQ2hDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFFN0IsT0FBTyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM3QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFDOUMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRS9DLE1BQU0sVUFBVSxNQUFNO0lBQ3BCLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNwQywyQ0FBMkM7SUFDM0MsTUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3hFLDJDQUEyQztJQUMzQyxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsb0NBQW9DO0lBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsWUFBWSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3hFLHlEQUF5RDtJQUN6RCxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3JEOzs7T0FHRztJQUNILE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkUsMENBQTBDO0lBQzFDLE1BQU0s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LEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM1RSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDaEIsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM3RSxJQUFJLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxlQUFlLENBQUMsTUFBTSxVQUFVLENBQUMsQ0FBQztJQUMvRSxlQUFlLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7SUFDekUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2hCLE1BQU0sOEJBQThCLEdBQ2hDLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVFLElBQUksQ0FBQyxLQUFLLENBQUMscUNBQXFDLDhCQUE4QixDQUFDLE1BQU0sVUFBVSxDQUFDLENBQUM7SUFDakcsOEJBQThCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7SUFDM0YsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRWhCLDJEQUEyRDtJQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2RlYnVnLCBpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtsb2dHcm91cCwgbG9nSGVhZGVyfSBmcm9tICcuL2xvZ2dpbmcnO1xuaW1wb3J0IHtnZXRHcm91cHNGcm9tWWFtbH0gZnJvbSAnLi9wYXJzZS15YW1sJztcblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeSgpIHtcbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldEluc3RhbmNlKCk7XG4gIC8qKiBGdWxsIHBhdGggdG8gUHVsbEFwcHJvdmUgY29uZmlnIGZpbGUgKi9cbiAgY29uc3QgUFVMTF9BUFBST1ZFX1lBTUxfUEFUSCA9IHJlc29sdmUoZ2l0LmJhc2VEaXIsICcucHVsbGFwcHJvdmUueW1sJyk7XG4gIC8qKiBBbGwgdHJhY2tlZCBmaWxlcyBpbiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgY29uc3QgUkVQT19GSUxFUyA9IGdpdC5hbGxGaWxlcygpO1xuICAvKiogVGhlIHB1bGwgYXBwcm92ZSBjb25maWcgZmlsZS4gKi9cbiAgY29uc3QgcHVsbEFwcHJvdmVZYW1sUmF3ID0gcmVhZEZpbGVTeW5jKFBVTExfQVBQUk9WRV9ZQU1MX1BBVEgsICd1dGY4Jyk7XG4gIC8qKiBBbGwgb2YgdGhlIGdyb3VwcyBkZWZpbmVkIGluIHRoZSBwdWxsYXBwcm92ZSB5YW1sLiAqL1xuICBjb25zdCBncm91cHMgPSBnZXRHcm91cHNGcm9tWWFtbChwdWxsQXBwcm92ZVlhbWxSYXcpO1xuICAvKipcbiAgICogUHVsbEFwcHJvdmUgZ3JvdXBzIHdpdGhvdXQgY29uZGl0aW9ucy4gVGhlc2UgYXJlIHNraXBwZWQgaW4gdGhlIHZlcmlmaWNhdGlvblxuICAgKiBhcyB0aG9zZSB3b3VsZCBhbHdheXMgYmUgYWN0aXZlIGFuZCBjYXVzZSB6ZXJvIHVubWF0Y2hlZCBmaWxlcy5cbiAgICovXG4gIGNvbnN0IGdyb3Vwc1NraXBwZWQgPSBncm91cHMuZmlsdGVyKGdyb3VwID0+ICFncm91cC5jb25kaXRpb25zLmxlbmd0aCk7XG4gIC8qKiBQdWxsQXBwcm92ZSBncm91cHMgd2l0aCBjb25kaXRpb25zLiAqL1xuICBjb25zdCBncm91cHNXaXRoQ29uZGl0aW9ucyA9IGdyb3Vwcy5maWx0ZXIoZ3JvdXAgPT4gISFncm91cC5jb25kaXRpb25zLmxlbmd0aCk7XG4gIC8qKiBGaWxlcyB3aGljaCBhcmUgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuICovXG4gIGNvbnN0IG1hdGNoZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEZpbGVzIHdoaWNoIGFyZSBub3QgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuICovXG4gIGNvbnN0IHVubWF0Y2hlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIFRlc3QgZWFjaCBmaWxlIGluIHRoZSByZXBvIGFnYWluc3QgZWFjaCBncm91cCBmb3IgYmVpbmcgbWF0Y2hlZC5cbiAgUkVQT19GSUxFUy5mb3JFYWNoKChmaWxlOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoZ3JvdXBzV2l0aENvbmRpdGlvbnMuZmlsdGVyKGdyb3VwID0+IGdyb3VwLnRlc3RGaWxlKGZpbGUpKS5sZW5ndGgpIHtcbiAgICAgIG1hdGNoZWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1bm1hdGNoZWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgIH1cbiAgfSk7XG4gIC8qKiBSZXN1bHRzIGZvciBlYWNoIGdyb3VwICovXG4gIGNvbnN0IHJlc3VsdHNCeUdyb3VwID0gZ3JvdXBzV2l0aENvbmRpdGlvbnMubWFwKGdyb3VwID0+IGdyb3VwLmdldFJlc3VsdHMoKSk7XG4gIC8qKlxuICAgKiBXaGV0aGVyIGFsbCBncm91cCBjb25kaXRpb24gbGluZXMgbWF0Y2ggYXQgbGVhc3Qgb25lIGZpbGUgYW5kIGFsbCBmaWxlc1xuICAgKiBhcmUgbWF0Y2hlZCBieSBhdCBsZWFzdCBvbmUgZ3JvdXAuXG4gICAqL1xuICBjb25zdCB2ZXJpZmljYXRpb25TdWNjZWVkZWQgPVxuICAgICAgcmVzdWx0c0J5R3JvdXAuZXZlcnkociA9PiAhci51bm1hdGNoZWRDb3VudCkgJiYgIXVubWF0Y2hlZEZpbGVzLmxlbmd0aDtcblxuICAvKipcbiAgICogT3ZlcmFsbCByZXN1bHRcbiAgICovXG4gIGxvZ0hlYWRlcignT3ZlcmFsbCBSZXN1bHQnKTtcbiAgaWYgKHZlcmlmaWNhdGlvblN1Y2NlZWRlZCkge1xuICAgIGluZm8oJ1B1bGxBcHByb3ZlIHZlcmlmaWNhdGlvbiBzdWNjZWVkZWQhJyk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhgUHVsbEFwcHJvdmUgdmVyaWZpY2F0aW9uIGZhaWxlZC5gKTtcbiAgICBpbmZvKCk7XG4gICAgaW5mbyhgUGxlYXNlIHVwZGF0ZSAnLnB1bGxhcHByb3ZlLnltbCcgdG8gZW5zdXJlIHRoYXQgYWxsIG5lY2Vzc2FyeWApO1xuICAgIGluZm8oYGZpbGVzL2RpcmVjdG9yaWVzIGhhdmUgb3duZXJzIGFuZCBhbGwgcGF0dGVybnMgdGhhdCBhcHBlYXIgaW5gKTtcbiAgICBpbmZvKGB0aGUgZmlsZSBjb3JyZXNwb25kIHRvIGFjdHVhbCBmaWxlcy9kaXJlY3RvcmllcyBpbiB0aGUgcmVwby5gKTtcbiAgfVxuICAvKipcbiAgICogRmlsZSBieSBmaWxlIFN1bW1hcnlcbiAgICovXG4gIGxvZ0hlYWRlcignUHVsbEFwcHJvdmUgcmVzdWx0cyBieSBmaWxlJyk7XG4gIGluZm8uZ3JvdXAoYE1hdGNoZWQgRmlsZXMgKCR7bWF0Y2hlZEZpbGVzLmxlbmd0aH0gZmlsZXMpYCk7XG4gIG1hdGNoZWRGaWxlcy5mb3JFYWNoKGZpbGUgPT4gZGVidWcoZmlsZSkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGluZm8uZ3JvdXAoYFVubWF0Y2hlZCBGaWxlcyAoJHt1bm1hdGNoZWRGaWxlcy5sZW5ndGh9IGZpbGVzKWApO1xuICB1bm1hdGNoZWRGaWxlcy5mb3JFYWNoKGZpbGUgPT4gaW5mbyhmaWxlKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgLyoqXG4gICAqIEdyb3VwIGJ5IGdyb3VwIFN1bW1hcnlcbiAgICovXG4gIGxvZ0hlYWRlcignUHVsbEFwcHJvdmUgcmVzdWx0cyBieSBncm91cCcpO1xuICBpbmZvLmdyb3VwKGBHcm91cHMgc2tpcHBlZCAoJHtncm91cHNTa2lwcGVkLmxlbmd0aH0gZ3JvdXBzKWApO1xuICBncm91cHNTa2lwcGVkLmZvckVhY2goZ3JvdXAgPT4gZGVidWcoYCR7Z3JvdXAuZ3JvdXBOYW1lfWApKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBjb25zdCBtYXRjaGVkR3JvdXBzID0gcmVzdWx0c0J5R3JvdXAuZmlsdGVyKGdyb3VwID0+ICFncm91cC51bm1hdGNoZWRDb3VudCk7XG4gIGluZm8uZ3JvdXAoYE1hdGNoZWQgY29uZGl0aW9ucyBieSBHcm91cCAoJHttYXRjaGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICBtYXRjaGVkR3JvdXBzLmZvckVhY2goZ3JvdXAgPT4gbG9nR3JvdXAoZ3JvdXAsICdtYXRjaGVkQ29uZGl0aW9ucycsIGRlYnVnKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgY29uc3QgdW5tYXRjaGVkR3JvdXBzID0gcmVzdWx0c0J5R3JvdXAuZmlsdGVyKGdyb3VwID0+IGdyb3VwLnVubWF0Y2hlZENvdW50KTtcbiAgaW5mby5ncm91cChgVW5tYXRjaGVkIGNvbmRpdGlvbnMgYnkgR3JvdXAgKCR7dW5tYXRjaGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXBzKWApO1xuICB1bm1hdGNoZWRHcm91cHMuZm9yRWFjaChncm91cCA9PiBsb2dHcm91cChncm91cCwgJ3VubWF0Y2hlZENvbmRpdGlvbnMnKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbiAgY29uc3QgdW52ZXJpZmlhYmxlQ29uZGl0aW9uc0luR3JvdXBzID1cbiAgICAgIHJlc3VsdHNCeUdyb3VwLmZpbHRlcihncm91cCA9PiBncm91cC51bnZlcmlmaWFibGVDb25kaXRpb25zLmxlbmd0aCA+IDApO1xuICBpbmZvLmdyb3VwKGBVbnZlcmlmaWFibGUgY29uZGl0aW9ucyBieSBHcm91cCAoJHt1bnZlcmlmaWFibGVDb25kaXRpb25zSW5Hcm91cHMubGVuZ3RofSBncm91cHMpYCk7XG4gIHVudmVyaWZpYWJsZUNvbmRpdGlvbnNJbkdyb3Vwcy5mb3JFYWNoKGdyb3VwID0+IGxvZ0dyb3VwKGdyb3VwLCAndW52ZXJpZmlhYmxlQ29uZGl0aW9ucycpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuXG4gIC8vIFByb3ZpZGUgY29ycmVjdCBleGl0IGNvZGUgYmFzZWQgb24gdmVyaWZpY2F0aW9uIHN1Y2Nlc3MuXG4gIHByb2Nlc3MuZXhpdCh2ZXJpZmljYXRpb25TdWNjZWVkZWQgPyAwIDogMSk7XG59XG4iXX0=