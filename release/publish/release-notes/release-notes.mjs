import { __awaiter } from "tslib";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { renderFile } from 'ejs';
import { join } from 'path';
import { getCommitsInRange } from '../../../commit-message/utils';
import { promptInput } from '../../../utils/console';
import { GitClient } from '../../../utils/git/index';
import { getReleaseConfig } from '../../config/index';
import { changelogPath } from '../constants';
import { RenderContext } from './context';
/** Gets the path for the changelog file in a given project. */
export function getLocalChangelogFilePath(projectDir) {
    return join(projectDir, changelogPath);
}
/** Release note generation. */
export class ReleaseNotes {
    constructor(version, startingRef, endingRef) {
        this.version = version;
        this.startingRef = startingRef;
        this.endingRef = endingRef;
        /** An instance of GitClient. */
        this.git = GitClient.getInstance();
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
            return renderFile(join(__dirname, 'templates/github-release.ejs'), yield this.generateRenderContext(), { rmWhitespace: true });
        });
    }
    /** Retrieve the release note generated for a CHANGELOG entry. */
    getChangelogEntry() {
        return __awaiter(this, void 0, void 0, function* () {
            return renderFile(join(__dirname, 'templates/changelog.ejs'), yield this.generateRenderContext(), { rmWhitespace: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy9yZWxlYXNlLW5vdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sS0FBSyxDQUFDO0FBQy9CLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFJMUIsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ25ELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRCxPQUFPLEVBQXdCLGdCQUFnQixFQUFxQixNQUFNLG9CQUFvQixDQUFDO0FBQy9GLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDM0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV4QywrREFBK0Q7QUFDL0QsTUFBTSxVQUFVLHlCQUF5QixDQUFDLFVBQWtCO0lBQzFELE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBRUQsK0JBQStCO0FBQy9CLE1BQU0sT0FBTyxZQUFZO0lBaUJ2QixZQUNXLE9BQXNCLEVBQVUsV0FBbUIsRUFBVSxTQUFpQjtRQUE5RSxZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBYnpGLGdDQUFnQztRQUN4QixRQUFHLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBS3RDLDBGQUEwRjtRQUNsRixZQUFPLEdBQ1gsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdELDJDQUEyQztRQUNuQyxXQUFNLEdBQXVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFlBQVksQ0FBQztJQUdrQixDQUFDO0lBakI3RixNQUFNLENBQU8sU0FBUyxDQUFDLE9BQXNCLEVBQUUsV0FBbUIsRUFBRSxTQUFpQjs7WUFDbkYsT0FBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzNELENBQUM7S0FBQTtJQWlCRCxnRUFBZ0U7SUFDMUQscUJBQXFCOztZQUN6QixPQUFPLFVBQVUsQ0FDYixJQUFJLENBQUMsU0FBUyxFQUFFLDhCQUE4QixDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFDbkYsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDO0tBQUE7SUFFRCxpRUFBaUU7SUFDM0QsaUJBQWlCOztZQUNyQixPQUFPLFVBQVUsQ0FDYixJQUFJLENBQUMsU0FBUyxFQUFFLHlCQUF5QixDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFDOUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUM1QixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxxQkFBcUI7O1lBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7b0JBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxXQUFXLENBQUMseUNBQXlDLENBQUMsQ0FBQztpQkFDM0U7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7aUJBQ3BCO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDcEIsQ0FBQztLQUFBO0lBRUQsd0ZBQXdGO0lBQzFFLHFCQUFxQjs7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUM7b0JBQ3JDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQyxPQUFPO29CQUMzQixNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO29CQUM3QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7b0JBQzlCLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7b0JBQ2xDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7b0JBQ3RDLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtpQkFDMUMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDNUIsQ0FBQztLQUFBO0lBR0QsdUZBQXVGO0lBQ3ZGLDRDQUE0QztJQUM1QixpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsRUFBVzs7WUFDekQsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRVMsZ0JBQWdCLENBQUMsTUFBdUM7UUFDaEUsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVuZGVyRmlsZX0gZnJvbSAnZWpzJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuXG5pbXBvcnQge2dldENvbW1pdHNJblJhbmdlfSBmcm9tICcuLi8uLi8uLi9jb21taXQtbWVzc2FnZS91dGlscyc7XG5pbXBvcnQge3Byb21wdElucHV0fSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtEZXZJbmZyYVJlbGVhc2VDb25maWcsIGdldFJlbGVhc2VDb25maWcsIFJlbGVhc2VOb3Rlc0NvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7Y2hhbmdlbG9nUGF0aH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7UmVuZGVyQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcblxuLyoqIEdldHMgdGhlIHBhdGggZm9yIHRoZSBjaGFuZ2Vsb2cgZmlsZSBpbiBhIGdpdmVuIHByb2plY3QuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxDaGFuZ2Vsb2dGaWxlUGF0aChwcm9qZWN0RGlyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gam9pbihwcm9qZWN0RGlyLCBjaGFuZ2Vsb2dQYXRoKTtcbn1cblxuLyoqIFJlbGVhc2Ugbm90ZSBnZW5lcmF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIFJlbGVhc2VOb3RlcyB7XG4gIHN0YXRpYyBhc3luYyBmcm9tUmFuZ2UodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgc3RhcnRpbmdSZWY6IHN0cmluZywgZW5kaW5nUmVmOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFJlbGVhc2VOb3Rlcyh2ZXJzaW9uLCBzdGFydGluZ1JlZiwgZW5kaW5nUmVmKTtcbiAgfVxuXG4gIC8qKiBBbiBpbnN0YW5jZSBvZiBHaXRDbGllbnQuICovXG4gIHByaXZhdGUgZ2l0ID0gR2l0Q2xpZW50LmdldEluc3RhbmNlKCk7XG4gIC8qKiBUaGUgUmVuZGVyQ29udGV4dCB0byBiZSB1c2VkIGR1cmluZyByZW5kZXJpbmcuICovXG4gIHByaXZhdGUgcmVuZGVyQ29udGV4dDogUmVuZGVyQ29udGV4dHx1bmRlZmluZWQ7XG4gIC8qKiBUaGUgdGl0bGUgdG8gdXNlIGZvciB0aGUgcmVsZWFzZS4gKi9cbiAgcHJpdmF0ZSB0aXRsZTogc3RyaW5nfGZhbHNlfHVuZGVmaW5lZDtcbiAgLyoqIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYSBsaXN0IG9mIENvbW1pdHMgc2luY2UgdGhlIGxhdGVzdCBzZW12ZXIgdGFnIG9uIHRoZSBicmFuY2guICovXG4gIHByaXZhdGUgY29tbWl0czogUHJvbWlzZTxDb21taXRGcm9tR2l0TG9nW10+ID1cbiAgICAgIHRoaXMuZ2V0Q29tbWl0c0luUmFuZ2UodGhpcy5zdGFydGluZ1JlZiwgdGhpcy5lbmRpbmdSZWYpO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHJlbGVhc2Ugbm90ZXMuICovXG4gIHByaXZhdGUgY29uZmlnOiBSZWxlYXNlTm90ZXNDb25maWcgPSB0aGlzLmdldFJlbGVhc2VDb25maWcoKS5yZWxlYXNlTm90ZXM7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHByaXZhdGUgc3RhcnRpbmdSZWY6IHN0cmluZywgcHJpdmF0ZSBlbmRpbmdSZWY6IHN0cmluZykge31cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgR2l0aHViIFJlbGVhc2UuICovXG4gIGFzeW5jIGdldEdpdGh1YlJlbGVhc2VFbnRyeSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiByZW5kZXJGaWxlKFxuICAgICAgICBqb2luKF9fZGlybmFtZSwgJ3RlbXBsYXRlcy9naXRodWItcmVsZWFzZS5lanMnKSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSxcbiAgICAgICAge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIENIQU5HRUxPRyBlbnRyeS4gKi9cbiAgYXN5bmMgZ2V0Q2hhbmdlbG9nRW50cnkoKSB7XG4gICAgcmV0dXJuIHJlbmRlckZpbGUoXG4gICAgICAgIGpvaW4oX19kaXJuYW1lLCAndGVtcGxhdGVzL2NoYW5nZWxvZy5lanMnKSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSxcbiAgICAgICAge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdCB0aGUgdXNlciBmb3IgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2UsIGlmIHRoZSBwcm9qZWN0J3MgY29uZmlndXJhdGlvbiBpcyBkZWZpbmVkIHRvIHVzZSBhXG4gICAqIHRpdGxlLlxuICAgKi9cbiAgYXN5bmMgcHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCkge1xuICAgIGlmICh0aGlzLnRpdGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy51c2VSZWxlYXNlVGl0bGUpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGF3YWl0IHByb21wdElucHV0KCdQbGVhc2UgcHJvdmlkZSBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZTonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGl0bGU7XG4gIH1cblxuICAvKiogQnVpbGQgdGhlIHJlbmRlciBjb250ZXh0IGRhdGEgb2JqZWN0IGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJlbmRlckNvbnRleHQgaW5zdGFuY2UuICovXG4gIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk6IFByb21pc2U8UmVuZGVyQ29udGV4dD4ge1xuICAgIGlmICghdGhpcy5yZW5kZXJDb250ZXh0KSB7XG4gICAgICB0aGlzLnJlbmRlckNvbnRleHQgPSBuZXcgUmVuZGVyQ29udGV4dCh7XG4gICAgICAgIGNvbW1pdHM6IGF3YWl0IHRoaXMuY29tbWl0cyxcbiAgICAgICAgZ2l0aHViOiB0aGlzLmdpdC5yZW1vdGVDb25maWcsXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbi5mb3JtYXQoKSxcbiAgICAgICAgZ3JvdXBPcmRlcjogdGhpcy5jb25maWcuZ3JvdXBPcmRlcixcbiAgICAgICAgaGlkZGVuU2NvcGVzOiB0aGlzLmNvbmZpZy5oaWRkZW5TY29wZXMsXG4gICAgICAgIHRpdGxlOiBhd2FpdCB0aGlzLnByb21wdEZvclJlbGVhc2VUaXRsZSgpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlckNvbnRleHQ7XG4gIH1cblxuXG4gIC8vIFRoZXNlIG1ldGhvZHMgYXJlIHVzZWQgZm9yIGFjY2VzcyB0byB0aGUgdXRpbGl0eSBmdW5jdGlvbnMgd2hpbGUgYWxsb3dpbmcgdGhlbSB0byBiZVxuICAvLyBvdmVyd3JpdHRlbiBpbiBzdWJjbGFzc2VzIGR1cmluZyB0ZXN0aW5nLlxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0Q29tbWl0c0luUmFuZ2UoZnJvbTogc3RyaW5nLCB0bz86IHN0cmluZykge1xuICAgIHJldHVybiBnZXRDb21taXRzSW5SYW5nZShmcm9tLCB0byk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0UmVsZWFzZUNvbmZpZyhjb25maWc/OiBQYXJ0aWFsPERldkluZnJhUmVsZWFzZUNvbmZpZz4pIHtcbiAgICByZXR1cm4gZ2V0UmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICB9XG59XG4iXX0=