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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZlLXJlbGVhc2UtdHJhaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQywrRkFBOEM7SUFDOUMsbUdBQXFIO0lBWXJILHlDQUF5QztJQUM1QixRQUFBLGNBQWMsR0FBRyxRQUFRLENBQUM7SUFFdkMsb0VBQW9FO0lBQ3BFLFNBQXNCLHdCQUF3QixDQUFDLElBQXVCOzs7Ozs0QkFFaEQscUJBQU0scUNBQWtCLENBQUMsSUFBSSxFQUFFLHNCQUFjLENBQUMsRUFBQTs7d0JBQTVELFdBQVcsR0FBRyxTQUE4Qzt3QkFDNUQsSUFBSSxHQUFHLElBQUksNkJBQVksQ0FBQyxzQkFBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3dCQUNyRCx1QkFBdUIsR0FBYSxFQUFFLENBQUM7d0JBRzdDLHdGQUF3Rjt3QkFDeEYsMEZBQTBGO3dCQUMxRiwyRkFBMkY7d0JBQzNGLHVGQUF1Rjt3QkFDdkYsMkZBQTJGO3dCQUMzRixzRkFBc0Y7d0JBQ3RGLHVGQUF1Rjt3QkFDdkYsRUFBRTt3QkFDRix1RkFBdUY7d0JBQ3ZGLCtGQUErRjt3QkFDL0Ysd0ZBQXdGO3dCQUN4Rix3RkFBd0Y7d0JBQ3hGLDBGQUEwRjt3QkFDMUYsNEVBQTRFO3dCQUM1RSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFOzRCQUMzQiw2QkFBNkIsR0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzs0QkFDdEQsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7eUJBQ3JEOzZCQUFNLElBQUksV0FBVyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7NEJBQ2xDLDZCQUE2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SSxDQUFBO3FDQUNwRixXQUFRLGdCQUFnQixDQUFDLFVBQVUsdURBQW1ELENBQUEsQ0FBQyxDQUFDOzZCQUM3RjtpQ0FBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssNkJBQTZCLEVBQUU7Z0NBQzFELE1BQU0sS0FBSyxDQUNQLGlGQUFpRjtxQ0FDakYsa0VBQWdFLE9BQU8sQ0FBQyxLQUFLLE1BQUcsQ0FBQSxDQUFDLENBQUM7NkJBQ3ZGOzRCQUNELGdCQUFnQixHQUFHLFlBQVksQ0FBQzt5QkFDakM7NkJBQU07NEJBQ0wsTUFBTSxHQUFHLFlBQVksQ0FBQzs0QkFDdEIsd0JBQU07eUJBQ1A7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBR0gsc0JBQU8sRUFBQyxnQkFBZ0Isa0JBQUEsRUFBRSxNQUFNLFFBQUEsRUFBQyxFQUFDOzs7O0tBQ25DO0lBL0RELGdHQStEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlVHJhaW59IGZyb20gJy4vcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtnZXRCcmFuY2hlc0Zvck1ham9yVmVyc2lvbnMsIGdldFZlcnNpb25PZkJyYW5jaCwgR2l0aHViUmVwb1dpdGhBcGksIFZlcnNpb25CcmFuY2h9IGZyb20gJy4vdmVyc2lvbi1icmFuY2hlcyc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBkZXRlcm1pbmVkIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmb3IgYSBwcm9qZWN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3RpdmVSZWxlYXNlVHJhaW5zIHtcbiAgLyoqIFJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcInJlbGVhc2UtY2FuZGlkYXRlXCIgb3IgXCJmZWF0dXJlLWZyZWV6ZVwiIHBoYXNlLiAqL1xuICByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW58bnVsbDtcbiAgLyoqIFJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcImxhdGVzdFwiIHBoYXNlLiAqL1xuICBsYXRlc3Q6IFJlbGVhc2VUcmFpbjtcbiAgLyoqIFJlbGVhc2UtdHJhaW4gaW4gdGhlIGBuZXh0YCBwaGFzZS4gKi9cbiAgbmV4dDogUmVsZWFzZVRyYWluO1xufVxuXG4vKiogQnJhbmNoIG5hbWUgZm9yIHRoZSBgbmV4dGAgYnJhbmNoLiAqL1xuZXhwb3J0IGNvbnN0IG5leHRCcmFuY2hOYW1lID0gJ21hc3Rlcic7XG5cbi8qKiBGZXRjaGVzIHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpKTpcbiAgICBQcm9taXNlPEFjdGl2ZVJlbGVhc2VUcmFpbnM+IHtcbiAgY29uc3QgbmV4dFZlcnNpb24gPSBhd2FpdCBnZXRWZXJzaW9uT2ZCcmFuY2gocmVwbywgbmV4dEJyYW5jaE5hbWUpO1xuICBjb25zdCBuZXh0ID0gbmV3IFJlbGVhc2VUcmFpbihuZXh0QnJhbmNoTmFtZSwgbmV4dFZlcnNpb24pO1xuICBjb25zdCBtYWpvclZlcnNpb25zVG9Db25zaWRlcjogbnVtYmVyW10gPSBbXTtcbiAgbGV0IGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yOiBudW1iZXI7XG5cbiAgLy8gSWYgdGhlIGBuZXh0YCBicmFuY2ggKGkuZS4gYG1hc3RlcmAgYnJhbmNoKSBpcyBmb3IgYW4gdXBjb21pbmcgbWFqb3IgdmVyc2lvbiwgd2Uga25vd1xuICAvLyB0aGF0IHRoZXJlIGlzIG5vIHBhdGNoIGJyYW5jaCBvciBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggZm9yIHRoaXMgbWFqb3JcbiAgLy8gZGlnaXQuIElmIHRoZSBjdXJyZW50IGBuZXh0YCB2ZXJzaW9uIGlzIHRoZSBmaXJzdCBtaW5vciBvZiBhIG1ham9yIHZlcnNpb24sIHdlIGtub3cgdGhhdFxuICAvLyB0aGUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoIGNhbiBvbmx5IGJlIHRoZSBhY3R1YWwgbWFqb3IgYnJhbmNoLiBUaGVcbiAgLy8gcGF0Y2ggYnJhbmNoIGlzIGJhc2VkIG9uIHRoYXQsIGVpdGhlciB0aGUgYWN0dWFsIG1ham9yIGJyYW5jaCBvciB0aGUgbGFzdCBtaW5vciBmcm9tIHRoZVxuICAvLyBwcmVjZWRpbmcgbWFqb3IgdmVyc2lvbi4gSW4gYWxsIG90aGVyIGNhc2VzLCB0aGUgcGF0Y2ggYnJhbmNoIGFuZCBmZWF0dXJlLWZyZWV6ZSBvclxuICAvLyByZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggYXJlIHBhcnQgb2YgdGhlIHNhbWUgbWFqb3IgdmVyc2lvbi4gQ29uc2lkZXIgdGhlIGZvbGxvd2luZzpcbiAgLy9cbiAgLy8gIENBU0UgMS4gbmV4dDogMTEuMC4wLW5leHQuMDogcGF0Y2ggYW5kIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGNhbiBvbmx5IGJlXG4gIC8vICAgICAgICAgIG1vc3QgcmVjZW50IGAxMC48Pi54YCBicmFuY2hlcy4gVGhlIEZGL1JDIGJyYW5jaCBjYW4gb25seSBiZSB0aGUgbGFzdC1taW5vciBvZiB2MTAuXG4gIC8vICBDQVNFIDIuIG5leHQ6IDExLjEuMC1uZXh0LjA6IHBhdGNoIGNhbiBiZSBlaXRoZXIgYDExLjAueGAgb3IgbGFzdC1taW5vciBpbiB2MTAgYmFzZWRcbiAgLy8gICAgICAgICAgb24gd2hldGhlciB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCAoPT4gYDExLjAueGApLlxuICAvLyAgQ0FTRSAzLiBuZXh0OiAxMC42LjAtbmV4dC4wOiBwYXRjaCBjYW4gYmUgZWl0aGVyIGAxMC41LnhgIG9yIGAxMC40LnhgIGJhc2VkIG9uIHdoZXRoZXJcbiAgLy8gICAgICAgICAgdGhlcmUgaXMgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggKD0+IGAxMC41LnhgKVxuICBpZiAobmV4dFZlcnNpb24ubWlub3IgPT09IDApIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yIC0gMTtcbiAgICBtYWpvclZlcnNpb25zVG9Db25zaWRlci5wdXNoKG5leHRWZXJzaW9uLm1ham9yIC0gMSk7XG4gIH0gZWxzZSBpZiAobmV4dFZlcnNpb24ubWlub3IgPT09IDEpIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IsIG5leHRWZXJzaW9uLm1ham9yIC0gMSk7XG4gIH0gZWxzZSB7XG4gICAgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IgPSBuZXh0VmVyc2lvbi5tYWpvcjtcbiAgICBtYWpvclZlcnNpb25zVG9Db25zaWRlci5wdXNoKG5leHRWZXJzaW9uLm1ham9yKTtcbiAgfVxuXG4gIC8vIENvbGxlY3QgYWxsIHZlcnNpb24tYnJhbmNoZXMgdGhhdCBzaG91bGQgYmUgY29uc2lkZXJlZCBmb3IgdGhlIGxhdGVzdCB2ZXJzaW9uLWJyYW5jaCxcbiAgLy8gb3IgdGhlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlLlxuICBjb25zdCBicmFuY2hlcyA9IChhd2FpdCBnZXRCcmFuY2hlc0Zvck1ham9yVmVyc2lvbnMocmVwbywgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIpKTtcbiAgY29uc3Qge2xhdGVzdCwgcmVsZWFzZUNhbmRpZGF0ZX0gPSBhd2FpdCBmaW5kQWN0aXZlUmVsZWFzZVRyYWluc0Zyb21WZXJzaW9uQnJhbmNoZXMoXG4gICAgICByZXBvLCBuZXh0VmVyc2lvbiwgYnJhbmNoZXMsIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yKTtcblxuICBpZiAobGF0ZXN0ID09PSBudWxsKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gZGV0ZXJtaW5lIHRoZSBsYXRlc3QgcmVsZWFzZS10cmFpbi4gVGhlIGZvbGxvd2luZyBicmFuY2hlcyBgICtcbiAgICAgICAgYGhhdmUgYmVlbiBjb25zaWRlcmVkOiBbJHticmFuY2hlcy5tYXAoYiA9PiBiLm5hbWUpLmpvaW4oJywgJyl9XWApO1xuICB9XG5cbiAgcmV0dXJuIHtyZWxlYXNlQ2FuZGlkYXRlLCBsYXRlc3QsIG5leHR9O1xufVxuXG4vKiogRmluZHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgZnJvbSB0aGUgc3BlY2lmaWVkIHZlcnNpb24gYnJhbmNoZXMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZEFjdGl2ZVJlbGVhc2VUcmFpbnNGcm9tVmVyc2lvbkJyYW5jaGVzKFxuICAgIHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpLCBuZXh0VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgYnJhbmNoZXM6IFZlcnNpb25CcmFuY2hbXSxcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvcjogbnVtYmVyKTogUHJvbWlzZTx7XG4gIGxhdGVzdDogUmVsZWFzZVRyYWluIHwgbnVsbCxcbiAgcmVsZWFzZUNhbmRpZGF0ZTogUmVsZWFzZVRyYWluIHwgbnVsbCxcbn0+IHtcbiAgLy8gVmVyc2lvbiByZXByZXNlbnRpbmcgdGhlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBuZXh0IHBoYXNlLiBOb3RlIHRoYXQgd2UgaWdub3JlXG4gIC8vIHBhdGNoIGFuZCBwcmUtcmVsZWFzZSBzZWdtZW50cyBpbiBvcmRlciB0byBiZSBhYmxlIHRvIGNvbXBhcmUgdGhlIG5leHQgcmVsZWFzZSB0cmFpbiB0b1xuICAvLyBvdGhlciByZWxlYXNlIHRyYWlucyBmcm9tIHZlcnNpb24gYnJhbmNoZXMgKHdoaWNoIGZvbGxvdyB0aGUgYE4uTi54YCBwYXR0ZXJuKS5cbiAgY29uc3QgbmV4dFJlbGVhc2VUcmFpblZlcnNpb24gPSBzZW12ZXIucGFyc2UoYCR7bmV4dFZlcnNpb24ubWFqb3J9LiR7bmV4dFZlcnNpb24ubWlub3J9LjBgKSE7XG5cbiAgbGV0IGxhdGVzdDogUmVsZWFzZVRyYWlufG51bGwgPSBudWxsO1xuICBsZXQgcmVsZWFzZUNhbmRpZGF0ZTogUmVsZWFzZVRyYWlufG51bGwgPSBudWxsO1xuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgY2FwdHVyZWQgYnJhbmNoZXMgYW5kIGZpbmQgdGhlIGxhdGVzdCBub24tcHJlcmVsZWFzZSBicmFuY2ggYW5kIGFcbiAgLy8gcG90ZW50aWFsIHJlbGVhc2UgY2FuZGlkYXRlIGJyYW5jaC4gRnJvbSB0aGUgY29sbGVjdGVkIGJyYW5jaGVzIHdlIGl0ZXJhdGUgZGVzY2VuZGluZ1xuICAvLyBvcmRlciAobW9zdCByZWNlbnQgc2VtYW50aWMgdmVyc2lvbi1icmFuY2ggZmlyc3QpLiBUaGUgZmlyc3QgYnJhbmNoIGlzIGVpdGhlciB0aGUgbGF0ZXN0XG4gIC8vIGFjdGl2ZSB2ZXJzaW9uIGJyYW5jaCAoaS5lLiBwYXRjaCkgb3IgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2guIEEgRkYvUkNcbiAgLy8gYnJhbmNoIGNhbm5vdCBiZSBvbGRlciB0aGFuIHRoZSBsYXRlc3QgYWN0aXZlIHZlcnNpb24tYnJhbmNoLCBzbyB3ZSBzdG9wIGl0ZXJhdGluZyBvbmNlXG4gIC8vIHdlIGZvdW5kIHN1Y2ggYSBicmFuY2guIE90aGVyd2lzZSwgaWYgd2UgZm91bmQgYSBGRi9SQyBicmFuY2gsIHdlIGNvbnRpbnVlIGxvb2tpbmcgZm9yIHRoZVxuICAvLyBuZXh0IHZlcnNpb24tYnJhbmNoIGFzIHRoYXQgb25lIGlzIHN1cHBvc2VkIHRvIGJlIHRoZSBsYXRlc3QgYWN0aXZlIHZlcnNpb24tYnJhbmNoLiBJZiBpdFxuICAvLyBpcyBub3QsIHRoZW4gYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24gZHVlIHRvIHR3byBGRi9SQyBicmFuY2hlcyBleGlzdGluZyBhdCB0aGUgc2FtZSB0aW1lLlxuICBmb3IgKGNvbnN0IHtuYW1lLCBwYXJzZWR9IG9mIGJyYW5jaGVzKSB7XG4gICAgLy8gSXQgY2FuIGhhcHBlbiB0aGF0IHZlcnNpb24gYnJhbmNoZXMgaGF2ZSBiZWVuIGFjY2lkZW50YWxseSBjcmVhdGVkIHdoaWNoIGFyZSBtb3JlIHJlY2VudFxuICAgIC8vIHRoYW4gdGhlIHJlbGVhc2UtdHJhaW4gaW4gdGhlIG5leHQgYnJhbmNoIChpLmUuIGBtYXN0ZXJgKS4gV2UgY291bGQgaWdub3JlIHN1Y2ggYnJhbmNoZXNcbiAgICAvLyBzaWxlbnRseSwgYnV0IGl0IG1pZ2h0IGJlIHN5bXB0b21hdGljIGZvciBhbiBvdXRkYXRlZCB2ZXJzaW9uIGluIHRoZSBgbmV4dGAgYnJhbmNoLCBvciBhblxuICAgIC8vIGFjY2lkZW50YWxseSBjcmVhdGVkIGJyYW5jaCBieSB0aGUgY2FyZXRha2VyLiBJbiBlaXRoZXIgd2F5IHdlIHdhbnQgdG8gcmFpc2UgYXdhcmVuZXNzLlxuICAgIGlmIChzZW12ZXIuZ3QocGFyc2VkLCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbikpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIGBEaXNjb3ZlcmVkIHVuZXhwZWN0ZWQgdmVyc2lvbi1icmFuY2ggXCIke25hbWV9XCIgZm9yIGEgcmVsZWFzZS10cmFpbiB0aGF0IGlzIGAgK1xuICAgICAgICAgIGBtb3JlIHJlY2VudCB0aGFuIHRoZSByZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaC4gYCArXG4gICAgICAgICAgYFBsZWFzZSBlaXRoZXIgZGVsZXRlIHRoZSBicmFuY2ggaWYgY3JlYXRlZCBieSBhY2NpZGVudCwgb3IgdXBkYXRlIHRoZSBvdXRkYXRlZCBgICtcbiAgICAgICAgICBgdmVyc2lvbiBpbiB0aGUgbmV4dCBicmFuY2ggKCR7bmV4dEJyYW5jaE5hbWV9KS5gKTtcbiAgICB9IGVsc2UgaWYgKHNlbXZlci5lcShwYXJzZWQsIG5leHRSZWxlYXNlVHJhaW5WZXJzaW9uKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCB2ZXJzaW9uLWJyYW5jaCBcIiR7bmFtZX1cIiBmb3IgYSByZWxlYXNlLXRyYWluIHRoYXQgaXMgYWxyZWFkeSBgICtcbiAgICAgICAgICBgYWN0aXZlIGluIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLiBQbGVhc2UgZWl0aGVyIGRlbGV0ZSB0aGUgYnJhbmNoIGlmIGAgK1xuICAgICAgICAgIGBjcmVhdGVkIGJ5IGFjY2lkZW50LCBvciB1cGRhdGUgdGhlIHZlcnNpb24gaW4gdGhlIG5leHQgYnJhbmNoICgke25leHRCcmFuY2hOYW1lfSkuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBuYW1lKTtcbiAgICBjb25zdCByZWxlYXNlVHJhaW4gPSBuZXcgUmVsZWFzZVRyYWluKG5hbWUsIHZlcnNpb24pO1xuICAgIGNvbnN0IGlzUHJlcmVsZWFzZSA9IHZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ3JjJyB8fCB2ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICduZXh0JztcblxuICAgIGlmIChpc1ByZXJlbGVhc2UpIHtcbiAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBkZXRlcm1pbmUgbGF0ZXN0IHJlbGVhc2UtdHJhaW4uIEZvdW5kIHR3byBjb25zZWN1dGl2ZSBgICtcbiAgICAgICAgICAgIGBicmFuY2hlcyBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gRGlkIG5vdCBleHBlY3QgYm90aCBcIiR7bmFtZX1cIiBgICtcbiAgICAgICAgICAgIGBhbmQgXCIke3JlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZX1cIiB0byBiZSBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBtb2RlLmApO1xuICAgICAgfSBlbHNlIGlmICh2ZXJzaW9uLm1ham9yICE9PSBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvcikge1xuICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgIGBEaXNjb3ZlcmVkIHVuZXhwZWN0ZWQgb2xkIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gRXhwZWN0ZWQgbm8gYCArXG4gICAgICAgICAgICBgdmVyc2lvbi1icmFuY2ggaW4gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgbW9kZSBmb3IgdiR7dmVyc2lvbi5tYWpvcn0uYCk7XG4gICAgICB9XG4gICAgICByZWxlYXNlQ2FuZGlkYXRlID0gcmVsZWFzZVRyYWluO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXRlc3QgPSByZWxlYXNlVHJhaW47XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge3JlbGVhc2VDYW5kaWRhdGUsIGxhdGVzdH07XG59XG4iXX0=