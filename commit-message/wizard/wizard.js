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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l6YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3dpemFyZC93aXphcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlCQUFpQztJQUVqQyxrRUFBaUQ7SUFDakQsb0VBQWdEO0lBRWhELDZFQUE4QztJQUk5Qyx1RkFBdUY7SUFDdkYsSUFBTSxvQkFBb0IsR0FBRyxrS0FHSSxDQUFDO0lBRWxDLFNBQXNCLFNBQVMsQ0FDM0IsSUFBc0U7Ozs7Ozs7d0JBQ3hFLFVBQUksc0JBQWEsRUFBRSxDQUFDLGFBQWEsMENBQUUsYUFBYSxFQUFFOzRCQUNoRCxlQUFLLENBQUMsdUZBQXVGLENBQUMsQ0FBQzs0QkFDL0YsZUFBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDOzRCQUN0QixPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQzs0QkFDckIsc0JBQU87eUJBQ1I7d0JBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTs0QkFDN0IsY0FBSSxDQUFDLHdFQUNELElBQUksQ0FBQyxNQUFNLGFBQVUsQ0FBQyxDQUFDOzRCQUMzQixPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQzs0QkFDckIsc0JBQU87eUJBQ1I7d0JBRUQsaUdBQWlHO3dCQUNqRyxrQkFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLENBQUMsQ0FBQzt3QkFHN0IscUJBQU0sNEJBQWtCLEVBQUUsRUFBQTs7d0JBQTFDLGFBQWEsR0FBRyxTQUEwQjt3QkFDaEQsa0JBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDOzs7OztLQUM3QztJQXRCRCw4QkFzQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7d3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuXG5pbXBvcnQge2dldFVzZXJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtidWlsZENvbW1pdE1lc3NhZ2V9IGZyb20gJy4uL2J1aWxkZXInO1xuaW1wb3J0IHtDb21taXRNc2dTb3VyY2V9IGZyb20gJy4uL2NvbW1pdC1tZXNzYWdlLXNvdXJjZSc7XG5cblxuLyoqIFRoZSBkZWZhdWx0IGNvbW1pdCBtZXNzYWdlIHVzZWQgaWYgdGhlIHdpemFyZCBkb2VzIG5vdCBwcm9jdWRlIGEgY29tbWl0IG1lc3NhZ2UuICovXG5jb25zdCBkZWZhdWx0Q29tbWl0TWVzc2FnZSA9IGA8dHlwZT4oPHNjb3BlPik6IDxzdW1tYXJ5PlxuXG4jIDxEZXNjcmliZSB0aGUgbW90aXZhdGlvbiBiZWhpbmQgdGhpcyBjaGFuZ2UgLSBleHBsYWluIFdIWSB5b3UgYXJlIG1ha2luZyB0aGlzIGNoYW5nZS4gV3JhcCBhbGxcbiMgIGxpbmVzIGF0IDEwMCBjaGFyYWN0ZXJzLj5cXG5cXG5gO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuV2l6YXJkKFxuICAgIGFyZ3M6IHtmaWxlUGF0aDogc3RyaW5nLCBzb3VyY2U/OiBDb21taXRNc2dTb3VyY2UsIGNvbW1pdFNoYT86IHN0cmluZ30pIHtcbiAgaWYgKGdldFVzZXJDb25maWcoKS5jb21taXRNZXNzYWdlPy5kaXNhYmxlV2l6YXJkKSB7XG4gICAgZGVidWcoJ1NraXBwaW5nIGNvbW1pdCBtZXNzYWdlIHdpemFyZCBkdWUgdG8gZW5hYmxlZCBgY29tbWl0TWVzc2FnZS5kaXNhYmxlV2l6YXJkYCBvcHRpb24gaW4nKTtcbiAgICBkZWJ1ZygndXNlciBjb25maWcuJyk7XG4gICAgcHJvY2Vzcy5leGl0Q29kZSA9IDA7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFyZ3Muc291cmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICBpbmZvKGBTa2lwcGluZyBjb21taXQgbWVzc2FnZSB3aXphcmQgYmVjYXVzZSB0aGUgY29tbWl0IHdhcyBjcmVhdGVkIHZpYSAnJHtcbiAgICAgICAgYXJncy5zb3VyY2V9JyBzb3VyY2VgKTtcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gMDtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBTZXQgdGhlIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UgdG8gYmUgdXBkYXRlZCBpZiB0aGUgdXNlciBjYW5jZWxzIG91dCBvZiB0aGUgd2l6YXJkIGluIHByb2dyZXNzXG4gIHdyaXRlRmlsZVN5bmMoYXJncy5maWxlUGF0aCwgZGVmYXVsdENvbW1pdE1lc3NhZ2UpO1xuXG4gIC8qKiBUaGUgZ2VuZXJhdGVkIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBjb25zdCBjb21taXRNZXNzYWdlID0gYXdhaXQgYnVpbGRDb21taXRNZXNzYWdlKCk7XG4gIHdyaXRlRmlsZVN5bmMoYXJncy5maWxlUGF0aCwgY29tbWl0TWVzc2FnZSk7XG59XG4iXX0=