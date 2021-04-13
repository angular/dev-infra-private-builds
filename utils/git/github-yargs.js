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
        define("@angular/dev-infra-private/utils/git/github-yargs", ["require", "exports", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/utils/git/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addGithubTokenOption = void 0;
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
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
                try {
                    index_1.GitClient.getAuthenticatedInstance();
                }
                catch (_a) {
                    index_1.GitClient.authenticateWithToken(githubToken);
                }
                return githubToken;
            },
        })
            .default('github-token', '', '<LOCAL TOKEN>');
    }
    exports.addGithubTokenOption = addGithubTokenOption;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXlhcmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIteWFyZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUgsb0VBQThDO0lBRTlDLGdGQUF3RDtJQUN4RCxvRUFBa0M7SUFJbEMsOEVBQThFO0lBQzlFLFNBQWdCLG9CQUFvQixDQUFDLEtBQVc7UUFDOUMsT0FBTyxLQUFLO1lBQ1IsNkZBQTZGO1lBQzdGLDJGQUEyRjtZQUMzRixxRUFBcUU7YUFDcEUsTUFBTSxDQUFDLGNBQStCLEVBQUU7WUFDdkMsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsOEVBQThFO1lBQzNGLE1BQU0sRUFBRSxVQUFDLEtBQWE7Z0JBQ3BCLElBQU0sV0FBVyxHQUFHLEtBQUssSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztnQkFDM0UsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDaEIsZUFBSyxDQUFDLGFBQUcsQ0FBQywwRUFBMEUsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZGLGVBQUssQ0FBQyxhQUFHLENBQUMsNkRBQTZELENBQUMsQ0FBQyxDQUFDO29CQUMxRSxlQUFLLENBQUMsZ0JBQU0sQ0FBQyxvQ0FBa0MsdUNBQTJCLENBQUMsQ0FBQyxDQUFDO29CQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNqQjtnQkFDRCxJQUFJO29CQUNGLGlCQUFTLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztpQkFDdEM7Z0JBQUMsV0FBTTtvQkFDTixpQkFBUyxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUM5QztnQkFDRCxPQUFPLFdBQVcsQ0FBQztZQUNyQixDQUFDO1NBQ0YsQ0FBQzthQUNELE9BQU8sQ0FBQyxjQUErQixFQUFFLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBekJELG9EQXlCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3Z9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtlcnJvciwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuXG5pbXBvcnQge0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9IGZyb20gJy4vZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4vaW5kZXgnO1xuXG5leHBvcnQgdHlwZSBBcmd2V2l0aEdpdGh1YlRva2VuID0gQXJndjx7Z2l0aHViVG9rZW46IHN0cmluZ30+O1xuXG4vKiogU2V0cyB1cCB0aGUgYGdpdGh1Yi10b2tlbmAgY29tbWFuZCBvcHRpb24gZm9yIHRoZSBnaXZlbiBZYXJncyBpbnN0YW5jZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRHaXRodWJUb2tlbk9wdGlvbih5YXJnczogQXJndik6IEFyZ3ZXaXRoR2l0aHViVG9rZW4ge1xuICByZXR1cm4geWFyZ3NcbiAgICAgIC8vICdnaXRodWItdG9rZW4nIGlzIGNhc3RlZCB0byAnZ2l0aHViVG9rZW4nIHRvIHByb3Blcmx5IHNldCB1cCB0eXBpbmdzIHRvIHJlZmxlY3QgdGhlIGtleSBpblxuICAgICAgLy8gdGhlIEFyZ3Ygb2JqZWN0IGJlaW5nIGNhbWVsQ2FzZSByYXRoZXIgdGhhbiBrZWJvYiBjYXNlIGR1ZSB0byB0aGUgYGNhbWVsLWNhc2UtZXhwYW5zaW9uYFxuICAgICAgLy8gY29uZmlnOiBodHRwczovL2dpdGh1Yi5jb20veWFyZ3MveWFyZ3MtcGFyc2VyI2NhbWVsLWNhc2UtZXhwYW5zaW9uXG4gICAgICAub3B0aW9uKCdnaXRodWItdG9rZW4nIGFzICdnaXRodWJUb2tlbicsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnR2l0aHViIHRva2VuLiBJZiBub3Qgc2V0LCB0b2tlbiBpcyByZXRyaWV2ZWQgZnJvbSB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLicsXG4gICAgICAgIGNvZXJjZTogKHRva2VuOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBjb25zdCBnaXRodWJUb2tlbiA9IHRva2VuIHx8IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTiB8fCBwcm9jZXNzLmVudi5UT0tFTjtcbiAgICAgICAgICBpZiAoIWdpdGh1YlRva2VuKSB7XG4gICAgICAgICAgICBlcnJvcihyZWQoJ05vIEdpdGh1YiB0b2tlbiBzZXQuIFBsZWFzZSBzZXQgdGhlIGBHSVRIVUJfVE9LRU5gIGVudmlyb25tZW50IHZhcmlhYmxlLicpKTtcbiAgICAgICAgICAgIGVycm9yKHJlZCgnQWx0ZXJuYXRpdmVseSwgcGFzcyB0aGUgYC0tZ2l0aHViLXRva2VuYCBjb21tYW5kIGxpbmUgZmxhZy4nKSk7XG4gICAgICAgICAgICBlcnJvcih5ZWxsb3coYFlvdSBjYW4gZ2VuZXJhdGUgYSB0b2tlbiBoZXJlOiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9YCkpO1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgR2l0Q2xpZW50LmdldEF1dGhlbnRpY2F0ZWRJbnN0YW5jZSgpO1xuICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgR2l0Q2xpZW50LmF1dGhlbnRpY2F0ZVdpdGhUb2tlbihnaXRodWJUb2tlbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBnaXRodWJUb2tlbjtcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICAuZGVmYXVsdCgnZ2l0aHViLXRva2VuJyBhcyAnZ2l0aHViVG9rZW4nLCAnJywgJzxMT0NBTCBUT0tFTj4nKTtcbn1cbiJdfQ==