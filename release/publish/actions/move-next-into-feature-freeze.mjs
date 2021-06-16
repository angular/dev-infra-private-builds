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
            const { pullRequest: { id }, releaseNotes } = yield this.stageVersionForBranchAndCreatePullRequest(newVersion, newBranch);
            // Wait for the staging PR to be merged. Then build and publish the feature-freeze next
            // pre-release. Finally, cherry-pick the release notes into the next branch in combination
            // with bumping the version to the next minor too.
            yield this.waitForPullRequestToBeMerged(id);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvbW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBRWpDLE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRzNELE9BQU8sRUFBQyxrQ0FBa0MsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQzVGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDekMsT0FBTyxFQUFDLDZDQUE2QyxFQUFFLHFDQUFxQyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDdkgsT0FBTyxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFNUQ7Ozs7R0FJRztBQUNILE1BQU0sT0FBTywrQkFBZ0MsU0FBUSxhQUFhO0lBQWxFOztRQUNVLGdCQUFXLEdBQUcsa0NBQWtDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFtRnJGLENBQUM7SUFqRk8sY0FBYzs7WUFDbEIsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3RDLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUMxQyxPQUFPLGFBQWEsVUFBVSx3Q0FBd0MsVUFBVSxJQUFJLENBQUM7UUFDdkYsQ0FBQztLQUFBO0lBRUssT0FBTzs7WUFDWCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDMUMsTUFBTSxTQUFTLEdBQUcsR0FB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LENBQUMsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxNQUFNLENBQUMsNENBQTRDLHFCQUFxQixDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RixDQUFDO0tBQUE7SUFFRCxNQUFNLENBQU8sUUFBUSxDQUFDLE1BQTJCOztZQUMvQyw2RUFBNkU7WUFDN0Usd0VBQXdFO1lBQ3hFLE9BQU8sTUFBTSxDQUFDLGdCQUFnQixLQUFLLElBQUksQ0FBQztRQUMxQyxDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtncmVlbiwgaW5mbywgeWVsbG93fSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7UmVsZWFzZU5vdGVzfSBmcm9tICcuLi8uLi9ub3Rlcy9yZWxlYXNlLW5vdGVzJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtjb21wdXRlTmV3UHJlcmVsZWFzZVZlcnNpb25Gb3JOZXh0fSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL25leHQtcHJlcmVsZWFzZS12ZXJzaW9uJztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JFeGNlcHRpb25hbE5leHRWZXJzaW9uQnVtcCwgZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vY29tbWl0LW1lc3NhZ2UnO1xuaW1wb3J0IHtjaGFuZ2Vsb2dQYXRoLCBwYWNrYWdlSnNvblBhdGh9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBtb3ZlcyB0aGUgbmV4dCByZWxlYXNlLXRyYWluIGludG8gdGhlIGZlYXR1cmUtZnJlZXplIHBoYXNlLiBUaGlzIG1lYW5zXG4gKiB0aGF0IGEgbmV3IHZlcnNpb24gYnJhbmNoIGlzIGNyZWF0ZWQgZnJvbSB0aGUgbmV4dCBicmFuY2gsIGFuZCBhIG5ldyBuZXh0IHByZS1yZWxlYXNlIGlzXG4gKiBjdXQgaW5kaWNhdGluZyB0aGUgc3RhcnRlZCBmZWF0dXJlLWZyZWV6ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdmVOZXh0SW50b0ZlYXR1cmVGcmVlemVBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbiA9IGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQodGhpcy5hY3RpdmUsIHRoaXMuY29uZmlnKTtcblxuICBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBhd2FpdCB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgTW92ZSB0aGUgXCIke2JyYW5jaE5hbWV9XCIgYnJhbmNoIGludG8gZmVhdHVyZS1mcmVlemUgcGhhc2UgKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gYXdhaXQgdGhpcy5fbmV3VmVyc2lvbjtcbiAgICBjb25zdCBuZXdCcmFuY2ggPSBgJHtuZXdWZXJzaW9uLm1ham9yfS4ke25ld1ZlcnNpb24ubWlub3J9LnhgO1xuXG4gICAgLy8gQnJhbmNoLW9mZiB0aGUgbmV4dCBicmFuY2ggaW50byBhIGZlYXR1cmUtZnJlZXplIGJyYW5jaC5cbiAgICBhd2FpdCB0aGlzLl9jcmVhdGVOZXdWZXJzaW9uQnJhbmNoRnJvbU5leHQobmV3QnJhbmNoKTtcblxuICAgIC8vIFN0YWdlIHRoZSBuZXcgdmVyc2lvbiBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgYnJhbmNoLCBhbmQgcHVzaCBjaGFuZ2VzIHRvIGFcbiAgICAvLyBmb3JrIGluIG9yZGVyIHRvIGNyZWF0ZSBhIHN0YWdpbmcgcHVsbCByZXF1ZXN0LiBOb3RlIHRoYXQgd2UgcmUtdXNlIHRoZSBuZXdseVxuICAgIC8vIGNyZWF0ZWQgYnJhbmNoIGluc3RlYWQgb2YgcmUtZmV0Y2hpbmcgZnJvbSB0aGUgdXBzdHJlYW0uXG4gICAgY29uc3Qge3B1bGxSZXF1ZXN0OiB7aWR9LCByZWxlYXNlTm90ZXN9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5zdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChuZXdWZXJzaW9uLCBuZXdCcmFuY2gpO1xuXG4gICAgLy8gV2FpdCBmb3IgdGhlIHN0YWdpbmcgUFIgdG8gYmUgbWVyZ2VkLiBUaGVuIGJ1aWxkIGFuZCBwdWJsaXNoIHRoZSBmZWF0dXJlLWZyZWV6ZSBuZXh0XG4gICAgLy8gcHJlLXJlbGVhc2UuIEZpbmFsbHksIGNoZXJyeS1waWNrIHRoZSByZWxlYXNlIG5vdGVzIGludG8gdGhlIG5leHQgYnJhbmNoIGluIGNvbWJpbmF0aW9uXG4gICAgLy8gd2l0aCBidW1waW5nIHRoZSB2ZXJzaW9uIHRvIHRoZSBuZXh0IG1pbm9yIHRvby5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQpO1xuICAgIGF3YWl0IHRoaXMuYnVpbGRBbmRQdWJsaXNoKHJlbGVhc2VOb3RlcywgbmV3QnJhbmNoLCAnbmV4dCcpO1xuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZU5leHRCcmFuY2hVcGRhdGVQdWxsUmVxdWVzdChyZWxlYXNlTm90ZXMsIG5ld1ZlcnNpb24pO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgYSBuZXcgdmVyc2lvbiBicmFuY2ggZnJvbSB0aGUgbmV4dCBicmFuY2guICovXG4gIHByaXZhdGUgYXN5bmMgX2NyZWF0ZU5ld1ZlcnNpb25CcmFuY2hGcm9tTmV4dChuZXdCcmFuY2g6IHN0cmluZykge1xuICAgIGNvbnN0IHticmFuY2hOYW1lOiBuZXh0QnJhbmNofSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKG5leHRCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQobmV3QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLnB1c2hIZWFkVG9SZW1vdGVCcmFuY2gobmV3QnJhbmNoKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFZlcnNpb24gYnJhbmNoIFwiJHtuZXdCcmFuY2h9XCIgY3JlYXRlZC5gKSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHB1bGwgcmVxdWVzdCBmb3IgdGhlIG5leHQgYnJhbmNoIHRoYXQgYnVtcHMgdGhlIHZlcnNpb24gdG8gdGhlIG5leHRcbiAgICogbWlub3IsIGFuZCBjaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmb3IgdGhlIG5ld2x5IGJyYW5jaGVkLW9mZiBmZWF0dXJlLWZyZWV6ZSB2ZXJzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlTmV4dEJyYW5jaFVwZGF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZTogbmV4dEJyYW5jaCwgdmVyc2lvbn0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIC8vIFdlIGluY3JlYXNlIHRoZSB2ZXJzaW9uIGZvciB0aGUgbmV4dCBicmFuY2ggdG8gdGhlIG5leHQgbWlub3IuIFRoZSB0ZWFtIGNhbiBkZWNpZGVcbiAgICAvLyBsYXRlciBpZiB0aGV5IHdhbnQgbmV4dCB0byBiZSBhIG1ham9yIHRocm91Z2ggdGhlIGBDb25maWd1cmUgTmV4dCBhcyBNYWpvcmAgcmVsZWFzZSBhY3Rpb24uXG4gICAgY29uc3QgbmV3TmV4dFZlcnNpb24gPSBzZW12ZXIucGFyc2UoYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yICsgMX0uMC1uZXh0LjBgKSE7XG4gICAgY29uc3QgYnVtcENvbW1pdE1lc3NhZ2UgPSBnZXRDb21taXRNZXNzYWdlRm9yRXhjZXB0aW9uYWxOZXh0VmVyc2lvbkJ1bXAobmV3TmV4dFZlcnNpb24pO1xuXG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKG5leHRCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3TmV4dFZlcnNpb24pO1xuXG4gICAgLy8gQ3JlYXRlIGFuIGluZGl2aWR1YWwgY29tbWl0IGZvciB0aGUgbmV4dCB2ZXJzaW9uIGJ1bXAuIFRoZSBjaGFuZ2Vsb2cgc2hvdWxkIGdvIGludG9cbiAgICAvLyBhIHNlcGFyYXRlIGNvbW1pdCB0aGF0IG1ha2VzIGl0IGNsZWFyIHdoZXJlIHRoZSBjaGFuZ2Vsb2cgaXMgY2hlcnJ5LXBpY2tlZCBmcm9tLlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGJ1bXBDb21taXRNZXNzYWdlLCBbcGFja2FnZUpzb25QYXRoXSk7XG5cbiAgICBhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXMpO1xuXG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2UocmVsZWFzZU5vdGVzLnZlcnNpb24pO1xuXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoY29tbWl0TWVzc2FnZSwgW2NoYW5nZWxvZ1BhdGhdKTtcblxuICAgIGxldCBuZXh0UHVsbFJlcXVlc3RNZXNzYWdlID0gYFRoZSBwcmV2aW91cyBcIm5leHRcIiByZWxlYXNlLXRyYWluIGhhcyBtb3ZlZCBpbnRvIHRoZSBgICtcbiAgICAgICAgYHJlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBUaGlzIFBSIHVwZGF0ZXMgdGhlIG5leHQgYnJhbmNoIHRvIHRoZSBzdWJzZXF1ZW50IGAgK1xuICAgICAgICBgcmVsZWFzZS10cmFpbi5cXG5cXG5BbHNvIHRoaXMgUFIgY2hlcnJ5LXBpY2tzIHRoZSBjaGFuZ2Vsb2cgZm9yIGAgK1xuICAgICAgICBgdiR7bmV3VmVyc2lvbn0gaW50byB0aGUgJHtuZXh0QnJhbmNofSBicmFuY2ggc28gdGhhdCB0aGUgY2hhbmdlbG9nIGlzIHVwIHRvIGRhdGUuYDtcblxuICAgIGNvbnN0IG5leHRVcGRhdGVQdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgbmV4dEJyYW5jaCwgYG5leHQtcmVsZWFzZS10cmFpbi0ke25ld05leHRWZXJzaW9ufWAsXG4gICAgICAgIGBVcGRhdGUgbmV4dCBicmFuY2ggdG8gcmVmbGVjdCBuZXcgcmVsZWFzZS10cmFpbiBcInYke25ld05leHRWZXJzaW9ufVwiLmAsXG4gICAgICAgIG5leHRQdWxsUmVxdWVzdE1lc3NhZ2UpO1xuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBQdWxsIHJlcXVlc3QgZm9yIHVwZGF0aW5nIHRoZSBcIiR7bmV4dEJyYW5jaH1cIiBicmFuY2ggaGFzIGJlZW4gY3JlYXRlZC5gKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtuZXh0VXBkYXRlUHVsbFJlcXVlc3QudXJsfS5gKSk7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgLy8gQSBuZXcgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoIGNhbiBvbmx5IGJlIGNyZWF0ZWQgaWYgdGhlcmVcbiAgICAvLyBpcyBubyBhY3RpdmUgcmVsZWFzZS10cmFpbiBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS5cbiAgICByZXR1cm4gYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUgPT09IG51bGw7XG4gIH1cbn1cbiJdfQ==