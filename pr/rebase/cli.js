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
        define("@angular/dev-infra-private/pr/rebase/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pr/rebase"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.handleRebaseCommand = exports.buildRebaseCommand = exports.GITHUB_TOKEN_GENERATE_URL = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
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
                            console_1.error('No Github token set. Please set the `GITHUB_TOKEN` environment variable.');
                            console_1.error('Alternatively, pass the `--github-token` command line flag.');
                            console_1.error("You can generate a token here: " + exports.GITHUB_TOKEN_GENERATE_URL);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL3JlYmFzZS9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILG9FQUEwQztJQUUxQyw4REFBaUM7SUFFakMsNEVBQTRFO0lBQy9ELFFBQUEseUJBQXlCLEdBQUcsb0NBQW9DLENBQUM7SUFFOUUsOENBQThDO0lBQzlDLFNBQWdCLGtCQUFrQixDQUFDLEtBQVc7UUFDNUMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtZQUNsQyxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSw4RUFBOEU7U0FDNUYsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUxELGdEQUtDO0lBRUQsK0NBQStDO0lBQy9DLFNBQXNCLG1CQUFtQixDQUFDLElBQWU7Ozs7Ozt3QkFDakQsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7d0JBQ3RGLElBQUksQ0FBQyxXQUFXLEVBQUU7NEJBQ2hCLGVBQUssQ0FBQywwRUFBMEUsQ0FBQyxDQUFDOzRCQUNsRixlQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQzs0QkFDckUsZUFBSyxDQUFDLG9DQUFrQyxpQ0FBMkIsQ0FBQyxDQUFDOzRCQUNyRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFRCxxQkFBTSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUE7O3dCQUExQyxTQUEwQyxDQUFDOzs7OztLQUM1QztJQVZELGtEQVVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2fSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge3JlYmFzZVByfSBmcm9tICcuL2luZGV4JztcblxuLyoqIFVSTCB0byB0aGUgR2l0aHViIHBhZ2Ugd2hlcmUgcGVyc29uYWwgYWNjZXNzIHRva2VucyBjYW4gYmUgZ2VuZXJhdGVkLiAqL1xuZXhwb3J0IGNvbnN0IEdJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwgPSBgaHR0cHM6Ly9naXRodWIuY29tL3NldHRpbmdzL3Rva2Vuc2A7XG5cbi8qKiBCdWlsZHMgdGhlIHJlYmFzZSBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlYmFzZUNvbW1hbmQoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzLm9wdGlvbignZ2l0aHViLXRva2VuJywge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2l0aHViIHRva2VuLiBJZiBub3Qgc2V0LCB0b2tlbiBpcyByZXRyaWV2ZWQgZnJvbSB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLidcbiAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSByZWJhc2UgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmViYXNlQ29tbWFuZChhcmdzOiBBcmd1bWVudHMpIHtcbiAgY29uc3QgZ2l0aHViVG9rZW4gPSBhcmdzLmdpdGh1YlRva2VuIHx8IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTiB8fCBwcm9jZXNzLmVudi5UT0tFTjtcbiAgaWYgKCFnaXRodWJUb2tlbikge1xuICAgIGVycm9yKCdObyBHaXRodWIgdG9rZW4gc2V0LiBQbGVhc2Ugc2V0IHRoZSBgR0lUSFVCX1RPS0VOYCBlbnZpcm9ubWVudCB2YXJpYWJsZS4nKTtcbiAgICBlcnJvcignQWx0ZXJuYXRpdmVseSwgcGFzcyB0aGUgYC0tZ2l0aHViLXRva2VuYCBjb21tYW5kIGxpbmUgZmxhZy4nKTtcbiAgICBlcnJvcihgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBhd2FpdCByZWJhc2VQcihhcmdzLnByTnVtYmVyLCBnaXRodWJUb2tlbik7XG59XG4iXX0=