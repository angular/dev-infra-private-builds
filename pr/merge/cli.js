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
    exports.handleMergeCommand = exports.buildMergeCommand = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQTBCO0lBRTFCLDZEQUFvRTtJQUVwRSxnREFBZ0Q7SUFDaEQsU0FBZ0IsaUJBQWlCLENBQUMsS0FBVztRQUMzQyxPQUFPLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQ2xELElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLDhFQUE4RTtTQUM1RixDQUFDLENBQUE7SUFDSixDQUFDO0lBTEQsOENBS0M7SUFFRCxzRkFBc0Y7SUFDdEYsU0FBc0Isa0JBQWtCLENBQUMsSUFBZTs7Ozs7O3dCQUNoRCxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQzt3QkFDdEYsSUFBSSxDQUFDLFdBQVcsRUFBRTs0QkFDaEIsT0FBTyxDQUFDLEtBQUssQ0FDVCxlQUFLLENBQUMsR0FBRyxDQUFDLDBFQUEwRSxDQUFDLENBQUMsQ0FBQzs0QkFDM0YsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMsR0FBRyxDQUFDLDZEQUE2RCxDQUFDLENBQUMsQ0FBQzs0QkFDeEYsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMsTUFBTSxDQUFDLG9DQUFrQyxpQ0FBMkIsQ0FBQyxDQUFDLENBQUM7NEJBQzNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELHFCQUFNLHdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUE7O3dCQUFsRCxTQUFrRCxDQUFDOzs7OztLQUNwRDtJQVhELGdEQVdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMLCBtZXJnZVB1bGxSZXF1ZXN0fSBmcm9tICcuL2luZGV4JztcblxuLyoqIEJ1aWxkcyB0aGUgb3B0aW9ucyBmb3IgdGhlIG1lcmdlIGNvbW1hbmQuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRNZXJnZUNvbW1hbmQoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzLmhlbHAoKS5zdHJpY3QoKS5vcHRpb24oJ2dpdGh1Yi10b2tlbicsIHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZXNjcmlwdGlvbjogJ0dpdGh1YiB0b2tlbi4gSWYgbm90IHNldCwgdG9rZW4gaXMgcmV0cmlldmVkIGZyb20gdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcy4nXG4gIH0pXG59XG5cbi8qKiBIYW5kbGVzIHRoZSBtZXJnZSBjb21tYW5kLiBpLmUuIHBlcmZvcm1zIHRoZSBtZXJnZSBvZiBhIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVyZ2VDb21tYW5kKGFyZ3M6IEFyZ3VtZW50cykge1xuICBjb25zdCBnaXRodWJUb2tlbiA9IGFyZ3MuZ2l0aHViVG9rZW4gfHwgcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOIHx8IHByb2Nlc3MuZW52LlRPS0VOO1xuICBpZiAoIWdpdGh1YlRva2VuKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgY2hhbGsucmVkKCdObyBHaXRodWIgdG9rZW4gc2V0LiBQbGVhc2Ugc2V0IHRoZSBgR0lUSFVCX1RPS0VOYCBlbnZpcm9ubWVudCB2YXJpYWJsZS4nKSk7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ0FsdGVybmF0aXZlbHksIHBhc3MgdGhlIGAtLWdpdGh1Yi10b2tlbmAgY29tbWFuZCBsaW5lIGZsYWcuJykpO1xuICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsueWVsbG93KGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBhd2FpdCBtZXJnZVB1bGxSZXF1ZXN0KGFyZ3MucHJOdW1iZXIsIGdpdGh1YlRva2VuKTtcbn1cbiJdfQ==