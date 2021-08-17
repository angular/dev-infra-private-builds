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
    // These methods are used for access to the utility functions while allowing them
    // to be overwritten in subclasses during testing.
    getReleaseConfig(config) {
        return index_1.getReleaseConfig(config);
    }
}
exports.ReleaseNotes = ReleaseNotes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsNkJBQTJCO0FBSTNCLGlEQUFnRDtBQUNoRCwyREFBcUQ7QUFDckQsMkNBQTRGO0FBQzVGLHVDQUF3QztBQUV4QyxxREFBc0Q7QUFDdEQsK0RBQStEO0FBQy9ELHlFQUE4RTtBQUU5RSwrQkFBK0I7QUFDL0IsTUFBYSxZQUFZO0lBZ0J2QixZQUE2QixPQUFzQixFQUFVLE9BQTJCO1FBQTNELFlBQU8sR0FBUCxPQUFPLENBQWU7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFvQjtRQVR4RixnQ0FBZ0M7UUFDeEIsUUFBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFLOUIsMkNBQTJDO1FBQ25DLFdBQU0sR0FBdUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztJQUVXLENBQUM7SUFmNUYsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBc0IsRUFBRSxPQUFlLEVBQUUsT0FBZTtRQUM1RSxNQUFNLE1BQU0sR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQy9CLE1BQU0sT0FBTyxHQUFHLHFEQUE4QixDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekUsT0FBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQWFELGdFQUFnRTtJQUNoRSxLQUFLLENBQUMscUJBQXFCO1FBQ3pCLE9BQU8sWUFBTSxDQUFDLHdCQUFxQixFQUFFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUU7WUFDdkUsWUFBWSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGlFQUFpRTtJQUNqRSxLQUFLLENBQUMsaUJBQWlCO1FBQ3JCLE9BQU8sWUFBTSxDQUFDLG1CQUFpQixFQUFFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLHdCQUF3QjtRQUM1QixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO0lBQ3BFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMscUJBQXFCO1FBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7WUFDNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLHFCQUFXLENBQUMseUNBQXlDLENBQUMsQ0FBQzthQUMzRTtpQkFBTTtnQkFDTCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzthQUNwQjtTQUNGO1FBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFFRCx3RkFBd0Y7SUFDaEYsS0FBSyxDQUFDLHFCQUFxQjtRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN2QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksdUJBQWEsQ0FBQztnQkFDckMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO2dCQUNyQixNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO2dCQUM3QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7Z0JBQ2xDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7Z0JBQ3RDLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRTthQUMxQyxDQUFDLENBQUM7U0FDSjtRQUNELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBRUQsaUZBQWlGO0lBQ2pGLGtEQUFrRDtJQUN4QyxnQkFBZ0IsQ0FBQyxNQUF1QztRQUNoRSxPQUFPLHdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDRjtBQXpFRCxvQ0F5RUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVuZGVyfSBmcm9tICdlanMnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0NvbW1pdEZyb21HaXRMb2d9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcblxuaW1wb3J0IHtwcm9tcHRJbnB1dH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtEZXZJbmZyYVJlbGVhc2VDb25maWcsIGdldFJlbGVhc2VDb25maWcsIFJlbGVhc2VOb3Rlc0NvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7UmVuZGVyQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcblxuaW1wb3J0IGNoYW5nZWxvZ1RlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGVzL2NoYW5nZWxvZyc7XG5pbXBvcnQgZ2l0aHViUmVsZWFzZVRlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGVzL2dpdGh1Yi1yZWxlYXNlJztcbmltcG9ydCB7Z2V0Q29tbWl0c0ZvclJhbmdlV2l0aERlZHVwaW5nfSBmcm9tICcuL2NvbW1pdHMvZ2V0LWNvbW1pdHMtaW4tcmFuZ2UnO1xuXG4vKiogUmVsZWFzZSBub3RlIGdlbmVyYXRpb24uICovXG5leHBvcnQgY2xhc3MgUmVsZWFzZU5vdGVzIHtcbiAgc3RhdGljIGFzeW5jIGZvclJhbmdlKHZlcnNpb246IHNlbXZlci5TZW1WZXIsIGJhc2VSZWY6IHN0cmluZywgaGVhZFJlZjogc3RyaW5nKSB7XG4gICAgY29uc3QgY2xpZW50ID0gR2l0Q2xpZW50LmdldCgpO1xuICAgIGNvbnN0IGNvbW1pdHMgPSBnZXRDb21taXRzRm9yUmFuZ2VXaXRoRGVkdXBpbmcoY2xpZW50LCBiYXNlUmVmLCBoZWFkUmVmKTtcbiAgICByZXR1cm4gbmV3IFJlbGVhc2VOb3Rlcyh2ZXJzaW9uLCBjb21taXRzKTtcbiAgfVxuXG4gIC8qKiBBbiBpbnN0YW5jZSBvZiBHaXRDbGllbnQuICovXG4gIHByaXZhdGUgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAvKiogVGhlIFJlbmRlckNvbnRleHQgdG8gYmUgdXNlZCBkdXJpbmcgcmVuZGVyaW5nLiAqL1xuICBwcml2YXRlIHJlbmRlckNvbnRleHQ6IFJlbmRlckNvbnRleHQgfCB1bmRlZmluZWQ7XG4gIC8qKiBUaGUgdGl0bGUgdG8gdXNlIGZvciB0aGUgcmVsZWFzZS4gKi9cbiAgcHJpdmF0ZSB0aXRsZTogc3RyaW5nIHwgZmFsc2UgfCB1bmRlZmluZWQ7XG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgcmVsZWFzZSBub3Rlcy4gKi9cbiAgcHJpdmF0ZSBjb25maWc6IFJlbGVhc2VOb3Rlc0NvbmZpZyA9IHRoaXMuZ2V0UmVsZWFzZUNvbmZpZygpLnJlbGVhc2VOb3RlcyA/PyB7fTtcblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IocHVibGljIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHByaXZhdGUgY29tbWl0czogQ29tbWl0RnJvbUdpdExvZ1tdKSB7fVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgcmVsZWFzZSBub3RlIGdlbmVyYXRlZCBmb3IgYSBHaXRodWIgUmVsZWFzZS4gKi9cbiAgYXN5bmMgZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHJlbmRlcihnaXRodWJSZWxlYXNlVGVtcGxhdGUsIGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCksIHtcbiAgICAgIHJtV2hpdGVzcGFjZTogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgcmVsZWFzZSBub3RlIGdlbmVyYXRlZCBmb3IgYSBDSEFOR0VMT0cgZW50cnkuICovXG4gIGFzeW5jIGdldENoYW5nZWxvZ0VudHJ5KCkge1xuICAgIHJldHVybiByZW5kZXIoY2hhbmdlbG9nVGVtcGxhdGUsIGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCksIHtybVdoaXRlc3BhY2U6IHRydWV9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBVUkwgZnJhZ21lbnQgZm9yIHRoZSByZWxlYXNlIG5vdGVzLiBUaGUgVVJMIGZyYWdtZW50IGlkZW50aWZpZXJcbiAgICogY2FuIGJlIHVzZWQgdG8gcG9pbnQgdG8gYSBzcGVjaWZpYyBjaGFuZ2Vsb2cgZW50cnkgdGhyb3VnaCBhbiBVUkwuXG4gICAqL1xuICBhc3luYyBnZXRVcmxGcmFnbWVudEZvclJlbGVhc2UoKSB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpKS51cmxGcmFnbWVudEZvclJlbGVhc2U7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0IHRoZSB1c2VyIGZvciBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZSwgaWYgdGhlIHByb2plY3QncyBjb25maWd1cmF0aW9uIGlzIGRlZmluZWQgdG8gdXNlIGFcbiAgICogdGl0bGUuXG4gICAqL1xuICBhc3luYyBwcm9tcHRGb3JSZWxlYXNlVGl0bGUoKSB7XG4gICAgaWYgKHRoaXMudGl0bGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHRoaXMuY29uZmlnLnVzZVJlbGVhc2VUaXRsZSkge1xuICAgICAgICB0aGlzLnRpdGxlID0gYXdhaXQgcHJvbXB0SW5wdXQoJ1BsZWFzZSBwcm92aWRlIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlOicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50aXRsZTtcbiAgfVxuXG4gIC8qKiBCdWlsZCB0aGUgcmVuZGVyIGNvbnRleHQgZGF0YSBvYmplY3QgZm9yIGNvbnN0cnVjdGluZyB0aGUgUmVuZGVyQ29udGV4dCBpbnN0YW5jZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBnZW5lcmF0ZVJlbmRlckNvbnRleHQoKTogUHJvbWlzZTxSZW5kZXJDb250ZXh0PiB7XG4gICAgaWYgKCF0aGlzLnJlbmRlckNvbnRleHQpIHtcbiAgICAgIHRoaXMucmVuZGVyQ29udGV4dCA9IG5ldyBSZW5kZXJDb250ZXh0KHtcbiAgICAgICAgY29tbWl0czogdGhpcy5jb21taXRzLFxuICAgICAgICBnaXRodWI6IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZyxcbiAgICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uLmZvcm1hdCgpLFxuICAgICAgICBncm91cE9yZGVyOiB0aGlzLmNvbmZpZy5ncm91cE9yZGVyLFxuICAgICAgICBoaWRkZW5TY29wZXM6IHRoaXMuY29uZmlnLmhpZGRlblNjb3BlcyxcbiAgICAgICAgdGl0bGU6IGF3YWl0IHRoaXMucHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCksXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyQ29udGV4dDtcbiAgfVxuXG4gIC8vIFRoZXNlIG1ldGhvZHMgYXJlIHVzZWQgZm9yIGFjY2VzcyB0byB0aGUgdXRpbGl0eSBmdW5jdGlvbnMgd2hpbGUgYWxsb3dpbmcgdGhlbVxuICAvLyB0byBiZSBvdmVyd3JpdHRlbiBpbiBzdWJjbGFzc2VzIGR1cmluZyB0ZXN0aW5nLlxuICBwcm90ZWN0ZWQgZ2V0UmVsZWFzZUNvbmZpZyhjb25maWc/OiBQYXJ0aWFsPERldkluZnJhUmVsZWFzZUNvbmZpZz4pIHtcbiAgICByZXR1cm4gZ2V0UmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICB9XG59XG4iXX0=