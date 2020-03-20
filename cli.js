#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/cli", ["require", "exports", "fs", "path", "@angular/dev-infra-private/pullapprove/verify", "@angular/dev-infra-private/commit-message/validate", "@angular/dev-infra-private/utils/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var fs_1 = require("fs");
    var path_1 = require("path");
    var verify_1 = require("@angular/dev-infra-private/pullapprove/verify");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var args = process.argv.slice(2);
    // TODO(josephperrott): Set up proper cli flag/command handling
    switch (args[0]) {
        case 'pullapprove:verify':
            verify_1.verify();
            break;
        case 'commit-message:pre-commit-validate':
            var commitMessage = fs_1.readFileSync(path_1.join(config_1.getRepoBaseDir(), '.git/COMMIT_EDITMSG'), 'utf8');
            if (validate_1.validateCommitMessage(commitMessage)) {
                console.info('√  Valid commit message');
            }
            break;
        default:
            console.info('No commands were matched');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFDQTs7Ozs7O09BTUc7SUFDSCx5QkFBZ0M7SUFDaEMsNkJBQTBCO0lBQzFCLHdFQUE0QztJQUM1QywrRUFBZ0U7SUFDaEUsa0VBQThDO0lBRTlDLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBR25DLCtEQUErRDtJQUMvRCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNmLEtBQUssb0JBQW9CO1lBQ3ZCLGVBQU0sRUFBRSxDQUFDO1lBQ1QsTUFBTTtRQUNSLEtBQUssb0NBQW9DO1lBQ3ZDLElBQU0sYUFBYSxHQUFHLGlCQUFZLENBQUMsV0FBSSxDQUFDLHVCQUFjLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFGLElBQUksZ0NBQXFCLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQzthQUN6QztZQUNELE1BQU07UUFDUjtZQUNFLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztLQUM1QyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHt2ZXJpZnl9IGZyb20gJy4vcHVsbGFwcHJvdmUvdmVyaWZ5JztcbmltcG9ydCB7dmFsaWRhdGVDb21taXRNZXNzYWdlfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlJztcbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4vdXRpbHMvY29uZmlnJztcblxuY29uc3QgYXJncyA9IHByb2Nlc3MuYXJndi5zbGljZSgyKTtcblxuXG4vLyBUT0RPKGpvc2VwaHBlcnJvdHQpOiBTZXQgdXAgcHJvcGVyIGNsaSBmbGFnL2NvbW1hbmQgaGFuZGxpbmdcbnN3aXRjaCAoYXJnc1swXSkge1xuICBjYXNlICdwdWxsYXBwcm92ZTp2ZXJpZnknOlxuICAgIHZlcmlmeSgpO1xuICAgIGJyZWFrO1xuICBjYXNlICdjb21taXQtbWVzc2FnZTpwcmUtY29tbWl0LXZhbGlkYXRlJzpcbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gcmVhZEZpbGVTeW5jKGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgJy5naXQvQ09NTUlUX0VESVRNU0cnKSwgJ3V0ZjgnKTtcbiAgICBpZiAodmFsaWRhdGVDb21taXRNZXNzYWdlKGNvbW1pdE1lc3NhZ2UpKSB7XG4gICAgICBjb25zb2xlLmluZm8oJ+KImiAgVmFsaWQgY29tbWl0IG1lc3NhZ2UnKTtcbiAgICB9XG4gICAgYnJlYWs7XG4gIGRlZmF1bHQ6XG4gICAgY29uc29sZS5pbmZvKCdObyBjb21tYW5kcyB3ZXJlIG1hdGNoZWQnKTtcbn1cbiJdfQ==