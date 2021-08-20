"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTargetLabels = void 0;
const index_1 = require("../../../release/config/index");
const versioning_1 = require("../../../release/versioning");
const config_1 = require("../../../utils/config");
const git_client_1 = require("../../../utils/git/git-client");
const target_label_1 = require("../target-label");
const lts_branch_1 = require("./lts-branch");
/**
 * Gets a label configuration for the merge tooling that reflects the default Angular
 * organization-wide labeling and branching semantics as outlined in the specification.
 *
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU
 *
 * @param api Instance of an authenticated Github client.
 * @param githubConfig Configuration for the Github remote. Used as Git remote
 *   for the release train branches.
 * @param releaseConfig Configuration for the release packages. Used to fetch
 *   NPM version data when LTS version branches are validated.
 */
async function getTargetLabels(api = git_client_1.GitClient.get().github, config = config_1.getConfig()) {
    index_1.assertValidReleaseConfig(config);
    config_1.assertValidGithubConfig(config);
    const nextBranchName = versioning_1.getNextBranchName(config.github);
    const repo = {
        owner: config.github.owner,
        name: config.github.name,
        nextBranchName,
        api,
    };
    const { latest, releaseCandidate, next } = await versioning_1.fetchActiveReleaseTrains(repo);
    return [
        {
            pattern: 'target: major',
            branches: () => {
                // If `next` is currently not designated to be a major version, we do not
                // allow merging of PRs with `target: major`.
                if (!next.isMajor) {
                    throw new target_label_1.InvalidTargetLabelError(`Unable to merge pull request. The "${nextBranchName}" branch will be released as ` +
                        'a minor version.');
                }
                return [nextBranchName];
            },
        },
        {
            pattern: 'target: minor',
            // Changes labeled with `target: minor` are merged most commonly into the next branch
            // (i.e. `main`). In rare cases of an exceptional minor version while being
            // already on a major release train, this would need to be overridden manually.
            // TODO: Consider handling this automatically by checking if the NPM version matches
            // the last-minor. If not, then an exceptional minor might be in progress. See:
            // https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU/edit#heading=h.h7o5pjq6yqd0
            branches: [nextBranchName],
        },
        {
            pattern: 'target: patch',
            branches: (githubTargetBranch) => {
                // If a PR is targeting the latest active version-branch through the Github UI,
                // and is also labeled with `target: patch`, then we merge it directly into the
                // branch without doing any cherry-picking. This is useful if a PR could not be
                // applied cleanly, and a separate PR for the patch branch has been created.
                if (githubTargetBranch === latest.branchName) {
                    return [latest.branchName];
                }
                // Otherwise, patch changes are always merged into the next and patch branch.
                const branches = [nextBranchName, latest.branchName];
                // Additionally, if there is a release-candidate/feature-freeze release-train
                // currently active, also merge the PR into that version-branch.
                if (releaseCandidate !== null) {
                    branches.push(releaseCandidate.branchName);
                }
                return branches;
            },
        },
        {
            pattern: 'target: rc',
            branches: (githubTargetBranch) => {
                // The `target: rc` label cannot be applied if there is no active feature-freeze
                // or release-candidate release train.
                if (releaseCandidate === null) {
                    throw new target_label_1.InvalidTargetLabelError(`No active feature-freeze/release-candidate branch. ` +
                        `Unable to merge pull request using "target: rc" label.`);
                }
                // If the PR is targeting the active release-candidate/feature-freeze version branch
                // directly through the Github UI and has the `target: rc` label applied, merge it
                // only into the release candidate branch. This is useful if a PR did not apply cleanly
                // into the release-candidate/feature-freeze branch, and a separate PR has been created.
                if (githubTargetBranch === releaseCandidate.branchName) {
                    return [releaseCandidate.branchName];
                }
                // Otherwise, merge into the next and active release-candidate/feature-freeze branch.
                return [nextBranchName, releaseCandidate.branchName];
            },
        },
        {
            // LTS changes are rare enough that we won't worry about cherry-picking changes into all
            // active LTS branches for PRs created against any other branch. Instead, PR authors need
            // to manually create separate PRs for desired LTS branches. Additionally, active LT branches
            // commonly diverge quickly. This makes cherry-picking not an option for LTS changes.
            pattern: 'target: lts',
            branches: async (githubTargetBranch) => {
                if (!versioning_1.isVersionBranch(githubTargetBranch)) {
                    throw new target_label_1.InvalidTargetBranchError(`PR cannot be merged as it does not target a long-term support ` +
                        `branch: "${githubTargetBranch}"`);
                }
                if (githubTargetBranch === latest.branchName) {
                    throw new target_label_1.InvalidTargetBranchError(`PR cannot be merged with "target: lts" into patch branch. ` +
                        `Consider changing the label to "target: patch" if this is intentional.`);
                }
                if (releaseCandidate !== null && githubTargetBranch === releaseCandidate.branchName) {
                    throw new target_label_1.InvalidTargetBranchError(`PR cannot be merged with "target: lts" into feature-freeze/release-candidate ` +
                        `branch. Consider changing the label to "target: rc" if this is intentional.`);
                }
                // Assert that the selected branch is an active LTS branch.
                await lts_branch_1.assertActiveLtsBranch(repo, config.release, githubTargetBranch);
                return [githubTargetBranch];
            },
        },
    ];
}
exports.getTargetLabels = getTargetLabels;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL2RlZmF1bHRzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx5REFBc0Y7QUFDdEYsNERBS3FDO0FBQ3JDLGtEQUF1RjtBQUN2Riw4REFBd0Q7QUFHeEQsa0RBQWtGO0FBRWxGLDZDQUFtRDtBQUVuRDs7Ozs7Ozs7Ozs7R0FXRztBQUNJLEtBQUssVUFBVSxlQUFlLENBQ25DLEdBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFDNUIsU0FBUyxrQkFBUyxFQUE2RDtJQUUvRSxnQ0FBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxnQ0FBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVoQyxNQUFNLGNBQWMsR0FBRyw4QkFBaUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEQsTUFBTSxJQUFJLEdBQXVCO1FBQy9CLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUs7UUFDMUIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUN4QixjQUFjO1FBQ2QsR0FBRztLQUNKLENBQUM7SUFDRixNQUFNLEVBQUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBQyxHQUFHLE1BQU0scUNBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFOUUsT0FBTztRQUNMO1lBQ0UsT0FBTyxFQUFFLGVBQWU7WUFDeEIsUUFBUSxFQUFFLEdBQUcsRUFBRTtnQkFDYix5RUFBeUU7Z0JBQ3pFLDZDQUE2QztnQkFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2pCLE1BQU0sSUFBSSxzQ0FBdUIsQ0FDL0Isc0NBQXNDLGNBQWMsK0JBQStCO3dCQUNqRixrQkFBa0IsQ0FDckIsQ0FBQztpQkFDSDtnQkFDRCxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDMUIsQ0FBQztTQUNGO1FBQ0Q7WUFDRSxPQUFPLEVBQUUsZUFBZTtZQUN4QixxRkFBcUY7WUFDckYsMkVBQTJFO1lBQzNFLCtFQUErRTtZQUMvRSxvRkFBb0Y7WUFDcEYsK0VBQStFO1lBQy9FLDhHQUE4RztZQUM5RyxRQUFRLEVBQUUsQ0FBQyxjQUFjLENBQUM7U0FDM0I7UUFDRDtZQUNFLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7Z0JBQy9CLCtFQUErRTtnQkFDL0UsK0VBQStFO2dCQUMvRSwrRUFBK0U7Z0JBQy9FLDRFQUE0RTtnQkFDNUUsSUFBSSxrQkFBa0IsS0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFO29CQUM1QyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM1QjtnQkFDRCw2RUFBNkU7Z0JBQzdFLE1BQU0sUUFBUSxHQUFHLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDckQsNkVBQTZFO2dCQUM3RSxnRUFBZ0U7Z0JBQ2hFLElBQUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFO29CQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM1QztnQkFDRCxPQUFPLFFBQVEsQ0FBQztZQUNsQixDQUFDO1NBQ0Y7UUFDRDtZQUNFLE9BQU8sRUFBRSxZQUFZO1lBQ3JCLFFBQVEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7Z0JBQy9CLGdGQUFnRjtnQkFDaEYsc0NBQXNDO2dCQUN0QyxJQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRTtvQkFDN0IsTUFBTSxJQUFJLHNDQUF1QixDQUMvQixxREFBcUQ7d0JBQ25ELHdEQUF3RCxDQUMzRCxDQUFDO2lCQUNIO2dCQUNELG9GQUFvRjtnQkFDcEYsa0ZBQWtGO2dCQUNsRix1RkFBdUY7Z0JBQ3ZGLHdGQUF3RjtnQkFDeEYsSUFBSSxrQkFBa0IsS0FBSyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUU7b0JBQ3RELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDdEM7Z0JBQ0QscUZBQXFGO2dCQUNyRixPQUFPLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZELENBQUM7U0FDRjtRQUNEO1lBQ0Usd0ZBQXdGO1lBQ3hGLHlGQUF5RjtZQUN6Riw2RkFBNkY7WUFDN0YscUZBQXFGO1lBQ3JGLE9BQU8sRUFBRSxhQUFhO1lBQ3RCLFFBQVEsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsRUFBRTtnQkFDckMsSUFBSSxDQUFDLDRCQUFlLENBQUMsa0JBQWtCLENBQUMsRUFBRTtvQkFDeEMsTUFBTSxJQUFJLHVDQUF3QixDQUNoQyxnRUFBZ0U7d0JBQzlELFlBQVksa0JBQWtCLEdBQUcsQ0FDcEMsQ0FBQztpQkFDSDtnQkFDRCxJQUFJLGtCQUFrQixLQUFLLE1BQU0sQ0FBQyxVQUFVLEVBQUU7b0JBQzVDLE1BQU0sSUFBSSx1Q0FBd0IsQ0FDaEMsNERBQTREO3dCQUMxRCx3RUFBd0UsQ0FDM0UsQ0FBQztpQkFDSDtnQkFDRCxJQUFJLGdCQUFnQixLQUFLLElBQUksSUFBSSxrQkFBa0IsS0FBSyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUU7b0JBQ25GLE1BQU0sSUFBSSx1Q0FBd0IsQ0FDaEMsK0VBQStFO3dCQUM3RSw2RUFBNkUsQ0FDaEYsQ0FBQztpQkFDSDtnQkFDRCwyREFBMkQ7Z0JBQzNELE1BQU0sa0NBQXFCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDdEUsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDOUIsQ0FBQztTQUNGO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUFsSEQsMENBa0hDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnLCBSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi8uLi8uLi9yZWxlYXNlL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge1xuICBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMsXG4gIGdldE5leHRCcmFuY2hOYW1lLFxuICBpc1ZlcnNpb25CcmFuY2gsXG4gIFJlbGVhc2VSZXBvV2l0aEFwaSxcbn0gZnJvbSAnLi4vLi4vLi4vcmVsZWFzZS92ZXJzaW9uaW5nJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRHaXRodWJDb25maWcsIGdldENvbmZpZywgR2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7R2l0aHViQ2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvZ2l0aHViJztcbmltcG9ydCB7VGFyZ2V0TGFiZWx9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge0ludmFsaWRUYXJnZXRCcmFuY2hFcnJvciwgSW52YWxpZFRhcmdldExhYmVsRXJyb3J9IGZyb20gJy4uL3RhcmdldC1sYWJlbCc7XG5cbmltcG9ydCB7YXNzZXJ0QWN0aXZlTHRzQnJhbmNofSBmcm9tICcuL2x0cy1icmFuY2gnO1xuXG4vKipcbiAqIEdldHMgYSBsYWJlbCBjb25maWd1cmF0aW9uIGZvciB0aGUgbWVyZ2UgdG9vbGluZyB0aGF0IHJlZmxlY3RzIHRoZSBkZWZhdWx0IEFuZ3VsYXJcbiAqIG9yZ2FuaXphdGlvbi13aWRlIGxhYmVsaW5nIGFuZCBicmFuY2hpbmcgc2VtYW50aWNzIGFzIG91dGxpbmVkIGluIHRoZSBzcGVjaWZpY2F0aW9uLlxuICpcbiAqIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMTk3a1ZpbGxEd3gtUlp0U1ZPQnRQYjRCQklBdzBFOVJUM3EzdjZEWmt5a1VcbiAqXG4gKiBAcGFyYW0gYXBpIEluc3RhbmNlIG9mIGFuIGF1dGhlbnRpY2F0ZWQgR2l0aHViIGNsaWVudC5cbiAqIEBwYXJhbSBnaXRodWJDb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIEdpdGh1YiByZW1vdGUuIFVzZWQgYXMgR2l0IHJlbW90ZVxuICogICBmb3IgdGhlIHJlbGVhc2UgdHJhaW4gYnJhbmNoZXMuXG4gKiBAcGFyYW0gcmVsZWFzZUNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgcmVsZWFzZSBwYWNrYWdlcy4gVXNlZCB0byBmZXRjaFxuICogICBOUE0gdmVyc2lvbiBkYXRhIHdoZW4gTFRTIHZlcnNpb24gYnJhbmNoZXMgYXJlIHZhbGlkYXRlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRhcmdldExhYmVscyhcbiAgYXBpID0gR2l0Q2xpZW50LmdldCgpLmdpdGh1YixcbiAgY29uZmlnID0gZ2V0Q29uZmlnKCkgYXMgUGFydGlhbDx7Z2l0aHViOiBHaXRodWJDb25maWc7IHJlbGVhc2U6IFJlbGVhc2VDb25maWd9Pixcbik6IFByb21pc2U8VGFyZ2V0TGFiZWxbXT4ge1xuICBhc3NlcnRWYWxpZFJlbGVhc2VDb25maWcoY29uZmlnKTtcbiAgYXNzZXJ0VmFsaWRHaXRodWJDb25maWcoY29uZmlnKTtcblxuICBjb25zdCBuZXh0QnJhbmNoTmFtZSA9IGdldE5leHRCcmFuY2hOYW1lKGNvbmZpZy5naXRodWIpO1xuICBjb25zdCByZXBvOiBSZWxlYXNlUmVwb1dpdGhBcGkgPSB7XG4gICAgb3duZXI6IGNvbmZpZy5naXRodWIub3duZXIsXG4gICAgbmFtZTogY29uZmlnLmdpdGh1Yi5uYW1lLFxuICAgIG5leHRCcmFuY2hOYW1lLFxuICAgIGFwaSxcbiAgfTtcbiAgY29uc3Qge2xhdGVzdCwgcmVsZWFzZUNhbmRpZGF0ZSwgbmV4dH0gPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbyk7XG5cbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBwYXR0ZXJuOiAndGFyZ2V0OiBtYWpvcicsXG4gICAgICBicmFuY2hlczogKCkgPT4ge1xuICAgICAgICAvLyBJZiBgbmV4dGAgaXMgY3VycmVudGx5IG5vdCBkZXNpZ25hdGVkIHRvIGJlIGEgbWFqb3IgdmVyc2lvbiwgd2UgZG8gbm90XG4gICAgICAgIC8vIGFsbG93IG1lcmdpbmcgb2YgUFJzIHdpdGggYHRhcmdldDogbWFqb3JgLlxuICAgICAgICBpZiAoIW5leHQuaXNNYWpvcikge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gbWVyZ2UgcHVsbCByZXF1ZXN0LiBUaGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaCB3aWxsIGJlIHJlbGVhc2VkIGFzIGAgK1xuICAgICAgICAgICAgICAnYSBtaW5vciB2ZXJzaW9uLicsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW25leHRCcmFuY2hOYW1lXTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBwYXR0ZXJuOiAndGFyZ2V0OiBtaW5vcicsXG4gICAgICAvLyBDaGFuZ2VzIGxhYmVsZWQgd2l0aCBgdGFyZ2V0OiBtaW5vcmAgYXJlIG1lcmdlZCBtb3N0IGNvbW1vbmx5IGludG8gdGhlIG5leHQgYnJhbmNoXG4gICAgICAvLyAoaS5lLiBgbWFpbmApLiBJbiByYXJlIGNhc2VzIG9mIGFuIGV4Y2VwdGlvbmFsIG1pbm9yIHZlcnNpb24gd2hpbGUgYmVpbmdcbiAgICAgIC8vIGFscmVhZHkgb24gYSBtYWpvciByZWxlYXNlIHRyYWluLCB0aGlzIHdvdWxkIG5lZWQgdG8gYmUgb3ZlcnJpZGRlbiBtYW51YWxseS5cbiAgICAgIC8vIFRPRE86IENvbnNpZGVyIGhhbmRsaW5nIHRoaXMgYXV0b21hdGljYWxseSBieSBjaGVja2luZyBpZiB0aGUgTlBNIHZlcnNpb24gbWF0Y2hlc1xuICAgICAgLy8gdGhlIGxhc3QtbWlub3IuIElmIG5vdCwgdGhlbiBhbiBleGNlcHRpb25hbCBtaW5vciBtaWdodCBiZSBpbiBwcm9ncmVzcy4gU2VlOlxuICAgICAgLy8gaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xOTdrVmlsbER3eC1SWnRTVk9CdFBiNEJCSUF3MEU5UlQzcTN2NkRaa3lrVS9lZGl0I2hlYWRpbmc9aC5oN281cGpxNnlxZDBcbiAgICAgIGJyYW5jaGVzOiBbbmV4dEJyYW5jaE5hbWVdLFxuICAgIH0sXG4gICAge1xuICAgICAgcGF0dGVybjogJ3RhcmdldDogcGF0Y2gnLFxuICAgICAgYnJhbmNoZXM6IChnaXRodWJUYXJnZXRCcmFuY2gpID0+IHtcbiAgICAgICAgLy8gSWYgYSBQUiBpcyB0YXJnZXRpbmcgdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2ggdGhyb3VnaCB0aGUgR2l0aHViIFVJLFxuICAgICAgICAvLyBhbmQgaXMgYWxzbyBsYWJlbGVkIHdpdGggYHRhcmdldDogcGF0Y2hgLCB0aGVuIHdlIG1lcmdlIGl0IGRpcmVjdGx5IGludG8gdGhlXG4gICAgICAgIC8vIGJyYW5jaCB3aXRob3V0IGRvaW5nIGFueSBjaGVycnktcGlja2luZy4gVGhpcyBpcyB1c2VmdWwgaWYgYSBQUiBjb3VsZCBub3QgYmVcbiAgICAgICAgLy8gYXBwbGllZCBjbGVhbmx5LCBhbmQgYSBzZXBhcmF0ZSBQUiBmb3IgdGhlIHBhdGNoIGJyYW5jaCBoYXMgYmVlbiBjcmVhdGVkLlxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSBsYXRlc3QuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHJldHVybiBbbGF0ZXN0LmJyYW5jaE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgcGF0Y2ggY2hhbmdlcyBhcmUgYWx3YXlzIG1lcmdlZCBpbnRvIHRoZSBuZXh0IGFuZCBwYXRjaCBicmFuY2guXG4gICAgICAgIGNvbnN0IGJyYW5jaGVzID0gW25leHRCcmFuY2hOYW1lLCBsYXRlc3QuYnJhbmNoTmFtZV07XG4gICAgICAgIC8vIEFkZGl0aW9uYWxseSwgaWYgdGhlcmUgaXMgYSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSByZWxlYXNlLXRyYWluXG4gICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmUsIGFsc28gbWVyZ2UgdGhlIFBSIGludG8gdGhhdCB2ZXJzaW9uLWJyYW5jaC5cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICBicmFuY2hlcy5wdXNoKHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJyYW5jaGVzO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IHJjJyxcbiAgICAgIGJyYW5jaGVzOiAoZ2l0aHViVGFyZ2V0QnJhbmNoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBgdGFyZ2V0OiByY2AgbGFiZWwgY2Fubm90IGJlIGFwcGxpZWQgaWYgdGhlcmUgaXMgbm8gYWN0aXZlIGZlYXR1cmUtZnJlZXplXG4gICAgICAgIC8vIG9yIHJlbGVhc2UtY2FuZGlkYXRlIHJlbGVhc2UgdHJhaW4uXG4gICAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRMYWJlbEVycm9yKFxuICAgICAgICAgICAgYE5vIGFjdGl2ZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2guIGAgK1xuICAgICAgICAgICAgICBgVW5hYmxlIHRvIG1lcmdlIHB1bGwgcmVxdWVzdCB1c2luZyBcInRhcmdldDogcmNcIiBsYWJlbC5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgdGhlIFBSIGlzIHRhcmdldGluZyB0aGUgYWN0aXZlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIHZlcnNpb24gYnJhbmNoXG4gICAgICAgIC8vIGRpcmVjdGx5IHRocm91Z2ggdGhlIEdpdGh1YiBVSSBhbmQgaGFzIHRoZSBgdGFyZ2V0OiByY2AgbGFiZWwgYXBwbGllZCwgbWVyZ2UgaXRcbiAgICAgICAgLy8gb25seSBpbnRvIHRoZSByZWxlYXNlIGNhbmRpZGF0ZSBicmFuY2guIFRoaXMgaXMgdXNlZnVsIGlmIGEgUFIgZGlkIG5vdCBhcHBseSBjbGVhbmx5XG4gICAgICAgIC8vIGludG8gdGhlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIGJyYW5jaCwgYW5kIGEgc2VwYXJhdGUgUFIgaGFzIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgaWYgKGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIFtyZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgbWVyZ2UgaW50byB0aGUgbmV4dCBhbmQgYWN0aXZlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIGJyYW5jaC5cbiAgICAgICAgcmV0dXJuIFtuZXh0QnJhbmNoTmFtZSwgcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lXTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICAvLyBMVFMgY2hhbmdlcyBhcmUgcmFyZSBlbm91Z2ggdGhhdCB3ZSB3b24ndCB3b3JyeSBhYm91dCBjaGVycnktcGlja2luZyBjaGFuZ2VzIGludG8gYWxsXG4gICAgICAvLyBhY3RpdmUgTFRTIGJyYW5jaGVzIGZvciBQUnMgY3JlYXRlZCBhZ2FpbnN0IGFueSBvdGhlciBicmFuY2guIEluc3RlYWQsIFBSIGF1dGhvcnMgbmVlZFxuICAgICAgLy8gdG8gbWFudWFsbHkgY3JlYXRlIHNlcGFyYXRlIFBScyBmb3IgZGVzaXJlZCBMVFMgYnJhbmNoZXMuIEFkZGl0aW9uYWxseSwgYWN0aXZlIExUIGJyYW5jaGVzXG4gICAgICAvLyBjb21tb25seSBkaXZlcmdlIHF1aWNrbHkuIFRoaXMgbWFrZXMgY2hlcnJ5LXBpY2tpbmcgbm90IGFuIG9wdGlvbiBmb3IgTFRTIGNoYW5nZXMuXG4gICAgICBwYXR0ZXJuOiAndGFyZ2V0OiBsdHMnLFxuICAgICAgYnJhbmNoZXM6IGFzeW5jIChnaXRodWJUYXJnZXRCcmFuY2gpID0+IHtcbiAgICAgICAgaWYgKCFpc1ZlcnNpb25CcmFuY2goZ2l0aHViVGFyZ2V0QnJhbmNoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCBhcyBpdCBkb2VzIG5vdCB0YXJnZXQgYSBsb25nLXRlcm0gc3VwcG9ydCBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaDogXCIke2dpdGh1YlRhcmdldEJyYW5jaH1cImAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSBsYXRlc3QuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCB3aXRoIFwidGFyZ2V0OiBsdHNcIiBpbnRvIHBhdGNoIGJyYW5jaC4gYCArXG4gICAgICAgICAgICAgIGBDb25zaWRlciBjaGFuZ2luZyB0aGUgbGFiZWwgdG8gXCJ0YXJnZXQ6IHBhdGNoXCIgaWYgdGhpcyBpcyBpbnRlbnRpb25hbC5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwgJiYgZ2l0aHViVGFyZ2V0QnJhbmNoID09PSByZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgd2l0aCBcInRhcmdldDogbHRzXCIgaW50byBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaC4gQ29uc2lkZXIgY2hhbmdpbmcgdGhlIGxhYmVsIHRvIFwidGFyZ2V0OiByY1wiIGlmIHRoaXMgaXMgaW50ZW50aW9uYWwuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFzc2VydCB0aGF0IHRoZSBzZWxlY3RlZCBicmFuY2ggaXMgYW4gYWN0aXZlIExUUyBicmFuY2guXG4gICAgICAgIGF3YWl0IGFzc2VydEFjdGl2ZUx0c0JyYW5jaChyZXBvLCBjb25maWcucmVsZWFzZSwgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbiAgICAgICAgcmV0dXJuIFtnaXRodWJUYXJnZXRCcmFuY2hdO1xuICAgICAgfSxcbiAgICB9LFxuICBdO1xufVxuIl19