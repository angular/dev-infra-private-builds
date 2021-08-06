"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingPrs = exports.getPr = void 0;
const typed_graphqlify_1 = require("typed-graphqlify");
/** Get a PR from github  */
async function getPr(prSchema, prNumber, git) {
    /** The owner and name of the repository */
    const { owner, name } = git.remoteConfig;
    /** The Graphql query object to get a the PR */
    const PR_QUERY = typed_graphqlify_1.params({
        $number: 'Int!',
        $owner: 'String!',
        $name: 'String!', // The organization to query for
    }, {
        repository: typed_graphqlify_1.params({ owner: '$owner', name: '$name' }, {
            pullRequest: typed_graphqlify_1.params({ number: '$number' }, prSchema),
        }),
    });
    const result = await git.github.graphql(PR_QUERY, { number: prNumber, owner, name });
    return result.repository.pullRequest;
}
exports.getPr = getPr;
/** Get all pending PRs from github  */
async function getPendingPrs(prSchema, git) {
    /** The owner and name of the repository */
    const { owner, name } = git.remoteConfig;
    /** The Graphql query object to get a page of pending PRs */
    const PRS_QUERY = typed_graphqlify_1.params({
        $first: 'Int',
        $after: 'String',
        $owner: 'String!',
        $name: 'String!', // The repository to query for
    }, {
        repository: typed_graphqlify_1.params({ owner: '$owner', name: '$name' }, {
            pullRequests: typed_graphqlify_1.params({
                first: '$first',
                after: '$after',
                states: `OPEN`,
            }, {
                nodes: [prSchema],
                pageInfo: {
                    hasNextPage: typed_graphqlify_1.types.boolean,
                    endCursor: typed_graphqlify_1.types.string,
                },
            }),
        }),
    });
    /** The current cursor */
    let cursor;
    /** If an additional page of members is expected */
    let hasNextPage = true;
    /** Array of pending PRs */
    const prs = [];
    // For each page of the response, get the page and add it to the list of PRs
    while (hasNextPage) {
        const params = {
            after: cursor || null,
            first: 100,
            owner,
            name,
        };
        const results = (await git.github.graphql(PRS_QUERY, params));
        prs.push(...results.repository.pullRequests.nodes);
        hasNextPage = results.repository.pullRequests.pageInfo.hasNextPage;
        cursor = results.repository.pullRequests.pageInfo.endCursor;
    }
    return prs;
}
exports.getPendingPrs = getPendingPrs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2dpdGh1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1REFBK0M7QUFHL0MsNEJBQTRCO0FBQ3JCLEtBQUssVUFBVSxLQUFLLENBQ3pCLFFBQWtCLEVBQ2xCLFFBQWdCLEVBQ2hCLEdBQTJCO0lBRTNCLDJDQUEyQztJQUMzQyxNQUFNLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBQyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUM7SUFDdkMsK0NBQStDO0lBQy9DLE1BQU0sUUFBUSxHQUFHLHlCQUFNLENBQ3JCO1FBQ0UsT0FBTyxFQUFFLE1BQU07UUFDZixNQUFNLEVBQUUsU0FBUztRQUNqQixLQUFLLEVBQUUsU0FBUyxFQUFFLGdDQUFnQztLQUNuRCxFQUNEO1FBQ0UsVUFBVSxFQUFFLHlCQUFNLENBQ2hCLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLEVBQ2hDO1lBQ0UsV0FBVyxFQUFFLHlCQUFNLENBQUMsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLEVBQUUsUUFBUSxDQUFDO1NBQ25ELENBQ0Y7S0FDRixDQUNGLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDbkYsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztBQUN2QyxDQUFDO0FBMUJELHNCQTBCQztBQUVELHVDQUF1QztBQUNoQyxLQUFLLFVBQVUsYUFBYSxDQUFXLFFBQWtCLEVBQUUsR0FBMkI7SUFDM0YsMkNBQTJDO0lBQzNDLE1BQU0sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQztJQUN2Qyw0REFBNEQ7SUFDNUQsTUFBTSxTQUFTLEdBQUcseUJBQU0sQ0FDdEI7UUFDRSxNQUFNLEVBQUUsS0FBSztRQUNiLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLEtBQUssRUFBRSxTQUFTLEVBQUUsOEJBQThCO0tBQ2pELEVBQ0Q7UUFDRSxVQUFVLEVBQUUseUJBQU0sQ0FDaEIsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsRUFDaEM7WUFDRSxZQUFZLEVBQUUseUJBQU0sQ0FDbEI7Z0JBQ0UsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsTUFBTSxFQUFFLE1BQU07YUFDZixFQUNEO2dCQUNFLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQztnQkFDakIsUUFBUSxFQUFFO29CQUNSLFdBQVcsRUFBRSx3QkFBSyxDQUFDLE9BQU87b0JBQzFCLFNBQVMsRUFBRSx3QkFBSyxDQUFDLE1BQU07aUJBQ3hCO2FBQ0YsQ0FDRjtTQUNGLENBQ0Y7S0FDRixDQUNGLENBQUM7SUFDRix5QkFBeUI7SUFDekIsSUFBSSxNQUEwQixDQUFDO0lBQy9CLG1EQUFtRDtJQUNuRCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDdkIsMkJBQTJCO0lBQzNCLE1BQU0sR0FBRyxHQUFvQixFQUFFLENBQUM7SUFFaEMsNEVBQTRFO0lBQzVFLE9BQU8sV0FBVyxFQUFFO1FBQ2xCLE1BQU0sTUFBTSxHQUFHO1lBQ2IsS0FBSyxFQUFFLE1BQU0sSUFBSSxJQUFJO1lBQ3JCLEtBQUssRUFBRSxHQUFHO1lBQ1YsS0FBSztZQUNMLElBQUk7U0FDTCxDQUFDO1FBQ0YsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBcUIsQ0FBQztRQUNsRixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsV0FBVyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7UUFDbkUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7S0FDN0Q7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUF0REQsc0NBc0RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4vZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5cbi8qKiBHZXQgYSBQUiBmcm9tIGdpdGh1YiAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcjxQclNjaGVtYT4oXG4gIHByU2NoZW1hOiBQclNjaGVtYSxcbiAgcHJOdW1iZXI6IG51bWJlcixcbiAgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuKSB7XG4gIC8qKiBUaGUgb3duZXIgYW5kIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkgKi9cbiAgY29uc3Qge293bmVyLCBuYW1lfSA9IGdpdC5yZW1vdGVDb25maWc7XG4gIC8qKiBUaGUgR3JhcGhxbCBxdWVyeSBvYmplY3QgdG8gZ2V0IGEgdGhlIFBSICovXG4gIGNvbnN0IFBSX1FVRVJZID0gcGFyYW1zKFxuICAgIHtcbiAgICAgICRudW1iZXI6ICdJbnQhJywgLy8gVGhlIFBSIG51bWJlclxuICAgICAgJG93bmVyOiAnU3RyaW5nIScsIC8vIFRoZSBvcmdhbml6YXRpb24gdG8gcXVlcnkgZm9yXG4gICAgICAkbmFtZTogJ1N0cmluZyEnLCAvLyBUaGUgb3JnYW5pemF0aW9uIHRvIHF1ZXJ5IGZvclxuICAgIH0sXG4gICAge1xuICAgICAgcmVwb3NpdG9yeTogcGFyYW1zKFxuICAgICAgICB7b3duZXI6ICckb3duZXInLCBuYW1lOiAnJG5hbWUnfSxcbiAgICAgICAge1xuICAgICAgICAgIHB1bGxSZXF1ZXN0OiBwYXJhbXMoe251bWJlcjogJyRudW1iZXInfSwgcHJTY2hlbWEpLFxuICAgICAgICB9LFxuICAgICAgKSxcbiAgICB9LFxuICApO1xuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdpdC5naXRodWIuZ3JhcGhxbChQUl9RVUVSWSwge251bWJlcjogcHJOdW1iZXIsIG93bmVyLCBuYW1lfSk7XG4gIHJldHVybiByZXN1bHQucmVwb3NpdG9yeS5wdWxsUmVxdWVzdDtcbn1cblxuLyoqIEdldCBhbGwgcGVuZGluZyBQUnMgZnJvbSBnaXRodWIgICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVuZGluZ1ByczxQclNjaGVtYT4ocHJTY2hlbWE6IFByU2NoZW1hLCBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQpIHtcbiAgLyoqIFRoZSBvd25lciBhbmQgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeSAqL1xuICBjb25zdCB7b3duZXIsIG5hbWV9ID0gZ2l0LnJlbW90ZUNvbmZpZztcbiAgLyoqIFRoZSBHcmFwaHFsIHF1ZXJ5IG9iamVjdCB0byBnZXQgYSBwYWdlIG9mIHBlbmRpbmcgUFJzICovXG4gIGNvbnN0IFBSU19RVUVSWSA9IHBhcmFtcyhcbiAgICB7XG4gICAgICAkZmlyc3Q6ICdJbnQnLCAvLyBIb3cgbWFueSBlbnRyaWVzIHRvIGdldCB3aXRoIGVhY2ggcmVxdWVzdFxuICAgICAgJGFmdGVyOiAnU3RyaW5nJywgLy8gVGhlIGN1cnNvciB0byBzdGFydCB0aGUgcGFnZSBhdFxuICAgICAgJG93bmVyOiAnU3RyaW5nIScsIC8vIFRoZSBvcmdhbml6YXRpb24gdG8gcXVlcnkgZm9yXG4gICAgICAkbmFtZTogJ1N0cmluZyEnLCAvLyBUaGUgcmVwb3NpdG9yeSB0byBxdWVyeSBmb3JcbiAgICB9LFxuICAgIHtcbiAgICAgIHJlcG9zaXRvcnk6IHBhcmFtcyhcbiAgICAgICAge293bmVyOiAnJG93bmVyJywgbmFtZTogJyRuYW1lJ30sXG4gICAgICAgIHtcbiAgICAgICAgICBwdWxsUmVxdWVzdHM6IHBhcmFtcyhcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZmlyc3Q6ICckZmlyc3QnLFxuICAgICAgICAgICAgICBhZnRlcjogJyRhZnRlcicsXG4gICAgICAgICAgICAgIHN0YXRlczogYE9QRU5gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbm9kZXM6IFtwclNjaGVtYV0sXG4gICAgICAgICAgICAgIHBhZ2VJbmZvOiB7XG4gICAgICAgICAgICAgICAgaGFzTmV4dFBhZ2U6IHR5cGVzLmJvb2xlYW4sXG4gICAgICAgICAgICAgICAgZW5kQ3Vyc29yOiB0eXBlcy5zdHJpbmcsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICksXG4gICAgICAgIH0sXG4gICAgICApLFxuICAgIH0sXG4gICk7XG4gIC8qKiBUaGUgY3VycmVudCBjdXJzb3IgKi9cbiAgbGV0IGN1cnNvcjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAvKiogSWYgYW4gYWRkaXRpb25hbCBwYWdlIG9mIG1lbWJlcnMgaXMgZXhwZWN0ZWQgKi9cbiAgbGV0IGhhc05leHRQYWdlID0gdHJ1ZTtcbiAgLyoqIEFycmF5IG9mIHBlbmRpbmcgUFJzICovXG4gIGNvbnN0IHByczogQXJyYXk8UHJTY2hlbWE+ID0gW107XG5cbiAgLy8gRm9yIGVhY2ggcGFnZSBvZiB0aGUgcmVzcG9uc2UsIGdldCB0aGUgcGFnZSBhbmQgYWRkIGl0IHRvIHRoZSBsaXN0IG9mIFBSc1xuICB3aGlsZSAoaGFzTmV4dFBhZ2UpIHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBhZnRlcjogY3Vyc29yIHx8IG51bGwsXG4gICAgICBmaXJzdDogMTAwLFxuICAgICAgb3duZXIsXG4gICAgICBuYW1lLFxuICAgIH07XG4gICAgY29uc3QgcmVzdWx0cyA9IChhd2FpdCBnaXQuZ2l0aHViLmdyYXBocWwoUFJTX1FVRVJZLCBwYXJhbXMpKSBhcyB0eXBlb2YgUFJTX1FVRVJZO1xuICAgIHBycy5wdXNoKC4uLnJlc3VsdHMucmVwb3NpdG9yeS5wdWxsUmVxdWVzdHMubm9kZXMpO1xuICAgIGhhc05leHRQYWdlID0gcmVzdWx0cy5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0cy5wYWdlSW5mby5oYXNOZXh0UGFnZTtcbiAgICBjdXJzb3IgPSByZXN1bHRzLnJlcG9zaXRvcnkucHVsbFJlcXVlc3RzLnBhZ2VJbmZvLmVuZEN1cnNvcjtcbiAgfVxuICByZXR1cm4gcHJzO1xufVxuIl19