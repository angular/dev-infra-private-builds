/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { semverInc } from '../../utils/semver';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV4dC1wcmVyZWxlYXNlLXZlcnNpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL25leHQtcHJlcmVsZWFzZS12ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFJSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFJN0MsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFdkQsdUVBQXVFO0FBQ3ZFLE1BQU0sVUFBZ0Isa0NBQWtDLENBQ3BELE1BQTJCLEVBQUUsTUFBcUI7O1FBQ3BELE1BQU0sRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMzQyxNQUFNLG9CQUFvQixHQUFHLE1BQU0sdUJBQXVCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hGLHdGQUF3RjtRQUN4RiwyRkFBMkY7UUFDM0YsK0ZBQStGO1FBQy9GLCtGQUErRjtRQUMvRix1RkFBdUY7UUFDdkYsSUFBSSxvQkFBb0IsRUFBRTtZQUN4QixPQUFPLFNBQVMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDN0M7YUFBTTtZQUNMLE9BQU8sV0FBVyxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vdXRpbHMvc2VtdmVyJztcbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2lzVmVyc2lvblB1Ymxpc2hlZFRvTnBtfSBmcm9tICcuL25wbS1yZWdpc3RyeSc7XG5cbi8qKiBDb21wdXRlcyB0aGUgbmV3IHByZS1yZWxlYXNlIHZlcnNpb24gZm9yIHRoZSBuZXh0IHJlbGVhc2UtdHJhaW4uICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcHV0ZU5ld1ByZXJlbGVhc2VWZXJzaW9uRm9yTmV4dChcbiAgICBhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIGNvbmZpZzogUmVsZWFzZUNvbmZpZyk6IFByb21pc2U8c2VtdmVyLlNlbVZlcj4ge1xuICBjb25zdCB7dmVyc2lvbjogbmV4dFZlcnNpb259ID0gYWN0aXZlLm5leHQ7XG4gIGNvbnN0IGlzTmV4dFB1Ymxpc2hlZFRvTnBtID0gYXdhaXQgaXNWZXJzaW9uUHVibGlzaGVkVG9OcG0obmV4dFZlcnNpb24sIGNvbmZpZyk7XG4gIC8vIFNwZWNpYWwtY2FzZSB3aGVyZSB0aGUgdmVyc2lvbiBpbiB0aGUgYG5leHRgIHJlbGVhc2UtdHJhaW4gaXMgbm90IHB1Ymxpc2hlZCB5ZXQuIFRoaXNcbiAgLy8gaGFwcGVucyB3aGVuIHdlIHJlY2VudGx5IGJyYW5jaGVkIG9mZiBmb3IgZmVhdHVyZS1mcmVlemUuIFdlIGFscmVhZHkgYnVtcCB0aGUgdmVyc2lvbiB0b1xuICAvLyB0aGUgbmV4dCBtaW5vciBvciBtYWpvciwgYnV0IGRvIG5vdCBwdWJsaXNoIGltbWVkaWF0ZWx5LiBDdXR0aW5nIGEgcmVsZWFzZSBpbW1lZGlhdGVseSB3b3VsZFxuICAvLyBiZSBub3QgaGVscGZ1bCBhcyB0aGVyZSBhcmUgbm8gb3RoZXIgY2hhbmdlcyB0aGFuIGluIHRoZSBmZWF0dXJlLWZyZWV6ZSBicmFuY2guIElmIHdlIGhhcHBlblxuICAvLyB0byBkZXRlY3QgdGhpcyBjYXNlLCB3ZSBzdGFnZSB0aGUgcmVsZWFzZSBhcyB1c3VhbCBidXQgZG8gbm90IGluY3JlbWVudCB0aGUgdmVyc2lvbi5cbiAgaWYgKGlzTmV4dFB1Ymxpc2hlZFRvTnBtKSB7XG4gICAgcmV0dXJuIHNlbXZlckluYyhuZXh0VmVyc2lvbiwgJ3ByZXJlbGVhc2UnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV4dFZlcnNpb247XG4gIH1cbn1cbiJdfQ==