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
                var newVersion, newBranch, _a, id, releaseNotes;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this._newVersion];
                        case 1:
                            newVersion = _b.sent();
                            newBranch = newVersion.major + "." + newVersion.minor + ".x";
                            // Branch-off the next branch into a feature-freeze branch.
                            return [4 /*yield*/, this._createNewVersionBranchFromNext(newBranch)];
                        case 2:
                            // Branch-off the next branch into a feature-freeze branch.
                            _b.sent();
                            return [4 /*yield*/, this.stageVersionForBranchAndCreatePullRequest(newVersion, newBranch)];
                        case 3:
                            _a = _b.sent(), id = _a.pullRequest.id, releaseNotes = _a.releaseNotes;
                            // Wait for the staging PR to be merged. Then build and publish the feature-freeze next
                            // pre-release. Finally, cherry-pick the release notes into the next branch in combination
                            // with bumping the version to the next minor too.
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
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
        MoveNextIntoFeatureFreezeAction.prototype._createNextBranchUpdatePullRequest = function (releaseNotes, newVersion) {
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
                                "release-candidate phase. This PR updates the next branch to the subsequent " +
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvbW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyxvRUFBMkQ7SUFHM0QsaUhBQTRGO0lBQzVGLDhFQUF5QztJQUN6Qyw0RkFBdUg7SUFDdkgsa0ZBQTREO0lBRTVEOzs7O09BSUc7SUFDSDtRQUFxRCwyREFBYTtRQUFsRTtZQUFBLHFFQW9GQztZQW5GUyxpQkFBVyxHQUFHLDREQUFrQyxDQUFDLEtBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztRQW1GckYsQ0FBQztRQWpGTyx3REFBYyxHQUFwQjs7Ozs7OzRCQUNTLFVBQVUsR0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksV0FBcEIsQ0FBcUI7NEJBQ25CLHFCQUFNLElBQUksQ0FBQyxXQUFXLEVBQUE7OzRCQUFuQyxVQUFVLEdBQUcsU0FBc0I7NEJBQ3pDLHNCQUFPLGdCQUFhLFVBQVUsOENBQXdDLFVBQVUsT0FBSSxFQUFDOzs7O1NBQ3RGO1FBRUssaURBQU8sR0FBYjs7Ozs7Z0NBQ3FCLHFCQUFNLElBQUksQ0FBQyxXQUFXLEVBQUE7OzRCQUFuQyxVQUFVLEdBQUcsU0FBc0I7NEJBQ25DLFNBQVMsR0FBTSxVQUFVLENBQUMsS0FBSyxTQUFJLFVBQVUsQ0FBQyxLQUFLLE9BQUksQ0FBQzs0QkFFOUQsMkRBQTJEOzRCQUMzRCxxQkFBTSxJQUFJLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLEVBQUE7OzRCQURyRCwyREFBMkQ7NEJBQzNELFNBQXFELENBQUM7NEJBTWxELHFCQUFNLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxVQUFV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SSxFQUN2RSxzQkFBc0IsQ0FBQyxFQUFBOzs0QkFIckIscUJBQXFCLEdBQUcsU0FHSDs0QkFFM0IsY0FBSSxDQUFDLGVBQUssQ0FBQyxnREFBd0MsVUFBVSxnQ0FBNEIsQ0FBQyxDQUFDLENBQUM7NEJBQzVGLGNBQUksQ0FBQyxnQkFBTSxDQUFDLDhDQUE0QyxxQkFBcUIsQ0FBQyxHQUFHLE1BQUcsQ0FBQyxDQUFDLENBQUM7Ozs7O1NBQ3hGO1FBRVksd0NBQVEsR0FBckIsVUFBc0IsTUFBMkI7OztvQkFDL0MsNkVBQTZFO29CQUM3RSx3RUFBd0U7b0JBQ3hFLHNCQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLEVBQUM7OztTQUN6QztRQUNILHNDQUFDO0lBQUQsQ0FBQyxBQXBGRCxDQUFxRCx1QkFBYSxHQW9GakU7SUFwRlksMEVBQStCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2dyZWVuLCBpbmZvLCB5ZWxsb3d9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtSZWxlYXNlTm90ZXN9IGZyb20gJy4uLy4uL25vdGVzL3JlbGVhc2Utbm90ZXMnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2NvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHR9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvbmV4dC1wcmVyZWxlYXNlLXZlcnNpb24nO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcbmltcG9ydCB7Z2V0Q29tbWl0TWVzc2FnZUZvckV4Y2VwdGlvbmFsTmV4dFZlcnNpb25CdW1wLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge2NoYW5nZWxvZ1BhdGgsIHBhY2thZ2VKc29uUGF0aH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IG1vdmVzIHRoZSBuZXh0IHJlbGVhc2UtdHJhaW4gaW50byB0aGUgZmVhdHVyZS1mcmVlemUgcGhhc2UuIFRoaXMgbWVhbnNcbiAqIHRoYXQgYSBuZXcgdmVyc2lvbiBicmFuY2ggaXMgY3JlYXRlZCBmcm9tIHRoZSBuZXh0IGJyYW5jaCwgYW5kIGEgbmV3IG5leHQgcHJlLXJlbGVhc2UgaXNcbiAqIGN1dCBpbmRpY2F0aW5nIHRoZSBzdGFydGVkIGZlYXR1cmUtZnJlZXplLlxuICovXG5leHBvcnQgY2xhc3MgTW92ZU5leHRJbnRvRmVhdHVyZUZyZWV6ZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBwcml2YXRlIF9uZXdWZXJzaW9uID0gY29tcHV0ZU5ld1ByZXJlbGVhc2VWZXJzaW9uRm9yTmV4dCh0aGlzLmFjdGl2ZSwgdGhpcy5jb25maWcpO1xuXG4gIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBNb3ZlIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggaW50byBmZWF0dXJlLWZyZWV6ZSBwaGFzZSAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBhd2FpdCB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIGNvbnN0IG5ld0JyYW5jaCA9IGAke25ld1ZlcnNpb24ubWFqb3J9LiR7bmV3VmVyc2lvbi5taW5vcn0ueGA7XG5cbiAgICAvLyBCcmFuY2gtb2ZmIHRoZSBuZXh0IGJyYW5jaCBpbnRvIGEgZmVhdHVyZS1mcmVlemUgYnJhbmNoLlxuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZU5ld1ZlcnNpb25CcmFuY2hGcm9tTmV4dChuZXdCcmFuY2gpO1xuXG4gICAgLy8gU3RhZ2UgdGhlIG5ldyB2ZXJzaW9uIGZvciB0aGUgbmV3bHkgY3JlYXRlZCBicmFuY2gsIGFuZCBwdXNoIGNoYW5nZXMgdG8gYVxuICAgIC8vIGZvcmsgaW4gb3JkZXIgdG8gY3JlYXRlIGEgc3RhZ2luZyBwdWxsIHJlcXVlc3QuIE5vdGUgdGhhdCB3ZSByZS11c2UgdGhlIG5ld2x5XG4gICAgLy8gY3JlYXRlZCBicmFuY2ggaW5zdGVhZCBvZiByZS1mZXRjaGluZyBmcm9tIHRoZSB1cHN0cmVhbS5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3Q6IHtpZH0sIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KG5ld1ZlcnNpb24sIG5ld0JyYW5jaCk7XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgc3RhZ2luZyBQUiB0byBiZSBtZXJnZWQuIFRoZW4gYnVpbGQgYW5kIHB1Ymxpc2ggdGhlIGZlYXR1cmUtZnJlZXplIG5leHRcbiAgICAvLyBwcmUtcmVsZWFzZS4gRmluYWxseSwgY2hlcnJ5LXBpY2sgdGhlIHJlbGVhc2Ugbm90ZXMgaW50byB0aGUgbmV4dCBicmFuY2ggaW4gY29tYmluYXRpb25cbiAgICAvLyB3aXRoIGJ1bXBpbmcgdGhlIHZlcnNpb24gdG8gdGhlIG5leHQgbWlub3IgdG9vLlxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChpZCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBuZXdCcmFuY2gsICduZXh0Jyk7XG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlTmV4dEJyYW5jaFVwZGF0ZVB1bGxSZXF1ZXN0KHJlbGVhc2VOb3RlcywgbmV3VmVyc2lvbik7XG4gIH1cblxuICAvKiogQ3JlYXRlcyBhIG5ldyB2ZXJzaW9uIGJyYW5jaCBmcm9tIHRoZSBuZXh0IGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlTmV3VmVyc2lvbkJyYW5jaEZyb21OZXh0KG5ld0JyYW5jaDogc3RyaW5nKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWU6IG5leHRCcmFuY2h9ID0gdGhpcy5hY3RpdmUubmV4dDtcbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMobmV4dEJyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKG5leHRCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChuZXdCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMucHVzaEhlYWRUb1JlbW90ZUJyYW5jaChuZXdCcmFuY2gpO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVmVyc2lvbiBicmFuY2ggXCIke25ld0JyYW5jaH1cIiBjcmVhdGVkLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcHVsbCByZXF1ZXN0IGZvciB0aGUgbmV4dCBicmFuY2ggdGhhdCBidW1wcyB0aGUgdmVyc2lvbiB0byB0aGUgbmV4dFxuICAgKiBtaW5vciwgYW5kIGNoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZvciB0aGUgbmV3bHkgYnJhbmNoZWQtb2ZmIGZlYXR1cmUtZnJlZXplIHZlcnNpb24uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVOZXh0QnJhbmNoVXBkYXRlUHVsbFJlcXVlc3QoXG4gICAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgbmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGNvbnN0IHticmFuY2hOYW1lOiBuZXh0QnJhbmNoLCB2ZXJzaW9ufSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgLy8gV2UgaW5jcmVhc2UgdGhlIHZlcnNpb24gZm9yIHRoZSBuZXh0IGJyYW5jaCB0byB0aGUgbmV4dCBtaW5vci4gVGhlIHRlYW0gY2FuIGRlY2lkZVxuICAgIC8vIGxhdGVyIGlmIHRoZXkgd2FudCBuZXh0IHRvIGJlIGEgbWFqb3IgdGhyb3VnaCB0aGUgYENvbmZpZ3VyZSBOZXh0IGFzIE1ham9yYCByZWxlYXNlIGFjdGlvbi5cbiAgICBjb25zdCBuZXdOZXh0VmVyc2lvbiA9IHNlbXZlci5wYXJzZShgJHt2ZXJzaW9uLm1ham9yfS4ke3ZlcnNpb24ubWlub3IgKyAxfS4wLW5leHQuMGApITtcbiAgICBjb25zdCBidW1wQ29tbWl0TWVzc2FnZSA9IGdldENvbW1pdE1lc3NhZ2VGb3JFeGNlcHRpb25hbE5leHRWZXJzaW9uQnVtcChuZXdOZXh0VmVyc2lvbik7XG5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gobmV4dEJyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVQcm9qZWN0VmVyc2lvbihuZXdOZXh0VmVyc2lvbik7XG5cbiAgICAvLyBDcmVhdGUgYW4gaW5kaXZpZHVhbCBjb21taXQgZm9yIHRoZSBuZXh0IHZlcnNpb24gYnVtcC4gVGhlIGNoYW5nZWxvZyBzaG91bGQgZ28gaW50b1xuICAgIC8vIGEgc2VwYXJhdGUgY29tbWl0IHRoYXQgbWFrZXMgaXQgY2xlYXIgd2hlcmUgdGhlIGNoYW5nZWxvZyBpcyBjaGVycnktcGlja2VkIGZyb20uXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoYnVtcENvbW1pdE1lc3NhZ2UsIFtwYWNrYWdlSnNvblBhdGhdKTtcblxuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG5cbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZShyZWxlYXNlTm90ZXMudmVyc2lvbik7XG5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbY2hhbmdlbG9nUGF0aF0pO1xuXG4gICAgbGV0IG5leHRQdWxsUmVxdWVzdE1lc3NhZ2UgPSBgVGhlIHByZXZpb3VzIFwibmV4dFwiIHJlbGVhc2UtdHJhaW4gaGFzIG1vdmVkIGludG8gdGhlIGAgK1xuICAgICAgICBgcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuIFRoaXMgUFIgdXBkYXRlcyB0aGUgbmV4dCBicmFuY2ggdG8gdGhlIHN1YnNlcXVlbnQgYCArXG4gICAgICAgIGByZWxlYXNlLXRyYWluLlxcblxcbkFsc28gdGhpcyBQUiBjaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmb3IgYCArXG4gICAgICAgIGB2JHtuZXdWZXJzaW9ufSBpbnRvIHRoZSAke25leHRCcmFuY2h9IGJyYW5jaCBzbyB0aGF0IHRoZSBjaGFuZ2Vsb2cgaXMgdXAgdG8gZGF0ZS5gO1xuXG4gICAgY29uc3QgbmV4dFVwZGF0ZVB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgICBuZXh0QnJhbmNoLCBgbmV4dC1yZWxlYXNlLXRyYWluLSR7bmV3TmV4dFZlcnNpb259YCxcbiAgICAgICAgYFVwZGF0ZSBuZXh0IGJyYW5jaCB0byByZWZsZWN0IG5ldyByZWxlYXNlLXRyYWluIFwidiR7bmV3TmV4dFZlcnNpb259XCIuYCxcbiAgICAgICAgbmV4dFB1bGxSZXF1ZXN0TWVzc2FnZSk7XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFB1bGwgcmVxdWVzdCBmb3IgdXBkYXRpbmcgdGhlIFwiJHtuZXh0QnJhbmNofVwiIGJyYW5jaCBoYXMgYmVlbiBjcmVhdGVkLmApKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke25leHRVcGRhdGVQdWxsUmVxdWVzdC51cmx9LmApKTtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBBIG5ldyBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggY2FuIG9ubHkgYmUgY3JlYXRlZCBpZiB0aGVyZVxuICAgIC8vIGlzIG5vIGFjdGl2ZSByZWxlYXNlLXRyYWluIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLlxuICAgIHJldHVybiBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSA9PT0gbnVsbDtcbiAgfVxufVxuIl19