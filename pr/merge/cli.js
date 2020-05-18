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
        define("@angular/dev-infra-private/pr/merge/cli", ["require", "exports", "tslib", "chalk", "@angular/dev-infra-private/pr/merge"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var chalk_1 = require("chalk");
    var index_1 = require("@angular/dev-infra-private/pr/merge");
    /** Builds the options for the merge command. */
    function buildMergeCommand(yargs) {
        return yargs.help().strict().option('github-token', {
            type: 'string',
            description: 'Github token. If not set, token is retrieved from the environment variables.'
        });
    }
    exports.buildMergeCommand = buildMergeCommand;
    /** Handles the merge command. i.e. performs the merge of a specified pull request. */
    function handleMergeCommand(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var githubToken;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubToken = args.githubToken || process.env.GITHUB_TOKEN || process.env.TOKEN;
                        if (!githubToken) {
                            console.error(chalk_1.default.red('No Github token set. Please set the `GITHUB_TOKEN` environment variable.'));
                            console.error(chalk_1.default.red('Alternatively, pass the `--github-token` command line flag.'));
                            console.error(chalk_1.default.yellow("You can generate a token here: " + index_1.GITHUB_TOKEN_GENERATE_URL));
                            process.exit(1);
                        }
                        return [4 /*yield*/, index_1.mergePullRequest(args.prNumber, githubToken)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.handleMergeCommand = handleMergeCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBMEI7SUFFMUIsNkRBQW9FO0lBRXBFLGdEQUFnRDtJQUNoRCxTQUFnQixpQkFBaUIsQ0FBQyxLQUFXO1FBQzNDLE9BQU8sS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7WUFDbEQsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsOEVBQThFO1NBQzVGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFMRCw4Q0FLQztJQUVELHNGQUFzRjtJQUN0RixTQUFzQixrQkFBa0IsQ0FBQyxJQUFlOzs7Ozs7d0JBQ2hELFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO3dCQUN0RixJQUFJLENBQUMsV0FBVyxFQUFFOzRCQUNoQixPQUFPLENBQUMsS0FBSyxDQUNULGVBQUssQ0FBQyxHQUFHLENBQUMsMEVBQTBFLENBQUMsQ0FBQyxDQUFDOzRCQUMzRixPQUFPLENBQUMsS0FBSyxDQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMsNkRBQTZELENBQUMsQ0FBQyxDQUFDOzRCQUN4RixPQUFPLENBQUMsS0FBSyxDQUFDLGVBQUssQ0FBQyxNQUFNLENBQUMsb0NBQWtDLGlDQUEyQixDQUFDLENBQUMsQ0FBQzs0QkFDM0YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQscUJBQU0sd0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFBQTs7d0JBQWxELFNBQWtELENBQUM7Ozs7O0tBQ3BEO0lBWEQsZ0RBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2fSBmcm9tICd5YXJncyc7XG5pbXBvcnQge0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwsIG1lcmdlUHVsbFJlcXVlc3R9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogQnVpbGRzIHRoZSBvcHRpb25zIGZvciB0aGUgbWVyZ2UgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE1lcmdlQ29tbWFuZCh5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3MuaGVscCgpLnN0cmljdCgpLm9wdGlvbignZ2l0aHViLXRva2VuJywge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlc2NyaXB0aW9uOiAnR2l0aHViIHRva2VuLiBJZiBub3Qgc2V0LCB0b2tlbiBpcyByZXRyaWV2ZWQgZnJvbSB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLidcbiAgfSlcbn1cblxuLyoqIEhhbmRsZXMgdGhlIG1lcmdlIGNvbW1hbmQuIGkuZS4gcGVyZm9ybXMgdGhlIG1lcmdlIG9mIGEgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVNZXJnZUNvbW1hbmQoYXJnczogQXJndW1lbnRzKSB7XG4gIGNvbnN0IGdpdGh1YlRva2VuID0gYXJncy5naXRodWJUb2tlbiB8fCBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU4gfHwgcHJvY2Vzcy5lbnYuVE9LRU47XG4gIGlmICghZ2l0aHViVG9rZW4pIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBjaGFsay5yZWQoJ05vIEdpdGh1YiB0b2tlbiBzZXQuIFBsZWFzZSBzZXQgdGhlIGBHSVRIVUJfVE9LRU5gIGVudmlyb25tZW50IHZhcmlhYmxlLicpKTtcbiAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZCgnQWx0ZXJuYXRpdmVseSwgcGFzcyB0aGUgYC0tZ2l0aHViLXRva2VuYCBjb21tYW5kIGxpbmUgZmxhZy4nKSk7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coYFlvdSBjYW4gZ2VuZXJhdGUgYSB0b2tlbiBoZXJlOiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9YCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGF3YWl0IG1lcmdlUHVsbFJlcXVlc3QoYXJncy5wck51bWJlciwgZ2l0aHViVG9rZW4pO1xufVxuIl19