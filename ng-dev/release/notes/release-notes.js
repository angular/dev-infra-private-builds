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
                categorizeCommit: this.config.categorizeCommit,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkJBQTJCO0FBSTNCLGlEQUFnRDtBQUNoRCwyREFBcUQ7QUFDckQsMkNBQTZFO0FBQzdFLHVDQUF3QztBQUV4QyxxREFBc0Q7QUFDdEQsK0RBQStEO0FBQy9ELHlFQUE4RTtBQUM5RSwrQ0FBNkM7QUFFN0MsK0JBQStCO0FBQy9CLE1BQWEsWUFBWTtJQWdCdkIsWUFBNkIsT0FBc0IsRUFBVSxPQUEyQjtRQUEzRCxZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUFUeEYsZ0NBQWdDO1FBQ3hCLFFBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBSzlCLDJDQUEyQztRQUNuQyxXQUFNLEdBQXVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7SUFFVyxDQUFDO0lBZjVGLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQXNCLEVBQUUsT0FBZSxFQUFFLE9BQWU7UUFDNUUsTUFBTSxNQUFNLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMvQixNQUFNLE9BQU8sR0FBRyxxREFBOEIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFhRCxnRUFBZ0U7SUFDaEUsS0FBSyxDQUFDLHFCQUFxQjtRQUN6QixPQUFPLFlBQU0sQ0FBQyx3QkFBcUIsRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1lBQ3ZFLFlBQVksRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxpRUFBaUU7SUFDakUsS0FBSyxDQUFDLGlCQUFpQjtRQUNyQixPQUFPLFlBQU0sQ0FBQyxtQkFBaUIsRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQztJQUVELGlHQUFpRztJQUNqRyxLQUFLLENBQUMsNEJBQTRCO1FBQ2hDLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDbkQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN4RSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLHdCQUF3QjtRQUM1QixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO0lBQ3BFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMscUJBQXFCO1FBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7WUFDNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLHFCQUFXLENBQUMseUNBQXlDLENBQUMsQ0FBQzthQUMzRTtpQkFBTTtnQkFDTCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzthQUNwQjtTQUNGO1FBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFFRCx3RkFBd0Y7SUFDaEYsS0FBSyxDQUFDLHFCQUFxQjtRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksdUJBQWEsQ0FBQztnQkFDckMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO2dCQUNyQixNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO2dCQUM3QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7Z0JBQ2xDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7Z0JBQ3RDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCO2dCQUM5QyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUU7YUFDMUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQztJQUVELDhFQUE4RTtJQUM5RSxrREFBa0Q7SUFDeEMsZ0JBQWdCO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQztRQUMzQixnQ0FBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztDQUNGO0FBbEZELG9DQWtGQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZW5kZXJ9IGZyb20gJ2Vqcyc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuXG5pbXBvcnQge3Byb21wdElucHV0fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZywgUmVsZWFzZU5vdGVzQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtSZW5kZXJDb250ZXh0fSBmcm9tICcuL2NvbnRleHQnO1xuXG5pbXBvcnQgY2hhbmdlbG9nVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvY2hhbmdlbG9nJztcbmltcG9ydCBnaXRodWJSZWxlYXNlVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UnO1xuaW1wb3J0IHtnZXRDb21taXRzRm9yUmFuZ2VXaXRoRGVkdXBpbmd9IGZyb20gJy4vY29tbWl0cy9nZXQtY29tbWl0cy1pbi1yYW5nZSc7XG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcblxuLyoqIFJlbGVhc2Ugbm90ZSBnZW5lcmF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIFJlbGVhc2VOb3RlcyB7XG4gIHN0YXRpYyBhc3luYyBmb3JSYW5nZSh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBiYXNlUmVmOiBzdHJpbmcsIGhlYWRSZWY6IHN0cmluZykge1xuICAgIGNvbnN0IGNsaWVudCA9IEdpdENsaWVudC5nZXQoKTtcbiAgICBjb25zdCBjb21taXRzID0gZ2V0Q29tbWl0c0ZvclJhbmdlV2l0aERlZHVwaW5nKGNsaWVudCwgYmFzZVJlZiwgaGVhZFJlZik7XG4gICAgcmV0dXJuIG5ldyBSZWxlYXNlTm90ZXModmVyc2lvbiwgY29tbWl0cyk7XG4gIH1cblxuICAvKiogQW4gaW5zdGFuY2Ugb2YgR2l0Q2xpZW50LiAqL1xuICBwcml2YXRlIGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBSZW5kZXJDb250ZXh0IHRvIGJlIHVzZWQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbiAgcHJpdmF0ZSByZW5kZXJDb250ZXh0OiBSZW5kZXJDb250ZXh0IHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIHRpdGxlIHRvIHVzZSBmb3IgdGhlIHJlbGVhc2UuICovXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZyB8IGZhbHNlIHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHJlbGVhc2Ugbm90ZXMuICovXG4gIHByaXZhdGUgY29uZmlnOiBSZWxlYXNlTm90ZXNDb25maWcgPSB0aGlzLmdldFJlbGVhc2VDb25maWcoKS5yZWxlYXNlTm90ZXMgPz8ge307XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHB1YmxpYyB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwcml2YXRlIGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSkge31cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgR2l0aHViIFJlbGVhc2UuICovXG4gIGFzeW5jIGdldEdpdGh1YlJlbGVhc2VFbnRyeSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiByZW5kZXIoZ2l0aHViUmVsZWFzZVRlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7XG4gICAgICBybVdoaXRlc3BhY2U6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgQ0hBTkdFTE9HIGVudHJ5LiAqL1xuICBhc3luYyBnZXRDaGFuZ2Vsb2dFbnRyeSgpIHtcbiAgICByZXR1cm4gcmVuZGVyKGNoYW5nZWxvZ1RlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7cm1XaGl0ZXNwYWNlOiB0cnVlfSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIG51bWJlciBvZiBjb21taXRzIGluY2x1ZGVkIGluIHRoZSByZWxlYXNlIG5vdGVzIGFmdGVyIGZpbHRlcmluZyBhbmQgZGVkdXBpbmcuICovXG4gIGFzeW5jIGdldENvbW1pdENvdW50SW5SZWxlYXNlTm90ZXMoKSB7XG4gICAgY29uc3QgY29udGV4dCA9IGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk7XG4gICAgcmV0dXJuIGNvbnRleHQuY29tbWl0cy5maWx0ZXIoY29udGV4dC5pbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSkubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIFVSTCBmcmFnbWVudCBmb3IgdGhlIHJlbGVhc2Ugbm90ZXMuIFRoZSBVUkwgZnJhZ21lbnQgaWRlbnRpZmllclxuICAgKiBjYW4gYmUgdXNlZCB0byBwb2ludCB0byBhIHNwZWNpZmljIGNoYW5nZWxvZyBlbnRyeSB0aHJvdWdoIGFuIFVSTC5cbiAgICovXG4gIGFzeW5jIGdldFVybEZyYWdtZW50Rm9yUmVsZWFzZSgpIHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCkpLnVybEZyYWdtZW50Rm9yUmVsZWFzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHQgdGhlIHVzZXIgZm9yIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlLCBpZiB0aGUgcHJvamVjdCdzIGNvbmZpZ3VyYXRpb24gaXMgZGVmaW5lZCB0byB1c2UgYVxuICAgKiB0aXRsZS5cbiAgICovXG4gIGFzeW5jIHByb21wdEZvclJlbGVhc2VUaXRsZSgpIHtcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodGhpcy5jb25maWcudXNlUmVsZWFzZVRpdGxlKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBhd2FpdCBwcm9tcHRJbnB1dCgnUGxlYXNlIHByb3ZpZGUgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2U6Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpdGxlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRpdGxlO1xuICB9XG5cbiAgLyoqIEJ1aWxkIHRoZSByZW5kZXIgY29udGV4dCBkYXRhIG9iamVjdCBmb3IgY29uc3RydWN0aW5nIHRoZSBSZW5kZXJDb250ZXh0IGluc3RhbmNlLiAqL1xuICBwcml2YXRlIGFzeW5jIGdlbmVyYXRlUmVuZGVyQ29udGV4dCgpOiBQcm9taXNlPFJlbmRlckNvbnRleHQ+IHtcbiAgICBpZiAoIXRoaXMucmVuZGVyQ29udGV4dCkge1xuICAgICAgdGhpcy5yZW5kZXJDb250ZXh0ID0gbmV3IFJlbmRlckNvbnRleHQoe1xuICAgICAgICBjb21taXRzOiB0aGlzLmNvbW1pdHMsXG4gICAgICAgIGdpdGh1YjogdGhpcy5naXQucmVtb3RlQ29uZmlnLFxuICAgICAgICB2ZXJzaW9uOiB0aGlzLnZlcnNpb24uZm9ybWF0KCksXG4gICAgICAgIGdyb3VwT3JkZXI6IHRoaXMuY29uZmlnLmdyb3VwT3JkZXIsXG4gICAgICAgIGhpZGRlblNjb3BlczogdGhpcy5jb25maWcuaGlkZGVuU2NvcGVzLFxuICAgICAgICBjYXRlZ29yaXplQ29tbWl0OiB0aGlzLmNvbmZpZy5jYXRlZ29yaXplQ29tbWl0LFxuICAgICAgICB0aXRsZTogYXdhaXQgdGhpcy5wcm9tcHRGb3JSZWxlYXNlVGl0bGUoKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW5kZXJDb250ZXh0O1xuICB9XG5cbiAgLy8gVGhpcyBtZXRob2QgaXMgdXNlZCBmb3IgYWNjZXNzIHRvIHRoZSB1dGlsaXR5IGZ1bmN0aW9ucyB3aGlsZSBhbGxvd2luZyB0aGVtXG4gIC8vIHRvIGJlIG92ZXJ3cml0dGVuIGluIHN1YmNsYXNzZXMgZHVyaW5nIHRlc3RpbmcuXG4gIHByb3RlY3RlZCBnZXRSZWxlYXNlQ29uZmlnKCkge1xuICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICAgIGFzc2VydFZhbGlkUmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICAgIHJldHVybiBjb25maWcucmVsZWFzZTtcbiAgfVxufVxuIl19