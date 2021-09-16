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
    async prependEntryToChangelogFile() {
        changelog_2.Changelog.prependEntryToChangelogFile(await this.getChangelogEntry(), this.git);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkJBQTJCO0FBSTNCLGlEQUFnRDtBQUNoRCxnREFBZ0Q7QUFDaEQsMkRBQXFEO0FBQ3JELDJDQUF3RTtBQUN4RSx1Q0FBd0M7QUFFeEMscURBQXNEO0FBQ3RELCtEQUErRDtBQUMvRCx5RUFBOEU7QUFDOUUsK0NBQTZDO0FBQzdDLGdEQUE0RDtBQUM1RCwyQ0FBc0M7QUFFdEMsb0RBQW9EO0FBQ3ZDLFFBQUEsYUFBYSxHQUFHLGNBQWMsQ0FBQztBQUU1QywrQkFBK0I7QUFDL0IsTUFBYSxZQUFZO0lBa0J2QixZQUNTLE9BQXNCLEVBQ3JCLE9BQTJCLEVBQzNCLEdBQWM7UUFGZixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ3JCLFlBQU8sR0FBUCxPQUFPLENBQW9CO1FBQzNCLFFBQUcsR0FBSCxHQUFHLENBQVc7UUFWeEIsZ0NBQWdDO1FBQ3hCLFdBQU0sR0FBNkIsSUFBQSxrQkFBUyxFQUFDLENBQUMsZ0NBQXdCLENBQUMsQ0FBQyxDQUFDO0lBVTlFLENBQUM7SUFyQkosTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBc0IsRUFBRSxPQUFlLEVBQUUsT0FBZTtRQUM1RSxNQUFNLEdBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUEscURBQThCLEVBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0RSxPQUFPLElBQUksWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQVFELCtDQUErQztJQUMvQyxJQUFZLFdBQVc7UUFDckIsT0FBTyxJQUFJLENBQUMs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bnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlbmRlcn0gZnJvbSAnZWpzJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtDb21taXRGcm9tR2l0TG9nfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5cbmltcG9ydCB7cHJvbXB0SW5wdXR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtmb3JtYXRGaWxlc30gZnJvbSAnLi4vLi4vZm9ybWF0L2Zvcm1hdCc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHthc3NlcnRWYWxpZFJlbGVhc2VDb25maWcsIFJlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge1JlbmRlckNvbnRleHR9IGZyb20gJy4vY29udGV4dCc7XG5cbmltcG9ydCBjaGFuZ2Vsb2dUZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlcy9jaGFuZ2Vsb2cnO1xuaW1wb3J0IGdpdGh1YlJlbGVhc2VUZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlcy9naXRodWItcmVsZWFzZSc7XG5pbXBvcnQge2dldENvbW1pdHNGb3JSYW5nZVdpdGhEZWR1cGluZ30gZnJvbSAnLi9jb21taXRzL2dldC1jb21taXRzLWluLXJhbmdlJztcbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHthc3NlcnRWYWxpZEZvcm1hdENvbmZpZ30gZnJvbSAnLi4vLi4vZm9ybWF0L2NvbmZpZyc7XG5pbXBvcnQge0NoYW5nZWxvZ30gZnJvbSAnLi9jaGFuZ2Vsb2cnO1xuXG4vKiogUHJvamVjdC1yZWxhdGl2ZSBwYXRoIGZvciB0aGUgY2hhbmdlbG9nIGZpbGUuICovXG5leHBvcnQgY29uc3QgY2hhbmdlbG9nUGF0aCA9ICdDSEFOR0VMT0cubWQnO1xuXG4vKiogUmVsZWFzZSBub3RlIGdlbmVyYXRpb24uICovXG5leHBvcnQgY2xhc3MgUmVsZWFzZU5vdGVzIHtcbiAgc3RhdGljIGFzeW5jIGZvclJhbmdlKHZlcnNpb246IHNlbXZlci5TZW1WZXIsIGJhc2VSZWY6IHN0cmluZywgaGVhZFJlZjogc3RyaW5nKSB7XG4gICAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAgIGNvbnN0IGNvbW1pdHMgPSBnZXRDb21taXRzRm9yUmFuZ2VXaXRoRGVkdXBpbmcoZ2l0LCBiYXNlUmVmLCBoZWFkUmVmKTtcbiAgICByZXR1cm4gbmV3IFJlbGVhc2VOb3Rlcyh2ZXJzaW9uLCBjb21taXRzLCBnaXQpO1xuICB9XG5cbiAgLyoqIFRoZSBSZW5kZXJDb250ZXh0IHRvIGJlIHVzZWQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbiAgcHJpdmF0ZSByZW5kZXJDb250ZXh0OiBSZW5kZXJDb250ZXh0IHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIHRpdGxlIHRvIHVzZSBmb3IgdGhlIHJlbGVhc2UuICovXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZyB8IGZhbHNlIHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gbmctZGV2LiAqL1xuICBwcml2YXRlIGNvbmZpZzoge3JlbGVhc2U6IFJlbGVhc2VDb25maWd9ID0gZ2V0Q29uZmlnKFthc3NlcnRWYWxpZFJlbGVhc2VDb25maWddKTtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgcmVsZWFzZSBub3Rlcy4gKi9cbiAgcHJpdmF0ZSBnZXQgbm90ZXNDb25maWcoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLnJlbGVhc2UucmVsZWFzZU5vdGVzID8/IHt9O1xuICB9XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuICAgIHByaXZhdGUgY29tbWl0czogQ29tbWl0RnJvbUdpdExvZ1tdLFxuICAgIHByaXZhdGUgZ2l0OiBHaXRDbGllbnQsXG4gICkge31cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgR2l0aHViIFJlbGVhc2UuICovXG4gIGFzeW5jIGdldEdpdGh1YlJlbGVhc2VFbnRyeSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiByZW5kZXIoZ2l0aHViUmVsZWFzZVRlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7XG4gICAgICBybVdoaXRlc3BhY2U6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgQ0hBTkdFTE9HIGVudHJ5LiAqL1xuICBhc3luYyBnZXRDaGFuZ2Vsb2dFbnRyeSgpIHtcbiAgICByZXR1cm4gcmVuZGVyKGNoYW5nZWxvZ1RlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7cm1XaGl0ZXNwYWNlOiB0cnVlfSk7XG4gIH1cblxuICAvKipcbiAgICogUHJlcGVuZCBnZW5lcmF0ZWQgcmVsZWFzZSBub3RlIHRvIHRoZSBDSEFOR0VMT0cubWQgZmlsZSBpbiB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnlcbiAgICogcHJvdmlkZWQgYnkgdGhlIEdpdENsaWVudC5cbiAgICovXG4gIGFzeW5jIHByZXBlbmRFbnRyeVRvQ2hhbmdlbG9nRmlsZSgpIHtcbiAgICBDaGFuZ2Vsb2cucHJlcGVuZEVudHJ5VG9DaGFuZ2Vsb2dGaWxlKGF3YWl0IHRoaXMuZ2V0Q2hhbmdlbG9nRW50cnkoKSwgdGhpcy5naXQpO1xuXG4gICAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogUmVtb3ZlIGZpbGUgZm9ybWF0dGluZyBjYWxscy5cbiAgICAvLyAgIFVwb24gcmVhY2hpbmcgYSBzdGFuZGFyZGl6ZWQgZm9ybWF0dGluZyBmb3IgbWFya2Rvd24gZmlsZXMsIHJhdGhlciB0aGFuIGNhbGxpbmcgYSBmb3JtYXR0ZXJcbiAgICAvLyAgIGZvciBhbGwgY3JlYXRpb24gb2YgY2hhbmdlbG9ncywgd2UgaW5zdGVhZCB3aWxsIGNvbmZpcm0gaW4gb3VyIHRlc3RpbmcgdGhhdCB0aGUgbmV3IGNoYW5nZXNcbiAgICAvLyAgIGNyZWF0ZWQgZm9yIGNoYW5nZWxvZ3MgbWVldCBvbiBzdGFuZGFyZGl6ZWQgbWFya2Rvd24gZm9ybWF0cyB2aWEgdW5pdCB0ZXN0aW5nLlxuICAgIHRyeSB7XG4gICAgICBhc3NlcnRWYWxpZEZvcm1hdENvbmZpZyh0aGlzLmNvbmZpZyk7XG4gICAgICBhd2FpdCBmb3JtYXRGaWxlcyhbQ2hhbmdlbG9nLmdldENoYW5nZWxvZ0ZpbGVQYXRocyh0aGlzLmdpdCkuZmlsZVBhdGhdKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElmIHRoZSBmb3JtYXR0aW5nIGlzIGVpdGhlciB1bmF2YWlsYWJsZSBvciBmYWlscywgY29udGludWUgb24gd2l0aCB0aGUgdW5mb3JtYXR0ZWQgcmVzdWx0LlxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgbnVtYmVyIG9mIGNvbW1pdHMgaW5jbHVkZWQgaW4gdGhlIHJlbGVhc2Ugbm90ZXMgYWZ0ZXIgZmlsdGVyaW5nIGFuZCBkZWR1cGluZy4gKi9cbiAgYXN5bmMgZ2V0Q29tbWl0Q291bnRJblJlbGVhc2VOb3RlcygpIHtcbiAgICBjb25zdCBjb250ZXh0ID0gYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKTtcbiAgICByZXR1cm4gY29udGV4dC5jb21taXRzLmZpbHRlcihjb250ZXh0LmluY2x1ZGVJblJlbGVhc2VOb3RlcygpKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgVVJMIGZyYWdtZW50IGZvciB0aGUgcmVsZWFzZSBub3Rlcy4gVGhlIFVSTCBmcmFnbWVudCBpZGVudGlmaWVyXG4gICAqIGNhbiBiZSB1c2VkIHRvIHBvaW50IHRvIGEgc3BlY2lmaWMgY2hhbmdlbG9nIGVudHJ5IHRocm91Z2ggYW4gVVJMLlxuICAgKi9cbiAgYXN5bmMgZ2V0VXJsRnJhZ21lbnRGb3JSZWxlYXNlKCkge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSkudXJsRnJhZ21lbnRGb3JSZWxlYXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdCB0aGUgdXNlciBmb3IgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2UsIGlmIHRoZSBwcm9qZWN0J3MgY29uZmlndXJhdGlvbiBpcyBkZWZpbmVkIHRvIHVzZSBhXG4gICAqIHRpdGxlLlxuICAgKi9cbiAgYXN5bmMgcHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCkge1xuICAgIGlmICh0aGlzLnRpdGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLm5vdGVzQ29uZmlnLnVzZVJlbGVhc2VUaXRsZSkge1xuICAgICAgICB0aGlzLnRpdGxlID0gYXdhaXQgcHJvbXB0SW5wdXQoJ1BsZWFzZSBwcm92aWRlIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlOicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50aXRsZTtcbiAgfVxuXG4gIC8qKiBCdWlsZCB0aGUgcmVuZGVyIGNvbnRleHQgZGF0YSBvYmplY3QgZm9yIGNvbnN0cnVjdGluZyB0aGUgUmVuZGVyQ29udGV4dCBpbnN0YW5jZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBnZW5lcmF0ZVJlbmRlckNvbnRleHQoKTogUHJvbWlzZTxSZW5kZXJDb250ZXh0PiB7XG4gICAgaWYgKCF0aGlzLnJlbmRlckNvbnRleHQpIHtcbiAgICAgIHRoaXMucmVuZGVyQ29udGV4dCA9IG5ldyBSZW5kZXJDb250ZXh0KHtcbiAgICAgICAgY29tbWl0czogdGhpcy5jb21taXRzLFxuICAgICAgICBnaXRodWI6IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZyxcbiAgICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uLmZvcm1hdCgpLFxuICAgICAgICBncm91cE9yZGVyOiB0aGlzLm5vdGVzQ29uZmlnLmdyb3VwT3JkZXIsXG4gICAgICAgIGhpZGRlblNjb3BlczogdGhpcy5ub3Rlc0NvbmZpZy5oaWRkZW5TY29wZXMsXG4gICAgICAgIGNhdGVnb3JpemVDb21taXQ6IHRoaXMubm90ZXNDb25maWcuY2F0ZWdvcml6ZUNvbW1pdCxcbiAgICAgICAgdGl0bGU6IGF3YWl0IHRoaXMucHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCksXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyQ29udGV4dDtcbiAgfVxufVxuIl19