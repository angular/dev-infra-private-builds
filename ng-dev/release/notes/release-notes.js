"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseNotes = void 0;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ejs_1 = require("ejs");
const utils_1 = require("../../commit-message/utils");
const console_1 = require("../../utils/console");
const git_client_1 = require("../../utils/git/git-client");
const index_1 = require("../config/index");
const context_1 = require("./context");
const changelog_1 = require("./templates/changelog");
const github_release_1 = require("./templates/github-release");
/** Release note generation. */
class ReleaseNotes {
    constructor(version, startingRef, endingRef) {
        this.version = version;
        this.startingRef = startingRef;
        this.endingRef = endingRef;
        /** An instance of GitClient. */
        this.git = git_client_1.GitClient.get();
        /** A promise resolving to a list of Commits since the latest semver tag on the branch. */
        this.commits = this.getCommitsInRange(this.startingRef, this.endingRef);
        /** The configuration for release notes. */
        this.config = this.getReleaseConfig().releaseNotes;
    }
    static async fromRange(version, startingRef, endingRef) {
        return new ReleaseNotes(version, startingRef, endingRef);
    }
    /** Retrieve the release note generated for a Github Release. */
    async getGithubReleaseEntry() {
        return ejs_1.render(github_release_1.default, await this.generateRenderContext(), {
            rmWhitespace: true,
        });
    }
    /** Retrieve the release note generated for a CHANGELOG entry. */
    async getChangelogEntry() {
        return ejs_1.render(changelog_1.default, await this.generateRenderContext(), { rmWhitespace: true });
    }
    /**
     * Prompt the user for a title for the release, if the project's configuration is defined to use a
     * title.
     */
    async promptForReleaseTitle() {
        if (this.title === undefined) {
            if (this.config.useReleaseTitle) {
                this.title = await console_1.promptInput('Please provide a title for the release:');
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
                commits: await this.commits,
                github: this.git.remoteConfig,
                version: this.version.format(),
                groupOrder: this.config.groupOrder,
                hiddenScopes: this.config.hiddenScopes,
                title: await this.promptForReleaseTitle(),
            });
        }
        return this.renderContext;
    }
    // These methods are used for access to the utility functions while allowing them to be
    // overwritten in subclasses during testing.
    async getCommitsInRange(from, to) {
        return utils_1.getCommitsInRange(from, to);
    }
    getReleaseConfig(config) {
        return index_1.getReleaseConfig(config);
    }
}
exports.ReleaseNotes = ReleaseNotes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkJBQTJCO0FBSTNCLHNEQUE2RDtBQUM3RCxpREFBZ0Q7QUFDaEQsMkRBQXFEO0FBQ3JELDJDQUE0RjtBQUM1Rix1Q0FBd0M7QUFFeEMscURBQXNEO0FBQ3RELCtEQUErRDtBQUUvRCwrQkFBK0I7QUFDL0IsTUFBYSxZQUFZO0lBbUJ2QixZQUNTLE9BQXNCLEVBQ3JCLFdBQW1CLEVBQ25CLFNBQWlCO1FBRmxCLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFDckIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFDbkIsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQWpCM0IsZ0NBQWdDO1FBQ3hCLFFBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBSzlCLDBGQUEwRjtRQUNsRixZQUFPLEdBQWdDLElBQUksQ0FBQyxpQkFBaUIsQ0FDbkUsSUFBSSxDQUFDLFdBQVcsRUFDaEIsSUFBSSxDQUFDLFNBQVMsQ0FDZixDQUFDO1FBQ0YsMkNBQTJDO1FBQ25DLFdBQU0sR0FBdUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsWUFBWSxDQUFDO0lBTXZFLENBQUM7SUF0QkosTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBc0IsRUFBRSxXQUFtQixFQUFFLFNBQWlCO1FBQ25GLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBc0JELGdFQUFnRTtJQUNoRSxLQUFLLENBQUMscUJBQXFCO1FBQ3pCLE9BQU8sWUFBTSxDQUFDLHdCQUFxQixFQUFFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUU7WUFDdkUsWUFBWSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGlFQUFpRTtJQUNqRSxLQUFLLENBQUMsaUJBQWlCO1FBQ3JCLE9BQU8sWUFBTSxDQUFDLG1CQUFpQixFQUFFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLHFCQUFxQjtRQUN6QixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxxQkFBVyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7YUFDM0U7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDcEI7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsd0ZBQXdGO0lBQ2hGLEtBQUssQ0FBQyxxQkFBcUI7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHVCQUFhLENBQUM7Z0JBQ3JDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQyxPQUFPO2dCQUMzQixNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO2dCQUM3QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7Z0JBQ2xDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7Z0JBQ3RDLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRTthQUMxQyxDQUFDLENBQUM7U0FDSjtRQUNELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBRUQsdUZBQXVGO0lBQ3ZGLDRDQUE0QztJQUNsQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBWSxFQUFFLEVBQVc7UUFDekQsT0FBTyx5QkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVTLGdCQUFnQixDQUFDLE1BQXVDO1FBQ2hFLE9BQU8sd0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNGO0FBNUVELG9DQTRFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZW5kZXJ9IGZyb20gJ2Vqcyc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuXG5pbXBvcnQge2dldENvbW1pdHNJblJhbmdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS91dGlscyc7XG5pbXBvcnQge3Byb21wdElucHV0fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge0RldkluZnJhUmVsZWFzZUNvbmZpZywgZ2V0UmVsZWFzZUNvbmZpZywgUmVsZWFzZU5vdGVzQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtSZW5kZXJDb250ZXh0fSBmcm9tICcuL2NvbnRleHQnO1xuXG5pbXBvcnQgY2hhbmdlbG9nVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvY2hhbmdlbG9nJztcbmltcG9ydCBnaXRodWJSZWxlYXNlVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UnO1xuXG4vKiogUmVsZWFzZSBub3RlIGdlbmVyYXRpb24uICovXG5leHBvcnQgY2xhc3MgUmVsZWFzZU5vdGVzIHtcbiAgc3RhdGljIGFzeW5jIGZyb21SYW5nZSh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBzdGFydGluZ1JlZjogc3RyaW5nLCBlbmRpbmdSZWY6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUmVsZWFzZU5vdGVzKHZlcnNpb24sIHN0YXJ0aW5nUmVmLCBlbmRpbmdSZWYpO1xuICB9XG5cbiAgLyoqIEFuIGluc3RhbmNlIG9mIEdpdENsaWVudC4gKi9cbiAgcHJpdmF0ZSBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gIC8qKiBUaGUgUmVuZGVyQ29udGV4dCB0byBiZSB1c2VkIGR1cmluZyByZW5kZXJpbmcuICovXG4gIHByaXZhdGUgcmVuZGVyQ29udGV4dDogUmVuZGVyQ29udGV4dCB8IHVuZGVmaW5lZDtcbiAgLyoqIFRoZSB0aXRsZSB0byB1c2UgZm9yIHRoZSByZWxlYXNlLiAqL1xuICBwcml2YXRlIHRpdGxlOiBzdHJpbmcgfCBmYWxzZSB8IHVuZGVmaW5lZDtcbiAgLyoqIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYSBsaXN0IG9mIENvbW1pdHMgc2luY2UgdGhlIGxhdGVzdCBzZW12ZXIgdGFnIG9uIHRoZSBicmFuY2guICovXG4gIHByaXZhdGUgY29tbWl0czogUHJvbWlzZTxDb21taXRGcm9tR2l0TG9nW10+ID0gdGhpcy5nZXRDb21taXRzSW5SYW5nZShcbiAgICB0aGlzLnN0YXJ0aW5nUmVmLFxuICAgIHRoaXMuZW5kaW5nUmVmLFxuICApO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHJlbGVhc2Ugbm90ZXMuICovXG4gIHByaXZhdGUgY29uZmlnOiBSZWxlYXNlTm90ZXNDb25maWcgPSB0aGlzLmdldFJlbGVhc2VDb25maWcoKS5yZWxlYXNlTm90ZXM7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuICAgIHByaXZhdGUgc3RhcnRpbmdSZWY6IHN0cmluZyxcbiAgICBwcml2YXRlIGVuZGluZ1JlZjogc3RyaW5nLFxuICApIHt9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIEdpdGh1YiBSZWxlYXNlLiAqL1xuICBhc3luYyBnZXRHaXRodWJSZWxlYXNlRW50cnkoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gcmVuZGVyKGdpdGh1YlJlbGVhc2VUZW1wbGF0ZSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSwge1xuICAgICAgcm1XaGl0ZXNwYWNlOiB0cnVlLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIENIQU5HRUxPRyBlbnRyeS4gKi9cbiAgYXN5bmMgZ2V0Q2hhbmdlbG9nRW50cnkoKSB7XG4gICAgcmV0dXJuIHJlbmRlcihjaGFuZ2Vsb2dUZW1wbGF0ZSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSwge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdCB0aGUgdXNlciBmb3IgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2UsIGlmIHRoZSBwcm9qZWN0J3MgY29uZmlndXJhdGlvbiBpcyBkZWZpbmVkIHRvIHVzZSBhXG4gICAqIHRpdGxlLlxuICAgKi9cbiAgYXN5bmMgcHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCkge1xuICAgIGlmICh0aGlzLnRpdGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy51c2VSZWxlYXNlVGl0bGUpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGF3YWl0IHByb21wdElucHV0KCdQbGVhc2UgcHJvdmlkZSBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZTonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGl0bGU7XG4gIH1cblxuICAvKiogQnVpbGQgdGhlIHJlbmRlciBjb250ZXh0IGRhdGEgb2JqZWN0IGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJlbmRlckNvbnRleHQgaW5zdGFuY2UuICovXG4gIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk6IFByb21pc2U8UmVuZGVyQ29udGV4dD4ge1xuICAgIGlmICghdGhpcy5yZW5kZXJDb250ZXh0KSB7XG4gICAgICB0aGlzLnJlbmRlckNvbnRleHQgPSBuZXcgUmVuZGVyQ29udGV4dCh7XG4gICAgICAgIGNvbW1pdHM6IGF3YWl0IHRoaXMuY29tbWl0cyxcbiAgICAgICAgZ2l0aHViOiB0aGlzLmdpdC5yZW1vdGVDb25maWcsXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbi5mb3JtYXQoKSxcbiAgICAgICAgZ3JvdXBPcmRlcjogdGhpcy5jb25maWcuZ3JvdXBPcmRlcixcbiAgICAgICAgaGlkZGVuU2NvcGVzOiB0aGlzLmNvbmZpZy5oaWRkZW5TY29wZXMsXG4gICAgICAgIHRpdGxlOiBhd2FpdCB0aGlzLnByb21wdEZvclJlbGVhc2VUaXRsZSgpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlckNvbnRleHQ7XG4gIH1cblxuICAvLyBUaGVzZSBtZXRob2RzIGFyZSB1c2VkIGZvciBhY2Nlc3MgdG8gdGhlIHV0aWxpdHkgZnVuY3Rpb25zIHdoaWxlIGFsbG93aW5nIHRoZW0gdG8gYmVcbiAgLy8gb3ZlcndyaXR0ZW4gaW4gc3ViY2xhc3NlcyBkdXJpbmcgdGVzdGluZy5cbiAgcHJvdGVjdGVkIGFzeW5jIGdldENvbW1pdHNJblJhbmdlKGZyb206IHN0cmluZywgdG8/OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZ2V0Q29tbWl0c0luUmFuZ2UoZnJvbSwgdG8pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldFJlbGVhc2VDb25maWcoY29uZmlnPzogUGFydGlhbDxEZXZJbmZyYVJlbGVhc2VDb25maWc+KSB7XG4gICAgcmV0dXJuIGdldFJlbGVhc2VDb25maWcoY29uZmlnKTtcbiAgfVxufVxuIl19