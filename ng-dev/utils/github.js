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
const graphql_1 = require("@octokit/graphql");
/**
 * Gets the given pull request from Github using the GraphQL API endpoint.
 */
async function getPr(prSchema, prNumber, git) {
    /** The owner and name of the repository */
    const { owner, name } = git.remoteConfig;
    /** The Graphql query object to get a the PR */
    const PR_QUERY = (0, typed_graphqlify_1.params)({
        $number: 'Int!',
        $owner: 'String!',
        $name: 'String!', // The organization to query for
    }, {
        repository: (0, typed_graphqlify_1.params)({ owner: '$owner', name: '$name' }, {
            pullRequest: (0, typed_graphqlify_1.params)({ number: '$number' }, prSchema),
        }),
    });
    try {
        const result = await git.github.graphql(PR_QUERY, { number: prNumber, owner, name });
        return result.repository.pullRequest;
    }
    catch (e) {
        // If we know the error is just about the pull request not being found, we explicitly
        // return `null`. This allows convenient and graceful handling if a PR does not exist.
        if (e instanceof graphql_1.GraphqlResponseError && e.errors?.every((e) => e.type === 'NOT_FOUND')) {
            return null;
        }
        throw e;
    }
}
exports.getPr = getPr;
/** Get all pending PRs from github  */
async function getPendingPrs(prSchema, git) {
    /** The owner and name of the repository */
    const { owner, name } = git.remoteConfig;
    /** The Graphql query object to get a page of pending PRs */
    const PRS_QUERY = (0, typed_graphqlify_1.params)({
        $first: 'Int',
        $after: 'String',
        $owner: 'String!',
        $name: 'String!', // The repository to query for
    }, {
        repository: (0, typed_graphqlify_1.params)({ owner: '$owner', name: '$name' }, {
            pullRequests: (0, typed_graphqlify_1.params)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2dpdGh1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1REFBK0M7QUFFL0MsOENBQXNEO0FBRXREOztHQUVHO0FBQ0ksS0FBSyxVQUFVLEtBQUssQ0FDekIsUUFBa0IsRUFDbEIsUUFBZ0IsRUFDaEIsR0FBMkI7SUFFM0IsMkNBQTJDO0lBQzNDLE1BQU0sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQztJQUN2QywrQ0FBK0M7SUFDL0MsTUFBTSxRQUFRLEdBQUcsSUFBQSx5QkFBTSxFQUNyQjtRQUNFLE9BQU8sRUFBRSxNQUFNO1FBQ2YsTUFBTSxFQUFFLFNBQVM7UUFDakIsS0FBSyxFQUFFLFNBQVMsRUFBRSxnQ0FBZ0M7S0FDbkQsRUFDRDtRQUNFLFVBQVUsRUFBRSxJQUFBLHlCQUFNLEVBQ2hCLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLEVBQ2hDO1lBQ0UsV0FBVyxFQUFFLElBQUEseUJBQU0sRUFBQyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsRUFBRSxRQUFRLENBQUM7U0FDbkQsQ0FDRjtLQUNGLENBQ0YsQ0FBQztJQUVGLElBQUk7UUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDbkYsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztLQUN0QztJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YscUZBQXFGO1FBQ3JGLHNGQUFzRjtRQUN0RixJQUFJLENBQUMsWUFBWSw4QkFBb0IsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsRUFBRTtZQUN2RixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsTUFBTSxDQUFDLENBQUM7S0FDVDtBQUNILENBQUM7QUFuQ0Qsc0JBbUNDO0FBRUQsdUNBQXVDO0FBQ2hDLEtBQUssVUFBVSxhQUFhLENBQVcsUUFBa0IsRUFBRSxHQUEyQjtJQUMzRiwyQ0FBMkM7SUFDM0MsTUFBTSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDO0lBQ3ZDLDREQUE0RDtJQUM1RCxNQUFNLFNBQVMsR0FBRyxJQUFBLHlCQUFNLEVBQ3RCO1FBQ0UsTUFBTSxFQUFFLEtBQUs7UUFDYixNQUFNLEVBQUUsUUFBUTtRQUNoQixNQUFNLEVBQUUsU0FBUztRQUNqQixLQUFLLEVBQUUsU0FBUyxFQUFFLDhCQUE4QjtLQUNqRCxFQUNEO1FBQ0UsVUFBVSxFQUFFLElBQUEseUJBQU0sRUFDaEIsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsRUFDaEM7WUFDRSxZQUFZLEVBQUUsSUFBQSx5QkFBTSxFQUNsQjtnQkFDRSxLQUFLLEVBQUUsUUFBUTtnQkFDZixLQUFLLEVBQUUsUUFBUTtnQkFDZixNQUFNLEVBQUUsTUFBTTthQUNmLEVBQ0Q7Z0JBQ0UsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQUNqQixRQUFRLEVBQUU7b0JBQ1IsV0FBVyxFQUFFLHdCQUFLLENBQUMsT0FBTztvQkFDMUIsU0FBUyxFQUFFLHdCQUFLLENBQUMsTUFBTTtpQkFDeEI7YUFDRixDQUNGO1NBQ0YsQ0FDRjtLQUNGLENBQ0YsQ0FBQztJQUNGLHlCQUF5QjtJQUN6QixJQUFJLE1BQTBCLENBQUM7SUFDL0IsbURBQW1EO0lBQ25ELElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztJQUN2QiwyQkFBMkI7SUFDM0IsTUFBTSxHQUFHLEdBQW9CLEVBQUUsQ0FBQztJQUVoQyw0RUFBNEU7SUFDNUUsT0FBTyxXQUFXLEVBQUU7UUFDbEIsTUFBTSxNQUFNLEdBQUc7WUFDYixLQUFLLEVBQUUsTUFBTSxJQUFJLElBQUk7WUFDckIsS0FBSyxFQUFFLEdBQUc7WUFDVixLQUFLO1lBQ0wsSUFBSTtTQUNMLENBQUM7UUFDRixNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFxQixDQUFDO1FBQ2xGLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxXQUFXLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUNuRSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztLQUM3RDtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQXRERCxzQ0FzREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwYXJhbXMsIHR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7R3JhcGhxbFJlc3BvbnNlRXJyb3J9IGZyb20gJ0BvY3Rva2l0L2dyYXBocWwnO1xuXG4vKipcbiAqIEdldHMgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1YiB1c2luZyB0aGUgR3JhcGhRTCBBUEkgZW5kcG9pbnQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcjxQclNjaGVtYT4oXG4gIHByU2NoZW1hOiBQclNjaGVtYSxcbiAgcHJOdW1iZXI6IG51bWJlcixcbiAgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuKTogUHJvbWlzZTxQclNjaGVtYSB8IG51bGw+IHtcbiAgLyoqIFRoZSBvd25lciBhbmQgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeSAqL1xuICBjb25zdCB7b3duZXIsIG5hbWV9ID0gZ2l0LnJlbW90ZUNvbmZpZztcbiAgLyoqIFRoZSBHcmFwaHFsIHF1ZXJ5IG9iamVjdCB0byBnZXQgYSB0aGUgUFIgKi9cbiAgY29uc3QgUFJfUVVFUlkgPSBwYXJhbXMoXG4gICAge1xuICAgICAgJG51bWJlcjogJ0ludCEnLCAvLyBUaGUgUFIgbnVtYmVyXG4gICAgICAkb3duZXI6ICdTdHJpbmchJywgLy8gVGhlIG9yZ2FuaXphdGlvbiB0byBxdWVyeSBmb3JcbiAgICAgICRuYW1lOiAnU3RyaW5nIScsIC8vIFRoZSBvcmdhbml6YXRpb24gdG8gcXVlcnkgZm9yXG4gICAgfSxcbiAgICB7XG4gICAgICByZXBvc2l0b3J5OiBwYXJhbXMoXG4gICAgICAgIHtvd25lcjogJyRvd25lcicsIG5hbWU6ICckbmFtZSd9LFxuICAgICAgICB7XG4gICAgICAgICAgcHVsbFJlcXVlc3Q6IHBhcmFtcyh7bnVtYmVyOiAnJG51bWJlcid9LCBwclNjaGVtYSksXG4gICAgICAgIH0sXG4gICAgICApLFxuICAgIH0sXG4gICk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnaXQuZ2l0aHViLmdyYXBocWwoUFJfUVVFUlksIHtudW1iZXI6IHByTnVtYmVyLCBvd25lciwgbmFtZX0pO1xuICAgIHJldHVybiByZXN1bHQucmVwb3NpdG9yeS5wdWxsUmVxdWVzdDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElmIHdlIGtub3cgdGhlIGVycm9yIGlzIGp1c3QgYWJvdXQgdGhlIHB1bGwgcmVxdWVzdCBub3QgYmVpbmcgZm91bmQsIHdlIGV4cGxpY2l0bHlcbiAgICAvLyByZXR1cm4gYG51bGxgLiBUaGlzIGFsbG93cyBjb252ZW5pZW50IGFuZCBncmFjZWZ1bCBoYW5kbGluZyBpZiBhIFBSIGRvZXMgbm90IGV4aXN0LlxuICAgIGlmIChlIGluc3RhbmNlb2YgR3JhcGhxbFJlc3BvbnNlRXJyb3IgJiYgZS5lcnJvcnM/LmV2ZXJ5KChlKSA9PiBlLnR5cGUgPT09ICdOT1RfRk9VTkQnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqIEdldCBhbGwgcGVuZGluZyBQUnMgZnJvbSBnaXRodWIgICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVuZGluZ1ByczxQclNjaGVtYT4ocHJTY2hlbWE6IFByU2NoZW1hLCBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQpIHtcbiAgLyoqIFRoZSBvd25lciBhbmQgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeSAqL1xuICBjb25zdCB7b3duZXIsIG5hbWV9ID0gZ2l0LnJlbW90ZUNvbmZpZztcbiAgLyoqIFRoZSBHcmFwaHFsIHF1ZXJ5IG9iamVjdCB0byBnZXQgYSBwYWdlIG9mIHBlbmRpbmcgUFJzICovXG4gIGNvbnN0IFBSU19RVUVSWSA9IHBhcmFtcyhcbiAgICB7XG4gICAgICAkZmlyc3Q6ICdJbnQnLCAvLyBIb3cgbWFueSBlbnRyaWVzIHRvIGdldCB3aXRoIGVhY2ggcmVxdWVzdFxuICAgICAgJGFmdGVyOiAnU3RyaW5nJywgLy8gVGhlIGN1cnNvciB0byBzdGFydCB0aGUgcGFnZSBhdFxuICAgICAgJG93bmVyOiAnU3RyaW5nIScsIC8vIFRoZSBvcmdhbml6YXRpb24gdG8gcXVlcnkgZm9yXG4gICAgICAkbmFtZTogJ1N0cmluZyEnLCAvLyBUaGUgcmVwb3NpdG9yeSB0byBxdWVyeSBmb3JcbiAgICB9LFxuICAgIHtcbiAgICAgIHJlcG9zaXRvcnk6IHBhcmFtcyhcbiAgICAgICAge293bmVyOiAnJG93bmVyJywgbmFtZTogJyRuYW1lJ30sXG4gICAgICAgIHtcbiAgICAgICAgICBwdWxsUmVxdWVzdHM6IHBhcmFtcyhcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZmlyc3Q6ICckZmlyc3QnLFxuICAgICAgICAgICAgICBhZnRlcjogJyRhZnRlcicsXG4gICAgICAgICAgICAgIHN0YXRlczogYE9QRU5gLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbm9kZXM6IFtwclNjaGVtYV0sXG4gICAgICAgICAgICAgIHBhZ2VJbmZvOiB7XG4gICAgICAgICAgICAgICAgaGFzTmV4dFBhZ2U6IHR5cGVzLmJvb2xlYW4sXG4gICAgICAgICAgICAgICAgZW5kQ3Vyc29yOiB0eXBlcy5zdHJpbmcsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICksXG4gICAgICAgIH0sXG4gICAgICApLFxuICAgIH0sXG4gICk7XG4gIC8qKiBUaGUgY3VycmVudCBjdXJzb3IgKi9cbiAgbGV0IGN1cnNvcjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAvKiogSWYgYW4gYWRkaXRpb25hbCBwYWdlIG9mIG1lbWJlcnMgaXMgZXhwZWN0ZWQgKi9cbiAgbGV0IGhhc05leHRQYWdlID0gdHJ1ZTtcbiAgLyoqIEFycmF5IG9mIHBlbmRpbmcgUFJzICovXG4gIGNvbnN0IHByczogQXJyYXk8UHJTY2hlbWE+ID0gW107XG5cbiAgLy8gRm9yIGVhY2ggcGFnZSBvZiB0aGUgcmVzcG9uc2UsIGdldCB0aGUgcGFnZSBhbmQgYWRkIGl0IHRvIHRoZSBsaXN0IG9mIFBSc1xuICB3aGlsZSAoaGFzTmV4dFBhZ2UpIHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICBhZnRlcjogY3Vyc29yIHx8IG51bGwsXG4gICAgICBmaXJzdDogMTAwLFxuICAgICAgb3duZXIsXG4gICAgICBuYW1lLFxuICAgIH07XG4gICAgY29uc3QgcmVzdWx0cyA9IChhd2FpdCBnaXQuZ2l0aHViLmdyYXBocWwoUFJTX1FVRVJZLCBwYXJhbXMpKSBhcyB0eXBlb2YgUFJTX1FVRVJZO1xuICAgIHBycy5wdXNoKC4uLnJlc3VsdHMucmVwb3NpdG9yeS5wdWxsUmVxdWVzdHMubm9kZXMpO1xuICAgIGhhc05leHRQYWdlID0gcmVzdWx0cy5yZXBvc2l0b3J5LnB1bGxSZXF1ZXN0cy5wYWdlSW5mby5oYXNOZXh0UGFnZTtcbiAgICBjdXJzb3IgPSByZXN1bHRzLnJlcG9zaXRvcnkucHVsbFJlcXVlc3RzLnBhZ2VJbmZvLmVuZEN1cnNvcjtcbiAgfVxuICByZXR1cm4gcHJzO1xufVxuIl19