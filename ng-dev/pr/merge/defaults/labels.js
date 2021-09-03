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
const git_client_1 = require("../../../utils/git/git-client");
const target_label_1 = require("../target-label");
const lts_branch_1 = require("./lts-branch");
/**
 * Gets a list of target labels which should be considered by the merge
 * tooling when a pull request is processed to be merged.
 *
 * The target labels are implemented according to the design document which
 * specifies versioning, branching and releasing for the Angular organization:
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU
 *
 * @param api Instance of an authenticated Github client.
 *   for the release train branches.
 * @param config Configuration for the Github remote and release packages. Used to fetch
 *   NPM version data when LTS version branches are validated.
 */
async function getTargetLabelsForActiveReleaseTrains(api = git_client_1.GitClient.get().github, config = (0, config_1.getConfig)()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL2RlZmF1bHRzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx5REFBc0Y7QUFDdEYsNERBS3FDO0FBQ3JDLGtEQUF1RjtBQUN2Riw4REFBd0Q7QUFDeEQsa0RBS3lCO0FBRXpCLDZDQUFtRDtBQUVuRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSSxLQUFLLFVBQVUscUNBQXFDLENBQ3pELEdBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFDNUIsU0FBUyxJQUFBLGtCQUFTLEdBQTZEO0lBRS9FLElBQUEsZ0NBQXdCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsSUFBQSxnQ0FBdUIsRUFBQyxNQUFNLENBQUMsQ0FBQztJQUVoQyxNQUFNLGNBQWMsR0FBRyxJQUFBLDhCQUFpQixFQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4RCxNQUFNLElBQUksR0FBdUI7UUFDL0IsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSztRQUMxQixJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1FBQ3hCLGNBQWM7UUFDZCxHQUFHO0tBQ0osQ0FBQztJQUNGLE1BQU0sRUFBQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFDLEdBQUcsTUFBTSxJQUFBLHFDQUF3QixFQUFDLElBQUksQ0FBQyxDQUFDO0lBRTlFLE9BQU87UUFDTDtZQUNFLElBQUksRUFBRSw4QkFBZSxDQUFDLEtBQUs7WUFDM0IsUUFBUSxFQUFFLEdBQUcsRUFBRTtnQkFDYix5RUFBeUU7Z0JBQ3pFLDZDQUE2QztnQkFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2pCLE1BQU0sSUFBSSxzQ0FBdUIsQ0FDL0Isc0NBQXNDLGNBQWMsK0JB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QUM7QUFDSixDQUFDO0FBbEhELHNGQWtIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZywgUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vLi4vLi4vcmVsZWFzZS9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtcbiAgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zLFxuICBnZXROZXh0QnJhbmNoTmFtZSxcbiAgaXNWZXJzaW9uQnJhbmNoLFxuICBSZWxlYXNlUmVwb1dpdGhBcGksXG59IGZyb20gJy4uLy4uLy4uL3JlbGVhc2UvdmVyc2lvbmluZyc7XG5pbXBvcnQge2Fzc2VydFZhbGlkR2l0aHViQ29uZmlnLCBnZXRDb25maWcsIEdpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge1xuICBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsXG4gIEludmFsaWRUYXJnZXRMYWJlbEVycm9yLFxuICBUYXJnZXRMYWJlbCxcbiAgVGFyZ2V0TGFiZWxOYW1lLFxufSBmcm9tICcuLi90YXJnZXQtbGFiZWwnO1xuXG5pbXBvcnQge2Fzc2VydEFjdGl2ZUx0c0JyYW5jaH0gZnJvbSAnLi9sdHMtYnJhbmNoJztcblxuLyoqXG4gKiBHZXRzIGEgbGlzdCBvZiB0YXJnZXQgbGFiZWxzIHdoaWNoIHNob3VsZCBiZSBjb25zaWRlcmVkIGJ5IHRoZSBtZXJnZVxuICogdG9vbGluZyB3aGVuIGEgcHVsbCByZXF1ZXN0IGlzIHByb2Nlc3NlZCB0byBiZSBtZXJnZWQuXG4gKlxuICogVGhlIHRhcmdldCBsYWJlbHMgYXJlIGltcGxlbWVudGVkIGFjY29yZGluZyB0byB0aGUgZGVzaWduIGRvY3VtZW50IHdoaWNoXG4gKiBzcGVjaWZpZXMgdmVyc2lvbmluZywgYnJhbmNoaW5nIGFuZCByZWxlYXNpbmcgZm9yIHRoZSBBbmd1bGFyIG9yZ2FuaXphdGlvbjpcbiAqIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMTk3a1ZpbGxEd3gtUlp0U1ZPQnRQYjRCQklBdzBFOVJUM3EzdjZEWmt5a1VcbiAqXG4gKiBAcGFyYW0gYXBpIEluc3RhbmNlIG9mIGFuIGF1dGhlbnRpY2F0ZWQgR2l0aHViIGNsaWVudC5cbiAqICAgZm9yIHRoZSByZWxlYXNlIHRyYWluIGJyYW5jaGVzLlxuICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgR2l0aHViIHJlbW90ZSBhbmQgcmVsZWFzZSBwYWNrYWdlcy4gVXNlZCB0byBmZXRjaFxuICogICBOUE0gdmVyc2lvbiBkYXRhIHdoZW4gTFRTIHZlcnNpb24gYnJhbmNoZXMgYXJlIHZhbGlkYXRlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRhcmdldExhYmVsc0ZvckFjdGl2ZVJlbGVhc2VUcmFpbnMoXG4gIGFwaSA9IEdpdENsaWVudC5nZXQoKS5naXRodWIsXG4gIGNvbmZpZyA9IGdldENvbmZpZygpIGFzIFBhcnRpYWw8e2dpdGh1YjogR2l0aHViQ29uZmlnOyByZWxlYXNlOiBSZWxlYXNlQ29uZmlnfT4sXG4pOiBQcm9taXNlPFRhcmdldExhYmVsW10+IHtcbiAgYXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG4gIGFzc2VydFZhbGlkR2l0aHViQ29uZmlnKGNvbmZpZyk7XG5cbiAgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSBnZXROZXh0QnJhbmNoTmFtZShjb25maWcuZ2l0aHViKTtcbiAgY29uc3QgcmVwbzogUmVsZWFzZVJlcG9XaXRoQXBpID0ge1xuICAgIG93bmVyOiBjb25maWcuZ2l0aHViLm93bmVyLFxuICAgIG5hbWU6IGNvbmZpZy5naXRodWIubmFtZSxcbiAgICBuZXh0QnJhbmNoTmFtZSxcbiAgICBhcGksXG4gIH07XG4gIGNvbnN0IHtsYXRlc3QsIHJlbGVhc2VDYW5kaWRhdGUsIG5leHR9ID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHJlcG8pO1xuXG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbmFtZTogVGFyZ2V0TGFiZWxOYW1lLk1BSk9SLFxuICAgICAgYnJhbmNoZXM6ICgpID0+IHtcbiAgICAgICAgLy8gSWYgYG5leHRgIGlzIGN1cnJlbnRseSBub3QgZGVzaWduYXRlZCB0byBiZSBhIG1ham9yIHZlcnNpb24sIHdlIGRvIG5vdFxuICAgICAgICAvLyBhbGxvdyBtZXJnaW5nIG9mIFBScyB3aXRoIGB0YXJnZXQ6IG1ham9yYC5cbiAgICAgICAgaWYgKCFuZXh0LmlzTWFqb3IpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIG1lcmdlIHB1bGwgcmVxdWVzdC4gVGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2ggd2lsbCBiZSByZWxlYXNlZCBhcyBgICtcbiAgICAgICAgICAgICAgJ2EgbWlub3IgdmVyc2lvbi4nLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtuZXh0QnJhbmNoTmFtZV07XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogVGFyZ2V0TGFiZWxOYW1lLk1JTk9SLFxuICAgICAgLy8gQ2hhbmdlcyBsYWJlbGVkIHdpdGggYHRhcmdldDogbWlub3JgIGFyZSBtZXJnZWQgbW9zdCBjb21tb25seSBpbnRvIHRoZSBuZXh0IGJyYW5jaFxuICAgICAgLy8gKGkuZS4gYG1haW5gKS4gSW4gcmFyZSBjYXNlcyBvZiBhbiBleGNlcHRpb25hbCBtaW5vciB2ZXJzaW9uIHdoaWxlIGJlaW5nXG4gICAgICAvLyBhbHJlYWR5IG9uIGEgbWFqb3IgcmVsZWFzZSB0cmFpbiwgdGhpcyB3b3VsZCBuZWVkIHRvIGJlIG92ZXJyaWRkZW4gbWFudWFsbHkuXG4gICAgICAvLyBUT0RPOiBDb25zaWRlciBoYW5kbGluZyB0aGlzIGF1dG9tYXRpY2FsbHkgYnkgY2hlY2tpbmcgaWYgdGhlIE5QTSB2ZXJzaW9uIG1hdGNoZXNcbiAgICAgIC8vIHRoZSBsYXN0LW1pbm9yLiBJZiBub3QsIHRoZW4gYW4gZXhjZXB0aW9uYWwgbWlub3IgbWlnaHQgYmUgaW4gcHJvZ3Jlc3MuIFNlZTpcbiAgICAgIC8vIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMTk3a1ZpbGxEd3gtUlp0U1ZPQnRQYjRCQklBdzBFOVJUM3EzdjZEWmt5a1UvZWRpdCNoZWFkaW5nPWguaDdvNXBqcTZ5cWQwXG4gICAgICBicmFuY2hlczogKCkgPT4gW25leHRCcmFuY2hOYW1lXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6IFRhcmdldExhYmVsTmFtZS5QQVRDSCxcbiAgICAgIGJyYW5jaGVzOiAoZ2l0aHViVGFyZ2V0QnJhbmNoKSA9PiB7XG4gICAgICAgIC8vIElmIGEgUFIgaXMgdGFyZ2V0aW5nIHRoZSBsYXRlc3QgYWN0aXZlIHZlcnNpb24tYnJhbmNoIHRocm91Z2ggdGhlIEdpdGh1YiBVSSxcbiAgICAgICAgLy8gYW5kIGlzIGFsc28gbGFiZWxlZCB3aXRoIGB0YXJnZXQ6IHBhdGNoYCwgdGhlbiB3ZSBtZXJnZSBpdCBkaXJlY3RseSBpbnRvIHRoZVxuICAgICAgICAvLyBicmFuY2ggd2l0aG91dCBkb2luZyBhbnkgY2hlcnJ5LXBpY2tpbmcuIFRoaXMgaXMgdXNlZnVsIGlmIGEgUFIgY291bGQgbm90IGJlXG4gICAgICAgIC8vIGFwcGxpZWQgY2xlYW5seSwgYW5kIGEgc2VwYXJhdGUgUFIgZm9yIHRoZSBwYXRjaCBicmFuY2ggaGFzIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgaWYgKGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gbGF0ZXN0LmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gW2xhdGVzdC5icmFuY2hOYW1lXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIHBhdGNoIGNoYW5nZXMgYXJlIGFsd2F5cyBtZXJnZWQgaW50byB0aGUgbmV4dCBhbmQgcGF0Y2ggYnJhbmNoLlxuICAgICAgICBjb25zdCBicmFuY2hlcyA9IFtuZXh0QnJhbmNoTmFtZSwgbGF0ZXN0LmJyYW5jaE5hbWVdO1xuICAgICAgICAvLyBBZGRpdGlvbmFsbHksIGlmIHRoZXJlIGlzIGEgcmVsZWFzZS1jYW5kaWRhdGUvZmVhdHVyZS1mcmVlemUgcmVsZWFzZS10cmFpblxuICAgICAgICAvLyBjdXJyZW50bHkgYWN0aXZlLCBhbHNvIG1lcmdlIHRoZSBQUiBpbnRvIHRoYXQgdmVyc2lvbi1icmFuY2guXG4gICAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgYnJhbmNoZXMucHVzaChyZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBicmFuY2hlcztcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBUYXJnZXRMYWJlbE5hbWUuUkVMRUFTRV9DQU5ESURBVEUsXG4gICAgICBicmFuY2hlczogKGdpdGh1YlRhcmdldEJyYW5jaCkgPT4ge1xuICAgICAgICAvLyBUaGUgYHRhcmdldDogcmNgIGxhYmVsIGNhbm5vdCBiZSBhcHBsaWVkIGlmIHRoZXJlIGlzIG5vIGFjdGl2ZSBmZWF0dXJlLWZyZWV6ZVxuICAgICAgICAvLyBvciByZWxlYXNlLWNhbmRpZGF0ZSByZWxlYXNlIHRyYWluLlxuICAgICAgICBpZiAocmVsZWFzZUNhbmRpZGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcihcbiAgICAgICAgICAgIGBObyBhY3RpdmUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLiBgICtcbiAgICAgICAgICAgICAgYFVuYWJsZSB0byBtZXJnZSBwdWxsIHJlcXVlc3QgdXNpbmcgXCJ0YXJnZXQ6IHJjXCIgbGFiZWwuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRoZSBQUiBpcyB0YXJnZXRpbmcgdGhlIGFjdGl2ZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSB2ZXJzaW9uIGJyYW5jaFxuICAgICAgICAvLyBkaXJlY3RseSB0aHJvdWdoIHRoZSBHaXRodWIgVUkgYW5kIGhhcyB0aGUgYHRhcmdldDogcmNgIGxhYmVsIGFwcGxpZWQsIG1lcmdlIGl0XG4gICAgICAgIC8vIG9ubHkgaW50byB0aGUgcmVsZWFzZSBjYW5kaWRhdGUgYnJhbmNoLiBUaGlzIGlzIHVzZWZ1bCBpZiBhIFBSIGRpZCBub3QgYXBwbHkgY2xlYW5seVxuICAgICAgICAvLyBpbnRvIHRoZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSBicmFuY2gsIGFuZCBhIHNlcGFyYXRlIFBSIGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHJldHVybiBbcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIG1lcmdlIGludG8gdGhlIG5leHQgYW5kIGFjdGl2ZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSBicmFuY2guXG4gICAgICAgIHJldHVybiBbbmV4dEJyYW5jaE5hbWUsIHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZV07XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgLy8gTFRTIGNoYW5nZXMgYXJlIHJhcmUgZW5vdWdoIHRoYXQgd2Ugd29uJ3Qgd29ycnkgYWJvdXQgY2hlcnJ5LXBpY2tpbmcgY2hhbmdlcyBpbnRvIGFsbFxuICAgICAgLy8gYWN0aXZlIExUUyBicmFuY2hlcyBmb3IgUFJzIGNyZWF0ZWQgYWdhaW5zdCBhbnkgb3RoZXIgYnJhbmNoLiBJbnN0ZWFkLCBQUiBhdXRob3JzIG5lZWRcbiAgICAgIC8vIHRvIG1hbnVhbGx5IGNyZWF0ZSBzZXBhcmF0ZSBQUnMgZm9yIGRlc2lyZWQgTFRTIGJyYW5jaGVzLiBBZGRpdGlvbmFsbHksIGFjdGl2ZSBMVCBicmFuY2hlc1xuICAgICAgLy8gY29tbW9ubHkgZGl2ZXJnZSBxdWlja2x5LiBUaGlzIG1ha2VzIGNoZXJyeS1waWNraW5nIG5vdCBhbiBvcHRpb24gZm9yIExUUyBjaGFuZ2VzLlxuICAgICAgbmFtZTogVGFyZ2V0TGFiZWxOYW1lLkxPTkdfVEVSTV9TVVBQT1JULFxuICAgICAgYnJhbmNoZXM6IGFzeW5jIChnaXRodWJUYXJnZXRCcmFuY2gpID0+IHtcbiAgICAgICAgaWYgKCFpc1ZlcnNpb25CcmFuY2goZ2l0aHViVGFyZ2V0QnJhbmNoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCBhcyBpdCBkb2VzIG5vdCB0YXJnZXQgYSBsb25nLXRlcm0gc3VwcG9ydCBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaDogXCIke2dpdGh1YlRhcmdldEJyYW5jaH1cImAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSBsYXRlc3QuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCB3aXRoIFwidGFyZ2V0OiBsdHNcIiBpbnRvIHBhdGNoIGJyYW5jaC4gYCArXG4gICAgICAgICAgICAgIGBDb25zaWRlciBjaGFuZ2luZyB0aGUgbGFiZWwgdG8gXCJ0YXJnZXQ6IHBhdGNoXCIgaWYgdGhpcyBpcyBpbnRlbnRpb25hbC5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwgJiYgZ2l0aHViVGFyZ2V0QnJhbmNoID09PSByZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgd2l0aCBcInRhcmdldDogbHRzXCIgaW50byBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaC4gQ29uc2lkZXIgY2hhbmdpbmcgdGhlIGxhYmVsIHRvIFwidGFyZ2V0OiByY1wiIGlmIHRoaXMgaXMgaW50ZW50aW9uYWwuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFzc2VydCB0aGF0IHRoZSBzZWxlY3RlZCBicmFuY2ggaXMgYW4gYWN0aXZlIExUUyBicmFuY2guXG4gICAgICAgIGF3YWl0IGFzc2VydEFjdGl2ZUx0c0JyYW5jaChyZXBvLCBjb25maWcucmVsZWFzZSwgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbiAgICAgICAgcmV0dXJuIFtnaXRodWJUYXJnZXRCcmFuY2hdO1xuICAgICAgfSxcbiAgICB9LFxuICBdO1xufVxuIl19