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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvbW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyxvRUFBMkQ7SUFFM0QsaUhBQTRGO0lBQzVGLDhFQUF5QztJQUN6Qyw0RkFBdUg7SUFDdkgsa0ZBQTREO0lBRzVEOzs7O09BSUc7SUFDSDtRQUFxRCwyREFBYTtRQUFsRTtZQUFBLHFFQW9GQztZQW5GUyxpQkFBVyxHQUFHLDREQUFrQyxDQUFDLEtBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztRQW1GckYsQ0FBQztRQWpGTyx3REFBYyxHQUFwQjs7Ozs7OzRCQUNTLFVBQVUsR0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksV0FBcEIsQ0FBcUI7NEJBQ25CLHFCQUFNLElBQUksQ0FBQyxXQUFXLEVBQUE7OzRCQUFuQyxVQUFVLEdBQUcsU0FBc0I7NEJBQ3pDLHNCQUFPLGdCQUFhLFVBQVUsOENBQXdDLFVBQVUsT0FBSSxFQUFDOzs7O1NBQ3RGO1FBRUssaURBQU8sR0FBYjs7Ozs7Z0NBQ3FCLHFCQUFNLElBQUksQ0FBQyxXQUFXLEVBQUE7OzRCQUFuQyxVQUFVLEdBQUcsU0FBc0I7NEJBQ25DLFNBQVMsR0FBTSxVQUFVLENBQUMsS0FBSyxTQUFJLFVBQVUsQ0FBQyxLQUFLLE9BQUksQ0FBQzs0QkFFOUQsMkRBQTJEOzRCQUMzRCxxQkFBTSxJQUFJLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLEVBQUE7OzRCQURyRCwyREFBMkQ7NEJBQzNELFNBQXFELENBQUM7NEJBTWxELHFCQUFNLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxVQUFV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SSxFQUN2RSxzQkFBc0IsQ0FBQyxFQUFBOzs0QkFIckIscUJBQXFCLEdBQUcsU0FHSDs0QkFFM0IsY0FBSSxDQUFDLGVBQUssQ0FBQyxnREFBd0MsVUFBVSxnQ0FBNEIsQ0FBQyxDQUFDLENBQUM7NEJBQzVGLGNBQUksQ0FBQyxnQkFBTSxDQUFDLDhDQUE0QyxxQkFBcUIsQ0FBQyxHQUFHLE1BQUcsQ0FBQyxDQUFDLENBQUM7Ozs7O1NBQ3hGO1FBRVksd0NBQVEsR0FBckIsVUFBc0IsTUFBMkI7OztvQkFDL0MsNkVBQTZFO29CQUM3RSx3RUFBd0U7b0JBQ3hFLHNCQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLEVBQUM7OztTQUN6QztRQUNILHNDQUFDO0lBQUQsQ0FBQyxBQXBGRCxDQUFxRCx1QkFBYSxHQW9GakU7SUFwRlksMEVBQStCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2dyZWVuLCBpbmZvLCB5ZWxsb3d9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2NvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHR9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvbmV4dC1wcmVyZWxlYXNlLXZlcnNpb24nO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcbmltcG9ydCB7Z2V0Q29tbWl0TWVzc2FnZUZvckV4Y2VwdGlvbmFsTmV4dFZlcnNpb25CdW1wLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge2NoYW5nZWxvZ1BhdGgsIHBhY2thZ2VKc29uUGF0aH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7UmVsZWFzZU5vdGVzfSBmcm9tICcuLi9yZWxlYXNlLW5vdGVzL3JlbGVhc2Utbm90ZXMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgbW92ZXMgdGhlIG5leHQgcmVsZWFzZS10cmFpbiBpbnRvIHRoZSBmZWF0dXJlLWZyZWV6ZSBwaGFzZS4gVGhpcyBtZWFuc1xuICogdGhhdCBhIG5ldyB2ZXJzaW9uIGJyYW5jaCBpcyBjcmVhdGVkIGZyb20gdGhlIG5leHQgYnJhbmNoLCBhbmQgYSBuZXcgbmV4dCBwcmUtcmVsZWFzZSBpc1xuICogY3V0IGluZGljYXRpbmcgdGhlIHN0YXJ0ZWQgZmVhdHVyZS1mcmVlemUuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb3ZlTmV4dEludG9GZWF0dXJlRnJlZXplQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSBjb21wdXRlTmV3UHJlcmVsZWFzZVZlcnNpb25Gb3JOZXh0KHRoaXMuYWN0aXZlLCB0aGlzLmNvbmZpZyk7XG5cbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUubmV4dDtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gYXdhaXQgdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYE1vdmUgdGhlIFwiJHticmFuY2hOYW1lfVwiIGJyYW5jaCBpbnRvIGZlYXR1cmUtZnJlZXplIHBoYXNlICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX25ld1ZlcnNpb247XG4gICAgY29uc3QgbmV3QnJhbmNoID0gYCR7bmV3VmVyc2lvbi5tYWpvcn0uJHtuZXdWZXJzaW9uLm1pbm9yfS54YDtcblxuICAgIC8vIEJyYW5jaC1vZmYgdGhlIG5leHQgYnJhbmNoIGludG8gYSBmZWF0dXJlLWZyZWV6ZSBicmFuY2guXG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlTmV3VmVyc2lvbkJyYW5jaEZyb21OZXh0KG5ld0JyYW5jaCk7XG5cbiAgICAvLyBTdGFnZSB0aGUgbmV3IHZlcnNpb24gZm9yIHRoZSBuZXdseSBjcmVhdGVkIGJyYW5jaCwgYW5kIHB1c2ggY2hhbmdlcyB0byBhXG4gICAgLy8gZm9yayBpbiBvcmRlciB0byBjcmVhdGUgYSBzdGFnaW5nIHB1bGwgcmVxdWVzdC4gTm90ZSB0aGF0IHdlIHJlLXVzZSB0aGUgbmV3bHlcbiAgICAvLyBjcmVhdGVkIGJyYW5jaCBpbnN0ZWFkIG9mIHJlLWZldGNoaW5nIGZyb20gdGhlIHVwc3RyZWFtLlxuICAgIGNvbnN0IHtwdWxsUmVxdWVzdDoge2lkfSwgcmVsZWFzZU5vdGVzfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QobmV3VmVyc2lvbiwgbmV3QnJhbmNoKTtcblxuICAgIC8vIFdhaXQgZm9yIHRoZSBzdGFnaW5nIFBSIHRvIGJlIG1lcmdlZC4gVGhlbiBidWlsZCBhbmQgcHVibGlzaCB0aGUgZmVhdHVyZS1mcmVlemUgbmV4dFxuICAgIC8vIHByZS1yZWxlYXNlLiBGaW5hbGx5LCBjaGVycnktcGljayB0aGUgcmVsZWFzZSBub3RlcyBpbnRvIHRoZSBuZXh0IGJyYW5jaCBpbiBjb21iaW5hdGlvblxuICAgIC8vIHdpdGggYnVtcGluZyB0aGUgdmVyc2lvbiB0byB0aGUgbmV4dCBtaW5vciB0b28uXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChyZWxlYXNlTm90ZXMsIG5ld0JyYW5jaCwgJ25leHQnKTtcbiAgICBhd2FpdCB0aGlzLl9jcmVhdGVOZXh0QnJhbmNoVXBkYXRlUHVsbFJlcXVlc3QocmVsZWFzZU5vdGVzLCBuZXdWZXJzaW9uKTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGEgbmV3IHZlcnNpb24gYnJhbmNoIGZyb20gdGhlIG5leHQgYnJhbmNoLiAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVOZXdWZXJzaW9uQnJhbmNoRnJvbU5leHQobmV3QnJhbmNoOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZTogbmV4dEJyYW5jaH0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIGF3YWl0IHRoaXMudmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhuZXh0QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gobmV4dEJyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKG5ld0JyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5wdXNoSGVhZFRvUmVtb3RlQnJhbmNoKG5ld0JyYW5jaCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBWZXJzaW9uIGJyYW5jaCBcIiR7bmV3QnJhbmNofVwiIGNyZWF0ZWQuYCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBwdWxsIHJlcXVlc3QgZm9yIHRoZSBuZXh0IGJyYW5jaCB0aGF0IGJ1bXBzIHRoZSB2ZXJzaW9uIHRvIHRoZSBuZXh0XG4gICAqIG1pbm9yLCBhbmQgY2hlcnJ5LXBpY2tzIHRoZSBjaGFuZ2Vsb2cgZm9yIHRoZSBuZXdseSBicmFuY2hlZC1vZmYgZmVhdHVyZS1mcmVlemUgdmVyc2lvbi5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2NyZWF0ZU5leHRCcmFuY2hVcGRhdGVQdWxsUmVxdWVzdChcbiAgICAgIHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWU6IG5leHRCcmFuY2gsIHZlcnNpb259ID0gdGhpcy5hY3RpdmUubmV4dDtcbiAgICAvLyBXZSBpbmNyZWFzZSB0aGUgdmVyc2lvbiBmb3IgdGhlIG5leHQgYnJhbmNoIHRvIHRoZSBuZXh0IG1pbm9yLiBUaGUgdGVhbSBjYW4gZGVjaWRlXG4gICAgLy8gbGF0ZXIgaWYgdGhleSB3YW50IG5leHQgdG8gYmUgYSBtYWpvciB0aHJvdWdoIHRoZSBgQ29uZmlndXJlIE5leHQgYXMgTWFqb3JgIHJlbGVhc2UgYWN0aW9uLlxuICAgIGNvbnN0IG5ld05leHRWZXJzaW9uID0gc2VtdmVyLnBhcnNlKGAke3ZlcnNpb24ubWFqb3J9LiR7dmVyc2lvbi5taW5vciArIDF9LjAtbmV4dC4wYCkhO1xuICAgIGNvbnN0IGJ1bXBDb21taXRNZXNzYWdlID0gZ2V0Q29tbWl0TWVzc2FnZUZvckV4Y2VwdGlvbmFsTmV4dFZlcnNpb25CdW1wKG5ld05leHRWZXJzaW9uKTtcblxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld05leHRWZXJzaW9uKTtcblxuICAgIC8vIENyZWF0ZSBhbiBpbmRpdmlkdWFsIGNvbW1pdCBmb3IgdGhlIG5leHQgdmVyc2lvbiBidW1wLiBUaGUgY2hhbmdlbG9nIHNob3VsZCBnbyBpbnRvXG4gICAgLy8gYSBzZXBhcmF0ZSBjb21taXQgdGhhdCBtYWtlcyBpdCBjbGVhciB3aGVyZSB0aGUgY2hhbmdlbG9nIGlzIGNoZXJyeS1waWNrZWQgZnJvbS5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChidW1wQ29tbWl0TWVzc2FnZSwgW3BhY2thZ2VKc29uUGF0aF0pO1xuXG4gICAgYXdhaXQgdGhpcy5wcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzKTtcblxuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlKHJlbGVhc2VOb3Rlcy52ZXJzaW9uKTtcblxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtjaGFuZ2Vsb2dQYXRoXSk7XG5cbiAgICBsZXQgbmV4dFB1bGxSZXF1ZXN0TWVzc2FnZSA9IGBUaGUgcHJldmlvdXMgXCJuZXh0XCIgcmVsZWFzZS10cmFpbiBoYXMgbW92ZWQgaW50byB0aGUgYCArXG4gICAgICAgIGByZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gVGhpcyBQUiB1cGRhdGVzIHRoZSBuZXh0IGJyYW5jaCB0byB0aGUgc3Vic2VxdWVudCBgICtcbiAgICAgICAgYHJlbGVhc2UtdHJhaW4uXFxuXFxuQWxzbyB0aGlzIFBSIGNoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZvciBgICtcbiAgICAgICAgYHYke25ld1ZlcnNpb259IGludG8gdGhlICR7bmV4dEJyYW5jaH0gYnJhbmNoIHNvIHRoYXQgdGhlIGNoYW5nZWxvZyBpcyB1cCB0byBkYXRlLmA7XG5cbiAgICBjb25zdCBuZXh0VXBkYXRlUHVsbFJlcXVlc3QgPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICAgIG5leHRCcmFuY2gsIGBuZXh0LXJlbGVhc2UtdHJhaW4tJHtuZXdOZXh0VmVyc2lvbn1gLFxuICAgICAgICBgVXBkYXRlIG5leHQgYnJhbmNoIHRvIHJlZmxlY3QgbmV3IHJlbGVhc2UtdHJhaW4gXCJ2JHtuZXdOZXh0VmVyc2lvbn1cIi5gLFxuICAgICAgICBuZXh0UHVsbFJlcXVlc3RNZXNzYWdlKTtcblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgUHVsbCByZXF1ZXN0IGZvciB1cGRhdGluZyB0aGUgXCIke25leHRCcmFuY2h9XCIgYnJhbmNoIGhhcyBiZWVuIGNyZWF0ZWQuYCkpO1xuICAgIGluZm8oeWVsbG93KGAgICAgICBQbGVhc2UgYXNrIHRlYW0gbWVtYmVycyB0byByZXZpZXc6ICR7bmV4dFVwZGF0ZVB1bGxSZXF1ZXN0LnVybH0uYCkpO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIEEgbmV3IGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBjYW4gb25seSBiZSBjcmVhdGVkIGlmIHRoZXJlXG4gICAgLy8gaXMgbm8gYWN0aXZlIHJlbGVhc2UtdHJhaW4gaW4gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuXG4gICAgcmV0dXJuIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlID09PSBudWxsO1xuICB9XG59XG4iXX0=