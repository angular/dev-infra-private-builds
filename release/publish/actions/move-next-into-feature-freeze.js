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
        define("@angular/dev-infra-private/release/publish/actions/move-next-into-feature-freeze", ["require", "exports", "tslib", "semver", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/release/versioning/next-prerelease-version", "@angular/dev-infra-private/release/publish/actions", "@angular/dev-infra-private/release/publish/commit-message", "@angular/dev-infra-private/release/publish/constants"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveNextIntoFeatureFreezeAction = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var next_prerelease_version_1 = require("@angular/dev-infra-private/release/versioning/next-prerelease-version");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    var commit_message_1 = require("@angular/dev-infra-private/release/publish/commit-message");
    var constants_1 = require("@angular/dev-infra-private/release/publish/constants");
    /**
     * Release action that moves the next release-train into the feature-freeze phase. This means
     * that a new version branch is created from the next branch, and a new next pre-release is
     * cut indicating the started feature-freeze.
     */
    var MoveNextIntoFeatureFreezeAction = /** @class */ (function (_super) {
        tslib_1.__extends(MoveNextIntoFeatureFreezeAction, _super);
        function MoveNextIntoFeatureFreezeAction() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._newVersion = next_prerelease_version_1.computeNewPrereleaseVersionForNext(_this.active, _this.config);
            return _this;
        }
        MoveNextIntoFeatureFreezeAction.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            branchName = this.active.next.branchName;
                            return [4 /*yield*/, this._newVersion];
                        case 1:
                            newVersion = _a.sent();
                            return [2 /*return*/, "Move the \"" + branchName + "\" branch into feature-freeze phase (v" + newVersion + ")."];
                    }
                });
            });
        };
        MoveNextIntoFeatureFreezeAction.prototype.perform = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var newVersion, newBranch, stagingPullRequest;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._newVersion];
                        case 1:
                            newVersion = _a.sent();
                            newBranch = newVersion.major + "." + newVersion.minor + ".x";
                            // Branch-off the next branch into a feature-freeze branch.
                            return [4 /*yield*/, this._createNewVersionBranchFromNext(newBranch)];
                        case 2:
                            // Branch-off the next branch into a feature-freeze branch.
                            _a.sent();
                            return [4 /*yield*/, this.stageVersionForBranchAndCreatePullRequest(newVersion, newBranch)];
                        case 3:
                            stagingPullRequest = _a.sent();
                            // Wait for the staging PR to be merged. Then build and publish the feature-freeze next
                            // pre-release. Finally, cherry-pick the release notes into the next branch in combination
                            // with bumping the version to the next minor too.
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(stagingPullRequest.id)];
                        case 4:
                            // Wait for the staging PR to be merged. Then build and publish the feature-freeze next
                            // pre-release. Finally, cherry-pick the release notes into the next branch in combination
                            // with bumping the version to the next minor too.
                            _a.sent();
                            return [4 /*yield*/, this.buildAndPublish(newVersion, newBranch, 'next')];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, this._createNextBranchUpdatePullRequest(newVersion, newBranch)];
                        case 6:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Creates a new version branch from the next branch. */
        MoveNextIntoFeatureFreezeAction.prototype._createNewVersionBranchFromNext = function (newBranch) {
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
         * minor, and cherry-picks the changelog for the newly branched-off feature-freeze version.
         */
        MoveNextIntoFeatureFreezeAction.prototype._createNextBranchUpdatePullRequest = function (newVersion, newBranch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, nextBranch, version, newNextVersion, bumpCommitMessage, nextPullRequestMessage, hasChangelogCherryPicked, nextUpdatePullRequest;
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
                            nextPullRequestMessage = "The previous \"next\" release-train has moved into the " +
                                "release-candidate phase. This PR updates the next branch to the subsequent " +
                                "release-train.";
                            return [4 /*yield*/, this.createCherryPickReleaseNotesCommitFrom(newVersion, newBranch)];
                        case 4:
                            hasChangelogCherryPicked = _b.sent();
                            if (hasChangelogCherryPicked) {
                                nextPullRequestMessage += "\n\nAlso this PR cherry-picks the changelog for " +
                                    ("v" + newVersion + " into the " + nextBranch + " branch so that the changelog is up to date.");
                            }
                            else {
                                console_1.error(console_1.yellow("  \u2718   Could not cherry-pick release notes for v" + newVersion + "."));
                                console_1.error(console_1.yellow("      Please copy the release note manually into \"" + nextBranch + "\"."));
                            }
                            return [4 /*yield*/, this.pushChangesToForkAndCreatePullRequest(nextBranch, "next-release-train-" + newNextVersion, "Update next branch to reflect new release-train \"v" + newNextVersion + "\".", nextPullRequestMessage)];
                        case 5:
                            nextUpdatePullRequest = _b.sent();
                            console_1.info(console_1.green("  \u2713   Pull request for updating the \"" + nextBranch + "\" branch has been created."));
                            console_1.info(console_1.yellow("      Please ask team members to review: " + nextUpdatePullRequest.url + "."));
                            return [2 /*return*/];
                    }
                });
            });
        };
        MoveNextIntoFeatureFreezeAction.isActive = function (active) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // A new feature-freeze/release-candidate branch can only be created if there
                    // is no active release-train in feature-freeze/release-candidate phase.
                    return [2 /*return*/, active.releaseCandidate === null];
                });
            });
        };
        return MoveNextIntoFeatureFreezeAction;
    }(actions_1.ReleaseAction));
    exports.MoveNextIntoFeatureFreezeAction = MoveNextIntoFeatureFreezeAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvbW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyxvRUFBa0U7SUFFbEUsaUhBQTRGO0lBQzVGLDhFQUF5QztJQUN6Qyw0RkFBZ0Y7SUFDaEYsa0ZBQTZDO0lBRTdDOzs7O09BSUc7SUFDSDtRQUFxRCwyREFBYTtRQUFsRTtZQUFBLHFFQXNGQztZQXJGUyxpQkFBVyxHQUFHLDREQUFrQyxDQUFDLEtBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztRQXFGckYsQ0FBQztRQW5GTyx3REFBYyxHQUFwQjs7Ozs7OzRCQUNTLFVBQVUsR0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksV0FBcEIsQ0FBcUI7NEJBQ25CLHFCQUFNLElBQUksQ0FBQyxXQUFXLEVBQUE7OzRCQUFuQyxVQUFVLEdBQUcsU0FBc0I7NEJBQ3pDLHNCQUFPLGdCQUFhLFVBQVUsOENBQXdDLFVBQVUsT0FBSSxFQUFDOzs7O1NBQ3RGO1FBRUssaURBQU8sR0FBYjs7Ozs7Z0NBQ3FCLHFCQUFNLElBQUksQ0FBQyxXQUFXLEVBQUE7OzRCQUFuQyxVQUFVLEdBQUcsU0FBc0I7NEJBQ25DLFNBQVMsR0FBTSxVQUFVLENBQUMsS0FBSyxTQUFJLFVBQVUsQ0FBQyxLQUFLLE9BQUksQ0FBQzs0QkFFOUQsMkRBQTJEOzRCQUMzRCxxQkFBTSxJQUFJLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLEVBQUE7OzRCQURyRCwyREFBMkQ7NEJBQzNELFNBQXFELENBQUM7NEJBTWxELHFCQUFNLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxVQUFV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LHFDQUFxQyxDQUMxRSxVQUFVLEVBQUUsd0JBQXNCLGNBQWdCLEVBQ2xELHdEQUFxRCxjQUFjLFFBQUksRUFDdkUsc0JBQXNCLENBQUMsRUFBQTs7NEJBSHJCLHFCQUFxQixHQUFHLFNBR0g7NEJBRTNCLGNBQUksQ0FBQyxlQUFLLENBQUMsZ0RBQXdDLFVBQVUsZ0NBQTRCLENBQUMsQ0FBQyxDQUFDOzRCQUM1RixjQUFJLENBQUMsZ0JBQU0sQ0FBQyw4Q0FBNEMscUJBQXFCLENBQUMsR0FBRyxNQUFHLENBQUMsQ0FBQyxDQUFDOzs7OztTQUN4RjtRQUVZLHdDQUFRLEdBQXJCLFVBQXNCLE1BQTJCOzs7b0JBQy9DLDZFQUE2RTtvQkFDN0Usd0VBQXdFO29CQUN4RSxzQkFBTyxNQUFNLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxFQUFDOzs7U0FDekM7UUFDSCxzQ0FBQztJQUFELENBQUMsQUF0RkQsQ0FBcUQsdUJBQWEsR0FzRmpFO0lBdEZZLDBFQUErQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHllbGxvd30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7Y29tcHV0ZU5ld1ByZXJlbGVhc2VWZXJzaW9uRm9yTmV4dH0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9uZXh0LXByZXJlbGVhc2UtdmVyc2lvbic7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlRm9yRXhjZXB0aW9uYWxOZXh0VmVyc2lvbkJ1bXB9IGZyb20gJy4uL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7cGFja2FnZUpzb25QYXRofSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgbW92ZXMgdGhlIG5leHQgcmVsZWFzZS10cmFpbiBpbnRvIHRoZSBmZWF0dXJlLWZyZWV6ZSBwaGFzZS4gVGhpcyBtZWFuc1xuICogdGhhdCBhIG5ldyB2ZXJzaW9uIGJyYW5jaCBpcyBjcmVhdGVkIGZyb20gdGhlIG5leHQgYnJhbmNoLCBhbmQgYSBuZXcgbmV4dCBwcmUtcmVsZWFzZSBpc1xuICogY3V0IGluZGljYXRpbmcgdGhlIHN0YXJ0ZWQgZmVhdHVyZS1mcmVlemUuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb3ZlTmV4dEludG9GZWF0dXJlRnJlZXplQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSBjb21wdXRlTmV3UHJlcmVsZWFzZVZlcnNpb25Gb3JOZXh0KHRoaXMuYWN0aXZlLCB0aGlzLmNvbmZpZyk7XG5cbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUubmV4dDtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gYXdhaXQgdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYE1vdmUgdGhlIFwiJHticmFuY2hOYW1lfVwiIGJyYW5jaCBpbnRvIGZlYXR1cmUtZnJlZXplIHBoYXNlICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX25ld1ZlcnNpb247XG4gICAgY29uc3QgbmV3QnJhbmNoID0gYCR7bmV3VmVyc2lvbi5tYWpvcn0uJHtuZXdWZXJzaW9uLm1pbm9yfS54YDtcblxuICAgIC8vIEJyYW5jaC1vZmYgdGhlIG5leHQgYnJhbmNoIGludG8gYSBmZWF0dXJlLWZyZWV6ZSBicmFuY2guXG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlTmV3VmVyc2lvbkJyYW5jaEZyb21OZXh0KG5ld0JyYW5jaCk7XG5cbiAgICAvLyBTdGFnZSB0aGUgbmV3IHZlcnNpb24gZm9yIHRoZSBuZXdseSBjcmVhdGVkIGJyYW5jaCwgYW5kIHB1c2ggY2hhbmdlcyB0byBhXG4gICAgLy8gZm9yayBpbiBvcmRlciB0byBjcmVhdGUgYSBzdGFnaW5nIHB1bGwgcmVxdWVzdC4gTm90ZSB0aGF0IHdlIHJlLXVzZSB0aGUgbmV3bHlcbiAgICAvLyBjcmVhdGVkIGJyYW5jaCBpbnN0ZWFkIG9mIHJlLWZldGNoaW5nIGZyb20gdGhlIHVwc3RyZWFtLlxuICAgIGNvbnN0IHN0YWdpbmdQdWxsUmVxdWVzdCA9XG4gICAgICAgIGF3YWl0IHRoaXMuc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QobmV3VmVyc2lvbiwgbmV3QnJhbmNoKTtcblxuICAgIC8vIFdhaXQgZm9yIHRoZSBzdGFnaW5nIFBSIHRvIGJlIG1lcmdlZC4gVGhlbiBidWlsZCBhbmQgcHVibGlzaCB0aGUgZmVhdHVyZS1mcmVlemUgbmV4dFxuICAgIC8vIHByZS1yZWxlYXNlLiBGaW5hbGx5LCBjaGVycnktcGljayB0aGUgcmVsZWFzZSBub3RlcyBpbnRvIHRoZSBuZXh0IGJyYW5jaCBpbiBjb21iaW5hdGlvblxuICAgIC8vIHdpdGggYnVtcGluZyB0aGUgdmVyc2lvbiB0byB0aGUgbmV4dCBtaW5vciB0b28uXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKHN0YWdpbmdQdWxsUmVxdWVzdC5pZCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gobmV3VmVyc2lvbiwgbmV3QnJhbmNoLCAnbmV4dCcpO1xuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZU5leHRCcmFuY2hVcGRhdGVQdWxsUmVxdWVzdChuZXdWZXJzaW9uLCBuZXdCcmFuY2gpO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgYSBuZXcgdmVyc2lvbiBicmFuY2ggZnJvbSB0aGUgbmV4dCBicmFuY2guICovXG4gIHByaXZhdGUgYXN5bmMgX2NyZWF0ZU5ld1ZlcnNpb25CcmFuY2hGcm9tTmV4dChuZXdCcmFuY2g6IHN0cmluZykge1xuICAgIGNvbnN0IHticmFuY2hOYW1lOiBuZXh0QnJhbmNofSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKG5leHRCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQobmV3QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLnB1c2hIZWFkVG9SZW1vdGVCcmFuY2gobmV3QnJhbmNoKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFZlcnNpb24gYnJhbmNoIFwiJHtuZXdCcmFuY2h9XCIgY3JlYXRlZC5gKSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHB1bGwgcmVxdWVzdCBmb3IgdGhlIG5leHQgYnJhbmNoIHRoYXQgYnVtcHMgdGhlIHZlcnNpb24gdG8gdGhlIG5leHRcbiAgICogbWlub3IsIGFuZCBjaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmb3IgdGhlIG5ld2x5IGJyYW5jaGVkLW9mZiBmZWF0dXJlLWZyZWV6ZSB2ZXJzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlTmV4dEJyYW5jaFVwZGF0ZVB1bGxSZXF1ZXN0KG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIG5ld0JyYW5jaDogc3RyaW5nKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWU6IG5leHRCcmFuY2gsIHZlcnNpb259ID0gdGhpcy5hY3RpdmUubmV4dDtcbiAgICAvLyBXZSBpbmNyZWFzZSB0aGUgdmVyc2lvbiBmb3IgdGhlIG5leHQgYnJhbmNoIHRvIHRoZSBuZXh0IG1pbm9yLiBUaGUgdGVhbSBjYW4gZGVjaWRlXG4gICAgLy8gbGF0ZXIgaWYgdGhleSB3YW50IG5leHQgdG8gYmUgYSBtYWpvciB0aHJvdWdoIHRoZSBgQ29uZmlndXJlIE5leHQgYXMgTWFqb3JgIHJlbGVhc2UgYWN0aW9uLlxuICAgIGNvbnN0IG5ld05leHRWZXJzaW9uID0gc2VtdmVyLnBhcnNlKGAke3ZlcnNpb24ubWFqb3J9LiR7dmVyc2lvbi5taW5vciArIDF9LjAtbmV4dC4wYCkhO1xuICAgIGNvbnN0IGJ1bXBDb21taXRNZXNzYWdlID0gZ2V0Q29tbWl0TWVzc2FnZUZvckV4Y2VwdGlvbmFsTmV4dFZlcnNpb25CdW1wKG5ld05leHRWZXJzaW9uKTtcblxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld05leHRWZXJzaW9uKTtcblxuICAgIC8vIENyZWF0ZSBhbiBpbmRpdmlkdWFsIGNvbW1pdCBmb3IgdGhlIG5leHQgdmVyc2lvbiBidW1wLiBUaGUgY2hhbmdlbG9nIHNob3VsZCBnbyBpbnRvXG4gICAgLy8gYSBzZXBhcmF0ZSBjb21taXQgdGhhdCBtYWtlcyBpdCBjbGVhciB3aGVyZSB0aGUgY2hhbmdlbG9nIGlzIGNoZXJyeS1waWNrZWQgZnJvbS5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChidW1wQ29tbWl0TWVzc2FnZSwgW3BhY2thZ2VKc29uUGF0aF0pO1xuXG4gICAgbGV0IG5leHRQdWxsUmVxdWVzdE1lc3NhZ2UgPSBgVGhlIHByZXZpb3VzIFwibmV4dFwiIHJlbGVhc2UtdHJhaW4gaGFzIG1vdmVkIGludG8gdGhlIGAgK1xuICAgICAgICBgcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuIFRoaXMgUFIgdXBkYXRlcyB0aGUgbmV4dCBicmFuY2ggdG8gdGhlIHN1YnNlcXVlbnQgYCArXG4gICAgICAgIGByZWxlYXNlLXRyYWluLmA7XG4gICAgY29uc3QgaGFzQ2hhbmdlbG9nQ2hlcnJ5UGlja2VkID1cbiAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVDaGVycnlQaWNrUmVsZWFzZU5vdGVzQ29tbWl0RnJvbShuZXdWZXJzaW9uLCBuZXdCcmFuY2gpO1xuXG4gICAgaWYgKGhhc0NoYW5nZWxvZ0NoZXJyeVBpY2tlZCkge1xuICAgICAgbmV4dFB1bGxSZXF1ZXN0TWVzc2FnZSArPSBgXFxuXFxuQWxzbyB0aGlzIFBSIGNoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZvciBgICtcbiAgICAgICAgICBgdiR7bmV3VmVyc2lvbn0gaW50byB0aGUgJHtuZXh0QnJhbmNofSBicmFuY2ggc28gdGhhdCB0aGUgY2hhbmdlbG9nIGlzIHVwIHRvIGRhdGUuYDtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3IoeWVsbG93KGAgIOKcmCAgIENvdWxkIG5vdCBjaGVycnktcGljayByZWxlYXNlIG5vdGVzIGZvciB2JHtuZXdWZXJzaW9ufS5gKSk7XG4gICAgICBlcnJvcih5ZWxsb3coYCAgICAgIFBsZWFzZSBjb3B5IHRoZSByZWxlYXNlIG5vdGUgbWFudWFsbHkgaW50byBcIiR7bmV4dEJyYW5jaH1cIi5gKSk7XG4gICAgfVxuXG4gICAgY29uc3QgbmV4dFVwZGF0ZVB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgICBuZXh0QnJhbmNoLCBgbmV4dC1yZWxlYXNlLXRyYWluLSR7bmV3TmV4dFZlcnNpb259YCxcbiAgICAgICAgYFVwZGF0ZSBuZXh0IGJyYW5jaCB0byByZWZsZWN0IG5ldyByZWxlYXNlLXRyYWluIFwidiR7bmV3TmV4dFZlcnNpb259XCIuYCxcbiAgICAgICAgbmV4dFB1bGxSZXF1ZXN0TWVzc2FnZSk7XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFB1bGwgcmVxdWVzdCBmb3IgdXBkYXRpbmcgdGhlIFwiJHtuZXh0QnJhbmNofVwiIGJyYW5jaCBoYXMgYmVlbiBjcmVhdGVkLmApKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke25leHRVcGRhdGVQdWxsUmVxdWVzdC51cmx9LmApKTtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBBIG5ldyBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggY2FuIG9ubHkgYmUgY3JlYXRlZCBpZiB0aGVyZVxuICAgIC8vIGlzIG5vIGFjdGl2ZSByZWxlYXNlLXRyYWluIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLlxuICAgIHJldHVybiBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSA9PT0gbnVsbDtcbiAgfVxufVxuIl19