import { __awaiter } from "tslib";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { render } from 'ejs';
import { join } from 'path';
import { getCommitsInRange } from '../../../commit-message/utils';
import { promptInput } from '../../../utils/console';
import { GitClient } from '../../../utils/git/index';
import { getReleaseConfig } from '../../config/index';
import { changelogPath } from '../constants';
import { RenderContext } from './context';
import changelogTemplate from './templates/changelog';
import githubReleaseTemplate from './templates/github-release';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy9yZWxlYXNlLW5vdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sS0FBSyxDQUFDO0FBQzNCLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFJMUIsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ25ELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRCxPQUFPLEVBQXdCLGdCQUFnQixFQUFxQixNQUFNLG9CQUFvQixDQUFDO0FBQy9GLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDM0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV4QyxPQUFPLGlCQUFpQixNQUFNLHVCQUF1QixDQUFDO0FBQ3RELE9BQU8scUJBQXFCLE1BQU0sNEJBQTRCLENBQUM7QUFFL0QsK0RBQStEO0FBQy9ELE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxVQUFrQjtJQUMxRCxPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUVELCtCQUErQjtBQUMvQixNQUFNLE9BQU8sWUFBWTtJQWlCdkIsWUFDVyxPQUFzQixFQUFVLFdBQW1CLEVBQVUsU0FBaUI7UUFBOUUsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQWJ6RixnQ0FBZ0M7UUFDeEIsUUFBRyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUt0QywwRkFBMEY7UUFDbEYsWUFBTyxHQUNYLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3RCwyQ0FBMkM7UUFDbkMsV0FBTSxHQUF1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxZQUFZLENBQUM7SUFHa0IsQ0FBQztJQWpCN0YsTUFBTSxDQUFPLFNBQVMsQ0FBQyxPQUFzQixFQUFFLFdBQW1CLEVBQUUsU0FBaUI7O1lBQ25GLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMzRCxDQUFDO0tBQUE7SUFpQkQsZ0VBQWdFO0lBQzFELHFCQUFxQjs7WUFDekIsT0FBTyxNQUFNLENBQUMscUJBQXFCLEVBQUUsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRSxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7S0FBQTtJQUVELGlFQUFpRTtJQUMzRCxpQkFBaUI7O1lBQ3JCLE9BQU8sTUFBTSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxxQkFBcUI7O1lBQ3pCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7b0JBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxXQUFXLENBQUMseUNBQXlDLENBQUMsQ0FBQztpQkFDM0U7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7aUJBQ3BCO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDcEIsQ0FBQztLQUFBO0lBRUQsd0ZBQXdGO0lBQzFFLHFCQUFxQjs7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUM7b0JBQ3JDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQyxPQUFPO29CQUMzQixNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO29CQUM3QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7b0JBQzlCLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7b0JBQ2xDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7b0JBQ3RDLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtpQkFDMUMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDNUIsQ0FBQztLQUFBO0lBR0QsdUZBQXVGO0lBQ3ZGLDRDQUE0QztJQUM1QixpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsRUFBVzs7WUFDekQsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRVMsZ0JBQWdCLENBQUMsTUFBdUM7UUFDaEUsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVuZGVyfSBmcm9tICdlanMnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtDb21taXRGcm9tR2l0TG9nfSBmcm9tICcuLi8uLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5cbmltcG9ydCB7Z2V0Q29tbWl0c0luUmFuZ2V9IGZyb20gJy4uLy4uLy4uL2NvbW1pdC1tZXNzYWdlL3V0aWxzJztcbmltcG9ydCB7cHJvbXB0SW5wdXR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge0RldkluZnJhUmVsZWFzZUNvbmZpZywgZ2V0UmVsZWFzZUNvbmZpZywgUmVsZWFzZU5vdGVzQ29uZmlnfSBmcm9tICcuLi8uLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtjaGFuZ2Vsb2dQYXRofSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHtSZW5kZXJDb250ZXh0fSBmcm9tICcuL2NvbnRleHQnO1xuXG5pbXBvcnQgY2hhbmdlbG9nVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvY2hhbmdlbG9nJztcbmltcG9ydCBnaXRodWJSZWxlYXNlVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UnO1xuXG4vKiogR2V0cyB0aGUgcGF0aCBmb3IgdGhlIGNoYW5nZWxvZyBmaWxlIGluIGEgZ2l2ZW4gcHJvamVjdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbENoYW5nZWxvZ0ZpbGVQYXRoKHByb2plY3REaXI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBqb2luKHByb2plY3REaXIsIGNoYW5nZWxvZ1BhdGgpO1xufVxuXG4vKiogUmVsZWFzZSBub3RlIGdlbmVyYXRpb24uICovXG5leHBvcnQgY2xhc3MgUmVsZWFzZU5vdGVzIHtcbiAgc3RhdGljIGFzeW5jIGZyb21SYW5nZSh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBzdGFydGluZ1JlZjogc3RyaW5nLCBlbmRpbmdSZWY6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUmVsZWFzZU5vdGVzKHZlcnNpb24sIHN0YXJ0aW5nUmVmLCBlbmRpbmdSZWYpO1xuICB9XG5cbiAgLyoqIEFuIGluc3RhbmNlIG9mIEdpdENsaWVudC4gKi9cbiAgcHJpdmF0ZSBnaXQgPSBHaXRDbGllbnQuZ2V0SW5zdGFuY2UoKTtcbiAgLyoqIFRoZSBSZW5kZXJDb250ZXh0IHRvIGJlIHVzZWQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbiAgcHJpdmF0ZSByZW5kZXJDb250ZXh0OiBSZW5kZXJDb250ZXh0fHVuZGVmaW5lZDtcbiAgLyoqIFRoZSB0aXRsZSB0byB1c2UgZm9yIHRoZSByZWxlYXNlLiAqL1xuICBwcml2YXRlIHRpdGxlOiBzdHJpbmd8ZmFsc2V8dW5kZWZpbmVkO1xuICAvKiogQSBwcm9taXNlIHJlc29sdmluZyB0byBhIGxpc3Qgb2YgQ29tbWl0cyBzaW5jZSB0aGUgbGF0ZXN0IHNlbXZlciB0YWcgb24gdGhlIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBjb21taXRzOiBQcm9taXNlPENvbW1pdEZyb21HaXRMb2dbXT4gPVxuICAgICAgdGhpcy5nZXRDb21taXRzSW5SYW5nZSh0aGlzLnN0YXJ0aW5nUmVmLCB0aGlzLmVuZGluZ1JlZik7XG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgcmVsZWFzZSBub3Rlcy4gKi9cbiAgcHJpdmF0ZSBjb25maWc6IFJlbGVhc2VOb3Rlc0NvbmZpZyA9IHRoaXMuZ2V0UmVsZWFzZUNvbmZpZygpLnJlbGVhc2VOb3RlcztcblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgdmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcHJpdmF0ZSBzdGFydGluZ1JlZjogc3RyaW5nLCBwcml2YXRlIGVuZGluZ1JlZjogc3RyaW5nKSB7fVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgcmVsZWFzZSBub3RlIGdlbmVyYXRlZCBmb3IgYSBHaXRodWIgUmVsZWFzZS4gKi9cbiAgYXN5bmMgZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHJlbmRlcihnaXRodWJSZWxlYXNlVGVtcGxhdGUsIGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCksIHtybVdoaXRlc3BhY2U6IHRydWV9KTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgcmVsZWFzZSBub3RlIGdlbmVyYXRlZCBmb3IgYSBDSEFOR0VMT0cgZW50cnkuICovXG4gIGFzeW5jIGdldENoYW5nZWxvZ0VudHJ5KCkge1xuICAgIHJldHVybiByZW5kZXIoY2hhbmdlbG9nVGVtcGxhdGUsIGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCksIHtybVdoaXRlc3BhY2U6IHRydWV9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHQgdGhlIHVzZXIgZm9yIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlLCBpZiB0aGUgcHJvamVjdCdzIGNvbmZpZ3VyYXRpb24gaXMgZGVmaW5lZCB0byB1c2UgYVxuICAgKiB0aXRsZS5cbiAgICovXG4gIGFzeW5jIHByb21wdEZvclJlbGVhc2VUaXRsZSgpIHtcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodGhpcy5jb25maWcudXNlUmVsZWFzZVRpdGxlKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBhd2FpdCBwcm9tcHRJbnB1dCgnUGxlYXNlIHByb3ZpZGUgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2U6Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpdGxlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRpdGxlO1xuICB9XG5cbiAgLyoqIEJ1aWxkIHRoZSByZW5kZXIgY29udGV4dCBkYXRhIG9iamVjdCBmb3IgY29uc3RydWN0aW5nIHRoZSBSZW5kZXJDb250ZXh0IGluc3RhbmNlLiAqL1xuICBwcml2YXRlIGFzeW5jIGdlbmVyYXRlUmVuZGVyQ29udGV4dCgpOiBQcm9taXNlPFJlbmRlckNvbnRleHQ+IHtcbiAgICBpZiAoIXRoaXMucmVuZGVyQ29udGV4dCkge1xuICAgICAgdGhpcy5yZW5kZXJDb250ZXh0ID0gbmV3IFJlbmRlckNvbnRleHQoe1xuICAgICAgICBjb21taXRzOiBhd2FpdCB0aGlzLmNvbW1pdHMsXG4gICAgICAgIGdpdGh1YjogdGhpcy5naXQucmVtb3RlQ29uZmlnLFxuICAgICAgICB2ZXJzaW9uOiB0aGlzLnZlcnNpb24uZm9ybWF0KCksXG4gICAgICAgIGdyb3VwT3JkZXI6IHRoaXMuY29uZmlnLmdyb3VwT3JkZXIsXG4gICAgICAgIGhpZGRlblNjb3BlczogdGhpcy5jb25maWcuaGlkZGVuU2NvcGVzLFxuICAgICAgICB0aXRsZTogYXdhaXQgdGhpcy5wcm9tcHRGb3JSZWxlYXNlVGl0bGUoKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW5kZXJDb250ZXh0O1xuICB9XG5cblxuICAvLyBUaGVzZSBtZXRob2RzIGFyZSB1c2VkIGZvciBhY2Nlc3MgdG8gdGhlIHV0aWxpdHkgZnVuY3Rpb25zIHdoaWxlIGFsbG93aW5nIHRoZW0gdG8gYmVcbiAgLy8gb3ZlcndyaXR0ZW4gaW4gc3ViY2xhc3NlcyBkdXJpbmcgdGVzdGluZy5cbiAgcHJvdGVjdGVkIGFzeW5jIGdldENvbW1pdHNJblJhbmdlKGZyb206IHN0cmluZywgdG8/OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZ2V0Q29tbWl0c0luUmFuZ2UoZnJvbSwgdG8pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldFJlbGVhc2VDb25maWcoY29uZmlnPzogUGFydGlhbDxEZXZJbmZyYVJlbGVhc2VDb25maWc+KSB7XG4gICAgcmV0dXJuIGdldFJlbGVhc2VDb25maWcoY29uZmlnKTtcbiAgfVxufVxuIl19