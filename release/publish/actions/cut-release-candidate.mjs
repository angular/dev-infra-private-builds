/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { semverInc } from '../../versioning/inc-semver';
import { ReleaseAction } from '../actions';
/**
 * Cuts the first release candidate for a release-train currently in the
 * feature-freeze phase. The version is bumped from `next` to `rc.0`.
 */
export class CutReleaseCandidateAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = semverInc(this.active.releaseCandidate.version, 'prerelease', 'rc');
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            const newVersion = this._newVersion;
            return `Cut a first release-candidate for the feature-freeze branch (v${newVersion}).`;
        });
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.releaseCandidate;
            const newVersion = this._newVersion;
            const { pullRequest, releaseNotes } = yield this.checkoutBranchAndStageVersion(newVersion, branchName);
            yield this.waitForPullRequestToBeMerged(pullRequest);
            yield this.buildAndPublish(releaseNotes, branchName, 'next');
            yield this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
        });
    }
    static isActive(active) {
        return __awaiter(this, void 0, void 0, function* () {
            // A release-candidate can be cut for an active release-train currently
            // in the feature-freeze phase.
            return active.releaseCandidate !== null &&
                active.releaseCandidate.version.prerelease[0] === 'next';
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXJlbGVhc2UtY2FuZGlkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9hY3Rpb25zL2N1dC1yZWxlYXNlLWNhbmRpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBR0gsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQ3RELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFekM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLHlCQUEwQixTQUFRLGFBQWE7SUFBNUQ7O1FBQ1UsZ0JBQVcsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBeUI3RixDQUFDO0lBdkJnQixjQUFjOztZQUMzQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3BDLE9BQU8saUVBQWlFLFVBQVUsSUFBSSxDQUFDO1FBQ3pGLENBQUM7S0FBQTtJQUVjLE9BQU87O1lBQ3BCLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFpQixDQUFDO1lBQ25ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFFcEMsTUFBTSxFQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUMsR0FDN0IsTUFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXJFLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzdELE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN6RSxDQUFDO0tBQUE7SUFFRCxNQUFNLENBQWdCLFFBQVEsQ0FBQyxNQUEyQjs7WUFDeEQsdUVBQXVFO1lBQ3ZFLCtCQUErQjtZQUMvQixPQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJO2dCQUNuQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUM7UUFDL0QsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9pbmMtc2VtdmVyJztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbi8qKlxuICogQ3V0cyB0aGUgZmlyc3QgcmVsZWFzZSBjYW5kaWRhdGUgZm9yIGEgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlXG4gKiBmZWF0dXJlLWZyZWV6ZSBwaGFzZS4gVGhlIHZlcnNpb24gaXMgYnVtcGVkIGZyb20gYG5leHRgIHRvIGByYy4wYC5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dFJlbGVhc2VDYW5kaWRhdGVBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbiA9IHNlbXZlckluYyh0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlIS52ZXJzaW9uLCAncHJlcmVsZWFzZScsICdyYycpO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ3V0IGEgZmlyc3QgcmVsZWFzZS1jYW5kaWRhdGUgZm9yIHRoZSBmZWF0dXJlLWZyZWV6ZSBicmFuY2ggKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlITtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcblxuICAgIGNvbnN0IHtwdWxsUmVxdWVzdCwgcmVsZWFzZU5vdGVzfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbiwgYnJhbmNoTmFtZSk7XG5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQocHVsbFJlcXVlc3QpO1xuICAgIGF3YWl0IHRoaXMuYnVpbGRBbmRQdWJsaXNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSwgJ25leHQnKTtcbiAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUpO1xuICB9XG5cbiAgc3RhdGljIG92ZXJyaWRlIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIEEgcmVsZWFzZS1jYW5kaWRhdGUgY2FuIGJlIGN1dCBmb3IgYW4gYWN0aXZlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5XG4gICAgLy8gaW4gdGhlIGZlYXR1cmUtZnJlZXplIHBoYXNlLlxuICAgIHJldHVybiBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCAmJlxuICAgICAgICBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZS52ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICduZXh0JztcbiAgfVxufVxuIl19