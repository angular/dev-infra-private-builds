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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFpbHVyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvZmFpbHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUg7Ozs7T0FJRztJQUNIO1FBQ0U7UUFDSSw2Q0FBNkM7UUFDdEMsT0FBZTtRQUN0QixvRUFBb0U7UUFDN0QsUUFBZ0I7WUFBaEIseUJBQUEsRUFBQSxnQkFBZ0I7WUFGaEIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUVmLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBRyxDQUFDO1FBRXhCLDhCQUFXLEdBQWxCO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7UUFFTSxnQ0FBYSxHQUFwQjtZQUNFLE9BQU8sSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLGdDQUFhLEdBQXBCO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRU0sZ0NBQWEsR0FBcEI7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVNLDBCQUFPLEdBQWQ7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLDJCQUFRLEdBQWY7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLDJCQUFRLEdBQWY7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLDBDQUF1QixHQUE5QixVQUErQixlQUF5QjtZQUN0RCxPQUFPLElBQUksSUFBSSxDQUNYLGtGQUFrRjtpQkFDbEYsdUNBQXFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQUcsQ0FBQSxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVNLHFDQUFrQixHQUF6QjtZQUNFLE9BQU8sSUFBSSxJQUFJLENBQ1gsK0VBQStFO2dCQUMvRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTSxpQ0FBYyxHQUFyQixVQUFzQixjQUF3QjtZQUM1QyxPQUFPLElBQUksSUFBSSxDQUNYLHdFQUF3RTtpQkFDeEUsZ0JBQ0ksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdURBQW9ELENBQUEsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFFTSxvQ0FBaUIsR0FBeEI7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDhFQUE4RSxDQUFDLENBQUM7UUFDbEcsQ0FBQztRQUVNLHVEQUFvQyxHQUEzQztZQUNFLE9BQU8sSUFBSSxJQUFJLENBQ1gsNkVBQTZFO2dCQUM3RSw0Q0FBNEMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFTSwyQkFBUSxHQUFmO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFTSxpREFBOEIsR0FBckMsVUFDSSxPQUN1QztZQUR2Qyx3QkFBQSxFQUFBLFVBQVUsZ0ZBQWdGO2dCQUN0RixtQ0FBbUM7WUFDekMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRU0scUNBQWtCLEdBQXpCLFVBQTBCLEtBQWtCO1lBQzFDLElBQU0sT0FBTyxHQUFHLG9DQUFpQyxLQUFLLENBQUMsT0FBTyxnQ0FBNEI7Z0JBQ3RGLHlGQUF1RixDQUFDO1lBQzVGLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVNLG9DQUFpQixHQUF4QixVQUF5QixLQUFrQjtZQUN6QyxJQUFNLE9BQU8sR0FBRyxvQ0FBaUMsS0FBSyxDQUFDLE9BQU8sZ0NBQTRCO2dCQUN0Rix5RkFBeUY7Z0JBQ3pGLDJCQUEyQixDQUFDO1lBQ2hDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUVNLDZDQUEwQixHQUFqQztZQUNFLElBQU0sT0FBTyxHQUFHLDhFQUE4RTtnQkFDMUYsd0NBQXdDLENBQUM7WUFDN0MsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRU0sOENBQTJCLEdBQWxDO1lBQ0UsSUFBTSxPQUFPLEdBQUcsNkVBQTZFO2dCQUN6Riw2QkFBNkIsQ0FBQztZQUNsQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFDSCx5QkFBQztJQUFELENBQUMsQUFsR0QsSUFrR0M7SUFsR1ksZ0RBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VGFyZ2V0TGFiZWx9IGZyb20gJy4vY29uZmlnJztcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGNhbiBiZSB1c2VkIHRvIGRlc2NyaWJlIHB1bGwgcmVxdWVzdCBmYWlsdXJlcy4gQSBmYWlsdXJlXG4gKiBpcyBkZXNjcmliZWQgdGhyb3VnaCBhIGh1bWFuLXJlYWRhYmxlIG1lc3NhZ2UgYW5kIGEgZmxhZyBpbmRpY2F0aW5nXG4gKiB3aGV0aGVyIGl0IGlzIG5vbi1mYXRhbCBvciBub3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsUmVxdWVzdEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBIdW1hbi1yZWFkYWJsZSBtZXNzYWdlIGZvciB0aGUgZmFpbHVyZSAqL1xuICAgICAgcHVibGljIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgIC8qKiBXaGV0aGVyIHRoZSBmYWlsdXJlIGlzIG5vbi1mYXRhbCBhbmQgY2FuIGJlIGZvcmNpYmx5IGlnbm9yZWQuICovXG4gICAgICBwdWJsaWMgbm9uRmF0YWwgPSBmYWxzZSkge31cblxuICBzdGF0aWMgY2xhVW5zaWduZWQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBDTEEgaGFzIG5vdCBiZWVuIHNpZ25lZC4gUGxlYXNlIG1ha2Ugc3VyZSB0aGUgUFIgYXV0aG9yIGhhcyBzaWduZWQgdGhlIENMQS5gKTtcbiAgfVxuXG4gIHN0YXRpYyBmYWlsaW5nQ2lKb2JzKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgRmFpbGluZyBDSSBqb2JzLmAsIHRydWUpO1xuICB9XG5cbiAgc3RhdGljIHBlbmRpbmdDaUpvYnMoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBQZW5kaW5nIENJIGpvYnMuYCwgdHJ1ZSk7XG4gIH1cblxuICBzdGF0aWMgbm90TWVyZ2VSZWFkeSgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYE5vdCBtYXJrZWQgYXMgbWVyZ2UgcmVhZHkuYCk7XG4gIH1cblxuICBzdGF0aWMgaXNEcmFmdCgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoJ1B1bGwgcmVxdWVzdCBpcyBzdGlsbCBpbiBkcmFmdC4nKTtcbiAgfVxuXG4gIHN0YXRpYyBpc0Nsb3NlZCgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoJ1B1bGwgcmVxdWVzdCBpcyBhbHJlYWR5IGNsb3NlZC4nKTtcbiAgfVxuXG4gIHN0YXRpYyBpc01lcmdlZCgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoJ1B1bGwgcmVxdWVzdCBpcyBhbHJlYWR5IG1lcmdlZC4nKTtcbiAgfVxuXG4gIHN0YXRpYyBtaXNtYXRjaGluZ1RhcmdldEJyYW5jaChhbGxvd2VkQnJhbmNoZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKFxuICAgICAgICBgUHVsbCByZXF1ZXN0IGlzIHNldCB0byB3cm9uZyBiYXNlIGJyYW5jaC4gUGxlYXNlIHVwZGF0ZSB0aGUgUFIgaW4gdGhlIEdpdGh1YiBVSSBgICtcbiAgICAgICAgYHRvIG9uZSBvZiB0aGUgZm9sbG93aW5nIGJyYW5jaGVzOiAke2FsbG93ZWRCcmFuY2hlcy5qb2luKCcsICcpfS5gKTtcbiAgfVxuXG4gIHN0YXRpYyB1bnNhdGlzZmllZEJhc2VTaGEoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKFxuICAgICAgICBgUHVsbCByZXF1ZXN0IGhhcyBub3QgYmVlbiByZWJhc2VkIHJlY2VudGx5IGFuZCBjb3VsZCBiZSBieXBhc3NpbmcgQ0kgY2hlY2tzLiBgICtcbiAgICAgICAgYFBsZWFzZSByZWJhc2UgdGhlIFBSLmApO1xuICB9XG5cbiAgc3RhdGljIG1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgICAgYENvdWxkIG5vdCBtZXJnZSBwdWxsIHJlcXVlc3QgaW50byB0aGUgZm9sbG93aW5nIGJyYW5jaGVzIGR1ZSB0byBtZXJnZSBgICtcbiAgICAgICAgYGNvbmZsaWN0czogJHtcbiAgICAgICAgICAgIGZhaWxlZEJyYW5jaGVzLmpvaW4oJywgJyl9LiBQbGVhc2UgcmViYXNlIHRoZSBQUiBvciB1cGRhdGUgdGhlIHRhcmdldCBsYWJlbC5gKTtcbiAgfVxuXG4gIHN0YXRpYyB1bmtub3duTWVyZ2VFcnJvcigpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYFVua25vd24gbWVyZ2UgZXJyb3Igb2NjdXJyZWQuIFBsZWFzZSBzZWUgY29uc29sZSBvdXRwdXQgYWJvdmUgZm9yIGRlYnVnZ2luZy5gKTtcbiAgfVxuXG4gIHN0YXRpYyB1bmFibGVUb0ZpeHVwQ29tbWl0TWVzc2FnZVNxdWFzaE9ubHkoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKFxuICAgICAgICBgVW5hYmxlIHRvIGZpeHVwIGNvbW1pdCBtZXNzYWdlIG9mIHB1bGwgcmVxdWVzdC4gQ29tbWl0IG1lc3NhZ2UgY2FuIG9ubHkgYmUgYCArXG4gICAgICAgIGBtb2RpZmllZCBpZiB0aGUgUFIgaXMgbWVyZ2VkIHVzaW5nIHNxdWFzaC5gKTtcbiAgfVxuXG4gIHN0YXRpYyBub3RGb3VuZCgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYFB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQgdXBzdHJlYW0uYCk7XG4gIH1cblxuICBzdGF0aWMgaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKFxuICAgICAgbWVzc2FnZSA9IGBJbnN1ZmZpY2llbnQgR2l0aHViIEFQSSBwZXJtaXNzaW9ucyB0byBtZXJnZSBwdWxsIHJlcXVlc3QuIFBsZWFzZSBlbnN1cmUgdGhhdCBgICtcbiAgICAgICAgICBgeW91ciBhdXRoIHRva2VuIGhhcyB3cml0ZSBhY2Nlc3MuYCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxuXG4gIHN0YXRpYyBoYXNCcmVha2luZ0NoYW5nZXMobGFiZWw6IFRhcmdldExhYmVsKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGBDYW5ub3QgbWVyZ2UgaW50byBicmFuY2ggZm9yIFwiJHtsYWJlbC5wYXR0ZXJufVwiIGFzIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGAgK1xuICAgICAgICBgYnJlYWtpbmcgY2hhbmdlcy4gQnJlYWtpbmcgY2hhbmdlcyBjYW4gb25seSBiZSBtZXJnZWQgd2l0aCB0aGUgXCJ0YXJnZXQ6IG1ham9yXCIgbGFiZWwuYDtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cblxuICBzdGF0aWMgaGFzRmVhdHVyZUNvbW1pdHMobGFiZWw6IFRhcmdldExhYmVsKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGBDYW5ub3QgbWVyZ2UgaW50byBicmFuY2ggZm9yIFwiJHtsYWJlbC5wYXR0ZXJufVwiIGFzIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGAgK1xuICAgICAgICAnY29tbWl0cyB3aXRoIHRoZSBcImZlYXRcIiB0eXBlLiBOZXcgZmVhdHVyZXMgY2FuIG9ubHkgYmUgbWVyZ2VkIHdpdGggdGhlIFwidGFyZ2V0OiBtaW5vclwiICcgK1xuICAgICAgICAnb3IgXCJ0YXJnZXQ6IG1ham9yXCIgbGFiZWwuJztcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cblxuICBzdGF0aWMgbWlzc2luZ0JyZWFraW5nQ2hhbmdlTGFiZWwoKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9ICdQdWxsIFJlcXVlc3QgaGFzIGF0IGxlYXN0IG9uZSBjb21taXQgY29udGFpbmluZyBhIGJyZWFraW5nIGNoYW5nZSBub3RlLCBidXQgJyArXG4gICAgICAgICdkb2VzIG5vdCBoYXZlIGEgYnJlYWtpbmcgY2hhbmdlIGxhYmVsLic7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UpO1xuICB9XG5cbiAgc3RhdGljIG1pc3NpbmdCcmVha2luZ0NoYW5nZUNvbW1pdCgpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gJ1B1bGwgUmVxdWVzdCBoYXMgYSBicmVha2luZyBjaGFuZ2UgbGFiZWwsIGJ1dCBkb2VzIG5vdCBjb250YWluIGFueSBjb21taXRzICcgK1xuICAgICAgICAnd2l0aCBicmVha2luZyBjaGFuZ2Ugbm90ZXMuJztcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cbn1cbiJdfQ==