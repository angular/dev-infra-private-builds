/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { error, red, yellow } from '../console';
import { AuthenticatedGitClient } from './authenticated-git-client';
import { GITHUB_TOKEN_GENERATE_URL } from './github-urls';
/** Sets up the `github-token` command option for the given Yargs instance. */
export function addGithubTokenOption(yargs) {
    return yargs
        // 'github-token' is casted to 'githubToken' to properly set up typings to reflect the key in
        // the Argv object being camelCase rather than kebab case due to the `camel-case-expansion`
        // config: https://github.com/yargs/yargs-parser#camel-case-expansion
        .option('github-token', {
        type: 'string',
        description: 'Github token. If not set, token is retrieved from the environment variables.',
        coerce: function (token) {
            var githubToken = token || process.env.GITHUB_TOKEN || process.env.TOKEN;
            if (!githubToken) {
                error(red('No Github token set. Please set the `GITHUB_TOKEN` environment variable.'));
                error(red('Alternatively, pass the `--github-token` command line flag.'));
                error(yellow("You can generate a token here: " + GITHUB_TOKEN_GENERATE_URL));
                process.exit(1);
            }
            try {
                AuthenticatedGitClient.get();
            }
            catch (_a) {
                AuthenticatedGitClient.configure(githubToken);
            }
            return githubToken;
        },
    })
        .default('github-token', '', '<LOCAL TOKEN>');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXlhcmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIteWFyZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRTlDLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ2xFLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUl4RCw4RUFBOEU7QUFDOUUsTUFBTSxVQUFVLG9CQUFvQixDQUFDLEtBQVc7SUFDOUMsT0FBTyxLQUFLO1FBQ1IsNkZBQTZGO1FBQzdGLDJGQUEyRjtRQUMzRixxRUFBcUU7U0FDcEUsTUFBTSxDQUFDLGNBQStCLEVBQUU7UUFDdkMsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsOEVBQThFO1FBQzNGLE1BQU0sRUFBRSxVQUFDLEtBQWE7WUFDcEIsSUFBTSxXQUFXLEdBQUcsS0FBSyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBQzNFLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2hCLEtBQUssQ0FBQyxHQUFHLENBQUMsMEVBQTBFLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixLQUFLLENBQUMsR0FBRyxDQUFDLDZEQUE2RCxDQUFDLENBQUMsQ0FBQztnQkFDMUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxvQ0FBa0MseUJBQTJCLENBQUMsQ0FBQyxDQUFDO2dCQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSTtnQkFDRixzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUM5QjtZQUFDLFdBQU07Z0JBQ04sc0JBQXNCLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQy9DO1lBQ0QsT0FBTyxXQUFXLENBQUM7UUFDckIsQ0FBQztLQUNGLENBQUM7U0FDRCxPQUFPLENBQUMsY0FBK0IsRUFBRSxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDckUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3Z9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtlcnJvciwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuXG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4vYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH0gZnJvbSAnLi9naXRodWItdXJscyc7XG5cbmV4cG9ydCB0eXBlIEFyZ3ZXaXRoR2l0aHViVG9rZW4gPSBBcmd2PHtnaXRodWJUb2tlbjogc3RyaW5nfT47XG5cbi8qKiBTZXRzIHVwIHRoZSBgZ2l0aHViLXRva2VuYCBjb21tYW5kIG9wdGlvbiBmb3IgdGhlIGdpdmVuIFlhcmdzIGluc3RhbmNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEdpdGh1YlRva2VuT3B0aW9uKHlhcmdzOiBBcmd2KTogQXJndldpdGhHaXRodWJUb2tlbiB7XG4gIHJldHVybiB5YXJnc1xuICAgICAgLy8gJ2dpdGh1Yi10b2tlbicgaXMgY2FzdGVkIHRvICdnaXRodWJUb2tlbicgdG8gcHJvcGVybHkgc2V0IHVwIHR5cGluZ3MgdG8gcmVmbGVjdCB0aGUga2V5IGluXG4gICAgICAvLyB0aGUgQXJndiBvYmplY3QgYmVpbmcgY2FtZWxDYXNlIHJhdGhlciB0aGFuIGtlYmFiIGNhc2UgZHVlIHRvIHRoZSBgY2FtZWwtY2FzZS1leHBhbnNpb25gXG4gICAgICAvLyBjb25maWc6IGh0dHBzOi8vZ2l0aHViLmNvbS95YXJncy95YXJncy1wYXJzZXIjY2FtZWwtY2FzZS1leHBhbnNpb25cbiAgICAgIC5vcHRpb24oJ2dpdGh1Yi10b2tlbicgYXMgJ2dpdGh1YlRva2VuJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdHaXRodWIgdG9rZW4uIElmIG5vdCBzZXQsIHRva2VuIGlzIHJldHJpZXZlZCBmcm9tIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMuJyxcbiAgICAgICAgY29lcmNlOiAodG9rZW46IHN0cmluZykgPT4ge1xuICAgICAgICAgIGNvbnN0IGdpdGh1YlRva2VuID0gdG9rZW4gfHwgcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOIHx8IHByb2Nlc3MuZW52LlRPS0VOO1xuICAgICAgICAgIGlmICghZ2l0aHViVG9rZW4pIHtcbiAgICAgICAgICAgIGVycm9yKHJlZCgnTm8gR2l0aHViIHRva2VuIHNldC4gUGxlYXNlIHNldCB0aGUgYEdJVEhVQl9UT0tFTmAgZW52aXJvbm1lbnQgdmFyaWFibGUuJykpO1xuICAgICAgICAgICAgZXJyb3IocmVkKCdBbHRlcm5hdGl2ZWx5LCBwYXNzIHRoZSBgLS1naXRodWItdG9rZW5gIGNvbW1hbmQgbGluZSBmbGFnLicpKTtcbiAgICAgICAgICAgIGVycm9yKHllbGxvdyhgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgQXV0aGVudGljYXRlZEdpdENsaWVudC5jb25maWd1cmUoZ2l0aHViVG9rZW4pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZ2l0aHViVG9rZW47XG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICAgLmRlZmF1bHQoJ2dpdGh1Yi10b2tlbicgYXMgJ2dpdGh1YlRva2VuJywgJycsICc8TE9DQUwgVE9LRU4+Jyk7XG59XG4iXX0=