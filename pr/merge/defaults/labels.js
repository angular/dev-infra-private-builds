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
        define("@angular/dev-infra-private/pr/merge/defaults/labels", ["require", "exports", "tslib", "@angular/dev-infra-private/release/versioning", "@angular/dev-infra-private/pr/merge/target-label", "@angular/dev-infra-private/pr/merge/defaults/lts-branch"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDefaultTargetLabelConfiguration = void 0;
    var tslib_1 = require("tslib");
    var versioning_1 = require("@angular/dev-infra-private/release/versioning");
    var target_label_1 = require("@angular/dev-infra-private/pr/merge/target-label");
    var lts_branch_1 = require("@angular/dev-infra-private/pr/merge/defaults/lts-branch");
    /**
     * Gets a label configuration for the merge tooling that reflects the default Angular
     * organization-wide labeling and branching semantics as outlined in the specification.
     *
     * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU
     *
     * @param api Instance of an authenticated Github client.
     * @param githubConfig Configuration for the Github remote. Used as Git remote
     *   for the release train branches.
     * @param releaseConfig Configuration for the release packages. Used to fetch
     *   NPM version data when LTS version branches are validated.
     */
    function getDefaultTargetLabelConfiguration(api, githubConfig, releaseConfig) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var repo, _a, latest, releaseCandidate, next;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        repo = { owner: githubConfig.owner, name: githubConfig.name, api: api };
                        return [4 /*yield*/, versioning_1.fetchActiveReleaseTrains(repo)];
                    case 1:
                        _a = _b.sent(), latest = _a.latest, releaseCandidate = _a.releaseCandidate, next = _a.next;
                        return [2 /*return*/, [
                                {
                                    pattern: 'target: major',
                                    branches: function () {
                                        // If `next` is currently not designated to be a major version, we do not
                                        // allow merging of PRs with `target: major`.
                                        if (!next.isMajor) {
                                            throw new target_label_1.InvalidTargetLabelError("Unable to merge pull request. The \"" + versioning_1.nextBranchName + "\" branch will be released as " +
                                                'a minor version.');
                                        }
                                        return [versioning_1.nextBranchName];
                                    },
                                },
                                {
                                    pattern: 'target: minor',
                                    // Changes labeled with `target: minor` are merged most commonly into the next branch
                                    // (i.e. `master`). In rare cases of an exceptional minor version while being already
                                    // on a major release train, this would need to be overridden manually.
                                    // TODO: Consider handling this automatically by checking if the NPM version matches
                                    // the last-minor. If not, then an exceptional minor might be in progress. See:
                                    // https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU/edit#heading=h.h7o5pjq6yqd0
                                    branches: [versioning_1.nextBranchName],
                                },
                                {
                                    pattern: 'target: patch',
                                    branches: function (githubTargetBranch) {
                                        // If a PR is targeting the latest active version-branch through the Github UI,
                                        // and is also labeled with `target: patch`, then we merge it directly into the
                                        // branch without doing any cherry-picking. This is useful if a PR could not be
                                        // applied cleanly, and a separate PR for the patch branch has been created.
                                        if (githubTargetBranch === latest.branchName) {
                                            return [latest.branchName];
                                        }
                                        // Otherwise, patch changes are always merged into the next and patch branch.
                                        var branches = [versioning_1.nextBranchName, latest.branchName];
                                        // Additionally, if there is a release-candidate/feature-freeze release-train
                                        // currently active, also merge the PR into that version-branch.
                                        if (releaseCandidate !== null) {
                                            branches.push(releaseCandidate.branchName);
                                        }
                                        return branches;
                                    }
                                },
                                {
                                    pattern: 'target: rc',
                                    branches: function (githubTargetBranch) {
                                        // The `target: rc` label cannot be applied if there is no active feature-freeze
                                        // or release-candidate release train.
                                        if (releaseCandidate === null) {
                                            throw new target_label_1.InvalidTargetLabelError("No active feature-freeze/release-candidate branch. " +
                                                "Unable to merge pull request using \"target: rc\" label.");
                                        }
                                        // If the PR is targeting the active release-candidate/feature-freeze version branch
                                        // directly through the Github UI and has the `target: rc` label applied, merge it
                                        // only into the release candidate branch. This is useful if a PR did not apply cleanly
                                        // into the release-candidate/feature-freeze branch, and a separate PR has been created.
                                        if (githubTargetBranch === releaseCandidate.branchName) {
                                            return [releaseCandidate.branchName];
                                        }
                                        // Otherwise, merge into the next and active release-candidate/feature-freeze branch.
                                        return [versioning_1.nextBranchName, releaseCandidate.branchName];
                                    },
                                },
                                {
                                    // LTS changes are rare enough that we won't worry about cherry-picking changes into all
                                    // active LTS branches for PRs created against any other branch. Instead, PR authors need
                                    // to manually create separate PRs for desired LTS branches. Additionally, active LT branches
                                    // commonly diverge quickly. This makes cherry-picking not an option for LTS changes.
                                    pattern: 'target: lts',
                                    branches: function (githubTargetBranch) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                        return tslib_1.__generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!versioning_1.isVersionBranch(githubTargetBranch)) {
                                                        throw new target_label_1.InvalidTargetBranchError("PR cannot be merged as it does not target a long-term support " +
                                                            ("branch: \"" + githubTargetBranch + "\""));
                                                    }
                                                    if (githubTargetBranch === latest.branchName) {
                                                        throw new target_label_1.InvalidTargetBranchError("PR cannot be merged with \"target: lts\" into patch branch. " +
                                                            "Consider changing the label to \"target: patch\" if this is intentional.");
                                                    }
                                                    if (releaseCandidate !== null && githubTargetBranch === releaseCandidate.branchName) {
                                                        throw new target_label_1.InvalidTargetBranchError("PR cannot be merged with \"target: lts\" into feature-freeze/release-candidate " +
                                                            "branch. Consider changing the label to \"target: rc\" if this is intentional.");
                                                    }
                                                    // Assert that the selected branch is an active LTS branch.
                                                    return [4 /*yield*/, lts_branch_1.assertActiveLtsBranch(repo, releaseConfig, githubTargetBranch)];
                                                case 1:
                                                    // Assert that the selected branch is an active LTS branch.
                                                    _a.sent();
                                                    return [2 /*return*/, [githubTargetBranch]];
                                            }
                                        });
                                    }); },
                                },
                            ]];
                }
            });
        });
    }
    exports.getDefaultTargetLabelConfiguration = getDefaultTargetLabelConfiguration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2RlZmF1bHRzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBR0gsNEVBQXNHO0lBSXRHLGlGQUFrRjtJQUVsRixzRkFBbUQ7SUFFbkQ7Ozs7Ozs7Ozs7O09BV0c7SUFDSCxTQUFzQixrQ0FBa0MsQ0FDcEQsR0FBaUIsRUFBRSxZQUEwQixFQUM3QyxhQUE0Qjs7Ozs7Ozt3QkFDeEIsSUFBSSxHQUFHLEVBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxLQUFBLEVBQUMsQ0FBQzt3QkFDOUIscUJBQU0scUNBQXdCLENBQUMsSUFBSSxDQUFDLEVBQUE7O3dCQUF2RSxLQUFtQyxTQUFvQyxFQUF0RSxNQUFNLFlBQUEsRUFBRSxnQkFBZ0Isc0JBQUEsRUFBRSxJQUFJLFVBQUE7d0JBRXJDLHNCQUFPO2dDQUNMO29DQUNFLE9BQU8sRUFBRSxlQUFlO29DQUN4QixRQUFRLEVBQUU7d0NBQ1IseUVBQXlFO3dDQUN6RSw2Q0FBNkM7d0NBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFOzRDQUNqQixNQUFNLElBQUksc0NBQXVCLENBQzdCLHlDQUFzQywyQkFBYyxtQ0FBK0I7Z0RBQ25GLGtCQUFrQixDQUFDLENBQUM7eUNBQ3pCO3dDQUNELE9BQU8sQ0FBQywyQkFBYyxDQUFDLENBQUM7b0NBQzFCLENBQUM7aUNBQ0Y7Z0NBQ0Q7b0NBQ0UsT0FBTyxFQUFFLGVBQWU7b0NBQ3hCLHFGQUFxRjtvQ0FDckYscUZBQXFGO29DQUNyRix1RUFBdUU7b0NBQ3ZFLG9GQUFvRjtvQ0FDcEYsK0VBQStFO29DQUMvRSw4R0FBOEc7b0NBQzlHLFFBQVEsRUFBRSxDQUFDLDJCQUFjLENBQUM7aUNBQzNCO2dDQUNEO29DQUNFLE9BQU8sRUFBRSxlQUFlO29DQUN4QixRQUFRLEVBQUUsVUFBQSxrQkFBa0I7d0NBQzFCLCtFQUErRTt3Q0FDL0UsK0VBQStFO3dDQUMvRSwrRUFBK0U7d0NBQy9FLDRFQUE0RTt3Q0FDNUUsSUFBSSxrQkFBa0IsS0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFOzRDQUM1QyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3lDQUM1Qjt3Q0FDRCw2RUFBNkU7d0NBQzdFLElBQU0sUUFBUSxHQUFHLENBQUMsMkJBQWMsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7d0NBQ3JELDZFQUE2RTt3Q0FDN0UsZ0VBQWdFO3dDQUNoRSxJQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRTs0Q0FDN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzt5Q0FDNUM7d0NBQ0QsT0FBTyxRQUFRLENBQUM7b0NBQ2xCLENBQUM7aUNBQ0Y7Z0NBQ0Q7b0NBQ0UsT0FBTyxFQUFFLFlBQVk7b0NBQ3JCLFFBQVEsRUFBRSxVQUFBLGtCQUFrQjt3Q0FDMUIsZ0ZBQWdGO3dDQUNoRixzQ0FBc0M7d0NBQ3RDLElBQUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFOzRDQUM3QixNQUFNLElBQUksc0NBQXVCLENBQzdCLHFEQUFxRDtnREFDckQsMERBQXdELENBQUMsQ0FBQzt5Q0FDL0Q7d0NBQ0Qsb0ZBQW9GO3dDQUNwRixrRkFBa0Y7d0NBQ2xGLHVGQUF1Rjt3Q0FDdkYsd0ZBQXdGO3dDQUN4RixJQUFJLGtCQUFrQixLQUFLLGdCQUFnQixDQUFDLFVBQVUsRUFBRTs0Q0FDdEQsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO3lDQUN0Qzt3Q0FDRCxxRkFBcUY7d0NBQ3JGLE9BQU8sQ0FBQywyQkFBYyxFQUFFLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO29DQUN2RCxDQUFDO2lDQUNGO2dDQUNEO29DQUNFLHdGQUF3RjtvQ0FDeEYseUZBQXlGO29DQUN6Riw2RkFBNkY7b0NBQzdGLHFGQUFxRjtvQ0FDckYsT0FBTyxFQUFFLGFBQWE7b0NBQ3RCLFFBQVEsRUFBRSxVQUFNLGtCQUFrQjs7OztvREFDaEMsSUFBSSxDQUFDLDRCQUFlLENBQUMsa0JBQWtCLENBQUMsRUFBRTt3REFDeEMsTUFBTSxJQUFJLHVDQUF3QixDQUM5QixnRUFBZ0U7NkRBQ2hFLGVBQVksa0JBQWtCLE9BQUcsQ0FBQSxDQUFDLENBQUM7cURBQ3hDO29EQUNELElBQUksa0JBQWtCLEtBQUssTUFBTSxDQUFDLFVBQVUsRUFBRTt3REFDNUMsTUFBTSxJQUFJLHVDQUF3QixDQUM5Qiw4REFBNEQ7NERBQzVELDBFQUF3RSxDQUFDLENBQUM7cURBQy9FO29EQUNELElBQUksZ0JBQWdCLEtBQUssSUFBSSxJQUFJLGtCQUFrQixLQUFLLGdCQUFnQixDQUFDLFVBQVUsRUFBRTt3REFDbkYsTUFBTSxJQUFJLHVDQUF3QixDQUM5QixpRkFBK0U7NERBQy9FLCtFQUE2RSxDQUFDLENBQUM7cURBQ3BGO29EQUNELDJEQUEyRDtvREFDM0QscUJBQU0sa0NBQXFCLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxFQUFBOztvREFEcEUsMkRBQTJEO29EQUMzRCxTQUFvRSxDQUFDO29EQUNyRSxzQkFBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUM7Ozt5Q0FDN0I7aUNBQ0Y7NkJBQ0YsRUFBQzs7OztLQUNIO0lBbkdELGdGQW1HQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uLy4uLy4uL3JlbGVhc2UvY29uZmlnL2luZGV4JztcbmltcG9ydCB7ZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zLCBpc1ZlcnNpb25CcmFuY2gsIG5leHRCcmFuY2hOYW1lfSBmcm9tICcuLi8uLi8uLi9yZWxlYXNlL3ZlcnNpb25pbmcnO1xuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge0dpdGh1YkNsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yic7XG5pbXBvcnQge1RhcmdldExhYmVsfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsIEludmFsaWRUYXJnZXRMYWJlbEVycm9yfSBmcm9tICcuLi90YXJnZXQtbGFiZWwnO1xuXG5pbXBvcnQge2Fzc2VydEFjdGl2ZUx0c0JyYW5jaH0gZnJvbSAnLi9sdHMtYnJhbmNoJztcblxuLyoqXG4gKiBHZXRzIGEgbGFiZWwgY29uZmlndXJhdGlvbiBmb3IgdGhlIG1lcmdlIHRvb2xpbmcgdGhhdCByZWZsZWN0cyB0aGUgZGVmYXVsdCBBbmd1bGFyXG4gKiBvcmdhbml6YXRpb24td2lkZSBsYWJlbGluZyBhbmQgYnJhbmNoaW5nIHNlbWFudGljcyBhcyBvdXRsaW5lZCBpbiB0aGUgc3BlY2lmaWNhdGlvbi5cbiAqXG4gKiBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzE5N2tWaWxsRHd4LVJadFNWT0J0UGI0QkJJQXcwRTlSVDNxM3Y2RFpreWtVXG4gKlxuICogQHBhcmFtIGFwaSBJbnN0YW5jZSBvZiBhbiBhdXRoZW50aWNhdGVkIEdpdGh1YiBjbGllbnQuXG4gKiBAcGFyYW0gZ2l0aHViQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBHaXRodWIgcmVtb3RlLiBVc2VkIGFzIEdpdCByZW1vdGVcbiAqICAgZm9yIHRoZSByZWxlYXNlIHRyYWluIGJyYW5jaGVzLlxuICogQHBhcmFtIHJlbGVhc2VDb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIHJlbGVhc2UgcGFja2FnZXMuIFVzZWQgdG8gZmV0Y2hcbiAqICAgTlBNIHZlcnNpb24gZGF0YSB3aGVuIExUUyB2ZXJzaW9uIGJyYW5jaGVzIGFyZSB2YWxpZGF0ZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZWZhdWx0VGFyZ2V0TGFiZWxDb25maWd1cmF0aW9uKFxuICAgIGFwaTogR2l0aHViQ2xpZW50LCBnaXRodWJDb25maWc6IEdpdGh1YkNvbmZpZyxcbiAgICByZWxlYXNlQ29uZmlnOiBSZWxlYXNlQ29uZmlnKTogUHJvbWlzZTxUYXJnZXRMYWJlbFtdPiB7XG4gIGNvbnN0IHJlcG8gPSB7b3duZXI6IGdpdGh1YkNvbmZpZy5vd25lciwgbmFtZTogZ2l0aHViQ29uZmlnLm5hbWUsIGFwaX07XG4gIGNvbnN0IHtsYXRlc3QsIHJlbGVhc2VDYW5kaWRhdGUsIG5leHR9ID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHJlcG8pO1xuXG4gIHJldHVybiBbXG4gICAge1xuICAgICAgcGF0dGVybjogJ3RhcmdldDogbWFqb3InLFxuICAgICAgYnJhbmNoZXM6ICgpID0+IHtcbiAgICAgICAgLy8gSWYgYG5leHRgIGlzIGN1cnJlbnRseSBub3QgZGVzaWduYXRlZCB0byBiZSBhIG1ham9yIHZlcnNpb24sIHdlIGRvIG5vdFxuICAgICAgICAvLyBhbGxvdyBtZXJnaW5nIG9mIFBScyB3aXRoIGB0YXJnZXQ6IG1ham9yYC5cbiAgICAgICAgaWYgKCFuZXh0LmlzTWFqb3IpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAgICAgICAgIGBVbmFibGUgdG8gbWVyZ2UgcHVsbCByZXF1ZXN0LiBUaGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaCB3aWxsIGJlIHJlbGVhc2VkIGFzIGAgK1xuICAgICAgICAgICAgICAnYSBtaW5vciB2ZXJzaW9uLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbbmV4dEJyYW5jaE5hbWVdO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IG1pbm9yJyxcbiAgICAgIC8vIENoYW5nZXMgbGFiZWxlZCB3aXRoIGB0YXJnZXQ6IG1pbm9yYCBhcmUgbWVyZ2VkIG1vc3QgY29tbW9ubHkgaW50byB0aGUgbmV4dCBicmFuY2hcbiAgICAgIC8vIChpLmUuIGBtYXN0ZXJgKS4gSW4gcmFyZSBjYXNlcyBvZiBhbiBleGNlcHRpb25hbCBtaW5vciB2ZXJzaW9uIHdoaWxlIGJlaW5nIGFscmVhZHlcbiAgICAgIC8vIG9uIGEgbWFqb3IgcmVsZWFzZSB0cmFpbiwgdGhpcyB3b3VsZCBuZWVkIHRvIGJlIG92ZXJyaWRkZW4gbWFudWFsbHkuXG4gICAgICAvLyBUT0RPOiBDb25zaWRlciBoYW5kbGluZyB0aGlzIGF1dG9tYXRpY2FsbHkgYnkgY2hlY2tpbmcgaWYgdGhlIE5QTSB2ZXJzaW9uIG1hdGNoZXNcbiAgICAgIC8vIHRoZSBsYXN0LW1pbm9yLiBJZiBub3QsIHRoZW4gYW4gZXhjZXB0aW9uYWwgbWlub3IgbWlnaHQgYmUgaW4gcHJvZ3Jlc3MuIFNlZTpcbiAgICAgIC8vIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMTk3a1ZpbGxEd3gtUlp0U1ZPQnRQYjRCQklBdzBFOVJUM3EzdjZEWmt5a1UvZWRpdCNoZWFkaW5nPWguaDdvNXBqcTZ5cWQwXG4gICAgICBicmFuY2hlczogW25leHRCcmFuY2hOYW1lXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IHBhdGNoJyxcbiAgICAgIGJyYW5jaGVzOiBnaXRodWJUYXJnZXRCcmFuY2ggPT4ge1xuICAgICAgICAvLyBJZiBhIFBSIGlzIHRhcmdldGluZyB0aGUgbGF0ZXN0IGFjdGl2ZSB2ZXJzaW9uLWJyYW5jaCB0aHJvdWdoIHRoZSBHaXRodWIgVUksXG4gICAgICAgIC8vIGFuZCBpcyBhbHNvIGxhYmVsZWQgd2l0aCBgdGFyZ2V0OiBwYXRjaGAsIHRoZW4gd2UgbWVyZ2UgaXQgZGlyZWN0bHkgaW50byB0aGVcbiAgICAgICAgLy8gYnJhbmNoIHdpdGhvdXQgZG9pbmcgYW55IGNoZXJyeS1waWNraW5nLiBUaGlzIGlzIHVzZWZ1bCBpZiBhIFBSIGNvdWxkIG5vdCBiZVxuICAgICAgICAvLyBhcHBsaWVkIGNsZWFubHksIGFuZCBhIHNlcGFyYXRlIFBSIGZvciB0aGUgcGF0Y2ggYnJhbmNoIGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IGxhdGVzdC5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIFtsYXRlc3QuYnJhbmNoTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBwYXRjaCBjaGFuZ2VzIGFyZSBhbHdheXMgbWVyZ2VkIGludG8gdGhlIG5leHQgYW5kIHBhdGNoIGJyYW5jaC5cbiAgICAgICAgY29uc3QgYnJhbmNoZXMgPSBbbmV4dEJyYW5jaE5hbWUsIGxhdGVzdC5icmFuY2hOYW1lXTtcbiAgICAgICAgLy8gQWRkaXRpb25hbGx5LCBpZiB0aGVyZSBpcyBhIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIHJlbGVhc2UtdHJhaW5cbiAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2ZSwgYWxzbyBtZXJnZSB0aGUgUFIgaW50byB0aGF0IHZlcnNpb24tYnJhbmNoLlxuICAgICAgICBpZiAocmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGJyYW5jaGVzLnB1c2gocmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnJhbmNoZXM7XG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBwYXR0ZXJuOiAndGFyZ2V0OiByYycsXG4gICAgICBicmFuY2hlczogZ2l0aHViVGFyZ2V0QnJhbmNoID0+IHtcbiAgICAgICAgLy8gVGhlIGB0YXJnZXQ6IHJjYCBsYWJlbCBjYW5ub3QgYmUgYXBwbGllZCBpZiB0aGVyZSBpcyBubyBhY3RpdmUgZmVhdHVyZS1mcmVlemVcbiAgICAgICAgLy8gb3IgcmVsZWFzZS1jYW5kaWRhdGUgcmVsZWFzZSB0cmFpbi5cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAgICAgICAgIGBObyBhY3RpdmUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLiBgICtcbiAgICAgICAgICAgICAgYFVuYWJsZSB0byBtZXJnZSBwdWxsIHJlcXVlc3QgdXNpbmcgXCJ0YXJnZXQ6IHJjXCIgbGFiZWwuYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgdGhlIFBSIGlzIHRhcmdldGluZyB0aGUgYWN0aXZlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIHZlcnNpb24gYnJhbmNoXG4gICAgICAgIC8vIGRpcmVjdGx5IHRocm91Z2ggdGhlIEdpdGh1YiBVSSBhbmQgaGFzIHRoZSBgdGFyZ2V0OiByY2AgbGFiZWwgYXBwbGllZCwgbWVyZ2UgaXRcbiAgICAgICAgLy8gb25seSBpbnRvIHRoZSByZWxlYXNlIGNhbmRpZGF0ZSBicmFuY2guIFRoaXMgaXMgdXNlZnVsIGlmIGEgUFIgZGlkIG5vdCBhcHBseSBjbGVhbmx5XG4gICAgICAgIC8vIGludG8gdGhlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIGJyYW5jaCwgYW5kIGEgc2VwYXJhdGUgUFIgaGFzIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgaWYgKGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIFtyZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgbWVyZ2UgaW50byB0aGUgbmV4dCBhbmQgYWN0aXZlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIGJyYW5jaC5cbiAgICAgICAgcmV0dXJuIFtuZXh0QnJhbmNoTmFtZSwgcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lXTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICAvLyBMVFMgY2hhbmdlcyBhcmUgcmFyZSBlbm91Z2ggdGhhdCB3ZSB3b24ndCB3b3JyeSBhYm91dCBjaGVycnktcGlja2luZyBjaGFuZ2VzIGludG8gYWxsXG4gICAgICAvLyBhY3RpdmUgTFRTIGJyYW5jaGVzIGZvciBQUnMgY3JlYXRlZCBhZ2FpbnN0IGFueSBvdGhlciBicmFuY2guIEluc3RlYWQsIFBSIGF1dGhvcnMgbmVlZFxuICAgICAgLy8gdG8gbWFudWFsbHkgY3JlYXRlIHNlcGFyYXRlIFBScyBmb3IgZGVzaXJlZCBMVFMgYnJhbmNoZXMuIEFkZGl0aW9uYWxseSwgYWN0aXZlIExUIGJyYW5jaGVzXG4gICAgICAvLyBjb21tb25seSBkaXZlcmdlIHF1aWNrbHkuIFRoaXMgbWFrZXMgY2hlcnJ5LXBpY2tpbmcgbm90IGFuIG9wdGlvbiBmb3IgTFRTIGNoYW5nZXMuXG4gICAgICBwYXR0ZXJuOiAndGFyZ2V0OiBsdHMnLFxuICAgICAgYnJhbmNoZXM6IGFzeW5jIGdpdGh1YlRhcmdldEJyYW5jaCA9PiB7XG4gICAgICAgIGlmICghaXNWZXJzaW9uQnJhbmNoKGdpdGh1YlRhcmdldEJyYW5jaCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCBhcyBpdCBkb2VzIG5vdCB0YXJnZXQgYSBsb25nLXRlcm0gc3VwcG9ydCBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaDogXCIke2dpdGh1YlRhcmdldEJyYW5jaH1cImApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IGxhdGVzdC5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihcbiAgICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgd2l0aCBcInRhcmdldDogbHRzXCIgaW50byBwYXRjaCBicmFuY2guIGAgK1xuICAgICAgICAgICAgICBgQ29uc2lkZXIgY2hhbmdpbmcgdGhlIGxhYmVsIHRvIFwidGFyZ2V0OiBwYXRjaFwiIGlmIHRoaXMgaXMgaW50ZW50aW9uYWwuYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwgJiYgZ2l0aHViVGFyZ2V0QnJhbmNoID09PSByZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCB3aXRoIFwidGFyZ2V0OiBsdHNcIiBpbnRvIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGAgK1xuICAgICAgICAgICAgICBgYnJhbmNoLiBDb25zaWRlciBjaGFuZ2luZyB0aGUgbGFiZWwgdG8gXCJ0YXJnZXQ6IHJjXCIgaWYgdGhpcyBpcyBpbnRlbnRpb25hbC5gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBc3NlcnQgdGhhdCB0aGUgc2VsZWN0ZWQgYnJhbmNoIGlzIGFuIGFjdGl2ZSBMVFMgYnJhbmNoLlxuICAgICAgICBhd2FpdCBhc3NlcnRBY3RpdmVMdHNCcmFuY2gocmVwbywgcmVsZWFzZUNvbmZpZywgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbiAgICAgICAgcmV0dXJuIFtnaXRodWJUYXJnZXRCcmFuY2hdO1xuICAgICAgfSxcbiAgICB9LFxuICBdO1xufVxuIl19