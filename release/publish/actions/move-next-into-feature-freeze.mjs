/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import * as semver from 'semver';
import { green, info, yellow } from '../../../utils/console';
import { computeNewPrereleaseVersionForNext } from '../../versioning/next-prerelease-version';
import { ReleaseAction } from '../actions';
import { getCommitMessageForExceptionalNextVersionBump, getReleaseNoteCherryPickCommitMessage } from '../commit-message';
import { changelogPath, packageJsonPath } from '../constants';
/**
 * Release action that moves the next release-train into the feature-freeze phase. This means
 * that a new version branch is created from the next branch, and a new next pre-release is
 * cut indicating the started feature-freeze.
 */
export class MoveNextIntoFeatureFreezeAction extends ReleaseAction {
    constructor() {
        super(...arguments);
        this._newVersion = computeNewPrereleaseVersionForNext(this.active, this.config);
    }
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.next;
            const newVersion = yield this._newVersion;
            return `Move the "${branchName}" branch into feature-freeze phase (v${newVersion}).`;
        });
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const newVersion = yield this._newVersion;
            const newBranch = `${newVersion.major}.${newVersion.minor}.x`;
            // Branch-off the next branch into a feature-freeze branch.
            yield this._createNewVersionBranchFromNext(newBranch);
            // Stage the new version for the newly created branch, and push changes to a
            // fork in order to create a staging pull request. Note that we re-use the newly
            // created branch instead of re-fetching from the upstream.
            const { pullRequest, releaseNotes } = yield this.stageVersionForBranchAndCreatePullRequest(newVersion, newBranch);
            // Wait for the staging PR to be merged. Then build and publish the feature-freeze next
            // pre-release. Finally, cherry-pick the release notes into the next branch in combination
            // with bumping the version to the next minor too.
            yield this.waitForPullRequestToBeMerged(pullRequest);
            yield this.buildAndPublish(releaseNotes, newBranch, 'next');
            yield this._createNextBranchUpdatePullRequest(releaseNotes, newVersion);
        });
    }
    /** Creates a new version branch from the next branch. */
    _createNewVersionBranchFromNext(newBranch) {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName: nextBranch } = this.active.next;
            yield this.verifyPassingGithubStatus(nextBranch);
            yield this.checkoutUpstreamBranch(nextBranch);
            yield this.createLocalBranchFromHead(newBranch);
            yield this.pushHeadToRemoteBranch(newBranch);
            info(green(`  ✓   Version branch "${newBranch}" created.`));
        });
    }
    /**
     * Creates a pull request for the next branch that bumps the version to the next
     * minor, and cherry-picks the changelog for the newly branched-off feature-freeze version.
     */
    _createNextBranchUpdatePullRequest(releaseNotes, newVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName: nextBranch, version } = this.active.next;
            // We increase the version for the next branch to the next minor. The team can decide
            // later if they want next to be a major through the `Configure Next as Major` release action.
            const newNextVersion = semver.parse(`${version.major}.${version.minor + 1}.0-next.0`);
            const bumpCommitMessage = getCommitMessageForExceptionalNextVersionBump(newNextVersion);
            yield this.checkoutUpstreamBranch(nextBranch);
            yield this.updateProjectVersion(newNextVersion);
            // Create an individual commit for the next version bump. The changelog should go into
            // a separate commit that makes it clear where the changelog is cherry-picked from.
            yield this.createCommit(bumpCommitMessage, [packageJsonPath]);
            yield this.prependReleaseNotesToChangelog(releaseNotes);
            const commitMessage = getReleaseNoteCherryPickCommitMessage(releaseNotes.version);
            yield this.createCommit(commitMessage, [changelogPath]);
            let nextPullRequestMessage = `The previous "next" release-train has moved into the ` +
                `release-candidate phase. This PR updates the next branch to the subsequent ` +
                `release-train.\n\nAlso this PR cherry-picks the changelog for ` +
                `v${newVersion} into the ${nextBranch} branch so that the changelog is up to date.`;
            const nextUpdatePullRequest = yield this.pushChangesToForkAndCreatePullRequest(nextBranch, `next-release-train-${newNextVersion}`, `Update next branch to reflect new release-train "v${newNextVersion}".`, nextPullRequestMessage);
            info(green(`  ✓   Pull request for updating the "${nextBranch}" branch has been created.`));
            info(yellow(`      Please ask team members to review: ${nextUpdatePullRequest.url}.`));
        });
    }
    static isActive(active) {
        return __awaiter(this, void 0, void 0, function* () {
            // A new feature-freeze/release-candidate branch can only be created if there
            // is no active release-train in feature-freeze/release-candidate phase.
            return active.releaseCandidate === null;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvbW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBRWpDLE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRzNELE9BQU8sRUFBQyxrQ0FBa0MsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQzVGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDekMsT0FBTyxFQUFDLDZDQUE2QyxFQUFFLHFDQUFxQyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDdkgsT0FBTyxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFNUQ7Ozs7R0FJRztBQUNILE1BQU0sT0FBTywrQkFBZ0MsU0FBUSxhQUFhO0lBQWxFOztRQUNVLGdCQUFXLEdBQUcsa0NBQWtDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFtRnJGLENBQUM7SUFqRmdCLGNBQWM7O1lBQzNCLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN0QyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDMUMsT0FBTyxhQUFhLFVBQVUsd0NBQXdDLFVBQVUsSUFBSSxDQUFDO1FBQ3ZGLENBQUM7S0FBQTtJQUVjLE9BQU87O1lBQ3BCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUMxQyxNQUFNLFNBQVMsR0FBRyxH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QzVGLElBQUksQ0FBQyxNQUFNLENBQUMsNENBQTRDLHFCQUFxQixDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RixDQUFDO0tBQUE7SUFFRCxNQUFNLENBQWdCLFFBQVEsQ0FBQyxNQUEyQjs7WUFDeEQsNkVBQTZFO1lBQzdFLHdFQUF3RTtZQUN4RSxPQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLENBQUM7UUFDMUMsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7Z3JlZW4sIGluZm8sIHllbGxvd30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge1JlbGVhc2VOb3Rlc30gZnJvbSAnLi4vLi4vbm90ZXMvcmVsZWFzZS1ub3Rlcyc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7Y29tcHV0ZU5ld1ByZXJlbGVhc2VWZXJzaW9uRm9yTmV4dH0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9uZXh0LXByZXJlbGVhc2UtdmVyc2lvbic7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlRm9yRXhjZXB0aW9uYWxOZXh0VmVyc2lvbkJ1bXAsIGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2V9IGZyb20gJy4uL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7Y2hhbmdlbG9nUGF0aCwgcGFja2FnZUpzb25QYXRofSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgbW92ZXMgdGhlIG5leHQgcmVsZWFzZS10cmFpbiBpbnRvIHRoZSBmZWF0dXJlLWZyZWV6ZSBwaGFzZS4gVGhpcyBtZWFuc1xuICogdGhhdCBhIG5ldyB2ZXJzaW9uIGJyYW5jaCBpcyBjcmVhdGVkIGZyb20gdGhlIG5leHQgYnJhbmNoLCBhbmQgYSBuZXcgbmV4dCBwcmUtcmVsZWFzZSBpc1xuICogY3V0IGluZGljYXRpbmcgdGhlIHN0YXJ0ZWQgZmVhdHVyZS1mcmVlemUuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb3ZlTmV4dEludG9GZWF0dXJlRnJlZXplQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSBjb21wdXRlTmV3UHJlcmVsZWFzZVZlcnNpb25Gb3JOZXh0KHRoaXMuYWN0aXZlLCB0aGlzLmNvbmZpZyk7XG5cbiAgb3ZlcnJpZGUgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUubmV4dDtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gYXdhaXQgdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYE1vdmUgdGhlIFwiJHticmFuY2hOYW1lfVwiIGJyYW5jaCBpbnRvIGZlYXR1cmUtZnJlZXplIHBoYXNlICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX25ld1ZlcnNpb247XG4gICAgY29uc3QgbmV3QnJhbmNoID0gYCR7bmV3VmVyc2lvbi5tYWpvcn0uJHtuZXdWZXJzaW9uLm1pbm9yfS54YDtcblxuICAgIC8vIEJyYW5jaC1vZmYgdGhlIG5leHQgYnJhbmNoIGludG8gYSBmZWF0dXJlLWZyZWV6ZSBicmFuY2guXG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlTmV3VmVyc2lvbkJyYW5jaEZyb21OZXh0KG5ld0JyYW5jaCk7XG5cbiAgICAvLyBTdGFnZSB0aGUgbmV3IHZlcnNpb24gZm9yIHRoZSBuZXdseSBjcmVhdGVkIGJyYW5jaCwgYW5kIHB1c2ggY2hhbmdlcyB0byBhXG4gICAgLy8gZm9yayBpbiBvcmRlciB0byBjcmVhdGUgYSBzdGFnaW5nIHB1bGwgcmVxdWVzdC4gTm90ZSB0aGF0IHdlIHJlLXVzZSB0aGUgbmV3bHlcbiAgICAvLyBjcmVhdGVkIGJyYW5jaCBpbnN0ZWFkIG9mIHJlLWZldGNoaW5nIGZyb20gdGhlIHVwc3RyZWFtLlxuICAgIGNvbnN0IHtwdWxsUmVxdWVzdCwgcmVsZWFzZU5vdGVzfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QobmV3VmVyc2lvbiwgbmV3QnJhbmNoKTtcblxuICAgIC8vIFdhaXQgZm9yIHRoZSBzdGFnaW5nIFBSIHRvIGJlIG1lcmdlZC4gVGhlbiBidWlsZCBhbmQgcHVibGlzaCB0aGUgZmVhdHVyZS1mcmVlemUgbmV4dFxuICAgIC8vIHByZS1yZWxlYXNlLiBGaW5hbGx5LCBjaGVycnktcGljayB0aGUgcmVsZWFzZSBub3RlcyBpbnRvIHRoZSBuZXh0IGJyYW5jaCBpbiBjb21iaW5hdGlvblxuICAgIC8vIHdpdGggYnVtcGluZyB0aGUgdmVyc2lvbiB0byB0aGUgbmV4dCBtaW5vciB0b28uXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKHB1bGxSZXF1ZXN0KTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChyZWxlYXNlTm90ZXMsIG5ld0JyYW5jaCwgJ25leHQnKTtcbiAgICBhd2FpdCB0aGlzLl9jcmVhdGVOZXh0QnJhbmNoVXBkYXRlUHVsbFJlcXVlc3QocmVsZWFzZU5vdGVzLCBuZXdWZXJzaW9uKTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGEgbmV3IHZlcnNpb24gYnJhbmNoIGZyb20gdGhlIG5leHQgYnJhbmNoLiAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVOZXdWZXJzaW9uQnJhbmNoRnJvbU5leHQobmV3QnJhbmNoOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZTogbmV4dEJyYW5jaH0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIGF3YWl0IHRoaXMudmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhuZXh0QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gobmV4dEJyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKG5ld0JyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5wdXNoSGVhZFRvUmVtb3RlQnJhbmNoKG5ld0JyYW5jaCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBWZXJzaW9uIGJyYW5jaCBcIiR7bmV3QnJhbmNofVwiIGNyZWF0ZWQuYCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBwdWxsIHJlcXVlc3QgZm9yIHRoZSBuZXh0IGJyYW5jaCB0aGF0IGJ1bXBzIHRoZSB2ZXJzaW9uIHRvIHRoZSBuZXh0XG4gICAqIG1pbm9yLCBhbmQgY2hlcnJ5LXBpY2tzIHRoZSBjaGFuZ2Vsb2cgZm9yIHRoZSBuZXdseSBicmFuY2hlZC1vZmYgZmVhdHVyZS1mcmVlemUgdmVyc2lvbi5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2NyZWF0ZU5leHRCcmFuY2hVcGRhdGVQdWxsUmVxdWVzdChcbiAgICAgIHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWU6IG5leHRCcmFuY2gsIHZlcnNpb259ID0gdGhpcy5hY3RpdmUubmV4dDtcbiAgICAvLyBXZSBpbmNyZWFzZSB0aGUgdmVyc2lvbiBmb3IgdGhlIG5leHQgYnJhbmNoIHRvIHRoZSBuZXh0IG1pbm9yLiBUaGUgdGVhbSBjYW4gZGVjaWRlXG4gICAgLy8gbGF0ZXIgaWYgdGhleSB3YW50IG5leHQgdG8gYmUgYSBtYWpvciB0aHJvdWdoIHRoZSBgQ29uZmlndXJlIE5leHQgYXMgTWFqb3JgIHJlbGVhc2UgYWN0aW9uLlxuICAgIGNvbnN0IG5ld05leHRWZXJzaW9uID0gc2VtdmVyLnBhcnNlKGAke3ZlcnNpb24ubWFqb3J9LiR7dmVyc2lvbi5taW5vciArIDF9LjAtbmV4dC4wYCkhO1xuICAgIGNvbnN0IGJ1bXBDb21taXRNZXNzYWdlID0gZ2V0Q29tbWl0TWVzc2FnZUZvckV4Y2VwdGlvbmFsTmV4dFZlcnNpb25CdW1wKG5ld05leHRWZXJzaW9uKTtcblxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld05leHRWZXJzaW9uKTtcblxuICAgIC8vIENyZWF0ZSBhbiBpbmRpdmlkdWFsIGNvbW1pdCBmb3IgdGhlIG5leHQgdmVyc2lvbiBidW1wLiBUaGUgY2hhbmdlbG9nIHNob3VsZCBnbyBpbnRvXG4gICAgLy8gYSBzZXBhcmF0ZSBjb21taXQgdGhhdCBtYWtlcyBpdCBjbGVhciB3aGVyZSB0aGUgY2hhbmdlbG9nIGlzIGNoZXJyeS1waWNrZWQgZnJvbS5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChidW1wQ29tbWl0TWVzc2FnZSwgW3BhY2thZ2VKc29uUGF0aF0pO1xuXG4gICAgYXdhaXQgdGhpcy5wcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzKTtcblxuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlKHJlbGVhc2VOb3Rlcy52ZXJzaW9uKTtcblxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtjaGFuZ2Vsb2dQYXRoXSk7XG5cbiAgICBsZXQgbmV4dFB1bGxSZXF1ZXN0TWVzc2FnZSA9IGBUaGUgcHJldmlvdXMgXCJuZXh0XCIgcmVsZWFzZS10cmFpbiBoYXMgbW92ZWQgaW50byB0aGUgYCArXG4gICAgICAgIGByZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gVGhpcyBQUiB1cGRhdGVzIHRoZSBuZXh0IGJyYW5jaCB0byB0aGUgc3Vic2VxdWVudCBgICtcbiAgICAgICAgYHJlbGVhc2UtdHJhaW4uXFxuXFxuQWxzbyB0aGlzIFBSIGNoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZvciBgICtcbiAgICAgICAgYHYke25ld1ZlcnNpb259IGludG8gdGhlICR7bmV4dEJyYW5jaH0gYnJhbmNoIHNvIHRoYXQgdGhlIGNoYW5nZWxvZyBpcyB1cCB0byBkYXRlLmA7XG5cbiAgICBjb25zdCBuZXh0VXBkYXRlUHVsbFJlcXVlc3QgPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICAgIG5leHRCcmFuY2gsIGBuZXh0LXJlbGVhc2UtdHJhaW4tJHtuZXdOZXh0VmVyc2lvbn1gLFxuICAgICAgICBgVXBkYXRlIG5leHQgYnJhbmNoIHRvIHJlZmxlY3QgbmV3IHJlbGVhc2UtdHJhaW4gXCJ2JHtuZXdOZXh0VmVyc2lvbn1cIi5gLFxuICAgICAgICBuZXh0UHVsbFJlcXVlc3RNZXNzYWdlKTtcblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgUHVsbCByZXF1ZXN0IGZvciB1cGRhdGluZyB0aGUgXCIke25leHRCcmFuY2h9XCIgYnJhbmNoIGhhcyBiZWVuIGNyZWF0ZWQuYCkpO1xuICAgIGluZm8oeWVsbG93KGAgICAgICBQbGVhc2UgYXNrIHRlYW0gbWVtYmVycyB0byByZXZpZXc6ICR7bmV4dFVwZGF0ZVB1bGxSZXF1ZXN0LnVybH0uYCkpO1xuICB9XG5cbiAgc3RhdGljIG92ZXJyaWRlIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIEEgbmV3IGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBjYW4gb25seSBiZSBjcmVhdGVkIGlmIHRoZXJlXG4gICAgLy8gaXMgbm8gYWN0aXZlIHJlbGVhc2UtdHJhaW4gaW4gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuXG4gICAgcmV0dXJuIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlID09PSBudWxsO1xuICB9XG59XG4iXX0=