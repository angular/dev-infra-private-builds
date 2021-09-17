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
const config_1 = require("../../config");
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
        const message = `Cannot merge into branch for "${label.name}" as the pull request has ` +
            `breaking changes. Breaking changes can only be merged with the "target: major" label.`;
        return new this(message);
    }
    static hasDeprecations(label) {
        const message = `Cannot merge into branch for "${label.name}" as the pull request ` +
            `contains deprecations. Deprecations can only be merged with the "target: minor" or ` +
            `"target: major" label.`;
        return new this(message);
    }
    static hasFeatureCommits(label) {
        const message = `Cannot merge into branch for "${label.name}" as the pull request has ` +
            'commits with the "feat" type. New features can only be merged with the "target: minor" ' +
            'or "target: major" label.';
        return new this(message);
    }
    static missingBreakingChangeLabel() {
        const message = `Pull Request has at least one commit containing a breaking change note, ` +
            `but does not have a breaking change label. Make sure to apply the ` +
            `following label: ${config_1.breakingChangeLabel}`;
        return new this(message);
    }
    static missingBreakingChangeCommit() {
        const message = 'Pull Request has a breaking change label, but does not contain any commits with ' +
            'breaking change notes (i.e. commits do not have a `BREAKING CHANGE: <..>` section).';
        return new this(message);
    }
}
exports.PullRequestFailure = PullRequestFailure;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFpbHVyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvY29tbW9uL3ZhbGlkYXRpb24vZmFpbHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgseUNBQWlEO0FBR2pEOzs7O0dBSUc7QUFDSCxNQUFhLGtCQUFrQjtJQUM3QjtJQUNFLDZDQUE2QztJQUN0QyxPQUFlO0lBQ3RCLG9FQUFvRTtJQUM3RCxXQUFXLEtBQUs7UUFGaEIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUVmLGFBQVEsR0FBUixRQUFRLENBQVE7SUFDdEIsQ0FBQztJQUVKLE1BQU0sQ0FBQyxXQUFXO1FBQ2hCLE9BQU8sSUFBSSxJQUFJLENBQUMsNkVBQTZFLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQsTUFBTSxDQUFDLGFBQWE7UUFDbEIsT0FBTyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsTUFBTSxDQUFDLGFBQWE7UUFDbEIsT0FBTyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsTUFBTSxDQUFDLGFBQWE7UUFDbEIsT0FBTyxJQUFJLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxNQUFNLENBQUMsT0FBTztRQUNaLE9BQU8sSUFBSSxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVE7UUFDYixPQUFPLElBQUksSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUFRO1FBQ2IsT0FBTyxJQUFJLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxNQUFNLENBQUMsdUJBQXVCLENBQUMsZUFBeUI7UUFDdEQsT0FBTyxJQUFJLElBQUksQ0FDYixrRkFBa0Y7WUFDaEYscUNBQXFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDckUsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLENBQUMsa0JBQWtCO1FBQ3ZCLE9BQU8sSUFBSSxJQUFJLENBQ2IsK0VBQStFO1lBQzdFLHVCQUF1QixDQUMxQixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsY0FBd0I7UUFDNUMsT0FBTyxJQUFJLElBQUksQ0FDYix3RUFBd0U7WUFDdEUsY0FBYyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvREFBb0QsQ0FDOUYsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLENBQUMsaUJBQWlCO1FBQ3RCLE9BQU8sSUFBSSxJQUFJLENBQUMsOEVBQThFLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRUQsTUFBTSxDQUFDLG9DQUFvQztRQUN6QyxPQUFPLElBQUksSUFBSSxDQUNiLDZFQUE2RTtZQUMzRSw0Q0FBNEMsQ0FDL0MsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUTtRQUNiLE9BQU8sSUFBSSxJQUFJLENBQUMsMkNBQTJDLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsTUFBTSxDQUFDLDhCQUE4QixDQUNuQyxPQUFPLEdBQUcsZ0ZBQWdGO1FBQ3hGLG1DQUFtQztRQUVyQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxNQUFNLENBQUMsa0JBQWtCLENBQUMsS0FBa0I7UUFDMUMsTUFBTSxPQUFPLEdBQ1gsaUNBQWlDLEtBQUssQ0FBQyxJQUFJLDRCQUE0QjtZQUN2RSx1RkFBdUYsQ0FBQztRQUMxRixPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQWtCO1FBQ3ZDLE1BQU0sT0FBTyxHQUNYLGlDQUFpQyxLQUFLLENBQUMsSUFBSSx3QkFBd0I7WUFDbkUscUZBQXFGO1lBQ3JGLHdCQUF3QixDQUFDO1FBQzNCLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFrQjtRQUN6QyxNQUFNLE9BQU8sR0FDWCxpQ0FBaUMsS0FBSyxDQUFDLElBQUksNEJBQTRCO1lBQ3ZFLHlGQUF5RjtZQUN6RiwyQkFBMkIsQ0FBQztRQUM5QixPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxNQUFNLENBQUMsMEJBQTBCO1FBQy9CLE1BQU0sT0FBTyxHQUNYLDBFQUEwRTtZQUMxRSxvRUFBb0U7WUFDcEUsb0JBQW9CLDRCQUFtQixFQUFFLENBQUM7UUFDNUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsTUFBTSxDQUFDLDJCQUEyQjtRQUNoQyxNQUFNLE9BQU8sR0FDWCxrRkFBa0Y7WUFDbEYscUZBQXFGLENBQUM7UUFDeEYsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQixDQUFDO0NBQ0Y7QUFwSEQsZ0RBb0hDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YnJlYWtpbmdDaGFuZ2VMYWJlbH0gZnJvbSAnLi4vLi4vY29uZmlnJztcbmltcG9ydCB7VGFyZ2V0TGFiZWx9IGZyb20gJy4uL3RhcmdldGluZy90YXJnZXQtbGFiZWwnO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGVzY3JpYmUgcHVsbCByZXF1ZXN0IGZhaWx1cmVzLiBBIGZhaWx1cmVcbiAqIGlzIGRlc2NyaWJlZCB0aHJvdWdoIGEgaHVtYW4tcmVhZGFibGUgbWVzc2FnZSBhbmQgYSBmbGFnIGluZGljYXRpbmdcbiAqIHdoZXRoZXIgaXQgaXMgbm9uLWZhdGFsIG9yIG5vdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxSZXF1ZXN0RmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBIdW1hbi1yZWFkYWJsZSBtZXNzYWdlIGZvciB0aGUgZmFpbHVyZSAqL1xuICAgIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmcsXG4gICAgLyoqIFdoZXRoZXIgdGhlIGZhaWx1cmUgaXMgbm9uLWZhdGFsIGFuZCBjYW4gYmUgZm9yY2libHkgaWdub3JlZC4gKi9cbiAgICBwdWJsaWMgbm9uRmF0YWwgPSBmYWxzZSxcbiAgKSB7fVxuXG4gIHN0YXRpYyBjbGFVbnNpZ25lZCgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYENMQSBoYXMgbm90IGJlZW4gc2lnbmVkLiBQbGVhc2UgbWFrZSBzdXJlIHRoZSBQUiBhdXRob3IgaGFzIHNpZ25lZCB0aGUgQ0xBLmApO1xuICB9XG5cbiAgc3RhdGljIGZhaWxpbmdDaUpvYnMoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKGBGYWlsaW5nIENJIGpvYnMuYCwgdHJ1ZSk7XG4gIH1cblxuICBzdGF0aWMgcGVuZGluZ0NpSm9icygpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYFBlbmRpbmcgQ0kgam9icy5gLCB0cnVlKTtcbiAgfVxuXG4gIHN0YXRpYyBub3RNZXJnZVJlYWR5KCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgTm90IG1hcmtlZCBhcyBtZXJnZSByZWFkeS5gKTtcbiAgfVxuXG4gIHN0YXRpYyBpc0RyYWZ0KCkge1xuICAgIHJldHVybiBuZXcgdGhpcygnUHVsbCByZXF1ZXN0IGlzIHN0aWxsIGluIGRyYWZ0LicpO1xuICB9XG5cbiAgc3RhdGljIGlzQ2xvc2VkKCkge1xuICAgIHJldHVybiBuZXcgdGhpcygnUHVsbCByZXF1ZXN0IGlzIGFscmVhZHkgY2xvc2VkLicpO1xuICB9XG5cbiAgc3RhdGljIGlzTWVyZ2VkKCkge1xuICAgIHJldHVybiBuZXcgdGhpcygnUHVsbCByZXF1ZXN0IGlzIGFscmVhZHkgbWVyZ2VkLicpO1xuICB9XG5cbiAgc3RhdGljIG1pc21hdGNoaW5nVGFyZ2V0QnJhbmNoKGFsbG93ZWRCcmFuY2hlczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoXG4gICAgICBgUHVsbCByZXF1ZXN0IGlzIHNldCB0byB3cm9uZyBiYXNlIGJyYW5jaC4gUGxlYXNlIHVwZGF0ZSB0aGUgUFIgaW4gdGhlIEdpdGh1YiBVSSBgICtcbiAgICAgICAgYHRvIG9uZSBvZiB0aGUgZm9sbG93aW5nIGJyYW5jaGVzOiAke2FsbG93ZWRCcmFuY2hlcy5qb2luKCcsICcpfS5gLFxuICAgICk7XG4gIH1cblxuICBzdGF0aWMgdW5zYXRpc2ZpZWRCYXNlU2hhKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgIGBQdWxsIHJlcXVlc3QgaGFzIG5vdCBiZWVuIHJlYmFzZWQgcmVjZW50bHkgYW5kIGNvdWxkIGJlIGJ5cGFzc2luZyBDSSBjaGVja3MuIGAgK1xuICAgICAgICBgUGxlYXNlIHJlYmFzZSB0aGUgUFIuYCxcbiAgICApO1xuICB9XG5cbiAgc3RhdGljIG1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBuZXcgdGhpcyhcbiAgICAgIGBDb3VsZCBub3QgbWVyZ2UgcHVsbCByZXF1ZXN0IGludG8gdGhlIGZvbGxvd2luZyBicmFuY2hlcyBkdWUgdG8gbWVyZ2UgYCArXG4gICAgICAgIGBjb25mbGljdHM6ICR7ZmFpbGVkQnJhbmNoZXMuam9pbignLCAnKX0uIFBsZWFzZSByZWJhc2UgdGhlIFBSIG9yIHVwZGF0ZSB0aGUgdGFyZ2V0IGxhYmVsLmAsXG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyB1bmtub3duTWVyZ2VFcnJvcigpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoYFVua25vd24gbWVyZ2UgZXJyb3Igb2NjdXJyZWQuIFBsZWFzZSBzZWUgY29uc29sZSBvdXRwdXQgYWJvdmUgZm9yIGRlYnVnZ2luZy5gKTtcbiAgfVxuXG4gIHN0YXRpYyB1bmFibGVUb0ZpeHVwQ29tbWl0TWVzc2FnZVNxdWFzaE9ubHkoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKFxuICAgICAgYFVuYWJsZSB0byBmaXh1cCBjb21taXQgbWVzc2FnZSBvZiBwdWxsIHJlcXVlc3QuIENvbW1pdCBtZXNzYWdlIGNhbiBvbmx5IGJlIGAgK1xuICAgICAgICBgbW9kaWZpZWQgaWYgdGhlIFBSIGlzIG1lcmdlZCB1c2luZyBzcXVhc2guYCxcbiAgICApO1xuICB9XG5cbiAgc3RhdGljIG5vdEZvdW5kKCkge1xuICAgIHJldHVybiBuZXcgdGhpcyhgUHVsbCByZXF1ZXN0IGNvdWxkIG5vdCBiZSBmb3VuZCB1cHN0cmVhbS5gKTtcbiAgfVxuXG4gIHN0YXRpYyBpbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoXG4gICAgbWVzc2FnZSA9IGBJbnN1ZmZpY2llbnQgR2l0aHViIEFQSSBwZXJtaXNzaW9ucyB0byBtZXJnZSBwdWxsIHJlcXVlc3QuIFBsZWFzZSBlbnN1cmUgdGhhdCBgICtcbiAgICAgIGB5b3VyIGF1dGggdG9rZW4gaGFzIHdyaXRlIGFjY2Vzcy5gLFxuICApIHtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cblxuICBzdGF0aWMgaGFzQnJlYWtpbmdDaGFuZ2VzKGxhYmVsOiBUYXJnZXRMYWJlbCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgYENhbm5vdCBtZXJnZSBpbnRvIGJyYW5jaCBmb3IgXCIke2xhYmVsLm5hbWV9XCIgYXMgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYCArXG4gICAgICBgYnJlYWtpbmcgY2hhbmdlcy4gQnJlYWtpbmcgY2hhbmdlcyBjYW4gb25seSBiZSBtZXJnZWQgd2l0aCB0aGUgXCJ0YXJnZXQ6IG1ham9yXCIgbGFiZWwuYDtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cblxuICBzdGF0aWMgaGFzRGVwcmVjYXRpb25zKGxhYmVsOiBUYXJnZXRMYWJlbCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgYENhbm5vdCBtZXJnZSBpbnRvIGJyYW5jaCBmb3IgXCIke2xhYmVsLm5hbWV9XCIgYXMgdGhlIHB1bGwgcmVxdWVzdCBgICtcbiAgICAgIGBjb250YWlucyBkZXByZWNhdGlvbnMuIERlcHJlY2F0aW9ucyBjYW4gb25seSBiZSBtZXJnZWQgd2l0aCB0aGUgXCJ0YXJnZXQ6IG1pbm9yXCIgb3IgYCArXG4gICAgICBgXCJ0YXJnZXQ6IG1ham9yXCIgbGFiZWwuYDtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cblxuICBzdGF0aWMgaGFzRmVhdHVyZUNvbW1pdHMobGFiZWw6IFRhcmdldExhYmVsKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICBgQ2Fubm90IG1lcmdlIGludG8gYnJhbmNoIGZvciBcIiR7bGFiZWwubmFtZX1cIiBhcyB0aGUgcHVsbCByZXF1ZXN0IGhhcyBgICtcbiAgICAgICdjb21taXRzIHdpdGggdGhlIFwiZmVhdFwiIHR5cGUuIE5ldyBmZWF0dXJlcyBjYW4gb25seSBiZSBtZXJnZWQgd2l0aCB0aGUgXCJ0YXJnZXQ6IG1pbm9yXCIgJyArXG4gICAgICAnb3IgXCJ0YXJnZXQ6IG1ham9yXCIgbGFiZWwuJztcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cblxuICBzdGF0aWMgbWlzc2luZ0JyZWFraW5nQ2hhbmdlTGFiZWwoKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICBgUHVsbCBSZXF1ZXN0IGhhcyBhdCBsZWFzdCBvbmUgY29tbWl0IGNvbnRhaW5pbmcgYSBicmVha2luZyBjaGFuZ2Ugbm90ZSwgYCArXG4gICAgICBgYnV0IGRvZXMgbm90IGhhdmUgYSBicmVha2luZyBjaGFuZ2UgbGFiZWwuIE1ha2Ugc3VyZSB0byBhcHBseSB0aGUgYCArXG4gICAgICBgZm9sbG93aW5nIGxhYmVsOiAke2JyZWFraW5nQ2hhbmdlTGFiZWx9YDtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSk7XG4gIH1cblxuICBzdGF0aWMgbWlzc2luZ0JyZWFraW5nQ2hhbmdlQ29tbWl0KCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPVxuICAgICAgJ1B1bGwgUmVxdWVzdCBoYXMgYSBicmVha2luZyBjaGFuZ2UgbGFiZWwsIGJ1dCBkb2VzIG5vdCBjb250YWluIGFueSBjb21taXRzIHdpdGggJyArXG4gICAgICAnYnJlYWtpbmcgY2hhbmdlIG5vdGVzIChpLmUuIGNvbW1pdHMgZG8gbm90IGhhdmUgYSBgQlJFQUtJTkcgQ0hBTkdFOiA8Li4+YCBzZWN0aW9uKS4nO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlKTtcbiAgfVxufVxuIl19