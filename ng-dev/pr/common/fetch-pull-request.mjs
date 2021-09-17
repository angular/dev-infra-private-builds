"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPullRequestFromGithub = void 0;
const typed_graphqlify_1 = require("typed-graphqlify");
const github_1 = require("../../utils/github");
/** Graphql schema for the response body the requested pull request. */
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
    return await (0, github_1.getPr)(PR_SCHEMA, prNumber, git);
}
exports.fetchPullRequestFromGithub = fetchPullRequestFromGithub;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2gtcHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL2NvbW1vbi9mZXRjaC1wdWxsLXJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsdURBQStEO0FBRS9ELCtDQUF5QztBQUV6Qyx1RUFBdUU7QUFDdkUsTUFBTSxTQUFTLEdBQUc7SUFDaEIsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUN4QixPQUFPLEVBQUUsd0JBQVksQ0FBQyxPQUFPO0lBQzdCLEtBQUssRUFBRSx3QkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFVLENBQUM7SUFDaEUsTUFBTSxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUMzQixnR0FBZ0c7SUFDaEcsdUNBQXVDO0lBQ3ZDLE9BQU8sRUFBRSxJQUFBLHlCQUFNLEVBQ2IsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFDLEVBQ1g7UUFDRSxVQUFVLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQy9CLEtBQUssRUFBRTtZQUNMO2dCQUNFLE1BQU0sRUFBRTtvQkFDTixNQUFNLEVBQUU7d0JBQ04sS0FBSyxFQUFFLHdCQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQVUsQ0FBQztxQkFDdEU7b0JBQ0QsT0FBTyxFQUFFLHdCQUFZLENBQUMsTUFBTTtpQkFDN0I7YUFDRjtTQUNGO0tBQ0YsQ0FDRjtJQUNELG1CQUFtQixFQUFFLHdCQUFZLENBQUMsT0FBTztJQUN6QyxlQUFlLEVBQUUsd0JBQVksQ0FBQyxPQUFPO0lBQ3JDLFVBQVUsRUFBRSx3QkFBWSxDQUFDLE1BQU07SUFDL0IsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUN6QixVQUFVLEVBQUU7WUFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07U0FDbkM7S0FDRjtJQUNELE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDekIsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1NBQ25DO0tBQ0Y7SUFDRCxXQUFXLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0lBQ2hDLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07SUFDMUIsTUFBTSxFQUFFLElBQUEseUJBQU0sRUFDWixFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUMsRUFDWjtRQUNFLEtBQUssRUFBRTtZQUNMO2dCQUNFLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDMUI7U0FDRjtLQUNGLENBQ0Y7Q0FDRixDQUFDO0FBS0YsNkVBQTZFO0FBQ3RFLEtBQUssVUFBVSwwQkFBMEIsQ0FDOUMsR0FBMkIsRUFDM0IsUUFBZ0I7SUFFaEIsT0FBTyxNQUFNLElBQUEsY0FBSyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUxELGdFQUtDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7Z2V0UHJ9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5cbi8qKiBHcmFwaHFsIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgdGhlIHJlcXVlc3RlZCBwdWxsIHJlcXVlc3QuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgaXNEcmFmdDogZ3JhcGhxbFR5cGVzLmJvb2xlYW4sXG4gIHN0YXRlOiBncmFwaHFsVHlwZXMub25lT2YoWydPUEVOJywgJ01FUkdFRCcsICdDTE9TRUQnXSBhcyBjb25zdCksXG4gIG51bWJlcjogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgLy8gT25seSB0aGUgbGFzdCAxMDAgY29tbWl0cyBmcm9tIGEgcHVsbCByZXF1ZXN0IGFyZSBvYnRhaW5lZCBhcyB3ZSBsaWtlbHkgd2lsbCBuZXZlciBzZWUgYSBwdWxsXG4gIC8vIHJlcXVlc3RzIHdpdGggbW9yZSB0aGFuIDEwMCBjb21taXRzLlxuICBjb21taXRzOiBwYXJhbXMoXG4gICAge2xhc3Q6IDEwMH0sXG4gICAge1xuICAgICAgdG90YWxDb3VudDogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgICAgIG5vZGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBjb21taXQ6IHtcbiAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICBzdGF0ZTogZ3JhcGhxbFR5cGVzLm9uZU9mKFsnRkFJTFVSRScsICdQRU5ESU5HJywgJ1NVQ0NFU1MnXSBhcyBjb25zdCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWVzc2FnZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICApLFxuICBtYWludGFpbmVyQ2FuTW9kaWZ5OiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgdmlld2VyRGlkQXV0aG9yOiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgaGVhZFJlZk9pZDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgaGVhZFJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICBiYXNlUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWZOYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgbGFiZWxzOiBwYXJhbXMoXG4gICAge2ZpcnN0OiAxMDB9LFxuICAgIHtcbiAgICAgIG5vZGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICApLFxufTtcblxuLyoqIEEgcHVsbCByZXF1ZXN0IHJldHJpZXZlZCBmcm9tIGdpdGh1YiB2aWEgdGhlIGdyYXBocWwgQVBJLiAqL1xuZXhwb3J0IHR5cGUgUmF3UHVsbFJlcXVlc3QgPSB0eXBlb2YgUFJfU0NIRU1BO1xuXG4vKiogRmV0Y2hlcyBhIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gUmV0dXJucyBudWxsIGlmIGFuIGVycm9yIG9jY3VycmVkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKFxuICBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsXG4gIHByTnVtYmVyOiBudW1iZXIsXG4pOiBQcm9taXNlPFJhd1B1bGxSZXF1ZXN0IHwgbnVsbD4ge1xuICByZXR1cm4gYXdhaXQgZ2V0UHIoUFJfU0NIRU1BLCBwck51bWJlciwgZ2l0KTtcbn1cbiJdfQ==