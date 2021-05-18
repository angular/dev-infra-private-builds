/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { semverInc } from './inc-semver';
import { isVersionPublishedToNpm } from './npm-registry';
/** Computes the new pre-release version for the next release-train. */
export function computeNewPrereleaseVersionForNext(active, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const { version: nextVersion } = active.next;
        const isNextPublishedToNpm = yield isVersionPublishedToNpm(nextVersion, config);
        // Special-case where the version in the `next` release-train is not published yet. This
        // happens when we recently branched off for feature-freeze. We already bump the version to
        // the next minor or major, but do not publish immediately. Cutting a release immediately would
        // be not helpful as there are no other changes than in the feature-freeze branch. If we happen
        // to detect this case, we stage the release as usual but do not increment the version.
        if (isNextPublishedToNpm) {
            return semverInc(nextVersion, 'prerelease');
        }
        else {
            return nextVersion;
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV4dC1wcmVyZWxlYXNlLXZlcnNpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL25leHQtcHJlcmVsZWFzZS12ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFPSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXZELHVFQUF1RTtBQUN2RSxNQUFNLFVBQWdCLGtDQUFrQyxDQUNwRCxNQUEyQixFQUFFLE1BQXFCOztRQUNwRCxNQUFNLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDM0MsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoRix3RkFBd0Y7UUFDeEYsMkZBQTJGO1FBQzNGLCtGQUErRjtRQUMvRiwrRkFBK0Y7UUFDL0YsdUZBQXVGO1FBQ3ZGLElBQUksb0JBQW9CLEVBQUU7WUFDeEIsT0FBTyxTQUFTLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQzdDO2FBQU07WUFDTCxPQUFPLFdBQVcsQ0FBQztTQUNwQjtJQUNILENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4vYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7c2VtdmVySW5jfSBmcm9tICcuL2luYy1zZW12ZXInO1xuaW1wb3J0IHtpc1ZlcnNpb25QdWJsaXNoZWRUb05wbX0gZnJvbSAnLi9ucG0tcmVnaXN0cnknO1xuXG4vKiogQ29tcHV0ZXMgdGhlIG5ldyBwcmUtcmVsZWFzZSB2ZXJzaW9uIGZvciB0aGUgbmV4dCByZWxlYXNlLXRyYWluLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQoXG4gICAgYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBjb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPHNlbXZlci5TZW1WZXI+IHtcbiAgY29uc3Qge3ZlcnNpb246IG5leHRWZXJzaW9ufSA9IGFjdGl2ZS5uZXh0O1xuICBjb25zdCBpc05leHRQdWJsaXNoZWRUb05wbSA9IGF3YWl0IGlzVmVyc2lvblB1Ymxpc2hlZFRvTnBtKG5leHRWZXJzaW9uLCBjb25maWcpO1xuICAvLyBTcGVjaWFsLWNhc2Ugd2hlcmUgdGhlIHZlcnNpb24gaW4gdGhlIGBuZXh0YCByZWxlYXNlLXRyYWluIGlzIG5vdCBwdWJsaXNoZWQgeWV0LiBUaGlzXG4gIC8vIGhhcHBlbnMgd2hlbiB3ZSByZWNlbnRseSBicmFuY2hlZCBvZmYgZm9yIGZlYXR1cmUtZnJlZXplLiBXZSBhbHJlYWR5IGJ1bXAgdGhlIHZlcnNpb24gdG9cbiAgLy8gdGhlIG5leHQgbWlub3Igb3IgbWFqb3IsIGJ1dCBkbyBub3QgcHVibGlzaCBpbW1lZGlhdGVseS4gQ3V0dGluZyBhIHJlbGVhc2UgaW1tZWRpYXRlbHkgd291bGRcbiAgLy8gYmUgbm90IGhlbHBmdWwgYXMgdGhlcmUgYXJlIG5vIG90aGVyIGNoYW5nZXMgdGhhbiBpbiB0aGUgZmVhdHVyZS1mcmVlemUgYnJhbmNoLiBJZiB3ZSBoYXBwZW5cbiAgLy8gdG8gZGV0ZWN0IHRoaXMgY2FzZSwgd2Ugc3RhZ2UgdGhlIHJlbGVhc2UgYXMgdXN1YWwgYnV0IGRvIG5vdCBpbmNyZW1lbnQgdGhlIHZlcnNpb24uXG4gIGlmIChpc05leHRQdWJsaXNoZWRUb05wbSkge1xuICAgIHJldHVybiBzZW12ZXJJbmMobmV4dFZlcnNpb24sICdwcmVyZWxlYXNlJyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5leHRWZXJzaW9uO1xuICB9XG59XG4iXX0=