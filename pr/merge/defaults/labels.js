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
        define("@angular/dev-infra-private/pr/merge/defaults/labels", ["require", "exports", "tslib", "@angular/dev-infra-private/pr/merge/target-label", "@angular/dev-infra-private/pr/merge/defaults/branches", "@angular/dev-infra-private/pr/merge/defaults/lts-branch"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDefaultTargetLabelConfiguration = void 0;
    var tslib_1 = require("tslib");
    var target_label_1 = require("@angular/dev-infra-private/pr/merge/target-label");
    var branches_1 = require("@angular/dev-infra-private/pr/merge/defaults/branches");
    var lts_branch_1 = require("@angular/dev-infra-private/pr/merge/defaults/lts-branch");
    /**
     * Gets a label configuration for the merge tooling that reflects the default Angular
     * organization-wide labeling and branching semantics as outlined in the specification.
     *
     * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU
     */
    function getDefaultTargetLabelConfiguration(api, github, npmPackageName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var repo, nextVersion, hasNextMajorTrain, _a, latestVersionBranch, releaseCandidateBranch;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        repo = { owner: github.owner, repo: github.name, api: api, npmPackageName: npmPackageName };
                        return [4 /*yield*/, branches_1.getVersionOfBranch(repo, branches_1.nextBranchName)];
                    case 1:
                        nextVersion = _b.sent();
                        hasNextMajorTrain = nextVersion.minor === 0;
                        return [4 /*yield*/, branches_1.fetchActiveReleaseTrainBranches(repo, nextVersion)];
                    case 2:
                        _a = _b.sent(), latestVersionBranch = _a.latestVersionBranch, releaseCandidateBranch = _a.releaseCandidateBranch;
                        return [2 /*return*/, [
                                {
                                    pattern: 'target: major',
                                    branches: function () {
                                        // If `next` is currently not designated to be a major version, we do not
                                        // allow merging of PRs with `target: major`.
                                        if (!hasNextMajorTrain) {
                                            throw new target_label_1.InvalidTargetLabelError("Unable to merge pull request. The \"" + branches_1.nextBranchName + "\" branch will be " +
                                                "released as a minor version.");
                                        }
                                        return [branches_1.nextBranchName];
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
                                    branches: [branches_1.nextBranchName],
                                },
                                {
                                    pattern: 'target: patch',
                                    branches: function (githubTargetBranch) {
                                        // If a PR is targeting the latest active version-branch through the Github UI,
                                        // and is also labeled with `target: patch`, then we merge it directly into the
                                        // branch without doing any cherry-picking. This is useful if a PR could not be
                                        // applied cleanly, and a separate PR for the patch branch has been created.
                                        if (githubTargetBranch === latestVersionBranch) {
                                            return [latestVersionBranch];
                                        }
                                        // Otherwise, patch changes are always merged into the next and patch branch.
                                        var branches = [branches_1.nextBranchName, latestVersionBranch];
                                        // Additionally, if there is a release-candidate/feature-freeze release-train
                                        // currently active, also merge the PR into that version-branch.
                                        if (releaseCandidateBranch !== null) {
                                            branches.push(releaseCandidateBranch);
                                        }
                                        return branches;
                                    }
                                },
                                {
                                    pattern: 'target: rc',
                                    branches: function (githubTargetBranch) {
                                        // The `target: rc` label cannot be applied if there is no active feature-freeze
                                        // or release-candidate release train.
                                        if (releaseCandidateBranch === null) {
                                            throw new target_label_1.InvalidTargetLabelError("No active feature-freeze/release-candidate branch. " +
                                                "Unable to merge pull request using \"target: rc\" label.");
                                        }
                                        // If the PR is targeting the active release-candidate/feature-freeze version branch
                                        // directly through the Github UI and has the `target: rc` label applied, merge it
                                        // only into the release candidate branch. This is useful if a PR did not apply cleanly
                                        // into the release-candidate/feature-freeze branch, and a separate PR has been created.
                                        if (githubTargetBranch === releaseCandidateBranch) {
                                            return [releaseCandidateBranch];
                                        }
                                        // Otherwise, merge into the next and active release-candidate/feature-freeze branch.
                                        return [branches_1.nextBranchName, releaseCandidateBranch];
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
                                                    if (!branches_1.isReleaseTrainBranch(githubTargetBranch)) {
                                                        throw new target_label_1.InvalidTargetBranchError("PR cannot be merged as it does not target a long-term support " +
                                                            ("branch: \"" + githubTargetBranch + "\""));
                                                    }
                                                    if (githubTargetBranch === latestVersionBranch) {
                                                        throw new target_label_1.InvalidTargetBranchError("PR cannot be merged with \"target: lts\" into patch branch. " +
                                                            "Consider changing the label to \"target: patch\" if this is intentional.");
                                                    }
                                                    if (githubTargetBranch === releaseCandidateBranch && releaseCandidateBranch !== null) {
                                                        throw new target_label_1.InvalidTargetBranchError("PR cannot be merged with \"target: lts\" into feature-freeze/release-candidate " +
                                                            "branch. Consider changing the label to \"target: rc\" if this is intentional.");
                                                    }
                                                    // Assert that the selected branch is an active LTS branch.
                                                    return [4 /*yield*/, lts_branch_1.assertActiveLtsBranch(repo, githubTargetBranch)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2RlZmF1bHRzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBS0gsaUZBQWtGO0lBRWxGLGtGQUFpSTtJQUNqSSxzRkFBbUQ7SUFFbkQ7Ozs7O09BS0c7SUFDSCxTQUFzQixrQ0FBa0MsQ0FDcEQsR0FBaUIsRUFBRSxNQUFvQixFQUFFLGNBQXNCOzs7Ozs7O3dCQUMzRCxJQUFJLEdBQWUsRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEtBQUEsRUFBRSxjQUFjLGdCQUFBLEVBQUMsQ0FBQzt3QkFDbkUscUJBQU0sNkJBQWtCLENBQUMsSUFBSSxFQUFFLHlCQUFjLENBQUMsRUFBQTs7d0JBQTVELFdBQVcsR0FBRyxTQUE4Qzt3QkFDNUQsaUJBQWlCLEdBQUcsV0FBVyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7d0JBRTlDLHFCQUFNLDBDQUErQixDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsRUFBQTs7d0JBRHRELEtBQ0YsU0FBd0QsRUFEckQsbUJBQW1CLHlCQUFBLEVBQUUsc0JBQXNCLDRCQUFBO3dCQUdsRCxzQkFBTztnQ0FDTDtvQ0FDRSxPQUFPLEVBQUUsZUFBZTtvQ0FDeEIsUUFBUSxFQUFFO3dDQUNSLHlFQUF5RTt3Q0FDekUsNkNBQTZDO3dDQUM3QyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7NENBQ3RCLE1BQU0sSUFBSSxzQ0FBdUIsQ0FDN0IseUNBQXNDLHlCQUFjLHVCQUFtQjtnREFDdkUsOEJBQThCLENBQUMsQ0FBQzt5Q0FDckM7d0NBQ0QsT0FBTyxDQUFDLHlCQUFjLENBQUMsQ0FBQztvQ0FDMUIsQ0FBQztpQ0FDRjtnQ0FDRDtvQ0FDRSxPQUFPLEVBQUUsZUFBZTtvQ0FDeEIscUZBQXFGO29DQUNyRixxRkFBcUY7b0NBQ3JGLHVFQUF1RTtvQ0FDdkUsb0ZBQW9GO29DQUNwRiwrRUFBK0U7b0NBQy9FLDhHQUE4RztvQ0FDOUcsUUFBUSxFQUFFLENBQUMseUJBQWMsQ0FBQztpQ0FDM0I7Z0NBQ0Q7b0NBQ0UsT0FBTyxFQUFFLGVBQWU7b0NBQ3hCLFFBQVEsRUFBRSxVQUFBLGtCQUFrQjt3Q0FDMUIsK0VBQStFO3dDQUMvRSwrRUFBK0U7d0NBQy9FLCtFQUErRTt3Q0FDL0UsNEVBQTRFO3dDQUM1RSxJQUFJLGtCQUFrQixLQUFLLG1CQUFtQixFQUFFOzRDQUM5QyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQzt5Q0FDOUI7d0NBQ0QsNkVBQTZFO3dDQUM3RSxJQUFNLFFBQVEsR0FBRyxDQUFDLHlCQUFjLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzt3Q0FDdkQsNkVBQTZFO3dDQUM3RSxnRUFBZ0U7d0NBQ2hFLElBQUksc0JBQXNCLEtBQUssSUFBSSxFQUFFOzRDQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7eUNBQ3ZDO3dDQUNELE9BQU8sUUFBUSxDQUFDO29DQUNsQixDQUFDO2lDQUNGO2dDQUNEO29DQUNFLE9BQU8sRUFBRSxZQUFZO29DQUNyQixRQUFRLEVBQUUsVUFBQSxrQkFBa0I7d0NBQzFCLGdGQUFnRjt3Q0FDaEYsc0NBQXNDO3dDQUN0QyxJQUFJLHNCQUFzQixLQUFLLElBQUksRUFBRTs0Q0FDbkMsTUFBTSxJQUFJLHNDQUF1QixDQUM3QixxREFBcUQ7Z0RBQ3JELDBEQUF3RCxDQUFDLENBQUM7eUNBQy9EO3dDQUNELG9GQUFvRjt3Q0FDcEYsa0ZBQWtGO3dDQUNsRix1RkFBdUY7d0NBQ3ZGLHdGQUF3Rjt3Q0FDeEYsSUFBSSxrQkFBa0IsS0FBSyxzQkFBc0IsRUFBRTs0Q0FDakQsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7eUNBQ2pDO3dDQUNELHFGQUFxRjt3Q0FDckYsT0FBTyxDQUFDLHlCQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztvQ0FDbEQsQ0FBQztpQ0FDRjtnQ0FDRDtvQ0FDRSx3RkFBd0Y7b0NBQ3hGLHlGQUF5RjtvQ0FDekYsNkZBQTZGO29DQUM3RixxRkFBcUY7b0NBQ3JGLE9BQU8sRUFBRSxhQUFhO29DQUN0QixRQUFRLEVBQUUsVUFBTSxrQkFBa0I7Ozs7b0RBQ2hDLElBQUksQ0FBQywrQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO3dEQUM3QyxNQUFNLElBQUksdUNBQXdCLENBQzlCLGdFQUFnRTs2REFDaEUsZUFBWSxrQkFBa0IsT0FBRyxDQUFBLENBQUMsQ0FBQztxREFDeEM7b0RBQ0QsSUFBSSxrQkFBa0IsS0FBSyxtQkFBbUIsRUFBRTt3REFDOUMsTUFBTSxJQUFJLHVDQUF3QixDQUM5Qiw4REFBNEQ7NERBQzVELDBFQUF3RSxDQUFDLENBQUM7cURBQy9FO29EQUNELElBQUksa0JBQWtCLEtBQUssc0JBQXNCLElBQUksc0JBQXNCLEtBQUssSUFBSSxFQUFFO3dEQUNwRixNQUFNLElBQUksdUNBQXdCLENBQzlCLGlGQUErRTs0REFDL0UsK0VBQTZFLENBQUMsQ0FBQztxREFDcEY7b0RBQ0QsMkRBQTJEO29EQUMzRCxxQkFBTSxrQ0FBcUIsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsRUFBQTs7b0RBRHJELDJEQUEyRDtvREFDM0QsU0FBcUQsQ0FBQztvREFDdEQsc0JBQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFDOzs7eUNBQzdCO2lDQUNGOzZCQUNGLEVBQUM7Ozs7S0FDSDtJQXJHRCxnRkFxR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge0dpdGh1YkNsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yic7XG5pbXBvcnQge1RhcmdldExhYmVsfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsIEludmFsaWRUYXJnZXRMYWJlbEVycm9yfSBmcm9tICcuLi90YXJnZXQtbGFiZWwnO1xuXG5pbXBvcnQge2ZldGNoQWN0aXZlUmVsZWFzZVRyYWluQnJhbmNoZXMsIGdldFZlcnNpb25PZkJyYW5jaCwgR2l0aHViUmVwbywgaXNSZWxlYXNlVHJhaW5CcmFuY2gsIG5leHRCcmFuY2hOYW1lfSBmcm9tICcuL2JyYW5jaGVzJztcbmltcG9ydCB7YXNzZXJ0QWN0aXZlTHRzQnJhbmNofSBmcm9tICcuL2x0cy1icmFuY2gnO1xuXG4vKipcbiAqIEdldHMgYSBsYWJlbCBjb25maWd1cmF0aW9uIGZvciB0aGUgbWVyZ2UgdG9vbGluZyB0aGF0IHJlZmxlY3RzIHRoZSBkZWZhdWx0IEFuZ3VsYXJcbiAqIG9yZ2FuaXphdGlvbi13aWRlIGxhYmVsaW5nIGFuZCBicmFuY2hpbmcgc2VtYW50aWNzIGFzIG91dGxpbmVkIGluIHRoZSBzcGVjaWZpY2F0aW9uLlxuICpcbiAqIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMTk3a1ZpbGxEd3gtUlp0U1ZPQnRQYjRCQklBdzBFOVJUM3EzdjZEWmt5a1VcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlZmF1bHRUYXJnZXRMYWJlbENvbmZpZ3VyYXRpb24oXG4gICAgYXBpOiBHaXRodWJDbGllbnQsIGdpdGh1YjogR2l0aHViQ29uZmlnLCBucG1QYWNrYWdlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxUYXJnZXRMYWJlbFtdPiB7XG4gIGNvbnN0IHJlcG86IEdpdGh1YlJlcG8gPSB7b3duZXI6IGdpdGh1Yi5vd25lciwgcmVwbzogZ2l0aHViLm5hbWUsIGFwaSwgbnBtUGFja2FnZU5hbWV9O1xuICBjb25zdCBuZXh0VmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBuZXh0QnJhbmNoTmFtZSk7XG4gIGNvbnN0IGhhc05leHRNYWpvclRyYWluID0gbmV4dFZlcnNpb24ubWlub3IgPT09IDA7XG4gIGNvbnN0IHtsYXRlc3RWZXJzaW9uQnJhbmNoLCByZWxlYXNlQ2FuZGlkYXRlQnJhbmNofSA9XG4gICAgICBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbkJyYW5jaGVzKHJlcG8sIG5leHRWZXJzaW9uKTtcblxuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IG1ham9yJyxcbiAgICAgIGJyYW5jaGVzOiAoKSA9PiB7XG4gICAgICAgIC8vIElmIGBuZXh0YCBpcyBjdXJyZW50bHkgbm90IGRlc2lnbmF0ZWQgdG8gYmUgYSBtYWpvciB2ZXJzaW9uLCB3ZSBkbyBub3RcbiAgICAgICAgLy8gYWxsb3cgbWVyZ2luZyBvZiBQUnMgd2l0aCBgdGFyZ2V0OiBtYWpvcmAuXG4gICAgICAgIGlmICghaGFzTmV4dE1ham9yVHJhaW4pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAgICAgICAgIGBVbmFibGUgdG8gbWVyZ2UgcHVsbCByZXF1ZXN0LiBUaGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaCB3aWxsIGJlIGAgK1xuICAgICAgICAgICAgICBgcmVsZWFzZWQgYXMgYSBtaW5vciB2ZXJzaW9uLmApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbbmV4dEJyYW5jaE5hbWVdO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IG1pbm9yJyxcbiAgICAgIC8vIENoYW5nZXMgbGFiZWxlZCB3aXRoIGB0YXJnZXQ6IG1pbm9yYCBhcmUgbWVyZ2VkIG1vc3QgY29tbW9ubHkgaW50byB0aGUgbmV4dCBicmFuY2hcbiAgICAgIC8vIChpLmUuIGBtYXN0ZXJgKS4gSW4gcmFyZSBjYXNlcyBvZiBhbiBleGNlcHRpb25hbCBtaW5vciB2ZXJzaW9uIHdoaWxlIGJlaW5nIGFscmVhZHlcbiAgICAgIC8vIG9uIGEgbWFqb3IgcmVsZWFzZSB0cmFpbiwgdGhpcyB3b3VsZCBuZWVkIHRvIGJlIG92ZXJyaWRkZW4gbWFudWFsbHkuXG4gICAgICAvLyBUT0RPOiBDb25zaWRlciBoYW5kbGluZyB0aGlzIGF1dG9tYXRpY2FsbHkgYnkgY2hlY2tpbmcgaWYgdGhlIE5QTSB2ZXJzaW9uIG1hdGNoZXNcbiAgICAgIC8vIHRoZSBsYXN0LW1pbm9yLiBJZiBub3QsIHRoZW4gYW4gZXhjZXB0aW9uYWwgbWlub3IgbWlnaHQgYmUgaW4gcHJvZ3Jlc3MuIFNlZTpcbiAgICAgIC8vIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMTk3a1ZpbGxEd3gtUlp0U1ZPQnRQYjRCQklBdzBFOVJUM3EzdjZEWmt5a1UvZWRpdCNoZWFkaW5nPWguaDdvNXBqcTZ5cWQwXG4gICAgICBicmFuY2hlczogW25leHRCcmFuY2hOYW1lXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IHBhdGNoJyxcbiAgICAgIGJyYW5jaGVzOiBnaXRodWJUYXJnZXRCcmFuY2ggPT4ge1xuICAgICAgICAvLyBJZiBhIFBSIGlzIHRhcmdldGluZyB0aGUgbGF0ZXN0IGFjdGl2ZSB2ZXJzaW9uLWJyYW5jaCB0aHJvdWdoIHRoZSBHaXRodWIgVUksXG4gICAgICAgIC8vIGFuZCBpcyBhbHNvIGxhYmVsZWQgd2l0aCBgdGFyZ2V0OiBwYXRjaGAsIHRoZW4gd2UgbWVyZ2UgaXQgZGlyZWN0bHkgaW50byB0aGVcbiAgICAgICAgLy8gYnJhbmNoIHdpdGhvdXQgZG9pbmcgYW55IGNoZXJyeS1waWNraW5nLiBUaGlzIGlzIHVzZWZ1bCBpZiBhIFBSIGNvdWxkIG5vdCBiZVxuICAgICAgICAvLyBhcHBsaWVkIGNsZWFubHksIGFuZCBhIHNlcGFyYXRlIFBSIGZvciB0aGUgcGF0Y2ggYnJhbmNoIGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IGxhdGVzdFZlcnNpb25CcmFuY2gpIHtcbiAgICAgICAgICByZXR1cm4gW2xhdGVzdFZlcnNpb25CcmFuY2hdO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgcGF0Y2ggY2hhbmdlcyBhcmUgYWx3YXlzIG1lcmdlZCBpbnRvIHRoZSBuZXh0IGFuZCBwYXRjaCBicmFuY2guXG4gICAgICAgIGNvbnN0IGJyYW5jaGVzID0gW25leHRCcmFuY2hOYW1lLCBsYXRlc3RWZXJzaW9uQnJhbmNoXTtcbiAgICAgICAgLy8gQWRkaXRpb25hbGx5LCBpZiB0aGVyZSBpcyBhIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIHJlbGVhc2UtdHJhaW5cbiAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2ZSwgYWxzbyBtZXJnZSB0aGUgUFIgaW50byB0aGF0IHZlcnNpb24tYnJhbmNoLlxuICAgICAgICBpZiAocmVsZWFzZUNhbmRpZGF0ZUJyYW5jaCAhPT0gbnVsbCkge1xuICAgICAgICAgIGJyYW5jaGVzLnB1c2gocmVsZWFzZUNhbmRpZGF0ZUJyYW5jaCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJyYW5jaGVzO1xuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgcGF0dGVybjogJ3RhcmdldDogcmMnLFxuICAgICAgYnJhbmNoZXM6IGdpdGh1YlRhcmdldEJyYW5jaCA9PiB7XG4gICAgICAgIC8vIFRoZSBgdGFyZ2V0OiByY2AgbGFiZWwgY2Fubm90IGJlIGFwcGxpZWQgaWYgdGhlcmUgaXMgbm8gYWN0aXZlIGZlYXR1cmUtZnJlZXplXG4gICAgICAgIC8vIG9yIHJlbGVhc2UtY2FuZGlkYXRlIHJlbGVhc2UgdHJhaW4uXG4gICAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlQnJhbmNoID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRMYWJlbEVycm9yKFxuICAgICAgICAgICAgICBgTm8gYWN0aXZlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gYCArXG4gICAgICAgICAgICAgIGBVbmFibGUgdG8gbWVyZ2UgcHVsbCByZXF1ZXN0IHVzaW5nIFwidGFyZ2V0OiByY1wiIGxhYmVsLmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRoZSBQUiBpcyB0YXJnZXRpbmcgdGhlIGFjdGl2ZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSB2ZXJzaW9uIGJyYW5jaFxuICAgICAgICAvLyBkaXJlY3RseSB0aHJvdWdoIHRoZSBHaXRodWIgVUkgYW5kIGhhcyB0aGUgYHRhcmdldDogcmNgIGxhYmVsIGFwcGxpZWQsIG1lcmdlIGl0XG4gICAgICAgIC8vIG9ubHkgaW50byB0aGUgcmVsZWFzZSBjYW5kaWRhdGUgYnJhbmNoLiBUaGlzIGlzIHVzZWZ1bCBpZiBhIFBSIGRpZCBub3QgYXBwbHkgY2xlYW5seVxuICAgICAgICAvLyBpbnRvIHRoZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSBicmFuY2gsIGFuZCBhIHNlcGFyYXRlIFBSIGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IHJlbGVhc2VDYW5kaWRhdGVCcmFuY2gpIHtcbiAgICAgICAgICByZXR1cm4gW3JlbGVhc2VDYW5kaWRhdGVCcmFuY2hdO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgbWVyZ2UgaW50byB0aGUgbmV4dCBhbmQgYWN0aXZlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIGJyYW5jaC5cbiAgICAgICAgcmV0dXJuIFtuZXh0QnJhbmNoTmFtZSwgcmVsZWFzZUNhbmRpZGF0ZUJyYW5jaF07XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgLy8gTFRTIGNoYW5nZXMgYXJlIHJhcmUgZW5vdWdoIHRoYXQgd2Ugd29uJ3Qgd29ycnkgYWJvdXQgY2hlcnJ5LXBpY2tpbmcgY2hhbmdlcyBpbnRvIGFsbFxuICAgICAgLy8gYWN0aXZlIExUUyBicmFuY2hlcyBmb3IgUFJzIGNyZWF0ZWQgYWdhaW5zdCBhbnkgb3RoZXIgYnJhbmNoLiBJbnN0ZWFkLCBQUiBhdXRob3JzIG5lZWRcbiAgICAgIC8vIHRvIG1hbnVhbGx5IGNyZWF0ZSBzZXBhcmF0ZSBQUnMgZm9yIGRlc2lyZWQgTFRTIGJyYW5jaGVzLiBBZGRpdGlvbmFsbHksIGFjdGl2ZSBMVCBicmFuY2hlc1xuICAgICAgLy8gY29tbW9ubHkgZGl2ZXJnZSBxdWlja2x5LiBUaGlzIG1ha2VzIGNoZXJyeS1waWNraW5nIG5vdCBhbiBvcHRpb24gZm9yIExUUyBjaGFuZ2VzLlxuICAgICAgcGF0dGVybjogJ3RhcmdldDogbHRzJyxcbiAgICAgIGJyYW5jaGVzOiBhc3luYyBnaXRodWJUYXJnZXRCcmFuY2ggPT4ge1xuICAgICAgICBpZiAoIWlzUmVsZWFzZVRyYWluQnJhbmNoKGdpdGh1YlRhcmdldEJyYW5jaCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCBhcyBpdCBkb2VzIG5vdCB0YXJnZXQgYSBsb25nLXRlcm0gc3VwcG9ydCBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaDogXCIke2dpdGh1YlRhcmdldEJyYW5jaH1cImApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IGxhdGVzdFZlcnNpb25CcmFuY2gpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCB3aXRoIFwidGFyZ2V0OiBsdHNcIiBpbnRvIHBhdGNoIGJyYW5jaC4gYCArXG4gICAgICAgICAgICAgIGBDb25zaWRlciBjaGFuZ2luZyB0aGUgbGFiZWwgdG8gXCJ0YXJnZXQ6IHBhdGNoXCIgaWYgdGhpcyBpcyBpbnRlbnRpb25hbC5gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSByZWxlYXNlQ2FuZGlkYXRlQnJhbmNoICYmIHJlbGVhc2VDYW5kaWRhdGVCcmFuY2ggIT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCB3aXRoIFwidGFyZ2V0OiBsdHNcIiBpbnRvIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGAgK1xuICAgICAgICAgICAgICBgYnJhbmNoLiBDb25zaWRlciBjaGFuZ2luZyB0aGUgbGFiZWwgdG8gXCJ0YXJnZXQ6IHJjXCIgaWYgdGhpcyBpcyBpbnRlbnRpb25hbC5gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBc3NlcnQgdGhhdCB0aGUgc2VsZWN0ZWQgYnJhbmNoIGlzIGFuIGFjdGl2ZSBMVFMgYnJhbmNoLlxuICAgICAgICBhd2FpdCBhc3NlcnRBY3RpdmVMdHNCcmFuY2gocmVwbywgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbiAgICAgICAgcmV0dXJuIFtnaXRodWJUYXJnZXRCcmFuY2hdO1xuICAgICAgfSxcbiAgICB9LFxuICBdO1xufVxuIl19