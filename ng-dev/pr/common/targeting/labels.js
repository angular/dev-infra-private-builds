"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTargetLabelsForActiveReleaseTrains = void 0;
const index_1 = require("../../../release/config/index");
const versioning_1 = require("../../../release/versioning");
const config_1 = require("../../../utils/config");
const target_label_1 = require("./target-label");
const lts_branch_1 = require("./lts-branch");
/**
 * Gets a list of target labels which should be considered by the merge
 * tooling when a pull request is processed to be merged.
 *
 * The target labels are implemented according to the design document which
 * specifies versioning, branching and releasing for the Angular organization:
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU
 *
 * @param api Instance of a Github client. Used to query for the release train branches.
 * @param config Configuration for the Github remote and release packages. Used to fetch
 *   NPM version data when LTS version branches are validated.
 */
async function getTargetLabelsForActiveReleaseTrains(api, config) {
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
            name: target_label_1.TargetLabelName.MAJOR,
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
            name: target_label_1.TargetLabelName.MINOR,
            // Changes labeled with `target: minor` are merged most commonly into the next branch
            // (i.e. `main`). In rare cases of an exceptional minor version while being
            // already on a major release train, this would need to be overridden manually.
            // TODO: Consider handling this automatically by checking if the NPM version matches
            // the last-minor. If not, then an exceptional minor might be in progress. See:
            // https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU/edit#heading=h.h7o5pjq6yqd0
            branches: () => [nextBranchName],
        },
        {
            name: target_label_1.TargetLabelName.PATCH,
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
            name: target_label_1.TargetLabelName.RELEASE_CANDIDATE,
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
            name: target_label_1.TargetLabelName.LONG_TERM_SUPPORT,
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
exports.getTargetLabelsForActiveReleaseTrains = getTargetLabelsForActiveReleaseTrains;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL2NvbW1vbi90YXJnZXRpbmcvbGFiZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHlEQUFzRjtBQUN0Riw0REFLcUM7QUFDckMsa0RBQTRFO0FBQzVFLGlEQUt3QjtBQUV4Qiw2Q0FBbUQ7QUFHbkQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSSxLQUFLLFVBQVUscUNBQXFDLENBQ3pELEdBQWlCLEVBQ2pCLE1BQStEO0lBRS9ELElBQUEsZ0NBQXdCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsSUFBQSxnQ0FBdUIsRUFBQyxNQUFNLENBQUMsQ0FBQztJQUVoQyxNQUFNLGNBQWMsR0FBRyxJQUFBLDhCQUFpQixFQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4RCxNQUFNLElBQUksR0FBdUI7UUFDL0IsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSztRQUMxQixJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1FBQ3hCLGNBQWM7UUFDZCxHQUFHO0tBQ0osQ0FBQztJQUNGLE1BQU0sRUFBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFDLEdBQUcsTUFBTSxJQUFBLHFDQUF3QixFQUFDLElBQUksQ0FBQyxDQUFDO0lBRTlFLE9BQU87UUFDTDtZQUNFLElBQUksRUFBRSw4QkFBZSxDQUFDLEtBQUs7WUFDM0IsUUFBUSxFQUFFLEdBQUcsRUFBRTtnQkFDYix5RUFBeUU7Z0JBQ3pFLDZDQUE2QztnQkFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2pCLE1BQU0sSUFBSSxzQ0FBdUIsQ0FDL0Isc0NBQXNDLGNBQWMsK0JBQStCO3dCQUNqRixrQkFBa0IsQ0FDckIsQ0FBQztpQkFDSDtnQkFDRCxPQUFPLENBQUMsY0FBYyxDQUFDLENB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biAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZywgUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vLi4vLi4vcmVsZWFzZS9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtcbiAgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zLFxuICBnZXROZXh0QnJhbmNoTmFtZSxcbiAgaXNWZXJzaW9uQnJhbmNoLFxuICBSZWxlYXNlUmVwb1dpdGhBcGksXG59IGZyb20gJy4uLy4uLy4uL3JlbGVhc2UvdmVyc2lvbmluZyc7XG5pbXBvcnQge2Fzc2VydFZhbGlkR2l0aHViQ29uZmlnLCBHaXRodWJDb25maWd9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge1xuICBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsXG4gIEludmFsaWRUYXJnZXRMYWJlbEVycm9yLFxuICBUYXJnZXRMYWJlbCxcbiAgVGFyZ2V0TGFiZWxOYW1lLFxufSBmcm9tICcuL3RhcmdldC1sYWJlbCc7XG5cbmltcG9ydCB7YXNzZXJ0QWN0aXZlTHRzQnJhbmNofSBmcm9tICcuL2x0cy1icmFuY2gnO1xuaW1wb3J0IHtHaXRodWJDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuXG4vKipcbiAqIEdldHMgYSBsaXN0IG9mIHRhcmdldCBsYWJlbHMgd2hpY2ggc2hvdWxkIGJlIGNvbnNpZGVyZWQgYnkgdGhlIG1lcmdlXG4gKiB0b29saW5nIHdoZW4gYSBwdWxsIHJlcXVlc3QgaXMgcHJvY2Vzc2VkIHRvIGJlIG1lcmdlZC5cbiAqXG4gKiBUaGUgdGFyZ2V0IGxhYmVscyBhcmUgaW1wbGVtZW50ZWQgYWNjb3JkaW5nIHRvIHRoZSBkZXNpZ24gZG9jdW1lbnQgd2hpY2hcbiAqIHNwZWNpZmllcyB2ZXJzaW9uaW5nLCBicmFuY2hpbmcgYW5kIHJlbGVhc2luZyBmb3IgdGhlIEFuZ3VsYXIgb3JnYW5pemF0aW9uOlxuICogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xOTdrVmlsbER3eC1SWnRTVk9CdFBiNEJCSUF3MEU5UlQzcTN2NkRaa3lrVVxuICpcbiAqIEBwYXJhbSBhcGkgSW5zdGFuY2Ugb2YgYSBHaXRodWIgY2xpZW50LiBVc2VkIHRvIHF1ZXJ5IGZvciB0aGUgcmVsZWFzZSB0cmFpbiBicmFuY2hlcy5cbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIEdpdGh1YiByZW1vdGUgYW5kIHJlbGVhc2UgcGFja2FnZXMuIFVzZWQgdG8gZmV0Y2hcbiAqICAgTlBNIHZlcnNpb24gZGF0YSB3aGVuIExUUyB2ZXJzaW9uIGJyYW5jaGVzIGFyZSB2YWxpZGF0ZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUYXJnZXRMYWJlbHNGb3JBY3RpdmVSZWxlYXNlVHJhaW5zKFxuICBhcGk6IEdpdGh1YkNsaWVudCxcbiAgY29uZmlnOiBQYXJ0aWFsPHtnaXRodWI6IEdpdGh1YkNvbmZpZzsgcmVsZWFzZTogUmVsZWFzZUNvbmZpZ30+LFxuKTogUHJvbWlzZTxUYXJnZXRMYWJlbFtdPiB7XG4gIGFzc2VydFZhbGlkUmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZyhjb25maWcpO1xuXG4gIGNvbnN0IG5leHRCcmFuY2hOYW1lID0gZ2V0TmV4dEJyYW5jaE5hbWUoY29uZmlnLmdpdGh1Yik7XG4gIGNvbnN0IHJlcG86IFJlbGVhc2VSZXBvV2l0aEFwaSA9IHtcbiAgICBvd25lcjogY29uZmlnLmdpdGh1Yi5vd25lcixcbiAgICBuYW1lOiBjb25maWcuZ2l0aHViLm5hbWUsXG4gICAgbmV4dEJyYW5jaE5hbWUsXG4gICAgYXBpLFxuICB9O1xuICBjb25zdCB7bGF0ZXN0LCByZWxlYXNlQ2FuZGlkYXRlLCBuZXh0fSA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIG5hbWU6IFRhcmdldExhYmVsTmFtZS5NQUpPUixcbiAgICAgIGJyYW5jaGVzOiAoKSA9PiB7XG4gICAgICAgIC8vIElmIGBuZXh0YCBpcyBjdXJyZW50bHkgbm90IGRlc2lnbmF0ZWQgdG8gYmUgYSBtYWpvciB2ZXJzaW9uLCB3ZSBkbyBub3RcbiAgICAgICAgLy8gYWxsb3cgbWVyZ2luZyBvZiBQUnMgd2l0aCBgdGFyZ2V0OiBtYWpvcmAuXG4gICAgICAgIGlmICghbmV4dC5pc01ham9yKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRMYWJlbEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBtZXJnZSBwdWxsIHJlcXVlc3QuIFRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoIHdpbGwgYmUgcmVsZWFzZWQgYXMgYCArXG4gICAgICAgICAgICAgICdhIG1pbm9yIHZlcnNpb24uJyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbbmV4dEJyYW5jaE5hbWVdO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6IFRhcmdldExhYmVsTmFtZS5NSU5PUixcbiAgICAgIC8vIENoYW5nZXMgbGFiZWxlZCB3aXRoIGB0YXJnZXQ6IG1pbm9yYCBhcmUgbWVyZ2VkIG1vc3QgY29tbW9ubHkgaW50byB0aGUgbmV4dCBicmFuY2hcbiAgICAgIC8vIChpLmUuIGBtYWluYCkuIEluIHJhcmUgY2FzZXMgb2YgYW4gZXhjZXB0aW9uYWwgbWlub3IgdmVyc2lvbiB3aGlsZSBiZWluZ1xuICAgICAgLy8gYWxyZWFkeSBvbiBhIG1ham9yIHJlbGVhc2UgdHJhaW4sIHRoaXMgd291bGQgbmVlZCB0byBiZSBvdmVycmlkZGVuIG1hbnVhbGx5LlxuICAgICAgLy8gVE9ETzogQ29uc2lkZXIgaGFuZGxpbmcgdGhpcyBhdXRvbWF0aWNhbGx5IGJ5IGNoZWNraW5nIGlmIHRoZSBOUE0gdmVyc2lvbiBtYXRjaGVzXG4gICAgICAvLyB0aGUgbGFzdC1taW5vci4gSWYgbm90LCB0aGVuIGFuIGV4Y2VwdGlvbmFsIG1pbm9yIG1pZ2h0IGJlIGluIHByb2dyZXNzLiBTZWU6XG4gICAgICAvLyBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzE5N2tWaWxsRHd4LVJadFNWT0J0UGI0QkJJQXcwRTlSVDNxM3Y2RFpreWtVL2VkaXQjaGVhZGluZz1oLmg3bzVwanE2eXFkMFxuICAgICAgYnJhbmNoZXM6ICgpID0+IFtuZXh0QnJhbmNoTmFtZV0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBUYXJnZXRMYWJlbE5hbWUuUEFUQ0gsXG4gICAgICBicmFuY2hlczogKGdpdGh1YlRhcmdldEJyYW5jaCkgPT4ge1xuICAgICAgICAvLyBJZiBhIFBSIGlzIHRhcmdldGluZyB0aGUgbGF0ZXN0IGFjdGl2ZSB2ZXJzaW9uLWJyYW5jaCB0aHJvdWdoIHRoZSBHaXRodWIgVUksXG4gICAgICAgIC8vIGFuZCBpcyBhbHNvIGxhYmVsZWQgd2l0aCBgdGFyZ2V0OiBwYXRjaGAsIHRoZW4gd2UgbWVyZ2UgaXQgZGlyZWN0bHkgaW50byB0aGVcbiAgICAgICAgLy8gYnJhbmNoIHdpdGhvdXQgZG9pbmcgYW55IGNoZXJyeS1waWNraW5nLiBUaGlzIGlzIHVzZWZ1bCBpZiBhIFBSIGNvdWxkIG5vdCBiZVxuICAgICAgICAvLyBhcHBsaWVkIGNsZWFubHksIGFuZCBhIHNlcGFyYXRlIFBSIGZvciB0aGUgcGF0Y2ggYnJhbmNoIGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IGxhdGVzdC5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIFtsYXRlc3QuYnJhbmNoTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBwYXRjaCBjaGFuZ2VzIGFyZSBhbHdheXMgbWVyZ2VkIGludG8gdGhlIG5leHQgYW5kIHBhdGNoIGJyYW5jaC5cbiAgICAgICAgY29uc3QgYnJhbmNoZXMgPSBbbmV4dEJyYW5jaE5hbWUsIGxhdGVzdC5icmFuY2hOYW1lXTtcbiAgICAgICAgLy8gQWRkaXRpb25hbGx5LCBpZiB0aGVyZSBpcyBhIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIHJlbGVhc2UtdHJhaW5cbiAgICAgICAgLy8gY3VycmVudGx5IGFjdGl2ZSwgYWxzbyBtZXJnZSB0aGUgUFIgaW50byB0aGF0IHZlcnNpb24tYnJhbmNoLlxuICAgICAgICBpZiAocmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGJyYW5jaGVzLnB1c2gocmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnJhbmNoZXM7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogVGFyZ2V0TGFiZWxOYW1lLlJFTEVBU0VfQ0FORElEQVRFLFxuICAgICAgYnJhbmNoZXM6IChnaXRodWJUYXJnZXRCcmFuY2gpID0+IHtcbiAgICAgICAgLy8gVGhlIGB0YXJnZXQ6IHJjYCBsYWJlbCBjYW5ub3QgYmUgYXBwbGllZCBpZiB0aGVyZSBpcyBubyBhY3RpdmUgZmVhdHVyZS1mcmVlemVcbiAgICAgICAgLy8gb3IgcmVsZWFzZS1jYW5kaWRhdGUgcmVsZWFzZSB0cmFpbi5cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAgICAgICBgTm8gYWN0aXZlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gYCArXG4gICAgICAgICAgICAgIGBVbmFibGUgdG8gbWVyZ2UgcHVsbCByZXF1ZXN0IHVzaW5nIFwidGFyZ2V0OiByY1wiIGxhYmVsLmAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB0aGUgUFIgaXMgdGFyZ2V0aW5nIHRoZSBhY3RpdmUgcmVsZWFzZS1jYW5kaWRhdGUvZmVhdHVyZS1mcmVlemUgdmVyc2lvbiBicmFuY2hcbiAgICAgICAgLy8gZGlyZWN0bHkgdGhyb3VnaCB0aGUgR2l0aHViIFVJIGFuZCBoYXMgdGhlIGB0YXJnZXQ6IHJjYCBsYWJlbCBhcHBsaWVkLCBtZXJnZSBpdFxuICAgICAgICAvLyBvbmx5IGludG8gdGhlIHJlbGVhc2UgY2FuZGlkYXRlIGJyYW5jaC4gVGhpcyBpcyB1c2VmdWwgaWYgYSBQUiBkaWQgbm90IGFwcGx5IGNsZWFubHlcbiAgICAgICAgLy8gaW50byB0aGUgcmVsZWFzZS1jYW5kaWRhdGUvZmVhdHVyZS1mcmVlemUgYnJhbmNoLCBhbmQgYSBzZXBhcmF0ZSBQUiBoYXMgYmVlbiBjcmVhdGVkLlxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSByZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gW3JlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBtZXJnZSBpbnRvIHRoZSBuZXh0IGFuZCBhY3RpdmUgcmVsZWFzZS1jYW5kaWRhdGUvZmVhdHVyZS1mcmVlemUgYnJhbmNoLlxuICAgICAgICByZXR1cm4gW25leHRCcmFuY2hOYW1lLCByZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWVdO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIC8vIExUUyBjaGFuZ2VzIGFyZSByYXJlIGVub3VnaCB0aGF0IHdlIHdvbid0IHdvcnJ5IGFib3V0IGNoZXJyeS1waWNraW5nIGNoYW5nZXMgaW50byBhbGxcbiAgICAgIC8vIGFjdGl2ZSBMVFMgYnJhbmNoZXMgZm9yIFBScyBjcmVhdGVkIGFnYWluc3QgYW55IG90aGVyIGJyYW5jaC4gSW5zdGVhZCwgUFIgYXV0aG9ycyBuZWVkXG4gICAgICAvLyB0byBtYW51YWxseSBjcmVhdGUgc2VwYXJhdGUgUFJzIGZvciBkZXNpcmVkIExUUyBicmFuY2hlcy4gQWRkaXRpb25hbGx5LCBhY3RpdmUgTFQgYnJhbmNoZXNcbiAgICAgIC8vIGNvbW1vbmx5IGRpdmVyZ2UgcXVpY2tseS4gVGhpcyBtYWtlcyBjaGVycnktcGlja2luZyBub3QgYW4gb3B0aW9uIGZvciBMVFMgY2hhbmdlcy5cbiAgICAgIG5hbWU6IFRhcmdldExhYmVsTmFtZS5MT05HX1RFUk1fU1VQUE9SVCxcbiAgICAgIGJyYW5jaGVzOiBhc3luYyAoZ2l0aHViVGFyZ2V0QnJhbmNoKSA9PiB7XG4gICAgICAgIGlmICghaXNWZXJzaW9uQnJhbmNoKGdpdGh1YlRhcmdldEJyYW5jaCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgYXMgaXQgZG9lcyBub3QgdGFyZ2V0IGEgbG9uZy10ZXJtIHN1cHBvcnQgYCArXG4gICAgICAgICAgICAgIGBicmFuY2g6IFwiJHtnaXRodWJUYXJnZXRCcmFuY2h9XCJgLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gbGF0ZXN0LmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgd2l0aCBcInRhcmdldDogbHRzXCIgaW50byBwYXRjaCBicmFuY2guIGAgK1xuICAgICAgICAgICAgICBgQ29uc2lkZXIgY2hhbmdpbmcgdGhlIGxhYmVsIHRvIFwidGFyZ2V0OiBwYXRjaFwiIGlmIHRoaXMgaXMgaW50ZW50aW9uYWwuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsICYmIGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihcbiAgICAgICAgICAgIGBQUiBjYW5ub3QgYmUgbWVyZ2VkIHdpdGggXCJ0YXJnZXQ6IGx0c1wiIGludG8gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYCArXG4gICAgICAgICAgICAgIGBicmFuY2guIENvbnNpZGVyIGNoYW5naW5nIHRoZSBsYWJlbCB0byBcInRhcmdldDogcmNcIiBpZiB0aGlzIGlzIGludGVudGlvbmFsLmAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBc3NlcnQgdGhhdCB0aGUgc2VsZWN0ZWQgYnJhbmNoIGlzIGFuIGFjdGl2ZSBMVFMgYnJhbmNoLlxuICAgICAgICBhd2FpdCBhc3NlcnRBY3RpdmVMdHNCcmFuY2gocmVwbywgY29uZmlnLnJlbGVhc2UsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG4gICAgICAgIHJldHVybiBbZ2l0aHViVGFyZ2V0QnJhbmNoXTtcbiAgICAgIH0sXG4gICAgfSxcbiAgXTtcbn1cbiJdfQ==