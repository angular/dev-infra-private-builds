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
        /** The configuration ng-dev. */
        this.config = (0, config_1.getConfig)([index_1.assertValidReleaseConfig]);
    }
    static async forRange(git, version, baseRef, headRef) {
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
    async prependEntryToChangelogFile() {
        changelog_2.Changelog.prependEntryToChangelogFile(this.git, await this.getChangelogEntry());
        // TODO(josephperrott): Remove file formatting calls.
        //   Upon reaching a standardized formatting for markdown files, rather than calling a formatter
        //   for all creation of changelogs, we instead will confirm in our testing that the new changes
        //   created for changelogs meet on standardized markdown formats via unit testing.
        try {
            (0, config_2.assertValidFormatConfig)(this.config);
            await (0, format_1.formatFiles)([changelog_2.Changelog.getChangelogFilePaths(this.git).filePath]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkJBQTJCO0FBSTNCLGlEQUFnRDtBQUNoRCxnREFBZ0Q7QUFFaEQsMkNBQXdFO0FBQ3hFLHVDQUF3QztBQUV4QyxxREFBc0Q7QUFDdEQsK0RBQStEO0FBQy9ELHlFQUE4RTtBQUM5RSwrQ0FBNkM7QUFDN0MsZ0RBQTREO0FBQzVELDJDQUFzQztBQUV0QyxvREFBb0Q7QUFDdkMsUUFBQSxhQUFhLEdBQUcsY0FBYyxDQUFDO0FBRTVDLCtCQUErQjtBQUMvQixNQUFhLFlBQVk7SUFpQnZCLFlBQ1MsT0FBc0IsRUFDckIsT0FBMkIsRUFDM0IsR0FBYztRQUZmLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFDckIsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUFDM0IsUUFBRyxHQUFILEdBQUcsQ0FBVztRQVZ4QixnQ0FBZ0M7UUFDeEIsV0FBTSxHQUE2QixJQUFBLGtCQUFTLEVBQUMsQ0FBQyxnQ0FBd0IsQ0FBQyxDQUFDLENBQUM7SUFVOUUsQ0FBQztJQXBCSixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFjLEVBQUUsT0FBc0IsRUFBRSxPQUFlLEVBQUUsT0FBZTtRQUM1RixNQUFNLE9BQU8sR0FBRyxJQUFBLHFEQUE4QixFQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEUsT0FBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFRRCwrQ0FBK0M7SUFDL0MsSUFBWSxXQUFXO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztJQUNoRCxDQUFD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IEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZW5kZXJ9IGZyb20gJ2Vqcyc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuXG5pbXBvcnQge3Byb21wdElucHV0fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Zm9ybWF0RmlsZXN9IGZyb20gJy4uLy4uL2Zvcm1hdC9mb3JtYXQnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7YXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnLCBSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtSZW5kZXJDb250ZXh0fSBmcm9tICcuL2NvbnRleHQnO1xuXG5pbXBvcnQgY2hhbmdlbG9nVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvY2hhbmdlbG9nJztcbmltcG9ydCBnaXRodWJSZWxlYXNlVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UnO1xuaW1wb3J0IHtnZXRDb21taXRzRm9yUmFuZ2VXaXRoRGVkdXBpbmd9IGZyb20gJy4vY29tbWl0cy9nZXQtY29tbWl0cy1pbi1yYW5nZSc7XG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRGb3JtYXRDb25maWd9IGZyb20gJy4uLy4uL2Zvcm1hdC9jb25maWcnO1xuaW1wb3J0IHtDaGFuZ2Vsb2d9IGZyb20gJy4vY2hhbmdlbG9nJztcblxuLyoqIFByb2plY3QtcmVsYXRpdmUgcGF0aCBmb3IgdGhlIGNoYW5nZWxvZyBmaWxlLiAqL1xuZXhwb3J0IGNvbnN0IGNoYW5nZWxvZ1BhdGggPSAnQ0hBTkdFTE9HLm1kJztcblxuLyoqIFJlbGVhc2Ugbm90ZSBnZW5lcmF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIFJlbGVhc2VOb3RlcyB7XG4gIHN0YXRpYyBhc3luYyBmb3JSYW5nZShnaXQ6IEdpdENsaWVudCwgdmVyc2lvbjogc2VtdmVyLlNlbVZlciwgYmFzZVJlZjogc3RyaW5nLCBoZWFkUmVmOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb21taXRzID0gZ2V0Q29tbWl0c0ZvclJhbmdlV2l0aERlZHVwaW5nKGdpdCwgYmFzZVJlZiwgaGVhZFJlZik7XG4gICAgcmV0dXJuIG5ldyBSZWxlYXNlTm90ZXModmVyc2lvbiwgY29tbWl0cywgZ2l0KTtcbiAgfVxuXG4gIC8qKiBUaGUgUmVuZGVyQ29udGV4dCB0byBiZSB1c2VkIGR1cmluZyByZW5kZXJpbmcuICovXG4gIHByaXZhdGUgcmVuZGVyQ29udGV4dDogUmVuZGVyQ29udGV4dCB8IHVuZGVmaW5lZDtcbiAgLyoqIFRoZSB0aXRsZSB0byB1c2UgZm9yIHRoZSByZWxlYXNlLiAqL1xuICBwcml2YXRlIHRpdGxlOiBzdHJpbmcgfCBmYWxzZSB8IHVuZGVmaW5lZDtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIG5nLWRldi4gKi9cbiAgcHJpdmF0ZSBjb25maWc6IHtyZWxlYXNlOiBSZWxlYXNlQ29uZmlnfSA9IGdldENvbmZpZyhbYXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnXSk7XG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHJlbGVhc2Ugbm90ZXMuICovXG4gIHByaXZhdGUgZ2V0IG5vdGVzQ29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5yZWxlYXNlLnJlbGVhc2VOb3RlcyA/PyB7fTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdmVyc2lvbjogc2VtdmVyLlNlbVZlcixcbiAgICBwcml2YXRlIGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSxcbiAgICBwcml2YXRlIGdpdDogR2l0Q2xpZW50LFxuICApIHt9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIEdpdGh1YiBSZWxlYXNlLiAqL1xuICBhc3luYyBnZXRHaXRodWJSZWxlYXNlRW50cnkoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gcmVuZGVyKGdpdGh1YlJlbGVhc2VUZW1wbGF0ZSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSwge1xuICAgICAgcm1XaGl0ZXNwYWNlOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIENIQU5HRUxPRyBlbnRyeS4gKi9cbiAgYXN5bmMgZ2V0Q2hhbmdlbG9nRW50cnkoKSB7XG4gICAgcmV0dXJuIHJlbmRlcihjaGFuZ2Vsb2dUZW1wbGF0ZSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSwge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgZ2VuZXJhdGVkIHJlbGVhc2Ugbm90ZSB0byB0aGUgQ0hBTkdFTE9HLm1kIGZpbGUgaW4gdGhlIGJhc2UgZGlyZWN0b3J5IG9mIHRoZSByZXBvc2l0b3J5XG4gICAqIHByb3ZpZGVkIGJ5IHRoZSBHaXRDbGllbnQuXG4gICAqL1xuICBhc3luYyBwcmVwZW5kRW50cnlUb0NoYW5nZWxvZ0ZpbGUoKSB7XG4gICAgQ2hhbmdlbG9nLnByZXBlbmRFbnRyeVRvQ2hhbmdlbG9nRmlsZSh0aGlzLmdpdCwgYXdhaXQgdGhpcy5nZXRDaGFuZ2Vsb2dFbnRyeSgpKTtcblxuICAgIC8vIFRPRE8oam9zZXBocGVycm90dCk6IFJlbW92ZSBmaWxlIGZvcm1hdHRpbmcgY2FsbHMuXG4gICAgLy8gICBVcG9uIHJlYWNoaW5nIGEgc3RhbmRhcmRpemVkIGZvcm1hdHRpbmcgZm9yIG1hcmtkb3duIGZpbGVzLCByYXRoZXIgdGhhbiBjYWxsaW5nIGEgZm9ybWF0dGVyXG4gICAgLy8gICBmb3IgYWxsIGNyZWF0aW9uIG9mIGNoYW5nZWxvZ3MsIHdlIGluc3RlYWQgd2lsbCBjb25maXJtIGluIG91ciB0ZXN0aW5nIHRoYXQgdGhlIG5ldyBjaGFuZ2VzXG4gICAgLy8gICBjcmVhdGVkIGZvciBjaGFuZ2Vsb2dzIG1lZXQgb24gc3RhbmRhcmRpemVkIG1hcmtkb3duIGZvcm1hdHMgdmlhIHVuaXQgdGVzdGluZy5cbiAgICB0cnkge1xuICAgICAgYXNzZXJ0VmFsaWRGb3JtYXRDb25maWcodGhpcy5jb25maWcpO1xuICAgICAgYXdhaXQgZm9ybWF0RmlsZXMoW0NoYW5nZWxvZy5nZXRDaGFuZ2Vsb2dGaWxlUGF0aHModGhpcy5naXQpLmZpbGVQYXRoXSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZiB0aGUgZm9ybWF0dGluZyBpcyBlaXRoZXIgdW5hdmFpbGFibGUgb3IgZmFpbHMsIGNvbnRpbnVlIG9uIHdpdGggdGhlIHVuZm9ybWF0dGVkIHJlc3VsdC5cbiAgICB9XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIG51bWJlciBvZiBjb21taXRzIGluY2x1ZGVkIGluIHRoZSByZWxlYXNlIG5vdGVzIGFmdGVyIGZpbHRlcmluZyBhbmQgZGVkdXBpbmcuICovXG4gIGFzeW5jIGdldENvbW1pdENvdW50SW5SZWxlYXNlTm90ZXMoKSB7XG4gICAgY29uc3QgY29udGV4dCA9IGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk7XG4gICAgcmV0dXJuIGNvbnRleHQuY29tbWl0cy5maWx0ZXIoY29udGV4dC5pbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSkubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIFVSTCBmcmFnbWVudCBmb3IgdGhlIHJlbGVhc2Ugbm90ZXMuIFRoZSBVUkwgZnJhZ21lbnQgaWRlbnRpZmllclxuICAgKiBjYW4gYmUgdXNlZCB0byBwb2ludCB0byBhIHNwZWNpZmljIGNoYW5nZWxvZyBlbnRyeSB0aHJvdWdoIGFuIFVSTC5cbiAgICovXG4gIGFzeW5jIGdldFVybEZyYWdtZW50Rm9yUmVsZWFzZSgpIHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCkpLnVybEZyYWdtZW50Rm9yUmVsZWFzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHQgdGhlIHVzZXIgZm9yIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlLCBpZiB0aGUgcHJvamVjdCdzIGNvbmZpZ3VyYXRpb24gaXMgZGVmaW5lZCB0byB1c2UgYVxuICAgKiB0aXRsZS5cbiAgICovXG4gIGFzeW5jIHByb21wdEZvclJlbGVhc2VUaXRsZSgpIHtcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodGhpcy5ub3Rlc0NvbmZpZy51c2VSZWxlYXNlVGl0bGUpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGF3YWl0IHByb21wdElucHV0KCdQbGVhc2UgcHJvdmlkZSBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZTonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGl0bGU7XG4gIH1cblxuICAvKiogQnVpbGQgdGhlIHJlbmRlciBjb250ZXh0IGRhdGEgb2JqZWN0IGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJlbmRlckNvbnRleHQgaW5zdGFuY2UuICovXG4gIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk6IFByb21pc2U8UmVuZGVyQ29udGV4dD4ge1xuICAgIGlmICghdGhpcy5yZW5kZXJDb250ZXh0KSB7XG4gICAgICB0aGlzLnJlbmRlckNvbnRleHQgPSBuZXcgUmVuZGVyQ29udGV4dCh7XG4gICAgICAgIGNvbW1pdHM6IHRoaXMuY29tbWl0cyxcbiAgICAgICAgZ2l0aHViOiB0aGlzLmdpdC5yZW1vdGVDb25maWcsXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbi5mb3JtYXQoKSxcbiAgICAgICAgZ3JvdXBPcmRlcjogdGhpcy5ub3Rlc0NvbmZpZy5ncm91cE9yZGVyLFxuICAgICAgICBoaWRkZW5TY29wZXM6IHRoaXMubm90ZXNDb25maWcuaGlkZGVuU2NvcGVzLFxuICAgICAgICBjYXRlZ29yaXplQ29tbWl0OiB0aGlzLm5vdGVzQ29uZmlnLmNhdGVnb3JpemVDb21taXQsXG4gICAgICAgIHRpdGxlOiBhd2FpdCB0aGlzLnByb21wdEZvclJlbGVhc2VUaXRsZSgpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlckNvbnRleHQ7XG4gIH1cbn1cbiJdfQ==