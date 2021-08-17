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
        return `Tag recently published major v${this.active.latest.version} as "next" in NPM.`;
    }
    async perform() {
        await this.updateGithubReleaseEntryToStable(this.active.latest.version);
        await this.checkoutUpstreamBranch(this.active.latest.branchName);
        await external_commands_1.invokeYarnInstallCommand(this.projectDir);
        await external_commands_1.invokeSetNpmDistCommand('latest', this.active.latest.version);
    }
    /**
     * Updates the Github release entry for the specified version to show
     * it as stable release, compared to it being shown as a pre-release.
     */
    async updateGithubReleaseEntryToStable(version) {
        const releaseTagName = version_tags_1.getReleaseTagForVersion(version);
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
        const packageInfo = await npm_registry_1.fetchProjectNpmPackageInfo(config);
        const npmLatestVersion = semver.parse(packageInfo['dist-tags']['latest']);
        // This action only becomes active if a major just has been released recently, but is
        // not set to the `latest` NPM dist tag in the NPM registry. Note that we only allow
        // re-tagging if the current `@latest` in NPM is the previous major version.
        return npmLatestVersion !== null && npmLatestVersion.major === latest.version.major - 1;
    }
}
exports.TagRecentMajorAsLatest = TagRecentMajorAsLatest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvdGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBSWpDLGdFQUF5RTtBQUN6RSx3Q0FBeUM7QUFDekMsNERBQXVGO0FBRXZGLGdFQUFzRTtBQUV0RTs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFhLHNCQUF1QixTQUFRLHVCQUFhO0lBQzlDLEtBQUssQ0FBQyxjQUFjO1FBQzNCLE9BQU8saUNBQWlDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sb0JBQW9CLENBQUM7SUFDekYsQ0FBQztJQUVRLEtBQUssQ0FBQyxPQUFPO1FBQ3BCLE1BQU0sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sNENBQXdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sMkNBQXVCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsZ0NBQWdDLENBQUMsT0FBZTtRQUNwRCxNQUFNLGNBQWMsR0FBRyxzQ0FBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4RCxNQUFNLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztZQUN0RSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWTtZQUN4QixHQUFHLEVBQUUsY0FBYztTQUNwQixDQUFDLENBQUM7UUFFSCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7WUFDeEMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVk7WUFDeEIsVUFBVSxFQUFFLFdBQVcsQ0FBQyxFQUFFO1lBQzFCLFVBQVUsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLENBQVUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBc0IsRUFBRSxNQUFxQjtRQUNqRix1RkFBdUY7UUFDdkYsd0ZBQXdGO1FBQ3hGLDhFQUE4RTtRQUM5RSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDNUQsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0seUNBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0QsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzFFLHFGQUFxRjtRQUNyRixvRkFBb0Y7UUFDcEYsNEVBQTRFO1FBQzVFLE9BQU8sZ0JBQWdCLEtBQUssSUFBSSxJQUFJLGdCQUFnQixDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDMUYsQ0FBQztDQUNGO0FBN0NELHdEQTZDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi8uLi9jb25maWcnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2ZldGNoUHJvamVjdE5wbVBhY2thZ2VJbmZvfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL25wbS1yZWdpc3RyeSc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtpbnZva2VTZXROcG1EaXN0Q29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuLi9leHRlcm5hbC1jb21tYW5kcyc7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7Z2V0UmVsZWFzZVRhZ0ZvclZlcnNpb259IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvdmVyc2lvbi10YWdzJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IHRhZ3MgdGhlIHJlY2VudGx5IHB1Ymxpc2hlZCBtYWpvciBhcyBsYXRlc3Qgd2l0aGluIHRoZSBOUE1cbiAqIHJlZ2lzdHJ5LiBNYWpvciB2ZXJzaW9ucyBhcmUgcHVibGlzaGVkIHRvIHRoZSBgbmV4dGAgTlBNIGRpc3QgdGFnIGluaXRpYWxseSBhbmRcbiAqIGNhbiBiZSByZS10YWdnZWQgdG8gdGhlIGBsYXRlc3RgIE5QTSBkaXN0IHRhZy4gVGhpcyBhbGxvd3MgY2FyZXRha2VycyB0byBtYWtlIG1ham9yXG4gKiByZWxlYXNlcyBhdmFpbGFibGUgYXQgdGhlIHNhbWUgdGltZS4gZS5nLiBGcmFtZXdvcmssIFRvb2xpbmcgYW5kIENvbXBvbmVudHNcbiAqIGFyZSBhYmxlIHRvIHB1Ymxpc2ggdjEyIHRvIGBAbGF0ZXN0YCBhdCB0aGUgc2FtZSB0aW1lLiBUaGlzIHdvdWxkbid0IGJlIHBvc3NpYmxlIGlmXG4gKiB3ZSBkaXJlY3RseSBwdWJsaXNoIHRvIGBAbGF0ZXN0YCBiZWNhdXNlIFRvb2xpbmcgYW5kIENvbXBvbmVudHMgbmVlZHMgdG8gd2FpdFxuICogZm9yIHRoZSBtYWpvciBmcmFtZXdvcmsgcmVsZWFzZSB0byBiZSBhdmFpbGFibGUgb24gTlBNLlxuICogQHNlZSB7Q3V0U3RhYmxlQWN0aW9uI3BlcmZvcm19IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUYWdSZWNlbnRNYWpvckFzTGF0ZXN0IGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIHJldHVybiBgVGFnIHJlY2VudGx5IHB1Ymxpc2hlZCBtYWpvciB2JHt0aGlzLmFjdGl2ZS5sYXRlc3QudmVyc2lvbn0gYXMgXCJuZXh0XCIgaW4gTlBNLmA7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwZXJmb3JtKCkge1xuICAgIGF3YWl0IHRoaXMudXBkYXRlR2l0aHViUmVsZWFzZUVudHJ5VG9TdGFibGUodGhpcy5hY3RpdmUubGF0ZXN0LnZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaCh0aGlzLmFjdGl2ZS5sYXRlc3QuYnJhbmNoTmFtZSk7XG4gICAgYXdhaXQgaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHRoaXMucHJvamVjdERpcik7XG4gICAgYXdhaXQgaW52b2tlU2V0TnBtRGlzdENvbW1hbmQoJ2xhdGVzdCcsIHRoaXMuYWN0aXZlLmxhdGVzdC52ZXJzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBHaXRodWIgcmVsZWFzZSBlbnRyeSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIHRvIHNob3dcbiAgICogaXQgYXMgc3RhYmxlIHJlbGVhc2UsIGNvbXBhcmVkIHRvIGl0IGJlaW5nIHNob3duIGFzIGEgcHJlLXJlbGVhc2UuXG4gICAqL1xuICBhc3luYyB1cGRhdGVHaXRodWJSZWxlYXNlRW50cnlUb1N0YWJsZSh2ZXJzaW9uOiBTZW1WZXIpIHtcbiAgICBjb25zdCByZWxlYXNlVGFnTmFtZSA9IGdldFJlbGVhc2VUYWdGb3JWZXJzaW9uKHZlcnNpb24pO1xuICAgIGNvbnN0IHtkYXRhOiByZWxlYXNlSW5mb30gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0UmVsZWFzZUJ5VGFnKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHRhZzogcmVsZWFzZVRhZ05hbWUsXG4gICAgfSk7XG5cbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MudXBkYXRlUmVsZWFzZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICByZWxlYXNlX2lkOiByZWxlYXNlSW5mby5pZCxcbiAgICAgIHByZXJlbGVhc2U6IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIG92ZXJyaWRlIGFzeW5jIGlzQWN0aXZlKHtsYXRlc3R9OiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBjb25maWc6IFJlbGVhc2VDb25maWcpIHtcbiAgICAvLyBJZiB0aGUgbGF0ZXN0IHJlbGVhc2UtdHJhaW4gZG9lcyBjdXJyZW50bHkgbm90IGhhdmUgYSBtYWpvciB2ZXJzaW9uIGFzIHZlcnNpb24uIGUuZy5cbiAgICAvLyB0aGUgbGF0ZXN0IGJyYW5jaCBpcyBgMTAuMC54YCB3aXRoIHRoZSB2ZXJzaW9uIGJlaW5nIGAxMC4wLjJgLiBJbiBzdWNoIGNhc2VzLCBhIG1ham9yXG4gICAgLy8gaGFzIG5vdCBiZWVuIHJlbGVhc2VkIHJlY2VudGx5LCBhbmQgdGhpcyBhY3Rpb24gc2hvdWxkIG5ldmVyIGJlY29tZSBhY3RpdmUuXG4gICAgaWYgKGxhdGVzdC52ZXJzaW9uLm1pbm9yICE9PSAwIHx8IGxhdGVzdC52ZXJzaW9uLnBhdGNoICE9PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcGFja2FnZUluZm8gPSBhd2FpdCBmZXRjaFByb2plY3ROcG1QYWNrYWdlSW5mbyhjb25maWcpO1xuICAgIGNvbnN0IG5wbUxhdGVzdFZlcnNpb24gPSBzZW12ZXIucGFyc2UocGFja2FnZUluZm9bJ2Rpc3QtdGFncyddWydsYXRlc3QnXSk7XG4gICAgLy8gVGhpcyBhY3Rpb24gb25seSBiZWNvbWVzIGFjdGl2ZSBpZiBhIG1ham9yIGp1c3QgaGFzIGJlZW4gcmVsZWFzZWQgcmVjZW50bHksIGJ1dCBpc1xuICAgIC8vIG5vdCBzZXQgdG8gdGhlIGBsYXRlc3RgIE5QTSBkaXN0IHRhZyBpbiB0aGUgTlBNIHJlZ2lzdHJ5LiBOb3RlIHRoYXQgd2Ugb25seSBhbGxvd1xuICAgIC8vIHJlLXRhZ2dpbmcgaWYgdGhlIGN1cnJlbnQgYEBsYXRlc3RgIGluIE5QTSBpcyB0aGUgcHJldmlvdXMgbWFqb3IgdmVyc2lvbi5cbiAgICByZXR1cm4gbnBtTGF0ZXN0VmVyc2lvbiAhPT0gbnVsbCAmJiBucG1MYXRlc3RWZXJzaW9uLm1ham9yID09PSBsYXRlc3QudmVyc2lvbi5tYWpvciAtIDE7XG4gIH1cbn1cbiJdfQ==