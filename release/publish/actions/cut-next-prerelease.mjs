/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { semverInc } from '../../versioning/inc-semver';
import { computeNewPrereleaseVersionForNext } from '../../versioning/next-prerelease-version';
import { ReleaseAction } from '../actions';
/**
 * Release action that cuts a prerelease for the next branch. A version in the next
 * branch can have an arbitrary amount of next pre-releases.
 */
export class CutNextPrereleaseAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        /** Promise resolving with the new version if a NPM next pre-release is cut. */
        this._newVersion = this._computeNewVersion();
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName } = this._getActivePrereleaseTrain();
            const newVersion = yield this._newVersion;
            return `Cut a new next pre-release for the "${branchName}" branch (v${newVersion}).`;
        });
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const releaseTrain = this._getActivePrereleaseTrain();
            const { branchName } = releaseTrain;
            const newVersion = yield this._newVersion;
            const { pullRequest, releaseNotes } = yield this.checkoutBranchAndStageVersion(newVersion, branchName);
            yield this.waitForPullRequestToBeMerged(pullRequest);
            yield this.buildAndPublish(releaseNotes, branchName, 'next');
            // If the pre-release has been cut from a branch that is not corresponding
            // to the next release-train, cherry-pick the changelog into the primary
            // development branch. i.e. the `next` branch that is usually `master`.
            if (releaseTrain !== this.active.next) {
                yield this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
            }
        });
    }
    /** Gets the release train for which NPM next pre-releases should be cut. */
    _getActivePrereleaseTrain() {
        var _a;
        return (_a = this.active.releaseCandidate) !== null && _a !== void 0 ? _a : this.active.next;
    }
    /** Gets the new pre-release version for this release action. */
    _computeNewVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const releaseTrain = this._getActivePrereleaseTrain();
            // If a pre-release is cut for the next release-train, the new version is computed
            // with respect to special cases surfacing with FF/RC branches. Otherwise, the basic
            // pre-release increment of the version is used as new version.
            if (releaseTrain === this.active.next) {
                return yield computeNewPrereleaseVersionForNext(this.active, this.config);
            }
            else {
                return semverInc(releaseTrain.version, 'prerelease');
            }
        });
    }
    static isActive() {
        return __awaiter(this, void 0, void 0, function* () {
            // Pre-releases for the `next` NPM dist tag can always be cut. Depending on whether
            // there is a feature-freeze/release-candidate branch, the next pre-releases are either
            // cut from such a branch, or from the actual `next` release-train branch (i.e. master).
            return true;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LW5leHQtcHJlcmVsZWFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbmV4dC1wcmVyZWxlYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFJSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdEQsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFFNUYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUV6Qzs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsYUFBYTtJQUExRDs7UUFDRSwrRUFBK0U7UUFDdkUsZ0JBQVcsR0FBMkIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFtRDFFLENBQUM7SUFqRGdCLGNBQWM7O1lBQzNCLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUN0RCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDMUMsT0FBTyx1Q0FBdUMsVUFBVSxjQUFjLFVBQVUsSUFBSSxDQUFDO1FBQ3ZGLENBQUM7S0FBQTtJQUVjLE9BQU87O1lBQ3BCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ3RELE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxZQUFZLENBQUM7WUFDbEMsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDO1lBRTFDLE1BQU0sRUFBQyxXQUFXLEVBQUUsWUFBWSxFQUFDLEdBQzdCLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVyRSxNQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyRCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUU3RCwwRUFBMEU7WUFDMUUsd0VBQXdFO1lBQ3hFLHVFQUF1RTtZQUN2RSxJQUFJLFlBQVksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDckMsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ3hFO1FBQ0gsQ0FBQztLQUFBO0lBRUQsNEVBQTRFO0lBQ3BFLHlCQUF5Qjs7UUFDL0IsT0FBTyxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLG1DQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQzFELENBQUM7SUFFRCxnRUFBZ0U7SUFDbEQsa0JBQWtCOztZQUM5QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUN0RCxrRkFBa0Y7WUFDbEYsb0ZBQW9GO1lBQ3BGLCtEQUErRDtZQUMvRCxJQUFJLFlBQVksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDckMsT0FBTyxNQUFNLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzNFO2lCQUFNO2dCQUNMLE9BQU8sU0FBUyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDdEQ7UUFDSCxDQUFDO0tBQUE7SUFFRCxNQUFNLENBQWdCLFFBQVE7O1lBQzVCLG1GQUFtRjtZQUNuRix1RkFBdUY7WUFDdkYsd0ZBQXdGO1lBQ3hGLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7c2VtdmVySW5jfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2luYy1zZW12ZXInO1xuaW1wb3J0IHtjb21wdXRlTmV3UHJlcmVsZWFzZVZlcnNpb25Gb3JOZXh0fSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL25leHQtcHJlcmVsZWFzZS12ZXJzaW9uJztcbmltcG9ydCB7UmVsZWFzZVRyYWlufSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL3JlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgcHJlcmVsZWFzZSBmb3IgdGhlIG5leHQgYnJhbmNoLiBBIHZlcnNpb24gaW4gdGhlIG5leHRcbiAqIGJyYW5jaCBjYW4gaGF2ZSBhbiBhcmJpdHJhcnkgYW1vdW50IG9mIG5leHQgcHJlLXJlbGVhc2VzLlxuICovXG5leHBvcnQgY2xhc3MgQ3V0TmV4dFByZXJlbGVhc2VBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgLyoqIFByb21pc2UgcmVzb2x2aW5nIHdpdGggdGhlIG5ldyB2ZXJzaW9uIGlmIGEgTlBNIG5leHQgcHJlLXJlbGVhc2UgaXMgY3V0LiAqL1xuICBwcml2YXRlIF9uZXdWZXJzaW9uOiBQcm9taXNlPHNlbXZlci5TZW1WZXI+ID0gdGhpcy5fY29tcHV0ZU5ld1ZlcnNpb24oKTtcblxuICBvdmVycmlkZSBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLl9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gYXdhaXQgdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYEN1dCBhIG5ldyBuZXh0IHByZS1yZWxlYXNlIGZvciB0aGUgXCIke2JyYW5jaE5hbWV9XCIgYnJhbmNoICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3QgcmVsZWFzZVRyYWluID0gdGhpcy5fZ2V0QWN0aXZlUHJlcmVsZWFzZVRyYWluKCk7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gcmVsZWFzZVRyYWluO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBhd2FpdCB0aGlzLl9uZXdWZXJzaW9uO1xuXG4gICAgY29uc3Qge3B1bGxSZXF1ZXN0LCByZWxlYXNlTm90ZXN9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5jaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihuZXdWZXJzaW9uLCBicmFuY2hOYW1lKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBicmFuY2hOYW1lLCAnbmV4dCcpO1xuXG4gICAgLy8gSWYgdGhlIHByZS1yZWxlYXNlIGhhcyBiZWVuIGN1dCBmcm9tIGEgYnJhbmNoIHRoYXQgaXMgbm90IGNvcnJlc3BvbmRpbmdcbiAgICAvLyB0byB0aGUgbmV4dCByZWxlYXNlLXRyYWluLCBjaGVycnktcGljayB0aGUgY2hhbmdlbG9nIGludG8gdGhlIHByaW1hcnlcbiAgICAvLyBkZXZlbG9wbWVudCBicmFuY2guIGkuZS4gdGhlIGBuZXh0YCBicmFuY2ggdGhhdCBpcyB1c3VhbGx5IGBtYXN0ZXJgLlxuICAgIGlmIChyZWxlYXNlVHJhaW4gIT09IHRoaXMuYWN0aXZlLm5leHQpIHtcbiAgICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIHJlbGVhc2UgdHJhaW4gZm9yIHdoaWNoIE5QTSBuZXh0IHByZS1yZWxlYXNlcyBzaG91bGQgYmUgY3V0LiAqL1xuICBwcml2YXRlIF9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTogUmVsZWFzZVRyYWluIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSA/PyB0aGlzLmFjdGl2ZS5uZXh0O1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5ldyBwcmUtcmVsZWFzZSB2ZXJzaW9uIGZvciB0aGlzIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF9jb21wdXRlTmV3VmVyc2lvbigpOiBQcm9taXNlPHNlbXZlci5TZW1WZXI+IHtcbiAgICBjb25zdCByZWxlYXNlVHJhaW4gPSB0aGlzLl9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTtcbiAgICAvLyBJZiBhIHByZS1yZWxlYXNlIGlzIGN1dCBmb3IgdGhlIG5leHQgcmVsZWFzZS10cmFpbiwgdGhlIG5ldyB2ZXJzaW9uIGlzIGNvbXB1dGVkXG4gICAgLy8gd2l0aCByZXNwZWN0IHRvIHNwZWNpYWwgY2FzZXMgc3VyZmFjaW5nIHdpdGggRkYvUkMgYnJhbmNoZXMuIE90aGVyd2lzZSwgdGhlIGJhc2ljXG4gICAgLy8gcHJlLXJlbGVhc2UgaW5jcmVtZW50IG9mIHRoZSB2ZXJzaW9uIGlzIHVzZWQgYXMgbmV3IHZlcnNpb24uXG4gICAgaWYgKHJlbGVhc2VUcmFpbiA9PT0gdGhpcy5hY3RpdmUubmV4dCkge1xuICAgICAgcmV0dXJuIGF3YWl0IGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQodGhpcy5hY3RpdmUsIHRoaXMuY29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNlbXZlckluYyhyZWxlYXNlVHJhaW4udmVyc2lvbiwgJ3ByZXJlbGVhc2UnKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgb3ZlcnJpZGUgYXN5bmMgaXNBY3RpdmUoKSB7XG4gICAgLy8gUHJlLXJlbGVhc2VzIGZvciB0aGUgYG5leHRgIE5QTSBkaXN0IHRhZyBjYW4gYWx3YXlzIGJlIGN1dC4gRGVwZW5kaW5nIG9uIHdoZXRoZXJcbiAgICAvLyB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCwgdGhlIG5leHQgcHJlLXJlbGVhc2VzIGFyZSBlaXRoZXJcbiAgICAvLyBjdXQgZnJvbSBzdWNoIGEgYnJhbmNoLCBvciBmcm9tIHRoZSBhY3R1YWwgYG5leHRgIHJlbGVhc2UtdHJhaW4gYnJhbmNoIChpLmUuIG1hc3RlcikuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==