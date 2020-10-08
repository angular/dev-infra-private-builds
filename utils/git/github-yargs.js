/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/utils/git/github-yargs", ["require", "exports", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github-urls"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addGithubTokenOption = void 0;
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    /** Sets up the `github-token` command option for the given Yargs instance. */
    function addGithubTokenOption(yargs) {
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
                    console_1.error(console_1.red('No Github token set. Please set the `GITHUB_TOKEN` environment variable.'));
                    console_1.error(console_1.red('Alternatively, pass the `--github-token` command line flag.'));
                    console_1.error(console_1.yellow("You can generate a token here: " + github_urls_1.GITHUB_TOKEN_GENERATE_URL));
                    process.exit(1);
                }
                return githubToken;
            },
        })
            .default('github-token', '', '<LOCAL TOKEN>');
    }
    exports.addGithubTokenOption = addGithubTokenOption;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXlhcmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIteWFyZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBR0gsb0VBQThDO0lBQzlDLGdGQUF3RDtJQUl4RCw4RUFBOEU7SUFDOUUsU0FBZ0Isb0JBQW9CLENBQUMsS0FBVztRQUM5QyxPQUFPLEtBQUs7WUFDUiw2RkFBNkY7WUFDN0YsMkZBQTJGO1lBQzNGLHFFQUFxRTthQUNwRSxNQUFNLENBQUMsY0FBK0IsRUFBRTtZQUN2QyxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSw4RUFBOEU7WUFDM0YsTUFBTSxFQUFFLFVBQUMsS0FBYTtnQkFDcEIsSUFBTSxXQUFXLEdBQUcsS0FBSyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO2dCQUMzRSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNoQixlQUFLLENBQUMsYUFBRyxDQUFDLDBFQUEwRSxDQUFDLENBQUMsQ0FBQztvQkFDdkYsZUFBSyxDQUFDLGFBQUcsQ0FBQyw2REFBNkQsQ0FBQyxDQUFDLENBQUM7b0JBQzFFLGVBQUssQ0FBQyxnQkFBTSxDQUFDLG9DQUFrQyx1Q0FBMkIsQ0FBQyxDQUFDLENBQUM7b0JBQzdFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pCO2dCQUNELE9BQU8sV0FBVyxDQUFDO1lBQ3JCLENBQUM7U0FDRixDQUFDO2FBQ0QsT0FBTyxDQUFDLGNBQStCLEVBQUUsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFwQkQsb0RBb0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndn0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtlcnJvciwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuaW1wb3J0IHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfSBmcm9tICcuL2dpdGh1Yi11cmxzJztcblxuZXhwb3J0IHR5cGUgQXJndldpdGhHaXRodWJUb2tlbiA9IEFyZ3Y8e2dpdGh1YlRva2VuOiBzdHJpbmd9PjtcblxuLyoqIFNldHMgdXAgdGhlIGBnaXRodWItdG9rZW5gIGNvbW1hbmQgb3B0aW9uIGZvciB0aGUgZ2l2ZW4gWWFyZ3MgaW5zdGFuY2UuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkR2l0aHViVG9rZW5PcHRpb24oeWFyZ3M6IEFyZ3YpOiBBcmd2V2l0aEdpdGh1YlRva2VuIHtcbiAgcmV0dXJuIHlhcmdzXG4gICAgICAvLyAnZ2l0aHViLXRva2VuJyBpcyBjYXN0ZWQgdG8gJ2dpdGh1YlRva2VuJyB0byBwcm9wZXJseSBzZXQgdXAgdHlwaW5ncyB0byByZWZsZWN0IHRoZSBrZXkgaW5cbiAgICAgIC8vIHRoZSBBcmd2IG9iamVjdCBiZWluZyBjYW1lbENhc2UgcmF0aGVyIHRoYW4ga2Vib2IgY2FzZSBkdWUgdG8gdGhlIGBjYW1lbC1jYXNlLWV4cGFuc2lvbmBcbiAgICAgIC8vIGNvbmZpZzogaHR0cHM6Ly9naXRodWIuY29tL3lhcmdzL3lhcmdzLXBhcnNlciNjYW1lbC1jYXNlLWV4cGFuc2lvblxuICAgICAgLm9wdGlvbignZ2l0aHViLXRva2VuJyBhcyAnZ2l0aHViVG9rZW4nLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0dpdGh1YiB0b2tlbi4gSWYgbm90IHNldCwgdG9rZW4gaXMgcmV0cmlldmVkIGZyb20gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy4nLFxuICAgICAgICBjb2VyY2U6ICh0b2tlbjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgY29uc3QgZ2l0aHViVG9rZW4gPSB0b2tlbiB8fCBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU4gfHwgcHJvY2Vzcy5lbnYuVE9LRU47XG4gICAgICAgICAgaWYgKCFnaXRodWJUb2tlbikge1xuICAgICAgICAgICAgZXJyb3IocmVkKCdObyBHaXRodWIgdG9rZW4gc2V0LiBQbGVhc2Ugc2V0IHRoZSBgR0lUSFVCX1RPS0VOYCBlbnZpcm9ubWVudCB2YXJpYWJsZS4nKSk7XG4gICAgICAgICAgICBlcnJvcihyZWQoJ0FsdGVybmF0aXZlbHksIHBhc3MgdGhlIGAtLWdpdGh1Yi10b2tlbmAgY29tbWFuZCBsaW5lIGZsYWcuJykpO1xuICAgICAgICAgICAgZXJyb3IoeWVsbG93KGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApKTtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGdpdGh1YlRva2VuO1xuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIC5kZWZhdWx0KCdnaXRodWItdG9rZW4nIGFzICdnaXRodWJUb2tlbicsICcnLCAnPExPQ0FMIFRPS0VOPicpO1xufVxuIl19