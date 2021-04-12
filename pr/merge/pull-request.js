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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgscURBQStEO0lBQy9ELHlFQUFzRTtJQUN0RSxvRUFBOEM7SUFHOUMsa0VBQXlDO0lBR3pDLHlFQUE4QztJQUM5QyxxRkFBZ0Q7SUFDaEQsaUZBQTRJO0lBRzVJLGlGQUFpRjtJQUNqRixJQUFNLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO0lBMEIvQzs7O09BR0c7SUFDSCxTQUFzQiwwQkFBMEIsQ0FDNUMsRUFBbUMsRUFBRSxRQUFnQixFQUNyRCxzQkFBOEI7WUFEN0IsR0FBRyxTQUFBLEVBQUUsTUFBTSxZQUFBO1FBQ1osdUNBQUEsRUFBQSw4QkFBOEI7Ozs7OzRCQUNqQixxQkFBTSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUE7O3dCQUF4RCxNQUFNLEdBQUcsU0FBK0M7d0JBRTlELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTs0QkFDbkIsc0JBQU8sNkJBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUM7eUJBQ3RDO3dCQUVLLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO3dCQUVwRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxFQUFFOzRCQUN0RSxzQkFBTyw2QkFBa0IsQ0FBQyxhQUFhLEVBQUUsRUFBQzt5QkFDM0M7d0JBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSwrQkFBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQTNDLENBQTJDLENBQUMsRUFBRTs0QkFDckUsc0JBQU8sNkJBQWtCLENBQUMsV0FBVyxFQUFFLEVBQUM7eUJBQ3pDO3dCQUdELElBQUk7NEJBQ0YsV0FBVyxHQUFHLDRDQUE2QixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzt5QkFDN0Q7d0JBQUMsT0FBTyxLQUFLLEVBQUU7NEJBQ2QsSUFBSSxLQUFLLFlBQVksc0NBQXVCLEVBQUU7Z0NBQzVDLHNCQUFPLElBQUksNkJBQWtCLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFDOzZCQUNyRDs0QkFDRCxNQUFNLEtBQUssQ0FBQzt5QkFDYjt3QkFHSyxXQUFXLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsMEJBQWtCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQyxDQUFDO3dCQUV4RixJQUFJOzRCQUNGLGdDQUFnQyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7NEJBQ25FLG1DQUFtQyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7eUJBQ2xFO3dCQUFDLE9BQU8sS0FBSyxFQUFFOzRCQUNkLHNCQUFPLEtBQUssRUFBQzt5QkFDZDt3QkFHSyxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7d0JBQ3BFLElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxDQUFDLHNCQUFzQixFQUFFOzRCQUNsRCxzQkFBTyw2QkFBa0IsQ0FBQyxhQUFhLEVBQUUsRUFBQzt5QkFDM0M7d0JBQ0QsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7NEJBQ2xELHNCQUFPLDZCQUFrQixDQUFDLGFBQWEsRUFBRSxFQUFDO3lCQUMzQzt3QkFFSyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO3dCQUN4QyxlQUFlLEdBQ2pCLE1BQU0sQ0FBQyxtQkFBbUIsSUFBSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsQ0FBQzt3QkFDM0UsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUI7NEJBQzVELE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSwrQkFBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsdUJBQXVCLENBQUMsRUFBcEQsQ0FBb0QsQ0FBQyxDQUFDO3dCQUN4RSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLGtCQUFrQjs0QkFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxrQkFBbUIsQ0FBQyxFQUFoRCxDQUFnRCxDQUFDLENBQUM7Ozs7d0JBUXZELHFCQUFNLHlDQUEwQixDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxFQUFBOzt3QkFBbEYsY0FBYyxHQUFHLFNBQWlFLENBQUM7Ozs7d0JBRW5GLElBQUksT0FBSyxZQUFZLHVDQUF3QixJQUFJLE9BQUssWUFBWSxzQ0FBdUIsRUFBRTs0QkFDekYsc0JBQU8sSUFBSSw2QkFBa0IsQ0FBQyxPQUFLLENBQUMsY0FBYyxDQUFDLEVBQUM7eUJBQ3JEO3dCQUNELE1BQU0sT0FBSyxDQUFDOzRCQUdkLHNCQUFPOzRCQUNMLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRzs0QkFDZixRQUFRLFVBQUE7NEJBQ1IsTUFBTSxRQUFBOzRCQUNOLGVBQWUsaUJBQUE7NEJBQ2Ysa0JBQWtCLG9CQUFBOzRCQUNsQix1QkFBdUIseUJBQUE7NEJBQ3ZCLGdCQUFnQixrQkFBQTs0QkFDaEIsY0FBYyxnQkFBQTs0QkFDZCxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7NEJBQ25CLFdBQVcsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVU7eUJBQ3ZDLEVBQUM7Ozs7S0FDSDtJQWpGRCxnRUFpRkM7SUFFRCxzRUFBc0U7SUFDdEUsSUFBTSxTQUFTLEdBQUc7UUFDaEIsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUN4QixNQUFNLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzNCLGdHQUFnRztRQUNoRyx1Q0FBdUM7UUFDdkMsT0FBTyxFQUFFLHlCQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFDLEVBQUU7WUFDM0IsVUFBVSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUMvQixLQUFLLEVBQUUsQ0FBQztvQkFDTixNQUFNLEVBQUU7d0JBQ04sTUFBTSxFQUFFOzRCQUNOLEtBQUssRUFBRSx3QkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFVLENBQUM7eUJBQ3RFO3dCQUNELE9BQU8sRUFBRSx3QkFBWSxDQUFDLE1BQU07cUJBQzdCO2lCQUNGLENBQUM7U0FDSCxDQUFDO1FBQ0YsV0FBVyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUNoQyxLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzFCLE1BQU0sRUFBRSx5QkFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBQyxFQUFFO1lBQzNCLEtBQUssRUFBRSxDQUFDO29CQUNOLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07aUJBQzFCLENBQUM7U0FDSCxDQUFDO0tBQ0gsQ0FBQztJQUlGLDZFQUE2RTtJQUM3RSxTQUFlLDBCQUEwQixDQUNyQyxHQUFjLEVBQUUsUUFBZ0I7Ozs7Ozs7d0JBRXRCLHFCQUFNLGNBQUssQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFBOzt3QkFBekMsQ0FBQyxHQUFHLFNBQXFDO3dCQUMvQyxzQkFBTyxDQUFDLEVBQUM7Ozt3QkFFVCxzRUFBc0U7d0JBQ3RFLDRDQUE0Qzt3QkFDNUMsSUFBSSxHQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTs0QkFDcEIsc0JBQU8sSUFBSSxFQUFDO3lCQUNiO3dCQUNELE1BQU0sR0FBQyxDQUFDOzs7OztLQUVYO0lBRUQsOERBQThEO0lBQzlELFNBQWdCLGFBQWEsQ0FBQyxDQUFpQztRQUM3RCxPQUFRLENBQWlCLENBQUMsY0FBYyxLQUFLLFNBQVMsQ0FBQztJQUN6RCxDQUFDO0lBRkQsc0NBRUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTLGdDQUFnQyxDQUNyQyxPQUFpQixFQUFFLEtBQWtCLEVBQUUsTUFBbUI7UUFDNUQ7OztXQUdHO1FBQ0gsSUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQztRQUM1RCxzRkFBc0Y7UUFDdEYsT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUF0QyxDQUFzQyxDQUFDLENBQUM7UUFDM0UsUUFBUSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ3JCLEtBQUssZUFBZTtnQkFDbEIsTUFBTTtZQUNSLEtBQUssZUFBZTtnQkFDbEIsdUVBQXVFO2dCQUN2RSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQW5DLENBQW1DLENBQUMsRUFBRTtvQkFDL0QsTUFBTSw2QkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDcEQ7Z0JBQ0QsTUFBTTtZQUNSLEtBQUssZUFBZSxDQUFDO1lBQ3JCLEtBQUssYUFBYTtnQkFDaEIsdUVBQXVFO2dCQUN2RSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQW5DLENBQW1DLENBQUMsRUFBRTtvQkFDL0QsTUFBTSw2QkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDcEQ7Z0JBQ0QsNkVBQTZFO2dCQUM3RSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBdEIsQ0FBc0IsQ0FBQyxFQUFFO29CQUNsRCxNQUFNLDZCQUFrQixDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNuRDtnQkFDRCxNQUFNO1lBQ1I7Z0JBQ0UsY0FBSSxDQUFDLGFBQUcsQ0FBQywrRUFBK0UsQ0FBQyxDQUFDLENBQUM7Z0JBQzNGLGNBQUksQ0FBQyxhQUFHLENBQUMsb0NBQWtDLEtBQUssQ0FBQyxPQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxNQUFNO1NBQ1Q7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxtQ0FBbUMsQ0FDeEMsT0FBaUIsRUFBRSxNQUFnQixFQUFFLE1BQW1CO1FBQzFELDJEQUEyRDtRQUMzRCxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3BGLDZFQUE2RTtRQUM3RSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLENBQUM7UUFFOUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLEVBQUU7WUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1NBQ3ZEO1FBRUQsSUFBSSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1NBQ3hEO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3BhcmFtcywgdHlwZXMgYXMgZ3JhcGhRTFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcbmltcG9ydCB7Q29tbWl0LCBwYXJzZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7cmVkLCB3YXJufSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuaW1wb3J0IHtNZXJnZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4vY29uZmlnJztcblxuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4vZmFpbHVyZXMnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi9zdHJpbmctcGF0dGVybic7XG5pbXBvcnQge2dldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsLCBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdCwgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yLCBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcn0gZnJvbSAnLi90YXJnZXQtbGFiZWwnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdE1lcmdlVGFza30gZnJvbSAnLi90YXNrJztcblxuLyoqIFRoZSBkZWZhdWx0IGxhYmVsIGZvciBsYWJlbGluZyBwdWxsIHJlcXVlc3RzIGNvbnRhaW5pbmcgYSBicmVha2luZyBjaGFuZ2UuICovXG5jb25zdCBCcmVha2luZ0NoYW5nZUxhYmVsID0gJ2JyZWFraW5nIGNoYW5nZXMnO1xuXG4vKiogSW50ZXJmYWNlIHRoYXQgZGVzY3JpYmVzIGEgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVUkwgdG8gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBOdW1iZXIgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJOdW1iZXI6IG51bWJlcjtcbiAgLyoqIFRpdGxlIG9mIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHRpdGxlOiBzdHJpbmc7XG4gIC8qKiBMYWJlbHMgYXBwbGllZCB0byB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBsYWJlbHM6IHN0cmluZ1tdO1xuICAvKiogTGlzdCBvZiBicmFuY2hlcyB0aGlzIFBSIHNob3VsZCBiZSBtZXJnZWQgaW50by4gKi9cbiAgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdO1xuICAvKiogQnJhbmNoIHRoYXQgdGhlIFBSIHRhcmdldHMgaW4gdGhlIEdpdGh1YiBVSS4gKi9cbiAgZ2l0aHViVGFyZ2V0QnJhbmNoOiBzdHJpbmc7XG4gIC8qKiBDb3VudCBvZiBjb21taXRzIGluIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBjb21taXRDb3VudDogbnVtYmVyO1xuICAvKiogT3B0aW9uYWwgU0hBIHRoYXQgdGhpcyBwdWxsIHJlcXVlc3QgbmVlZHMgdG8gYmUgYmFzZWQgb24uICovXG4gIHJlcXVpcmVkQmFzZVNoYT86IHN0cmluZztcbiAgLyoqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBjb21taXQgbWVzc2FnZSBmaXh1cC4gKi9cbiAgbmVlZHNDb21taXRNZXNzYWdlRml4dXA6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGEgY2FyZXRha2VyIG5vdGUuICovXG4gIGhhc0NhcmV0YWtlck5vdGU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogTG9hZHMgYW5kIHZhbGlkYXRlcyB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBhZ2FpbnN0IHRoZSBnaXZlbiBjb25maWd1cmF0aW9uLlxuICogSWYgdGhlIHB1bGwgcmVxdWVzdHMgZmFpbHMsIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUgaXMgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdChcbiAgICB7Z2l0LCBjb25maWd9OiBQdWxsUmVxdWVzdE1lcmdlVGFzaywgcHJOdW1iZXI6IG51bWJlcixcbiAgICBpZ25vcmVOb25GYXRhbEZhaWx1cmVzID0gZmFsc2UpOiBQcm9taXNlPFB1bGxSZXF1ZXN0fFB1bGxSZXF1ZXN0RmFpbHVyZT4ge1xuICBjb25zdCBwckRhdGEgPSBhd2FpdCBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihnaXQsIHByTnVtYmVyKTtcblxuICBpZiAocHJEYXRhID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5ub3RGb3VuZCgpO1xuICB9XG5cbiAgY29uc3QgbGFiZWxzID0gcHJEYXRhLmxhYmVscy5ub2Rlcy5tYXAobCA9PiBsLm5hbWUpO1xuXG4gIGlmICghbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcubWVyZ2VSZWFkeUxhYmVsKSkpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdE1lcmdlUmVhZHkoKTtcbiAgfVxuICBpZiAoIWxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNsYVNpZ25lZExhYmVsKSkpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmNsYVVuc2lnbmVkKCk7XG4gIH1cblxuICBsZXQgdGFyZ2V0TGFiZWw6IFRhcmdldExhYmVsO1xuICB0cnkge1xuICAgIHRhcmdldExhYmVsID0gZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QoY29uZmlnLCBsYWJlbHMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0RmFpbHVyZShlcnJvci5mYWlsdXJlTWVzc2FnZSk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgLyoqIExpc3Qgb2YgcGFyc2VkIGNvbW1pdHMgZm9yIGFsbCBvZiB0aGUgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBjb25zdCBjb21taXRzSW5QciA9IHByRGF0YS5jb21taXRzLm5vZGVzLm1hcChuID0+IHBhcnNlQ29tbWl0TWVzc2FnZShuLmNvbW1pdC5tZXNzYWdlKSk7XG5cbiAgdHJ5IHtcbiAgICBhc3NlcnRDaGFuZ2VzQWxsb3dGb3JUYXJnZXRMYWJlbChjb21taXRzSW5QciwgdGFyZ2V0TGFiZWwsIGNvbmZpZyk7XG4gICAgYXNzZXJ0Q29ycmVjdEJyZWFraW5nQ2hhbmdlTGFiZWxpbmcoY29tbWl0c0luUHIsIGxhYmVscywgY29uZmlnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cblxuICAvKiogVGhlIGNvbWJpbmVkIHN0YXR1cyBvZiB0aGUgbGF0ZXN0IGNvbW1pdCBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBjb25zdCBzdGF0ZSA9IHByRGF0YS5jb21taXRzLm5vZGVzLnNsaWNlKC0xKVswXS5jb21taXQuc3RhdHVzLnN0YXRlO1xuICBpZiAoc3RhdGUgPT09ICdGQUlMVVJFJyAmJiAhaWdub3JlTm9uRmF0YWxGYWlsdXJlcykge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuZmFpbGluZ0NpSm9icygpO1xuICB9XG4gIGlmIChzdGF0ZSA9PT0gJ1BFTkRJTkcnICYmICFpZ25vcmVOb25GYXRhbEZhaWx1cmVzKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5wZW5kaW5nQ2lKb2JzKCk7XG4gIH1cblxuICBjb25zdCBnaXRodWJUYXJnZXRCcmFuY2ggPSBwckRhdGEuYmFzZVJlZk5hbWU7XG4gIGNvbnN0IHJlcXVpcmVkQmFzZVNoYSA9XG4gICAgICBjb25maWcucmVxdWlyZWRCYXNlQ29tbWl0cyAmJiBjb25maWcucmVxdWlyZWRCYXNlQ29tbWl0c1tnaXRodWJUYXJnZXRCcmFuY2hdO1xuICBjb25zdCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCA9ICEhY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsICYmXG4gICAgICBsYWJlbHMuc29tZShuYW1lID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5jb21taXRNZXNzYWdlRml4dXBMYWJlbCkpO1xuICBjb25zdCBoYXNDYXJldGFrZXJOb3RlID0gISFjb25maWcuY2FyZXRha2VyTm90ZUxhYmVsICYmXG4gICAgICBsYWJlbHMuc29tZShuYW1lID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5jYXJldGFrZXJOb3RlTGFiZWwhKSk7XG4gIGxldCB0YXJnZXRCcmFuY2hlczogc3RyaW5nW107XG5cbiAgLy8gSWYgYnJhbmNoZXMgYXJlIGRldGVybWluZWQgZm9yIGEgZ2l2ZW4gdGFyZ2V0IGxhYmVsLCBjYXB0dXJlIGVycm9ycyB0aGF0IGFyZVxuICAvLyB0aHJvd24gYXMgcGFydCBvZiBicmFuY2ggY29tcHV0YXRpb24uIFRoaXMgaXMgZXhwZWN0ZWQgYmVjYXVzZSBhIG1lcmdlIGNvbmZpZ3VyYXRpb25cbiAgLy8gY2FuIGxhemlseSBjb21wdXRlIGJyYW5jaGVzIGZvciBhIHRhcmdldCBsYWJlbCBhbmQgdGhyb3cuIGUuZy4gaWYgYW4gaW52YWxpZCB0YXJnZXRcbiAgLy8gbGFiZWwgaXMgYXBwbGllZCwgd2Ugd2FudCB0byBleGl0IHRoZSBzY3JpcHQgZ3JhY2VmdWxseSB3aXRoIGFuIGVycm9yIG1lc3NhZ2UuXG4gIHRyeSB7XG4gICAgdGFyZ2V0QnJhbmNoZXMgPSBhd2FpdCBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCh0YXJnZXRMYWJlbCwgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IgfHwgZXJyb3IgaW5zdGFuY2VvZiBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcikge1xuICAgICAgcmV0dXJuIG5ldyBQdWxsUmVxdWVzdEZhaWx1cmUoZXJyb3IuZmFpbHVyZU1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdXJsOiBwckRhdGEudXJsLFxuICAgIHByTnVtYmVyLFxuICAgIGxhYmVscyxcbiAgICByZXF1aXJlZEJhc2VTaGEsXG4gICAgZ2l0aHViVGFyZ2V0QnJhbmNoLFxuICAgIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwLFxuICAgIGhhc0NhcmV0YWtlck5vdGUsXG4gICAgdGFyZ2V0QnJhbmNoZXMsXG4gICAgdGl0bGU6IHByRGF0YS50aXRsZSxcbiAgICBjb21taXRDb3VudDogcHJEYXRhLmNvbW1pdHMudG90YWxDb3VudCxcbiAgfTtcbn1cblxuLyogR3JhcGhRTCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IHRoZSByZXF1ZXN0ZWQgcHVsbCByZXF1ZXN0LiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICB1cmw6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIG51bWJlcjogZ3JhcGhRTFR5cGVzLm51bWJlcixcbiAgLy8gT25seSB0aGUgbGFzdCAxMDAgY29tbWl0cyBmcm9tIGEgcHVsbCByZXF1ZXN0IGFyZSBvYnRhaW5lZCBhcyB3ZSBsaWtlbHkgd2lsbCBuZXZlciBzZWUgYSBwdWxsXG4gIC8vIHJlcXVlc3RzIHdpdGggbW9yZSB0aGFuIDEwMCBjb21taXRzLlxuICBjb21taXRzOiBwYXJhbXMoe2xhc3Q6IDEwMH0sIHtcbiAgICB0b3RhbENvdW50OiBncmFwaFFMVHlwZXMubnVtYmVyLFxuICAgIG5vZGVzOiBbe1xuICAgICAgY29tbWl0OiB7XG4gICAgICAgIHN0YXR1czoge1xuICAgICAgICAgIHN0YXRlOiBncmFwaFFMVHlwZXMub25lT2YoWydGQUlMVVJFJywgJ1BFTkRJTkcnLCAnU1VDQ0VTUyddIGFzIGNvbnN0KSxcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIH0sXG4gICAgfV0sXG4gIH0pLFxuICBiYXNlUmVmTmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgdGl0bGU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIGxhYmVsczogcGFyYW1zKHtmaXJzdDogMTAwfSwge1xuICAgIG5vZGVzOiBbe1xuICAgICAgbmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9XVxuICB9KSxcbn07XG5cblxuXG4vKiogRmV0Y2hlcyBhIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gUmV0dXJucyBudWxsIGlmIGFuIGVycm9yIG9jY3VycmVkLiAqL1xuYXN5bmMgZnVuY3Rpb24gZmV0Y2hQdWxsUmVxdWVzdEZyb21HaXRodWIoXG4gICAgZ2l0OiBHaXRDbGllbnQsIHByTnVtYmVyOiBudW1iZXIpOiBQcm9taXNlPHR5cGVvZiBQUl9TQ0hFTUF8bnVsbD4ge1xuICB0cnkge1xuICAgIGNvbnN0IHggPSBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xuICAgIHJldHVybiB4O1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQsIHdlIHdhbnQgdG8gcmV0dXJuIGBudWxsYCBzb1xuICAgIC8vIHRoYXQgdGhlIGVycm9yIGNhbiBiZSBoYW5kbGVkIGdyYWNlZnVsbHkuXG4gICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgcmVzb2x2ZXMgdG8gYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQdWxsUmVxdWVzdCh2OiBQdWxsUmVxdWVzdEZhaWx1cmV8UHVsbFJlcXVlc3QpOiB2IGlzIFB1bGxSZXF1ZXN0IHtcbiAgcmV0dXJuICh2IGFzIFB1bGxSZXF1ZXN0KS50YXJnZXRCcmFuY2hlcyAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgY29tbWl0cyBwcm92aWRlZCBhcmUgYWxsb3dlZCB0byBtZXJnZSB0byB0aGUgcHJvdmlkZWQgdGFyZ2V0IGxhYmVsLCB0aHJvd2luZyBhXG4gKiBQdWxsUmVxdWVzdEZhaWx1cmUgb3RoZXJ3aXNlLlxuICovXG5mdW5jdGlvbiBhc3NlcnRDaGFuZ2VzQWxsb3dGb3JUYXJnZXRMYWJlbChcbiAgICBjb21taXRzOiBDb21taXRbXSwgbGFiZWw6IFRhcmdldExhYmVsLCBjb25maWc6IE1lcmdlQ29uZmlnKSB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNvbW1pdCBzY29wZXMgd2hpY2ggYXJlIGV4ZW1wdGVkIGZyb20gdGFyZ2V0IGxhYmVsIGNvbnRlbnQgcmVxdWlyZW1lbnRzLiBpLmUuIG5vIGBmZWF0YFxuICAgKiBzY29wZXMgaW4gcGF0Y2ggYnJhbmNoZXMsIG5vIGJyZWFraW5nIGNoYW5nZXMgaW4gbWlub3Igb3IgcGF0Y2ggY2hhbmdlcy5cbiAgICovXG4gIGNvbnN0IGV4ZW1wdGVkU2NvcGVzID0gY29uZmlnLnRhcmdldExhYmVsRXhlbXB0U2NvcGVzIHx8IFtdO1xuICAvKiogTGlzdCBvZiBjb21taXRzIHdoaWNoIGFyZSBzdWJqZWN0IHRvIGNvbnRlbnQgcmVxdWlyZW1lbnRzIGZvciB0aGUgdGFyZ2V0IGxhYmVsLiAqL1xuICBjb21taXRzID0gY29tbWl0cy5maWx0ZXIoY29tbWl0ID0+ICFleGVtcHRlZFNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKTtcbiAgc3dpdGNoIChsYWJlbC5wYXR0ZXJuKSB7XG4gICAgY2FzZSAndGFyZ2V0OiBtYWpvcic6XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YXJnZXQ6IG1pbm9yJzpcbiAgICAgIC8vIENoZWNrIGlmIGFueSBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QgY29udGFpbnMgYSBicmVha2luZyBjaGFuZ2UuXG4gICAgICBpZiAoY29tbWl0cy5zb21lKGNvbW1pdCA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCkpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0JyZWFraW5nQ2hhbmdlcyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YXJnZXQ6IHBhdGNoJzpcbiAgICBjYXNlICd0YXJnZXQ6IGx0cyc6XG4gICAgICAvLyBDaGVjayBpZiBhbnkgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0IGNvbnRhaW5zIGEgYnJlYWtpbmcgY2hhbmdlLlxuICAgICAgaWYgKGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDApKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgLy8gQ2hlY2sgaWYgYW55IGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdCBjb250YWlucyBhIGNvbW1pdCB0eXBlIG9mIFwiZmVhdFwiLlxuICAgICAgaWYgKGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LnR5cGUgPT09ICdmZWF0JykpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0ZlYXR1cmVDb21taXRzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB3YXJuKHJlZCgnV0FSTklORzogVW5hYmxlIHRvIGNvbmZpcm0gYWxsIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdCBhcmUgZWxpZ2libGUgdG8gYmUnKSk7XG4gICAgICB3YXJuKHJlZChgbWVyZ2VkIGludG8gdGhlIHRhcmdldCBicmFuY2g6ICR7bGFiZWwucGF0dGVybn1gKSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgcHVsbCByZXF1ZXN0IGhhcyB0aGUgcHJvcGVyIGxhYmVsIGZvciBicmVha2luZyBjaGFuZ2VzIGlmIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2VcbiAqIGNvbW1pdHMsIGFuZCBvbmx5IGhhcyB0aGUgbGFiZWwgaWYgdGhlcmUgYXJlIGJyZWFraW5nIGNoYW5nZSBjb21taXRzLlxuICovXG5mdW5jdGlvbiBhc3NlcnRDb3JyZWN0QnJlYWtpbmdDaGFuZ2VMYWJlbGluZyhcbiAgICBjb21taXRzOiBDb21taXRbXSwgbGFiZWxzOiBzdHJpbmdbXSwgY29uZmlnOiBNZXJnZUNvbmZpZykge1xuICAvKiogV2hldGhlciB0aGUgUFIgaGFzIGEgbGFiZWwgbm90aW5nIGEgYnJlYWtpbmcgY2hhbmdlLiAqL1xuICBjb25zdCBoYXNMYWJlbCA9IGxhYmVscy5pbmNsdWRlcyhjb25maWcuYnJlYWtpbmdDaGFuZ2VMYWJlbCB8fCBCcmVha2luZ0NoYW5nZUxhYmVsKTtcbiAgLy8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYXQgbGVhc3Qgb25lIGNvbW1pdCB3aGljaCBub3RlcyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbiAgY29uc3QgaGFzQ29tbWl0ID0gY29tbWl0cy5zb21lKGNvbW1pdCA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCk7XG5cbiAgaWYgKCFoYXNMYWJlbCAmJiBoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlTGFiZWwoKTtcbiAgfVxuXG4gIGlmIChoYXNMYWJlbCAmJiAhaGFzQ29tbWl0KSB7XG4gICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLm1pc3NpbmdCcmVha2luZ0NoYW5nZUNvbW1pdCgpO1xuICB9XG59XG4iXX0=