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
        define("@angular/dev-infra-private/pr/rebase/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/pr/rebase"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var index_1 = require("@angular/dev-infra-private/pr/rebase");
    /** URL to the Github page where personal access tokens can be generated. */
    exports.GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens";
    /** Builds the rebase pull request command. */
    function buildRebaseCommand(yargs) {
        return yargs.option('github-token', {
            type: 'string',
            description: 'Github token. If not set, token is retrieved from the environment variables.'
        });
    }
    exports.buildRebaseCommand = buildRebaseCommand;
    /** Handles the rebase pull request command. */
    function handleRebaseCommand(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var githubToken;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubToken = args.githubToken || process.env.GITHUB_TOKEN || process.env.TOKEN;
                        if (!githubToken) {
                            console.error('No Github token set. Please set the `GITHUB_TOKEN` environment variable.');
                            console.error('Alternatively, pass the `--github-token` command line flag.');
                            console.error("You can generate a token here: " + exports.GITHUB_TOKEN_GENERATE_URL);
                            process.exit(1);
                        }
                        return [4 /*yield*/, index_1.rebasePr(args.prNumber, githubToken)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.handleRebaseCommand = handleRebaseCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL3JlYmFzZS9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUgsOERBQWlDO0lBRWpDLDRFQUE0RTtJQUMvRCxRQUFBLHlCQUF5QixHQUFHLG9DQUFvQyxDQUFDO0lBRTlFLDhDQUE4QztJQUM5QyxTQUFnQixrQkFBa0IsQ0FBQyxLQUFXO1FBQzVDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7WUFDbEMsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsOEVBQThFO1NBQzVGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFMRCxnREFLQztJQUVELCtDQUErQztJQUMvQyxTQUFzQixtQkFBbUIsQ0FBQyxJQUFlOzs7Ozs7d0JBQ2pELFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO3dCQUN0RixJQUFJLENBQUMsV0FBVyxFQUFFOzRCQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLDBFQUEwRSxDQUFDLENBQUM7NEJBQzFGLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQzs0QkFDN0UsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQ0FBa0MsaUNBQTJCLENBQUMsQ0FBQzs0QkFDN0UsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQscUJBQU0sZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFBOzt3QkFBMUMsU0FBMEMsQ0FBQzs7Ozs7S0FDNUM7SUFWRCxrREFVQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge3JlYmFzZVByfSBmcm9tICcuL2luZGV4JztcblxuLyoqIFVSTCB0byB0aGUgR2l0aHViIHBhZ2Ugd2hlcmUgcGVyc29uYWwgYWNjZXNzIHRva2VucyBjYW4gYmUgZ2VuZXJhdGVkLiAqL1xuZXhwb3J0IGNvbnN0IEdJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwgPSBgaHR0cHM6Ly9naXRodWIuY29tL3NldHRpbmdzL3Rva2Vuc2A7XG5cbi8qKiBCdWlsZHMgdGhlIHJlYmFzZSBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlYmFzZUNvbW1hbmQoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzLm9wdGlvbignZ2l0aHViLXRva2VuJywge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2l0aHViIHRva2VuLiBJZiBub3Qgc2V0LCB0b2tlbiBpcyByZXRyaWV2ZWQgZnJvbSB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLidcbiAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSByZWJhc2UgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmViYXNlQ29tbWFuZChhcmdzOiBBcmd1bWVudHMpIHtcbiAgY29uc3QgZ2l0aHViVG9rZW4gPSBhcmdzLmdpdGh1YlRva2VuIHx8IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTiB8fCBwcm9jZXNzLmVudi5UT0tFTjtcbiAgaWYgKCFnaXRodWJUb2tlbikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ05vIEdpdGh1YiB0b2tlbiBzZXQuIFBsZWFzZSBzZXQgdGhlIGBHSVRIVUJfVE9LRU5gIGVudmlyb25tZW50IHZhcmlhYmxlLicpO1xuICAgIGNvbnNvbGUuZXJyb3IoJ0FsdGVybmF0aXZlbHksIHBhc3MgdGhlIGAtLWdpdGh1Yi10b2tlbmAgY29tbWFuZCBsaW5lIGZsYWcuJyk7XG4gICAgY29uc29sZS5lcnJvcihgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBhd2FpdCByZWJhc2VQcihhcmdzLnByTnVtYmVyLCBnaXRodWJUb2tlbik7XG59XG4iXX0=