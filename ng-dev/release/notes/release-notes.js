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
const console_1 = require("../../utils/console");
const git_client_1 = require("../../utils/git/git-client");
const index_1 = require("../config/index");
const context_1 = require("./context");
const changelog_1 = require("./templates/changelog");
const github_release_1 = require("./templates/github-release");
const get_commits_in_range_1 = require("./commits/get-commits-in-range");
const config_1 = require("../../utils/config");
/** Release note generation. */
class ReleaseNotes {
    constructor(version, commits) {
        this.version = version;
        this.commits = commits;
        /** An instance of GitClient. */
        this.git = git_client_1.GitClient.get();
        /** The configuration for release notes. */
        this.config = this.getReleaseConfig().releaseNotes ?? {};
    }
    static async forRange(version, baseRef, headRef) {
        const client = git_client_1.GitClient.get();
        const commits = get_commits_in_range_1.getCommitsForRangeWithDeduping(client, baseRef, headRef);
        return new ReleaseNotes(version, commits);
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
                commits: this.commits,
                github: this.git.remoteConfig,
                version: this.version.format(),
                groupOrder: this.config.groupOrder,
                hiddenScopes: this.config.hiddenScopes,
                title: await this.promptForReleaseTitle(),
            });
        }
        return this.renderContext;
    }
    // This method is used for access to the utility functions while allowing them
    // to be overwritten in subclasses during testing.
    getReleaseConfig() {
        const config = config_1.getConfig();
        index_1.assertValidReleaseConfig(config);
        return config.release;
    }
}
exports.ReleaseNotes = ReleaseNotes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkJBQTJCO0FBSTNCLGlEQUFnRDtBQUNoRCwyREFBcUQ7QUFDckQsMkNBQTZFO0FBQzdFLHVDQUF3QztBQUV4QyxxREFBc0Q7QUFDdEQsK0RBQStEO0FBQy9ELHlFQUE4RTtBQUM5RSwrQ0FBNkM7QUFFN0MsK0JBQStCO0FBQy9CLE1BQWEsWUFBWTtJQWdCdkIsWUFBNkIsT0FBc0IsRUFBVSxPQUEyQjtRQUEzRCxZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUFUeEYsZ0NBQWdDO1FBQ3hCLFFBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBSzlCLDJDQUEyQztRQUNuQyxXQUFNLEdBQXVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7SUFFVyxDQUFDO0lBZjVGLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQXNCLEVBQUUsT0FBZSxFQUFFLE9BQWU7UUFDNUUsTUFBTSxNQUFNLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMvQixNQUFNLE9BQU8sR0FBRyxxREFBOEIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFhRCxnRUFBZ0U7SUFDaEUsS0FBSyxDQUFDLHFCQUFxQjtRQUN6QixPQUFPLFlBQU0sQ0FBQyx3QkFBcUIsRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1lBQ3ZFLFlBQVksRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxpRUFBaUU7SUFDakUsS0FBSyxDQUFDLGlCQUFpQjtRQUNyQixPQUFPLFlBQU0sQ0FBQyxtQkFBaUIsRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyx3QkFBd0I7UUFDNUIsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztJQUNwRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLHFCQUFxQjtRQUN6QixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxxQkFBVyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7YUFDM0U7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDcEI7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsd0ZBQXdGO0lBQ2hGLEtBQUssQ0FBQyxxQkFBcUI7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHVCQUFhLENBQUM7Z0JBQ3JDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQkFDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWTtnQkFDN0IsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUM5QixVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVO2dCQUNsQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZO2dCQUN0QyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUU7YUFDMUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQztJQUVELDhFQUE4RTtJQUM5RSxrREFBa0Q7SUFDeEMsZ0JBQWdCO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQztRQUMzQixnQ0FBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztDQUNGO0FBM0VELG9DQTJFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZW5kZXJ9IGZyb20gJ2Vqcyc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuXG5pbXBvcnQge3Byb21wdElucHV0fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZywgUmVsZWFzZU5vdGVzQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtSZW5kZXJDb250ZXh0fSBmcm9tICcuL2NvbnRleHQnO1xuXG5pbXBvcnQgY2hhbmdlbG9nVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvY2hhbmdlbG9nJztcbmltcG9ydCBnaXRodWJSZWxlYXNlVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UnO1xuaW1wb3J0IHtnZXRDb21taXRzRm9yUmFuZ2VXaXRoRGVkdXBpbmd9IGZyb20gJy4vY29tbWl0cy9nZXQtY29tbWl0cy1pbi1yYW5nZSc7XG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcblxuLyoqIFJlbGVhc2Ugbm90ZSBnZW5lcmF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIFJlbGVhc2VOb3RlcyB7XG4gIHN0YXRpYyBhc3luYyBmb3JSYW5nZSh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBiYXNlUmVmOiBzdHJpbmcsIGhlYWRSZWY6IHN0cmluZykge1xuICAgIGNvbnN0IGNsaWVudCA9IEdpdENsaWVudC5nZXQoKTtcbiAgICBjb25zdCBjb21taXRzID0gZ2V0Q29tbWl0c0ZvclJhbmdlV2l0aERlZHVwaW5nKGNsaWVudCwgYmFzZVJlZiwgaGVhZFJlZik7XG4gICAgcmV0dXJuIG5ldyBSZWxlYXNlTm90ZXModmVyc2lvbiwgY29tbWl0cyk7XG4gIH1cblxuICAvKiogQW4gaW5zdGFuY2Ugb2YgR2l0Q2xpZW50LiAqL1xuICBwcml2YXRlIGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBSZW5kZXJDb250ZXh0IHRvIGJlIHVzZWQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbiAgcHJpdmF0ZSByZW5kZXJDb250ZXh0OiBSZW5kZXJDb250ZXh0IHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIHRpdGxlIHRvIHVzZSBmb3IgdGhlIHJlbGVhc2UuICovXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZyB8IGZhbHNlIHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHJlbGVhc2Ugbm90ZXMuICovXG4gIHByaXZhdGUgY29uZmlnOiBSZWxlYXNlTm90ZXNDb25maWcgPSB0aGlzLmdldFJlbGVhc2VDb25maWcoKS5yZWxlYXNlTm90ZXMgPz8ge307XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHB1YmxpYyB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwcml2YXRlIGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSkge31cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgR2l0aHViIFJlbGVhc2UuICovXG4gIGFzeW5jIGdldEdpdGh1YlJlbGVhc2VFbnRyeSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiByZW5kZXIoZ2l0aHViUmVsZWFzZVRlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7XG4gICAgICBybVdoaXRlc3BhY2U6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgQ0hBTkdFTE9HIGVudHJ5LiAqL1xuICBhc3luYyBnZXRDaGFuZ2Vsb2dFbnRyeSgpIHtcbiAgICByZXR1cm4gcmVuZGVyKGNoYW5nZWxvZ1RlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7cm1XaGl0ZXNwYWNlOiB0cnVlfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgVVJMIGZyYWdtZW50IGZvciB0aGUgcmVsZWFzZSBub3Rlcy4gVGhlIFVSTCBmcmFnbWVudCBpZGVudGlmaWVyXG4gICAqIGNhbiBiZSB1c2VkIHRvIHBvaW50IHRvIGEgc3BlY2lmaWMgY2hhbmdlbG9nIGVudHJ5IHRocm91Z2ggYW4gVVJMLlxuICAgKi9cbiAgYXN5bmMgZ2V0VXJsRnJhZ21lbnRGb3JSZWxlYXNlKCkge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSkudXJsRnJhZ21lbnRGb3JSZWxlYXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdCB0aGUgdXNlciBmb3IgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2UsIGlmIHRoZSBwcm9qZWN0J3MgY29uZmlndXJhdGlvbiBpcyBkZWZpbmVkIHRvIHVzZSBhXG4gICAqIHRpdGxlLlxuICAgKi9cbiAgYXN5bmMgcHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCkge1xuICAgIGlmICh0aGlzLnRpdGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy51c2VSZWxlYXNlVGl0bGUpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGF3YWl0IHByb21wdElucHV0KCdQbGVhc2UgcHJvdmlkZSBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZTonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGl0bGU7XG4gIH1cblxuICAvKiogQnVpbGQgdGhlIHJlbmRlciBjb250ZXh0IGRhdGEgb2JqZWN0IGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJlbmRlckNvbnRleHQgaW5zdGFuY2UuICovXG4gIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk6IFByb21pc2U8UmVuZGVyQ29udGV4dD4ge1xuICAgIGlmICghdGhpcy5yZW5kZXJDb250ZXh0KSB7XG4gICAgICB0aGlzLnJlbmRlckNvbnRleHQgPSBuZXcgUmVuZGVyQ29udGV4dCh7XG4gICAgICAgIGNvbW1pdHM6IHRoaXMuY29tbWl0cyxcbiAgICAgICAgZ2l0aHViOiB0aGlzLmdpdC5yZW1vdGVDb25maWcsXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbi5mb3JtYXQoKSxcbiAgICAgICAgZ3JvdXBPcmRlcjogdGhpcy5jb25maWcuZ3JvdXBPcmRlcixcbiAgICAgICAgaGlkZGVuU2NvcGVzOiB0aGlzLmNvbmZpZy5oaWRkZW5TY29wZXMsXG4gICAgICAgIHRpdGxlOiBhd2FpdCB0aGlzLnByb21wdEZvclJlbGVhc2VUaXRsZSgpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlckNvbnRleHQ7XG4gIH1cblxuICAvLyBUaGlzIG1ldGhvZCBpcyB1c2VkIGZvciBhY2Nlc3MgdG8gdGhlIHV0aWxpdHkgZnVuY3Rpb25zIHdoaWxlIGFsbG93aW5nIHRoZW1cbiAgLy8gdG8gYmUgb3ZlcndyaXR0ZW4gaW4gc3ViY2xhc3NlcyBkdXJpbmcgdGVzdGluZy5cbiAgcHJvdGVjdGVkIGdldFJlbGVhc2VDb25maWcoKSB7XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gICAgYXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG4gICAgcmV0dXJuIGNvbmZpZy5yZWxlYXNlO1xuICB9XG59XG4iXX0=