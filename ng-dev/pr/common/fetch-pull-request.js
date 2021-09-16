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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2gtcHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL2NvbW1vbi9mZXRjaC1wdWxsLXJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsdURBQStEO0FBRS9ELCtDQUF5QztBQUV6Qyx1RUFBdUU7QUFDdkUsTUFBTSxTQUFTLEdBQUc7SUFDaEIsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUN4QixPQUFPLEVBQUUsd0JBQVksQ0FBQyxPQUFPO0lBQzdCLEtBQUssRUFBRSx3QkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFVLENBQUM7SUFDaEUsTUFBTSxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUMzQixnR0FBZ0c7SUFDaEcsdUNBQXVDO0lBQ3ZDLE9BQU8sRUFBRSxJQUFBLHlCQUFNLEVBQ2IsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFDLEVBQ1g7UUFDRSxVQUFVLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQy9CLEtBQUssRUFBRTtZQUNMO2dCQUNFLE1BQU0sRUFBRTtvQkFDTixNQUFNLEVBQUU7d0JBQ04sS0FBSyxFQUFFLHdCQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQVUsQ0FBQztxQkFDdEU7b0JBQ0QsT0FBTyxFQUFFLHdCQUFZLENBQUMsTUFBTTtpQkFDN0I7YUFDRjtTQUNGO0tBQ0YsQ0FDRjtJQUNELFdBQVcsRUFBRSx3QkFBWSxDQUFDLE1BQU07SUFDaEMsS0FBSyxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUMxQixNQUFNLEVBQUUsSUFBQSx5QkFBTSxFQUNaLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBQyxFQUNaO1FBQ0UsS0FBSyxFQUFFO1lBQ0w7Z0JBQ0UsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUMxQjtTQUNGO0tBQ0YsQ0FDRjtDQUNGLENBQUM7QUFLRiw2RUFBNkU7QUFDdEUsS0FBSyxVQUFVLDBCQUEwQixDQUM5QyxHQUEyQixFQUMzQixRQUFnQjtJQUVoQixPQUFPLE1BQU0sSUFBQSxjQUFLLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBTEQsZ0VBS0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwYXJhbXMsIHR5cGVzIGFzIGdyYXBocWxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuLyoqIEdyYXBocWwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSB0aGUgcmVxdWVzdGVkIHB1bGwgcmVxdWVzdC4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBpc0RyYWZ0OiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgc3RhdGU6IGdyYXBocWxUeXBlcy5vbmVPZihbJ09QRU4nLCAnTUVSR0VEJywgJ0NMT1NFRCddIGFzIGNvbnN0KSxcbiAgbnVtYmVyOiBncmFwaHFsVHlwZXMubnVtYmVyLFxuICAvLyBPbmx5IHRoZSBsYXN0IDEwMCBjb21taXRzIGZyb20gYSBwdWxsIHJlcXVlc3QgYXJlIG9idGFpbmVkIGFzIHdlIGxpa2VseSB3aWxsIG5ldmVyIHNlZSBhIHB1bGxcbiAgLy8gcmVxdWVzdHMgd2l0aCBtb3JlIHRoYW4gMTAwIGNvbW1pdHMuXG4gIGNvbW1pdHM6IHBhcmFtcyhcbiAgICB7bGFzdDogMTAwfSxcbiAgICB7XG4gICAgICB0b3RhbENvdW50OiBncmFwaHFsVHlwZXMubnVtYmVyLFxuICAgICAgbm9kZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGNvbW1pdDoge1xuICAgICAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgICAgIHN0YXRlOiBncmFwaHFsVHlwZXMub25lT2YoWydGQUlMVVJFJywgJ1BFTkRJTkcnLCAnU1VDQ0VTUyddIGFzIGNvbnN0KSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZXNzYWdlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICksXG4gIGJhc2VSZWZOYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgbGFiZWxzOiBwYXJhbXMoXG4gICAge2ZpcnN0OiAxMDB9LFxuICAgIHtcbiAgICAgIG5vZGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICApLFxufTtcblxuLyoqIEEgcHVsbCByZXF1ZXN0IHJldHJpZXZlZCBmcm9tIGdpdGh1YiB2aWEgdGhlIGdyYXBocWwgQVBJLiAqL1xuZXhwb3J0IHR5cGUgUmF3UHVsbFJlcXVlc3QgPSB0eXBlb2YgUFJfU0NIRU1BO1xuXG4vKiogRmV0Y2hlcyBhIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gUmV0dXJucyBudWxsIGlmIGFuIGVycm9yIG9jY3VycmVkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKFxuICBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsXG4gIHByTnVtYmVyOiBudW1iZXIsXG4pOiBQcm9taXNlPFJhd1B1bGxSZXF1ZXN0IHwgbnVsbD4ge1xuICByZXR1cm4gYXdhaXQgZ2V0UHIoUFJfU0NIRU1BLCBwck51bWJlciwgZ2l0KTtcbn1cbiJdfQ==