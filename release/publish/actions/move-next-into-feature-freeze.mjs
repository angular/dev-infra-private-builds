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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvbW92ZS1uZXh0LWludG8tZmVhdHVyZS1mcmVlemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBRWpDLE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRTNELE9BQU8sRUFBQyxrQ0FBa0MsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQzVGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDekMsT0FBTyxFQUFDLDZDQUE2QyxFQUFFLHFDQUFxQyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDdkgsT0FBTyxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFHNUQ7Ozs7R0FJRztBQUNILE1BQU0sT0FBTywrQkFBZ0MsU0FBUSxhQUFhO0lBQWxFOztRQUNVLGdCQUFXLEdBQUcsa0NBQWtDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFtRnJGLENBQUM7SUFqRk8sY0FBYzs7WUFDbEIsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3RDLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUMxQyxPQUFPLGFBQWEsVUFBVSx3Q0FBd0MsVUFBVSxJQUFJLENBQUM7UUFDdkYsQ0FBQztLQUFBO0lBRUssT0FBTzs7WUFDWCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDMUMsTUFBTSxTQUFTLEdBQUcsR0FB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LENBQUMsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxNQUFNLENBQUMsNENBQTRDLHFCQUFxQixDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RixDQUFDO0tBQUE7SUFFRCxNQUFNLENBQU8sUUFBUSxDQUFDLE1BQTJCOztZQUMvQyw2RUFBNkU7WUFDN0Usd0VBQXdFO1lBQ3hFLE9BQU8sTUFBTSxDQUFDLGdCQUFnQixLQUFLLElBQUksQ0FBQztRQUMxQyxDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtncmVlbiwgaW5mbywgeWVsbG93fSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtjb21wdXRlTmV3UHJlcmVsZWFzZVZlcnNpb25Gb3JOZXh0fSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL25leHQtcHJlcmVsZWFzZS12ZXJzaW9uJztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JFeGNlcHRpb25hbE5leHRWZXJzaW9uQnVtcCwgZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vY29tbWl0LW1lc3NhZ2UnO1xuaW1wb3J0IHtjaGFuZ2Vsb2dQYXRoLCBwYWNrYWdlSnNvblBhdGh9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQge1JlbGVhc2VOb3Rlc30gZnJvbSAnLi4vcmVsZWFzZS1ub3Rlcy9yZWxlYXNlLW5vdGVzJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IG1vdmVzIHRoZSBuZXh0IHJlbGVhc2UtdHJhaW4gaW50byB0aGUgZmVhdHVyZS1mcmVlemUgcGhhc2UuIFRoaXMgbWVhbnNcbiAqIHRoYXQgYSBuZXcgdmVyc2lvbiBicmFuY2ggaXMgY3JlYXRlZCBmcm9tIHRoZSBuZXh0IGJyYW5jaCwgYW5kIGEgbmV3IG5leHQgcHJlLXJlbGVhc2UgaXNcbiAqIGN1dCBpbmRpY2F0aW5nIHRoZSBzdGFydGVkIGZlYXR1cmUtZnJlZXplLlxuICovXG5leHBvcnQgY2xhc3MgTW92ZU5leHRJbnRvRmVhdHVyZUZyZWV6ZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBwcml2YXRlIF9uZXdWZXJzaW9uID0gY29tcHV0ZU5ld1ByZXJlbGVhc2VWZXJzaW9uRm9yTmV4dCh0aGlzLmFjdGl2ZSwgdGhpcy5jb25maWcpO1xuXG4gIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBNb3ZlIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggaW50byBmZWF0dXJlLWZyZWV6ZSBwaGFzZSAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBhd2FpdCB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIGNvbnN0IG5ld0JyYW5jaCA9IGAke25ld1ZlcnNpb24ubWFqb3J9LiR7bmV3VmVyc2lvbi5taW5vcn0ueGA7XG5cbiAgICAvLyBCcmFuY2gtb2ZmIHRoZSBuZXh0IGJyYW5jaCBpbnRvIGEgZmVhdHVyZS1mcmVlemUgYnJhbmNoLlxuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZU5ld1ZlcnNpb25CcmFuY2hGcm9tTmV4dChuZXdCcmFuY2gpO1xuXG4gICAgLy8gU3RhZ2UgdGhlIG5ldyB2ZXJzaW9uIGZvciB0aGUgbmV3bHkgY3JlYXRlZCBicmFuY2gsIGFuZCBwdXNoIGNoYW5nZXMgdG8gYVxuICAgIC8vIGZvcmsgaW4gb3JkZXIgdG8gY3JlYXRlIGEgc3RhZ2luZyBwdWxsIHJlcXVlc3QuIE5vdGUgdGhhdCB3ZSByZS11c2UgdGhlIG5ld2x5XG4gICAgLy8gY3JlYXRlZCBicmFuY2ggaW5zdGVhZCBvZiByZS1mZXRjaGluZyBmcm9tIHRoZSB1cHN0cmVhbS5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3Q6IHtpZH0sIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KG5ld1ZlcnNpb24sIG5ld0JyYW5jaCk7XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgc3RhZ2luZyBQUiB0byBiZSBtZXJnZWQuIFRoZW4gYnVpbGQgYW5kIHB1Ymxpc2ggdGhlIGZlYXR1cmUtZnJlZXplIG5leHRcbiAgICAvLyBwcmUtcmVsZWFzZS4gRmluYWxseSwgY2hlcnJ5LXBpY2sgdGhlIHJlbGVhc2Ugbm90ZXMgaW50byB0aGUgbmV4dCBicmFuY2ggaW4gY29tYmluYXRpb25cbiAgICAvLyB3aXRoIGJ1bXBpbmcgdGhlIHZlcnNpb24gdG8gdGhlIG5leHQgbWlub3IgdG9vLlxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChpZCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBuZXdCcmFuY2gsICduZXh0Jyk7XG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlTmV4dEJyYW5jaFVwZGF0ZVB1bGxSZXF1ZXN0KHJlbGVhc2VOb3RlcywgbmV3VmVyc2lvbik7XG4gIH1cblxuICAvKiogQ3JlYXRlcyBhIG5ldyB2ZXJzaW9uIGJyYW5jaCBmcm9tIHRoZSBuZXh0IGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlTmV3VmVyc2lvbkJyYW5jaEZyb21OZXh0KG5ld0JyYW5jaDogc3RyaW5nKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWU6IG5leHRCcmFuY2h9ID0gdGhpcy5hY3RpdmUubmV4dDtcbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMobmV4dEJyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKG5leHRCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChuZXdCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMucHVzaEhlYWRUb1JlbW90ZUJyYW5jaChuZXdCcmFuY2gpO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVmVyc2lvbiBicmFuY2ggXCIke25ld0JyYW5jaH1cIiBjcmVhdGVkLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcHVsbCByZXF1ZXN0IGZvciB0aGUgbmV4dCBicmFuY2ggdGhhdCBidW1wcyB0aGUgdmVyc2lvbiB0byB0aGUgbmV4dFxuICAgKiBtaW5vciwgYW5kIGNoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZvciB0aGUgbmV3bHkgYnJhbmNoZWQtb2ZmIGZlYXR1cmUtZnJlZXplIHZlcnNpb24uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVOZXh0QnJhbmNoVXBkYXRlUHVsbFJlcXVlc3QoXG4gICAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgbmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGNvbnN0IHticmFuY2hOYW1lOiBuZXh0QnJhbmNoLCB2ZXJzaW9ufSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgLy8gV2UgaW5jcmVhc2UgdGhlIHZlcnNpb24gZm9yIHRoZSBuZXh0IGJyYW5jaCB0byB0aGUgbmV4dCBtaW5vci4gVGhlIHRlYW0gY2FuIGRlY2lkZVxuICAgIC8vIGxhdGVyIGlmIHRoZXkgd2FudCBuZXh0IHRvIGJlIGEgbWFqb3IgdGhyb3VnaCB0aGUgYENvbmZpZ3VyZSBOZXh0IGFzIE1ham9yYCByZWxlYXNlIGFjdGlvbi5cbiAgICBjb25zdCBuZXdOZXh0VmVyc2lvbiA9IHNlbXZlci5wYXJzZShgJHt2ZXJzaW9uLm1ham9yfS4ke3ZlcnNpb24ubWlub3IgKyAxfS4wLW5leHQuMGApITtcbiAgICBjb25zdCBidW1wQ29tbWl0TWVzc2FnZSA9IGdldENvbW1pdE1lc3NhZ2VGb3JFeGNlcHRpb25hbE5leHRWZXJzaW9uQnVtcChuZXdOZXh0VmVyc2lvbik7XG5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gobmV4dEJyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVQcm9qZWN0VmVyc2lvbihuZXdOZXh0VmVyc2lvbik7XG5cbiAgICAvLyBDcmVhdGUgYW4gaW5kaXZpZHVhbCBjb21taXQgZm9yIHRoZSBuZXh0IHZlcnNpb24gYnVtcC4gVGhlIGNoYW5nZWxvZyBzaG91bGQgZ28gaW50b1xuICAgIC8vIGEgc2VwYXJhdGUgY29tbWl0IHRoYXQgbWFrZXMgaXQgY2xlYXIgd2hlcmUgdGhlIGNoYW5nZWxvZyBpcyBjaGVycnktcGlja2VkIGZyb20uXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoYnVtcENvbW1pdE1lc3NhZ2UsIFtwYWNrYWdlSnNvblBhdGhdKTtcblxuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG5cbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZShyZWxlYXNlTm90ZXMudmVyc2lvbik7XG5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbY2hhbmdlbG9nUGF0aF0pO1xuXG4gICAgbGV0IG5leHRQdWxsUmVxdWVzdE1lc3NhZ2UgPSBgVGhlIHByZXZpb3VzIFwibmV4dFwiIHJlbGVhc2UtdHJhaW4gaGFzIG1vdmVkIGludG8gdGhlIGAgK1xuICAgICAgICBgcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuIFRoaXMgUFIgdXBkYXRlcyB0aGUgbmV4dCBicmFuY2ggdG8gdGhlIHN1YnNlcXVlbnQgYCArXG4gICAgICAgIGByZWxlYXNlLXRyYWluLlxcblxcbkFsc28gdGhpcyBQUiBjaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmb3IgYCArXG4gICAgICAgIGB2JHtuZXdWZXJzaW9ufSBpbnRvIHRoZSAke25leHRCcmFuY2h9IGJyYW5jaCBzbyB0aGF0IHRoZSBjaGFuZ2Vsb2cgaXMgdXAgdG8gZGF0ZS5gO1xuXG4gICAgY29uc3QgbmV4dFVwZGF0ZVB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgICBuZXh0QnJhbmNoLCBgbmV4dC1yZWxlYXNlLXRyYWluLSR7bmV3TmV4dFZlcnNpb259YCxcbiAgICAgICAgYFVwZGF0ZSBuZXh0IGJyYW5jaCB0byByZWZsZWN0IG5ldyByZWxlYXNlLXRyYWluIFwidiR7bmV3TmV4dFZlcnNpb259XCIuYCxcbiAgICAgICAgbmV4dFB1bGxSZXF1ZXN0TWVzc2FnZSk7XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFB1bGwgcmVxdWVzdCBmb3IgdXBkYXRpbmcgdGhlIFwiJHtuZXh0QnJhbmNofVwiIGJyYW5jaCBoYXMgYmVlbiBjcmVhdGVkLmApKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke25leHRVcGRhdGVQdWxsUmVxdWVzdC51cmx9LmApKTtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBBIG5ldyBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggY2FuIG9ubHkgYmUgY3JlYXRlZCBpZiB0aGVyZVxuICAgIC8vIGlzIG5vIGFjdGl2ZSByZWxlYXNlLXRyYWluIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLlxuICAgIHJldHVybiBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSA9PT0gbnVsbDtcbiAgfVxufVxuIl19