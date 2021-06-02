/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
export { PullRequestFailure };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFpbHVyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvZmFpbHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUg7Ozs7R0FJRztBQUNIO0lBQ0U7SUFDSSw2Q0FBNkM7SUFDdEMsT0FBZTtJQUN0QixvRUFBb0U7SUFDN0QsUUFBZ0I7UUFBaEIseUJBQUEsRUFBQSxnQkFBZ0I7UUFGaEIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUVmLGFBQVEsR0FBUixRQUFRLENBQVE7SUFBRyxDQUFDO0lBRXhCLDhCQUFXLEdBQWxCO1FBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFTSxnQ0FBYSxHQUFwQjtRQUNFLE9BQU8sSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLGdDQUFhLEdBQXBCO1FBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU0sZ0NBQWEsR0FBcEI7UUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVNLDBCQUFPLEdBQWQ7UUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVNLDJCQUFRLEdBQWY7UUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVNLDJCQUFRLEdBQWY7UUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVNLDBDQUF1QixHQUE5QixVQUErQixlQUF5QjtRQUN0RCxPQUFPLElBQUksSUFBSSxDQUNYLGtGQUFrRjthQUNsRix1Q0FBcUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBRyxDQUFBLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRU0scUNBQWtCLEdBQXpCO1FBQ0UsT0FBTyxJQUFJLElBQUksQ0FDWCwrRUFBK0U7WUFDL0UsdUJBQXVCLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0saUNBQWMsR0FBckIsVUFBc0IsY0FBd0I7UUFDNUMsT0FBTyxJQUFJLElBQUksQ0FDWCx3RUFBd0U7YUFDeEUsZ0JBQ0ksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdURBQW9ELENBQUEsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFTSxvQ0FBaUIsR0FBeEI7UUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDhFQUE4RSxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUVNLHVEQUFvQyxHQUEzQztRQUNFLE9BQU8sSUFBSSxJQUFJLENBQ1gsNkVBQTZFO1lBQzdFLDRDQUE0QyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVNLDJCQUFRLEdBQWY7UUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLDJDQUEyQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVNLGlEQUE4QixHQUFyQyxVQUNJLE9BQ3VDO1FBRHZDLHdCQUFBLEVBQUEsVUFBVSxnRkFBZ0Y7WUFDdEYsbUNBQW1DO1FBQ3pDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVNLHFDQUFrQixHQUF6QixVQUEwQixLQUFrQjtRQUMxQyxJQUFNLE9BQU8sR0FBRyxvQ0FBaUMsS0FBSyxDQUFDLE9BQU8sZ0NBQTRCO1lBQ3RGLHlGQUF1RixDQUFDO1FBQzVGLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVNLGtDQUFlLEdBQXRCLFVBQXVCLEtBQWtCO1FBQ3ZDLElBQU0sT0FBTyxHQUFHLG9DQUFpQyxLQUFLLENBQUMsT0FBTyw0QkFBd0I7WUFDbEYsdUZBQXFGO1lBQ3JGLDBCQUF3QixDQUFDO1FBQzdCLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVNLG9DQUFpQixHQUF4QixVQUF5QixLQUFrQjtRQUN6QyxJQUFNLE9BQU8sR0FBRyxvQ0FBaUMsS0FBSyxDQUFDLE9BQU8sZ0NBQTRCO1lBQ3RGLHlGQUF5RjtZQUN6RiwyQkFBMkIsQ0FBQztRQUNoQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFTSw2Q0FBMEIsR0FBakM7UUFDRSxJQUFNLE9BQU8sR0FBRyw4RUFBOEU7WUFDMUYsd0NBQXdDLENBQUM7UUFDN0MsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRU0sOENBQTJCLEdBQWxDO1FBQ0UsSUFBTSxPQUFPLEdBQUcsNkVBQTZFO1lBQ3pGLDZCQUE2QixDQUFDO1FBQ2xDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUNILHlCQUFDO0FBQUQsQ0FBQyxBQXpHRCxJQXlHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1RhcmdldExhYmVsfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBjYW4gYmUgdXNlZCB0byBkZXNjcmliZSBwdWxsIHJlcXVlc3QgZmFpbHVyZXMuIEEgZmFpbHVyZVxuICogaXMgZGVzY3JpYmVkIHRocm91Z2ggYSBodW1hbi1yZWFkYWJsZSBtZXNzYWdlIGFuZCBhIGZsYWcgaW5kaWNhdGluZ1xuICogd2hldGhlciBpdCBpcyBub24tZmF0YWwgb3Igbm90LlxuICovXG5leHBvcnQgY2xhc3MgUHVsbFJlcXVlc3RGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogSHVtYW4tcmVhZGFibGUgbWVzc2FnZSBmb3IgdGhlIGZhaWx1cmUgKi9cbiAgICAgIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICAvKiogV2hldGhlciB0aGUgZmFpbHVyZSBpcyBub24tZmF0YWwgYW5kIGNhbiBiZSBmb3JjaWJseSBpZ25vcmVkLiAqL1xuICAgICAgcHVibGljIG5vbkZhdGFsID0gZmFsc2UpIHt9XG5cbiAgc3RhdGljIGNsYVVuc2lnbmVkKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgQ0xBIGhhcyBub3QgYmVlbiBzaWduZWQuIFBsZWFzZSBtYWtlIHN1cmUgdGhlIFBSIGF1dGhvciBoYXMgc2lnbmVkIHRoZSBDTEEuYCk7XG4gIH1cblxuICBzdGF0aWMgZmFpbGluZ0NpSm9icygpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYEZhaWxpbmcgQ0kgam9icy5gLCB0cnVlKTtcbiAgfVxuXG4gIHN0YXRpYyBwZW5kaW5nQ2lKb2JzKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgUGVuZGluZyBDSSBqb2JzLmAsIHRydWUpO1xuICB9XG5cbiAgc3RhdGljIG5vdE1lcmdlUmVhZHkoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBOb3QgbWFya2VkIGFzIG1lcmdlIHJlYWR5LmApO1xuICB9XG5cbiAgc3RhdGljIGlzRHJhZnQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKCdQdWxsIHJlcXVlc3QgaXMgc3RpbGwgaW4gZHJhZnQuJyk7XG4gIH1cblxuICBzdGF0aWMgaXNDbG9zZWQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKCdQdWxsIHJlcXVlc3QgaXMgYWxyZWFkeSBjbG9zZWQuJyk7XG4gIH1cblxuICBzdGF0aWMgaXNNZXJnZWQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKCdQdWxsIHJlcXVlc3QgaXMgYWxyZWFkeSBtZXJnZWQuJyk7XG4gIH1cblxuICBzdGF0aWMgbWlzbWF0Y2hpbmdUYXJnZXRCcmFuY2goYWxsb3dlZEJyYW5jaGVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgICAgYFB1bGwgcmVxdWVzdCBpcyBzZXQgdG8gd3JvbmcgYmFzZSBicmFuY2guIFBsZWFzZSB1cGRhdGUgdGhlIFBSIGluIHRoZSBHaXRodWIgVUkgYCArXG4gICAgICAgIGB0byBvbmUgb2YgdGhlIGZvbGxvd2luZyBicmFuY2hlczogJHthbGxvd2VkQnJhbmNoZXMuam9pbignLCAnKX0uYCk7XG4gIH1cblxuICBzdGF0aWMgdW5zYXRpc2ZpZWRCYXNlU2hhKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgICAgYFB1bGwgcmVxdWVzdCBoYXMgbm90IGJlZW4gcmViYXNlZCByZWNlbnRseSBhbmQgY291bGQgYmUgYnlwYXNzaW5nIENJIGNoZWNrcy4gYCArXG4gICAgICAgIGBQbGVhc2UgcmViYXNlIHRoZSBQUi5gKTtcbiAgfVxuXG4gIHN0YXRpYyBtZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoXG4gICAgICAgIGBDb3VsZCBub3QgbWVyZ2UgcHVsbCByZXF1ZXN0IGludG8gdGhlIGZvbGxvd2luZyBicmFuY2hlcyBkdWUgdG8gbWVyZ2UgYCArXG4gICAgICAgIGBjb25mbGljdHM6ICR7XG4gICAgICAgICAgICBmYWlsZWRCcmFuY2hlcy5qb2luKCcsICcpfS4gUGxlYXNlIHJlYmFzZSB0aGUgUFIgb3IgdXBkYXRlIHRoZSB0YXJnZXQgbGFiZWwuYCk7XG4gIH1cblxuICBzdGF0aWMgdW5rbm93bk1lcmdlRXJyb3IoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBVbmtub3duIG1lcmdlIGVycm9yIG9jY3VycmVkLiBQbGVhc2Ugc2VlIGNvbnNvbGUgb3V0cHV0IGFib3ZlIGZvciBkZWJ1Z2dpbmcuYCk7XG4gIH1cblxuICBzdGF0aWMgdW5hYmxlVG9GaXh1cENvbW1pdE1lc3NhZ2VTcXVhc2hPbmx5KCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgICAgYFVuYWJsZSB0byBmaXh1cCBjb21taXQgbWVzc2FnZSBvZiBwdWxsIHJlcXVlc3QuIENvbW1pdCBtZXNzYWdlIGNhbiBvbmx5IGJlIGAgK1xuICAgICAgICBgbW9kaWZpZWQgaWYgdGhlIFBSIGlzIG1lcmdlZCB1c2luZyBzcXVhc2guYCk7XG4gIH1cblxuICBzdGF0aWMgbm90Rm91bmQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBQdWxsIHJlcXVlc3QgY291bGQgbm90IGJlIGZvdW5kIHVwc3RyZWFtLmApO1xuICB9XG5cbiAgc3RhdGljIGluc3VmZmljaWVudFBlcm1pc3Npb25zVG9NZXJnZShcbiAgICAgIG1lc3NhZ2UgPSBgSW5zdWZmaWNpZW50IEdpdGh1YiBBUEkgcGVybWlzc2lvbnMgdG8gbWVyZ2UgcHVsbCByZXF1ZXN0LiBQbGVhc2UgZW5zdXJlIHRoYXQgYCArXG4gICAgICAgICAgYHlvdXIgYXV0aCB0b2tlbiBoYXMgd3JpdGUgYWNjZXNzLmApIHtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cblxuICBzdGF0aWMgaGFzQnJlYWtpbmdDaGFuZ2VzKGxhYmVsOiBUYXJnZXRMYWJlbCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBgQ2Fubm90IG1lcmdlIGludG8gYnJhbmNoIGZvciBcIiR7bGFiZWwucGF0dGVybn1cIiBhcyB0aGUgcHVsbCByZXF1ZXN0IGhhcyBgICtcbiAgICAgICAgYGJyZWFraW5nIGNoYW5nZXMuIEJyZWFraW5nIGNoYW5nZXMgY2FuIG9ubHkgYmUgbWVyZ2VkIHdpdGggdGhlIFwidGFyZ2V0OiBtYWpvclwiIGxhYmVsLmA7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UpO1xuICB9XG5cbiAgc3RhdGljIGhhc0RlcHJlY2F0aW9ucyhsYWJlbDogVGFyZ2V0TGFiZWwpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYENhbm5vdCBtZXJnZSBpbnRvIGJyYW5jaCBmb3IgXCIke2xhYmVsLnBhdHRlcm59XCIgYXMgdGhlIHB1bGwgcmVxdWVzdCBgICtcbiAgICAgICAgYGNvbnRhaW5zIGRlcHJlY2F0aW9ucy4gRGVwcmVjYXRpb25zIGNhbiBvbmx5IGJlIG1lcmdlZCB3aXRoIHRoZSBcInRhcmdldDogbWlub3JcIiBvciBgICtcbiAgICAgICAgYFwidGFyZ2V0OiBtYWpvclwiIGxhYmVsLmA7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UpO1xuICB9XG5cbiAgc3RhdGljIGhhc0ZlYXR1cmVDb21taXRzKGxhYmVsOiBUYXJnZXRMYWJlbCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBgQ2Fubm90IG1lcmdlIGludG8gYnJhbmNoIGZvciBcIiR7bGFiZWwucGF0dGVybn1cIiBhcyB0aGUgcHVsbCByZXF1ZXN0IGhhcyBgICtcbiAgICAgICAgJ2NvbW1pdHMgd2l0aCB0aGUgXCJmZWF0XCIgdHlwZS4gTmV3IGZlYXR1cmVzIGNhbiBvbmx5IGJlIG1lcmdlZCB3aXRoIHRoZSBcInRhcmdldDogbWlub3JcIiAnICtcbiAgICAgICAgJ29yIFwidGFyZ2V0OiBtYWpvclwiIGxhYmVsLic7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UpO1xuICB9XG5cbiAgc3RhdGljIG1pc3NpbmdCcmVha2luZ0NoYW5nZUxhYmVsKCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSAnUHVsbCBSZXF1ZXN0IGhhcyBhdCBsZWFzdCBvbmUgY29tbWl0IGNvbnRhaW5pbmcgYSBicmVha2luZyBjaGFuZ2Ugbm90ZSwgYnV0ICcgK1xuICAgICAgICAnZG9lcyBub3QgaGF2ZSBhIGJyZWFraW5nIGNoYW5nZSBsYWJlbC4nO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxuXG4gIHN0YXRpYyBtaXNzaW5nQnJlYWtpbmdDaGFuZ2VDb21taXQoKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9ICdQdWxsIFJlcXVlc3QgaGFzIGEgYnJlYWtpbmcgY2hhbmdlIGxhYmVsLCBidXQgZG9lcyBub3QgY29udGFpbiBhbnkgY29tbWl0cyAnICtcbiAgICAgICAgJ3dpdGggYnJlYWtpbmcgY2hhbmdlIG5vdGVzLic7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UpO1xuICB9XG59XG4iXX0=