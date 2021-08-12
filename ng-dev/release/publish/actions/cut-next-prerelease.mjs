"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CutNextPrereleaseAction = void 0;
const semver_1 = require("../../../utils/semver");
const next_prerelease_version_1 = require("../../versioning/next-prerelease-version");
const actions_1 = require("../actions");
/**
 * Release action that cuts a prerelease for the next branch. A version in the next
 * branch can have an arbitrary amount of next pre-releases.
 */
class CutNextPrereleaseAction extends actions_1.ReleaseAction {
    constructor() {
        super(...arguments);
        /** Promise resolving with the new version if a NPM next pre-release is cut. */
        this._newVersion = this._computeNewVersion();
    }
    async getDescription() {
        const { branchName } = this._getActivePrereleaseTrain();
        const newVersion = await this._newVersion;
        return `Cut a new next pre-release for the "${branchName}" branch (v${newVersion}).`;
    }
    async perform() {
        const releaseTrain = this._getActivePrereleaseTrain();
        const { branchName } = releaseTrain;
        const newVersion = await this._newVersion;
        const compareVersionForReleaseNotes = await this._getCompareVersionForReleaseNotes();
        const { pullRequest, releaseNotes } = await this.checkoutBranchAndStageVersion(newVersion, compareVersionForReleaseNotes, branchName);
        await this.waitForPullRequestToBeMerged(pullRequest);
        await this.buildAndPublish(releaseNotes, branchName, 'next');
        // If the pre-release has been cut from a branch that is not corresponding
        // to the next release-train, cherry-pick the changelog into the primary
        // development branch (i.e. the next branch).
        if (releaseTrain !== this.active.next) {
            await this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
        }
    }
    /** Gets the release train for which NPM next pre-releases should be cut. */
    _getActivePrereleaseTrain() {
        return this.active.releaseCandidate ?? this.active.next;
    }
    /** Gets the new pre-release version for this release action. */
    async _computeNewVersion() {
        const releaseTrain = this._getActivePrereleaseTrain();
        // If a pre-release is cut for the next release-train, the new version is computed
        // with respect to special cases surfacing with FF/RC branches. Otherwise, the basic
        // pre-release increment of the version is used as new version.
        if (releaseTrain === this.active.next) {
            return await next_prerelease_version_1.computeNewPrereleaseVersionForNext(this.active, this.config);
        }
        else {
            return semver_1.semverInc(releaseTrain.version, 'prerelease');
        }
    }
    /** Gets the compare version for building release notes of the new pre-release.*/
    async _getCompareVersionForReleaseNotes() {
        const releaseTrain = this._getActivePrereleaseTrain();
        // If a pre-release is cut for the next release-train, the compare version is computed
        // with respect to special cases surfacing with FF/RC branches. Otherwise, the current
        // version from the release train is used for comparison.
        if (releaseTrain === this.active.next) {
            return await next_prerelease_version_1.getReleaseNotesCompareVersionForNext(this.active, this.config);
        }
        else {
            return releaseTrain.version;
        }
    }
    static async isActive() {
        // Pre-releases for the `next` NPM dist tag can always be cut. Depending on whether
        // there is a feature-freeze/release-candidate branch, the next pre-releases are either
        // cut from such a branch, or from the actual `next` release-train branch.
        return true;
    }
}
exports.CutNextPrereleaseAction = CutNextPrereleaseAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LW5leHQtcHJlcmVsZWFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbmV4dC1wcmVyZWxlYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILGtEQUFnRDtBQUNoRCxzRkFHa0Q7QUFFbEQsd0NBQXlDO0FBRXpDOzs7R0FHRztBQUNILE1BQWEsdUJBQXdCLFNBQVEsdUJBQWE7SUFBMUQ7O1FBQ0UsK0VBQStFO1FBQ3ZFLGdCQUFXLEdBQTJCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBb0UxRSxDQUFDO0lBbEVVLEtBQUssQ0FBQyxjQUFjO1FBQzNCLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUN0RCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDMUMsT0FBTyx1Q0FBdUMsVUFBVSxjQUFjLFVBQVUsSUFBSSxDQUFDO0lBQ3ZGLENBQUM7SUFFUSxLQUFLLENBQUMsT0FBTztRQUNwQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUN0RCxNQUFNLEVBQUMsVUFBVSxFQUFDLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUMxQyxNQUFNLDZCQUE2QixHQUFHLE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxFQUFFLENBQUM7UUFFckYsTUFBTSxFQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FDMUUsVUFBVSxFQUNWLDZCQUE2QixFQUM3QixVQUFVLENBQ1gsQ0FBQztRQUVGLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTdELDBFQUEwRTtRQUMxRSx3RUFBd0U7UUFDeEUsNkNBQTZDO1FBQzdDLElBQUksWUFBWSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ3JDLE1BQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztTQUN4RTtJQUNILENBQUM7SUFFRCw0RUFBNEU7SUFDcEUseUJBQXlCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUMxRCxDQUFDO0lBRUQsZ0VBQWdFO0lBQ3hELEtBQUssQ0FBQyxrQkFBa0I7UUFDOUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDdEQsa0ZBQWtGO1FBQ2xGLG9GQUFvRjtRQUNwRiwrREFBK0Q7UUFDL0QsSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDckMsT0FBTyxNQUFNLDREQUFrQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNFO2FBQU07WUFDTCxPQUFPLGtCQUFTLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztTQUN0RDtJQUNILENBQUM7SUFFRCxpRkFBaUY7SUFDekUsS0FBSyxDQUFDLGlDQUFpQztRQUM3QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUN0RCxzRkFBc0Y7UUFDdEYsc0ZBQXNGO1FBQ3RGLHlEQUF5RDtRQUN6RCxJQUFJLFlBQVksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtZQUNyQyxPQUFPLE1BQU0sOERBQW9DLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDN0U7YUFBTTtZQUNMLE9BQU8sWUFBWSxDQUFDLE9BQU8sQ0FBQztTQUM3QjtJQUNILENBQUM7SUFFRCxNQUFNLENBQVUsS0FBSyxDQUFDLFFBQVE7UUFDNUIsbUZBQW1GO1FBQ25GLHVGQUF1RjtRQUN2RiwwRUFBMEU7UUFDMUUsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUF0RUQsMERBc0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvc2VtdmVyJztcbmltcG9ydCB7XG4gIGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQsXG4gIGdldFJlbGVhc2VOb3Rlc0NvbXBhcmVWZXJzaW9uRm9yTmV4dCxcbn0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9uZXh0LXByZXJlbGVhc2UtdmVyc2lvbic7XG5pbXBvcnQge1JlbGVhc2VUcmFpbn0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgY3V0cyBhIHByZXJlbGVhc2UgZm9yIHRoZSBuZXh0IGJyYW5jaC4gQSB2ZXJzaW9uIGluIHRoZSBuZXh0XG4gKiBicmFuY2ggY2FuIGhhdmUgYW4gYXJiaXRyYXJ5IGFtb3VudCBvZiBuZXh0IHByZS1yZWxlYXNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dE5leHRQcmVyZWxlYXNlQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIC8qKiBQcm9taXNlIHJlc29sdmluZyB3aXRoIHRoZSBuZXcgdmVyc2lvbiBpZiBhIE5QTSBuZXh0IHByZS1yZWxlYXNlIGlzIGN1dC4gKi9cbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbjogUHJvbWlzZTxzZW12ZXIuU2VtVmVyPiA9IHRoaXMuX2NvbXB1dGVOZXdWZXJzaW9uKCk7XG5cbiAgb3ZlcnJpZGUgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5fZ2V0QWN0aXZlUHJlcmVsZWFzZVRyYWluKCk7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBDdXQgYSBuZXcgbmV4dCBwcmUtcmVsZWFzZSBmb3IgdGhlIFwiJHticmFuY2hOYW1lfVwiIGJyYW5jaCAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbiA9IHRoaXMuX2dldEFjdGl2ZVByZXJlbGVhc2VUcmFpbigpO1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHJlbGVhc2VUcmFpbjtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gYXdhaXQgdGhpcy5fbmV3VmVyc2lvbjtcbiAgICBjb25zdCBjb21wYXJlVmVyc2lvbkZvclJlbGVhc2VOb3RlcyA9IGF3YWl0IHRoaXMuX2dldENvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzKCk7XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3QsIHJlbGVhc2VOb3Rlc30gPSBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKFxuICAgICAgbmV3VmVyc2lvbixcbiAgICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzLFxuICAgICAgYnJhbmNoTmFtZSxcbiAgICApO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKHB1bGxSZXF1ZXN0KTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUsICduZXh0Jyk7XG5cbiAgICAvLyBJZiB0aGUgcHJlLXJlbGVhc2UgaGFzIGJlZW4gY3V0IGZyb20gYSBicmFuY2ggdGhhdCBpcyBub3QgY29ycmVzcG9uZGluZ1xuICAgIC8vIHRvIHRoZSBuZXh0IHJlbGVhc2UtdHJhaW4sIGNoZXJyeS1waWNrIHRoZSBjaGFuZ2Vsb2cgaW50byB0aGUgcHJpbWFyeVxuICAgIC8vIGRldmVsb3BtZW50IGJyYW5jaCAoaS5lLiB0aGUgbmV4dCBicmFuY2gpLlxuICAgIGlmIChyZWxlYXNlVHJhaW4gIT09IHRoaXMuYWN0aXZlLm5leHQpIHtcbiAgICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIHJlbGVhc2UgdHJhaW4gZm9yIHdoaWNoIE5QTSBuZXh0IHByZS1yZWxlYXNlcyBzaG91bGQgYmUgY3V0LiAqL1xuICBwcml2YXRlIF9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTogUmVsZWFzZVRyYWluIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSA/PyB0aGlzLmFjdGl2ZS5uZXh0O1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5ldyBwcmUtcmVsZWFzZSB2ZXJzaW9uIGZvciB0aGlzIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF9jb21wdXRlTmV3VmVyc2lvbigpOiBQcm9taXNlPHNlbXZlci5TZW1WZXI+IHtcbiAgICBjb25zdCByZWxlYXNlVHJhaW4gPSB0aGlzLl9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTtcbiAgICAvLyBJZiBhIHByZS1yZWxlYXNlIGlzIGN1dCBmb3IgdGhlIG5leHQgcmVsZWFzZS10cmFpbiwgdGhlIG5ldyB2ZXJzaW9uIGlzIGNvbXB1dGVkXG4gICAgLy8gd2l0aCByZXNwZWN0IHRvIHNwZWNpYWwgY2FzZXMgc3VyZmFjaW5nIHdpdGggRkYvUkMgYnJhbmNoZXMuIE90aGVyd2lzZSwgdGhlIGJhc2ljXG4gICAgLy8gcHJlLXJlbGVhc2UgaW5jcmVtZW50IG9mIHRoZSB2ZXJzaW9uIGlzIHVzZWQgYXMgbmV3IHZlcnNpb24uXG4gICAgaWYgKHJlbGVhc2VUcmFpbiA9PT0gdGhpcy5hY3RpdmUubmV4dCkge1xuICAgICAgcmV0dXJuIGF3YWl0IGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQodGhpcy5hY3RpdmUsIHRoaXMuY29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNlbXZlckluYyhyZWxlYXNlVHJhaW4udmVyc2lvbiwgJ3ByZXJlbGVhc2UnKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY29tcGFyZSB2ZXJzaW9uIGZvciBidWlsZGluZyByZWxlYXNlIG5vdGVzIG9mIHRoZSBuZXcgcHJlLXJlbGVhc2UuKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Q29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMoKTogUHJvbWlzZTxzZW12ZXIuU2VtVmVyPiB7XG4gICAgY29uc3QgcmVsZWFzZVRyYWluID0gdGhpcy5fZ2V0QWN0aXZlUHJlcmVsZWFzZVRyYWluKCk7XG4gICAgLy8gSWYgYSBwcmUtcmVsZWFzZSBpcyBjdXQgZm9yIHRoZSBuZXh0IHJlbGVhc2UtdHJhaW4sIHRoZSBjb21wYXJlIHZlcnNpb24gaXMgY29tcHV0ZWRcbiAgICAvLyB3aXRoIHJlc3BlY3QgdG8gc3BlY2lhbCBjYXNlcyBzdXJmYWNpbmcgd2l0aCBGRi9SQyBicmFuY2hlcy4gT3RoZXJ3aXNlLCB0aGUgY3VycmVudFxuICAgIC8vIHZlcnNpb24gZnJvbSB0aGUgcmVsZWFzZSB0cmFpbiBpcyB1c2VkIGZvciBjb21wYXJpc29uLlxuICAgIGlmIChyZWxlYXNlVHJhaW4gPT09IHRoaXMuYWN0aXZlLm5leHQpIHtcbiAgICAgIHJldHVybiBhd2FpdCBnZXRSZWxlYXNlTm90ZXNDb21wYXJlVmVyc2lvbkZvck5leHQodGhpcy5hY3RpdmUsIHRoaXMuY29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlbGVhc2VUcmFpbi52ZXJzaW9uO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBvdmVycmlkZSBhc3luYyBpc0FjdGl2ZSgpIHtcbiAgICAvLyBQcmUtcmVsZWFzZXMgZm9yIHRoZSBgbmV4dGAgTlBNIGRpc3QgdGFnIGNhbiBhbHdheXMgYmUgY3V0LiBEZXBlbmRpbmcgb24gd2hldGhlclxuICAgIC8vIHRoZXJlIGlzIGEgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLCB0aGUgbmV4dCBwcmUtcmVsZWFzZXMgYXJlIGVpdGhlclxuICAgIC8vIGN1dCBmcm9tIHN1Y2ggYSBicmFuY2gsIG9yIGZyb20gdGhlIGFjdHVhbCBgbmV4dGAgcmVsZWFzZS10cmFpbiBicmFuY2guXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==