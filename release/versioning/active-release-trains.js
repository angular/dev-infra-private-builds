/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/versioning/active-release-trains", ["require", "exports", "tslib", "semver", "@angular/dev-infra-private/release/versioning/release-trains", "@angular/dev-infra-private/release/versioning/version-branches"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findActiveReleaseTrainsFromVersionBranches = exports.fetchActiveReleaseTrains = exports.nextBranchName = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var release_trains_1 = require("@angular/dev-infra-private/release/versioning/release-trains");
    var version_branches_1 = require("@angular/dev-infra-private/release/versioning/version-branches");
    /** Branch name for the `next` branch. */
    exports.nextBranchName = 'master';
    /** Fetches the active release trains for the configured project. */
    function fetchActiveReleaseTrains(repo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var nextVersion, next, majorVersionsToConsider, expectedReleaseCandidateMajor, branches, _a, latest, releaseCandidate;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, version_branches_1.getVersionOfBranch(repo, exports.nextBranchName)];
                    case 1:
                        nextVersion = _b.sent();
                        next = new release_trains_1.ReleaseTrain(exports.nextBranchName, nextVersion);
                        majorVersionsToConsider = [];
                        // If the `next` branch (i.e. `master` branch) is for an upcoming major version, we know
                        // that there is no patch branch or feature-freeze/release-candidate branch for this major
                        // digit. If the current `next` version is the first minor of a major version, we know that
                        // the feature-freeze/release-candidate branch can only be the actual major branch. The
                        // patch branch is based on that, either the actual major branch or the last minor from the
                        // preceding major version. In all other cases, the patch branch and feature-freeze or
                        // release-candidate branch are part of the same major version. Consider the following:
                        //
                        //  CASE 1. next: 11.0.0-next.0: patch and feature-freeze/release-candidate can only be
                        //          most recent `10.<>.x` branches. The FF/RC branch can only be the last-minor of v10.
                        //  CASE 2. next: 11.1.0-next.0: patch can be either `11.0.x` or last-minor in v10 based
                        //          on whether there is a feature-freeze/release-candidate branch (=> `11.0.x`).
                        //  CASE 3. next: 10.6.0-next.0: patch can be either `10.5.x` or `10.4.x` based on whether
                        //          there is a feature-freeze/release-candidate branch (=> `10.5.x`)
                        if (nextVersion.minor === 0) {
                            expectedReleaseCandidateMajor = nextVersion.major - 1;
                            majorVersionsToConsider.push(nextVersion.major - 1);
                        }
                        else if (nextVersion.minor === 1) {
                            expectedReleaseCandidateMajor = nextVersion.major;
                            majorVersionsToConsider.push(nextVersion.major, nextVersion.major - 1);
                        }
                        else {
                            expectedReleaseCandidateMajor = nextVersion.major;
                            majorVersionsToConsider.push(nextVersion.major);
                        }
                        return [4 /*yield*/, version_branches_1.getBranchesForMajorVersions(repo, majorVersionsToConsider)];
                    case 2:
                        branches = _b.sent();
                        return [4 /*yield*/, findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor)];
                    case 3:
                        _a = _b.sent(), latest = _a.latest, releaseCandidate = _a.releaseCandidate;
                        if (latest === null) {
                            throw Error("Unable to determine the latest release-train. The following branches " +
                                ("have been considered: [" + branches.map(function (b) { return b.name; }).join(', ') + "]"));
                        }
                        return [2 /*return*/, { releaseCandidate: releaseCandidate, latest: latest, next: next }];
                }
            });
        });
    }
    exports.fetchActiveReleaseTrains = fetchActiveReleaseTrains;
    /** Finds the currently active release trains from the specified version branches. */
    function findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var nextReleaseTrainVersion, latest, releaseCandidate, branches_1, branches_1_1, _a, name_1, parsed, version, releaseTrain, isPrerelease, e_1_1;
            var e_1, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        nextReleaseTrainVersion = semver.parse(nextVersion.major + "." + nextVersion.minor + ".0");
                        latest = null;
                        releaseCandidate = null;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, 7, 8]);
                        branches_1 = tslib_1.__values(branches), branches_1_1 = branches_1.next();
                        _c.label = 2;
                    case 2:
                        if (!!branches_1_1.done) return [3 /*break*/, 5];
                        _a = branches_1_1.value, name_1 = _a.name, parsed = _a.parsed;
                        // It can happen that version branches have been accidentally created which are more recent
                        // than the release-train in the next branch (i.e. `master`). We could ignore such branches
                        // silently, but it might be symptomatic for an outdated version in the `next` branch, or an
                        // accidentally created branch by the caretaker. In either way we want to raise awareness.
                        if (semver.gt(parsed, nextReleaseTrainVersion)) {
                            throw Error("Discovered unexpected version-branch \"" + name_1 + "\" for a release-train that is " +
                                ("more recent than the release-train currently in the \"" + exports.nextBranchName + "\" branch. ") +
                                "Please either delete the branch if created by accident, or update the outdated " +
                                ("version in the next branch (" + exports.nextBranchName + ")."));
                        }
                        else if (semver.eq(parsed, nextReleaseTrainVersion)) {
                            throw Error("Discovered unexpected version-branch \"" + name_1 + "\" for a release-train that is already " +
                                ("active in the \"" + exports.nextBranchName + "\" branch. Please either delete the branch if ") +
                                ("created by accident, or update the version in the next branch (" + exports.nextBranchName + ")."));
                        }
                        return [4 /*yield*/, version_branches_1.getVersionOfBranch(repo, name_1)];
                    case 3:
                        version = _c.sent();
                        releaseTrain = new release_trains_1.ReleaseTrain(name_1, version);
                        isPrerelease = version.prerelease[0] === 'rc' || version.prerelease[0] === 'next';
                        if (isPrerelease) {
                            if (releaseCandidate !== null) {
                                throw Error("Unable to determine latest release-train. Found two consecutive " +
                                    ("branches in feature-freeze/release-candidate phase. Did not expect both \"" + name_1 + "\" ") +
                                    ("and \"" + releaseCandidate.branchName + "\" to be in feature-freeze/release-candidate mode."));
                            }
                            else if (version.major !== expectedReleaseCandidateMajor) {
                                throw Error("Discovered unexpected old feature-freeze/release-candidate branch. Expected no " +
                                    ("version-branch in feature-freeze/release-candidate mode for v" + version.major + "."));
                            }
                            releaseCandidate = releaseTrain;
                        }
                        else {
                            latest = releaseTrain;
                            return [3 /*break*/, 5];
                        }
                        _c.label = 4;
                    case 4:
                        branches_1_1 = branches_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _c.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (branches_1_1 && !branches_1_1.done && (_b = branches_1.return)) _b.call(branches_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, { releaseCandidate: releaseCandidate, latest: latest }];
                }
            });
        });
    }
    exports.findActiveReleaseTrainsFromVersionBranches = findActiveReleaseTrainsFromVersionBranches;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZlLXJlbGVhc2UtdHJhaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQywrRkFBOEM7SUFDOUMsbUdBQXFIO0lBWXJILHlDQUF5QztJQUM1QixRQUFBLGNBQWMsR0FBRyxRQUFRLENBQUM7SUFFdkMsb0VBQW9FO0lBQ3BFLFNBQXNCLHdCQUF3QixDQUFDLElBQXVCOzs7Ozs0QkFFaEQscUJBQU0scUNBQWtCLENBQUMsSUFBSSxFQUFFLHNCQUFjLENBQUMsRUFBQTs7d0JBQTVELFdBQVcsR0FBRyxTQUE4Qzt3QkFDNUQsSUFBSSxHQUFHLElBQUksNkJBQVksQ0FBQyxzQkFBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3dCQUNyRCx1QkFBdUIsR0FBYSxFQUFFLENBQUM7d0JBRzdDLHdGQUF3Rjt3QkFDeEYsMEZBQTBGO3dCQUMxRiwyRkFBMkY7d0JBQzNGLHVGQUF1Rjt3QkFDdkYsMkZBQTJGO3dCQUMzRixzRkFBc0Y7d0JBQ3RGLHVGQUF1Rjt3QkFDdkYsRUFBRTt3QkFDRix1RkFBdUY7d0JBQ3ZGLCtGQUErRjt3QkFDL0Ysd0ZBQXdGO3dCQUN4Rix3RkFBd0Y7d0JBQ3hGLDBGQUEwRjt3QkFDMUYsNEVBQTRFO3dCQUM1RSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFOzRCQUMzQiw2QkFBNkIsR0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzs0QkFDdEQsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7eUJBQ3JEOzZCQUFNLElBQUksV0FBVyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7NEJBQ2xDLDZCQUE2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Q3BGLFdBQVEsZ0JBQWdCLENBQUMsVUFBVSx1REFBbUQsQ0FBQSxDQUFDLENBQUM7NkJBQzdGO2lDQUFNLElBQUksT0FBTyxDQUFDLEtBQUssS0FBSyw2QkFBNkIsRUFBRTtnQ0FDMUQsTUFBTSxLQUFLLENBQ1AsaUZBQWlGO3FDQUNqRixrRUFBZ0UsT0FBTyxDQUFDLEtBQUssTUFBRyxDQUFBLENBQUMsQ0FBQzs2QkFDdkY7NEJBQ0QsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO3lCQUNqQzs2QkFBTTs0QkFDTCxNQUFNLEdBQUcsWUFBWSxDQUFDOzRCQUN0Qix3QkFBTTt5QkFDUDs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFHSCxzQkFBTyxFQUFDLGdCQUFnQixrQkFBQSxFQUFFLE1BQU0sUUFBQSxFQUFDLEVBQUM7Ozs7S0FDbkM7SUEvREQsZ0dBK0RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge1JlbGVhc2VUcmFpbn0gZnJvbSAnLi9yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2dldEJyYW5jaGVzRm9yTWFqb3JWZXJzaW9ucywgZ2V0VmVyc2lvbk9mQnJhbmNoLCBHaXRodWJSZXBvV2l0aEFwaSwgVmVyc2lvbkJyYW5jaH0gZnJvbSAnLi92ZXJzaW9uLWJyYW5jaGVzJztcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGRldGVybWluZWQgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIGZvciBhIHByb2plY3QuICovXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2ZVJlbGVhc2VUcmFpbnMge1xuICAvKiogUmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIFwicmVsZWFzZS1jYW5kaWRhdGVcIiBvciBcImZlYXR1cmUtZnJlZXplXCIgcGhhc2UuICovXG4gIHJlbGVhc2VDYW5kaWRhdGU6IFJlbGVhc2VUcmFpbnxudWxsO1xuICAvKiogUmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIFwibGF0ZXN0XCIgcGhhc2UuICovXG4gIGxhdGVzdDogUmVsZWFzZVRyYWluO1xuICAvKiogUmVsZWFzZS10cmFpbiBpbiB0aGUgYG5leHRgIHBoYXNlLiAqL1xuICBuZXh0OiBSZWxlYXNlVHJhaW47XG59XG5cbi8qKiBCcmFuY2ggbmFtZSBmb3IgdGhlIGBuZXh0YCBicmFuY2guICovXG5leHBvcnQgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSAnbWFzdGVyJztcblxuLyoqIEZldGNoZXMgdGhlIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbzogR2l0aHViUmVwb1dpdGhBcGkpOlxuICAgIFByb21pc2U8QWN0aXZlUmVsZWFzZVRyYWlucz4ge1xuICBjb25zdCBuZXh0VmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBuZXh0QnJhbmNoTmFtZSk7XG4gIGNvbnN0IG5leHQgPSBuZXcgUmVsZWFzZVRyYWluKG5leHRCcmFuY2hOYW1lLCBuZXh0VmVyc2lvbik7XG4gIGNvbnN0IG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyOiBudW1iZXJbXSA9IFtdO1xuICBsZXQgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3I6IG51bWJlcjtcblxuICAvLyBJZiB0aGUgYG5leHRgIGJyYW5jaCAoaS5lLiBgbWFzdGVyYCBicmFuY2gpIGlzIGZvciBhbiB1cGNvbWluZyBtYWpvciB2ZXJzaW9uLCB3ZSBrbm93XG4gIC8vIHRoYXQgdGhlcmUgaXMgbm8gcGF0Y2ggYnJhbmNoIG9yIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBmb3IgdGhpcyBtYWpvclxuICAvLyBkaWdpdC4gSWYgdGhlIGN1cnJlbnQgYG5leHRgIHZlcnNpb24gaXMgdGhlIGZpcnN0IG1pbm9yIG9mIGEgbWFqb3IgdmVyc2lvbiwgd2Uga25vdyB0aGF0XG4gIC8vIHRoZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggY2FuIG9ubHkgYmUgdGhlIGFjdHVhbCBtYWpvciBicmFuY2guIFRoZVxuICAvLyBwYXRjaCBicmFuY2ggaXMgYmFzZWQgb24gdGhhdCwgZWl0aGVyIHRoZSBhY3R1YWwgbWFqb3IgYnJhbmNoIG9yIHRoZSBsYXN0IG1pbm9yIGZyb20gdGhlXG4gIC8vIHByZWNlZGluZyBtYWpvciB2ZXJzaW9uLiBJbiBhbGwgb3RoZXIgY2FzZXMsIHRoZSBwYXRjaCBicmFuY2ggYW5kIGZlYXR1cmUtZnJlZXplIG9yXG4gIC8vIHJlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBhcmUgcGFydCBvZiB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLiBDb25zaWRlciB0aGUgZm9sbG93aW5nOlxuICAvL1xuICAvLyAgQ0FTRSAxLiBuZXh0OiAxMS4wLjAtbmV4dC4wOiBwYXRjaCBhbmQgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgY2FuIG9ubHkgYmVcbiAgLy8gICAgICAgICAgbW9zdCByZWNlbnQgYDEwLjw+LnhgIGJyYW5jaGVzLiBUaGUgRkYvUkMgYnJhbmNoIGNhbiBvbmx5IGJlIHRoZSBsYXN0LW1pbm9yIG9mIHYxMC5cbiAgLy8gIENBU0UgMi4gbmV4dDogMTEuMS4wLW5leHQuMDogcGF0Y2ggY2FuIGJlIGVpdGhlciBgMTEuMC54YCBvciBsYXN0LW1pbm9yIGluIHYxMCBiYXNlZFxuICAvLyAgICAgICAgICBvbiB3aGV0aGVyIHRoZXJlIGlzIGEgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICg9PiBgMTEuMC54YCkuXG4gIC8vICBDQVNFIDMuIG5leHQ6IDEwLjYuMC1uZXh0LjA6IHBhdGNoIGNhbiBiZSBlaXRoZXIgYDEwLjUueGAgb3IgYDEwLjQueGAgYmFzZWQgb24gd2hldGhlclxuICAvLyAgICAgICAgICB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCAoPT4gYDEwLjUueGApXG4gIGlmIChuZXh0VmVyc2lvbi5taW5vciA9PT0gMCkge1xuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yID0gbmV4dFZlcnNpb24ubWFqb3IgLSAxO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IgLSAxKTtcbiAgfSBlbHNlIGlmIChuZXh0VmVyc2lvbi5taW5vciA9PT0gMSkge1xuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yID0gbmV4dFZlcnNpb24ubWFqb3I7XG4gICAgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIucHVzaChuZXh0VmVyc2lvbi5tYWpvciwgbmV4dFZlcnNpb24ubWFqb3IgLSAxKTtcbiAgfSBlbHNlIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IpO1xuICB9XG5cbiAgLy8gQ29sbGVjdCBhbGwgdmVyc2lvbi1icmFuY2hlcyB0aGF0IHNob3VsZCBiZSBjb25zaWRlcmVkIGZvciB0aGUgbGF0ZXN0IHZlcnNpb24tYnJhbmNoLFxuICAvLyBvciB0aGUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUuXG4gIGNvbnN0IGJyYW5jaGVzID0gYXdhaXQgZ2V0QnJhbmNoZXNGb3JNYWpvclZlcnNpb25zKHJlcG8sIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyKTtcbiAgY29uc3Qge2xhdGVzdCwgcmVsZWFzZUNhbmRpZGF0ZX0gPSBhd2FpdCBmaW5kQWN0aXZlUmVsZWFzZVRyYWluc0Zyb21WZXJzaW9uQnJhbmNoZXMoXG4gICAgICByZXBvLCBuZXh0VmVyc2lvbiwgYnJhbmNoZXMsIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yKTtcblxuICBpZiAobGF0ZXN0ID09PSBudWxsKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gZGV0ZXJtaW5lIHRoZSBsYXRlc3QgcmVsZWFzZS10cmFpbi4gVGhlIGZvbGxvd2luZyBicmFuY2hlcyBgICtcbiAgICAgICAgYGhhdmUgYmVlbiBjb25zaWRlcmVkOiBbJHticmFuY2hlcy5tYXAoYiA9PiBiLm5hbWUpLmpvaW4oJywgJyl9XWApO1xuICB9XG5cbiAgcmV0dXJuIHtyZWxlYXNlQ2FuZGlkYXRlLCBsYXRlc3QsIG5leHR9O1xufVxuXG4vKiogRmluZHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgZnJvbSB0aGUgc3BlY2lmaWVkIHZlcnNpb24gYnJhbmNoZXMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZEFjdGl2ZVJlbGVhc2VUcmFpbnNGcm9tVmVyc2lvbkJyYW5jaGVzKFxuICAgIHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpLCBuZXh0VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgYnJhbmNoZXM6IFZlcnNpb25CcmFuY2hbXSxcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvcjogbnVtYmVyKTogUHJvbWlzZTx7XG4gIGxhdGVzdDogUmVsZWFzZVRyYWluIHwgbnVsbCxcbiAgcmVsZWFzZUNhbmRpZGF0ZTogUmVsZWFzZVRyYWluIHwgbnVsbCxcbn0+IHtcbiAgLy8gVmVyc2lvbiByZXByZXNlbnRpbmcgdGhlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBuZXh0IHBoYXNlLiBOb3RlIHRoYXQgd2UgaWdub3JlXG4gIC8vIHBhdGNoIGFuZCBwcmUtcmVsZWFzZSBzZWdtZW50cyBpbiBvcmRlciB0byBiZSBhYmxlIHRvIGNvbXBhcmUgdGhlIG5leHQgcmVsZWFzZSB0cmFpbiB0b1xuICAvLyBvdGhlciByZWxlYXNlIHRyYWlucyBmcm9tIHZlcnNpb24gYnJhbmNoZXMgKHdoaWNoIGZvbGxvdyB0aGUgYE4uTi54YCBwYXR0ZXJuKS5cbiAgY29uc3QgbmV4dFJlbGVhc2VUcmFpblZlcnNpb24gPSBzZW12ZXIucGFyc2UoYCR7bmV4dFZlcnNpb24ubWFqb3J9LiR7bmV4dFZlcnNpb24ubWlub3J9LjBgKSE7XG5cbiAgbGV0IGxhdGVzdDogUmVsZWFzZVRyYWlufG51bGwgPSBudWxsO1xuICBsZXQgcmVsZWFzZUNhbmRpZGF0ZTogUmVsZWFzZVRyYWlufG51bGwgPSBudWxsO1xuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgY2FwdHVyZWQgYnJhbmNoZXMgYW5kIGZpbmQgdGhlIGxhdGVzdCBub24tcHJlcmVsZWFzZSBicmFuY2ggYW5kIGFcbiAgLy8gcG90ZW50aWFsIHJlbGVhc2UgY2FuZGlkYXRlIGJyYW5jaC4gRnJvbSB0aGUgY29sbGVjdGVkIGJyYW5jaGVzIHdlIGl0ZXJhdGUgZGVzY2VuZGluZ1xuICAvLyBvcmRlciAobW9zdCByZWNlbnQgc2VtYW50aWMgdmVyc2lvbi1icmFuY2ggZmlyc3QpLiBUaGUgZmlyc3QgYnJhbmNoIGlzIGVpdGhlciB0aGUgbGF0ZXN0XG4gIC8vIGFjdGl2ZSB2ZXJzaW9uIGJyYW5jaCAoaS5lLiBwYXRjaCkgb3IgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2guIEEgRkYvUkNcbiAgLy8gYnJhbmNoIGNhbm5vdCBiZSBvbGRlciB0aGFuIHRoZSBsYXRlc3QgYWN0aXZlIHZlcnNpb24tYnJhbmNoLCBzbyB3ZSBzdG9wIGl0ZXJhdGluZyBvbmNlXG4gIC8vIHdlIGZvdW5kIHN1Y2ggYSBicmFuY2guIE90aGVyd2lzZSwgaWYgd2UgZm91bmQgYSBGRi9SQyBicmFuY2gsIHdlIGNvbnRpbnVlIGxvb2tpbmcgZm9yIHRoZVxuICAvLyBuZXh0IHZlcnNpb24tYnJhbmNoIGFzIHRoYXQgb25lIGlzIHN1cHBvc2VkIHRvIGJlIHRoZSBsYXRlc3QgYWN0aXZlIHZlcnNpb24tYnJhbmNoLiBJZiBpdFxuICAvLyBpcyBub3QsIHRoZW4gYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24gZHVlIHRvIHR3byBGRi9SQyBicmFuY2hlcyBleGlzdGluZyBhdCB0aGUgc2FtZSB0aW1lLlxuICBmb3IgKGNvbnN0IHtuYW1lLCBwYXJzZWR9IG9mIGJyYW5jaGVzKSB7XG4gICAgLy8gSXQgY2FuIGhhcHBlbiB0aGF0IHZlcnNpb24gYnJhbmNoZXMgaGF2ZSBiZWVuIGFjY2lkZW50YWxseSBjcmVhdGVkIHdoaWNoIGFyZSBtb3JlIHJlY2VudFxuICAgIC8vIHRoYW4gdGhlIHJlbGVhc2UtdHJhaW4gaW4gdGhlIG5leHQgYnJhbmNoIChpLmUuIGBtYXN0ZXJgKS4gV2UgY291bGQgaWdub3JlIHN1Y2ggYnJhbmNoZXNcbiAgICAvLyBzaWxlbnRseSwgYnV0IGl0IG1pZ2h0IGJlIHN5bXB0b21hdGljIGZvciBhbiBvdXRkYXRlZCB2ZXJzaW9uIGluIHRoZSBgbmV4dGAgYnJhbmNoLCBvciBhblxuICAgIC8vIGFjY2lkZW50YWxseSBjcmVhdGVkIGJyYW5jaCBieSB0aGUgY2FyZXRha2VyLiBJbiBlaXRoZXIgd2F5IHdlIHdhbnQgdG8gcmFpc2UgYXdhcmVuZXNzLlxuICAgIGlmIChzZW12ZXIuZ3QocGFyc2VkLCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbikpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIGBEaXNjb3ZlcmVkIHVuZXhwZWN0ZWQgdmVyc2lvbi1icmFuY2ggXCIke25hbWV9XCIgZm9yIGEgcmVsZWFzZS10cmFpbiB0aGF0IGlzIGAgK1xuICAgICAgICAgIGBtb3JlIHJlY2VudCB0aGFuIHRoZSByZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaC4gYCArXG4gICAgICAgICAgYFBsZWFzZSBlaXRoZXIgZGVsZXRlIHRoZSBicmFuY2ggaWYgY3JlYXRlZCBieSBhY2NpZGVudCwgb3IgdXBkYXRlIHRoZSBvdXRkYXRlZCBgICtcbiAgICAgICAgICBgdmVyc2lvbiBpbiB0aGUgbmV4dCBicmFuY2ggKCR7bmV4dEJyYW5jaE5hbWV9KS5gKTtcbiAgICB9IGVsc2UgaWYgKHNlbXZlci5lcShwYXJzZWQsIG5leHRSZWxlYXNlVHJhaW5WZXJzaW9uKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCB2ZXJzaW9uLWJyYW5jaCBcIiR7bmFtZX1cIiBmb3IgYSByZWxlYXNlLXRyYWluIHRoYXQgaXMgYWxyZWFkeSBgICtcbiAgICAgICAgICBgYWN0aXZlIGluIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLiBQbGVhc2UgZWl0aGVyIGRlbGV0ZSB0aGUgYnJhbmNoIGlmIGAgK1xuICAgICAgICAgIGBjcmVhdGVkIGJ5IGFjY2lkZW50LCBvciB1cGRhdGUgdGhlIHZlcnNpb24gaW4gdGhlIG5leHQgYnJhbmNoICgke25leHRCcmFuY2hOYW1lfSkuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBuYW1lKTtcbiAgICBjb25zdCByZWxlYXNlVHJhaW4gPSBuZXcgUmVsZWFzZVRyYWluKG5hbWUsIHZlcnNpb24pO1xuICAgIGNvbnN0IGlzUHJlcmVsZWFzZSA9IHZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ3JjJyB8fCB2ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICduZXh0JztcblxuICAgIGlmIChpc1ByZXJlbGVhc2UpIHtcbiAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBkZXRlcm1pbmUgbGF0ZXN0IHJlbGVhc2UtdHJhaW4uIEZvdW5kIHR3byBjb25zZWN1dGl2ZSBgICtcbiAgICAgICAgICAgIGBicmFuY2hlcyBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gRGlkIG5vdCBleHBlY3QgYm90aCBcIiR7bmFtZX1cIiBgICtcbiAgICAgICAgICAgIGBhbmQgXCIke3JlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZX1cIiB0byBiZSBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBtb2RlLmApO1xuICAgICAgfSBlbHNlIGlmICh2ZXJzaW9uLm1ham9yICE9PSBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvcikge1xuICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgIGBEaXNjb3ZlcmVkIHVuZXhwZWN0ZWQgb2xkIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gRXhwZWN0ZWQgbm8gYCArXG4gICAgICAgICAgICBgdmVyc2lvbi1icmFuY2ggaW4gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgbW9kZSBmb3IgdiR7dmVyc2lvbi5tYWpvcn0uYCk7XG4gICAgICB9XG4gICAgICByZWxlYXNlQ2FuZGlkYXRlID0gcmVsZWFzZVRyYWluO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXRlc3QgPSByZWxlYXNlVHJhaW47XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge3JlbGVhc2VDYW5kaWRhdGUsIGxhdGVzdH07XG59XG4iXX0=