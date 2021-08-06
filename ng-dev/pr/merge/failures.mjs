"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestFailure = void 0;
/**
 * Class that can be used to describe pull request failures. A failure
 * is described through a human-readable message and a flag indicating
 * whether it is non-fatal or not.
 */
class PullRequestFailure {
    constructor(
    /** Human-readable message for the failure */
    message, 
    /** Whether the failure is non-fatal and can be forcibly ignored. */
    nonFatal = false) {
        this.message = message;
        this.nonFatal = nonFatal;
    }
    static claUnsigned() {
        return new this(`CLA has not been signed. Please make sure the PR author has signed the CLA.`);
    }
    static failingCiJobs() {
        return new this(`Failing CI jobs.`, true);
    }
    static pendingCiJobs() {
        return new this(`Pending CI jobs.`, true);
    }
    static notMergeReady() {
        return new this(`Not marked as merge ready.`);
    }
    static isDraft() {
        return new this('Pull request is still in draft.');
    }
    static isClosed() {
        return new this('Pull request is already closed.');
    }
    static isMerged() {
        return new this('Pull request is already merged.');
    }
    static mismatchingTargetBranch(allowedBranches) {
        return new this(`Pull request is set to wrong base branch. Please update the PR in the Github UI ` +
            `to one of the following branches: ${allowedBranches.join(', ')}.`);
    }
    static unsatisfiedBaseSha() {
        return new this(`Pull request has not been rebased recently and could be bypassing CI checks. ` +
            `Please rebase the PR.`);
    }
    static mergeConflicts(failedBranches) {
        return new this(`Could not merge pull request into the following branches due to merge ` +
            `conflicts: ${failedBranches.join(', ')}. Please rebase the PR or update the target label.`);
    }
    static unknownMergeError() {
        return new this(`Unknown merge error occurred. Please see console output above for debugging.`);
    }
    static unableToFixupCommitMessageSquashOnly() {
        return new this(`Unable to fixup commit message of pull request. Commit message can only be ` +
            `modified if the PR is merged using squash.`);
    }
    static notFound() {
        return new this(`Pull request could not be found upstream.`);
    }
    static insufficientPermissionsToMerge(message = `Insufficient Github API permissions to merge pull request. Please ensure that ` +
        `your auth token has write access.`) {
        return new this(message);
    }
    static hasBreakingChanges(label) {
        const message = `Cannot merge into branch for "${label.pattern}" as the pull request has ` +
            `breaking changes. Breaking changes can only be merged with the "target: major" label.`;
        return new this(message);
    }
    static hasDeprecations(label) {
        const message = `Cannot merge into branch for "${label.pattern}" as the pull request ` +
            `contains deprecations. Deprecations can only be merged with the "target: minor" or ` +
            `"target: major" label.`;
        return new this(message);
    }
    static hasFeatureCommits(label) {
        const message = `Cannot merge into branch for "${label.pattern}" as the pull request has ` +
            'commits with the "feat" type. New features can only be merged with the "target: minor" ' +
            'or "target: major" label.';
        return new this(message);
    }
    static missingBreakingChangeLabel() {
        const message = 'Pull Request has at least one commit containing a breaking change note, but ' +
            'does not have a breaking change label.';
        return new this(message);
    }
    static missingBreakingChangeCommit() {
        const message = 'Pull Request has a breaking change label, but does not contain any commits ' +
            'with breaking change notes.';
        return new this(message);
    }
}
exports.PullRequestFailure = PullRequestFailure;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFpbHVyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvbWVyZ2UvZmFpbHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBSUg7Ozs7R0FJRztBQUNILE1BQWEsa0JBQWtCO0lBQzdCO0lBQ0UsNkNBQTZDO0lBQ3RDLE9BQWU7SUFDdEIsb0VBQW9FO0lBQzdELFdBQVcsS0FBSztRQUZoQixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBRWYsYUFBUSxHQUFSLFFBQVEsQ0FBUTtJQUN0QixDQUFDO0lBRUosTUFBTSxDQUFDLFdBQVc7UUFDaEIsT0FBTyxJQUFJLElBQUksQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFRCxNQUFNLENBQUMsYUFBYTtRQUNsQixPQUFPLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxNQUFNLENBQUMsYUFBYTtRQUNsQixPQUFPLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxNQUFNLENBQUMsYUFBYTtRQUNsQixPQUFPLElBQUksSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxPQUFPO1FBQ1osT0FBTyxJQUFJLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUTtRQUNiLE9BQU8sSUFBSSxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVE7UUFDYixPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxlQUF5QjtRQUN0RCxPQUFPLElBQUksSUFBSSxDQUNiLGtGQUFrRjtZQUNoRixxQ0FBcUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUNyRSxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sQ0FBQyxrQkFBa0I7UUFDdkIsT0FBTyxJQUFJLElBQUksQ0FDYiwrRUFBK0U7WUFDN0UsdUJBQXVCLENBQzFCLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxjQUF3QjtRQUM1QyxPQUFPLElBQUksSUFBSSxDQUNiLHdFQUF3RTtZQUN0RSxjQUFjLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxDQUM5RixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sQ0FBQyxpQkFBaUI7UUFDdEIsT0FBTyxJQUFJLElBQUksQ0FBQyw4RUFBOEUsQ0FBQyxDQUFDO0lBQ2xHLENBQUM7SUFFRCxNQUFNLENBQUMsb0NBQW9DO1FBQ3pDLE9BQU8sSUFBSSxJQUFJLENBQ2IsNkVBQTZFO1lBQzNFLDRDQUE0QyxDQUMvQyxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUFRO1FBQ2IsT0FBTyxJQUFJLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxNQUFNLENBQUMsOEJBQThCLENBQ25DLE9BQU8sR0FBRyxnRkFBZ0Y7UUFDeEYsbUNBQW1DO1FBRXJDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFrQjtRQUMxQyxNQUFNLE9BQU8sR0FDWCxpQ0FBaUMsS0FBSyxDQUFDLE9BQU8sNEJBQTRCO1lBQzFFLHVGQUF1RixDQUFDO1FBQzFGLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBa0I7UUFDdkMsTUFBTSxPQUFPLEdBQ1gsaUNBQWlDLEtBQUssQ0FBQyxPQUFPLHdCQUF3QjtZQUN0RSxxRkFBcUY7WUFDckYsd0JBQXdCLENBQUM7UUFDM0IsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQWtCO1FBQ3pDLE1BQU0sT0FBTyxHQUNYLGlDQUFpQyxLQUFLLENBQUMsT0FBTyw0QkFBNEI7WUFDMUUseUZBQXlGO1lBQ3pGLDJCQUEyQixDQUFDO1FBQzlCLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU0sQ0FBQywwQkFBMEI7UUFDL0IsTUFBTSxPQUFPLEdBQ1gsOEVBQThFO1lBQzlFLHdDQUF3QyxDQUFDO1FBQzNDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU0sQ0FBQywyQkFBMkI7UUFDaEMsTUFBTSxPQUFPLEdBQ1gsNkVBQTZFO1lBQzdFLDZCQUE2QixDQUFDO1FBQ2hDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztDQUNGO0FBbkhELGdEQW1IQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1RhcmdldExhYmVsfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBjYW4gYmUgdXNlZCB0byBkZXNjcmliZSBwdWxsIHJlcXVlc3QgZmFpbHVyZXMuIEEgZmFpbHVyZVxuICogaXMgZGVzY3JpYmVkIHRocm91Z2ggYSBodW1hbi1yZWFkYWJsZSBtZXNzYWdlIGFuZCBhIGZsYWcgaW5kaWNhdGluZ1xuICogd2hldGhlciBpdCBpcyBub24tZmF0YWwgb3Igbm90LlxuICovXG5leHBvcnQgY2xhc3MgUHVsbFJlcXVlc3RGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEh1bWFuLXJlYWRhYmxlIG1lc3NhZ2UgZm9yIHRoZSBmYWlsdXJlICovXG4gICAgcHVibGljIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAvKiogV2hldGhlciB0aGUgZmFpbHVyZSBpcyBub24tZmF0YWwgYW5kIGNhbiBiZSBmb3JjaWJseSBpZ25vcmVkLiAqL1xuICAgIHB1YmxpYyBub25GYXRhbCA9IGZhbHNlLFxuICApIHt9XG5cbiAgc3RhdGljIGNsYVVuc2lnbmVkKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgQ0xBIGhhcyBub3QgYmVlbiBzaWduZWQuIFBsZWFzZSBtYWtlIHN1cmUgdGhlIFBSIGF1dGhvciBoYXMgc2lnbmVkIHRoZSBDTEEuYCk7XG4gIH1cblxuICBzdGF0aWMgZmFpbGluZ0NpSm9icygpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYEZhaWxpbmcgQ0kgam9icy5gLCB0cnVlKTtcbiAgfVxuXG4gIHN0YXRpYyBwZW5kaW5nQ2lKb2JzKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgUGVuZGluZyBDSSBqb2JzLmAsIHRydWUpO1xuICB9XG5cbiAgc3RhdGljIG5vdE1lcmdlUmVhZHkoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBOb3QgbWFya2VkIGFzIG1lcmdlIHJlYWR5LmApO1xuICB9XG5cbiAgc3RhdGljIGlzRHJhZnQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKCdQdWxsIHJlcXVlc3QgaXMgc3RpbGwgaW4gZHJhZnQuJyk7XG4gIH1cblxuICBzdGF0aWMgaXNDbG9zZWQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKCdQdWxsIHJlcXVlc3QgaXMgYWxyZWFkeSBjbG9zZWQuJyk7XG4gIH1cblxuICBzdGF0aWMgaXNNZXJnZWQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKCdQdWxsIHJlcXVlc3QgaXMgYWxyZWFkeSBtZXJnZWQuJyk7XG4gIH1cblxuICBzdGF0aWMgbWlzbWF0Y2hpbmdUYXJnZXRCcmFuY2goYWxsb3dlZEJyYW5jaGVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgIGBQdWxsIHJlcXVlc3QgaXMgc2V0IHRvIHdyb25nIGJhc2UgYnJhbmNoLiBQbGVhc2UgdXBkYXRlIHRoZSBQUiBpbiB0aGUgR2l0aHViIFVJIGAgK1xuICAgICAgICBgdG8gb25lIG9mIHRoZSBmb2xsb3dpbmcgYnJhbmNoZXM6ICR7YWxsb3dlZEJyYW5jaGVzLmpvaW4oJywgJyl9LmAsXG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyB1bnNhdGlzZmllZEJhc2VTaGEoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKFxuICAgICAgYFB1bGwgcmVxdWVzdCBoYXMgbm90IGJlZW4gcmViYXNlZCByZWNlbnRseSBhbmQgY291bGQgYmUgYnlwYXNzaW5nIENJIGNoZWNrcy4gYCArXG4gICAgICAgIGBQbGVhc2UgcmViYXNlIHRoZSBQUi5gLFxuICAgICk7XG4gIH1cblxuICBzdGF0aWMgbWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKFxuICAgICAgYENvdWxkIG5vdCBtZXJnZSBwdWxsIHJlcXVlc3QgaW50byB0aGUgZm9sbG93aW5nIGJyYW5jaGVzIGR1ZSB0byBtZXJnZSBgICtcbiAgICAgICAgYGNvbmZsaWN0czogJHtmYWlsZWRCcmFuY2hlcy5qb2luKCcsICcpfS4gUGxlYXNlIHJlYmFzZSB0aGUgUFIgb3IgdXBkYXRlIHRoZSB0YXJnZXQgbGFiZWwuYCxcbiAgICApO1xuICB9XG5cbiAgc3RhdGljIHVua25vd25NZXJnZUVycm9yKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgVW5rbm93biBtZXJnZSBlcnJvciBvY2N1cnJlZC4gUGxlYXNlIHNlZSBjb25zb2xlIG91dHB1dCBhYm92ZSBmb3IgZGVidWdnaW5nLmApO1xuICB9XG5cbiAgc3RhdGljIHVuYWJsZVRvRml4dXBDb21taXRNZXNzYWdlU3F1YXNoT25seSgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoXG4gICAgICBgVW5hYmxlIHRvIGZpeHVwIGNvbW1pdCBtZXNzYWdlIG9mIHB1bGwgcmVxdWVzdC4gQ29tbWl0IG1lc3NhZ2UgY2FuIG9ubHkgYmUgYCArXG4gICAgICAgIGBtb2RpZmllZCBpZiB0aGUgUFIgaXMgbWVyZ2VkIHVzaW5nIHNxdWFzaC5gLFxuICAgICk7XG4gIH1cblxuICBzdGF0aWMgbm90Rm91bmQoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBQdWxsIHJlcXVlc3QgY291bGQgbm90IGJlIGZvdW5kIHVwc3RyZWFtLmApO1xuICB9XG5cbiAgc3RhdGljIGluc3VmZmljaWVudFBlcm1pc3Npb25zVG9NZXJnZShcbiAgICBtZXNzYWdlID0gYEluc3VmZmljaWVudCBHaXRodWIgQVBJIHBlcm1pc3Npb25zIHRvIG1lcmdlIHB1bGwgcmVxdWVzdC4gUGxlYXNlIGVuc3VyZSB0aGF0IGAgK1xuICAgICAgYHlvdXIgYXV0aCB0b2tlbiBoYXMgd3JpdGUgYWNjZXNzLmAsXG4gICkge1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxuXG4gIHN0YXRpYyBoYXNCcmVha2luZ0NoYW5nZXMobGFiZWw6IFRhcmdldExhYmVsKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICBgQ2Fubm90IG1lcmdlIGludG8gYnJhbmNoIGZvciBcIiR7bGFiZWwucGF0dGVybn1cIiBhcyB0aGUgcHVsbCByZXF1ZXN0IGhhcyBgICtcbiAgICAgIGBicmVha2luZyBjaGFuZ2VzLiBCcmVha2luZyBjaGFuZ2VzIGNhbiBvbmx5IGJlIG1lcmdlZCB3aXRoIHRoZSBcInRhcmdldDogbWFqb3JcIiBsYWJlbC5gO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxuXG4gIHN0YXRpYyBoYXNEZXByZWNhdGlvbnMobGFiZWw6IFRhcmdldExhYmVsKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICBgQ2Fubm90IG1lcmdlIGludG8gYnJhbmNoIGZvciBcIiR7bGFiZWwucGF0dGVybn1cIiBhcyB0aGUgcHVsbCByZXF1ZXN0IGAgK1xuICAgICAgYGNvbnRhaW5zIGRlcHJlY2F0aW9ucy4gRGVwcmVjYXRpb25zIGNhbiBvbmx5IGJlIG1lcmdlZCB3aXRoIHRoZSBcInRhcmdldDogbWlub3JcIiBvciBgICtcbiAgICAgIGBcInRhcmdldDogbWFqb3JcIiBsYWJlbC5gO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxuXG4gIHN0YXRpYyBoYXNGZWF0dXJlQ29tbWl0cyhsYWJlbDogVGFyZ2V0TGFiZWwpIHtcbiAgICBjb25zdCBtZXNzYWdlID1cbiAgICAgIGBDYW5ub3QgbWVyZ2UgaW50byBicmFuY2ggZm9yIFwiJHtsYWJlbC5wYXR0ZXJufVwiIGFzIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGAgK1xuICAgICAgJ2NvbW1pdHMgd2l0aCB0aGUgXCJmZWF0XCIgdHlwZS4gTmV3IGZlYXR1cmVzIGNhbiBvbmx5IGJlIG1lcmdlZCB3aXRoIHRoZSBcInRhcmdldDogbWlub3JcIiAnICtcbiAgICAgICdvciBcInRhcmdldDogbWFqb3JcIiBsYWJlbC4nO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxuXG4gIHN0YXRpYyBtaXNzaW5nQnJlYWtpbmdDaGFuZ2VMYWJlbCgpIHtcbiAgICBjb25zdCBtZXNzYWdlID1cbiAgICAgICdQdWxsIFJlcXVlc3QgaGFzIGF0IGxlYXN0IG9uZSBjb21taXQgY29udGFpbmluZyBhIGJyZWFraW5nIGNoYW5nZSBub3RlLCBidXQgJyArXG4gICAgICAnZG9lcyBub3QgaGF2ZSBhIGJyZWFraW5nIGNoYW5nZSBsYWJlbC4nO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxuXG4gIHN0YXRpYyBtaXNzaW5nQnJlYWtpbmdDaGFuZ2VDb21taXQoKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICAnUHVsbCBSZXF1ZXN0IGhhcyBhIGJyZWFraW5nIGNoYW5nZSBsYWJlbCwgYnV0IGRvZXMgbm90IGNvbnRhaW4gYW55IGNvbW1pdHMgJyArXG4gICAgICAnd2l0aCBicmVha2luZyBjaGFuZ2Ugbm90ZXMuJztcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cbn1cbiJdfQ==