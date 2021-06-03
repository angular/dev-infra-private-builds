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
        define("@angular/dev-infra-private/pr/merge/defaults/lts-branch", ["require", "exports", "tslib", "semver", "@angular/dev-infra-private/release/versioning", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pr/merge/target-label"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertActiveLtsBranch = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var versioning_1 = require("@angular/dev-infra-private/release/versioning");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var target_label_1 = require("@angular/dev-infra-private/pr/merge/target-label");
    /**
     * Asserts that the given branch corresponds to an active LTS version-branch that can receive
     * backport fixes. Throws an error if LTS expired or an invalid branch is selected.
     *
     * @param repo Repository containing the given branch. Used for Github API queries.
     * @param releaseConfig Configuration for releases. Used to query NPM about past publishes.
     * @param branchName Branch that is checked to be an active LTS version-branch.
     * */
    function assertActiveLtsBranch(repo, releaseConfig, branchName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var version, _a, distTags, time, ltsNpmTag, ltsVersion, today, majorReleaseDate, ltsEndDate, ltsEndDateText;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, versioning_1.getVersionOfBranch(repo, branchName)];
                    case 1:
                        version = _b.sent();
                        return [4 /*yield*/, versioning_1.fetchProjectNpmPackageInfo(releaseConfig)];
                    case 2:
                        _a = _b.sent(), distTags = _a["dist-tags"], time = _a.time;
                        ltsNpmTag = versioning_1.getLtsNpmDistTagOfMajor(version.major);
                        ltsVersion = semver.parse(distTags[ltsNpmTag]);
                        // Ensure that there is an LTS version tagged for the given version-branch major. e.g.
                        // if the version branch is `9.2.x` then we want to make sure that there is an LTS
                        // version tagged in NPM for `v9`, following the `v{major}-lts` tag convention.
                        if (ltsVersion === null) {
                            throw new target_label_1.InvalidTargetBranchError("No LTS version tagged for v" + version.major + " in NPM.");
                        }
                        // Ensure that the correct branch is used for the LTS version. We do not want to merge
                        // changes to older minor version branches that do not reflect the current LTS version.
                        if (branchName !== ltsVersion.major + "." + ltsVersion.minor + ".x") {
                            throw new target_label_1.InvalidTargetBranchError("Not using last-minor branch for v" + version.major + " LTS version. PR " +
                                ("should be updated to target: " + ltsVersion.major + "." + ltsVersion.minor + ".x"));
                        }
                        today = new Date();
                        majorReleaseDate = new Date(time[version.major + ".0.0"]);
                        ltsEndDate = versioning_1.computeLtsEndDateOfMajor(majorReleaseDate);
                        if (!(today > ltsEndDate)) return [3 /*break*/, 4];
                        ltsEndDateText = ltsEndDate.toLocaleDateString('en-US');
                        console_1.warn(console_1.red("Long-term support ended for v" + version.major + " on " + ltsEndDateText + "."));
                        console_1.warn(console_1.yellow("Merging of pull requests for this major is generally not " +
                            "desired, but can be forcibly ignored."));
                        return [4 /*yield*/, console_1.promptConfirm('Do you want to forcibly proceed with merging?')];
                    case 3:
                        if (_b.sent()) {
                            return [2 /*return*/];
                        }
                        throw new target_label_1.InvalidTargetBranchError("Long-term supported ended for v" + version.major + " on " + ltsEndDateText + ". " +
                            ("Pull request cannot be merged into the " + branchName + " branch."));
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    exports.assertActiveLtsBranch = assertActiveLtsBranch;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHRzLWJyYW5jaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS9kZWZhdWx0cy9sdHMtYnJhbmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFHakMsNEVBQWlLO0lBQ2pLLG9FQUF3RTtJQUN4RSxpRkFBeUQ7SUFFekQ7Ozs7Ozs7U0FPSztJQUNMLFNBQXNCLHFCQUFxQixDQUN2QyxJQUF1QixFQUFFLGFBQTRCLEVBQUUsVUFBa0I7Ozs7OzRCQUMzRCxxQkFBTSwrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUE7O3dCQUFwRCxPQUFPLEdBQUcsU0FBMEM7d0JBQ3BCLHFCQUFNLHVDQUEwQixDQUFDLGFBQWEsQ0FBQyxFQUFBOzt3QkFBL0UsS0FBZ0MsU0FBK0MsRUFBakUsUUFBUSxrQkFBQSxFQUFFLElBQUksVUFBQTt3QkFHNUIsU0FBUyxHQUFHLG9DQUF1QixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbkQsVUFBVSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBRXJELHNGQUFzRjt3QkFDdEYsa0ZBQWtGO3dCQUNsRiwrRUFBK0U7d0JBQy9FLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTs0QkFDdkIsTUFBTSxJQUFJLHVDQUF3QixDQUFDLGdDQUE4QixPQUFPLENBQUMsS0FBSyxhQUFVLENBQUMsQ0FBQzt5QkFDM0Y7d0JBRUQsc0ZBQXNGO3dCQUN0Rix1RkFBdUY7d0JBQ3ZGLElBQUksVUFBVSxLQUFRLFVBQVUsQ0FBQyxLQUFLLFNBQUksVUFBVSxDQUFDLEtBQUssT0FBSSxFQUFFOzRCQUM5RCxNQUFNLElBQUksdUNBQXdCLENBQzlCLHNDQUFvQyxPQUFPLENBQUMsS0FBSyxzQkFBbUI7aUNBQ3BFLGtDQUFnQyxVQUFVLENBQUMsS0FBSyxTQUFJLFVBQVUsQ0FBQyxLQUFLLE9BQUksQ0FBQSxDQUFDLENBQUM7eUJBQy9FO3dCQUVLLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO3dCQUNuQixnQkFBZ0IsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUksT0FBTyxDQUFDLEtBQUssU0FBTSxDQUFDLENBQUMsQ0FBQzt3QkFDMUQsVUFBVSxHQUFHLHFDQUF3QixDQUFDLGdCQUFnQixDQUFDLENBQUM7NkJBSzFELENBQUEsS0FBSyxHQUFHLFVBQVUsQ0FBQSxFQUFsQix3QkFBa0I7d0JBQ2QsY0FBYyxHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDOUQsY0FBSSxDQUFDLGFBQUcsQ0FBQyxrQ0FBZ0MsT0FBTyxDQUFDLEtBQUssWUFBTyxjQUFjLE1BQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ2pGLGNBQUksQ0FBQyxnQkFBTSxDQUNQLDJEQUEyRDs0QkFDM0QsdUNBQXVDLENBQUMsQ0FBQyxDQUFDO3dCQUMxQyxxQkFBTSx1QkFBYSxDQUFDLCtDQUErQyxDQUFDLEVBQUE7O3dCQUF4RSxJQUFJLFNBQW9FLEVBQUU7NEJBQ3hFLHNCQUFPO3lCQUNSO3dCQUNELE1BQU0sSUFBSSx1Q0FBd0IsQ0FDOUIsb0NBQWtDLE9BQU8sQ0FBQyxLQUFLLFlBQU8sY0FBYyxPQUFJOzZCQUN4RSw0Q0FBMEMsVUFBVSxhQUFVLENBQUEsQ0FBQyxDQUFDOzs7OztLQUV2RTtJQTVDRCxzREE0Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vLi4vLi4vcmVsZWFzZS9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtjb21wdXRlTHRzRW5kRGF0ZU9mTWFqb3IsIGZldGNoUHJvamVjdE5wbVBhY2thZ2VJbmZvLCBnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvciwgZ2V0VmVyc2lvbk9mQnJhbmNoLCBHaXRodWJSZXBvV2l0aEFwaX0gZnJvbSAnLi4vLi4vLi4vcmVsZWFzZS92ZXJzaW9uaW5nJztcbmltcG9ydCB7cHJvbXB0Q29uZmlybSwgcmVkLCB3YXJuLCB5ZWxsb3d9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3J9IGZyb20gJy4uL3RhcmdldC1sYWJlbCc7XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHRoZSBnaXZlbiBicmFuY2ggY29ycmVzcG9uZHMgdG8gYW4gYWN0aXZlIExUUyB2ZXJzaW9uLWJyYW5jaCB0aGF0IGNhbiByZWNlaXZlXG4gKiBiYWNrcG9ydCBmaXhlcy4gVGhyb3dzIGFuIGVycm9yIGlmIExUUyBleHBpcmVkIG9yIGFuIGludmFsaWQgYnJhbmNoIGlzIHNlbGVjdGVkLlxuICpcbiAqIEBwYXJhbSByZXBvIFJlcG9zaXRvcnkgY29udGFpbmluZyB0aGUgZ2l2ZW4gYnJhbmNoLiBVc2VkIGZvciBHaXRodWIgQVBJIHF1ZXJpZXMuXG4gKiBAcGFyYW0gcmVsZWFzZUNvbmZpZyBDb25maWd1cmF0aW9uIGZvciByZWxlYXNlcy4gVXNlZCB0byBxdWVyeSBOUE0gYWJvdXQgcGFzdCBwdWJsaXNoZXMuXG4gKiBAcGFyYW0gYnJhbmNoTmFtZSBCcmFuY2ggdGhhdCBpcyBjaGVja2VkIHRvIGJlIGFuIGFjdGl2ZSBMVFMgdmVyc2lvbi1icmFuY2guXG4gKiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFzc2VydEFjdGl2ZUx0c0JyYW5jaChcbiAgICByZXBvOiBHaXRodWJSZXBvV2l0aEFwaSwgcmVsZWFzZUNvbmZpZzogUmVsZWFzZUNvbmZpZywgYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IHZlcnNpb24gPSBhd2FpdCBnZXRWZXJzaW9uT2ZCcmFuY2gocmVwbywgYnJhbmNoTmFtZSk7XG4gIGNvbnN0IHsnZGlzdC10YWdzJzogZGlzdFRhZ3MsIHRpbWV9ID0gYXdhaXQgZmV0Y2hQcm9qZWN0TnBtUGFja2FnZUluZm8ocmVsZWFzZUNvbmZpZyk7XG5cbiAgLy8gTFRTIHZlcnNpb25zIHNob3VsZCBiZSB0YWdnZWQgaW4gTlBNIGluIHRoZSBmb2xsb3dpbmcgZm9ybWF0OiBgdnttYWpvcn0tbHRzYC5cbiAgY29uc3QgbHRzTnBtVGFnID0gZ2V0THRzTnBtRGlzdFRhZ09mTWFqb3IodmVyc2lvbi5tYWpvcik7XG4gIGNvbnN0IGx0c1ZlcnNpb24gPSBzZW12ZXIucGFyc2UoZGlzdFRhZ3NbbHRzTnBtVGFnXSk7XG5cbiAgLy8gRW5zdXJlIHRoYXQgdGhlcmUgaXMgYW4gTFRTIHZlcnNpb24gdGFnZ2VkIGZvciB0aGUgZ2l2ZW4gdmVyc2lvbi1icmFuY2ggbWFqb3IuIGUuZy5cbiAgLy8gaWYgdGhlIHZlcnNpb24gYnJhbmNoIGlzIGA5LjIueGAgdGhlbiB3ZSB3YW50IHRvIG1ha2Ugc3VyZSB0aGF0IHRoZXJlIGlzIGFuIExUU1xuICAvLyB2ZXJzaW9uIHRhZ2dlZCBpbiBOUE0gZm9yIGB2OWAsIGZvbGxvd2luZyB0aGUgYHZ7bWFqb3J9LWx0c2AgdGFnIGNvbnZlbnRpb24uXG4gIGlmIChsdHNWZXJzaW9uID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihgTm8gTFRTIHZlcnNpb24gdGFnZ2VkIGZvciB2JHt2ZXJzaW9uLm1ham9yfSBpbiBOUE0uYCk7XG4gIH1cblxuICAvLyBFbnN1cmUgdGhhdCB0aGUgY29ycmVjdCBicmFuY2ggaXMgdXNlZCBmb3IgdGhlIExUUyB2ZXJzaW9uLiBXZSBkbyBub3Qgd2FudCB0byBtZXJnZVxuICAvLyBjaGFuZ2VzIHRvIG9sZGVyIG1pbm9yIHZlcnNpb24gYnJhbmNoZXMgdGhhdCBkbyBub3QgcmVmbGVjdCB0aGUgY3VycmVudCBMVFMgdmVyc2lvbi5cbiAgaWYgKGJyYW5jaE5hbWUgIT09IGAke2x0c1ZlcnNpb24ubWFqb3J9LiR7bHRzVmVyc2lvbi5taW5vcn0ueGApIHtcbiAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICBgTm90IHVzaW5nIGxhc3QtbWlub3IgYnJhbmNoIGZvciB2JHt2ZXJzaW9uLm1ham9yfSBMVFMgdmVyc2lvbi4gUFIgYCArXG4gICAgICAgIGBzaG91bGQgYmUgdXBkYXRlZCB0byB0YXJnZXQ6ICR7bHRzVmVyc2lvbi5tYWpvcn0uJHtsdHNWZXJzaW9uLm1pbm9yfS54YCk7XG4gIH1cblxuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IG1ham9yUmVsZWFzZURhdGUgPSBuZXcgRGF0ZSh0aW1lW2Ake3ZlcnNpb24ubWFqb3J9LjAuMGBdKTtcbiAgY29uc3QgbHRzRW5kRGF0ZSA9IGNvbXB1dGVMdHNFbmREYXRlT2ZNYWpvcihtYWpvclJlbGVhc2VEYXRlKTtcblxuICAvLyBDaGVjayBpZiBMVFMgaGFzIGFscmVhZHkgZXhwaXJlZCBmb3IgdGhlIHRhcmdldGVkIG1ham9yIHZlcnNpb24uIElmIHNvLCB3ZSBkbyBub3RcbiAgLy8gYWxsb3cgdGhlIG1lcmdlIGFzIHBlciBvdXIgTFRTIGd1YXJhbnRlZXMuIENhbiBiZSBmb3JjaWJseSBvdmVycmlkZGVuIGlmIGRlc2lyZWQuXG4gIC8vIFNlZTogaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3JlbGVhc2VzI3N1cHBvcnQtcG9saWN5LWFuZC1zY2hlZHVsZS5cbiAgaWYgKHRvZGF5ID4gbHRzRW5kRGF0ZSkge1xuICAgIGNvbnN0IGx0c0VuZERhdGVUZXh0ID0gbHRzRW5kRGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLVVTJyk7XG4gICAgd2FybihyZWQoYExvbmctdGVybSBzdXBwb3J0IGVuZGVkIGZvciB2JHt2ZXJzaW9uLm1ham9yfSBvbiAke2x0c0VuZERhdGVUZXh0fS5gKSk7XG4gICAgd2Fybih5ZWxsb3coXG4gICAgICAgIGBNZXJnaW5nIG9mIHB1bGwgcmVxdWVzdHMgZm9yIHRoaXMgbWFqb3IgaXMgZ2VuZXJhbGx5IG5vdCBgICtcbiAgICAgICAgYGRlc2lyZWQsIGJ1dCBjYW4gYmUgZm9yY2libHkgaWdub3JlZC5gKSk7XG4gICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGZvcmNpYmx5IHByb2NlZWQgd2l0aCBtZXJnaW5nPycpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgIGBMb25nLXRlcm0gc3VwcG9ydGVkIGVuZGVkIGZvciB2JHt2ZXJzaW9uLm1ham9yfSBvbiAke2x0c0VuZERhdGVUZXh0fS4gYCArXG4gICAgICAgIGBQdWxsIHJlcXVlc3QgY2Fubm90IGJlIG1lcmdlZCBpbnRvIHRoZSAke2JyYW5jaE5hbWV9IGJyYW5jaC5gKTtcbiAgfVxufVxuIl19