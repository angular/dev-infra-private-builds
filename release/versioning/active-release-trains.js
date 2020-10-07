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
                        branches = (_b.sent());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZlLXJlbGVhc2UtdHJhaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQywrRkFBOEM7SUFDOUMsbUdBQXFIO0lBWXJILHlDQUF5QztJQUM1QixRQUFBLGNBQWMsR0FBRyxRQUFRLENBQUM7SUFFdkMsb0VBQW9FO0lBQ3BFLFNBQXNCLHdCQUF3QixDQUFDLElBQXVCOzs7Ozs0QkFFaEQscUJBQU0scUNBQWtCLENBQUMsSUFBSSxFQUFFLHNCQUFjLENBQUMsRUFBQTs7d0JBQTVELFdBQVcsR0FBRyxTQUE4Qzt3QkFDNUQsSUFBSSxHQUFHLElBQUksNkJBQVksQ0FBQyxzQkFBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3dCQUNyRCx1QkFBdUIsR0FBYSxFQUFFLENBQUM7d0JBRzdDLHdGQUF3Rjt3QkFDeEYsMEZBQTBGO3dCQUMxRiwyRkFBMkY7d0JBQzNGLHVGQUF1Rjt3QkFDdkYsMkZBQTJGO3dCQUMzRixzRkFBc0Y7d0JBQ3RGLHVGQUF1Rjt3QkFDdkYsRUFBRTt3QkFDRix1RkFBdUY7d0JBQ3ZGLCtGQUErRjt3QkFDL0Ysd0ZBQXdGO3dCQUN4Rix3RkFBd0Y7d0JBQ3hGLDBGQUEwRjt3QkFDMUYsNEVBQTRFO3dCQUM1RSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFOzRCQUMzQiw2QkFBNkIsR0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzs0QkFDdEQsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7eUJBQ3JEOzZCQUFNLElBQUksV0FBVyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7NEJBQ2xDLDZCQUE2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SSxDQUFBO3FDQUNwRixXQUFRLGdCQUFnQixDQUFDLFVBQVUsdURBQW1ELENBQUEsQ0FBQyxDQUFDOzZCQUM3RjtpQ0FBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssNkJBQTZCLEVBQUU7Z0NBQzFELE1BQU0sS0FBSyxDQUNQLGlGQUFpRjtxQ0FDakYsa0VBQWdFLE9BQU8sQ0FBQyxLQUFLLE1BQUcsQ0FBQSxDQUFDLENBQUM7NkJBQ3ZGOzRCQUNELGdCQUFnQixHQUFHLFlBQVksQ0FBQzt5QkFDakM7NkJBQU07NEJBQ0wsTUFBTSxHQUFHLFlBQVksQ0FBQzs0QkFDdEIsd0JBQU07eUJBQ1A7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBR0gsc0JBQU8sRUFBQyxnQkFBZ0Isa0JBQUEsRUFBRSxNQUFNLFFBQUEsRUFBQyxFQUFDOzs7O0tBQ25DO0lBL0RELGdHQStEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlVHJhaW59IGZyb20gJy4vcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtnZXRCcmFuY2hlc0Zvck1ham9yVmVyc2lvbnMsIGdldFZlcnNpb25PZkJyYW5jaCwgR2l0aHViUmVwb1dpdGhBcGksIFZlcnNpb25CcmFuY2h9IGZyb20gJy4vdmVyc2lvbi1icmFuY2hlcyc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBkZXRlcm1pbmVkIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmb3IgYSBwcm9qZWN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3RpdmVSZWxlYXNlVHJhaW5zIHtcbiAgLyoqIFJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcInJlbGVhc2UtY2FuZGlkYXRlXCIgb3IgXCJmZWF0dXJlLWZyZWV6ZVwiIHBoYXNlLiAqL1xuICByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW58bnVsbDtcbiAgLyoqIFJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcImxhdGVzdFwiIHBoYXNlLiAqL1xuICBsYXRlc3Q6IFJlbGVhc2VUcmFpbjtcbiAgLyoqIFJlbGVhc2UtdHJhaW4gaW4gdGhlIGBuZXh0YCBwaGFzZSAqL1xuICBuZXh0OiBSZWxlYXNlVHJhaW47XG59XG5cbi8qKiBCcmFuY2ggbmFtZSBmb3IgdGhlIGBuZXh0YCBicmFuY2guICovXG5leHBvcnQgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSAnbWFzdGVyJztcblxuLyoqIEZldGNoZXMgdGhlIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbzogR2l0aHViUmVwb1dpdGhBcGkpOlxuICAgIFByb21pc2U8QWN0aXZlUmVsZWFzZVRyYWlucz4ge1xuICBjb25zdCBuZXh0VmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBuZXh0QnJhbmNoTmFtZSk7XG4gIGNvbnN0IG5leHQgPSBuZXcgUmVsZWFzZVRyYWluKG5leHRCcmFuY2hOYW1lLCBuZXh0VmVyc2lvbik7XG4gIGNvbnN0IG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyOiBudW1iZXJbXSA9IFtdO1xuICBsZXQgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3I6IG51bWJlcjtcblxuICAvLyBJZiB0aGUgYG5leHRgIGJyYW5jaCAoaS5lLiBgbWFzdGVyYCBicmFuY2gpIGlzIGZvciBhbiB1cGNvbWluZyBtYWpvciB2ZXJzaW9uLCB3ZSBrbm93XG4gIC8vIHRoYXQgdGhlcmUgaXMgbm8gcGF0Y2ggYnJhbmNoIG9yIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBmb3IgdGhpcyBtYWpvclxuICAvLyBkaWdpdC4gSWYgdGhlIGN1cnJlbnQgYG5leHRgIHZlcnNpb24gaXMgdGhlIGZpcnN0IG1pbm9yIG9mIGEgbWFqb3IgdmVyc2lvbiwgd2Uga25vdyB0aGF0XG4gIC8vIHRoZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggY2FuIG9ubHkgYmUgdGhlIGFjdHVhbCBtYWpvciBicmFuY2guIFRoZVxuICAvLyBwYXRjaCBicmFuY2ggaXMgYmFzZWQgb24gdGhhdCwgZWl0aGVyIHRoZSBhY3R1YWwgbWFqb3IgYnJhbmNoIG9yIHRoZSBsYXN0IG1pbm9yIGZyb20gdGhlXG4gIC8vIHByZWNlZGluZyBtYWpvciB2ZXJzaW9uLiBJbiBhbGwgb3RoZXIgY2FzZXMsIHRoZSBwYXRjaCBicmFuY2ggYW5kIGZlYXR1cmUtZnJlZXplIG9yXG4gIC8vIHJlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBhcmUgcGFydCBvZiB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLiBDb25zaWRlciB0aGUgZm9sbG93aW5nOlxuICAvL1xuICAvLyAgQ0FTRSAxLiBuZXh0OiAxMS4wLjAtbmV4dC4wOiBwYXRjaCBhbmQgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgY2FuIG9ubHkgYmVcbiAgLy8gICAgICAgICAgbW9zdCByZWNlbnQgYDEwLjw+LnhgIGJyYW5jaGVzLiBUaGUgRkYvUkMgYnJhbmNoIGNhbiBvbmx5IGJlIHRoZSBsYXN0LW1pbm9yIG9mIHYxMC5cbiAgLy8gIENBU0UgMi4gbmV4dDogMTEuMS4wLW5leHQuMDogcGF0Y2ggY2FuIGJlIGVpdGhlciBgMTEuMC54YCBvciBsYXN0LW1pbm9yIGluIHYxMCBiYXNlZFxuICAvLyAgICAgICAgICBvbiB3aGV0aGVyIHRoZXJlIGlzIGEgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICg9PiBgMTEuMC54YCkuXG4gIC8vICBDQVNFIDMuIG5leHQ6IDEwLjYuMC1uZXh0LjA6IHBhdGNoIGNhbiBiZSBlaXRoZXIgYDEwLjUueGAgb3IgYDEwLjQueGAgYmFzZWQgb24gd2hldGhlclxuICAvLyAgICAgICAgICB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCAoPT4gYDEwLjUueGApXG4gIGlmIChuZXh0VmVyc2lvbi5taW5vciA9PT0gMCkge1xuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yID0gbmV4dFZlcnNpb24ubWFqb3IgLSAxO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IgLSAxKTtcbiAgfSBlbHNlIGlmIChuZXh0VmVyc2lvbi5taW5vciA9PT0gMSkge1xuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yID0gbmV4dFZlcnNpb24ubWFqb3I7XG4gICAgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIucHVzaChuZXh0VmVyc2lvbi5tYWpvciwgbmV4dFZlcnNpb24ubWFqb3IgLSAxKTtcbiAgfSBlbHNlIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IpO1xuICB9XG5cbiAgLy8gQ29sbGVjdCBhbGwgdmVyc2lvbi1icmFuY2hlcyB0aGF0IHNob3VsZCBiZSBjb25zaWRlcmVkIGZvciB0aGUgbGF0ZXN0IHZlcnNpb24tYnJhbmNoLFxuICAvLyBvciB0aGUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUuXG4gIGNvbnN0IGJyYW5jaGVzID0gKGF3YWl0IGdldEJyYW5jaGVzRm9yTWFqb3JWZXJzaW9ucyhyZXBvLCBtYWpvclZlcnNpb25zVG9Db25zaWRlcikpO1xuICBjb25zdCB7bGF0ZXN0LCByZWxlYXNlQ2FuZGlkYXRlfSA9IGF3YWl0IGZpbmRBY3RpdmVSZWxlYXNlVHJhaW5zRnJvbVZlcnNpb25CcmFuY2hlcyhcbiAgICAgIHJlcG8sIG5leHRWZXJzaW9uLCBicmFuY2hlcywgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IpO1xuXG4gIGlmIChsYXRlc3QgPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBkZXRlcm1pbmUgdGhlIGxhdGVzdCByZWxlYXNlLXRyYWluLiBUaGUgZm9sbG93aW5nIGJyYW5jaGVzIGAgK1xuICAgICAgICBgaGF2ZSBiZWVuIGNvbnNpZGVyZWQ6IFske2JyYW5jaGVzLm1hcChiID0+IGIubmFtZSkuam9pbignLCAnKX1dYCk7XG4gIH1cblxuICByZXR1cm4ge3JlbGVhc2VDYW5kaWRhdGUsIGxhdGVzdCwgbmV4dH07XG59XG5cbi8qKiBGaW5kcyB0aGUgY3VycmVudGx5IGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmcm9tIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBicmFuY2hlcy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kQWN0aXZlUmVsZWFzZVRyYWluc0Zyb21WZXJzaW9uQnJhbmNoZXMoXG4gICAgcmVwbzogR2l0aHViUmVwb1dpdGhBcGksIG5leHRWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBicmFuY2hlczogVmVyc2lvbkJyYW5jaFtdLFxuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yOiBudW1iZXIpOiBQcm9taXNlPHtcbiAgbGF0ZXN0OiBSZWxlYXNlVHJhaW4gfCBudWxsLFxuICByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW4gfCBudWxsLFxufT4ge1xuICAvLyBWZXJzaW9uIHJlcHJlc2VudGluZyB0aGUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIG5leHQgcGhhc2UuIE5vdGUgdGhhdCB3ZSBpZ25vcmVcbiAgLy8gcGF0Y2ggYW5kIHByZS1yZWxlYXNlIHNlZ21lbnRzIGluIG9yZGVyIHRvIGJlIGFibGUgdG8gY29tcGFyZSB0aGUgbmV4dCByZWxlYXNlIHRyYWluIHRvXG4gIC8vIG90aGVyIHJlbGVhc2UgdHJhaW5zIGZyb20gdmVyc2lvbiBicmFuY2hlcyAod2hpY2ggZm9sbG93IHRoZSBgTi5OLnhgIHBhdHRlcm4pLlxuICBjb25zdCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbiA9IHNlbXZlci5wYXJzZShgJHtuZXh0VmVyc2lvbi5tYWpvcn0uJHtuZXh0VmVyc2lvbi5taW5vcn0uMGApITtcblxuICBsZXQgbGF0ZXN0OiBSZWxlYXNlVHJhaW58bnVsbCA9IG51bGw7XG4gIGxldCByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW58bnVsbCA9IG51bGw7XG5cbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBjYXB0dXJlZCBicmFuY2hlcyBhbmQgZmluZCB0aGUgbGF0ZXN0IG5vbi1wcmVyZWxlYXNlIGJyYW5jaCBhbmQgYVxuICAvLyBwb3RlbnRpYWwgcmVsZWFzZSBjYW5kaWRhdGUgYnJhbmNoLiBGcm9tIHRoZSBjb2xsZWN0ZWQgYnJhbmNoZXMgd2UgaXRlcmF0ZSBkZXNjZW5kaW5nXG4gIC8vIG9yZGVyIChtb3N0IHJlY2VudCBzZW1hbnRpYyB2ZXJzaW9uLWJyYW5jaCBmaXJzdCkuIFRoZSBmaXJzdCBicmFuY2ggaXMgZWl0aGVyIHRoZSBsYXRlc3RcbiAgLy8gYWN0aXZlIHZlcnNpb24gYnJhbmNoIChpLmUuIHBhdGNoKSBvciBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gQSBGRi9SQ1xuICAvLyBicmFuY2ggY2Fubm90IGJlIG9sZGVyIHRoYW4gdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2gsIHNvIHdlIHN0b3AgaXRlcmF0aW5nIG9uY2VcbiAgLy8gd2UgZm91bmQgc3VjaCBhIGJyYW5jaC4gT3RoZXJ3aXNlLCBpZiB3ZSBmb3VuZCBhIEZGL1JDIGJyYW5jaCwgd2UgY29udGludWUgbG9va2luZyBmb3IgdGhlXG4gIC8vIG5leHQgdmVyc2lvbi1icmFuY2ggYXMgdGhhdCBvbmUgaXMgc3VwcG9zZWQgdG8gYmUgdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2guIElmIGl0XG4gIC8vIGlzIG5vdCwgdGhlbiBhbiBlcnJvciB3aWxsIGJlIHRocm93biBkdWUgdG8gdHdvIEZGL1JDIGJyYW5jaGVzIGV4aXN0aW5nIGF0IHRoZSBzYW1lIHRpbWUuXG4gIGZvciAoY29uc3Qge25hbWUsIHBhcnNlZH0gb2YgYnJhbmNoZXMpIHtcbiAgICAvLyBJdCBjYW4gaGFwcGVuIHRoYXQgdmVyc2lvbiBicmFuY2hlcyBoYXZlIGJlZW4gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgd2hpY2ggYXJlIG1vcmUgcmVjZW50XG4gICAgLy8gdGhhbiB0aGUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbmV4dCBicmFuY2ggKGkuZS4gYG1hc3RlcmApLiBXZSBjb3VsZCBpZ25vcmUgc3VjaCBicmFuY2hlc1xuICAgIC8vIHNpbGVudGx5LCBidXQgaXQgbWlnaHQgYmUgc3ltcHRvbWF0aWMgZm9yIGFuIG91dGRhdGVkIHZlcnNpb24gaW4gdGhlIGBuZXh0YCBicmFuY2gsIG9yIGFuXG4gICAgLy8gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgYnJhbmNoIGJ5IHRoZSBjYXJldGFrZXIuIEluIGVpdGhlciB3YXkgd2Ugd2FudCB0byByYWlzZSBhd2FyZW5lc3MuXG4gICAgaWYgKHNlbXZlci5ndChwYXJzZWQsIG5leHRSZWxlYXNlVHJhaW5WZXJzaW9uKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCB2ZXJzaW9uLWJyYW5jaCBcIiR7bmFtZX1cIiBmb3IgYSByZWxlYXNlLXRyYWluIHRoYXQgaXMgYCArXG4gICAgICAgICAgYG1vcmUgcmVjZW50IHRoYW4gdGhlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLiBgICtcbiAgICAgICAgICBgUGxlYXNlIGVpdGhlciBkZWxldGUgdGhlIGJyYW5jaCBpZiBjcmVhdGVkIGJ5IGFjY2lkZW50LCBvciB1cGRhdGUgdGhlIG91dGRhdGVkIGAgK1xuICAgICAgICAgIGB2ZXJzaW9uIGluIHRoZSBuZXh0IGJyYW5jaCAoJHtuZXh0QnJhbmNoTmFtZX0pLmApO1xuICAgIH0gZWxzZSBpZiAoc2VtdmVyLmVxKHBhcnNlZCwgbmV4dFJlbGVhc2VUcmFpblZlcnNpb24pKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICBgRGlzY292ZXJlZCB1bmV4cGVjdGVkIHZlcnNpb24tYnJhbmNoIFwiJHtuYW1lfVwiIGZvciBhIHJlbGVhc2UtdHJhaW4gdGhhdCBpcyBhbHJlYWR5IGAgK1xuICAgICAgICAgIGBhY3RpdmUgaW4gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guIFBsZWFzZSBlaXRoZXIgZGVsZXRlIHRoZSBicmFuY2ggaWYgYCArXG4gICAgICAgICAgYGNyZWF0ZWQgYnkgYWNjaWRlbnQsIG9yIHVwZGF0ZSB0aGUgdmVyc2lvbiBpbiB0aGUgbmV4dCBicmFuY2ggKCR7bmV4dEJyYW5jaE5hbWV9KS5gKTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvbk9mQnJhbmNoKHJlcG8sIG5hbWUpO1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbiA9IG5ldyBSZWxlYXNlVHJhaW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3QgaXNQcmVyZWxlYXNlID0gdmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAncmMnIHx8IHZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ25leHQnO1xuXG4gICAgaWYgKGlzUHJlcmVsZWFzZSkge1xuICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIGRldGVybWluZSBsYXRlc3QgcmVsZWFzZS10cmFpbi4gRm91bmQgdHdvIGNvbnNlY3V0aXZlIGAgK1xuICAgICAgICAgICAgYGJyYW5jaGVzIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBEaWQgbm90IGV4cGVjdCBib3RoIFwiJHtuYW1lfVwiIGAgK1xuICAgICAgICAgICAgYGFuZCBcIiR7cmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lfVwiIHRvIGJlIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIG1vZGUuYCk7XG4gICAgICB9IGVsc2UgaWYgKHZlcnNpb24ubWFqb3IgIT09IGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCBvbGQgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLiBFeHBlY3RlZCBubyBgICtcbiAgICAgICAgICAgIGB2ZXJzaW9uLWJyYW5jaCBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBtb2RlIGZvciB2JHt2ZXJzaW9uLm1ham9yfS5gKTtcbiAgICAgIH1cbiAgICAgIHJlbGVhc2VDYW5kaWRhdGUgPSByZWxlYXNlVHJhaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhdGVzdCA9IHJlbGVhc2VUcmFpbjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7cmVsZWFzZUNhbmRpZGF0ZSwgbGF0ZXN0fTtcbn1cbiJdfQ==