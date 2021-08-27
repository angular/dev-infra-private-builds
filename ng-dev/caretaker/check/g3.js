"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.G3Module = void 0;
const fs_1 = require("fs");
const multimatch = require("multimatch");
const path_1 = require("path");
const yaml_1 = require("yaml");
const console_1 = require("../../utils/console");
const base_1 = require("./base");
class G3Module extends base_1.BaseModule {
    async retrieveData() {
        const toCopyToG3 = this.getG3FileIncludeAndExcludeLists();
        const latestSha = this.getLatestShas();
        if (toCopyToG3 === null || latestSha === null) {
            return;
        }
        return this.getDiffStats(latestSha.g3, latestSha.main, toCopyToG3.include, toCopyToG3.exclude);
    }
    async printToTerminal() {
        const stats = await this.data;
        if (!stats) {
            return;
        }
        console_1.info.group((0, console_1.bold)('g3 branch check'));
        if (stats.files === 0) {
            (0, console_1.info)(`${stats.commits} commits between g3 and ${this.git.mainBranchName}`);
            (0, console_1.info)('✅  No sync is needed at this time');
        }
        else {
            (0, console_1.info)(`${stats.files} files changed, ${stats.insertions} insertions(+), ${stats.deletions} ` +
                `deletions(-) from ${stats.commits} commits will be included in the next sync`);
        }
        console_1.info.groupEnd();
        (0, console_1.info)();
    }
    /** Fetch and retrieve the latest sha for a specific branch. */
    getShaForBranchLatest(branch) {
        // With the --exit-code flag, if no match is found an exit code of 2 is returned by the command.
        if (this.git.runGraceful(['ls-remote', '--exit-code', this.git.getRepoGitUrl(), branch])
            .status === 2) {
            (0, console_1.debug)(`No '${branch}' branch exists on upstream, skipping.`);
            return null;
        }
        // Retrieve the latest ref for the branch and return its sha.
        this.git.runGraceful(['fetch', '-q', this.git.getRepoGitUrl(), branch]);
        return this.git.runGraceful(['rev-parse', 'FETCH_HEAD']).stdout.trim();
    }
    /**
     * Get git diff stats between main and g3, for all files and filtered to only g3 affecting
     * files.
     */
    getDiffStats(g3Ref, mainRef, includeFiles, excludeFiles) {
        /** The diff stats to be returned. */
        const stats = {
            insertions: 0,
            deletions: 0,
            files: 0,
            commits: 0,
        };
        // Determine the number of commits between main and g3 refs. */
        stats.commits = parseInt(this.git.run(['rev-list', '--count', `${g3Ref}..${mainRef}`]).stdout, 10);
        // Get the numstat information between main and g3
        this.git
            .run(['diff', `${g3Ref}...${mainRef}`, '--numstat'])
            .stdout // Remove the extra space after git's output.
            .trim()
            // Split each line of git output into array
            .split('\n')
            // Split each line from the git output into components parts: insertions,
            // deletions and file name respectively
            .map((line) => line.trim().split('\t'))
            // Parse number value from the insertions and deletions values
            // Example raw line input:
            //   10\t5\tsrc/file/name.ts
            .map((line) => [Number(line[0]), Number(line[1]), line[2]])
            // Add each line's value to the diff stats, and conditionally to the g3
            // stats as well if the file name is included in the files synced to g3.
            .forEach(([insertions, deletions, fileName]) => {
            if (this.checkMatchAgainstIncludeAndExclude(fileName, includeFiles, excludeFiles)) {
                stats.insertions += insertions;
                stats.deletions += deletions;
                stats.files += 1;
            }
        });
        return stats;
    }
    /** Determine whether the file name passes both include and exclude checks. */
    checkMatchAgainstIncludeAndExclude(file, includes, excludes) {
        return (multimatch.call(undefined, file, includes).length >= 1 &&
            multimatch.call(undefined, file, excludes).length === 0);
    }
    getG3FileIncludeAndExcludeLists() {
        const angularRobotFilePath = (0, path_1.join)(this.git.baseDir, '.github/angular-robot.yml');
        if (!(0, fs_1.existsSync)(angularRobotFilePath)) {
            (0, console_1.debug)('No angular robot configuration file exists, skipping.');
            return null;
        }
        /** The configuration defined for the angular robot. */
        const robotConfig = (0, yaml_1.parse)((0, fs_1.readFileSync)(angularRobotFilePath).toString());
        /** The files to be included in the g3 sync. */
        const include = robotConfig?.merge?.g3Status?.include || [];
        /** The files to be expected in the g3 sync. */
        const exclude = robotConfig?.merge?.g3Status?.exclude || [];
        if (include.length === 0 && exclude.length === 0) {
            (0, console_1.debug)('No g3Status include or exclude lists are defined in the angular robot configuration');
            return null;
        }
        return { include, exclude };
    }
    getLatestShas() {
        /** The latest sha for the g3 branch. */
        const g3 = this.getShaForBranchLatest('g3');
        /** The latest sha for the main branch. */
        const main = this.getShaForBranchLatest(this.git.mainBranchName);
        if (g3 === null || main === null) {
            (0, console_1.debug)(`Either the g3 or ${this.git.mainBranchName} was unable to be retrieved`);
            return null;
        }
        return { g3, main };
    }
}
exports.G3Module = G3Module;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUE0QztBQUM1Qyx5Q0FBeUM7QUFDekMsK0JBQTBCO0FBQzFCLCtCQUF3QztBQUN4QyxpREFBc0Q7QUFFdEQsaUNBQWtDO0FBVWxDLE1BQWEsUUFBUyxTQUFRLGlCQUE4QjtJQUNqRCxLQUFLLENBQUMsWUFBWTtRQUN6QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztRQUMxRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFdkMsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDN0MsT0FBTztTQUNSO1FBRUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRVEsS0FBSyxDQUFDLGVBQWU7UUFDNUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzlCLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPO1NBQ1I7UUFDRCxjQUFJLENBQUMsS0FBSyxDQUFDLElBQUEsY0FBSSxFQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNwQyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLElBQUEsY0FBSSxFQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sMkJBQTJCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztZQUMzRSxJQUFBLGNBQUksRUFBQyxtQ0FBbUMsQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDTCxJQUFBLGNBQUksRUFDRixHQUFHLEtBQUssQ0FBQyxLQUFLLG1CQUFtQixLQUFLLENBQUMsVUFBVSxtQkFBbUIsS0FBSyxDQUFDLFNBQVMsR0FBRztnQkFDcEYscUJBQXFCLEtBQUssQ0FBQyxPQUFPLDRDQUE0QyxDQUNqRixDQUFDO1NBQ0g7UUFDRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEIsSUFBQSxjQUFJLEdBQUUsQ0FBQztJQUNULENBQUM7SUFFRCwrREFBK0Q7SUFDdkQscUJBQXFCLENBQUMsTUFBYztRQUMxQyxnR0FBZ0c7UUFDaEcsSUFDRSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNqRixNQUFNLEtBQUssQ0FBQyxFQUNmO1lBQ0EsSUFBQSxlQUFLLEVBQUMsT0FBTyxNQUFNLHdDQUF3QyxDQUFDLENBQUM7WUFDN0QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELDZEQUE2RDtRQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekUsQ0FBQztJQUVEOzs7T0FHRztJQUNLLFlBQVksQ0FDbEIsS0FBYSxFQUNiLE9BQWUsRUFDZixZQUFzQixFQUN0QixZQUFzQjtRQUV0QixxQ0FBcUM7UUFDckMsTUFBTSxLQUFLLEdBQUc7WUFDWixVQUFVLEVBQUUsQ0FBQztZQUNiLFNBQVMsRUFBRSxDQUFDO1lBQ1osS0FBSyxFQUFFLENBQUM7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNYLENBQUM7UUFFRiwrREFBK0Q7UUFDL0QsS0FBSyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxHQUFHLEtBQUssS0FBSyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUNwRSxFQUFFLENBQ0gsQ0FBQztRQUVGLGtEQUFrRDtRQUNsRCxJQUFJLENBQUMsR0FBRzthQUNMLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLEtBQUssTUFBTSxPQUFPLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUNuRCxNQUFNLENBQUMsNkNBQTZDO2FBQ3BELElBQUksRUFBRTtZQUNQLDJDQUEyQzthQUMxQyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ1oseUVBQXlFO1lBQ3pFLHVDQUF1QzthQUN0QyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsOERBQThEO1lBQzlELDBCQUEwQjtZQUMxQiw0QkFBNEI7YUFDM0IsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUE2QixDQUFDO1lBQ3ZGLHVFQUF1RTtZQUN2RSx3RUFBd0U7YUFDdkUsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsSUFBSSxJQUFJLENBQUMsa0NBQWtDLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsRUFBRTtnQkFDakYsS0FBSyxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUM7Z0JBQy9CLEtBQUssQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDO2dCQUM3QixLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQzthQUNsQjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QsOEVBQThFO0lBQ3RFLGtDQUFrQyxDQUFDLElBQVksRUFBRSxRQUFrQixFQUFFLFFBQWtCO1FBQzdGLE9BQU8sQ0FDTCxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUM7WUFDdEQsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQ3hELENBQUM7SUFDSixDQUFDO0lBRU8sK0JBQStCO1FBQ3JDLE1BQU0sb0JBQW9CLEdBQUcsSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsSUFBQSxlQUFVLEVBQUMsb0JBQW9CLENBQUMsRUFBRTtZQUNyQyxJQUFBLGVBQUssRUFBQyx1REFBdUQsQ0FBQyxDQUFDO1lBQy9ELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCx1REFBdUQ7UUFDdkQsTUFBTSxXQUFXLEdBQUcsSUFBQSxZQUFTLEVBQUMsSUFBQSxpQkFBWSxFQUFDLG9CQUFvQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM3RSwrQ0FBK0M7UUFDL0MsTUFBTSxPQUFPLEdBQWEsV0FBVyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN0RSwrQ0FBK0M7UUFDL0MsTUFBTSxPQUFPLEdBQWEsV0FBVyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUV0RSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hELElBQUEsZUFBSyxFQUFDLHFGQUFxRixDQUFDLENBQUM7WUFDN0YsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVPLGFBQWE7UUFDbkIsd0NBQXdDO1FBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QywwQ0FBMEM7UUFDMUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFakUsSUFBSSxFQUFFLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDaEMsSUFBQSxlQUFLLEVBQUMsb0JBQW9CLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyw2QkFBNkIsQ0FBQyxDQUFDO1lBQ2hGLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLEVBQUMsRUFBRSxFQUFFLElBQUksRUFBQyxDQUFDO0lBQ3BCLENBQUM7Q0FDRjtBQTFJRCw0QkEwSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jLCByZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG11bHRpbWF0Y2ggZnJvbSAnbXVsdGltYXRjaCc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtwYXJzZSBhcyBwYXJzZVlhbWx9IGZyb20gJ3lhbWwnO1xuaW1wb3J0IHtib2xkLCBkZWJ1ZywgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7QmFzZU1vZHVsZX0gZnJvbSAnLi9iYXNlJztcblxuLyoqIEluZm9ybWF0aW9uIGV4cHJlc3NpbmcgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgbWFpbiBhbmQgZzMgYnJhbmNoZXMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRzNTdGF0c0RhdGEge1xuICBpbnNlcnRpb25zOiBudW1iZXI7XG4gIGRlbGV0aW9uczogbnVtYmVyO1xuICBmaWxlczogbnVtYmVyO1xuICBjb21taXRzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBHM01vZHVsZSBleHRlbmRzIEJhc2VNb2R1bGU8RzNTdGF0c0RhdGEgfCB2b2lkPiB7XG4gIG92ZXJyaWRlIGFzeW5jIHJldHJpZXZlRGF0YSgpIHtcbiAgICBjb25zdCB0b0NvcHlUb0czID0gdGhpcy5nZXRHM0ZpbGVJbmNsdWRlQW5kRXhjbHVkZUxpc3RzKCk7XG4gICAgY29uc3QgbGF0ZXN0U2hhID0gdGhpcy5nZXRMYXRlc3RTaGFzKCk7XG5cbiAgICBpZiAodG9Db3B5VG9HMyA9PT0gbnVsbCB8fCBsYXRlc3RTaGEgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXREaWZmU3RhdHMobGF0ZXN0U2hhLmczLCBsYXRlc3RTaGEubWFpbiwgdG9Db3B5VG9HMy5pbmNsdWRlLCB0b0NvcHlUb0czLmV4Y2x1ZGUpO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcHJpbnRUb1Rlcm1pbmFsKCkge1xuICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgdGhpcy5kYXRhO1xuICAgIGlmICghc3RhdHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW5mby5ncm91cChib2xkKCdnMyBicmFuY2ggY2hlY2snKSk7XG4gICAgaWYgKHN0YXRzLmZpbGVzID09PSAwKSB7XG4gICAgICBpbmZvKGAke3N0YXRzLmNvbW1pdHN9IGNvbW1pdHMgYmV0d2VlbiBnMyBhbmQgJHt0aGlzLmdpdC5tYWluQnJhbmNoTmFtZX1gKTtcbiAgICAgIGluZm8oJ+KchSAgTm8gc3luYyBpcyBuZWVkZWQgYXQgdGhpcyB0aW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZm8oXG4gICAgICAgIGAke3N0YXRzLmZpbGVzfSBmaWxlcyBjaGFuZ2VkLCAke3N0YXRzLmluc2VydGlvbnN9IGluc2VydGlvbnMoKyksICR7c3RhdHMuZGVsZXRpb25zfSBgICtcbiAgICAgICAgICBgZGVsZXRpb25zKC0pIGZyb20gJHtzdGF0cy5jb21taXRzfSBjb21taXRzIHdpbGwgYmUgaW5jbHVkZWQgaW4gdGhlIG5leHQgc3luY2AsXG4gICAgICApO1xuICAgIH1cbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuICB9XG5cbiAgLyoqIEZldGNoIGFuZCByZXRyaWV2ZSB0aGUgbGF0ZXN0IHNoYSBmb3IgYSBzcGVjaWZpYyBicmFuY2guICovXG4gIHByaXZhdGUgZ2V0U2hhRm9yQnJhbmNoTGF0ZXN0KGJyYW5jaDogc3RyaW5nKSB7XG4gICAgLy8gV2l0aCB0aGUgLS1leGl0LWNvZGUgZmxhZywgaWYgbm8gbWF0Y2ggaXMgZm91bmQgYW4gZXhpdCBjb2RlIG9mIDIgaXMgcmV0dXJuZWQgYnkgdGhlIGNvbW1hbmQuXG4gICAgaWYgKFxuICAgICAgdGhpcy5naXQucnVuR3JhY2VmdWwoWydscy1yZW1vdGUnLCAnLS1leGl0LWNvZGUnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIGJyYW5jaF0pXG4gICAgICAgIC5zdGF0dXMgPT09IDJcbiAgICApIHtcbiAgICAgIGRlYnVnKGBObyAnJHticmFuY2h9JyBicmFuY2ggZXhpc3RzIG9uIHVwc3RyZWFtLCBza2lwcGluZy5gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFJldHJpZXZlIHRoZSBsYXRlc3QgcmVmIGZvciB0aGUgYnJhbmNoIGFuZCByZXR1cm4gaXRzIHNoYS5cbiAgICB0aGlzLmdpdC5ydW5HcmFjZWZ1bChbJ2ZldGNoJywgJy1xJywgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLCBicmFuY2hdKTtcbiAgICByZXR1cm4gdGhpcy5naXQucnVuR3JhY2VmdWwoWydyZXYtcGFyc2UnLCAnRkVUQ0hfSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnaXQgZGlmZiBzdGF0cyBiZXR3ZWVuIG1haW4gYW5kIGczLCBmb3IgYWxsIGZpbGVzIGFuZCBmaWx0ZXJlZCB0byBvbmx5IGczIGFmZmVjdGluZ1xuICAgKiBmaWxlcy5cbiAgICovXG4gIHByaXZhdGUgZ2V0RGlmZlN0YXRzKFxuICAgIGczUmVmOiBzdHJpbmcsXG4gICAgbWFpblJlZjogc3RyaW5nLFxuICAgIGluY2x1ZGVGaWxlczogc3RyaW5nW10sXG4gICAgZXhjbHVkZUZpbGVzOiBzdHJpbmdbXSxcbiAgKSB7XG4gICAgLyoqIFRoZSBkaWZmIHN0YXRzIHRvIGJlIHJldHVybmVkLiAqL1xuICAgIGNvbnN0IHN0YXRzID0ge1xuICAgICAgaW5zZXJ0aW9uczogMCxcbiAgICAgIGRlbGV0aW9uczogMCxcbiAgICAgIGZpbGVzOiAwLFxuICAgICAgY29tbWl0czogMCxcbiAgICB9O1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBudW1iZXIgb2YgY29tbWl0cyBiZXR3ZWVuIG1haW4gYW5kIGczIHJlZnMuICovXG4gICAgc3RhdHMuY29tbWl0cyA9IHBhcnNlSW50KFxuICAgICAgdGhpcy5naXQucnVuKFsncmV2LWxpc3QnLCAnLS1jb3VudCcsIGAke2czUmVmfS4uJHttYWluUmVmfWBdKS5zdGRvdXQsXG4gICAgICAxMCxcbiAgICApO1xuXG4gICAgLy8gR2V0IHRoZSBudW1zdGF0IGluZm9ybWF0aW9uIGJldHdlZW4gbWFpbiBhbmQgZzNcbiAgICB0aGlzLmdpdFxuICAgICAgLnJ1bihbJ2RpZmYnLCBgJHtnM1JlZn0uLi4ke21haW5SZWZ9YCwgJy0tbnVtc3RhdCddKVxuICAgICAgLnN0ZG91dCAvLyBSZW1vdmUgdGhlIGV4dHJhIHNwYWNlIGFmdGVyIGdpdCdzIG91dHB1dC5cbiAgICAgIC50cmltKClcbiAgICAgIC8vIFNwbGl0IGVhY2ggbGluZSBvZiBnaXQgb3V0cHV0IGludG8gYXJyYXlcbiAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgIC8vIFNwbGl0IGVhY2ggbGluZSBmcm9tIHRoZSBnaXQgb3V0cHV0IGludG8gY29tcG9uZW50cyBwYXJ0czogaW5zZXJ0aW9ucyxcbiAgICAgIC8vIGRlbGV0aW9ucyBhbmQgZmlsZSBuYW1lIHJlc3BlY3RpdmVseVxuICAgICAgLm1hcCgobGluZSkgPT4gbGluZS50cmltKCkuc3BsaXQoJ1xcdCcpKVxuICAgICAgLy8gUGFyc2UgbnVtYmVyIHZhbHVlIGZyb20gdGhlIGluc2VydGlvbnMgYW5kIGRlbGV0aW9ucyB2YWx1ZXNcbiAgICAgIC8vIEV4YW1wbGUgcmF3IGxpbmUgaW5wdXQ6XG4gICAgICAvLyAgIDEwXFx0NVxcdHNyYy9maWxlL25hbWUudHNcbiAgICAgIC5tYXAoKGxpbmUpID0+IFtOdW1iZXIobGluZVswXSksIE51bWJlcihsaW5lWzFdKSwgbGluZVsyXV0gYXMgW251bWJlciwgbnVtYmVyLCBzdHJpbmddKVxuICAgICAgLy8gQWRkIGVhY2ggbGluZSdzIHZhbHVlIHRvIHRoZSBkaWZmIHN0YXRzLCBhbmQgY29uZGl0aW9uYWxseSB0byB0aGUgZzNcbiAgICAgIC8vIHN0YXRzIGFzIHdlbGwgaWYgdGhlIGZpbGUgbmFtZSBpcyBpbmNsdWRlZCBpbiB0aGUgZmlsZXMgc3luY2VkIHRvIGczLlxuICAgICAgLmZvckVhY2goKFtpbnNlcnRpb25zLCBkZWxldGlvbnMsIGZpbGVOYW1lXSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5jaGVja01hdGNoQWdhaW5zdEluY2x1ZGVBbmRFeGNsdWRlKGZpbGVOYW1lLCBpbmNsdWRlRmlsZXMsIGV4Y2x1ZGVGaWxlcykpIHtcbiAgICAgICAgICBzdGF0cy5pbnNlcnRpb25zICs9IGluc2VydGlvbnM7XG4gICAgICAgICAgc3RhdHMuZGVsZXRpb25zICs9IGRlbGV0aW9ucztcbiAgICAgICAgICBzdGF0cy5maWxlcyArPSAxO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gc3RhdHM7XG4gIH1cbiAgLyoqIERldGVybWluZSB3aGV0aGVyIHRoZSBmaWxlIG5hbWUgcGFzc2VzIGJvdGggaW5jbHVkZSBhbmQgZXhjbHVkZSBjaGVja3MuICovXG4gIHByaXZhdGUgY2hlY2tNYXRjaEFnYWluc3RJbmNsdWRlQW5kRXhjbHVkZShmaWxlOiBzdHJpbmcsIGluY2x1ZGVzOiBzdHJpbmdbXSwgZXhjbHVkZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIG11bHRpbWF0Y2guY2FsbCh1bmRlZmluZWQsIGZpbGUsIGluY2x1ZGVzKS5sZW5ndGggPj0gMSAmJlxuICAgICAgbXVsdGltYXRjaC5jYWxsKHVuZGVmaW5lZCwgZmlsZSwgZXhjbHVkZXMpLmxlbmd0aCA9PT0gMFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGdldEczRmlsZUluY2x1ZGVBbmRFeGNsdWRlTGlzdHMoKSB7XG4gICAgY29uc3QgYW5ndWxhclJvYm90RmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsICcuZ2l0aHViL2FuZ3VsYXItcm9ib3QueW1sJyk7XG4gICAgaWYgKCFleGlzdHNTeW5jKGFuZ3VsYXJSb2JvdEZpbGVQYXRoKSkge1xuICAgICAgZGVidWcoJ05vIGFuZ3VsYXIgcm9ib3QgY29uZmlndXJhdGlvbiBmaWxlIGV4aXN0cywgc2tpcHBpbmcuJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGRlZmluZWQgZm9yIHRoZSBhbmd1bGFyIHJvYm90LiAqL1xuICAgIGNvbnN0IHJvYm90Q29uZmlnID0gcGFyc2VZYW1sKHJlYWRGaWxlU3luYyhhbmd1bGFyUm9ib3RGaWxlUGF0aCkudG9TdHJpbmcoKSk7XG4gICAgLyoqIFRoZSBmaWxlcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgZzMgc3luYy4gKi9cbiAgICBjb25zdCBpbmNsdWRlOiBzdHJpbmdbXSA9IHJvYm90Q29uZmlnPy5tZXJnZT8uZzNTdGF0dXM/LmluY2x1ZGUgfHwgW107XG4gICAgLyoqIFRoZSBmaWxlcyB0byBiZSBleHBlY3RlZCBpbiB0aGUgZzMgc3luYy4gKi9cbiAgICBjb25zdCBleGNsdWRlOiBzdHJpbmdbXSA9IHJvYm90Q29uZmlnPy5tZXJnZT8uZzNTdGF0dXM/LmV4Y2x1ZGUgfHwgW107XG5cbiAgICBpZiAoaW5jbHVkZS5sZW5ndGggPT09IDAgJiYgZXhjbHVkZS5sZW5ndGggPT09IDApIHtcbiAgICAgIGRlYnVnKCdObyBnM1N0YXR1cyBpbmNsdWRlIG9yIGV4Y2x1ZGUgbGlzdHMgYXJlIGRlZmluZWQgaW4gdGhlIGFuZ3VsYXIgcm9ib3QgY29uZmlndXJhdGlvbicpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtpbmNsdWRlLCBleGNsdWRlfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TGF0ZXN0U2hhcygpIHtcbiAgICAvKiogVGhlIGxhdGVzdCBzaGEgZm9yIHRoZSBnMyBicmFuY2guICovXG4gICAgY29uc3QgZzMgPSB0aGlzLmdldFNoYUZvckJyYW5jaExhdGVzdCgnZzMnKTtcbiAgICAvKiogVGhlIGxhdGVzdCBzaGEgZm9yIHRoZSBtYWluIGJyYW5jaC4gKi9cbiAgICBjb25zdCBtYWluID0gdGhpcy5nZXRTaGFGb3JCcmFuY2hMYXRlc3QodGhpcy5naXQubWFpbkJyYW5jaE5hbWUpO1xuXG4gICAgaWYgKGczID09PSBudWxsIHx8IG1haW4gPT09IG51bGwpIHtcbiAgICAgIGRlYnVnKGBFaXRoZXIgdGhlIGczIG9yICR7dGhpcy5naXQubWFpbkJyYW5jaE5hbWV9IHdhcyB1bmFibGUgdG8gYmUgcmV0cmlldmVkYCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4ge2czLCBtYWlufTtcbiAgfVxufVxuIl19