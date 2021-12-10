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
        // When cutting a new stable minor/major, we want to build the release notes capturing
        // all changes that have landed in the individual next and RC pre-releases.
        const compareVersionForReleaseNotes = this.active.latest.version;
        const { pullRequest, releaseNotes } = await this.checkoutBranchAndStageVersion(newVersion, compareVersionForReleaseNotes, branchName);
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
            const ltsTagForPatch = (0, long_term_support_1.getLtsNpmDistTagOfMajor)(previousPatch.version.major);
            // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
            // setting the NPM dist tag to the specified version. We do this because release NPM
            // packages could be different in the previous patch branch, and we want to set the
            // LTS tag for all packages part of the last major. It would not be possible to set the
            // NPM dist tag for new packages part of the released major, nor would it be acceptable
            // to skip the LTS tag for packages which are no longer part of the new major.
            await this.checkoutUpstreamBranch(previousPatch.branchName);
            await this.installDependenciesForCurrentBranch();
            await (0, external_commands_1.invokeSetNpmDistCommand)(this.projectDir, ltsTagForPatch, previousPatch.version);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtc3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlDQUFpQztBQUdqQywwRUFBMkU7QUFDM0Usd0NBQXlDO0FBQ3pDLDREQUF1RjtBQUV2Rjs7O0dBR0c7QUFDSCxNQUFhLGVBQWdCLFNBQVEsdUJBQWE7SUFBbEQ7O1FBQ1UsZ0JBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQXVFbEQsQ0FBQztJQXJFVSxLQUFLLENBQUMsY0FBYztRQUMzQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLE9BQU8sMkRBQTJELFVBQVUsSUFBSSxDQUFDO0lBQ25GLENBQUM7SUFFUSxLQUFLLENBQUMsT0FBTztRQUNwQixNQUFNLEVBQUMsVUFBVSxFQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsQ0FBQztRQUNuRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDO1FBRXpELHNGQUFzRjtRQUN0RiwyRUFBMkU7UUFDM0UsTUFBTSw2QkFBNkIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFFakUsTUFBTSxFQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FDMUUsVUFBVSxFQUNWLDZCQUE2QixFQUM3QixVQUFVLENBQ1gsQ0FBQztRQUVGLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXJELDBGQUEwRjtRQUMxRix5RkFBeUY7UUFDekYsMEZBQTBGO1FBQzFGLHlGQUF5RjtRQUN6Rix5RkFBeUY7UUFDekYsNEZBQTRGO1FBQzVGLDJGQUEyRjtRQUMzRiwrRkFBK0Y7UUFDL0Ysd0ZBQXdGO1FBQ3hGLG9GQUFvRjtRQUNwRixNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFckYsc0ZBQXNGO1FBQ3RGLHlGQUF5RjtRQUN6RixJQUFJLFVBQVUsRUFBRTtZQUNkLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ3pDLE1BQU0sY0FBYyxHQUFHLElBQUEsMkNBQXVCLEVBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU1RSxrRkFBa0Y7WUFDbEYsb0ZBQW9GO1lBQ3BGLG1GQUFtRjtZQUNuRix1RkFBdUY7WUFDdkYsdUZBQXVGO1lBQ3ZGLDhFQUE4RTtZQUM5RSxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUQsTUFBTSxJQUFJLENBQUMsbUNBQW1DLEVBQUUsQ0FBQztZQUVqRCxNQUFNLElBQUEsMkNBQXVCLEVBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZGO1FBRUQsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRCwwRUFBMEU7SUFDbEUsa0JBQWtCO1FBQ3hCLE1BQU0sRUFBQyxPQUFPLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFpQixDQUFDO1FBQ2hELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUUsQ0FBQztJQUM3RSxDQUFDO0lBRUQsTUFBTSxDQUFVLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBMkI7UUFDeEQsMkVBQTJFO1FBQzNFLDZFQUE2RTtRQUM3RSw4Q0FBOEM7UUFDOUMsT0FBTyxDQUNMLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUMzRixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBeEVELDBDQXdFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2dldEx0c05wbURpc3RUYWdPZk1ham9yfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2xvbmctdGVybS1zdXBwb3J0JztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQge2ludm9rZVNldE5wbURpc3RDb21tYW5kLCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmR9IGZyb20gJy4uL2V4dGVybmFsLWNvbW1hbmRzJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGN1dHMgYSBzdGFibGUgdmVyc2lvbiBmb3IgdGhlIGN1cnJlbnQgcmVsZWFzZS10cmFpbiBpbiB0aGUgcmVsZWFzZVxuICogY2FuZGlkYXRlIHBoYXNlLiBUaGUgcHJlLXJlbGVhc2UgcmVsZWFzZS1jYW5kaWRhdGUgdmVyc2lvbiBsYWJlbCBpcyByZW1vdmVkLlxuICovXG5leHBvcnQgY2xhc3MgQ3V0U3RhYmxlQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSB0aGlzLl9jb21wdXRlTmV3VmVyc2lvbigpO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ3V0IGEgc3RhYmxlIHJlbGVhc2UgZm9yIHRoZSByZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlITtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcbiAgICBjb25zdCBpc05ld01ham9yID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZT8uaXNNYWpvcjtcblxuICAgIC8vIFdoZW4gY3V0dGluZyBhIG5ldyBzdGFibGUgbWlub3IvbWFqb3IsIHdlIHdhbnQgdG8gYnVpbGQgdGhlIHJlbGVhc2Ugbm90ZXMgY2FwdHVyaW5nXG4gICAgLy8gYWxsIGNoYW5nZXMgdGhhdCBoYXZlIGxhbmRlZCBpbiB0aGUgaW5kaXZpZHVhbCBuZXh0IGFuZCBSQyBwcmUtcmVsZWFzZXMuXG4gICAgY29uc3QgY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMgPSB0aGlzLmFjdGl2ZS5sYXRlc3QudmVyc2lvbjtcblxuICAgIGNvbnN0IHtwdWxsUmVxdWVzdCwgcmVsZWFzZU5vdGVzfSA9IGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24oXG4gICAgICBuZXdWZXJzaW9uLFxuICAgICAgY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMsXG4gICAgICBicmFuY2hOYW1lLFxuICAgICk7XG5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQocHVsbFJlcXVlc3QpO1xuXG4gICAgLy8gSWYgYSBuZXcgbWFqb3IgdmVyc2lvbiBpcyBwdWJsaXNoZWQsIHdlIHB1Ymxpc2ggdG8gdGhlIGBuZXh0YCBOUE0gZGlzdCB0YWcgdGVtcG9yYXJpbHkuXG4gICAgLy8gV2UgZG8gdGhpcyBiZWNhdXNlIGZvciBtYWpvciB2ZXJzaW9ucywgd2Ugd2FudCBhbGwgbWFpbiBBbmd1bGFyIHByb2plY3RzIHRvIGhhdmUgdGhlaXJcbiAgICAvLyBuZXcgbWFqb3IgYmVjb21lIGF2YWlsYWJsZSBhdCB0aGUgc2FtZSB0aW1lLiBQdWJsaXNoaW5nIGltbWVkaWF0ZWx5IHRvIHRoZSBgbGF0ZXN0YCBOUE1cbiAgICAvLyBkaXN0IHRhZyBjb3VsZCBjYXVzZSBpbmNvbnNpc3RlbnQgdmVyc2lvbnMgd2hlbiB1c2VycyBpbnN0YWxsIHBhY2thZ2VzIHdpdGggYEBsYXRlc3RgLlxuICAgIC8vIEZvciBleGFtcGxlOiBDb25zaWRlciBBbmd1bGFyIEZyYW1ld29yayByZWxlYXNlcyB2MTIuIENMSSBhbmQgQ29tcG9uZW50cyB3b3VsZCBuZWVkIHRvXG4gICAgLy8gd2FpdCBmb3IgdGhhdCByZWxlYXNlIHRvIGNvbXBsZXRlLiBPbmNlIGRvbmUsIHRoZXkgY2FuIHVwZGF0ZSB0aGVpciBkZXBlbmRlbmNpZXMgdG8gcG9pbnRcbiAgICAvLyB0byB2MTIuIEFmdGVyd2FyZHMgdGhleSBjb3VsZCBzdGFydCB0aGUgcmVsZWFzZSBwcm9jZXNzLiBJbiB0aGUgbWVhbndoaWxlIHRob3VnaCwgdGhlIEZXXG4gICAgLy8gZGVwZW5kZW5jaWVzIHdlcmUgYWxyZWFkeSBhdmFpbGFibGUgYXMgYEBsYXRlc3RgLCBzbyB1c2VycyBjb3VsZCBlbmQgdXAgaW5zdGFsbGluZyB2MTIgd2hpbGVcbiAgICAvLyBzdGlsbCBoYXZpbmcgdGhlIG9sZGVyIChidXQgY3VycmVudGx5IHN0aWxsIGxhdGVzdCkgQ0xJIHZlcnNpb24gdGhhdCBpcyBpbmNvbXBhdGlibGUuXG4gICAgLy8gVGhlIG1ham9yIHJlbGVhc2UgY2FuIGJlIHJlLXRhZ2dlZCB0byBgbGF0ZXN0YCB0aHJvdWdoIGEgc2VwYXJhdGUgcmVsZWFzZSBhY3Rpb24uXG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBicmFuY2hOYW1lLCBpc05ld01ham9yID8gJ25leHQnIDogJ2xhdGVzdCcpO1xuXG4gICAgLy8gSWYgYSBuZXcgbWFqb3IgdmVyc2lvbiBpcyBwdWJsaXNoZWQgYW5kIGJlY29tZXMgdGhlIFwibGF0ZXN0XCIgcmVsZWFzZS10cmFpbiwgd2UgbmVlZFxuICAgIC8vIHRvIHNldCB0aGUgTFRTIG5wbSBkaXN0IHRhZyBmb3IgdGhlIHByZXZpb3VzIGxhdGVzdCByZWxlYXNlLXRyYWluICh0aGUgY3VycmVudCBwYXRjaCkuXG4gICAgaWYgKGlzTmV3TWFqb3IpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGF0Y2ggPSB0aGlzLmFjdGl2ZS5sYXRlc3Q7XG4gICAgICBjb25zdCBsdHNUYWdGb3JQYXRjaCA9IGdldEx0c05wbURpc3RUYWdPZk1ham9yKHByZXZpb3VzUGF0Y2gudmVyc2lvbi5tYWpvcik7XG5cbiAgICAgIC8vIEluc3RlYWQgb2YgZGlyZWN0bHkgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFncywgd2UgaW52b2tlIHRoZSBuZy1kZXYgY29tbWFuZCBmb3JcbiAgICAgIC8vIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyB0byB0aGUgc3BlY2lmaWVkIHZlcnNpb24uIFdlIGRvIHRoaXMgYmVjYXVzZSByZWxlYXNlIE5QTVxuICAgICAgLy8gcGFja2FnZXMgY291bGQgYmUgZGlmZmVyZW50IGluIHRoZSBwcmV2aW91cyBwYXRjaCBicmFuY2gsIGFuZCB3ZSB3YW50IHRvIHNldCB0aGVcbiAgICAgIC8vIExUUyB0YWcgZm9yIGFsbCBwYWNrYWdlcyBwYXJ0IG9mIHRoZSBsYXN0IG1ham9yLiBJdCB3b3VsZCBub3QgYmUgcG9zc2libGUgdG8gc2V0IHRoZVxuICAgICAgLy8gTlBNIGRpc3QgdGFnIGZvciBuZXcgcGFja2FnZXMgcGFydCBvZiB0aGUgcmVsZWFzZWQgbWFqb3IsIG5vciB3b3VsZCBpdCBiZSBhY2NlcHRhYmxlXG4gICAgICAvLyB0byBza2lwIHRoZSBMVFMgdGFnIGZvciBwYWNrYWdlcyB3aGljaCBhcmUgbm8gbG9uZ2VyIHBhcnQgb2YgdGhlIG5ldyBtYWpvci5cbiAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChwcmV2aW91c1BhdGNoLmJyYW5jaE5hbWUpO1xuICAgICAgYXdhaXQgdGhpcy5pbnN0YWxsRGVwZW5kZW5jaWVzRm9yQ3VycmVudEJyYW5jaCgpO1xuXG4gICAgICBhd2FpdCBpbnZva2VTZXROcG1EaXN0Q29tbWFuZCh0aGlzLnByb2plY3REaXIsIGx0c1RhZ0ZvclBhdGNoLCBwcmV2aW91c1BhdGNoLnZlcnNpb24pO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbmV3IHN0YWJsZSB2ZXJzaW9uIG9mIHRoZSByZWxlYXNlIGNhbmRpZGF0ZSByZWxlYXNlLXRyYWluLiAqL1xuICBwcml2YXRlIF9jb21wdXRlTmV3VmVyc2lvbigpOiBzZW12ZXIuU2VtVmVyIHtcbiAgICBjb25zdCB7dmVyc2lvbn0gPSB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlITtcbiAgICByZXR1cm4gc2VtdmVyLnBhcnNlKGAke3ZlcnNpb24ubWFqb3J9LiR7dmVyc2lvbi5taW5vcn0uJHt2ZXJzaW9uLnBhdGNofWApITtcbiAgfVxuXG4gIHN0YXRpYyBvdmVycmlkZSBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBBIHN0YWJsZSB2ZXJzaW9uIGNhbiBiZSBjdXQgZm9yIGFuIGFjdGl2ZSByZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGVcbiAgICAvLyByZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gTm90ZTogSXQgaXMgbm90IHBvc3NpYmxlIHRvIGRpcmVjdGx5IHJlbGVhc2UgZnJvbVxuICAgIC8vIGZlYXR1cmUtZnJlZXplIHBoYXNlIGludG8gYSBzdGFibGUgdmVyc2lvbi5cbiAgICByZXR1cm4gKFxuICAgICAgYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwgJiYgYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUudmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAncmMnXG4gICAgKTtcbiAgfVxufVxuIl19