/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __generator } from "tslib";
import { fetchActiveReleaseTrains, isVersionBranch, nextBranchName } from '../../../release/versioning';
import { InvalidTargetBranchError, InvalidTargetLabelError } from '../target-label';
import { assertActiveLtsBranch } from './lts-branch';
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
export function getDefaultTargetLabelConfiguration(api, githubConfig, releaseConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var repo, _a, latest, releaseCandidate, next;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    repo = { owner: githubConfig.owner, name: githubConfig.name, api: api };
                    return [4 /*yield*/, fetchActiveReleaseTrains(repo)];
                case 1:
                    _a = _b.sent(), latest = _a.latest, releaseCandidate = _a.releaseCandidate, next = _a.next;
                    return [2 /*return*/, [
                            {
                                pattern: 'target: major',
                                branches: function () {
                                    // If `next` is currently not designated to be a major version, we do not
                                    // allow merging of PRs with `target: major`.
                                    if (!next.isMajor) {
                                        throw new InvalidTargetLabelError("Unable to merge pull request. The \"" + nextBranchName + "\" branch will be released as " +
                                            'a minor version.');
                                    }
                                    return [nextBranchName];
                                },
                            },
                            {
                                pattern: 'target: minor',
                                // Changes labeled with `target: minor` are merged most commonly into the next branch
                                // (i.e. `master`). In rare cases of an exceptional minor version while being already
                                // on a major release train, this would need to be overridden manually.
                                // TODO: Consider handling this automatically by checking if the NPM version matches
                                // the last-minor. If not, then an exceptional minor might be in progress. See:
                                // https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU/edit#heading=h.h7o5pjq6yqd0
                                branches: [nextBranchName],
                            },
                            {
                                pattern: 'target: patch',
                                branches: function (githubTargetBranch) {
                                    // If a PR is targeting the latest active version-branch through the Github UI,
                                    // and is also labeled with `target: patch`, then we merge it directly into the
                                    // branch without doing any cherry-picking. This is useful if a PR could not be
                                    // applied cleanly, and a separate PR for the patch branch has been created.
                                    if (githubTargetBranch === latest.branchName) {
                                        return [latest.branchName];
                                    }
                                    // Otherwise, patch changes are always merged into the next and patch branch.
                                    var branches = [nextBranchName, latest.branchName];
                                    // Additionally, if there is a release-candidate/feature-freeze release-train
                                    // currently active, also merge the PR into that version-branch.
                                    if (releaseCandidate !== null) {
                                        branches.push(releaseCandidate.branchName);
                                    }
                                    return branches;
                                }
                            },
                            {
                                pattern: 'target: rc',
                                branches: function (githubTargetBranch) {
                                    // The `target: rc` label cannot be applied if there is no active feature-freeze
                                    // or release-candidate release train.
                                    if (releaseCandidate === null) {
                                        throw new InvalidTargetLabelError("No active feature-freeze/release-candidate branch. " +
                                            "Unable to merge pull request using \"target: rc\" label.");
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
                                branches: function (githubTargetBranch) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!isVersionBranch(githubTargetBranch)) {
                                                    throw new InvalidTargetBranchError("PR cannot be merged as it does not target a long-term support " +
                                                        ("branch: \"" + githubTargetBranch + "\""));
                                                }
                                                if (githubTargetBranch === latest.branchName) {
                                                    throw new InvalidTargetBranchError("PR cannot be merged with \"target: lts\" into patch branch. " +
                                                        "Consider changing the label to \"target: patch\" if this is intentional.");
                                                }
                                                if (releaseCandidate !== null && githubTargetBranch === releaseCandidate.branchName) {
                                                    throw new InvalidTargetBranchError("PR cannot be merged with \"target: lts\" into feature-freeze/release-candidate " +
                                                        "branch. Consider changing the label to \"target: rc\" if this is intentional.");
                                                }
                                                // Assert that the selected branch is an active LTS branch.
                                                return [4 /*yield*/, assertActiveLtsBranch(repo, releaseConfig, githubTargetBranch)];
                                            case 1:
                                                // Assert that the selected branch is an active LTS branch.
                                                _a.sent();
                                                return [2 /*return*/, [githubTargetBranch]];
                                        }
                                    });
                                }); },
                            },
                        ]];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2RlZmF1bHRzL2xhYmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBR0gsT0FBTyxFQUFDLHdCQUF3QixFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUl0RyxPQUFPLEVBQUMsd0JBQXdCLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUVsRixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFbkQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLFVBQWdCLGtDQUFrQyxDQUNwRCxHQUFpQixFQUFFLFlBQTBCLEVBQzdDLGFBQTRCOzs7Ozs7O29CQUN4QixJQUFJLEdBQUcsRUFBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRSxHQUFHLEtBQUEsRUFBQyxDQUFDO29CQUM5QixxQkFBTSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsRUFBQTs7b0JBQXZFLEtBQW1DLFNBQW9DLEVBQXRFLE1BQU0sWUFBQSxFQUFFLGdCQUFnQixzQkFBQSxFQUFFLElBQUksVUFBQTtvQkFFckMsc0JBQU87NEJBQ0w7Z0NBQ0UsT0FBTyxFQUFFLGVBQWU7Z0NBQ3hCLFFBQVEsRUFBRTtvQ0FDUix5RUFBeUU7b0NBQ3pFLDZDQUE2QztvQ0FDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7d0NBQ2pCLE1BQU0sSUFBSSx1QkFBdUIsQ0FDN0IseUNBQXNDLGNBQWMsbUNBQStCOzRDQUNuRixrQkFBa0IsQ0FBQyxDQUFDO3FDQUN6QjtvQ0FDRCxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7Z0NBQzFCLENBQUM7NkJBQ0Y7NEJBQ0Q7Z0NBQ0UsT0FBTyxFQUFFLGVBQWU7Z0NBQ3hCLHFGQUFxRjtnQ0FDckYscUZBQXFGO2dDQUNyRix1RUFBdUU7Z0NBQ3ZFLG9GQUFvRjtnQ0FDcEYsK0VBQStFO2dDQUMvRSw4R0FBOEc7Z0NBQzlHLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQzs2QkFDM0I7NEJBQ0Q7Z0NBQ0UsT0FBTyxFQUFFLGVBQWU7Z0NBQ3hCLFFBQVEsRUFBRSxVQUFBLGtCQUFrQjtvQ0FDMUIsK0VBQStFO29DQUMvRSwrRUFBK0U7b0NBQy9FLCtFQUErRTtvQ0FDL0UsNEVBQTRFO29DQUM1RSxJQUFJLGtCQUFrQixLQUFLLE1BQU0sQ0FBQyxVQUFVLEVBQUU7d0NBQzVDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7cUNBQzVCO29DQUNELDZFQUE2RTtvQ0FDN0UsSUFBTSxRQUFRLEdBQUcsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29DQUNyRCw2RUFBNkU7b0NBQzdFLGdFQUFnRTtvQ0FDaEUsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7d0NBQzdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7cUNBQzVDO29DQUNELE9BQU8sUUFBUSxDQUFDO2dDQUNsQixDQUFDOzZCQUNGOzRCQUNEO2dDQUNFLE9BQU8sRUFBRSxZQUFZO2dDQUNyQixRQUFRLEVBQUUsVUFBQSxrQkFBa0I7b0NBQzFCLGdGQUFnRjtvQ0FDaEYsc0NBQXNDO29DQUN0QyxJQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRTt3Q0FDN0IsTUFBTSxJQUFJLHVCQUF1QixDQUM3QixxREFBcUQ7NENBQ3JELDBEQUF3RCxDQUFDLENBQUM7cUNBQy9EO29DQUNELG9GQUFvRjtvQ0FDcEYsa0ZBQWtGO29DQUNsRix1RkFBdUY7b0NBQ3ZGLHdGQUF3RjtvQ0FDeEYsSUFBSSxrQkFBa0IsS0FBSyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUU7d0NBQ3RELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztxQ0FDdEM7b0NBQ0QscUZBQXFGO29DQUNyRixPQUFPLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2dDQUN2RCxDQUFDOzZCQUNGOzRCQUNEO2dDQUNFLHdGQUF3RjtnQ0FDeEYseUZBQXlGO2dDQUN6Riw2RkFBNkY7Z0NBQzdGLHFGQUFxRjtnQ0FDckYsT0FBTyxFQUFFLGFBQWE7Z0NBQ3RCLFFBQVEsRUFBRSxVQUFNLGtCQUFrQjs7OztnREFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO29EQUN4QyxNQUFNLElBQUksd0JBQXdCLENBQzlCLGdFQUFnRTt5REFDaEUsZUFBWSxrQkFBa0IsT0FBRyxDQUFBLENBQUMsQ0FBQztpREFDeEM7Z0RBQ0QsSUFBSSxrQkFBa0IsS0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFO29EQUM1QyxNQUFNLElBQUksd0JBQXdCLENBQzlCLDhEQUE0RDt3REFDNUQsMEVBQXdFLENBQUMsQ0FBQztpREFDL0U7Z0RBQ0QsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLElBQUksa0JBQWtCLEtBQUssZ0JBQWdCLENBQUMsVUFBVSxFQUFFO29EQUNuRixNQUFNLElBQUksd0JBQXdCLENBQzlCLGlGQUErRTt3REFDL0UsK0VBQTZFLENBQUMsQ0FBQztpREFDcEY7Z0RBQ0QsMkRBQTJEO2dEQUMzRCxxQkFBTSxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixDQUFDLEVBQUE7O2dEQURwRSwyREFBMkQ7Z0RBQzNELFNBQW9FLENBQUM7Z0RBQ3JFLHNCQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBQzs7O3FDQUM3Qjs2QkFDRjt5QkFDRixFQUFDOzs7O0NBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi8uLi8uLi9yZWxlYXNlL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge2ZldGNoQWN0aXZlUmVsZWFzZVRyYWlucywgaXNWZXJzaW9uQnJhbmNoLCBuZXh0QnJhbmNoTmFtZX0gZnJvbSAnLi4vLi4vLi4vcmVsZWFzZS92ZXJzaW9uaW5nJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtHaXRodWJDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuaW1wb3J0IHtUYXJnZXRMYWJlbH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7SW52YWxpZFRhcmdldEJyYW5jaEVycm9yLCBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcn0gZnJvbSAnLi4vdGFyZ2V0LWxhYmVsJztcblxuaW1wb3J0IHthc3NlcnRBY3RpdmVMdHNCcmFuY2h9IGZyb20gJy4vbHRzLWJyYW5jaCc7XG5cbi8qKlxuICogR2V0cyBhIGxhYmVsIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBtZXJnZSB0b29saW5nIHRoYXQgcmVmbGVjdHMgdGhlIGRlZmF1bHQgQW5ndWxhclxuICogb3JnYW5pemF0aW9uLXdpZGUgbGFiZWxpbmcgYW5kIGJyYW5jaGluZyBzZW1hbnRpY3MgYXMgb3V0bGluZWQgaW4gdGhlIHNwZWNpZmljYXRpb24uXG4gKlxuICogaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xOTdrVmlsbER3eC1SWnRTVk9CdFBiNEJCSUF3MEU5UlQzcTN2NkRaa3lrVVxuICpcbiAqIEBwYXJhbSBhcGkgSW5zdGFuY2Ugb2YgYW4gYXV0aGVudGljYXRlZCBHaXRodWIgY2xpZW50LlxuICogQHBhcmFtIGdpdGh1YkNvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgR2l0aHViIHJlbW90ZS4gVXNlZCBhcyBHaXQgcmVtb3RlXG4gKiAgIGZvciB0aGUgcmVsZWFzZSB0cmFpbiBicmFuY2hlcy5cbiAqIEBwYXJhbSByZWxlYXNlQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSByZWxlYXNlIHBhY2thZ2VzLiBVc2VkIHRvIGZldGNoXG4gKiAgIE5QTSB2ZXJzaW9uIGRhdGEgd2hlbiBMVFMgdmVyc2lvbiBicmFuY2hlcyBhcmUgdmFsaWRhdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGVmYXVsdFRhcmdldExhYmVsQ29uZmlndXJhdGlvbihcbiAgICBhcGk6IEdpdGh1YkNsaWVudCwgZ2l0aHViQ29uZmlnOiBHaXRodWJDb25maWcsXG4gICAgcmVsZWFzZUNvbmZpZzogUmVsZWFzZUNvbmZpZyk6IFByb21pc2U8VGFyZ2V0TGFiZWxbXT4ge1xuICBjb25zdCByZXBvID0ge293bmVyOiBnaXRodWJDb25maWcub3duZXIsIG5hbWU6IGdpdGh1YkNvbmZpZy5uYW1lLCBhcGl9O1xuICBjb25zdCB7bGF0ZXN0LCByZWxlYXNlQ2FuZGlkYXRlLCBuZXh0fSA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIHBhdHRlcm46ICd0YXJnZXQ6IG1ham9yJyxcbiAgICAgIGJyYW5jaGVzOiAoKSA9PiB7XG4gICAgICAgIC8vIElmIGBuZXh0YCBpcyBjdXJyZW50bHkgbm90IGRlc2lnbmF0ZWQgdG8gYmUgYSBtYWpvciB2ZXJzaW9uLCB3ZSBkbyBub3RcbiAgICAgICAgLy8gYWxsb3cgbWVyZ2luZyBvZiBQUnMgd2l0aCBgdGFyZ2V0OiBtYWpvcmAuXG4gICAgICAgIGlmICghbmV4dC5pc01ham9yKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRMYWJlbEVycm9yKFxuICAgICAgICAgICAgICBgVW5hYmxlIHRvIG1lcmdlIHB1bGwgcmVxdWVzdC4gVGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2ggd2lsbCBiZSByZWxlYXNlZCBhcyBgICtcbiAgICAgICAgICAgICAgJ2EgbWlub3IgdmVyc2lvbi4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW25leHRCcmFuY2hOYW1lXTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBwYXR0ZXJuOiAndGFyZ2V0OiBtaW5vcicsXG4gICAgICAvLyBDaGFuZ2VzIGxhYmVsZWQgd2l0aCBgdGFyZ2V0OiBtaW5vcmAgYXJlIG1lcmdlZCBtb3N0IGNvbW1vbmx5IGludG8gdGhlIG5leHQgYnJhbmNoXG4gICAgICAvLyAoaS5lLiBgbWFzdGVyYCkuIEluIHJhcmUgY2FzZXMgb2YgYW4gZXhjZXB0aW9uYWwgbWlub3IgdmVyc2lvbiB3aGlsZSBiZWluZyBhbHJlYWR5XG4gICAgICAvLyBvbiBhIG1ham9yIHJlbGVhc2UgdHJhaW4sIHRoaXMgd291bGQgbmVlZCB0byBiZSBvdmVycmlkZGVuIG1hbnVhbGx5LlxuICAgICAgLy8gVE9ETzogQ29uc2lkZXIgaGFuZGxpbmcgdGhpcyBhdXRvbWF0aWNhbGx5IGJ5IGNoZWNraW5nIGlmIHRoZSBOUE0gdmVyc2lvbiBtYXRjaGVzXG4gICAgICAvLyB0aGUgbGFzdC1taW5vci4gSWYgbm90LCB0aGVuIGFuIGV4Y2VwdGlvbmFsIG1pbm9yIG1pZ2h0IGJlIGluIHByb2dyZXNzLiBTZWU6XG4gICAgICAvLyBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzE5N2tWaWxsRHd4LVJadFNWT0J0UGI0QkJJQXcwRTlSVDNxM3Y2RFpreWtVL2VkaXQjaGVhZGluZz1oLmg3bzVwanE2eXFkMFxuICAgICAgYnJhbmNoZXM6IFtuZXh0QnJhbmNoTmFtZV0sXG4gICAgfSxcbiAgICB7XG4gICAgICBwYXR0ZXJuOiAndGFyZ2V0OiBwYXRjaCcsXG4gICAgICBicmFuY2hlczogZ2l0aHViVGFyZ2V0QnJhbmNoID0+IHtcbiAgICAgICAgLy8gSWYgYSBQUiBpcyB0YXJnZXRpbmcgdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2ggdGhyb3VnaCB0aGUgR2l0aHViIFVJLFxuICAgICAgICAvLyBhbmQgaXMgYWxzbyBsYWJlbGVkIHdpdGggYHRhcmdldDogcGF0Y2hgLCB0aGVuIHdlIG1lcmdlIGl0IGRpcmVjdGx5IGludG8gdGhlXG4gICAgICAgIC8vIGJyYW5jaCB3aXRob3V0IGRvaW5nIGFueSBjaGVycnktcGlja2luZy4gVGhpcyBpcyB1c2VmdWwgaWYgYSBQUiBjb3VsZCBub3QgYmVcbiAgICAgICAgLy8gYXBwbGllZCBjbGVhbmx5LCBhbmQgYSBzZXBhcmF0ZSBQUiBmb3IgdGhlIHBhdGNoIGJyYW5jaCBoYXMgYmVlbiBjcmVhdGVkLlxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSBsYXRlc3QuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHJldHVybiBbbGF0ZXN0LmJyYW5jaE5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgcGF0Y2ggY2hhbmdlcyBhcmUgYWx3YXlzIG1lcmdlZCBpbnRvIHRoZSBuZXh0IGFuZCBwYXRjaCBicmFuY2guXG4gICAgICAgIGNvbnN0IGJyYW5jaGVzID0gW25leHRCcmFuY2hOYW1lLCBsYXRlc3QuYnJhbmNoTmFtZV07XG4gICAgICAgIC8vIEFkZGl0aW9uYWxseSwgaWYgdGhlcmUgaXMgYSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSByZWxlYXNlLXRyYWluXG4gICAgICAgIC8vIGN1cnJlbnRseSBhY3RpdmUsIGFsc28gbWVyZ2UgdGhlIFBSIGludG8gdGhhdCB2ZXJzaW9uLWJyYW5jaC5cbiAgICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgICBicmFuY2hlcy5wdXNoKHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJyYW5jaGVzO1xuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgcGF0dGVybjogJ3RhcmdldDogcmMnLFxuICAgICAgYnJhbmNoZXM6IGdpdGh1YlRhcmdldEJyYW5jaCA9PiB7XG4gICAgICAgIC8vIFRoZSBgdGFyZ2V0OiByY2AgbGFiZWwgY2Fubm90IGJlIGFwcGxpZWQgaWYgdGhlcmUgaXMgbm8gYWN0aXZlIGZlYXR1cmUtZnJlZXplXG4gICAgICAgIC8vIG9yIHJlbGVhc2UtY2FuZGlkYXRlIHJlbGVhc2UgdHJhaW4uXG4gICAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRMYWJlbEVycm9yKFxuICAgICAgICAgICAgICBgTm8gYWN0aXZlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gYCArXG4gICAgICAgICAgICAgIGBVbmFibGUgdG8gbWVyZ2UgcHVsbCByZXF1ZXN0IHVzaW5nIFwidGFyZ2V0OiByY1wiIGxhYmVsLmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRoZSBQUiBpcyB0YXJnZXRpbmcgdGhlIGFjdGl2ZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSB2ZXJzaW9uIGJyYW5jaFxuICAgICAgICAvLyBkaXJlY3RseSB0aHJvdWdoIHRoZSBHaXRodWIgVUkgYW5kIGhhcyB0aGUgYHRhcmdldDogcmNgIGxhYmVsIGFwcGxpZWQsIG1lcmdlIGl0XG4gICAgICAgIC8vIG9ubHkgaW50byB0aGUgcmVsZWFzZSBjYW5kaWRhdGUgYnJhbmNoLiBUaGlzIGlzIHVzZWZ1bCBpZiBhIFBSIGRpZCBub3QgYXBwbHkgY2xlYW5seVxuICAgICAgICAvLyBpbnRvIHRoZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSBicmFuY2gsIGFuZCBhIHNlcGFyYXRlIFBSIGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggPT09IHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHJldHVybiBbcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIG1lcmdlIGludG8gdGhlIG5leHQgYW5kIGFjdGl2ZSByZWxlYXNlLWNhbmRpZGF0ZS9mZWF0dXJlLWZyZWV6ZSBicmFuY2guXG4gICAgICAgIHJldHVybiBbbmV4dEJyYW5jaE5hbWUsIHJlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZV07XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgLy8gTFRTIGNoYW5nZXMgYXJlIHJhcmUgZW5vdWdoIHRoYXQgd2Ugd29uJ3Qgd29ycnkgYWJvdXQgY2hlcnJ5LXBpY2tpbmcgY2hhbmdlcyBpbnRvIGFsbFxuICAgICAgLy8gYWN0aXZlIExUUyBicmFuY2hlcyBmb3IgUFJzIGNyZWF0ZWQgYWdhaW5zdCBhbnkgb3RoZXIgYnJhbmNoLiBJbnN0ZWFkLCBQUiBhdXRob3JzIG5lZWRcbiAgICAgIC8vIHRvIG1hbnVhbGx5IGNyZWF0ZSBzZXBhcmF0ZSBQUnMgZm9yIGRlc2lyZWQgTFRTIGJyYW5jaGVzLiBBZGRpdGlvbmFsbHksIGFjdGl2ZSBMVCBicmFuY2hlc1xuICAgICAgLy8gY29tbW9ubHkgZGl2ZXJnZSBxdWlja2x5LiBUaGlzIG1ha2VzIGNoZXJyeS1waWNraW5nIG5vdCBhbiBvcHRpb24gZm9yIExUUyBjaGFuZ2VzLlxuICAgICAgcGF0dGVybjogJ3RhcmdldDogbHRzJyxcbiAgICAgIGJyYW5jaGVzOiBhc3luYyBnaXRodWJUYXJnZXRCcmFuY2ggPT4ge1xuICAgICAgICBpZiAoIWlzVmVyc2lvbkJyYW5jaChnaXRodWJUYXJnZXRCcmFuY2gpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihcbiAgICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgYXMgaXQgZG9lcyBub3QgdGFyZ2V0IGEgbG9uZy10ZXJtIHN1cHBvcnQgYCArXG4gICAgICAgICAgICAgIGBicmFuY2g6IFwiJHtnaXRodWJUYXJnZXRCcmFuY2h9XCJgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoID09PSBsYXRlc3QuYnJhbmNoTmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgICAgICAgIGBQUiBjYW5ub3QgYmUgbWVyZ2VkIHdpdGggXCJ0YXJnZXQ6IGx0c1wiIGludG8gcGF0Y2ggYnJhbmNoLiBgICtcbiAgICAgICAgICAgICAgYENvbnNpZGVyIGNoYW5naW5nIHRoZSBsYWJlbCB0byBcInRhcmdldDogcGF0Y2hcIiBpZiB0aGlzIGlzIGludGVudGlvbmFsLmApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsICYmIGdpdGh1YlRhcmdldEJyYW5jaCA9PT0gcmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihcbiAgICAgICAgICAgICAgYFBSIGNhbm5vdCBiZSBtZXJnZWQgd2l0aCBcInRhcmdldDogbHRzXCIgaW50byBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBgICtcbiAgICAgICAgICAgICAgYGJyYW5jaC4gQ29uc2lkZXIgY2hhbmdpbmcgdGhlIGxhYmVsIHRvIFwidGFyZ2V0OiByY1wiIGlmIHRoaXMgaXMgaW50ZW50aW9uYWwuYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXNzZXJ0IHRoYXQgdGhlIHNlbGVjdGVkIGJyYW5jaCBpcyBhbiBhY3RpdmUgTFRTIGJyYW5jaC5cbiAgICAgICAgYXdhaXQgYXNzZXJ0QWN0aXZlTHRzQnJhbmNoKHJlcG8sIHJlbGVhc2VDb25maWcsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG4gICAgICAgIHJldHVybiBbZ2l0aHViVGFyZ2V0QnJhbmNoXTtcbiAgICAgIH0sXG4gICAgfSxcbiAgXTtcbn1cbiJdfQ==