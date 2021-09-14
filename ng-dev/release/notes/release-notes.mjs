"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseNotes = exports.changelogPath = void 0;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ejs_1 = require("ejs");
const console_1 = require("../../utils/console");
const format_1 = require("../../format/format");
const git_client_1 = require("../../utils/git/git-client");
const index_1 = require("../config/index");
const context_1 = require("./context");
const changelog_1 = require("./templates/changelog");
const github_release_1 = require("./templates/github-release");
const get_commits_in_range_1 = require("./commits/get-commits-in-range");
const config_1 = require("../../utils/config");
const config_2 = require("../../format/config");
const changelog_2 = require("./changelog");
/** Project-relative path for the changelog file. */
exports.changelogPath = 'CHANGELOG.md';
/** Release note generation. */
class ReleaseNotes {
    constructor(version, commits, git) {
        this.version = version;
        this.commits = commits;
        this.git = git;
        /** The changelog writer. */
        this.changelog = new changelog_2.Changelog(this.git);
        /** The configuration ng-dev. */
        this.config = (0, config_1.getConfig)([index_1.assertValidReleaseConfig]);
    }
    static async forRange(version, baseRef, headRef) {
        const git = git_client_1.GitClient.get();
        const commits = (0, get_commits_in_range_1.getCommitsForRangeWithDeduping)(git, baseRef, headRef);
        return new ReleaseNotes(version, commits, git);
    }
    /** The configuration for the release notes. */
    get notesConfig() {
        return this.config.release.releaseNotes ?? {};
    }
    /** Retrieve the release note generated for a Github Release. */
    async getGithubReleaseEntry() {
        return (0, ejs_1.render)(github_release_1.default, await this.generateRenderContext(), {
            rmWhitespace: true,
        });
    }
    /** Retrieve the release note generated for a CHANGELOG entry. */
    async getChangelogEntry() {
        return (0, ejs_1.render)(changelog_1.default, await this.generateRenderContext(), { rmWhitespace: true });
    }
    /**
     * Prepend generated release note to the CHANGELOG.md file in the base directory of the repository
     * provided by the GitClient.
     */
    async prependEntryToChangelog() {
        this.changelog.prependEntryToChangelog(await this.getChangelogEntry());
        // TODO(josephperrott): Remove file formatting calls.
        //   Upon reaching a standardized formatting for markdown files, rather than calling a formatter
        //   for all creation of changelogs, we instead will confirm in our testing that the new changes
        //   created for changelogs meet on standardized markdown formats via unit testing.
        try {
            (0, config_2.assertValidFormatConfig)(this.config);
            await (0, format_1.formatFiles)([this.changelog.filePath]);
        }
        catch {
            // If the formatting is either unavailable or fails, continue on with the unformatted result.
        }
    }
    /** Retrieve the number of commits included in the release notes after filtering and deduping. */
    async getCommitCountInReleaseNotes() {
        const context = await this.generateRenderContext();
        return context.commits.filter(context.includeInReleaseNotes()).length;
    }
    /**
     * Gets the URL fragment for the release notes. The URL fragment identifier
     * can be used to point to a specific changelog entry through an URL.
     */
    async getUrlFragmentForRelease() {
        return (await this.generateRenderContext()).urlFragmentForRelease;
    }
    /**
     * Prompt the user for a title for the release, if the project's configuration is defined to use a
     * title.
     */
    async promptForReleaseTitle() {
        if (this.title === undefined) {
            if (this.notesConfig.useReleaseTitle) {
                this.title = await (0, console_1.promptInput)('Please provide a title for the release:');
            }
            else {
                this.title = false;
            }
        }
        return this.title;
    }
    /** Build the render context data object for constructing the RenderContext instance. */
    async generateRenderContext() {
        if (!this.renderContext) {
            this.renderContext = new context_1.RenderContext({
                commits: this.commits,
                github: this.git.remoteConfig,
                version: this.version.format(),
                groupOrder: this.notesConfig.groupOrder,
                hiddenScopes: this.notesConfig.hiddenScopes,
                categorizeCommit: this.notesConfig.categorizeCommit,
                title: await this.promptForReleaseTitle(),
            });
        }
        return this.renderContext;
    }
}
exports.ReleaseNotes = ReleaseNotes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkJBQTJCO0FBSTNCLGlEQUFnRDtBQUNoRCxnREFBZ0Q7QUFDaEQsMkRBQXFEO0FBQ3JELDJDQUF3RTtBQUN4RSx1Q0FBd0M7QUFFeEMscURBQXNEO0FBQ3RELCtEQUErRDtBQUMvRCx5RUFBOEU7QUFDOUUsK0NBQTZDO0FBQzdDLGdEQUE0RDtBQUM1RCwyQ0FBc0M7QUFFdEMsb0RBQW9EO0FBQ3ZDLFFBQUEsYUFBYSxHQUFHLGNBQWMsQ0FBQztBQUU1QywrQkFBK0I7QUFDL0IsTUFBYSxZQUFZO0lBb0J2QixZQUNTLE9BQXNCLEVBQ3JCLE9BQTJCLEVBQzNCLEdBQWM7UUFGZixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ3JCLFlBQU8sR0FBUCxPQUFPLENBQW9CO1FBQzNCLFFBQUcsR0FBSCxHQUFHLENBQVc7UUFoQnhCLDRCQUE0QjtRQUNwQixjQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUs1QyxnQ0FBZ0M7UUFDeEIsV0FBTSxHQUE2QixJQUFBLGtCQUFTLEVBQUMsQ0FBQyxnQ0FBd0IsQ0FBQyxDQUFDLENBQUM7SUFVOUUsQ0FBQztJQXZCSixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFzQixFQUFFLE9BQWUsRUFBRSxPQUFlO1FBQzVFLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsTUFBTSxPQUFPLEdBQUcsSUFBQSxxREFBOEIsRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFH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QUM7Q0FDRjtBQXJHRCxvQ0FxR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVuZGVyfSBmcm9tICdlanMnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0NvbW1pdEZyb21HaXRMb2d9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcblxuaW1wb3J0IHtwcm9tcHRJbnB1dH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2Zvcm1hdEZpbGVzfSBmcm9tICcuLi8uLi9mb3JtYXQvZm9ybWF0JztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZywgUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7UmVuZGVyQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcblxuaW1wb3J0IGNoYW5nZWxvZ1RlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGVzL2NoYW5nZWxvZyc7XG5pbXBvcnQgZ2l0aHViUmVsZWFzZVRlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGVzL2dpdGh1Yi1yZWxlYXNlJztcbmltcG9ydCB7Z2V0Q29tbWl0c0ZvclJhbmdlV2l0aERlZHVwaW5nfSBmcm9tICcuL2NvbW1pdHMvZ2V0LWNvbW1pdHMtaW4tcmFuZ2UnO1xuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Fzc2VydFZhbGlkRm9ybWF0Q29uZmlnfSBmcm9tICcuLi8uLi9mb3JtYXQvY29uZmlnJztcbmltcG9ydCB7Q2hhbmdlbG9nfSBmcm9tICcuL2NoYW5nZWxvZyc7XG5cbi8qKiBQcm9qZWN0LXJlbGF0aXZlIHBhdGggZm9yIHRoZSBjaGFuZ2Vsb2cgZmlsZS4gKi9cbmV4cG9ydCBjb25zdCBjaGFuZ2Vsb2dQYXRoID0gJ0NIQU5HRUxPRy5tZCc7XG5cbi8qKiBSZWxlYXNlIG5vdGUgZ2VuZXJhdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBSZWxlYXNlTm90ZXMge1xuICBzdGF0aWMgYXN5bmMgZm9yUmFuZ2UodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgYmFzZVJlZjogc3RyaW5nLCBoZWFkUmVmOiBzdHJpbmcpIHtcbiAgICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gICAgY29uc3QgY29tbWl0cyA9IGdldENvbW1pdHNGb3JSYW5nZVdpdGhEZWR1cGluZyhnaXQsIGJhc2VSZWYsIGhlYWRSZWYpO1xuICAgIHJldHVybiBuZXcgUmVsZWFzZU5vdGVzKHZlcnNpb24sIGNvbW1pdHMsIGdpdCk7XG4gIH1cblxuICAvKiogVGhlIGNoYW5nZWxvZyB3cml0ZXIuICovXG4gIHByaXZhdGUgY2hhbmdlbG9nID0gbmV3IENoYW5nZWxvZyh0aGlzLmdpdCk7XG4gIC8qKiBUaGUgUmVuZGVyQ29udGV4dCB0byBiZSB1c2VkIGR1cmluZyByZW5kZXJpbmcuICovXG4gIHByaXZhdGUgcmVuZGVyQ29udGV4dDogUmVuZGVyQ29udGV4dCB8IHVuZGVmaW5lZDtcbiAgLyoqIFRoZSB0aXRsZSB0byB1c2UgZm9yIHRoZSByZWxlYXNlLiAqL1xuICBwcml2YXRlIHRpdGxlOiBzdHJpbmcgfCBmYWxzZSB8IHVuZGVmaW5lZDtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIG5nLWRldi4gKi9cbiAgcHJpdmF0ZSBjb25maWc6IHtyZWxlYXNlOiBSZWxlYXNlQ29uZmlnfSA9IGdldENvbmZpZyhbYXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnXSk7XG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHJlbGVhc2Ugbm90ZXMuICovXG4gIHByaXZhdGUgZ2V0IG5vdGVzQ29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5yZWxlYXNlLnJlbGVhc2VOb3RlcyA/PyB7fTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdmVyc2lvbjogc2VtdmVyLlNlbVZlcixcbiAgICBwcml2YXRlIGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSxcbiAgICBwcml2YXRlIGdpdDogR2l0Q2xpZW50LFxuICApIHt9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIEdpdGh1YiBSZWxlYXNlLiAqL1xuICBhc3luYyBnZXRHaXRodWJSZWxlYXNlRW50cnkoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gcmVuZGVyKGdpdGh1YlJlbGVhc2VUZW1wbGF0ZSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSwge1xuICAgICAgcm1XaGl0ZXNwYWNlOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIENIQU5HRUxPRyBlbnRyeS4gKi9cbiAgYXN5bmMgZ2V0Q2hhbmdlbG9nRW50cnkoKSB7XG4gICAgcmV0dXJuIHJlbmRlcihjaGFuZ2Vsb2dUZW1wbGF0ZSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSwge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgZ2VuZXJhdGVkIHJlbGVhc2Ugbm90ZSB0byB0aGUgQ0hBTkdFTE9HLm1kIGZpbGUgaW4gdGhlIGJhc2UgZGlyZWN0b3J5IG9mIHRoZSByZXBvc2l0b3J5XG4gICAqIHByb3ZpZGVkIGJ5IHRoZSBHaXRDbGllbnQuXG4gICAqL1xuICBhc3luYyBwcmVwZW5kRW50cnlUb0NoYW5nZWxvZygpIHtcbiAgICB0aGlzLmNoYW5nZWxvZy5wcmVwZW5kRW50cnlUb0NoYW5nZWxvZyhhd2FpdCB0aGlzLmdldENoYW5nZWxvZ0VudHJ5KCkpO1xuXG4gICAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogUmVtb3ZlIGZpbGUgZm9ybWF0dGluZyBjYWxscy5cbiAgICAvLyAgIFVwb24gcmVhY2hpbmcgYSBzdGFuZGFyZGl6ZWQgZm9ybWF0dGluZyBmb3IgbWFya2Rvd24gZmlsZXMsIHJhdGhlciB0aGFuIGNhbGxpbmcgYSBmb3JtYXR0ZXJcbiAgICAvLyAgIGZvciBhbGwgY3JlYXRpb24gb2YgY2hhbmdlbG9ncywgd2UgaW5zdGVhZCB3aWxsIGNvbmZpcm0gaW4gb3VyIHRlc3RpbmcgdGhhdCB0aGUgbmV3IGNoYW5nZXNcbiAgICAvLyAgIGNyZWF0ZWQgZm9yIGNoYW5nZWxvZ3MgbWVldCBvbiBzdGFuZGFyZGl6ZWQgbWFya2Rvd24gZm9ybWF0cyB2aWEgdW5pdCB0ZXN0aW5nLlxuICAgIHRyeSB7XG4gICAgICBhc3NlcnRWYWxpZEZvcm1hdENvbmZpZyh0aGlzLmNvbmZpZyk7XG4gICAgICBhd2FpdCBmb3JtYXRGaWxlcyhbdGhpcy5jaGFuZ2Vsb2cuZmlsZVBhdGhdKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElmIHRoZSBmb3JtYXR0aW5nIGlzIGVpdGhlciB1bmF2YWlsYWJsZSBvciBmYWlscywgY29udGludWUgb24gd2l0aCB0aGUgdW5mb3JtYXR0ZWQgcmVzdWx0LlxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgbnVtYmVyIG9mIGNvbW1pdHMgaW5jbHVkZWQgaW4gdGhlIHJlbGVhc2Ugbm90ZXMgYWZ0ZXIgZmlsdGVyaW5nIGFuZCBkZWR1cGluZy4gKi9cbiAgYXN5bmMgZ2V0Q29tbWl0Q291bnRJblJlbGVhc2VOb3RlcygpIHtcbiAgICBjb25zdCBjb250ZXh0ID0gYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKTtcbiAgICByZXR1cm4gY29udGV4dC5jb21taXRzLmZpbHRlcihjb250ZXh0LmluY2x1ZGVJblJlbGVhc2VOb3RlcygpKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgVVJMIGZyYWdtZW50IGZvciB0aGUgcmVsZWFzZSBub3Rlcy4gVGhlIFVSTCBmcmFnbWVudCBpZGVudGlmaWVyXG4gICAqIGNhbiBiZSB1c2VkIHRvIHBvaW50IHRvIGEgc3BlY2lmaWMgY2hhbmdlbG9nIGVudHJ5IHRocm91Z2ggYW4gVVJMLlxuICAgKi9cbiAgYXN5bmMgZ2V0VXJsRnJhZ21lbnRGb3JSZWxlYXNlKCkge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSkudXJsRnJhZ21lbnRGb3JSZWxlYXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdCB0aGUgdXNlciBmb3IgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2UsIGlmIHRoZSBwcm9qZWN0J3MgY29uZmlndXJhdGlvbiBpcyBkZWZpbmVkIHRvIHVzZSBhXG4gICAqIHRpdGxlLlxuICAgKi9cbiAgYXN5bmMgcHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCkge1xuICAgIGlmICh0aGlzLnRpdGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLm5vdGVzQ29uZmlnLnVzZVJlbGVhc2VUaXRsZSkge1xuICAgICAgICB0aGlzLnRpdGxlID0gYXdhaXQgcHJvbXB0SW5wdXQoJ1BsZWFzZSBwcm92aWRlIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlOicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50aXRsZTtcbiAgfVxuXG4gIC8qKiBCdWlsZCB0aGUgcmVuZGVyIGNvbnRleHQgZGF0YSBvYmplY3QgZm9yIGNvbnN0cnVjdGluZyB0aGUgUmVuZGVyQ29udGV4dCBpbnN0YW5jZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBnZW5lcmF0ZVJlbmRlckNvbnRleHQoKTogUHJvbWlzZTxSZW5kZXJDb250ZXh0PiB7XG4gICAgaWYgKCF0aGlzLnJlbmRlckNvbnRleHQpIHtcbiAgICAgIHRoaXMucmVuZGVyQ29udGV4dCA9IG5ldyBSZW5kZXJDb250ZXh0KHtcbiAgICAgICAgY29tbWl0czogdGhpcy5jb21taXRzLFxuICAgICAgICBnaXRodWI6IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZyxcbiAgICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uLmZvcm1hdCgpLFxuICAgICAgICBncm91cE9yZGVyOiB0aGlzLm5vdGVzQ29uZmlnLmdyb3VwT3JkZXIsXG4gICAgICAgIGhpZGRlblNjb3BlczogdGhpcy5ub3Rlc0NvbmZpZy5oaWRkZW5TY29wZXMsXG4gICAgICAgIGNhdGVnb3JpemVDb21taXQ6IHRoaXMubm90ZXNDb25maWcuY2F0ZWdvcml6ZUNvbW1pdCxcbiAgICAgICAgdGl0bGU6IGF3YWl0IHRoaXMucHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCksXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyQ29udGV4dDtcbiAgfVxufVxuIl19