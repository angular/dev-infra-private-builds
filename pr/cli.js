/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/pr/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/pr/discover-new-conflicts/cli", "@angular/dev-infra-private/pr/merge/cli", "@angular/dev-infra-private/pr/rebase/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildPrParser = void 0;
    var yargs = require("yargs");
    var cli_1 = require("@angular/dev-infra-private/pr/discover-new-conflicts/cli");
    var cli_2 = require("@angular/dev-infra-private/pr/merge/cli");
    var cli_3 = require("@angular/dev-infra-private/pr/rebase/cli");
    /** Build the parser for pull request commands. */
    function buildPrParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command('merge <pr-number>', 'Merge pull requests', cli_2.buildMergeCommand, cli_2.handleMergeCommand)
            .command('discover-new-conflicts <pr-number>', 'Check if a pending PR causes new conflicts for other pending PRs', cli_1.buildDiscoverNewConflictsCommand, cli_1.handleDiscoverNewConflictsCommand)
            .command('rebase <pr-number>', 'Rebase a pending PR and push the rebased commits back to Github', cli_3.buildRebaseCommand, cli_3.handleRebaseCommand);
    }
    exports.buildPrParser = buildPrParser;
    if (require.main === module) {
        buildPrParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBK0I7SUFFL0IsZ0ZBQWlIO0lBQ2pILCtEQUFrRTtJQUNsRSxnRUFBcUU7SUFFckUsa0RBQWtEO0lBQ2xELFNBQWdCLGFBQWEsQ0FBQyxVQUFzQjtRQUNsRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUU7YUFDbkIsTUFBTSxFQUFFO2FBQ1IsYUFBYSxFQUFFO2FBQ2YsT0FBTyxDQUFDLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLHVCQUFpQixFQUFFLHdCQUFrQixDQUFDO2FBQzFGLE9BQU8sQ0FDSixvQ0FBb0MsRUFDcEMsa0VBQWtFLEVBQ2xFLHNDQUFnQyxFQUFFLHVDQUFpQyxDQUFDO2FBQ3ZFLE9BQU8sQ0FDSixvQkFBb0IsRUFBRSxpRUFBaUUsRUFDdkYsd0JBQWtCLEVBQUUseUJBQW1CLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBWkQsc0NBWUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQzNCLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUM5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2J1aWxkRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kLCBoYW5kbGVEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmR9IGZyb20gJy4vZGlzY292ZXItbmV3LWNvbmZsaWN0cy9jbGknO1xuaW1wb3J0IHtidWlsZE1lcmdlQ29tbWFuZCwgaGFuZGxlTWVyZ2VDb21tYW5kfSBmcm9tICcuL21lcmdlL2NsaSc7XG5pbXBvcnQge2J1aWxkUmViYXNlQ29tbWFuZCwgaGFuZGxlUmViYXNlQ29tbWFuZH0gZnJvbSAnLi9yZWJhc2UvY2xpJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHB1bGwgcmVxdWVzdCBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFByUGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5jb21tYW5kKCdtZXJnZSA8cHItbnVtYmVyPicsICdNZXJnZSBwdWxsIHJlcXVlc3RzJywgYnVpbGRNZXJnZUNvbW1hbmQsIGhhbmRsZU1lcmdlQ29tbWFuZClcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdkaXNjb3Zlci1uZXctY29uZmxpY3RzIDxwci1udW1iZXI+JyxcbiAgICAgICAgICAnQ2hlY2sgaWYgYSBwZW5kaW5nIFBSIGNhdXNlcyBuZXcgY29uZmxpY3RzIGZvciBvdGhlciBwZW5kaW5nIFBScycsXG4gICAgICAgICAgYnVpbGREaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQsIGhhbmRsZURpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZClcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdyZWJhc2UgPHByLW51bWJlcj4nLCAnUmViYXNlIGEgcGVuZGluZyBQUiBhbmQgcHVzaCB0aGUgcmViYXNlZCBjb21taXRzIGJhY2sgdG8gR2l0aHViJyxcbiAgICAgICAgICBidWlsZFJlYmFzZUNvbW1hbmQsIGhhbmRsZVJlYmFzZUNvbW1hbmQpO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgYnVpbGRQclBhcnNlcih5YXJncykucGFyc2UoKTtcbn1cbiJdfQ==