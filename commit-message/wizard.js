(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/wizard", ["require", "exports", "tslib", "fs", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/builder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runWizard = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var fs_1 = require("fs");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var builder_1 = require("@angular/dev-infra-private/commit-message/builder");
    /** The default commit message used if the wizard does not procude a commit message. */
    var defaultCommitMessage = "<type>(<scope>): <summary>\n\n# <Describe the motivation behind this change - explain WHY you are making this change. Wrap all\n#  lines at 100 characters.>\n\n";
    function runWizard(args) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var commitMessage;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if ((_a = config_1.getUserConfig().commitMessage) === null || _a === void 0 ? void 0 : _a.disableWizard) {
                            console_1.debug('Skipping commit message wizard due to enabled `commitMessage.disableWizard` option in');
                            console_1.debug('user config.');
                            process.exitCode = 0;
                            return [2 /*return*/];
                        }
                        if (args.source !== undefined) {
                            console_1.info("Skipping commit message wizard because the commit was created via '" + args.source + "' source");
                            process.exitCode = 0;
                            return [2 /*return*/];
                        }
                        // Set the default commit message to be updated if the user cancels out of the wizard in progress
                        fs_1.writeFileSync(args.filePath, defaultCommitMessage);
                        return [4 /*yield*/, builder_1.buildCommitMessage()];
                    case 1:
                        commitMessage = _b.sent();
                        fs_1.writeFileSync(args.filePath, commitMessage);
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.runWizard = runWizard;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l6YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3dpemFyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQWlDO0lBRWpDLGtFQUE4QztJQUM5QyxvRUFBNkM7SUFFN0MsNkVBQTZDO0lBUTdDLHVGQUF1RjtJQUN2RixJQUFNLG9CQUFvQixHQUFHLGtLQUdJLENBQUM7SUFFbEMsU0FBc0IsU0FBUyxDQUMzQixJQUFpRjs7Ozs7Ozt3QkFDbkYsVUFBSSxzQkFBYSxFQUFFLENBQUMsYUFBYSwwQ0FBRSxhQUFhLEVBQUU7NEJBQ2hELGVBQUssQ0FBQyx1RkFBdUYsQ0FBQyxDQUFDOzRCQUMvRixlQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7NEJBQ3RCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDOzRCQUNyQixzQkFBTzt5QkFDUjt3QkFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFOzRCQUM3QixjQUFJLENBQUMsd0VBQ0QsSUFBSSxDQUFDLE1BQU0sYUFBVSxDQUFDLENBQUM7NEJBQzNCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDOzRCQUNyQixzQkFBTzt5QkFDUjt3QkFFRCxpR0FBaUc7d0JBQ2pHLGtCQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO3dCQUc3QixxQkFBTSw0QkFBa0IsRUFBRSxFQUFBOzt3QkFBMUMsYUFBYSxHQUFHLFNBQTBCO3dCQUNoRCxrQkFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7Ozs7O0tBQzdDO0lBdEJELDhCQXNCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHt3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5cbmltcG9ydCB7Z2V0VXNlckNvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2J1aWxkQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9idWlsZGVyJztcblxuLyoqXG4gKiBUaGUgc291cmNlIHRyaWdnZXJpbmcgdGhlIGdpdCBjb21taXQgbWVzc2FnZSBjcmVhdGlvbi5cbiAqIEFzIGRlc2NyaWJlZCBpbjogaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdGhvb2tzI19wcmVwYXJlX2NvbW1pdF9tc2dcbiAqL1xuZXhwb3J0IHR5cGUgUHJlcGFyZUNvbW1pdE1zZ0hvb2tTb3VyY2UgPSAnbWVzc2FnZSd8J3RlbXBsYXRlJ3wnbWVyZ2UnfCdzcXVhc2gnfCdjb21taXQnO1xuXG4vKiogVGhlIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UgdXNlZCBpZiB0aGUgd2l6YXJkIGRvZXMgbm90IHByb2N1ZGUgYSBjb21taXQgbWVzc2FnZS4gKi9cbmNvbnN0IGRlZmF1bHRDb21taXRNZXNzYWdlID0gYDx0eXBlPig8c2NvcGU+KTogPHN1bW1hcnk+XG5cbiMgPERlc2NyaWJlIHRoZSBtb3RpdmF0aW9uIGJlaGluZCB0aGlzIGNoYW5nZSAtIGV4cGxhaW4gV0hZIHlvdSBhcmUgbWFraW5nIHRoaXMgY2hhbmdlLiBXcmFwIGFsbFxuIyAgbGluZXMgYXQgMTAwIGNoYXJhY3RlcnMuPlxcblxcbmA7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5XaXphcmQoXG4gICAgYXJnczoge2ZpbGVQYXRoOiBzdHJpbmcsIHNvdXJjZT86IFByZXBhcmVDb21taXRNc2dIb29rU291cmNlLCBjb21taXRTaGE/OiBzdHJpbmd9KSB7XG4gIGlmIChnZXRVc2VyQ29uZmlnKCkuY29tbWl0TWVzc2FnZT8uZGlzYWJsZVdpemFyZCkge1xuICAgIGRlYnVnKCdTa2lwcGluZyBjb21taXQgbWVzc2FnZSB3aXphcmQgZHVlIHRvIGVuYWJsZWQgYGNvbW1pdE1lc3NhZ2UuZGlzYWJsZVdpemFyZGAgb3B0aW9uIGluJyk7XG4gICAgZGVidWcoJ3VzZXIgY29uZmlnLicpO1xuICAgIHByb2Nlc3MuZXhpdENvZGUgPSAwO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChhcmdzLnNvdXJjZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaW5mbyhgU2tpcHBpbmcgY29tbWl0IG1lc3NhZ2Ugd2l6YXJkIGJlY2F1c2UgdGhlIGNvbW1pdCB3YXMgY3JlYXRlZCB2aWEgJyR7XG4gICAgICAgIGFyZ3Muc291cmNlfScgc291cmNlYCk7XG4gICAgcHJvY2Vzcy5leGl0Q29kZSA9IDA7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gU2V0IHRoZSBkZWZhdWx0IGNvbW1pdCBtZXNzYWdlIHRvIGJlIHVwZGF0ZWQgaWYgdGhlIHVzZXIgY2FuY2VscyBvdXQgb2YgdGhlIHdpemFyZCBpbiBwcm9ncmVzc1xuICB3cml0ZUZpbGVTeW5jKGFyZ3MuZmlsZVBhdGgsIGRlZmF1bHRDb21taXRNZXNzYWdlKTtcblxuICAvKiogVGhlIGdlbmVyYXRlZCBjb21taXQgbWVzc2FnZS4gKi9cbiAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGF3YWl0IGJ1aWxkQ29tbWl0TWVzc2FnZSgpO1xuICB3cml0ZUZpbGVTeW5jKGFyZ3MuZmlsZVBhdGgsIGNvbW1pdE1lc3NhZ2UpO1xufVxuIl19