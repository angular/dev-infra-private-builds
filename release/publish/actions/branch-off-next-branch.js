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
        define("@angular/dev-infra-private/release/publish/actions/branch-off-next-branch", ["require", "exports", "tslib", "semver", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/semver", "@angular/dev-infra-private/release/versioning/next-prerelease-version", "@angular/dev-infra-private/release/publish/actions", "@angular/dev-infra-private/release/publish/commit-message", "@angular/dev-infra-private/release/publish/constants"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BranchOffNextBranchBaseAction = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var semver_1 = require("@angular/dev-infra-private/utils/semver");
    var next_prerelease_version_1 = require("@angular/dev-infra-private/release/versioning/next-prerelease-version");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    var commit_message_1 = require("@angular/dev-infra-private/release/publish/commit-message");
    var constants_1 = require("@angular/dev-infra-private/release/publish/constants");
    /**
     * Base action that can be used to move the next release-train into the feature-freeze or
     * release-candidate phase. This means that a new version branch is created from the next
     * branch, and a new pre-release (either RC or another `next`) is cut indicating the new phase.
     */
    var BranchOffNextBranchBaseAction = /** @class */ (function (_super) {
        tslib_1.__extends(BranchOffNextBranchBaseAction, _super);
        function BranchOffNextBranchBaseAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BranchOffNextBranchBaseAction.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            branchName = this.active.next.branchName;
                            return [4 /*yield*/, this._computeNewVersion()];
                        case 1:
                            newVersion = _a.sent();
                            return [2 /*return*/, "Move the \"" + branchName + "\" branch into " + this.newPhaseName + " phase (v" + newVersion + ")."];
                    }
                });
            });
        };
        BranchOffNextBranchBaseAction.prototype.perform = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var newVersion, newBranch, _a, pullRequest, releaseNotes;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this._computeNewVersion()];
                        case 1:
                            newVersion = _b.sent();
                            newBranch = newVersion.major + "." + newVersion.minor + ".x";
                            // Branch-off the next branch into a new version branch.
                            return [4 /*yield*/, this._createNewVersionBranchFromNext(newBranch)];
                        case 2:
                            // Branch-off the next branch into a new version branch.
                            _b.sent();
                            return [4 /*yield*/, this.stageVersionForBranchAndCreatePullRequest(newVersion, newBranch)];
                        case 3:
                            _a = _b.sent(), pullRequest = _a.pullRequest, releaseNotes = _a.releaseNotes;
                            // Wait for the staging PR to be merged. Then build and publish the feature-freeze next
                            // pre-release. Finally, cherry-pick the release notes into the next branch in combination
                            // with bumping the version to the next minor too.
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(pullRequest)];
                        case 4:
                            // Wait for the staging PR to be merged. Then build and publish the feature-freeze next
                            // pre-release. Finally, cherry-pick the release notes into the next branch in combination
                            // with bumping the version to the next minor too.
                            _b.sent();
                            return [4 /*yield*/, this.buildAndPublish(releaseNotes, newBranch, 'next')];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, this._createNextBranchUpdatePullRequest(releaseNotes, newVersion)];
                        case 6:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Computes the new version for the release-train being branched-off. */
        BranchOffNextBranchBaseAction.prototype._computeNewVersion = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    if (this.newPhaseName === 'feature-freeze') {
                        return [2 /*return*/, next_prerelease_version_1.computeNewPrereleaseVersionForNext(this.active, this.config)];
                    }
                    else {
                        return [2 /*return*/, semver_1.semverInc(this.active.next.version, 'prerelease', 'rc')];
                    }
                    return [2 /*return*/];
                });
            });
        };
        /** Creates a new version branch from the next branch. */
        BranchOffNextBranchBaseAction.prototype._createNewVersionBranchFromNext = function (newBranch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var nextBranch;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            nextBranch = this.active.next.branchName;
                            return [4 /*yield*/, this.verifyPassingGithubStatus(nextBranch)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.checkoutUpstreamBranch(nextBranch)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.createLocalBranchFromHead(newBranch)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.pushHeadToRemoteBranch(newBranch)];
                        case 4:
                            _a.sent();
                            console_1.info(console_1.green("  \u2713   Version branch \"" + newBranch + "\" created."));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Creates a pull request for the next branch that bumps the version to the next
         * minor, and cherry-picks the changelog for the newly branched-off release-candidate
         * or feature-freeze version.
         */
        BranchOffNextBranchBaseAction.prototype._createNextBranchUpdatePullRequest = function (releaseNotes, newVersion) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, nextBranch, version, newNextVersion, bumpCommitMessage, commitMessage, nextPullRequestMessage, nextUpdatePullRequest;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.active.next, nextBranch = _a.branchName, version = _a.version;
                            newNextVersion = semver.parse(version.major + "." + (version.minor + 1) + ".0-next.0");
                            bumpCommitMessage = commit_message_1.getCommitMessageForExceptionalNextVersionBump(newNextVersion);
                            return [4 /*yield*/, this.checkoutUpstreamBranch(nextBranch)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, this.updateProjectVersion(newNextVersion)];
                        case 2:
                            _b.sent();
                            // Create an individual commit for the next version bump. The changelog should go into
                            // a separate commit that makes it clear where the changelog is cherry-picked from.
                            return [4 /*yield*/, this.createCommit(bumpCommitMessage, [constants_1.packageJsonPath])];
                        case 3:
                            // Create an individual commit for the next version bump. The changelog should go into
                            // a separate commit that makes it clear where the changelog is cherry-picked from.
                            _b.sent();
                            return [4 /*yield*/, this.prependReleaseNotesToChangelog(releaseNotes)];
                        case 4:
                            _b.sent();
                            commitMessage = commit_message_1.getReleaseNoteCherryPickCommitMessage(releaseNotes.version);
                            return [4 /*yield*/, this.createCommit(commitMessage, [constants_1.changelogPath])];
                        case 5:
                            _b.sent();
                            nextPullRequestMessage = "The previous \"next\" release-train has moved into the " +
                                (this.newPhaseName + " phase. This PR updates the next branch to the subsequent ") +
                                "release-train.\n\nAlso this PR cherry-picks the changelog for " +
                                ("v" + newVersion + " into the " + nextBranch + " branch so that the changelog is up to date.");
                            return [4 /*yield*/, this.pushChangesToForkAndCreatePullRequest(nextBranch, "next-release-train-" + newNextVersion, "Update next branch to reflect new release-train \"v" + newNextVersion + "\".", nextPullRequestMessage)];
                        case 6:
                            nextUpdatePullRequest = _b.sent();
                            console_1.info(console_1.green("  \u2713   Pull request for updating the \"" + nextBranch + "\" branch has been created."));
                            console_1.info(console_1.yellow("      Please ask team members to review: " + nextUpdatePullRequest.url + "."));
                            return [2 /*return*/];
                    }
                });
            });
        };
        return BranchOffNextBranchBaseAction;
    }(actions_1.ReleaseAction));
    exports.BranchOffNextBranchBaseAction = BranchOffNextBranchBaseAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmNoLW9mZi1uZXh0LWJyYW5jaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9icmFuY2gtb2ZmLW5leHQtYnJhbmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsb0VBQTJEO0lBQzNELGtFQUFnRDtJQUdoRCxpSEFBNEY7SUFDNUYsOEVBQXlDO0lBQ3pDLDRGQUF1SDtJQUN2SCxrRkFBNEQ7SUFFNUQ7Ozs7T0FJRztJQUNIO1FBQTRELHlEQUFhO1FBQXpFOztRQStGQSxDQUFDO1FBckZnQixzREFBYyxHQUE3Qjs7Ozs7OzRCQUNTLFVBQVUsR0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksV0FBcEIsQ0FBcUI7NEJBQ25CLHFCQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFBOzs0QkFBNUMsVUFBVSxHQUFHLFNBQStCOzRCQUNsRCxzQkFBTyxnQkFBYSxVQUFVLHVCQUFpQixJQUFJLENBQUMsWUFBWSxpQkFBWSxVQUFVLE9BQUksRUFBQzs7OztTQUM1RjtRQUVjLCtDQUFPLEdBQXRCOzs7OztnQ0FDcUIscUJBQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUE7OzRCQUE1QyxVQUFVLEdBQUcsU0FBK0I7NEJBQzVDLFNBQVMsR0FBTSxVQUFVLENBQUMsS0FBSyxTQUFJLFVBQVUsQ0FBQyxLQUFLLE9BQUksQ0FBQzs0QkFFOUQsd0RBQXdEOzRCQUN4RCxxQkFBTSxJQUFJLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLEVBQUE7OzRCQURyRCx3REFBd0Q7NEJBQ3hELFNBQXFELENBQUM7NEJBTWxELHFCQUFNLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLEVBQUE7OzRCQUR6RSxLQUNGLFNBQTJFLEVBRHhFLFdBQVcs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QUFDLENBQUMsRUFBQTs7NEJBQXZELFNBQXVELENBQUM7NEJBRXBELHNCQUFzQixHQUFHLHlEQUF1RDtpQ0FDN0UsSUFBSSxDQUFDLFlBQVksK0RBQTRELENBQUE7Z0NBQ2hGLGdFQUFnRTtpQ0FDaEUsTUFBSSxVQUFVLGtCQUFhLFVBQVUsaURBQThDLENBQUEsQ0FBQzs0QkFFMUQscUJBQU0sSUFBSSxDQUFDLHFDQUFxQyxDQUMxRSxVQUFVLEVBQUUsd0JBQXNCLGNBQWdCLEVBQ2xELHdEQUFxRCxjQUFjLFFBQUksRUFDdkUsc0JBQXNCLENBQUMsRUFBQTs7NEJBSHJCLHFCQUFxQixHQUFHLFNBR0g7NEJBRTNCLGNBQUksQ0FBQyxlQUFLLENBQUMsZ0RBQXdDLFVBQVUsZ0NBQTRCLENBQUMsQ0FBQyxDQUFDOzRCQUM1RixjQUFJLENBQUMsZ0JBQU0sQ0FBQyw4Q0FBNEMscUJBQXFCLENBQUMsR0FBRyxNQUFHLENBQUMsQ0FBQyxDQUFDOzs7OztTQUN4RjtRQUNILG9DQUFDO0lBQUQsQ0FBQyxBQS9GRCxDQUE0RCx1QkFBYSxHQStGeEU7SUEvRnFCLHNFQUE2QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtncmVlbiwgaW5mbywgeWVsbG93fSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7c2VtdmVySW5jfSBmcm9tICcuLi8uLi8uLi91dGlscy9zZW12ZXInO1xuaW1wb3J0IHtSZWxlYXNlTm90ZXN9IGZyb20gJy4uLy4uL25vdGVzL3JlbGVhc2Utbm90ZXMnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2NvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHR9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvbmV4dC1wcmVyZWxlYXNlLXZlcnNpb24nO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcbmltcG9ydCB7Z2V0Q29tbWl0TWVzc2FnZUZvckV4Y2VwdGlvbmFsTmV4dFZlcnNpb25CdW1wLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge2NoYW5nZWxvZ1BhdGgsIHBhY2thZ2VKc29uUGF0aH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBCYXNlIGFjdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIG1vdmUgdGhlIG5leHQgcmVsZWFzZS10cmFpbiBpbnRvIHRoZSBmZWF0dXJlLWZyZWV6ZSBvclxuICogcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuIFRoaXMgbWVhbnMgdGhhdCBhIG5ldyB2ZXJzaW9uIGJyYW5jaCBpcyBjcmVhdGVkIGZyb20gdGhlIG5leHRcbiAqIGJyYW5jaCwgYW5kIGEgbmV3IHByZS1yZWxlYXNlIChlaXRoZXIgUkMgb3IgYW5vdGhlciBgbmV4dGApIGlzIGN1dCBpbmRpY2F0aW5nIHRoZSBuZXcgcGhhc2UuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCcmFuY2hPZmZOZXh0QnJhbmNoQmFzZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICAvKipcbiAgICogUGhhc2Ugd2hpY2ggdGhlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBgbmV4dGAgcGhhc2Ugd2lsbCBtb3ZlIGludG8uXG4gICAqXG4gICAqIE5vdGUgdGhhdCB3ZSBvbmx5IGFsbG93IGZvciBhIG5leHQgdmVyc2lvbiB0byBicmFuY2ggaW50byBmZWF0dXJlLWZyZWV6ZSBvclxuICAgKiBkaXJlY3RseSBpbnRvIHRoZSByZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gQSBzdGFibGUgdmVyc2lvbiBjYW5ub3QgYmUgcmVsZWFzZWRcbiAgICogd2l0aG91dCByZWxlYXNlLWNhbmRpZGF0ZS5cbiAgICovXG4gIGFic3RyYWN0IG5ld1BoYXNlTmFtZTogJ2ZlYXR1cmUtZnJlZXplJ3wncmVsZWFzZS1jYW5kaWRhdGUnO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX2NvbXB1dGVOZXdWZXJzaW9uKCk7XG4gICAgcmV0dXJuIGBNb3ZlIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggaW50byAke3RoaXMubmV3UGhhc2VOYW1lfSBwaGFzZSAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBhd2FpdCB0aGlzLl9jb21wdXRlTmV3VmVyc2lvbigpO1xuICAgIGNvbnN0IG5ld0JyYW5jaCA9IGAke25ld1ZlcnNpb24ubWFqb3J9LiR7bmV3VmVyc2lvbi5taW5vcn0ueGA7XG5cbiAgICAvLyBCcmFuY2gtb2ZmIHRoZSBuZXh0IGJyYW5jaCBpbnRvIGEgbmV3IHZlcnNpb24gYnJhbmNoLlxuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZU5ld1ZlcnNpb25CcmFuY2hGcm9tTmV4dChuZXdCcmFuY2gpO1xuXG4gICAgLy8gU3RhZ2UgdGhlIG5ldyB2ZXJzaW9uIGZvciB0aGUgbmV3bHkgY3JlYXRlZCBicmFuY2gsIGFuZCBwdXNoIGNoYW5nZXMgdG8gYVxuICAgIC8vIGZvcmsgaW4gb3JkZXIgdG8gY3JlYXRlIGEgc3RhZ2luZyBwdWxsIHJlcXVlc3QuIE5vdGUgdGhhdCB3ZSByZS11c2UgdGhlIG5ld2x5XG4gICAgLy8gY3JlYXRlZCBicmFuY2ggaW5zdGVhZCBvZiByZS1mZXRjaGluZyBmcm9tIHRoZSB1cHN0cmVhbS5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3QsIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KG5ld1ZlcnNpb24sIG5ld0JyYW5jaCk7XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgc3RhZ2luZyBQUiB0byBiZSBtZXJnZWQuIFRoZW4gYnVpbGQgYW5kIHB1Ymxpc2ggdGhlIGZlYXR1cmUtZnJlZXplIG5leHRcbiAgICAvLyBwcmUtcmVsZWFzZS4gRmluYWxseSwgY2hlcnJ5LXBpY2sgdGhlIHJlbGVhc2Ugbm90ZXMgaW50byB0aGUgbmV4dCBicmFuY2ggaW4gY29tYmluYXRpb25cbiAgICAvLyB3aXRoIGJ1bXBpbmcgdGhlIHZlcnNpb24gdG8gdGhlIG5leHQgbWlub3IgdG9vLlxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBuZXdCcmFuY2gsICduZXh0Jyk7XG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlTmV4dEJyYW5jaFVwZGF0ZVB1bGxSZXF1ZXN0KHJlbGVhc2VOb3RlcywgbmV3VmVyc2lvbik7XG4gIH1cblxuICAvKiogQ29tcHV0ZXMgdGhlIG5ldyB2ZXJzaW9uIGZvciB0aGUgcmVsZWFzZS10cmFpbiBiZWluZyBicmFuY2hlZC1vZmYuICovXG4gIHByaXZhdGUgYXN5bmMgX2NvbXB1dGVOZXdWZXJzaW9uKCkge1xuICAgIGlmICh0aGlzLm5ld1BoYXNlTmFtZSA9PT0gJ2ZlYXR1cmUtZnJlZXplJykge1xuICAgICAgcmV0dXJuIGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQodGhpcy5hY3RpdmUsIHRoaXMuY29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNlbXZlckluYyh0aGlzLmFjdGl2ZS5uZXh0LnZlcnNpb24sICdwcmVyZWxlYXNlJywgJ3JjJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENyZWF0ZXMgYSBuZXcgdmVyc2lvbiBicmFuY2ggZnJvbSB0aGUgbmV4dCBicmFuY2guICovXG4gIHByaXZhdGUgYXN5bmMgX2NyZWF0ZU5ld1ZlcnNpb25CcmFuY2hGcm9tTmV4dChuZXdCcmFuY2g6IHN0cmluZykge1xuICAgIGNvbnN0IHticmFuY2hOYW1lOiBuZXh0QnJhbmNofSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKG5leHRCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQobmV3QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLnB1c2hIZWFkVG9SZW1vdGVCcmFuY2gobmV3QnJhbmNoKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFZlcnNpb24gYnJhbmNoIFwiJHtuZXdCcmFuY2h9XCIgY3JlYXRlZC5gKSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHB1bGwgcmVxdWVzdCBmb3IgdGhlIG5leHQgYnJhbmNoIHRoYXQgYnVtcHMgdGhlIHZlcnNpb24gdG8gdGhlIG5leHRcbiAgICogbWlub3IsIGFuZCBjaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmb3IgdGhlIG5ld2x5IGJyYW5jaGVkLW9mZiByZWxlYXNlLWNhbmRpZGF0ZVxuICAgKiBvciBmZWF0dXJlLWZyZWV6ZSB2ZXJzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlTmV4dEJyYW5jaFVwZGF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZTogbmV4dEJyYW5jaCwgdmVyc2lvbn0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIC8vIFdlIGluY3JlYXNlIHRoZSB2ZXJzaW9uIGZvciB0aGUgbmV4dCBicmFuY2ggdG8gdGhlIG5leHQgbWlub3IuIFRoZSB0ZWFtIGNhbiBkZWNpZGVcbiAgICAvLyBsYXRlciBpZiB0aGV5IHdhbnQgbmV4dCB0byBiZSBhIG1ham9yIHRocm91Z2ggdGhlIGBDb25maWd1cmUgTmV4dCBhcyBNYWpvcmAgcmVsZWFzZSBhY3Rpb24uXG4gICAgY29uc3QgbmV3TmV4dFZlcnNpb24gPSBzZW12ZXIucGFyc2UoYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yICsgMX0uMC1uZXh0LjBgKSE7XG4gICAgY29uc3QgYnVtcENvbW1pdE1lc3NhZ2UgPSBnZXRDb21taXRNZXNzYWdlRm9yRXhjZXB0aW9uYWxOZXh0VmVyc2lvbkJ1bXAobmV3TmV4dFZlcnNpb24pO1xuXG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKG5leHRCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3TmV4dFZlcnNpb24pO1xuXG4gICAgLy8gQ3JlYXRlIGFuIGluZGl2aWR1YWwgY29tbWl0IGZvciB0aGUgbmV4dCB2ZXJzaW9uIGJ1bXAuIFRoZSBjaGFuZ2Vsb2cgc2hvdWxkIGdvIGludG9cbiAgICAvLyBhIHNlcGFyYXRlIGNvbW1pdCB0aGF0IG1ha2VzIGl0IGNsZWFyIHdoZXJlIHRoZSBjaGFuZ2Vsb2cgaXMgY2hlcnJ5LXBpY2tlZCBmcm9tLlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGJ1bXBDb21taXRNZXNzYWdlLCBbcGFja2FnZUpzb25QYXRoXSk7XG5cbiAgICBhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXMpO1xuXG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2UocmVsZWFzZU5vdGVzLnZlcnNpb24pO1xuXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoY29tbWl0TWVzc2FnZSwgW2NoYW5nZWxvZ1BhdGhdKTtcblxuICAgIGxldCBuZXh0UHVsbFJlcXVlc3RNZXNzYWdlID0gYFRoZSBwcmV2aW91cyBcIm5leHRcIiByZWxlYXNlLXRyYWluIGhhcyBtb3ZlZCBpbnRvIHRoZSBgICtcbiAgICAgICAgYCR7dGhpcy5uZXdQaGFzZU5hbWV9IHBoYXNlLiBUaGlzIFBSIHVwZGF0ZXMgdGhlIG5leHQgYnJhbmNoIHRvIHRoZSBzdWJzZXF1ZW50IGAgK1xuICAgICAgICBgcmVsZWFzZS10cmFpbi5cXG5cXG5BbHNvIHRoaXMgUFIgY2hlcnJ5LXBpY2tzIHRoZSBjaGFuZ2Vsb2cgZm9yIGAgK1xuICAgICAgICBgdiR7bmV3VmVyc2lvbn0gaW50byB0aGUgJHtuZXh0QnJhbmNofSBicmFuY2ggc28gdGhhdCB0aGUgY2hhbmdlbG9nIGlzIHVwIHRvIGRhdGUuYDtcblxuICAgIGNvbnN0IG5leHRVcGRhdGVQdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgbmV4dEJyYW5jaCwgYG5leHQtcmVsZWFzZS10cmFpbi0ke25ld05leHRWZXJzaW9ufWAsXG4gICAgICAgIGBVcGRhdGUgbmV4dCBicmFuY2ggdG8gcmVmbGVjdCBuZXcgcmVsZWFzZS10cmFpbiBcInYke25ld05leHRWZXJzaW9ufVwiLmAsXG4gICAgICAgIG5leHRQdWxsUmVxdWVzdE1lc3NhZ2UpO1xuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBQdWxsIHJlcXVlc3QgZm9yIHVwZGF0aW5nIHRoZSBcIiR7bmV4dEJyYW5jaH1cIiBicmFuY2ggaGFzIGJlZW4gY3JlYXRlZC5gKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtuZXh0VXBkYXRlUHVsbFJlcXVlc3QudXJsfS5gKSk7XG4gIH1cbn1cbiJdfQ==