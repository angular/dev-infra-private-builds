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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2gtcHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL2ZldGNoLXB1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1REFBK0Q7QUFFL0QsK0NBQXlDO0FBRXpDLHVFQUF1RTtBQUN2RSxNQUFNLFNBQVMsR0FBRztJQUNoQixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0lBQ3hCLE9BQU8sRUFBRSx3QkFBWSxDQUFDLE9BQU87SUFDN0IsS0FBSyxFQUFFLHdCQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQVUsQ0FBQztJQUNoRSxNQUFNLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0lBQzNCLGdHQUFnRztJQUNoRyx1Q0FBdUM7SUFDdkMsT0FBTyxFQUFFLElBQUEseUJBQU0sRUFDYixFQUFDLElBQUksRUFBRSxHQUFHLEVBQUMsRUFDWDtRQUNFLFVBQVUsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDL0IsS0FBSyxFQUFFO1lBQ0w7Z0JBQ0UsTUFBTSxFQUFFO29CQUNOLE1BQU0sRUFBRTt3QkFDTixLQUFLLEVBQUUsd0JBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBVSxDQUFDO3FCQUN0RTtvQkFDRCxPQUFPLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2lCQUM3QjthQUNGO1NBQ0Y7S0FDRixDQUNGO0lBQ0QsV0FBVyxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUNoQyxLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0lBQzFCLE1BQU0sRUFBRSxJQUFBLHlCQUFNLEVBQ1osRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFDLEVBQ1o7UUFDRSxLQUFLLEVBQUU7WUFDTDtnQkFDRSxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQzFCO1NBQ0Y7S0FDRixDQUNGO0NBQ0YsQ0FBQztBQUtGLDZFQUE2RTtBQUN0RSxLQUFLLFVBQVUsMEJBQTBCLENBQzlDLEdBQTJCLEVBQzNCLFFBQWdCO0lBRWhCLE9BQU8sTUFBTSxJQUFBLGNBQUssRUFBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFMRCxnRUFLQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3BhcmFtcywgdHlwZXMgYXMgZ3JhcGhxbFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuXG4vKiogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IHRoZSByZXF1ZXN0ZWQgcHVsbCByZXF1ZXN0LiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIGlzRHJhZnQ6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICBzdGF0ZTogZ3JhcGhxbFR5cGVzLm9uZU9mKFsnT1BFTicsICdNRVJHRUQnLCAnQ0xPU0VEJ10gYXMgY29uc3QpLFxuICBudW1iZXI6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gIC8vIE9ubHkgdGhlIGxhc3QgMTAwIGNvbW1pdHMgZnJvbSBhIHB1bGwgcmVxdWVzdCBhcmUgb2J0YWluZWQgYXMgd2UgbGlrZWx5IHdpbGwgbmV2ZXIgc2VlIGEgcHVsbFxuICAvLyByZXF1ZXN0cyB3aXRoIG1vcmUgdGhhbiAxMDAgY29tbWl0cy5cbiAgY29tbWl0czogcGFyYW1zKFxuICAgIHtsYXN0OiAxMDB9LFxuICAgIHtcbiAgICAgIHRvdGFsQ291bnQ6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gICAgICBub2RlczogW1xuICAgICAgICB7XG4gICAgICAgICAgY29tbWl0OiB7XG4gICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgc3RhdGU6IGdyYXBocWxUeXBlcy5vbmVPZihbJ0ZBSUxVUkUnLCAnUEVORElORycsICdTVUNDRVNTJ10gYXMgY29uc3QpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgKSxcbiAgYmFzZVJlZk5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIHRpdGxlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBsYWJlbHM6IHBhcmFtcyhcbiAgICB7Zmlyc3Q6IDEwMH0sXG4gICAge1xuICAgICAgbm9kZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICksXG59O1xuXG4vKiogQSBwdWxsIHJlcXVlc3QgcmV0cmlldmVkIGZyb20gZ2l0aHViIHZpYSB0aGUgZ3JhcGhxbCBBUEkuICovXG5leHBvcnQgdHlwZSBSYXdQdWxsUmVxdWVzdCA9IHR5cGVvZiBQUl9TQ0hFTUE7XG5cbi8qKiBGZXRjaGVzIGEgcHVsbCByZXF1ZXN0IGZyb20gR2l0aHViLiBSZXR1cm5zIG51bGwgaWYgYW4gZXJyb3Igb2NjdXJyZWQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hQdWxsUmVxdWVzdEZyb21HaXRodWIoXG4gIGdpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCxcbiAgcHJOdW1iZXI6IG51bWJlcixcbik6IFByb21pc2U8UmF3UHVsbFJlcXVlc3QgfCBudWxsPiB7XG4gIHJldHVybiBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xufVxuIl19