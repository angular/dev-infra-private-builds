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
 * Release action that cuts a new patch release for the current latest release-train version
 * branch (i.e. the patch branch). The patch segment is incremented. The changelog is generated
 * for the new patch version, but also needs to be cherry-picked into the next development branch.
 */
export class CutNewPatchAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = semverInc(this.active.latest.version, 'patch');
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.latest;
            const newVersion = this._newVersion;
            return `Cut a new patch release for the "${branchName}" branch (v${newVersion}).`;
        });
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.latest;
            const newVersion = this._newVersion;
            const { pullRequest: { id }, releaseNotes } = yield this.checkoutBranchAndStageVersion(newVersion, branchName);
            yield this.waitForPullRequestToBeMerged(id);
            yield this.buildAndPublish(releaseNotes, branchName, 'latest');
            yield this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
        });
    }
    static isActive(active) {
        return __awaiter(this, void 0, void 0, function* () {
            // Patch versions can be cut at any time. See:
            // https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A#Release-prompt-options.
            return true;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LW5ldy1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbmV3LXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdEQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUV6Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGFBQWE7SUFBcEQ7O1FBQ1UsZ0JBQVcsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBeUJ2RSxDQUFDO0lBdkJPLGNBQWM7O1lBQ2xCLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3BDLE9BQU8sb0NBQW9DLFVBQVUsY0FBYyxVQUFVLElBQUksQ0FBQztRQUNwRixDQUFDO0tBQUE7SUFFSyxPQUFPOztZQUNYLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN4QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBRXBDLE1BQU0sRUFBQyxXQUFXLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxZQUFZLEVBQUMsR0FDbkMsTUFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXJFLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN6RSxDQUFDO0tBQUE7SUFFRCxNQUFNLENBQU8sUUFBUSxDQUFDLE1BQTJCOztZQUMvQyw4Q0FBOEM7WUFDOUMsbUVBQW1FO1lBQ25FLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9pbmMtc2VtdmVyJztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgbmV3IHBhdGNoIHJlbGVhc2UgZm9yIHRoZSBjdXJyZW50IGxhdGVzdCByZWxlYXNlLXRyYWluIHZlcnNpb25cbiAqIGJyYW5jaCAoaS5lLiB0aGUgcGF0Y2ggYnJhbmNoKS4gVGhlIHBhdGNoIHNlZ21lbnQgaXMgaW5jcmVtZW50ZWQuIFRoZSBjaGFuZ2Vsb2cgaXMgZ2VuZXJhdGVkXG4gKiBmb3IgdGhlIG5ldyBwYXRjaCB2ZXJzaW9uLCBidXQgYWxzbyBuZWVkcyB0byBiZSBjaGVycnktcGlja2VkIGludG8gdGhlIG5leHQgZGV2ZWxvcG1lbnQgYnJhbmNoLlxuICovXG5leHBvcnQgY2xhc3MgQ3V0TmV3UGF0Y2hBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbiA9IHNlbXZlckluYyh0aGlzLmFjdGl2ZS5sYXRlc3QudmVyc2lvbiwgJ3BhdGNoJyk7XG5cbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUubGF0ZXN0O1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ3V0IGEgbmV3IHBhdGNoIHJlbGVhc2UgZm9yIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5sYXRlc3Q7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3Q6IHtpZH0sIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUsICdsYXRlc3QnKTtcbiAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUpO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIFBhdGNoIHZlcnNpb25zIGNhbiBiZSBjdXQgYXQgYW55IHRpbWUuIFNlZTpcbiAgICAvLyBodHRwczovL2hhY2ttZC5pby8yTGU4bGVxMFM2R19SNVZFVlROSzlBI1JlbGVhc2UtcHJvbXB0LW9wdGlvbnMuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==