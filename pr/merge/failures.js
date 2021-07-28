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
        define("@angular/dev-infra-private/pr/merge/failures", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PullRequestFailure = void 0;
    /**
     * Class that can be used to describe pull request failures. A failure
     * is described through a human-readable message and a flag indicating
     * whether it is non-fatal or not.
     */
    var PullRequestFailure = /** @class */ (function () {
        function PullRequestFailure(
        /** Human-readable message for the failure */
        message, 
        /** Whether the failure is non-fatal and can be forcibly ignored. */
        nonFatal) {
            if (nonFatal === void 0) { nonFatal = false; }
            this.message = message;
            this.nonFatal = nonFatal;
        }
        PullRequestFailure.claUnsigned = function () {
            return new this("CLA has not been signed. Please make sure the PR author has signed the CLA.");
        };
        PullRequestFailure.failingCiJobs = function () {
            return new this("Failing CI jobs.", true);
        };
        PullRequestFailure.pendingCiJobs = function () {
            return new this("Pending CI jobs.", true);
        };
        PullRequestFailure.notMergeReady = function () {
            return new this("Not marked as merge ready.");
        };
        PullRequestFailure.isDraft = function () {
            return new this('Pull request is still in draft.');
        };
        PullRequestFailure.isClosed = function () {
            return new this('Pull request is already closed.');
        };
        PullRequestFailure.isMerged = function () {
            return new this('Pull request is already merged.');
        };
        PullRequestFailure.mismatchingTargetBranch = function (allowedBranches) {
            return new this("Pull request is set to wrong base branch. Please update the PR in the Github UI " +
                ("to one of the following branches: " + allowedBranches.join(', ') + "."));
        };
        PullRequestFailure.unsatisfiedBaseSha = function () {
            return new this("Pull request has not been rebased recently and could be bypassing CI checks. " +
                "Please rebase the PR.");
        };
        PullRequestFailure.mergeConflicts = function (failedBranches) {
            return new this("Could not merge pull request into the following branches due to merge " +
                ("conflicts: " + failedBranches.join(', ') + ". Please rebase the PR or update the target label."));
        };
        PullRequestFailure.unknownMergeError = function () {
            return new this("Unknown merge error occurred. Please see console output above for debugging.");
        };
        PullRequestFailure.unableToFixupCommitMessageSquashOnly = function () {
            return new this("Unable to fixup commit message of pull request. Commit message can only be " +
                "modified if the PR is merged using squash.");
        };
        PullRequestFailure.notFound = function () {
            return new this("Pull request could not be found upstream.");
        };
        PullRequestFailure.insufficientPermissionsToMerge = function (message) {
            if (message === void 0) { message = "Insufficient Github API permissions to merge pull request. Please ensure that " +
                "your auth token has write access."; }
            return new this(message);
        };
        PullRequestFailure.hasBreakingChanges = function (label) {
            var message = "Cannot merge into branch for \"" + label.pattern + "\" as the pull request has " +
                "breaking changes. Breaking changes can only be merged with the \"target: major\" label.";
            return new this(message);
        };
        PullRequestFailure.hasDeprecations = function (label) {
            var message = "Cannot merge into branch for \"" + label.pattern + "\" as the pull request " +
                "contains deprecations. Deprecations can only be merged with the \"target: minor\" or " +
                "\"target: major\" label.";
            return new this(message);
        };
        PullRequestFailure.hasFeatureCommits = function (label) {
            var message = "Cannot merge into branch for \"" + label.pattern + "\" as the pull request has " +
                'commits with the "feat" type. New features can only be merged with the "target: minor" ' +
                'or "target: major" label.';
            return new this(message);
        };
        PullRequestFailure.missingBreakingChangeLabel = function () {
            var message = 'Pull Request has at least one commit containing a breaking change note, but ' +
                'does not have a breaking change label.';
            return new this(message);
        };
        PullRequestFailure.missingBreakingChangeCommit = function () {
            var message = 'Pull Request has a breaking change label, but does not contain any commits ' +
                'with breaking change notes.';
            return new this(message);
        };
        return PullRequestFailure;
    }());
    exports.PullRequestFailure = PullRequestFailure;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFpbHVyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvZmFpbHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUg7Ozs7T0FJRztJQUNIO1FBQ0U7UUFDSSw2Q0FBNkM7UUFDdEMsT0FBZTtRQUN0QixvRUFBb0U7UUFDN0QsUUFBZ0I7WUFBaEIseUJBQUEsRUFBQSxnQkFBZ0I7WUFGaEIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUVmLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBRyxDQUFDO1FBRXhCLDhCQUFXLEdBQWxCO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7UUFFTSxnQ0FBYSxHQUFwQjtZQUNFLE9BQU8sSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLGdDQUFhLEdBQXBCO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRU0sZ0NBQWEsR0FBcEI7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVNLDBCQUFPLEdBQWQ7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLDJCQUFRLEdBQWY7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLDJCQUFRLEdBQWY7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLDBDQUF1QixHQUE5QixVQUErQixlQUF5QjtZQUN0RCxPQUFPLElBQUksSUFBSSxDQUNYLGtGQUFrRjtpQkFDbEYsdUNBQXFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQUcsQ0FBQSxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVNLHFDQUFrQixHQUF6QjtZQUNFLE9BQU8sSUFBSSxJQUFJLENBQ1gsK0VBQStFO2dCQUMvRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTSxpQ0FBYyxHQUFyQixVQUFzQixjQUF3QjtZQUM1QyxPQUFPLElBQUksSUFBSSxDQUNYLHdFQUF3RTtpQkFDeEUsZ0JBQ0ksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdURBQW9ELENBQUEsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFFTSxvQ0FBaUIsR0FBeEI7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDhFQUE4RSxDQUFDLENBQUM7UUFDbEcsQ0FBQztRQUVNLHVEQUFvQyxHQUEzQztZQUNFLE9BQU8sSUFBSSxJQUFJLENBQ1gsNkVBQTZFO2dCQUM3RSw0Q0FBNEMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFTSwyQkFBUSxHQUFmO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFTSxpREFBOEIsR0FBckMsVUFDSSxPQUN1QztZQUR2Qyx3QkFBQSxFQUFBLFVBQVUsZ0ZBQWdGO2dCQUN0RixtQ0FBbUM7WUFDekMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRU0scUNBQWtCLEdBQXpCLFVBQTBCLEtBQWtCO1lBQzFDLElBQU0sT0FBTyxHQUFHLG9DQUFpQyxLQUFLLENBQUMsT0FBTyxnQ0FBNEI7Z0JBQ3RGLHlGQUF1RixDQUFDO1lBQzVGLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVNLGtDQUFlLEdBQXRCLFVBQXVCLEtBQWtCO1lBQ3ZDLElBQU0sT0FBTyxHQUFHLG9DQUFpQyxLQUFLLENBQUMsT0FBTyw0QkFBd0I7Z0JBQ2xGLHVGQUFxRjtnQkFDckYsMEJBQXdCLENBQUM7WUFDN0IsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRU0sb0NBQWlCLEdBQXhCLFVBQXlCLEtBQWtCO1lBQ3pDLElBQU0sT0FBTyxHQUFHLG9DQUFpQyxLQUFLLENBQUMsT0FBTyxnQ0FBNEI7Z0JBQ3RGLHlGQUF5RjtnQkFDekYsMkJBQTJCLENBQUM7WUFDaEMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRU0sNkNBQTBCLEdBQWpDO1lBQ0UsSUFBTSxPQUFPLEdBQUcsOEVBQThFO2dCQUMxRix3Q0FBd0MsQ0FBQztZQUM3QyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFTSw4Q0FBMkIsR0FBbEM7WUFDRSxJQUFNLE9BQU8sR0FBRyw2RUFBNkU7Z0JBQ3pGLDZCQUE2QixDQUFDO1lBQ2xDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQXpHRCxJQXlHQztJQXpHWSxnREFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUYXJnZXRMYWJlbH0gZnJvbSAnLi9jb25maWcnO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGVzY3JpYmUgcHVsbCByZXF1ZXN0IGZhaWx1cmVzLiBBIGZhaWx1cmVcbiAqIGlzIGRlc2NyaWJlZCB0aHJvdWdoIGEgaHVtYW4tcmVhZGFibGUgbWVzc2FnZSBhbmQgYSBmbGFnIGluZGljYXRpbmdcbiAqIHdoZXRoZXIgaXQgaXMgbm9uLWZhdGFsIG9yIG5vdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxSZXF1ZXN0RmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIEh1bWFuLXJlYWRhYmxlIG1lc3NhZ2UgZm9yIHRoZSBmYWlsdXJlICovXG4gICAgICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgLyoqIFdoZXRoZXIgdGhlIGZhaWx1cmUgaXMgbm9uLWZhdGFsIGFuZCBjYW4gYmUgZm9yY2libHkgaWdub3JlZC4gKi9cbiAgICAgIHB1YmxpYyBub25GYXRhbCA9IGZhbHNlKSB7fVxuXG4gIHN0YXRpYyBjbGFVbnNpZ25lZCgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYENMQSBoYXMgbm90IGJlZW4gc2lnbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHRoZSBQUiBhdXRob3IgaGFzIHNpZ25lZCB0aGUgQ0xBLmApO1xuICB9XG5cbiAgc3RhdGljIGZhaWxpbmdDaUpvYnMoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBGYWlsaW5nIENJIGpvYnMuYCwgdHJ1ZSk7XG4gIH1cblxuICBzdGF0aWMgcGVuZGluZ0NpSm9icygpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYFBlbmRpbmcgQ0kgam9icy5gLCB0cnVlKTtcbiAgfVxuXG4gIHN0YXRpYyBub3RNZXJnZVJlYWR5KCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgTm90IG1hcmtlZCBhcyBtZXJnZSByZWFkeS5gKTtcbiAgfVxuXG4gIHN0YXRpYyBpc0RyYWZ0KCkge1xuICAgIHJldHVybiBuZXcgdGhpcygnUHVsbCByZXF1ZXN0IGlzIHN0aWxsIGluIGRyYWZ0LicpO1xuICB9XG5cbiAgc3RhdGljIGlzQ2xvc2VkKCkge1xuICAgIHJldHVybiBuZXcgdGhpcygnUHVsbCByZXF1ZXN0IGlzIGFscmVhZHkgY2xvc2VkLicpO1xuICB9XG5cbiAgc3RhdGljIGlzTWVyZ2VkKCkge1xuICAgIHJldHVybiBuZXcgdGhpcygnUHVsbCByZXF1ZXN0IGlzIGFscmVhZHkgbWVyZ2VkLicpO1xuICB9XG5cbiAgc3RhdGljIG1pc21hdGNoaW5nVGFyZ2V0QnJhbmNoKGFsbG93ZWRCcmFuY2hlczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoXG4gICAgICAgIGBQdWxsIHJlcXVlc3QgaXMgc2V0IHRvIHdyb25nIGJhc2UgYnJhbmNoLiBQbGVhc2UgdXBkYXRlIHRoZSBQUiBpbiB0aGUgR2l0aHViIFVJIGAgK1xuICAgICAgICBgdG8gb25lIG9mIHRoZSBmb2xsb3dpbmcgYnJhbmNoZXM6ICR7YWxsb3dlZEJyYW5jaGVzLmpvaW4oJywgJyl9LmApO1xuICB9XG5cbiAgc3RhdGljIHVuc2F0aXNmaWVkQmFzZVNoYSgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoXG4gICAgICAgIGBQdWxsIHJlcXVlc3QgaGFzIG5vdCBiZWVuIHJlYmFzZWQgcmVjZW50bHkgYW5kIGNvdWxkIGJlIGJ5cGFzc2luZyBDSSBjaGVja3MuIGAgK1xuICAgICAgICBgUGxlYXNlIHJlYmFzZSB0aGUgUFIuYCk7XG4gIH1cblxuICBzdGF0aWMgbWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKFxuICAgICAgICBgQ291bGQgbm90IG1lcmdlIHB1bGwgcmVxdWVzdCBpbnRvIHRoZSBmb2xsb3dpbmcgYnJhbmNoZXMgZHVlIHRvIG1lcmdlIGAgK1xuICAgICAgICBgY29uZmxpY3RzOiAke1xuICAgICAgICAgICAgZmFpbGVkQnJhbmNoZXMuam9pbignLCAnKX0uIFBsZWFzZSByZWJhc2UgdGhlIFBSIG9yIHVwZGF0ZSB0aGUgdGFyZ2V0IGxhYmVsLmApO1xuICB9XG5cbiAgc3RhdGljIHVua25vd25NZXJnZUVycm9yKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgVW5rbm93biBtZXJnZSBlcnJvciBvY2N1cnJlZC4gUGxlYXNlIHNlZSBjb25zb2xlIG91dHB1dCBhYm92ZSBmb3IgZGVidWdnaW5nLmApO1xuICB9XG5cbiAgc3RhdGljIHVuYWJsZVRvRml4dXBDb21taXRNZXNzYWdlU3F1YXNoT25seSgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoXG4gICAgICAgIGBVbmFibGUgdG8gZml4dXAgY29tbWl0IG1lc3NhZ2Ugb2YgcHVsbCByZXF1ZXN0LiBDb21taXQgbWVzc2FnZSBjYW4gb25seSBiZSBgICtcbiAgICAgICAgYG1vZGlmaWVkIGlmIHRoZSBQUiBpcyBtZXJnZWQgdXNpbmcgc3F1YXNoLmApO1xuICB9XG5cbiAgc3RhdGljIG5vdEZvdW5kKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgUHVsbCByZXF1ZXN0IGNvdWxkIG5vdCBiZSBmb3VuZCB1cHN0cmVhbS5gKTtcbiAgfVxuXG4gIHN0YXRpYyBpbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoXG4gICAgICBtZXNzYWdlID0gYEluc3VmZmljaWVudCBHaXRodWIgQVBJIHBlcm1pc3Npb25zIHRvIG1lcmdlIHB1bGwgcmVxdWVzdC4gUGxlYXNlIGVuc3VyZSB0aGF0IGAgK1xuICAgICAgICAgIGB5b3VyIGF1dGggdG9rZW4gaGFzIHdyaXRlIGFjY2Vzcy5gKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UpO1xuICB9XG5cbiAgc3RhdGljIGhhc0JyZWFraW5nQ2hhbmdlcyhsYWJlbDogVGFyZ2V0TGFiZWwpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYENhbm5vdCBtZXJnZSBpbnRvIGJyYW5jaCBmb3IgXCIke2xhYmVsLnBhdHRlcm59XCIgYXMgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYCArXG4gICAgICAgIGBicmVha2luZyBjaGFuZ2VzLiBCcmVha2luZyBjaGFuZ2VzIGNhbiBvbmx5IGJlIG1lcmdlZCB3aXRoIHRoZSBcInRhcmdldDogbWFqb3JcIiBsYWJlbC5gO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxuXG4gIHN0YXRpYyBoYXNEZXByZWNhdGlvbnMobGFiZWw6IFRhcmdldExhYmVsKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGBDYW5ub3QgbWVyZ2UgaW50byBicmFuY2ggZm9yIFwiJHtsYWJlbC5wYXR0ZXJufVwiIGFzIHRoZSBwdWxsIHJlcXVlc3QgYCArXG4gICAgICAgIGBjb250YWlucyBkZXByZWNhdGlvbnMuIERlcHJlY2F0aW9ucyBjYW4gb25seSBiZSBtZXJnZWQgd2l0aCB0aGUgXCJ0YXJnZXQ6IG1pbm9yXCIgb3IgYCArXG4gICAgICAgIGBcInRhcmdldDogbWFqb3JcIiBsYWJlbC5gO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxuXG4gIHN0YXRpYyBoYXNGZWF0dXJlQ29tbWl0cyhsYWJlbDogVGFyZ2V0TGFiZWwpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYENhbm5vdCBtZXJnZSBpbnRvIGJyYW5jaCBmb3IgXCIke2xhYmVsLnBhdHRlcm59XCIgYXMgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYCArXG4gICAgICAgICdjb21taXRzIHdpdGggdGhlIFwiZmVhdFwiIHR5cGUuIE5ldyBmZWF0dXJlcyBjYW4gb25seSBiZSBtZXJnZWQgd2l0aCB0aGUgXCJ0YXJnZXQ6IG1pbm9yXCIgJyArXG4gICAgICAgICdvciBcInRhcmdldDogbWFqb3JcIiBsYWJlbC4nO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxuXG4gIHN0YXRpYyBtaXNzaW5nQnJlYWtpbmdDaGFuZ2VMYWJlbCgpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gJ1B1bGwgUmVxdWVzdCBoYXMgYXQgbGVhc3Qgb25lIGNvbW1pdCBjb250YWluaW5nIGEgYnJlYWtpbmcgY2hhbmdlIG5vdGUsIGJ1dCAnICtcbiAgICAgICAgJ2RvZXMgbm90IGhhdmUgYSBicmVha2luZyBjaGFuZ2UgbGFiZWwuJztcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cblxuICBzdGF0aWMgbWlzc2luZ0JyZWFraW5nQ2hhbmdlQ29tbWl0KCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSAnUHVsbCBSZXF1ZXN0IGhhcyBhIGJyZWFraW5nIGNoYW5nZSBsYWJlbCwgYnV0IGRvZXMgbm90IGNvbnRhaW4gYW55IGNvbW1pdHMgJyArXG4gICAgICAgICd3aXRoIGJyZWFraW5nIGNoYW5nZSBub3Rlcy4nO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxufVxuIl19