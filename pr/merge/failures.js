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
        PullRequestFailure.insufficientPermissionsToMerge = function (message) {
            if (message === void 0) { message = "Insufficient Github API permissions to merge pull request. Please ensure that " +
                "your auth token has write access."; }
            return new this(message);
        };
        return PullRequestFailure;
    }());
    exports.PullRequestFailure = PullRequestFailure;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFpbHVyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvZmFpbHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUg7Ozs7T0FJRztJQUNIO1FBQ0U7UUFDSSw2Q0FBNkM7UUFDdEMsT0FBZTtRQUN0QixvRUFBb0U7UUFDN0QsUUFBZ0I7WUFBaEIseUJBQUEsRUFBQSxnQkFBZ0I7WUFGaEIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUVmLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBRyxDQUFDO1FBRXhCLDhCQUFXLEdBQWxCO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7UUFFTSxnQ0FBYSxHQUFwQjtZQUNFLE9BQU8sSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVNLGdDQUFhLEdBQXBCO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRU0sZ0NBQWEsR0FBcEI7WUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVNLGdDQUFhLEdBQXBCO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFTSwwQ0FBdUIsR0FBOUIsVUFBK0IsZUFBeUI7WUFDdEQsT0FBTyxJQUFJLElBQUksQ0FDWCxrRkFBa0Y7aUJBQ2xGLHVDQUFxQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFHLENBQUEsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFTSxxQ0FBa0IsR0FBekI7WUFDRSxPQUFPLElBQUksSUFBSSxDQUNYLCtFQUErRTtnQkFDL0UsdUJBQXVCLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRU0saUNBQWMsR0FBckIsVUFBc0IsY0FBd0I7WUFDNUMsT0FBTyxJQUFJLElBQUksQ0FDWCx3RUFBd0U7aUJBQ3hFLGdCQUNJLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVEQUFvRCxDQUFBLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBRU0sb0NBQWlCLEdBQXhCO1lBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyw4RUFBOEUsQ0FBQyxDQUFDO1FBQ2xHLENBQUM7UUFFTSx1REFBb0MsR0FBM0M7WUFDRSxPQUFPLElBQUksSUFBSSxDQUNYLDZFQUE2RTtnQkFDN0UsNENBQTRDLENBQUMsQ0FBQztRQUNwRCxDQUFDO1FBRU0sMkJBQVEsR0FBZjtZQUNFLE9BQU8sSUFBSSxJQUFJLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRU0saURBQThCLEdBQXJDLFVBQ0ksT0FDdUM7WUFEdkMsd0JBQUEsRUFBQSxVQUFVLGdGQUFnRjtnQkFDdEYsbUNBQW1DO1lBQ3pDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQWpFRCxJQWlFQztJQWpFWSxnREFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBDbGFzcyB0aGF0IGNhbiBiZSB1c2VkIHRvIGRlc2NyaWJlIHB1bGwgcmVxdWVzdCBmYWlsdXJlcy4gQSBmYWlsdXJlXG4gKiBpcyBkZXNjcmliZWQgdGhyb3VnaCBhIGh1bWFuLXJlYWRhYmxlIG1lc3NhZ2UgYW5kIGEgZmxhZyBpbmRpY2F0aW5nXG4gKiB3aGV0aGVyIGl0IGlzIG5vbi1mYXRhbCBvciBub3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsUmVxdWVzdEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBIdW1hbi1yZWFkYWJsZSBtZXNzYWdlIGZvciB0aGUgZmFpbHVyZSAqL1xuICAgICAgcHVibGljIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAgIC8qKiBXaGV0aGVyIHRoZSBmYWlsdXJlIGlzIG5vbi1mYXRhbCBhbmQgY2FuIGJlIGZvcmNpYmx5IGlnbm9yZWQuICovXG4gICAgICBwdWJsaWMgbm9uRmF0YWwgPSBmYWxzZSkge31cblxuICBzdGF0aWMgY2xhVW5zaWduZWQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBDTEEgaGFzIG5vdCBiZWVuIHNpZ25lZC4gUGxlYXNlIG1ha2Ugc3VyZSB0aGUgUFIgYXV0aG9yIGhhcyBzaWduZWQgdGhlIENMQS5gKTtcbiAgfVxuXG4gIHN0YXRpYyBmYWlsaW5nQ2lKb2JzKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgRmFpbGluZyBDSSBqb2JzLmAsIHRydWUpO1xuICB9XG5cbiAgc3RhdGljIHBlbmRpbmdDaUpvYnMoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBQZW5kaW5nIENJIGpvYnMuYCwgdHJ1ZSk7XG4gIH1cblxuICBzdGF0aWMgbm90TWVyZ2VSZWFkeSgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYE5vdCBtYXJrZWQgYXMgbWVyZ2UgcmVhZHkuYCk7XG4gIH1cblxuICBzdGF0aWMgbm9UYXJnZXRMYWJlbCgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYE5vIHRhcmdldCBicmFuY2ggY291bGQgYmUgZGV0ZXJtaW5lZC4gUGxlYXNlIGVuc3VyZSBhIHRhcmdldCBsYWJlbCBpcyBzZXQuYCk7XG4gIH1cblxuICBzdGF0aWMgbWlzbWF0Y2hpbmdUYXJnZXRCcmFuY2goYWxsb3dlZEJyYW5jaGVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgICAgYFB1bGwgcmVxdWVzdCBpcyBzZXQgdG8gd3JvbmcgYmFzZSBicmFuY2guIFBsZWFzZSB1cGRhdGUgdGhlIFBSIGluIHRoZSBHaXRodWIgVUkgYCArXG4gICAgICAgIGB0byBvbmUgb2YgdGhlIGZvbGxvd2luZyBicmFuY2hlczogJHthbGxvd2VkQnJhbmNoZXMuam9pbignLCAnKX0uYCk7XG4gIH1cblxuICBzdGF0aWMgdW5zYXRpc2ZpZWRCYXNlU2hhKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgICAgYFB1bGwgcmVxdWVzdCBoYXMgbm90IGJlZW4gcmViYXNlZCByZWNlbnRseSBhbmQgY291bGQgYmUgYnlwYXNzaW5nIENJIGNoZWNrcy4gYCArXG4gICAgICAgIGBQbGVhc2UgcmViYXNlIHRoZSBQUi5gKTtcbiAgfVxuXG4gIHN0YXRpYyBtZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoXG4gICAgICAgIGBDb3VsZCBub3QgbWVyZ2UgcHVsbCByZXF1ZXN0IGludG8gdGhlIGZvbGxvd2luZyBicmFuY2hlcyBkdWUgdG8gbWVyZ2UgYCArXG4gICAgICAgIGBjb25mbGljdHM6ICR7XG4gICAgICAgICAgICBmYWlsZWRCcmFuY2hlcy5qb2luKCcsICcpfS4gUGxlYXNlIHJlYmFzZSB0aGUgUFIgb3IgdXBkYXRlIHRoZSB0YXJnZXQgbGFiZWwuYCk7XG4gIH1cblxuICBzdGF0aWMgdW5rbm93bk1lcmdlRXJyb3IoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBVbmtub3duIG1lcmdlIGVycm9yIG9jY3VycmVkLiBQbGVhc2Ugc2VlIGNvbnNvbGUgb3V0cHV0IGFib3ZlIGZvciBkZWJ1Z2dpbmcuYCk7XG4gIH1cblxuICBzdGF0aWMgdW5hYmxlVG9GaXh1cENvbW1pdE1lc3NhZ2VTcXVhc2hPbmx5KCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgICAgYFVuYWJsZSB0byBmaXh1cCBjb21taXQgbWVzc2FnZSBvZiBwdWxsIHJlcXVlc3QuIENvbW1pdCBtZXNzYWdlIGNhbiBvbmx5IGJlIGAgK1xuICAgICAgICBgbW9kaWZpZWQgaWYgdGhlIFBSIGlzIG1lcmdlZCB1c2luZyBzcXVhc2guYCk7XG4gIH1cblxuICBzdGF0aWMgbm90Rm91bmQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBQdWxsIHJlcXVlc3QgY291bGQgbm90IGJlIGZvdW5kIHVwc3RyZWFtLmApO1xuICB9XG5cbiAgc3RhdGljIGluc3VmZmljaWVudFBlcm1pc3Npb25zVG9NZXJnZShcbiAgICAgIG1lc3NhZ2UgPSBgSW5zdWZmaWNpZW50IEdpdGh1YiBBUEkgcGVybWlzc2lvbnMgdG8gbWVyZ2UgcHVsbCByZXF1ZXN0LiBQbGVhc2UgZW5zdXJlIHRoYXQgYCArXG4gICAgICAgICAgYHlvdXIgYXV0aCB0b2tlbiBoYXMgd3JpdGUgYWNjZXNzLmApIHtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cbn1cbiJdfQ==