"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPullRequest = exports.loadAndValidatePullRequest = void 0;
const typed_graphqlify_1 = require("typed-graphqlify");
const parse_1 = require("../../commit-message/parse");
const console_1 = require("../../utils/console");
const github_1 = require("../../utils/github");
const failures_1 = require("./failures");
const string_pattern_1 = require("./string-pattern");
const target_label_1 = require("./target-label");
const constants_1 = require("./constants");
/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 */
async function loadAndValidatePullRequest({ git, config }, prNumber, ignoreNonFatalFailures = false) {
    const prData = await fetchPullRequestFromGithub(git, prNumber);
    if (prData === null) {
        return failures_1.PullRequestFailure.notFound();
    }
    const labels = prData.labels.nodes.map((l) => l.name);
    if (!labels.some((name) => (0, string_pattern_1.matchesPattern)(name, config.mergeReadyLabel))) {
        return failures_1.PullRequestFailure.notMergeReady();
    }
    if (!labels.some((name) => (0, string_pattern_1.matchesPattern)(name, config.claSignedLabel))) {
        return failures_1.PullRequestFailure.claUnsigned();
    }
    /** List of parsed commits for all of the commits in the pull request. */
    const commitsInPr = prData.commits.nodes.map((n) => (0, parse_1.parseCommitMessage)(n.commit.message));
    const githubTargetBranch = prData.baseRefName;
    const targetBranches = await getTargetBranches({ github: git.config.github, merge: config }, labels, githubTargetBranch, commitsInPr);
    try {
        assertPendingState(prData);
        assertCorrectBreakingChangeLabeling(commitsInPr, labels);
    }
    catch (error) {
        // If the error is a pull request failure, we pass it through gracefully
        // as the tool expects such failures to be returned from the function.
        if (error instanceof failures_1.PullRequestFailure) {
            return error;
        }
        throw error;
    }
    /** The combined status of the latest commit in the pull request. */
    const state = prData.commits.nodes.slice(-1)[0].commit.status.state;
    if (state === 'FAILURE' && !ignoreNonFatalFailures) {
        return failures_1.PullRequestFailure.failingCiJobs();
    }
    if (state === 'PENDING' && !ignoreNonFatalFailures) {
        return failures_1.PullRequestFailure.pendingCiJobs();
    }
    const requiredBaseSha = config.requiredBaseCommits && config.requiredBaseCommits[githubTargetBranch];
    const needsCommitMessageFixup = !!config.commitMessageFixupLabel &&
        labels.some((name) => (0, string_pattern_1.matchesPattern)(name, config.commitMessageFixupLabel));
    const hasCaretakerNote = !!config.caretakerNoteLabel &&
        labels.some((name) => (0, string_pattern_1.matchesPattern)(name, config.caretakerNoteLabel));
    return {
        url: prData.url,
        prNumber,
        labels,
        requiredBaseSha,
        githubTargetBranch,
        needsCommitMessageFixup,
        hasCaretakerNote,
        targetBranches,
        title: prData.title,
        commitCount: prData.commits.totalCount,
    };
}
exports.loadAndValidatePullRequest = loadAndValidatePullRequest;
/* Graphql schema for the response body the requested pull request. */
const PR_SCHEMA = {
    url: typed_graphqlify_1.types.string,
    isDraft: typed_graphqlify_1.types.boolean,
    state: typed_graphqlify_1.types.oneOf(['OPEN', 'MERGED', 'CLOSED']),
    number: typed_graphqlify_1.types.number,
    // Only the last 100 commits from a pull request are obtained as we likely will never see a pull
    // requests with more than 100 commits.
    commits: (0, typed_graphqlify_1.params)({ last: 100 }, {
        totalCount: typed_graphqlify_1.types.number,
        nodes: [
            {
                commit: {
                    status: {
                        state: typed_graphqlify_1.types.oneOf(['FAILURE', 'PENDING', 'SUCCESS']),
                    },
                    message: typed_graphqlify_1.types.string,
                },
            },
        ],
    }),
    baseRefName: typed_graphqlify_1.types.string,
    title: typed_graphqlify_1.types.string,
    labels: (0, typed_graphqlify_1.params)({ first: 100 }, {
        nodes: [
            {
                name: typed_graphqlify_1.types.string,
            },
        ],
    }),
};
/** Fetches a pull request from Github. Returns null if an error occurred. */
async function fetchPullRequestFromGithub(git, prNumber) {
    return await (0, github_1.getPr)(PR_SCHEMA, prNumber, git);
}
/** Whether the specified value resolves to a pull request. */
function isPullRequest(v) {
    return v.targetBranches !== undefined;
}
exports.isPullRequest = isPullRequest;
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
    switch (label.pattern) {
        case 'target: major':
            break;
        case 'target: minor':
            if (hasBreakingChanges) {
                throw failures_1.PullRequestFailure.hasBreakingChanges(label);
            }
            break;
        case 'target: rc':
        case 'target: patch':
        case 'target: lts':
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
            (0, console_1.warn)((0, console_1.red)(`merged into the target branch: ${label.pattern}`));
            break;
    }
}
/**
 * Assert the pull request has the proper label for breaking changes if there are breaking change
 * commits, and only has the label if there are breaking change commits.
 * @throws {PullRequestFailure}
 */
function assertCorrectBreakingChangeLabeling(commits, labels) {
    /** Whether the PR has a label noting a breaking change. */
    const hasLabel = labels.includes(constants_1.breakingChangeLabel);
    //** Whether the PR has at least one commit which notes a breaking change. */
    const hasCommit = commits.some((commit) => commit.breakingChanges.length !== 0);
    if (!hasLabel && hasCommit) {
        throw failures_1.PullRequestFailure.missingBreakingChangeLabel();
    }
    if (hasLabel && !hasCommit) {
        throw failures_1.PullRequestFailure.missingBreakingChangeCommit();
    }
}
/**
 * Assert the pull request is pending, not closed, merged or in draft.
 * @throws {PullRequestFailure} if the pull request is not pending.
 */
function assertPendingState(pr) {
    if (pr.isDraft) {
        throw failures_1.PullRequestFailure.isDraft();
    }
    switch (pr.state) {
        case 'CLOSED':
            throw failures_1.PullRequestFailure.isClosed();
        case 'MERGED':
            throw failures_1.PullRequestFailure.isMerged();
    }
}
/** Get the branches the pull request will be merged into.  */
async function getTargetBranches(config, labels, githubTargetBranch, commits) {
    if (config.merge.noTargetLabeling) {
        return [config.github.mainBranchName];
    }
    else {
        try {
            let targetLabel = await (0, target_label_1.getTargetLabelFromPullRequest)(config.merge, labels);
            // If branches are determined for a given target label, capture errors that are
            // thrown as part of branch computation. This is expected because a merge configuration
            // can lazily compute branches for a target label and throw. e.g. if an invalid target
            // label is applied, we want to exit the script gracefully with an error message.
            let targetBranches = await (0, target_label_1.getBranchesFromTargetLabel)(targetLabel, githubTargetBranch);
            assertChangesAllowForTargetLabel(commits, targetLabel, config.merge);
            return targetBranches;
        }
        catch (error) {
            if (error instanceof target_label_1.InvalidTargetBranchError || error instanceof target_label_1.InvalidTargetLabelError) {
                throw new failures_1.PullRequestFailure(error.failureMessage);
            }
            throw error;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1REFBK0Q7QUFFL0Qsc0RBQXNFO0FBQ3RFLGlEQUE4QztBQUU5QywrQ0FBeUM7QUFHekMseUNBQThDO0FBQzlDLHFEQUFnRDtBQUNoRCxpREFLd0I7QUFFeEIsMkNBQWdEO0FBMkJoRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsMEJBQTBCLENBQzlDLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBdUIsRUFDbkMsUUFBZ0IsRUFDaEIsc0JBQXNCLEdBQUcsS0FBSztJQUU5QixNQUFNLE1BQU0sR0FBRyxNQUFNLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUUvRCxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7UUFDbkIsT0FBTyw2QkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN0QztJQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXRELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFBLCtCQUFjLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFO1FBQ3hFLE9BQU8sNkJBQWtCLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDM0M7SUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBQSwrQkFBYyxFQUFDLElBQUksRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRTtRQUN2RSxPQUFP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TUFBa0QsRUFDbEQsTUFBZ0IsRUFDaEIsa0JBQTBCLEVBQzFCLE9BQWlCO0lBRWpCLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtRQUNqQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN2QztTQUFNO1FBQ0wsSUFBSTtZQUNGLElBQUksV0FBVyxHQUFHLE1BQU0sSUFBQSw0Q0FBNkIsRUFBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVFLCtFQUErRTtZQUMvRSx1RkFBdUY7WUFDdkYsc0ZBQXNGO1lBQ3RGLGlGQUFpRjtZQUVqRixJQUFJLGNBQWMsR0FBRyxNQUFNLElBQUEseUNBQTBCLEVBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDdkYsZ0NBQWdDLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckUsT0FBTyxjQUFjLENBQUM7U0FDdkI7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLElBQUksS0FBSyxZQUFZLHVDQUF3QixJQUFJLEtBQUssWUFBWSxzQ0FBdUIsRUFBRTtnQkFDekYsTUFBTSxJQUFJLDZCQUFrQixDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUNwRDtZQUNELE1BQU0sS0FBSyxDQUFDO1NBQ2I7S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwYXJhbXMsIHR5cGVzIGFzIGdyYXBocWxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbmltcG9ydCB7Q29tbWl0LCBwYXJzZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7cmVkLCB3YXJufSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuXG5pbXBvcnQge01lcmdlQ29uZmlnLCBUYXJnZXRMYWJlbH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4vZmFpbHVyZXMnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi9zdHJpbmctcGF0dGVybic7XG5pbXBvcnQge1xuICBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCxcbiAgZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QsXG4gIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcixcbiAgSW52YWxpZFRhcmdldExhYmVsRXJyb3IsXG59IGZyb20gJy4vdGFyZ2V0LWxhYmVsJztcbmltcG9ydCB7UHVsbFJlcXVlc3RNZXJnZVRhc2t9IGZyb20gJy4vdGFzayc7XG5pbXBvcnQge2JyZWFraW5nQ2hhbmdlTGFiZWx9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuXG4vKiogSW50ZXJmYWNlIHRoYXQgZGVzY3JpYmVzIGEgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVUkwgdG8gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBOdW1iZXIgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJOdW1iZXI6IG51bWJlcjtcbiAgLyoqIFRpdGxlIG9mIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHRpdGxlOiBzdHJpbmc7XG4gIC8qKiBMYWJlbHMgYXBwbGllZCB0byB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBsYWJlbHM6IHN0cmluZ1tdO1xuICAvKiogTGlzdCBvZiBicmFuY2hlcyB0aGlzIFBSIHNob3VsZCBiZSBtZXJnZWQgaW50by4gKi9cbiAgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdO1xuICAvKiogQnJhbmNoIHRoYXQgdGhlIFBSIHRhcmdldHMgaW4gdGhlIEdpdGh1YiBVSS4gKi9cbiAgZ2l0aHViVGFyZ2V0QnJhbmNoOiBzdHJpbmc7XG4gIC8qKiBDb3VudCBvZiBjb21taXRzIGluIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBjb21taXRDb3VudDogbnVtYmVyO1xuICAvKiogT3B0aW9uYWwgU0hBIHRoYXQgdGhpcyBwdWxsIHJlcXVlc3QgbmVlZHMgdG8gYmUgYmFzZWQgb24uICovXG4gIHJlcXVpcmVkQmFzZVNoYT86IHN0cmluZztcbiAgLyoqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBjb21taXQgbWVzc2FnZSBmaXh1cC4gKi9cbiAgbmVlZHNDb21taXRNZXNzYWdlRml4dXA6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGEgY2FyZXRha2VyIG5vdGUuICovXG4gIGhhc0NhcmV0YWtlck5vdGU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogTG9hZHMgYW5kIHZhbGlkYXRlcyB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBhZ2FpbnN0IHRoZSBnaXZlbiBjb25maWd1cmF0aW9uLlxuICogSWYgdGhlIHB1bGwgcmVxdWVzdHMgZmFpbHMsIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUgaXMgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdChcbiAge2dpdCwgY29uZmlnfTogUHVsbFJlcXVlc3RNZXJnZVRhc2ssXG4gIHByTnVtYmVyOiBudW1iZXIsXG4gIGlnbm9yZU5vbkZhdGFsRmFpbHVyZXMgPSBmYWxzZSxcbik6IFByb21pc2U8UHVsbFJlcXVlc3QgfCBQdWxsUmVxdWVzdEZhaWx1cmU+IHtcbiAgY29uc3QgcHJEYXRhID0gYXdhaXQgZmV0Y2hQdWxsUmVxdWVzdEZyb21HaXRodWIoZ2l0LCBwck51bWJlcik7XG5cbiAgaWYgKHByRGF0YSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubm90Rm91bmQoKTtcbiAgfVxuXG4gIGNvbnN0IGxhYmVscyA9IHByRGF0YS5sYWJlbHMubm9kZXMubWFwKChsKSA9PiBsLm5hbWUpO1xuXG4gIGlmICghbGFiZWxzLnNvbWUoKG5hbWUpID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5tZXJnZVJlYWR5TGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubm90TWVyZ2VSZWFkeSgpO1xuICB9XG4gIGlmICghbGFiZWxzLnNvbWUoKG5hbWUpID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5jbGFTaWduZWRMYWJlbCkpKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5jbGFVbnNpZ25lZCgpO1xuICB9XG5cbiAgLyoqIExpc3Qgb2YgcGFyc2VkIGNvbW1pdHMgZm9yIGFsbCBvZiB0aGUgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBjb25zdCBjb21taXRzSW5QciA9IHByRGF0YS5jb21taXRzLm5vZGVzLm1hcCgobikgPT4gcGFyc2VDb21taXRNZXNzYWdlKG4uY29tbWl0Lm1lc3NhZ2UpKTtcbiAgY29uc3QgZ2l0aHViVGFyZ2V0QnJhbmNoID0gcHJEYXRhLmJhc2VSZWZOYW1lO1xuXG4gIGNvbnN0IHRhcmdldEJyYW5jaGVzID0gYXdhaXQgZ2V0VGFyZ2V0QnJhbmNoZXMoXG4gICAge2dpdGh1YjogZ2l0LmNvbmZpZy5naXRodWIsIG1lcmdlOiBjb25maWd9LFxuICAgIGxhYmVscyxcbiAgICBnaXRodWJUYXJnZXRCcmFuY2gsXG4gICAgY29tbWl0c0luUHIsXG4gICk7XG5cbiAgdHJ5IHtcbiAgICBhc3NlcnRQZW5kaW5nU3RhdGUocHJEYXRhKTtcbiAgICBhc3NlcnRDb3JyZWN0QnJlYWtpbmdDaGFuZ2VMYWJlbGluZyhjb21taXRzSW5QciwgbGFiZWxzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyBJZiB0aGUgZXJyb3IgaXMgYSBwdWxsIHJlcXVlc3QgZmFpbHVyZSwgd2UgcGFzcyBpdCB0aHJvdWdoIGdyYWNlZnVsbHlcbiAgICAvLyBhcyB0aGUgdG9vbCBleHBlY3RzIHN1Y2ggZmFpbHVyZXMgdG8gYmUgcmV0dXJuZWQgZnJvbSB0aGUgZnVuY3Rpb24uXG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgUHVsbFJlcXVlc3RGYWlsdXJlKSB7XG4gICAgICByZXR1cm4gZXJyb3I7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBzdGF0dXMgb2YgdGhlIGxhdGVzdCBjb21taXQgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29uc3Qgc3RhdGUgPSBwckRhdGEuY29tbWl0cy5ub2Rlcy5zbGljZSgtMSlbMF0uY29tbWl0LnN0YXR1cy5zdGF0ZTtcbiAgaWYgKHN0YXRlID09PSAnRkFJTFVSRScgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmZhaWxpbmdDaUpvYnMoKTtcbiAgfVxuICBpZiAoc3RhdGUgPT09ICdQRU5ESU5HJyAmJiAhaWdub3JlTm9uRmF0YWxGYWlsdXJlcykge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUucGVuZGluZ0NpSm9icygpO1xuICB9XG5cbiAgY29uc3QgcmVxdWlyZWRCYXNlU2hhID1cbiAgICBjb25maWcucmVxdWlyZWRCYXNlQ29tbWl0cyAmJiBjb25maWcucmVxdWlyZWRCYXNlQ29tbWl0c1tnaXRodWJUYXJnZXRCcmFuY2hdO1xuICBjb25zdCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCA9XG4gICAgISFjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwgJiZcbiAgICBsYWJlbHMuc29tZSgobmFtZSkgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsKSk7XG4gIGNvbnN0IGhhc0NhcmV0YWtlck5vdGUgPVxuICAgICEhY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCAmJlxuICAgIGxhYmVscy5zb21lKChuYW1lKSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2FyZXRha2VyTm90ZUxhYmVsISkpO1xuXG4gIHJldHVybiB7XG4gICAgdXJsOiBwckRhdGEudXJsLFxuICAgIHByTnVtYmVyLFxuICAgIGxhYmVscyxcbiAgICByZXF1aXJlZEJhc2VTaGEsXG4gICAgZ2l0aHViVGFyZ2V0QnJhbmNoLFxuICAgIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwLFxuICAgIGhhc0NhcmV0YWtlck5vdGUsXG4gICAgdGFyZ2V0QnJhbmNoZXMsXG4gICAgdGl0bGU6IHByRGF0YS50aXRsZSxcbiAgICBjb21taXRDb3VudDogcHJEYXRhLmNvbW1pdHMudG90YWxDb3VudCxcbiAgfTtcbn1cblxuLyogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IHRoZSByZXF1ZXN0ZWQgcHVsbCByZXF1ZXN0LiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIGlzRHJhZnQ6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICBzdGF0ZTogZ3JhcGhxbFR5cGVzLm9uZU9mKFsnT1BFTicsICdNRVJHRUQnLCAnQ0xPU0VEJ10gYXMgY29uc3QpLFxuICBudW1iZXI6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gIC8vIE9ubHkgdGhlIGxhc3QgMTAwIGNvbW1pdHMgZnJvbSBhIHB1bGwgcmVxdWVzdCBhcmUgb2J0YWluZWQgYXMgd2UgbGlrZWx5IHdpbGwgbmV2ZXIgc2VlIGEgcHVsbFxuICAvLyByZXF1ZXN0cyB3aXRoIG1vcmUgdGhhbiAxMDAgY29tbWl0cy5cbiAgY29tbWl0czogcGFyYW1zKFxuICAgIHtsYXN0OiAxMDB9LFxuICAgIHtcbiAgICAgIHRvdGFsQ291bnQ6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gICAgICBub2RlczogW1xuICAgICAgICB7XG4gICAgICAgICAgY29tbWl0OiB7XG4gICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgc3RhdGU6IGdyYXBocWxUeXBlcy5vbmVPZihbJ0ZBSUxVUkUnLCAnUEVORElORycsICdTVUNDRVNTJ10gYXMgY29uc3QpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgKSxcbiAgYmFzZVJlZk5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIHRpdGxlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBsYWJlbHM6IHBhcmFtcyhcbiAgICB7Zmlyc3Q6IDEwMH0sXG4gICAge1xuICAgICAgbm9kZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICksXG59O1xuXG4vKiogQSBwdWxsIHJlcXVlc3QgcmV0cmlldmVkIGZyb20gZ2l0aHViIHZpYSB0aGUgZ3JhcGhxbCBBUEkuICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIEZldGNoZXMgYSBwdWxsIHJlcXVlc3QgZnJvbSBHaXRodWIuIFJldHVybnMgbnVsbCBpZiBhbiBlcnJvciBvY2N1cnJlZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKFxuICBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsXG4gIHByTnVtYmVyOiBudW1iZXIsXG4pOiBQcm9taXNlPFJhd1B1bGxSZXF1ZXN0IHwgbnVsbD4ge1xuICByZXR1cm4gYXdhaXQgZ2V0UHIoUFJfU0NIRU1BLCBwck51bWJlciwgZ2l0KTtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIHNwZWNpZmllZCB2YWx1ZSByZXNvbHZlcyB0byBhIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1B1bGxSZXF1ZXN0KHY6IFB1bGxSZXF1ZXN0RmFpbHVyZSB8IFB1bGxSZXF1ZXN0KTogdiBpcyBQdWxsUmVxdWVzdCB7XG4gIHJldHVybiAodiBhcyBQdWxsUmVxdWVzdCkudGFyZ2V0QnJhbmNoZXMgIT09IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIGNvbW1pdHMgcHJvdmlkZWQgYXJlIGFsbG93ZWQgdG8gbWVyZ2UgdG8gdGhlIHByb3ZpZGVkIHRhcmdldCBsYWJlbCxcbiAqIHRocm93aW5nIGFuIGVycm9yIG90aGVyd2lzZS5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX1cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Q2hhbmdlc0FsbG93Rm9yVGFyZ2V0TGFiZWwoXG4gIGNvbW1pdHM6IENvbW1pdFtdLFxuICBsYWJlbDogVGFyZ2V0TGFiZWwsXG4gIGNvbmZpZzogTWVyZ2VDb25maWcsXG4pIHtcbiAgLyoqXG4gICAqIExpc3Qgb2YgY29tbWl0IHNjb3BlcyB3aGljaCBhcmUgZXhlbXB0ZWQgZnJvbSB0YXJnZXQgbGFiZWwgY29udGVudCByZXF1aXJlbWVudHMuIGkuZS4gbm8gYGZlYXRgXG4gICAqIHNjb3BlcyBpbiBwYXRjaCBicmFuY2hlcywgbm8gYnJlYWtpbmcgY2hhbmdlcyBpbiBtaW5vciBvciBwYXRjaCBjaGFuZ2VzLlxuICAgKi9cbiAgY29uc3QgZXhlbXB0ZWRTY29wZXMgPSBjb25maWcudGFyZ2V0TGFiZWxFeGVtcHRTY29wZXMgfHwgW107XG4gIC8qKiBMaXN0IG9mIGNvbW1pdHMgd2hpY2ggYXJlIHN1YmplY3QgdG8gY29udGVudCByZXF1aXJlbWVudHMgZm9yIHRoZSB0YXJnZXQgbGFiZWwuICovXG4gIGNvbW1pdHMgPSBjb21taXRzLmZpbHRlcigoY29tbWl0KSA9PiAhZXhlbXB0ZWRTY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSk7XG4gIGNvbnN0IGhhc0JyZWFraW5nQ2hhbmdlcyA9IGNvbW1pdHMuc29tZSgoY29tbWl0KSA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCk7XG4gIGNvbnN0IGhhc0RlcHJlY2F0aW9ucyA9IGNvbW1pdHMuc29tZSgoY29tbWl0KSA9PiBjb21taXQuZGVwcmVjYXRpb25zLmxlbmd0aCAhPT0gMCk7XG4gIGNvbnN0IGhhc0ZlYXR1cmVDb21taXRzID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC50eXBlID09PSAnZmVhdCcpO1xuICBzd2l0Y2ggKGxhYmVsLnBhdHRlcm4pIHtcbiAgICBjYXNlICd0YXJnZXQ6IG1ham9yJzpcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RhcmdldDogbWlub3InOlxuICAgICAgaWYgKGhhc0JyZWFraW5nQ2hhbmdlcykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzQnJlYWtpbmdDaGFuZ2VzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RhcmdldDogcmMnOlxuICAgIGNhc2UgJ3RhcmdldDogcGF0Y2gnOlxuICAgIGNhc2UgJ3RhcmdldDogbHRzJzpcbiAgICAgIGlmIChoYXNCcmVha2luZ0NoYW5nZXMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0JyZWFraW5nQ2hhbmdlcyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzRmVhdHVyZUNvbW1pdHMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0ZlYXR1cmVDb21taXRzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIC8vIERlcHJlY2F0aW9ucyBzaG91bGQgbm90IGJlIG1lcmdlZCBpbnRvIFJDLCBwYXRjaCBvciBMVFMgYnJhbmNoZXMuXG4gICAgICAvLyBodHRwczovL3NlbXZlci5vcmcvI3NwZWMtaXRlbS03LiBEZXByZWNhdGlvbnMgc2hvdWxkIGJlIHBhcnQgb2ZcbiAgICAgIC8vIG1pbm9yIHJlbGVhc2VzLCBvciBtYWpvciByZWxlYXNlcyBhY2NvcmRpbmcgdG8gU2VtVmVyLlxuICAgICAgaWYgKGhhc0RlcHJlY2F0aW9ucykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzRGVwcmVjYXRpb25zKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB3YXJuKHJlZCgnV0FSTklORzogVW5hYmxlIHRvIGNvbmZpcm0gYWxsIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdCBhcmUgZWxpZ2libGUgdG8gYmUnKSk7XG4gICAgICB3YXJuKHJlZChgbWVyZ2VkIGludG8gdGhlIHRhcmdldCBicmFuY2g6ICR7bGFiZWwucGF0dGVybn1gKSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgcHVsbCByZXF1ZXN0IGhhcyB0aGUgcHJvcGVyIGxhYmVsIGZvciBicmVha2luZyBjaGFuZ2VzIGlmIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2VcbiAqIGNvbW1pdHMsIGFuZCBvbmx5IGhhcyB0aGUgbGFiZWwgaWYgdGhlcmUgYXJlIGJyZWFraW5nIGNoYW5nZSBjb21taXRzLlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfVxuICovXG5mdW5jdGlvbiBhc3NlcnRDb3JyZWN0QnJlYWtpbmdDaGFuZ2VMYWJlbGluZyhjb21taXRzOiBDb21taXRbXSwgbGFiZWxzOiBzdHJpbmdbXSkge1xuICAvKiogV2hldGhlciB0aGUgUFIgaGFzIGEgbGFiZWwgbm90aW5nIGEgYnJlYWtpbmcgY2hhbmdlLiAqL1xuICBjb25zdCBoYXNMYWJlbCA9IGxhYmVscy5pbmNsdWRlcyhicmVha2luZ0NoYW5nZUxhYmVsKTtcbiAgLy8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYXQgbGVhc3Qgb25lIGNvbW1pdCB3aGljaCBub3RlcyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbiAgY29uc3QgaGFzQ29tbWl0ID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC5icmVha2luZ0NoYW5nZXMubGVuZ3RoICE9PSAwKTtcblxuICBpZiAoIWhhc0xhYmVsICYmIGhhc0NvbW1pdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNzaW5nQnJlYWtpbmdDaGFuZ2VMYWJlbCgpO1xuICB9XG5cbiAgaWYgKGhhc0xhYmVsICYmICFoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlQ29tbWl0KCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIHB1bGwgcmVxdWVzdCBpcyBwZW5kaW5nLCBub3QgY2xvc2VkLCBtZXJnZWQgb3IgaW4gZHJhZnQuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9IGlmIHRoZSBwdWxsIHJlcXVlc3QgaXMgbm90IHBlbmRpbmcuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFBlbmRpbmdTdGF0ZShwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgaWYgKHByLmlzRHJhZnQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNEcmFmdCgpO1xuICB9XG4gIHN3aXRjaCAocHIuc3RhdGUpIHtcbiAgICBjYXNlICdDTE9TRUQnOlxuICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzQ2xvc2VkKCk7XG4gICAgY2FzZSAnTUVSR0VEJzpcbiAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc01lcmdlZCgpO1xuICB9XG59XG5cbi8qKiBHZXQgdGhlIGJyYW5jaGVzIHRoZSBwdWxsIHJlcXVlc3Qgd2lsbCBiZSBtZXJnZWQgaW50by4gICovXG5hc3luYyBmdW5jdGlvbiBnZXRUYXJnZXRCcmFuY2hlcyhcbiAgY29uZmlnOiB7bWVyZ2U6IE1lcmdlQ29uZmlnOyBnaXRodWI6IEdpdGh1YkNvbmZpZ30sXG4gIGxhYmVsczogc3RyaW5nW10sXG4gIGdpdGh1YlRhcmdldEJyYW5jaDogc3RyaW5nLFxuICBjb21taXRzOiBDb21taXRbXSxcbikge1xuICBpZiAoY29uZmlnLm1lcmdlLm5vVGFyZ2V0TGFiZWxpbmcpIHtcbiAgICByZXR1cm4gW2NvbmZpZy5naXRodWIubWFpbkJyYW5jaE5hbWVdO1xuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBsZXQgdGFyZ2V0TGFiZWwgPSBhd2FpdCBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdChjb25maWcubWVyZ2UsIGxhYmVscyk7XG4gICAgICAvLyBJZiBicmFuY2hlcyBhcmUgZGV0ZXJtaW5lZCBmb3IgYSBnaXZlbiB0YXJnZXQgbGFiZWwsIGNhcHR1cmUgZXJyb3JzIHRoYXQgYXJlXG4gICAgICAvLyB0aHJvd24gYXMgcGFydCBvZiBicmFuY2ggY29tcHV0YXRpb24uIFRoaXMgaXMgZXhwZWN0ZWQgYmVjYXVzZSBhIG1lcmdlIGNvbmZpZ3VyYXRpb25cbiAgICAgIC8vIGNhbiBsYXppbHkgY29tcHV0ZSBicmFuY2hlcyBmb3IgYSB0YXJnZXQgbGFiZWwgYW5kIHRocm93LiBlLmcuIGlmIGFuIGludmFsaWQgdGFyZ2V0XG4gICAgICAvLyBsYWJlbCBpcyBhcHBsaWVkLCB3ZSB3YW50IHRvIGV4aXQgdGhlIHNjcmlwdCBncmFjZWZ1bGx5IHdpdGggYW4gZXJyb3IgbWVzc2FnZS5cblxuICAgICAgbGV0IHRhcmdldEJyYW5jaGVzID0gYXdhaXQgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwodGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG4gICAgICBhc3NlcnRDaGFuZ2VzQWxsb3dGb3JUYXJnZXRMYWJlbChjb21taXRzLCB0YXJnZXRMYWJlbCwgY29uZmlnLm1lcmdlKTtcbiAgICAgIHJldHVybiB0YXJnZXRCcmFuY2hlcztcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yIHx8IGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgbmV3IFB1bGxSZXF1ZXN0RmFpbHVyZShlcnJvci5mYWlsdXJlTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cbn1cbiJdfQ==