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
            const { pullRequest: { id }, releaseNotes } = yield this.checkoutBranchAndStageVersion(newVersion, branchName);
            yield this.waitForPullRequestToBeMerged(id);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtc3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUdqQyxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUMzRSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSx3QkFBd0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBRXZGOzs7R0FHRztBQUNILE1BQU0sT0FBTyxlQUFnQixTQUFRLGFBQWE7SUFBbEQ7O1FBQ1UsZ0JBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQThEbEQsQ0FBQztJQTVETyxjQUFjOztZQUNsQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3BDLE9BQU8sMkRBQTJELFVBQVUsSUFBSSxDQUFDO1FBQ25GLENBQUM7S0FBQTtJQUVLLE9BQU87OztZQUNYLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFpQixDQUFDO1lBQ25ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDcEMsTUFBTSxVQUFVLEdBQUcsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQiwwQ0FBRSxPQUFPLENBQUM7WUFFekQsTUFBTSxFQUFDLFdBQVcsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLFlBQVksRUFBQyxHQUNuQyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFckUsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFNUMsMEZBQTBGO1lBQzFGLHlGQUF5RjtZQUN6RiwwRkFBMEY7WUFDMUYseUZBQXlGO1lBQ3pGLHlGQUF5RjtZQUN6Riw0RkFBNEY7WUFDNUYsMkZBQTJGO1lBQzNGLCtGQUErRjtZQUMvRix3RkFBd0Y7WUFDeEYsb0ZBQW9GO1lBQ3BGLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVyRixzRkFBc0Y7WUFDdEYseUZBQXlGO1lBQ3pGLElBQUksVUFBVSxFQUFFO2dCQUNkLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUN6QyxNQUFNLGNBQWMsR0FBRyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUU1RSxrRkFBa0Y7Z0JBQ2xGLG9GQUFvRjtnQkFDcEYsbUZBQW1GO2dCQUNuRix1RkFBdUY7Z0JBQ3ZGLHVGQUF1RjtnQkFDdkYsOEVBQThFO2dCQUM5RSxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzVELE1BQU0sd0JBQXdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDdEU7WUFFRCxNQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7O0tBQ3hFO0lBRUQsMEVBQTBFO0lBQ2xFLGtCQUFrQjtRQUN4QixNQUFNLEVBQUMsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsQ0FBQztRQUNoRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFFLENBQUM7SUFDN0UsQ0FBQztJQUVELE1BQU0sQ0FBTyxRQUFRLENBQUMsTUFBMkI7O1lBQy9DLDJFQUEyRTtZQUMzRSw2RUFBNkU7WUFDN0UsOENBQThDO1lBQzlDLE9BQU8sTUFBTSxDQUFDLGdCQUFnQixLQUFLLElBQUk7Z0JBQ25DLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQztRQUM3RCxDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2dldEx0c05wbURpc3RUYWdPZk1ham9yfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2xvbmctdGVybS1zdXBwb3J0JztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQge2ludm9rZVNldE5wbURpc3RDb21tYW5kLCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmR9IGZyb20gJy4uL2V4dGVybmFsLWNvbW1hbmRzJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGN1dHMgYSBzdGFibGUgdmVyc2lvbiBmb3IgdGhlIGN1cnJlbnQgcmVsZWFzZS10cmFpbiBpbiB0aGUgcmVsZWFzZVxuICogY2FuZGlkYXRlIHBoYXNlLiBUaGUgcHJlLXJlbGVhc2UgcmVsZWFzZS1jYW5kaWRhdGUgdmVyc2lvbiBsYWJlbCBpcyByZW1vdmVkLlxuICovXG5leHBvcnQgY2xhc3MgQ3V0U3RhYmxlQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSB0aGlzLl9jb21wdXRlTmV3VmVyc2lvbigpO1xuXG4gIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ3V0IGEgc3RhYmxlIHJlbGVhc2UgZm9yIHRoZSByZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlITtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcbiAgICBjb25zdCBpc05ld01ham9yID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZT8uaXNNYWpvcjtcblxuICAgIGNvbnN0IHtwdWxsUmVxdWVzdDoge2lkfSwgcmVsZWFzZU5vdGVzfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbiwgYnJhbmNoTmFtZSk7XG5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQpO1xuXG4gICAgLy8gSWYgYSBuZXcgbWFqb3IgdmVyc2lvbiBpcyBwdWJsaXNoZWQsIHdlIHB1Ymxpc2ggdG8gdGhlIGBuZXh0YCBOUE0gZGlzdCB0YWcgdGVtcG9yYXJpbHkuXG4gICAgLy8gV2UgZG8gdGhpcyBiZWNhdXNlIGZvciBtYWpvciB2ZXJzaW9ucywgd2Ugd2FudCBhbGwgbWFpbiBBbmd1bGFyIHByb2plY3RzIHRvIGhhdmUgdGhlaXJcbiAgICAvLyBuZXcgbWFqb3IgYmVjb21lIGF2YWlsYWJsZSBhdCB0aGUgc2FtZSB0aW1lLiBQdWJsaXNoaW5nIGltbWVkaWF0ZWx5IHRvIHRoZSBgbGF0ZXN0YCBOUE1cbiAgICAvLyBkaXN0IHRhZyBjb3VsZCBjYXVzZSBpbmNvbnNpc3RlbnQgdmVyc2lvbnMgd2hlbiB1c2VycyBpbnN0YWxsIHBhY2thZ2VzIHdpdGggYEBsYXRlc3RgLlxuICAgIC8vIEZvciBleGFtcGxlOiBDb25zaWRlciBBbmd1bGFyIEZyYW1ld29yayByZWxlYXNlcyB2MTIuIENMSSBhbmQgQ29tcG9uZW50cyB3b3VsZCBuZWVkIHRvXG4gICAgLy8gd2FpdCBmb3IgdGhhdCByZWxlYXNlIHRvIGNvbXBsZXRlLiBPbmNlIGRvbmUsIHRoZXkgY2FuIHVwZGF0ZSB0aGVpciBkZXBlbmRlbmNpZXMgdG8gcG9pbnRcbiAgICAvLyB0byB2MTIuIEFmdGVyd2FyZHMgdGhleSBjb3VsZCBzdGFydCB0aGUgcmVsZWFzZSBwcm9jZXNzLiBJbiB0aGUgbWVhbndoaWxlIHRob3VnaCwgdGhlIEZXXG4gICAgLy8gZGVwZW5kZW5jaWVzIHdlcmUgYWxyZWFkeSBhdmFpbGFibGUgYXMgYEBsYXRlc3RgLCBzbyB1c2VycyBjb3VsZCBlbmQgdXAgaW5zdGFsbGluZyB2MTIgd2hpbGVcbiAgICAvLyBzdGlsbCBoYXZpbmcgdGhlIG9sZGVyIChidXQgY3VycmVudGx5IHN0aWxsIGxhdGVzdCkgQ0xJIHZlcnNpb24gdGhhdCBpcyBpbmNvbXBhdGlibGUuXG4gICAgLy8gVGhlIG1ham9yIHJlbGVhc2UgY2FuIGJlIHJlLXRhZ2dlZCB0byBgbGF0ZXN0YCB0aHJvdWdoIGEgc2VwYXJhdGUgcmVsZWFzZSBhY3Rpb24uXG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBicmFuY2hOYW1lLCBpc05ld01ham9yID8gJ25leHQnIDogJ2xhdGVzdCcpO1xuXG4gICAgLy8gSWYgYSBuZXcgbWFqb3IgdmVyc2lvbiBpcyBwdWJsaXNoZWQgYW5kIGJlY29tZXMgdGhlIFwibGF0ZXN0XCIgcmVsZWFzZS10cmFpbiwgd2UgbmVlZFxuICAgIC8vIHRvIHNldCB0aGUgTFRTIG5wbSBkaXN0IHRhZyBmb3IgdGhlIHByZXZpb3VzIGxhdGVzdCByZWxlYXNlLXRyYWluICh0aGUgY3VycmVudCBwYXRjaCkuXG4gICAgaWYgKGlzTmV3TWFqb3IpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGF0Y2ggPSB0aGlzLmFjdGl2ZS5sYXRlc3Q7XG4gICAgICBjb25zdCBsdHNUYWdGb3JQYXRjaCA9IGdldEx0c05wbURpc3RUYWdPZk1ham9yKHByZXZpb3VzUGF0Y2gudmVyc2lvbi5tYWpvcik7XG5cbiAgICAgIC8vIEluc3RlYWQgb2YgZGlyZWN0bHkgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFncywgd2UgaW52b2tlIHRoZSBuZy1kZXYgY29tbWFuZCBmb3JcbiAgICAgIC8vIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyB0byB0aGUgc3BlY2lmaWVkIHZlcnNpb24uIFdlIGRvIHRoaXMgYmVjYXVzZSByZWxlYXNlIE5QTVxuICAgICAgLy8gcGFja2FnZXMgY291bGQgYmUgZGlmZmVyZW50IGluIHRoZSBwcmV2aW91cyBwYXRjaCBicmFuY2gsIGFuZCB3ZSB3YW50IHRvIHNldCB0aGVcbiAgICAgIC8vIExUUyB0YWcgZm9yIGFsbCBwYWNrYWdlcyBwYXJ0IG9mIHRoZSBsYXN0IG1ham9yLiBJdCB3b3VsZCBub3QgYmUgcG9zc2libGUgdG8gc2V0IHRoZVxuICAgICAgLy8gTlBNIGRpc3QgdGFnIGZvciBuZXcgcGFja2FnZXMgcGFydCBvZiB0aGUgcmVsZWFzZWQgbWFqb3IsIG5vciB3b3VsZCBpdCBiZSBhY2NlcHRhYmxlXG4gICAgICAvLyB0byBza2lwIHRoZSBMVFMgdGFnIGZvciBwYWNrYWdlcyB3aGljaCBhcmUgbm8gbG9uZ2VyIHBhcnQgb2YgdGhlIG5ldyBtYWpvci5cbiAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChwcmV2aW91c1BhdGNoLmJyYW5jaE5hbWUpO1xuICAgICAgYXdhaXQgaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHRoaXMucHJvamVjdERpcik7XG4gICAgICBhd2FpdCBpbnZva2VTZXROcG1EaXN0Q29tbWFuZChsdHNUYWdGb3JQYXRjaCwgcHJldmlvdXNQYXRjaC52ZXJzaW9uKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5ldyBzdGFibGUgdmVyc2lvbiBvZiB0aGUgcmVsZWFzZSBjYW5kaWRhdGUgcmVsZWFzZS10cmFpbi4gKi9cbiAgcHJpdmF0ZSBfY29tcHV0ZU5ld1ZlcnNpb24oKTogc2VtdmVyLlNlbVZlciB7XG4gICAgY29uc3Qge3ZlcnNpb259ID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSE7XG4gICAgcmV0dXJuIHNlbXZlci5wYXJzZShgJHt2ZXJzaW9uLm1ham9yfS4ke3ZlcnNpb24ubWlub3J9LiR7dmVyc2lvbi5wYXRjaH1gKSE7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgLy8gQSBzdGFibGUgdmVyc2lvbiBjYW4gYmUgY3V0IGZvciBhbiBhY3RpdmUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlXG4gICAgLy8gcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuIE5vdGU6IEl0IGlzIG5vdCBwb3NzaWJsZSB0byBkaXJlY3RseSByZWxlYXNlIGZyb21cbiAgICAvLyBmZWF0dXJlLWZyZWV6ZSBwaGFzZSBpbnRvIGEgc3RhYmxlIHZlcnNpb24uXG4gICAgcmV0dXJuIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsICYmXG4gICAgICAgIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlLnZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ3JjJztcbiAgfVxufVxuIl19