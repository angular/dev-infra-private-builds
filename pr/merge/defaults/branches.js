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
            var nextReleaseTrainVersion, latestVersionBranch, releaseCandidateBranch, branches_1, branches_1_1, _a, name_2, parsed, version, isPrerelease, e_2_1;
            var e_2, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        nextReleaseTrainVersion = semver.parse(nextVersion.major + "." + nextVersion.minor + ".0");
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
                        // It can happen that version branches have been accidentally created which are more recent
                        // than the release-train in the next branch (i.e. `master`). We could ignore such branches
                        // silently, but it might be symptomatic for an outdated version in the `next` branch, or an
                        // accidentally created branch by the caretaker. In either way we want to raise awareness.
                        if (semver.gt(parsed, nextReleaseTrainVersion)) {
                            throw Error("Discovered unexpected version-branch \"" + name_2 + "\" for a release-train that is " +
                                ("more recent than the release-train currently in the \"" + exports.nextBranchName + "\" branch. ") +
                                "Please either delete the branch if created by accident, or update the outdated " +
                                ("version in the next branch (" + exports.nextBranchName + ")."));
                        }
                        else if (semver.eq(parsed, nextReleaseTrainVersion)) {
                            throw Error("Discovered unexpected version-branch \"" + name_2 + "\" for a release-train that is already " +
                                ("active in the \"" + exports.nextBranchName + "\" branch. Please either delete the branch if ") +
                                ("created by accident, or update the version in the next branch (" + exports.nextBranchName + ")."));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmNoZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvZGVmYXVsdHMvYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQWdDakMseUNBQXlDO0lBQzVCLFFBQUEsY0FBYyxHQUFHLFFBQVEsQ0FBQztJQUV2Qyw0RUFBNEU7SUFDNUUsSUFBTSwyQkFBMkIsR0FBRyxpQkFBaUIsQ0FBQztJQUV0RDs7OztPQUlHO0lBQ0gsU0FBc0IsK0JBQStCLENBQ2pELElBQWdCLEVBQUUsV0FBMEI7Ozs7Ozt3QkFTeEMsdUJBQXVCLEdBQWEsRUFBRSxDQUFDO3dCQUc3Qyx3RkFBd0Y7d0JBQ3hGLDBGQUEwRjt3QkFDMUYsMkZBQTJGO3dCQUMzRix1RkFBdUY7d0JBQ3ZGLDJGQUEyRjt3QkFDM0Ysc0ZBQXNGO3dCQUN0Rix1RkFBdUY7d0JBQ3ZGLEVBQUU7d0JBQ0YsdUZBQXVGO3dCQUN2RiwrRkFBK0Y7d0JBQy9GLHdGQUF3Rjt3QkFDeEYsd0ZBQXdGO3dCQUN4RiwwRkFBMEY7d0JBQzFGLDRFQUE0RTt3QkFDNUUsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTs0QkFDM0IsNkJBQTZCLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7NEJBQ3RELHVCQUF1QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO3lCQUNyRDs2QkFBTSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFOzRCQUNsQyw2QkFBNkIsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDOzRCQUNsRCx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO3lCQUN4RTs2QkFB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aUNBQ3JGLHFCQUFrQixzQkFBYyxtREFBK0MsQ0FBQTtpQ0FDL0Usb0VBQWtFLHNCQUFjLE9BQUksQ0FBQSxDQUFDLENBQUM7eUJBQzNGO3dCQUVlLHFCQUFNLGtCQUFrQixDQUFDLElBQUksRUFBRSxNQUFJLENBQUMsRUFBQTs7d0JBQTlDLE9BQU8sR0FBRyxTQUFvQzt3QkFDOUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDO3dCQUN4RixJQUFJLFlBQVksRUFBRTs0QkFDaEIsSUFBSSxzQkFBc0IsS0FBSyxJQUFJLEVBQUU7Z0NBQ25DLE1BQU0sS0FBSyxDQUNQLGtFQUFrRTtxQ0FDbEUsK0VBQTRFLE1BQUksUUFBSSxDQUFBO3FDQUNwRixXQUFRLHNCQUFzQix1REFBbUQsQ0FBQSxDQUFDLENBQUM7NkJBQ3hGO2lDQUFNLElBQUksT0FBTyxDQUFDLEtBQUssS0FBSyw2QkFBNkIsRUFBRTtnQ0FDMUQsTUFBTSxLQUFLLENBQ1AsaUZBQWlGO3FDQUNqRixrRUFBZ0UsT0FBTyxDQUFDLEtBQUssTUFBRyxDQUFBLENBQUMsQ0FBQzs2QkFDdkY7NEJBQ0Qsc0JBQXNCLEdBQUcsTUFBSSxDQUFDO3lCQUMvQjs2QkFBTTs0QkFDTCxtQkFBbUIsR0FBRyxNQUFJLENBQUM7NEJBQzNCLHdCQUFNO3lCQUNQOzs7Ozs7Ozs7Ozs7Ozs7OzRCQUdILHNCQUFPLEVBQUMsc0JBQXNCLHdCQUFBLEVBQUUsbUJBQW1CLHFCQUFBLEVBQUMsRUFBQzs7OztLQUN0RDtJQTdERCw4REE2REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0dpdGh1YkNsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yic7XG5cbi8qKiBUeXBlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeSB3aXRoIGNvcnJlc3BvbmRpbmcgQVBJIGNsaWVudC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwbyB7XG4gIC8qKiBBUEkgY2xpZW50IHRoYXQgY2FuIGFjY2VzcyB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgYXBpOiBHaXRodWJDbGllbnQ7XG4gIC8qKiBPd25lciBsb2dpbiBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIHJlcG86IHN0cmluZztcbiAgLyoqXG4gICAqIE5QTSBwYWNrYWdlIHJlcHJlc2VudGluZyB0aGlzIHJlcG9zaXRvcnkuIEFuZ3VsYXIgcmVwb3NpdG9yaWVzIHVzdWFsbHkgY29udGFpblxuICAgKiBtdWx0aXBsZSBwYWNrYWdlcyBpbiBhIG1vbm9yZXBvIHNjaGVtZSwgYnV0IHBhY2thZ2VzIGNvbW1vbmx5IGFyZSByZWxlYXNlZCB3aXRoXG4gICAqIHRoZSBzYW1lIHZlcnNpb25zLiBUaGlzIG1lYW5zIHRoYXQgYSBzaW5nbGUgcGFja2FnZSBjYW4gYmUgdXNlZCBmb3IgcXVlcnlpbmdcbiAgICogTlBNIGFib3V0IHByZXZpb3VzbHkgcHVibGlzaGVkIHZlcnNpb25zIChlLmcuIHRvIGRldGVybWluZSBhY3RpdmUgTFRTIHZlcnNpb25zKS5cbiAgICogKi9cbiAgbnBtUGFja2FnZU5hbWU6IHN0cmluZztcbn1cblxuLyoqIFR5cGUgZGVzY3JpYmluZyBhIHZlcnNpb24tYnJhbmNoLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uQnJhbmNoIHtcbiAgLyoqIE5hbWUgb2YgdGhlIGJyYW5jaCBpbiBHaXQuIGUuZy4gYDEwLjAueGAuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFBhcnNlZCBTZW1WZXIgdmVyc2lvbiBmb3IgdGhlIHZlcnNpb24tYnJhbmNoLiBWZXJzaW9uIGJyYW5jaGVzIHRlY2huaWNhbGx5IGRvXG4gICAqIG5vdCBmb2xsb3cgdGhlIFNlbVZlciBmb3JtYXQsIGJ1dCB3ZSBjYW4gaGF2ZSByZXByZXNlbnRhdGl2ZSBTZW1WZXIgdmVyc2lvbnNcbiAgICogdGhhdCBjYW4gYmUgdXNlZCBmb3IgY29tcGFyaXNvbnMsIHNvcnRpbmcgYW5kIG90aGVyIGNoZWNrcy5cbiAgICovXG4gIHBhcnNlZDogc2VtdmVyLlNlbVZlcjtcbn1cblxuLyoqIEJyYW5jaCBuYW1lIGZvciB0aGUgYG5leHRgIGJyYW5jaC4gKi9cbmV4cG9ydCBjb25zdCBuZXh0QnJhbmNoTmFtZSA9ICdtYXN0ZXInO1xuXG4vKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB2ZXJzaW9uLWJyYW5jaGVzIGZvciBhIHJlbGVhc2UtdHJhaW4uICovXG5jb25zdCByZWxlYXNlVHJhaW5CcmFuY2hOYW1lUmVnZXggPSAvKFxcZCspXFwuKFxcZCspXFwueC87XG5cbi8qKlxuICogRmV0Y2hlcyB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW4gYW5kIGl0cyBicmFuY2hlcyBmb3IgdGhlIHNwZWNpZmllZCBtYWpvciB2ZXJzaW9uLiBpLmUuXG4gKiB0aGUgbGF0ZXN0IGFjdGl2ZSByZWxlYXNlLXRyYWluIGJyYW5jaCBuYW1lIGlzIHJlc29sdmVkIGFuZCBhbiBvcHRpb25hbCB2ZXJzaW9uLWJyYW5jaCBmb3JcbiAqIGEgY3VycmVudGx5IGFjdGl2ZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSByZWxlYXNlLXRyYWluLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5CcmFuY2hlcyhcbiAgICByZXBvOiBHaXRodWJSZXBvLCBuZXh0VmVyc2lvbjogc2VtdmVyLlNlbVZlcik6IFByb21pc2U8e1xuICAvKipcbiAgICogTmFtZSBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZSByZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2guIE51bGwgaWYgbm9cbiAgICogZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgaXMgY3VycmVudGx5IGFjdGl2ZS5cbiAgICovXG4gIHJlbGVhc2VDYW5kaWRhdGVCcmFuY2g6IHN0cmluZyB8IG51bGwsXG4gIC8qKiBOYW1lIG9mIHRoZSBsYXRlc3Qgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiBicmFuY2ggKGkuZS4gdGhlIHBhdGNoIGJyYW5jaCkuICovXG4gIGxhdGVzdFZlcnNpb25CcmFuY2g6IHN0cmluZ1xufT4ge1xuICBjb25zdCBtYWpvclZlcnNpb25zVG9Db25zaWRlcjogbnVtYmVyW10gPSBbXTtcbiAgbGV0IGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yOiBudW1iZXI7XG5cbiAgLy8gSWYgdGhlIGBuZXh0YCBicmFuY2ggKGkuZS4gYG1hc3RlcmAgYnJhbmNoKSBpcyBmb3IgYW4gdXBjb21pbmcgbWFqb3IgdmVyc2lvbiwgd2Uga25vd1xuICAvLyB0aGF0IHRoZXJlIGlzIG5vIHBhdGNoIGJyYW5jaCBvciBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggZm9yIHRoaXMgbWFqb3JcbiAgLy8gZGlnaXQuIElmIHRoZSBjdXJyZW50IGBuZXh0YCB2ZXJzaW9uIGlzIHRoZSBmaXJzdCBtaW5vciBvZiBhIG1ham9yIHZlcnNpb24sIHdlIGtub3cgdGhhdFxuICAvLyB0aGUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoIGNhbiBvbmx5IGJlIHRoZSBhY3R1YWwgbWFqb3IgYnJhbmNoLiBUaGVcbiAgLy8gcGF0Y2ggYnJhbmNoIGlzIGJhc2VkIG9uIHRoYXQsIGVpdGhlciB0aGUgYWN0dWFsIG1ham9yIGJyYW5jaCBvciB0aGUgbGFzdCBtaW5vciBmcm9tIHRoZVxuICAvLyBwcmVjZWRpbmcgbWFqb3IgdmVyc2lvbi4gSW4gYWxsIG90aGVyIGNhc2VzLCB0aGUgcGF0Y2ggYnJhbmNoIGFuZCBmZWF0dXJlLWZyZWV6ZSBvclxuICAvLyByZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggYXJlIHBhcnQgb2YgdGhlIHNhbWUgbWFqb3IgdmVyc2lvbi4gQ29uc2lkZXIgdGhlIGZvbGxvd2luZzpcbiAgLy9cbiAgLy8gIENBU0UgMS4gbmV4dDogMTEuMC4wLW5leHQuMDogcGF0Y2ggYW5kIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGNhbiBvbmx5IGJlXG4gIC8vICAgICAgICAgIG1vc3QgcmVjZW50IGAxMC48Pi54YCBicmFuY2hlcy4gVGhlIEZGL1JDIGJyYW5jaCBjYW4gb25seSBiZSB0aGUgbGFzdC1taW5vciBvZiB2MTAuXG4gIC8vICBDQVNFIDIuIG5leHQ6IDExLjEuMC1uZXh0LjA6IHBhdGNoIGNhbiBiZSBlaXRoZXIgYDExLjAueGAgb3IgbGFzdC1taW5vciBpbiB2MTAgYmFzZWRcbiAgLy8gICAgICAgICAgb24gd2hldGhlciB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCAoPT4gYDExLjAueGApLlxuICAvLyAgQ0FTRSAzLiBuZXh0OiAxMC42LjAtbmV4dC4wOiBwYXRjaCBjYW4gYmUgZWl0aGVyIGAxMC41LnhgIG9yIGAxMC40LnhgIGJhc2VkIG9uIHdoZXRoZXJcbiAgLy8gICAgICAgICAgdGhlcmUgaXMgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggKD0+IGAxMC41LnhgKVxuICBpZiAobmV4dFZlcnNpb24ubWlub3IgPT09IDApIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yIC0gMTtcbiAgICBtYWpvclZlcnNpb25zVG9Db25zaWRlci5wdXNoKG5leHRWZXJzaW9uLm1ham9yIC0gMSk7XG4gIH0gZWxzZSBpZiAobmV4dFZlcnNpb24ubWlub3IgPT09IDEpIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IsIG5leHRWZXJzaW9uLm1ham9yIC0gMSk7XG4gIH0gZWxzZSB7XG4gICAgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IgPSBuZXh0VmVyc2lvbi5tYWpvcjtcbiAgICBtYWpvclZlcnNpb25zVG9Db25zaWRlci5wdXNoKG5leHRWZXJzaW9uLm1ham9yKTtcbiAgfVxuXG4gIC8vIENvbGxlY3QgYWxsIHZlcnNpb24tYnJhbmNoZXMgdGhhdCBzaG91bGQgYmUgY29uc2lkZXJlZCBmb3IgdGhlIGxhdGVzdCB2ZXJzaW9uLWJyYW5jaCxcbiAgLy8gb3IgdGhlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlLlxuICBjb25zdCBicmFuY2hlcyA9IChhd2FpdCBnZXRCcmFuY2hlc0Zvck1ham9yVmVyc2lvbnMocmVwbywgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIpKTtcbiAgY29uc3Qge2xhdGVzdFZlcnNpb25CcmFuY2gsIHJlbGVhc2VDYW5kaWRhdGVCcmFuY2h9ID1cbiAgICAgIGF3YWl0IGZpbmRBY3RpdmVWZXJzaW9uQnJhbmNoZXMocmVwbywgbmV4dFZlcnNpb24sIGJyYW5jaGVzLCBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvcik7XG5cbiAgaWYgKGxhdGVzdFZlcnNpb25CcmFuY2ggPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBkZXRlcm1pbmUgdGhlIGxhdGVzdCByZWxlYXNlLXRyYWluLiBUaGUgZm9sbG93aW5nIGJyYW5jaGVzIGAgK1xuICAgICAgICBgaGF2ZSBiZWVuIGNvbnNpZGVyZWQ6IFske2JyYW5jaGVzLmpvaW4oJywgJyl9XWApO1xuICB9XG5cbiAgcmV0dXJuIHtyZWxlYXNlQ2FuZGlkYXRlQnJhbmNoLCBsYXRlc3RWZXJzaW9uQnJhbmNofTtcbn1cblxuLyoqIEdldHMgdGhlIHZlcnNpb24gb2YgYSBnaXZlbiBicmFuY2ggYnkgcmVhZGluZyB0aGUgYHBhY2thZ2UuanNvbmAgdXBzdHJlYW0uICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmVyc2lvbk9mQnJhbmNoKFxuICAgIHJlcG86IEdpdGh1YlJlcG8sIGJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8c2VtdmVyLlNlbVZlcj4ge1xuICBjb25zdCB7ZGF0YX0gPVxuICAgICAgYXdhaXQgcmVwby5hcGkucmVwb3MuZ2V0Q29udGVudHMoey4uLnJlcG8sIHBhdGg6ICcvcGFja2FnZS5qc29uJywgcmVmOiBicmFuY2hOYW1lfSk7XG4gIGNvbnN0IHt2ZXJzaW9ufSA9IEpTT04ucGFyc2UoQnVmZmVyLmZyb20oZGF0YS5jb250ZW50LCAnYmFzZTY0JykudG9TdHJpbmcoKSk7XG4gIGNvbnN0IHBhcnNlZFZlcnNpb24gPSBzZW12ZXIucGFyc2UodmVyc2lvbik7XG4gIGlmIChwYXJzZWRWZXJzaW9uID09PSBudWxsKSB7XG4gICAgdGhyb3cgRXJyb3IoYEludmFsaWQgdmVyc2lvbiBkZXRlY3RlZCBpbiBmb2xsb3dpbmcgYnJhbmNoOiAke2JyYW5jaE5hbWV9LmApO1xuICB9XG4gIHJldHVybiBwYXJzZWRWZXJzaW9uO1xufVxuXG4vKiogV2hldGhlciB0aGUgZ2l2ZW4gYnJhbmNoIGNvcnJlc3BvbmRzIHRvIGEgcmVsZWFzZS10cmFpbiBicmFuY2guICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZWxlYXNlVHJhaW5CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiByZWxlYXNlVHJhaW5CcmFuY2hOYW1lUmVnZXgudGVzdChicmFuY2hOYW1lKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGdpdmVuIHZlcnNpb24tYnJhbmNoIGludG8gYSBTZW1WZXIgdmVyc2lvbiB0aGF0IGNhbiBiZSB1c2VkIHdpdGggU2VtVmVyXG4gKiB1dGlsaXRpZXMuIGUuZy4gdG8gZGV0ZXJtaW5lIHNlbWFudGljIG9yZGVyLCBleHRyYWN0IG1ham9yIGRpZ2l0LCBjb21wYXJlLlxuICpcbiAqIEZvciBleGFtcGxlIGAxMC4wLnhgIHdpbGwgYmVjb21lIGAxMC4wLjBgIGluIFNlbVZlci4gVGhlIHBhdGNoIGRpZ2l0IGlzIG5vdFxuICogcmVsZXZhbnQgYnV0IG5lZWRlZCBmb3IgcGFyc2luZy4gU2VtVmVyIGRvZXMgbm90IGFsbG93IGB4YCBhcyBwYXRjaCBkaWdpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFZlcnNpb25Gb3JSZWxlYXNlVHJhaW5CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogc2VtdmVyLlNlbVZlcnxudWxsIHtcbiAgLy8gQ29udmVydCBhIGdpdmVuIHZlcnNpb24tYnJhbmNoIGludG8gYSBTZW1WZXIgdmVyc2lvbiB0aGF0IGNhbiBiZSB1c2VkXG4gIC8vIHdpdGggdGhlIFNlbVZlciB1dGlsaXRpZXMuIGkuZS4gdG8gZGV0ZXJtaW5lIHNlbWFudGljIG9yZGVyLlxuICByZXR1cm4gc2VtdmVyLnBhcnNlKGJyYW5jaE5hbWUucmVwbGFjZShyZWxlYXNlVHJhaW5CcmFuY2hOYW1lUmVnZXgsICckMS4kMi4wJykpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHZlcnNpb24gYnJhbmNoZXMgZm9yIHRoZSBzcGVjaWZpZWQgbWFqb3IgdmVyc2lvbnMgaW4gZGVzY2VuZGluZ1xuICogb3JkZXIuIGkuZS4gbGF0ZXN0IHZlcnNpb24gYnJhbmNoZXMgZmlyc3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRCcmFuY2hlc0Zvck1ham9yVmVyc2lvbnMoXG4gICAgcmVwbzogR2l0aHViUmVwbywgbWFqb3JWZXJzaW9uczogbnVtYmVyW10pOiBQcm9taXNlPFZlcnNpb25CcmFuY2hbXT4ge1xuICBjb25zdCB7ZGF0YTogYnJhbmNoRGF0YX0gPSBhd2FpdCByZXBvLmFwaS5yZXBvcy5saXN0QnJhbmNoZXMoey4uLnJlcG8sIHByb3RlY3RlZDogdHJ1ZX0pO1xuICBjb25zdCBicmFuY2hlczogVmVyc2lvbkJyYW5jaFtdID0gW107XG5cbiAgZm9yIChjb25zdCB7bmFtZX0gb2YgYnJhbmNoRGF0YSkge1xuICAgIGlmICghaXNSZWxlYXNlVHJhaW5CcmFuY2gobmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICAvLyBDb252ZXJ0IHRoZSB2ZXJzaW9uLWJyYW5jaCBpbnRvIGEgU2VtVmVyIHZlcnNpb24gdGhhdCBjYW4gYmUgdXNlZCB3aXRoIHRoZVxuICAgIC8vIFNlbVZlciB1dGlsaXRpZXMuIGUuZy4gdG8gZGV0ZXJtaW5lIHNlbWFudGljIG9yZGVyLCBjb21wYXJlIHZlcnNpb25zLlxuICAgIGNvbnN0IHBhcnNlZCA9IGdldFZlcnNpb25Gb3JSZWxlYXNlVHJhaW5CcmFuY2gobmFtZSk7XG4gICAgLy8gQ29sbGVjdCBhbGwgdmVyc2lvbi1icmFuY2hlcyB0aGF0IG1hdGNoIHRoZSBzcGVjaWZpZWQgbWFqb3IgdmVyc2lvbnMuXG4gICAgaWYgKHBhcnNlZCAhPT0gbnVsbCAmJiBtYWpvclZlcnNpb25zLmluY2x1ZGVzKHBhcnNlZC5tYWpvcikpIHtcbiAgICAgIGJyYW5jaGVzLnB1c2goe25hbWUsIHBhcnNlZH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNvcnQgY2FwdHVyZWQgdmVyc2lvbi1icmFuY2hlcyBpbiBkZXNjZW5kaW5nIG9yZGVyLlxuICByZXR1cm4gYnJhbmNoZXMuc29ydCgoYSwgYikgPT4gc2VtdmVyLnJjb21wYXJlKGEucGFyc2VkLCBiLnBhcnNlZCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZEFjdGl2ZVZlcnNpb25CcmFuY2hlcyhcbiAgICByZXBvOiBHaXRodWJSZXBvLCBuZXh0VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgYnJhbmNoZXM6IFZlcnNpb25CcmFuY2hbXSxcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvcjogbnVtYmVyKTogUHJvbWlzZTx7XG4gIGxhdGVzdFZlcnNpb25CcmFuY2g6IHN0cmluZyB8IG51bGwsXG4gIHJlbGVhc2VDYW5kaWRhdGVCcmFuY2g6IHN0cmluZyB8IG51bGwsXG59PiB7XG4gIC8vIFZlcnNpb24gcmVwcmVzZW50aW5nIHRoZSByZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGUgbmV4dCBwaGFzZS4gTm90ZSB0aGF0IHdlIGlnbm9yZVxuICAvLyBwYXRjaCBhbmQgcHJlLXJlbGVhc2Ugc2VnbWVudHMgaW4gb3JkZXIgdG8gYmUgYWJsZSB0byBjb21wYXJlIHRoZSBuZXh0IHJlbGVhc2UgdHJhaW4gdG9cbiAgLy8gb3RoZXIgcmVsZWFzZSB0cmFpbnMgZnJvbSB2ZXJzaW9uIGJyYW5jaGVzICh3aGljaCBmb2xsb3cgdGhlIGBOLk4ueGAgcGF0dGVybikuXG4gIGNvbnN0IG5leHRSZWxlYXNlVHJhaW5WZXJzaW9uID0gc2VtdmVyLnBhcnNlKGAke25leHRWZXJzaW9uLm1ham9yfS4ke25leHRWZXJzaW9uLm1pbm9yfS4wYCkhO1xuXG4gIGxldCBsYXRlc3RWZXJzaW9uQnJhbmNoOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gIGxldCByZWxlYXNlQ2FuZGlkYXRlQnJhbmNoOiBzdHJpbmd8bnVsbCA9IG51bGw7XG5cbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBjYXB0dXJlZCBicmFuY2hlcyBhbmQgZmluZCB0aGUgbGF0ZXN0IG5vbi1wcmVyZWxlYXNlIGJyYW5jaCBhbmQgYVxuICAvLyBwb3RlbnRpYWwgcmVsZWFzZSBjYW5kaWRhdGUgYnJhbmNoLiBGcm9tIHRoZSBjb2xsZWN0ZWQgYnJhbmNoZXMgd2UgaXRlcmF0ZSBkZXNjZW5kaW5nXG4gIC8vIG9yZGVyIChtb3N0IHJlY2VudCBzZW1hbnRpYyB2ZXJzaW9uLWJyYW5jaCBmaXJzdCkuIFRoZSBmaXJzdCBicmFuY2ggaXMgZWl0aGVyIHRoZSBsYXRlc3RcbiAgLy8gYWN0aXZlIHZlcnNpb24gYnJhbmNoIChpLmUuIHBhdGNoKSBvciBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gQSBGRi9SQ1xuICAvLyBicmFuY2ggY2Fubm90IGJlIG9sZGVyIHRoYW4gdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2gsIHNvIHdlIHN0b3AgaXRlcmF0aW5nIG9uY2VcbiAgLy8gd2UgZm91bmQgc3VjaCBhIGJyYW5jaC4gT3RoZXJ3aXNlLCBpZiB3ZSBmb3VuZCBhIEZGL1JDIGJyYW5jaCwgd2UgY29udGludWUgbG9va2luZyBmb3IgdGhlXG4gIC8vIG5leHQgdmVyc2lvbi1icmFuY2ggYXMgdGhhdCBvbmUgaXMgc3VwcG9zZWQgdG8gYmUgdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2guIElmIGl0XG4gIC8vIGlzIG5vdCwgdGhlbiBhbiBlcnJvciB3aWxsIGJlIHRocm93biBkdWUgdG8gdHdvIEZGL1JDIGJyYW5jaGVzIGV4aXN0aW5nIGF0IHRoZSBzYW1lIHRpbWUuXG4gIGZvciAoY29uc3Qge25hbWUsIHBhcnNlZH0gb2YgYnJhbmNoZXMpIHtcbiAgICAvLyBJdCBjYW4gaGFwcGVuIHRoYXQgdmVyc2lvbiBicmFuY2hlcyBoYXZlIGJlZW4gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgd2hpY2ggYXJlIG1vcmUgcmVjZW50XG4gICAgLy8gdGhhbiB0aGUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbmV4dCBicmFuY2ggKGkuZS4gYG1hc3RlcmApLiBXZSBjb3VsZCBpZ25vcmUgc3VjaCBicmFuY2hlc1xuICAgIC8vIHNpbGVudGx5LCBidXQgaXQgbWlnaHQgYmUgc3ltcHRvbWF0aWMgZm9yIGFuIG91dGRhdGVkIHZlcnNpb24gaW4gdGhlIGBuZXh0YCBicmFuY2gsIG9yIGFuXG4gICAgLy8gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgYnJhbmNoIGJ5IHRoZSBjYXJldGFrZXIuIEluIGVpdGhlciB3YXkgd2Ugd2FudCB0byByYWlzZSBhd2FyZW5lc3MuXG4gICAgaWYgKHNlbXZlci5ndChwYXJzZWQsIG5leHRSZWxlYXNlVHJhaW5WZXJzaW9uKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCB2ZXJzaW9uLWJyYW5jaCBcIiR7bmFtZX1cIiBmb3IgYSByZWxlYXNlLXRyYWluIHRoYXQgaXMgYCArXG4gICAgICAgICAgYG1vcmUgcmVjZW50IHRoYW4gdGhlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLiBgICtcbiAgICAgICAgICBgUGxlYXNlIGVpdGhlciBkZWxldGUgdGhlIGJyYW5jaCBpZiBjcmVhdGVkIGJ5IGFjY2lkZW50LCBvciB1cGRhdGUgdGhlIG91dGRhdGVkIGAgK1xuICAgICAgICAgIGB2ZXJzaW9uIGluIHRoZSBuZXh0IGJyYW5jaCAoJHtuZXh0QnJhbmNoTmFtZX0pLmApO1xuICAgIH0gZWxzZSBpZiAoc2VtdmVyLmVxKHBhcnNlZCwgbmV4dFJlbGVhc2VUcmFpblZlcnNpb24pKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICBgRGlzY292ZXJlZCB1bmV4cGVjdGVkIHZlcnNpb24tYnJhbmNoIFwiJHtuYW1lfVwiIGZvciBhIHJlbGVhc2UtdHJhaW4gdGhhdCBpcyBhbHJlYWR5IGAgK1xuICAgICAgICAgIGBhY3RpdmUgaW4gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guIFBsZWFzZSBlaXRoZXIgZGVsZXRlIHRoZSBicmFuY2ggaWYgYCArXG4gICAgICAgICAgYGNyZWF0ZWQgYnkgYWNjaWRlbnQsIG9yIHVwZGF0ZSB0aGUgdmVyc2lvbiBpbiB0aGUgbmV4dCBicmFuY2ggKCR7bmV4dEJyYW5jaE5hbWV9KS5gKTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvbk9mQnJhbmNoKHJlcG8sIG5hbWUpO1xuICAgIGNvbnN0IGlzUHJlcmVsZWFzZSA9IHZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ3JjJyB8fCB2ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICduZXh0JztcbiAgICBpZiAoaXNQcmVyZWxlYXNlKSB7XG4gICAgICBpZiAocmVsZWFzZUNhbmRpZGF0ZUJyYW5jaCAhPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gZGV0ZXJtaW5lIGxhdGVzdCByZWxlYXNlLXRyYWluLiBGb3VuZCB0d28gY29uc2VjdXRpdmUgYCArXG4gICAgICAgICAgICBgYnJhbmNoZXMgaW4gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuIERpZCBub3QgZXhwZWN0IGJvdGggXCIke25hbWV9XCIgYCArXG4gICAgICAgICAgICBgYW5kIFwiJHtyZWxlYXNlQ2FuZGlkYXRlQnJhbmNofVwiIHRvIGJlIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIG1vZGUuYCk7XG4gICAgICB9IGVsc2UgaWYgKHZlcnNpb24ubWFqb3IgIT09IGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCBvbGQgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLiBFeHBlY3RlZCBubyBgICtcbiAgICAgICAgICAgIGB2ZXJzaW9uLWJyYW5jaCBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBtb2RlIGZvciB2JHt2ZXJzaW9uLm1ham9yfS5gKTtcbiAgICAgIH1cbiAgICAgIHJlbGVhc2VDYW5kaWRhdGVCcmFuY2ggPSBuYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXRlc3RWZXJzaW9uQnJhbmNoID0gbmFtZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7cmVsZWFzZUNhbmRpZGF0ZUJyYW5jaCwgbGF0ZXN0VmVyc2lvbkJyYW5jaH07XG59XG4iXX0=