/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { semverInc } from '../../../utils/semver';
import { ReleaseAction } from '../actions';
/**
 * Cuts the first release candidate for a release-train currently in the
 * feature-freeze phase. The version is bumped from `next` to `rc.0`.
 */
export class CutReleaseCandidateForFeatureFreezeAction extends ReleaseAction {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXJlbGVhc2UtY2FuZGlkYXRlLWZvci1mZWF0dXJlLWZyZWV6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtcmVsZWFzZS1jYW5kaWRhdGUtZm9yLWZlYXR1cmUtZnJlZXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFaEQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUV6Qzs7O0dBR0c7QUFDSCxNQUFNLE9BQU8seUNBQTBDLFNBQVEsYUFBYTtJQUE1RTs7UUFDVSxnQkFBVyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFpQixDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUF5QjdGLENBQUM7SUF2QmdCLGNBQWM7O1lBQzNCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDcEMsT0FBTyxpRUFBaUUsVUFBVSxJQUFJLENBQUM7UUFDekYsQ0FBQztLQUFBO0lBRWMsT0FBTzs7WUFDcEIsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWlCLENBQUM7WUFDbkQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUVwQyxNQUFNLEVBQUMsV0FBVyxFQUFFLFlBQVksRUFBQyxHQUM3QixNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFckUsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckQsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDN0QsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7S0FBQTtJQUVELE1BQU0sQ0FBZ0IsUUFBUSxDQUFDLE1BQTJCOztZQUN4RCx1RUFBdUU7WUFDdkUsK0JBQStCO1lBQy9CLE9BQU8sTUFBTSxDQUFDLGdCQUFnQixLQUFLLElBQUk7Z0JBQ25DLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQztRQUMvRCxDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvc2VtdmVyJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcblxuLyoqXG4gKiBDdXRzIHRoZSBmaXJzdCByZWxlYXNlIGNhbmRpZGF0ZSBmb3IgYSByZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGVcbiAqIGZlYXR1cmUtZnJlZXplIHBoYXNlLiBUaGUgdmVyc2lvbiBpcyBidW1wZWQgZnJvbSBgbmV4dGAgdG8gYHJjLjBgLlxuICovXG5leHBvcnQgY2xhc3MgQ3V0UmVsZWFzZUNhbmRpZGF0ZUZvckZlYXR1cmVGcmVlemVBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbiA9IHNlbXZlckluYyh0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlIS52ZXJzaW9uLCAncHJlcmVsZWFzZScsICdyYycpO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ3V0IGEgZmlyc3QgcmVsZWFzZS1jYW5kaWRhdGUgZm9yIHRoZSBmZWF0dXJlLWZyZWV6ZSBicmFuY2ggKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlITtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcblxuICAgIGNvbnN0IHtwdWxsUmVxdWVzdCwgcmVsZWFzZU5vdGVzfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbiwgYnJhbmNoTmFtZSk7XG5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQocHVsbFJlcXVlc3QpO1xuICAgIGF3YWl0IHRoaXMuYnVpbGRBbmRQdWJsaXNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSwgJ25leHQnKTtcbiAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUpO1xuICB9XG5cbiAgc3RhdGljIG92ZXJyaWRlIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIEEgcmVsZWFzZS1jYW5kaWRhdGUgY2FuIGJlIGN1dCBmb3IgYW4gYWN0aXZlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5XG4gICAgLy8gaW4gdGhlIGZlYXR1cmUtZnJlZXplIHBoYXNlLlxuICAgIHJldHVybiBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCAmJlxuICAgICAgICBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZS52ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICduZXh0JztcbiAgfVxufVxuIl19