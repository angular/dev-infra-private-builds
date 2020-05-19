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
    exports.handleRebaseCommand = exports.buildRebaseCommand = exports.GITHUB_TOKEN_GENERATE_URL = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL3JlYmFzZS9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILDhEQUFpQztJQUVqQyw0RUFBNEU7SUFDL0QsUUFBQSx5QkFBeUIsR0FBRyxvQ0FBb0MsQ0FBQztJQUU5RSw4Q0FBOEM7SUFDOUMsU0FBZ0Isa0JBQWtCLENBQUMsS0FBVztRQUM1QyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQ2xDLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLDhFQUE4RTtTQUM1RixDQUFDLENBQUM7SUFDTCxDQUFDO0lBTEQsZ0RBS0M7SUFFRCwrQ0FBK0M7SUFDL0MsU0FBc0IsbUJBQW1CLENBQUMsSUFBZTs7Ozs7O3dCQUNqRCxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQzt3QkFDdEYsSUFBSSxDQUFDLFdBQVcsRUFBRTs0QkFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQywwRUFBMEUsQ0FBQyxDQUFDOzRCQUMxRixPQUFPLENBQUMsS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7NEJBQzdFLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0NBQWtDLGlDQUEyQixDQUFDLENBQUM7NEJBQzdFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELHFCQUFNLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFBQTs7d0JBQTFDLFNBQTBDLENBQUM7Ozs7O0tBQzVDO0lBVkQsa0RBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3Z9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtyZWJhc2VQcn0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBVUkwgdG8gdGhlIEdpdGh1YiBwYWdlIHdoZXJlIHBlcnNvbmFsIGFjY2VzcyB0b2tlbnMgY2FuIGJlIGdlbmVyYXRlZC4gKi9cbmV4cG9ydCBjb25zdCBHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMID0gYGh0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy90b2tlbnNgO1xuXG4vKiogQnVpbGRzIHRoZSByZWJhc2UgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWJhc2VDb21tYW5kKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJncy5vcHRpb24oJ2dpdGh1Yi10b2tlbicsIHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dpdGh1YiB0b2tlbi4gSWYgbm90IHNldCwgdG9rZW4gaXMgcmV0cmlldmVkIGZyb20gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy4nXG4gIH0pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgcmViYXNlIHB1bGwgcmVxdWVzdCBjb21tYW5kLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlYmFzZUNvbW1hbmQoYXJnczogQXJndW1lbnRzKSB7XG4gIGNvbnN0IGdpdGh1YlRva2VuID0gYXJncy5naXRodWJUb2tlbiB8fCBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU4gfHwgcHJvY2Vzcy5lbnYuVE9LRU47XG4gIGlmICghZ2l0aHViVG9rZW4pIHtcbiAgICBjb25zb2xlLmVycm9yKCdObyBHaXRodWIgdG9rZW4gc2V0LiBQbGVhc2Ugc2V0IHRoZSBgR0lUSFVCX1RPS0VOYCBlbnZpcm9ubWVudCB2YXJpYWJsZS4nKTtcbiAgICBjb25zb2xlLmVycm9yKCdBbHRlcm5hdGl2ZWx5LCBwYXNzIHRoZSBgLS1naXRodWItdG9rZW5gIGNvbW1hbmQgbGluZSBmbGFnLicpO1xuICAgIGNvbnNvbGUuZXJyb3IoYFlvdSBjYW4gZ2VuZXJhdGUgYSB0b2tlbiBoZXJlOiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9YCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgYXdhaXQgcmViYXNlUHIoYXJncy5wck51bWJlciwgZ2l0aHViVG9rZW4pO1xufVxuIl19