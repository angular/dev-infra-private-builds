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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsb0VBQXVEO0lBRXZELDZEQUFvRTtJQUVwRSxnREFBZ0Q7SUFDaEQsU0FBZ0IsaUJBQWlCLENBQUMsS0FBVztRQUMzQyxPQUFPLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQ2xELElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLDhFQUE4RTtTQUM1RixDQUFDLENBQUM7SUFDTCxDQUFDO0lBTEQsOENBS0M7SUFFRCxzRkFBc0Y7SUFDdEYsU0FBc0Isa0JBQWtCLENBQUMsSUFBZTs7Ozs7O3dCQUNoRCxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQzt3QkFDdEYsSUFBSSxDQUFDLFdBQVcsRUFBRTs0QkFDaEIsZUFBSyxDQUFDLGFBQUcsQ0FBQywwRUFBMEUsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZGLGVBQUssQ0FBQyxhQUFHLENBQUMsNkRBQTZELENBQUMsQ0FBQyxDQUFDOzRCQUMxRSxlQUFLLENBQUMsZ0JBQU0sQ0FBQyxvQ0FBa0MsaUNBQTJCLENBQUMsQ0FBQyxDQUFDOzRCQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFRCxxQkFBTSx3QkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFBOzt3QkFBbEQsU0FBa0QsQ0FBQzs7Ozs7S0FDcEQ7SUFWRCxnREFVQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2Vycm9yLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCwgbWVyZ2VQdWxsUmVxdWVzdH0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBCdWlsZHMgdGhlIG9wdGlvbnMgZm9yIHRoZSBtZXJnZSBjb21tYW5kLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTWVyZ2VDb21tYW5kKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJncy5oZWxwKCkuc3RyaWN0KCkub3B0aW9uKCdnaXRodWItdG9rZW4nLCB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVzY3JpcHRpb246ICdHaXRodWIgdG9rZW4uIElmIG5vdCBzZXQsIHRva2VuIGlzIHJldHJpZXZlZCBmcm9tIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMuJ1xuICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIG1lcmdlIGNvbW1hbmQuIGkuZS4gcGVyZm9ybXMgdGhlIG1lcmdlIG9mIGEgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVNZXJnZUNvbW1hbmQoYXJnczogQXJndW1lbnRzKSB7XG4gIGNvbnN0IGdpdGh1YlRva2VuID0gYXJncy5naXRodWJUb2tlbiB8fCBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU4gfHwgcHJvY2Vzcy5lbnYuVE9LRU47XG4gIGlmICghZ2l0aHViVG9rZW4pIHtcbiAgICBlcnJvcihyZWQoJ05vIEdpdGh1YiB0b2tlbiBzZXQuIFBsZWFzZSBzZXQgdGhlIGBHSVRIVUJfVE9LRU5gIGVudmlyb25tZW50IHZhcmlhYmxlLicpKTtcbiAgICBlcnJvcihyZWQoJ0FsdGVybmF0aXZlbHksIHBhc3MgdGhlIGAtLWdpdGh1Yi10b2tlbmAgY29tbWFuZCBsaW5lIGZsYWcuJykpO1xuICAgIGVycm9yKHllbGxvdyhgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgYXdhaXQgbWVyZ2VQdWxsUmVxdWVzdChhcmdzLnByTnVtYmVyLCBnaXRodWJUb2tlbik7XG59XG4iXX0=