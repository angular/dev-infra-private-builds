/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import * as semver from 'semver';
import { getLtsNpmDistTagOfMajor } from '../../versioning/long-term-support';
import { ReleaseAction } from '../actions';
import { invokeSetNpmDistCommand, invokeYarnInstallCommand } from '../external-commands';
/**
 * Release action that cuts a stable version for the current release-train in the release
 * candidate phase. The pre-release release-candidate version label is removed.
 */
export class CutStableAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = this._computeNewVersion();
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            const newVersion = this._newVersion;
            return `Cut a stable release for the release-candidate branch (v${newVersion}).`;
        });
    }
    perform() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.releaseCandidate;
            const newVersion = this._newVersion;
            const isNewMajor = (_a = this.active.releaseCandidate) === null || _a === void 0 ? void 0 : _a.isMajor;
            const { pullRequest, releaseNotes } = yield this.checkoutBranchAndStageVersion(newVersion, branchName);
            yield this.waitForPullRequestToBeMerged(pullRequest);
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
            yield this.buildAndPublish(releaseNotes, branchName, isNewMajor ? 'next' : 'latest');
            // If a new major version is published and becomes the "latest" release-train, we need
            // to set the LTS npm dist tag for the previous latest release-train (the current patch).
            if (isNewMajor) {
                const previousPatch = this.active.latest;
                const ltsTagForPatch = getLtsNpmDistTagOfMajor(previousPatch.version.major);
                // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
                // setting the NPM dist tag to the specified version. We do this because release NPM
                // packages could be different in the previous patch branch, and we want to set the
                // LTS tag for all packages part of the last major. It would not be possible to set the
                // NPM dist tag for new packages part of the released major, nor would it be acceptable
                // to skip the LTS tag for packages which are no longer part of the new major.
                yield this.checkoutUpstreamBranch(previousPatch.branchName);
                yield invokeYarnInstallCommand(this.projectDir);
                yield invokeSetNpmDistCommand(ltsTagForPatch, previousPatch.version);
            }
            yield this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
        });
    }
    /** Gets the new stable version of the release candidate release-train. */
    _computeNewVersion() {
        const { version } = this.active.releaseCandidate;
        return semver.parse(`${version.major}.${version.minor}.${version.patch}`);
    }
    static isActive(active) {
        return __awaiter(this, void 0, void 0, function* () {
            // A stable version can be cut for an active release-train currently in the
            // release-candidate phase. Note: It is not possible to directly release from
            // feature-freeze phase into a stable version.
            return active.releaseCandidate !== null &&
                active.releaseCandidate.version.prerelease[0] === 'rc';
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtc3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUdqQyxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUMzRSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSx3QkFBd0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBRXZGOzs7R0FHRztBQUNILE1BQU0sT0FBTyxlQUFnQixTQUFRLGFBQWE7SUFBbEQ7O1FBQ1UsZ0JBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQThEbEQsQ0FBQztJQTVEZ0IsY0FBYzs7WUFDM0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNwQyxPQUFPLDJEQUEyRCxVQUFVLElBQUksQ0FBQztRQUNuRixDQUFDO0tBQUE7SUFFYyxPQUFPOzs7WUFDcEIsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWlCLENBQUM7WUFDbkQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNwQyxNQUFNLFVBQVUsR0FBRyxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLDBDQUFFLE9BQU8sQ0FBQztZQUV6RCxNQUFNLEVBQUMsV0FBVyxFQUFFLFlBQVksRUFBQyxHQUM3QixNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFckUsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFckQsMEZBQTBGO1lBQzFGLHlGQUF5RjtZQUN6RiwwRkFBMEY7WUFDMUYseUZBQXlGO1lBQ3pGLHlGQUF5RjtZQUN6Riw0RkFBNEY7WUFDNUYsMkZBQTJGO1lBQzNGLCtGQUErRjtZQUMvRix3RkFBd0Y7WUFDeEYsb0ZBQW9GO1lBQ3BGLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVyRixzRkFBc0Y7WUFDdEYseUZBQXlGO1lBQ3pGLElBQUksVUFBVSxFQUFFO2dCQUNkLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUN6QyxNQUFNLGNBQWMsR0FBRyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUU1RSxrRkFBa0Y7Z0JBQ2xGLG9GQUFvRjtnQkFDcEYsbUZBQW1GO2dCQUNuRix1RkFBdUY7Z0JBQ3ZGLHVGQUF1RjtnQkFDdkYsOEVBQThFO2dCQUM5RSxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzVELE1BQU0sd0JBQXdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDdEU7WUFFRCxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7O0tBQ3hFO0lBRUQsMEVBQTBFO0lBQ2xFLGtCQUFrQjtRQUN4QixNQUFNLEVBQUMsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsQ0FBQztRQUNoRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFFLENBQUM7SUFDN0UsQ0FBQztJQUVELE1BQU0sQ0FBZ0IsUUFBUSxDQUFDLE1BQTJCOztZQUN4RCwyRUFBMkU7WUFDM0UsNkVBQTZFO1lBQzdFLDhDQUE4QztZQUM5QyxPQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJO2dCQUNuQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7UUFDN0QsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvcn0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9sb25nLXRlcm0tc3VwcG9ydCc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtpbnZva2VTZXROcG1EaXN0Q29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuLi9leHRlcm5hbC1jb21tYW5kcyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgc3RhYmxlIHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IHJlbGVhc2UtdHJhaW4gaW4gdGhlIHJlbGVhc2VcbiAqIGNhbmRpZGF0ZSBwaGFzZS4gVGhlIHByZS1yZWxlYXNlIHJlbGVhc2UtY2FuZGlkYXRlIHZlcnNpb24gbGFiZWwgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dFN0YWJsZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBwcml2YXRlIF9uZXdWZXJzaW9uID0gdGhpcy5fY29tcHV0ZU5ld1ZlcnNpb24oKTtcblxuICBvdmVycmlkZSBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYEN1dCBhIHN0YWJsZSByZWxlYXNlIGZvciB0aGUgcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSE7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgY29uc3QgaXNOZXdNYWpvciA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGU/LmlzTWFqb3I7XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3QsIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKHB1bGxSZXF1ZXN0KTtcblxuICAgIC8vIElmIGEgbmV3IG1ham9yIHZlcnNpb24gaXMgcHVibGlzaGVkLCB3ZSBwdWJsaXNoIHRvIHRoZSBgbmV4dGAgTlBNIGRpc3QgdGFnIHRlbXBvcmFyaWx5LlxuICAgIC8vIFdlIGRvIHRoaXMgYmVjYXVzZSBmb3IgbWFqb3IgdmVyc2lvbnMsIHdlIHdhbnQgYWxsIG1haW4gQW5ndWxhciBwcm9qZWN0cyB0byBoYXZlIHRoZWlyXG4gICAgLy8gbmV3IG1ham9yIGJlY29tZSBhdmFpbGFibGUgYXQgdGhlIHNhbWUgdGltZS4gUHVibGlzaGluZyBpbW1lZGlhdGVseSB0byB0aGUgYGxhdGVzdGAgTlBNXG4gICAgLy8gZGlzdCB0YWcgY291bGQgY2F1c2UgaW5jb25zaXN0ZW50IHZlcnNpb25zIHdoZW4gdXNlcnMgaW5zdGFsbCBwYWNrYWdlcyB3aXRoIGBAbGF0ZXN0YC5cbiAgICAvLyBGb3IgZXhhbXBsZTogQ29uc2lkZXIgQW5ndWxhciBGcmFtZXdvcmsgcmVsZWFzZXMgdjEyLiBDTEkgYW5kIENvbXBvbmVudHMgd291bGQgbmVlZCB0b1xuICAgIC8vIHdhaXQgZm9yIHRoYXQgcmVsZWFzZSB0byBjb21wbGV0ZS4gT25jZSBkb25lLCB0aGV5IGNhbiB1cGRhdGUgdGhlaXIgZGVwZW5kZW5jaWVzIHRvIHBvaW50XG4gICAgLy8gdG8gdjEyLiBBZnRlcndhcmRzIHRoZXkgY291bGQgc3RhcnQgdGhlIHJlbGVhc2UgcHJvY2Vzcy4gSW4gdGhlIG1lYW53aGlsZSB0aG91Z2gsIHRoZSBGV1xuICAgIC8vIGRlcGVuZGVuY2llcyB3ZXJlIGFscmVhZHkgYXZhaWxhYmxlIGFzIGBAbGF0ZXN0YCwgc28gdXNlcnMgY291bGQgZW5kIHVwIGluc3RhbGxpbmcgdjEyIHdoaWxlXG4gICAgLy8gc3RpbGwgaGF2aW5nIHRoZSBvbGRlciAoYnV0IGN1cnJlbnRseSBzdGlsbCBsYXRlc3QpIENMSSB2ZXJzaW9uIHRoYXQgaXMgaW5jb21wYXRpYmxlLlxuICAgIC8vIFRoZSBtYWpvciByZWxlYXNlIGNhbiBiZSByZS10YWdnZWQgdG8gYGxhdGVzdGAgdGhyb3VnaCBhIHNlcGFyYXRlIHJlbGVhc2UgYWN0aW9uLlxuICAgIGF3YWl0IHRoaXMuYnVpbGRBbmRQdWJsaXNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSwgaXNOZXdNYWpvciA/ICduZXh0JyA6ICdsYXRlc3QnKTtcblxuICAgIC8vIElmIGEgbmV3IG1ham9yIHZlcnNpb24gaXMgcHVibGlzaGVkIGFuZCBiZWNvbWVzIHRoZSBcImxhdGVzdFwiIHJlbGVhc2UtdHJhaW4sIHdlIG5lZWRcbiAgICAvLyB0byBzZXQgdGhlIExUUyBucG0gZGlzdCB0YWcgZm9yIHRoZSBwcmV2aW91cyBsYXRlc3QgcmVsZWFzZS10cmFpbiAodGhlIGN1cnJlbnQgcGF0Y2gpLlxuICAgIGlmIChpc05ld01ham9yKSB7XG4gICAgICBjb25zdCBwcmV2aW91c1BhdGNoID0gdGhpcy5hY3RpdmUubGF0ZXN0O1xuICAgICAgY29uc3QgbHRzVGFnRm9yUGF0Y2ggPSBnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvcihwcmV2aW91c1BhdGNoLnZlcnNpb24ubWFqb3IpO1xuXG4gICAgICAvLyBJbnN0ZWFkIG9mIGRpcmVjdGx5IHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZ3MsIHdlIGludm9rZSB0aGUgbmctZGV2IGNvbW1hbmQgZm9yXG4gICAgICAvLyBzZXR0aW5nIHRoZSBOUE0gZGlzdCB0YWcgdG8gdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiBXZSBkbyB0aGlzIGJlY2F1c2UgcmVsZWFzZSBOUE1cbiAgICAgIC8vIHBhY2thZ2VzIGNvdWxkIGJlIGRpZmZlcmVudCBpbiB0aGUgcHJldmlvdXMgcGF0Y2ggYnJhbmNoLCBhbmQgd2Ugd2FudCB0byBzZXQgdGhlXG4gICAgICAvLyBMVFMgdGFnIGZvciBhbGwgcGFja2FnZXMgcGFydCBvZiB0aGUgbGFzdCBtYWpvci4gSXQgd291bGQgbm90IGJlIHBvc3NpYmxlIHRvIHNldCB0aGVcbiAgICAgIC8vIE5QTSBkaXN0IHRhZyBmb3IgbmV3IHBhY2thZ2VzIHBhcnQgb2YgdGhlIHJlbGVhc2VkIG1ham9yLCBub3Igd291bGQgaXQgYmUgYWNjZXB0YWJsZVxuICAgICAgLy8gdG8gc2tpcCB0aGUgTFRTIHRhZyBmb3IgcGFja2FnZXMgd2hpY2ggYXJlIG5vIGxvbmdlciBwYXJ0IG9mIHRoZSBuZXcgbWFqb3IuXG4gICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gocHJldmlvdXNQYXRjaC5icmFuY2hOYW1lKTtcbiAgICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgICAgYXdhaXQgaW52b2tlU2V0TnBtRGlzdENvbW1hbmQobHRzVGFnRm9yUGF0Y2gsIHByZXZpb3VzUGF0Y2gudmVyc2lvbik7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5jaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2gocmVsZWFzZU5vdGVzLCBicmFuY2hOYW1lKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBuZXcgc3RhYmxlIHZlcnNpb24gb2YgdGhlIHJlbGVhc2UgY2FuZGlkYXRlIHJlbGVhc2UtdHJhaW4uICovXG4gIHByaXZhdGUgX2NvbXB1dGVOZXdWZXJzaW9uKCk6IHNlbXZlci5TZW1WZXIge1xuICAgIGNvbnN0IHt2ZXJzaW9ufSA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUhO1xuICAgIHJldHVybiBzZW12ZXIucGFyc2UoYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yfS4ke3ZlcnNpb24ucGF0Y2h9YCkhO1xuICB9XG5cbiAgc3RhdGljIG92ZXJyaWRlIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIEEgc3RhYmxlIHZlcnNpb24gY2FuIGJlIGN1dCBmb3IgYW4gYWN0aXZlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZVxuICAgIC8vIHJlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBOb3RlOiBJdCBpcyBub3QgcG9zc2libGUgdG8gZGlyZWN0bHkgcmVsZWFzZSBmcm9tXG4gICAgLy8gZmVhdHVyZS1mcmVlemUgcGhhc2UgaW50byBhIHN0YWJsZSB2ZXJzaW9uLlxuICAgIHJldHVybiBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCAmJlxuICAgICAgICBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZS52ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICdyYyc7XG4gIH1cbn1cbiJdfQ==