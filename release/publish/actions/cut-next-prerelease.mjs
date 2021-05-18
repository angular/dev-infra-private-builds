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
            const { pullRequest: { id }, releaseNotes } = yield this.checkoutBranchAndStageVersion(newVersion, branchName);
            yield this.waitForPullRequestToBeMerged(id);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LW5leHQtcHJlcmVsZWFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbmV4dC1wcmVyZWxlYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFJSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDdEQsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFFNUYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUV6Qzs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsYUFBYTtJQUExRDs7UUFDRSwrRUFBK0U7UUFDdkUsZ0JBQVcsR0FBMkIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFtRDFFLENBQUM7SUFqRE8sY0FBYzs7WUFDbEIsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ3RELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUMxQyxPQUFPLHVDQUF1QyxVQUFVLGNBQWMsVUFBVSxJQUFJLENBQUM7UUFDdkYsQ0FBQztLQUFBO0lBRUssT0FBTzs7WUFDWCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUN0RCxNQUFNLEVBQUMsVUFBVSxFQUFDLEdBQUcsWUFBWSxDQUFDO1lBQ2xDLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUUxQyxNQUFNLEVBQUMsV0FBVyxFQUFFLEVBQUMsRUFBRSxFQUFDLEVBQUUsWUFBWSxFQUFDLEdBQ25DLE1BQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVyRSxNQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1QyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUU3RCwwRUFBMEU7WUFDMUUsd0VBQXdFO1lBQ3hFLHVFQUF1RTtZQUN2RSxJQUFJLFlBQVksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDckMsTUFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ3hFO1FBQ0gsQ0FBQztLQUFBO0lBRUQsNEVBQTRFO0lBQ3BFLHlCQUF5Qjs7UUFDL0IsT0FBTyxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLG1DQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQzFELENBQUM7SUFFRCxnRUFBZ0U7SUFDbEQsa0JBQWtCOztZQUM5QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUN0RCxrRkFBa0Y7WUFDbEYsb0ZBQW9GO1lBQ3BGLCtEQUErRDtZQUMvRCxJQUFJLFlBQVksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDckMsT0FBTyxNQUFNLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzNFO2lCQUFNO2dCQUNMLE9BQU8sU0FBUyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDdEQ7UUFDSCxDQUFDO0tBQUE7SUFFRCxNQUFNLENBQU8sUUFBUTs7WUFDbkIsbUZBQW1GO1lBQ25GLHVGQUF1RjtZQUN2Rix3RkFBd0Y7WUFDeEYsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtzZW12ZXJJbmN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvaW5jLXNlbXZlcic7XG5pbXBvcnQge2NvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHR9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvbmV4dC1wcmVyZWxlYXNlLXZlcnNpb24nO1xuaW1wb3J0IHtSZWxlYXNlVHJhaW59IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGN1dHMgYSBwcmVyZWxlYXNlIGZvciB0aGUgbmV4dCBicmFuY2guIEEgdmVyc2lvbiBpbiB0aGUgbmV4dFxuICogYnJhbmNoIGNhbiBoYXZlIGFuIGFyYml0cmFyeSBhbW91bnQgb2YgbmV4dCBwcmUtcmVsZWFzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXROZXh0UHJlcmVsZWFzZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogUHJvbWlzZSByZXNvbHZpbmcgd2l0aCB0aGUgbmV3IHZlcnNpb24gaWYgYSBOUE0gbmV4dCBwcmUtcmVsZWFzZSBpcyBjdXQuICovXG4gIHByaXZhdGUgX25ld1ZlcnNpb246IFByb21pc2U8c2VtdmVyLlNlbVZlcj4gPSB0aGlzLl9jb21wdXRlTmV3VmVyc2lvbigpO1xuXG4gIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuX2dldEFjdGl2ZVByZXJlbGVhc2VUcmFpbigpO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBhd2FpdCB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ3V0IGEgbmV3IG5leHQgcHJlLXJlbGVhc2UgZm9yIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCByZWxlYXNlVHJhaW4gPSB0aGlzLl9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSByZWxlYXNlVHJhaW47XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX25ld1ZlcnNpb247XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3Q6IHtpZH0sIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUsICduZXh0Jyk7XG5cbiAgICAvLyBJZiB0aGUgcHJlLXJlbGVhc2UgaGFzIGJlZW4gY3V0IGZyb20gYSBicmFuY2ggdGhhdCBpcyBub3QgY29ycmVzcG9uZGluZ1xuICAgIC8vIHRvIHRoZSBuZXh0IHJlbGVhc2UtdHJhaW4sIGNoZXJyeS1waWNrIHRoZSBjaGFuZ2Vsb2cgaW50byB0aGUgcHJpbWFyeVxuICAgIC8vIGRldmVsb3BtZW50IGJyYW5jaC4gaS5lLiB0aGUgYG5leHRgIGJyYW5jaCB0aGF0IGlzIHVzdWFsbHkgYG1hc3RlcmAuXG4gICAgaWYgKHJlbGVhc2VUcmFpbiAhPT0gdGhpcy5hY3RpdmUubmV4dCkge1xuICAgICAgYXdhaXQgdGhpcy5jaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2gocmVsZWFzZU5vdGVzLCBicmFuY2hOYW1lKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcmVsZWFzZSB0cmFpbiBmb3Igd2hpY2ggTlBNIG5leHQgcHJlLXJlbGVhc2VzIHNob3VsZCBiZSBjdXQuICovXG4gIHByaXZhdGUgX2dldEFjdGl2ZVByZXJlbGVhc2VUcmFpbigpOiBSZWxlYXNlVHJhaW4ge1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlID8/IHRoaXMuYWN0aXZlLm5leHQ7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbmV3IHByZS1yZWxlYXNlIHZlcnNpb24gZm9yIHRoaXMgcmVsZWFzZSBhY3Rpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX2NvbXB1dGVOZXdWZXJzaW9uKCk6IFByb21pc2U8c2VtdmVyLlNlbVZlcj4ge1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbiA9IHRoaXMuX2dldEFjdGl2ZVByZXJlbGVhc2VUcmFpbigpO1xuICAgIC8vIElmIGEgcHJlLXJlbGVhc2UgaXMgY3V0IGZvciB0aGUgbmV4dCByZWxlYXNlLXRyYWluLCB0aGUgbmV3IHZlcnNpb24gaXMgY29tcHV0ZWRcbiAgICAvLyB3aXRoIHJlc3BlY3QgdG8gc3BlY2lhbCBjYXNlcyBzdXJmYWNpbmcgd2l0aCBGRi9SQyBicmFuY2hlcy4gT3RoZXJ3aXNlLCB0aGUgYmFzaWNcbiAgICAvLyBwcmUtcmVsZWFzZSBpbmNyZW1lbnQgb2YgdGhlIHZlcnNpb24gaXMgdXNlZCBhcyBuZXcgdmVyc2lvbi5cbiAgICBpZiAocmVsZWFzZVRyYWluID09PSB0aGlzLmFjdGl2ZS5uZXh0KSB7XG4gICAgICByZXR1cm4gYXdhaXQgY29tcHV0ZU5ld1ByZXJlbGVhc2VWZXJzaW9uRm9yTmV4dCh0aGlzLmFjdGl2ZSwgdGhpcy5jb25maWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc2VtdmVySW5jKHJlbGVhc2VUcmFpbi52ZXJzaW9uLCAncHJlcmVsZWFzZScpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBpc0FjdGl2ZSgpIHtcbiAgICAvLyBQcmUtcmVsZWFzZXMgZm9yIHRoZSBgbmV4dGAgTlBNIGRpc3QgdGFnIGNhbiBhbHdheXMgYmUgY3V0LiBEZXBlbmRpbmcgb24gd2hldGhlclxuICAgIC8vIHRoZXJlIGlzIGEgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLCB0aGUgbmV4dCBwcmUtcmVsZWFzZXMgYXJlIGVpdGhlclxuICAgIC8vIGN1dCBmcm9tIHN1Y2ggYSBicmFuY2gsIG9yIGZyb20gdGhlIGFjdHVhbCBgbmV4dGAgcmVsZWFzZS10cmFpbiBicmFuY2ggKGkuZS4gbWFzdGVyKS5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19