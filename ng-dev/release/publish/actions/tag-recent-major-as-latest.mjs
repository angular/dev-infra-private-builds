"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagRecentMajorAsLatest = void 0;
const semver = require("semver");
const npm_registry_1 = require("../../versioning/npm-registry");
const actions_1 = require("../actions");
const external_commands_1 = require("../external-commands");
const version_tags_1 = require("../../versioning/version-tags");
/**
 * Release action that tags the recently published major as latest within the NPM
 * registry. Major versions are published to the `next` NPM dist tag initially and
 * can be re-tagged to the `latest` NPM dist tag. This allows caretakers to make major
 * releases available at the same time. e.g. Framework, Tooling and Components
 * are able to publish v12 to `@latest` at the same time. This wouldn't be possible if
 * we directly publish to `@latest` because Tooling and Components needs to wait
 * for the major framework release to be available on NPM.
 * @see {CutStableAction#perform} for more details.
 */
class TagRecentMajorAsLatest extends actions_1.ReleaseAction {
    async getDescription() {
        return `Retag recently published major v${this.active.latest.version} as "latest" in NPM.`;
    }
    async perform() {
        await this.updateGithubReleaseEntryToStable(this.active.latest.version);
        await this.checkoutUpstreamBranch(this.active.latest.branchName);
        await this.installDependenciesForCurrentBranch();
        await (0, external_commands_1.invokeSetNpmDistCommand)('latest', this.active.latest.version);
    }
    /**
     * Updates the Github release entry for the specified version to show
     * it as stable release, compared to it being shown as a pre-release.
     */
    async updateGithubReleaseEntryToStable(version) {
        const releaseTagName = (0, version_tags_1.getReleaseTagForVersion)(version);
        const { data: releaseInfo } = await this.git.github.repos.getReleaseByTag({
            ...this.git.remoteParams,
            tag: releaseTagName,
        });
        await this.git.github.repos.updateRelease({
            ...this.git.remoteParams,
            release_id: releaseInfo.id,
            prerelease: false,
        });
    }
    static async isActive({ latest }, config) {
        // If the latest release-train does currently not have a major version as version. e.g.
        // the latest branch is `10.0.x` with the version being `10.0.2`. In such cases, a major
        // has not been released recently, and this action should never become active.
        if (latest.version.minor !== 0 || latest.version.patch !== 0) {
            return false;
        }
        const packageInfo = await (0, npm_registry_1.fetchProjectNpmPackageInfo)(config);
        const npmLatestVersion = semver.parse(packageInfo['dist-tags']['latest']);
        // This action only becomes active if a major just has been released recently, but is
        // not set to the `latest` NPM dist tag in the NPM registry. Note that we only allow
        // re-tagging if the current `@latest` in NPM is the previous major version.
        return npmLatestVersion !== null && npmLatestVersion.major === latest.version.major - 1;
    }
}
exports.TagRecentMajorAsLatest = TagRecentMajorAsLatest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvdGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBSWpDLGdFQUF5RTtBQUN6RSx3Q0FBeUM7QUFDekMsNERBQTZEO0FBRTdELGdFQUFzRTtBQUV0RTs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFhLHNCQUF1QixTQUFRLHVCQUFhO0lBQzlDLEtBQUssQ0FBQyxjQUFjO1FBQzNCLE9BQU8sbUNBQW1DLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sc0JBQXNCLENBQUM7SUFDN0YsQ0FBQztJQUVRLEtBQUssQ0FBQyxPQUFPO1FBQ3BCLE1BQU0sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sSUFBSSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7UUFDakQsTUFBTSxJQUFBLDJDQUF1QixFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLE9BQWU7UUFDcEQsTUFBTSxjQUFjLEdBQUcsSUFBQSxzQ0FBdUIsRUFBQyxPQUFPLENBQUMsQ0FBQztRQUN4RCxNQUFNLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztZQUN0RSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWTtZQUN4QixHQUFHLEVBQUUsY0FBYztTQUNwQixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7WUFDeEMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVk7WUFDeEIsVUFBVSxFQUFFLFdBQVcsQ0FBQyxFQUFFO1lBQzFCLFVBQVUsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLENBQVUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBc0IsRUFBRSxNQUFxQjtRQUNqRix1RkFBdUY7UUFDdkYsd0ZBQXdGO1FBQ3hGLDhFQUE4RTtRQUM5RSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDNUQsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBQSx5Q0FBMEIsRUFBQyxNQUFNLENBQUMsQ0FBQztRQUM3RCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDMUUscUZBQXFGO1FBQ3JGLG9GQUFvRjtRQUNwRiw0RUFBNEU7UUFDNUUsT0FBTyxnQkFBZ0IsS0FBSyxJQUFJLElBQUksZ0JBQWdCLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUMxRixDQUFDO0NBQ0Y7QUE3Q0Qsd0RBNkNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uLy4uL2NvbmZpZyc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7ZmV0Y2hQcm9qZWN0TnBtUGFja2FnZUluZm99IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvbnBtLXJlZ2lzdHJ5JztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQge2ludm9rZVNldE5wbURpc3RDb21tYW5kfSBmcm9tICcuLi9leHRlcm5hbC1jb21tYW5kcyc7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7Z2V0UmVsZWFzZVRhZ0ZvclZlcnNpb259IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvdmVyc2lvbi10YWdzJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IHRhZ3MgdGhlIHJlY2VudGx5IHB1Ymxpc2hlZCBtYWpvciBhcyBsYXRlc3Qgd2l0aGluIHRoZSBOUE1cbiAqIHJlZ2lzdHJ5LiBNYWpvciB2ZXJzaW9ucyBhcmUgcHVibGlzaGVkIHRvIHRoZSBgbmV4dGAgTlBNIGRpc3QgdGFnIGluaXRpYWxseSBhbmRcbiAqIGNhbiBiZSByZS10YWdnZWQgdG8gdGhlIGBsYXRlc3RgIE5QTSBkaXN0IHRhZy4gVGhpcyBhbGxvd3MgY2FyZXRha2VycyB0byBtYWtlIG1ham9yXG4gKiByZWxlYXNlcyBhdmFpbGFibGUgYXQgdGhlIHNhbWUgdGltZS4gZS5nLiBGcmFtZXdvcmssIFRvb2xpbmcgYW5kIENvbXBvbmVudHNcbiAqIGFyZSBhYmxlIHRvIHB1Ymxpc2ggdjEyIHRvIGBAbGF0ZXN0YCBhdCB0aGUgc2FtZSB0aW1lLiBUaGlzIHdvdWxkbid0IGJlIHBvc3NpYmxlIGlmXG4gKiB3ZSBkaXJlY3RseSBwdWJsaXNoIHRvIGBAbGF0ZXN0YCBiZWNhdXNlIFRvb2xpbmcgYW5kIENvbXBvbmVudHMgbmVlZHMgdG8gd2FpdFxuICogZm9yIHRoZSBtYWpvciBmcmFtZXdvcmsgcmVsZWFzZSB0byBiZSBhdmFpbGFibGUgb24gTlBNLlxuICogQHNlZSB7Q3V0U3RhYmxlQWN0aW9uI3BlcmZvcm19IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUYWdSZWNlbnRNYWpvckFzTGF0ZXN0IGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIHJldHVybiBgUmV0YWcgcmVjZW50bHkgcHVibGlzaGVkIG1ham9yIHYke3RoaXMuYWN0aXZlLmxhdGVzdC52ZXJzaW9ufSBhcyBcImxhdGVzdFwiIGluIE5QTS5gO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUdpdGh1YlJlbGVhc2VFbnRyeVRvU3RhYmxlKHRoaXMuYWN0aXZlLmxhdGVzdC52ZXJzaW9uKTtcbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2godGhpcy5hY3RpdmUubGF0ZXN0LmJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHRoaXMuaW5zdGFsbERlcGVuZGVuY2llc0ZvckN1cnJlbnRCcmFuY2goKTtcbiAgICBhd2FpdCBpbnZva2VTZXROcG1EaXN0Q29tbWFuZCgnbGF0ZXN0JywgdGhpcy5hY3RpdmUubGF0ZXN0LnZlcnNpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIEdpdGh1YiByZWxlYXNlIGVudHJ5IGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24gdG8gc2hvd1xuICAgKiBpdCBhcyBzdGFibGUgcmVsZWFzZSwgY29tcGFyZWQgdG8gaXQgYmVpbmcgc2hvd24gYXMgYSBwcmUtcmVsZWFzZS5cbiAgICovXG4gIGFzeW5jIHVwZGF0ZUdpdGh1YlJlbGVhc2VFbnRyeVRvU3RhYmxlKHZlcnNpb246IFNlbVZlcikge1xuICAgIGNvbnN0IHJlbGVhc2VUYWdOYW1lID0gZ2V0UmVsZWFzZVRhZ0ZvclZlcnNpb24odmVyc2lvbik7XG4gICAgY29uc3Qge2RhdGE6IHJlbGVhc2VJbmZvfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRSZWxlYXNlQnlUYWcoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgdGFnOiByZWxlYXNlVGFnTmFtZSxcbiAgICB9KTtcblxuICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy51cGRhdGVSZWxlYXNlKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHJlbGVhc2VfaWQ6IHJlbGVhc2VJbmZvLmlkLFxuICAgICAgcHJlcmVsZWFzZTogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgb3ZlcnJpZGUgYXN5bmMgaXNBY3RpdmUoe2xhdGVzdH06IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIGNvbmZpZzogUmVsZWFzZUNvbmZpZykge1xuICAgIC8vIElmIHRoZSBsYXRlc3QgcmVsZWFzZS10cmFpbiBkb2VzIGN1cnJlbnRseSBub3QgaGF2ZSBhIG1ham9yIHZlcnNpb24gYXMgdmVyc2lvbi4gZS5nLlxuICAgIC8vIHRoZSBsYXRlc3QgYnJhbmNoIGlzIGAxMC4wLnhgIHdpdGggdGhlIHZlcnNpb24gYmVpbmcgYDEwLjAuMmAuIEluIHN1Y2ggY2FzZXMsIGEgbWFqb3JcbiAgICAvLyBoYXMgbm90IGJlZW4gcmVsZWFzZWQgcmVjZW50bHksIGFuZCB0aGlzIGFjdGlvbiBzaG91bGQgbmV2ZXIgYmVjb21lIGFjdGl2ZS5cbiAgICBpZiAobGF0ZXN0LnZlcnNpb24ubWlub3IgIT09IDAgfHwgbGF0ZXN0LnZlcnNpb24ucGF0Y2ggIT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlSW5mbyA9IGF3YWl0IGZldGNoUHJvamVjdE5wbVBhY2thZ2VJbmZvKGNvbmZpZyk7XG4gICAgY29uc3QgbnBtTGF0ZXN0VmVyc2lvbiA9IHNlbXZlci5wYXJzZShwYWNrYWdlSW5mb1snZGlzdC10YWdzJ11bJ2xhdGVzdCddKTtcbiAgICAvLyBUaGlzIGFjdGlvbiBvbmx5IGJlY29tZXMgYWN0aXZlIGlmIGEgbWFqb3IganVzdCBoYXMgYmVlbiByZWxlYXNlZCByZWNlbnRseSwgYnV0IGlzXG4gICAgLy8gbm90IHNldCB0byB0aGUgYGxhdGVzdGAgTlBNIGRpc3QgdGFnIGluIHRoZSBOUE0gcmVnaXN0cnkuIE5vdGUgdGhhdCB3ZSBvbmx5IGFsbG93XG4gICAgLy8gcmUtdGFnZ2luZyBpZiB0aGUgY3VycmVudCBgQGxhdGVzdGAgaW4gTlBNIGlzIHRoZSBwcmV2aW91cyBtYWpvciB2ZXJzaW9uLlxuICAgIHJldHVybiBucG1MYXRlc3RWZXJzaW9uICE9PSBudWxsICYmIG5wbUxhdGVzdFZlcnNpb24ubWFqb3IgPT09IGxhdGVzdC52ZXJzaW9uLm1ham9yIC0gMTtcbiAgfVxufVxuIl19