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
/** List of commit authors which are bots. */
const botsAuthorNames = ['dependabot[bot]', 'Renovate Bot'];
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
        /** URL fragment that is used to create an anchor for the release. */
        this.urlFragmentForRelease = this.data.version;
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
            .map(([title, commits]) => ({
            title,
            commits: commits.sort((a, b) => (a.type > b.type ? 1 : a.type < b.type ? -1 : 0)),
        }))
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
    /**
     * Bulletize a paragraph.
     */
    bulletizeText(text) {
        return '- ' + text.replace(/\\n/g, '\\n  ');
    }
    /**
     * Returns unique, sorted and filtered commit authors.
     */
    commitAuthors(commits) {
        return [...new Set(commits.map((c) => c.author))]
            .filter((a) => !botsAuthorNames.includes(a))
            .sort();
    }
    /**
     * Convert a commit object to a Markdown linked badged.
     */
    commitToBadge(commit) {
        let color = 'yellow';
        switch (commit.type) {
            case 'fix':
                color = 'green';
                break;
            case 'feat':
                color = 'blue';
                break;
            case 'perf':
                color = 'orange';
                break;
        }
        const url = `https://github.com/${this.data.github.owner}/${this.data.github.name}/commit/${commit.hash}`;
        const imgSrc = `https://img.shields.io/badge/${commit.shortHash}-${commit.type}-${color}`;
        return `[![${commit.type} - ${commit.shortHash}](${imgSrc})](${url})`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQTRFO0FBSzVFLHlEQUF5RDtBQUN6RCxNQUFNLDRCQUE0QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMscUJBQVksQ0FBQztLQUM3RCxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSywwQkFBaUIsQ0FBQyxPQUFPLENBQUM7S0FDdEUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFNUIsNkNBQTZDO0FBQzdDLE1BQU0sZUFBZSxHQUFHLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFhNUQsc0RBQXNEO0FBQ3RELE1BQWEsYUFBYTtJQWdCeEIsWUFBNkIsSUFBdUI7UUFBdkIsU0FBSSxHQUFKLElBQUksQ0FBbUI7UUFmcEQsd0RBQXdEO1FBQ3ZDLGVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7UUFDekQsZ0VBQWdFO1FBQy9DLGlCQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDO1FBQzdELHVFQUF1RTtRQUM5RCxVQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDakMsaURBQWlEO1FBQ3hDLFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQyxrQ0FBa0M7UUFDekIsWUFBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JDLGdFQUFnRTtRQUN2RCxjQUFTLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMs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Q29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q09NTUlUX1RZUEVTLCBSZWxlYXNlTm90ZXNMZXZlbH0gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvY29uZmlnJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtHaXRDbGllbnRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge1JlbGVhc2VOb3Rlc0NvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuLyoqIExpc3Qgb2YgdHlwZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIHJlbGVhc2Ugbm90ZXMuICovXG5jb25zdCB0eXBlc1RvSW5jbHVkZUluUmVsZWFzZU5vdGVzID0gT2JqZWN0LnZhbHVlcyhDT01NSVRfVFlQRVMpXG4gIC5maWx0ZXIoKHR5cGUpID0+IHR5cGUucmVsZWFzZU5vdGVzTGV2ZWwgPT09IFJlbGVhc2VOb3Rlc0xldmVsLlZpc2libGUpXG4gIC5tYXAoKHR5cGUpID0+IHR5cGUubmFtZSk7XG5cbi8qKiBMaXN0IG9mIGNvbW1pdCBhdXRob3JzIHdoaWNoIGFyZSBib3RzLiAqL1xuY29uc3QgYm90c0F1dGhvck5hbWVzID0gWydkZXBlbmRhYm90W2JvdF0nLCAnUmVub3ZhdGUgQm90J107XG5cbi8qKiBEYXRhIHVzZWQgZm9yIGNvbnRleHQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyQ29udGV4dERhdGEge1xuICB0aXRsZTogc3RyaW5nIHwgZmFsc2U7XG4gIGdyb3VwT3JkZXI/OiBSZWxlYXNlTm90ZXNDb25maWdbJ2dyb3VwT3JkZXInXTtcbiAgaGlkZGVuU2NvcGVzPzogUmVsZWFzZU5vdGVzQ29uZmlnWydoaWRkZW5TY29wZXMnXTtcbiAgZGF0ZT86IERhdGU7XG4gIGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXTtcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBnaXRodWI6IEdpdENsaWVudENvbmZpZztcbn1cblxuLyoqIENvbnRleHQgY2xhc3MgdXNlZCBmb3IgcmVuZGVyaW5nIHJlbGVhc2Ugbm90ZXMuICovXG5leHBvcnQgY2xhc3MgUmVuZGVyQ29udGV4dCB7XG4gIC8qKiBBbiBhcnJheSBvZiBncm91cCBuYW1lcyBpbiBzb3J0IG9yZGVyIGlmIGRlZmluZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgZ3JvdXBPcmRlciA9IHRoaXMuZGF0YS5ncm91cE9yZGVyIHx8IFtdO1xuICAvKiogQW4gYXJyYXkgb2Ygc2NvcGVzIHRvIGhpZGUgZnJvbSB0aGUgcmVsZWFzZSBlbnRyeSBvdXRwdXQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgaGlkZGVuU2NvcGVzID0gdGhpcy5kYXRhLmhpZGRlblNjb3BlcyB8fCBbXTtcbiAgLyoqIFRoZSB0aXRsZSBvZiB0aGUgcmVsZWFzZSwgb3IgYGZhbHNlYCBpZiBubyB0aXRsZSBzaG91bGQgYmUgdXNlZC4gKi9cbiAgcmVhZG9ubHkgdGl0bGUgPSB0aGlzLmRhdGEudGl0bGU7XG4gIC8qKiBBbiBhcnJheSBvZiBjb21taXRzIGluIHRoZSByZWxlYXNlIHBlcmlvZC4gKi9cbiAgcmVhZG9ubHkgY29tbWl0cyA9IHRoaXMuZGF0YS5jb21taXRzO1xuICAvKiogVGhlIHZlcnNpb24gb2YgdGhlIHJlbGVhc2UuICovXG4gIHJlYWRvbmx5IHZlcnNpb24gPSB0aGlzLmRhdGEudmVyc2lvbjtcbiAgLyoqIFRoZSBkYXRlIHN0YW1wIHN0cmluZyBmb3IgdXNlIGluIHRoZSByZWxlYXNlIG5vdGVzIGVudHJ5LiAqL1xuICByZWFkb25seSBkYXRlU3RhbXAgPSBidWlsZERhdGVTdGFtcCh0aGlzLmRhdGEuZGF0ZSk7XG4gIC8qKiBVUkwgZnJhZ21lbnQgdGhhdCBpcyB1c2VkIHRvIGNyZWF0ZSBhbiBhbmNob3IgZm9yIHRoZSByZWxlYXNlLiAqL1xuICByZWFkb25seSB1cmxGcmFnbWVudEZvclJlbGVhc2UgPSB0aGlzLmRhdGEudmVyc2lvbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGRhdGE6IFJlbmRlckNvbnRleHREYXRhKSB7fVxuXG4gIC8qKlxuICAgKiBPcmdhbml6ZXMgYW5kIHNvcnRzIHRoZSBjb21taXRzIGludG8gZ3JvdXBzIG9mIGNvbW1pdHMuXG4gICAqXG4gICAqIEdyb3VwcyBhcmUgc29ydGVkIGVpdGhlciBieSBkZWZhdWx0IGBBcnJheS5zb3J0YCBvcmRlciwgb3IgdXNpbmcgdGhlIHByb3ZpZGVkIGdyb3VwIG9yZGVyIGZyb21cbiAgICogdGhlIGNvbmZpZ3VyYXRpb24uIENvbW1pdHMgYXJlIG9yZGVyIGluIHRoZSBzYW1lIG9yZGVyIHdpdGhpbiBlYWNoIGdyb3VwcyBjb21taXQgbGlzdCBhcyB0aGV5XG4gICAqIGFwcGVhciBpbiB0aGUgcHJvdmlkZWQgbGlzdCBvZiBjb21taXRzLlxuICAgKiAqL1xuICBhc0NvbW1pdEdyb3Vwcyhjb21taXRzOiBDb21taXRGcm9tR2l0TG9nW10pIHtcbiAgICAvKiogVGhlIGRpc2NvdmVyZWQgZ3JvdXBzIHRvIG9yZ2FuaXplIGludG8uICovXG4gICAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIENvbW1pdEZyb21HaXRMb2dbXT4oKTtcblxuICAgIC8vIFBsYWNlIGVhY2ggY29tbWl0IGluIHRoZSBsaXN0IGludG8gaXRzIGdyb3VwLlxuICAgIGNvbW1pdHMuZm9yRWFjaCgoY29tbWl0KSA9PiB7XG4gICAgICBjb25zdCBrZXkgPSBjb21taXQubnBtU2NvcGUgPyBgJHtjb21taXQubnBtU2NvcGV9LyR7Y29tbWl0LnNjb3BlfWAgOiBjb21taXQuc2NvcGU7XG4gICAgICBjb25zdCBncm91cENvbW1pdHMgPSBncm91cHMuZ2V0KGtleSkgfHwgW107XG4gICAgICBncm91cHMuc2V0KGtleSwgZ3JvdXBDb21taXRzKTtcbiAgICAgIGdyb3VwQ29tbWl0cy5wdXNoKGNvbW1pdCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBDb21taXRHcm91cHMgY29udGFpbmluZyB0aGUgZGlzY292ZXJlZCBjb21taXQgZ3JvdXBzLiBTb3J0ZWQgaW4gYWxwaGFudW1lcmljIG9yZGVyXG4gICAgICogb2YgdGhlIGdyb3VwIHRpdGxlLlxuICAgICAqL1xuICAgIGNvbnN0IGNvbW1pdEdyb3VwcyA9IEFycmF5LmZyb20oZ3JvdXBzLmVudHJpZXMoKSlcbiAgICAgIC5tYXAoKFt0aXRsZSwgY29tbWl0c10pID0+ICh7XG4gICAgICAgIHRpdGxlLFxuICAgICAgICBjb21taXRzOiBjb21taXRzLnNvcnQoKGEsIGIpID0+IChhLnR5cGUgPiBiLnR5cGUgPyAxIDogYS50eXBlIDwgYi50eXBlID8gLTEgOiAwKSksXG4gICAgICB9KSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiAoYS50aXRsZSA+IGIudGl0bGUgPyAxIDogYS50aXRsZSA8IGIudGl0bGUgPyAtMSA6IDApKTtcblxuICAgIC8vIElmIHRoZSBjb25maWd1cmF0aW9uIHByb3ZpZGVzIGEgc29ydGluZyBvcmRlciwgdXBkYXRlZCB0aGUgc29ydGVkIGxpc3Qgb2YgZ3JvdXAga2V5cyB0b1xuICAgIC8vIHNhdGlzZnkgdGhlIG9yZGVyIG9mIHRoZSBncm91cHMgcHJvdmlkZWQgaW4gdGhlIGxpc3Qgd2l0aCBhbnkgZ3JvdXBzIG5vdCBmb3VuZCBpbiB0aGUgbGlzdCBhdFxuICAgIC8vIHRoZSBlbmQgb2YgdGhlIHNvcnRlZCBsaXN0LlxuICAgIGlmICh0aGlzLmdyb3VwT3JkZXIubGVuZ3RoKSB7XG4gICAgICBmb3IgKGNvbnN0IGdyb3VwVGl0bGUgb2YgdGhpcy5ncm91cE9yZGVyLnJldmVyc2UoKSkge1xuICAgICAgICBjb25zdCBjdXJyZW50SWR4ID0gY29tbWl0R3JvdXBzLmZpbmRJbmRleCgoaykgPT4gay50aXRsZSA9PT0gZ3JvdXBUaXRsZSk7XG4gICAgICAgIGlmIChjdXJyZW50SWR4ICE9PSAtMSkge1xuICAgICAgICAgIGNvbnN0IHJlbW92ZWRHcm91cHMgPSBjb21taXRHcm91cHMuc3BsaWNlKGN1cnJlbnRJZHgsIDEpO1xuICAgICAgICAgIGNvbW1pdEdyb3Vwcy5zcGxpY2UoMCwgMCwgLi4ucmVtb3ZlZEdyb3Vwcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbW1pdEdyb3VwcztcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgY29tbWl0IGNvbnRhaW5zIGJyZWFraW5nIGNoYW5nZXMuICovXG4gIGhhc0JyZWFraW5nQ2hhbmdlcyhjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpIHtcbiAgICByZXR1cm4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDA7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgc3BlY2lmaWVkIGNvbW1pdCBjb250YWlucyBkZXByZWNhdGlvbnMuICovXG4gIGhhc0RlcHJlY2F0aW9ucyhjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpIHtcbiAgICByZXR1cm4gY29tbWl0LmRlcHJlY2F0aW9ucy5sZW5ndGggIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaFxuICAgKiBzaG91bGQgYXBwZWFyIGluIHJlbGVhc2Ugbm90ZXMuXG4gICAqL1xuICBpbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSB7XG4gICAgcmV0dXJuIChjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpID0+IHtcbiAgICAgIGlmICh0aGlzLmhpZGRlblNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29tbWl0cyB3aGljaCBjb250YWluIGJyZWFraW5nIGNoYW5nZXMgb3IgZGVwcmVjYXRpb25zIGFyZSBhbHdheXMgaW5jbHVkZWRcbiAgICAgIC8vIGluIHJlbGVhc2Ugbm90ZXMuIFRoZSBicmVha2luZyBjaGFuZ2Ugb3IgZGVwcmVjYXRpb25zIHdpbGwgYWxyZWFkeSBiZSBsaXN0ZWRcbiAgICAgIC8vIGluIGEgZGVkaWNhdGVkIHNlY3Rpb24gYnV0IGl0IGlzIHN0aWxsIHZhbHVhYmxlIHRvIGluY2x1ZGUgdGhlIGFjdHVhbCBjb21taXQuXG4gICAgICBpZiAodGhpcy5oYXNCcmVha2luZ0NoYW5nZXMoY29tbWl0KSB8fCB0aGlzLmhhc0RlcHJlY2F0aW9ucyhjb21taXQpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHlwZXNUb0luY2x1ZGVJblJlbGVhc2VOb3Rlcy5pbmNsdWRlcyhjb21taXQudHlwZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGZpbHRlciBmdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGEgbGlzdCBvZiBjb21taXRzIHRvIG9ubHkgaW5jbHVkZSBjb21taXRzIHdoaWNoIGNvbnRhaW4gYVxuICAgKiB1bmlxdWUgdmFsdWUgZm9yIHRoZSBwcm92aWRlZCBmaWVsZCBhY3Jvc3MgYWxsIGNvbW1pdHMgaW4gdGhlIGxpc3QuXG4gICAqL1xuICB1bmlxdWUoZmllbGQ6IGtleW9mIENvbW1pdEZyb21HaXRMb2cpIHtcbiAgICBjb25zdCBzZXQgPSBuZXcgU2V0PENvbW1pdEZyb21HaXRMb2dbdHlwZW9mIGZpZWxkXT4oKTtcbiAgICByZXR1cm4gKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykgPT4ge1xuICAgICAgY29uc3QgaW5jbHVkZSA9ICFzZXQuaGFzKGNvbW1pdFtmaWVsZF0pO1xuICAgICAgc2V0LmFkZChjb21taXRbZmllbGRdKTtcbiAgICAgIHJldHVybiBpbmNsdWRlO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIGNvbW1pdCBvYmplY3QgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgY29tbWl0VG9MaW5rKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3RoaXMuZGF0YS5naXRodWIub3duZXJ9LyR7dGhpcy5kYXRhLmdpdGh1Yi5uYW1lfS9jb21taXQvJHtjb21taXQuaGFzaH1gO1xuICAgIHJldHVybiBgWyR7Y29tbWl0LnNob3J0SGFzaH1dKCR7dXJsfSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBwdWxsIHJlcXVlc3QgbnVtYmVyIHRvIGEgTWFya2Rvd24gbGluay5cbiAgICovXG4gIHB1bGxSZXF1ZXN0VG9MaW5rKHByTnVtYmVyOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHt0aGlzLmRhdGEuZ2l0aHViLm93bmVyfS8ke3RoaXMuZGF0YS5naXRodWIubmFtZX0vcHVsbC8ke3ByTnVtYmVyfWA7XG4gICAgcmV0dXJuIGBbIyR7cHJOdW1iZXJ9XSgke3VybH0pYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gYSBjb21taXQgbWVzc2FnZSBoZWFkZXIgYnkgcmVwbGFjaW5nIHRoZSBwYXJlbnRoZXNpemVkIHB1bGwgcmVxdWVzdCByZWZlcmVuY2UgYXQgdGhlXG4gICAqIGVuZCBvZiB0aGUgbGluZSAod2hpY2ggaXMgYWRkZWQgYnkgbWVyZ2UgdG9vbGluZykgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgcmVwbGFjZUNvbW1pdEhlYWRlclB1bGxSZXF1ZXN0TnVtYmVyKGhlYWRlcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaGVhZGVyLnJlcGxhY2UoL1xcKCMoXFxkKylcXCkkLywgKF8sIGcpID0+IGAoJHt0aGlzLnB1bGxSZXF1ZXN0VG9MaW5rKCtnKX0pYCk7XG4gIH1cblxuICAvKipcbiAgICogQnVsbGV0aXplIGEgcGFyYWdyYXBoLlxuICAgKi9cbiAgYnVsbGV0aXplVGV4dCh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiAnLSAnICsgdGV4dC5yZXBsYWNlKC9cXFxcbi9nLCAnXFxcXG4gICcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdW5pcXVlLCBzb3J0ZWQgYW5kIGZpbHRlcmVkIGNvbW1pdCBhdXRob3JzLlxuICAgKi9cbiAgY29tbWl0QXV0aG9ycyhjb21taXRzOiBDb21taXRGcm9tR2l0TG9nW10pOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIFsuLi5uZXcgU2V0KGNvbW1pdHMubWFwKChjKSA9PiBjLmF1dGhvcikpXVxuICAgICAgLmZpbHRlcigoYSkgPT4gIWJvdHNBdXRob3JOYW1lcy5pbmNsdWRlcyhhKSlcbiAgICAgIC5zb3J0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIGNvbW1pdCBvYmplY3QgdG8gYSBNYXJrZG93biBsaW5rZWQgYmFkZ2VkLlxuICAgKi9cbiAgY29tbWl0VG9CYWRnZShjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpOiBzdHJpbmcge1xuICAgIGxldCBjb2xvciA9ICd5ZWxsb3cnO1xuICAgIHN3aXRjaCAoY29tbWl0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ2ZpeCc6XG4gICAgICAgIGNvbG9yID0gJ2dyZWVuJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmZWF0JzpcbiAgICAgICAgY29sb3IgPSAnYmx1ZSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGVyZic6XG4gICAgICAgIGNvbG9yID0gJ29yYW5nZSc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tLyR7dGhpcy5kYXRhLmdpdGh1Yi5vd25lcn0vJHt0aGlzLmRhdGEuZ2l0aHViLm5hbWV9L2NvbW1pdC8ke2NvbW1pdC5oYXNofWA7XG4gICAgY29uc3QgaW1nU3JjID0gYGh0dHBzOi8vaW1nLnNoaWVsZHMuaW8vYmFkZ2UvJHtjb21taXQuc2hvcnRIYXNofS0ke2NvbW1pdC50eXBlfS0ke2NvbG9yfWA7XG4gICAgcmV0dXJuIGBbIVske2NvbW1pdC50eXBlfSAtICR7Y29tbWl0LnNob3J0SGFzaH1dKCR7aW1nU3JjfSldKCR7dXJsfSlgO1xuICB9XG59XG5cbi8qKlxuICogQnVpbGRzIGEgZGF0ZSBzdGFtcCBmb3Igc3RhbXBpbmcgaW4gcmVsZWFzZSBub3Rlcy5cbiAqXG4gKiBVc2VzIHRoZSBjdXJyZW50IGRhdGUsIG9yIGEgcHJvdmlkZWQgZGF0ZSBpbiB0aGUgZm9ybWF0IG9mIFlZWVktTU0tREQsIGkuZS4gMTk3MC0xMS0wNS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGF0ZVN0YW1wKGRhdGUgPSBuZXcgRGF0ZSgpKSB7XG4gIGNvbnN0IHllYXIgPSBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9YDtcbiAgY29uc3QgbW9udGggPSBgJHtkYXRlLmdldE1vbnRoKCkgKyAxfWAucGFkU3RhcnQoMiwgJzAnKTtcbiAgY29uc3QgZGF5ID0gYCR7ZGF0ZS5nZXREYXRlKCl9YC5wYWRTdGFydCgyLCAnMCcpO1xuXG4gIHJldHVybiBbeWVhciwgbW9udGgsIGRheV0uam9pbignLScpO1xufVxuIl19