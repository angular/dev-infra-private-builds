"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeNewPrereleaseVersionForNext = exports.getReleaseNotesCompareVersionForNext = void 0;
const semver_1 = require("../../utils/semver");
const npm_registry_1 = require("./npm-registry");
/**
 * Gets a version that can be used to build release notes for the next
 * release train.
 */
async function getReleaseNotesCompareVersionForNext(active, config) {
    const { version: nextVersion } = active.next;
    // Special-case where the version in the `next` release-train is not published yet. This
    // happens when we recently branched off for feature-freeze. We already bump the version to
    // the next minor or major, but do not publish immediately. Cutting a release immediately would
    // be not helpful as there are no other changes than in the feature-freeze branch.
    const isNextPublishedToNpm = await (0, npm_registry_1.isVersionPublishedToNpm)(nextVersion, config);
    // If we happen to detect the case from above, we use the most recent patch version as base for
    // building release notes. This is better than finding the "next" version when we branched-off
    // as it also prevents us from duplicating many commits that have already landed in the FF/RC.
    return isNextPublishedToNpm ? nextVersion : active.latest.version;
}
exports.getReleaseNotesCompareVersionForNext = getReleaseNotesCompareVersionForNext;
/** Computes the new pre-release version for the next release-train. */
async function computeNewPrereleaseVersionForNext(active, config) {
    const { version: nextVersion } = active.next;
    const isNextPublishedToNpm = await (0, npm_registry_1.isVersionPublishedToNpm)(nextVersion, config);
    // Special-case where the version in the `next` release-train is not published yet. This
    // happens when we recently branched off for feature-freeze. We already bump the version to
    // the next minor or major, but do not publish immediately. Cutting a release immediately would
    // be not helpful as there are no other changes than in the feature-freeze branch. If we happen
    // to detect this case, we stage the release as usual but do not increment the version.
    if (isNextPublishedToNpm) {
        return (0, semver_1.semverInc)(nextVersion, 'prerelease');
    }
    else {
        return nextVersion;
    }
}
exports.computeNewPrereleaseVersionForNext = computeNewPrereleaseVersionForNext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV4dC1wcmVyZWxlYXNlLXZlcnNpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS92ZXJzaW9uaW5nL25leHQtcHJlcmVsZWFzZS12ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUtILCtDQUE2QztBQUk3QyxpREFBdUQ7QUFFdkQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLG9DQUFvQyxDQUN4RCxNQUEyQixFQUMzQixNQUFxQjtJQUVyQixNQUFNLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDM0Msd0ZBQXdGO0lBQ3hGLDJGQUEyRjtJQUMzRiwrRkFBK0Y7SUFDL0Ysa0ZBQWtGO0lBQ2xGLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxJQUFBLHNDQUF1QixFQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNoRiwrRkFBK0Y7SUFDL0YsOEZBQThGO0lBQzlGLDhGQUE4RjtJQUM5RixPQUFPLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQ3BFLENBQUM7QUFkRCxvRkFjQztBQUVELHVFQUF1RTtBQUNoRSxLQUFLLFVBQVUsa0NBQWtDLENBQ3RELE1BQTJCLEVBQzNCLE1BQXFCO0lBRXJCLE1BQU0sRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztJQUMzQyxNQUFNLG9CQUFvQixHQUFHLE1BQU0sSUFBQSxzQ0FBdUIsRUFBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEYsd0ZBQXdGO0lBQ3hGLDJGQUEyRjtJQUMzRiwrRkFBK0Y7SUFDL0YsK0ZBQStGO0lBQy9GLHVGQUF1RjtJQUN2RixJQUFJLG9CQUFvQixFQUFFO1FBQ3hCLE9BQU8sSUFBQSxrQkFBUyxFQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUM3QztTQUFNO1FBQ0wsT0FBTyxXQUFXLENBQUM7S0FDcEI7QUFDSCxDQUFDO0FBaEJELGdGQWdCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7U2VtVmVyfSBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vdXRpbHMvc2VtdmVyJztcbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2lzVmVyc2lvblB1Ymxpc2hlZFRvTnBtfSBmcm9tICcuL25wbS1yZWdpc3RyeSc7XG5cbi8qKlxuICogR2V0cyBhIHZlcnNpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBidWlsZCByZWxlYXNlIG5vdGVzIGZvciB0aGUgbmV4dFxuICogcmVsZWFzZSB0cmFpbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFJlbGVhc2VOb3Rlc0NvbXBhcmVWZXJzaW9uRm9yTmV4dChcbiAgYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLFxuICBjb25maWc6IFJlbGVhc2VDb25maWcsXG4pOiBQcm9taXNlPFNlbVZlcj4ge1xuICBjb25zdCB7dmVyc2lvbjogbmV4dFZlcnNpb259ID0gYWN0aXZlLm5leHQ7XG4gIC8vIFNwZWNpYWwtY2FzZSB3aGVyZSB0aGUgdmVyc2lvbiBpbiB0aGUgYG5leHRgIHJlbGVhc2UtdHJhaW4gaXMgbm90IHB1Ymxpc2hlZCB5ZXQuIFRoaXNcbiAgLy8gaGFwcGVucyB3aGVuIHdlIHJlY2VudGx5IGJyYW5jaGVkIG9mZiBmb3IgZmVhdHVyZS1mcmVlemUuIFdlIGFscmVhZHkgYnVtcCB0aGUgdmVyc2lvbiB0b1xuICAvLyB0aGUgbmV4dCBtaW5vciBvciBtYWpvciwgYnV0IGRvIG5vdCBwdWJsaXNoIGltbWVkaWF0ZWx5LiBDdXR0aW5nIGEgcmVsZWFzZSBpbW1lZGlhdGVseSB3b3VsZFxuICAvLyBiZSBub3QgaGVscGZ1bCBhcyB0aGVyZSBhcmUgbm8gb3RoZXIgY2hhbmdlcyB0aGFuIGluIHRoZSBmZWF0dXJlLWZyZWV6ZSBicmFuY2guXG4gIGNvbnN0IGlzTmV4dFB1Ymxpc2hlZFRvTnBtID0gYXdhaXQgaXNWZXJzaW9uUHVibGlzaGVkVG9OcG0obmV4dFZlcnNpb24sIGNvbmZpZyk7XG4gIC8vIElmIHdlIGhhcHBlbiB0byBkZXRlY3QgdGhlIGNhc2UgZnJvbSBhYm92ZSwgd2UgdXNlIHRoZSBtb3N0IHJlY2VudCBwYXRjaCB2ZXJzaW9uIGFzIGJhc2UgZm9yXG4gIC8vIGJ1aWxkaW5nIHJlbGVhc2Ugbm90ZXMuIFRoaXMgaXMgYmV0dGVyIHRoYW4gZmluZGluZyB0aGUgXCJuZXh0XCIgdmVyc2lvbiB3aGVuIHdlIGJyYW5jaGVkLW9mZlxuICAvLyBhcyBpdCBhbHNvIHByZXZlbnRzIHVzIGZyb20gZHVwbGljYXRpbmcgbWFueSBjb21taXRzIHRoYXQgaGF2ZSBhbHJlYWR5IGxhbmRlZCBpbiB0aGUgRkYvUkMuXG4gIHJldHVybiBpc05leHRQdWJsaXNoZWRUb05wbSA/IG5leHRWZXJzaW9uIDogYWN0aXZlLmxhdGVzdC52ZXJzaW9uO1xufVxuXG4vKiogQ29tcHV0ZXMgdGhlIG5ldyBwcmUtcmVsZWFzZSB2ZXJzaW9uIGZvciB0aGUgbmV4dCByZWxlYXNlLXRyYWluLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQoXG4gIGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucyxcbiAgY29uZmlnOiBSZWxlYXNlQ29uZmlnLFxuKTogUHJvbWlzZTxzZW12ZXIuU2VtVmVyPiB7XG4gIGNvbnN0IHt2ZXJzaW9uOiBuZXh0VmVyc2lvbn0gPSBhY3RpdmUubmV4dDtcbiAgY29uc3QgaXNOZXh0UHVibGlzaGVkVG9OcG0gPSBhd2FpdCBpc1ZlcnNpb25QdWJsaXNoZWRUb05wbShuZXh0VmVyc2lvbiwgY29uZmlnKTtcbiAgLy8gU3BlY2lhbC1jYXNlIHdoZXJlIHRoZSB2ZXJzaW9uIGluIHRoZSBgbmV4dGAgcmVsZWFzZS10cmFpbiBpcyBub3QgcHVibGlzaGVkIHlldC4gVGhpc1xuICAvLyBoYXBwZW5zIHdoZW4gd2UgcmVjZW50bHkgYnJhbmNoZWQgb2ZmIGZvciBmZWF0dXJlLWZyZWV6ZS4gV2UgYWxyZWFkeSBidW1wIHRoZSB2ZXJzaW9uIHRvXG4gIC8vIHRoZSBuZXh0IG1pbm9yIG9yIG1ham9yLCBidXQgZG8gbm90IHB1Ymxpc2ggaW1tZWRpYXRlbHkuIEN1dHRpbmcgYSByZWxlYXNlIGltbWVkaWF0ZWx5IHdvdWxkXG4gIC8vIGJlIG5vdCBoZWxwZnVsIGFzIHRoZXJlIGFyZSBubyBvdGhlciBjaGFuZ2VzIHRoYW4gaW4gdGhlIGZlYXR1cmUtZnJlZXplIGJyYW5jaC4gSWYgd2UgaGFwcGVuXG4gIC8vIHRvIGRldGVjdCB0aGlzIGNhc2UsIHdlIHN0YWdlIHRoZSByZWxlYXNlIGFzIHVzdWFsIGJ1dCBkbyBub3QgaW5jcmVtZW50IHRoZSB2ZXJzaW9uLlxuICBpZiAoaXNOZXh0UHVibGlzaGVkVG9OcG0pIHtcbiAgICByZXR1cm4gc2VtdmVySW5jKG5leHRWZXJzaW9uLCAncHJlcmVsZWFzZScpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXh0VmVyc2lvbjtcbiAgfVxufVxuIl19