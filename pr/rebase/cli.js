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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL3JlYmFzZS9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUgsb0VBQTBDO0lBRTFDLDhEQUFpQztJQUVqQyw0RUFBNEU7SUFDL0QsUUFBQSx5QkFBeUIsR0FBRyxvQ0FBb0MsQ0FBQztJQUU5RSw4Q0FBOEM7SUFDOUMsU0FBZ0Isa0JBQWtCLENBQUMsS0FBVztRQUM1QyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQ2xDLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLDhFQUE4RTtTQUM1RixDQUFDLENBQUM7SUFDTCxDQUFDO0lBTEQsZ0RBS0M7SUFFRCwrQ0FBK0M7SUFDL0MsU0FBc0IsbUJBQW1CLENBQUMsSUFBZTs7Ozs7O3dCQUNqRCxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQzt3QkFDdEYsSUFBSSxDQUFDLFdBQVcsRUFBRTs0QkFDaEIsZUFBSyxDQUFDLDBFQUEwRSxDQUFDLENBQUM7NEJBQ2xGLGVBQUssQ0FBQyw2REFBNkQsQ0FBQyxDQUFDOzRCQUNyRSxlQUFLLENBQUMsb0NBQWtDLGlDQUEyQixDQUFDLENBQUM7NEJBQ3JFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELHFCQUFNLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFBQTs7d0JBQTFDLFNBQTBDLENBQUM7Ozs7O0tBQzVDO0lBVkQsa0RBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3Z9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7cmViYXNlUHJ9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogVVJMIHRvIHRoZSBHaXRodWIgcGFnZSB3aGVyZSBwZXJzb25hbCBhY2Nlc3MgdG9rZW5zIGNhbiBiZSBnZW5lcmF0ZWQuICovXG5leHBvcnQgY29uc3QgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCA9IGBodHRwczovL2dpdGh1Yi5jb20vc2V0dGluZ3MvdG9rZW5zYDtcblxuLyoqIEJ1aWxkcyB0aGUgcmViYXNlIHB1bGwgcmVxdWVzdCBjb21tYW5kLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmViYXNlQ29tbWFuZCh5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3Mub3B0aW9uKCdnaXRodWItdG9rZW4nLCB7XG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVzY3JpcHRpb246ICdHaXRodWIgdG9rZW4uIElmIG5vdCBzZXQsIHRva2VuIGlzIHJldHJpZXZlZCBmcm9tIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMuJ1xuICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIHJlYmFzZSBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZWJhc2VDb21tYW5kKGFyZ3M6IEFyZ3VtZW50cykge1xuICBjb25zdCBnaXRodWJUb2tlbiA9IGFyZ3MuZ2l0aHViVG9rZW4gfHwgcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOIHx8IHByb2Nlc3MuZW52LlRPS0VOO1xuICBpZiAoIWdpdGh1YlRva2VuKSB7XG4gICAgZXJyb3IoJ05vIEdpdGh1YiB0b2tlbiBzZXQuIFBsZWFzZSBzZXQgdGhlIGBHSVRIVUJfVE9LRU5gIGVudmlyb25tZW50IHZhcmlhYmxlLicpO1xuICAgIGVycm9yKCdBbHRlcm5hdGl2ZWx5LCBwYXNzIHRoZSBgLS1naXRodWItdG9rZW5gIGNvbW1hbmQgbGluZSBmbGFnLicpO1xuICAgIGVycm9yKGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGF3YWl0IHJlYmFzZVByKGFyZ3MucHJOdW1iZXIsIGdpdGh1YlRva2VuKTtcbn1cbiJdfQ==