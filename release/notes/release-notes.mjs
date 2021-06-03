import { __awaiter } from "tslib";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { render } from 'ejs';
import { getCommitsInRange } from '../../commit-message/utils';
import { promptInput } from '../../utils/console';
import { GitClient } from '../../utils/git/git-client';
import { getReleaseConfig } from '../config/index';
import { RenderContext } from './context';
import changelogTemplate from './templates/changelog';
import githubReleaseTemplate from './templates/github-release';
/** Release note generation. */
export class ReleaseNotes {
    constructor(version, startingRef, endingRef) {
        this.version = version;
        this.startingRef = startingRef;
        this.endingRef = endingRef;
        /** An instance of GitClient. */
        this.git = GitClient.get();
        /** A promise resolving to a list of Commits since the latest semver tag on the branch. */
        this.commits = this.getCommitsInRange(this.startingRef, this.endingRef);
        /** The configuration for release notes. */
        this.config = this.getReleaseConfig().releaseNotes;
    }
    static fromRange(version, startingRef, endingRef) {
        return __awaiter(this, void 0, void 0, function* () {
            return new ReleaseNotes(version, startingRef, endingRef);
        });
    }
    /** Retrieve the release note generated for a Github Release. */
    getGithubReleaseEntry() {
        return __awaiter(this, void 0, void 0, function* () {
            return render(githubReleaseTemplate, yield this.generateRenderContext(), { rmWhitespace: true });
        });
    }
    /** Retrieve the release note generated for a CHANGELOG entry. */
    getChangelogEntry() {
        return __awaiter(this, void 0, void 0, function* () {
            return render(changelogTemplate, yield this.generateRenderContext(), { rmWhitespace: true });
        });
    }
    /**
     * Prompt the user for a title for the release, if the project's configuration is defined to use a
     * title.
     */
    promptForReleaseTitle() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.title === undefined) {
                if (this.config.useReleaseTitle) {
                    this.title = yield promptInput('Please provide a title for the release:');
                }
                else {
                    this.title = false;
                }
            }
            return this.title;
        });
    }
    /** Build the render context data object for constructing the RenderContext instance. */
    generateRenderContext() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.renderContext) {
                this.renderContext = new RenderContext({
                    commits: yield this.commits,
                    github: this.git.remoteConfig,
                    version: this.version.format(),
                    groupOrder: this.config.groupOrder,
                    hiddenScopes: this.config.hiddenScopes,
                    title: yield this.promptForReleaseTitle(),
                });
            }
            return this.renderContext;
        });
    }
    // These methods are used for access to the utility functions while allowing them to be
    // overwritten in subclasses during testing.
    getCommitsInRange(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            return getCommitsInRange(from, to);
        });
    }
    getReleaseConfig(config) {
        return getReleaseConfig(config);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxLQUFLLENBQUM7QUFJM0IsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2hELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNyRCxPQUFPLEVBQXdCLGdCQUFnQixFQUFxQixNQUFNLGlCQUFpQixDQUFDO0FBQzVGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFeEMsT0FBTyxpQkFBaUIsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLHFCQUFxQixNQUFNLDRCQUE0QixDQUFDO0FBRS9ELCtCQUErQjtBQUMvQixNQUFNLE9BQU8sWUFBWTtJQWlCdkIsWUFDVyxPQUFzQixFQUFVLFdBQW1CLEVBQVUsU0FBaUI7UUFBOUUsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQWJ6RixnQ0FBZ0M7UUFDeEIsUUFBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUs5QiwwRkFBMEY7UUFDbEYsWUFBTyxHQUNYLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3RCwyQ0FBMkM7UUFDbkMsV0FBTSxHQUF1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxZQUFZLENBQUM7SUFHa0IsQ0FBQztJQWpCN0YsTUFBTSxDQUFPLFNBQVMsQ0FBQyxPQUFzQixFQUFFLFdBQW1CLEVBQUUsU0FBaUI7O1lBQ25GLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMzRCxDQUFDO0tBQUE7SUFpQkQsZ0VBQWdFO0lBQzFELHFCQUFxQjs7WUFDekIsT0FBTyxNQUFNLENBQUMscUJBQXFCLEVBQUUsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRSxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7S0FBQTtJQUVELGlFQUFpRTtJQUMzRCxpQkFBaUI7O1lBQ3JCLE9BQU8sTUFBTSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxxQkFBcUI7O1lBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7b0JBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxXQUFXLENBQUMseUNBQXlDLENBQUMsQ0FBQztpQkFDM0U7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7aUJBQ3BCO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDcEIsQ0FBQztLQUFBO0lBRUQsd0ZBQXdGO0lBQzFFLHFCQUFxQjs7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUM7b0JBQ3JDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQyxPQUFPO29CQUMzQixNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO29CQUM3QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7b0JBQzlCLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7b0JBQ2xDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7b0JBQ3RDLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtpQkFDMUMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDNUIsQ0FBQztLQUFBO0lBR0QsdUZBQXVGO0lBQ3ZGLDRDQUE0QztJQUM1QixpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsRUFBVzs7WUFDekQsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRVMsZ0JBQWdCLENBQUMsTUFBdUM7UUFDaEUsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVuZGVyfSBmcm9tICdlanMnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0NvbW1pdEZyb21HaXRMb2d9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcblxuaW1wb3J0IHtnZXRDb21taXRzSW5SYW5nZX0gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvdXRpbHMnO1xuaW1wb3J0IHtwcm9tcHRJbnB1dH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtEZXZJbmZyYVJlbGVhc2VDb25maWcsIGdldFJlbGVhc2VDb25maWcsIFJlbGVhc2VOb3Rlc0NvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7UmVuZGVyQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcblxuaW1wb3J0IGNoYW5nZWxvZ1RlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGVzL2NoYW5nZWxvZyc7XG5pbXBvcnQgZ2l0aHViUmVsZWFzZVRlbXBsYXRlIGZyb20gJy4vdGVtcGxhdGVzL2dpdGh1Yi1yZWxlYXNlJztcblxuLyoqIFJlbGVhc2Ugbm90ZSBnZW5lcmF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIFJlbGVhc2VOb3RlcyB7XG4gIHN0YXRpYyBhc3luYyBmcm9tUmFuZ2UodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgc3RhcnRpbmdSZWY6IHN0cmluZywgZW5kaW5nUmVmOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFJlbGVhc2VOb3Rlcyh2ZXJzaW9uLCBzdGFydGluZ1JlZiwgZW5kaW5nUmVmKTtcbiAgfVxuXG4gIC8qKiBBbiBpbnN0YW5jZSBvZiBHaXRDbGllbnQuICovXG4gIHByaXZhdGUgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAvKiogVGhlIFJlbmRlckNvbnRleHQgdG8gYmUgdXNlZCBkdXJpbmcgcmVuZGVyaW5nLiAqL1xuICBwcml2YXRlIHJlbmRlckNvbnRleHQ6IFJlbmRlckNvbnRleHR8dW5kZWZpbmVkO1xuICAvKiogVGhlIHRpdGxlIHRvIHVzZSBmb3IgdGhlIHJlbGVhc2UuICovXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZ3xmYWxzZXx1bmRlZmluZWQ7XG4gIC8qKiBBIHByb21pc2UgcmVzb2x2aW5nIHRvIGEgbGlzdCBvZiBDb21taXRzIHNpbmNlIHRoZSBsYXRlc3Qgc2VtdmVyIHRhZyBvbiB0aGUgYnJhbmNoLiAqL1xuICBwcml2YXRlIGNvbW1pdHM6IFByb21pc2U8Q29tbWl0RnJvbUdpdExvZ1tdPiA9XG4gICAgICB0aGlzLmdldENvbW1pdHNJblJhbmdlKHRoaXMuc3RhcnRpbmdSZWYsIHRoaXMuZW5kaW5nUmVmKTtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciByZWxlYXNlIG5vdGVzLiAqL1xuICBwcml2YXRlIGNvbmZpZzogUmVsZWFzZU5vdGVzQ29uZmlnID0gdGhpcy5nZXRSZWxlYXNlQ29uZmlnKCkucmVsZWFzZU5vdGVzO1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwcml2YXRlIHN0YXJ0aW5nUmVmOiBzdHJpbmcsIHByaXZhdGUgZW5kaW5nUmVmOiBzdHJpbmcpIHt9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIEdpdGh1YiBSZWxlYXNlLiAqL1xuICBhc3luYyBnZXRHaXRodWJSZWxlYXNlRW50cnkoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gcmVuZGVyKGdpdGh1YlJlbGVhc2VUZW1wbGF0ZSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSwge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIENIQU5HRUxPRyBlbnRyeS4gKi9cbiAgYXN5bmMgZ2V0Q2hhbmdlbG9nRW50cnkoKSB7XG4gICAgcmV0dXJuIHJlbmRlcihjaGFuZ2Vsb2dUZW1wbGF0ZSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSwge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdCB0aGUgdXNlciBmb3IgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2UsIGlmIHRoZSBwcm9qZWN0J3MgY29uZmlndXJhdGlvbiBpcyBkZWZpbmVkIHRvIHVzZSBhXG4gICAqIHRpdGxlLlxuICAgKi9cbiAgYXN5bmMgcHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCkge1xuICAgIGlmICh0aGlzLnRpdGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy51c2VSZWxlYXNlVGl0bGUpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGF3YWl0IHByb21wdElucHV0KCdQbGVhc2UgcHJvdmlkZSBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZTonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGl0bGU7XG4gIH1cblxuICAvKiogQnVpbGQgdGhlIHJlbmRlciBjb250ZXh0IGRhdGEgb2JqZWN0IGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJlbmRlckNvbnRleHQgaW5zdGFuY2UuICovXG4gIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk6IFByb21pc2U8UmVuZGVyQ29udGV4dD4ge1xuICAgIGlmICghdGhpcy5yZW5kZXJDb250ZXh0KSB7XG4gICAgICB0aGlzLnJlbmRlckNvbnRleHQgPSBuZXcgUmVuZGVyQ29udGV4dCh7XG4gICAgICAgIGNvbW1pdHM6IGF3YWl0IHRoaXMuY29tbWl0cyxcbiAgICAgICAgZ2l0aHViOiB0aGlzLmdpdC5yZW1vdGVDb25maWcsXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbi5mb3JtYXQoKSxcbiAgICAgICAgZ3JvdXBPcmRlcjogdGhpcy5jb25maWcuZ3JvdXBPcmRlcixcbiAgICAgICAgaGlkZGVuU2NvcGVzOiB0aGlzLmNvbmZpZy5oaWRkZW5TY29wZXMsXG4gICAgICAgIHRpdGxlOiBhd2FpdCB0aGlzLnByb21wdEZvclJlbGVhc2VUaXRsZSgpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlckNvbnRleHQ7XG4gIH1cblxuXG4gIC8vIFRoZXNlIG1ldGhvZHMgYXJlIHVzZWQgZm9yIGFjY2VzcyB0byB0aGUgdXRpbGl0eSBmdW5jdGlvbnMgd2hpbGUgYWxsb3dpbmcgdGhlbSB0byBiZVxuICAvLyBvdmVyd3JpdHRlbiBpbiBzdWJjbGFzc2VzIGR1cmluZyB0ZXN0aW5nLlxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0Q29tbWl0c0luUmFuZ2UoZnJvbTogc3RyaW5nLCB0bz86IHN0cmluZykge1xuICAgIHJldHVybiBnZXRDb21taXRzSW5SYW5nZShmcm9tLCB0byk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0UmVsZWFzZUNvbmZpZyhjb25maWc/OiBQYXJ0aWFsPERldkluZnJhUmVsZWFzZUNvbmZpZz4pIHtcbiAgICByZXR1cm4gZ2V0UmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICB9XG59XG4iXX0=