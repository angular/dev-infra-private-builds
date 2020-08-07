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
        define("@angular/dev-infra-private/pr/merge/defaults/branches", ["require", "exports", "tslib", "semver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findActiveVersionBranches = exports.getBranchesForMajorVersions = exports.getVersionForReleaseTrainBranch = exports.isReleaseTrainBranch = exports.getVersionOfBranch = exports.fetchActiveReleaseTrainBranches = exports.nextBranchName = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    /** Branch name for the `next` branch. */
    exports.nextBranchName = 'master';
    /** Regular expression that matches version-branches for a release-train. */
    var releaseTrainBranchNameRegex = /(\d+)\.(\d+)\.x/;
    /**
     * Fetches the active release train and its branches for the specified major version. i.e.
     * the latest active release-train branch name is resolved and an optional version-branch for
     * a currently active feature-freeze/release-candidate release-train.
     */
    function fetchActiveReleaseTrainBranches(repo, nextVersion) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var majorVersionsToConsider, expectedReleaseCandidateMajor, branches, _a, latestVersionBranch, releaseCandidateBranch;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
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
                        return [4 /*yield*/, getBranchesForMajorVersions(repo, majorVersionsToConsider)];
                    case 1:
                        branches = (_b.sent());
                        return [4 /*yield*/, findActiveVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor)];
                    case 2:
                        _a = _b.sent(), latestVersionBranch = _a.latestVersionBranch, releaseCandidateBranch = _a.releaseCandidateBranch;
                        if (latestVersionBranch === null) {
                            throw Error("Unable to determine the latest release-train. The following branches " +
                                ("have been considered: [" + branches.join(', ') + "]"));
                        }
                        return [2 /*return*/, { releaseCandidateBranch: releaseCandidateBranch, latestVersionBranch: latestVersionBranch }];
                }
            });
        });
    }
    exports.fetchActiveReleaseTrainBranches = fetchActiveReleaseTrainBranches;
    /** Gets the version of a given branch by reading the `package.json` upstream. */
    function getVersionOfBranch(repo, branchName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data, version, parsedVersion;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, repo.api.repos.getContents(tslib_1.__assign(tslib_1.__assign({}, repo), { path: '/package.json', ref: branchName }))];
                    case 1:
                        data = (_a.sent()).data;
                        version = JSON.parse(Buffer.from(data.content, 'base64').toString()).version;
                        parsedVersion = semver.parse(version);
                        if (parsedVersion === null) {
                            throw Error("Invalid version detected in following branch: " + branchName + ".");
                        }
                        return [2 /*return*/, parsedVersion];
                }
            });
        });
    }
    exports.getVersionOfBranch = getVersionOfBranch;
    /** Whether the given branch corresponds to a release-train branch. */
    function isReleaseTrainBranch(branchName) {
        return releaseTrainBranchNameRegex.test(branchName);
    }
    exports.isReleaseTrainBranch = isReleaseTrainBranch;
    /**
     * Converts a given version-branch into a SemVer version that can be used with SemVer
     * utilities. e.g. to determine semantic order, extract major digit, compare.
     *
     * For example `10.0.x` will become `10.0.0` in SemVer. The patch digit is not
     * relevant but needed for parsing. SemVer does not allow `x` as patch digit.
     */
    function getVersionForReleaseTrainBranch(branchName) {
        // Convert a given version-branch into a SemVer version that can be used
        // with the SemVer utilities. i.e. to determine semantic order.
        return semver.parse(branchName.replace(releaseTrainBranchNameRegex, '$1.$2.0'));
    }
    exports.getVersionForReleaseTrainBranch = getVersionForReleaseTrainBranch;
    /**
     * Gets the version branches for the specified major versions in descending
     * order. i.e. latest version branches first.
     */
    function getBranchesForMajorVersions(repo, majorVersions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var branchData, branches, branchData_1, branchData_1_1, name_1, parsed;
            var e_1, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, repo.api.repos.listBranches(tslib_1.__assign(tslib_1.__assign({}, repo), { protected: true }))];
                    case 1:
                        branchData = (_b.sent()).data;
                        branches = [];
                        try {
                            for (branchData_1 = tslib_1.__values(branchData), branchData_1_1 = branchData_1.next(); !branchData_1_1.done; branchData_1_1 = branchData_1.next()) {
                                name_1 = branchData_1_1.value.name;
                                if (!isReleaseTrainBranch(name_1)) {
                                    continue;
                                }
                                parsed = getVersionForReleaseTrainBranch(name_1);
                                // Collect all version-branches that match the specified major versions.
                                if (parsed !== null && majorVersions.includes(parsed.major)) {
                                    branches.push({ name: name_1, parsed: parsed });
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (branchData_1_1 && !branchData_1_1.done && (_a = branchData_1.return)) _a.call(branchData_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        // Sort captured version-branches in descending order.
                        return [2 /*return*/, branches.sort(function (a, b) { return semver.rcompare(a.parsed, b.parsed); })];
                }
            });
        });
    }
    exports.getBranchesForMajorVersions = getBranchesForMajorVersions;
    function findActiveVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var latestVersionBranch, releaseCandidateBranch, branches_1, branches_1_1, _a, name_2, parsed, version, isPrerelease, e_2_1;
            var e_2, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        latestVersionBranch = null;
                        releaseCandidateBranch = null;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, 7, 8]);
                        branches_1 = tslib_1.__values(branches), branches_1_1 = branches_1.next();
                        _c.label = 2;
                    case 2:
                        if (!!branches_1_1.done) return [3 /*break*/, 5];
                        _a = branches_1_1.value, name_2 = _a.name, parsed = _a.parsed;
                        // It can happen that version branches that are more recent than the version in the next
                        // branch (i.e. `master`) have been created. We could ignore such branches silently, but
                        // it might actually be symptomatic for an outdated version in the `next` branch, or an
                        // accidentally created branch by the caretaker. In either way we want to raise awareness.
                        if (semver.gte(parsed, nextVersion)) {
                            throw Error("Discovered unexpected version-branch that is representing a minor " +
                                ("version more recent than the one in the \"" + exports.nextBranchName + "\" branch. Consider ") +
                                ("deleting the branch, or check if the version in \"" + exports.nextBranchName + "\" is outdated."));
                        }
                        return [4 /*yield*/, getVersionOfBranch(repo, name_2)];
                    case 3:
                        version = _c.sent();
                        isPrerelease = version.prerelease[0] === 'rc' || version.prerelease[0] === 'next';
                        if (isPrerelease) {
                            if (releaseCandidateBranch !== null) {
                                throw Error("Unable to determine latest release-train. Found two consecutive " +
                                    ("branches in feature-freeze/release-candidate phase. Did not expect both \"" + name_2 + "\" ") +
                                    ("and \"" + releaseCandidateBranch + "\" to be in feature-freeze/release-candidate mode."));
                            }
                            else if (version.major !== expectedReleaseCandidateMajor) {
                                throw Error("Discovered unexpected old feature-freeze/release-candidate branch. Expected no " +
                                    ("version-branch in feature-freeze/release-candidate mode for v" + version.major + "."));
                            }
                            releaseCandidateBranch = name_2;
                        }
                        else {
                            latestVersionBranch = name_2;
                            return [3 /*break*/, 5];
                        }
                        _c.label = 4;
                    case 4:
                        branches_1_1 = branches_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_2_1 = _c.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (branches_1_1 && !branches_1_1.done && (_b = branches_1.return)) _b.call(branches_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, { releaseCandidateBranch: releaseCandidateBranch, latestVersionBranch: latestVersionBranch }];
                }
            });
        });
    }
    exports.findActiveVersionBranches = findActiveVersionBranches;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmNoZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvZGVmYXVsdHMvYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQWdDakMseUNBQXlDO0lBQzVCLFFBQUEsY0FBYyxHQUFHLFFBQVEsQ0FBQztJQUV2Qyw0RUFBNEU7SUFDNUUsSUFBTSwyQkFBMkIsR0FBRyxpQkFBaUIsQ0FBQztJQUV0RDs7OztPQUlHO0lBQ0gsU0FBc0IsK0JBQStCLENBQ2pELElBQWdCLEVBQUUsV0FBMEI7Ozs7Ozt3QkFTeEMsdUJBQXVCLEdBQWEsRUFBRSxDQUFDO3dCQUc3Qyx3RkFBd0Y7d0JBQ3hGLDBGQUEwRjt3QkFDMUYsMkZBQTJGO3dCQUMzRix1RkFBdUY7d0JBQ3ZGLDJGQUEyRjt3QkFDM0Ysc0ZBQXNGO3dCQUN0Rix1RkFBdUY7d0JBQ3ZGLEVBQUU7d0JBQ0YsdUZBQXVGO3dCQUN2RiwrRkFBK0Y7d0JBQy9GLHdGQUF3Rjt3QkFDeEYsd0ZBQXdGO3dCQUN4RiwwRkFBMEY7d0JBQzFGLDRFQUE0RTt3QkFDNUUsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTs0QkFDM0IsNkJBQTZCLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7NEJBQ3RELHVCQUF1QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO3lCQUNyRDs2QkFBTSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFOzRCQUNsQyw2QkFBNkIsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDOzRCQUNsRCx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO3lCQUN4RTs2QkFB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LHNCQUFzQixLQUFLLElBQUksRUFBRTtnQ0FDbkMsTUFBTSxLQUFLLENBQ1Asa0VBQWtFO3FDQUNsRSwrRUFBNEUsTUFBSSxRQUFJLENBQUE7cUNBQ3BGLFdBQVEsc0JBQXNCLHVEQUFtRCxDQUFBLENBQUMsQ0FBQzs2QkFDeEY7aUNBQU0sSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLDZCQUE2QixFQUFFO2dDQUMxRCxNQUFNLEtBQUssQ0FDUCxpRkFBaUY7cUNBQ2pGLGtFQUFnRSxPQUFPLENBQUMsS0FBSyxNQUFHLENBQUEsQ0FBQyxDQUFDOzZCQUN2Rjs0QkFDRCxzQkFBc0IsR0FBRyxNQUFJLENBQUM7eUJBQy9COzZCQUFNOzRCQUNMLG1CQUFtQixHQUFHLE1BQUksQ0FBQzs0QkFDM0Isd0JBQU07eUJBQ1A7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBR0gsc0JBQU8sRUFBQyxzQkFBc0Isd0JBQUEsRUFBRSxtQkFBbUIscUJBQUEsRUFBQyxFQUFDOzs7O0tBQ3REO0lBbERELDhEQWtEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7R2l0aHViQ2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvZ2l0aHViJztcblxuLyoqIFR5cGUgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5IHdpdGggY29ycmVzcG9uZGluZyBBUEkgY2xpZW50LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvIHtcbiAgLyoqIEFQSSBjbGllbnQgdGhhdCBjYW4gYWNjZXNzIHRoZSByZXBvc2l0b3J5LiAqL1xuICBhcGk6IEdpdGh1YkNsaWVudDtcbiAgLyoqIE93bmVyIGxvZ2luIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBvd25lcjogc3RyaW5nO1xuICAvKiogTmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgcmVwbzogc3RyaW5nO1xuICAvKipcbiAgICogTlBNIHBhY2thZ2UgcmVwcmVzZW50aW5nIHRoaXMgcmVwb3NpdG9yeS4gQW5ndWxhciByZXBvc2l0b3JpZXMgdXN1YWxseSBjb250YWluXG4gICAqIG11bHRpcGxlIHBhY2thZ2VzIGluIGEgbW9ub3JlcG8gc2NoZW1lLCBidXQgcGFja2FnZXMgY29tbW9ubHkgYXJlIHJlbGVhc2VkIHdpdGhcbiAgICogdGhlIHNhbWUgdmVyc2lvbnMuIFRoaXMgbWVhbnMgdGhhdCBhIHNpbmdsZSBwYWNrYWdlIGNhbiBiZSB1c2VkIGZvciBxdWVyeWluZ1xuICAgKiBOUE0gYWJvdXQgcHJldmlvdXNseSBwdWJsaXNoZWQgdmVyc2lvbnMgKGUuZy4gdG8gZGV0ZXJtaW5lIGFjdGl2ZSBMVFMgdmVyc2lvbnMpLlxuICAgKiAqL1xuICBucG1QYWNrYWdlTmFtZTogc3RyaW5nO1xufVxuXG4vKiogVHlwZSBkZXNjcmliaW5nIGEgdmVyc2lvbi1icmFuY2guICovXG5leHBvcnQgaW50ZXJmYWNlIFZlcnNpb25CcmFuY2gge1xuICAvKiogTmFtZSBvZiB0aGUgYnJhbmNoIGluIEdpdC4gZS5nLiBgMTAuMC54YC4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogUGFyc2VkIFNlbVZlciB2ZXJzaW9uIGZvciB0aGUgdmVyc2lvbi1icmFuY2guIFZlcnNpb24gYnJhbmNoZXMgdGVjaG5pY2FsbHkgZG9cbiAgICogbm90IGZvbGxvdyB0aGUgU2VtVmVyIGZvcm1hdCwgYnV0IHdlIGNhbiBoYXZlIHJlcHJlc2VudGF0aXZlIFNlbVZlciB2ZXJzaW9uc1xuICAgKiB0aGF0IGNhbiBiZSB1c2VkIGZvciBjb21wYXJpc29ucywgc29ydGluZyBhbmQgb3RoZXIgY2hlY2tzLlxuICAgKi9cbiAgcGFyc2VkOiBzZW12ZXIuU2VtVmVyO1xufVxuXG4vKiogQnJhbmNoIG5hbWUgZm9yIHRoZSBgbmV4dGAgYnJhbmNoLiAqL1xuZXhwb3J0IGNvbnN0IG5leHRCcmFuY2hOYW1lID0gJ21hc3Rlcic7XG5cbi8qKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHZlcnNpb24tYnJhbmNoZXMgZm9yIGEgcmVsZWFzZS10cmFpbi4gKi9cbmNvbnN0IHJlbGVhc2VUcmFpbkJyYW5jaE5hbWVSZWdleCA9IC8oXFxkKylcXC4oXFxkKylcXC54LztcblxuLyoqXG4gKiBGZXRjaGVzIHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbiBhbmQgaXRzIGJyYW5jaGVzIGZvciB0aGUgc3BlY2lmaWVkIG1ham9yIHZlcnNpb24uIGkuZS5cbiAqIHRoZSBsYXRlc3QgYWN0aXZlIHJlbGVhc2UtdHJhaW4gYnJhbmNoIG5hbWUgaXMgcmVzb2x2ZWQgYW5kIGFuIG9wdGlvbmFsIHZlcnNpb24tYnJhbmNoIGZvclxuICogYSBjdXJyZW50bHkgYWN0aXZlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIHJlbGVhc2UtdHJhaW4uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbkJyYW5jaGVzKFxuICAgIHJlcG86IEdpdGh1YlJlcG8sIG5leHRWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKTogUHJvbWlzZTx7XG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBjdXJyZW50bHkgYWN0aXZlIHJlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gTnVsbCBpZiBub1xuICAgKiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBpcyBjdXJyZW50bHkgYWN0aXZlLlxuICAgKi9cbiAgcmVsZWFzZUNhbmRpZGF0ZUJyYW5jaDogc3RyaW5nIHwgbnVsbCxcbiAgLyoqIE5hbWUgb2YgdGhlIGxhdGVzdCBub24tcHJlcmVsZWFzZSB2ZXJzaW9uIGJyYW5jaCAoaS5lLiB0aGUgcGF0Y2ggYnJhbmNoKS4gKi9cbiAgbGF0ZXN0VmVyc2lvbkJyYW5jaDogc3RyaW5nXG59PiB7XG4gIGNvbnN0IG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyOiBudW1iZXJbXSA9IFtdO1xuICBsZXQgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3I6IG51bWJlcjtcblxuICAvLyBJZiB0aGUgYG5leHRgIGJyYW5jaCAoaS5lLiBgbWFzdGVyYCBicmFuY2gpIGlzIGZvciBhbiB1cGNvbWluZyBtYWpvciB2ZXJzaW9uLCB3ZSBrbm93XG4gIC8vIHRoYXQgdGhlcmUgaXMgbm8gcGF0Y2ggYnJhbmNoIG9yIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBmb3IgdGhpcyBtYWpvclxuICAvLyBkaWdpdC4gSWYgdGhlIGN1cnJlbnQgYG5leHRgIHZlcnNpb24gaXMgdGhlIGZpcnN0IG1pbm9yIG9mIGEgbWFqb3IgdmVyc2lvbiwgd2Uga25vdyB0aGF0XG4gIC8vIHRoZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggY2FuIG9ubHkgYmUgdGhlIGFjdHVhbCBtYWpvciBicmFuY2guIFRoZVxuICAvLyBwYXRjaCBicmFuY2ggaXMgYmFzZWQgb24gdGhhdCwgZWl0aGVyIHRoZSBhY3R1YWwgbWFqb3IgYnJhbmNoIG9yIHRoZSBsYXN0IG1pbm9yIGZyb20gdGhlXG4gIC8vIHByZWNlZGluZyBtYWpvciB2ZXJzaW9uLiBJbiBhbGwgb3RoZXIgY2FzZXMsIHRoZSBwYXRjaCBicmFuY2ggYW5kIGZlYXR1cmUtZnJlZXplIG9yXG4gIC8vIHJlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBhcmUgcGFydCBvZiB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLiBDb25zaWRlciB0aGUgZm9sbG93aW5nOlxuICAvL1xuICAvLyAgQ0FTRSAxLiBuZXh0OiAxMS4wLjAtbmV4dC4wOiBwYXRjaCBhbmQgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgY2FuIG9ubHkgYmVcbiAgLy8gICAgICAgICAgbW9zdCByZWNlbnQgYDEwLjw+LnhgIGJyYW5jaGVzLiBUaGUgRkYvUkMgYnJhbmNoIGNhbiBvbmx5IGJlIHRoZSBsYXN0LW1pbm9yIG9mIHYxMC5cbiAgLy8gIENBU0UgMi4gbmV4dDogMTEuMS4wLW5leHQuMDogcGF0Y2ggY2FuIGJlIGVpdGhlciBgMTEuMC54YCBvciBsYXN0LW1pbm9yIGluIHYxMCBiYXNlZFxuICAvLyAgICAgICAgICBvbiB3aGV0aGVyIHRoZXJlIGlzIGEgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICg9PiBgMTEuMC54YCkuXG4gIC8vICBDQVNFIDMuIG5leHQ6IDEwLjYuMC1uZXh0LjA6IHBhdGNoIGNhbiBiZSBlaXRoZXIgYDEwLjUueGAgb3IgYDEwLjQueGAgYmFzZWQgb24gd2hldGhlclxuICAvLyAgICAgICAgICB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCAoPT4gYDEwLjUueGApXG4gIGlmIChuZXh0VmVyc2lvbi5taW5vciA9PT0gMCkge1xuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yID0gbmV4dFZlcnNpb24ubWFqb3IgLSAxO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IgLSAxKTtcbiAgfSBlbHNlIGlmIChuZXh0VmVyc2lvbi5taW5vciA9PT0gMSkge1xuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yID0gbmV4dFZlcnNpb24ubWFqb3I7XG4gICAgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIucHVzaChuZXh0VmVyc2lvbi5tYWpvciwgbmV4dFZlcnNpb24ubWFqb3IgLSAxKTtcbiAgfSBlbHNlIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IpO1xuICB9XG5cbiAgLy8gQ29sbGVjdCBhbGwgdmVyc2lvbi1icmFuY2hlcyB0aGF0IHNob3VsZCBiZSBjb25zaWRlcmVkIGZvciB0aGUgbGF0ZXN0IHZlcnNpb24tYnJhbmNoLFxuICAvLyBvciB0aGUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUuXG4gIGNvbnN0IGJyYW5jaGVzID0gKGF3YWl0IGdldEJyYW5jaGVzRm9yTWFqb3JWZXJzaW9ucyhyZXBvLCBtYWpvclZlcnNpb25zVG9Db25zaWRlcikpO1xuICBjb25zdCB7bGF0ZXN0VmVyc2lvbkJyYW5jaCwgcmVsZWFzZUNhbmRpZGF0ZUJyYW5jaH0gPVxuICAgICAgYXdhaXQgZmluZEFjdGl2ZVZlcnNpb25CcmFuY2hlcyhyZXBvLCBuZXh0VmVyc2lvbiwgYnJhbmNoZXMsIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yKTtcblxuICBpZiAobGF0ZXN0VmVyc2lvbkJyYW5jaCA9PT0gbnVsbCkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIGRldGVybWluZSB0aGUgbGF0ZXN0IHJlbGVhc2UtdHJhaW4uIFRoZSBmb2xsb3dpbmcgYnJhbmNoZXMgYCArXG4gICAgICAgIGBoYXZlIGJlZW4gY29uc2lkZXJlZDogWyR7YnJhbmNoZXMuam9pbignLCAnKX1dYCk7XG4gIH1cblxuICByZXR1cm4ge3JlbGVhc2VDYW5kaWRhdGVCcmFuY2gsIGxhdGVzdFZlcnNpb25CcmFuY2h9O1xufVxuXG4vKiogR2V0cyB0aGUgdmVyc2lvbiBvZiBhIGdpdmVuIGJyYW5jaCBieSByZWFkaW5nIHRoZSBgcGFja2FnZS5qc29uYCB1cHN0cmVhbS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRWZXJzaW9uT2ZCcmFuY2goXG4gICAgcmVwbzogR2l0aHViUmVwbywgYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzZW12ZXIuU2VtVmVyPiB7XG4gIGNvbnN0IHtkYXRhfSA9XG4gICAgICBhd2FpdCByZXBvLmFwaS5yZXBvcy5nZXRDb250ZW50cyh7Li4ucmVwbywgcGF0aDogJy9wYWNrYWdlLmpzb24nLCByZWY6IGJyYW5jaE5hbWV9KTtcbiAgY29uc3Qge3ZlcnNpb259ID0gSlNPTi5wYXJzZShCdWZmZXIuZnJvbShkYXRhLmNvbnRlbnQsICdiYXNlNjQnKS50b1N0cmluZygpKTtcbiAgY29uc3QgcGFyc2VkVmVyc2lvbiA9IHNlbXZlci5wYXJzZSh2ZXJzaW9uKTtcbiAgaWYgKHBhcnNlZFZlcnNpb24gPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcihgSW52YWxpZCB2ZXJzaW9uIGRldGVjdGVkIGluIGZvbGxvd2luZyBicmFuY2g6ICR7YnJhbmNoTmFtZX0uYCk7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZFZlcnNpb247XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBnaXZlbiBicmFuY2ggY29ycmVzcG9uZHMgdG8gYSByZWxlYXNlLXRyYWluIGJyYW5jaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1JlbGVhc2VUcmFpbkJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHJlbGVhc2VUcmFpbkJyYW5jaE5hbWVSZWdleC50ZXN0KGJyYW5jaE5hbWUpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgZ2l2ZW4gdmVyc2lvbi1icmFuY2ggaW50byBhIFNlbVZlciB2ZXJzaW9uIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBTZW1WZXJcbiAqIHV0aWxpdGllcy4gZS5nLiB0byBkZXRlcm1pbmUgc2VtYW50aWMgb3JkZXIsIGV4dHJhY3QgbWFqb3IgZGlnaXQsIGNvbXBhcmUuXG4gKlxuICogRm9yIGV4YW1wbGUgYDEwLjAueGAgd2lsbCBiZWNvbWUgYDEwLjAuMGAgaW4gU2VtVmVyLiBUaGUgcGF0Y2ggZGlnaXQgaXMgbm90XG4gKiByZWxldmFudCBidXQgbmVlZGVkIGZvciBwYXJzaW5nLiBTZW1WZXIgZG9lcyBub3QgYWxsb3cgYHhgIGFzIHBhdGNoIGRpZ2l0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmVyc2lvbkZvclJlbGVhc2VUcmFpbkJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpOiBzZW12ZXIuU2VtVmVyfG51bGwge1xuICAvLyBDb252ZXJ0IGEgZ2l2ZW4gdmVyc2lvbi1icmFuY2ggaW50byBhIFNlbVZlciB2ZXJzaW9uIHRoYXQgY2FuIGJlIHVzZWRcbiAgLy8gd2l0aCB0aGUgU2VtVmVyIHV0aWxpdGllcy4gaS5lLiB0byBkZXRlcm1pbmUgc2VtYW50aWMgb3JkZXIuXG4gIHJldHVybiBzZW12ZXIucGFyc2UoYnJhbmNoTmFtZS5yZXBsYWNlKHJlbGVhc2VUcmFpbkJyYW5jaE5hbWVSZWdleCwgJyQxLiQyLjAnKSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgdmVyc2lvbiBicmFuY2hlcyBmb3IgdGhlIHNwZWNpZmllZCBtYWpvciB2ZXJzaW9ucyBpbiBkZXNjZW5kaW5nXG4gKiBvcmRlci4gaS5lLiBsYXRlc3QgdmVyc2lvbiBicmFuY2hlcyBmaXJzdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEJyYW5jaGVzRm9yTWFqb3JWZXJzaW9ucyhcbiAgICByZXBvOiBHaXRodWJSZXBvLCBtYWpvclZlcnNpb25zOiBudW1iZXJbXSk6IFByb21pc2U8VmVyc2lvbkJyYW5jaFtdPiB7XG4gIGNvbnN0IHtkYXRhOiBicmFuY2hEYXRhfSA9IGF3YWl0IHJlcG8uYXBpLnJlcG9zLmxpc3RCcmFuY2hlcyh7Li4ucmVwbywgcHJvdGVjdGVkOiB0cnVlfSk7XG4gIGNvbnN0IGJyYW5jaGVzOiBWZXJzaW9uQnJhbmNoW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IHtuYW1lfSBvZiBicmFuY2hEYXRhKSB7XG4gICAgaWYgKCFpc1JlbGVhc2VUcmFpbkJyYW5jaChuYW1lKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8vIENvbnZlcnQgdGhlIHZlcnNpb24tYnJhbmNoIGludG8gYSBTZW1WZXIgdmVyc2lvbiB0aGF0IGNhbiBiZSB1c2VkIHdpdGggdGhlXG4gICAgLy8gU2VtVmVyIHV0aWxpdGllcy4gZS5nLiB0byBkZXRlcm1pbmUgc2VtYW50aWMgb3JkZXIsIGNvbXBhcmUgdmVyc2lvbnMuXG4gICAgY29uc3QgcGFyc2VkID0gZ2V0VmVyc2lvbkZvclJlbGVhc2VUcmFpbkJyYW5jaChuYW1lKTtcbiAgICAvLyBDb2xsZWN0IGFsbCB2ZXJzaW9uLWJyYW5jaGVzIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBtYWpvciB2ZXJzaW9ucy5cbiAgICBpZiAocGFyc2VkICE9PSBudWxsICYmIG1ham9yVmVyc2lvbnMuaW5jbHVkZXMocGFyc2VkLm1ham9yKSkge1xuICAgICAgYnJhbmNoZXMucHVzaCh7bmFtZSwgcGFyc2VkfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gU29ydCBjYXB0dXJlZCB2ZXJzaW9uLWJyYW5jaGVzIGluIGRlc2NlbmRpbmcgb3JkZXIuXG4gIHJldHVybiBicmFuY2hlcy5zb3J0KChhLCBiKSA9PiBzZW12ZXIucmNvbXBhcmUoYS5wYXJzZWQsIGIucGFyc2VkKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kQWN0aXZlVmVyc2lvbkJyYW5jaGVzKFxuICAgIHJlcG86IEdpdGh1YlJlcG8sIG5leHRWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBicmFuY2hlczogVmVyc2lvbkJyYW5jaFtdLFxuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yOiBudW1iZXIpOiBQcm9taXNlPHtcbiAgbGF0ZXN0VmVyc2lvbkJyYW5jaDogc3RyaW5nIHwgbnVsbCxcbiAgcmVsZWFzZUNhbmRpZGF0ZUJyYW5jaDogc3RyaW5nIHwgbnVsbCxcbn0+IHtcbiAgbGV0IGxhdGVzdFZlcnNpb25CcmFuY2g6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgbGV0IHJlbGVhc2VDYW5kaWRhdGVCcmFuY2g6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIGNhcHR1cmVkIGJyYW5jaGVzIGFuZCBmaW5kIHRoZSBsYXRlc3Qgbm9uLXByZXJlbGVhc2UgYnJhbmNoIGFuZCBhXG4gIC8vIHBvdGVudGlhbCByZWxlYXNlIGNhbmRpZGF0ZSBicmFuY2guIEZyb20gdGhlIGNvbGxlY3RlZCBicmFuY2hlcyB3ZSBpdGVyYXRlIGRlc2NlbmRpbmdcbiAgLy8gb3JkZXIgKG1vc3QgcmVjZW50IHNlbWFudGljIHZlcnNpb24tYnJhbmNoIGZpcnN0KS4gVGhlIGZpcnN0IGJyYW5jaCBpcyBlaXRoZXIgdGhlIGxhdGVzdFxuICAvLyBhY3RpdmUgdmVyc2lvbiBicmFuY2ggKGkuZS4gcGF0Y2gpIG9yIGEgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLiBBIEZGL1JDXG4gIC8vIGJyYW5jaCBjYW5ub3QgYmUgb2xkZXIgdGhhbiB0aGUgbGF0ZXN0IGFjdGl2ZSB2ZXJzaW9uLWJyYW5jaCwgc28gd2Ugc3RvcCBpdGVyYXRpbmcgb25jZVxuICAvLyB3ZSBmb3VuZCBzdWNoIGEgYnJhbmNoLiBPdGhlcndpc2UsIGlmIHdlIGZvdW5kIGEgRkYvUkMgYnJhbmNoLCB3ZSBjb250aW51ZSBsb29raW5nIGZvciB0aGVcbiAgLy8gbmV4dCB2ZXJzaW9uLWJyYW5jaCBhcyB0aGF0IG9uZSBpcyBzdXBwb3NlZCB0byBiZSB0aGUgbGF0ZXN0IGFjdGl2ZSB2ZXJzaW9uLWJyYW5jaC4gSWYgaXRcbiAgLy8gaXMgbm90LCB0aGVuIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duIGR1ZSB0byB0d28gRkYvUkMgYnJhbmNoZXMgZXhpc3RpbmcgYXQgdGhlIHNhbWUgdGltZS5cbiAgZm9yIChjb25zdCB7bmFtZSwgcGFyc2VkfSBvZiBicmFuY2hlcykge1xuICAgIC8vIEl0IGNhbiBoYXBwZW4gdGhhdCB2ZXJzaW9uIGJyYW5jaGVzIHRoYXQgYXJlIG1vcmUgcmVjZW50IHRoYW4gdGhlIHZlcnNpb24gaW4gdGhlIG5leHRcbiAgICAvLyBicmFuY2ggKGkuZS4gYG1hc3RlcmApIGhhdmUgYmVlbiBjcmVhdGVkLiBXZSBjb3VsZCBpZ25vcmUgc3VjaCBicmFuY2hlcyBzaWxlbnRseSwgYnV0XG4gICAgLy8gaXQgbWlnaHQgYWN0dWFsbHkgYmUgc3ltcHRvbWF0aWMgZm9yIGFuIG91dGRhdGVkIHZlcnNpb24gaW4gdGhlIGBuZXh0YCBicmFuY2gsIG9yIGFuXG4gICAgLy8gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgYnJhbmNoIGJ5IHRoZSBjYXJldGFrZXIuIEluIGVpdGhlciB3YXkgd2Ugd2FudCB0byByYWlzZSBhd2FyZW5lc3MuXG4gICAgaWYgKHNlbXZlci5ndGUocGFyc2VkLCBuZXh0VmVyc2lvbikpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIGBEaXNjb3ZlcmVkIHVuZXhwZWN0ZWQgdmVyc2lvbi1icmFuY2ggdGhhdCBpcyByZXByZXNlbnRpbmcgYSBtaW5vciBgICtcbiAgICAgICAgICBgdmVyc2lvbiBtb3JlIHJlY2VudCB0aGFuIHRoZSBvbmUgaW4gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guIENvbnNpZGVyIGAgK1xuICAgICAgICAgIGBkZWxldGluZyB0aGUgYnJhbmNoLCBvciBjaGVjayBpZiB0aGUgdmVyc2lvbiBpbiBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgaXMgb3V0ZGF0ZWQuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBuYW1lKTtcbiAgICBjb25zdCBpc1ByZXJlbGVhc2UgPSB2ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICdyYycgfHwgdmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAnbmV4dCc7XG4gICAgaWYgKGlzUHJlcmVsZWFzZSkge1xuICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGVCcmFuY2ggIT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIGRldGVybWluZSBsYXRlc3QgcmVsZWFzZS10cmFpbi4gRm91bmQgdHdvIGNvbnNlY3V0aXZlIGAgK1xuICAgICAgICAgICAgYGJyYW5jaGVzIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBEaWQgbm90IGV4cGVjdCBib3RoIFwiJHtuYW1lfVwiIGAgK1xuICAgICAgICAgICAgYGFuZCBcIiR7cmVsZWFzZUNhbmRpZGF0ZUJyYW5jaH1cIiB0byBiZSBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBtb2RlLmApO1xuICAgICAgfSBlbHNlIGlmICh2ZXJzaW9uLm1ham9yICE9PSBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvcikge1xuICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgIGBEaXNjb3ZlcmVkIHVuZXhwZWN0ZWQgb2xkIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gRXhwZWN0ZWQgbm8gYCArXG4gICAgICAgICAgICBgdmVyc2lvbi1icmFuY2ggaW4gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgbW9kZSBmb3IgdiR7dmVyc2lvbi5tYWpvcn0uYCk7XG4gICAgICB9XG4gICAgICByZWxlYXNlQ2FuZGlkYXRlQnJhbmNoID0gbmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGF0ZXN0VmVyc2lvbkJyYW5jaCA9IG5hbWU7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge3JlbGVhc2VDYW5kaWRhdGVCcmFuY2gsIGxhdGVzdFZlcnNpb25CcmFuY2h9O1xufVxuIl19