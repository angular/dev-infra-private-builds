(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/wizard/wizard", ["require", "exports", "tslib", "fs", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/builder"], factory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l6YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3dpemFyZC93aXphcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlCQUFpQztJQUVqQyxrRUFBaUQ7SUFDakQsb0VBQWdEO0lBRWhELDZFQUE4QztJQUk5Qyx1RkFBdUY7SUFDdkYsSUFBTSxvQkFBb0IsR0FBRyxrS0FHSSxDQUFDO0lBRWxDLFNBQXNCLFNBQVMsQ0FDM0IsSUFBc0U7Ozs7Ozs7d0JBQ3hFLElBQUksTUFBQSxzQkFBYSxFQUFFLENBQUMsYUFBYSwwQ0FBRSxhQUFhLEVBQUU7NEJBQ2hELGVBQUssQ0FBQyx1RkFBdUYsQ0FBQyxDQUFDOzRCQUMvRixlQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7NEJBQ3RCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDOzRCQUNyQixzQkFBTzt5QkFDUjt3QkFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFOzRCQUM3QixjQUFJLENBQUMsd0VBQ0QsSUFBSSxDQUFDLE1BQU0sYUFBVSxDQUFDLENBQUM7NEJBQzNCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDOzRCQUNyQixzQkFBTzt5QkFDUjt3QkFFRCxpR0FBaUc7d0JBQ2pHLGtCQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO3dCQUc3QixxQkFBTSw0QkFBa0IsRUFBRSxFQUFBOzt3QkFBMUMsYUFBYSxHQUFHLFNBQTBCO3dCQUNoRCxrQkFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7Ozs7O0tBQzdDO0lBdEJELDhCQXNCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHt3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5cbmltcG9ydCB7Z2V0VXNlckNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2J1aWxkQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vYnVpbGRlcic7XG5pbXBvcnQge0NvbW1pdE1zZ1NvdXJjZX0gZnJvbSAnLi4vY29tbWl0LW1lc3NhZ2Utc291cmNlJztcblxuXG4vKiogVGhlIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UgdXNlZCBpZiB0aGUgd2l6YXJkIGRvZXMgbm90IHByb2N1ZGUgYSBjb21taXQgbWVzc2FnZS4gKi9cbmNvbnN0IGRlZmF1bHRDb21taXRNZXNzYWdlID0gYDx0eXBlPig8c2NvcGU+KTogPHN1bW1hcnk+XG5cbiMgPERlc2NyaWJlIHRoZSBtb3RpdmF0aW9uIGJlaGluZCB0aGlzIGNoYW5nZSAtIGV4cGxhaW4gV0hZIHlvdSBhcmUgbWFraW5nIHRoaXMgY2hhbmdlLiBXcmFwIGFsbFxuIyAgbGluZXMgYXQgMTAwIGNoYXJhY3RlcnMuPlxcblxcbmA7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5XaXphcmQoXG4gICAgYXJnczoge2ZpbGVQYXRoOiBzdHJpbmcsIHNvdXJjZT86IENvbW1pdE1zZ1NvdXJjZSwgY29tbWl0U2hhPzogc3RyaW5nfSkge1xuICBpZiAoZ2V0VXNlckNvbmZpZygpLmNvbW1pdE1lc3NhZ2U/LmRpc2FibGVXaXphcmQpIHtcbiAgICBkZWJ1ZygnU2tpcHBpbmcgY29tbWl0IG1lc3NhZ2Ugd2l6YXJkIGR1ZSB0byBlbmFibGVkIGBjb21taXRNZXNzYWdlLmRpc2FibGVXaXphcmRgIG9wdGlvbiBpbicpO1xuICAgIGRlYnVnKCd1c2VyIGNvbmZpZy4nKTtcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gMDtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYXJncy5zb3VyY2UgIT09IHVuZGVmaW5lZCkge1xuICAgIGluZm8oYFNraXBwaW5nIGNvbW1pdCBtZXNzYWdlIHdpemFyZCBiZWNhdXNlIHRoZSBjb21taXQgd2FzIGNyZWF0ZWQgdmlhICcke1xuICAgICAgICBhcmdzLnNvdXJjZX0nIHNvdXJjZWApO1xuICAgIHByb2Nlc3MuZXhpdENvZGUgPSAwO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFNldCB0aGUgZGVmYXVsdCBjb21taXQgbWVzc2FnZSB0byBiZSB1cGRhdGVkIGlmIHRoZSB1c2VyIGNhbmNlbHMgb3V0IG9mIHRoZSB3aXphcmQgaW4gcHJvZ3Jlc3NcbiAgd3JpdGVGaWxlU3luYyhhcmdzLmZpbGVQYXRoLCBkZWZhdWx0Q29tbWl0TWVzc2FnZSk7XG5cbiAgLyoqIFRoZSBnZW5lcmF0ZWQgY29tbWl0IG1lc3NhZ2UuICovXG4gIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBhd2FpdCBidWlsZENvbW1pdE1lc3NhZ2UoKTtcbiAgd3JpdGVGaWxlU3luYyhhcmdzLmZpbGVQYXRoLCBjb21taXRNZXNzYWdlKTtcbn1cbiJdfQ==