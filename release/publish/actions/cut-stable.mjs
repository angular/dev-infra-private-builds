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
            yield this.buildAndPublish(releaseNotes, branchName, 'latest');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtc3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUdqQyxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUMzRSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSx3QkFBd0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBRXZGOzs7R0FHRztBQUNILE1BQU0sT0FBTyxlQUFnQixTQUFRLGFBQWE7SUFBbEQ7O1FBQ1UsZ0JBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQW9EbEQsQ0FBQztJQWxETyxjQUFjOztZQUNsQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3BDLE9BQU8sMkRBQTJELFVBQVUsSUFBSSxDQUFDO1FBQ25GLENBQUM7S0FBQTtJQUVLLE9BQU87OztZQUNYLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFpQixDQUFDO1lBQ25ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDcEMsTUFBTSxVQUFVLEdBQUcsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQiwwQ0FBRSxPQUFPLENBQUM7WUFHekQsTUFBTSxFQUFDLFdBQVcsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLFlBQVksRUFBQyxHQUNuQyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFckUsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFL0Qsc0ZBQXNGO1lBQ3RGLHlGQUF5RjtZQUN6RixJQUFJLFVBQVUsRUFBRTtnQkFDZCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDekMsTUFBTSxjQUFjLEdBQUcsdUJBQXVCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFNUUsa0ZBQWtGO2dCQUNsRixvRkFBb0Y7Z0JBQ3BGLG1GQUFtRjtnQkFDbkYsdUZBQXVGO2dCQUN2Rix1RkFBdUY7Z0JBQ3ZGLDhFQUE4RTtnQkFDOUUsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM1RCxNQUFNLHdCQUF3QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDaEQsTUFBTSx1QkFBdUIsQ0FBQyxjQUFjLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3RFO1lBRUQsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDOztLQUN4RTtJQUVELDBFQUEwRTtJQUNsRSxrQkFBa0I7UUFDeEIsTUFBTSxFQUFDLE9BQU8sRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWlCLENBQUM7UUFDaEQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBRSxDQUFDO0lBQzdFLENBQUM7SUFFRCxNQUFNLENBQU8sUUFBUSxDQUFDLE1BQTJCOztZQUMvQywyRUFBMkU7WUFDM0UsNkVBQTZFO1lBQzdFLDhDQUE4QztZQUM5QyxPQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJO2dCQUNuQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7UUFDN0QsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvcn0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9sb25nLXRlcm0tc3VwcG9ydCc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtpbnZva2VTZXROcG1EaXN0Q29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuLi9leHRlcm5hbC1jb21tYW5kcyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgc3RhYmxlIHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IHJlbGVhc2UtdHJhaW4gaW4gdGhlIHJlbGVhc2VcbiAqIGNhbmRpZGF0ZSBwaGFzZS4gVGhlIHByZS1yZWxlYXNlIHJlbGVhc2UtY2FuZGlkYXRlIHZlcnNpb24gbGFiZWwgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dFN0YWJsZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBwcml2YXRlIF9uZXdWZXJzaW9uID0gdGhpcy5fY29tcHV0ZU5ld1ZlcnNpb24oKTtcblxuICBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYEN1dCBhIHN0YWJsZSByZWxlYXNlIGZvciB0aGUgcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSE7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgY29uc3QgaXNOZXdNYWpvciA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGU/LmlzTWFqb3I7XG5cblxuICAgIGNvbnN0IHtwdWxsUmVxdWVzdDoge2lkfSwgcmVsZWFzZU5vdGVzfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbiwgYnJhbmNoTmFtZSk7XG5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQpO1xuICAgIGF3YWl0IHRoaXMuYnVpbGRBbmRQdWJsaXNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSwgJ2xhdGVzdCcpO1xuXG4gICAgLy8gSWYgYSBuZXcgbWFqb3IgdmVyc2lvbiBpcyBwdWJsaXNoZWQgYW5kIGJlY29tZXMgdGhlIFwibGF0ZXN0XCIgcmVsZWFzZS10cmFpbiwgd2UgbmVlZFxuICAgIC8vIHRvIHNldCB0aGUgTFRTIG5wbSBkaXN0IHRhZyBmb3IgdGhlIHByZXZpb3VzIGxhdGVzdCByZWxlYXNlLXRyYWluICh0aGUgY3VycmVudCBwYXRjaCkuXG4gICAgaWYgKGlzTmV3TWFqb3IpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzUGF0Y2ggPSB0aGlzLmFjdGl2ZS5sYXRlc3Q7XG4gICAgICBjb25zdCBsdHNUYWdGb3JQYXRjaCA9IGdldEx0c05wbURpc3RUYWdPZk1ham9yKHByZXZpb3VzUGF0Y2gudmVyc2lvbi5tYWpvcik7XG5cbiAgICAgIC8vIEluc3RlYWQgb2YgZGlyZWN0bHkgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFncywgd2UgaW52b2tlIHRoZSBuZy1kZXYgY29tbWFuZCBmb3JcbiAgICAgIC8vIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyB0byB0aGUgc3BlY2lmaWVkIHZlcnNpb24uIFdlIGRvIHRoaXMgYmVjYXVzZSByZWxlYXNlIE5QTVxuICAgICAgLy8gcGFja2FnZXMgY291bGQgYmUgZGlmZmVyZW50IGluIHRoZSBwcmV2aW91cyBwYXRjaCBicmFuY2gsIGFuZCB3ZSB3YW50IHRvIHNldCB0aGVcbiAgICAgIC8vIExUUyB0YWcgZm9yIGFsbCBwYWNrYWdlcyBwYXJ0IG9mIHRoZSBsYXN0IG1ham9yLiBJdCB3b3VsZCBub3QgYmUgcG9zc2libGUgdG8gc2V0IHRoZVxuICAgICAgLy8gTlBNIGRpc3QgdGFnIGZvciBuZXcgcGFja2FnZXMgcGFydCBvZiB0aGUgcmVsZWFzZWQgbWFqb3IsIG5vciB3b3VsZCBpdCBiZSBhY2NlcHRhYmxlXG4gICAgICAvLyB0byBza2lwIHRoZSBMVFMgdGFnIGZvciBwYWNrYWdlcyB3aGljaCBhcmUgbm8gbG9uZ2VyIHBhcnQgb2YgdGhlIG5ldyBtYWpvci5cbiAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChwcmV2aW91c1BhdGNoLmJyYW5jaE5hbWUpO1xuICAgICAgYXdhaXQgaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHRoaXMucHJvamVjdERpcik7XG4gICAgICBhd2FpdCBpbnZva2VTZXROcG1EaXN0Q29tbWFuZChsdHNUYWdGb3JQYXRjaCwgcHJldmlvdXNQYXRjaC52ZXJzaW9uKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5ldyBzdGFibGUgdmVyc2lvbiBvZiB0aGUgcmVsZWFzZSBjYW5kaWRhdGUgcmVsZWFzZS10cmFpbi4gKi9cbiAgcHJpdmF0ZSBfY29tcHV0ZU5ld1ZlcnNpb24oKTogc2VtdmVyLlNlbVZlciB7XG4gICAgY29uc3Qge3ZlcnNpb259ID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSE7XG4gICAgcmV0dXJuIHNlbXZlci5wYXJzZShgJHt2ZXJzaW9uLm1ham9yfS4ke3ZlcnNpb24ubWlub3J9LiR7dmVyc2lvbi5wYXRjaH1gKSE7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgLy8gQSBzdGFibGUgdmVyc2lvbiBjYW4gYmUgY3V0IGZvciBhbiBhY3RpdmUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlXG4gICAgLy8gcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuIE5vdGU6IEl0IGlzIG5vdCBwb3NzaWJsZSB0byBkaXJlY3RseSByZWxlYXNlIGZyb21cbiAgICAvLyBmZWF0dXJlLWZyZWV6ZSBwaGFzZSBpbnRvIGEgc3RhYmxlIHZlcnNpb24uXG4gICAgcmV0dXJuIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsICYmXG4gICAgICAgIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlLnZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ3JjJztcbiAgfVxufVxuIl19