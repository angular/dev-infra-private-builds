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
        define("@angular/dev-infra-private/pr/merge/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pr/merge"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
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
                            console_1.error(console_1.red('No Github token set. Please set the `GITHUB_TOKEN` environment variable.'));
                            console_1.error(console_1.red('Alternatively, pass the `--github-token` command line flag.'));
                            console_1.error(console_1.yellow("You can generate a token here: " + index_1.GITHUB_TOKEN_GENERATE_URL));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFJSCxvRUFBdUQ7SUFFdkQsNkRBQW9FO0lBRXBFLGdEQUFnRDtJQUNoRCxTQUFnQixpQkFBaUIsQ0FBQyxLQUFXO1FBQzNDLE9BQU8sS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7WUFDbEQsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsOEVBQThFO1NBQzVGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFMRCw4Q0FLQztJQUVELHNGQUFzRjtJQUN0RixTQUFzQixrQkFBa0IsQ0FBQyxJQUFlOzs7Ozs7d0JBQ2hELFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO3dCQUN0RixJQUFJLENBQUMsV0FBVyxFQUFFOzRCQUNoQixlQUFLLENBQUMsYUFBRyxDQUFDLDBFQUEwRSxDQUFDLENBQUMsQ0FBQzs0QkFDdkYsZUFBSyxDQUFDLGFBQUcsQ0FBQyw2REFBNkQsQ0FBQyxDQUFDLENBQUM7NEJBQzFFLGVBQUssQ0FBQyxnQkFBTSxDQUFDLG9DQUFrQyxpQ0FBMkIsQ0FBQyxDQUFDLENBQUM7NEJBQzdFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELHFCQUFNLHdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUE7O3dCQUFsRCxTQUFrRCxDQUFDOzs7OztLQUNwRDtJQVZELGdEQVVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2fSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7ZXJyb3IsIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMLCBtZXJnZVB1bGxSZXF1ZXN0fSBmcm9tICcuL2luZGV4JztcblxuLyoqIEJ1aWxkcyB0aGUgb3B0aW9ucyBmb3IgdGhlIG1lcmdlIGNvbW1hbmQuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRNZXJnZUNvbW1hbmQoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzLmhlbHAoKS5zdHJpY3QoKS5vcHRpb24oJ2dpdGh1Yi10b2tlbicsIHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dpdGh1YiB0b2tlbi4gSWYgbm90IHNldCwgdG9rZW4gaXMgcmV0cmlldmVkIGZyb20gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy4nXG4gIH0pXG59XG5cbi8qKiBIYW5kbGVzIHRoZSBtZXJnZSBjb21tYW5kLiBpLmUuIHBlcmZvcm1zIHRoZSBtZXJnZSBvZiBhIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVyZ2VDb21tYW5kKGFyZ3M6IEFyZ3VtZW50cykge1xuICBjb25zdCBnaXRodWJUb2tlbiA9IGFyZ3MuZ2l0aHViVG9rZW4gfHwgcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOIHx8IHByb2Nlc3MuZW52LlRPS0VOO1xuICBpZiAoIWdpdGh1YlRva2VuKSB7XG4gICAgZXJyb3IocmVkKCdObyBHaXRodWIgdG9rZW4gc2V0LiBQbGVhc2Ugc2V0IHRoZSBgR0lUSFVCX1RPS0VOYCBlbnZpcm9ubWVudCB2YXJpYWJsZS4nKSk7XG4gICAgZXJyb3IocmVkKCdBbHRlcm5hdGl2ZWx5LCBwYXNzIHRoZSBgLS1naXRodWItdG9rZW5gIGNvbW1hbmQgbGluZSBmbGFnLicpKTtcbiAgICBlcnJvcih5ZWxsb3coYFlvdSBjYW4gZ2VuZXJhdGUgYSB0b2tlbiBoZXJlOiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9YCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGF3YWl0IG1lcmdlUHVsbFJlcXVlc3QoYXJncy5wck51bWJlciwgZ2l0aHViVG9rZW4pO1xufVxuIl19