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
import { semverInc } from '../../../utils/semver';
import { computeNewPrereleaseVersionForNext } from '../../versioning/next-prerelease-version';
import { ReleaseAction } from '../actions';
import { getCommitMessageForExceptionalNextVersionBump, getReleaseNoteCherryPickCommitMessage } from '../commit-message';
import { changelogPath, packageJsonPath } from '../constants';
/**
 * Base action that can be used to move the next release-train into the feature-freeze or
 * release-candidate phase. This means that a new version branch is created from the next
 * branch, and a new pre-release (either RC or another `next`) is cut indicating the new phase.
 */
export class BranchOffNextBranchBaseAction extends ReleaseAction {
    getDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            const { branchName } = this.active.next;
            const newVersion = yield this._computeNewVersion();
            return `Move the "${branchName}" branch into ${this.newPhaseName} phase (v${newVersion}).`;
        });
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            const newVersion = yield this._computeNewVersion();
            const newBranch = `${newVersion.major}.${newVersion.minor}.x`;
            // Branch-off the next branch into a new version branch.
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
    /** Computes the new version for the release-train being branched-off. */
    _computeNewVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.newPhaseName === 'feature-freeze') {
                return computeNewPrereleaseVersionForNext(this.active, this.config);
            }
            else {
                return semverInc(this.active.next.version, 'prerelease', 'rc');
            }
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
     * minor, and cherry-picks the changelog for the newly branched-off release-candidate
     * or feature-freeze version.
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
                `${this.newPhaseName} phase. This PR updates the next branch to the subsequent ` +
                `release-train.\n\nAlso this PR cherry-picks the changelog for ` +
                `v${newVersion} into the ${nextBranch} branch so that the changelog is up to date.`;
            const nextUpdatePullRequest = yield this.pushChangesToForkAndCreatePullRequest(nextBranch, `next-release-train-${newNextVersion}`, `Update next branch to reflect new release-train "v${newNextVersion}".`, nextPullRequestMessage);
            info(green(`  ✓   Pull request for updating the "${nextBranch}" branch has been created.`));
            info(yellow(`      Please ask team members to review: ${nextUpdatePullRequest.url}.`));
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmNoLW9mZi1uZXh0LWJyYW5jaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9icmFuY2gtb2ZmLW5leHQtYnJhbmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUVqQyxPQUFPLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFHaEQsT0FBTyxFQUFDLGtDQUFrQyxFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFDNUYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUN6QyxPQUFPLEVBQUMsNkNBQTZDLEVBQUUscUNBQXFDLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUN2SCxPQUFPLEVBQUMsYUFBYSxFQUFFLGVBQWUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUU1RDs7OztHQUlHO0FBQ0gsTUFBTSxPQUFnQiw2QkFBOEIsU0FBUSxhQUFhO0lBVXhELGNBQWM7O1lBQzNCLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN0QyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ25ELE9BQU8sYUFBYSxVQUFVLGlCQUFpQixJQUFJLENBQUMsWUFBWSxZQUFZLFVBQVUsSUFBSSxDQUFDO1FBQzdGLENBQUM7S0FBQTtJQUVjLE9BQU87O1lBQ3BCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDbkQsTUFBTSxTQUFTLEdBQUcsR0FBRyxVQUFVLENBQUMsS0FBSyxJQUFJLFVBQVUsQ0FBQyxLQUFLLElBQUksQ0FBQztZQUU5RCx3REFBd0Q7WUFDeEQsTUFBTSxJQUFJLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdEQsNEVBQTRFO1lBQzVFLGdGQUFnRjtZQUNoRiwyREFBMkQ7WUFDM0QsTUFBTSxFQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUMsR0FDN0IsTUFBTSxJQUFJLENBQUMseUNBQXlDLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRWhGLHVGQUF1RjtZQUN2RiwwRkFBMEY7WUFDMUYsa0RBQWtEO1lBQ2xELE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVELE1BQU0sSUFBSSxDQUFDLGtDQUFrQyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMxRSxDQUFDO0tBQUE7SUFFRCx5RUFBeUU7SUFDM0Qsa0JBQWtCOztZQUM5QixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssZ0JBQWdCLEVBQUU7Z0JBQzFDLE9BQU8sa0NBQWtDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDckU7aUJBQU07Z0JBQ0wsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNoRTtRQUNILENBQUM7S0FBQTtJQUVELHlEQUF5RDtJQUMzQywrQkFBK0IsQ0FBQyxTQUFpQjs7WUFDN0QsTUFBTSxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNsRCxNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqRCxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5QyxNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRCxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsS0FBSyxDQUFDLHlCQUF5QixTQUFTLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDOUQsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNXLGtDQUFrQyxDQUM1QyxZQUEwQixFQUFFLFVBQXlCOztZQUN2RCxNQUFNLEVBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUMzRCxxRkFBcUY7WUFDckYsOEZBQThGO1lBQzlGLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxXQUFXLENBQUUsQ0FBQztZQUN2RixNQUFNLGlCQUFpQixHQUFHLDZDQUE2QyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRXhGLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRWhELHNGQUFzRjtZQUN0RixtRkFBbUY7WUFDbkYsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUU5RCxNQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUV4RCxNQUFNLGFBQWEsR0FBRyxxQ0FBcUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFbEYsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFFeEQsSUFBSSxzQkFBc0IsR0FBRyx1REFBdUQ7Z0JBQ2hGLEdBQUcsSUFBSSxDQUFDLFlBQVksNERBQTREO2dCQUNoRixnRUFBZ0U7Z0JBQ2hFLElBQUksVUFBVSxhQUFhLFVBQVUsOENBQThDLENBQUM7WUFFeEYsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLElBQUksQ0FBQyxxQ0FBcUMsQ0FDMUUsVUFBVSxFQUFFLHNCQUFzQixjQUFjLEVBQUUsRUFDbEQscURBQXFELGNBQWMsSUFBSSxFQUN2RSxzQkFBc0IsQ0FBQyxDQUFDO1lBRTVCLElBQUksQ0FBQyxLQUFLLENBQUMsd0NBQXdDLFVBQVUsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQzVGLElBQUksQ0FBQyxNQUFNLENBQUMsNENBQTRDLHFCQUFxQixDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RixDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtncmVlbiwgaW5mbywgeWVsbG93fSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7c2VtdmVySW5jfSBmcm9tICcuLi8uLi8uLi91dGlscy9zZW12ZXInO1xuaW1wb3J0IHtSZWxlYXNlTm90ZXN9IGZyb20gJy4uLy4uL25vdGVzL3JlbGVhc2Utbm90ZXMnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2NvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHR9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvbmV4dC1wcmVyZWxlYXNlLXZlcnNpb24nO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcbmltcG9ydCB7Z2V0Q29tbWl0TWVzc2FnZUZvckV4Y2VwdGlvbmFsTmV4dFZlcnNpb25CdW1wLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge2NoYW5nZWxvZ1BhdGgsIHBhY2thZ2VKc29uUGF0aH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBCYXNlIGFjdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIG1vdmUgdGhlIG5leHQgcmVsZWFzZS10cmFpbiBpbnRvIHRoZSBmZWF0dXJlLWZyZWV6ZSBvclxuICogcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuIFRoaXMgbWVhbnMgdGhhdCBhIG5ldyB2ZXJzaW9uIGJyYW5jaCBpcyBjcmVhdGVkIGZyb20gdGhlIG5leHRcbiAqIGJyYW5jaCwgYW5kIGEgbmV3IHByZS1yZWxlYXNlIChlaXRoZXIgUkMgb3IgYW5vdGhlciBgbmV4dGApIGlzIGN1dCBpbmRpY2F0aW5nIHRoZSBuZXcgcGhhc2UuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCcmFuY2hPZmZOZXh0QnJhbmNoQmFzZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICAvKipcbiAgICogUGhhc2Ugd2hpY2ggdGhlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBgbmV4dGAgcGhhc2Ugd2lsbCBtb3ZlIGludG8uXG4gICAqXG4gICAqIE5vdGUgdGhhdCB3ZSBvbmx5IGFsbG93IGZvciBhIG5leHQgdmVyc2lvbiB0byBicmFuY2ggaW50byBmZWF0dXJlLWZyZWV6ZSBvclxuICAgKiBkaXJlY3RseSBpbnRvIHRoZSByZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gQSBzdGFibGUgdmVyc2lvbiBjYW5ub3QgYmUgcmVsZWFzZWRcbiAgICogd2l0aG91dCByZWxlYXNlLWNhbmRpZGF0ZS5cbiAgICovXG4gIGFic3RyYWN0IG5ld1BoYXNlTmFtZTogJ2ZlYXR1cmUtZnJlZXplJ3wncmVsZWFzZS1jYW5kaWRhdGUnO1xuXG4gIG92ZXJyaWRlIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX2NvbXB1dGVOZXdWZXJzaW9uKCk7XG4gICAgcmV0dXJuIGBNb3ZlIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggaW50byAke3RoaXMubmV3UGhhc2VOYW1lfSBwaGFzZSAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBhd2FpdCB0aGlzLl9jb21wdXRlTmV3VmVyc2lvbigpO1xuICAgIGNvbnN0IG5ld0JyYW5jaCA9IGAke25ld1ZlcnNpb24ubWFqb3J9LiR7bmV3VmVyc2lvbi5taW5vcn0ueGA7XG5cbiAgICAvLyBCcmFuY2gtb2ZmIHRoZSBuZXh0IGJyYW5jaCBpbnRvIGEgbmV3IHZlcnNpb24gYnJhbmNoLlxuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZU5ld1ZlcnNpb25CcmFuY2hGcm9tTmV4dChuZXdCcmFuY2gpO1xuXG4gICAgLy8gU3RhZ2UgdGhlIG5ldyB2ZXJzaW9uIGZvciB0aGUgbmV3bHkgY3JlYXRlZCBicmFuY2gsIGFuZCBwdXNoIGNoYW5nZXMgdG8gYVxuICAgIC8vIGZvcmsgaW4gb3JkZXIgdG8gY3JlYXRlIGEgc3RhZ2luZyBwdWxsIHJlcXVlc3QuIE5vdGUgdGhhdCB3ZSByZS11c2UgdGhlIG5ld2x5XG4gICAgLy8gY3JlYXRlZCBicmFuY2ggaW5zdGVhZCBvZiByZS1mZXRjaGluZyBmcm9tIHRoZSB1cHN0cmVhbS5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3QsIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KG5ld1ZlcnNpb24sIG5ld0JyYW5jaCk7XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgc3RhZ2luZyBQUiB0byBiZSBtZXJnZWQuIFRoZW4gYnVpbGQgYW5kIHB1Ymxpc2ggdGhlIGZlYXR1cmUtZnJlZXplIG5leHRcbiAgICAvLyBwcmUtcmVsZWFzZS4gRmluYWxseSwgY2hlcnJ5LXBpY2sgdGhlIHJlbGVhc2Ugbm90ZXMgaW50byB0aGUgbmV4dCBicmFuY2ggaW4gY29tYmluYXRpb25cbiAgICAvLyB3aXRoIGJ1bXBpbmcgdGhlIHZlcnNpb24gdG8gdGhlIG5leHQgbWlub3IgdG9vLlxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBuZXdCcmFuY2gsICduZXh0Jyk7XG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlTmV4dEJyYW5jaFVwZGF0ZVB1bGxSZXF1ZXN0KHJlbGVhc2VOb3RlcywgbmV3VmVyc2lvbik7XG4gIH1cblxuICAvKiogQ29tcHV0ZXMgdGhlIG5ldyB2ZXJzaW9uIGZvciB0aGUgcmVsZWFzZS10cmFpbiBiZWluZyBicmFuY2hlZC1vZmYuICovXG4gIHByaXZhdGUgYXN5bmMgX2NvbXB1dGVOZXdWZXJzaW9uKCkge1xuICAgIGlmICh0aGlzLm5ld1BoYXNlTmFtZSA9PT0gJ2ZlYXR1cmUtZnJlZXplJykge1xuICAgICAgcmV0dXJuIGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQodGhpcy5hY3RpdmUsIHRoaXMuY29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNlbXZlckluYyh0aGlzLmFjdGl2ZS5uZXh0LnZlcnNpb24sICdwcmVyZWxlYXNlJywgJ3JjJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENyZWF0ZXMgYSBuZXcgdmVyc2lvbiBicmFuY2ggZnJvbSB0aGUgbmV4dCBicmFuY2guICovXG4gIHByaXZhdGUgYXN5bmMgX2NyZWF0ZU5ld1ZlcnNpb25CcmFuY2hGcm9tTmV4dChuZXdCcmFuY2g6IHN0cmluZykge1xuICAgIGNvbnN0IHticmFuY2hOYW1lOiBuZXh0QnJhbmNofSA9IHRoaXMuYWN0aXZlLm5leHQ7XG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKG5leHRCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQobmV3QnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLnB1c2hIZWFkVG9SZW1vdGVCcmFuY2gobmV3QnJhbmNoKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFZlcnNpb24gYnJhbmNoIFwiJHtuZXdCcmFuY2h9XCIgY3JlYXRlZC5gKSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHB1bGwgcmVxdWVzdCBmb3IgdGhlIG5leHQgYnJhbmNoIHRoYXQgYnVtcHMgdGhlIHZlcnNpb24gdG8gdGhlIG5leHRcbiAgICogbWlub3IsIGFuZCBjaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmb3IgdGhlIG5ld2x5IGJyYW5jaGVkLW9mZiByZWxlYXNlLWNhbmRpZGF0ZVxuICAgKiBvciBmZWF0dXJlLWZyZWV6ZSB2ZXJzaW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlTmV4dEJyYW5jaFVwZGF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZTogbmV4dEJyYW5jaCwgdmVyc2lvbn0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIC8vIFdlIGluY3JlYXNlIHRoZSB2ZXJzaW9uIGZvciB0aGUgbmV4dCBicmFuY2ggdG8gdGhlIG5leHQgbWlub3IuIFRoZSB0ZWFtIGNhbiBkZWNpZGVcbiAgICAvLyBsYXRlciBpZiB0aGV5IHdhbnQgbmV4dCB0byBiZSBhIG1ham9yIHRocm91Z2ggdGhlIGBDb25maWd1cmUgTmV4dCBhcyBNYWpvcmAgcmVsZWFzZSBhY3Rpb24uXG4gICAgY29uc3QgbmV3TmV4dFZlcnNpb24gPSBzZW12ZXIucGFyc2UoYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yICsgMX0uMC1uZXh0LjBgKSE7XG4gICAgY29uc3QgYnVtcENvbW1pdE1lc3NhZ2UgPSBnZXRDb21taXRNZXNzYWdlRm9yRXhjZXB0aW9uYWxOZXh0VmVyc2lvbkJ1bXAobmV3TmV4dFZlcnNpb24pO1xuXG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKG5leHRCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3TmV4dFZlcnNpb24pO1xuXG4gICAgLy8gQ3JlYXRlIGFuIGluZGl2aWR1YWwgY29tbWl0IGZvciB0aGUgbmV4dCB2ZXJzaW9uIGJ1bXAuIFRoZSBjaGFuZ2Vsb2cgc2hvdWxkIGdvIGludG9cbiAgICAvLyBhIHNlcGFyYXRlIGNvbW1pdCB0aGF0IG1ha2VzIGl0IGNsZWFyIHdoZXJlIHRoZSBjaGFuZ2Vsb2cgaXMgY2hlcnJ5LXBpY2tlZCBmcm9tLlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGJ1bXBDb21taXRNZXNzYWdlLCBbcGFja2FnZUpzb25QYXRoXSk7XG5cbiAgICBhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXMpO1xuXG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2UocmVsZWFzZU5vdGVzLnZlcnNpb24pO1xuXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoY29tbWl0TWVzc2FnZSwgW2NoYW5nZWxvZ1BhdGhdKTtcblxuICAgIGxldCBuZXh0UHVsbFJlcXVlc3RNZXNzYWdlID0gYFRoZSBwcmV2aW91cyBcIm5leHRcIiByZWxlYXNlLXRyYWluIGhhcyBtb3ZlZCBpbnRvIHRoZSBgICtcbiAgICAgICAgYCR7dGhpcy5uZXdQaGFzZU5hbWV9IHBoYXNlLiBUaGlzIFBSIHVwZGF0ZXMgdGhlIG5leHQgYnJhbmNoIHRvIHRoZSBzdWJzZXF1ZW50IGAgK1xuICAgICAgICBgcmVsZWFzZS10cmFpbi5cXG5cXG5BbHNvIHRoaXMgUFIgY2hlcnJ5LXBpY2tzIHRoZSBjaGFuZ2Vsb2cgZm9yIGAgK1xuICAgICAgICBgdiR7bmV3VmVyc2lvbn0gaW50byB0aGUgJHtuZXh0QnJhbmNofSBicmFuY2ggc28gdGhhdCB0aGUgY2hhbmdlbG9nIGlzIHVwIHRvIGRhdGUuYDtcblxuICAgIGNvbnN0IG5leHRVcGRhdGVQdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgbmV4dEJyYW5jaCwgYG5leHQtcmVsZWFzZS10cmFpbi0ke25ld05leHRWZXJzaW9ufWAsXG4gICAgICAgIGBVcGRhdGUgbmV4dCBicmFuY2ggdG8gcmVmbGVjdCBuZXcgcmVsZWFzZS10cmFpbiBcInYke25ld05leHRWZXJzaW9ufVwiLmAsXG4gICAgICAgIG5leHRQdWxsUmVxdWVzdE1lc3NhZ2UpO1xuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBQdWxsIHJlcXVlc3QgZm9yIHVwZGF0aW5nIHRoZSBcIiR7bmV4dEJyYW5jaH1cIiBicmFuY2ggaGFzIGJlZW4gY3JlYXRlZC5gKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtuZXh0VXBkYXRlUHVsbFJlcXVlc3QudXJsfS5gKSk7XG4gIH1cbn1cbiJdfQ==