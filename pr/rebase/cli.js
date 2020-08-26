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
        return yargs
            .option('github-token', {
            type: 'string',
            description: 'Github token. If not set, token is retrieved from the environment variables.'
        })
            .positional('prNumber', { type: 'number', demandOption: true });
    }
    exports.buildRebaseCommand = buildRebaseCommand;
    /** Handles the rebase pull request command. */
    function handleRebaseCommand(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var githubToken;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubToken = args['github-token'] || process.env.GITHUB_TOKEN || process.env.TOKEN;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL3JlYmFzZS9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILG9FQUEwQztJQUUxQyw4REFBaUM7SUFFakMsNEVBQTRFO0lBQy9ELFFBQUEseUJBQXlCLEdBQUcsb0NBQW9DLENBQUM7SUFROUUsOENBQThDO0lBQzlDLFNBQWdCLGtCQUFrQixDQUFDLEtBQVc7UUFDNUMsT0FBTyxLQUFLO2FBQ1AsTUFBTSxDQUFDLGNBQWMsRUFBRTtZQUN0QixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSw4RUFBOEU7U0FDNUYsQ0FBQzthQUNELFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFQRCxnREFPQztJQUdELCtDQUErQztJQUMvQyxTQUFzQixtQkFBbUIsQ0FBQyxJQUFxQzs7Ozs7O3dCQUN2RSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO3dCQUMxRixJQUFJLENBQUMsV0FBVyxFQUFFOzRCQUNoQixlQUFLLENBQUMsMEVBQTBFLENBQUMsQ0FBQzs0QkFDbEYsZUFBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7NEJBQ3JFLGVBQUssQ0FBQyxvQ0FBa0MsaUNBQTJCLENBQUMsQ0FBQzs0QkFDckUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQscUJBQU0sZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFBOzt3QkFBMUMsU0FBMEMsQ0FBQzs7Ozs7S0FDNUM7SUFWRCxrREFVQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtyZWJhc2VQcn0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBVUkwgdG8gdGhlIEdpdGh1YiBwYWdlIHdoZXJlIHBlcnNvbmFsIGFjY2VzcyB0b2tlbnMgY2FuIGJlIGdlbmVyYXRlZC4gKi9cbmV4cG9ydCBjb25zdCBHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMID0gYGh0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy90b2tlbnNgO1xuXG4vKiogVGhlIG9wdGlvbnMgYXZhaWxhYmxlIHRvIHRoZSByZWJhc2UgY29tbWFuZCB2aWEgQ0xJLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWJhc2VDb21tYW5kT3B0aW9ucyB7XG4gICdnaXRodWItdG9rZW4nPzogc3RyaW5nO1xuICBwck51bWJlcjogbnVtYmVyO1xufVxuXG4vKiogQnVpbGRzIHRoZSByZWJhc2UgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWJhc2VDb21tYW5kKHlhcmdzOiBBcmd2KTogQXJndjxSZWJhc2VDb21tYW5kT3B0aW9ucz4ge1xuICByZXR1cm4geWFyZ3NcbiAgICAgIC5vcHRpb24oJ2dpdGh1Yi10b2tlbicsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnR2l0aHViIHRva2VuLiBJZiBub3Qgc2V0LCB0b2tlbiBpcyByZXRyaWV2ZWQgZnJvbSB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzLidcbiAgICAgIH0pXG4gICAgICAucG9zaXRpb25hbCgncHJOdW1iZXInLCB7dHlwZTogJ251bWJlcicsIGRlbWFuZE9wdGlvbjogdHJ1ZX0pO1xufVxuXG5cbi8qKiBIYW5kbGVzIHRoZSByZWJhc2UgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmViYXNlQ29tbWFuZChhcmdzOiBBcmd1bWVudHM8UmViYXNlQ29tbWFuZE9wdGlvbnM+KSB7XG4gIGNvbnN0IGdpdGh1YlRva2VuID0gYXJnc1snZ2l0aHViLXRva2VuJ10gfHwgcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOIHx8IHByb2Nlc3MuZW52LlRPS0VOO1xuICBpZiAoIWdpdGh1YlRva2VuKSB7XG4gICAgZXJyb3IoJ05vIEdpdGh1YiB0b2tlbiBzZXQuIFBsZWFzZSBzZXQgdGhlIGBHSVRIVUJfVE9LRU5gIGVudmlyb25tZW50IHZhcmlhYmxlLicpO1xuICAgIGVycm9yKCdBbHRlcm5hdGl2ZWx5LCBwYXNzIHRoZSBgLS1naXRodWItdG9rZW5gIGNvbW1hbmQgbGluZSBmbGFnLicpO1xuICAgIGVycm9yKGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGF3YWl0IHJlYmFzZVByKGFyZ3MucHJOdW1iZXIsIGdpdGh1YlRva2VuKTtcbn1cbiJdfQ==