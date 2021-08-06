"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGithubTokenOption = void 0;
const console_1 = require("../console");
const authenticated_git_client_1 = require("./authenticated-git-client");
const github_urls_1 = require("./github-urls");
/** Sets up the `github-token` command option for the given Yargs instance. */
function addGithubTokenOption(yargs) {
    return (yargs
        // 'github-token' is casted to 'githubToken' to properly set up typings to reflect the key in
        // the Argv object being camelCase rather than kebab case due to the `camel-case-expansion`
        // config: https://github.com/yargs/yargs-parser#camel-case-expansion
        .option('github-token', {
        type: 'string',
        description: 'Github token. If not set, token is retrieved from the environment variables.',
        coerce: (token) => {
            const githubToken = token || process.env.GITHUB_TOKEN || process.env.TOKEN;
            if (!githubToken) {
                console_1.error(console_1.red('No Github token set. Please set the `GITHUB_TOKEN` environment variable.'));
                console_1.error(console_1.red('Alternatively, pass the `--github-token` command line flag.'));
                console_1.error(console_1.yellow(`You can generate a token here: ${github_urls_1.GITHUB_TOKEN_GENERATE_URL}`));
                process.exit(1);
            }
            try {
                authenticated_git_client_1.AuthenticatedGitClient.get();
            }
            catch {
                authenticated_git_client_1.AuthenticatedGitClient.configure(githubToken);
            }
            return githubToken;
        },
    })
        .default('github-token', '', '<LOCAL TOKEN>'));
}
exports.addGithubTokenOption = addGithubTokenOption;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXlhcmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2dpdC9naXRodWIteWFyZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBSUgsd0NBQThDO0FBRTlDLHlFQUFrRTtBQUNsRSwrQ0FBd0Q7QUFJeEQsOEVBQThFO0FBQzlFLFNBQWdCLG9CQUFvQixDQUFDLEtBQVc7SUFDOUMsT0FBTyxDQUNMLEtBQUs7UUFDSCw2RkFBNkY7UUFDN0YsMkZBQTJGO1FBQzNGLHFFQUFxRTtTQUNwRSxNQUFNLENBQUMsY0FBK0IsRUFBRTtRQUN2QyxJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSw4RUFBOEU7UUFDM0YsTUFBTSxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7WUFDeEIsTUFBTSxXQUFXLEdBQUcsS0FBSyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBQzNFLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2hCLGVBQUssQ0FBQyxhQUFHLENBQUMsMEVBQTBFLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixlQUFLLENBQUMsYUFBRyxDQUFDLDZEQUE2RCxDQUFDLENBQUMsQ0FBQztnQkFDMUUsZUFBSyxDQUFDLGdCQUFNLENBQUMsa0NBQWtDLHVDQUF5QixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSTtnQkFDRixpREFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUM5QjtZQUFDLE1BQU07Z0JBQ04saURBQXNCLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQy9DO1lBQ0QsT0FBTyxXQUFXLENBQUM7UUFDckIsQ0FBQztLQUNGLENBQUM7U0FDRCxPQUFPLENBQUMsY0FBK0IsRUFBRSxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQ2pFLENBQUM7QUFDSixDQUFDO0FBM0JELG9EQTJCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3Z9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtlcnJvciwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuXG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4vYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH0gZnJvbSAnLi9naXRodWItdXJscyc7XG5cbmV4cG9ydCB0eXBlIEFyZ3ZXaXRoR2l0aHViVG9rZW4gPSBBcmd2PHtnaXRodWJUb2tlbjogc3RyaW5nfT47XG5cbi8qKiBTZXRzIHVwIHRoZSBgZ2l0aHViLXRva2VuYCBjb21tYW5kIG9wdGlvbiBmb3IgdGhlIGdpdmVuIFlhcmdzIGluc3RhbmNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEdpdGh1YlRva2VuT3B0aW9uKHlhcmdzOiBBcmd2KTogQXJndldpdGhHaXRodWJUb2tlbiB7XG4gIHJldHVybiAoXG4gICAgeWFyZ3NcbiAgICAgIC8vICdnaXRodWItdG9rZW4nIGlzIGNhc3RlZCB0byAnZ2l0aHViVG9rZW4nIHRvIHByb3Blcmx5IHNldCB1cCB0eXBpbmdzIHRvIHJlZmxlY3QgdGhlIGtleSBpblxuICAgICAgLy8gdGhlIEFyZ3Ygb2JqZWN0IGJlaW5nIGNhbWVsQ2FzZSByYXRoZXIgdGhhbiBrZWJhYiBjYXNlIGR1ZSB0byB0aGUgYGNhbWVsLWNhc2UtZXhwYW5zaW9uYFxuICAgICAgLy8gY29uZmlnOiBodHRwczovL2dpdGh1Yi5jb20veWFyZ3MveWFyZ3MtcGFyc2VyI2NhbWVsLWNhc2UtZXhwYW5zaW9uXG4gICAgICAub3B0aW9uKCdnaXRodWItdG9rZW4nIGFzICdnaXRodWJUb2tlbicsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnR2l0aHViIHRva2VuLiBJZiBub3Qgc2V0LCB0b2tlbiBpcyByZXRyaWV2ZWQgZnJvbSB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLicsXG4gICAgICAgIGNvZXJjZTogKHRva2VuOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBjb25zdCBnaXRodWJUb2tlbiA9IHRva2VuIHx8IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTiB8fCBwcm9jZXNzLmVudi5UT0tFTjtcbiAgICAgICAgICBpZiAoIWdpdGh1YlRva2VuKSB7XG4gICAgICAgICAgICBlcnJvcihyZWQoJ05vIEdpdGh1YiB0b2tlbiBzZXQuIFBsZWFzZSBzZXQgdGhlIGBHSVRIVUJfVE9LRU5gIGVudmlyb25tZW50IHZhcmlhYmxlLicpKTtcbiAgICAgICAgICAgIGVycm9yKHJlZCgnQWx0ZXJuYXRpdmVseSwgcGFzcyB0aGUgYC0tZ2l0aHViLXRva2VuYCBjb21tYW5kIGxpbmUgZmxhZy4nKSk7XG4gICAgICAgICAgICBlcnJvcih5ZWxsb3coYFlvdSBjYW4gZ2VuZXJhdGUgYSB0b2tlbiBoZXJlOiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9YCkpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuY29uZmlndXJlKGdpdGh1YlRva2VuKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGdpdGh1YlRva2VuO1xuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIC5kZWZhdWx0KCdnaXRodWItdG9rZW4nIGFzICdnaXRodWJUb2tlbicsICcnLCAnPExPQ0FMIFRPS0VOPicpXG4gICk7XG59XG4iXX0=