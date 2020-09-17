(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/wizard", ["require", "exports", "tslib", "fs", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/builder"], factory);
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
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var builder_1 = require("@angular/dev-infra-private/commit-message/builder");
    /** The default commit message used if the wizard does not procude a commit message. */
    var defaultCommitMessage = "<type>(<scope>): <summary>\n\n# <Describe the motivation behind this change - explain WHY you are making this change. Wrap all\n#  lines at 100 characters.>\n\n";
    function runWizard(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var commitMessage;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // TODO(josephperrott): Add support for skipping wizard with local untracked config file
                        if (args.source !== undefined) {
                            console_1.info("Skipping commit message wizard due because the commit was created via '" + args.source + "' source");
                            process.exitCode = 0;
                            return [2 /*return*/];
                        }
                        // Set the default commit message to be updated if the user cancels out of the wizard in progress
                        fs_1.writeFileSync(args.filePath, defaultCommitMessage);
                        return [4 /*yield*/, builder_1.buildCommitMessage()];
                    case 1:
                        commitMessage = _a.sent();
                        fs_1.writeFileSync(args.filePath, commitMessage);
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.runWizard = runWizard;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l6YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3dpemFyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQWlDO0lBRWpDLG9FQUFzQztJQUV0Qyw2RUFBNkM7SUFRN0MsdUZBQXVGO0lBQ3ZGLElBQU0sb0JBQW9CLEdBQUcsa0tBR0ksQ0FBQztJQUVsQyxTQUFzQixTQUFTLENBQzNCLElBQWlGOzs7Ozs7d0JBQ25GLHdGQUF3Rjt3QkFFeEYsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTs0QkFDN0IsY0FBSSxDQUFDLDRFQUNELElBQUksQ0FBQyxNQUFNLGFBQVUsQ0FBQyxDQUFDOzRCQUMzQixPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQzs0QkFDckIsc0JBQU87eUJBQ1I7d0JBRUQsaUdBQWlHO3dCQUNqRyxrQkFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsb0JBQW9CLENBQUMsQ0FBQzt3QkFHN0IscUJBQU0sNEJBQWtCLEVBQUUsRUFBQTs7d0JBQTFDLGFBQWEsR0FBRyxTQUEwQjt3QkFDaEQsa0JBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDOzs7OztLQUM3QztJQWpCRCw4QkFpQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7d3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2J1aWxkQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9idWlsZGVyJztcblxuLyoqXG4gKiBUaGUgc291cmNlIHRyaWdnZXJpbmcgdGhlIGdpdCBjb21taXQgbWVzc2FnZSBjcmVhdGlvbi5cbiAqIEFzIGRlc2NyaWJlZCBpbjogaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdGhvb2tzI19wcmVwYXJlX2NvbW1pdF9tc2dcbiAqL1xuZXhwb3J0IHR5cGUgUHJlcGFyZUNvbW1pdE1zZ0hvb2tTb3VyY2UgPSAnbWVzc2FnZSd8J3RlbXBsYXRlJ3wnbWVyZ2UnfCdzcXVhc2gnfCdjb21taXQnO1xuXG4vKiogVGhlIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UgdXNlZCBpZiB0aGUgd2l6YXJkIGRvZXMgbm90IHByb2N1ZGUgYSBjb21taXQgbWVzc2FnZS4gKi9cbmNvbnN0IGRlZmF1bHRDb21taXRNZXNzYWdlID0gYDx0eXBlPig8c2NvcGU+KTogPHN1bW1hcnk+XG5cbiMgPERlc2NyaWJlIHRoZSBtb3RpdmF0aW9uIGJlaGluZCB0aGlzIGNoYW5nZSAtIGV4cGxhaW4gV0hZIHlvdSBhcmUgbWFraW5nIHRoaXMgY2hhbmdlLiBXcmFwIGFsbFxuIyAgbGluZXMgYXQgMTAwIGNoYXJhY3RlcnMuPlxcblxcbmA7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5XaXphcmQoXG4gICAgYXJnczoge2ZpbGVQYXRoOiBzdHJpbmcsIHNvdXJjZT86IFByZXBhcmVDb21taXRNc2dIb29rU291cmNlLCBjb21taXRTaGE/OiBzdHJpbmd9KSB7XG4gIC8vIFRPRE8oam9zZXBocGVycm90dCk6IEFkZCBzdXBwb3J0IGZvciBza2lwcGluZyB3aXphcmQgd2l0aCBsb2NhbCB1bnRyYWNrZWQgY29uZmlnIGZpbGVcblxuICBpZiAoYXJncy5zb3VyY2UgIT09IHVuZGVmaW5lZCkge1xuICAgIGluZm8oYFNraXBwaW5nIGNvbW1pdCBtZXNzYWdlIHdpemFyZCBkdWUgYmVjYXVzZSB0aGUgY29tbWl0IHdhcyBjcmVhdGVkIHZpYSAnJHtcbiAgICAgICAgYXJncy5zb3VyY2V9JyBzb3VyY2VgKTtcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gMDtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBTZXQgdGhlIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UgdG8gYmUgdXBkYXRlZCBpZiB0aGUgdXNlciBjYW5jZWxzIG91dCBvZiB0aGUgd2l6YXJkIGluIHByb2dyZXNzXG4gIHdyaXRlRmlsZVN5bmMoYXJncy5maWxlUGF0aCwgZGVmYXVsdENvbW1pdE1lc3NhZ2UpO1xuXG4gIC8qKiBUaGUgZ2VuZXJhdGVkIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBjb25zdCBjb21taXRNZXNzYWdlID0gYXdhaXQgYnVpbGRDb21taXRNZXNzYWdlKCk7XG4gIHdyaXRlRmlsZVN5bmMoYXJncy5maWxlUGF0aCwgY29tbWl0TWVzc2FnZSk7XG59XG4iXX0=