"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusesForPullRequest = exports.fetchPendingPullRequestsFromGithub = exports.fetchPullRequestFromGithub = exports.PR_SCHEMA = exports.PullRequestStatus = void 0;
const github_1 = require("../../utils/github");
const typed_graphqlify_1 = require("typed-graphqlify");
/** A status for a pull request status or check. */
var PullRequestStatus;
(function (PullRequestStatus) {
    PullRequestStatus[PullRequestStatus["PASSING"] = 0] = "PASSING";
    PullRequestStatus[PullRequestStatus["FAILING"] = 1] = "FAILING";
    PullRequestStatus[PullRequestStatus["PENDING"] = 2] = "PENDING";
})(PullRequestStatus = exports.PullRequestStatus || (exports.PullRequestStatus = {}));
/** Graphql schema for the response body the requested pull request. */
exports.PR_SCHEMA = {
    url: typed_graphqlify_1.types.string,
    isDraft: typed_graphqlify_1.types.boolean,
    state: typed_graphqlify_1.types.custom(),
    number: typed_graphqlify_1.types.number,
    mergeable: typed_graphqlify_1.types.custom(),
    updatedAt: typed_graphqlify_1.types.string,
    // Only the last 100 commits from a pull request are obtained as we likely will never see a pull
    // requests with more than 100 commits.
    commits: (0, typed_graphqlify_1.params)({ last: 100 }, {
        totalCount: typed_graphqlify_1.types.number,
        nodes: [
            {
                commit: {
                    statusCheckRollup: {
                        state: typed_graphqlify_1.types.custom(),
                        contexts: (0, typed_graphqlify_1.params)({ last: 100 }, {
                            nodes: [
                                (0, typed_graphqlify_1.onUnion)({
                                    CheckRun: {
                                        __typename: typed_graphqlify_1.types.constant('CheckRun'),
                                        status: typed_graphqlify_1.types.custom(),
                                        conclusion: typed_graphqlify_1.types.custom(),
                                        name: typed_graphqlify_1.types.string,
                                    },
                                    StatusContext: {
                                        __typename: typed_graphqlify_1.types.constant('StatusContext'),
                                        state: typed_graphqlify_1.types.custom(),
                                        context: typed_graphqlify_1.types.string,
                                    },
                                }),
                            ],
                        }),
                    },
                    message: typed_graphqlify_1.types.string,
                },
            },
        ],
    }),
    maintainerCanModify: typed_graphqlify_1.types.boolean,
    viewerDidAuthor: typed_graphqlify_1.types.boolean,
    headRefOid: typed_graphqlify_1.types.string,
    headRef: {
        name: typed_graphqlify_1.types.string,
        repository: {
            url: typed_graphqlify_1.types.string,
            nameWithOwner: typed_graphqlify_1.types.string,
        },
    },
    baseRef: {
        name: typed_graphqlify_1.types.string,
        repository: {
            url: typed_graphqlify_1.types.string,
            nameWithOwner: typed_graphqlify_1.types.string,
        },
    },
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
    return await (0, github_1.getPr)(exports.PR_SCHEMA, prNumber, git);
}
exports.fetchPullRequestFromGithub = fetchPullRequestFromGithub;
/** Fetches a pull request from Github. Returns null if an error occurred. */
async function fetchPendingPullRequestsFromGithub(git) {
    return await (0, github_1.getPendingPrs)(exports.PR_SCHEMA, git);
}
exports.fetchPendingPullRequestsFromGithub = fetchPendingPullRequestsFromGithub;
/**
 * Gets the statuses for a commit from a pull requeste, using a consistent interface for both
 * status and checks results.
 */
function getStatusesForPullRequest(pullRequest) {
    const nodes = pullRequest.commits.nodes;
    /** The combined github status and github checks object. */
    const { statusCheckRollup } = nodes[nodes.length - 1].commit;
    const statuses = statusCheckRollup.contexts.nodes.map((context) => {
        switch (context.__typename) {
            case 'CheckRun':
                return {
                    type: 'check',
                    name: context.name,
                    status: normalizeGithubCheckState(context.conclusion, context.status),
                };
            case 'StatusContext':
                return {
                    type: 'status',
                    name: context.context,
                    status: normalizeGithubStatusState(context.state),
                };
        }
    });
    return {
        combinedStatus: normalizeGithubStatusState(statusCheckRollup.state),
        statuses,
    };
}
exports.getStatusesForPullRequest = getStatusesForPullRequest;
/** Retrieve the normalized PullRequestStatus for the provided github status state. */
function normalizeGithubStatusState(state) {
    switch (state) {
        case 'FAILURE':
        case 'ERROR':
            return PullRequestStatus.FAILING;
        case 'PENDING':
            return PullRequestStatus.PENDING;
        case 'SUCCESS':
        case 'EXPECTED':
            return PullRequestStatus.PASSING;
    }
}
/** Retrieve the normalized PullRequestStatus for the provided github check state. */
function normalizeGithubCheckState(conclusion, status) {
    switch (status) {
        case 'COMPLETED':
            break;
        case 'QUEUED':
        case 'IN_PROGRESS':
        case 'WAITING':
        case 'PENDING':
        case 'REQUESTED':
            return PullRequestStatus.PENDING;
    }
    switch (conclusion) {
        case 'ACTION_REQUIRED':
        case 'TIMED_OUT':
        case 'CANCELLED':
        case 'FAILURE':
        case 'SKIPPED':
        case 'STALE':
        case 'STARTUP_FAILURE':
            return PullRequestStatus.FAILING;
        case 'SUCCESS':
        case 'NEUTRAL':
            return PullRequestStatus.PASSING;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2gtcHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL2NvbW1vbi9mZXRjaC1wdWxsLXJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsK0NBQXdEO0FBQ3hELHVEQUF3RTtBQVN4RSxtREFBbUQ7QUFDbkQsSUFBWSxpQkFJWDtBQUpELFdBQVksaUJBQWlCO0lBQzNCLCtEQUFPLENBQUE7SUFDUCwrREFBTyxDQUFBO0lBQ1AsK0RBQU8sQ0FBQTtBQUNULENBQUMsRUFKVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQUk1QjtBQUVELHVFQUF1RTtBQUMxRCxRQUFBLFNBQVMsR0FBRztJQUN2QixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0lBQ3hCLE9BQU8sRUFBRSx3QkFBWSxDQUFDLE9BQU87SUFDN0IsS0FBSyxFQUFFLHdCQUFZLENBQUMsTUFBTSxFQUFvQjtJQUM5QyxNQUFNLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0lBQzNCLFNBQVMsRUFBRSx3QkFBWSxDQUFDLE1BQU0sRUFBa0I7SUFDaEQsU0FBUyxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUM5QixnR0FBZ0c7SUFDaEcsdUNBQXVDO0lBQ3ZDLE9BQU8sRUFBRSxJQUFBLHlCQUFNLEVBQ2IsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFDLEVBQ1g7UUFDRSxVQUFVLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQy9CLEtBQUssRUFBRTtZQUNMO2dCQUNFLE1BQU0sRUFBRTtvQkFDTixpQkFBaUIsRUFBRTt3QkFDakIsS0FBSyxFQUFFLHdCQUFZLENBQUMsTUFBTSxFQUFlO3dCQUN6QyxRQUFRLEVBQUUsSUFBQSx5QkFBTSxFQUNkLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBQyxFQUNYOzRCQUNFLEtBQUssRUFBRTtnQ0FDTCxJQUFBLDBCQUFPLEVBQUM7b0NB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U0FBUyxDQUFDO1FBQ2YsS0FBSyxTQUFTO1lBQ1osT0FBTyxpQkFBaUIsQ0FBQyxPQUFPLENBQUM7S0FDcEM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge2dldFBlbmRpbmdQcnMsIGdldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuaW1wb3J0IHtwYXJhbXMsIHR5cGVzIGFzIGdyYXBocWxUeXBlcywgb25Vbmlvbn0gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5pbXBvcnQge1xuICBNZXJnZWFibGVTdGF0ZSxcbiAgQ2hlY2tDb25jbHVzaW9uU3RhdGUsXG4gIFN0YXR1c1N0YXRlLFxuICBQdWxsUmVxdWVzdFN0YXRlLFxuICBDaGVja1N0YXR1c1N0YXRlLFxufSBmcm9tICdAb2N0b2tpdC9ncmFwaHFsLXNjaGVtYSc7XG5cbi8qKiBBIHN0YXR1cyBmb3IgYSBwdWxsIHJlcXVlc3Qgc3RhdHVzIG9yIGNoZWNrLiAqL1xuZXhwb3J0IGVudW0gUHVsbFJlcXVlc3RTdGF0dXMge1xuICBQQVNTSU5HLFxuICBGQUlMSU5HLFxuICBQRU5ESU5HLFxufVxuXG4vKiogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IHRoZSByZXF1ZXN0ZWQgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBpc0RyYWZ0OiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgc3RhdGU6IGdyYXBocWxUeXBlcy5jdXN0b208UHVsbFJlcXVlc3RTdGF0ZT4oKSxcbiAgbnVtYmVyOiBncmFwaHFsVHlwZXMubnVtYmVyLFxuICBtZXJnZWFibGU6IGdyYXBocWxUeXBlcy5jdXN0b208TWVyZ2VhYmxlU3RhdGU+KCksXG4gIHVwZGF0ZWRBdDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgLy8gT25seSB0aGUgbGFzdCAxMDAgY29tbWl0cyBmcm9tIGEgcHVsbCByZXF1ZXN0IGFyZSBvYnRhaW5lZCBhcyB3ZSBsaWtlbHkgd2lsbCBuZXZlciBzZWUgYSBwdWxsXG4gIC8vIHJlcXVlc3RzIHdpdGggbW9yZSB0aGFuIDEwMCBjb21taXRzLlxuICBjb21taXRzOiBwYXJhbXMoXG4gICAge2xhc3Q6IDEwMH0sXG4gICAge1xuICAgICAgdG90YWxDb3VudDogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgICAgIG5vZGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBjb21taXQ6IHtcbiAgICAgICAgICAgIHN0YXR1c0NoZWNrUm9sbHVwOiB7XG4gICAgICAgICAgICAgIHN0YXRlOiBncmFwaHFsVHlwZXMuY3VzdG9tPFN0YXR1c1N0YXRlPigpLFxuICAgICAgICAgICAgICBjb250ZXh0czogcGFyYW1zKFxuICAgICAgICAgICAgICAgIHtsYXN0OiAxMDB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIG5vZGVzOiBbXG4gICAgICAgICAgICAgICAgICAgIG9uVW5pb24oe1xuICAgICAgICAgICAgICAgICAgICAgIENoZWNrUnVuOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX3R5cGVuYW1lOiBncmFwaHFsVHlwZXMuY29uc3RhbnQoJ0NoZWNrUnVuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGdyYXBocWxUeXBlcy5jdXN0b208Q2hlY2tTdGF0dXNTdGF0ZT4oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmNsdXNpb246IGdyYXBocWxUeXBlcy5jdXN0b208Q2hlY2tDb25jbHVzaW9uU3RhdGU+KCksXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgU3RhdHVzQ29udGV4dDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgX190eXBlbmFtZTogZ3JhcGhxbFR5cGVzLmNvbnN0YW50KCdTdGF0dXNDb250ZXh0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZTogZ3JhcGhxbFR5cGVzLmN1c3RvbTxTdGF0dXNTdGF0ZT4oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWVzc2FnZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICApLFxuICBtYWludGFpbmVyQ2FuTW9kaWZ5OiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgdmlld2VyRGlkQXV0aG9yOiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgaGVhZFJlZk9pZDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgaGVhZFJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICBiYXNlUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWZOYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgbGFiZWxzOiBwYXJhbXMoXG4gICAge2ZpcnN0OiAxMDB9LFxuICAgIHtcbiAgICAgIG5vZGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICApLFxufTtcblxuZXhwb3J0IHR5cGUgUHVsbFJlcXVlc3RGcm9tR2l0aHViID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIEZldGNoZXMgYSBwdWxsIHJlcXVlc3QgZnJvbSBHaXRodWIuIFJldHVybnMgbnVsbCBpZiBhbiBlcnJvciBvY2N1cnJlZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihcbiAgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICBwck51bWJlcjogbnVtYmVyLFxuKTogUHJvbWlzZTxQdWxsUmVxdWVzdEZyb21HaXRodWIgfCBudWxsPiB7XG4gIHJldHVybiBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xufVxuXG4vKiogRmV0Y2hlcyBhIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gUmV0dXJucyBudWxsIGlmIGFuIGVycm9yIG9jY3VycmVkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoUGVuZGluZ1B1bGxSZXF1ZXN0c0Zyb21HaXRodWIoXG4gIGdpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCxcbik6IFByb21pc2U8UHVsbFJlcXVlc3RGcm9tR2l0aHViW10gfCBudWxsPiB7XG4gIHJldHVybiBhd2FpdCBnZXRQZW5kaW5nUHJzKFBSX1NDSEVNQSwgZ2l0KTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBzdGF0dXNlcyBmb3IgYSBjb21taXQgZnJvbSBhIHB1bGwgcmVxdWVzdGUsIHVzaW5nIGEgY29uc2lzdGVudCBpbnRlcmZhY2UgZm9yIGJvdGhcbiAqIHN0YXR1cyBhbmQgY2hlY2tzIHJlc3VsdHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdGF0dXNlc0ZvclB1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdEZyb21HaXRodWIpIHtcbiAgY29uc3Qgbm9kZXMgPSBwdWxsUmVxdWVzdC5jb21taXRzLm5vZGVzO1xuICAvKiogVGhlIGNvbWJpbmVkIGdpdGh1YiBzdGF0dXMgYW5kIGdpdGh1YiBjaGVja3Mgb2JqZWN0LiAqL1xuICBjb25zdCB7c3RhdHVzQ2hlY2tSb2xsdXB9ID0gbm9kZXNbbm9kZXMubGVuZ3RoIC0gMV0uY29tbWl0O1xuXG4gIGNvbnN0IHN0YXR1c2VzID0gc3RhdHVzQ2hlY2tSb2xsdXAuY29udGV4dHMubm9kZXMubWFwKChjb250ZXh0KSA9PiB7XG4gICAgc3dpdGNoIChjb250ZXh0Ll9fdHlwZW5hbWUpIHtcbiAgICAgIGNhc2UgJ0NoZWNrUnVuJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAnY2hlY2snLFxuICAgICAgICAgIG5hbWU6IGNvbnRleHQubmFtZSxcbiAgICAgICAgICBzdGF0dXM6IG5vcm1hbGl6ZUdpdGh1YkNoZWNrU3RhdGUoY29udGV4dC5jb25jbHVzaW9uLCBjb250ZXh0LnN0YXR1cyksXG4gICAgICAgIH07XG4gICAgICBjYXNlICdTdGF0dXNDb250ZXh0JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAnc3RhdHVzJyxcbiAgICAgICAgICBuYW1lOiBjb250ZXh0LmNvbnRleHQsXG4gICAgICAgICAgc3RhdHVzOiBub3JtYWxpemVHaXRodWJTdGF0dXNTdGF0ZShjb250ZXh0LnN0YXRlKSxcbiAgICAgICAgfTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgY29tYmluZWRTdGF0dXM6IG5vcm1hbGl6ZUdpdGh1YlN0YXR1c1N0YXRlKHN0YXR1c0NoZWNrUm9sbHVwLnN0YXRlKSxcbiAgICBzdGF0dXNlcyxcbiAgfTtcbn1cblxuLyoqIFJldHJpZXZlIHRoZSBub3JtYWxpemVkIFB1bGxSZXF1ZXN0U3RhdHVzIGZvciB0aGUgcHJvdmlkZWQgZ2l0aHViIHN0YXR1cyBzdGF0ZS4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZUdpdGh1YlN0YXR1c1N0YXRlKHN0YXRlOiBTdGF0dXNTdGF0ZSkge1xuICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgY2FzZSAnRkFJTFVSRSc6XG4gICAgY2FzZSAnRVJST1InOlxuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0U3RhdHVzLkZBSUxJTkc7XG4gICAgY2FzZSAnUEVORElORyc6XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RTdGF0dXMuUEVORElORztcbiAgICBjYXNlICdTVUNDRVNTJzpcbiAgICBjYXNlICdFWFBFQ1RFRCc6XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RTdGF0dXMuUEFTU0lORztcbiAgfVxufVxuXG4vKiogUmV0cmlldmUgdGhlIG5vcm1hbGl6ZWQgUHVsbFJlcXVlc3RTdGF0dXMgZm9yIHRoZSBwcm92aWRlZCBnaXRodWIgY2hlY2sgc3RhdGUuICovXG5mdW5jdGlvbiBub3JtYWxpemVHaXRodWJDaGVja1N0YXRlKGNvbmNsdXNpb246IENoZWNrQ29uY2x1c2lvblN0YXRlLCBzdGF0dXM6IENoZWNrU3RhdHVzU3RhdGUpIHtcbiAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICBjYXNlICdDT01QTEVURUQnOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUVVFVUVEJzpcbiAgICBjYXNlICdJTl9QUk9HUkVTUyc6XG4gICAgY2FzZSAnV0FJVElORyc6XG4gICAgY2FzZSAnUEVORElORyc6XG4gICAgY2FzZSAnUkVRVUVTVEVEJzpcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdFN0YXR1cy5QRU5ESU5HO1xuICB9XG5cbiAgc3dpdGNoIChjb25jbHVzaW9uKSB7XG4gICAgY2FzZSAnQUNUSU9OX1JFUVVJUkVEJzpcbiAgICBjYXNlICdUSU1FRF9PVVQnOlxuICAgIGNhc2UgJ0NBTkNFTExFRCc6XG4gICAgY2FzZSAnRkFJTFVSRSc6XG4gICAgY2FzZSAnU0tJUFBFRCc6XG4gICAgY2FzZSAnU1RBTEUnOlxuICAgIGNhc2UgJ1NUQVJUVVBfRkFJTFVSRSc6XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RTdGF0dXMuRkFJTElORztcbiAgICBjYXNlICdTVUNDRVNTJzpcbiAgICBjYXNlICdORVVUUkFMJzpcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdFN0YXR1cy5QQVNTSU5HO1xuICB9XG59XG4iXX0=