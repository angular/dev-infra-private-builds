/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pr/merge/pull-request", ["require", "exports", "tslib", "typed-graphqlify", "@angular/dev-infra-private/commit-message/parse", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/github", "@angular/dev-infra-private/pr/merge/failures", "@angular/dev-infra-private/pr/merge/string-pattern", "@angular/dev-infra-private/pr/merge/target-label"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isPullRequest = exports.loadAndValidatePullRequest = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var parse_1 = require("@angular/dev-infra-private/commit-message/parse");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_1 = require("@angular/dev-infra-private/utils/github");
    var failures_1 = require("@angular/dev-infra-private/pr/merge/failures");
    var string_pattern_1 = require("@angular/dev-infra-private/pr/merge/string-pattern");
    var target_label_1 = require("@angular/dev-infra-private/pr/merge/target-label");
    /** The default label for labeling pull requests containing a breaking change. */
    var BreakingChangeLabel = 'breaking changes';
    /**
     * Loads and validates the specified pull request against the given configuration.
     * If the pull requests fails, a pull request failure is returned.
     */
    function loadAndValidatePullRequest(_a, prNumber, ignoreNonFatalFailures) {
        var git = _a.git, config = _a.config;
        if (ignoreNonFatalFailures === void 0) { ignoreNonFatalFailures = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var prData, labels, targetLabel, commitsInPr, state, githubTargetBranch, requiredBaseSha, needsCommitMessageFixup, hasCaretakerNote, targetBranches, error_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetchPullRequestFromGithub(git, prNumber)];
                    case 1:
                        prData = _b.sent();
                        if (prData === null) {
                            return [2 /*return*/, failures_1.PullRequestFailure.notFound()];
                        }
                        labels = prData.labels.nodes.map(function (l) { return l.name; });
                        if (!labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.mergeReadyLabel); })) {
                            return [2 /*return*/, failures_1.PullRequestFailure.notMergeReady()];
                        }
                        if (!labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.claSignedLabel); })) {
                            return [2 /*return*/, failures_1.PullRequestFailure.claUnsigned()];
                        }
                        try {
                            targetLabel = target_label_1.getTargetLabelFromPullRequest(config, labels);
                        }
                        catch (error) {
                            if (error instanceof target_label_1.InvalidTargetLabelError) {
                                return [2 /*return*/, new failures_1.PullRequestFailure(error.failureMessage)];
                            }
                            throw error;
                        }
                        commitsInPr = prData.commits.nodes.map(function (n) { return parse_1.parseCommitMessage(n.commit.message); });
                        try {
                            assertPendingState(prData);
                            assertChangesAllowForTargetLabel(commitsInPr, targetLabel, config);
                            assertCorrectBreakingChangeLabeling(commitsInPr, labels, config);
                        }
                        catch (error) {
                            return [2 /*return*/, error];
                        }
                        state = prData.commits.nodes.slice(-1)[0].commit.status.state;
                        if (state === 'FAILURE' && !ignoreNonFatalFailures) {
                            return [2 /*return*/, failures_1.PullRequestFailure.failingCiJobs()];
                        }
                        if (state === 'PENDING' && !ignoreNonFatalFailures) {
                            return [2 /*return*/, failures_1.PullRequestFailure.pendingCiJobs()];
                        }
                        githubTargetBranch = prData.baseRefName;
                        requiredBaseSha = config.requiredBaseCommits && config.requiredBaseCommits[githubTargetBranch];
                        needsCommitMessageFixup = !!config.commitMessageFixupLabel &&
                            labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.commitMessageFixupLabel); });
                        hasCaretakerNote = !!config.caretakerNoteLabel &&
                            labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.caretakerNoteLabel); });
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, target_label_1.getBranchesFromTargetLabel(targetLabel, githubTargetBranch)];
                    case 3:
                        targetBranches = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        if (error_1 instanceof target_label_1.InvalidTargetBranchError || error_1 instanceof target_label_1.InvalidTargetLabelError) {
                            return [2 /*return*/, new failures_1.PullRequestFailure(error_1.failureMessage)];
                        }
                        throw error_1;
                    case 5: return [2 /*return*/, {
                            url: prData.url,
                            prNumber: prNumber,
                            labels: labels,
                            requiredBaseSha: requiredBaseSha,
                            githubTargetBranch: githubTargetBranch,
                            needsCommitMessageFixup: needsCommitMessageFixup,
                            hasCaretakerNote: hasCaretakerNote,
                            targetBranches: targetBranches,
                            title: prData.title,
                            commitCount: prData.commits.totalCount,
                        }];
                }
            });
        });
    }
    exports.loadAndValidatePullRequest = loadAndValidatePullRequest;
    /* Graphql schema for the response body the requested pull request. */
    var PR_SCHEMA = {
        url: typed_graphqlify_1.types.string,
        isDraft: typed_graphqlify_1.types.boolean,
        state: typed_graphqlify_1.types.oneOf(['OPEN', 'MERGED', 'CLOSED']),
        number: typed_graphqlify_1.types.number,
        // Only the last 100 commits from a pull request are obtained as we likely will never see a pull
        // requests with more than 100 commits.
        commits: typed_graphqlify_1.params({ last: 100 }, {
            totalCount: typed_graphqlify_1.types.number,
            nodes: [{
                    commit: {
                        status: {
                            state: typed_graphqlify_1.types.oneOf(['FAILURE', 'PENDING', 'SUCCESS']),
                        },
                        message: typed_graphqlify_1.types.string,
                    },
                }],
        }),
        baseRefName: typed_graphqlify_1.types.string,
        title: typed_graphqlify_1.types.string,
        labels: typed_graphqlify_1.params({ first: 100 }, {
            nodes: [{
                    name: typed_graphqlify_1.types.string,
                }]
        }),
    };
    /** Fetches a pull request from Github. Returns null if an error occurred. */
    function fetchPullRequestFromGithub(git, prNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var x, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, github_1.getPr(PR_SCHEMA, prNumber, git)];
                    case 1:
                        x = _a.sent();
                        return [2 /*return*/, x];
                    case 2:
                        e_1 = _a.sent();
                        // If the pull request could not be found, we want to return `null` so
                        // that the error can be handled gracefully.
                        if (e_1.status === 404) {
                            return [2 /*return*/, null];
                        }
                        throw e_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    /** Whether the specified value resolves to a pull request. */
    function isPullRequest(v) {
        return v.targetBranches !== undefined;
    }
    exports.isPullRequest = isPullRequest;
    /**
     * Assert the commits provided are allowed to merge to the provided target label, throwing a
     * PullRequestFailure otherwise.
     */
    function assertChangesAllowForTargetLabel(commits, label, config) {
        /**
         * List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
         * scopes in patch branches, no breaking changes in minor or patch changes.
         */
        var exemptedScopes = config.targetLabelExemptScopes || [];
        /** List of commits which are subject to content requirements for the target label. */
        commits = commits.filter(function (commit) { return !exemptedScopes.includes(commit.scope); });
        switch (label.pattern) {
            case 'target: major':
                break;
            case 'target: minor':
                // Check if any commits in the pull request contains a breaking change.
                if (commits.some(function (commit) { return commit.breakingChanges.length !== 0; })) {
                    throw failures_1.PullRequestFailure.hasBreakingChanges(label);
                }
                break;
            case 'target: patch':
            case 'target: lts':
                // Check if any commits in the pull request contains a breaking change.
                if (commits.some(function (commit) { return commit.breakingChanges.length !== 0; })) {
                    throw failures_1.PullRequestFailure.hasBreakingChanges(label);
                }
                // Check if any commits in the pull request contains a commit type of "feat".
                if (commits.some(function (commit) { return commit.type === 'feat'; })) {
                    throw failures_1.PullRequestFailure.hasFeatureCommits(label);
                }
                break;
            default:
                console_1.warn(console_1.red('WARNING: Unable to confirm all commits in the pull request are eligible to be'));
                console_1.warn(console_1.red("merged into the target branch: " + label.pattern));
                break;
        }
    }
    /**
     * Assert the pull request has the proper label for breaking changes if there are breaking change
     * commits, and only has the label if there are breaking change commits.
     */
    function assertCorrectBreakingChangeLabeling(commits, labels, config) {
        /** Whether the PR has a label noting a breaking change. */
        var hasLabel = labels.includes(config.breakingChangeLabel || BreakingChangeLabel);
        //** Whether the PR has at least one commit which notes a breaking change. */
        var hasCommit = commits.some(function (commit) { return commit.breakingChanges.length !== 0; });
        if (!hasLabel && hasCommit) {
            throw failures_1.PullRequestFailure.missingBreakingChangeLabel();
        }
        if (hasLabel && !hasCommit) {
            throw failures_1.PullRequestFailure.missingBreakingChangeCommit();
        }
    }
    /** Assert the pull request is pending, not closed, merged or in draft. */
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgscURBQStEO0lBQy9ELHlFQUFzRTtJQUN0RSxvRUFBOEM7SUFHOUMsa0VBQXlDO0lBR3pDLHlFQUE4QztJQUM5QyxxRkFBZ0Q7SUFDaEQsaUZBQTRJO0lBRzVJLGlGQUFpRjtJQUNqRixJQUFNLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO0lBMEIvQzs7O09BR0c7SUFDSCxTQUFzQiwwQkFBMEIsQ0FDNUMsRUFBbUMsRUFBRSxRQUFnQixFQUNyRCxzQkFBOEI7WUFEN0IsR0FBRyxTQUFBLEVBQUUsTUFBTSxZQUFBO1FBQ1osdUNBQUEsRUFBQSw4QkFBOEI7Ozs7OzRCQUNqQixxQkFBTSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUE7O3dCQUF4RCxNQUFNLEdBQUcsU0FBK0M7d0JBRTlELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTs0QkFDbkIsc0JBQU8sNkJBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUM7eUJBQ3RDO3dCQUVLLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO3dCQUVwRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxFQUFFOzRCQUN0RSxzQkFBTyw2QkFBa0IsQ0FBQyxhQUFhLEVBQUUsRUFBQzt5QkFDM0M7d0JBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENB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Q3ZEO1FBRUQsSUFBSSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1NBQ3hEO0lBQ0gsQ0FBQztJQUdELDBFQUEwRTtJQUMxRSxTQUFTLGtCQUFrQixDQUFDLEVBQWtCO1FBQzVDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRTtZQUNkLE1BQU0sNkJBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDcEM7UUFDRCxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUU7WUFDaEIsS0FBSyxRQUFRO2dCQUNYLE1BQU0sNkJBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEMsS0FBSyxRQUFRO2dCQUNYLE1BQU0sNkJBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDdkM7SUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuaW1wb3J0IHtDb21taXQsIHBhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtyZWQsIHdhcm59IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7Z2V0UHJ9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5pbXBvcnQge01lcmdlQ29uZmlnLCBUYXJnZXRMYWJlbH0gZnJvbSAnLi9jb25maWcnO1xuXG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi9mYWlsdXJlcyc7XG5pbXBvcnQge21hdGNoZXNQYXR0ZXJufSBmcm9tICcuL3N0cmluZy1wYXR0ZXJuJztcbmltcG9ydCB7Z2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0LCBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsIEludmFsaWRUYXJnZXRMYWJlbEVycm9yfSBmcm9tICcuL3RhcmdldC1sYWJlbCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuXG4vKiogVGhlIGRlZmF1bHQgbGFiZWwgZm9yIGxhYmVsaW5nIHB1bGwgcmVxdWVzdHMgY29udGFpbmluZyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbmNvbnN0IEJyZWFraW5nQ2hhbmdlTGFiZWwgPSAnYnJlYWtpbmcgY2hhbmdlcyc7XG5cbi8qKiBJbnRlcmZhY2UgdGhhdCBkZXNjcmliZXMgYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVSTCB0byB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwck51bWJlcjogbnVtYmVyO1xuICAvKiogVGl0bGUgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgdGl0bGU6IHN0cmluZztcbiAgLyoqIExhYmVscyBhcHBsaWVkIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGxhYmVsczogc3RyaW5nW107XG4gIC8qKiBMaXN0IG9mIGJyYW5jaGVzIHRoaXMgUFIgc2hvdWxkIGJlIG1lcmdlZCBpbnRvLiAqL1xuICB0YXJnZXRCcmFuY2hlczogc3RyaW5nW107XG4gIC8qKiBCcmFuY2ggdGhhdCB0aGUgUFIgdGFyZ2V0cyBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZztcbiAgLyoqIENvdW50IG9mIGNvbW1pdHMgaW4gdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGNvbW1pdENvdW50OiBudW1iZXI7XG4gIC8qKiBPcHRpb25hbCBTSEEgdGhhdCB0aGlzIHB1bGwgcmVxdWVzdCBuZWVkcyB0byBiZSBiYXNlZCBvbi4gKi9cbiAgcmVxdWlyZWRCYXNlU2hhPzogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGNvbW1pdCBtZXNzYWdlIGZpeHVwLiAqL1xuICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYSBjYXJldGFrZXIgbm90ZS4gKi9cbiAgaGFzQ2FyZXRha2VyTm90ZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBMb2FkcyBhbmQgdmFsaWRhdGVzIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGFnYWluc3QgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXG4gKiBJZiB0aGUgcHVsbCByZXF1ZXN0cyBmYWlscywgYSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBpcyByZXR1cm5lZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0KFxuICAgIHtnaXQsIGNvbmZpZ306IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrLCBwck51bWJlcjogbnVtYmVyLFxuICAgIGlnbm9yZU5vbkZhdGFsRmFpbHVyZXMgPSBmYWxzZSk6IFByb21pc2U8UHVsbFJlcXVlc3R8UHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gIGNvbnN0IHByRGF0YSA9IGF3YWl0IGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKGdpdCwgcHJOdW1iZXIpO1xuXG4gIGlmIChwckRhdGEgPT09IG51bGwpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdEZvdW5kKCk7XG4gIH1cblxuICBjb25zdCBsYWJlbHMgPSBwckRhdGEubGFiZWxzLm5vZGVzLm1hcChsID0+IGwubmFtZSk7XG5cbiAgaWYgKCFsYWJlbHMuc29tZShuYW1lID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5tZXJnZVJlYWR5TGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubm90TWVyZ2VSZWFkeSgpO1xuICB9XG4gIGlmICghbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2xhU2lnbmVkTGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuY2xhVW5zaWduZWQoKTtcbiAgfVxuXG4gIGxldCB0YXJnZXRMYWJlbDogVGFyZ2V0TGFiZWw7XG4gIHRyeSB7XG4gICAgdGFyZ2V0TGFiZWwgPSBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdChjb25maWcsIGxhYmVscyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RGYWlsdXJlKGVycm9yLmZhaWx1cmVNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICAvKiogTGlzdCBvZiBwYXJzZWQgY29tbWl0cyBmb3IgYWxsIG9mIHRoZSBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGNvbnN0IGNvbW1pdHNJblByID0gcHJEYXRhLmNvbW1pdHMubm9kZXMubWFwKG4gPT4gcGFyc2VDb21taXRNZXNzYWdlKG4uY29tbWl0Lm1lc3NhZ2UpKTtcblxuICB0cnkge1xuICAgIGFzc2VydFBlbmRpbmdTdGF0ZShwckRhdGEpO1xuICAgIGFzc2VydENoYW5nZXNBbGxvd0ZvclRhcmdldExhYmVsKGNvbW1pdHNJblByLCB0YXJnZXRMYWJlbCwgY29uZmlnKTtcbiAgICBhc3NlcnRDb3JyZWN0QnJlYWtpbmdDaGFuZ2VMYWJlbGluZyhjb21taXRzSW5QciwgbGFiZWxzLCBjb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIC8qKiBUaGUgY29tYmluZWQgc3RhdHVzIG9mIHRoZSBsYXRlc3QgY29tbWl0IGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGNvbnN0IHN0YXRlID0gcHJEYXRhLmNvbW1pdHMubm9kZXMuc2xpY2UoLTEpWzBdLmNvbW1pdC5zdGF0dXMuc3RhdGU7XG4gIGlmIChzdGF0ZSA9PT0gJ0ZBSUxVUkUnICYmICFpZ25vcmVOb25GYXRhbEZhaWx1cmVzKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5mYWlsaW5nQ2lKb2JzKCk7XG4gIH1cbiAgaWYgKHN0YXRlID09PSAnUEVORElORycgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnBlbmRpbmdDaUpvYnMoKTtcbiAgfVxuXG4gIGNvbnN0IGdpdGh1YlRhcmdldEJyYW5jaCA9IHByRGF0YS5iYXNlUmVmTmFtZTtcbiAgY29uc3QgcmVxdWlyZWRCYXNlU2hhID1cbiAgICAgIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzICYmIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzW2dpdGh1YlRhcmdldEJyYW5jaF07XG4gIGNvbnN0IG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwID0gISFjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwgJiZcbiAgICAgIGxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsKSk7XG4gIGNvbnN0IGhhc0NhcmV0YWtlck5vdGUgPSAhIWNvbmZpZy5jYXJldGFrZXJOb3RlTGFiZWwgJiZcbiAgICAgIGxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCEpKTtcbiAgbGV0IHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXTtcblxuICAvLyBJZiBicmFuY2hlcyBhcmUgZGV0ZXJtaW5lZCBmb3IgYSBnaXZlbiB0YXJnZXQgbGFiZWwsIGNhcHR1cmUgZXJyb3JzIHRoYXQgYXJlXG4gIC8vIHRocm93biBhcyBwYXJ0IG9mIGJyYW5jaCBjb21wdXRhdGlvbi4gVGhpcyBpcyBleHBlY3RlZCBiZWNhdXNlIGEgbWVyZ2UgY29uZmlndXJhdGlvblxuICAvLyBjYW4gbGF6aWx5IGNvbXB1dGUgYnJhbmNoZXMgZm9yIGEgdGFyZ2V0IGxhYmVsIGFuZCB0aHJvdy4gZS5nLiBpZiBhbiBpbnZhbGlkIHRhcmdldFxuICAvLyBsYWJlbCBpcyBhcHBsaWVkLCB3ZSB3YW50IHRvIGV4aXQgdGhlIHNjcmlwdCBncmFjZWZ1bGx5IHdpdGggYW4gZXJyb3IgbWVzc2FnZS5cbiAgdHJ5IHtcbiAgICB0YXJnZXRCcmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsKHRhcmdldExhYmVsLCBnaXRodWJUYXJnZXRCcmFuY2gpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciB8fCBlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0RmFpbHVyZShlcnJvci5mYWlsdXJlTWVzc2FnZSk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB1cmw6IHByRGF0YS51cmwsXG4gICAgcHJOdW1iZXIsXG4gICAgbGFiZWxzLFxuICAgIHJlcXVpcmVkQmFzZVNoYSxcbiAgICBnaXRodWJUYXJnZXRCcmFuY2gsXG4gICAgbmVlZHNDb21taXRNZXNzYWdlRml4dXAsXG4gICAgaGFzQ2FyZXRha2VyTm90ZSxcbiAgICB0YXJnZXRCcmFuY2hlcyxcbiAgICB0aXRsZTogcHJEYXRhLnRpdGxlLFxuICAgIGNvbW1pdENvdW50OiBwckRhdGEuY29tbWl0cy50b3RhbENvdW50LFxuICB9O1xufVxuXG4vKiBHcmFwaHFsIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgdGhlIHJlcXVlc3RlZCBwdWxsIHJlcXVlc3QuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgaXNEcmFmdDogZ3JhcGhxbFR5cGVzLmJvb2xlYW4sXG4gIHN0YXRlOiBncmFwaHFsVHlwZXMub25lT2YoWydPUEVOJywgJ01FUkdFRCcsICdDTE9TRUQnXSBhcyBjb25zdCksXG4gIG51bWJlcjogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgLy8gT25seSB0aGUgbGFzdCAxMDAgY29tbWl0cyBmcm9tIGEgcHVsbCByZXF1ZXN0IGFyZSBvYnRhaW5lZCBhcyB3ZSBsaWtlbHkgd2lsbCBuZXZlciBzZWUgYSBwdWxsXG4gIC8vIHJlcXVlc3RzIHdpdGggbW9yZSB0aGFuIDEwMCBjb21taXRzLlxuICBjb21taXRzOiBwYXJhbXMoe2xhc3Q6IDEwMH0sIHtcbiAgICB0b3RhbENvdW50OiBncmFwaHFsVHlwZXMubnVtYmVyLFxuICAgIG5vZGVzOiBbe1xuICAgICAgY29tbWl0OiB7XG4gICAgICAgIHN0YXR1czoge1xuICAgICAgICAgIHN0YXRlOiBncmFwaHFsVHlwZXMub25lT2YoWydGQUlMVVJFJywgJ1BFTkRJTkcnLCAnU1VDQ0VTUyddIGFzIGNvbnN0KSxcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIH0sXG4gICAgfV0sXG4gIH0pLFxuICBiYXNlUmVmTmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgdGl0bGU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIGxhYmVsczogcGFyYW1zKHtmaXJzdDogMTAwfSwge1xuICAgIG5vZGVzOiBbe1xuICAgICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9XVxuICB9KSxcbn07XG5cbi8qKiBBIHB1bGwgcmVxdWVzdCByZXRyaWV2ZWQgZnJvbSBnaXRodWIgdmlhIHRoZSBncmFwaHFsIEFQSS4gKi9cbnR5cGUgUmF3UHVsbFJlcXVlc3QgPSB0eXBlb2YgUFJfU0NIRU1BO1xuXG5cbi8qKiBGZXRjaGVzIGEgcHVsbCByZXF1ZXN0IGZyb20gR2l0aHViLiBSZXR1cm5zIG51bGwgaWYgYW4gZXJyb3Igb2NjdXJyZWQuICovXG5hc3luYyBmdW5jdGlvbiBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihcbiAgICBnaXQ6IEdpdENsaWVudDx0cnVlPiwgcHJOdW1iZXI6IG51bWJlcik6IFByb21pc2U8UmF3UHVsbFJlcXVlc3R8bnVsbD4ge1xuICB0cnkge1xuICAgIGNvbnN0IHggPSBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xuICAgIHJldHVybiB4O1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQsIHdlIHdhbnQgdG8gcmV0dXJuIGBudWxsYCBzb1xuICAgIC8vIHRoYXQgdGhlIGVycm9yIGNhbiBiZSBoYW5kbGVkIGdyYWNlZnVsbHkuXG4gICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgcmVzb2x2ZXMgdG8gYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQdWxsUmVxdWVzdCh2OiBQdWxsUmVxdWVzdEZhaWx1cmV8UHVsbFJlcXVlc3QpOiB2IGlzIFB1bGxSZXF1ZXN0IHtcbiAgcmV0dXJuICh2IGFzIFB1bGxSZXF1ZXN0KS50YXJnZXRCcmFuY2hlcyAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgY29tbWl0cyBwcm92aWRlZCBhcmUgYWxsb3dlZCB0byBtZXJnZSB0byB0aGUgcHJvdmlkZWQgdGFyZ2V0IGxhYmVsLCB0aHJvd2luZyBhXG4gKiBQdWxsUmVxdWVzdEZhaWx1cmUgb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBhc3NlcnRDaGFuZ2VzQWxsb3dGb3JUYXJnZXRMYWJlbChcbiAgICBjb21taXRzOiBDb21taXRbXSwgbGFiZWw6IFRhcmdldExhYmVsLCBjb25maWc6IE1lcmdlQ29uZmlnKSB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNvbW1pdCBzY29wZXMgd2hpY2ggYXJlIGV4ZW1wdGVkIGZyb20gdGFyZ2V0IGxhYmVsIGNvbnRlbnQgcmVxdWlyZW1lbnRzLiBpLmUuIG5vIGBmZWF0YFxuICAgKiBzY29wZXMgaW4gcGF0Y2ggYnJhbmNoZXMsIG5vIGJyZWFraW5nIGNoYW5nZXMgaW4gbWlub3Igb3IgcGF0Y2ggY2hhbmdlcy5cbiAgICovXG4gIGNvbnN0IGV4ZW1wdGVkU2NvcGVzID0gY29uZmlnLnRhcmdldExhYmVsRXhlbXB0U2NvcGVzIHx8IFtdO1xuICAvKiogTGlzdCBvZiBjb21taXRzIHdoaWNoIGFyZSBzdWJqZWN0IHRvIGNvbnRlbnQgcmVxdWlyZW1lbnRzIGZvciB0aGUgdGFyZ2V0IGxhYmVsLiAqL1xuICBjb21taXRzID0gY29tbWl0cy5maWx0ZXIoY29tbWl0ID0+ICFleGVtcHRlZFNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKTtcbiAgc3dpdGNoIChsYWJlbC5wYXR0ZXJuKSB7XG4gICAgY2FzZSAndGFyZ2V0OiBtYWpvcic6XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YXJnZXQ6IG1pbm9yJzpcbiAgICAgIC8vIENoZWNrIGlmIGFueSBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QgY29udGFpbnMgYSBicmVha2luZyBjaGFuZ2UuXG4gICAgICBpZiAoY29tbWl0cy5zb21lKGNvbW1pdCA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCkpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0JyZWFraW5nQ2hhbmdlcyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YXJnZXQ6IHBhdGNoJzpcbiAgICBjYXNlICd0YXJnZXQ6IGx0cyc6XG4gICAgICAvLyBDaGVjayBpZiBhbnkgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0IGNvbnRhaW5zIGEgYnJlYWtpbmcgY2hhbmdlLlxuICAgICAgaWYgKGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDApKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgLy8gQ2hlY2sgaWYgYW55IGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdCBjb250YWlucyBhIGNvbW1pdCB0eXBlIG9mIFwiZmVhdFwiLlxuICAgICAgaWYgKGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LnR5cGUgPT09ICdmZWF0JykpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0ZlYXR1cmVDb21taXRzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB3YXJuKHJlZCgnV0FSTklORzogVW5hYmxlIHRvIGNvbmZpcm0gYWxsIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdCBhcmUgZWxpZ2libGUgdG8gYmUnKSk7XG4gICAgICB3YXJuKHJlZChgbWVyZ2VkIGludG8gdGhlIHRhcmdldCBicmFuY2g6ICR7bGFiZWwucGF0dGVybn1gKSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgcHVsbCByZXF1ZXN0IGhhcyB0aGUgcHJvcGVyIGxhYmVsIGZvciBicmVha2luZyBjaGFuZ2VzIGlmIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2VcbiAqIGNvbW1pdHMsIGFuZCBvbmx5IGhhcyB0aGUgbGFiZWwgaWYgdGhlcmUgYXJlIGJyZWFraW5nIGNoYW5nZSBjb21taXRzLlxuICovXG5mdW5jdGlvbiBhc3NlcnRDb3JyZWN0QnJlYWtpbmdDaGFuZ2VMYWJlbGluZyhcbiAgICBjb21taXRzOiBDb21taXRbXSwgbGFiZWxzOiBzdHJpbmdbXSwgY29uZmlnOiBNZXJnZUNvbmZpZykge1xuICAvKiogV2hldGhlciB0aGUgUFIgaGFzIGEgbGFiZWwgbm90aW5nIGEgYnJlYWtpbmcgY2hhbmdlLiAqL1xuICBjb25zdCBoYXNMYWJlbCA9IGxhYmVscy5pbmNsdWRlcyhjb25maWcuYnJlYWtpbmdDaGFuZ2VMYWJlbCB8fCBCcmVha2luZ0NoYW5nZUxhYmVsKTtcbiAgLy8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYXQgbGVhc3Qgb25lIGNvbW1pdCB3aGljaCBub3RlcyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbiAgY29uc3QgaGFzQ29tbWl0ID0gY29tbWl0cy5zb21lKGNvbW1pdCA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCk7XG5cbiAgaWYgKCFoYXNMYWJlbCAmJiBoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlTGFiZWwoKTtcbiAgfVxuXG4gIGlmIChoYXNMYWJlbCAmJiAhaGFzQ29tbWl0KSB7XG4gICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLm1pc3NpbmdCcmVha2luZ0NoYW5nZUNvbW1pdCgpO1xuICB9XG59XG5cblxuLyoqIEFzc2VydCB0aGUgcHVsbCByZXF1ZXN0IGlzIHBlbmRpbmcsIG5vdCBjbG9zZWQsIG1lcmdlZCBvciBpbiBkcmFmdC4gKi9cbmZ1bmN0aW9uIGFzc2VydFBlbmRpbmdTdGF0ZShwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgaWYgKHByLmlzRHJhZnQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNEcmFmdCgpO1xuICB9XG4gIHN3aXRjaCAocHIuc3RhdGUpIHtcbiAgICBjYXNlICdDTE9TRUQnOlxuICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzQ2xvc2VkKCk7XG4gICAgY2FzZSAnTUVSR0VEJzpcbiAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc01lcmdlZCgpO1xuICB9XG59XG4iXX0=