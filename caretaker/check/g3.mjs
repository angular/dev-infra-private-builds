/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { existsSync, readFileSync } from 'fs';
import * as multimatch from 'multimatch';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import { bold, debug, info } from '../../utils/console';
import { BaseModule } from './base';
export class G3Module extends BaseModule {
    retrieveData() {
        return __awaiter(this, void 0, void 0, function* () {
            const toCopyToG3 = this.getG3FileIncludeAndExcludeLists();
            const latestSha = this.getLatestShas();
            if (toCopyToG3 === null || latestSha === null) {
                return;
            }
            return this.getDiffStats(latestSha.g3, latestSha.master, toCopyToG3.include, toCopyToG3.exclude);
        });
    }
    printToTerminal() {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield this.data;
            if (!stats) {
                return;
            }
            info.group(bold('g3 branch check'));
            if (stats.files === 0) {
                info(`${stats.commits} commits between g3 and master`);
                info('✅  No sync is needed at this time');
            }
            else {
                info(`${stats.files} files changed, ${stats.insertions} insertions(+), ${stats.deletions} ` +
                    `deletions(-) from ${stats.commits} commits will be included in the next sync`);
            }
            info.groupEnd();
            info();
        });
    }
    /** Fetch and retrieve the latest sha for a specific branch. */
    getShaForBranchLatest(branch) {
        const { owner, name } = this.git.remoteConfig;
        /** The result fo the fetch command. */
        const fetchResult = this.git.runGraceful(['fetch', '-q', `https://github.com/${owner}/${name}.git`, branch]);
        if (fetchResult.status !== 0 &&
            fetchResult.stderr.includes(`couldn't find remote ref ${branch}`)) {
            debug(`No '${branch}' branch exists on upstream, skipping.`);
            return null;
        }
        return this.git.runGraceful(['rev-parse', 'FETCH_HEAD']).stdout.trim();
    }
    /**
     * Get git diff stats between master and g3, for all files and filtered to only g3 affecting
     * files.
     */
    getDiffStats(g3Ref, masterRef, includeFiles, excludeFiles) {
        /** The diff stats to be returned. */
        const stats = {
            insertions: 0,
            deletions: 0,
            files: 0,
            commits: 0,
        };
        // Determine the number of commits between master and g3 refs. */
        stats.commits =
            parseInt(this.git.run(['rev-list', '--count', `${g3Ref}..${masterRef}`]).stdout, 10);
        // Get the numstat information between master and g3
        this.git.run(['diff', `${g3Ref}...${masterRef}`, '--numstat'])
            .stdout
            // Remove the extra space after git's output.
            .trim()
            // Split each line of git output into array
            .split('\n')
            // Split each line from the git output into components parts: insertions,
            // deletions and file name respectively
            .map(line => line.trim().split('\t'))
            // Parse number value from the insertions and deletions values
            // Example raw line input:
            //   10\t5\tsrc/file/name.ts
            .map(line => [Number(line[0]), Number(line[1]), line[2]])
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
        var _a, _b, _c, _d;
        const angularRobotFilePath = join(this.git.baseDir, '.github/angular-robot.yml');
        if (!existsSync(angularRobotFilePath)) {
            debug('No angular robot configuration file exists, skipping.');
            return null;
        }
        /** The configuration defined for the angular robot. */
        const robotConfig = parseYaml(readFileSync(angularRobotFilePath).toString());
        /** The files to be included in the g3 sync. */
        const include = ((_b = (_a = robotConfig === null || robotConfig === void 0 ? void 0 : robotConfig.merge) === null || _a === void 0 ? void 0 : _a.g3Status) === null || _b === void 0 ? void 0 : _b.include) || [];
        /** The files to be expected in the g3 sync. */
        const exclude = ((_d = (_c = robotConfig === null || robotConfig === void 0 ? void 0 : robotConfig.merge) === null || _c === void 0 ? void 0 : _c.g3Status) === null || _d === void 0 ? void 0 : _d.exclude) || [];
        if (include.length === 0 && exclude.length === 0) {
            debug('No g3Status include or exclude lists are defined in the angular robot configuration');
            return null;
        }
        return { include, exclude };
    }
    getLatestShas() {
        /** The latest sha for the g3 branch. */
        const g3 = this.getShaForBranchLatest('g3');
        /** The latest sha for the master branch. */
        const master = this.getShaForBranchLatest('master');
        if (g3 === null || master === null) {
            debug('Either the g3 or master was unable to be retrieved');
            return null;
        }
        return { g3, master };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZzMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2czLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBQyxNQUFNLElBQUksQ0FBQztBQUM1QyxPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQztBQUN6QyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzFCLE9BQU8sRUFBQyxLQUFLLElBQUksU0FBUyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFTLElBQUksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRTdELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFVbEMsTUFBTSxPQUFPLFFBQVMsU0FBUSxVQUE0QjtJQUNsRCxZQUFZOztZQUNoQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztZQUMxRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFdkMsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7Z0JBQzdDLE9BQU87YUFDUjtZQUVELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FDcEIsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlFLENBQUM7S0FBQTtJQUVLLGVBQWU7O1lBQ25CLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQztZQUM5QixJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLE9BQU87YUFDUjtZQUNELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUNwQyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO2dCQUNyQixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxnQ0FBZ0MsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQzthQUMzQztpQkFBTTtnQkFDTCxJQUFJLENBQ0EsR0FBRyxLQUFLLENBQUMsS0FBSyxtQkFBbUIsS0FBSyxDQUFDLFVBQVUsbUJBQW1CLEtBQUssQ0FBQyxTQUFTLEdBQUc7b0JBQ3RGLHFCQUFxQixLQUFLLENBQUMsT0FBTyw0Q0FBNEMsQ0FBQyxDQUFDO2FBQ3JGO1lBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLElBQUksRUFBRSxDQUFDO1FBQ1QsQ0FBQztLQUFBO0lBRUQsK0RBQStEO0lBQ3ZELHFCQUFxQixDQUFDLE1BQWM7UUFDMUMsTUFBTSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztRQUM1Qyx1Q0FBdUM7UUFDdkMsTUFBTSxXQUFXLEdBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixLQUFLLElBQUksSUFBSSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUU3RixJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUN4QixXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsTUFBTSxFQUFFLENBQUMsRUFBRTtZQUNyRSxLQUFLLENBQUMsT0FBTyxNQUFNLHdDQUF3QyxDQUFDLENBQUM7WUFDN0QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekUsQ0FBQztJQUVEOzs7T0FHRztJQUNLLFlBQVksQ0FDaEIsS0FBYSxFQUFFLFNBQWlCLEVBQUUsWUFBc0IsRUFBRSxZQUFzQjtRQUNsRixxQ0FBcUM7UUFDckMsTUFBTSxLQUFLLEdBQUc7WUFDWixVQUFVLEVBQUUsQ0FBQztZQUNiLFNBQVMsRUFBRSxDQUFDO1lBQ1osS0FBSyxFQUFFLENBQUM7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNYLENBQUM7UUFFRixpRUFBaUU7UUFDakUsS0FBSyxDQUFDLE9BQU87WUFDVCxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQUcsS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFekYsb0RBQW9EO1FBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsS0FBSyxNQUFNLFNBQVMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ3pELE1BQU07WUFDUCw2Q0FBNkM7YUFDNUMsSUFBSSxFQUFFO1lBQ1AsMkNBQTJDO2FBQzFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDWix5RUFBeUU7WUFDekUsdUNBQXVDO2FBQ3RDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckMsOERBQThEO1lBQzlELDBCQUEwQjtZQUMxQiw0QkFBNEI7YUFDM0IsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBNkIsQ0FBQztZQUNyRix1RUFBdUU7WUFDdkUsd0VBQXdFO2FBQ3ZFLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFO1lBQzdDLElBQUksSUFBSSxDQUFDLGtDQUFrQyxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLEVBQUU7Z0JBQ2pGLEtBQUssQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDO2dCQUMvQixLQUFLLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQztnQkFDN0IsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7YUFDbEI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNQLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELDhFQUE4RTtJQUN0RSxrQ0FBa0MsQ0FBQyxJQUFZLEVBQUUsUUFBa0IsRUFBRSxRQUFrQjtRQUM3RixPQUFPLENBQ0gsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQ3RELFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUdPLCtCQUErQjs7UUFDckMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7WUFDckMsS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7WUFDL0QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELHVEQUF1RDtRQUN2RCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM3RSwrQ0FBK0M7UUFDL0MsTUFBTSxPQUFPLEdBQWEsQ0FBQSxNQUFBLE1BQUEsV0FBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLEtBQUssMENBQUUsUUFBUSwwQ0FBRSxPQUFPLEtBQUksRUFBRSxDQUFDO1FBQ3RFLCtDQUErQztRQUMvQyxNQUFNLE9BQU8sR0FBYSxDQUFBLE1BQUEsTUFBQSxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsS0FBSywwQ0FBRSxRQUFRLDBDQUFFLE9BQU8sS0FBSSxFQUFFLENBQUM7UUFFdEUsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNoRCxLQUFLLENBQUMscUZBQXFGLENBQUMsQ0FBQztZQUM3RixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsT0FBTyxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQztJQUM1QixDQUFDO0lBRU8sYUFBYTtRQUNuQix3Q0FBd0M7UUFDeEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLDRDQUE0QztRQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFcEQsSUFBSSxFQUFFLEtBQUssSUFBSSxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDbEMsS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7WUFDNUQsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDdEIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBtdWx0aW1hdGNoIGZyb20gJ211bHRpbWF0Y2gnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7cGFyc2UgYXMgcGFyc2VZYW1sfSBmcm9tICd5YW1sJztcbmltcG9ydCB7Ym9sZCwgZGVidWcsIGVycm9yLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtCYXNlTW9kdWxlfSBmcm9tICcuL2Jhc2UnO1xuXG4vKiogSW5mb3JtYXRpb24gZXhwcmVzc2luZyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBtYXN0ZXIgYW5kIGczIGJyYW5jaGVzICovXG5leHBvcnQgaW50ZXJmYWNlIEczU3RhdHNEYXRhIHtcbiAgaW5zZXJ0aW9uczogbnVtYmVyO1xuICBkZWxldGlvbnM6IG51bWJlcjtcbiAgZmlsZXM6IG51bWJlcjtcbiAgY29tbWl0czogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgRzNNb2R1bGUgZXh0ZW5kcyBCYXNlTW9kdWxlPEczU3RhdHNEYXRhfHZvaWQ+IHtcbiAgYXN5bmMgcmV0cmlldmVEYXRhKCkge1xuICAgIGNvbnN0IHRvQ29weVRvRzMgPSB0aGlzLmdldEczRmlsZUluY2x1ZGVBbmRFeGNsdWRlTGlzdHMoKTtcbiAgICBjb25zdCBsYXRlc3RTaGEgPSB0aGlzLmdldExhdGVzdFNoYXMoKTtcblxuICAgIGlmICh0b0NvcHlUb0czID09PSBudWxsIHx8IGxhdGVzdFNoYSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmdldERpZmZTdGF0cyhcbiAgICAgICAgbGF0ZXN0U2hhLmczLCBsYXRlc3RTaGEubWFzdGVyLCB0b0NvcHlUb0czLmluY2x1ZGUsIHRvQ29weVRvRzMuZXhjbHVkZSk7XG4gIH1cblxuICBhc3luYyBwcmludFRvVGVybWluYWwoKSB7XG4gICAgY29uc3Qgc3RhdHMgPSBhd2FpdCB0aGlzLmRhdGE7XG4gICAgaWYgKCFzdGF0cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbmZvLmdyb3VwKGJvbGQoJ2czIGJyYW5jaCBjaGVjaycpKTtcbiAgICBpZiAoc3RhdHMuZmlsZXMgPT09IDApIHtcbiAgICAgIGluZm8oYCR7c3RhdHMuY29tbWl0c30gY29tbWl0cyBiZXR3ZWVuIGczIGFuZCBtYXN0ZXJgKTtcbiAgICAgIGluZm8oJ+KchSAgTm8gc3luYyBpcyBuZWVkZWQgYXQgdGhpcyB0aW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZm8oXG4gICAgICAgICAgYCR7c3RhdHMuZmlsZXN9IGZpbGVzIGNoYW5nZWQsICR7c3RhdHMuaW5zZXJ0aW9uc30gaW5zZXJ0aW9ucygrKSwgJHtzdGF0cy5kZWxldGlvbnN9IGAgK1xuICAgICAgICAgIGBkZWxldGlvbnMoLSkgZnJvbSAke3N0YXRzLmNvbW1pdHN9IGNvbW1pdHMgd2lsbCBiZSBpbmNsdWRlZCBpbiB0aGUgbmV4dCBzeW5jYCk7XG4gICAgfVxuICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICBpbmZvKCk7XG4gIH1cblxuICAvKiogRmV0Y2ggYW5kIHJldHJpZXZlIHRoZSBsYXRlc3Qgc2hhIGZvciBhIHNwZWNpZmljIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBnZXRTaGFGb3JCcmFuY2hMYXRlc3QoYnJhbmNoOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuICAgIC8qKiBUaGUgcmVzdWx0IGZvIHRoZSBmZXRjaCBjb21tYW5kLiAqL1xuICAgIGNvbnN0IGZldGNoUmVzdWx0ID1cbiAgICAgICAgdGhpcy5naXQucnVuR3JhY2VmdWwoWydmZXRjaCcsICctcScsIGBodHRwczovL2dpdGh1Yi5jb20vJHtvd25lcn0vJHtuYW1lfS5naXRgLCBicmFuY2hdKTtcblxuICAgIGlmIChmZXRjaFJlc3VsdC5zdGF0dXMgIT09IDAgJiZcbiAgICAgICAgZmV0Y2hSZXN1bHQuc3RkZXJyLmluY2x1ZGVzKGBjb3VsZG4ndCBmaW5kIHJlbW90ZSByZWYgJHticmFuY2h9YCkpIHtcbiAgICAgIGRlYnVnKGBObyAnJHticmFuY2h9JyBicmFuY2ggZXhpc3RzIG9uIHVwc3RyZWFtLCBza2lwcGluZy5gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5naXQucnVuR3JhY2VmdWwoWydyZXYtcGFyc2UnLCAnRkVUQ0hfSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnaXQgZGlmZiBzdGF0cyBiZXR3ZWVuIG1hc3RlciBhbmQgZzMsIGZvciBhbGwgZmlsZXMgYW5kIGZpbHRlcmVkIHRvIG9ubHkgZzMgYWZmZWN0aW5nXG4gICAqIGZpbGVzLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXREaWZmU3RhdHMoXG4gICAgICBnM1JlZjogc3RyaW5nLCBtYXN0ZXJSZWY6IHN0cmluZywgaW5jbHVkZUZpbGVzOiBzdHJpbmdbXSwgZXhjbHVkZUZpbGVzOiBzdHJpbmdbXSkge1xuICAgIC8qKiBUaGUgZGlmZiBzdGF0cyB0byBiZSByZXR1cm5lZC4gKi9cbiAgICBjb25zdCBzdGF0cyA9IHtcbiAgICAgIGluc2VydGlvbnM6IDAsXG4gICAgICBkZWxldGlvbnM6IDAsXG4gICAgICBmaWxlczogMCxcbiAgICAgIGNvbW1pdHM6IDAsXG4gICAgfTtcblxuICAgIC8vIERldGVybWluZSB0aGUgbnVtYmVyIG9mIGNvbW1pdHMgYmV0d2VlbiBtYXN0ZXIgYW5kIGczIHJlZnMuICovXG4gICAgc3RhdHMuY29tbWl0cyA9XG4gICAgICAgIHBhcnNlSW50KHRoaXMuZ2l0LnJ1bihbJ3Jldi1saXN0JywgJy0tY291bnQnLCBgJHtnM1JlZn0uLiR7bWFzdGVyUmVmfWBdKS5zdGRvdXQsIDEwKTtcblxuICAgIC8vIEdldCB0aGUgbnVtc3RhdCBpbmZvcm1hdGlvbiBiZXR3ZWVuIG1hc3RlciBhbmQgZzNcbiAgICB0aGlzLmdpdC5ydW4oWydkaWZmJywgYCR7ZzNSZWZ9Li4uJHttYXN0ZXJSZWZ9YCwgJy0tbnVtc3RhdCddKVxuICAgICAgICAuc3Rkb3V0XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZXh0cmEgc3BhY2UgYWZ0ZXIgZ2l0J3Mgb3V0cHV0LlxuICAgICAgICAudHJpbSgpXG4gICAgICAgIC8vIFNwbGl0IGVhY2ggbGluZSBvZiBnaXQgb3V0cHV0IGludG8gYXJyYXlcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAvLyBTcGxpdCBlYWNoIGxpbmUgZnJvbSB0aGUgZ2l0IG91dHB1dCBpbnRvIGNvbXBvbmVudHMgcGFydHM6IGluc2VydGlvbnMsXG4gICAgICAgIC8vIGRlbGV0aW9ucyBhbmQgZmlsZSBuYW1lIHJlc3BlY3RpdmVseVxuICAgICAgICAubWFwKGxpbmUgPT4gbGluZS50cmltKCkuc3BsaXQoJ1xcdCcpKVxuICAgICAgICAvLyBQYXJzZSBudW1iZXIgdmFsdWUgZnJvbSB0aGUgaW5zZXJ0aW9ucyBhbmQgZGVsZXRpb25zIHZhbHVlc1xuICAgICAgICAvLyBFeGFtcGxlIHJhdyBsaW5lIGlucHV0OlxuICAgICAgICAvLyAgIDEwXFx0NVxcdHNyYy9maWxlL25hbWUudHNcbiAgICAgICAgLm1hcChsaW5lID0+IFtOdW1iZXIobGluZVswXSksIE51bWJlcihsaW5lWzFdKSwgbGluZVsyXV0gYXMgW251bWJlciwgbnVtYmVyLCBzdHJpbmddKVxuICAgICAgICAvLyBBZGQgZWFjaCBsaW5lJ3MgdmFsdWUgdG8gdGhlIGRpZmYgc3RhdHMsIGFuZCBjb25kaXRpb25hbGx5IHRvIHRoZSBnM1xuICAgICAgICAvLyBzdGF0cyBhcyB3ZWxsIGlmIHRoZSBmaWxlIG5hbWUgaXMgaW5jbHVkZWQgaW4gdGhlIGZpbGVzIHN5bmNlZCB0byBnMy5cbiAgICAgICAgLmZvckVhY2goKFtpbnNlcnRpb25zLCBkZWxldGlvbnMsIGZpbGVOYW1lXSkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmNoZWNrTWF0Y2hBZ2FpbnN0SW5jbHVkZUFuZEV4Y2x1ZGUoZmlsZU5hbWUsIGluY2x1ZGVGaWxlcywgZXhjbHVkZUZpbGVzKSkge1xuICAgICAgICAgICAgc3RhdHMuaW5zZXJ0aW9ucyArPSBpbnNlcnRpb25zO1xuICAgICAgICAgICAgc3RhdHMuZGVsZXRpb25zICs9IGRlbGV0aW9ucztcbiAgICAgICAgICAgIHN0YXRzLmZpbGVzICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICByZXR1cm4gc3RhdHM7XG4gIH1cbiAgLyoqIERldGVybWluZSB3aGV0aGVyIHRoZSBmaWxlIG5hbWUgcGFzc2VzIGJvdGggaW5jbHVkZSBhbmQgZXhjbHVkZSBjaGVja3MuICovXG4gIHByaXZhdGUgY2hlY2tNYXRjaEFnYWluc3RJbmNsdWRlQW5kRXhjbHVkZShmaWxlOiBzdHJpbmcsIGluY2x1ZGVzOiBzdHJpbmdbXSwgZXhjbHVkZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgbXVsdGltYXRjaC5jYWxsKHVuZGVmaW5lZCwgZmlsZSwgaW5jbHVkZXMpLmxlbmd0aCA+PSAxICYmXG4gICAgICAgIG11bHRpbWF0Y2guY2FsbCh1bmRlZmluZWQsIGZpbGUsIGV4Y2x1ZGVzKS5sZW5ndGggPT09IDApO1xuICB9XG5cblxuICBwcml2YXRlIGdldEczRmlsZUluY2x1ZGVBbmRFeGNsdWRlTGlzdHMoKSB7XG4gICAgY29uc3QgYW5ndWxhclJvYm90RmlsZVBhdGggPSBqb2luKHRoaXMuZ2l0LmJhc2VEaXIsICcuZ2l0aHViL2FuZ3VsYXItcm9ib3QueW1sJyk7XG4gICAgaWYgKCFleGlzdHNTeW5jKGFuZ3VsYXJSb2JvdEZpbGVQYXRoKSkge1xuICAgICAgZGVidWcoJ05vIGFuZ3VsYXIgcm9ib3QgY29uZmlndXJhdGlvbiBmaWxlIGV4aXN0cywgc2tpcHBpbmcuJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGRlZmluZWQgZm9yIHRoZSBhbmd1bGFyIHJvYm90LiAqL1xuICAgIGNvbnN0IHJvYm90Q29uZmlnID0gcGFyc2VZYW1sKHJlYWRGaWxlU3luYyhhbmd1bGFyUm9ib3RGaWxlUGF0aCkudG9TdHJpbmcoKSk7XG4gICAgLyoqIFRoZSBmaWxlcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgZzMgc3luYy4gKi9cbiAgICBjb25zdCBpbmNsdWRlOiBzdHJpbmdbXSA9IHJvYm90Q29uZmlnPy5tZXJnZT8uZzNTdGF0dXM/LmluY2x1ZGUgfHwgW107XG4gICAgLyoqIFRoZSBmaWxlcyB0byBiZSBleHBlY3RlZCBpbiB0aGUgZzMgc3luYy4gKi9cbiAgICBjb25zdCBleGNsdWRlOiBzdHJpbmdbXSA9IHJvYm90Q29uZmlnPy5tZXJnZT8uZzNTdGF0dXM/LmV4Y2x1ZGUgfHwgW107XG5cbiAgICBpZiAoaW5jbHVkZS5sZW5ndGggPT09IDAgJiYgZXhjbHVkZS5sZW5ndGggPT09IDApIHtcbiAgICAgIGRlYnVnKCdObyBnM1N0YXR1cyBpbmNsdWRlIG9yIGV4Y2x1ZGUgbGlzdHMgYXJlIGRlZmluZWQgaW4gdGhlIGFuZ3VsYXIgcm9ib3QgY29uZmlndXJhdGlvbicpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtpbmNsdWRlLCBleGNsdWRlfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TGF0ZXN0U2hhcygpIHtcbiAgICAvKiogVGhlIGxhdGVzdCBzaGEgZm9yIHRoZSBnMyBicmFuY2guICovXG4gICAgY29uc3QgZzMgPSB0aGlzLmdldFNoYUZvckJyYW5jaExhdGVzdCgnZzMnKTtcbiAgICAvKiogVGhlIGxhdGVzdCBzaGEgZm9yIHRoZSBtYXN0ZXIgYnJhbmNoLiAqL1xuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMuZ2V0U2hhRm9yQnJhbmNoTGF0ZXN0KCdtYXN0ZXInKTtcblxuICAgIGlmIChnMyA9PT0gbnVsbCB8fCBtYXN0ZXIgPT09IG51bGwpIHtcbiAgICAgIGRlYnVnKCdFaXRoZXIgdGhlIGczIG9yIG1hc3RlciB3YXMgdW5hYmxlIHRvIGJlIHJldHJpZXZlZCcpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtnMywgbWFzdGVyfTtcbiAgfVxufVxuIl19