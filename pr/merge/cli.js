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
    exports.handleMergeCommand = exports.buildMergeCommand = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/pr/merge");
    /** Builds the options for the merge command. */
    function buildMergeCommand(yargs) {
        return yargs.help()
            .strict()
            .positional('pr-number', { demandOption: true, type: 'number' })
            .option('github-token', {
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
                        githubToken = args['github-token'] || process.env.GITHUB_TOKEN || process.env.TOKEN;
                        if (!githubToken) {
                            console_1.error(console_1.red('No Github token set. Please set the `GITHUB_TOKEN` environment variable.'));
                            console_1.error(console_1.red('Alternatively, pass the `--github-token` command line flag.'));
                            console_1.error(console_1.yellow("You can generate a token here: " + index_1.GITHUB_TOKEN_GENERATE_URL));
                            process.exit(1);
                        }
                        return [4 /*yield*/, index_1.mergePullRequest(args['pr-number'], githubToken)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.handleMergeCommand = handleMergeCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsb0VBQXVEO0lBRXZELDZEQUFvRTtJQVFwRSxnREFBZ0Q7SUFDaEQsU0FBZ0IsaUJBQWlCLENBQUMsS0FBVztRQUMzQyxPQUFPLEtBQUssQ0FBQyxJQUFJLEVBQUU7YUFDZCxNQUFNLEVBQUU7YUFDUixVQUFVLENBQUMsV0FBVyxFQUFFLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUM7YUFDN0QsTUFBTSxDQUFDLGNBQWMsRUFBRTtZQUN0QixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSw4RUFBOEU7U0FDNUYsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQVJELDhDQVFDO0lBRUQsc0ZBQXNGO0lBQ3RGLFNBQXNCLGtCQUFrQixDQUFDLElBQW9DOzs7Ozs7d0JBQ3JFLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7d0JBQzFGLElBQUksQ0FBQyxXQUFXLEVBQUU7NEJBQ2hCLGVBQUssQ0FBQyxhQUFHLENBQUMsMEVBQTBFLENBQUMsQ0FBQyxDQUFDOzRCQUN2RixlQUFLLENBQUMsYUFBRyxDQUFDLDZEQUE2RCxDQUFDLENBQUMsQ0FBQzs0QkFDMUUsZUFBSyxDQUFDLGdCQUFNLENBQUMsb0NBQWtDLGlDQUEyQixDQUFDLENBQUMsQ0FBQzs0QkFDN0UsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQscUJBQU0sd0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxFQUFBOzt3QkFBdEQsU0FBc0QsQ0FBQzs7Ozs7S0FDeEQ7SUFWRCxnREFVQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2Vycm9yLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCwgbWVyZ2VQdWxsUmVxdWVzdH0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBUaGUgb3B0aW9ucyBhdmFpbGFibGUgdG8gdGhlIG1lcmdlIGNvbW1hbmQgdmlhIENMSS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2VDb21tYW5kT3B0aW9ucyB7XG4gICdnaXRodWItdG9rZW4nPzogc3RyaW5nO1xuICAncHItbnVtYmVyJzogbnVtYmVyO1xufVxuXG4vKiogQnVpbGRzIHRoZSBvcHRpb25zIGZvciB0aGUgbWVyZ2UgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE1lcmdlQ29tbWFuZCh5YXJnczogQXJndik6IEFyZ3Y8TWVyZ2VDb21tYW5kT3B0aW9ucz4ge1xuICByZXR1cm4geWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5wb3NpdGlvbmFsKCdwci1udW1iZXInLCB7ZGVtYW5kT3B0aW9uOiB0cnVlLCB0eXBlOiAnbnVtYmVyJ30pXG4gICAgICAub3B0aW9uKCdnaXRodWItdG9rZW4nLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0dpdGh1YiB0b2tlbi4gSWYgbm90IHNldCwgdG9rZW4gaXMgcmV0cmlldmVkIGZyb20gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy4nXG4gICAgICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIG1lcmdlIGNvbW1hbmQuIGkuZS4gcGVyZm9ybXMgdGhlIG1lcmdlIG9mIGEgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVNZXJnZUNvbW1hbmQoYXJnczogQXJndW1lbnRzPE1lcmdlQ29tbWFuZE9wdGlvbnM+KSB7XG4gIGNvbnN0IGdpdGh1YlRva2VuID0gYXJnc1snZ2l0aHViLXRva2VuJ10gfHwgcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOIHx8IHByb2Nlc3MuZW52LlRPS0VOO1xuICBpZiAoIWdpdGh1YlRva2VuKSB7XG4gICAgZXJyb3IocmVkKCdObyBHaXRodWIgdG9rZW4gc2V0LiBQbGVhc2Ugc2V0IHRoZSBgR0lUSFVCX1RPS0VOYCBlbnZpcm9ubWVudCB2YXJpYWJsZS4nKSk7XG4gICAgZXJyb3IocmVkKCdBbHRlcm5hdGl2ZWx5LCBwYXNzIHRoZSBgLS1naXRodWItdG9rZW5gIGNvbW1hbmQgbGluZSBmbGFnLicpKTtcbiAgICBlcnJvcih5ZWxsb3coYFlvdSBjYW4gZ2VuZXJhdGUgYSB0b2tlbiBoZXJlOiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9YCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGF3YWl0IG1lcmdlUHVsbFJlcXVlc3QoYXJnc1sncHItbnVtYmVyJ10sIGdpdGh1YlRva2VuKTtcbn1cbiJdfQ==