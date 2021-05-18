/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { error, red, yellow } from '../console';
import { GITHUB_TOKEN_GENERATE_URL } from './github-urls';
import { GitClient } from './index';
/** Sets up the `github-token` command option for the given Yargs instance. */
export function addGithubTokenOption(yargs) {
    return yargs
        // 'github-token' is casted to 'githubToken' to properly set up typings to reflect the key in
        // the Argv object being camelCase rather than kebob case due to the `camel-case-expansion`
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
                GitClient.getAuthenticatedInstance();
            }
            catch (_a) {
                GitClient.authenticateWithToken(githubToken);
            }
            return githubToken;
        },
    })
        .default('github-token', '', '<LOCAL TOKEN>');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXlhcmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIteWFyZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRTlDLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN4RCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBSWxDLDhFQUE4RTtBQUM5RSxNQUFNLFVBQVUsb0JBQW9CLENBQUMsS0FBVztJQUM5QyxPQUFPLEtBQUs7UUFDUiw2RkFBNkY7UUFDN0YsMkZBQTJGO1FBQzNGLHFFQUFxRTtTQUNwRSxNQUFNLENBQUMsY0FBK0IsRUFBRTtRQUN2QyxJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSw4RUFBOEU7UUFDM0YsTUFBTSxFQUFFLFVBQUMsS0FBYTtZQUNwQixJQUFNLFdBQVcsR0FBRyxLQUFLLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDM0UsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsS0FBSyxDQUFDLEdBQUcsQ0FBQywwRUFBMEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZGLEtBQUssQ0FBQyxHQUFHLENBQUMsNkRBQTZELENBQUMsQ0FBQyxDQUFDO2dCQUMxRSxLQUFLLENBQUMsTUFBTSxDQUFDLG9DQUFrQyx5QkFBMkIsQ0FBQyxDQUFDLENBQUM7Z0JBQzdFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakI7WUFDRCxJQUFJO2dCQUNGLFNBQVMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2FBQ3RDO1lBQUMsV0FBTTtnQkFDTixTQUFTLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDOUM7WUFDRCxPQUFPLFdBQVcsQ0FBQztRQUNyQixDQUFDO0tBQ0YsQ0FBQztTQUNELE9BQU8sQ0FBQyxjQUErQixFQUFFLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndn0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2Vycm9yLCByZWQsIHllbGxvd30gZnJvbSAnLi4vY29uc29sZSc7XG5cbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH0gZnJvbSAnLi9naXRodWItdXJscyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCB0eXBlIEFyZ3ZXaXRoR2l0aHViVG9rZW4gPSBBcmd2PHtnaXRodWJUb2tlbjogc3RyaW5nfT47XG5cbi8qKiBTZXRzIHVwIHRoZSBgZ2l0aHViLXRva2VuYCBjb21tYW5kIG9wdGlvbiBmb3IgdGhlIGdpdmVuIFlhcmdzIGluc3RhbmNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEdpdGh1YlRva2VuT3B0aW9uKHlhcmdzOiBBcmd2KTogQXJndldpdGhHaXRodWJUb2tlbiB7XG4gIHJldHVybiB5YXJnc1xuICAgICAgLy8gJ2dpdGh1Yi10b2tlbicgaXMgY2FzdGVkIHRvICdnaXRodWJUb2tlbicgdG8gcHJvcGVybHkgc2V0IHVwIHR5cGluZ3MgdG8gcmVmbGVjdCB0aGUga2V5IGluXG4gICAgICAvLyB0aGUgQXJndiBvYmplY3QgYmVpbmcgY2FtZWxDYXNlIHJhdGhlciB0aGFuIGtlYm9iIGNhc2UgZHVlIHRvIHRoZSBgY2FtZWwtY2FzZS1leHBhbnNpb25gXG4gICAgICAvLyBjb25maWc6IGh0dHBzOi8vZ2l0aHViLmNvbS95YXJncy95YXJncy1wYXJzZXIjY2FtZWwtY2FzZS1leHBhbnNpb25cbiAgICAgIC5vcHRpb24oJ2dpdGh1Yi10b2tlbicgYXMgJ2dpdGh1YlRva2VuJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdHaXRodWIgdG9rZW4uIElmIG5vdCBzZXQsIHRva2VuIGlzIHJldHJpZXZlZCBmcm9tIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMuJyxcbiAgICAgICAgY29lcmNlOiAodG9rZW46IHN0cmluZykgPT4ge1xuICAgICAgICAgIGNvbnN0IGdpdGh1YlRva2VuID0gdG9rZW4gfHwgcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOIHx8IHByb2Nlc3MuZW52LlRPS0VOO1xuICAgICAgICAgIGlmICghZ2l0aHViVG9rZW4pIHtcbiAgICAgICAgICAgIGVycm9yKHJlZCgnTm8gR2l0aHViIHRva2VuIHNldC4gUGxlYXNlIHNldCB0aGUgYEdJVEhVQl9UT0tFTmAgZW52aXJvbm1lbnQgdmFyaWFibGUuJykpO1xuICAgICAgICAgICAgZXJyb3IocmVkKCdBbHRlcm5hdGl2ZWx5LCBwYXNzIHRoZSBgLS1naXRodWItdG9rZW5gIGNvbW1hbmQgbGluZSBmbGFnLicpKTtcbiAgICAgICAgICAgIGVycm9yKHllbGxvdyhgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKSk7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBHaXRDbGllbnQuZ2V0QXV0aGVudGljYXRlZEluc3RhbmNlKCk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICBHaXRDbGllbnQuYXV0aGVudGljYXRlV2l0aFRva2VuKGdpdGh1YlRva2VuKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGdpdGh1YlRva2VuO1xuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIC5kZWZhdWx0KCdnaXRodWItdG9rZW4nIGFzICdnaXRodWJUb2tlbicsICcnLCAnPExPQ0FMIFRPS0VOPicpO1xufVxuIl19