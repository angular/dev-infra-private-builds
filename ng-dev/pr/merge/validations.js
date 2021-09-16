"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertPendingState = exports.assertCorrectBreakingChangeLabeling = exports.assertChangesAllowForTargetLabel = void 0;
const target_label_1 = require("./target-label");
const failures_1 = require("./failures");
const console_1 = require("../../utils/console");
const constants_1 = require("./constants");
/**
 * Assert the commits provided are allowed to merge to the provided target label,
 * throwing an error otherwise.
 * @throws {PullRequestFailure}
 */
function assertChangesAllowForTargetLabel(commits, label, config) {
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
            if (hasDeprecations) {
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
    const hasLabel = pullRequestLabels.includes(constants_1.breakingChangeLabel);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvbWVyZ2UvdmFsaWRhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsaURBQTREO0FBRTVELHlDQUE4QztBQUM5QyxpREFBOEM7QUFDOUMsMkNBQWdEO0FBR2hEOzs7O0dBSUc7QUFDSCxTQUFnQixnQ0FBZ0MsQ0FDOUMsT0FBaUIsRUFDakIsS0FBa0IsRUFDbEIsTUFBbUI7SUFFbkI7OztPQUdHO0lBQ0gsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQztJQUM1RCxzRkFBc0Y7SUFDdEYsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3RSxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25GLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQztJQUMzRSxRQUFRLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDbEIsS0FBSyw4QkFBZSxDQUFDLEtBQUs7WUFDeEIsTUFBTTtRQUNSLEtBQUssOEJBQWUsQ0FBQyxLQUFLO1lBQ3hCLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3RCLE1BQU0sNkJBQWtCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEQ7WUFDRCxNQUFNO1FBQ1IsS0FBSyw4QkFBZSxDQUFDLGlCQUFpQixDQUFDO1FBQ3ZDLEtBQUssOEJBQWUsQ0FBQyxpQkFBaUIsQ0FBQztRQUN2QyxLQUFLLDhCQUFlLENBQUMsS0FBSztZQUN4QixJQUFJLGtCQUFrQixFQUFFO2dCQUN0QixNQUFNLDZCQUFrQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BEO1lBQ0QsSUFBSSxpQkFBaUIsRUFBRTtnQkFDckIsTUFBTSw2QkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNuRDtZQUNELG9FQUFvRTtZQUNwRSxrRUFBa0U7WUFDbEUseURBQXlEO1lBQ3pELElBQUksZUFBZSxFQUFFO2dCQUNuQixNQUFNLDZCQUFrQixDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqRDtZQUNELE1BQU07UUFDUjtZQUNFLElBQUEsY0FBSSxFQUFDLElBQUEsYUFBRyxFQUFDLCtFQUErRSxDQUFDLENBQUMsQ0FBQztZQUMzRixJQUFBLGNBQUksRUFBQyxJQUFBLGFBQUcsRUFBQyxrQ0FBa0MsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRCxNQUFNO0tBQ1Q7QUFDSCxDQUFDO0FBNUNELDRFQTRDQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixtQ0FBbUMsQ0FDakQsT0FBaUIsRUFDakIsaUJBQTJCO0lBRTNCLDJEQUEyRDtJQUMzRCxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsK0JBQW1CLENBQUMsQ0FBQztJQUNqRSw2RUFBNkU7SUFDN0UsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFaEYsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0tBQ3hEO0FBQ0gsQ0FBQztBQWhCRCxrRkFnQkM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixrQkFBa0IsQ0FBQyxXQUEyQjtJQUM1RCxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUU7UUFDdkIsTUFBTSw2QkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNwQztJQUNELFFBQVEsV0FBVyxDQUFDLEtBQUssRUFBRTtRQUN6QixLQUFLLFFBQVE7WUFDWCxNQUFNLDZCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLEtBQUssUUFBUTtZQUNYLE1BQU0sNkJBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7QUFDSCxDQUFDO0FBVkQsZ0RBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21taXR9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7VGFyZ2V0TGFiZWwsIFRhcmdldExhYmVsTmFtZX0gZnJvbSAnLi90YXJnZXQtbGFiZWwnO1xuaW1wb3J0IHtNZXJnZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7cmVkLCB3YXJufSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YnJlYWtpbmdDaGFuZ2VMYWJlbH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtSYXdQdWxsUmVxdWVzdH0gZnJvbSAnLi4vY29tbW9uL2ZldGNoLXB1bGwtcmVxdWVzdCc7XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBjb21taXRzIHByb3ZpZGVkIGFyZSBhbGxvd2VkIHRvIG1lcmdlIHRvIHRoZSBwcm92aWRlZCB0YXJnZXQgbGFiZWwsXG4gKiB0aHJvd2luZyBhbiBlcnJvciBvdGhlcndpc2UuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRDaGFuZ2VzQWxsb3dGb3JUYXJnZXRMYWJlbChcbiAgY29tbWl0czogQ29tbWl0W10sXG4gIGxhYmVsOiBUYXJnZXRMYWJlbCxcbiAgY29uZmlnOiBNZXJnZUNvbmZpZyxcbikge1xuICAvKipcbiAgICogTGlzdCBvZiBjb21taXQgc2NvcGVzIHdoaWNoIGFyZSBleGVtcHRlZCBmcm9tIHRhcmdldCBsYWJlbCBjb250ZW50IHJlcXVpcmVtZW50cy4gaS5lLiBubyBgZmVhdGBcbiAgICogc2NvcGVzIGluIHBhdGNoIGJyYW5jaGVzLCBubyBicmVha2luZyBjaGFuZ2VzIGluIG1pbm9yIG9yIHBhdGNoIGNoYW5nZXMuXG4gICAqL1xuICBjb25zdCBleGVtcHRlZFNjb3BlcyA9IGNvbmZpZy50YXJnZXRMYWJlbEV4ZW1wdFNjb3BlcyB8fCBbXTtcbiAgLyoqIExpc3Qgb2YgY29tbWl0cyB3aGljaCBhcmUgc3ViamVjdCB0byBjb250ZW50IHJlcXVpcmVtZW50cyBmb3IgdGhlIHRhcmdldCBsYWJlbC4gKi9cbiAgY29tbWl0cyA9IGNvbW1pdHMuZmlsdGVyKChjb21taXQpID0+ICFleGVtcHRlZFNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKTtcbiAgY29uc3QgaGFzQnJlYWtpbmdDaGFuZ2VzID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC5icmVha2luZ0NoYW5nZXMubGVuZ3RoICE9PSAwKTtcbiAgY29uc3QgaGFzRGVwcmVjYXRpb25zID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC5kZXByZWNhdGlvbnMubGVuZ3RoICE9PSAwKTtcbiAgY29uc3QgaGFzRmVhdHVyZUNvbW1pdHMgPSBjb21taXRzLnNvbWUoKGNvbW1pdCkgPT4gY29tbWl0LnR5cGUgPT09ICdmZWF0Jyk7XG4gIHN3aXRjaCAobGFiZWwubmFtZSkge1xuICAgIGNhc2UgVGFyZ2V0TGFiZWxOYW1lLk1BSk9SOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBUYXJnZXRMYWJlbE5hbWUuTUlOT1I6XG4gICAgICBpZiAoaGFzQnJlYWtpbmdDaGFuZ2VzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBUYXJnZXRMYWJlbE5hbWUuUkVMRUFTRV9DQU5ESURBVEU6XG4gICAgY2FzZSBUYXJnZXRMYWJlbE5hbWUuTE9OR19URVJNX1NVUFBPUlQ6XG4gICAgY2FzZSBUYXJnZXRMYWJlbE5hbWUuUEFUQ0g6XG4gICAgICBpZiAoaGFzQnJlYWtpbmdDaGFuZ2VzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgaWYgKGhhc0ZlYXR1cmVDb21taXRzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNGZWF0dXJlQ29tbWl0cyhsYWJlbCk7XG4gICAgICB9XG4gICAgICAvLyBEZXByZWNhdGlvbnMgc2hvdWxkIG5vdCBiZSBtZXJnZWQgaW50byBSQywgcGF0Y2ggb3IgTFRTIGJyYW5jaGVzLlxuICAgICAgLy8gaHR0cHM6Ly9zZW12ZXIub3JnLyNzcGVjLWl0ZW0tNy4gRGVwcmVjYXRpb25zIHNob3VsZCBiZSBwYXJ0IG9mXG4gICAgICAvLyBtaW5vciByZWxlYXNlcywgb3IgbWFqb3IgcmVsZWFzZXMgYWNjb3JkaW5nIHRvIFNlbVZlci5cbiAgICAgIGlmIChoYXNEZXByZWNhdGlvbnMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0RlcHJlY2F0aW9ucyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgd2FybihyZWQoJ1dBUk5JTkc6IFVuYWJsZSB0byBjb25maXJtIGFsbCBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QgYXJlIGVsaWdpYmxlIHRvIGJlJykpO1xuICAgICAgd2FybihyZWQoYG1lcmdlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoOiAke2xhYmVsLm5hbWV9YCkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIHB1bGwgcmVxdWVzdCBoYXMgdGhlIHByb3BlciBsYWJlbCBmb3IgYnJlYWtpbmcgY2hhbmdlcyBpZiB0aGVyZSBhcmUgYnJlYWtpbmcgY2hhbmdlXG4gKiBjb21taXRzLCBhbmQgb25seSBoYXMgdGhlIGxhYmVsIGlmIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2UgY29tbWl0cy5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydENvcnJlY3RCcmVha2luZ0NoYW5nZUxhYmVsaW5nKFxuICBjb21taXRzOiBDb21taXRbXSxcbiAgcHVsbFJlcXVlc3RMYWJlbHM6IHN0cmluZ1tdLFxuKSB7XG4gIC8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYSBsYWJlbCBub3RpbmcgYSBicmVha2luZyBjaGFuZ2UuICovXG4gIGNvbnN0IGhhc0xhYmVsID0gcHVsbFJlcXVlc3RMYWJlbHMuaW5jbHVkZXMoYnJlYWtpbmdDaGFuZ2VMYWJlbCk7XG4gIC8vKiogV2hldGhlciB0aGUgUFIgaGFzIGF0IGxlYXN0IG9uZSBjb21taXQgd2hpY2ggbm90ZXMgYSBicmVha2luZyBjaGFuZ2UuICovXG4gIGNvbnN0IGhhc0NvbW1pdCA9IGNvbW1pdHMuc29tZSgoY29tbWl0KSA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCk7XG5cbiAgaWYgKCFoYXNMYWJlbCAmJiBoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlTGFiZWwoKTtcbiAgfVxuXG4gIGlmIChoYXNMYWJlbCAmJiAhaGFzQ29tbWl0KSB7XG4gICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLm1pc3NpbmdCcmVha2luZ0NoYW5nZUNvbW1pdCgpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBwdWxsIHJlcXVlc3QgaXMgcGVuZGluZywgbm90IGNsb3NlZCwgbWVyZ2VkIG9yIGluIGRyYWZ0LlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfSBpZiB0aGUgcHVsbCByZXF1ZXN0IGlzIG5vdCBwZW5kaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0UGVuZGluZ1N0YXRlKHB1bGxSZXF1ZXN0OiBSYXdQdWxsUmVxdWVzdCkge1xuICBpZiAocHVsbFJlcXVlc3QuaXNEcmFmdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc0RyYWZ0KCk7XG4gIH1cbiAgc3dpdGNoIChwdWxsUmVxdWVzdC5zdGF0ZSkge1xuICAgIGNhc2UgJ0NMT1NFRCc6XG4gICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNDbG9zZWQoKTtcbiAgICBjYXNlICdNRVJHRUQnOlxuICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzTWVyZ2VkKCk7XG4gIH1cbn1cbiJdfQ==