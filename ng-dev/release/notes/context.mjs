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
    /** Whether the specified commit contains breaking changes. */
    hasBreakingChanges(commit) {
        return commit.breakingChanges.length !== 0;
    }
    /** Whether the specified commit contains deprecations. */
    hasDeprecations(commit) {
        return commit.deprecations.length !== 0;
    }
    /**
     * A filter function for filtering a list of commits to only include commits which
     * should appear in release notes.
     */
    includeInReleaseNotes() {
        return (commit) => {
            if (this.hiddenScopes.includes(commit.scope)) {
                return false;
            }
            // Commits which contain breaking changes or deprecations are always included
            // in release notes. The breaking change or deprecations will already be listed
            // in a dedicated section but it is still valuable to include the actual commit.
            if (this.hasBreakingChanges(commit) || this.hasDeprecations(commit)) {
                return true;
            }
            return typesToIncludeInReleaseNotes.includes(commit.type);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQTRFO0FBSzVFLHlEQUF5RDtBQUN6RCxNQUFNLDRCQUE0QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMscUJBQVksQ0FBQztLQUM3RCxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSywwQkFBaUIsQ0FBQyxPQUFPLENBQUM7S0FDdEUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFhNUIsc0RBQXNEO0FBQ3RELE1BQWEsYUFBYTtJQWN4QixZQUE2QixJQUF1QjtRQUF2QixTQUFJLEdBQUosSUFBSSxDQUFtQjtRQWJwRCx3REFBd0Q7UUFDdkMsZUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztRQUN6RCxnRUFBZ0U7UUFDL0MsaUJBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7UUFDN0QsdUVBQXVFO1FBQzlELFVBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNqQyxpREFBaUQ7UUFDeEMsWUFBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JDLGtDQUFrQztRQUN6QixZQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckMsZ0VBQWdFO1FBQ3ZELGNBQVMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVHLENBQUM7SUFFeEQ7Ozs7OztTQU1LO0lBQ0wsY0FBYyxDQUFDLE9BQTJCO1FBQ3hD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LGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7Q0FDRjtBQTdIRCxzQ0E2SEM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtJQUM5QyxNQUFNLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO0lBQ3JDLE1BQU0sS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEQsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRWpELE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBTkQsd0NBTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDT01NSVRfVFlQRVMsIFJlbGVhc2VOb3Rlc0xldmVsfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9jb25maWcnO1xuaW1wb3J0IHtDb21taXRGcm9tR2l0TG9nfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7UmVsZWFzZU5vdGVzQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG4vKiogTGlzdCBvZiB0eXBlcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgcmVsZWFzZSBub3Rlcy4gKi9cbmNvbnN0IHR5cGVzVG9JbmNsdWRlSW5SZWxlYXNlTm90ZXMgPSBPYmplY3QudmFsdWVzKENPTU1JVF9UWVBFUylcbiAgLmZpbHRlcigodHlwZSkgPT4gdHlwZS5yZWxlYXNlTm90ZXNMZXZlbCA9PT0gUmVsZWFzZU5vdGVzTGV2ZWwuVmlzaWJsZSlcbiAgLm1hcCgodHlwZSkgPT4gdHlwZS5uYW1lKTtcblxuLyoqIERhdGEgdXNlZCBmb3IgY29udGV4dCBkdXJpbmcgcmVuZGVyaW5nLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJDb250ZXh0RGF0YSB7XG4gIHRpdGxlOiBzdHJpbmcgfCBmYWxzZTtcbiAgZ3JvdXBPcmRlcj86IFJlbGVhc2VOb3Rlc0NvbmZpZ1snZ3JvdXBPcmRlciddO1xuICBoaWRkZW5TY29wZXM/OiBSZWxlYXNlTm90ZXNDb25maWdbJ2hpZGRlblNjb3BlcyddO1xuICBkYXRlPzogRGF0ZTtcbiAgY29tbWl0czogQ29tbWl0RnJvbUdpdExvZ1tdO1xuICB2ZXJzaW9uOiBzdHJpbmc7XG4gIGdpdGh1YjogR2l0aHViQ29uZmlnO1xufVxuXG4vKiogQ29udGV4dCBjbGFzcyB1c2VkIGZvciByZW5kZXJpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmV4cG9ydCBjbGFzcyBSZW5kZXJDb250ZXh0IHtcbiAgLyoqIEFuIGFycmF5IG9mIGdyb3VwIG5hbWVzIGluIHNvcnQgb3JkZXIgaWYgZGVmaW5lZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBncm91cE9yZGVyID0gdGhpcy5kYXRhLmdyb3VwT3JkZXIgfHwgW107XG4gIC8qKiBBbiBhcnJheSBvZiBzY29wZXMgdG8gaGlkZSBmcm9tIHRoZSByZWxlYXNlIGVudHJ5IG91dHB1dC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBoaWRkZW5TY29wZXMgPSB0aGlzLmRhdGEuaGlkZGVuU2NvcGVzIHx8IFtdO1xuICAvKiogVGhlIHRpdGxlIG9mIHRoZSByZWxlYXNlLCBvciBgZmFsc2VgIGlmIG5vIHRpdGxlIHNob3VsZCBiZSB1c2VkLiAqL1xuICByZWFkb25seSB0aXRsZSA9IHRoaXMuZGF0YS50aXRsZTtcbiAgLyoqIEFuIGFycmF5IG9mIGNvbW1pdHMgaW4gdGhlIHJlbGVhc2UgcGVyaW9kLiAqL1xuICByZWFkb25seSBjb21taXRzID0gdGhpcy5kYXRhLmNvbW1pdHM7XG4gIC8qKiBUaGUgdmVyc2lvbiBvZiB0aGUgcmVsZWFzZS4gKi9cbiAgcmVhZG9ubHkgdmVyc2lvbiA9IHRoaXMuZGF0YS52ZXJzaW9uO1xuICAvKiogVGhlIGRhdGUgc3RhbXAgc3RyaW5nIGZvciB1c2UgaW4gdGhlIHJlbGVhc2Ugbm90ZXMgZW50cnkuICovXG4gIHJlYWRvbmx5IGRhdGVTdGFtcCA9IGJ1aWxkRGF0ZVN0YW1wKHRoaXMuZGF0YS5kYXRlKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGRhdGE6IFJlbmRlckNvbnRleHREYXRhKSB7fVxuXG4gIC8qKlxuICAgKiBPcmdhbml6ZXMgYW5kIHNvcnRzIHRoZSBjb21taXRzIGludG8gZ3JvdXBzIG9mIGNvbW1pdHMuXG4gICAqXG4gICAqIEdyb3VwcyBhcmUgc29ydGVkIGVpdGhlciBieSBkZWZhdWx0IGBBcnJheS5zb3J0YCBvcmRlciwgb3IgdXNpbmcgdGhlIHByb3ZpZGVkIGdyb3VwIG9yZGVyIGZyb21cbiAgICogdGhlIGNvbmZpZ3VyYXRpb24uIENvbW1pdHMgYXJlIG9yZGVyIGluIHRoZSBzYW1lIG9yZGVyIHdpdGhpbiBlYWNoIGdyb3VwcyBjb21taXQgbGlzdCBhcyB0aGV5XG4gICAqIGFwcGVhciBpbiB0aGUgcHJvdmlkZWQgbGlzdCBvZiBjb21taXRzLlxuICAgKiAqL1xuICBhc0NvbW1pdEdyb3Vwcyhjb21taXRzOiBDb21taXRGcm9tR2l0TG9nW10pIHtcbiAgICAvKiogVGhlIGRpc2NvdmVyZWQgZ3JvdXBzIHRvIG9yZ2FuaXplIGludG8uICovXG4gICAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIENvbW1pdEZyb21HaXRMb2dbXT4oKTtcblxuICAgIC8vIFBsYWNlIGVhY2ggY29tbWl0IGluIHRoZSBsaXN0IGludG8gaXRzIGdyb3VwLlxuICAgIGNvbW1pdHMuZm9yRWFjaCgoY29tbWl0KSA9PiB7XG4gICAgICBjb25zdCBrZXkgPSBjb21taXQubnBtU2NvcGUgPyBgJHtjb21taXQubnBtU2NvcGV9LyR7Y29tbWl0LnNjb3BlfWAgOiBjb21taXQuc2NvcGU7XG4gICAgICBjb25zdCBncm91cENvbW1pdHMgPSBncm91cHMuZ2V0KGtleSkgfHwgW107XG4gICAgICBncm91cHMuc2V0KGtleSwgZ3JvdXBDb21taXRzKTtcbiAgICAgIGdyb3VwQ29tbWl0cy5wdXNoKGNvbW1pdCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBDb21taXRHcm91cHMgY29udGFpbmluZyB0aGUgZGlzY292ZXJlZCBjb21taXQgZ3JvdXBzLiBTb3J0ZWQgaW4gYWxwaGFudW1lcmljIG9yZGVyXG4gICAgICogb2YgdGhlIGdyb3VwIHRpdGxlLlxuICAgICAqL1xuICAgIGNvbnN0IGNvbW1pdEdyb3VwcyA9IEFycmF5LmZyb20oZ3JvdXBzLmVudHJpZXMoKSlcbiAgICAgIC5tYXAoKFt0aXRsZSwgY29tbWl0c10pID0+ICh7dGl0bGUsIGNvbW1pdHN9KSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiAoYS50aXRsZSA+IGIudGl0bGUgPyAxIDogYS50aXRsZSA8IGIudGl0bGUgPyAtMSA6IDApKTtcblxuICAgIC8vIElmIHRoZSBjb25maWd1cmF0aW9uIHByb3ZpZGVzIGEgc29ydGluZyBvcmRlciwgdXBkYXRlZCB0aGUgc29ydGVkIGxpc3Qgb2YgZ3JvdXAga2V5cyB0b1xuICAgIC8vIHNhdGlzZnkgdGhlIG9yZGVyIG9mIHRoZSBncm91cHMgcHJvdmlkZWQgaW4gdGhlIGxpc3Qgd2l0aCBhbnkgZ3JvdXBzIG5vdCBmb3VuZCBpbiB0aGUgbGlzdCBhdFxuICAgIC8vIHRoZSBlbmQgb2YgdGhlIHNvcnRlZCBsaXN0LlxuICAgIGlmICh0aGlzLmdyb3VwT3JkZXIubGVuZ3RoKSB7XG4gICAgICBmb3IgKGNvbnN0IGdyb3VwVGl0bGUgb2YgdGhpcy5ncm91cE9yZGVyLnJldmVyc2UoKSkge1xuICAgICAgICBjb25zdCBjdXJyZW50SWR4ID0gY29tbWl0R3JvdXBzLmZpbmRJbmRleCgoaykgPT4gay50aXRsZSA9PT0gZ3JvdXBUaXRsZSk7XG4gICAgICAgIGlmIChjdXJyZW50SWR4ICE9PSAtMSkge1xuICAgICAgICAgIGNvbnN0IHJlbW92ZWRHcm91cHMgPSBjb21taXRHcm91cHMuc3BsaWNlKGN1cnJlbnRJZHgsIDEpO1xuICAgICAgICAgIGNvbW1pdEdyb3Vwcy5zcGxpY2UoMCwgMCwgLi4ucmVtb3ZlZEdyb3Vwcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbW1pdEdyb3VwcztcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgY29tbWl0IGNvbnRhaW5zIGJyZWFraW5nIGNoYW5nZXMuICovXG4gIGhhc0JyZWFraW5nQ2hhbmdlcyhjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpIHtcbiAgICByZXR1cm4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDA7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgc3BlY2lmaWVkIGNvbW1pdCBjb250YWlucyBkZXByZWNhdGlvbnMuICovXG4gIGhhc0RlcHJlY2F0aW9ucyhjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpIHtcbiAgICByZXR1cm4gY29tbWl0LmRlcHJlY2F0aW9ucy5sZW5ndGggIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaFxuICAgKiBzaG91bGQgYXBwZWFyIGluIHJlbGVhc2Ugbm90ZXMuXG4gICAqL1xuICBpbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSB7XG4gICAgcmV0dXJuIChjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpID0+IHtcbiAgICAgIGlmICh0aGlzLmhpZGRlblNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29tbWl0cyB3aGljaCBjb250YWluIGJyZWFraW5nIGNoYW5nZXMgb3IgZGVwcmVjYXRpb25zIGFyZSBhbHdheXMgaW5jbHVkZWRcbiAgICAgIC8vIGluIHJlbGVhc2Ugbm90ZXMuIFRoZSBicmVha2luZyBjaGFuZ2Ugb3IgZGVwcmVjYXRpb25zIHdpbGwgYWxyZWFkeSBiZSBsaXN0ZWRcbiAgICAgIC8vIGluIGEgZGVkaWNhdGVkIHNlY3Rpb24gYnV0IGl0IGlzIHN0aWxsIHZhbHVhYmxlIHRvIGluY2x1ZGUgdGhlIGFjdHVhbCBjb21taXQuXG4gICAgICBpZiAodGhpcy5oYXNCcmVha2luZ0NoYW5nZXMoY29tbWl0KSB8fCB0aGlzLmhhc0RlcHJlY2F0aW9ucyhjb21taXQpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHlwZXNUb0luY2x1ZGVJblJlbGVhc2VOb3Rlcy5pbmNsdWRlcyhjb21taXQudHlwZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGZpbHRlciBmdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGEgbGlzdCBvZiBjb21taXRzIHRvIG9ubHkgaW5jbHVkZSBjb21taXRzIHdoaWNoIGNvbnRhaW4gYVxuICAgKiB1bmlxdWUgdmFsdWUgZm9yIHRoZSBwcm92aWRlZCBmaWVsZCBhY3Jvc3MgYWxsIGNvbW1pdHMgaW4gdGhlIGxpc3QuXG4gICAqL1xuICB1bmlxdWUoZmllbGQ6IGtleW9mIENvbW1pdEZyb21HaXRMb2cpIHtcbiAgICBjb25zdCBzZXQgPSBuZXcgU2V0PENvbW1pdEZyb21HaXRMb2dbdHlwZW9mIGZpZWxkXT4oKTtcbiAgICByZXR1cm4gKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykgPT4ge1xuICAgICAgY29uc3QgaW5jbHVkZSA9ICFzZXQuaGFzKGNvbW1pdFtmaWVsZF0pO1xuICAgICAgc2V0LmFkZChjb21taXRbZmllbGRdKTtcbiAgICAgIHJldHVybiBpbmNsdWRlO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIGNvbW1pdCBvYmplY3QgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgY29tbWl0VG9MaW5rKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3RoaXMuZGF0YS5naXRodWIub3duZXJ9LyR7dGhpcy5kYXRhLmdpdGh1Yi5uYW1lfS9jb21taXQvJHtjb21taXQuaGFzaH1gO1xuICAgIHJldHVybiBgWyR7Y29tbWl0LnNob3J0SGFzaH1dKCR7dXJsfSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBwdWxsIHJlcXVlc3QgbnVtYmVyIHRvIGEgTWFya2Rvd24gbGluay5cbiAgICovXG4gIHB1bGxSZXF1ZXN0VG9MaW5rKHByTnVtYmVyOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHt0aGlzLmRhdGEuZ2l0aHViLm93bmVyfS8ke3RoaXMuZGF0YS5naXRodWIubmFtZX0vcHVsbC8ke3ByTnVtYmVyfWA7XG4gICAgcmV0dXJuIGBbIyR7cHJOdW1iZXJ9XSgke3VybH0pYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gYSBjb21taXQgbWVzc2FnZSBoZWFkZXIgYnkgcmVwbGFjaW5nIHRoZSBwYXJlbnRoZXNpemVkIHB1bGwgcmVxdWVzdCByZWZlcmVuY2UgYXQgdGhlXG4gICAqIGVuZCBvZiB0aGUgbGluZSAod2hpY2ggaXMgYWRkZWQgYnkgbWVyZ2UgdG9vbGluZykgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgcmVwbGFjZUNvbW1pdEhlYWRlclB1bGxSZXF1ZXN0TnVtYmVyKGhlYWRlcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaGVhZGVyLnJlcGxhY2UoL1xcKCMoXFxkKylcXCkkLywgKF8sIGcpID0+IGAoJHt0aGlzLnB1bGxSZXF1ZXN0VG9MaW5rKCtnKX0pYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBkYXRlIHN0YW1wIGZvciBzdGFtcGluZyBpbiByZWxlYXNlIG5vdGVzLlxuICpcbiAqIFVzZXMgdGhlIGN1cnJlbnQgZGF0ZSwgb3IgYSBwcm92aWRlZCBkYXRlIGluIHRoZSBmb3JtYXQgb2YgWVlZWS1NTS1ERCwgaS5lLiAxOTcwLTExLTA1LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREYXRlU3RhbXAoZGF0ZSA9IG5ldyBEYXRlKCkpIHtcbiAgY29uc3QgeWVhciA9IGAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xuICBjb25zdCBtb250aCA9IGAke2RhdGUuZ2V0TW9udGgoKSArIDF9YC5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBkYXkgPSBgJHtkYXRlLmdldERhdGUoKX1gLnBhZFN0YXJ0KDIsICcwJyk7XG5cbiAgcmV0dXJuIFt5ZWFyLCBtb250aCwgZGF5XS5qb2luKCctJyk7XG59XG4iXX0=