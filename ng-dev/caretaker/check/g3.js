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
        console_1.info.group(console_1.bold('g3 branch check'));
        if (stats.files === 0) {
            console_1.info(`${stats.commits} commits between g3 and ${this.git.mainBranchName}`);
            console_1.info('✅  No sync is needed at this time');
        }
        else {
            console_1.info(`${stats.files} files changed, ${stats.insertions} insertions(+), ${stats.deletions} ` +
                `deletions(-) from ${stats.commits} commits will be included in the next sync`);
        }
        console_1.info.groupEnd();
        console_1.info();
    }
    /** Fetch and retrieve the latest sha for a specific branch. */
    getShaForBranchLatest(branch) {
        // With the --exit-code flag, if no match is found an exit code of 2 is returned by the command.
        if (this.git.runGraceful(['ls-remote', '--exit-code', this.git.getRepoGitUrl(), branch])
            .status === 2) {
            console_1.debug(`No '${branch}' branch exists on upstream, skipping.`);
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
        const angularRobotFilePath = path_1.join(this.git.baseDir, '.github/angular-robot.yml');
        if (!fs_1.existsSync(angularRobotFilePath)) {
            console_1.debug('No angular robot configuration file exists, skipping.');
            return null;
        }
        /** The configuration defined for the angular robot. */
        const robotConfig = yaml_1.parse(fs_1.readFileSync(angularRobotFilePath).toString());
        /** The files to be included in the g3 sync. */
        const include = robotConfig?.merge?.g3Status?.include || [];
        /** The files to be expected in the g3 sync. */
        const exclude = robotConfig?.merge?.g3Status?.exclude || [];
        if (include.length === 0 && exclude.length === 0) {
            console_1.debug('No g3Status include or exclude lists are defined in the angular robot configuration');
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
            console_1.debug(`Either the g3 or ${this.git.mainBranchName} was unable to be retrieved`);
            return null;
        }
        return { g3, main };
    }
}
exports.G3Module = G3Module;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUE0QztBQUM1Qyx5Q0FBeUM7QUFDekMsK0JBQTBCO0FBQzFCLCtCQUF3QztBQUN4QyxpREFBc0Q7QUFFdEQsaUNBQWtDO0FBVWxDLE1BQWEsUUFBUyxTQUFRLGlCQUE4QjtJQUNqRCxLQUFLLENBQUMsWUFBWTtRQUN6QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztRQUMxRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFdkMsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDN0MsT0FBTztTQUNSO1FBRUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRVEsS0FBSyxDQUFDLGVBQWU7UUFDNUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzlCLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPO1NBQ1I7UUFDRCxjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtZQUNyQixjQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTywyQkFBMkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLGNBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDTCxjQUFJ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QU8sRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVPLGFBQWE7UUFDbkIsd0NBQXdDO1FBQ3hDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QywwQ0FBMEM7UUFDMUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFakUsSUFBSSxFQUFFLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7WUFDaEMsZUFBSyxDQUFDLG9CQUFvQixJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsNkJBQTZCLENBQUMsQ0FBQztZQUNoRixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsT0FBTyxFQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUNwQixDQUFDO0NBQ0Y7QUExSUQsNEJBMElDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBtdWx0aW1hdGNoIGZyb20gJ211bHRpbWF0Y2gnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VZYW1sfSBmcm9tICd5YW1sJztcbmltcG9ydCB7Ym9sZCwgZGVidWcsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Jhc2VNb2R1bGV9IGZyb20gJy4vYmFzZSc7XG5cbi8qKiBJbmZvcm1hdGlvbiBleHByZXNzaW5nIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIG1haW4gYW5kIGczIGJyYW5jaGVzICovXG5leHBvcnQgaW50ZXJmYWNlIEczU3RhdHNEYXRhIHtcbiAgaW5zZXJ0aW9uczogbnVtYmVyO1xuICBkZWxldGlvbnM6IG51bWJlcjtcbiAgZmlsZXM6IG51bWJlcjtcbiAgY29tbWl0czogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgRzNNb2R1bGUgZXh0ZW5kcyBCYXNlTW9kdWxlPEczU3RhdHNEYXRhIHwgdm9pZD4ge1xuICBvdmVycmlkZSBhc3luYyByZXRyaWV2ZURhdGEoKSB7XG4gICAgY29uc3QgdG9Db3B5VG9HMyA9IHRoaXMuZ2V0RzNGaWxlSW5jbHVkZUFuZEV4Y2x1ZGVMaXN0cygpO1xuICAgIGNvbnN0IGxhdGVzdFNoYSA9IHRoaXMuZ2V0TGF0ZXN0U2hhcygpO1xuXG4gICAgaWYgKHRvQ29weVRvRzMgPT09IG51bGwgfHwgbGF0ZXN0U2hhID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0RGlmZlN0YXRzKGxhdGVzdFNoYS5nMywgbGF0ZXN0U2hhLm1haW4sIHRvQ29weVRvRzMuaW5jbHVkZSwgdG9Db3B5VG9HMy5leGNsdWRlKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHByaW50VG9UZXJtaW5hbCgpIHtcbiAgICBjb25zdCBzdGF0cyA9IGF3YWl0IHRoaXMuZGF0YTtcbiAgICBpZiAoIXN0YXRzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluZm8uZ3JvdXAoYm9sZCgnZzMgYnJhbmNoIGNoZWNrJykpO1xuICAgIGlmIChzdGF0cy5maWxlcyA9PT0gMCkge1xuICAgICAgaW5mbyhgJHtzdGF0cy5jb21taXRzfSBjb21taXRzIGJldHdlZW4gZzMgYW5kICR7dGhpcy5naXQubWFpbkJyYW5jaE5hbWV9YCk7XG4gICAgICBpbmZvKCfinIUgIE5vIHN5bmMgaXMgbmVlZGVkIGF0IHRoaXMgdGltZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmZvKFxuICAgICAgICBgJHtzdGF0cy5maWxlc30gZmlsZXMgY2hhbmdlZCwgJHtzdGF0cy5pbnNlcnRpb25zfSBpbnNlcnRpb25zKCspLCAke3N0YXRzLmRlbGV0aW9uc30gYCArXG4gICAgICAgICAgYGRlbGV0aW9ucygtKSBmcm9tICR7c3RhdHMuY29tbWl0c30gY29tbWl0cyB3aWxsIGJlIGluY2x1ZGVkIGluIHRoZSBuZXh0IHN5bmNgLFxuICAgICAgKTtcbiAgICB9XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcbiAgfVxuXG4gIC8qKiBGZXRjaCBhbmQgcmV0cmlldmUgdGhlIGxhdGVzdCBzaGEgZm9yIGEgc3BlY2lmaWMgYnJhbmNoLiAqL1xuICBwcml2YXRlIGdldFNoYUZvckJyYW5jaExhdGVzdChicmFuY2g6IHN0cmluZykge1xuICAgIC8vIFdpdGggdGhlIC0tZXhpdC1jb2RlIGZsYWcsIGlmIG5vIG1hdGNoIGlzIGZvdW5kIGFuIGV4aXQgY29kZSBvZiAyIGlzIHJldHVybmVkIGJ5IHRoZSBjb21tYW5kLlxuICAgIGlmIChcbiAgICAgIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnbHMtcmVtb3RlJywgJy0tZXhpdC1jb2RlJywgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLCBicmFuY2hdKVxuICAgICAgICAuc3RhdHVzID09PSAyXG4gICAgKSB7XG4gICAgICBkZWJ1ZyhgTm8gJyR7YnJhbmNofScgYnJhbmNoIGV4aXN0cyBvbiB1cHN0cmVhbSwgc2tpcHBpbmcuYCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBSZXRyaWV2ZSB0aGUgbGF0ZXN0IHJlZiBmb3IgdGhlIGJyYW5jaCBhbmQgcmV0dXJuIGl0cyBzaGEuXG4gICAgdGhpcy5naXQucnVuR3JhY2VmdWwoWydmZXRjaCcsICctcScsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYnJhbmNoXSk7XG4gICAgcmV0dXJuIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsncmV2LXBhcnNlJywgJ0ZFVENIX0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZ2l0IGRpZmYgc3RhdHMgYmV0d2VlbiBtYWluIGFuZCBnMywgZm9yIGFsbCBmaWxlcyBhbmQgZmlsdGVyZWQgdG8gb25seSBnMyBhZmZlY3RpbmdcbiAgICogZmlsZXMuXG4gICAqL1xuICBwcml2YXRlIGdldERpZmZTdGF0cyhcbiAgICBnM1JlZjogc3RyaW5nLFxuICAgIG1haW5SZWY6IHN0cmluZyxcbiAgICBpbmNsdWRlRmlsZXM6IHN0cmluZ1tdLFxuICAgIGV4Y2x1ZGVGaWxlczogc3RyaW5nW10sXG4gICkge1xuICAgIC8qKiBUaGUgZGlmZiBzdGF0cyB0byBiZSByZXR1cm5lZC4gKi9cbiAgICBjb25zdCBzdGF0cyA9IHtcbiAgICAgIGluc2VydGlvbnM6IDAsXG4gICAgICBkZWxldGlvbnM6IDAsXG4gICAgICBmaWxlczogMCxcbiAgICAgIGNvbW1pdHM6IDAsXG4gICAgfTtcblxuICAgIC8vIERldGVybWluZSB0aGUgbnVtYmVyIG9mIGNvbW1pdHMgYmV0d2VlbiBtYWluIGFuZCBnMyByZWZzLiAqL1xuICAgIHN0YXRzLmNvbW1pdHMgPSBwYXJzZUludChcbiAgICAgIHRoaXMuZ2l0LnJ1bihbJ3Jldi1saXN0JywgJy0tY291bnQnLCBgJHtnM1JlZn0uLiR7bWFpblJlZn1gXSkuc3Rkb3V0LFxuICAgICAgMTAsXG4gICAgKTtcblxuICAgIC8vIEdldCB0aGUgbnVtc3RhdCBpbmZvcm1hdGlvbiBiZXR3ZWVuIG1haW4gYW5kIGczXG4gICAgdGhpcy5naXRcbiAgICAgIC5ydW4oWydkaWZmJywgYCR7ZzNSZWZ9Li4uJHttYWluUmVmfWAsICctLW51bXN0YXQnXSlcbiAgICAgIC5zdGRvdXQgLy8gUmVtb3ZlIHRoZSBleHRyYSBzcGFjZSBhZnRlciBnaXQncyBvdXRwdXQuXG4gICAgICAudHJpbSgpXG4gICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgb2YgZ2l0IG91dHB1dCBpbnRvIGFycmF5XG4gICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgZnJvbSB0aGUgZ2l0IG91dHB1dCBpbnRvIGNvbXBvbmVudHMgcGFydHM6IGluc2VydGlvbnMsXG4gICAgICAvLyBkZWxldGlvbnMgYW5kIGZpbGUgbmFtZSByZXNwZWN0aXZlbHlcbiAgICAgIC5tYXAoKGxpbmUpID0+IGxpbmUudHJpbSgpLnNwbGl0KCdcXHQnKSlcbiAgICAgIC8vIFBhcnNlIG51bWJlciB2YWx1ZSBmcm9tIHRoZSBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgdmFsdWVzXG4gICAgICAvLyBFeGFtcGxlIHJhdyBsaW5lIGlucHV0OlxuICAgICAgLy8gICAxMFxcdDVcXHRzcmMvZmlsZS9uYW1lLnRzXG4gICAgICAubWFwKChsaW5lKSA9PiBbTnVtYmVyKGxpbmVbMF0pLCBOdW1iZXIobGluZVsxXSksIGxpbmVbMl1dIGFzIFtudW1iZXIsIG51bWJlciwgc3RyaW5nXSlcbiAgICAgIC8vIEFkZCBlYWNoIGxpbmUncyB2YWx1ZSB0byB0aGUgZGlmZiBzdGF0cywgYW5kIGNvbmRpdGlvbmFsbHkgdG8gdGhlIGczXG4gICAgICAvLyBzdGF0cyBhcyB3ZWxsIGlmIHRoZSBmaWxlIG5hbWUgaXMgaW5jbHVkZWQgaW4gdGhlIGZpbGVzIHN5bmNlZCB0byBnMy5cbiAgICAgIC5mb3JFYWNoKChbaW5zZXJ0aW9ucywgZGVsZXRpb25zLCBmaWxlTmFtZV0pID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tNYXRjaEFnYWluc3RJbmNsdWRlQW5kRXhjbHVkZShmaWxlTmFtZSwgaW5jbHVkZUZpbGVzLCBleGNsdWRlRmlsZXMpKSB7XG4gICAgICAgICAgc3RhdHMuaW5zZXJ0aW9ucyArPSBpbnNlcnRpb25zO1xuICAgICAgICAgIHN0YXRzLmRlbGV0aW9ucyArPSBkZWxldGlvbnM7XG4gICAgICAgICAgc3RhdHMuZmlsZXMgKz0gMTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgcmV0dXJuIHN0YXRzO1xuICB9XG4gIC8qKiBEZXRlcm1pbmUgd2hldGhlciB0aGUgZmlsZSBuYW1lIHBhc3NlcyBib3RoIGluY2x1ZGUgYW5kIGV4Y2x1ZGUgY2hlY2tzLiAqL1xuICBwcml2YXRlIGNoZWNrTWF0Y2hBZ2FpbnN0SW5jbHVkZUFuZEV4Y2x1ZGUoZmlsZTogc3RyaW5nLCBpbmNsdWRlczogc3RyaW5nW10sIGV4Y2x1ZGVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiAoXG4gICAgICBtdWx0aW1hdGNoLmNhbGwodW5kZWZpbmVkLCBmaWxlLCBpbmNsdWRlcykubGVuZ3RoID49IDEgJiZcbiAgICAgIG11bHRpbWF0Y2guY2FsbCh1bmRlZmluZWQsIGZpbGUsIGV4Y2x1ZGVzKS5sZW5ndGggPT09IDBcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRHM0ZpbGVJbmNsdWRlQW5kRXhjbHVkZUxpc3RzKCkge1xuICAgIGNvbnN0IGFuZ3VsYXJSb2JvdEZpbGVQYXRoID0gam9pbih0aGlzLmdpdC5iYXNlRGlyLCAnLmdpdGh1Yi9hbmd1bGFyLXJvYm90LnltbCcpO1xuICAgIGlmICghZXhpc3RzU3luYyhhbmd1bGFyUm9ib3RGaWxlUGF0aCkpIHtcbiAgICAgIGRlYnVnKCdObyBhbmd1bGFyIHJvYm90IGNvbmZpZ3VyYXRpb24gZmlsZSBleGlzdHMsIHNraXBwaW5nLicpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8qKiBUaGUgY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciB0aGUgYW5ndWxhciByb2JvdC4gKi9cbiAgICBjb25zdCByb2JvdENvbmZpZyA9IHBhcnNlWWFtbChyZWFkRmlsZVN5bmMoYW5ndWxhclJvYm90RmlsZVBhdGgpLnRvU3RyaW5nKCkpO1xuICAgIC8qKiBUaGUgZmlsZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIGczIHN5bmMuICovXG4gICAgY29uc3QgaW5jbHVkZTogc3RyaW5nW10gPSByb2JvdENvbmZpZz8ubWVyZ2U/LmczU3RhdHVzPy5pbmNsdWRlIHx8IFtdO1xuICAgIC8qKiBUaGUgZmlsZXMgdG8gYmUgZXhwZWN0ZWQgaW4gdGhlIGczIHN5bmMuICovXG4gICAgY29uc3QgZXhjbHVkZTogc3RyaW5nW10gPSByb2JvdENvbmZpZz8ubWVyZ2U/LmczU3RhdHVzPy5leGNsdWRlIHx8IFtdO1xuXG4gICAgaWYgKGluY2x1ZGUubGVuZ3RoID09PSAwICYmIGV4Y2x1ZGUubGVuZ3RoID09PSAwKSB7XG4gICAgICBkZWJ1ZygnTm8gZzNTdGF0dXMgaW5jbHVkZSBvciBleGNsdWRlIGxpc3RzIGFyZSBkZWZpbmVkIGluIHRoZSBhbmd1bGFyIHJvYm90IGNvbmZpZ3VyYXRpb24nKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7aW5jbHVkZSwgZXhjbHVkZX07XG4gIH1cblxuICBwcml2YXRlIGdldExhdGVzdFNoYXMoKSB7XG4gICAgLyoqIFRoZSBsYXRlc3Qgc2hhIGZvciB0aGUgZzMgYnJhbmNoLiAqL1xuICAgIGNvbnN0IGczID0gdGhpcy5nZXRTaGFGb3JCcmFuY2hMYXRlc3QoJ2czJyk7XG4gICAgLyoqIFRoZSBsYXRlc3Qgc2hhIGZvciB0aGUgbWFpbiBicmFuY2guICovXG4gICAgY29uc3QgbWFpbiA9IHRoaXMuZ2V0U2hhRm9yQnJhbmNoTGF0ZXN0KHRoaXMuZ2l0Lm1haW5CcmFuY2hOYW1lKTtcblxuICAgIGlmIChnMyA9PT0gbnVsbCB8fCBtYWluID09PSBudWxsKSB7XG4gICAgICBkZWJ1ZyhgRWl0aGVyIHRoZSBnMyBvciAke3RoaXMuZ2l0Lm1haW5CcmFuY2hOYW1lfSB3YXMgdW5hYmxlIHRvIGJlIHJldHJpZXZlZGApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtnMywgbWFpbn07XG4gIH1cbn1cbiJdfQ==