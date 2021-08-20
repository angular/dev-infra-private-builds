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
        /** The version of the release. */
        this.version = this.data.version;
        /** The date stamp string for use in the release notes entry. */
        this.dateStamp = buildDateStamp(this.data.date);
        /** URL fragment that is used to create an anchor for the release. */
        this.urlFragmentForRelease = this.data.version;
        /** List of categorized commits in the release period. */
        this.commits = this._categorizeCommits(this.data.commits);
    }
    /** Gets a list of categorized commits from all commits in the release period. */
    _categorizeCommits(commits) {
        return commits.map((commit) => {
            const { description, groupName } = this.data.categorizeCommit?.(commit) ?? {};
            return {
                groupName: groupName ?? commit.scope,
                description: description ?? commit.subject,
                ...commit,
            };
        });
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
            const key = commit.groupName;
            const groupCommits = groups.get(key) || [];
            groups.set(key, groupCommits);
            groupCommits.push(commit);
        });
        /**
         * List of discovered commit groups which are sorted in alphanumeric order
         * based on the group title.
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
     * Transform a given string by replacing any pull request references with their
     * equivalent markdown links.
     *
     * This is useful for the changelog output. Github transforms pull request references
     * automatically in release note entries, issues and pull requests, but not for plain
     * markdown files (like the changelog file).
     */
    convertPullRequestReferencesToLinks(content) {
        return content.replace(/#(\d+)/g, (_, g) => this.pullRequestToLink(Number(g)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQTRFO0FBSzVFLHlEQUF5RDtBQUN6RCxNQUFNLDRCQUE0QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMscUJBQVksQ0FBQztLQUM3RCxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSywwQkFBaUIsQ0FBQyxPQUFPLENBQUM7S0FDdEUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFNUIsNkNBQTZDO0FBQzdDLE1BQU0sZUFBZSxHQUFHLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFvQjVELHNEQUFzRDtBQUN0RCxNQUFhLGFBQWE7SUFnQnhCLFlBQTZCLElBQXVCO1FBQXZCLFNBQUksR0FBSixJQUFJLENBQW1CO1FBZnBELHdEQUF3RDtRQUN2QyxlQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO1FBQ3pELGdFQUFnRTtRQUMvQyxpQkFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztRQUM3RCx1RUFBdUU7UUFDOUQsVUFBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2pDLGtDQUFrQztRQUN6QixZQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckMsZ0VBQWdFO1FBQ3ZELGNBQVMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwRCxxRUFBcUU7UUFDNUQsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLElB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QUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN4RCxNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFakQsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFORCx3Q0FNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NPTU1JVF9UWVBFUywgUmVsZWFzZU5vdGVzTGV2ZWx9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL2NvbmZpZyc7XG5pbXBvcnQge0NvbW1pdEZyb21HaXRMb2d9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtSZWxlYXNlTm90ZXNDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5cbi8qKiBMaXN0IG9mIHR5cGVzIHRvIGJlIGluY2x1ZGVkIGluIHRoZSByZWxlYXNlIG5vdGVzLiAqL1xuY29uc3QgdHlwZXNUb0luY2x1ZGVJblJlbGVhc2VOb3RlcyA9IE9iamVjdC52YWx1ZXMoQ09NTUlUX1RZUEVTKVxuICAuZmlsdGVyKCh0eXBlKSA9PiB0eXBlLnJlbGVhc2VOb3Rlc0xldmVsID09PSBSZWxlYXNlTm90ZXNMZXZlbC5WaXNpYmxlKVxuICAubWFwKCh0eXBlKSA9PiB0eXBlLm5hbWUpO1xuXG4vKiogTGlzdCBvZiBjb21taXQgYXV0aG9ycyB3aGljaCBhcmUgYm90cy4gKi9cbmNvbnN0IGJvdHNBdXRob3JOYW1lcyA9IFsnZGVwZW5kYWJvdFtib3RdJywgJ1Jlbm92YXRlIEJvdCddO1xuXG4vKiogRGF0YSB1c2VkIGZvciBjb250ZXh0IGR1cmluZyByZW5kZXJpbmcuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlckNvbnRleHREYXRhIHtcbiAgdGl0bGU6IHN0cmluZyB8IGZhbHNlO1xuICBncm91cE9yZGVyOiBSZWxlYXNlTm90ZXNDb25maWdbJ2dyb3VwT3JkZXInXTtcbiAgaGlkZGVuU2NvcGVzOiBSZWxlYXNlTm90ZXNDb25maWdbJ2hpZGRlblNjb3BlcyddO1xuICBjYXRlZ29yaXplQ29tbWl0OiBSZWxlYXNlTm90ZXNDb25maWdbJ2NhdGVnb3JpemVDb21taXQnXTtcbiAgY29tbWl0czogQ29tbWl0RnJvbUdpdExvZ1tdO1xuICB2ZXJzaW9uOiBzdHJpbmc7XG4gIGdpdGh1YjogR2l0aHViQ29uZmlnO1xuICBkYXRlPzogRGF0ZTtcbn1cblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGFuIGNhdGVnb3JpemVkIGNvbW1pdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2F0ZWdvcml6ZWRDb21taXQgZXh0ZW5kcyBDb21taXRGcm9tR2l0TG9nIHtcbiAgZ3JvdXBOYW1lOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG59XG5cbi8qKiBDb250ZXh0IGNsYXNzIHVzZWQgZm9yIHJlbmRlcmluZyByZWxlYXNlIG5vdGVzLiAqL1xuZXhwb3J0IGNsYXNzIFJlbmRlckNvbnRleHQge1xuICAvKiogQW4gYXJyYXkgb2YgZ3JvdXAgbmFtZXMgaW4gc29ydCBvcmRlciBpZiBkZWZpbmVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGdyb3VwT3JkZXIgPSB0aGlzLmRhdGEuZ3JvdXBPcmRlciB8fCBbXTtcbiAgLyoqIEFuIGFycmF5IG9mIHNjb3BlcyB0byBoaWRlIGZyb20gdGhlIHJlbGVhc2UgZW50cnkgb3V0cHV0LiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGhpZGRlblNjb3BlcyA9IHRoaXMuZGF0YS5oaWRkZW5TY29wZXMgfHwgW107XG4gIC8qKiBUaGUgdGl0bGUgb2YgdGhlIHJlbGVhc2UsIG9yIGBmYWxzZWAgaWYgbm8gdGl0bGUgc2hvdWxkIGJlIHVzZWQuICovXG4gIHJlYWRvbmx5IHRpdGxlID0gdGhpcy5kYXRhLnRpdGxlO1xuICAvKiogVGhlIHZlcnNpb24gb2YgdGhlIHJlbGVhc2UuICovXG4gIHJlYWRvbmx5IHZlcnNpb24gPSB0aGlzLmRhdGEudmVyc2lvbjtcbiAgLyoqIFRoZSBkYXRlIHN0YW1wIHN0cmluZyBmb3IgdXNlIGluIHRoZSByZWxlYXNlIG5vdGVzIGVudHJ5LiAqL1xuICByZWFkb25seSBkYXRlU3RhbXAgPSBidWlsZERhdGVTdGFtcCh0aGlzLmRhdGEuZGF0ZSk7XG4gIC8qKiBVUkwgZnJhZ21lbnQgdGhhdCBpcyB1c2VkIHRvIGNyZWF0ZSBhbiBhbmNob3IgZm9yIHRoZSByZWxlYXNlLiAqL1xuICByZWFkb25seSB1cmxGcmFnbWVudEZvclJlbGVhc2UgPSB0aGlzLmRhdGEudmVyc2lvbjtcbiAgLyoqIExpc3Qgb2YgY2F0ZWdvcml6ZWQgY29tbWl0cyBpbiB0aGUgcmVsZWFzZSBwZXJpb2QuICovXG4gIHJlYWRvbmx5IGNvbW1pdHMgPSB0aGlzLl9jYXRlZ29yaXplQ29tbWl0cyh0aGlzLmRhdGEuY29tbWl0cyk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBkYXRhOiBSZW5kZXJDb250ZXh0RGF0YSkge31cblxuICAvKiogR2V0cyBhIGxpc3Qgb2YgY2F0ZWdvcml6ZWQgY29tbWl0cyBmcm9tIGFsbCBjb21taXRzIGluIHRoZSByZWxlYXNlIHBlcmlvZC4gKi9cbiAgX2NhdGVnb3JpemVDb21taXRzKGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSk6IENhdGVnb3JpemVkQ29tbWl0W10ge1xuICAgIHJldHVybiBjb21taXRzLm1hcCgoY29tbWl0KSA9PiB7XG4gICAgICBjb25zdCB7ZGVzY3JpcHRpb24sIGdyb3VwTmFtZX0gPSB0aGlzLmRhdGEuY2F0ZWdvcml6ZUNvbW1pdD8uKGNvbW1pdCkgPz8ge307XG4gICAgICByZXR1cm4ge1xuICAgICAgICBncm91cE5hbWU6IGdyb3VwTmFtZSA/PyBjb21taXQuc2NvcGUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiA/PyBjb21taXQuc3ViamVjdCxcbiAgICAgICAgLi4uY29tbWl0LFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcmdhbml6ZXMgYW5kIHNvcnRzIHRoZSBjb21taXRzIGludG8gZ3JvdXBzIG9mIGNvbW1pdHMuXG4gICAqXG4gICAqIEdyb3VwcyBhcmUgc29ydGVkIGVpdGhlciBieSBkZWZhdWx0IGBBcnJheS5zb3J0YCBvcmRlciwgb3IgdXNpbmcgdGhlIHByb3ZpZGVkIGdyb3VwIG9yZGVyIGZyb21cbiAgICogdGhlIGNvbmZpZ3VyYXRpb24uIENvbW1pdHMgYXJlIG9yZGVyIGluIHRoZSBzYW1lIG9yZGVyIHdpdGhpbiBlYWNoIGdyb3VwcyBjb21taXQgbGlzdCBhcyB0aGV5XG4gICAqIGFwcGVhciBpbiB0aGUgcHJvdmlkZWQgbGlzdCBvZiBjb21taXRzLlxuICAgKiAqL1xuICBhc0NvbW1pdEdyb3Vwcyhjb21taXRzOiBDYXRlZ29yaXplZENvbW1pdFtdKSB7XG4gICAgLyoqIFRoZSBkaXNjb3ZlcmVkIGdyb3VwcyB0byBvcmdhbml6ZSBpbnRvLiAqL1xuICAgIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBDYXRlZ29yaXplZENvbW1pdFtdPigpO1xuXG4gICAgLy8gUGxhY2UgZWFjaCBjb21taXQgaW4gdGhlIGxpc3QgaW50byBpdHMgZ3JvdXAuXG4gICAgY29tbWl0cy5mb3JFYWNoKChjb21taXQpID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IGNvbW1pdC5ncm91cE5hbWU7XG4gICAgICBjb25zdCBncm91cENvbW1pdHMgPSBncm91cHMuZ2V0KGtleSkgfHwgW107XG4gICAgICBncm91cHMuc2V0KGtleSwgZ3JvdXBDb21taXRzKTtcbiAgICAgIGdyb3VwQ29tbWl0cy5wdXNoKGNvbW1pdCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGRpc2NvdmVyZWQgY29tbWl0IGdyb3VwcyB3aGljaCBhcmUgc29ydGVkIGluIGFscGhhbnVtZXJpYyBvcmRlclxuICAgICAqIGJhc2VkIG9uIHRoZSBncm91cCB0aXRsZS5cbiAgICAgKi9cbiAgICBjb25zdCBjb21taXRHcm91cHMgPSBBcnJheS5mcm9tKGdyb3Vwcy5lbnRyaWVzKCkpXG4gICAgICAubWFwKChbdGl0bGUsIGNvbW1pdHNdKSA9PiAoe1xuICAgICAgICB0aXRsZSxcbiAgICAgICAgY29tbWl0czogY29tbWl0cy5zb3J0KChhLCBiKSA9PiAoYS50eXBlID4gYi50eXBlID8gMSA6IGEudHlwZSA8IGIudHlwZSA/IC0xIDogMCkpLFxuICAgICAgfSkpXG4gICAgICAuc29ydCgoYSwgYikgPT4gKGEudGl0bGUgPiBiLnRpdGxlID8gMSA6IGEudGl0bGUgPCBiLnRpdGxlID8gLTEgOiAwKSk7XG5cbiAgICAvLyBJZiB0aGUgY29uZmlndXJhdGlvbiBwcm92aWRlcyBhIHNvcnRpbmcgb3JkZXIsIHVwZGF0ZWQgdGhlIHNvcnRlZCBsaXN0IG9mIGdyb3VwIGtleXMgdG9cbiAgICAvLyBzYXRpc2Z5IHRoZSBvcmRlciBvZiB0aGUgZ3JvdXBzIHByb3ZpZGVkIGluIHRoZSBsaXN0IHdpdGggYW55IGdyb3VwcyBub3QgZm91bmQgaW4gdGhlIGxpc3QgYXRcbiAgICAvLyB0aGUgZW5kIG9mIHRoZSBzb3J0ZWQgbGlzdC5cbiAgICBpZiAodGhpcy5ncm91cE9yZGVyLmxlbmd0aCkge1xuICAgICAgZm9yIChjb25zdCBncm91cFRpdGxlIG9mIHRoaXMuZ3JvdXBPcmRlci5yZXZlcnNlKCkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudElkeCA9IGNvbW1pdEdyb3Vwcy5maW5kSW5kZXgoKGspID0+IGsudGl0bGUgPT09IGdyb3VwVGl0bGUpO1xuICAgICAgICBpZiAoY3VycmVudElkeCAhPT0gLTEpIHtcbiAgICAgICAgICBjb25zdCByZW1vdmVkR3JvdXBzID0gY29tbWl0R3JvdXBzLnNwbGljZShjdXJyZW50SWR4LCAxKTtcbiAgICAgICAgICBjb21taXRHcm91cHMuc3BsaWNlKDAsIDAsIC4uLnJlbW92ZWRHcm91cHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21taXRHcm91cHM7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgc3BlY2lmaWVkIGNvbW1pdCBjb250YWlucyBicmVha2luZyBjaGFuZ2VzLiAqL1xuICBoYXNCcmVha2luZ0NoYW5nZXMoY29tbWl0OiBDYXRlZ29yaXplZENvbW1pdCkge1xuICAgIHJldHVybiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgY29tbWl0IGNvbnRhaW5zIGRlcHJlY2F0aW9ucy4gKi9cbiAgaGFzRGVwcmVjYXRpb25zKGNvbW1pdDogQ2F0ZWdvcml6ZWRDb21taXQpIHtcbiAgICByZXR1cm4gY29tbWl0LmRlcHJlY2F0aW9ucy5sZW5ndGggIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaFxuICAgKiBzaG91bGQgYXBwZWFyIGluIHJlbGVhc2Ugbm90ZXMuXG4gICAqL1xuICBpbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSB7XG4gICAgcmV0dXJuIChjb21taXQ6IENhdGVnb3JpemVkQ29tbWl0KSA9PiB7XG4gICAgICBpZiAodGhpcy5oaWRkZW5TY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbW1pdHMgd2hpY2ggY29udGFpbiBicmVha2luZyBjaGFuZ2VzIG9yIGRlcHJlY2F0aW9ucyBhcmUgYWx3YXlzIGluY2x1ZGVkXG4gICAgICAvLyBpbiByZWxlYXNlIG5vdGVzLiBUaGUgYnJlYWtpbmcgY2hhbmdlIG9yIGRlcHJlY2F0aW9ucyB3aWxsIGFscmVhZHkgYmUgbGlzdGVkXG4gICAgICAvLyBpbiBhIGRlZGljYXRlZCBzZWN0aW9uIGJ1dCBpdCBpcyBzdGlsbCB2YWx1YWJsZSB0byBpbmNsdWRlIHRoZSBhY3R1YWwgY29tbWl0LlxuICAgICAgaWYgKHRoaXMuaGFzQnJlYWtpbmdDaGFuZ2VzKGNvbW1pdCkgfHwgdGhpcy5oYXNEZXByZWNhdGlvbnMoY29tbWl0KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHR5cGVzVG9JbmNsdWRlSW5SZWxlYXNlTm90ZXMuaW5jbHVkZXMoY29tbWl0LnR5cGUpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaCBjb250YWluIGFcbiAgICogdW5pcXVlIHZhbHVlIGZvciB0aGUgcHJvdmlkZWQgZmllbGQgYWNyb3NzIGFsbCBjb21taXRzIGluIHRoZSBsaXN0LlxuICAgKi9cbiAgdW5pcXVlKGZpZWxkOiBrZXlvZiBDYXRlZ29yaXplZENvbW1pdCkge1xuICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8Q2F0ZWdvcml6ZWRDb21taXRbdHlwZW9mIGZpZWxkXT4oKTtcbiAgICByZXR1cm4gKGNvbW1pdDogQ2F0ZWdvcml6ZWRDb21taXQpID0+IHtcbiAgICAgIGNvbnN0IGluY2x1ZGUgPSAhc2V0Lmhhcyhjb21taXRbZmllbGRdKTtcbiAgICAgIHNldC5hZGQoY29tbWl0W2ZpZWxkXSk7XG4gICAgICByZXR1cm4gaW5jbHVkZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBjb21taXQgb2JqZWN0IHRvIGEgTWFya2Rvd24gbGluay5cbiAgICovXG4gIGNvbW1pdFRvTGluayhjb21taXQ6IENhdGVnb3JpemVkQ29tbWl0KTogc3RyaW5nIHtcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tLyR7dGhpcy5kYXRhLmdpdGh1Yi5vd25lcn0vJHt0aGlzLmRhdGEuZ2l0aHViLm5hbWV9L2NvbW1pdC8ke2NvbW1pdC5oYXNofWA7XG4gICAgcmV0dXJuIGBbJHtjb21taXQuc2hvcnRIYXNofV0oJHt1cmx9KWA7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIHB1bGwgcmVxdWVzdCBudW1iZXIgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgcHVsbFJlcXVlc3RUb0xpbmsocHJOdW1iZXI6IG51bWJlcik6IHN0cmluZyB7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3RoaXMuZGF0YS5naXRodWIub3duZXJ9LyR7dGhpcy5kYXRhLmdpdGh1Yi5uYW1lfS9wdWxsLyR7cHJOdW1iZXJ9YDtcbiAgICByZXR1cm4gYFsjJHtwck51bWJlcn1dKCR7dXJsfSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBhIGdpdmVuIHN0cmluZyBieSByZXBsYWNpbmcgYW55IHB1bGwgcmVxdWVzdCByZWZlcmVuY2VzIHdpdGggdGhlaXJcbiAgICogZXF1aXZhbGVudCBtYXJrZG93biBsaW5rcy5cbiAgICpcbiAgICogVGhpcyBpcyB1c2VmdWwgZm9yIHRoZSBjaGFuZ2Vsb2cgb3V0cHV0LiBHaXRodWIgdHJhbnNmb3JtcyBwdWxsIHJlcXVlc3QgcmVmZXJlbmNlc1xuICAgKiBhdXRvbWF0aWNhbGx5IGluIHJlbGVhc2Ugbm90ZSBlbnRyaWVzLCBpc3N1ZXMgYW5kIHB1bGwgcmVxdWVzdHMsIGJ1dCBub3QgZm9yIHBsYWluXG4gICAqIG1hcmtkb3duIGZpbGVzIChsaWtlIHRoZSBjaGFuZ2Vsb2cgZmlsZSkuXG4gICAqL1xuICBjb252ZXJ0UHVsbFJlcXVlc3RSZWZlcmVuY2VzVG9MaW5rcyhjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBjb250ZW50LnJlcGxhY2UoLyMoXFxkKykvZywgKF8sIGcpID0+IHRoaXMucHVsbFJlcXVlc3RUb0xpbmsoTnVtYmVyKGcpKSk7XG4gIH1cblxuICAvKipcbiAgICogQnVsbGV0aXplIGEgcGFyYWdyYXBoLlxuICAgKi9cbiAgYnVsbGV0aXplVGV4dCh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiAnLSAnICsgdGV4dC5yZXBsYWNlKC9cXFxcbi9nLCAnXFxcXG4gICcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdW5pcXVlLCBzb3J0ZWQgYW5kIGZpbHRlcmVkIGNvbW1pdCBhdXRob3JzLlxuICAgKi9cbiAgY29tbWl0QXV0aG9ycyhjb21taXRzOiBDYXRlZ29yaXplZENvbW1pdFtdKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBbLi4ubmV3IFNldChjb21taXRzLm1hcCgoYykgPT4gYy5hdXRob3IpKV1cbiAgICAgIC5maWx0ZXIoKGEpID0+ICFib3RzQXV0aG9yTmFtZXMuaW5jbHVkZXMoYSkpXG4gICAgICAuc29ydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBjb21taXQgb2JqZWN0IHRvIGEgTWFya2Rvd24gbGlua2VkIGJhZGdlZC5cbiAgICovXG4gIGNvbW1pdFRvQmFkZ2UoY29tbWl0OiBDYXRlZ29yaXplZENvbW1pdCk6IHN0cmluZyB7XG4gICAgbGV0IGNvbG9yID0gJ3llbGxvdyc7XG4gICAgc3dpdGNoIChjb21taXQudHlwZSkge1xuICAgICAgY2FzZSAnZml4JzpcbiAgICAgICAgY29sb3IgPSAnZ3JlZW4nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ZlYXQnOlxuICAgICAgICBjb2xvciA9ICdibHVlJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwZXJmJzpcbiAgICAgICAgY29sb3IgPSAnb3JhbmdlJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHt0aGlzLmRhdGEuZ2l0aHViLm93bmVyfS8ke3RoaXMuZGF0YS5naXRodWIubmFtZX0vY29tbWl0LyR7Y29tbWl0Lmhhc2h9YDtcbiAgICBjb25zdCBpbWdTcmMgPSBgaHR0cHM6Ly9pbWcuc2hpZWxkcy5pby9iYWRnZS8ke2NvbW1pdC5zaG9ydEhhc2h9LSR7Y29tbWl0LnR5cGV9LSR7Y29sb3J9YDtcbiAgICByZXR1cm4gYFshWyR7Y29tbWl0LnR5cGV9IC0gJHtjb21taXQuc2hvcnRIYXNofV0oJHtpbWdTcmN9KV0oJHt1cmx9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBkYXRlIHN0YW1wIGZvciBzdGFtcGluZyBpbiByZWxlYXNlIG5vdGVzLlxuICpcbiAqIFVzZXMgdGhlIGN1cnJlbnQgZGF0ZSwgb3IgYSBwcm92aWRlZCBkYXRlIGluIHRoZSBmb3JtYXQgb2YgWVlZWS1NTS1ERCwgaS5lLiAxOTcwLTExLTA1LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREYXRlU3RhbXAoZGF0ZSA9IG5ldyBEYXRlKCkpIHtcbiAgY29uc3QgeWVhciA9IGAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xuICBjb25zdCBtb250aCA9IGAke2RhdGUuZ2V0TW9udGgoKSArIDF9YC5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBkYXkgPSBgJHtkYXRlLmdldERhdGUoKX1gLnBhZFN0YXJ0KDIsICcwJyk7XG5cbiAgcmV0dXJuIFt5ZWFyLCBtb250aCwgZGF5XS5qb2luKCctJyk7XG59XG4iXX0=