"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDateStamp = exports.RenderContext = void 0;
const config_1 = require("../../commit-message/config");
/** List of types to be included in the release notes. */
const typesToIncludeInReleaseNotes = Object.values(config_1.COMMIT_TYPES)
    .filter((type) => type.releaseNotesLevel === config_1.ReleaseNotesLevel.Visible)
    .map((type) => type.name);
/** Context class used for rendering release notes. */
class RenderContext {
    constructor(data) {
        this.data = data;
        /** An array of group names in sort order if defined. */
        this.groupOrder = this.data.groupOrder || [];
        /** An array of scopes to hide from the release entry output. */
        this.hiddenScopes = this.data.hiddenScopes || [];
        /** The title of the release, or `false` if no title should be used. */
        this.title = this.data.title;
        /** An array of commits in the release period. */
        this.commits = this.data.commits;
        /** The version of the release. */
        this.version = this.data.version;
        /** The date stamp string for use in the release notes entry. */
        this.dateStamp = buildDateStamp(this.data.date);
    }
    /**
     * Organizes and sorts the commits into groups of commits.
     *
     * Groups are sorted either by default `Array.sort` order, or using the provided group order from
     * the configuration. Commits are order in the same order within each groups commit list as they
     * appear in the provided list of commits.
     * */
    asCommitGroups(commits) {
        /** The discovered groups to organize into. */
        const groups = new Map();
        // Place each commit in the list into its group.
        commits.forEach((commit) => {
            const key = commit.npmScope ? `${commit.npmScope}/${commit.scope}` : commit.scope;
            const groupCommits = groups.get(key) || [];
            groups.set(key, groupCommits);
            groupCommits.push(commit);
        });
        /**
         * Array of CommitGroups containing the discovered commit groups. Sorted in alphanumeric order
         * of the group title.
         */
        const commitGroups = Array.from(groups.entries())
            .map(([title, commits]) => ({ title, commits }))
            .sort((a, b) => (a.title > b.title ? 1 : a.title < b.title ? -1 : 0));
        // If the configuration provides a sorting order, updated the sorted list of group keys to
        // satisfy the order of the groups provided in the list with any groups not found in the list at
        // the end of the sorted list.
        if (this.groupOrder.length) {
            for (const groupTitle of this.groupOrder.reverse()) {
                const currentIdx = commitGroups.findIndex((k) => k.title === groupTitle);
                if (currentIdx !== -1) {
                    const removedGroups = commitGroups.splice(currentIdx, 1);
                    commitGroups.splice(0, 0, ...removedGroups);
                }
            }
        }
        return commitGroups;
    }
    /**
     * A filter function for filtering a list of commits to only include commits which should appear
     * in release notes.
     */
    includeInReleaseNotes() {
        return (commit) => {
            if (!typesToIncludeInReleaseNotes.includes(commit.type)) {
                return false;
            }
            if (this.hiddenScopes.includes(commit.scope)) {
                return false;
            }
            return true;
        };
    }
    /**
     * A filter function for filtering a list of commits to only include commits which contain a
     * truthy value, or for arrays an array with 1 or more elements, for the provided field.
     */
    contains(field) {
        return (commit) => {
            const fieldValue = commit[field];
            if (!fieldValue) {
                return false;
            }
            if (Array.isArray(fieldValue) && fieldValue.length === 0) {
                return false;
            }
            return true;
        };
    }
    /**
     * A filter function for filtering a list of commits to only include commits which contain a
     * unique value for the provided field across all commits in the list.
     */
    unique(field) {
        const set = new Set();
        return (commit) => {
            const include = !set.has(commit[field]);
            set.add(commit[field]);
            return include;
        };
    }
    /**
     * Convert a commit object to a Markdown link.
     */
    commitToLink(commit) {
        const url = `https://github.com/${this.data.github.owner}/${this.data.github.name}/commit/${commit.hash}`;
        return `[${commit.shortHash}](${url})`;
    }
    /**
     * Convert a pull request number to a Markdown link.
     */
    pullRequestToLink(prNumber) {
        const url = `https://github.com/${this.data.github.owner}/${this.data.github.name}/pull/${prNumber}`;
        return `[#${prNumber}](${url})`;
    }
    /**
     * Transform a commit message header by replacing the parenthesized pull request reference at the
     * end of the line (which is added by merge tooling) to a Markdown link.
     */
    replaceCommitHeaderPullRequestNumber(header) {
        return header.replace(/\(#(\d+)\)$/, (_, g) => `(${this.pullRequestToLink(+g)})`);
    }
}
exports.RenderContext = RenderContext;
/**
 * Builds a date stamp for stamping in release notes.
 *
 * Uses the current date, or a provided date in the format of YYYY-MM-DD, i.e. 1970-11-05.
 */
function buildDateStamp(date = new Date()) {
    const year = `${date.getFullYear()}`;
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return [year, month, day].join('-');
}
exports.buildDateStamp = buildDateStamp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQTRFO0FBSzVFLHlEQUF5RDtBQUN6RCxNQUFNLDRCQUE0QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMscUJBQVksQ0FBQztLQUM3RCxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSywwQkFBaUIsQ0FBQyxPQUFPLENBQUM7S0FDdEUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFhNUIsc0RBQXNEO0FBQ3RELE1BQWEsYUFBYTtJQWN4QixZQUE2QixJQUF1QjtRQUF2QixTQUFJLEdBQUosSUFBSSxDQUFtQjtRQWJwRCx3REFBd0Q7UUFDdkMsZUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztRQUN6RCxnRUFBZ0U7UUFDL0MsaUJBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7UUFDN0QsdUVBQXVFO1FBQzlELFVBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNqQyxpREFBaUQ7UUFDeEMsWUFBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JDLGtDQUFrQztRQUN6QixZQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckMsZ0VBQWdFO1FBQ3ZELGNBQVMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVHLENBQUM7SUFFeEQ7Ozs7OztTQU1LO0lBQ0wsY0FBYyxDQUFDLE9BQTJCO1FBQ3hDLDhDQUE4QztRQUM5QyxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBOEIsQ0FBQztRQUVyRCxnREFBZ0Q7UUFDaEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3pCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDbEYsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDM0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDOUIsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztRQUVIOzs7V0FHRztRQUNILE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7YUFDN0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV4RSwwRkFBMEY7UUFDMUYsZ0dBQWdHO1FBQ2hHLDhCQUE4QjtRQUM5QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQzFCLEtBQUssTUFBTSxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDbEQsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsQ0FBQztnQkFDekUsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQ3JCLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN6RCxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxhQUFhLENBQUMsQ0FBQztpQkFDN0M7YUFDRjtTQUNGO1FBQ0QsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILHFCQUFxQjtRQUNuQixPQUFPLENBQUMsTUFBd0IsRUFBRSxFQUFFO1lBQ2xDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN2RCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzVDLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7O09BR0c7SUFDSCxRQUFRLENBQUMsS0FBNkI7UUFDcEMsT0FBTyxDQUFDLE1BQXdCLEVBQUUsRUFBRTtZQUNsQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDZixPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4RCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLEtBQTZCO1FBQ2xDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxNQUF3QixFQUFFLEVBQUU7WUFDbEMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdkIsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOztPQUVHO0lBQ0gsWUFBWSxDQUFDLE1BQXdCO1FBQ25DLE1BQU0sR0FBRyxHQUFHLHNCQUFzQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxXQUFXLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxRyxPQUFPLElBQUksTUFBTSxDQUFDLFNBQVMsS0FBSyxHQUFHLEdBQUcsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxpQkFBaUIsQ0FBQyxRQUFnQjtRQUNoQyxNQUFNLEdBQUcsR0FBRyxzQkFBc0IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxRQUFRLEVBQUUsQ0FBQztRQUNyRyxPQUFPLEtBQUssUUFBUSxLQUFLLEdBQUcsR0FBRyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxvQ0FBb0MsQ0FBQyxNQUFjO1FBQ2pELE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwRixDQUFDO0NBQ0Y7QUFqSUQsc0NBaUlDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7SUFDOUMsTUFBTSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztJQUNyQyxNQUFNLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELE1BQU0sR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUVqRCxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQU5ELHdDQU1DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q09NTUlUX1RZUEVTLCBSZWxlYXNlTm90ZXNMZXZlbH0gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvY29uZmlnJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge1JlbGVhc2VOb3Rlc0NvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuLyoqIExpc3Qgb2YgdHlwZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIHJlbGVhc2Ugbm90ZXMuICovXG5jb25zdCB0eXBlc1RvSW5jbHVkZUluUmVsZWFzZU5vdGVzID0gT2JqZWN0LnZhbHVlcyhDT01NSVRfVFlQRVMpXG4gIC5maWx0ZXIoKHR5cGUpID0+IHR5cGUucmVsZWFzZU5vdGVzTGV2ZWwgPT09IFJlbGVhc2VOb3Rlc0xldmVsLlZpc2libGUpXG4gIC5tYXAoKHR5cGUpID0+IHR5cGUubmFtZSk7XG5cbi8qKiBEYXRhIHVzZWQgZm9yIGNvbnRleHQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyQ29udGV4dERhdGEge1xuICB0aXRsZTogc3RyaW5nIHwgZmFsc2U7XG4gIGdyb3VwT3JkZXI/OiBSZWxlYXNlTm90ZXNDb25maWdbJ2dyb3VwT3JkZXInXTtcbiAgaGlkZGVuU2NvcGVzPzogUmVsZWFzZU5vdGVzQ29uZmlnWydoaWRkZW5TY29wZXMnXTtcbiAgZGF0ZT86IERhdGU7XG4gIGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXTtcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBnaXRodWI6IEdpdGh1YkNvbmZpZztcbn1cblxuLyoqIENvbnRleHQgY2xhc3MgdXNlZCBmb3IgcmVuZGVyaW5nIHJlbGVhc2Ugbm90ZXMuICovXG5leHBvcnQgY2xhc3MgUmVuZGVyQ29udGV4dCB7XG4gIC8qKiBBbiBhcnJheSBvZiBncm91cCBuYW1lcyBpbiBzb3J0IG9yZGVyIGlmIGRlZmluZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgZ3JvdXBPcmRlciA9IHRoaXMuZGF0YS5ncm91cE9yZGVyIHx8IFtdO1xuICAvKiogQW4gYXJyYXkgb2Ygc2NvcGVzIHRvIGhpZGUgZnJvbSB0aGUgcmVsZWFzZSBlbnRyeSBvdXRwdXQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgaGlkZGVuU2NvcGVzID0gdGhpcy5kYXRhLmhpZGRlblNjb3BlcyB8fCBbXTtcbiAgLyoqIFRoZSB0aXRsZSBvZiB0aGUgcmVsZWFzZSwgb3IgYGZhbHNlYCBpZiBubyB0aXRsZSBzaG91bGQgYmUgdXNlZC4gKi9cbiAgcmVhZG9ubHkgdGl0bGUgPSB0aGlzLmRhdGEudGl0bGU7XG4gIC8qKiBBbiBhcnJheSBvZiBjb21taXRzIGluIHRoZSByZWxlYXNlIHBlcmlvZC4gKi9cbiAgcmVhZG9ubHkgY29tbWl0cyA9IHRoaXMuZGF0YS5jb21taXRzO1xuICAvKiogVGhlIHZlcnNpb24gb2YgdGhlIHJlbGVhc2UuICovXG4gIHJlYWRvbmx5IHZlcnNpb24gPSB0aGlzLmRhdGEudmVyc2lvbjtcbiAgLyoqIFRoZSBkYXRlIHN0YW1wIHN0cmluZyBmb3IgdXNlIGluIHRoZSByZWxlYXNlIG5vdGVzIGVudHJ5LiAqL1xuICByZWFkb25seSBkYXRlU3RhbXAgPSBidWlsZERhdGVTdGFtcCh0aGlzLmRhdGEuZGF0ZSk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBkYXRhOiBSZW5kZXJDb250ZXh0RGF0YSkge31cblxuICAvKipcbiAgICogT3JnYW5pemVzIGFuZCBzb3J0cyB0aGUgY29tbWl0cyBpbnRvIGdyb3VwcyBvZiBjb21taXRzLlxuICAgKlxuICAgKiBHcm91cHMgYXJlIHNvcnRlZCBlaXRoZXIgYnkgZGVmYXVsdCBgQXJyYXkuc29ydGAgb3JkZXIsIG9yIHVzaW5nIHRoZSBwcm92aWRlZCBncm91cCBvcmRlciBmcm9tXG4gICAqIHRoZSBjb25maWd1cmF0aW9uLiBDb21taXRzIGFyZSBvcmRlciBpbiB0aGUgc2FtZSBvcmRlciB3aXRoaW4gZWFjaCBncm91cHMgY29tbWl0IGxpc3QgYXMgdGhleVxuICAgKiBhcHBlYXIgaW4gdGhlIHByb3ZpZGVkIGxpc3Qgb2YgY29tbWl0cy5cbiAgICogKi9cbiAgYXNDb21taXRHcm91cHMoY29tbWl0czogQ29tbWl0RnJvbUdpdExvZ1tdKSB7XG4gICAgLyoqIFRoZSBkaXNjb3ZlcmVkIGdyb3VwcyB0byBvcmdhbml6ZSBpbnRvLiAqL1xuICAgIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBDb21taXRGcm9tR2l0TG9nW10+KCk7XG5cbiAgICAvLyBQbGFjZSBlYWNoIGNvbW1pdCBpbiB0aGUgbGlzdCBpbnRvIGl0cyBncm91cC5cbiAgICBjb21taXRzLmZvckVhY2goKGNvbW1pdCkgPT4ge1xuICAgICAgY29uc3Qga2V5ID0gY29tbWl0Lm5wbVNjb3BlID8gYCR7Y29tbWl0Lm5wbVNjb3BlfS8ke2NvbW1pdC5zY29wZX1gIDogY29tbWl0LnNjb3BlO1xuICAgICAgY29uc3QgZ3JvdXBDb21taXRzID0gZ3JvdXBzLmdldChrZXkpIHx8IFtdO1xuICAgICAgZ3JvdXBzLnNldChrZXksIGdyb3VwQ29tbWl0cyk7XG4gICAgICBncm91cENvbW1pdHMucHVzaChjb21taXQpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2YgQ29tbWl0R3JvdXBzIGNvbnRhaW5pbmcgdGhlIGRpc2NvdmVyZWQgY29tbWl0IGdyb3Vwcy4gU29ydGVkIGluIGFscGhhbnVtZXJpYyBvcmRlclxuICAgICAqIG9mIHRoZSBncm91cCB0aXRsZS5cbiAgICAgKi9cbiAgICBjb25zdCBjb21taXRHcm91cHMgPSBBcnJheS5mcm9tKGdyb3Vwcy5lbnRyaWVzKCkpXG4gICAgICAubWFwKChbdGl0bGUsIGNvbW1pdHNdKSA9PiAoe3RpdGxlLCBjb21taXRzfSkpXG4gICAgICAuc29ydCgoYSwgYikgPT4gKGEudGl0bGUgPiBiLnRpdGxlID8gMSA6IGEudGl0bGUgPCBiLnRpdGxlID8gLTEgOiAwKSk7XG5cbiAgICAvLyBJZiB0aGUgY29uZmlndXJhdGlvbiBwcm92aWRlcyBhIHNvcnRpbmcgb3JkZXIsIHVwZGF0ZWQgdGhlIHNvcnRlZCBsaXN0IG9mIGdyb3VwIGtleXMgdG9cbiAgICAvLyBzYXRpc2Z5IHRoZSBvcmRlciBvZiB0aGUgZ3JvdXBzIHByb3ZpZGVkIGluIHRoZSBsaXN0IHdpdGggYW55IGdyb3VwcyBub3QgZm91bmQgaW4gdGhlIGxpc3QgYXRcbiAgICAvLyB0aGUgZW5kIG9mIHRoZSBzb3J0ZWQgbGlzdC5cbiAgICBpZiAodGhpcy5ncm91cE9yZGVyLmxlbmd0aCkge1xuICAgICAgZm9yIChjb25zdCBncm91cFRpdGxlIG9mIHRoaXMuZ3JvdXBPcmRlci5yZXZlcnNlKCkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudElkeCA9IGNvbW1pdEdyb3Vwcy5maW5kSW5kZXgoKGspID0+IGsudGl0bGUgPT09IGdyb3VwVGl0bGUpO1xuICAgICAgICBpZiAoY3VycmVudElkeCAhPT0gLTEpIHtcbiAgICAgICAgICBjb25zdCByZW1vdmVkR3JvdXBzID0gY29tbWl0R3JvdXBzLnNwbGljZShjdXJyZW50SWR4LCAxKTtcbiAgICAgICAgICBjb21taXRHcm91cHMuc3BsaWNlKDAsIDAsIC4uLnJlbW92ZWRHcm91cHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21taXRHcm91cHM7XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaCBzaG91bGQgYXBwZWFyXG4gICAqIGluIHJlbGVhc2Ugbm90ZXMuXG4gICAqL1xuICBpbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSB7XG4gICAgcmV0dXJuIChjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpID0+IHtcbiAgICAgIGlmICghdHlwZXNUb0luY2x1ZGVJblJlbGVhc2VOb3Rlcy5pbmNsdWRlcyhjb21taXQudHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5oaWRkZW5TY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgZmlsdGVyIGZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgYSBsaXN0IG9mIGNvbW1pdHMgdG8gb25seSBpbmNsdWRlIGNvbW1pdHMgd2hpY2ggY29udGFpbiBhXG4gICAqIHRydXRoeSB2YWx1ZSwgb3IgZm9yIGFycmF5cyBhbiBhcnJheSB3aXRoIDEgb3IgbW9yZSBlbGVtZW50cywgZm9yIHRoZSBwcm92aWRlZCBmaWVsZC5cbiAgICovXG4gIGNvbnRhaW5zKGZpZWxkOiBrZXlvZiBDb21taXRGcm9tR2l0TG9nKSB7XG4gICAgcmV0dXJuIChjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpID0+IHtcbiAgICAgIGNvbnN0IGZpZWxkVmFsdWUgPSBjb21taXRbZmllbGRdO1xuICAgICAgaWYgKCFmaWVsZFZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZmllbGRWYWx1ZSkgJiYgZmllbGRWYWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGZpbHRlciBmdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGEgbGlzdCBvZiBjb21taXRzIHRvIG9ubHkgaW5jbHVkZSBjb21taXRzIHdoaWNoIGNvbnRhaW4gYVxuICAgKiB1bmlxdWUgdmFsdWUgZm9yIHRoZSBwcm92aWRlZCBmaWVsZCBhY3Jvc3MgYWxsIGNvbW1pdHMgaW4gdGhlIGxpc3QuXG4gICAqL1xuICB1bmlxdWUoZmllbGQ6IGtleW9mIENvbW1pdEZyb21HaXRMb2cpIHtcbiAgICBjb25zdCBzZXQgPSBuZXcgU2V0PENvbW1pdEZyb21HaXRMb2dbdHlwZW9mIGZpZWxkXT4oKTtcbiAgICByZXR1cm4gKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykgPT4ge1xuICAgICAgY29uc3QgaW5jbHVkZSA9ICFzZXQuaGFzKGNvbW1pdFtmaWVsZF0pO1xuICAgICAgc2V0LmFkZChjb21taXRbZmllbGRdKTtcbiAgICAgIHJldHVybiBpbmNsdWRlO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIGNvbW1pdCBvYmplY3QgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgY29tbWl0VG9MaW5rKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3RoaXMuZGF0YS5naXRodWIub3duZXJ9LyR7dGhpcy5kYXRhLmdpdGh1Yi5uYW1lfS9jb21taXQvJHtjb21taXQuaGFzaH1gO1xuICAgIHJldHVybiBgWyR7Y29tbWl0LnNob3J0SGFzaH1dKCR7dXJsfSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBwdWxsIHJlcXVlc3QgbnVtYmVyIHRvIGEgTWFya2Rvd24gbGluay5cbiAgICovXG4gIHB1bGxSZXF1ZXN0VG9MaW5rKHByTnVtYmVyOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHt0aGlzLmRhdGEuZ2l0aHViLm93bmVyfS8ke3RoaXMuZGF0YS5naXRodWIubmFtZX0vcHVsbC8ke3ByTnVtYmVyfWA7XG4gICAgcmV0dXJuIGBbIyR7cHJOdW1iZXJ9XSgke3VybH0pYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gYSBjb21taXQgbWVzc2FnZSBoZWFkZXIgYnkgcmVwbGFjaW5nIHRoZSBwYXJlbnRoZXNpemVkIHB1bGwgcmVxdWVzdCByZWZlcmVuY2UgYXQgdGhlXG4gICAqIGVuZCBvZiB0aGUgbGluZSAod2hpY2ggaXMgYWRkZWQgYnkgbWVyZ2UgdG9vbGluZykgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgcmVwbGFjZUNvbW1pdEhlYWRlclB1bGxSZXF1ZXN0TnVtYmVyKGhlYWRlcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaGVhZGVyLnJlcGxhY2UoL1xcKCMoXFxkKylcXCkkLywgKF8sIGcpID0+IGAoJHt0aGlzLnB1bGxSZXF1ZXN0VG9MaW5rKCtnKX0pYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBkYXRlIHN0YW1wIGZvciBzdGFtcGluZyBpbiByZWxlYXNlIG5vdGVzLlxuICpcbiAqIFVzZXMgdGhlIGN1cnJlbnQgZGF0ZSwgb3IgYSBwcm92aWRlZCBkYXRlIGluIHRoZSBmb3JtYXQgb2YgWVlZWS1NTS1ERCwgaS5lLiAxOTcwLTExLTA1LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREYXRlU3RhbXAoZGF0ZSA9IG5ldyBEYXRlKCkpIHtcbiAgY29uc3QgeWVhciA9IGAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xuICBjb25zdCBtb250aCA9IGAke2RhdGUuZ2V0TW9udGgoKSArIDF9YC5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBkYXkgPSBgJHtkYXRlLmdldERhdGUoKX1gLnBhZFN0YXJ0KDIsICcwJyk7XG5cbiAgcmV0dXJuIFt5ZWFyLCBtb250aCwgZGF5XS5qb2luKCctJyk7XG59XG4iXX0=