"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseNotes = exports.workspaceRelativeChangelogPath = void 0;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ejs_1 = require("ejs");
const semver = require("semver");
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
/** Workspace-relative path for the changelog file. */
exports.workspaceRelativeChangelogPath = 'CHANGELOG.md';
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
     * provided by the GitClient. Removes entries for related prerelease entries as appropriate.
     */
    async prependEntryToChangelogFile() {
        // When the version for the entry is a non-prelease (i.e. 1.0.0 rather than 1.0.0-next.1), the
        // pre-release entries for the version should be removed from the changelog.
        if (semver.prerelease(this.version) === null) {
            changelog_2.Changelog.removePrereleaseEntriesForVersion(this.git, this.version);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkJBQTJCO0FBQzNCLGlDQUFpQztBQUdqQyxpREFBZ0Q7QUFDaEQsZ0RBQWdEO0FBRWhELDJDQUF3RTtBQUN4RSx1Q0FBd0M7QUFFeEMscURBQXNEO0FBQ3RELCtEQUErRDtBQUMvRCx5RUFBOEU7QUFDOUUsK0NBQTZDO0FBQzdDLGdEQUE0RDtBQUM1RCwyQ0FBc0M7QUFFdEMsc0RBQXNEO0FBQ3pDLFFBQUEsOEJBQThCLEdBQUcsY0FBYyxDQUFDO0FBRTdELCtCQUErQjtBQUMvQixNQUFhLFlBQVk7SUFpQnZCLFlBQ1MsT0FBc0IsRUFDckIsT0FBMkIsRUFDM0IsR0FBYztRQUZmLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFDckIsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUFDM0IsUUFBRyxHQUFILEdBQUcsQ0FBVztRQVZ4QixnQ0FBZ0M7UUFDeEIsV0FBTSxHQUE2QixJQUFBLGtCQUFTLEVBQUMsQ0FBQyxnQ0FBd0IsQ0FBQyxDQUFDLENBQUM7SUFVOUUsQ0FBQztJQXBCSixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFjLEVBQUUsT0FBc0IsRUFBRSxPQUFlLEVBQUUsT0FBZTtRQUM1RixNQUFNLE9BQU8sR0FBRyxJQUFBLHFEQUE4QixFQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEUsT0FBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFRRCwrQ0FBK0M7SUFDL0MsSUFBWSxXQUFXO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUFJLEVBQUUs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O2dCQUNuRCxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUU7YUFDMUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQztDQUNGO0FBdkdELG9DQXVHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZW5kZXJ9IGZyb20gJ2Vqcyc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuXG5pbXBvcnQge3Byb21wdElucHV0fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Zm9ybWF0RmlsZXN9IGZyb20gJy4uLy4uL2Zvcm1hdC9mb3JtYXQnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7YXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnLCBSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtSZW5kZXJDb250ZXh0fSBmcm9tICcuL2NvbnRleHQnO1xuXG5pbXBvcnQgY2hhbmdlbG9nVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvY2hhbmdlbG9nJztcbmltcG9ydCBnaXRodWJSZWxlYXNlVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UnO1xuaW1wb3J0IHtnZXRDb21taXRzRm9yUmFuZ2VXaXRoRGVkdXBpbmd9IGZyb20gJy4vY29tbWl0cy9nZXQtY29tbWl0cy1pbi1yYW5nZSc7XG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRGb3JtYXRDb25maWd9IGZyb20gJy4uLy4uL2Zvcm1hdC9jb25maWcnO1xuaW1wb3J0IHtDaGFuZ2Vsb2d9IGZyb20gJy4vY2hhbmdlbG9nJztcblxuLyoqIFdvcmtzcGFjZS1yZWxhdGl2ZSBwYXRoIGZvciB0aGUgY2hhbmdlbG9nIGZpbGUuICovXG5leHBvcnQgY29uc3Qgd29ya3NwYWNlUmVsYXRpdmVDaGFuZ2Vsb2dQYXRoID0gJ0NIQU5HRUxPRy5tZCc7XG5cbi8qKiBSZWxlYXNlIG5vdGUgZ2VuZXJhdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBSZWxlYXNlTm90ZXMge1xuICBzdGF0aWMgYXN5bmMgZm9yUmFuZ2UoZ2l0OiBHaXRDbGllbnQsIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIGJhc2VSZWY6IHN0cmluZywgaGVhZFJlZjogc3RyaW5nKSB7XG4gICAgY29uc3QgY29tbWl0cyA9IGdldENvbW1pdHNGb3JSYW5nZVdpdGhEZWR1cGluZyhnaXQsIGJhc2VSZWYsIGhlYWRSZWYpO1xuICAgIHJldHVybiBuZXcgUmVsZWFzZU5vdGVzKHZlcnNpb24sIGNvbW1pdHMsIGdpdCk7XG4gIH1cblxuICAvKiogVGhlIFJlbmRlckNvbnRleHQgdG8gYmUgdXNlZCBkdXJpbmcgcmVuZGVyaW5nLiAqL1xuICBwcml2YXRlIHJlbmRlckNvbnRleHQ6IFJlbmRlckNvbnRleHQgfCB1bmRlZmluZWQ7XG4gIC8qKiBUaGUgdGl0bGUgdG8gdXNlIGZvciB0aGUgcmVsZWFzZS4gKi9cbiAgcHJpdmF0ZSB0aXRsZTogc3RyaW5nIHwgZmFsc2UgfCB1bmRlZmluZWQ7XG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiBuZy1kZXYuICovXG4gIHByaXZhdGUgY29uZmlnOiB7cmVsZWFzZTogUmVsZWFzZUNvbmZpZ30gPSBnZXRDb25maWcoW2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZ10pO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSByZWxlYXNlIG5vdGVzLiAqL1xuICBwcml2YXRlIGdldCBub3Rlc0NvbmZpZygpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcucmVsZWFzZS5yZWxlYXNlTm90ZXMgPz8ge307XG4gIH1cblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHZlcnNpb246IHNlbXZlci5TZW1WZXIsXG4gICAgcHJpdmF0ZSBjb21taXRzOiBDb21taXRGcm9tR2l0TG9nW10sXG4gICAgcHJpdmF0ZSBnaXQ6IEdpdENsaWVudCxcbiAgKSB7fVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgcmVsZWFzZSBub3RlIGdlbmVyYXRlZCBmb3IgYSBHaXRodWIgUmVsZWFzZS4gKi9cbiAgYXN5bmMgZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHJlbmRlcihnaXRodWJSZWxlYXNlVGVtcGxhdGUsIGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCksIHtcbiAgICAgIHJtV2hpdGVzcGFjZTogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgcmVsZWFzZSBub3RlIGdlbmVyYXRlZCBmb3IgYSBDSEFOR0VMT0cgZW50cnkuICovXG4gIGFzeW5jIGdldENoYW5nZWxvZ0VudHJ5KCkge1xuICAgIHJldHVybiByZW5kZXIoY2hhbmdlbG9nVGVtcGxhdGUsIGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCksIHtybVdoaXRlc3BhY2U6IHRydWV9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwZW5kIGdlbmVyYXRlZCByZWxlYXNlIG5vdGUgdG8gdGhlIENIQU5HRUxPRy5tZCBmaWxlIGluIHRoZSBiYXNlIGRpcmVjdG9yeSBvZiB0aGUgcmVwb3NpdG9yeVxuICAgKiBwcm92aWRlZCBieSB0aGUgR2l0Q2xpZW50LiBSZW1vdmVzIGVudHJpZXMgZm9yIHJlbGF0ZWQgcHJlcmVsZWFzZSBlbnRyaWVzIGFzIGFwcHJvcHJpYXRlLlxuICAgKi9cbiAgYXN5bmMgcHJlcGVuZEVudHJ5VG9DaGFuZ2Vsb2dGaWxlKCkge1xuICAgIC8vIFdoZW4gdGhlIHZlcnNpb24gZm9yIHRoZSBlbnRyeSBpcyBhIG5vbi1wcmVsZWFzZSAoaS5lLiAxLjAuMCByYXRoZXIgdGhhbiAxLjAuMC1uZXh0LjEpLCB0aGVcbiAgICAvLyBwcmUtcmVsZWFzZSBlbnRyaWVzIGZvciB0aGUgdmVyc2lvbiBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIHRoZSBjaGFuZ2Vsb2cuXG4gICAgaWYgKHNlbXZlci5wcmVyZWxlYXNlKHRoaXMudmVyc2lvbikgPT09IG51bGwpIHtcbiAgICAgIENoYW5nZWxvZy5yZW1vdmVQcmVyZWxlYXNlRW50cmllc0ZvclZlcnNpb24odGhpcy5naXQsIHRoaXMudmVyc2lvbik7XG4gICAgfVxuICAgIENoYW5nZWxvZy5wcmVwZW5kRW50cnlUb0NoYW5nZWxvZ0ZpbGUodGhpcy5naXQsIGF3YWl0IHRoaXMuZ2V0Q2hhbmdlbG9nRW50cnkoKSk7XG5cbiAgICAvLyBUT0RPKGpvc2VwaHBlcnJvdHQpOiBSZW1vdmUgZmlsZSBmb3JtYXR0aW5nIGNhbGxzLlxuICAgIC8vICAgVXBvbiByZWFjaGluZyBhIHN0YW5kYXJkaXplZCBmb3JtYXR0aW5nIGZvciBtYXJrZG93biBmaWxlcywgcmF0aGVyIHRoYW4gY2FsbGluZyBhIGZvcm1hdHRlclxuICAgIC8vICAgZm9yIGFsbCBjcmVhdGlvbiBvZiBjaGFuZ2Vsb2dzLCB3ZSBpbnN0ZWFkIHdpbGwgY29uZmlybSBpbiBvdXIgdGVzdGluZyB0aGF0IHRoZSBuZXcgY2hhbmdlc1xuICAgIC8vICAgY3JlYXRlZCBmb3IgY2hhbmdlbG9ncyBtZWV0IG9uIHN0YW5kYXJkaXplZCBtYXJrZG93biBmb3JtYXRzIHZpYSB1bml0IHRlc3RpbmcuXG4gICAgdHJ5IHtcbiAgICAgIGFzc2VydFZhbGlkRm9ybWF0Q29uZmlnKHRoaXMuY29uZmlnKTtcbiAgICAgIGF3YWl0IGZvcm1hdEZpbGVzKFtDaGFuZ2Vsb2cuZ2V0Q2hhbmdlbG9nRmlsZVBhdGhzKHRoaXMuZ2l0KS5maWxlUGF0aF0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWYgdGhlIGZvcm1hdHRpbmcgaXMgZWl0aGVyIHVuYXZhaWxhYmxlIG9yIGZhaWxzLCBjb250aW51ZSBvbiB3aXRoIHRoZSB1bmZvcm1hdHRlZCByZXN1bHQuXG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSBudW1iZXIgb2YgY29tbWl0cyBpbmNsdWRlZCBpbiB0aGUgcmVsZWFzZSBub3RlcyBhZnRlciBmaWx0ZXJpbmcgYW5kIGRlZHVwaW5nLiAqL1xuICBhc3luYyBnZXRDb21taXRDb3VudEluUmVsZWFzZU5vdGVzKCkge1xuICAgIGNvbnN0IGNvbnRleHQgPSBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpO1xuICAgIHJldHVybiBjb250ZXh0LmNvbW1pdHMuZmlsdGVyKGNvbnRleHQuaW5jbHVkZUluUmVsZWFzZU5vdGVzKCkpLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBVUkwgZnJhZ21lbnQgZm9yIHRoZSByZWxlYXNlIG5vdGVzLiBUaGUgVVJMIGZyYWdtZW50IGlkZW50aWZpZXJcbiAgICogY2FuIGJlIHVzZWQgdG8gcG9pbnQgdG8gYSBzcGVjaWZpYyBjaGFuZ2Vsb2cgZW50cnkgdGhyb3VnaCBhbiBVUkwuXG4gICAqL1xuICBhc3luYyBnZXRVcmxGcmFnbWVudEZvclJlbGVhc2UoKSB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpKS51cmxGcmFnbWVudEZvclJlbGVhc2U7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0IHRoZSB1c2VyIGZvciBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZSwgaWYgdGhlIHByb2plY3QncyBjb25maWd1cmF0aW9uIGlzIGRlZmluZWQgdG8gdXNlIGFcbiAgICogdGl0bGUuXG4gICAqL1xuICBhc3luYyBwcm9tcHRGb3JSZWxlYXNlVGl0bGUoKSB7XG4gICAgaWYgKHRoaXMudGl0bGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHRoaXMubm90ZXNDb25maWcudXNlUmVsZWFzZVRpdGxlKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBhd2FpdCBwcm9tcHRJbnB1dCgnUGxlYXNlIHByb3ZpZGUgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2U6Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpdGxlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRpdGxlO1xuICB9XG5cbiAgLyoqIEJ1aWxkIHRoZSByZW5kZXIgY29udGV4dCBkYXRhIG9iamVjdCBmb3IgY29uc3RydWN0aW5nIHRoZSBSZW5kZXJDb250ZXh0IGluc3RhbmNlLiAqL1xuICBwcml2YXRlIGFzeW5jIGdlbmVyYXRlUmVuZGVyQ29udGV4dCgpOiBQcm9taXNlPFJlbmRlckNvbnRleHQ+IHtcbiAgICBpZiAoIXRoaXMucmVuZGVyQ29udGV4dCkge1xuICAgICAgdGhpcy5yZW5kZXJDb250ZXh0ID0gbmV3IFJlbmRlckNvbnRleHQoe1xuICAgICAgICBjb21taXRzOiB0aGlzLmNvbW1pdHMsXG4gICAgICAgIGdpdGh1YjogdGhpcy5naXQucmVtb3RlQ29uZmlnLFxuICAgICAgICB2ZXJzaW9uOiB0aGlzLnZlcnNpb24uZm9ybWF0KCksXG4gICAgICAgIGdyb3VwT3JkZXI6IHRoaXMubm90ZXNDb25maWcuZ3JvdXBPcmRlcixcbiAgICAgICAgaGlkZGVuU2NvcGVzOiB0aGlzLm5vdGVzQ29uZmlnLmhpZGRlblNjb3BlcyxcbiAgICAgICAgY2F0ZWdvcml6ZUNvbW1pdDogdGhpcy5ub3Rlc0NvbmZpZy5jYXRlZ29yaXplQ29tbWl0LFxuICAgICAgICB0aXRsZTogYXdhaXQgdGhpcy5wcm9tcHRGb3JSZWxlYXNlVGl0bGUoKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW5kZXJDb250ZXh0O1xuICB9XG59XG4iXX0=