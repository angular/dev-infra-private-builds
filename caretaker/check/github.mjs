/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { alias, onUnion, params, types } from 'typed-graphqlify';
import { bold, debug, info } from '../../utils/console';
import { BaseModule } from './base';
/** The fragment for a result from Github's api for a Github query. */
const GithubQueryResultFragment = {
    issueCount: types.number,
    nodes: [Object.assign({}, onUnion({
            PullRequest: {
                url: types.string,
            },
            Issue: {
                url: types.string,
            },
        }))],
};
/**
 * Cap the returned issues in the queries to an arbitrary 20. At that point, caretaker has a lot
 * of work to do and showing more than that isn't really useful.
 */
const MAX_RETURNED_ISSUES = 20;
export class GithubQueriesModule extends BaseModule {
    retrieveData() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Non-null assertion is used here as the check for undefined immediately follows to confirm the
            // assertion.  Typescript's type filtering does not seem to work as needed to understand
            // whether githubQueries is undefined or not.
            let queries = (_a = this.config.caretaker) === null || _a === void 0 ? void 0 : _a.githubQueries;
            if (queries === undefined || queries.length === 0) {
                debug('No github queries defined in the configuration, skipping');
                return;
            }
            /** The results of the generated github query. */
            const queryResult = yield this.git.github.graphql(this.buildGraphqlQuery(queries));
            const results = Object.values(queryResult);
            const { owner, name: repo } = this.git.remoteConfig;
            return results.map((result, i) => {
                return {
                    queryName: queries[i].name,
                    count: result.issueCount,
                    queryUrl: encodeURI(`https://github.com/${owner}/${repo}/issues?q=${queries[i].query}`),
                    matchedUrls: result.nodes.map(node => node.url)
                };
            });
        });
    }
    /** Build a Graphql query statement for the provided queries. */
    buildGraphqlQuery(queries) {
        /** The query object for graphql. */
        const graphqlQuery = {};
        const { owner, name: repo } = this.git.remoteConfig;
        /** The Github search filter for the configured repository. */
        const repoFilter = `repo:${owner}/${repo}`;
        queries.forEach(({ name, query }) => {
            /** The name of the query, with spaces removed to match Graphql requirements. */
            const queryKey = alias(name.replace(/ /g, ''), 'search');
            graphqlQuery[queryKey] = params({
                type: 'ISSUE',
                first: MAX_RETURNED_ISSUES,
                query: `"${repoFilter} ${query.replace(/"/g, '\\"')}"`,
            }, Object.assign({}, GithubQueryResultFragment));
        });
        return graphqlQuery;
    }
    printToTerminal() {
        return __awaiter(this, void 0, void 0, function* () {
            const queryResults = yield this.data;
            if (!queryResults) {
                return;
            }
            info.group(bold('Github Tasks'));
            const minQueryNameLength = Math.max(...queryResults.map(result => result.queryName.length));
            for (const queryResult of queryResults) {
                info(`${queryResult.queryName.padEnd(minQueryNameLength)}  ${queryResult.count}`);
                if (queryResult.count > 0) {
                    info.group(queryResult.queryUrl);
                    queryResult.matchedUrls.forEach(url => info(`- ${url}`));
                    if (queryResult.count > MAX_RETURNED_ISSUES) {
                        info(`... ${queryResult.count - MAX_RETURNED_ISSUES} additional matches`);
                    }
                    info.groupEnd();
                }
            }
            info.groupEnd();
            info();
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jaGVjay9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUUvRCxPQUFPLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUV0RCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBVWxDLHNFQUFzRTtBQUN0RSxNQUFNLHlCQUF5QixHQUFHO0lBQ2hDLFVBQVUsRUFBRSxLQUFLLENBQUMsTUFBTTtJQUN4QixLQUFLLEVBQUUsbUJBQUssT0FBTyxDQUFDO1lBQ2xCLFdBQVcsRUFBRTtnQkFDWCxHQUFHLEVBQUUsS0FBSyxDQUFDLE1BQU07YUFDbEI7WUFDRCxLQUFLLEVBQUU7Z0JBQ0wsR0FBRyxFQUFFLEtBQUssQ0FBQyxNQUFNO2FBQ2xCO1NBQ0YsQ0FBQyxFQUFFO0NBQ0wsQ0FBQztBQU9GOzs7R0FHRztBQUNILE1BQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0FBRS9CLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxVQUFtQztJQUNwRSxZQUFZOzs7WUFDaEIsZ0dBQWdHO1lBQ2hHLHdGQUF3RjtZQUN4Riw2Q0FBNkM7WUFDN0MsSUFBSSxPQUFPLEdBQUcsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsMENBQUUsYUFBYyxDQUFDO1lBQ3BELElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDakQsS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7Z0JBQ2xFLE9BQU87YUFDUjtZQUVELGlEQUFpRDtZQUNqRCxNQUFNLFdBQVcsR0FB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Q0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3pELElBQUksV0FBVyxDQUFDLEtBQUssR0FBRyxtQkFBbUIsRUFBRTt3QkFDM0MsSUFBSSxDQUFDLE9BQU8sV0FBVyxDQUFDLEtBQUssR0FBRyxtQkFBbUIscUJBQXFCLENBQUMsQ0FBQztxQkFDM0U7b0JBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUNqQjthQUNGO1lBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLElBQUksRUFBRSxDQUFDO1FBQ1QsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthbGlhcywgb25VbmlvbiwgcGFyYW1zLCB0eXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbmltcG9ydCB7Ym9sZCwgZGVidWcsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge0Jhc2VNb2R1bGV9IGZyb20gJy4vYmFzZSc7XG5cbi8qKiBBIGxpc3Qgb2YgZ2VuZXJhdGVkIHJlc3VsdHMgZm9yIGEgZ2l0aHViIHF1ZXJ5LiAqL1xudHlwZSBHaXRodWJRdWVyeVJlc3VsdHMgPSB7XG4gIHF1ZXJ5TmFtZTogc3RyaW5nLFxuICBjb3VudDogbnVtYmVyLFxuICBxdWVyeVVybDogc3RyaW5nLFxuICBtYXRjaGVkVXJsczogc3RyaW5nW10sXG59W107XG5cbi8qKiBUaGUgZnJhZ21lbnQgZm9yIGEgcmVzdWx0IGZyb20gR2l0aHViJ3MgYXBpIGZvciBhIEdpdGh1YiBxdWVyeS4gKi9cbmNvbnN0IEdpdGh1YlF1ZXJ5UmVzdWx0RnJhZ21lbnQgPSB7XG4gIGlzc3VlQ291bnQ6IHR5cGVzLm51bWJlcixcbiAgbm9kZXM6IFt7Li4ub25Vbmlvbih7XG4gICAgUHVsbFJlcXVlc3Q6IHtcbiAgICAgIHVybDogdHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gICAgSXNzdWU6IHtcbiAgICAgIHVybDogdHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0pfV0sXG59O1xuXG4vKiogQW4gb2JqZWN0IGNvbnRhaW5pbmcgcmVzdWx0cyBvZiBtdWx0aXBsZSBxdWVyaWVzLiAgKi9cbnR5cGUgR2l0aHViUXVlcnlSZXN1bHQgPSB7XG4gIFtrZXk6IHN0cmluZ106IHR5cGVvZiBHaXRodWJRdWVyeVJlc3VsdEZyYWdtZW50O1xufTtcblxuLyoqXG4gKiBDYXAgdGhlIHJldHVybmVkIGlzc3VlcyBpbiB0aGUgcXVlcmllcyB0byBhbiBhcmJpdHJhcnkgMjAuIEF0IHRoYXQgcG9pbnQsIGNhcmV0YWtlciBoYXMgYSBsb3RcbiAqIG9mIHdvcmsgdG8gZG8gYW5kIHNob3dpbmcgbW9yZSB0aGFuIHRoYXQgaXNuJ3QgcmVhbGx5IHVzZWZ1bC5cbiAqL1xuY29uc3QgTUFYX1JFVFVSTkVEX0lTU1VFUyA9IDIwO1xuXG5leHBvcnQgY2xhc3MgR2l0aHViUXVlcmllc01vZHVsZSBleHRlbmRzIEJhc2VNb2R1bGU8R2l0aHViUXVlcnlSZXN1bHRzfHZvaWQ+IHtcbiAgYXN5bmMgcmV0cmlldmVEYXRhKCkge1xuICAgIC8vIE5vbi1udWxsIGFzc2VydGlvbiBpcyB1c2VkIGhlcmUgYXMgdGhlIGNoZWNrIGZvciB1bmRlZmluZWQgaW1tZWRpYXRlbHkgZm9sbG93cyB0byBjb25maXJtIHRoZVxuICAgIC8vIGFzc2VydGlvbi4gIFR5cGVzY3JpcHQncyB0eXBlIGZpbHRlcmluZyBkb2VzIG5vdCBzZWVtIHRvIHdvcmsgYXMgbmVlZGVkIHRvIHVuZGVyc3RhbmRcbiAgICAvLyB3aGV0aGVyIGdpdGh1YlF1ZXJpZXMgaXMgdW5kZWZpbmVkIG9yIG5vdC5cbiAgICBsZXQgcXVlcmllcyA9IHRoaXMuY29uZmlnLmNhcmV0YWtlcj8uZ2l0aHViUXVlcmllcyE7XG4gICAgaWYgKHF1ZXJpZXMgPT09IHVuZGVmaW5lZCB8fCBxdWVyaWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZGVidWcoJ05vIGdpdGh1YiBxdWVyaWVzIGRlZmluZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24sIHNraXBwaW5nJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLyoqIFRoZSByZXN1bHRzIG9mIHRoZSBnZW5lcmF0ZWQgZ2l0aHViIHF1ZXJ5LiAqL1xuICAgIGNvbnN0IHF1ZXJ5UmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdyYXBocWwodGhpcy5idWlsZEdyYXBocWxRdWVyeShxdWVyaWVzKSk7XG4gICAgY29uc3QgcmVzdWx0cyA9IE9iamVjdC52YWx1ZXMocXVlcnlSZXN1bHQpO1xuXG4gICAgY29uc3Qge293bmVyLCBuYW1lOiByZXBvfSA9IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZztcblxuICAgIHJldHVybiByZXN1bHRzLm1hcCgocmVzdWx0LCBpKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBxdWVyeU5hbWU6IHF1ZXJpZXNbaV0ubmFtZSxcbiAgICAgICAgY291bnQ6IHJlc3VsdC5pc3N1ZUNvdW50LFxuICAgICAgICBxdWVyeVVybDogZW5jb2RlVVJJKGBodHRwczovL2dpdGh1Yi5jb20vJHtvd25lcn0vJHtyZXBvfS9pc3N1ZXM/cT0ke3F1ZXJpZXNbaV0ucXVlcnl9YCksXG4gICAgICAgIG1hdGNoZWRVcmxzOiByZXN1bHQubm9kZXMubWFwKG5vZGUgPT4gbm9kZS51cmwpXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEJ1aWxkIGEgR3JhcGhxbCBxdWVyeSBzdGF0ZW1lbnQgZm9yIHRoZSBwcm92aWRlZCBxdWVyaWVzLiAqL1xuICBwcml2YXRlIGJ1aWxkR3JhcGhxbFF1ZXJ5KHF1ZXJpZXM6IE5vbk51bGxhYmxlPENhcmV0YWtlckNvbmZpZ1snZ2l0aHViUXVlcmllcyddPikge1xuICAgIC8qKiBUaGUgcXVlcnkgb2JqZWN0IGZvciBncmFwaHFsLiAqL1xuICAgIGNvbnN0IGdyYXBocWxRdWVyeTogR2l0aHViUXVlcnlSZXN1bHQgPSB7fTtcbiAgICBjb25zdCB7b3duZXIsIG5hbWU6IHJlcG99ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuICAgIC8qKiBUaGUgR2l0aHViIHNlYXJjaCBmaWx0ZXIgZm9yIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gICAgY29uc3QgcmVwb0ZpbHRlciA9IGByZXBvOiR7b3duZXJ9LyR7cmVwb31gO1xuXG5cbiAgICBxdWVyaWVzLmZvckVhY2goKHtuYW1lLCBxdWVyeX0pID0+IHtcbiAgICAgIC8qKiBUaGUgbmFtZSBvZiB0aGUgcXVlcnksIHdpdGggc3BhY2VzIHJlbW92ZWQgdG8gbWF0Y2ggR3JhcGhxbCByZXF1aXJlbWVudHMuICovXG4gICAgICBjb25zdCBxdWVyeUtleSA9IGFsaWFzKG5hbWUucmVwbGFjZSgvIC9nLCAnJyksICdzZWFyY2gnKTtcbiAgICAgIGdyYXBocWxRdWVyeVtxdWVyeUtleV0gPSBwYXJhbXMoXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ0lTU1VFJyxcbiAgICAgICAgICAgIGZpcnN0OiBNQVhfUkVUVVJORURfSVNTVUVTLFxuICAgICAgICAgICAgcXVlcnk6IGBcIiR7cmVwb0ZpbHRlcn0gJHtxdWVyeS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJgLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgey4uLkdpdGh1YlF1ZXJ5UmVzdWx0RnJhZ21lbnR9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBncmFwaHFsUXVlcnk7XG4gIH1cblxuICBhc3luYyBwcmludFRvVGVybWluYWwoKSB7XG4gICAgY29uc3QgcXVlcnlSZXN1bHRzID0gYXdhaXQgdGhpcy5kYXRhO1xuICAgIGlmICghcXVlcnlSZXN1bHRzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluZm8uZ3JvdXAoYm9sZCgnR2l0aHViIFRhc2tzJykpO1xuICAgIGNvbnN0IG1pblF1ZXJ5TmFtZUxlbmd0aCA9IE1hdGgubWF4KC4uLnF1ZXJ5UmVzdWx0cy5tYXAocmVzdWx0ID0+IHJlc3VsdC5xdWVyeU5hbWUubGVuZ3RoKSk7XG4gICAgZm9yIChjb25zdCBxdWVyeVJlc3VsdCBvZiBxdWVyeVJlc3VsdHMpIHtcbiAgICAgIGluZm8oYCR7cXVlcnlSZXN1bHQucXVlcnlOYW1lLnBhZEVuZChtaW5RdWVyeU5hbWVMZW5ndGgpfSAgJHtxdWVyeVJlc3VsdC5jb3VudH1gKTtcblxuICAgICAgaWYgKHF1ZXJ5UmVzdWx0LmNvdW50ID4gMCkge1xuICAgICAgICBpbmZvLmdyb3VwKHF1ZXJ5UmVzdWx0LnF1ZXJ5VXJsKTtcbiAgICAgICAgcXVlcnlSZXN1bHQubWF0Y2hlZFVybHMuZm9yRWFjaCh1cmwgPT4gaW5mbyhgLSAke3VybH1gKSk7XG4gICAgICAgIGlmIChxdWVyeVJlc3VsdC5jb3VudCA+IE1BWF9SRVRVUk5FRF9JU1NVRVMpIHtcbiAgICAgICAgICBpbmZvKGAuLi4gJHtxdWVyeVJlc3VsdC5jb3VudCAtIE1BWF9SRVRVUk5FRF9JU1NVRVN9IGFkZGl0aW9uYWwgbWF0Y2hlc2ApO1xuICAgICAgICB9XG4gICAgICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcbiAgfVxufVxuIl19