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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQTRFO0FBSzVFLHlEQUF5RDtBQUN6RCxNQUFNLDRCQUE0QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMscUJBQVksQ0FBQztLQUM3RCxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSywwQkFBaUIsQ0FBQyxPQUFPLENBQUM7S0FDdEUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFNUIsNkNBQTZDO0FBQzdDLE1BQU0sZUFBZSxHQUFHLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFhNUQsc0RBQXNEO0FBQ3RELE1BQWEsYUFBYTtJQWN4QixZQUE2QixJQUF1QjtRQUF2QixTQUFJLEdBQUosSUFBSSxDQUFtQjtRQWJwRCx3REFBd0Q7UUFDdkMsZUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztRQUN6RCxnRUFBZ0U7UUFDL0MsaUJBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7UUFDN0QsdUVBQXVFO1FBQzlELFVBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNqQyxpREFBaUQ7UUFDeEMsWUFBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JDLGtDQUFrQztRQUN6QixZQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckMsZ0VBQWdFO1FBQ3ZELGNBQVMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJ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QUNmLE1BQU07WUFDUixLQUFLLE1BQU07Z0JBQ1QsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDakIsTUFBTTtTQUNUO1FBQ0QsTUFBTSxHQUFHLEdBQUcsc0JBQXNCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFdBQVcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFHLE1BQU0sTUFBTSxHQUFHLGdDQUFnQyxNQUFNLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7UUFDMUYsT0FBTyxNQUFNLE1BQU0sQ0FBQyxJQUFJLE1BQU0sTUFBTSxDQUFDLFNBQVMsS0FBSyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUM7SUFDeEUsQ0FBQztDQUNGO0FBcktELHNDQXFLQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixjQUFjLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO0lBQzlDLE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7SUFDckMsTUFBTSxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN4RCxNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFakQsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFORCx3Q0FNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NPTU1JVF9UWVBFUywgUmVsZWFzZU5vdGVzTGV2ZWx9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL2NvbmZpZyc7XG5pbXBvcnQge0NvbW1pdEZyb21HaXRMb2d9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtSZWxlYXNlTm90ZXNDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5cbi8qKiBMaXN0IG9mIHR5cGVzIHRvIGJlIGluY2x1ZGVkIGluIHRoZSByZWxlYXNlIG5vdGVzLiAqL1xuY29uc3QgdHlwZXNUb0luY2x1ZGVJblJlbGVhc2VOb3RlcyA9IE9iamVjdC52YWx1ZXMoQ09NTUlUX1RZUEVTKVxuICAuZmlsdGVyKCh0eXBlKSA9PiB0eXBlLnJlbGVhc2VOb3Rlc0xldmVsID09PSBSZWxlYXNlTm90ZXNMZXZlbC5WaXNpYmxlKVxuICAubWFwKCh0eXBlKSA9PiB0eXBlLm5hbWUpO1xuXG4vKiogTGlzdCBvZiBjb21taXQgYXV0aG9ycyB3aGljaCBhcmUgYm90cy4gKi9cbmNvbnN0IGJvdHNBdXRob3JOYW1lcyA9IFsnZGVwZW5kYWJvdFtib3RdJywgJ1Jlbm92YXRlIEJvdCddO1xuXG4vKiogRGF0YSB1c2VkIGZvciBjb250ZXh0IGR1cmluZyByZW5kZXJpbmcuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlckNvbnRleHREYXRhIHtcbiAgdGl0bGU6IHN0cmluZyB8IGZhbHNlO1xuICBncm91cE9yZGVyPzogUmVsZWFzZU5vdGVzQ29uZmlnWydncm91cE9yZGVyJ107XG4gIGhpZGRlblNjb3Blcz86IFJlbGVhc2VOb3Rlc0NvbmZpZ1snaGlkZGVuU2NvcGVzJ107XG4gIGRhdGU/OiBEYXRlO1xuICBjb21taXRzOiBDb21taXRGcm9tR2l0TG9nW107XG4gIHZlcnNpb246IHN0cmluZztcbiAgZ2l0aHViOiBHaXRodWJDb25maWc7XG59XG5cbi8qKiBDb250ZXh0IGNsYXNzIHVzZWQgZm9yIHJlbmRlcmluZyByZWxlYXNlIG5vdGVzLiAqL1xuZXhwb3J0IGNsYXNzIFJlbmRlckNvbnRleHQge1xuICAvKiogQW4gYXJyYXkgb2YgZ3JvdXAgbmFtZXMgaW4gc29ydCBvcmRlciBpZiBkZWZpbmVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGdyb3VwT3JkZXIgPSB0aGlzLmRhdGEuZ3JvdXBPcmRlciB8fCBbXTtcbiAgLyoqIEFuIGFycmF5IG9mIHNjb3BlcyB0byBoaWRlIGZyb20gdGhlIHJlbGVhc2UgZW50cnkgb3V0cHV0LiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGhpZGRlblNjb3BlcyA9IHRoaXMuZGF0YS5oaWRkZW5TY29wZXMgfHwgW107XG4gIC8qKiBUaGUgdGl0bGUgb2YgdGhlIHJlbGVhc2UsIG9yIGBmYWxzZWAgaWYgbm8gdGl0bGUgc2hvdWxkIGJlIHVzZWQuICovXG4gIHJlYWRvbmx5IHRpdGxlID0gdGhpcy5kYXRhLnRpdGxlO1xuICAvKiogQW4gYXJyYXkgb2YgY29tbWl0cyBpbiB0aGUgcmVsZWFzZSBwZXJpb2QuICovXG4gIHJlYWRvbmx5IGNvbW1pdHMgPSB0aGlzLmRhdGEuY29tbWl0cztcbiAgLyoqIFRoZSB2ZXJzaW9uIG9mIHRoZSByZWxlYXNlLiAqL1xuICByZWFkb25seSB2ZXJzaW9uID0gdGhpcy5kYXRhLnZlcnNpb247XG4gIC8qKiBUaGUgZGF0ZSBzdGFtcCBzdHJpbmcgZm9yIHVzZSBpbiB0aGUgcmVsZWFzZSBub3RlcyBlbnRyeS4gKi9cbiAgcmVhZG9ubHkgZGF0ZVN0YW1wID0gYnVpbGREYXRlU3RhbXAodGhpcy5kYXRhLmRhdGUpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZGF0YTogUmVuZGVyQ29udGV4dERhdGEpIHt9XG5cbiAgLyoqXG4gICAqIE9yZ2FuaXplcyBhbmQgc29ydHMgdGhlIGNvbW1pdHMgaW50byBncm91cHMgb2YgY29tbWl0cy5cbiAgICpcbiAgICogR3JvdXBzIGFyZSBzb3J0ZWQgZWl0aGVyIGJ5IGRlZmF1bHQgYEFycmF5LnNvcnRgIG9yZGVyLCBvciB1c2luZyB0aGUgcHJvdmlkZWQgZ3JvdXAgb3JkZXIgZnJvbVxuICAgKiB0aGUgY29uZmlndXJhdGlvbi4gQ29tbWl0cyBhcmUgb3JkZXIgaW4gdGhlIHNhbWUgb3JkZXIgd2l0aGluIGVhY2ggZ3JvdXBzIGNvbW1pdCBsaXN0IGFzIHRoZXlcbiAgICogYXBwZWFyIGluIHRoZSBwcm92aWRlZCBsaXN0IG9mIGNvbW1pdHMuXG4gICAqICovXG4gIGFzQ29tbWl0R3JvdXBzKGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSkge1xuICAgIC8qKiBUaGUgZGlzY292ZXJlZCBncm91cHMgdG8gb3JnYW5pemUgaW50by4gKi9cbiAgICBjb25zdCBncm91cHMgPSBuZXcgTWFwPHN0cmluZywgQ29tbWl0RnJvbUdpdExvZ1tdPigpO1xuXG4gICAgLy8gUGxhY2UgZWFjaCBjb21taXQgaW4gdGhlIGxpc3QgaW50byBpdHMgZ3JvdXAuXG4gICAgY29tbWl0cy5mb3JFYWNoKChjb21taXQpID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IGNvbW1pdC5ucG1TY29wZSA/IGAke2NvbW1pdC5ucG1TY29wZX0vJHtjb21taXQuc2NvcGV9YCA6IGNvbW1pdC5zY29wZTtcbiAgICAgIGNvbnN0IGdyb3VwQ29tbWl0cyA9IGdyb3Vwcy5nZXQoa2V5KSB8fCBbXTtcbiAgICAgIGdyb3Vwcy5zZXQoa2V5LCBncm91cENvbW1pdHMpO1xuICAgICAgZ3JvdXBDb21taXRzLnB1c2goY29tbWl0KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIENvbW1pdEdyb3VwcyBjb250YWluaW5nIHRoZSBkaXNjb3ZlcmVkIGNvbW1pdCBncm91cHMuIFNvcnRlZCBpbiBhbHBoYW51bWVyaWMgb3JkZXJcbiAgICAgKiBvZiB0aGUgZ3JvdXAgdGl0bGUuXG4gICAgICovXG4gICAgY29uc3QgY29tbWl0R3JvdXBzID0gQXJyYXkuZnJvbShncm91cHMuZW50cmllcygpKVxuICAgICAgLm1hcCgoW3RpdGxlLCBjb21taXRzXSkgPT4gKHtcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIGNvbW1pdHM6IGNvbW1pdHMuc29ydCgoYSwgYikgPT4gKGEudHlwZSA+IGIudHlwZSA/IDEgOiBhLnR5cGUgPCBiLnR5cGUgPyAtMSA6IDApKSxcbiAgICAgIH0pKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IChhLnRpdGxlID4gYi50aXRsZSA/IDEgOiBhLnRpdGxlIDwgYi50aXRsZSA/IC0xIDogMCkpO1xuXG4gICAgLy8gSWYgdGhlIGNvbmZpZ3VyYXRpb24gcHJvdmlkZXMgYSBzb3J0aW5nIG9yZGVyLCB1cGRhdGVkIHRoZSBzb3J0ZWQgbGlzdCBvZiBncm91cCBrZXlzIHRvXG4gICAgLy8gc2F0aXNmeSB0aGUgb3JkZXIgb2YgdGhlIGdyb3VwcyBwcm92aWRlZCBpbiB0aGUgbGlzdCB3aXRoIGFueSBncm91cHMgbm90IGZvdW5kIGluIHRoZSBsaXN0IGF0XG4gICAgLy8gdGhlIGVuZCBvZiB0aGUgc29ydGVkIGxpc3QuXG4gICAgaWYgKHRoaXMuZ3JvdXBPcmRlci5sZW5ndGgpIHtcbiAgICAgIGZvciAoY29uc3QgZ3JvdXBUaXRsZSBvZiB0aGlzLmdyb3VwT3JkZXIucmV2ZXJzZSgpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRJZHggPSBjb21taXRHcm91cHMuZmluZEluZGV4KChrKSA9PiBrLnRpdGxlID09PSBncm91cFRpdGxlKTtcbiAgICAgICAgaWYgKGN1cnJlbnRJZHggIT09IC0xKSB7XG4gICAgICAgICAgY29uc3QgcmVtb3ZlZEdyb3VwcyA9IGNvbW1pdEdyb3Vwcy5zcGxpY2UoY3VycmVudElkeCwgMSk7XG4gICAgICAgICAgY29tbWl0R3JvdXBzLnNwbGljZSgwLCAwLCAuLi5yZW1vdmVkR3JvdXBzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29tbWl0R3JvdXBzO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHNwZWNpZmllZCBjb21taXQgY29udGFpbnMgYnJlYWtpbmcgY2hhbmdlcy4gKi9cbiAgaGFzQnJlYWtpbmdDaGFuZ2VzKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykge1xuICAgIHJldHVybiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgY29tbWl0IGNvbnRhaW5zIGRlcHJlY2F0aW9ucy4gKi9cbiAgaGFzRGVwcmVjYXRpb25zKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykge1xuICAgIHJldHVybiBjb21taXQuZGVwcmVjYXRpb25zLmxlbmd0aCAhPT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGZpbHRlciBmdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGEgbGlzdCBvZiBjb21taXRzIHRvIG9ubHkgaW5jbHVkZSBjb21taXRzIHdoaWNoXG4gICAqIHNob3VsZCBhcHBlYXIgaW4gcmVsZWFzZSBub3Rlcy5cbiAgICovXG4gIGluY2x1ZGVJblJlbGVhc2VOb3RlcygpIHtcbiAgICByZXR1cm4gKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykgPT4ge1xuICAgICAgaWYgKHRoaXMuaGlkZGVuU2NvcGVzLmluY2x1ZGVzKGNvbW1pdC5zY29wZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBDb21taXRzIHdoaWNoIGNvbnRhaW4gYnJlYWtpbmcgY2hhbmdlcyBvciBkZXByZWNhdGlvbnMgYXJlIGFsd2F5cyBpbmNsdWRlZFxuICAgICAgLy8gaW4gcmVsZWFzZSBub3Rlcy4gVGhlIGJyZWFraW5nIGNoYW5nZSBvciBkZXByZWNhdGlvbnMgd2lsbCBhbHJlYWR5IGJlIGxpc3RlZFxuICAgICAgLy8gaW4gYSBkZWRpY2F0ZWQgc2VjdGlvbiBidXQgaXQgaXMgc3RpbGwgdmFsdWFibGUgdG8gaW5jbHVkZSB0aGUgYWN0dWFsIGNvbW1pdC5cbiAgICAgIGlmICh0aGlzLmhhc0JyZWFraW5nQ2hhbmdlcyhjb21taXQpIHx8IHRoaXMuaGFzRGVwcmVjYXRpb25zKGNvbW1pdCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0eXBlc1RvSW5jbHVkZUluUmVsZWFzZU5vdGVzLmluY2x1ZGVzKGNvbW1pdC50eXBlKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgZmlsdGVyIGZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgYSBsaXN0IG9mIGNvbW1pdHMgdG8gb25seSBpbmNsdWRlIGNvbW1pdHMgd2hpY2ggY29udGFpbiBhXG4gICAqIHVuaXF1ZSB2YWx1ZSBmb3IgdGhlIHByb3ZpZGVkIGZpZWxkIGFjcm9zcyBhbGwgY29tbWl0cyBpbiB0aGUgbGlzdC5cbiAgICovXG4gIHVuaXF1ZShmaWVsZDoga2V5b2YgQ29tbWl0RnJvbUdpdExvZykge1xuICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8Q29tbWl0RnJvbUdpdExvZ1t0eXBlb2YgZmllbGRdPigpO1xuICAgIHJldHVybiAoY29tbWl0OiBDb21taXRGcm9tR2l0TG9nKSA9PiB7XG4gICAgICBjb25zdCBpbmNsdWRlID0gIXNldC5oYXMoY29tbWl0W2ZpZWxkXSk7XG4gICAgICBzZXQuYWRkKGNvbW1pdFtmaWVsZF0pO1xuICAgICAgcmV0dXJuIGluY2x1ZGU7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgY29tbWl0IG9iamVjdCB0byBhIE1hcmtkb3duIGxpbmsuXG4gICAqL1xuICBjb21taXRUb0xpbmsoY29tbWl0OiBDb21taXRGcm9tR2l0TG9nKTogc3RyaW5nIHtcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tLyR7dGhpcy5kYXRhLmdpdGh1Yi5vd25lcn0vJHt0aGlzLmRhdGEuZ2l0aHViLm5hbWV9L2NvbW1pdC8ke2NvbW1pdC5oYXNofWA7XG4gICAgcmV0dXJuIGBbJHtjb21taXQuc2hvcnRIYXNofV0oJHt1cmx9KWA7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIHB1bGwgcmVxdWVzdCBudW1iZXIgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgcHVsbFJlcXVlc3RUb0xpbmsocHJOdW1iZXI6IG51bWJlcik6IHN0cmluZyB7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3RoaXMuZGF0YS5naXRodWIub3duZXJ9LyR7dGhpcy5kYXRhLmdpdGh1Yi5uYW1lfS9wdWxsLyR7cHJOdW1iZXJ9YDtcbiAgICByZXR1cm4gYFsjJHtwck51bWJlcn1dKCR7dXJsfSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBhIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBieSByZXBsYWNpbmcgdGhlIHBhcmVudGhlc2l6ZWQgcHVsbCByZXF1ZXN0IHJlZmVyZW5jZSBhdCB0aGVcbiAgICogZW5kIG9mIHRoZSBsaW5lICh3aGljaCBpcyBhZGRlZCBieSBtZXJnZSB0b29saW5nKSB0byBhIE1hcmtkb3duIGxpbmsuXG4gICAqL1xuICByZXBsYWNlQ29tbWl0SGVhZGVyUHVsbFJlcXVlc3ROdW1iZXIoaGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBoZWFkZXIucmVwbGFjZSgvXFwoIyhcXGQrKVxcKSQvLCAoXywgZykgPT4gYCgke3RoaXMucHVsbFJlcXVlc3RUb0xpbmsoK2cpfSlgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWxsZXRpemUgYSBwYXJhZ3JhcGguXG4gICAqL1xuICBidWxsZXRpemVUZXh0KHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuICctICcgKyB0ZXh0LnJlcGxhY2UoL1xcXFxuL2csICdcXFxcbiAgJyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB1bmlxdWUsIHNvcnRlZCBhbmQgZmlsdGVyZWQgY29tbWl0IGF1dGhvcnMuXG4gICAqL1xuICBjb21taXRBdXRob3JzKGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gWy4uLm5ldyBTZXQoY29tbWl0cy5tYXAoKGMpID0+IGMuYXV0aG9yKSldXG4gICAgICAuZmlsdGVyKChhKSA9PiAhYm90c0F1dGhvck5hbWVzLmluY2x1ZGVzKGEpKVxuICAgICAgLnNvcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgY29tbWl0IG9iamVjdCB0byBhIE1hcmtkb3duIGxpbmtlZCBiYWRnZWQuXG4gICAqL1xuICBjb21taXRUb0JhZGdlKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZyk6IHN0cmluZyB7XG4gICAgbGV0IGNvbG9yID0gJ3llbGxvdyc7XG4gICAgc3dpdGNoIChjb21taXQudHlwZSkge1xuICAgICAgY2FzZSAnZml4JzpcbiAgICAgICAgY29sb3IgPSAnZ3JlZW4nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ZlYXQnOlxuICAgICAgICBjb2xvciA9ICdibHVlJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwZXJmJzpcbiAgICAgICAgY29sb3IgPSAnb3JhbmdlJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHt0aGlzLmRhdGEuZ2l0aHViLm93bmVyfS8ke3RoaXMuZGF0YS5naXRodWIubmFtZX0vY29tbWl0LyR7Y29tbWl0Lmhhc2h9YDtcbiAgICBjb25zdCBpbWdTcmMgPSBgaHR0cHM6Ly9pbWcuc2hpZWxkcy5pby9iYWRnZS8ke2NvbW1pdC5zaG9ydEhhc2h9LSR7Y29tbWl0LnR5cGV9LSR7Y29sb3J9YDtcbiAgICByZXR1cm4gYFshWyR7Y29tbWl0LnR5cGV9IC0gJHtjb21taXQuc2hvcnRIYXNofV0oJHtpbWdTcmN9KV0oJHt1cmx9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBkYXRlIHN0YW1wIGZvciBzdGFtcGluZyBpbiByZWxlYXNlIG5vdGVzLlxuICpcbiAqIFVzZXMgdGhlIGN1cnJlbnQgZGF0ZSwgb3IgYSBwcm92aWRlZCBkYXRlIGluIHRoZSBmb3JtYXQgb2YgWVlZWS1NTS1ERCwgaS5lLiAxOTcwLTExLTA1LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREYXRlU3RhbXAoZGF0ZSA9IG5ldyBEYXRlKCkpIHtcbiAgY29uc3QgeWVhciA9IGAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xuICBjb25zdCBtb250aCA9IGAke2RhdGUuZ2V0TW9udGgoKSArIDF9YC5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBkYXkgPSBgJHtkYXRlLmdldERhdGUoKX1gLnBhZFN0YXJ0KDIsICcwJyk7XG5cbiAgcmV0dXJuIFt5ZWFyLCBtb250aCwgZGF5XS5qb2luKCctJyk7XG59XG4iXX0=