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
    // These methods are used for access to the utility functions while allowing them
    // to be overwritten in subclasses during testing.
    getReleaseConfig(config) {
        return index_1.getReleaseConfig(config);
    }
}
exports.ReleaseNotes = ReleaseNotes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkJBQTJCO0FBSTNCLGlEQUFnRDtBQUNoRCwyREFBcUQ7QUFDckQsMkNBQTRGO0FBQzVGLHVDQUF3QztBQUV4QyxxREFBc0Q7QUFDdEQsK0RBQStEO0FBQy9ELHlFQUE4RTtBQUU5RSwrQkFBK0I7QUFDL0IsTUFBYSxZQUFZO0lBZ0J2QixZQUE2QixPQUFzQixFQUFVLE9BQTJCO1FBQTNELFlBQU8sR0FBUCxPQUFPLENBQWU7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFvQjtRQVR4RixnQ0FBZ0M7UUFDeEIsUUFBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFLOUIsMkNBQTJDO1FBQ25DLFdBQU0sR0FBdUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztJQUVXLENBQUM7SUFmNUYsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBc0IsRUFBRSxPQUFlLEVBQUUsT0FBZTtRQUM1RSxNQUFNLE1BQU0sR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQy9CLE1BQU0sT0FBTyxHQUFHLHFEQUE4QixDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekUsT0FBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQWFELGdFQUFnRTtJQUNoRSxLQUFLLENBQUMscUJBQXFCO1FBQ3pCLE9BQU8sWUFBTSxDQUFDLHdCQUFxQixFQUFFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUU7WUFDdkUsWUFBWSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGlFQUFpRTtJQUNqRSxLQUFLLENBQUMsaUJBQWlCO1FBQ3JCLE9BQU8sWUFBTSxDQUFDLG1CQUFpQixFQUFFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLHFCQUFxQjtRQUN6QixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxxQkFBVyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7YUFDM0U7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDcEI7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsd0ZBQXdGO0lBQ2hGLEtBQUssQ0FBQyxxQkFBcUI7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHVCQUFhLENBQUM7Z0JBQ3JDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztnQkFDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWTtnQkFDN0IsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUM5QixVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVO2dCQUNsQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZO2dCQUN0QyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUU7YUFDMUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQztJQUVELGlGQUFpRjtJQUNqRixrREFBa0Q7SUFDeEMsZ0JBQWdCLENBQUMsTUFBdUM7UUFDaEUsT0FBTyx3QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0Y7QUFqRUQsb0NBaUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlbmRlcn0gZnJvbSAnZWpzJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtDb21taXRGcm9tR2l0TG9nfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5cbmltcG9ydCB7cHJvbXB0SW5wdXR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7RGV2SW5mcmFSZWxlYXNlQ29uZmlnLCBnZXRSZWxlYXNlQ29uZmlnLCBSZWxlYXNlTm90ZXNDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge1JlbmRlckNvbnRleHR9IGZyb20gJy4vY29udGV4dCc7XG5cbmltcG9ydCBjaGFuZ2Vsb2dUZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlcy9jaGFuZ2Vsb2cnO1xuaW1wb3J0IGdpdGh1YlJlbGVhc2VUZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlcy9naXRodWItcmVsZWFzZSc7XG5pbXBvcnQge2dldENvbW1pdHNGb3JSYW5nZVdpdGhEZWR1cGluZ30gZnJvbSAnLi9jb21taXRzL2dldC1jb21taXRzLWluLXJhbmdlJztcblxuLyoqIFJlbGVhc2Ugbm90ZSBnZW5lcmF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIFJlbGVhc2VOb3RlcyB7XG4gIHN0YXRpYyBhc3luYyBmb3JSYW5nZSh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBiYXNlUmVmOiBzdHJpbmcsIGhlYWRSZWY6IHN0cmluZykge1xuICAgIGNvbnN0IGNsaWVudCA9IEdpdENsaWVudC5nZXQoKTtcbiAgICBjb25zdCBjb21taXRzID0gZ2V0Q29tbWl0c0ZvclJhbmdlV2l0aERlZHVwaW5nKGNsaWVudCwgYmFzZVJlZiwgaGVhZFJlZik7XG4gICAgcmV0dXJuIG5ldyBSZWxlYXNlTm90ZXModmVyc2lvbiwgY29tbWl0cyk7XG4gIH1cblxuICAvKiogQW4gaW5zdGFuY2Ugb2YgR2l0Q2xpZW50LiAqL1xuICBwcml2YXRlIGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBSZW5kZXJDb250ZXh0IHRvIGJlIHVzZWQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbiAgcHJpdmF0ZSByZW5kZXJDb250ZXh0OiBSZW5kZXJDb250ZXh0IHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIHRpdGxlIHRvIHVzZSBmb3IgdGhlIHJlbGVhc2UuICovXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZyB8IGZhbHNlIHwgdW5kZWZpbmVkO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHJlbGVhc2Ugbm90ZXMuICovXG4gIHByaXZhdGUgY29uZmlnOiBSZWxlYXNlTm90ZXNDb25maWcgPSB0aGlzLmdldFJlbGVhc2VDb25maWcoKS5yZWxlYXNlTm90ZXMgPz8ge307XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHB1YmxpYyB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwcml2YXRlIGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSkge31cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgR2l0aHViIFJlbGVhc2UuICovXG4gIGFzeW5jIGdldEdpdGh1YlJlbGVhc2VFbnRyeSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiByZW5kZXIoZ2l0aHViUmVsZWFzZVRlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7XG4gICAgICBybVdoaXRlc3BhY2U6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgQ0hBTkdFTE9HIGVudHJ5LiAqL1xuICBhc3luYyBnZXRDaGFuZ2Vsb2dFbnRyeSgpIHtcbiAgICByZXR1cm4gcmVuZGVyKGNoYW5nZWxvZ1RlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7cm1XaGl0ZXNwYWNlOiB0cnVlfSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0IHRoZSB1c2VyIGZvciBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZSwgaWYgdGhlIHByb2plY3QncyBjb25maWd1cmF0aW9uIGlzIGRlZmluZWQgdG8gdXNlIGFcbiAgICogdGl0bGUuXG4gICAqL1xuICBhc3luYyBwcm9tcHRGb3JSZWxlYXNlVGl0bGUoKSB7XG4gICAgaWYgKHRoaXMudGl0bGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHRoaXMuY29uZmlnLnVzZVJlbGVhc2VUaXRsZSkge1xuICAgICAgICB0aGlzLnRpdGxlID0gYXdhaXQgcHJvbXB0SW5wdXQoJ1BsZWFzZSBwcm92aWRlIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlOicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50aXRsZTtcbiAgfVxuXG4gIC8qKiBCdWlsZCB0aGUgcmVuZGVyIGNvbnRleHQgZGF0YSBvYmplY3QgZm9yIGNvbnN0cnVjdGluZyB0aGUgUmVuZGVyQ29udGV4dCBpbnN0YW5jZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBnZW5lcmF0ZVJlbmRlckNvbnRleHQoKTogUHJvbWlzZTxSZW5kZXJDb250ZXh0PiB7XG4gICAgaWYgKCF0aGlzLnJlbmRlckNvbnRleHQpIHtcbiAgICAgIHRoaXMucmVuZGVyQ29udGV4dCA9IG5ldyBSZW5kZXJDb250ZXh0KHtcbiAgICAgICAgY29tbWl0czogdGhpcy5jb21taXRzLFxuICAgICAgICBnaXRodWI6IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZyxcbiAgICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uLmZvcm1hdCgpLFxuICAgICAgICBncm91cE9yZGVyOiB0aGlzLmNvbmZpZy5ncm91cE9yZGVyLFxuICAgICAgICBoaWRkZW5TY29wZXM6IHRoaXMuY29uZmlnLmhpZGRlblNjb3BlcyxcbiAgICAgICAgdGl0bGU6IGF3YWl0IHRoaXMucHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCksXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyQ29udGV4dDtcbiAgfVxuXG4gIC8vIFRoZXNlIG1ldGhvZHMgYXJlIHVzZWQgZm9yIGFjY2VzcyB0byB0aGUgdXRpbGl0eSBmdW5jdGlvbnMgd2hpbGUgYWxsb3dpbmcgdGhlbVxuICAvLyB0byBiZSBvdmVyd3JpdHRlbiBpbiBzdWJjbGFzc2VzIGR1cmluZyB0ZXN0aW5nLlxuICBwcm90ZWN0ZWQgZ2V0UmVsZWFzZUNvbmZpZyhjb25maWc/OiBQYXJ0aWFsPERldkluZnJhUmVsZWFzZUNvbmZpZz4pIHtcbiAgICByZXR1cm4gZ2V0UmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICB9XG59XG4iXX0=