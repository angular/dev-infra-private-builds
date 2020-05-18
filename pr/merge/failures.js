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
        PullRequestFailure.noTargetLabel = function () {
            return new this("No target branch could be determined. Please ensure a target label is set.");
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
        PullRequestFailure.insufficientPermissionsToMerge = function () {
            return new this("Insufficient Github API permissions to merge pull request. Please " +
                "ensure that your auth token has write access.");
        };
        return PullRequestFailure;
    }());
    exports.PullRequestFailure = PullRequestFailure;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFpbHVyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvZmFpbHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSDs7OztPQUlHO0lBQ0g7UUFDRTtRQUNJLDZDQUE2QztRQUN0QyxPQUFlO1FBQ3RCLG9FQUFvRTtRQUM3RCxRQUFnQjtZQUFoQix5QkFBQSxFQUFBLGdCQUFnQjtZQUZoQixZQUFPLEdBQVAsT0FBTyxDQUFRO1lBRWYsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFHLENBQUM7UUFFeEIsOEJBQVcsR0FBbEI7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDZFQUE2RSxDQUFDLENBQUM7UUFDakcsQ0FBQztRQUVNLGdDQUFhLEdBQXBCO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRU0sZ0NBQWEsR0FBcEI7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFTSxnQ0FBYSxHQUFwQjtZQUNFLE9BQU8sSUFBSSxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRU0sZ0NBQWEsR0FBcEI7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDRFQUE0RSxDQUFDLENBQUM7UUFDaEcsQ0FBQztRQUVNLDBDQUF1QixHQUE5QixVQUErQixlQUF5QjtZQUN0RCxPQUFPLElBQUksSUFBSSxDQUNYLGtGQUFrRjtpQkFDbEYsdUNBQXFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQUcsQ0FBQSxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUVNLHFDQUFrQixHQUF6QjtZQUNFLE9BQU8sSUFBSSxJQUFJLENBQ1gsK0VBQStFO2dCQUMvRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTSxpQ0FBYyxHQUFyQixVQUFzQixjQUF3QjtZQUM1QyxPQUFPLElBQUksSUFBSSxDQUNYLHdFQUF3RTtpQkFDeEUsZ0JBQ0ksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdURBQW9ELENBQUEsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFFTSxvQ0FBaUIsR0FBeEI7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDhFQUE4RSxDQUFDLENBQUM7UUFDbEcsQ0FBQztRQUVNLHVEQUFvQyxHQUEzQztZQUNFLE9BQU8sSUFBSSxJQUFJLENBQ1gsNkVBQTZFO2dCQUM3RSw0Q0FBNEMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFTSwyQkFBUSxHQUFmO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFTSxpREFBOEIsR0FBckM7WUFDRSxPQUFPLElBQUksSUFBSSxDQUNYLG9FQUFvRTtnQkFDcEUsK0NBQStDLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBQ0gseUJBQUM7SUFBRCxDQUFDLEFBakVELElBaUVDO0lBakVZLGdEQUFrQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIENsYXNzIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGVzY3JpYmUgcHVsbCByZXF1ZXN0IGZhaWx1cmVzLiBBIGZhaWx1cmVcbiAqIGlzIGRlc2NyaWJlZCB0aHJvdWdoIGEgaHVtYW4tcmVhZGFibGUgbWVzc2FnZSBhbmQgYSBmbGFnIGluZGljYXRpbmdcbiAqIHdoZXRoZXIgaXQgaXMgbm9uLWZhdGFsIG9yIG5vdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxSZXF1ZXN0RmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIEh1bWFuLXJlYWRhYmxlIG1lc3NhZ2UgZm9yIHRoZSBmYWlsdXJlICovXG4gICAgICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nLFxuICAgICAgLyoqIFdoZXRoZXIgdGhlIGZhaWx1cmUgaXMgbm9uLWZhdGFsIGFuZCBjYW4gYmUgZm9yY2libHkgaWdub3JlZC4gKi9cbiAgICAgIHB1YmxpYyBub25GYXRhbCA9IGZhbHNlKSB7fVxuXG4gIHN0YXRpYyBjbGFVbnNpZ25lZCgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYENMQSBoYXMgbm90IGJlZW4gc2lnbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHRoZSBQUiBhdXRob3IgaGFzIHNpZ25lZCB0aGUgQ0xBLmApO1xuICB9XG5cbiAgc3RhdGljIGZhaWxpbmdDaUpvYnMoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBGYWlsaW5nIENJIGpvYnMuYCwgdHJ1ZSk7XG4gIH1cblxuICBzdGF0aWMgcGVuZGluZ0NpSm9icygpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYFBlbmRpbmcgQ0kgam9icy5gLCB0cnVlKTtcbiAgfVxuXG4gIHN0YXRpYyBub3RNZXJnZVJlYWR5KCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgTm90IG1hcmtlZCBhcyBtZXJnZSByZWFkeS5gKTtcbiAgfVxuXG4gIHN0YXRpYyBub1RhcmdldExhYmVsKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgTm8gdGFyZ2V0IGJyYW5jaCBjb3VsZCBiZSBkZXRlcm1pbmVkLiBQbGVhc2UgZW5zdXJlIGEgdGFyZ2V0IGxhYmVsIGlzIHNldC5gKTtcbiAgfVxuXG4gIHN0YXRpYyBtaXNtYXRjaGluZ1RhcmdldEJyYW5jaChhbGxvd2VkQnJhbmNoZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKFxuICAgICAgICBgUHVsbCByZXF1ZXN0IGlzIHNldCB0byB3cm9uZyBiYXNlIGJyYW5jaC4gUGxlYXNlIHVwZGF0ZSB0aGUgUFIgaW4gdGhlIEdpdGh1YiBVSSBgICtcbiAgICAgICAgYHRvIG9uZSBvZiB0aGUgZm9sbG93aW5nIGJyYW5jaGVzOiAke2FsbG93ZWRCcmFuY2hlcy5qb2luKCcsICcpfS5gKTtcbiAgfVxuXG4gIHN0YXRpYyB1bnNhdGlzZmllZEJhc2VTaGEoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKFxuICAgICAgICBgUHVsbCByZXF1ZXN0IGhhcyBub3QgYmVlbiByZWJhc2VkIHJlY2VudGx5IGFuZCBjb3VsZCBiZSBieXBhc3NpbmcgQ0kgY2hlY2tzLiBgICtcbiAgICAgICAgYFBsZWFzZSByZWJhc2UgdGhlIFBSLmApO1xuICB9XG5cbiAgc3RhdGljIG1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgICAgYENvdWxkIG5vdCBtZXJnZSBwdWxsIHJlcXVlc3QgaW50byB0aGUgZm9sbG93aW5nIGJyYW5jaGVzIGR1ZSB0byBtZXJnZSBgICtcbiAgICAgICAgYGNvbmZsaWN0czogJHtcbiAgICAgICAgICAgIGZhaWxlZEJyYW5jaGVzLmpvaW4oJywgJyl9LiBQbGVhc2UgcmViYXNlIHRoZSBQUiBvciB1cGRhdGUgdGhlIHRhcmdldCBsYWJlbC5gKTtcbiAgfVxuXG4gIHN0YXRpYyB1bmtub3duTWVyZ2VFcnJvcigpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYFVua25vd24gbWVyZ2UgZXJyb3Igb2NjdXJyZWQuIFBsZWFzZSBzZWUgY29uc29sZSBvdXRwdXQgYWJvdmUgZm9yIGRlYnVnZ2luZy5gKTtcbiAgfVxuXG4gIHN0YXRpYyB1bmFibGVUb0ZpeHVwQ29tbWl0TWVzc2FnZVNxdWFzaE9ubHkoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKFxuICAgICAgICBgVW5hYmxlIHRvIGZpeHVwIGNvbW1pdCBtZXNzYWdlIG9mIHB1bGwgcmVxdWVzdC4gQ29tbWl0IG1lc3NhZ2UgY2FuIG9ubHkgYmUgYCArXG4gICAgICAgIGBtb2RpZmllZCBpZiB0aGUgUFIgaXMgbWVyZ2VkIHVzaW5nIHNxdWFzaC5gKTtcbiAgfVxuXG4gIHN0YXRpYyBub3RGb3VuZCgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYFB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQgdXBzdHJlYW0uYCk7XG4gIH1cblxuICBzdGF0aWMgaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgICAgYEluc3VmZmljaWVudCBHaXRodWIgQVBJIHBlcm1pc3Npb25zIHRvIG1lcmdlIHB1bGwgcmVxdWVzdC4gUGxlYXNlIGAgK1xuICAgICAgICBgZW5zdXJlIHRoYXQgeW91ciBhdXRoIHRva2VuIGhhcyB3cml0ZSBhY2Nlc3MuYCk7XG4gIH1cbn1cbiJdfQ==