"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubQueriesModule = void 0;
const typed_graphqlify_1 = require("typed-graphqlify");
const console_1 = require("../../utils/console");
const base_1 = require("./base");
/** The fragment for a result from Github's api for a Github query. */
const GithubQueryResultFragment = {
    issueCount: typed_graphqlify_1.types.number,
    nodes: [
        {
            ...typed_graphqlify_1.onUnion({
                PullRequest: {
                    url: typed_graphqlify_1.types.string,
                },
                Issue: {
                    url: typed_graphqlify_1.types.string,
                },
            }),
        },
    ],
};
/**
 * Cap the returned issues in the queries to an arbitrary 20. At that point, caretaker has a lot
 * of work to do and showing more than that isn't really useful.
 */
const MAX_RETURNED_ISSUES = 20;
class GithubQueriesModule extends base_1.BaseModule {
    async retrieveData() {
        // Non-null assertion is used here as the check for undefined immediately follows to confirm the
        // assertion.  Typescript's type filtering does not seem to work as needed to understand
        // whether githubQueries is undefined or not.
        let queries = this.config.caretaker?.githubQueries;
        if (queries === undefined || queries.length === 0) {
            console_1.debug('No github queries defined in the configuration, skipping');
            return;
        }
        /** The results of the generated github query. */
        const queryResult = await this.git.github.graphql(this.buildGraphqlQuery(queries));
        const results = Object.values(queryResult);
        const { owner, name: repo } = this.git.remoteConfig;
        return results.map((result, i) => {
            return {
                queryName: queries[i].name,
                count: result.issueCount,
                queryUrl: encodeURI(`https://github.com/${owner}/${repo}/issues?q=${queries[i].query}`),
                matchedUrls: result.nodes.map((node) => node.url),
            };
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
            const queryKey = typed_graphqlify_1.alias(name.replace(/ /g, ''), 'search');
            graphqlQuery[queryKey] = typed_graphqlify_1.params({
                type: 'ISSUE',
                first: MAX_RETURNED_ISSUES,
                query: `"${repoFilter} ${query.replace(/"/g, '\\"')}"`,
            }, { ...GithubQueryResultFragment });
        });
        return graphqlQuery;
    }
    async printToTerminal() {
        const queryResults = await this.data;
        if (!queryResults) {
            return;
        }
        console_1.info.group(console_1.bold('Github Tasks'));
        const minQueryNameLength = Math.max(...queryResults.map((result) => result.queryName.length));
        for (const queryResult of queryResults) {
            console_1.info(`${queryResult.queryName.padEnd(minQueryNameLength)}  ${queryResult.count}`);
            if (queryResult.count > 0) {
                console_1.info.group(queryResult.queryUrl);
                queryResult.matchedUrls.forEach((url) => console_1.info(`- ${url}`));
                if (queryResult.count > MAX_RETURNED_ISSUES) {
                    console_1.info(`... ${queryResult.count - MAX_RETURNED_ISSUES} additional matches`);
                }
                console_1.info.groupEnd();
            }
        }
        console_1.info.groupEnd();
        console_1.info();
    }
}
exports.GithubQueriesModule = GithubQueriesModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9jaGVjay9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsdURBQStEO0FBRS9ELGlEQUFzRDtBQUV0RCxpQ0FBa0M7QUFVbEMsc0VBQXNFO0FBQ3RFLE1BQU0seUJBQXlCLEdBQUc7SUFDaEMsVUFBVSxFQUFFLHdCQUFLLENBQUMsTUFBTTtJQUN4QixLQUFLLEVBQUU7UUFDTDtZQUNFLEdBQUcsMEJBQU8sQ0FBQztnQkFDVCxXQUFXLEVBQUU7b0JBQ1gsR0FBRyxFQUFFLHdCQUFLLENBQUMsTUFBTTtpQkFDbEI7Z0JBQ0QsS0FBSyxFQUFFO29CQUNMLEdBQUcsRUFBRSx3QkFBSyxDQUFDLE1BQU07aUJBQ2xCO2FBQ0YsQ0FBQztTQUNIO0tBQ0Y7Q0FDRixDQUFDO0FBT0Y7OztHQUdHO0FBQ0gsTUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7QUFFL0IsTUFBYSxtQkFBb0IsU0FBUSxpQkFBcUM7SUFDbkUsS0FBSyxDQUFDLFlBQVk7UUFDekIsZ0dBQWdHO1FBQ2hHLHdGQUF3RjtRQUN4Riw2Q0FBNkM7UUFDN0MsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYyxDQUFDO1FBQ3BELElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNqRCxlQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQztZQUNsRSxPQUFPO1NBQ1I7UUFFRCxpREFBaUQ7UUFDakQsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDbkYsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1B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LEVBQUU7b0JBQzNDLGNBQUksQ0FBQyxPQUFPLFdBQVcsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLHFCQUFxQixDQUFDLENBQUM7aUJBQzNFO2dCQUNELGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNqQjtTQUNGO1FBQ0QsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLGNBQUksRUFBRSxDQUFDO0lBQ1QsQ0FBQztDQUNGO0FBekVELGtEQXlFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2FsaWFzLCBvblVuaW9uLCBwYXJhbXMsIHR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtib2xkLCBkZWJ1ZywgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0NhcmV0YWtlckNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7QmFzZU1vZHVsZX0gZnJvbSAnLi9iYXNlJztcblxuLyoqIEEgbGlzdCBvZiBnZW5lcmF0ZWQgcmVzdWx0cyBmb3IgYSBnaXRodWIgcXVlcnkuICovXG50eXBlIEdpdGh1YlF1ZXJ5UmVzdWx0cyA9IHtcbiAgcXVlcnlOYW1lOiBzdHJpbmc7XG4gIGNvdW50OiBudW1iZXI7XG4gIHF1ZXJ5VXJsOiBzdHJpbmc7XG4gIG1hdGNoZWRVcmxzOiBzdHJpbmdbXTtcbn1bXTtcblxuLyoqIFRoZSBmcmFnbWVudCBmb3IgYSByZXN1bHQgZnJvbSBHaXRodWIncyBhcGkgZm9yIGEgR2l0aHViIHF1ZXJ5LiAqL1xuY29uc3QgR2l0aHViUXVlcnlSZXN1bHRGcmFnbWVudCA9IHtcbiAgaXNzdWVDb3VudDogdHlwZXMubnVtYmVyLFxuICBub2RlczogW1xuICAgIHtcbiAgICAgIC4uLm9uVW5pb24oe1xuICAgICAgICBQdWxsUmVxdWVzdDoge1xuICAgICAgICAgIHVybDogdHlwZXMuc3RyaW5nLFxuICAgICAgICB9LFxuICAgICAgICBJc3N1ZToge1xuICAgICAgICAgIHVybDogdHlwZXMuc3RyaW5nLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgfSxcbiAgXSxcbn07XG5cbi8qKiBBbiBvYmplY3QgY29udGFpbmluZyByZXN1bHRzIG9mIG11bHRpcGxlIHF1ZXJpZXMuICAqL1xudHlwZSBHaXRodWJRdWVyeVJlc3VsdCA9IHtcbiAgW2tleTogc3RyaW5nXTogdHlwZW9mIEdpdGh1YlF1ZXJ5UmVzdWx0RnJhZ21lbnQ7XG59O1xuXG4vKipcbiAqIENhcCB0aGUgcmV0dXJuZWQgaXNzdWVzIGluIHRoZSBxdWVyaWVzIHRvIGFuIGFyYml0cmFyeSAyMC4gQXQgdGhhdCBwb2ludCwgY2FyZXRha2VyIGhhcyBhIGxvdFxuICogb2Ygd29yayB0byBkbyBhbmQgc2hvd2luZyBtb3JlIHRoYW4gdGhhdCBpc24ndCByZWFsbHkgdXNlZnVsLlxuICovXG5jb25zdCBNQVhfUkVUVVJORURfSVNTVUVTID0gMjA7XG5cbmV4cG9ydCBjbGFzcyBHaXRodWJRdWVyaWVzTW9kdWxlIGV4dGVuZHMgQmFzZU1vZHVsZTxHaXRodWJRdWVyeVJlc3VsdHMgfCB2b2lkPiB7XG4gIG92ZXJyaWRlIGFzeW5jIHJldHJpZXZlRGF0YSgpIHtcbiAgICAvLyBOb24tbnVsbCBhc3NlcnRpb24gaXMgdXNlZCBoZXJlIGFzIHRoZSBjaGVjayBmb3IgdW5kZWZpbmVkIGltbWVkaWF0ZWx5IGZvbGxvd3MgdG8gY29uZmlybSB0aGVcbiAgICAvLyBhc3NlcnRpb24uICBUeXBlc2NyaXB0J3MgdHlwZSBmaWx0ZXJpbmcgZG9lcyBub3Qgc2VlbSB0byB3b3JrIGFzIG5lZWRlZCB0byB1bmRlcnN0YW5kXG4gICAgLy8gd2hldGhlciBnaXRodWJRdWVyaWVzIGlzIHVuZGVmaW5lZCBvciBub3QuXG4gICAgbGV0IHF1ZXJpZXMgPSB0aGlzLmNvbmZpZy5jYXJldGFrZXI/LmdpdGh1YlF1ZXJpZXMhO1xuICAgIGlmIChxdWVyaWVzID09PSB1bmRlZmluZWQgfHwgcXVlcmllcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGRlYnVnKCdObyBnaXRodWIgcXVlcmllcyBkZWZpbmVkIGluIHRoZSBjb25maWd1cmF0aW9uLCBza2lwcGluZycpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8qKiBUaGUgcmVzdWx0cyBvZiB0aGUgZ2VuZXJhdGVkIGdpdGh1YiBxdWVyeS4gKi9cbiAgICBjb25zdCBxdWVyeVJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5ncmFwaHFsKHRoaXMuYnVpbGRHcmFwaHFsUXVlcnkocXVlcmllcykpO1xuICAgIGNvbnN0IHJlc3VsdHMgPSBPYmplY3QudmFsdWVzKHF1ZXJ5UmVzdWx0KTtcblxuICAgIGNvbnN0IHtvd25lciwgbmFtZTogcmVwb30gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG5cbiAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdCwgaSkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcXVlcnlOYW1lOiBxdWVyaWVzW2ldLm5hbWUsXG4gICAgICAgIGNvdW50OiByZXN1bHQuaXNzdWVDb3VudCxcbiAgICAgICAgcXVlcnlVcmw6IGVuY29kZVVSSShgaHR0cHM6Ly9naXRodWIuY29tLyR7b3duZXJ9LyR7cmVwb30vaXNzdWVzP3E9JHtxdWVyaWVzW2ldLnF1ZXJ5fWApLFxuICAgICAgICBtYXRjaGVkVXJsczogcmVzdWx0Lm5vZGVzLm1hcCgobm9kZSkgPT4gbm9kZS51cmwpLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBCdWlsZCBhIEdyYXBocWwgcXVlcnkgc3RhdGVtZW50IGZvciB0aGUgcHJvdmlkZWQgcXVlcmllcy4gKi9cbiAgcHJpdmF0ZSBidWlsZEdyYXBocWxRdWVyeShxdWVyaWVzOiBOb25OdWxsYWJsZTxDYXJldGFrZXJDb25maWdbJ2dpdGh1YlF1ZXJpZXMnXT4pIHtcbiAgICAvKiogVGhlIHF1ZXJ5IG9iamVjdCBmb3IgZ3JhcGhxbC4gKi9cbiAgICBjb25zdCBncmFwaHFsUXVlcnk6IEdpdGh1YlF1ZXJ5UmVzdWx0ID0ge307XG4gICAgY29uc3Qge293bmVyLCBuYW1lOiByZXBvfSA9IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZztcbiAgICAvKiogVGhlIEdpdGh1YiBzZWFyY2ggZmlsdGVyIGZvciB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICAgIGNvbnN0IHJlcG9GaWx0ZXIgPSBgcmVwbzoke293bmVyfS8ke3JlcG99YDtcblxuICAgIHF1ZXJpZXMuZm9yRWFjaCgoe25hbWUsIHF1ZXJ5fSkgPT4ge1xuICAgICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBxdWVyeSwgd2l0aCBzcGFjZXMgcmVtb3ZlZCB0byBtYXRjaCBHcmFwaHFsIHJlcXVpcmVtZW50cy4gKi9cbiAgICAgIGNvbnN0IHF1ZXJ5S2V5ID0gYWxpYXMobmFtZS5yZXBsYWNlKC8gL2csICcnKSwgJ3NlYXJjaCcpO1xuICAgICAgZ3JhcGhxbFF1ZXJ5W3F1ZXJ5S2V5XSA9IHBhcmFtcyhcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdJU1NVRScsXG4gICAgICAgICAgZmlyc3Q6IE1BWF9SRVRVUk5FRF9JU1NVRVMsXG4gICAgICAgICAgcXVlcnk6IGBcIiR7cmVwb0ZpbHRlcn0gJHtxdWVyeS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJgLFxuICAgICAgICB9LFxuICAgICAgICB7Li4uR2l0aHViUXVlcnlSZXN1bHRGcmFnbWVudH0sXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGdyYXBocWxRdWVyeTtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHByaW50VG9UZXJtaW5hbCgpIHtcbiAgICBjb25zdCBxdWVyeVJlc3VsdHMgPSBhd2FpdCB0aGlzLmRhdGE7XG4gICAgaWYgKCFxdWVyeVJlc3VsdHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW5mby5ncm91cChib2xkKCdHaXRodWIgVGFza3MnKSk7XG4gICAgY29uc3QgbWluUXVlcnlOYW1lTGVuZ3RoID0gTWF0aC5tYXgoLi4ucXVlcnlSZXN1bHRzLm1hcCgocmVzdWx0KSA9PiByZXN1bHQucXVlcnlOYW1lLmxlbmd0aCkpO1xuICAgIGZvciAoY29uc3QgcXVlcnlSZXN1bHQgb2YgcXVlcnlSZXN1bHRzKSB7XG4gICAgICBpbmZvKGAke3F1ZXJ5UmVzdWx0LnF1ZXJ5TmFtZS5wYWRFbmQobWluUXVlcnlOYW1lTGVuZ3RoKX0gICR7cXVlcnlSZXN1bHQuY291bnR9YCk7XG5cbiAgICAgIGlmIChxdWVyeVJlc3VsdC5jb3VudCA+IDApIHtcbiAgICAgICAgaW5mby5ncm91cChxdWVyeVJlc3VsdC5xdWVyeVVybCk7XG4gICAgICAgIHF1ZXJ5UmVzdWx0Lm1hdGNoZWRVcmxzLmZvckVhY2goKHVybCkgPT4gaW5mbyhgLSAke3VybH1gKSk7XG4gICAgICAgIGlmIChxdWVyeVJlc3VsdC5jb3VudCA+IE1BWF9SRVRVUk5FRF9JU1NVRVMpIHtcbiAgICAgICAgICBpbmZvKGAuLi4gJHtxdWVyeVJlc3VsdC5jb3VudCAtIE1BWF9SRVRVUk5FRF9JU1NVRVN9IGFkZGl0aW9uYWwgbWF0Y2hlc2ApO1xuICAgICAgICB9XG4gICAgICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcbiAgfVxufVxuIl19