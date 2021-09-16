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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvbWVyZ2UvdmFsaWRhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsaURBQTREO0FBRTVELHlDQUE4QztBQUM5QyxpREFBOEM7QUFDOUMsMkNBQWdEO0FBR2hEOzs7O0dBSUc7QUFDSCxTQUFnQixnQ0FBZ0MsQ0FDOUMsT0FBaUIsRUFDakIsS0FBa0IsRUFDbEIsTUFBbUI7SUFFbkI7OztPQUdHO0lBQ0gsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQztJQUM1RCxzRkFBc0Y7SUFDdEYsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3RSxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25GLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQztJQUMzRSxRQUFRLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDbEIsS0FBSyw4QkFBZSxDQUFDLEtBQUs7WUFDeEIsTUFBTTtRQUNSLEtBQUssOEJBQWUsQ0FBQyxLQUFLO1lBQ3hCLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3RCLE1BQU0sNkJBQWtCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEQ7WUFDRCxNQUFNO1FBQ1IsS0FBSyw4QkFBZSxDQUFDLGlCQUFpQixDQUFDO1FBQ3ZDLEtBQUssOEJBQWUsQ0FBQyxpQkFBaUIsQ0FBQztRQUN2QyxLQUFLLDhCQUFlLENBQUMsS0FBSztZQUN4QixJQUFJLGtCQUFrQixFQUFFO2dCQUN0QixNQUFNLDZCQUFrQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BEO1lBQ0QsSUFBSSxpQkFBaUIsRUFBRTtnQkFDckIsTUFBTSw2QkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNuRDtZQUNELG9FQUFvRTtZQUNwRSxrRUFBa0U7WUFDbEUseURBQXlEO1lBQ3pELElBQUksZUFBZSxFQUFFO2dCQUNuQixNQUFNLDZCQUFrQixDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqRDtZQUNELE1BQU07UUFDUjtZQUNFLElBQUEsY0FBSSxFQUFDLElBQUEsYUFBRyxFQUFDLCtFQUErRSxDQUFDLENBQUMsQ0FBQztZQUMzRixJQUFBLGNBQUksRUFBQyxJQUFBLGFBQUcsRUFBQyxrQ0FBa0MsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRCxNQUFNO0tBQ1Q7QUFDSCxDQUFDO0FBNUNELDRFQTRDQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixtQ0FBbUMsQ0FDakQsT0FBaUIsRUFDakIsaUJBQTJCO0lBRTNCLDJEQUEyRDtJQUMzRCxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsK0JBQW1CLENBQUMsQ0FBQztJQUNqRSw2RUFBNkU7SUFDN0UsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFaEYsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0tBQ3hEO0FBQ0gsQ0FBQztBQWhCRCxrRkFnQkM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixrQkFBa0IsQ0FBQyxXQUEyQjtJQUM1RCxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUU7UUFDdkIsTUFBTSw2QkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNwQztJQUNELFFBQVEsV0FBVyxDQUFDLEtBQUssRUFBRTtRQUN6QixLQUFLLFFBQVE7WUFDWCxNQUFNLDZCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLEtBQUssUUFBUTtZQUNYLE1BQU0sNkJBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7QUFDSCxDQUFDO0FBVkQsZ0RBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21taXR9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7VGFyZ2V0TGFiZWwsIFRhcmdldExhYmVsTmFtZX0gZnJvbSAnLi90YXJnZXQtbGFiZWwnO1xuaW1wb3J0IHtNZXJnZUNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4vZmFpbHVyZXMnO1xuaW1wb3J0IHtyZWQsIHdhcm59IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHticmVha2luZ0NoYW5nZUxhYmVsfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge1Jhd1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9jb21tb24vZmV0Y2gtcHVsbC1yZXF1ZXN0JztcblxuLyoqXG4gKiBBc3NlcnQgdGhlIGNvbW1pdHMgcHJvdmlkZWQgYXJlIGFsbG93ZWQgdG8gbWVyZ2UgdG8gdGhlIHByb3ZpZGVkIHRhcmdldCBsYWJlbCxcbiAqIHRocm93aW5nIGFuIGVycm9yIG90aGVyd2lzZS5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydENoYW5nZXNBbGxvd0ZvclRhcmdldExhYmVsKFxuICBjb21taXRzOiBDb21taXRbXSxcbiAgbGFiZWw6IFRhcmdldExhYmVsLFxuICBjb25maWc6IE1lcmdlQ29uZmlnLFxuKSB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNvbW1pdCBzY29wZXMgd2hpY2ggYXJlIGV4ZW1wdGVkIGZyb20gdGFyZ2V0IGxhYmVsIGNvbnRlbnQgcmVxdWlyZW1lbnRzLiBpLmUuIG5vIGBmZWF0YFxuICAgKiBzY29wZXMgaW4gcGF0Y2ggYnJhbmNoZXMsIG5vIGJyZWFraW5nIGNoYW5nZXMgaW4gbWlub3Igb3IgcGF0Y2ggY2hhbmdlcy5cbiAgICovXG4gIGNvbnN0IGV4ZW1wdGVkU2NvcGVzID0gY29uZmlnLnRhcmdldExhYmVsRXhlbXB0U2NvcGVzIHx8IFtdO1xuICAvKiogTGlzdCBvZiBjb21taXRzIHdoaWNoIGFyZSBzdWJqZWN0IHRvIGNvbnRlbnQgcmVxdWlyZW1lbnRzIGZvciB0aGUgdGFyZ2V0IGxhYmVsLiAqL1xuICBjb21taXRzID0gY29tbWl0cy5maWx0ZXIoKGNvbW1pdCkgPT4gIWV4ZW1wdGVkU2NvcGVzLmluY2x1ZGVzKGNvbW1pdC5zY29wZSkpO1xuICBjb25zdCBoYXNCcmVha2luZ0NoYW5nZXMgPSBjb21taXRzLnNvbWUoKGNvbW1pdCkgPT4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDApO1xuICBjb25zdCBoYXNEZXByZWNhdGlvbnMgPSBjb21taXRzLnNvbWUoKGNvbW1pdCkgPT4gY29tbWl0LmRlcHJlY2F0aW9ucy5sZW5ndGggIT09IDApO1xuICBjb25zdCBoYXNGZWF0dXJlQ29tbWl0cyA9IGNvbW1pdHMuc29tZSgoY29tbWl0KSA9PiBjb21taXQudHlwZSA9PT0gJ2ZlYXQnKTtcbiAgc3dpdGNoIChsYWJlbC5uYW1lKSB7XG4gICAgY2FzZSBUYXJnZXRMYWJlbE5hbWUuTUFKT1I6XG4gICAgICBicmVhaztcbiAgICBjYXNlIFRhcmdldExhYmVsTmFtZS5NSU5PUjpcbiAgICAgIGlmIChoYXNCcmVha2luZ0NoYW5nZXMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0JyZWFraW5nQ2hhbmdlcyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFRhcmdldExhYmVsTmFtZS5SRUxFQVNFX0NBTkRJREFURTpcbiAgICBjYXNlIFRhcmdldExhYmVsTmFtZS5MT05HX1RFUk1fU1VQUE9SVDpcbiAgICBjYXNlIFRhcmdldExhYmVsTmFtZS5QQVRDSDpcbiAgICAgIGlmIChoYXNCcmVha2luZ0NoYW5nZXMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0JyZWFraW5nQ2hhbmdlcyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzRmVhdHVyZUNvbW1pdHMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0ZlYXR1cmVDb21taXRzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIC8vIERlcHJlY2F0aW9ucyBzaG91bGQgbm90IGJlIG1lcmdlZCBpbnRvIFJDLCBwYXRjaCBvciBMVFMgYnJhbmNoZXMuXG4gICAgICAvLyBodHRwczovL3NlbXZlci5vcmcvI3NwZWMtaXRlbS03LiBEZXByZWNhdGlvbnMgc2hvdWxkIGJlIHBhcnQgb2ZcbiAgICAgIC8vIG1pbm9yIHJlbGVhc2VzLCBvciBtYWpvciByZWxlYXNlcyBhY2NvcmRpbmcgdG8gU2VtVmVyLlxuICAgICAgaWYgKGhhc0RlcHJlY2F0aW9ucykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzRGVwcmVjYXRpb25zKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB3YXJuKHJlZCgnV0FSTklORzogVW5hYmxlIHRvIGNvbmZpcm0gYWxsIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdCBhcmUgZWxpZ2libGUgdG8gYmUnKSk7XG4gICAgICB3YXJuKHJlZChgbWVyZ2VkIGludG8gdGhlIHRhcmdldCBicmFuY2g6ICR7bGFiZWwubmFtZX1gKSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgcHVsbCByZXF1ZXN0IGhhcyB0aGUgcHJvcGVyIGxhYmVsIGZvciBicmVha2luZyBjaGFuZ2VzIGlmIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2VcbiAqIGNvbW1pdHMsIGFuZCBvbmx5IGhhcyB0aGUgbGFiZWwgaWYgdGhlcmUgYXJlIGJyZWFraW5nIGNoYW5nZSBjb21taXRzLlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Q29ycmVjdEJyZWFraW5nQ2hhbmdlTGFiZWxpbmcoXG4gIGNvbW1pdHM6IENvbW1pdFtdLFxuICBwdWxsUmVxdWVzdExhYmVsczogc3RyaW5nW10sXG4pIHtcbiAgLyoqIFdoZXRoZXIgdGhlIFBSIGhhcyBhIGxhYmVsIG5vdGluZyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbiAgY29uc3QgaGFzTGFiZWwgPSBwdWxsUmVxdWVzdExhYmVscy5pbmNsdWRlcyhicmVha2luZ0NoYW5nZUxhYmVsKTtcbiAgLy8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYXQgbGVhc3Qgb25lIGNvbW1pdCB3aGljaCBub3RlcyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbiAgY29uc3QgaGFzQ29tbWl0ID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC5icmVha2luZ0NoYW5nZXMubGVuZ3RoICE9PSAwKTtcblxuICBpZiAoIWhhc0xhYmVsICYmIGhhc0NvbW1pdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNzaW5nQnJlYWtpbmdDaGFuZ2VMYWJlbCgpO1xuICB9XG5cbiAgaWYgKGhhc0xhYmVsICYmICFoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlQ29tbWl0KCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIHB1bGwgcmVxdWVzdCBpcyBwZW5kaW5nLCBub3QgY2xvc2VkLCBtZXJnZWQgb3IgaW4gZHJhZnQuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9IGlmIHRoZSBwdWxsIHJlcXVlc3QgaXMgbm90IHBlbmRpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRQZW5kaW5nU3RhdGUocHVsbFJlcXVlc3Q6IFJhd1B1bGxSZXF1ZXN0KSB7XG4gIGlmIChwdWxsUmVxdWVzdC5pc0RyYWZ0KSB7XG4gICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzRHJhZnQoKTtcbiAgfVxuICBzd2l0Y2ggKHB1bGxSZXF1ZXN0LnN0YXRlKSB7XG4gICAgY2FzZSAnQ0xPU0VEJzpcbiAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc0Nsb3NlZCgpO1xuICAgIGNhc2UgJ01FUkdFRCc6XG4gICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNNZXJnZWQoKTtcbiAgfVxufVxuIl19