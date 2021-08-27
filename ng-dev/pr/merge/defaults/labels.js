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
async function getTargetLabels(api = git_client_1.GitClient.get().github, config = (0, config_1.getConfig)()) {
    (0, index_1.assertValidReleaseConfig)(config);
    (0, config_1.assertValidGithubConfig)(config);
    const nextBranchName = (0, versioning_1.getNextBranchName)(config.github);
    const repo = {
        owner: config.github.owner,
        name: config.github.name,
        nextBranchName,
        api,
    };
    const { latest, releaseCandidate, next } = await (0, versioning_1.fetchActiveReleaseTrains)(repo);
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
                if (!(0, versioning_1.isVersionBranch)(githubTargetBranch)) {
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
                await (0, lts_branch_1.assertActiveLtsBranch)(repo, config.release, githubTargetBranch);
                return [githubTargetBranch];
            },
        },
    ];
}
exports.getTargetLabels = getTargetLabels;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL2RlZmF1bHRzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx5REFBc0Y7QUFDdEYsNERBS3FDO0FBQ3JDLGtEQUF1RjtBQUN2Riw4REFBd0Q7QUFHeEQsa0RBQWtGO0FBRWxGLDZDQUFtRDtBQUVuRDs7Ozs7Ozs7Ozs7R0FXRztBQUNJLEtBQUssVUFBVSxlQUFlLENBQ25DLEdBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFDNUIsU0FBUyxJQUFBLGtCQUFTLEdBQTZEO0lBRS9FLElBQUEsZ0NBQXdCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsSUFBQSxnQ0FBdUIsRUFBQyxNQUFNLENBQUMsQ0FBQztJQUVoQyxNQUFNLGNBQWMsR0FBRyxJQUFBLDhCQUFpQixFQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4RCxNQUFNLElBQUksR0FBdUI7UUFDL0IsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSztRQUMxQixJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1FBQ3hCLGNBQWM7UUFDZCxHQUFHO0tBQ0osQ0FBQztJQUNGLE1BQU0sRUFBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFDLEdBQUcsTUFBTSxJQUFBLHFDQUF3QixFQUFDLElBQUksQ0FBQyxDQUFDO0lBRTlFLE9BQU87UUFDTDtZQUNFLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLFFBQVEsRUFBRSxHQUFHLEVBQUU7Z0JBQ2IseUVBQXlFO2dCQUN6RSw2Q0FBNkM7Z0JBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNqQixNQUFNLElBQUksc0NBQXVCLENBQy9CLHNDQUFzQyxjQUFjLCtCQUErQjt3QkFDakYsa0JB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R29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnRWYWxpZFJlbGVhc2VDb25maWcsIFJlbGVhc2VDb25maWd9IGZyb20gJy4uLy4uLy4uL3JlbGVhc2UvY29uZmlnL2luZGV4JztcbmltcG9ydCB7XG4gIGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyxcbiAgZ2V0TmV4dEJyYW5jaE5hbWUsXG4gIGlzVmVyc2lvbkJyYW5jaCxcbiAgUmVsZWFzZVJlcG9XaXRoQXBpLFxufSBmcm9tICcuLi8uLi8uLi9yZWxlYXNlL3ZlcnNpb25pbmcnO1xuaW1wb3J0IHthc3NlcnRWYWxpZEdpdGh1YkNvbmZpZywgZ2V0Q29uZmlnLCBHaXRodWJDb25maWd9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtHaXRodWJDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuaW1wb3J0IHtUYXJnZXRMYWJlbH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7SW52YWxpZFRhcmdldEJyYW5jaEVycm9yLCBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcn0gZnJvbSAnLi4vdGFyZ2V0LWxhYmVsJztcblxuaW1wb3J0IHthc3NlcnRBY3RpdmVMdHNCcmFuY2h9IGZyb20gJy4vbHRzLWJyYW5jaCc7XG5cbi8qKlxuICogR2V0cyBhIGxhYmVsIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBtZXJnZSB0b29saW5nIHRoYXQgcmVmbGVjdHMgdGhlIGRlZmF1bHQgQW5ndWxhclxuICogb3JnYW5pemF0aW9uLXdpZGUgbGFiZWxpbmcgYW5kIGJyYW5jaGluZyBzZW1hbnRpY3MgYXMgb3V0bGluZWQgaW4gdGhlIHNwZWNpZmljYXRpb24uXG4gKlxuICogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xOTdrVmlsbER3eC1SWnRTVk9CdFBiNEJCSUF3MEU5UlQzcTN2NkRaa3lrVVxuICpcbiAqIEBwYXJhbSBhcGkgSW5zdGFuY2Ugb2YgYW4gYXV0aGVudGljYXRlZCBHaXRodWIgY2xpZW50LlxuICogQHBhcmFtIGdpdGh1YkNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgR2l0aHViIHJlbW90ZS4gVXNlZCBhcyBHaXQgcmVtb3RlXG4gKiAgIGZvciB0aGUgcmVsZWFzZSB0cmFpbiBicmFuY2hlcy5cbiAqIEBwYXJhbSByZWxlYXNlQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSByZWxlYXNlIHBhY2thZ2VzLiBVc2VkIHRvIGZldGNoXG4gKiAgIE5QTSB2ZXJzaW9uIGRhdGEgd2hlbiBMVFMgdmVyc2lvbiBicmFuY2hlcyBhcmUgdmFsaWRhdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VGFyZ2V0TGFiZWxzKFxuICBhcGkgPSBHaXRDbGllbnQuZ2V0KCkuZ2l0aHViLFxuICBjb25maWcgPSBnZXRDb25maWcoKSBhcyBQYXJ0aWFsPHtnaXRodWI6IEdpdGh1YkNvbmZpZzsgcmVsZWFzZTogUmVsZWFzZUNvbmZpZ30+LFxuKTogUHJvbWlzZTxUYXJnZXRMYWJlbFtdPiB7XG4gIGFzc2VydFZhbGlkUmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZyhjb25maWcpO1xuXG4gIGNvbnN0IG5leHRCcmFuY2hOYW1lID0gZ2V0TmV4dEJyYW5jaE5hbWUoY29uZmlnLmdpdGh1Yik7XG4gIGNvbnN0IHJlcG86IFJlbGVhc2VSZXBvV2l0aEFwaSA9IHtcbiAgICBvd25lcjogY29uZmlnLmdpdGh1Yi5vd25lcixcbiAgICBuYW1lOiBjb25maWcuZ2l0aHViLm5hbWUsXG4gICAgbmV4dEJyYW5jaE5hbWUsXG4gICAgYXBpLFxuICB9O1xuICBjb25zdCB7bGF0ZXN0LCByZWxlYXNlQ2FuZGlkYXRlLCBuZXh0fSA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IG1ham9yJyxcbiAgICAgIGJyYW5jaGVzOiAoKSA9PiB7XG4gICAgICAgIC8vIElmIGBuZXh0YCBpcyBjdXJyZW50bHkgbm90IGRlc2lnbmF0ZWQgdG8gYmUgYSBtYWpvciB2ZXJzaW9uLCB3ZSBkbyBub3RcbiAgICAgICAgLy8gYWxsb3cgbWVyZ2luZyBvZiBQUnMgd2l0aCBgdGFyZ2V0OiBtYWpvcmAuXG4gICAgICAgIGlmICghbmV4dC5pc01ham9yKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRMYWJlbEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBtZXJnZSBwdWxsIHJlcXVlc3QuIFRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoIHdpbGwgYmUgcmVsZWFzZWQgYXMgYCArXG4gICAgICAgICAgICAgICdhIG1pbm9yIHZlcnNpb24uJyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbbmV4dEJyYW5jaE5hbWVdO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IG1pbm9yJyxcbiAgICAgIC8vIENoYW5nZXMgbGFiZWxlZCB3aXRoIGB0YXJnZXQ6IG1pbm9yYCBhcmUgbWVyZ2VkIG1vc3QgY29tbW9ubHkgaW50byB0aGUgbmV4dCBicmFuY2hcbiAgICAgIC8vIChpLmUuIGBtYWluYCkuIEluIHJhcmUgY2FzZXMgb2YgYW4gZXhjZXB0aW9uYWwgbWlub3IgdmVyc2lvbiB3aGlsZSBiZWluZ1xuICAgICAgLy8gYWxyZWFkeSBvbiBhIG1ham9yIHJlbGVhc2UgdHJhaW4sIHRoaXMgd291bGQgbmVlZCB0byBiZSBvdmVycmlkZGVuIG1hbnVhbGx5LlxuICAgICAgLy8gVE9ETzogQ29uc2lkZXIgaGFuZGxpbmcgdGhpcyBhdXRvbWF0aWNhbGx5IGJ5IGNoZWNraW5nIGlmIHRoZSBOUE0gdmVyc2lvbiBtYXRjaGVzXG4gICAgICAvLyB0aGUgbGFzdC1taW5vci4gSWYgbm90LCB0aGVuIGFuIGV4Y2VwdGlvbmFsIG1pbm9yIG1pZ2h0IGJlIGluIHByb2dyZXNzLiBTZWU6XG4gICAgICAvLyBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzE5N2tWaWxsRHd4LVJadFNWT0J0UGI0QkJJQXcwRTlSVDNxM3Y2RFpreWtVL2VkaXQjaGVhZGluZz1oLmg3bzVwanE2eXFkMFxuICAgICAgYnJhbmNoZXM6IFtuZXh0QnJhbmNoTmFtZV0sXG4gICAgfSxcbiAgICB7XG4gICAgICBwYXR0ZXJuOiAndGFyZ2V0OiBwYXRjaCcsXG4gICAgICBicmFuY2hlczogKGdpdGh1YlRhcmdldEJyYW5jaCkgPT4ge1xuICAgICAgICAvLyBJZiBhIFBSIGlzIHRhcmdldGluZyB0aGUgbGF0ZXN0IGFjdGl2ZSB2ZXJzaW9uLWJyYW5jaCB0aHJvdWdoIHRoZSBHaXRodWIgVUksXG4gICAgICAgIC8vIGFuZCBpcyBhbHNvIGxhYmVsZWQgd2l0aCBgdGFyZ2V0OiBwYXRjaGAsIHRoZW4gd2UgbWVyZ2UgaXQgZGlyZWN0bHkgaW50byB0aGVcbiAgICAgICAgLy8gYnJhbmNoIHdpdGhvdXQgZG9pbmcgYW55IGNoZXJyeS1waWNraW5nLiBUaGlzIGlzIHVzZWZ1bCBpZiBhIFBSIGNvdWxkIG5vdCBiZVxuICAgICAgICAvLyBhcHBsaWVkIGNsZWFubHksIGFuZCBhIHNlcGFyYXRlIFBSIGZvciB0aGUgcGF0Y2ggYnJhbmNoIGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IGxhdGVzdC5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIFtsYXRlc3QuYnJhbmNoTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBwYXRjaCBjaGFuZ2VzIGFyZSBhbHdheXMgbWVyZ2VkIGludG8gdGhlIG5leHQgYW5kIHBhdGNoIGJyYW5jaC5cbiAgICAgICAgY29uc3QgYnJhbmNoZXMgPSBbbmV4dEJyYW5jaE5hbWUsIGxhdGVzdC5icmFuY2hOYW1lXTtcbiAgICAgICAgLy8gQWRkaXRpb25hbGx5LCBpZiB0aGVyZSBpcyBhIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIHJlbGVhc2UtdHJhaW5cbiAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2ZSwgYWxzbyBtZXJnZSB0aGUgUFIgaW50byB0aGF0IHZlcnNpb24tYnJhbmNoLlxuICAgICAgICBpZiAocmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGJyYW5jaGVzLnB1c2gocmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnJhbmNoZXM7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgcGF0dGVybjogJ3RhcmdldDogcmMnLFxuICAgICAgYnJhbmNoZXM6IChnaXRodWJUYXJnZXRCcmFuY2gpID0+IHtcbiAgICAgICAgLy8gVGhlIGB0YXJnZXQ6IHJjYCBsYWJlbCBjYW5ub3QgYmUgYXBwbGllZCBpZiB0aGVyZSBpcyBubyBhY3RpdmUgZmVhdHVyZS1mcmVlemVcbiAgICAgICAgLy8gb3IgcmVsZWFzZS1jYW5kaWRhdGUgcmVsZWFzZSB0cmFpbi5cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAgICAgICBgTm8gYWN0aXZlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gYCArXG4gICAgICAgICAgICAgIGBVbmFibGUgdG8gbWVyZ2UgcHVsbCByZXF1ZXN0IHVzaW5nIFwidGFyZ2V0OiByY1wiIGxhYmVsLmAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB0aGUgUFIgaXMgdGFyZ2V0aW5nIHRoZSBhY3RpdmUgcmVsZWFzZS1jYW5kaWRhdGUvZmVhdHVyZS1mcmVlemUgdmVyc2lvbiBicmFuY2hcbiAgICAgICAgLy8gZGlyZWN0bHkgdGhyb3VnaCB0aGUgR2l0aHViIFVJIGFuZCBoYXMgdGhlIGB0YXJnZXQ6IHJjYCBsYWJlbCBhcHBsaWVkLCBtZXJnZSBpdFxuICAgICAgICAvLyBvbmx5IGludG8gdGhlIHJlbGVhc2UgY2FuZGlkYXRlIGJyYW5jaC4gVGhpcyBpcyB1c2VmdWwgaWYgYSBQUiBkaWQgbm90IGFwcGx5IGNsZWFubHlcbiAgICAgICAgLy8gaW50byB0aGUgcmVsZWFzZS1jYW5kaWRhdGUvZmVhdHVyZS1mcmVlemUgYnJhbmNoLCBhbmQgYSBzZXBhcmF0ZSBQUiBoYXMgYmVlbiBjcmVhdGVkLlxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSByZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gW3JlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBtZXJnZSBpbnRvIHRoZSBuZXh0IGFuZCBhY3RpdmUgcmVsZWFzZS1jYW5kaWRhdGUvZmVhdHVyZS1mcmVlemUgYnJhbmNoLlxuICAgICAgICByZXR1cm4gW25leHRCcmFuY2hOYW1lLCByZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWVdO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIC8vIExUUyBjaGFuZ2VzIGFyZSByYXJlIGVub3VnaCB0aGF0IHdlIHdvbid0IHdvcnJ5IGFib3V0IGNoZXJyeS1waWNraW5nIGNoYW5nZXMgaW50byBhbGxcbiAgICAgIC8vIGFjdGl2ZSBMVFMgYnJhbmNoZXMgZm9yIFBScyBjcmVhdGVkIGFnYWluc3QgYW55IG90aGVyIGJyYW5jaC4gSW5zdGVhZCwgUFIgYXV0aG9ycyBuZWVkXG4gICAgICAvLyB0byBtYW51YWxseSBjcmVhdGUgc2VwYXJhdGUgUFJzIGZvciBkZXNpcmVkIExUUyBicmFuY2hlcy4gQWRkaXRpb25hbGx5LCBhY3RpdmUgTFQgYnJhbmNoZXNcbiAgICAgIC8vIGNvbW1vbmx5IGRpdmVyZ2UgcXVpY2tseS4gVGhpcyBtYWtlcyBjaGVycnktcGlja2luZyBub3QgYW4gb3B0aW9uIGZvciBMVFMgY2hhbmdlcy5cbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IGx0cycsXG4gICAgICBicmFuY2hlczogYXN5bmMgKGdpdGh1YlRhcmdldEJyYW5jaCkgPT4ge1xuICAgICAgICBpZiAoIWlzVmVyc2lvbkJyYW5jaChnaXRodWJUYXJnZXRCcmFuY2gpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihcbiAgICAgICAgICAgIGBQUiBjYW5ub3QgYmUgbWVyZ2VkIGFzIGl0IGRvZXMgbm90IHRhcmdldCBhIGxvbmctdGVybSBzdXBwb3J0IGAgK1xuICAgICAgICAgICAgICBgYnJhbmNoOiBcIiR7Z2l0aHViVGFyZ2V0QnJhbmNofVwiYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IGxhdGVzdC5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihcbiAgICAgICAgICAgIGBQUiBjYW5ub3QgYmUgbWVyZ2VkIHdpdGggXCJ0YXJnZXQ6IGx0c1wiIGludG8gcGF0Y2ggYnJhbmNoLiBgICtcbiAgICAgICAgICAgICAgYENvbnNpZGVyIGNoYW5naW5nIHRoZSBsYWJlbCB0byBcInRhcmdldDogcGF0Y2hcIiBpZiB0aGlzIGlzIGludGVudGlvbmFsLmAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCAmJiBnaXRodWJUYXJnZXRCcmFuY2ggPT09IHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCB3aXRoIFwidGFyZ2V0OiBsdHNcIiBpbnRvIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGAgK1xuICAgICAgICAgICAgICBgYnJhbmNoLiBDb25zaWRlciBjaGFuZ2luZyB0aGUgbGFiZWwgdG8gXCJ0YXJnZXQ6IHJjXCIgaWYgdGhpcyBpcyBpbnRlbnRpb25hbC5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXNzZXJ0IHRoYXQgdGhlIHNlbGVjdGVkIGJyYW5jaCBpcyBhbiBhY3RpdmUgTFRTIGJyYW5jaC5cbiAgICAgICAgYXdhaXQgYXNzZXJ0QWN0aXZlTHRzQnJhbmNoKHJlcG8sIGNvbmZpZy5yZWxlYXNlLCBnaXRodWJUYXJnZXRCcmFuY2gpO1xuICAgICAgICByZXR1cm4gW2dpdGh1YlRhcmdldEJyYW5jaF07XG4gICAgICB9LFxuICAgIH0sXG4gIF07XG59XG4iXX0=