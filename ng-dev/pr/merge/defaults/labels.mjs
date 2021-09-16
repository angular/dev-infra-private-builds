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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL2RlZmF1bHRzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx5REFBc0Y7QUFDdEYsNERBS3FDO0FBQ3JDLGtEQUF1RjtBQUV2RixrREFLeUI7QUFFekIsNkNBQW1EO0FBR25EOzs7Ozs7Ozs7OztHQVdHO0FBQ0ksS0FBSyxVQUFVLHFDQUFxQyxDQUN6RCxHQUFpQixFQUNqQixNQUErRDtJQUUvRCxJQUFBLGdDQUF3QixFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLElBQUEsZ0NBQXVCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFFaEMsTUFBTSxjQUFjLEdBQUcsSUFBQSw4QkFBaUIsRUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEQsTUFBTSxJQUFJLEdBQXVCO1FBQy9CLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUs7UUFDMUIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUN4QixjQUFjO1FBQ2QsR0FBRztLQUNKLENBQUM7SUFDRixNQUFNLEVBQUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBQyxHQUFHLE1BQU0sSUFBQSxxQ0FBd0IsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUU5RSxPQUFPO1FBQ0w7WUFDRSxJQUFJLEVBQUUsOEJBQWUsQ0FBQyxLQUFLO1lBQzNCLFFBQVEsRUFBRSxHQUFHLEVBQUU7Z0JBQ2IseUVBQXlFO2dCQUN6RSw2Q0FBNkM7Z0JBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNqQixNQUFNLElBQUksc0NBQXVCLENBQy9CLHNDQUFzQyxjQUFjLCtCQUErQjt3QkFDakYsa0JBQWtCLENBQ3JCLENBQUM7aUJBQ0g7Z0JBQ0QsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFD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KiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnRWYWxpZFJlbGVhc2VDb25maWcsIFJlbGVhc2VDb25maWd9IGZyb20gJy4uLy4uLy4uL3JlbGVhc2UvY29uZmlnL2luZGV4JztcbmltcG9ydCB7XG4gIGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyxcbiAgZ2V0TmV4dEJyYW5jaE5hbWUsXG4gIGlzVmVyc2lvbkJyYW5jaCxcbiAgUmVsZWFzZVJlcG9XaXRoQXBpLFxufSBmcm9tICcuLi8uLi8uLi9yZWxlYXNlL3ZlcnNpb25pbmcnO1xuaW1wb3J0IHthc3NlcnRWYWxpZEdpdGh1YkNvbmZpZywgZ2V0Q29uZmlnLCBHaXRodWJDb25maWd9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtcbiAgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yLFxuICBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcixcbiAgVGFyZ2V0TGFiZWwsXG4gIFRhcmdldExhYmVsTmFtZSxcbn0gZnJvbSAnLi4vdGFyZ2V0LWxhYmVsJztcblxuaW1wb3J0IHthc3NlcnRBY3RpdmVMdHNCcmFuY2h9IGZyb20gJy4vbHRzLWJyYW5jaCc7XG5pbXBvcnQge0dpdGh1YkNsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yic7XG5cbi8qKlxuICogR2V0cyBhIGxpc3Qgb2YgdGFyZ2V0IGxhYmVscyB3aGljaCBzaG91bGQgYmUgY29uc2lkZXJlZCBieSB0aGUgbWVyZ2VcbiAqIHRvb2xpbmcgd2hlbiBhIHB1bGwgcmVxdWVzdCBpcyBwcm9jZXNzZWQgdG8gYmUgbWVyZ2VkLlxuICpcbiAqIFRoZSB0YXJnZXQgbGFiZWxzIGFyZSBpbXBsZW1lbnRlZCBhY2NvcmRpbmcgdG8gdGhlIGRlc2lnbiBkb2N1bWVudCB3aGljaFxuICogc3BlY2lmaWVzIHZlcnNpb25pbmcsIGJyYW5jaGluZyBhbmQgcmVsZWFzaW5nIGZvciB0aGUgQW5ndWxhciBvcmdhbml6YXRpb246XG4gKiBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzE5N2tWaWxsRHd4LVJadFNWT0J0UGI0QkJJQXcwRTlSVDNxM3Y2RFpreWtVXG4gKlxuICogQHBhcmFtIGFwaSBJbnN0YW5jZSBvZiBhIEdpdGh1YiBjbGllbnQuIFVzZWQgdG8gcXVlcnkgZm9yIHRoZSByZWxlYXNlIHRyYWluIGJyYW5jaGVzLlxuICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgR2l0aHViIHJlbW90ZSBhbmQgcmVsZWFzZSBwYWNrYWdlcy4gVXNlZCB0byBmZXRjaFxuICogICBOUE0gdmVyc2lvbiBkYXRhIHdoZW4gTFRTIHZlcnNpb24gYnJhbmNoZXMgYXJlIHZhbGlkYXRlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRhcmdldExhYmVsc0ZvckFjdGl2ZVJlbGVhc2VUcmFpbnMoXG4gIGFwaTogR2l0aHViQ2xpZW50LFxuICBjb25maWc6IFBhcnRpYWw8e2dpdGh1YjogR2l0aHViQ29uZmlnOyByZWxlYXNlOiBSZWxlYXNlQ29uZmlnfT4sXG4pOiBQcm9taXNlPFRhcmdldExhYmVsW10+IHtcbiAgYXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG4gIGFzc2VydFZhbGlkR2l0aHViQ29uZmlnKGNvbmZpZyk7XG5cbiAgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSBnZXROZXh0QnJhbmNoTmFtZShjb25maWcuZ2l0aHViKTtcbiAgY29uc3QgcmVwbzogUmVsZWFzZVJlcG9XaXRoQXBpID0ge1xuICAgIG93bmVyOiBjb25maWcuZ2l0aHViLm93bmVyLFxuICAgIG5hbWU6IGNvbmZpZy5naXRodWIubmFtZSxcbiAgICBuZXh0QnJhbmNoTmFtZSxcbiAgICBhcGksXG4gIH07XG4gIGNvbnN0IHtsYXRlc3QsIHJlbGVhc2VDYW5kaWRhdGUsIG5leHR9ID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHJlcG8pO1xuXG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbmFtZTogVGFyZ2V0TGFiZWxOYW1lLk1BSk9SLFxuICAgICAgYnJhbmNoZXM6ICgpID0+IHtcbiAgICAgICAgLy8gSWYgYG5leHRgIGlzIGN1cnJlbnRseSBub3QgZGVzaWduYXRlZCB0byBiZSBhIG1ham9yIHZlcnNpb24sIHdlIGRvIG5vdFxuICAgICAgICAvLyBhbGxvdyBtZXJnaW5nIG9mIFBScyB3aXRoIGB0YXJnZXQ6IG1ham9yYC5cbiAgICAgICAgaWYgKCFuZXh0LmlzTWFqb3IpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIG1lcmdlIHB1bGwgcmVxdWVzdC4gVGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2ggd2lsbCBiZSByZWxlYXNlZCBhcyBgICtcbiAgICAgICAgICAgICAgJ2EgbWlub3IgdmVyc2lvbi4nLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtuZXh0QnJhbmNoTmFtZV07XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogVGFyZ2V0TGFiZWxOYW1lLk1JTk9SLFxuICAgICAgLy8gQ2hhbmdlcyBsYWJlbGVkIHdpdGggYHRhcmdldDogbWlub3JgIGFyZSBtZXJnZWQgbW9zdCBjb21tb25seSBpbnRvIHRoZSBuZXh0IGJyYW5jaFxuICAgICAgLy8gKGkuZS4gYG1haW5gKS4gSW4gcmFyZSBjYXNlcyBvZiBhbiBleGNlcHRpb25hbCBtaW5vciB2ZXJzaW9uIHdoaWxlIGJlaW5nXG4gICAgICAvLyBhbHJlYWR5IG9uIGEgbWFqb3IgcmVsZWFzZSB0cmFpbiwgdGhpcyB3b3VsZCBuZWVkIHRvIGJlIG92ZXJyaWRkZW4gbWFudWFsbHkuXG4gICAgICAvLyBUT0RPOiBDb25zaWRlciBoYW5kbGluZyB0aGlzIGF1dG9tYXRpY2FsbHkgYnkgY2hlY2tpbmcgaWYgdGhlIE5QTSB2ZXJzaW9uIG1hdGNoZXNcbiAgICAgIC8vIHRoZSBsYXN0LW1pbm9yLiBJZiBub3QsIHRoZW4gYW4gZXhjZXB0aW9uYWwgbWlub3IgbWlnaHQgYmUgaW4gcHJvZ3Jlc3MuIFNlZTpcbiAgICAgIC8vIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMTk3a1ZpbGxEd3gtUlp0U1ZPQnRQYjRCQklBdzBFOVJUM3EzdjZEWmt5a1UvZWRpdCNoZWFkaW5nPWguaDdvNXBqcTZ5cWQwXG4gICAgICBicmFuY2hlczogKCkgPT4gW25leHRCcmFuY2hOYW1lXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6IFRhcmdldExhYmVsTmFtZS5QQVRDSCxcbiAgICAgIGJyYW5jaGVzOiAoZ2l0aHViVGFyZ2V0QnJhbmNoKSA9PiB7XG4gICAgICAgIC8vIElmIGEgUFIgaXMgdGFyZ2V0aW5nIHRoZSBsYXRlc3QgYWN0aXZlIHZlcnNpb24tYnJhbmNoIHRocm91Z2ggdGhlIEdpdGh1YiBVSSxcbiAgICAgICAgLy8gYW5kIGlzIGFsc28gbGFiZWxlZCB3aXRoIGB0YXJnZXQ6IHBhdGNoYCwgdGhlbiB3ZSBtZXJnZSBpdCBkaXJlY3RseSBpbnRvIHRoZVxuICAgICAgICAvLyBicmFuY2ggd2l0aG91dCBkb2luZyBhbnkgY2hlcnJ5LXBpY2tpbmcuIFRoaXMgaXMgdXNlZnVsIGlmIGEgUFIgY291bGQgbm90IGJlXG4gICAgICAgIC8vIGFwcGxpZWQgY2xlYW5seSwgYW5kIGEgc2VwYXJhdGUgUFIgZm9yIHRoZSBwYXRjaCBicmFuY2ggaGFzIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgaWYgKGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gbGF0ZXN0LmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gW2xhdGVzdC5icmFuY2hOYW1lXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIHBhdGNoIGNoYW5nZXMgYXJlIGFsd2F5cyBtZXJnZWQgaW50byB0aGUgbmV4dCBhbmQgcGF0Y2ggYnJhbmNoLlxuICAgICAgICBjb25zdCBicmFuY2hlcyA9IFtuZXh0QnJhbmNoTmFtZSwgbGF0ZXN0LmJyYW5jaE5hbWVdO1xuICAgICAgICAvLyBBZGRpdGlvbmFsbHksIGlmIHRoZXJlIGlzIGEgcmVsZWFzZS1jYW5kaWRhdGUvZmVhdHVyZS1mcmVlemUgcmVsZWFzZS10cmFpblxuICAgICAgICAvLyBjdXJyZW50bHkgYWN0aXZlLCBhbHNvIG1lcmdlIHRoZSBQUiBpbnRvIHRoYXQgdmVyc2lvbi1icmFuY2guXG4gICAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgICAgICAgYnJhbmNoZXMucHVzaChyZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBicmFuY2hlcztcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBUYXJnZXRMYWJlbE5hbWUuUkVMRUFTRV9DQU5ESURBVEUsXG4gICAgICBicmFuY2hlczogKGdpdGh1YlRhcmdldEJyYW5jaCkgPT4ge1xuICAgICAgICAvLyBUaGUgYHRhcmdldDogcmNgIGxhYmVsIGNhbm5vdCBiZSBhcHBsaWVkIGlmIHRoZXJlIGlzIG5vIGFjdGl2ZSBmZWF0dXJlLWZyZWV6ZVxuICAgICAgICAvLyBvciByZWxlYXNlLWNhbmRpZGF0ZSByZWxlYXNlIHRyYWluLlxuICAgICAgICBpZiAocmVsZWFzZUNhbmRpZGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcihcbiAgICAgICAgICAgIGBObyBhY3RpdmUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLiBgICtcbiAgICAgICAgICAgICAgYFVuYWJsZSB0byBtZXJnZSBwdWxsIHJlcXVlc3QgdXNpbmcgXCJ0YXJnZXQ6IHJjXCIgbGFiZWwuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRoZSBQUiBpcyB0YXJnZXRpbmcgdGhlIGFjdGl2ZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSB2ZXJzaW9uIGJyYW5jaFxuICAgICAgICAvLyBkaXJlY3RseSB0aHJvdWdoIHRoZSBHaXRodWIgVUkgYW5kIGhhcyB0aGUgYHRhcmdldDogcmNgIGxhYmVsIGFwcGxpZWQsIG1lcmdlIGl0XG4gICAgICAgIC8vIG9ubHkgaW50byB0aGUgcmVsZWFzZSBjYW5kaWRhdGUgYnJhbmNoLiBUaGlzIGlzIHVzZWZ1bCBpZiBhIFBSIGRpZCBub3QgYXBwbHkgY2xlYW5seVxuICAgICAgICAvLyBpbnRvIHRoZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSBicmFuY2gsIGFuZCBhIHNlcGFyYXRlIFBSIGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHJldHVybiBbcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIG1lcmdlIGludG8gdGhlIG5leHQgYW5kIGFjdGl2ZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSBicmFuY2guXG4gICAgICAgIHJldHVybiBbbmV4dEJyYW5jaE5hbWUsIHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZV07XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgLy8gTFRTIGNoYW5nZXMgYXJlIHJhcmUgZW5vdWdoIHRoYXQgd2Ugd29uJ3Qgd29ycnkgYWJvdXQgY2hlcnJ5LXBpY2tpbmcgY2hhbmdlcyBpbnRvIGFsbFxuICAgICAgLy8gYWN0aXZlIExUUyBicmFuY2hlcyBmb3IgUFJzIGNyZWF0ZWQgYWdhaW5zdCBhbnkgb3RoZXIgYnJhbmNoLiBJbnN0ZWFkLCBQUiBhdXRob3JzIG5lZWRcbiAgICAgIC8vIHRvIG1hbnVhbGx5IGNyZWF0ZSBzZXBhcmF0ZSBQUnMgZm9yIGRlc2lyZWQgTFRTIGJyYW5jaGVzLiBBZGRpdGlvbmFsbHksIGFjdGl2ZSBMVCBicmFuY2hlc1xuICAgICAgLy8gY29tbW9ubHkgZGl2ZXJnZSBxdWlja2x5LiBUaGlzIG1ha2VzIGNoZXJyeS1waWNraW5nIG5vdCBhbiBvcHRpb24gZm9yIExUUyBjaGFuZ2VzLlxuICAgICAgbmFtZTogVGFyZ2V0TGFiZWxOYW1lLkxPTkdfVEVSTV9TVVBQT1JULFxuICAgICAgYnJhbmNoZXM6IGFzeW5jIChnaXRodWJUYXJnZXRCcmFuY2gpID0+IHtcbiAgICAgICAgaWYgKCFpc1ZlcnNpb25CcmFuY2goZ2l0aHViVGFyZ2V0QnJhbmNoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCBhcyBpdCBkb2VzIG5vdCB0YXJnZXQgYSBsb25nLXRlcm0gc3VwcG9ydCBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaDogXCIke2dpdGh1YlRhcmdldEJyYW5jaH1cImAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSBsYXRlc3QuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgICAgICBgUFIgY2Fubm90IGJlIG1lcmdlZCB3aXRoIFwidGFyZ2V0OiBsdHNcIiBpbnRvIHBhdGNoIGJyYW5jaC4gYCArXG4gICAgICAgICAgICAgIGBDb25zaWRlciBjaGFuZ2luZyB0aGUgbGFiZWwgdG8gXCJ0YXJnZXQ6IHBhdGNoXCIgaWYgdGhpcyBpcyBpbnRlbnRpb25hbC5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwgJiYgZ2l0aHViVGFyZ2V0QnJhbmNoID09PSByZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgd2l0aCBcInRhcmdldDogbHRzXCIgaW50byBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaC4gQ29uc2lkZXIgY2hhbmdpbmcgdGhlIGxhYmVsIHRvIFwidGFyZ2V0OiByY1wiIGlmIHRoaXMgaXMgaW50ZW50aW9uYWwuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFzc2VydCB0aGF0IHRoZSBzZWxlY3RlZCBicmFuY2ggaXMgYW4gYWN0aXZlIExUUyBicmFuY2guXG4gICAgICAgIGF3YWl0IGFzc2VydEFjdGl2ZUx0c0JyYW5jaChyZXBvLCBjb25maWcucmVsZWFzZSwgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbiAgICAgICAgcmV0dXJuIFtnaXRodWJUYXJnZXRCcmFuY2hdO1xuICAgICAgfSxcbiAgICB9LFxuICBdO1xufVxuIl19