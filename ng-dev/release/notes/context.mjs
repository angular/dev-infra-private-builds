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
const locale_1 = require("../../utils/locale");
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
        /**
         * Comparator used for sorting commits within a release notes group. Commits
         * are sorted alphabetically based on their type. Commits having the same type
         * will be sorted alphabetically based on their determined description
         */
        this._commitsWithinGroupComparator = (a, b) => {
            const typeCompareOrder = locale_1.compareString(a.type, b.type);
            if (typeCompareOrder === 0) {
                return locale_1.compareString(a.description, b.description);
            }
            return typeCompareOrder;
        };
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
            commits: commits.sort(this._commitsWithinGroupComparator),
        }))
            .sort((a, b) => locale_1.compareString(a.title, b.title));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsd0RBQTRFO0FBSTVFLCtDQUFpRDtBQUVqRCx5REFBeUQ7QUFDekQsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLHFCQUFZLENBQUM7S0FDN0QsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEtBQUssMEJBQWlCLENBQUMsT0FBTyxDQUFDO0tBQ3RFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRTVCLDZDQUE2QztBQUM3QyxNQUFNLGVBQWUsR0FBRyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBb0I1RCxzREFBc0Q7QUFDdEQsTUFBYSxhQUFhO0lBZ0J4QixZQUE2QixJQUF1QjtRQUF2QixTQUFJLEdBQUosSUFBSSxDQUFtQjtRQWZwRCx3REFBd0Q7UUFDdkMsZUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztRQUN6RCxnRUFBZ0U7UUFDL0MsaUJBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7UUFDN0QsdUVBQXVFO1FBQzlELFVBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNqQyxrQ0FBa0M7UUFDekIsWUFBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JDLGdFQUFnRTtRQUN2RCxjQUFTLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEQscUVBQXFFO1FBQzVELDBCQUFxQixHQUFH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QUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEQsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRWpELE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBTkQsd0NBTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDT01NSVRfVFlQRVMsIFJlbGVhc2VOb3Rlc0xldmVsfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9jb25maWcnO1xuaW1wb3J0IHtDb21taXRGcm9tR2l0TG9nfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7UmVsZWFzZU5vdGVzQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtjb21wYXJlU3RyaW5nfSBmcm9tICcuLi8uLi91dGlscy9sb2NhbGUnO1xuXG4vKiogTGlzdCBvZiB0eXBlcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgcmVsZWFzZSBub3Rlcy4gKi9cbmNvbnN0IHR5cGVzVG9JbmNsdWRlSW5SZWxlYXNlTm90ZXMgPSBPYmplY3QudmFsdWVzKENPTU1JVF9UWVBFUylcbiAgLmZpbHRlcigodHlwZSkgPT4gdHlwZS5yZWxlYXNlTm90ZXNMZXZlbCA9PT0gUmVsZWFzZU5vdGVzTGV2ZWwuVmlzaWJsZSlcbiAgLm1hcCgodHlwZSkgPT4gdHlwZS5uYW1lKTtcblxuLyoqIExpc3Qgb2YgY29tbWl0IGF1dGhvcnMgd2hpY2ggYXJlIGJvdHMuICovXG5jb25zdCBib3RzQXV0aG9yTmFtZXMgPSBbJ2RlcGVuZGFib3RbYm90XScsICdSZW5vdmF0ZSBCb3QnXTtcblxuLyoqIERhdGEgdXNlZCBmb3IgY29udGV4dCBkdXJpbmcgcmVuZGVyaW5nLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJDb250ZXh0RGF0YSB7XG4gIHRpdGxlOiBzdHJpbmcgfCBmYWxzZTtcbiAgZ3JvdXBPcmRlcjogUmVsZWFzZU5vdGVzQ29uZmlnWydncm91cE9yZGVyJ107XG4gIGhpZGRlblNjb3BlczogUmVsZWFzZU5vdGVzQ29uZmlnWydoaWRkZW5TY29wZXMnXTtcbiAgY2F0ZWdvcml6ZUNvbW1pdDogUmVsZWFzZU5vdGVzQ29uZmlnWydjYXRlZ29yaXplQ29tbWl0J107XG4gIGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXTtcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBnaXRodWI6IEdpdGh1YkNvbmZpZztcbiAgZGF0ZT86IERhdGU7XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhbiBjYXRlZ29yaXplZCBjb21taXQuICovXG5leHBvcnQgaW50ZXJmYWNlIENhdGVnb3JpemVkQ29tbWl0IGV4dGVuZHMgQ29tbWl0RnJvbUdpdExvZyB7XG4gIGdyb3VwTmFtZTogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xufVxuXG4vKiogQ29udGV4dCBjbGFzcyB1c2VkIGZvciByZW5kZXJpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmV4cG9ydCBjbGFzcyBSZW5kZXJDb250ZXh0IHtcbiAgLyoqIEFuIGFycmF5IG9mIGdyb3VwIG5hbWVzIGluIHNvcnQgb3JkZXIgaWYgZGVmaW5lZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBncm91cE9yZGVyID0gdGhpcy5kYXRhLmdyb3VwT3JkZXIgfHwgW107XG4gIC8qKiBBbiBhcnJheSBvZiBzY29wZXMgdG8gaGlkZSBmcm9tIHRoZSByZWxlYXNlIGVudHJ5IG91dHB1dC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBoaWRkZW5TY29wZXMgPSB0aGlzLmRhdGEuaGlkZGVuU2NvcGVzIHx8IFtdO1xuICAvKiogVGhlIHRpdGxlIG9mIHRoZSByZWxlYXNlLCBvciBgZmFsc2VgIGlmIG5vIHRpdGxlIHNob3VsZCBiZSB1c2VkLiAqL1xuICByZWFkb25seSB0aXRsZSA9IHRoaXMuZGF0YS50aXRsZTtcbiAgLyoqIFRoZSB2ZXJzaW9uIG9mIHRoZSByZWxlYXNlLiAqL1xuICByZWFkb25seSB2ZXJzaW9uID0gdGhpcy5kYXRhLnZlcnNpb247XG4gIC8qKiBUaGUgZGF0ZSBzdGFtcCBzdHJpbmcgZm9yIHVzZSBpbiB0aGUgcmVsZWFzZSBub3RlcyBlbnRyeS4gKi9cbiAgcmVhZG9ubHkgZGF0ZVN0YW1wID0gYnVpbGREYXRlU3RhbXAodGhpcy5kYXRhLmRhdGUpO1xuICAvKiogVVJMIGZyYWdtZW50IHRoYXQgaXMgdXNlZCB0byBjcmVhdGUgYW4gYW5jaG9yIGZvciB0aGUgcmVsZWFzZS4gKi9cbiAgcmVhZG9ubHkgdXJsRnJhZ21lbnRGb3JSZWxlYXNlID0gdGhpcy5kYXRhLnZlcnNpb247XG4gIC8qKiBMaXN0IG9mIGNhdGVnb3JpemVkIGNvbW1pdHMgaW4gdGhlIHJlbGVhc2UgcGVyaW9kLiAqL1xuICByZWFkb25seSBjb21taXRzID0gdGhpcy5fY2F0ZWdvcml6ZUNvbW1pdHModGhpcy5kYXRhLmNvbW1pdHMpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZGF0YTogUmVuZGVyQ29udGV4dERhdGEpIHt9XG5cbiAgLyoqIEdldHMgYSBsaXN0IG9mIGNhdGVnb3JpemVkIGNvbW1pdHMgZnJvbSBhbGwgY29tbWl0cyBpbiB0aGUgcmVsZWFzZSBwZXJpb2QuICovXG4gIF9jYXRlZ29yaXplQ29tbWl0cyhjb21taXRzOiBDb21taXRGcm9tR2l0TG9nW10pOiBDYXRlZ29yaXplZENvbW1pdFtdIHtcbiAgICByZXR1cm4gY29tbWl0cy5tYXAoKGNvbW1pdCkgPT4ge1xuICAgICAgY29uc3Qge2Rlc2NyaXB0aW9uLCBncm91cE5hbWV9ID0gdGhpcy5kYXRhLmNhdGVnb3JpemVDb21taXQ/Lihjb21taXQpID8/IHt9O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZ3JvdXBOYW1lOiBncm91cE5hbWUgPz8gY29tbWl0LnNjb3BlLFxuICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24gPz8gY29tbWl0LnN1YmplY3QsXG4gICAgICAgIC4uLmNvbW1pdCxcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29tcGFyYXRvciB1c2VkIGZvciBzb3J0aW5nIGNvbW1pdHMgd2l0aGluIGEgcmVsZWFzZSBub3RlcyBncm91cC4gQ29tbWl0c1xuICAgKiBhcmUgc29ydGVkIGFscGhhYmV0aWNhbGx5IGJhc2VkIG9uIHRoZWlyIHR5cGUuIENvbW1pdHMgaGF2aW5nIHRoZSBzYW1lIHR5cGVcbiAgICogd2lsbCBiZSBzb3J0ZWQgYWxwaGFiZXRpY2FsbHkgYmFzZWQgb24gdGhlaXIgZGV0ZXJtaW5lZCBkZXNjcmlwdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBfY29tbWl0c1dpdGhpbkdyb3VwQ29tcGFyYXRvciA9IChhOiBDYXRlZ29yaXplZENvbW1pdCwgYjogQ2F0ZWdvcml6ZWRDb21taXQpOiBudW1iZXIgPT4ge1xuICAgIGNvbnN0IHR5cGVDb21wYXJlT3JkZXIgPSBjb21wYXJlU3RyaW5nKGEudHlwZSwgYi50eXBlKTtcbiAgICBpZiAodHlwZUNvbXBhcmVPcmRlciA9PT0gMCkge1xuICAgICAgcmV0dXJuIGNvbXBhcmVTdHJpbmcoYS5kZXNjcmlwdGlvbiwgYi5kZXNjcmlwdGlvbik7XG4gICAgfVxuICAgIHJldHVybiB0eXBlQ29tcGFyZU9yZGVyO1xuICB9O1xuXG4gIC8qKlxuICAgKiBPcmdhbml6ZXMgYW5kIHNvcnRzIHRoZSBjb21taXRzIGludG8gZ3JvdXBzIG9mIGNvbW1pdHMuXG4gICAqXG4gICAqIEdyb3VwcyBhcmUgc29ydGVkIGVpdGhlciBieSBkZWZhdWx0IGBBcnJheS5zb3J0YCBvcmRlciwgb3IgdXNpbmcgdGhlIHByb3ZpZGVkIGdyb3VwIG9yZGVyIGZyb21cbiAgICogdGhlIGNvbmZpZ3VyYXRpb24uIENvbW1pdHMgYXJlIG9yZGVyIGluIHRoZSBzYW1lIG9yZGVyIHdpdGhpbiBlYWNoIGdyb3VwcyBjb21taXQgbGlzdCBhcyB0aGV5XG4gICAqIGFwcGVhciBpbiB0aGUgcHJvdmlkZWQgbGlzdCBvZiBjb21taXRzLlxuICAgKiAqL1xuICBhc0NvbW1pdEdyb3Vwcyhjb21taXRzOiBDYXRlZ29yaXplZENvbW1pdFtdKSB7XG4gICAgLyoqIFRoZSBkaXNjb3ZlcmVkIGdyb3VwcyB0byBvcmdhbml6ZSBpbnRvLiAqL1xuICAgIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBDYXRlZ29yaXplZENvbW1pdFtdPigpO1xuXG4gICAgLy8gUGxhY2UgZWFjaCBjb21taXQgaW4gdGhlIGxpc3QgaW50byBpdHMgZ3JvdXAuXG4gICAgY29tbWl0cy5mb3JFYWNoKChjb21taXQpID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IGNvbW1pdC5ncm91cE5hbWU7XG4gICAgICBjb25zdCBncm91cENvbW1pdHMgPSBncm91cHMuZ2V0KGtleSkgfHwgW107XG4gICAgICBncm91cHMuc2V0KGtleSwgZ3JvdXBDb21taXRzKTtcbiAgICAgIGdyb3VwQ29tbWl0cy5wdXNoKGNvbW1pdCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGRpc2NvdmVyZWQgY29tbWl0IGdyb3VwcyB3aGljaCBhcmUgc29ydGVkIGluIGFscGhhbnVtZXJpYyBvcmRlclxuICAgICAqIGJhc2VkIG9uIHRoZSBncm91cCB0aXRsZS5cbiAgICAgKi9cbiAgICBjb25zdCBjb21taXRHcm91cHMgPSBBcnJheS5mcm9tKGdyb3Vwcy5lbnRyaWVzKCkpXG4gICAgICAubWFwKChbdGl0bGUsIGNvbW1pdHNdKSA9PiAoe1xuICAgICAgICB0aXRsZSxcbiAgICAgICAgY29tbWl0czogY29tbWl0cy5zb3J0KHRoaXMuX2NvbW1pdHNXaXRoaW5Hcm91cENvbXBhcmF0b3IpLFxuICAgICAgfSkpXG4gICAgICAuc29ydCgoYSwgYikgPT4gY29tcGFyZVN0cmluZyhhLnRpdGxlLCBiLnRpdGxlKSk7XG5cbiAgICAvLyBJZiB0aGUgY29uZmlndXJhdGlvbiBwcm92aWRlcyBhIHNvcnRpbmcgb3JkZXIsIHVwZGF0ZWQgdGhlIHNvcnRlZCBsaXN0IG9mIGdyb3VwIGtleXMgdG9cbiAgICAvLyBzYXRpc2Z5IHRoZSBvcmRlciBvZiB0aGUgZ3JvdXBzIHByb3ZpZGVkIGluIHRoZSBsaXN0IHdpdGggYW55IGdyb3VwcyBub3QgZm91bmQgaW4gdGhlIGxpc3QgYXRcbiAgICAvLyB0aGUgZW5kIG9mIHRoZSBzb3J0ZWQgbGlzdC5cbiAgICBpZiAodGhpcy5ncm91cE9yZGVyLmxlbmd0aCkge1xuICAgICAgZm9yIChjb25zdCBncm91cFRpdGxlIG9mIHRoaXMuZ3JvdXBPcmRlci5yZXZlcnNlKCkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudElkeCA9IGNvbW1pdEdyb3Vwcy5maW5kSW5kZXgoKGspID0+IGsudGl0bGUgPT09IGdyb3VwVGl0bGUpO1xuICAgICAgICBpZiAoY3VycmVudElkeCAhPT0gLTEpIHtcbiAgICAgICAgICBjb25zdCByZW1vdmVkR3JvdXBzID0gY29tbWl0R3JvdXBzLnNwbGljZShjdXJyZW50SWR4LCAxKTtcbiAgICAgICAgICBjb21taXRHcm91cHMuc3BsaWNlKDAsIDAsIC4uLnJlbW92ZWRHcm91cHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21taXRHcm91cHM7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgc3BlY2lmaWVkIGNvbW1pdCBjb250YWlucyBicmVha2luZyBjaGFuZ2VzLiAqL1xuICBoYXNCcmVha2luZ0NoYW5nZXMoY29tbWl0OiBDYXRlZ29yaXplZENvbW1pdCkge1xuICAgIHJldHVybiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgY29tbWl0IGNvbnRhaW5zIGRlcHJlY2F0aW9ucy4gKi9cbiAgaGFzRGVwcmVjYXRpb25zKGNvbW1pdDogQ2F0ZWdvcml6ZWRDb21taXQpIHtcbiAgICByZXR1cm4gY29tbWl0LmRlcHJlY2F0aW9ucy5sZW5ndGggIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaFxuICAgKiBzaG91bGQgYXBwZWFyIGluIHJlbGVhc2Ugbm90ZXMuXG4gICAqL1xuICBpbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSB7XG4gICAgcmV0dXJuIChjb21taXQ6IENhdGVnb3JpemVkQ29tbWl0KSA9PiB7XG4gICAgICBpZiAodGhpcy5oaWRkZW5TY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbW1pdHMgd2hpY2ggY29udGFpbiBicmVha2luZyBjaGFuZ2VzIG9yIGRlcHJlY2F0aW9ucyBhcmUgYWx3YXlzIGluY2x1ZGVkXG4gICAgICAvLyBpbiByZWxlYXNlIG5vdGVzLiBUaGUgYnJlYWtpbmcgY2hhbmdlIG9yIGRlcHJlY2F0aW9ucyB3aWxsIGFscmVhZHkgYmUgbGlzdGVkXG4gICAgICAvLyBpbiBhIGRlZGljYXRlZCBzZWN0aW9uIGJ1dCBpdCBpcyBzdGlsbCB2YWx1YWJsZSB0byBpbmNsdWRlIHRoZSBhY3R1YWwgY29tbWl0LlxuICAgICAgaWYgKHRoaXMuaGFzQnJlYWtpbmdDaGFuZ2VzKGNvbW1pdCkgfHwgdGhpcy5oYXNEZXByZWNhdGlvbnMoY29tbWl0KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHR5cGVzVG9JbmNsdWRlSW5SZWxlYXNlTm90ZXMuaW5jbHVkZXMoY29tbWl0LnR5cGUpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaCBjb250YWluIGFcbiAgICogdW5pcXVlIHZhbHVlIGZvciB0aGUgcHJvdmlkZWQgZmllbGQgYWNyb3NzIGFsbCBjb21taXRzIGluIHRoZSBsaXN0LlxuICAgKi9cbiAgdW5pcXVlKGZpZWxkOiBrZXlvZiBDYXRlZ29yaXplZENvbW1pdCkge1xuICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8Q2F0ZWdvcml6ZWRDb21taXRbdHlwZW9mIGZpZWxkXT4oKTtcbiAgICByZXR1cm4gKGNvbW1pdDogQ2F0ZWdvcml6ZWRDb21taXQpID0+IHtcbiAgICAgIGNvbnN0IGluY2x1ZGUgPSAhc2V0Lmhhcyhjb21taXRbZmllbGRdKTtcbiAgICAgIHNldC5hZGQoY29tbWl0W2ZpZWxkXSk7XG4gICAgICByZXR1cm4gaW5jbHVkZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBjb21taXQgb2JqZWN0IHRvIGEgTWFya2Rvd24gbGluay5cbiAgICovXG4gIGNvbW1pdFRvTGluayhjb21taXQ6IENhdGVnb3JpemVkQ29tbWl0KTogc3RyaW5nIHtcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9naXRodWIuY29tLyR7dGhpcy5kYXRhLmdpdGh1Yi5vd25lcn0vJHt0aGlzLmRhdGEuZ2l0aHViLm5hbWV9L2NvbW1pdC8ke2NvbW1pdC5oYXNofWA7XG4gICAgcmV0dXJuIGBbJHtjb21taXQuc2hvcnRIYXNofV0oJHt1cmx9KWA7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIHB1bGwgcmVxdWVzdCBudW1iZXIgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgcHVsbFJlcXVlc3RUb0xpbmsocHJOdW1iZXI6IG51bWJlcik6IHN0cmluZyB7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3RoaXMuZGF0YS5naXRodWIub3duZXJ9LyR7dGhpcy5kYXRhLmdpdGh1Yi5uYW1lfS9wdWxsLyR7cHJOdW1iZXJ9YDtcbiAgICByZXR1cm4gYFsjJHtwck51bWJlcn1dKCR7dXJsfSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBhIGdpdmVuIHN0cmluZyBieSByZXBsYWNpbmcgYW55IHB1bGwgcmVxdWVzdCByZWZlcmVuY2VzIHdpdGggdGhlaXJcbiAgICogZXF1aXZhbGVudCBtYXJrZG93biBsaW5rcy5cbiAgICpcbiAgICogVGhpcyBpcyB1c2VmdWwgZm9yIHRoZSBjaGFuZ2Vsb2cgb3V0cHV0LiBHaXRodWIgdHJhbnNmb3JtcyBwdWxsIHJlcXVlc3QgcmVmZXJlbmNlc1xuICAgKiBhdXRvbWF0aWNhbGx5IGluIHJlbGVhc2Ugbm90ZSBlbnRyaWVzLCBpc3N1ZXMgYW5kIHB1bGwgcmVxdWVzdHMsIGJ1dCBub3QgZm9yIHBsYWluXG4gICAqIG1hcmtkb3duIGZpbGVzIChsaWtlIHRoZSBjaGFuZ2Vsb2cgZmlsZSkuXG4gICAqL1xuICBjb252ZXJ0UHVsbFJlcXVlc3RSZWZlcmVuY2VzVG9MaW5rcyhjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBjb250ZW50LnJlcGxhY2UoLyMoXFxkKykvZywgKF8sIGcpID0+IHRoaXMucHVsbFJlcXVlc3RUb0xpbmsoTnVtYmVyKGcpKSk7XG4gIH1cblxuICAvKipcbiAgICogQnVsbGV0aXplIGEgcGFyYWdyYXBoLlxuICAgKi9cbiAgYnVsbGV0aXplVGV4dCh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiAnLSAnICsgdGV4dC5yZXBsYWNlKC9cXFxcbi9nLCAnXFxcXG4gICcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdW5pcXVlLCBzb3J0ZWQgYW5kIGZpbHRlcmVkIGNvbW1pdCBhdXRob3JzLlxuICAgKi9cbiAgY29tbWl0QXV0aG9ycyhjb21taXRzOiBDYXRlZ29yaXplZENvbW1pdFtdKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBbLi4ubmV3IFNldChjb21taXRzLm1hcCgoYykgPT4gYy5hdXRob3IpKV1cbiAgICAgIC5maWx0ZXIoKGEpID0+ICFib3RzQXV0aG9yTmFtZXMuaW5jbHVkZXMoYSkpXG4gICAgICAuc29ydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBjb21taXQgb2JqZWN0IHRvIGEgTWFya2Rvd24gbGlua2VkIGJhZGdlZC5cbiAgICovXG4gIGNvbW1pdFRvQmFkZ2UoY29tbWl0OiBDYXRlZ29yaXplZENvbW1pdCk6IHN0cmluZyB7XG4gICAgbGV0IGNvbG9yID0gJ3llbGxvdyc7XG4gICAgc3dpdGNoIChjb21taXQudHlwZSkge1xuICAgICAgY2FzZSAnZml4JzpcbiAgICAgICAgY29sb3IgPSAnZ3JlZW4nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ZlYXQnOlxuICAgICAgICBjb2xvciA9ICdibHVlJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwZXJmJzpcbiAgICAgICAgY29sb3IgPSAnb3JhbmdlJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHt0aGlzLmRhdGEuZ2l0aHViLm93bmVyfS8ke3RoaXMuZGF0YS5naXRodWIubmFtZX0vY29tbWl0LyR7Y29tbWl0Lmhhc2h9YDtcbiAgICBjb25zdCBpbWdTcmMgPSBgaHR0cHM6Ly9pbWcuc2hpZWxkcy5pby9iYWRnZS8ke2NvbW1pdC5zaG9ydEhhc2h9LSR7Y29tbWl0LnR5cGV9LSR7Y29sb3J9YDtcbiAgICByZXR1cm4gYFshWyR7Y29tbWl0LnR5cGV9IC0gJHtjb21taXQuc2hvcnRIYXNofV0oJHtpbWdTcmN9KV0oJHt1cmx9KWA7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBkYXRlIHN0YW1wIGZvciBzdGFtcGluZyBpbiByZWxlYXNlIG5vdGVzLlxuICpcbiAqIFVzZXMgdGhlIGN1cnJlbnQgZGF0ZSwgb3IgYSBwcm92aWRlZCBkYXRlIGluIHRoZSBmb3JtYXQgb2YgWVlZWS1NTS1ERCwgaS5lLiAxOTcwLTExLTA1LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREYXRlU3RhbXAoZGF0ZSA9IG5ldyBEYXRlKCkpIHtcbiAgY29uc3QgeWVhciA9IGAke2RhdGUuZ2V0RnVsbFllYXIoKX1gO1xuICBjb25zdCBtb250aCA9IGAke2RhdGUuZ2V0TW9udGgoKSArIDF9YC5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBkYXkgPSBgJHtkYXRlLmdldERhdGUoKX1gLnBhZFN0YXJ0KDIsICcwJyk7XG5cbiAgcmV0dXJuIFt5ZWFyLCBtb250aCwgZGF5XS5qb2luKCctJyk7XG59XG4iXX0=