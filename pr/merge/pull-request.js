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
    /**
     * Loads and validates the specified pull request against the given configuration.
     * If the pull requests fails, a pull request failure is returned.
     */
    function loadAndValidatePullRequest(_a, prNumber, ignoreNonFatalFailures) {
        var git = _a.git, config = _a.config;
        if (ignoreNonFatalFailures === void 0) { ignoreNonFatalFailures = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var prData, labels, targetLabel, commitMessages, state, githubTargetBranch, requiredBaseSha, needsCommitMessageFixup, hasCaretakerNote, targetBranches, error_1;
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
                        try {
                            commitMessages = prData.commits.nodes.map(function (n) { return n.commit.message; });
                            assertChangesAllowForTargetLabel(commitMessages, targetLabel, config);
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
    /* GraphQL schema for the response body the requested pull request. */
    var PR_SCHEMA = {
        url: typed_graphqlify_1.types.string,
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
    function assertChangesAllowForTargetLabel(rawCommits, label, config) {
        /**
         * List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
         * scopes in patch branches, no breaking changes in minor or patch changes.
         */
        var exemptedScopes = config.targetLabelExemptScopes || [];
        /** List of parsed commits which are subject to content requirements for the target label. */
        var commits = rawCommits.map(parse_1.parseCommitMessage).filter(function (commit) {
            return !exemptedScopes.includes(commit.scope);
        });
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgscURBQStEO0lBQy9ELHlFQUE4RDtJQUM5RCxvRUFBOEM7SUFHOUMsa0VBQXlDO0lBR3pDLHlFQUE4QztJQUM5QyxxRkFBZ0Q7SUFDaEQsaUZBQTRJO0lBMkI1STs7O09BR0c7SUFDSCxTQUFzQiwwQkFBMEIsQ0FDNUMsRUFBbUMsRUFBRSxRQUFnQixFQUNyRCxzQkFBOEI7WUFEN0IsR0FBRyxTQUFBLEVBQUUsTUFBTSxZQUFBO1FBQ1osdUNBQUEsRUFBQSw4QkFBOEI7Ozs7OzRCQUNqQixxQkFBTSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUE7O3dCQUF4RCxNQUFNLEdBQUcsU0FBK0M7d0JBRTlELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTs0QkFDbkIsc0JBQU8sNkJBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUM7eUJBQ3RDO3dCQUVLLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO3dCQUVwRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxFQUFFOzRCQUN0RSxzQkFBTyw2QkFBa0IsQ0FBQyxhQUFhLEVBQUUsRUFBQzt5QkFDM0M7d0JBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSwrQkFBYyxDQUFDLElBQUksRUFBRSxNQUFN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N0UsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQXRCLENBQXNCLENBQUMsRUFBRTtvQkFDbEQsTUFBTSw2QkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDbkQ7Z0JBQ0QsTUFBTTtZQUNSO2dCQUNFLGNBQUksQ0FBQyxhQUFHLENBQUMsK0VBQStFLENBQUMsQ0FBQyxDQUFDO2dCQUMzRixjQUFJLENBQUMsYUFBRyxDQUFDLG9DQUFrQyxLQUFLLENBQUMsT0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDN0QsTUFBTTtTQUNUO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3BhcmFtcywgdHlwZXMgYXMgZ3JhcGhRTFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcbmltcG9ydCB7cGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge3JlZCwgd2Fybn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcbmltcG9ydCB7TWVyZ2VDb25maWcsIFRhcmdldExhYmVsfSBmcm9tICcuL2NvbmZpZyc7XG5cbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuaW1wb3J0IHtnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCwgZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QsIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciwgSW52YWxpZFRhcmdldExhYmVsRXJyb3J9IGZyb20gJy4vdGFyZ2V0LWxhYmVsJztcbmltcG9ydCB7UHVsbFJlcXVlc3RNZXJnZVRhc2t9IGZyb20gJy4vdGFzayc7XG5cbi8qKiBJbnRlcmZhY2UgdGhhdCBkZXNjcmliZXMgYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVSTCB0byB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwck51bWJlcjogbnVtYmVyO1xuICAvKiogVGl0bGUgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgdGl0bGU6IHN0cmluZztcbiAgLyoqIExhYmVscyBhcHBsaWVkIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGxhYmVsczogc3RyaW5nW107XG4gIC8qKiBMaXN0IG9mIGJyYW5jaGVzIHRoaXMgUFIgc2hvdWxkIGJlIG1lcmdlZCBpbnRvLiAqL1xuICB0YXJnZXRCcmFuY2hlczogc3RyaW5nW107XG4gIC8qKiBCcmFuY2ggdGhhdCB0aGUgUFIgdGFyZ2V0cyBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZztcbiAgLyoqIENvdW50IG9mIGNvbW1pdHMgaW4gdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGNvbW1pdENvdW50OiBudW1iZXI7XG4gIC8qKiBPcHRpb25hbCBTSEEgdGhhdCB0aGlzIHB1bGwgcmVxdWVzdCBuZWVkcyB0byBiZSBiYXNlZCBvbi4gKi9cbiAgcmVxdWlyZWRCYXNlU2hhPzogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGNvbW1pdCBtZXNzYWdlIGZpeHVwLiAqL1xuICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYSBjYXJldGFrZXIgbm90ZS4gKi9cbiAgaGFzQ2FyZXRha2VyTm90ZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBMb2FkcyBhbmQgdmFsaWRhdGVzIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGFnYWluc3QgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXG4gKiBJZiB0aGUgcHVsbCByZXF1ZXN0cyBmYWlscywgYSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBpcyByZXR1cm5lZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0KFxuICAgIHtnaXQsIGNvbmZpZ306IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrLCBwck51bWJlcjogbnVtYmVyLFxuICAgIGlnbm9yZU5vbkZhdGFsRmFpbHVyZXMgPSBmYWxzZSk6IFByb21pc2U8UHVsbFJlcXVlc3R8UHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gIGNvbnN0IHByRGF0YSA9IGF3YWl0IGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKGdpdCwgcHJOdW1iZXIpO1xuXG4gIGlmIChwckRhdGEgPT09IG51bGwpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdEZvdW5kKCk7XG4gIH1cblxuICBjb25zdCBsYWJlbHMgPSBwckRhdGEubGFiZWxzLm5vZGVzLm1hcChsID0+IGwubmFtZSk7XG5cbiAgaWYgKCFsYWJlbHMuc29tZShuYW1lID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5tZXJnZVJlYWR5TGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubm90TWVyZ2VSZWFkeSgpO1xuICB9XG4gIGlmICghbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2xhU2lnbmVkTGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuY2xhVW5zaWduZWQoKTtcbiAgfVxuXG4gIGxldCB0YXJnZXRMYWJlbDogVGFyZ2V0TGFiZWw7XG4gIHRyeSB7XG4gICAgdGFyZ2V0TGFiZWwgPSBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdChjb25maWcsIGxhYmVscyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RGYWlsdXJlKGVycm9yLmZhaWx1cmVNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICB0cnkge1xuICAgIC8qKiBDb21taXQgbWVzc2FnZSBzdHJpbmdzIGZvciBhbGwgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2VzID0gcHJEYXRhLmNvbW1pdHMubm9kZXMubWFwKG4gPT4gbi5jb21taXQubWVzc2FnZSk7XG4gICAgYXNzZXJ0Q2hhbmdlc0FsbG93Rm9yVGFyZ2V0TGFiZWwoY29tbWl0TWVzc2FnZXMsIHRhcmdldExhYmVsLCBjb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIC8qKiBUaGUgY29tYmluZWQgc3RhdHVzIG9mIHRoZSBsYXRlc3QgY29tbWl0IGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGNvbnN0IHN0YXRlID0gcHJEYXRhLmNvbW1pdHMubm9kZXMuc2xpY2UoLTEpWzBdLmNvbW1pdC5zdGF0dXMuc3RhdGU7XG4gIGlmIChzdGF0ZSA9PT0gJ0ZBSUxVUkUnICYmICFpZ25vcmVOb25GYXRhbEZhaWx1cmVzKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5mYWlsaW5nQ2lKb2JzKCk7XG4gIH1cbiAgaWYgKHN0YXRlID09PSAnUEVORElORycgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnBlbmRpbmdDaUpvYnMoKTtcbiAgfVxuXG4gIGNvbnN0IGdpdGh1YlRhcmdldEJyYW5jaCA9IHByRGF0YS5iYXNlUmVmTmFtZTtcbiAgY29uc3QgcmVxdWlyZWRCYXNlU2hhID1cbiAgICAgIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzICYmIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzW2dpdGh1YlRhcmdldEJyYW5jaF07XG4gIGNvbnN0IG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwID0gISFjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwgJiZcbiAgICAgIGxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsKSk7XG4gIGNvbnN0IGhhc0NhcmV0YWtlck5vdGUgPSAhIWNvbmZpZy5jYXJldGFrZXJOb3RlTGFiZWwgJiZcbiAgICAgIGxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCEpKTtcbiAgbGV0IHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXTtcblxuICAvLyBJZiBicmFuY2hlcyBhcmUgZGV0ZXJtaW5lZCBmb3IgYSBnaXZlbiB0YXJnZXQgbGFiZWwsIGNhcHR1cmUgZXJyb3JzIHRoYXQgYXJlXG4gIC8vIHRocm93biBhcyBwYXJ0IG9mIGJyYW5jaCBjb21wdXRhdGlvbi4gVGhpcyBpcyBleHBlY3RlZCBiZWNhdXNlIGEgbWVyZ2UgY29uZmlndXJhdGlvblxuICAvLyBjYW4gbGF6aWx5IGNvbXB1dGUgYnJhbmNoZXMgZm9yIGEgdGFyZ2V0IGxhYmVsIGFuZCB0aHJvdy4gZS5nLiBpZiBhbiBpbnZhbGlkIHRhcmdldFxuICAvLyBsYWJlbCBpcyBhcHBsaWVkLCB3ZSB3YW50IHRvIGV4aXQgdGhlIHNjcmlwdCBncmFjZWZ1bGx5IHdpdGggYW4gZXJyb3IgbWVzc2FnZS5cbiAgdHJ5IHtcbiAgICB0YXJnZXRCcmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsKHRhcmdldExhYmVsLCBnaXRodWJUYXJnZXRCcmFuY2gpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciB8fCBlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0RmFpbHVyZShlcnJvci5mYWlsdXJlTWVzc2FnZSk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB1cmw6IHByRGF0YS51cmwsXG4gICAgcHJOdW1iZXIsXG4gICAgbGFiZWxzLFxuICAgIHJlcXVpcmVkQmFzZVNoYSxcbiAgICBnaXRodWJUYXJnZXRCcmFuY2gsXG4gICAgbmVlZHNDb21taXRNZXNzYWdlRml4dXAsXG4gICAgaGFzQ2FyZXRha2VyTm90ZSxcbiAgICB0YXJnZXRCcmFuY2hlcyxcbiAgICB0aXRsZTogcHJEYXRhLnRpdGxlLFxuICAgIGNvbW1pdENvdW50OiBwckRhdGEuY29tbWl0cy50b3RhbENvdW50LFxuICB9O1xufVxuXG4vKiBHcmFwaFFMIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgdGhlIHJlcXVlc3RlZCBwdWxsIHJlcXVlc3QuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgbnVtYmVyOiBncmFwaFFMVHlwZXMubnVtYmVyLFxuICAvLyBPbmx5IHRoZSBsYXN0IDEwMCBjb21taXRzIGZyb20gYSBwdWxsIHJlcXVlc3QgYXJlIG9idGFpbmVkIGFzIHdlIGxpa2VseSB3aWxsIG5ldmVyIHNlZSBhIHB1bGxcbiAgLy8gcmVxdWVzdHMgd2l0aCBtb3JlIHRoYW4gMTAwIGNvbW1pdHMuXG4gIGNvbW1pdHM6IHBhcmFtcyh7bGFzdDogMTAwfSwge1xuICAgIHRvdGFsQ291bnQ6IGdyYXBoUUxUeXBlcy5udW1iZXIsXG4gICAgbm9kZXM6IFt7XG4gICAgICBjb21taXQ6IHtcbiAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgc3RhdGU6IGdyYXBoUUxUeXBlcy5vbmVPZihbJ0ZBSUxVUkUnLCAnUEVORElORycsICdTVUNDRVNTJ10gYXMgY29uc3QpLFxuICAgICAgICB9LFxuICAgICAgICBtZXNzYWdlOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgfSxcbiAgICB9XSxcbiAgfSksXG4gIGJhc2VSZWZOYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgbGFiZWxzOiBwYXJhbXMoe2ZpcnN0OiAxMDB9LCB7XG4gICAgbm9kZXM6IFt7XG4gICAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIH1dXG4gIH0pLFxufTtcblxuXG5cbi8qKiBGZXRjaGVzIGEgcHVsbCByZXF1ZXN0IGZyb20gR2l0aHViLiBSZXR1cm5zIG51bGwgaWYgYW4gZXJyb3Igb2NjdXJyZWQuICovXG5hc3luYyBmdW5jdGlvbiBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihcbiAgICBnaXQ6IEdpdENsaWVudCwgcHJOdW1iZXI6IG51bWJlcik6IFByb21pc2U8dHlwZW9mIFBSX1NDSEVNQXxudWxsPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgeCA9IGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGdpdCk7XG4gICAgcmV0dXJuIHg7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGNvdWxkIG5vdCBiZSBmb3VuZCwgd2Ugd2FudCB0byByZXR1cm4gYG51bGxgIHNvXG4gICAgLy8gdGhhdCB0aGUgZXJyb3IgY2FuIGJlIGhhbmRsZWQgZ3JhY2VmdWxseS5cbiAgICBpZiAoZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqIFdoZXRoZXIgdGhlIHNwZWNpZmllZCB2YWx1ZSByZXNvbHZlcyB0byBhIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1B1bGxSZXF1ZXN0KHY6IFB1bGxSZXF1ZXN0RmFpbHVyZXxQdWxsUmVxdWVzdCk6IHYgaXMgUHVsbFJlcXVlc3Qge1xuICByZXR1cm4gKHYgYXMgUHVsbFJlcXVlc3QpLnRhcmdldEJyYW5jaGVzICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBjb21taXRzIHByb3ZpZGVkIGFyZSBhbGxvd2VkIHRvIG1lcmdlIHRvIHRoZSBwcm92aWRlZCB0YXJnZXQgbGFiZWwsIHRocm93aW5nIGFcbiAqIFB1bGxSZXF1ZXN0RmFpbHVyZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydENoYW5nZXNBbGxvd0ZvclRhcmdldExhYmVsKFxuICAgIHJhd0NvbW1pdHM6IHN0cmluZ1tdLCBsYWJlbDogVGFyZ2V0TGFiZWwsIGNvbmZpZzogTWVyZ2VDb25maWcpIHtcbiAgLyoqXG4gICAqIExpc3Qgb2YgY29tbWl0IHNjb3BlcyB3aGljaCBhcmUgZXhlbXB0ZWQgZnJvbSB0YXJnZXQgbGFiZWwgY29udGVudCByZXF1aXJlbWVudHMuIGkuZS4gbm8gYGZlYXRgXG4gICAqIHNjb3BlcyBpbiBwYXRjaCBicmFuY2hlcywgbm8gYnJlYWtpbmcgY2hhbmdlcyBpbiBtaW5vciBvciBwYXRjaCBjaGFuZ2VzLlxuICAgKi9cbiAgY29uc3QgZXhlbXB0ZWRTY29wZXMgPSBjb25maWcudGFyZ2V0TGFiZWxFeGVtcHRTY29wZXMgfHwgW107XG4gIC8qKiBMaXN0IG9mIHBhcnNlZCBjb21taXRzIHdoaWNoIGFyZSBzdWJqZWN0IHRvIGNvbnRlbnQgcmVxdWlyZW1lbnRzIGZvciB0aGUgdGFyZ2V0IGxhYmVsLiAqL1xuICBsZXQgY29tbWl0cyA9IHJhd0NvbW1pdHMubWFwKHBhcnNlQ29tbWl0TWVzc2FnZSkuZmlsdGVyKGNvbW1pdCA9PiB7XG4gICAgcmV0dXJuICFleGVtcHRlZFNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpO1xuICB9KTtcbiAgc3dpdGNoIChsYWJlbC5wYXR0ZXJuKSB7XG4gICAgY2FzZSAndGFyZ2V0OiBtYWpvcic6XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YXJnZXQ6IG1pbm9yJzpcbiAgICAgIC8vIENoZWNrIGlmIGFueSBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QgY29udGFpbnMgYSBicmVha2luZyBjaGFuZ2UuXG4gICAgICBpZiAoY29tbWl0cy5zb21lKGNvbW1pdCA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCkpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0JyZWFraW5nQ2hhbmdlcyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YXJnZXQ6IHBhdGNoJzpcbiAgICBjYXNlICd0YXJnZXQ6IGx0cyc6XG4gICAgICAvLyBDaGVjayBpZiBhbnkgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0IGNvbnRhaW5zIGEgYnJlYWtpbmcgY2hhbmdlLlxuICAgICAgaWYgKGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDApKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgLy8gQ2hlY2sgaWYgYW55IGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdCBjb250YWlucyBhIGNvbW1pdCB0eXBlIG9mIFwiZmVhdFwiLlxuICAgICAgaWYgKGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LnR5cGUgPT09ICdmZWF0JykpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0ZlYXR1cmVDb21taXRzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB3YXJuKHJlZCgnV0FSTklORzogVW5hYmxlIHRvIGNvbmZpcm0gYWxsIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdCBhcmUgZWxpZ2libGUgdG8gYmUnKSk7XG4gICAgICB3YXJuKHJlZChgbWVyZ2VkIGludG8gdGhlIHRhcmdldCBicmFuY2g6ICR7bGFiZWwucGF0dGVybn1gKSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuIl19