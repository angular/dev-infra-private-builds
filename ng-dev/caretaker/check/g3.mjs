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
        const { owner, name } = this.git.remoteConfig;
        /** The result fo the fetch command. */
        const fetchResult = this.git.runGraceful([
            'fetch',
            '-q',
            `https://github.com/${owner}/${name}.git`,
            branch,
        ]);
        if (fetchResult.status !== 0 &&
            fetchResult.stderr.includes(`couldn't find remote ref ${branch}`)) {
            console_1.debug(`No '${branch}' branch exists on upstream, skipping.`);
            return null;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUE0QztBQUM1Qyx5Q0FBeUM7QUFDekMsK0JBQTBCO0FBQzFCLCtCQUF3QztBQUN4QyxpREFBc0Q7QUFFdEQsaUNBQWtDO0FBVWxDLE1BQWEsUUFBUyxTQUFRLGlCQUE4QjtJQUNqRCxLQUFLLENBQUMsWUFBWTtRQUN6QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztRQUMxRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFdkMsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDN0MsT0FBTztTQUNSO1FBRUQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRVEsS0FBSyxDQUFDLGVBQWU7UUFDNUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzlCLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixPQUFPO1NBQ1I7UUFDRCxjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtZQUNyQixjQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTywyQkFBMkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQzNFLGNBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDTCxjQUFJ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RixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsT0FBTyxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQztJQUM1QixDQUFDO0lBRU8sYUFBYTtRQUNuQix3Q0FBd0M7UUFDeEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLDBDQUEwQztRQUMxQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUVqRSxJQUFJLEVBQUUsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUNoQyxlQUFLLENBQUMsb0JBQW9CLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyw2QkFBNkIsQ0FBQyxDQUFDO1lBQ2hGLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLEVBQUMsRUFBRSxFQUFFLElBQUksRUFBQyxDQUFDO0lBQ3BCLENBQUM7Q0FDRjtBQS9JRCw0QkErSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jLCByZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG11bHRpbWF0Y2ggZnJvbSAnbXVsdGltYXRjaCc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtwYXJzZSBhcyBwYXJzZVlhbWx9IGZyb20gJ3lhbWwnO1xuaW1wb3J0IHtib2xkLCBkZWJ1ZywgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7QmFzZU1vZHVsZX0gZnJvbSAnLi9iYXNlJztcblxuLyoqIEluZm9ybWF0aW9uIGV4cHJlc3NpbmcgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgbWFpbiBhbmQgZzMgYnJhbmNoZXMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgRzNTdGF0c0RhdGEge1xuICBpbnNlcnRpb25zOiBudW1iZXI7XG4gIGRlbGV0aW9uczogbnVtYmVyO1xuICBmaWxlczogbnVtYmVyO1xuICBjb21taXRzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBHM01vZHVsZSBleHRlbmRzIEJhc2VNb2R1bGU8RzNTdGF0c0RhdGEgfCB2b2lkPiB7XG4gIG92ZXJyaWRlIGFzeW5jIHJldHJpZXZlRGF0YSgpIHtcbiAgICBjb25zdCB0b0NvcHlUb0czID0gdGhpcy5nZXRHM0ZpbGVJbmNsdWRlQW5kRXhjbHVkZUxpc3RzKCk7XG4gICAgY29uc3QgbGF0ZXN0U2hhID0gdGhpcy5nZXRMYXRlc3RTaGFzKCk7XG5cbiAgICBpZiAodG9Db3B5VG9HMyA9PT0gbnVsbCB8fCBsYXRlc3RTaGEgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXREaWZmU3RhdHMobGF0ZXN0U2hhLmczLCBsYXRlc3RTaGEubWFpbiwgdG9Db3B5VG9HMy5pbmNsdWRlLCB0b0NvcHlUb0czLmV4Y2x1ZGUpO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcHJpbnRUb1Rlcm1pbmFsKCkge1xuICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgdGhpcy5kYXRhO1xuICAgIGlmICghc3RhdHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW5mby5ncm91cChib2xkKCdnMyBicmFuY2ggY2hlY2snKSk7XG4gICAgaWYgKHN0YXRzLmZpbGVzID09PSAwKSB7XG4gICAgICBpbmZvKGAke3N0YXRzLmNvbW1pdHN9IGNvbW1pdHMgYmV0d2VlbiBnMyBhbmQgJHt0aGlzLmdpdC5tYWluQnJhbmNoTmFtZX1gKTtcbiAgICAgIGluZm8oJ+KchSAgTm8gc3luYyBpcyBuZWVkZWQgYXQgdGhpcyB0aW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZm8oXG4gICAgICAgIGAke3N0YXRzLmZpbGVzfSBmaWxlcyBjaGFuZ2VkLCAke3N0YXRzLmluc2VydGlvbnN9IGluc2VydGlvbnMoKyksICR7c3RhdHMuZGVsZXRpb25zfSBgICtcbiAgICAgICAgICBgZGVsZXRpb25zKC0pIGZyb20gJHtzdGF0cy5jb21taXRzfSBjb21taXRzIHdpbGwgYmUgaW5jbHVkZWQgaW4gdGhlIG5leHQgc3luY2AsXG4gICAgICApO1xuICAgIH1cbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuICB9XG5cbiAgLyoqIEZldGNoIGFuZCByZXRyaWV2ZSB0aGUgbGF0ZXN0IHNoYSBmb3IgYSBzcGVjaWZpYyBicmFuY2guICovXG4gIHByaXZhdGUgZ2V0U2hhRm9yQnJhbmNoTGF0ZXN0KGJyYW5jaDogc3RyaW5nKSB7XG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZztcbiAgICAvKiogVGhlIHJlc3VsdCBmbyB0aGUgZmV0Y2ggY29tbWFuZC4gKi9cbiAgICBjb25zdCBmZXRjaFJlc3VsdCA9IHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFtcbiAgICAgICdmZXRjaCcsXG4gICAgICAnLXEnLFxuICAgICAgYGh0dHBzOi8vZ2l0aHViLmNvbS8ke293bmVyfS8ke25hbWV9LmdpdGAsXG4gICAgICBicmFuY2gsXG4gICAgXSk7XG5cbiAgICBpZiAoXG4gICAgICBmZXRjaFJlc3VsdC5zdGF0dXMgIT09IDAgJiZcbiAgICAgIGZldGNoUmVzdWx0LnN0ZGVyci5pbmNsdWRlcyhgY291bGRuJ3QgZmluZCByZW1vdGUgcmVmICR7YnJhbmNofWApXG4gICAgKSB7XG4gICAgICBkZWJ1ZyhgTm8gJyR7YnJhbmNofScgYnJhbmNoIGV4aXN0cyBvbiB1cHN0cmVhbSwgc2tpcHBpbmcuYCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsncmV2LXBhcnNlJywgJ0ZFVENIX0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZ2l0IGRpZmYgc3RhdHMgYmV0d2VlbiBtYWluIGFuZCBnMywgZm9yIGFsbCBmaWxlcyBhbmQgZmlsdGVyZWQgdG8gb25seSBnMyBhZmZlY3RpbmdcbiAgICogZmlsZXMuXG4gICAqL1xuICBwcml2YXRlIGdldERpZmZTdGF0cyhcbiAgICBnM1JlZjogc3RyaW5nLFxuICAgIG1haW5SZWY6IHN0cmluZyxcbiAgICBpbmNsdWRlRmlsZXM6IHN0cmluZ1tdLFxuICAgIGV4Y2x1ZGVGaWxlczogc3RyaW5nW10sXG4gICkge1xuICAgIC8qKiBUaGUgZGlmZiBzdGF0cyB0byBiZSByZXR1cm5lZC4gKi9cbiAgICBjb25zdCBzdGF0cyA9IHtcbiAgICAgIGluc2VydGlvbnM6IDAsXG4gICAgICBkZWxldGlvbnM6IDAsXG4gICAgICBmaWxlczogMCxcbiAgICAgIGNvbW1pdHM6IDAsXG4gICAgfTtcblxuICAgIC8vIERldGVybWluZSB0aGUgbnVtYmVyIG9mIGNvbW1pdHMgYmV0d2VlbiBtYWluIGFuZCBnMyByZWZzLiAqL1xuICAgIHN0YXRzLmNvbW1pdHMgPSBwYXJzZUludChcbiAgICAgIHRoaXMuZ2l0LnJ1bihbJ3Jldi1saXN0JywgJy0tY291bnQnLCBgJHtnM1JlZn0uLiR7bWFpblJlZn1gXSkuc3Rkb3V0LFxuICAgICAgMTAsXG4gICAgKTtcblxuICAgIC8vIEdldCB0aGUgbnVtc3RhdCBpbmZvcm1hdGlvbiBiZXR3ZWVuIG1haW4gYW5kIGczXG4gICAgdGhpcy5naXRcbiAgICAgIC5ydW4oWydkaWZmJywgYCR7ZzNSZWZ9Li4uJHttYWluUmVmfWAsICctLW51bXN0YXQnXSlcbiAgICAgIC5zdGRvdXQgLy8gUmVtb3ZlIHRoZSBleHRyYSBzcGFjZSBhZnRlciBnaXQncyBvdXRwdXQuXG4gICAgICAudHJpbSgpXG4gICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgb2YgZ2l0IG91dHB1dCBpbnRvIGFycmF5XG4gICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgZnJvbSB0aGUgZ2l0IG91dHB1dCBpbnRvIGNvbXBvbmVudHMgcGFydHM6IGluc2VydGlvbnMsXG4gICAgICAvLyBkZWxldGlvbnMgYW5kIGZpbGUgbmFtZSByZXNwZWN0aXZlbHlcbiAgICAgIC5tYXAoKGxpbmUpID0+IGxpbmUudHJpbSgpLnNwbGl0KCdcXHQnKSlcbiAgICAgIC8vIFBhcnNlIG51bWJlciB2YWx1ZSBmcm9tIHRoZSBpbnNlcnRpb25zIGFuZCBkZWxldGlvbnMgdmFsdWVzXG4gICAgICAvLyBFeGFtcGxlIHJhdyBsaW5lIGlucHV0OlxuICAgICAgLy8gICAxMFxcdDVcXHRzcmMvZmlsZS9uYW1lLnRzXG4gICAgICAubWFwKChsaW5lKSA9PiBbTnVtYmVyKGxpbmVbMF0pLCBOdW1iZXIobGluZVsxXSksIGxpbmVbMl1dIGFzIFtudW1iZXIsIG51bWJlciwgc3RyaW5nXSlcbiAgICAgIC8vIEFkZCBlYWNoIGxpbmUncyB2YWx1ZSB0byB0aGUgZGlmZiBzdGF0cywgYW5kIGNvbmRpdGlvbmFsbHkgdG8gdGhlIGczXG4gICAgICAvLyBzdGF0cyBhcyB3ZWxsIGlmIHRoZSBmaWxlIG5hbWUgaXMgaW5jbHVkZWQgaW4gdGhlIGZpbGVzIHN5bmNlZCB0byBnMy5cbiAgICAgIC5mb3JFYWNoKChbaW5zZXJ0aW9ucywgZGVsZXRpb25zLCBmaWxlTmFtZV0pID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tNYXRjaEFnYWluc3RJbmNsdWRlQW5kRXhjbHVkZShmaWxlTmFtZSwgaW5jbHVkZUZpbGVzLCBleGNsdWRlRmlsZXMpKSB7XG4gICAgICAgICAgc3RhdHMuaW5zZXJ0aW9ucyArPSBpbnNlcnRpb25zO1xuICAgICAgICAgIHN0YXRzLmRlbGV0aW9ucyArPSBkZWxldGlvbnM7XG4gICAgICAgICAgc3RhdHMuZmlsZXMgKz0gMTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgcmV0dXJuIHN0YXRzO1xuICB9XG4gIC8qKiBEZXRlcm1pbmUgd2hldGhlciB0aGUgZmlsZSBuYW1lIHBhc3NlcyBib3RoIGluY2x1ZGUgYW5kIGV4Y2x1ZGUgY2hlY2tzLiAqL1xuICBwcml2YXRlIGNoZWNrTWF0Y2hBZ2FpbnN0SW5jbHVkZUFuZEV4Y2x1ZGUoZmlsZTogc3RyaW5nLCBpbmNsdWRlczogc3RyaW5nW10sIGV4Y2x1ZGVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiAoXG4gICAgICBtdWx0aW1hdGNoLmNhbGwodW5kZWZpbmVkLCBmaWxlLCBpbmNsdWRlcykubGVuZ3RoID49IDEgJiZcbiAgICAgIG11bHRpbWF0Y2guY2FsbCh1bmRlZmluZWQsIGZpbGUsIGV4Y2x1ZGVzKS5sZW5ndGggPT09IDBcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRHM0ZpbGVJbmNsdWRlQW5kRXhjbHVkZUxpc3RzKCkge1xuICAgIGNvbnN0IGFuZ3VsYXJSb2JvdEZpbGVQYXRoID0gam9pbih0aGlzLmdpdC5iYXNlRGlyLCAnLmdpdGh1Yi9hbmd1bGFyLXJvYm90LnltbCcpO1xuICAgIGlmICghZXhpc3RzU3luYyhhbmd1bGFyUm9ib3RGaWxlUGF0aCkpIHtcbiAgICAgIGRlYnVnKCdObyBhbmd1bGFyIHJvYm90IGNvbmZpZ3VyYXRpb24gZmlsZSBleGlzdHMsIHNraXBwaW5nLicpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8qKiBUaGUgY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciB0aGUgYW5ndWxhciByb2JvdC4gKi9cbiAgICBjb25zdCByb2JvdENvbmZpZyA9IHBhcnNlWWFtbChyZWFkRmlsZVN5bmMoYW5ndWxhclJvYm90RmlsZVBhdGgpLnRvU3RyaW5nKCkpO1xuICAgIC8qKiBUaGUgZmlsZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIGczIHN5bmMuICovXG4gICAgY29uc3QgaW5jbHVkZTogc3RyaW5nW10gPSByb2JvdENvbmZpZz8ubWVyZ2U/LmczU3RhdHVzPy5pbmNsdWRlIHx8IFtdO1xuICAgIC8qKiBUaGUgZmlsZXMgdG8gYmUgZXhwZWN0ZWQgaW4gdGhlIGczIHN5bmMuICovXG4gICAgY29uc3QgZXhjbHVkZTogc3RyaW5nW10gPSByb2JvdENvbmZpZz8ubWVyZ2U/LmczU3RhdHVzPy5leGNsdWRlIHx8IFtdO1xuXG4gICAgaWYgKGluY2x1ZGUubGVuZ3RoID09PSAwICYmIGV4Y2x1ZGUubGVuZ3RoID09PSAwKSB7XG4gICAgICBkZWJ1ZygnTm8gZzNTdGF0dXMgaW5jbHVkZSBvciBleGNsdWRlIGxpc3RzIGFyZSBkZWZpbmVkIGluIHRoZSBhbmd1bGFyIHJvYm90IGNvbmZpZ3VyYXRpb24nKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7aW5jbHVkZSwgZXhjbHVkZX07XG4gIH1cblxuICBwcml2YXRlIGdldExhdGVzdFNoYXMoKSB7XG4gICAgLyoqIFRoZSBsYXRlc3Qgc2hhIGZvciB0aGUgZzMgYnJhbmNoLiAqL1xuICAgIGNvbnN0IGczID0gdGhpcy5nZXRTaGFGb3JCcmFuY2hMYXRlc3QoJ2czJyk7XG4gICAgLyoqIFRoZSBsYXRlc3Qgc2hhIGZvciB0aGUgbWFpbiBicmFuY2guICovXG4gICAgY29uc3QgbWFpbiA9IHRoaXMuZ2V0U2hhRm9yQnJhbmNoTGF0ZXN0KHRoaXMuZ2l0Lm1haW5CcmFuY2hOYW1lKTtcblxuICAgIGlmIChnMyA9PT0gbnVsbCB8fCBtYWluID09PSBudWxsKSB7XG4gICAgICBkZWJ1ZyhgRWl0aGVyIHRoZSBnMyBvciAke3RoaXMuZ2l0Lm1haW5CcmFuY2hOYW1lfSB3YXMgdW5hYmxlIHRvIGJlIHJldHJpZXZlZGApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtnMywgbWFpbn07XG4gIH1cbn1cbiJdfQ==