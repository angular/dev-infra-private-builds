/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { COMMIT_TYPES, ReleaseNotesLevel } from '../../commit-message/config';
/** List of types to be included in the release notes. */
const typesToIncludeInReleaseNotes = Object.values(COMMIT_TYPES)
    .filter(type => type.releaseNotesLevel === ReleaseNotesLevel.Visible)
    .map(type => type.name);
/** Context class used for rendering release notes. */
export class RenderContext {
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
        commits.forEach(commit => {
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
            .sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);
        // If the configuration provides a sorting order, updated the sorted list of group keys to
        // satisfy the order of the groups provided in the list with any groups not found in the list at
        // the end of the sorted list.
        if (this.groupOrder.length) {
            for (const groupTitle of this.groupOrder.reverse()) {
                const currentIdx = commitGroups.findIndex(k => k.title === groupTitle);
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
/**
 * Builds a date stamp for stamping in release notes.
 *
 * Uses the current date, or a provided date in the format of YYYY-MM-DD, i.e. 1970-11-05.
 */
export function buildDateStamp(date = new Date()) {
    const year = `${date.getFullYear()}`;
    const month = `${(date.getMonth() + 1)}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return [year, month, day].join('-');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL25vdGVzL2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBTTVFLHlEQUF5RDtBQUN6RCxNQUFNLDRCQUE0QixHQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztLQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEtBQUssaUJBQWlCLENBQUMsT0FBTyxDQUFDO0tBQ3BFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQWFoQyxzREFBc0Q7QUFDdEQsTUFBTSxPQUFPLGFBQWE7SUFjeEIsWUFBNkIsSUFBdUI7UUFBdkIsU0FBSSxHQUFKLElBQUksQ0FBbUI7UUFicEQsd0RBQXdEO1FBQ3ZDLGVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDekQsZ0VBQWdFO1FBQy9DLGlCQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDO1FBQzdELHVFQUF1RTtRQUM5RCxVQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDakMsaURBQWlEO1FBQ3hDLFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQyxrQ0FBa0M7UUFDekIsWUFBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JDLGdFQUFnRTtRQUN2RCxjQUFTLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFRyxDQUFDO0lBRXhE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QUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwRixDQUFDO0NBQ0Y7QUFHRDs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7SUFDOUMsTUFBTSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztJQUNyQyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMxRCxNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFakQsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDT01NSVRfVFlQRVMsIFJlbGVhc2VOb3Rlc0xldmVsfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9jb25maWcnO1xuaW1wb3J0IHtDb21taXRGcm9tR2l0TG9nfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7UmVsZWFzZU5vdGVzQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5cbi8qKiBMaXN0IG9mIHR5cGVzIHRvIGJlIGluY2x1ZGVkIGluIHRoZSByZWxlYXNlIG5vdGVzLiAqL1xuY29uc3QgdHlwZXNUb0luY2x1ZGVJblJlbGVhc2VOb3RlcyA9XG4gICAgT2JqZWN0LnZhbHVlcyhDT01NSVRfVFlQRVMpXG4gICAgICAgIC5maWx0ZXIodHlwZSA9PiB0eXBlLnJlbGVhc2VOb3Rlc0xldmVsID09PSBSZWxlYXNlTm90ZXNMZXZlbC5WaXNpYmxlKVxuICAgICAgICAubWFwKHR5cGUgPT4gdHlwZS5uYW1lKTtcblxuLyoqIERhdGEgdXNlZCBmb3IgY29udGV4dCBkdXJpbmcgcmVuZGVyaW5nLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJDb250ZXh0RGF0YSB7XG4gIHRpdGxlOiBzdHJpbmd8ZmFsc2U7XG4gIGdyb3VwT3JkZXI/OiBSZWxlYXNlTm90ZXNDb25maWdbJ2dyb3VwT3JkZXInXTtcbiAgaGlkZGVuU2NvcGVzPzogUmVsZWFzZU5vdGVzQ29uZmlnWydoaWRkZW5TY29wZXMnXTtcbiAgZGF0ZT86IERhdGU7XG4gIGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXTtcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBnaXRodWI6IEdpdGh1YkNvbmZpZztcbn1cblxuLyoqIENvbnRleHQgY2xhc3MgdXNlZCBmb3IgcmVuZGVyaW5nIHJlbGVhc2Ugbm90ZXMuICovXG5leHBvcnQgY2xhc3MgUmVuZGVyQ29udGV4dCB7XG4gIC8qKiBBbiBhcnJheSBvZiBncm91cCBuYW1lcyBpbiBzb3J0IG9yZGVyIGlmIGRlZmluZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgZ3JvdXBPcmRlciA9IHRoaXMuZGF0YS5ncm91cE9yZGVyIHx8IFtdO1xuICAvKiogQW4gYXJyYXkgb2Ygc2NvcGVzIHRvIGhpZGUgZnJvbSB0aGUgcmVsZWFzZSBlbnRyeSBvdXRwdXQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgaGlkZGVuU2NvcGVzID0gdGhpcy5kYXRhLmhpZGRlblNjb3BlcyB8fCBbXTtcbiAgLyoqIFRoZSB0aXRsZSBvZiB0aGUgcmVsZWFzZSwgb3IgYGZhbHNlYCBpZiBubyB0aXRsZSBzaG91bGQgYmUgdXNlZC4gKi9cbiAgcmVhZG9ubHkgdGl0bGUgPSB0aGlzLmRhdGEudGl0bGU7XG4gIC8qKiBBbiBhcnJheSBvZiBjb21taXRzIGluIHRoZSByZWxlYXNlIHBlcmlvZC4gKi9cbiAgcmVhZG9ubHkgY29tbWl0cyA9IHRoaXMuZGF0YS5jb21taXRzO1xuICAvKiogVGhlIHZlcnNpb24gb2YgdGhlIHJlbGVhc2UuICovXG4gIHJlYWRvbmx5IHZlcnNpb24gPSB0aGlzLmRhdGEudmVyc2lvbjtcbiAgLyoqIFRoZSBkYXRlIHN0YW1wIHN0cmluZyBmb3IgdXNlIGluIHRoZSByZWxlYXNlIG5vdGVzIGVudHJ5LiAqL1xuICByZWFkb25seSBkYXRlU3RhbXAgPSBidWlsZERhdGVTdGFtcCh0aGlzLmRhdGEuZGF0ZSk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBkYXRhOiBSZW5kZXJDb250ZXh0RGF0YSkge31cblxuICAvKipcbiAgICogT3JnYW5pemVzIGFuZCBzb3J0cyB0aGUgY29tbWl0cyBpbnRvIGdyb3VwcyBvZiBjb21taXRzLlxuICAgKlxuICAgKiBHcm91cHMgYXJlIHNvcnRlZCBlaXRoZXIgYnkgZGVmYXVsdCBgQXJyYXkuc29ydGAgb3JkZXIsIG9yIHVzaW5nIHRoZSBwcm92aWRlZCBncm91cCBvcmRlciBmcm9tXG4gICAqIHRoZSBjb25maWd1cmF0aW9uLiBDb21taXRzIGFyZSBvcmRlciBpbiB0aGUgc2FtZSBvcmRlciB3aXRoaW4gZWFjaCBncm91cHMgY29tbWl0IGxpc3QgYXMgdGhleVxuICAgKiBhcHBlYXIgaW4gdGhlIHByb3ZpZGVkIGxpc3Qgb2YgY29tbWl0cy5cbiAgICogKi9cbiAgYXNDb21taXRHcm91cHMoY29tbWl0czogQ29tbWl0RnJvbUdpdExvZ1tdKSB7XG4gICAgLyoqIFRoZSBkaXNjb3ZlcmVkIGdyb3VwcyB0byBvcmdhbml6ZSBpbnRvLiAqL1xuICAgIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBDb21taXRGcm9tR2l0TG9nW10+KCk7XG5cbiAgICAvLyBQbGFjZSBlYWNoIGNvbW1pdCBpbiB0aGUgbGlzdCBpbnRvIGl0cyBncm91cC5cbiAgICBjb21taXRzLmZvckVhY2goY29tbWl0ID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IGNvbW1pdC5ucG1TY29wZSA/IGAke2NvbW1pdC5ucG1TY29wZX0vJHtjb21taXQuc2NvcGV9YCA6IGNvbW1pdC5zY29wZTtcbiAgICAgIGNvbnN0IGdyb3VwQ29tbWl0cyA9IGdyb3Vwcy5nZXQoa2V5KSB8fCBbXTtcbiAgICAgIGdyb3Vwcy5zZXQoa2V5LCBncm91cENvbW1pdHMpO1xuICAgICAgZ3JvdXBDb21taXRzLnB1c2goY29tbWl0KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIENvbW1pdEdyb3VwcyBjb250YWluaW5nIHRoZSBkaXNjb3ZlcmVkIGNvbW1pdCBncm91cHMuIFNvcnRlZCBpbiBhbHBoYW51bWVyaWMgb3JkZXJcbiAgICAgKiBvZiB0aGUgZ3JvdXAgdGl0bGUuXG4gICAgICovXG4gICAgY29uc3QgY29tbWl0R3JvdXBzID0gQXJyYXkuZnJvbShncm91cHMuZW50cmllcygpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChbdGl0bGUsIGNvbW1pdHNdKSA9PiAoe3RpdGxlLCBjb21taXRzfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnRpdGxlID4gYi50aXRsZSA/IDEgOiBhLnRpdGxlIDwgYi50aXRsZSA/IC0xIDogMCk7XG5cbiAgICAvLyBJZiB0aGUgY29uZmlndXJhdGlvbiBwcm92aWRlcyBhIHNvcnRpbmcgb3JkZXIsIHVwZGF0ZWQgdGhlIHNvcnRlZCBsaXN0IG9mIGdyb3VwIGtleXMgdG9cbiAgICAvLyBzYXRpc2Z5IHRoZSBvcmRlciBvZiB0aGUgZ3JvdXBzIHByb3ZpZGVkIGluIHRoZSBsaXN0IHdpdGggYW55IGdyb3VwcyBub3QgZm91bmQgaW4gdGhlIGxpc3QgYXRcbiAgICAvLyB0aGUgZW5kIG9mIHRoZSBzb3J0ZWQgbGlzdC5cbiAgICBpZiAodGhpcy5ncm91cE9yZGVyLmxlbmd0aCkge1xuICAgICAgZm9yIChjb25zdCBncm91cFRpdGxlIG9mIHRoaXMuZ3JvdXBPcmRlci5yZXZlcnNlKCkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudElkeCA9IGNvbW1pdEdyb3Vwcy5maW5kSW5kZXgoayA9PiBrLnRpdGxlID09PSBncm91cFRpdGxlKTtcbiAgICAgICAgaWYgKGN1cnJlbnRJZHggIT09IC0xKSB7XG4gICAgICAgICAgY29uc3QgcmVtb3ZlZEdyb3VwcyA9IGNvbW1pdEdyb3Vwcy5zcGxpY2UoY3VycmVudElkeCwgMSk7XG4gICAgICAgICAgY29tbWl0R3JvdXBzLnNwbGljZSgwLCAwLCAuLi5yZW1vdmVkR3JvdXBzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29tbWl0R3JvdXBzO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgZmlsdGVyIGZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgYSBsaXN0IG9mIGNvbW1pdHMgdG8gb25seSBpbmNsdWRlIGNvbW1pdHMgd2hpY2ggc2hvdWxkIGFwcGVhclxuICAgKiBpbiByZWxlYXNlIG5vdGVzLlxuICAgKi9cbiAgaW5jbHVkZUluUmVsZWFzZU5vdGVzKCkge1xuICAgIHJldHVybiAoY29tbWl0OiBDb21taXRGcm9tR2l0TG9nKSA9PiB7XG4gICAgICBpZiAoIXR5cGVzVG9JbmNsdWRlSW5SZWxlYXNlTm90ZXMuaW5jbHVkZXMoY29tbWl0LnR5cGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaGlkZGVuU2NvcGVzLmluY2x1ZGVzKGNvbW1pdC5zY29wZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGZpbHRlciBmdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGEgbGlzdCBvZiBjb21taXRzIHRvIG9ubHkgaW5jbHVkZSBjb21taXRzIHdoaWNoIGNvbnRhaW4gYVxuICAgKiB0cnV0aHkgdmFsdWUsIG9yIGZvciBhcnJheXMgYW4gYXJyYXkgd2l0aCAxIG9yIG1vcmUgZWxlbWVudHMsIGZvciB0aGUgcHJvdmlkZWQgZmllbGQuXG4gICAqL1xuICBjb250YWlucyhmaWVsZDoga2V5b2YgQ29tbWl0RnJvbUdpdExvZykge1xuICAgIHJldHVybiAoY29tbWl0OiBDb21taXRGcm9tR2l0TG9nKSA9PiB7XG4gICAgICBjb25zdCBmaWVsZFZhbHVlID0gY29tbWl0W2ZpZWxkXTtcbiAgICAgIGlmICghZmllbGRWYWx1ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGZpZWxkVmFsdWUpICYmIGZpZWxkVmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaCBjb250YWluIGFcbiAgICogdW5pcXVlIHZhbHVlIGZvciB0aGUgcHJvdmlkZWQgZmllbGQgYWNyb3NzIGFsbCBjb21taXRzIGluIHRoZSBsaXN0LlxuICAgKi9cbiAgdW5pcXVlKGZpZWxkOiBrZXlvZiBDb21taXRGcm9tR2l0TG9nKSB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldDxDb21taXRGcm9tR2l0TG9nW3R5cGVvZiBmaWVsZF0+KCk7XG4gICAgcmV0dXJuIChjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpID0+IHtcbiAgICAgIGNvbnN0IGluY2x1ZGUgPSAhc2V0Lmhhcyhjb21taXRbZmllbGRdKTtcbiAgICAgIHNldC5hZGQoY29tbWl0W2ZpZWxkXSk7XG4gICAgICByZXR1cm4gaW5jbHVkZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBjb21taXQgb2JqZWN0IHRvIGEgTWFya2Rvd24gbGluay5cbiAgICovXG4gIGNvbW1pdFRvTGluayhjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHt0aGlzLmRhdGEuZ2l0aHViLm93bmVyfS8ke3RoaXMuZGF0YS5naXRodWIubmFtZX0vY29tbWl0LyR7XG4gICAgICAgIGNvbW1pdC5oYXNofWA7XG4gICAgcmV0dXJuIGBbJHtjb21taXQuc2hvcnRIYXNofV0oJHt1cmx9KWA7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIHB1bGwgcmVxdWVzdCBudW1iZXIgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgcHVsbFJlcXVlc3RUb0xpbmsocHJOdW1iZXI6IG51bWJlcik6IHN0cmluZyB7XG4gICAgY29uc3QgdXJsID1cbiAgICAgICAgYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3RoaXMuZGF0YS5naXRodWIub3duZXJ9LyR7dGhpcy5kYXRhLmdpdGh1Yi5uYW1lfS9wdWxsLyR7cHJOdW1iZXJ9YDtcbiAgICByZXR1cm4gYFsjJHtwck51bWJlcn1dKCR7dXJsfSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBhIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBieSByZXBsYWNpbmcgdGhlIHBhcmVudGhlc2l6ZWQgcHVsbCByZXF1ZXN0IHJlZmVyZW5jZSBhdCB0aGVcbiAgICogZW5kIG9mIHRoZSBsaW5lICh3aGljaCBpcyBhZGRlZCBieSBtZXJnZSB0b29saW5nKSB0byBhIE1hcmtkb3duIGxpbmsuXG4gICAqL1xuICByZXBsYWNlQ29tbWl0SGVhZGVyUHVsbFJlcXVlc3ROdW1iZXIoaGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBoZWFkZXIucmVwbGFjZSgvXFwoIyhcXGQrKVxcKSQvLCAoXywgZykgPT4gYCgke3RoaXMucHVsbFJlcXVlc3RUb0xpbmsoK2cpfSlgKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQnVpbGRzIGEgZGF0ZSBzdGFtcCBmb3Igc3RhbXBpbmcgaW4gcmVsZWFzZSBub3Rlcy5cbiAqXG4gKiBVc2VzIHRoZSBjdXJyZW50IGRhdGUsIG9yIGEgcHJvdmlkZWQgZGF0ZSBpbiB0aGUgZm9ybWF0IG9mIFlZWVktTU0tREQsIGkuZS4gMTk3MC0xMS0wNS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGF0ZVN0YW1wKGRhdGUgPSBuZXcgRGF0ZSgpKSB7XG4gIGNvbnN0IHllYXIgPSBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9YDtcbiAgY29uc3QgbW9udGggPSBgJHsoZGF0ZS5nZXRNb250aCgpICsgMSl9YC5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBkYXkgPSBgJHtkYXRlLmdldERhdGUoKX1gLnBhZFN0YXJ0KDIsICcwJyk7XG5cbiAgcmV0dXJuIFt5ZWFyLCBtb250aCwgZGF5XS5qb2luKCctJyk7XG59XG4iXX0=