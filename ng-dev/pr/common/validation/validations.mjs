"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesPattern = exports.assertPassingCi = exports.assertMergeReady = exports.assertSignedCla = exports.assertPendingState = exports.assertCorrectBreakingChangeLabeling = exports.assertChangesAllowForTargetLabel = void 0;
const target_label_1 = require("../targeting/target-label");
const config_1 = require("../../config");
const failures_1 = require("./failures");
const console_1 = require("../../../utils/console");
const fetch_pull_request_1 = require("../fetch-pull-request");
/**
 * Assert the commits provided are allowed to merge to the provided target label,
 * throwing an error otherwise.
 * @throws {PullRequestFailure}
 */
function assertChangesAllowForTargetLabel(commits, label, config, releaseTrains, labelsOnPullRequest) {
    if (!!config.commitMessageFixupLabel &&
        labelsOnPullRequest.some((name) => matchesPattern(name, config.commitMessageFixupLabel))) {
        (0, console_1.debug)('Skipping commit message target label validation because the commit message fixup label is ' +
            'applied.');
        return;
    }
    /**
     * List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
     * scopes in patch branches, no breaking changes in minor or patch changes.
     */
    const exemptedScopes = config.targetLabelExemptScopes || [];
    /** List of commits which are subject to content requirements for the target label. */
    commits = commits.filter((commit) => !exemptedScopes.includes(commit.scope));
    const hasBreakingChanges = commits.some((commit) => commit.breakingChanges.length !== 0);
    const hasDeprecations = commits.some((commit) => commit.deprecations.length !== 0);
    const hasFeatureCommits = commits.some((commit) => commit.type === 'feat');
    switch (label.name) {
        case target_label_1.TargetLabelName.MAJOR:
            break;
        case target_label_1.TargetLabelName.MINOR:
            if (hasBreakingChanges) {
                throw failures_1.PullRequestFailure.hasBreakingChanges(label);
            }
            break;
        case target_label_1.TargetLabelName.RELEASE_CANDIDATE:
        case target_label_1.TargetLabelName.LONG_TERM_SUPPORT:
        case target_label_1.TargetLabelName.PATCH:
            if (hasBreakingChanges) {
                throw failures_1.PullRequestFailure.hasBreakingChanges(label);
            }
            if (hasFeatureCommits) {
                throw failures_1.PullRequestFailure.hasFeatureCommits(label);
            }
            // Deprecations should not be merged into RC, patch or LTS branches.
            // https://semver.org/#spec-item-7. Deprecations should be part of
            // minor releases, or major releases according to SemVer.
            if (hasDeprecations && !releaseTrains.isFeatureFreeze()) {
                throw failures_1.PullRequestFailure.hasDeprecations(label);
            }
            break;
        default:
            (0, console_1.warn)((0, console_1.red)('WARNING: Unable to confirm all commits in the pull request are eligible to be'));
            (0, console_1.warn)((0, console_1.red)(`merged into the target branch: ${label.name}`));
            break;
    }
}
exports.assertChangesAllowForTargetLabel = assertChangesAllowForTargetLabel;
/**
 * Assert the pull request has the proper label for breaking changes if there are breaking change
 * commits, and only has the label if there are breaking change commits.
 * @throws {PullRequestFailure}
 */
function assertCorrectBreakingChangeLabeling(commits, pullRequestLabels) {
    /** Whether the PR has a label noting a breaking change. */
    const hasLabel = pullRequestLabels.includes(config_1.breakingChangeLabel);
    //** Whether the PR has at least one commit which notes a breaking change. */
    const hasCommit = commits.some((commit) => commit.breakingChanges.length !== 0);
    if (!hasLabel && hasCommit) {
        throw failures_1.PullRequestFailure.missingBreakingChangeLabel();
    }
    if (hasLabel && !hasCommit) {
        throw failures_1.PullRequestFailure.missingBreakingChangeCommit();
    }
}
exports.assertCorrectBreakingChangeLabeling = assertCorrectBreakingChangeLabeling;
/**
 * Assert the pull request is pending, not closed, merged or in draft.
 * @throws {PullRequestFailure} if the pull request is not pending.
 */
function assertPendingState(pullRequest) {
    if (pullRequest.isDraft) {
        throw failures_1.PullRequestFailure.isDraft();
    }
    switch (pullRequest.state) {
        case 'CLOSED':
            throw failures_1.PullRequestFailure.isClosed();
        case 'MERGED':
            throw failures_1.PullRequestFailure.isMerged();
    }
}
exports.assertPendingState = assertPendingState;
/**
 * Assert the pull request has all necessary CLAs signed.
 * @throws {PullRequestFailure} if the pull request is missing a necessary CLA signature.
 */
function assertSignedCla(pullRequest) {
    const passing = (0, fetch_pull_request_1.getStatusesForPullRequest)(pullRequest).statuses.some(({ name, status }) => {
        return name === 'cla/google' && status === fetch_pull_request_1.PullRequestStatus.PASSING;
    });
    if (passing) {
        return;
    }
    throw failures_1.PullRequestFailure.claUnsigned();
}
exports.assertSignedCla = assertSignedCla;
/**
 * Assert the pull request has been marked ready for merge by the author.
 * @throws {PullRequestFailure} if the pull request is missing the merge ready label.
 */
function assertMergeReady(pullRequest, config) {
    if (pullRequest.labels.nodes.some(({ name }) => matchesPattern(name, config.mergeReadyLabel))) {
        return true;
    }
    throw failures_1.PullRequestFailure.notMergeReady();
}
exports.assertMergeReady = assertMergeReady;
/**
 * Assert the pull request has been marked ready for merge by the author.
 * @throws {PullRequestFailure} if the pull request is missing the merge ready label.
 */
function assertPassingCi(pullRequest) {
    const { combinedStatus } = (0, fetch_pull_request_1.getStatusesForPullRequest)(pullRequest);
    if (combinedStatus === fetch_pull_request_1.PullRequestStatus.PENDING) {
        throw failures_1.PullRequestFailure.pendingCiJobs();
    }
    if (combinedStatus === fetch_pull_request_1.PullRequestStatus.FAILING) {
        throw failures_1.PullRequestFailure.failingCiJobs();
    }
}
exports.assertPassingCi = assertPassingCi;
// TODO: Remove need to export this pattern matching utility.
/** Checks whether the specified value matches the given pattern. */
function matchesPattern(value, pattern) {
    return typeof pattern === 'string' ? value === pattern : pattern.test(value);
}
exports.matchesPattern = matchesPattern;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvY29tbW9uL3ZhbGlkYXRpb24vdmFsaWRhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsNERBQXVFO0FBQ3ZFLHlDQUFvRTtBQUNwRSx5Q0FBOEM7QUFDOUMsb0RBQXdEO0FBQ3hELDhEQUkrQjtBQUcvQjs7OztHQUlHO0FBQ0gsU0FBZ0IsZ0NBQWdDLENBQzlDLE9BQWlCLEVBQ2pCLEtBQWtCLEVBQ2xCLE1BQXlCLEVBQ3pCLGFBQWtDLEVBQ2xDLG1CQUE2QjtJQUU3QixJQUNFLENBQUMsQ0FBQyxNQUFNLENBQUMsdUJBQXVCO1FBQ2hDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUN4RjtRQUNBLElBQUEsZUFBSyxFQUNILDRGQUE0RjtZQUMxRixVQUFVLENBQ2IsQ0FBQztRQUNGLE9BQU87S0FDUjtJQUVEOzs7T0FHRztJQUNILE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsSUFBSSxFQUFFLENBQUM7SUFDNUQsc0ZBQXNGO0lBQ3RGLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDN0UsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN6RixNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuRixNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUM7SUFDM0UsUUFBUSxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQ2xCLEtBQUssOEJBQWUsQ0FBQyxLQUFLO1lBQ3hCLE1BQU07UUFDUixLQUFLLDhCQUFlLENBQUMsS0FBSztZQUN4QixJQUFJLGtCQUFrQixFQUFFO2dCQUN0QixNQUFNLDZCQUFrQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BEO1lBQ0QsTUFBTTtRQUNSLEtBQUssOEJBQWUsQ0FBQyxpQkFBaUIsQ0FBQztRQUN2QyxLQUFLLDhCQUFlLENBQUMsaUJBQWlCLENBQUM7UUFDdkMsS0FBSyw4QkFBZSxDQUFDLEtBQUs7WUFDeEIsSUFBSSxrQkFBa0IsRUFBRTtnQkFDdEIsTUFBTSw2QkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNwRDtZQUNELElBQUksaUJBQWlCLEVBQUU7Z0JBQ3JCLE1BQU0sNkJBQWtCLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbkQ7WUFDRCxvRUFBb0U7WUFDcEUsa0VBQWtFO1lBQ2xFLHlEQUF5RDtZQUN6RCxJQUFJLGVBQWUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsRUFBRTtnQkFDdkQsTUFBTSw2QkFBa0IsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDakQ7WUFDRCxNQUFNO1FBQ1I7WUFDRSxJQUFBLGNBQUksRUFBQyxJQUFBLGFBQUcsRUFBQywrRUFBK0UsQ0FBQyxDQUFDLENBQUM7WUFDM0YsSUFBQSxjQUFJLEVBQUMsSUFBQSxhQUFHLEVBQUMsa0NBQWtDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUQsTUFBTTtLQUNUO0FBQ0gsQ0FBQztBQXpERCw0RUF5REM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsbUNBQW1DLENBQ2pELE9BQWlCLEVBQ2pCLGlCQUEyQjtJQUUzQiwyREFBMkQ7SUFDM0QsTUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxDQUFDLDRCQUFtQixDQUFDLENBQUM7SUFDakUsNkVBQTZFO0lBQzdFLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRWhGLElBQUksQ0FBQyxRQUFRLElBQUksU0FBUyxFQUFFO1FBQzFCLE1BQU0sNkJBQWtCLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztLQUN2RDtJQUVELElBQUksUUFBUSxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQzFCLE1BQU0sNkJBQWtCLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztLQUN4RDtBQUNILENBQUM7QUFoQkQsa0ZBZ0JDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsV0FBa0M7SUFDbkUsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFO1FBQ3ZCLE1BQU0sNkJBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDcEM7SUFDRCxRQUFRLFdBQVcsQ0FBQyxLQUFLLEVBQUU7UUFDekIsS0FBSyxRQUFRO1lBQ1gsTUFBTSw2QkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0QyxLQUFLLFFBQVE7WUFDWCxNQUFNLDZCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3ZDO0FBQ0gsQ0FBQztBQVZELGdEQVVDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsZUFBZSxDQUFDLFdBQWtDO0lBQ2hFLE1BQU0sT0FBTyxHQUFHLElBQUEsOENBQXlCLEVBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxFQUFFLEVBQUU7UUFDdEYsT0FBTyxJQUFJLEtBQUssWUFBWSxJQUFJLE1BQU0sS0FBSyxzQ0FBaUIsQ0FBQyxPQUFPLENBQUM7SUFDdkUsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLE9BQU8sRUFBRTtRQUNYLE9BQU87S0FDUjtJQUVELE1BQU0sNkJBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDekMsQ0FBQztBQVZELDBDQVVDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQUMsV0FBa0MsRUFBRSxNQUF5QjtJQUM1RixJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUU7UUFDM0YsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELE1BQU0sNkJBQWtCLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDM0MsQ0FBQztBQUxELDRDQUtDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsZUFBZSxDQUFDLFdBQWtDO0lBQ2hFLE1BQU0sRUFBQyxjQUFjLEVBQUMsR0FBRyxJQUFBLDhDQUF5QixFQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2hFLElBQUksY0FBYyxLQUFLLHNDQUFpQixDQUFDLE9BQU8sRUFBRTtRQUNoRCxNQUFNLDZCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQzFDO0lBQ0QsSUFBSSxjQUFjLEtBQUssc0NBQWlCLENBQUMsT0FBTyxFQUFFO1FBQ2hELE1BQU0sNkJBQWtCLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDMUM7QUFDSCxDQUFDO0FBUkQsMENBUUM7QUFFRCw2REFBNkQ7QUFDN0Qsb0VBQW9FO0FBQ3BFLFNBQWdCLGNBQWMsQ0FBQyxLQUFhLEVBQUUsT0FBd0I7SUFDcEUsT0FBTyxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0UsQ0FBQztBQUZELHdDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tbWl0fSBmcm9tICcuLi8uLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge1RhcmdldExhYmVsLCBUYXJnZXRMYWJlbE5hbWV9IGZyb20gJy4uL3RhcmdldGluZy90YXJnZXQtbGFiZWwnO1xuaW1wb3J0IHticmVha2luZ0NoYW5nZUxhYmVsLCBQdWxsUmVxdWVzdENvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7ZGVidWcsIHJlZCwgd2Fybn0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge1xuICBnZXRTdGF0dXNlc0ZvclB1bGxSZXF1ZXN0LFxuICBQdWxsUmVxdWVzdEZyb21HaXRodWIsXG4gIFB1bGxSZXF1ZXN0U3RhdHVzLFxufSBmcm9tICcuLi9mZXRjaC1wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi8uLi9yZWxlYXNlL3ZlcnNpb25pbmcnO1xuXG4vKipcbiAqIEFzc2VydCB0aGUgY29tbWl0cyBwcm92aWRlZCBhcmUgYWxsb3dlZCB0byBtZXJnZSB0byB0aGUgcHJvdmlkZWQgdGFyZ2V0IGxhYmVsLFxuICogdGhyb3dpbmcgYW4gZXJyb3Igb3RoZXJ3aXNlLlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Q2hhbmdlc0FsbG93Rm9yVGFyZ2V0TGFiZWwoXG4gIGNvbW1pdHM6IENvbW1pdFtdLFxuICBsYWJlbDogVGFyZ2V0TGFiZWwsXG4gIGNvbmZpZzogUHVsbFJlcXVlc3RDb25maWcsXG4gIHJlbGVhc2VUcmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsXG4gIGxhYmVsc09uUHVsbFJlcXVlc3Q6IHN0cmluZ1tdLFxuKSB7XG4gIGlmIChcbiAgICAhIWNvbmZpZy5jb21taXRNZXNzYWdlRml4dXBMYWJlbCAmJlxuICAgIGxhYmVsc09uUHVsbFJlcXVlc3Quc29tZSgobmFtZSkgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsKSlcbiAgKSB7XG4gICAgZGVidWcoXG4gICAgICAnU2tpcHBpbmcgY29tbWl0IG1lc3NhZ2UgdGFyZ2V0IGxhYmVsIHZhbGlkYXRpb24gYmVjYXVzZSB0aGUgY29tbWl0IG1lc3NhZ2UgZml4dXAgbGFiZWwgaXMgJyArXG4gICAgICAgICdhcHBsaWVkLicsXG4gICAgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogTGlzdCBvZiBjb21taXQgc2NvcGVzIHdoaWNoIGFyZSBleGVtcHRlZCBmcm9tIHRhcmdldCBsYWJlbCBjb250ZW50IHJlcXVpcmVtZW50cy4gaS5lLiBubyBgZmVhdGBcbiAgICogc2NvcGVzIGluIHBhdGNoIGJyYW5jaGVzLCBubyBicmVha2luZyBjaGFuZ2VzIGluIG1pbm9yIG9yIHBhdGNoIGNoYW5nZXMuXG4gICAqL1xuICBjb25zdCBleGVtcHRlZFNjb3BlcyA9IGNvbmZpZy50YXJnZXRMYWJlbEV4ZW1wdFNjb3BlcyB8fCBbXTtcbiAgLyoqIExpc3Qgb2YgY29tbWl0cyB3aGljaCBhcmUgc3ViamVjdCB0byBjb250ZW50IHJlcXVpcmVtZW50cyBmb3IgdGhlIHRhcmdldCBsYWJlbC4gKi9cbiAgY29tbWl0cyA9IGNvbW1pdHMuZmlsdGVyKChjb21taXQpID0+ICFleGVtcHRlZFNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKTtcbiAgY29uc3QgaGFzQnJlYWtpbmdDaGFuZ2VzID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC5icmVha2luZ0NoYW5nZXMubGVuZ3RoICE9PSAwKTtcbiAgY29uc3QgaGFzRGVwcmVjYXRpb25zID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC5kZXByZWNhdGlvbnMubGVuZ3RoICE9PSAwKTtcbiAgY29uc3QgaGFzRmVhdHVyZUNvbW1pdHMgPSBjb21taXRzLnNvbWUoKGNvbW1pdCkgPT4gY29tbWl0LnR5cGUgPT09ICdmZWF0Jyk7XG4gIHN3aXRjaCAobGFiZWwubmFtZSkge1xuICAgIGNhc2UgVGFyZ2V0TGFiZWxOYW1lLk1BSk9SOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBUYXJnZXRMYWJlbE5hbWUuTUlOT1I6XG4gICAgICBpZiAoaGFzQnJlYWtpbmdDaGFuZ2VzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBUYXJnZXRMYWJlbE5hbWUuUkVMRUFTRV9DQU5ESURBVEU6XG4gICAgY2FzZSBUYXJnZXRMYWJlbE5hbWUuTE9OR19URVJNX1NVUFBPUlQ6XG4gICAgY2FzZSBUYXJnZXRMYWJlbE5hbWUuUEFUQ0g6XG4gICAgICBpZiAoaGFzQnJlYWtpbmdDaGFuZ2VzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgaWYgKGhhc0ZlYXR1cmVDb21taXRzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNGZWF0dXJlQ29tbWl0cyhsYWJlbCk7XG4gICAgICB9XG4gICAgICAvLyBEZXByZWNhdGlvbnMgc2hvdWxkIG5vdCBiZSBtZXJnZWQgaW50byBSQywgcGF0Y2ggb3IgTFRTIGJyYW5jaGVzLlxuICAgICAgLy8gaHR0cHM6Ly9zZW12ZXIub3JnLyNzcGVjLWl0ZW0tNy4gRGVwcmVjYXRpb25zIHNob3VsZCBiZSBwYXJ0IG9mXG4gICAgICAvLyBtaW5vciByZWxlYXNlcywgb3IgbWFqb3IgcmVsZWFzZXMgYWNjb3JkaW5nIHRvIFNlbVZlci5cbiAgICAgIGlmIChoYXNEZXByZWNhdGlvbnMgJiYgIXJlbGVhc2VUcmFpbnMuaXNGZWF0dXJlRnJlZXplKCkpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0RlcHJlY2F0aW9ucyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgd2FybihyZWQoJ1dBUk5JTkc6IFVuYWJsZSB0byBjb25maXJtIGFsbCBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QgYXJlIGVsaWdpYmxlIHRvIGJlJykpO1xuICAgICAgd2FybihyZWQoYG1lcmdlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoOiAke2xhYmVsLm5hbWV9YCkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIHB1bGwgcmVxdWVzdCBoYXMgdGhlIHByb3BlciBsYWJlbCBmb3IgYnJlYWtpbmcgY2hhbmdlcyBpZiB0aGVyZSBhcmUgYnJlYWtpbmcgY2hhbmdlXG4gKiBjb21taXRzLCBhbmQgb25seSBoYXMgdGhlIGxhYmVsIGlmIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2UgY29tbWl0cy5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydENvcnJlY3RCcmVha2luZ0NoYW5nZUxhYmVsaW5nKFxuICBjb21taXRzOiBDb21taXRbXSxcbiAgcHVsbFJlcXVlc3RMYWJlbHM6IHN0cmluZ1tdLFxuKSB7XG4gIC8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYSBsYWJlbCBub3RpbmcgYSBicmVha2luZyBjaGFuZ2UuICovXG4gIGNvbnN0IGhhc0xhYmVsID0gcHVsbFJlcXVlc3RMYWJlbHMuaW5jbHVkZXMoYnJlYWtpbmdDaGFuZ2VMYWJlbCk7XG4gIC8vKiogV2hldGhlciB0aGUgUFIgaGFzIGF0IGxlYXN0IG9uZSBjb21taXQgd2hpY2ggbm90ZXMgYSBicmVha2luZyBjaGFuZ2UuICovXG4gIGNvbnN0IGhhc0NvbW1pdCA9IGNvbW1pdHMuc29tZSgoY29tbWl0KSA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCk7XG5cbiAgaWYgKCFoYXNMYWJlbCAmJiBoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlTGFiZWwoKTtcbiAgfVxuXG4gIGlmIChoYXNMYWJlbCAmJiAhaGFzQ29tbWl0KSB7XG4gICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLm1pc3NpbmdCcmVha2luZ0NoYW5nZUNvbW1pdCgpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBwdWxsIHJlcXVlc3QgaXMgcGVuZGluZywgbm90IGNsb3NlZCwgbWVyZ2VkIG9yIGluIGRyYWZ0LlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfSBpZiB0aGUgcHVsbCByZXF1ZXN0IGlzIG5vdCBwZW5kaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0UGVuZGluZ1N0YXRlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdEZyb21HaXRodWIpIHtcbiAgaWYgKHB1bGxSZXF1ZXN0LmlzRHJhZnQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNEcmFmdCgpO1xuICB9XG4gIHN3aXRjaCAocHVsbFJlcXVlc3Quc3RhdGUpIHtcbiAgICBjYXNlICdDTE9TRUQnOlxuICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzQ2xvc2VkKCk7XG4gICAgY2FzZSAnTUVSR0VEJzpcbiAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc01lcmdlZCgpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBwdWxsIHJlcXVlc3QgaGFzIGFsbCBuZWNlc3NhcnkgQ0xBcyBzaWduZWQuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9IGlmIHRoZSBwdWxsIHJlcXVlc3QgaXMgbWlzc2luZyBhIG5lY2Vzc2FyeSBDTEEgc2lnbmF0dXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0U2lnbmVkQ2xhKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdEZyb21HaXRodWIpIHtcbiAgY29uc3QgcGFzc2luZyA9IGdldFN0YXR1c2VzRm9yUHVsbFJlcXVlc3QocHVsbFJlcXVlc3QpLnN0YXR1c2VzLnNvbWUoKHtuYW1lLCBzdGF0dXN9KSA9PiB7XG4gICAgcmV0dXJuIG5hbWUgPT09ICdjbGEvZ29vZ2xlJyAmJiBzdGF0dXMgPT09IFB1bGxSZXF1ZXN0U3RhdHVzLlBBU1NJTkc7XG4gIH0pO1xuXG4gIGlmIChwYXNzaW5nKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmNsYVVuc2lnbmVkKCk7XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWFya2VkIHJlYWR5IGZvciBtZXJnZSBieSB0aGUgYXV0aG9yLlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfSBpZiB0aGUgcHVsbCByZXF1ZXN0IGlzIG1pc3NpbmcgdGhlIG1lcmdlIHJlYWR5IGxhYmVsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0TWVyZ2VSZWFkeShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3RGcm9tR2l0aHViLCBjb25maWc6IFB1bGxSZXF1ZXN0Q29uZmlnKSB7XG4gIGlmIChwdWxsUmVxdWVzdC5sYWJlbHMubm9kZXMuc29tZSgoe25hbWV9KSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcubWVyZ2VSZWFkeUxhYmVsKSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubm90TWVyZ2VSZWFkeSgpO1xufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1hcmtlZCByZWFkeSBmb3IgbWVyZ2UgYnkgdGhlIGF1dGhvci5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX0gaWYgdGhlIHB1bGwgcmVxdWVzdCBpcyBtaXNzaW5nIHRoZSBtZXJnZSByZWFkeSBsYWJlbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFBhc3NpbmdDaShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3RGcm9tR2l0aHViKSB7XG4gIGNvbnN0IHtjb21iaW5lZFN0YXR1c30gPSBnZXRTdGF0dXNlc0ZvclB1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KTtcbiAgaWYgKGNvbWJpbmVkU3RhdHVzID09PSBQdWxsUmVxdWVzdFN0YXR1cy5QRU5ESU5HKSB7XG4gICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLnBlbmRpbmdDaUpvYnMoKTtcbiAgfVxuICBpZiAoY29tYmluZWRTdGF0dXMgPT09IFB1bGxSZXF1ZXN0U3RhdHVzLkZBSUxJTkcpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuZmFpbGluZ0NpSm9icygpO1xuICB9XG59XG5cbi8vIFRPRE86IFJlbW92ZSBuZWVkIHRvIGV4cG9ydCB0aGlzIHBhdHRlcm4gbWF0Y2hpbmcgdXRpbGl0eS5cbi8qKiBDaGVja3Mgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIG1hdGNoZXMgdGhlIGdpdmVuIHBhdHRlcm4uICovXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hlc1BhdHRlcm4odmFsdWU6IHN0cmluZywgcGF0dGVybjogUmVnRXhwIHwgc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgcGF0dGVybiA9PT0gJ3N0cmluZycgPyB2YWx1ZSA9PT0gcGF0dGVybiA6IHBhdHRlcm4udGVzdCh2YWx1ZSk7XG59XG4iXX0=