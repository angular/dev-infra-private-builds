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
        define("@angular/dev-infra-private/pr/cli", ["require", "exports", "@angular/dev-infra-private/pr/check-target-branches/cli", "@angular/dev-infra-private/pr/checkout/cli", "@angular/dev-infra-private/pr/discover-new-conflicts/cli", "@angular/dev-infra-private/pr/merge/cli", "@angular/dev-infra-private/pr/rebase/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildPrParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/pr/check-target-branches/cli");
    var cli_2 = require("@angular/dev-infra-private/pr/checkout/cli");
    var cli_3 = require("@angular/dev-infra-private/pr/discover-new-conflicts/cli");
    var cli_4 = require("@angular/dev-infra-private/pr/merge/cli");
    var cli_5 = require("@angular/dev-infra-private/pr/rebase/cli");
    /** Build the parser for pull request commands. */
    function buildPrParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command('discover-new-conflicts <pr-number>', 'Check if a pending PR causes new conflicts for other pending PRs', cli_3.buildDiscoverNewConflictsCommand, cli_3.handleDiscoverNewConflictsCommand)
            .command('rebase <pr-number>', 'Rebase a pending PR and push the rebased commits back to Github', cli_5.buildRebaseCommand, cli_5.handleRebaseCommand)
            .command(cli_4.MergeCommandModule)
            .command(cli_2.CheckoutCommandModule)
            .command(cli_1.CheckTargetBranchesModule);
    }
    exports.buildPrParser = buildPrParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFJSCwrRUFBc0U7SUFDdEUsa0VBQXFEO0lBQ3JELGdGQUFpSDtJQUNqSCwrREFBK0M7SUFDL0MsZ0VBQXFFO0lBRXJFLGtEQUFrRDtJQUNsRCxTQUFnQixhQUFhLENBQUMsVUFBc0I7UUFDbEQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE9BQU8sQ0FDSixvQ0FBb0MsRUFDcEMsa0VBQWtFLEVBQ2xFLHNDQUFnQyxFQUFFLHVDQUFpQyxDQUFDO2FBQ3ZFLE9BQU8sQ0FDSixvQkFBb0IsRUFBRSxpRUFBaUUsRUFDdkYsd0JBQWtCLEVBQUUseUJBQW1CLENBQUM7YUFDM0MsT0FBTyxDQUFDLHdCQUFrQixDQUFDO2FBQzNCLE9BQU8sQ0FBQywyQkFBcUIsQ0FBQzthQUM5QixPQUFPLENBQUMsK0JBQXlCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBZEQsc0NBY0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge0NoZWNrVGFyZ2V0QnJhbmNoZXNNb2R1bGV9IGZyb20gJy4vY2hlY2stdGFyZ2V0LWJyYW5jaGVzL2NsaSc7XG5pbXBvcnQge0NoZWNrb3V0Q29tbWFuZE1vZHVsZX0gZnJvbSAnLi9jaGVja291dC9jbGknO1xuaW1wb3J0IHtidWlsZERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZCwgaGFuZGxlRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kfSBmcm9tICcuL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMvY2xpJztcbmltcG9ydCB7TWVyZ2VDb21tYW5kTW9kdWxlfSBmcm9tICcuL21lcmdlL2NsaSc7XG5pbXBvcnQge2J1aWxkUmViYXNlQ29tbWFuZCwgaGFuZGxlUmViYXNlQ29tbWFuZH0gZnJvbSAnLi9yZWJhc2UvY2xpJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHB1bGwgcmVxdWVzdCBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFByUGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdkaXNjb3Zlci1uZXctY29uZmxpY3RzIDxwci1udW1iZXI+JyxcbiAgICAgICAgICAnQ2hlY2sgaWYgYSBwZW5kaW5nIFBSIGNhdXNlcyBuZXcgY29uZmxpY3RzIGZvciBvdGhlciBwZW5kaW5nIFBScycsXG4gICAgICAgICAgYnVpbGREaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQsIGhhbmRsZURpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZClcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdyZWJhc2UgPHByLW51bWJlcj4nLCAnUmViYXNlIGEgcGVuZGluZyBQUiBhbmQgcHVzaCB0aGUgcmViYXNlZCBjb21taXRzIGJhY2sgdG8gR2l0aHViJyxcbiAgICAgICAgICBidWlsZFJlYmFzZUNvbW1hbmQsIGhhbmRsZVJlYmFzZUNvbW1hbmQpXG4gICAgICAuY29tbWFuZChNZXJnZUNvbW1hbmRNb2R1bGUpXG4gICAgICAuY29tbWFuZChDaGVja291dENvbW1hbmRNb2R1bGUpXG4gICAgICAuY29tbWFuZChDaGVja1RhcmdldEJyYW5jaGVzTW9kdWxlKTtcbn1cbiJdfQ==