"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CutStableAction = void 0;
const semver = require("semver");
const long_term_support_1 = require("../../versioning/long-term-support");
const actions_1 = require("../actions");
const external_commands_1 = require("../external-commands");
/**
 * Release action that cuts a stable version for the current release-train in the release
 * candidate phase. The pre-release release-candidate version label is removed.
 */
class CutStableAction extends actions_1.ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = this._computeNewVersion();
    }
    async getDescription() {
        const newVersion = this._newVersion;
        return `Cut a stable release for the release-candidate branch (v${newVersion}).`;
    }
    async perform() {
        const { branchName } = this.active.releaseCandidate;
        const newVersion = this._newVersion;
        const isNewMajor = this.active.releaseCandidate?.isMajor;
        const { pullRequest, releaseNotes } = await this.checkoutBranchAndStageVersion(newVersion, branchName);
        await this.waitForPullRequestToBeMerged(pullRequest);
        // If a new major version is published, we publish to the `next` NPM dist tag temporarily.
        // We do this because for major versions, we want all main Angular projects to have their
        // new major become available at the same time. Publishing immediately to the `latest` NPM
        // dist tag could cause inconsistent versions when users install packages with `@latest`.
        // For example: Consider Angular Framework releases v12. CLI and Components would need to
        // wait for that release to complete. Once done, they can update their dependencies to point
        // to v12. Afterwards they could start the release process. In the meanwhile though, the FW
        // dependencies were already available as `@latest`, so users could end up installing v12 while
        // still having the older (but currently still latest) CLI version that is incompatible.
        // The major release can be re-tagged to `latest` through a separate release action.
        await this.buildAndPublish(releaseNotes, branchName, isNewMajor ? 'next' : 'latest');
        // If a new major version is published and becomes the "latest" release-train, we need
        // to set the LTS npm dist tag for the previous latest release-train (the current patch).
        if (isNewMajor) {
            const previousPatch = this.active.latest;
            const ltsTagForPatch = long_term_support_1.getLtsNpmDistTagOfMajor(previousPatch.version.major);
            // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
            // setting the NPM dist tag to the specified version. We do this because release NPM
            // packages could be different in the previous patch branch, and we want to set the
            // LTS tag for all packages part of the last major. It would not be possible to set the
            // NPM dist tag for new packages part of the released major, nor would it be acceptable
            // to skip the LTS tag for packages which are no longer part of the new major.
            await this.checkoutUpstreamBranch(previousPatch.branchName);
            await external_commands_1.invokeYarnInstallCommand(this.projectDir);
            await external_commands_1.invokeSetNpmDistCommand(ltsTagForPatch, previousPatch.version);
        }
        await this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
    }
    /** Gets the new stable version of the release candidate release-train. */
    _computeNewVersion() {
        const { version } = this.active.releaseCandidate;
        return semver.parse(`${version.major}.${version.minor}.${version.patch}`);
    }
    static async isActive(active) {
        // A stable version can be cut for an active release-train currently in the
        // release-candidate phase. Note: It is not possible to directly release from
        // feature-freeze phase into a stable version.
        return (active.releaseCandidate !== null && active.releaseCandidate.version.prerelease[0] === 'rc');
    }
}
exports.CutStableAction = CutStableAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtc3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlDQUFpQztBQUdqQywwRUFBMkU7QUFDM0Usd0NBQXlDO0FBQ3pDLDREQUF1RjtBQUV2Rjs7O0dBR0c7QUFDSCxNQUFhLGVBQWdCLFNBQVEsdUJBQWE7SUFBbEQ7O1FBQ1UsZ0JBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQWlFbEQsQ0FBQztJQS9EVSxLQUFLLENBQUMsY0FBYztRQUMzQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLE9BQU8sMkRBQTJELFVBQVUsSUFBSSxDQUFDO0lBQ25GLENBQUM7SUFFUSxLQUFLLENBQUMsT0FBTztRQUNwQixNQUFNLEVBQUMsVUFBVSxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsQ0FBQztRQUNuRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDO1FBRXpELE1BQU0sRUFBQyxXQUFXLEVBQUUsWUFBWSxFQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsNkJBQTZCLENBQzFFLFVBQVUsRUFDVixVQUFVLENBQ1gsQ0FBQztRQUVGLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXJELDBGQUEwRjtRQUMxRix5RkFBeUY7UUFDekYsMEZBQTBGO1FBQzFGLHlGQUF5RjtRQUN6Rix5RkFBeUY7UUFDekYsNEZBQTRGO1FBQzVGLDJGQUEyRjtRQUMzRiwrRkFBK0Y7UUFDL0Ysd0ZBQXdGO1FBQ3hGLG9GQUFvRjtRQUNwRixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFckYsc0ZBQXNGO1FBQ3RGLHlGQUF5RjtRQUN6RixJQUFJLFVBQVUsRUFBRTtZQUNkLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ3pDLE1BQU0sY0FBYyxHQUFHLDJDQUF1QixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFNUUsa0ZBQWtGO1lBQ2xGLG9GQUFvRjtZQUNwRixtRkFBbUY7WUFDbkYsdUZBQXVGO1lBQ3ZGLHVGQUF1RjtZQUN2Riw4RUFBOEU7WUFDOUUsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzVELE1BQU0sNENBQXdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sMkNBQXVCLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN0RTtRQUVELE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsMEVBQTBFO0lBQ2xFLGtCQUFrQjtRQUN4QixNQUFNLEVBQUMsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsQ0FBQztRQUNoRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFFLENBQUM7SUFDN0UsQ0FBQztJQUVELE1BQU0sQ0FBVSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQTJCO1FBQ3hELDJFQUEyRTtRQUMzRSw2RUFBNkU7UUFDN0UsOENBQThDO1FBQzlDLE9BQU8sQ0FDTCxNQUFNLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FDM0YsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQWxFRCwwQ0FrRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvcn0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9sb25nLXRlcm0tc3VwcG9ydCc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtpbnZva2VTZXROcG1EaXN0Q29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuLi9leHRlcm5hbC1jb21tYW5kcyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgc3RhYmxlIHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IHJlbGVhc2UtdHJhaW4gaW4gdGhlIHJlbGVhc2VcbiAqIGNhbmRpZGF0ZSBwaGFzZS4gVGhlIHByZS1yZWxlYXNlIHJlbGVhc2UtY2FuZGlkYXRlIHZlcnNpb24gbGFiZWwgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dFN0YWJsZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBwcml2YXRlIF9uZXdWZXJzaW9uID0gdGhpcy5fY29tcHV0ZU5ld1ZlcnNpb24oKTtcblxuICBvdmVycmlkZSBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYEN1dCBhIHN0YWJsZSByZWxlYXNlIGZvciB0aGUgcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSE7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgY29uc3QgaXNOZXdNYWpvciA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGU/LmlzTWFqb3I7XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3QsIHJlbGVhc2VOb3Rlc30gPSBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKFxuICAgICAgbmV3VmVyc2lvbixcbiAgICAgIGJyYW5jaE5hbWUsXG4gICAgKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG5cbiAgICAvLyBJZiBhIG5ldyBtYWpvciB2ZXJzaW9uIGlzIHB1Ymxpc2hlZCwgd2UgcHVibGlzaCB0byB0aGUgYG5leHRgIE5QTSBkaXN0IHRhZyB0ZW1wb3JhcmlseS5cbiAgICAvLyBXZSBkbyB0aGlzIGJlY2F1c2UgZm9yIG1ham9yIHZlcnNpb25zLCB3ZSB3YW50IGFsbCBtYWluIEFuZ3VsYXIgcHJvamVjdHMgdG8gaGF2ZSB0aGVpclxuICAgIC8vIG5ldyBtYWpvciBiZWNvbWUgYXZhaWxhYmxlIGF0IHRoZSBzYW1lIHRpbWUuIFB1Ymxpc2hpbmcgaW1tZWRpYXRlbHkgdG8gdGhlIGBsYXRlc3RgIE5QTVxuICAgIC8vIGRpc3QgdGFnIGNvdWxkIGNhdXNlIGluY29uc2lzdGVudCB2ZXJzaW9ucyB3aGVuIHVzZXJzIGluc3RhbGwgcGFja2FnZXMgd2l0aCBgQGxhdGVzdGAuXG4gICAgLy8gRm9yIGV4YW1wbGU6IENvbnNpZGVyIEFuZ3VsYXIgRnJhbWV3b3JrIHJlbGVhc2VzIHYxMi4gQ0xJIGFuZCBDb21wb25lbnRzIHdvdWxkIG5lZWQgdG9cbiAgICAvLyB3YWl0IGZvciB0aGF0IHJlbGVhc2UgdG8gY29tcGxldGUuIE9uY2UgZG9uZSwgdGhleSBjYW4gdXBkYXRlIHRoZWlyIGRlcGVuZGVuY2llcyB0byBwb2ludFxuICAgIC8vIHRvIHYxMi4gQWZ0ZXJ3YXJkcyB0aGV5IGNvdWxkIHN0YXJ0IHRoZSByZWxlYXNlIHByb2Nlc3MuIEluIHRoZSBtZWFud2hpbGUgdGhvdWdoLCB0aGUgRldcbiAgICAvLyBkZXBlbmRlbmNpZXMgd2VyZSBhbHJlYWR5IGF2YWlsYWJsZSBhcyBgQGxhdGVzdGAsIHNvIHVzZXJzIGNvdWxkIGVuZCB1cCBpbnN0YWxsaW5nIHYxMiB3aGlsZVxuICAgIC8vIHN0aWxsIGhhdmluZyB0aGUgb2xkZXIgKGJ1dCBjdXJyZW50bHkgc3RpbGwgbGF0ZXN0KSBDTEkgdmVyc2lvbiB0aGF0IGlzIGluY29tcGF0aWJsZS5cbiAgICAvLyBUaGUgbWFqb3IgcmVsZWFzZSBjYW4gYmUgcmUtdGFnZ2VkIHRvIGBsYXRlc3RgIHRocm91Z2ggYSBzZXBhcmF0ZSByZWxlYXNlIGFjdGlvbi5cbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUsIGlzTmV3TWFqb3IgPyAnbmV4dCcgOiAnbGF0ZXN0Jyk7XG5cbiAgICAvLyBJZiBhIG5ldyBtYWpvciB2ZXJzaW9uIGlzIHB1Ymxpc2hlZCBhbmQgYmVjb21lcyB0aGUgXCJsYXRlc3RcIiByZWxlYXNlLXRyYWluLCB3ZSBuZWVkXG4gICAgLy8gdG8gc2V0IHRoZSBMVFMgbnBtIGRpc3QgdGFnIGZvciB0aGUgcHJldmlvdXMgbGF0ZXN0IHJlbGVhc2UtdHJhaW4gKHRoZSBjdXJyZW50IHBhdGNoKS5cbiAgICBpZiAoaXNOZXdNYWpvcikge1xuICAgICAgY29uc3QgcHJldmlvdXNQYXRjaCA9IHRoaXMuYWN0aXZlLmxhdGVzdDtcbiAgICAgIGNvbnN0IGx0c1RhZ0ZvclBhdGNoID0gZ2V0THRzTnBtRGlzdFRhZ09mTWFqb3IocHJldmlvdXNQYXRjaC52ZXJzaW9uLm1ham9yKTtcblxuICAgICAgLy8gSW5zdGVhZCBvZiBkaXJlY3RseSBzZXR0aW5nIHRoZSBOUE0gZGlzdCB0YWdzLCB3ZSBpbnZva2UgdGhlIG5nLWRldiBjb21tYW5kIGZvclxuICAgICAgLy8gc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFnIHRvIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gV2UgZG8gdGhpcyBiZWNhdXNlIHJlbGVhc2UgTlBNXG4gICAgICAvLyBwYWNrYWdlcyBjb3VsZCBiZSBkaWZmZXJlbnQgaW4gdGhlIHByZXZpb3VzIHBhdGNoIGJyYW5jaCwgYW5kIHdlIHdhbnQgdG8gc2V0IHRoZVxuICAgICAgLy8gTFRTIHRhZyBmb3IgYWxsIHBhY2thZ2VzIHBhcnQgb2YgdGhlIGxhc3QgbWFqb3IuIEl0IHdvdWxkIG5vdCBiZSBwb3NzaWJsZSB0byBzZXQgdGhlXG4gICAgICAvLyBOUE0gZGlzdCB0YWcgZm9yIG5ldyBwYWNrYWdlcyBwYXJ0IG9mIHRoZSByZWxlYXNlZCBtYWpvciwgbm9yIHdvdWxkIGl0IGJlIGFjY2VwdGFibGVcbiAgICAgIC8vIHRvIHNraXAgdGhlIExUUyB0YWcgZm9yIHBhY2thZ2VzIHdoaWNoIGFyZSBubyBsb25nZXIgcGFydCBvZiB0aGUgbmV3IG1ham9yLlxuICAgICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHByZXZpb3VzUGF0Y2guYnJhbmNoTmFtZSk7XG4gICAgICBhd2FpdCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmQodGhpcy5wcm9qZWN0RGlyKTtcbiAgICAgIGF3YWl0IGludm9rZVNldE5wbURpc3RDb21tYW5kKGx0c1RhZ0ZvclBhdGNoLCBwcmV2aW91c1BhdGNoLnZlcnNpb24pO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbmV3IHN0YWJsZSB2ZXJzaW9uIG9mIHRoZSByZWxlYXNlIGNhbmRpZGF0ZSByZWxlYXNlLXRyYWluLiAqL1xuICBwcml2YXRlIF9jb21wdXRlTmV3VmVyc2lvbigpOiBzZW12ZXIuU2VtVmVyIHtcbiAgICBjb25zdCB7dmVyc2lvbn0gPSB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlITtcbiAgICByZXR1cm4gc2VtdmVyLnBhcnNlKGAke3ZlcnNpb24ubWFqb3J9LiR7dmVyc2lvbi5taW5vcn0uJHt2ZXJzaW9uLnBhdGNofWApITtcbiAgfVxuXG4gIHN0YXRpYyBvdmVycmlkZSBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBBIHN0YWJsZSB2ZXJzaW9uIGNhbiBiZSBjdXQgZm9yIGFuIGFjdGl2ZSByZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGVcbiAgICAvLyByZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gTm90ZTogSXQgaXMgbm90IHBvc3NpYmxlIHRvIGRpcmVjdGx5IHJlbGVhc2UgZnJvbVxuICAgIC8vIGZlYXR1cmUtZnJlZXplIHBoYXNlIGludG8gYSBzdGFibGUgdmVyc2lvbi5cbiAgICByZXR1cm4gKFxuICAgICAgYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwgJiYgYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUudmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAncmMnXG4gICAgKTtcbiAgfVxufVxuIl19