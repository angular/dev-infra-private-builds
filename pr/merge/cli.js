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
        define("@angular/dev-infra-private/pr/merge/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/git/github-yargs", "@angular/dev-infra-private/pr/merge"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.handleMergeCommand = exports.buildMergeCommand = void 0;
    var tslib_1 = require("tslib");
    var github_yargs_1 = require("@angular/dev-infra-private/utils/git/github-yargs");
    var index_1 = require("@angular/dev-infra-private/pr/merge");
    /** Builds the options for the merge command. */
    function buildMergeCommand(yargs) {
        return github_yargs_1.addGithubTokenOption(yargs).help().strict().positional('pr-number', { demandOption: true, type: 'number' });
    }
    exports.buildMergeCommand = buildMergeCommand;
    /** Handles the merge command. i.e. performs the merge of a specified pull request. */
    function handleMergeCommand(_a) {
        var pr = _a["pr-number"], githubToken = _a.githubToken;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, index_1.mergePullRequest(pr, githubToken)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.handleMergeCommand = handleMergeCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsa0ZBQWtFO0lBRWxFLDZEQUF5QztJQVF6QyxnREFBZ0Q7SUFDaEQsU0FBZ0IsaUJBQWlCLENBQUMsS0FBVztRQUMzQyxPQUFPLG1DQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FDekQsV0FBVyxFQUFFLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBSEQsOENBR0M7SUFFRCxzRkFBc0Y7SUFDdEYsU0FBc0Isa0JBQWtCLENBQ3BDLEVBQThEO1lBQWhELEVBQUUsa0JBQUEsRUFBRSxXQUFXLGlCQUFBOzs7OzRCQUMvQixxQkFBTSx3QkFBZ0IsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLEVBQUE7O3dCQUF2QyxTQUF1QyxDQUFDOzs7OztLQUN6QztJQUhELGdEQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2fSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7YWRkR2l0aHViVG9rZW5PcHRpb259IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWIteWFyZ3MnO1xuXG5pbXBvcnQge21lcmdlUHVsbFJlcXVlc3R9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogVGhlIG9wdGlvbnMgYXZhaWxhYmxlIHRvIHRoZSBtZXJnZSBjb21tYW5kIHZpYSBDTEkuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lcmdlQ29tbWFuZE9wdGlvbnMge1xuICBnaXRodWJUb2tlbjogc3RyaW5nO1xuICAncHItbnVtYmVyJzogbnVtYmVyO1xufVxuXG4vKiogQnVpbGRzIHRoZSBvcHRpb25zIGZvciB0aGUgbWVyZ2UgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE1lcmdlQ29tbWFuZCh5YXJnczogQXJndik6IEFyZ3Y8TWVyZ2VDb21tYW5kT3B0aW9ucz4ge1xuICByZXR1cm4gYWRkR2l0aHViVG9rZW5PcHRpb24oeWFyZ3MpLmhlbHAoKS5zdHJpY3QoKS5wb3NpdGlvbmFsKFxuICAgICAgJ3ByLW51bWJlcicsIHtkZW1hbmRPcHRpb246IHRydWUsIHR5cGU6ICdudW1iZXInfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBtZXJnZSBjb21tYW5kLiBpLmUuIHBlcmZvcm1zIHRoZSBtZXJnZSBvZiBhIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVyZ2VDb21tYW5kKFxuICAgIHsncHItbnVtYmVyJzogcHIsIGdpdGh1YlRva2VufTogQXJndW1lbnRzPE1lcmdlQ29tbWFuZE9wdGlvbnM+KSB7XG4gIGF3YWl0IG1lcmdlUHVsbFJlcXVlc3QocHIsIGdpdGh1YlRva2VuKTtcbn1cbiJdfQ==