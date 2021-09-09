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
const fs_1 = require("fs");
const path_1 = require("path");
const config_2 = require("../../format/config");
/** Project-relative path for the changelog file. */
exports.changelogPath = 'CHANGELOG.md';
/** Release note generation. */
class ReleaseNotes {
    constructor(version, commits, git) {
        this.version = version;
        this.commits = commits;
        this.git = git;
        /** The absolute path to the changelog file. */
        this.changelogPath = (0, path_1.join)(this.git.baseDir, exports.changelogPath);
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
        /** The changelog contents in the current changelog. */
        let changelog = '';
        if ((0, fs_1.existsSync)(this.changelogPath)) {
            changelog = (0, fs_1.readFileSync)(this.changelogPath, { encoding: 'utf8' });
        }
        /** The new changelog entry to add to the changelog. */
        const entry = await this.getChangelogEntry();
        (0, fs_1.writeFileSync)(this.changelogPath, `${entry}\n\n${changelog}`);
        // TODO(josephperrott): Remove file formatting calls.
        //   Upon reaching a standardized formatting for markdown files, rather than calling a formatter
        //   for all creation of changelogs, we instead will confirm in our testing that the new changes
        //   created for changelogs meet on standardized markdown formats via unit testing.
        try {
            (0, config_2.assertValidFormatConfig)(this.config);
            await (0, format_1.formatFiles)([this.changelogPath]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkJBQTJCO0FBSTNCLGlEQUFnRDtBQUNoRCxnREFBZ0Q7QUFDaEQsMkRBQXFEO0FBQ3JELDJDQUF3RTtBQUN4RSx1Q0FBd0M7QUFFeEMscURBQXNEO0FBQ3RELCtEQUErRDtBQUMvRCx5RUFBOEU7QUFDOUUsK0NBQTZDO0FBQzdDLDJCQUEyRDtBQUMzRCwrQkFBMEI7QUFDMUIsZ0RBQTREO0FBRTVELG9EQUFvRDtBQUN2QyxRQUFBLGFBQWEsR0FBRyxjQUFjLENBQUM7QUFFNUMsK0JBQStCO0FBQy9CLE1BQWEsWUFBWTtJQW9CdkIsWUFDUyxPQUFzQixFQUNyQixPQUEyQixFQUMzQixHQUFjO1FBRmYsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUNyQixZQUFPLEdBQVAsT0FBTyxDQUFvQjtRQUMzQixRQUFHLEdBQUgsR0FBRyxDQUFXO1FBaEJ4QiwrQ0FBK0M7UUFDdkMsa0JBQWEsR0FBRyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxxQkFBYSxDQUFDLENBQUM7UUFLOUQsZ0NBQWdDO1FBQ3hCLFdBQU0sR0FBNkIsSUFBQSxrQkFBUyxFQUFDLENBQUMsZ0NBQXdCLENBQUMsQ0FBQyxDQUFDO0lBVTlFLENBQUM7SUF2QkosTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBc0IsRUFBRSxPQUFlLEVBQUUsT0FBZTtRQUM1RSxNQUFNLEdBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUEscURBQThCLEVBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0RSxPQUFPLElBQUks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QkFDN0IsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUM5QixVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVO2dCQUN2QyxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZO2dCQUMzQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQjtnQkFDbkQsS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFO2FBQzFDLENBQUMsQ0FBQztTQUNKO1FBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVCLENBQUM7Q0FDRjtBQTdHRCxvQ0E2R0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVuZGVyfSBmcm9tICdlanMnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0NvbW1pdEZyb21HaXRMb2d9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcblxuaW1wb3J0IHtwcm9tcHRJbnB1dH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2Zvcm1hdEZpbGVzfSBmcm9tICcuLi8uLi9mb3JtYXQvZm9ybWF0JztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZywgUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7UmVuZGVyQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcblxuaW1wb3J0IGNoYW5nZWxvZ1RlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGVzL2NoYW5nZWxvZyc7XG5pbXBvcnQgZ2l0aHViUmVsZWFzZVRlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGVzL2dpdGh1Yi1yZWxlYXNlJztcbmltcG9ydCB7Z2V0Q29tbWl0c0ZvclJhbmdlV2l0aERlZHVwaW5nfSBmcm9tICcuL2NvbW1pdHMvZ2V0LWNvbW1pdHMtaW4tcmFuZ2UnO1xuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2V4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRGb3JtYXRDb25maWd9IGZyb20gJy4uLy4uL2Zvcm1hdC9jb25maWcnO1xuXG4vKiogUHJvamVjdC1yZWxhdGl2ZSBwYXRoIGZvciB0aGUgY2hhbmdlbG9nIGZpbGUuICovXG5leHBvcnQgY29uc3QgY2hhbmdlbG9nUGF0aCA9ICdDSEFOR0VMT0cubWQnO1xuXG4vKiogUmVsZWFzZSBub3RlIGdlbmVyYXRpb24uICovXG5leHBvcnQgY2xhc3MgUmVsZWFzZU5vdGVzIHtcbiAgc3RhdGljIGFzeW5jIGZvclJhbmdlKHZlcnNpb246IHNlbXZlci5TZW1WZXIsIGJhc2VSZWY6IHN0cmluZywgaGVhZFJlZjogc3RyaW5nKSB7XG4gICAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAgIGNvbnN0IGNvbW1pdHMgPSBnZXRDb21taXRzRm9yUmFuZ2VXaXRoRGVkdXBpbmcoZ2l0LCBiYXNlUmVmLCBoZWFkUmVmKTtcbiAgICByZXR1cm4gbmV3IFJlbGVhc2VOb3Rlcyh2ZXJzaW9uLCBjb21taXRzLCBnaXQpO1xuICB9XG5cbiAgLyoqIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBjaGFuZ2Vsb2cgZmlsZS4gKi9cbiAgcHJpdmF0ZSBjaGFuZ2Vsb2dQYXRoID0gam9pbih0aGlzLmdpdC5iYXNlRGlyLCBjaGFuZ2Vsb2dQYXRoKTtcbiAgLyoqIFRoZSBSZW5kZXJDb250ZXh0IHRvIGJlIHVzZWQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbiAgcHJpdmF0ZSByZW5kZXJDb250ZXh0OiBSZW5kZXJDb250ZXh0IHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIHRpdGxlIHRvIHVzZSBmb3IgdGhlIHJlbGVhc2UuICovXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZyB8IGZhbHNlIHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gbmctZGV2LiAqL1xuICBwcml2YXRlIGNvbmZpZzoge3JlbGVhc2U6IFJlbGVhc2VDb25maWd9ID0gZ2V0Q29uZmlnKFthc3NlcnRWYWxpZFJlbGVhc2VDb25maWddKTtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgcmVsZWFzZSBub3Rlcy4gKi9cbiAgcHJpdmF0ZSBnZXQgbm90ZXNDb25maWcoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLnJlbGVhc2UucmVsZWFzZU5vdGVzID8/IHt9O1xuICB9XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuICAgIHByaXZhdGUgY29tbWl0czogQ29tbWl0RnJvbUdpdExvZ1tdLFxuICAgIHByaXZhdGUgZ2l0OiBHaXRDbGllbnQsXG4gICkge31cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgR2l0aHViIFJlbGVhc2UuICovXG4gIGFzeW5jIGdldEdpdGh1YlJlbGVhc2VFbnRyeSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiByZW5kZXIoZ2l0aHViUmVsZWFzZVRlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7XG4gICAgICBybVdoaXRlc3BhY2U6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgQ0hBTkdFTE9HIGVudHJ5LiAqL1xuICBhc3luYyBnZXRDaGFuZ2Vsb2dFbnRyeSgpIHtcbiAgICByZXR1cm4gcmVuZGVyKGNoYW5nZWxvZ1RlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7cm1XaGl0ZXNwYWNlOiB0cnVlfSk7XG4gIH1cblxuICAvKipcbiAgICogUHJlcGVuZCBnZW5lcmF0ZWQgcmVsZWFzZSBub3RlIHRvIHRoZSBDSEFOR0VMT0cubWQgZmlsZSBpbiB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnlcbiAgICogcHJvdmlkZWQgYnkgdGhlIEdpdENsaWVudC5cbiAgICovXG4gIGFzeW5jIHByZXBlbmRFbnRyeVRvQ2hhbmdlbG9nKCkge1xuICAgIC8qKiBUaGUgY2hhbmdlbG9nIGNvbnRlbnRzIGluIHRoZSBjdXJyZW50IGNoYW5nZWxvZy4gKi9cbiAgICBsZXQgY2hhbmdlbG9nID0gJyc7XG4gICAgaWYgKGV4aXN0c1N5bmModGhpcy5jaGFuZ2Vsb2dQYXRoKSkge1xuICAgICAgY2hhbmdlbG9nID0gcmVhZEZpbGVTeW5jKHRoaXMuY2hhbmdlbG9nUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KTtcbiAgICB9XG4gICAgLyoqIFRoZSBuZXcgY2hhbmdlbG9nIGVudHJ5IHRvIGFkZCB0byB0aGUgY2hhbmdlbG9nLiAqL1xuICAgIGNvbnN0IGVudHJ5ID0gYXdhaXQgdGhpcy5nZXRDaGFuZ2Vsb2dFbnRyeSgpO1xuXG4gICAgd3JpdGVGaWxlU3luYyh0aGlzLmNoYW5nZWxvZ1BhdGgsIGAke2VudHJ5fVxcblxcbiR7Y2hhbmdlbG9nfWApO1xuXG4gICAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogUmVtb3ZlIGZpbGUgZm9ybWF0dGluZyBjYWxscy5cbiAgICAvLyAgIFVwb24gcmVhY2hpbmcgYSBzdGFuZGFyZGl6ZWQgZm9ybWF0dGluZyBmb3IgbWFya2Rvd24gZmlsZXMsIHJhdGhlciB0aGFuIGNhbGxpbmcgYSBmb3JtYXR0ZXJcbiAgICAvLyAgIGZvciBhbGwgY3JlYXRpb24gb2YgY2hhbmdlbG9ncywgd2UgaW5zdGVhZCB3aWxsIGNvbmZpcm0gaW4gb3VyIHRlc3RpbmcgdGhhdCB0aGUgbmV3IGNoYW5nZXNcbiAgICAvLyAgIGNyZWF0ZWQgZm9yIGNoYW5nZWxvZ3MgbWVldCBvbiBzdGFuZGFyZGl6ZWQgbWFya2Rvd24gZm9ybWF0cyB2aWEgdW5pdCB0ZXN0aW5nLlxuICAgIHRyeSB7XG4gICAgICBhc3NlcnRWYWxpZEZvcm1hdENvbmZpZyh0aGlzLmNvbmZpZyk7XG4gICAgICBhd2FpdCBmb3JtYXRGaWxlcyhbdGhpcy5jaGFuZ2Vsb2dQYXRoXSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZiB0aGUgZm9ybWF0dGluZyBpcyBlaXRoZXIgdW5hdmFpbGFibGUgb3IgZmFpbHMsIGNvbnRpbnVlIG9uIHdpdGggdGhlIHVuZm9ybWF0dGVkIHJlc3VsdC5cbiAgICB9XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIG51bWJlciBvZiBjb21taXRzIGluY2x1ZGVkIGluIHRoZSByZWxlYXNlIG5vdGVzIGFmdGVyIGZpbHRlcmluZyBhbmQgZGVkdXBpbmcuICovXG4gIGFzeW5jIGdldENvbW1pdENvdW50SW5SZWxlYXNlTm90ZXMoKSB7XG4gICAgY29uc3QgY29udGV4dCA9IGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk7XG4gICAgcmV0dXJuIGNvbnRleHQuY29tbWl0cy5maWx0ZXIoY29udGV4dC5pbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSkubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIFVSTCBmcmFnbWVudCBmb3IgdGhlIHJlbGVhc2Ugbm90ZXMuIFRoZSBVUkwgZnJhZ21lbnQgaWRlbnRpZmllclxuICAgKiBjYW4gYmUgdXNlZCB0byBwb2ludCB0byBhIHNwZWNpZmljIGNoYW5nZWxvZyBlbnRyeSB0aHJvdWdoIGFuIFVSTC5cbiAgICovXG4gIGFzeW5jIGdldFVybEZyYWdtZW50Rm9yUmVsZWFzZSgpIHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCkpLnVybEZyYWdtZW50Rm9yUmVsZWFzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHQgdGhlIHVzZXIgZm9yIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlLCBpZiB0aGUgcHJvamVjdCdzIGNvbmZpZ3VyYXRpb24gaXMgZGVmaW5lZCB0byB1c2UgYVxuICAgKiB0aXRsZS5cbiAgICovXG4gIGFzeW5jIHByb21wdEZvclJlbGVhc2VUaXRsZSgpIHtcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodGhpcy5ub3Rlc0NvbmZpZy51c2VSZWxlYXNlVGl0bGUpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGF3YWl0IHByb21wdElucHV0KCdQbGVhc2UgcHJvdmlkZSBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZTonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGl0bGU7XG4gIH1cblxuICAvKiogQnVpbGQgdGhlIHJlbmRlciBjb250ZXh0IGRhdGEgb2JqZWN0IGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJlbmRlckNvbnRleHQgaW5zdGFuY2UuICovXG4gIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk6IFByb21pc2U8UmVuZGVyQ29udGV4dD4ge1xuICAgIGlmICghdGhpcy5yZW5kZXJDb250ZXh0KSB7XG4gICAgICB0aGlzLnJlbmRlckNvbnRleHQgPSBuZXcgUmVuZGVyQ29udGV4dCh7XG4gICAgICAgIGNvbW1pdHM6IHRoaXMuY29tbWl0cyxcbiAgICAgICAgZ2l0aHViOiB0aGlzLmdpdC5yZW1vdGVDb25maWcsXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbi5mb3JtYXQoKSxcbiAgICAgICAgZ3JvdXBPcmRlcjogdGhpcy5ub3Rlc0NvbmZpZy5ncm91cE9yZGVyLFxuICAgICAgICBoaWRkZW5TY29wZXM6IHRoaXMubm90ZXNDb25maWcuaGlkZGVuU2NvcGVzLFxuICAgICAgICBjYXRlZ29yaXplQ29tbWl0OiB0aGlzLm5vdGVzQ29uZmlnLmNhdGVnb3JpemVDb21taXQsXG4gICAgICAgIHRpdGxlOiBhd2FpdCB0aGlzLnByb21wdEZvclJlbGVhc2VUaXRsZSgpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlckNvbnRleHQ7XG4gIH1cbn1cbiJdfQ==