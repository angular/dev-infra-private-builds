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
const console_1 = require("../../../utils/console");
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
async function getTargetLabelsForActiveReleaseTrains({ latest, releaseCandidate, next }, api, config) {
    (0, config_1.assertValidGithubConfig)(config);
    const nextBranchName = (0, versioning_1.getNextBranchName)(config.github);
    const repo = {
        owner: config.github.owner,
        name: config.github.name,
        nextBranchName,
        api,
    };
    const targetLabels = [
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
    ];
    // LTS branches can only be determined if the release configuration is defined, and must be added
    // after asserting the configuration contains a release config.
    try {
        (0, index_1.assertValidReleaseConfig)(config);
        targetLabels.push({
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
                (0, index_1.assertValidReleaseConfig)(config);
                await (0, lts_branch_1.assertActiveLtsBranch)(repo, config.release, githubTargetBranch);
                return [githubTargetBranch];
            },
        });
    }
    catch (err) {
        if (err instanceof config_1.ConfigValidationError) {
            (0, console_1.debug)('LTS target label not included in target labels as no valid release configuration was');
            (0, console_1.debug)('found to allow the LTS branches to be determined.');
        }
        else {
            throw err;
        }
    }
    return targetLabels;
}
exports.getTargetLabelsForActiveReleaseTrains = getTargetLabelsForActiveReleaseTrains;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL2NvbW1vbi90YXJnZXRpbmcvbGFiZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHlEQUFzRjtBQUN0Riw0REFLcUM7QUFDckMsa0RBQW1HO0FBQ25HLGlEQUt3QjtBQUV4Qiw2Q0FBbUQ7QUFFbkQsb0RBQTZDO0FBRTdDOzs7Ozs7Ozs7OztHQVdHO0FBQ0ksS0FBSyxVQUFVLHFDQUFxQyxDQUN6RCxFQUFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQXNCLEVBQ3JELEdBQWlCLEVBQ2pCLE1BQStEO0lBRS9ELElBQUEsZ0NBQXVCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFFaEMsTUFBTSxjQUFjLEdBQUcsSUFBQSw4QkFBaUIsRUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEQsTUFBTSxJQUFJLEdBQXVCO1FBQy9CLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUs7UUFDMUIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUN4QixjQUFjO1FBQ2QsR0FBRztLQUNKLENBQUM7SUFFRixNQUFNLFlBQVksR0FBa0I7UUFDbEM7WUFDRSxJQUFJLEVBQUUsOEJBQWUsQ0FBQyxLQUFLO1lBQzNCLFFBQVEsRUFBRSxHQUFHLEVBQUU7Z0JBQ2IseUVBQXlFO2dCQUN6RSw2Q0FBNkM7Z0JBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNqQixNQUFNLElBQUksc0NBQXVCLENBQy9CLHNDQUFzQyxjQUFjLCtCQUErQjt3QkFDakYsa0JBQWtCLENBQ3JCLENBQUM7aUJBQ0g7Z0JBQ0QsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzFCLENBQUM7U0FDRjtRQUNEO1lBQ0UsSUFBSSxFQUFFLDhCQUFlLENBQUMsS0FBSztZQUMz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QUM5QixDQUFDO1NBQ0YsQ0FBQyxDQUFDO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLElBQUksR0FBRyxZQUFZLDhCQUFxQixFQUFFO1lBQ3hDLElBQUEsZUFBSyxFQUFDLHNGQUFzRixDQUFDLENBQUM7WUFDOUYsSUFBQSxlQUFLLEVBQUMsbURBQW1ELENBQUMsQ0FBQztTQUM1RDthQUFNO1lBQ0wsTUFBTSxHQUFHLENBQUM7U0FDWDtLQUNGO0lBRUQsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQWpJRCxzRkFpSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnRWYWxpZFJlbGVhc2VDb25maWcsIFJlbGVhc2VDb25maWd9IGZyb20gJy4uLy4uLy4uL3JlbGVhc2UvY29uZmlnL2luZGV4JztcbmltcG9ydCB7XG4gIEFjdGl2ZVJlbGVhc2VUcmFpbnMsXG4gIGdldE5leHRCcmFuY2hOYW1lLFxuICBpc1ZlcnNpb25CcmFuY2gsXG4gIFJlbGVhc2VSZXBvV2l0aEFwaSxcbn0gZnJvbSAnLi4vLi4vLi4vcmVsZWFzZS92ZXJzaW9uaW5nJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRHaXRodWJDb25maWcsIENvbmZpZ1ZhbGlkYXRpb25FcnJvciwgR2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtcbiAgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yLFxuICBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcixcbiAgVGFyZ2V0TGFiZWwsXG4gIFRhcmdldExhYmVsTmFtZSxcbn0gZnJvbSAnLi90YXJnZXQtbGFiZWwnO1xuXG5pbXBvcnQge2Fzc2VydEFjdGl2ZUx0c0JyYW5jaH0gZnJvbSAnLi9sdHMtYnJhbmNoJztcbmltcG9ydCB7R2l0aHViQ2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvZ2l0aHViJztcbmltcG9ydCB7ZGVidWd9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG4vKipcbiAqIEdldHMgYSBsaXN0IG9mIHRhcmdldCBsYWJlbHMgd2hpY2ggc2hvdWxkIGJlIGNvbnNpZGVyZWQgYnkgdGhlIG1lcmdlXG4gKiB0b29saW5nIHdoZW4gYSBwdWxsIHJlcXVlc3QgaXMgcHJvY2Vzc2VkIHRvIGJlIG1lcmdlZC5cbiAqXG4gKiBUaGUgdGFyZ2V0IGxhYmVscyBhcmUgaW1wbGVtZW50ZWQgYWNjb3JkaW5nIHRvIHRoZSBkZXNpZ24gZG9jdW1lbnQgd2hpY2hcbiAqIHNwZWNpZmllcyB2ZXJzaW9uaW5nLCBicmFuY2hpbmcgYW5kIHJlbGVhc2luZyBmb3IgdGhlIEFuZ3VsYXIgb3JnYW5pemF0aW9uOlxuICogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xOTdrVmlsbER3eC1SWnRTVk9CdFBiNEJCSUF3MEU5UlQzcTN2NkRaa3lrVVxuICpcbiAqIEBwYXJhbSBhcGkgSW5zdGFuY2Ugb2YgYSBHaXRodWIgY2xpZW50LiBVc2VkIHRvIHF1ZXJ5IGZvciB0aGUgcmVsZWFzZSB0cmFpbiBicmFuY2hlcy5cbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIEdpdGh1YiByZW1vdGUgYW5kIHJlbGVhc2UgcGFja2FnZXMuIFVzZWQgdG8gZmV0Y2hcbiAqICAgTlBNIHZlcnNpb24gZGF0YSB3aGVuIExUUyB2ZXJzaW9uIGJyYW5jaGVzIGFyZSB2YWxpZGF0ZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUYXJnZXRMYWJlbHNGb3JBY3RpdmVSZWxlYXNlVHJhaW5zKFxuICB7bGF0ZXN0LCByZWxlYXNlQ2FuZGlkYXRlLCBuZXh0fTogQWN0aXZlUmVsZWFzZVRyYWlucyxcbiAgYXBpOiBHaXRodWJDbGllbnQsXG4gIGNvbmZpZzogUGFydGlhbDx7Z2l0aHViOiBHaXRodWJDb25maWc7IHJlbGVhc2U6IFJlbGVhc2VDb25maWd9Pixcbik6IFByb21pc2U8VGFyZ2V0TGFiZWxbXT4ge1xuICBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZyhjb25maWcpO1xuXG4gIGNvbnN0IG5leHRCcmFuY2hOYW1lID0gZ2V0TmV4dEJyYW5jaE5hbWUoY29uZmlnLmdpdGh1Yik7XG4gIGNvbnN0IHJlcG86IFJlbGVhc2VSZXBvV2l0aEFwaSA9IHtcbiAgICBvd25lcjogY29uZmlnLmdpdGh1Yi5vd25lcixcbiAgICBuYW1lOiBjb25maWcuZ2l0aHViLm5hbWUsXG4gICAgbmV4dEJyYW5jaE5hbWUsXG4gICAgYXBpLFxuICB9O1xuXG4gIGNvbnN0IHRhcmdldExhYmVsczogVGFyZ2V0TGFiZWxbXSA9IFtcbiAgICB7XG4gICAgICBuYW1lOiBUYXJnZXRMYWJlbE5hbWUuTUFKT1IsXG4gICAgICBicmFuY2hlczogKCkgPT4ge1xuICAgICAgICAvLyBJZiBgbmV4dGAgaXMgY3VycmVudGx5IG5vdCBkZXNpZ25hdGVkIHRvIGJlIGEgbWFqb3IgdmVyc2lvbiwgd2UgZG8gbm90XG4gICAgICAgIC8vIGFsbG93IG1lcmdpbmcgb2YgUFJzIHdpdGggYHRhcmdldDogbWFqb3JgLlxuICAgICAgICBpZiAoIW5leHQuaXNNYWpvcikge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gbWVyZ2UgcHVsbCByZXF1ZXN0LiBUaGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaCB3aWxsIGJlIHJlbGVhc2VkIGFzIGAgK1xuICAgICAgICAgICAgICAnYSBtaW5vciB2ZXJzaW9uLicsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW25leHRCcmFuY2hOYW1lXTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBUYXJnZXRMYWJlbE5hbWUuTUlOT1IsXG4gICAgICAvLyBDaGFuZ2VzIGxhYmVsZWQgd2l0aCBgdGFyZ2V0OiBtaW5vcmAgYXJlIG1lcmdlZCBtb3N0IGNvbW1vbmx5IGludG8gdGhlIG5leHQgYnJhbmNoXG4gICAgICAvLyAoaS5lLiBgbWFpbmApLiBJbiByYXJlIGNhc2VzIG9mIGFuIGV4Y2VwdGlvbmFsIG1pbm9yIHZlcnNpb24gd2hpbGUgYmVpbmdcbiAgICAgIC8vIGFscmVhZHkgb24gYSBtYWpvciByZWxlYXNlIHRyYWluLCB0aGlzIHdvdWxkIG5lZWQgdG8gYmUgb3ZlcnJpZGRlbiBtYW51YWxseS5cbiAgICAgIC8vIFRPRE86IENvbnNpZGVyIGhhbmRsaW5nIHRoaXMgYXV0b21hdGljYWxseSBieSBjaGVja2luZyBpZiB0aGUgTlBNIHZlcnNpb24gbWF0Y2hlc1xuICAgICAgLy8gdGhlIGxhc3QtbWlub3IuIElmIG5vdCwgdGhlbiBhbiBleGNlcHRpb25hbCBtaW5vciBtaWdodCBiZSBpbiBwcm9ncmVzcy4gU2VlOlxuICAgICAgLy8gaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xOTdrVmlsbER3eC1SWnRTVk9CdFBiNEJCSUF3MEU5UlQzcTN2NkRaa3lrVS9lZGl0I2hlYWRpbmc9aC5oN281cGpxNnlxZDBcbiAgICAgIGJyYW5jaGVzOiAoKSA9PiBbbmV4dEJyYW5jaE5hbWVdLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogVGFyZ2V0TGFiZWxOYW1lLlBBVENILFxuICAgICAgYnJhbmNoZXM6IChnaXRodWJUYXJnZXRCcmFuY2gpID0+IHtcbiAgICAgICAgLy8gSWYgYSBQUiBpcyB0YXJnZXRpbmcgdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2ggdGhyb3VnaCB0aGUgR2l0aHViIFVJLFxuICAgICAgICAvLyBhbmQgaXMgYWxzbyBsYWJlbGVkIHdpdGggYHRhcmdldDogcGF0Y2hgLCB0aGVuIHdlIG1lcmdlIGl0IGRpcmVjdGx5IGludG8gdGhlXG4gICAgICAgIC8vIGJyYW5jaCB3aXRob3V0IGRvaW5nIGFueSBjaGVycnktcGlja2luZy4gVGhpcyBpcyB1c2VmdWwgaWYgYSBQUiBjb3VsZCBub3QgYmVcbiAgICAgICAgLy8gYXBwbGllZCBjbGVhbmx5LCBhbmQgYSBzZXBhcmF0ZSBQUiBmb3IgdGhlIHBhdGNoIGJyYW5jaCBoYXMgYmVlbiBjcmVhdGVkLlxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSBsYXRlc3QuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHJldHVybiBbbGF0ZXN0LmJyYW5jaE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgcGF0Y2ggY2hhbmdlcyBhcmUgYWx3YXlzIG1lcmdlZCBpbnRvIHRoZSBuZXh0IGFuZCBwYXRjaCBicmFuY2guXG4gICAgICAgIGNvbnN0IGJyYW5jaGVzID0gW25leHRCcmFuY2hOYW1lLCBsYXRlc3QuYnJhbmNoTmFtZV07XG4gICAgICAgIC8vIEFkZGl0aW9uYWxseSwgaWYgdGhlcmUgaXMgYSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSByZWxlYXNlLXRyYWluXG4gICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmUsIGFsc28gbWVyZ2UgdGhlIFBSIGludG8gdGhhdCB2ZXJzaW9uLWJyYW5jaC5cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICBicmFuY2hlcy5wdXNoKHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJyYW5jaGVzO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6IFRhcmdldExhYmVsTmFtZS5SRUxFQVNFX0NBTkRJREFURSxcbiAgICAgIGJyYW5jaGVzOiAoZ2l0aHViVGFyZ2V0QnJhbmNoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBgdGFyZ2V0OiByY2AgbGFiZWwgY2Fubm90IGJlIGFwcGxpZWQgaWYgdGhlcmUgaXMgbm8gYWN0aXZlIGZlYXR1cmUtZnJlZXplXG4gICAgICAgIC8vIG9yIHJlbGVhc2UtY2FuZGlkYXRlIHJlbGVhc2UgdHJhaW4uXG4gICAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRMYWJlbEVycm9yKFxuICAgICAgICAgICAgYE5vIGFjdGl2ZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2guIGAgK1xuICAgICAgICAgICAgICBgVW5hYmxlIHRvIG1lcmdlIHB1bGwgcmVxdWVzdCB1c2luZyBcInRhcmdldDogcmNcIiBsYWJlbC5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgdGhlIFBSIGlzIHRhcmdldGluZyB0aGUgYWN0aXZlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIHZlcnNpb24gYnJhbmNoXG4gICAgICAgIC8vIGRpcmVjdGx5IHRocm91Z2ggdGhlIEdpdGh1YiBVSSBhbmQgaGFzIHRoZSBgdGFyZ2V0OiByY2AgbGFiZWwgYXBwbGllZCwgbWVyZ2UgaXRcbiAgICAgICAgLy8gb25seSBpbnRvIHRoZSByZWxlYXNlIGNhbmRpZGF0ZSBicmFuY2guIFRoaXMgaXMgdXNlZnVsIGlmIGEgUFIgZGlkIG5vdCBhcHBseSBjbGVhbmx5XG4gICAgICAgIC8vIGludG8gdGhlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIGJyYW5jaCwgYW5kIGEgc2VwYXJhdGUgUFIgaGFzIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgaWYgKGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIFtyZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgbWVyZ2UgaW50byB0aGUgbmV4dCBhbmQgYWN0aXZlIHJlbGVhc2UtY2FuZGlkYXRlL2ZlYXR1cmUtZnJlZXplIGJyYW5jaC5cbiAgICAgICAgcmV0dXJuIFtuZXh0QnJhbmNoTmFtZSwgcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lXTtcbiAgICAgIH0sXG4gICAgfSxcbiAgXTtcblxuICAvLyBMVFMgYnJhbmNoZXMgY2FuIG9ubHkgYmUgZGV0ZXJtaW5lZCBpZiB0aGUgcmVsZWFzZSBjb25maWd1cmF0aW9uIGlzIGRlZmluZWQsIGFuZCBtdXN0IGJlIGFkZGVkXG4gIC8vIGFmdGVyIGFzc2VydGluZyB0aGUgY29uZmlndXJhdGlvbiBjb250YWlucyBhIHJlbGVhc2UgY29uZmlnLlxuICB0cnkge1xuICAgIGFzc2VydFZhbGlkUmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICAgIHRhcmdldExhYmVscy5wdXNoKHtcbiAgICAgIC8vIExUUyBjaGFuZ2VzIGFyZSByYXJlIGVub3VnaCB0aGF0IHdlIHdvbid0IHdvcnJ5IGFib3V0IGNoZXJyeS1waWNraW5nIGNoYW5nZXMgaW50byBhbGxcbiAgICAgIC8vIGFjdGl2ZSBMVFMgYnJhbmNoZXMgZm9yIFBScyBjcmVhdGVkIGFnYWluc3QgYW55IG90aGVyIGJyYW5jaC4gSW5zdGVhZCwgUFIgYXV0aG9ycyBuZWVkXG4gICAgICAvLyB0byBtYW51YWxseSBjcmVhdGUgc2VwYXJhdGUgUFJzIGZvciBkZXNpcmVkIExUUyBicmFuY2hlcy4gQWRkaXRpb25hbGx5LCBhY3RpdmUgTFQgYnJhbmNoZXNcbiAgICAgIC8vIGNvbW1vbmx5IGRpdmVyZ2UgcXVpY2tseS4gVGhpcyBtYWtlcyBjaGVycnktcGlja2luZyBub3QgYW4gb3B0aW9uIGZvciBMVFMgY2hhbmdlcy5cbiAgICAgIG5hbWU6IFRhcmdldExhYmVsTmFtZS5MT05HX1RFUk1fU1VQUE9SVCxcbiAgICAgIGJyYW5jaGVzOiBhc3luYyAoZ2l0aHViVGFyZ2V0QnJhbmNoKSA9PiB7XG4gICAgICAgIGlmICghaXNWZXJzaW9uQnJhbmNoKGdpdGh1YlRhcmdldEJyYW5jaCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgYXMgaXQgZG9lcyBub3QgdGFyZ2V0IGEgbG9uZy10ZXJtIHN1cHBvcnQgYCArXG4gICAgICAgICAgICAgIGBicmFuY2g6IFwiJHtnaXRodWJUYXJnZXRCcmFuY2h9XCJgLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gbGF0ZXN0LmJyYW5jaE5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgd2l0aCBcInRhcmdldDogbHRzXCIgaW50byBwYXRjaCBicmFuY2guIGAgK1xuICAgICAgICAgICAgICBgQ29uc2lkZXIgY2hhbmdpbmcgdGhlIGxhYmVsIHRvIFwidGFyZ2V0OiBwYXRjaFwiIGlmIHRoaXMgaXMgaW50ZW50aW9uYWwuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsICYmIGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihcbiAgICAgICAgICAgIGBQUiBjYW5ub3QgYmUgbWVyZ2VkIHdpdGggXCJ0YXJnZXQ6IGx0c1wiIGludG8gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYCArXG4gICAgICAgICAgICAgIGBicmFuY2guIENvbnNpZGVyIGNoYW5naW5nIHRoZSBsYWJlbCB0byBcInRhcmdldDogcmNcIiBpZiB0aGlzIGlzIGludGVudGlvbmFsLmAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBc3NlcnQgdGhhdCB0aGUgc2VsZWN0ZWQgYnJhbmNoIGlzIGFuIGFjdGl2ZSBMVFMgYnJhbmNoLlxuICAgICAgICBhc3NlcnRWYWxpZFJlbGVhc2VDb25maWcoY29uZmlnKTtcbiAgICAgICAgYXdhaXQgYXNzZXJ0QWN0aXZlTHRzQnJhbmNoKHJlcG8sIGNvbmZpZy5yZWxlYXNlLCBnaXRodWJUYXJnZXRCcmFuY2gpO1xuICAgICAgICByZXR1cm4gW2dpdGh1YlRhcmdldEJyYW5jaF07XG4gICAgICB9LFxuICAgIH0pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgQ29uZmlnVmFsaWRhdGlvbkVycm9yKSB7XG4gICAgICBkZWJ1ZygnTFRTIHRhcmdldCBsYWJlbCBub3QgaW5jbHVkZWQgaW4gdGFyZ2V0IGxhYmVscyBhcyBubyB2YWxpZCByZWxlYXNlIGNvbmZpZ3VyYXRpb24gd2FzJyk7XG4gICAgICBkZWJ1ZygnZm91bmQgdG8gYWxsb3cgdGhlIExUUyBicmFuY2hlcyB0byBiZSBkZXRlcm1pbmVkLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldExhYmVscztcbn1cbiJdfQ==