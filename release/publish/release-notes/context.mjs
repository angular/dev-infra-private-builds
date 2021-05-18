/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { COMMIT_TYPES, ReleaseNotesLevel } from '../../../commit-message/config';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQU0vRSx5REFBeUQ7QUFDekQsTUFBTSw0QkFBNEIsR0FDOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7S0FDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixLQUFLLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztLQUNwRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFhaEMsc0RBQXNEO0FBQ3RELE1BQU0sT0FBTyxhQUFhO0lBY3hCLFlBQTZCLElBQXVCO1FBQXZCLFNBQUksR0FBSixJQUFJLENBQW1CO1FBYnBELHdEQUF3RDtRQUN2QyxlQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO1FBQ3pELGdFQUFnRTtRQUMvQyxpQkFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztRQUM3RCx1RUFBdUU7UUFDOUQsVUFBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2pDLGlEQUFpRDtRQUN4QyxZQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckMsa0NBQWtDO1FBQ3pCLFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQyxnRUFBZ0U7UUFDdkQsY0FBUyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxD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QyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4RCxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLEtBQTZCO1FBQ2xDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxNQUF3QixFQUFFLEVBQUU7WUFDbEMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdkIsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBR0Q7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxjQUFjLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO0lBQzlDLE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7SUFDckMsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDMUQsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRWpELE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q09NTUlUX1RZUEVTLCBSZWxlYXNlTm90ZXNMZXZlbH0gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvY29uZmlnJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge1JlbGVhc2VOb3Rlc0NvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnL2luZGV4JztcblxuXG4vKiogTGlzdCBvZiB0eXBlcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgcmVsZWFzZSBub3Rlcy4gKi9cbmNvbnN0IHR5cGVzVG9JbmNsdWRlSW5SZWxlYXNlTm90ZXMgPVxuICAgIE9iamVjdC52YWx1ZXMoQ09NTUlUX1RZUEVTKVxuICAgICAgICAuZmlsdGVyKHR5cGUgPT4gdHlwZS5yZWxlYXNlTm90ZXNMZXZlbCA9PT0gUmVsZWFzZU5vdGVzTGV2ZWwuVmlzaWJsZSlcbiAgICAgICAgLm1hcCh0eXBlID0+IHR5cGUubmFtZSk7XG5cbi8qKiBEYXRhIHVzZWQgZm9yIGNvbnRleHQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyQ29udGV4dERhdGEge1xuICB0aXRsZTogc3RyaW5nfGZhbHNlO1xuICBncm91cE9yZGVyPzogUmVsZWFzZU5vdGVzQ29uZmlnWydncm91cE9yZGVyJ107XG4gIGhpZGRlblNjb3Blcz86IFJlbGVhc2VOb3Rlc0NvbmZpZ1snaGlkZGVuU2NvcGVzJ107XG4gIGRhdGU/OiBEYXRlO1xuICBjb21taXRzOiBDb21taXRGcm9tR2l0TG9nW107XG4gIHZlcnNpb246IHN0cmluZztcbiAgZ2l0aHViOiBHaXRodWJDb25maWc7XG59XG5cbi8qKiBDb250ZXh0IGNsYXNzIHVzZWQgZm9yIHJlbmRlcmluZyByZWxlYXNlIG5vdGVzLiAqL1xuZXhwb3J0IGNsYXNzIFJlbmRlckNvbnRleHQge1xuICAvKiogQW4gYXJyYXkgb2YgZ3JvdXAgbmFtZXMgaW4gc29ydCBvcmRlciBpZiBkZWZpbmVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGdyb3VwT3JkZXIgPSB0aGlzLmRhdGEuZ3JvdXBPcmRlciB8fCBbXTtcbiAgLyoqIEFuIGFycmF5IG9mIHNjb3BlcyB0byBoaWRlIGZyb20gdGhlIHJlbGVhc2UgZW50cnkgb3V0cHV0LiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGhpZGRlblNjb3BlcyA9IHRoaXMuZGF0YS5oaWRkZW5TY29wZXMgfHwgW107XG4gIC8qKiBUaGUgdGl0bGUgb2YgdGhlIHJlbGVhc2UsIG9yIGBmYWxzZWAgaWYgbm8gdGl0bGUgc2hvdWxkIGJlIHVzZWQuICovXG4gIHJlYWRvbmx5IHRpdGxlID0gdGhpcy5kYXRhLnRpdGxlO1xuICAvKiogQW4gYXJyYXkgb2YgY29tbWl0cyBpbiB0aGUgcmVsZWFzZSBwZXJpb2QuICovXG4gIHJlYWRvbmx5IGNvbW1pdHMgPSB0aGlzLmRhdGEuY29tbWl0cztcbiAgLyoqIFRoZSB2ZXJzaW9uIG9mIHRoZSByZWxlYXNlLiAqL1xuICByZWFkb25seSB2ZXJzaW9uID0gdGhpcy5kYXRhLnZlcnNpb247XG4gIC8qKiBUaGUgZGF0ZSBzdGFtcCBzdHJpbmcgZm9yIHVzZSBpbiB0aGUgcmVsZWFzZSBub3RlcyBlbnRyeS4gKi9cbiAgcmVhZG9ubHkgZGF0ZVN0YW1wID0gYnVpbGREYXRlU3RhbXAodGhpcy5kYXRhLmRhdGUpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZGF0YTogUmVuZGVyQ29udGV4dERhdGEpIHt9XG5cbiAgLyoqXG4gICAqIE9yZ2FuaXplcyBhbmQgc29ydHMgdGhlIGNvbW1pdHMgaW50byBncm91cHMgb2YgY29tbWl0cy5cbiAgICpcbiAgICogR3JvdXBzIGFyZSBzb3J0ZWQgZWl0aGVyIGJ5IGRlZmF1bHQgYEFycmF5LnNvcnRgIG9yZGVyLCBvciB1c2luZyB0aGUgcHJvdmlkZWQgZ3JvdXAgb3JkZXIgZnJvbVxuICAgKiB0aGUgY29uZmlndXJhdGlvbi4gQ29tbWl0cyBhcmUgb3JkZXIgaW4gdGhlIHNhbWUgb3JkZXIgd2l0aGluIGVhY2ggZ3JvdXBzIGNvbW1pdCBsaXN0IGFzIHRoZXlcbiAgICogYXBwZWFyIGluIHRoZSBwcm92aWRlZCBsaXN0IG9mIGNvbW1pdHMuXG4gICAqICovXG4gIGFzQ29tbWl0R3JvdXBzKGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSkge1xuICAgIC8qKiBUaGUgZGlzY292ZXJlZCBncm91cHMgdG8gb3JnYW5pemUgaW50by4gKi9cbiAgICBjb25zdCBncm91cHMgPSBuZXcgTWFwPHN0cmluZywgQ29tbWl0RnJvbUdpdExvZ1tdPigpO1xuXG4gICAgLy8gUGxhY2UgZWFjaCBjb21taXQgaW4gdGhlIGxpc3QgaW50byBpdHMgZ3JvdXAuXG4gICAgY29tbWl0cy5mb3JFYWNoKGNvbW1pdCA9PiB7XG4gICAgICBjb25zdCBrZXkgPSBjb21taXQubnBtU2NvcGUgPyBgJHtjb21taXQubnBtU2NvcGV9LyR7Y29tbWl0LnNjb3BlfWAgOiBjb21taXQuc2NvcGU7XG4gICAgICBjb25zdCBncm91cENvbW1pdHMgPSBncm91cHMuZ2V0KGtleSkgfHwgW107XG4gICAgICBncm91cHMuc2V0KGtleSwgZ3JvdXBDb21taXRzKTtcbiAgICAgIGdyb3VwQ29tbWl0cy5wdXNoKGNvbW1pdCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBDb21taXRHcm91cHMgY29udGFpbmluZyB0aGUgZGlzY292ZXJlZCBjb21taXQgZ3JvdXBzLiBTb3J0ZWQgaW4gYWxwaGFudW1lcmljIG9yZGVyXG4gICAgICogb2YgdGhlIGdyb3VwIHRpdGxlLlxuICAgICAqL1xuICAgIGNvbnN0IGNvbW1pdEdyb3VwcyA9IEFycmF5LmZyb20oZ3JvdXBzLmVudHJpZXMoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoW3RpdGxlLCBjb21taXRzXSkgPT4gKHt0aXRsZSwgY29tbWl0c30pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYS50aXRsZSA+IGIudGl0bGUgPyAxIDogYS50aXRsZSA8IGIudGl0bGUgPyAtMSA6IDApO1xuXG4gICAgLy8gSWYgdGhlIGNvbmZpZ3VyYXRpb24gcHJvdmlkZXMgYSBzb3J0aW5nIG9yZGVyLCB1cGRhdGVkIHRoZSBzb3J0ZWQgbGlzdCBvZiBncm91cCBrZXlzIHRvXG4gICAgLy8gc2F0aXNmeSB0aGUgb3JkZXIgb2YgdGhlIGdyb3VwcyBwcm92aWRlZCBpbiB0aGUgbGlzdCB3aXRoIGFueSBncm91cHMgbm90IGZvdW5kIGluIHRoZSBsaXN0IGF0XG4gICAgLy8gdGhlIGVuZCBvZiB0aGUgc29ydGVkIGxpc3QuXG4gICAgaWYgKHRoaXMuZ3JvdXBPcmRlci5sZW5ndGgpIHtcbiAgICAgIGZvciAoY29uc3QgZ3JvdXBUaXRsZSBvZiB0aGlzLmdyb3VwT3JkZXIucmV2ZXJzZSgpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRJZHggPSBjb21taXRHcm91cHMuZmluZEluZGV4KGsgPT4gay50aXRsZSA9PT0gZ3JvdXBUaXRsZSk7XG4gICAgICAgIGlmIChjdXJyZW50SWR4ICE9PSAtMSkge1xuICAgICAgICAgIGNvbnN0IHJlbW92ZWRHcm91cHMgPSBjb21taXRHcm91cHMuc3BsaWNlKGN1cnJlbnRJZHgsIDEpO1xuICAgICAgICAgIGNvbW1pdEdyb3Vwcy5zcGxpY2UoMCwgMCwgLi4ucmVtb3ZlZEdyb3Vwcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbW1pdEdyb3VwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGZpbHRlciBmdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGEgbGlzdCBvZiBjb21taXRzIHRvIG9ubHkgaW5jbHVkZSBjb21taXRzIHdoaWNoIHNob3VsZCBhcHBlYXJcbiAgICogaW4gcmVsZWFzZSBub3Rlcy5cbiAgICovXG4gIGluY2x1ZGVJblJlbGVhc2VOb3RlcygpIHtcbiAgICByZXR1cm4gKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykgPT4ge1xuICAgICAgaWYgKCF0eXBlc1RvSW5jbHVkZUluUmVsZWFzZU5vdGVzLmluY2x1ZGVzKGNvbW1pdC50eXBlKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmhpZGRlblNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaCBjb250YWluIGFcbiAgICogdHJ1dGh5IHZhbHVlLCBvciBmb3IgYXJyYXlzIGFuIGFycmF5IHdpdGggMSBvciBtb3JlIGVsZW1lbnRzLCBmb3IgdGhlIHByb3ZpZGVkIGZpZWxkLlxuICAgKi9cbiAgY29udGFpbnMoZmllbGQ6IGtleW9mIENvbW1pdEZyb21HaXRMb2cpIHtcbiAgICByZXR1cm4gKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykgPT4ge1xuICAgICAgY29uc3QgZmllbGRWYWx1ZSA9IGNvbW1pdFtmaWVsZF07XG4gICAgICBpZiAoIWZpZWxkVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShmaWVsZFZhbHVlKSAmJiBmaWVsZFZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgZmlsdGVyIGZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgYSBsaXN0IG9mIGNvbW1pdHMgdG8gb25seSBpbmNsdWRlIGNvbW1pdHMgd2hpY2ggY29udGFpbiBhXG4gICAqIHVuaXF1ZSB2YWx1ZSBmb3IgdGhlIHByb3ZpZGVkIGZpZWxkIGFjcm9zcyBhbGwgY29tbWl0cyBpbiB0aGUgbGlzdC5cbiAgICovXG4gIHVuaXF1ZShmaWVsZDoga2V5b2YgQ29tbWl0RnJvbUdpdExvZykge1xuICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8Q29tbWl0RnJvbUdpdExvZ1t0eXBlb2YgZmllbGRdPigpO1xuICAgIHJldHVybiAoY29tbWl0OiBDb21taXRGcm9tR2l0TG9nKSA9PiB7XG4gICAgICBjb25zdCBpbmNsdWRlID0gIXNldC5oYXMoY29tbWl0W2ZpZWxkXSk7XG4gICAgICBzZXQuYWRkKGNvbW1pdFtmaWVsZF0pO1xuICAgICAgcmV0dXJuIGluY2x1ZGU7XG4gICAgfTtcbiAgfVxufVxuXG5cbi8qKlxuICogQnVpbGRzIGEgZGF0ZSBzdGFtcCBmb3Igc3RhbXBpbmcgaW4gcmVsZWFzZSBub3Rlcy5cbiAqXG4gKiBVc2VzIHRoZSBjdXJyZW50IGRhdGUsIG9yIGEgcHJvdmlkZWQgZGF0ZSBpbiB0aGUgZm9ybWF0IG9mIFlZWVktTU0tREQsIGkuZS4gMTk3MC0xMS0wNS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGF0ZVN0YW1wKGRhdGUgPSBuZXcgRGF0ZSgpKSB7XG4gIGNvbnN0IHllYXIgPSBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9YDtcbiAgY29uc3QgbW9udGggPSBgJHsoZGF0ZS5nZXRNb250aCgpICsgMSl9YC5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBkYXkgPSBgJHtkYXRlLmdldERhdGUoKX1gLnBhZFN0YXJ0KDIsICcwJyk7XG5cbiAgcmV0dXJuIFt5ZWFyLCBtb250aCwgZGF5XS5qb2luKCctJyk7XG59XG4iXX0=