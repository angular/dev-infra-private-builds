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
        await (0, external_commands_1.invokeSetNpmDistCommand)(this.projectDir, 'latest', this.active.latest.version);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvdGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBSWpDLGdFQUF5RTtBQUN6RSx3Q0FBeUM7QUFDekMsNERBQTZEO0FBRTdELGdFQUFzRTtBQUV0RTs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFhLHNCQUF1QixTQUFRLHVCQUFhO0lBQzlDLEtBQUssQ0FBQyxjQUFjO1FBQzNCLE9BQU8sbUNBQW1DLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sc0JBQXNCLENBQUM7SUFDN0YsQ0FBQztJQUVRLEtBQUssQ0FBQyxPQUFPO1FBQ3BCLE1BQU0sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sSUFBSSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7UUFDakQsTUFBTSxJQUFBLDJDQUF1QixFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsZ0NBQWdDLENBQUMsT0FBZTtRQUNwRCxNQUFNLGNBQWMsR0FBRyxJQUFBLHNDQUF1QixFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hELE1BQU0sRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO1lBQ3RFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO1lBQ3hCLEdBQUcsRUFBRSxjQUFjO1NBQ3BCLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztZQUN4QyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWTtZQUN4QixVQUFVLEVBQUUsV0FBVyxDQUFDLEVBQUU7WUFDMUIsVUFBVSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBVSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFzQixFQUFFLE1BQXFCO1FBQ2pGLHVGQUF1RjtRQUN2Rix3RkFBd0Y7UUFDeEYsOEVBQThFO1FBQzlFLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtZQUM1RCxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLHlDQUEwQixFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMxRSxxRkFBcUY7UUFDckYsb0ZBQW9GO1FBQ3BGLDRFQUE0RTtRQUM1RSxPQUFPLGdCQUFnQixLQUFLLElBQUksSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQzFGLENBQUM7Q0FDRjtBQTdDRCx3REE2Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtmZXRjaFByb2plY3ROcG1QYWNrYWdlSW5mb30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9ucG0tcmVnaXN0cnknO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcbmltcG9ydCB7aW52b2tlU2V0TnBtRGlzdENvbW1hbmR9IGZyb20gJy4uL2V4dGVybmFsLWNvbW1hbmRzJztcbmltcG9ydCB7U2VtVmVyfSBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtnZXRSZWxlYXNlVGFnRm9yVmVyc2lvbn0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy92ZXJzaW9uLXRhZ3MnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgdGFncyB0aGUgcmVjZW50bHkgcHVibGlzaGVkIG1ham9yIGFzIGxhdGVzdCB3aXRoaW4gdGhlIE5QTVxuICogcmVnaXN0cnkuIE1ham9yIHZlcnNpb25zIGFyZSBwdWJsaXNoZWQgdG8gdGhlIGBuZXh0YCBOUE0gZGlzdCB0YWcgaW5pdGlhbGx5IGFuZFxuICogY2FuIGJlIHJlLXRhZ2dlZCB0byB0aGUgYGxhdGVzdGAgTlBNIGRpc3QgdGFnLiBUaGlzIGFsbG93cyBjYXJldGFrZXJzIHRvIG1ha2UgbWFqb3JcbiAqIHJlbGVhc2VzIGF2YWlsYWJsZSBhdCB0aGUgc2FtZSB0aW1lLiBlLmcuIEZyYW1ld29yaywgVG9vbGluZyBhbmQgQ29tcG9uZW50c1xuICogYXJlIGFibGUgdG8gcHVibGlzaCB2MTIgdG8gYEBsYXRlc3RgIGF0IHRoZSBzYW1lIHRpbWUuIFRoaXMgd291bGRuJ3QgYmUgcG9zc2libGUgaWZcbiAqIHdlIGRpcmVjdGx5IHB1Ymxpc2ggdG8gYEBsYXRlc3RgIGJlY2F1c2UgVG9vbGluZyBhbmQgQ29tcG9uZW50cyBuZWVkcyB0byB3YWl0XG4gKiBmb3IgdGhlIG1ham9yIGZyYW1ld29yayByZWxlYXNlIHRvIGJlIGF2YWlsYWJsZSBvbiBOUE0uXG4gKiBAc2VlIHtDdXRTdGFibGVBY3Rpb24jcGVyZm9ybX0gZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRhZ1JlY2VudE1ham9yQXNMYXRlc3QgZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgb3ZlcnJpZGUgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIGBSZXRhZyByZWNlbnRseSBwdWJsaXNoZWQgbWFqb3IgdiR7dGhpcy5hY3RpdmUubGF0ZXN0LnZlcnNpb259IGFzIFwibGF0ZXN0XCIgaW4gTlBNLmA7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwZXJmb3JtKCkge1xuICAgIGF3YWl0IHRoaXMudXBkYXRlR2l0aHViUmVsZWFzZUVudHJ5VG9TdGFibGUodGhpcy5hY3RpdmUubGF0ZXN0LnZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaCh0aGlzLmFjdGl2ZS5sYXRlc3QuYnJhbmNoTmFtZSk7XG4gICAgYXdhaXQgdGhpcy5pbnN0YWxsRGVwZW5kZW5jaWVzRm9yQ3VycmVudEJyYW5jaCgpO1xuICAgIGF3YWl0IGludm9rZVNldE5wbURpc3RDb21tYW5kKHRoaXMucHJvamVjdERpciwgJ2xhdGVzdCcsIHRoaXMuYWN0aXZlLmxhdGVzdC52ZXJzaW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBHaXRodWIgcmVsZWFzZSBlbnRyeSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIHRvIHNob3dcbiAgICogaXQgYXMgc3RhYmxlIHJlbGVhc2UsIGNvbXBhcmVkIHRvIGl0IGJlaW5nIHNob3duIGFzIGEgcHJlLXJlbGVhc2UuXG4gICAqL1xuICBhc3luYyB1cGRhdGVHaXRodWJSZWxlYXNlRW50cnlUb1N0YWJsZSh2ZXJzaW9uOiBTZW1WZXIpIHtcbiAgICBjb25zdCByZWxlYXNlVGFnTmFtZSA9IGdldFJlbGVhc2VUYWdGb3JWZXJzaW9uKHZlcnNpb24pO1xuICAgIGNvbnN0IHtkYXRhOiByZWxlYXNlSW5mb30gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0UmVsZWFzZUJ5VGFnKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHRhZzogcmVsZWFzZVRhZ05hbWUsXG4gICAgfSk7XG5cbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MudXBkYXRlUmVsZWFzZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICByZWxlYXNlX2lkOiByZWxlYXNlSW5mby5pZCxcbiAgICAgIHByZXJlbGVhc2U6IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIG92ZXJyaWRlIGFzeW5jIGlzQWN0aXZlKHtsYXRlc3R9OiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBjb25maWc6IFJlbGVhc2VDb25maWcpIHtcbiAgICAvLyBJZiB0aGUgbGF0ZXN0IHJlbGVhc2UtdHJhaW4gZG9lcyBjdXJyZW50bHkgbm90IGhhdmUgYSBtYWpvciB2ZXJzaW9uIGFzIHZlcnNpb24uIGUuZy5cbiAgICAvLyB0aGUgbGF0ZXN0IGJyYW5jaCBpcyBgMTAuMC54YCB3aXRoIHRoZSB2ZXJzaW9uIGJlaW5nIGAxMC4wLjJgLiBJbiBzdWNoIGNhc2VzLCBhIG1ham9yXG4gICAgLy8gaGFzIG5vdCBiZWVuIHJlbGVhc2VkIHJlY2VudGx5LCBhbmQgdGhpcyBhY3Rpb24gc2hvdWxkIG5ldmVyIGJlY29tZSBhY3RpdmUuXG4gICAgaWYgKGxhdGVzdC52ZXJzaW9uLm1pbm9yICE9PSAwIHx8IGxhdGVzdC52ZXJzaW9uLnBhdGNoICE9PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcGFja2FnZUluZm8gPSBhd2FpdCBmZXRjaFByb2plY3ROcG1QYWNrYWdlSW5mbyhjb25maWcpO1xuICAgIGNvbnN0IG5wbUxhdGVzdFZlcnNpb24gPSBzZW12ZXIucGFyc2UocGFja2FnZUluZm9bJ2Rpc3QtdGFncyddWydsYXRlc3QnXSk7XG4gICAgLy8gVGhpcyBhY3Rpb24gb25seSBiZWNvbWVzIGFjdGl2ZSBpZiBhIG1ham9yIGp1c3QgaGFzIGJlZW4gcmVsZWFzZWQgcmVjZW50bHksIGJ1dCBpc1xuICAgIC8vIG5vdCBzZXQgdG8gdGhlIGBsYXRlc3RgIE5QTSBkaXN0IHRhZyBpbiB0aGUgTlBNIHJlZ2lzdHJ5LiBOb3RlIHRoYXQgd2Ugb25seSBhbGxvd1xuICAgIC8vIHJlLXRhZ2dpbmcgaWYgdGhlIGN1cnJlbnQgYEBsYXRlc3RgIGluIE5QTSBpcyB0aGUgcHJldmlvdXMgbWFqb3IgdmVyc2lvbi5cbiAgICByZXR1cm4gbnBtTGF0ZXN0VmVyc2lvbiAhPT0gbnVsbCAmJiBucG1MYXRlc3RWZXJzaW9uLm1ham9yID09PSBsYXRlc3QudmVyc2lvbi5tYWpvciAtIDE7XG4gIH1cbn1cbiJdfQ==